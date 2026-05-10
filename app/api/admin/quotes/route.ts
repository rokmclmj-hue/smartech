import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  return (session?.user as any)?.tier === "ADMIN";
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status && status !== "ALL") {
    where.status = status;
  }

  const quotes = await prisma.quote.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, company: true, email: true } },
      items: { select: { unitPrice: true, quantity: true } },
    },
  });

  const now = new Date();
  const formatted = quotes.map((q) => {
    const amount = q.totalAmount
      ? q.totalAmount
      : q.items.reduce((s, item) => s + item.unitPrice * item.quantity, 0);
    const isExpired = q.expiresAt ? q.expiresAt < now : false;
    return {
      id: q.id,
      company: q.user.company,
      contactName: q.user.name,
      email: q.user.email,
      amount,
      status: q.status,
      expiresAt: q.expiresAt?.toISOString() ?? null,
      isExpired,
      createdAt: q.createdAt.toISOString(),
      itemCount: q.items.length,
    };
  });

  return NextResponse.json(formatted);
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const { quoteId, action } = await req.json();

  if (!quoteId || !action) {
    return NextResponse.json({ error: "quoteId와 action이 필요합니다" }, { status: 400 });
  }

  if (action === "resend") {
    // 이메일 재발송 (견적 상태를 SENT로 업데이트)
    const quote = await prisma.quote.update({
      where: { id: quoteId },
      data: { status: "SENT" },
      include: { user: { select: { email: true, name: true, company: true } } },
    });
    // 실제 이메일 발송 로직은 기존 email 모듈과 통합 필요
    return NextResponse.json({ ok: true, status: quote.status });
  }

  return NextResponse.json({ error: "유효하지 않은 action" }, { status: 400 });
}
