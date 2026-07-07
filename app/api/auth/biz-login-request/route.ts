import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyBusinessNo } from "@/lib/verify-biz";
import { sendBizLoginCode } from "@/lib/solapi";
import { sendBizLoginCodeEmail } from "@/lib/mailer";

const EXPIRES_MINUTES = 5;

// 사업자번호 로그인 1단계 — 기존 회원이면 인증코드 발송, 신규면 바로 가입 진행 신호
export async function POST(req: NextRequest) {
  const { businessNo } = (await req.json()) as { businessNo?: string };
  const digits = (businessNo ?? "").replace(/[^0-9]/g, "");

  const verify = await verifyBusinessNo(digits);
  if (verify.status !== "active") {
    return NextResponse.json({ error: verify.message }, { status: 400 });
  }

  const user = await prisma.user.findFirst({ where: { businessNo: digits } });

  // 신규 가입 — 인증할 기존 계정이 없으므로 바로 간편가입 진행
  if (!user) {
    return NextResponse.json({ mode: "new" });
  }

  // 연락처가 등록돼 있지 않으면 인증코드를 보낼 방법이 없음 — 기존 방식대로 즉시 로그인 허용
  if (!user.phone && !user.email) {
    return NextResponse.json({ mode: "no_contact" });
  }

  // 기존 미사용 코드 만료 처리
  await prisma.magicLinkToken.updateMany({
    where: {
      OR: [{ phone: user.phone ?? undefined }, { email: user.email ?? undefined }],
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { expiresAt: new Date() },
  });

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + EXPIRES_MINUTES * 60 * 1000);

  await prisma.magicLinkToken.create({
    data: { token: code, phone: user.phone ?? null, email: user.email ?? null, expiresAt },
  });

  try {
    if (user.phone) {
      await sendBizLoginCode(user.phone, code);
      return NextResponse.json({ mode: "otp_sent", via: "phone", maskedPhone: user.phone.replace(/(\d{3})\d+(\d{4})/, "$1****$2") });
    }
    if (user.email) {
      await sendBizLoginCodeEmail(user.email, code);
      return NextResponse.json({ mode: "otp_sent", via: "email", maskedEmail: user.email.replace(/^(.{2}).+(@.+)$/, "$1***$2") });
    }
  } catch (err) {
    console.error("[biz-login-request] 인증코드 발송 실패:", err);
    return NextResponse.json({ error: "인증코드 발송에 실패했습니다. 잠시 후 다시 시도해주세요." }, { status: 500 });
  }

  return NextResponse.json({ error: "인증코드를 보낼 연락처가 없습니다." }, { status: 400 });
}
