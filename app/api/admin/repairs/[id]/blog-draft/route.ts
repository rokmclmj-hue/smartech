import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";
import type { Session } from "next-auth";

function isAdmin(session: Session | null) {
  return (session?.user as { tier?: string })?.tier === "ADMIN";
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYMPTOM_KO: Record<string, string> = {
  vibration: "진동/소음",
  vacuum: "진공 불량",
  overload: "과부하",
  temperature: "온도 이상",
  oil_leak: "오일 누유",
  contamination: "공정 오염",
  electrical: "전기/제어 오류",
  other: "기타",
};

// GET: Claude가 수리 데이터로 블로그 초안 생성
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "권한 없음" }, { status: 401 });
  }

  const { id } = await params;
  const repairId = Number(id);
  if (isNaN(repairId)) return NextResponse.json({ error: "잘못된 ID" }, { status: 400 });

  const repair = await prisma.repairRequest.findUnique({
    where: { id: repairId },
    include: {
      files: {
        where: { fileType: "disassembly_photo" },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!repair) return NextResponse.json({ error: "접수 없음" }, { status: 404 });

  const symptomsKo = repair.symptoms
    .map((s) => SYMPTOM_KO[s] ?? s)
    .join(", ");
  const photoUrls = repair.files.map((f) => f.fileUrl);

  const prompt = `당신은 Edwards Vacuum 진공펌프 전문 대리점 스마텍의 블로그 작가입니다.
아래 수리 접수 정보를 바탕으로 블로그 수리 사례 글을 작성해주세요.

## 수리 접수 정보
- 모델명: ${repair.pumpMaker} ${repair.pumpModel}
- 증상: ${symptomsKo || "미기재"}
- 관리자 메모: ${repair.adminNote ?? "(없음)"}
- 수리비: ${repair.totalAmount > 0 ? repair.totalAmount.toLocaleString("ko-KR") + "원" : "상담 후 결정"}
- 분해 사진: ${photoUrls.length}장

## 블로그 글 구조 (이 순서대로 작성)
1. **입고 상태** — 고객이 호소한 증상과 입고 당시 외관 상태
2. **분해 점검 결과** — 내부 확인 후 파악된 실제 원인
3. **수리 내용** — 수행한 작업과 교체 부품
4. **완료 후 테스트** — 수리 후 진공 성능 확인 결과
5. **예방 팁** — 이 모델을 운용 중인 분들을 위한 관리 포인트 1~2가지

## 작성 규칙
- 스마텍 공식 블로그 문체: 전문적이되 쉬운 한국어
- 제목에 모델명과 증상 핵심 키워드를 반드시 포함
- 실제 수리 현장 경험임을 독자가 느낄 수 있게 작성
- 분량: 마크다운 본문 800~1200자
- 고객 이름, 전화번호, 회사명 절대 포함 금지
- SEO를 위해 모델명을 본문에서 3~5회 자연스럽게 반복

## 출력 형식 (JSON만 출력, 다른 텍스트 없이)
{
  "title": "제목 (모델명 + 증상 키워드 포함, 50자 이내)",
  "metaDesc": "검색 최적화 메타 설명 (120자 이내)",
  "tags": "태그1, 태그2, 태그3, 태그4 (모델명 반드시 포함, 4~6개)",
  "content": "마크다운 본문 전체 (## 헤딩 사용)"
}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (message.content[0] as { type: string; text: string }).text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON 파싱 실패");
    const draft = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      draft,
      photoUrls,
      repairNo: repair.repairNo,
      pumpModel: `${repair.pumpMaker} ${repair.pumpModel}`,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// POST: 초안을 블로그 글로 발행
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "권한 없음" }, { status: 401 });
  }

  const { id } = await params;
  const repairId = Number(id);
  if (isNaN(repairId)) return NextResponse.json({ error: "잘못된 ID" }, { status: 400 });

  const { title, metaDesc, tags, content, photoUrls } = await req.json() as {
    title: string;
    metaDesc: string;
    tags: string;
    content: string;
    photoUrls: string[];
  };

  if (!title || !content) {
    return NextResponse.json({ error: "제목과 본문은 필수입니다" }, { status: 400 });
  }

  const post = await prisma.blogPost.create({
    data: {
      title,
      metaDesc: metaDesc ?? "",
      tags: tags ?? "",
      content,
      naverContent: "",
      faqSchema: "",
      category: "수리문의",
      status: "PUBLISHED",
      photos: photoUrls?.length ? JSON.stringify(photoUrls) : null,
      sourceFile: `repair-${repairId}`,
      publishedAt: new Date(),
    },
  });

  return NextResponse.json({ blogId: post.id });
}
