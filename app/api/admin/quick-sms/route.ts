import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  return (session?.user as any)?.tier === "ADMIN";
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { phone, link } = (await req.json()) as { phone?: string; link?: string };

  if (!phone || phone.replace(/\D/g, "").length < 10)
    return NextResponse.json({ error: "전화번호가 올바르지 않습니다" }, { status: 400 });

  // Solapi 연동은 Step 9에서 추가 예정
  // SOLAPI_API_KEY, SOLAPI_SECRET, SOLAPI_SENDER 환경변수 필요
  const hasSolapi =
    process.env.SOLAPI_API_KEY &&
    process.env.SOLAPI_SECRET &&
    process.env.SOLAPI_SENDER;

  if (!hasSolapi) {
    return NextResponse.json(
      { error: "SMS 서비스 설정이 필요합니다 (SOLAPI_API_KEY, SOLAPI_SECRET, SOLAPI_SENDER)" },
      { status: 503 }
    );
  }

  // Step 9에서 실제 발송 로직 추가
  return NextResponse.json({ ok: true, phone, link });
}
