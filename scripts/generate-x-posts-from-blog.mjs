// 발행된 블로그 글을 소스로 X(트위터) 초안을 생성해 PENDING 상태로 XPost에 적재한다.
// 블로그 원문을 그대로 올리지 않고, 핵심 한 줄 요약(hook) + 블로그 링크로 재가공한다.
// 사용법:
//   node --env-file=.env scripts/generate-x-posts-from-blog.mjs [개수(기본10)]   — 미사용 블로그 글 중 무작위 N건
//   node --env-file=.env scripts/generate-x-posts-from-blog.mjs --id 123          — 특정 블로그 글 1건만 (신규 발행 직후 자동 호출용)
import { PrismaClient } from "@prisma/client";
import Anthropic from "@anthropic-ai/sdk";

const prisma = new PrismaClient();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// lib/x-text-length.ts와 동일한 로직 (node 스크립트에서 .ts 직접 import 불가해 인라인 복제)
const WIDE_RANGES = [
  [0x1100, 0x115f], [0x11a3, 0x11a7], [0x11fa, 0x11ff], [0x2e80, 0x303e],
  [0x3041, 0x33ff], [0x3400, 0x4db5], [0x4e00, 0x9fff], [0xa000, 0xa4c6],
  [0xac00, 0xd7a3], [0xf900, 0xfaff], [0xfe30, 0xfe6b], [0xff01, 0xff60], [0xffe0, 0xffe6],
];
function getXWeightedLength(text) {
  let weighted = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    weighted += WIDE_RANGES.some(([s, e]) => cp >= s && cp <= e) ? 2 : 1;
  }
  return weighted;
}

const SITE_URL = "https://www.smartechvacuum.com";
const HOOK_WEIGHTED_LIMIT = 200; // 링크(+공백 2줄바꿈) 붙일 여유를 남겨두는 목표치

function stripMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[#*_>`]/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

async function generateHook(post) {
  const excerpt = stripMarkdown(post.content).slice(0, 500);
  const prompt = `당신은 Edwards Vacuum 진공펌프 전문 대리점 스마텍에서 10년 넘게 진공펌프 문의를 직접 받아온 수석 엔지니어입니다. 과장 없이 핵심만, 현장 담당자에게 말하듯 씁니다.

## 아래 블로그 글의 핵심을 X(트위터)용 짧은 한 줄 후킹 문구로 요약하세요.
제목: ${post.title}
본문 일부:
${excerpt}

## 작성 규칙
- 블로그 원문을 그대로 베끼지 말고, 핵심 포인트 1가지만 짧게 재구성
- 뒤에 블로그 링크를 별도로 붙일 것이므로, 여기서는 링크·URL을 쓰지 말 것
- 한글 기준 약 90자(200 가중치) 이내로 아주 짧게 작성 (X는 한글 1자를 2자로 계산함, 절대 초과 금지)
- 출처 없는 수치는 지어내지 말 것, "~에 따르면" 같은 인용 문구 금지
- 과장된 홍보 문구·감탄사·이모지 남발 금지
- 문장 하나만 작성 (여러 버전 나열 금지)

## 출력 형식 (JSON만 출력, 다른 텍스트 없이)
{"hook": "완성된 한 줄 후킹 문구"}`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });
  const raw = message.content[0].text.trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`JSON 파싱 실패: ${raw}`);
  const parsed = JSON.parse(jsonMatch[0]);
  if (!parsed.hook) throw new Error("hook 필드 없음");
  return parsed.hook.trim();
}

async function main() {
  const idFlagIndex = process.argv.indexOf("--id");
  const singleId = idFlagIndex !== -1 ? Number(process.argv[idFlagIndex + 1]) : null;

  const existingXPosts = await prisma.xPost.findMany({ select: { topic: true } });
  const usedBlogIds = new Set(
    existingXPosts
      .map((p) => p.topic.match(/\(id=(\d+)\)/)?.[1])
      .filter(Boolean)
      .map(Number)
  );

  let targets;
  if (singleId) {
    const post = await prisma.blogPost.findUnique({
      where: { id: singleId },
      select: { id: true, slug: true, title: true, content: true },
    });
    if (!post) {
      console.log(`[실패] id=${singleId} 블로그 글을 찾을 수 없습니다.`);
      await prisma.$disconnect();
      return;
    }
    if (usedBlogIds.has(post.id)) {
      console.log(`[건너뜀] id=${singleId} 이미 X 초안이 있습니다.`);
      await prisma.$disconnect();
      return;
    }
    targets = [post];
    console.log(`대상 블로그 글 1건 (id=${singleId} 지정)`);
  } else {
    const count = Math.min(Number(process.argv[2]) || 10, 30);
    const blogPosts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, slug: true, title: true, content: true },
      orderBy: { publishedAt: "desc" },
    });
    const candidates = blogPosts.filter((p) => !usedBlogIds.has(p.id));
    // 최신 글에 쏠리지 않도록 섞는다
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    targets = candidates.slice(0, count);
    console.log(`대상 블로그 글 ${targets.length}건 (전체 발행 ${blogPosts.length}건 중 미사용 ${candidates.length}건)`);
  }

  let created = 0;
  for (const post of targets) {
    const url = `${SITE_URL}/blog/${post.slug ?? post.id}`;
    try {
      const hook = await generateHook(post);
      if (getXWeightedLength(hook) > HOOK_WEIGHTED_LIMIT) {
        console.log(`  [건너뜀] id=${post.id} "${post.title}" — 후킹 문구가 목표치 초과(${getXWeightedLength(hook)})`);
        continue;
      }
      const content = `${hook}\n\n${url}`;
      const finalWeighted = getXWeightedLength(content);
      if (finalWeighted > 280) {
        console.log(`  [건너뜀] id=${post.id} "${post.title}" — 링크 포함 최종 초과(${finalWeighted})`);
        continue;
      }
      const topic = `블로그 연동: ${post.title} (id=${post.id})`;
      await prisma.xPost.create({ data: { topic, content, status: "PENDING" } });
      created++;
      console.log(`  [생성] id=${post.id} "${post.title}" — ${finalWeighted}/280자`);
    } catch (e) {
      console.log(`  [실패] id=${post.id} "${post.title}" — ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  console.log(`\n완료: ${created}건 PENDING으로 생성됨`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
