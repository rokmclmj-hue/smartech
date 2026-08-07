import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";
import type { Session } from "next-auth";

function isAdmin(session: Session | null) {
  return (session?.user as { tier?: string })?.tier === "ADMIN";
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST: 주제를 받아 X(트위터)용 짧은 글 초안을 생성 — PENDING 상태로 저장
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "권한 없음" }, { status: 401 });
  }

  const { topic } = await req.json() as { topic?: string };
  if (!topic || !topic.trim()) {
    return NextResponse.json({ error: "주제를 입력해주세요" }, { status: 400 });
  }

  // 블로그 writer.md 페르소나·문체 규칙을 X 글 분량(280자)에 맞춰 축약
  const prompt = `당신은 Edwards Vacuum 진공펌프 전문 대리점 스마텍에서 10년 넘게 진공펌프 문의를 직접 받아온 수석 엔지니어입니다. 과장 없이 핵심만, 현장 담당자에게 말하듯 씁니다.

## 주제
${topic.trim()}

## 작성 규칙
- X(트위터)에 올릴 글이므로 공백 포함 280자 이내로 작성 (한글 기준, 절대 초과 금지)
- 출처 없는 수치·스펙은 지어내지 말고, 구체적 숫자가 필요하면 "제품별로 확인이 필요합니다" 식으로 안내
- "~에 따르면", "공식 자료에 따르면" 같은 인용 문구 금지 — 본인이 전문가로서 직접 말하듯 작성
- 과장된 홍보 문구·감탄사·이모지 남발 금지
- 마지막 줄에 관련 해시태그 1~2개 (예: #진공펌프 #스마텍)
- 글 하나만 작성 (여러 버전 나열 금지)

## 출력 형식 (JSON만 출력, 다른 텍스트 없이)
{
  "content": "완성된 글 (해시태그 포함, 280자 이내)"
}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (message.content[0] as { type: string; text: string }).text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON 파싱 실패");
    const parsed = JSON.parse(jsonMatch[0]) as { content: string };

    if (!parsed.content || parsed.content.length > 280) {
      return NextResponse.json({ error: "생성된 글이 280자를 초과했습니다. 다시 시도해주세요." }, { status: 422 });
    }

    const post = await prisma.xPost.create({
      data: { topic: topic.trim(), content: parsed.content, status: "PENDING" },
    });

    return NextResponse.json({ post });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
