import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { notifyNewMember } from "@/lib/solapi";
import { normalizePhone } from "@/lib/phone";

type CustomerType = "ENDUSER" | "DEALER" | "OEM";

function resolveTier(customerType: CustomerType): string {
  // Enduser는 즉시 승인(ENDUSER), Dealer/OEM은 PENDING 상태로 저장 후 관리자 승인 대기
  if (customerType === "ENDUSER") return "ENDUSER";
  return "PENDING";
}

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
  const tier = resolveTier((customerType ?? "ENDUSER") as CustomerType);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      company,
      passwordHash,
      tier,
      phone: normalizedPhone,
      businessNo: businessNo ?? null,
      businessFileUrl: businessFileUrl ?? null,
      cardImageUrl: cardImageUrl ?? null,
    },
  });

  // 관리자 SMS 알림 (실패해도 가입은 완료)
  try {
    const tierLabel =
      customerType === "DEALER"
        ? "딜러 신청"
        : customerType === "OEM"
        ? "OEM 신청"
        : "일반 고객";
    await notifyNewMember(user.name, user.company, tierLabel);
  } catch {
    // SMS 실패 무시
  }

  return NextResponse.json({ ok: true });
}
