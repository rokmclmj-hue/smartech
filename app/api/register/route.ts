import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { notifyNewMember } from "@/lib/solapi";
import { normalizePhone } from "@/lib/phone";
import { classifyCompany } from "@/lib/classify-company";

type CustomerType = "ENDUSER" | "DEALER" | "OEM";

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    email?: string;
    password?: string;
    name?: string;
    company?: string;
    phone?: string;
    position?: string;
    customerType?: CustomerType;
    businessNo?: string;
    businessFileUrl?: string;
    cardImageUrl?: string;
  };

  const {
    email,
    password,
    name,
    company,
    phone,
    position,
    customerType,
    businessNo,
    businessFileUrl,
    cardImageUrl,
  } = body;

  if (!email || !password || !name || !company || !phone) {
    return NextResponse.json({ error: "모든 필드를 입력해주세요" }, { status: 400 });
  }

  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) {
    return NextResponse.json({ error: "전화번호 형식이 올바르지 않습니다" }, { status: 400 });
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    return NextResponse.json({ error: "이미 등록된 이메일입니다" }, { status: 409 });
  }

  const existingPhone = await prisma.user.findFirst({ where: { phone: normalizedPhone } });
  if (existingPhone) {
    return NextResponse.json({ error: "이미 등록된 전화번호입니다" }, { status: 409 });
  }

  const passwordHash = await hash(password, 12);

  // 자동 등급 분류: 화이트리스트 → 키워드 → 기본값(ENDUSER)
  const classification = await classifyCompany({
    phone: normalizedPhone,
    email,
    companyName: company,
  });

  // 화이트리스트 매칭: 즉시 해당 등급 (승인 불필요)
  // 키워드 매칭 or 기본값: PENDING (관리자 확인 후 확정)
  const finalTier = classification.source === "whitelist"
    ? classification.tier
    : "PENDING";

  const user = await prisma.user.create({
    data: {
      email,
      name,
      company,
      passwordHash,
      tier: finalTier,
      phone: normalizedPhone,
      businessNo: businessNo ?? null,
      businessFileUrl: businessFileUrl ?? null,
      cardImageUrl: cardImageUrl ?? null,
      // AI 추정 결과 기록 (관리자 검토용)
      aiEstimatedTier: classification.tier,
      aiTypeReason: classification.source,
    },
  });

  // 관리자 SMS 알림 (실패해도 가입은 완료)
  try {
    const tierLabel =
      finalTier !== "PENDING"
        ? `${finalTier} (자동 승인)`
        : classification.source === "keyword"
        ? `PENDING — ${classification.tier} 추정 (키워드)`
        : "PENDING — 신규 업체 (검토 필요)";
    await notifyNewMember(user.name, user.company, tierLabel);
  } catch {
    // SMS 실패 무시
  }

  return NextResponse.json({
    ok: true,
    autoApproved: finalTier !== "PENDING",
  });
}
