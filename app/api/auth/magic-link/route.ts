import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMagicLink } from "@/lib/mailer";
import { randomUUID } from "crypto";

const EXPIRES_MINUTES = 15;

export async function POST(req: NextRequest) {
  const { email } = (await req.json()) as { email?: string };

  if (!email || !email.includes("@"))
    return NextResponse.json({ error: "이메일 주소를 확인해주세요" }, { status: 400 });

  const normalizedEmail = email.trim().toLowerCase();

  // 기존 미사용 토큰 만료 처리 (동일 이메일)
  await prisma.magicLinkToken.updateMany({
    where: { email: normalizedEmail, usedAt: null, expiresAt: { gt: new Date() } },
    data: { expiresAt: new Date() },
  });

  // 새 토큰 생성 (15분 유효)
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + EXPIRES_MINUTES * 60 * 1000);

  await prisma.magicLinkToken.create({
    data: { email: normalizedEmail, token, expiresAt },
  });

  // 발송 URL 구성
  const baseUrl = req.headers.get("origin") ?? process.env.AUTH_URL ?? "http://localhost:3000";
  const magicUrl = `${baseUrl}/auth/magic?token=${token}`;

  // 이메일 발송 (GMAIL 설정이 없으면 개발 환경 로그)
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      await sendMagicLink(normalizedEmail, magicUrl);
    } catch (err) {
      console.error("[magic-link] 이메일 발송 실패:", err);
      return NextResponse.json({ error: "이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요." }, { status: 500 });
    }
  } else {
    // 개발 환경: 콘솔 출력
    console.log(`[magic-link] 개발 모드 — 링크: ${magicUrl}`);
  }

  return NextResponse.json({ ok: true });
}
