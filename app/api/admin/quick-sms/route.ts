import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { randomUUID } from "crypto";

const EXPIRES_MINUTES = 60;

async function requireAdmin() {
  const session = await auth();
  return (session?.user as any)?.tier === "ADMIN";
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

  // 기존 미사용 토큰 만료
  await prisma.magicLinkToken.updateMany({
    where: { phone: digits, usedAt: null, expiresAt: { gt: new Date() } },
    data: { expiresAt: new Date() },
  });

  // 새 토큰 생성 (60분 유효)
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + EXPIRES_MINUTES * 60 * 1000);
  await prisma.magicLinkToken.create({
    data: { phone: digits, token, expiresAt },
  });

  const baseUrl = req.headers.get("origin") ?? process.env.AUTH_URL ?? "http://localhost:3000";
  const magicUrl = `${baseUrl}/auth/magic?token=${token}`;

  if (!hasSolapi) {
    console.log(`[quick-sms] 개발 모드 — 링크: ${magicUrl}`);
    return NextResponse.json({ ok: true, devLink: magicUrl });
  }

  try {
    const { SolapiMessageService } = await import("solapi");
    const service = new SolapiMessageService(
      process.env.SOLAPI_API_KEY!,
      process.env.SOLAPI_API_SECRET!
    );
    const sender = (process.env.SOLAPI_SENDER ?? process.env.ADMIN_PHONE)!;
    await service.send({
      to: digits,
      from: sender,
      text: `[스마텍] 로그인 링크입니다.\n${magicUrl}\n(60분 유효, 1회 사용)`,
    } as any);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[quick-sms] SMS 발송 실패:", err);
    return NextResponse.json({ error: "SMS 발송에 실패했습니다." }, { status: 500 });
  }
}
