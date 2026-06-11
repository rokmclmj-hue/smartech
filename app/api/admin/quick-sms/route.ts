import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  return (session?.user as { tier?: string })?.tier === "ADMIN";
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { phone } = (await req.json()) as { phone?: string };
  const digits = (phone ?? "").replace(/\D/g, "");

  if (digits.length < 10)
    return NextResponse.json({ error: "전화번호가 올바르지 않습니다" }, { status: 400 });

  const hasSolapi =
    process.env.SOLAPI_API_KEY &&
    process.env.SOLAPI_API_SECRET &&
    (process.env.SOLAPI_SENDER ?? process.env.ADMIN_PHONE);

  const baseUrl = req.headers.get("origin") ?? process.env.AUTH_URL ?? "http://localhost:3000";
  const loginUrl = `${baseUrl}/auth/login`;

  if (!hasSolapi) {
    console.log(`[quick-sms] 개발 모드 — 링크: ${loginUrl}`);
    return NextResponse.json({ ok: true, devLink: loginUrl });
  }

  try {
    const { SolapiMessageService } = await import("solapi");
    const service = new SolapiMessageService(
      process.env.SOLAPI_API_KEY!,
      process.env.SOLAPI_API_SECRET!
    );
    const sender = (process.env.SOLAPI_SENDER ?? process.env.ADMIN_PHONE)!;
    const msg = {
      to: digits,
      from: sender,
      text: `[스마텍] 로그인 페이지입니다.\n${loginUrl}\n카카오·구글로 간편 로그인 가능합니다.`,
    };
    await service.send(msg as Parameters<typeof service.send>[0]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[quick-sms] SMS 발송 실패:", err);
    return NextResponse.json({ error: "SMS 발송에 실패했습니다." }, { status: 500 });
  }
}
