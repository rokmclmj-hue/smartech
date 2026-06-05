import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search")?.trim() ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1") || 1);
  const limit = Math.min(
    200,
    Math.max(1, parseInt(searchParams.get("limit") ?? "50") || 50)
  );
  const skip = (page - 1) * limit;

  // status 필터
  const statusFilter: Record<string, unknown> =
    status && status !== "ALL" ? { status } : {};

  // search 필터: 숫자면 id 직접 매칭, 아니면 회사명/담당자/이메일 부분 검색
  const searchNum = search !== "" ? parseInt(search) : NaN;
  const searchFilter =
    search === ""
      ? {}
      : Number.isFinite(searchNum)
        ? { id: searchNum }
        : {
            OR: [
              { user: { company: { contains: search } } },
              { user: { name: { contains: search } } },
              { user: { email: { contains: search } } },
            ],
          };

  const where = { ...statusFilter, ...searchFilter };

  const [total, quotes] = await Promise.all([
    prisma.quote.count({ where }),
    prisma.quote.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: { select: { name: true, company: true, email: true } },
        items: { select: { unitPrice: true, quantity: true } },
      },
    }),
  ]);

  const now = new Date();
  const items = quotes.map((q) => {
    const amount = q.totalAmount
      ? q.totalAmount
      : q.items.reduce((s, item) => s + item.unitPrice * item.quantity, 0);
    const isExpired = q.expiresAt ? q.expiresAt < now : false;
    return {
      id: q.id,
      company: q.user?.company ?? q.guestCompany ?? "",
      contactName: q.user?.name ?? q.guestName ?? "",
      email: q.user?.email ?? q.guestEmail ?? "",
      amount,
      status: q.status,
      expiresAt: q.expiresAt?.toISOString() ?? null,
      isExpired,
      createdAt: q.createdAt.toISOString(),
      itemCount: q.items.length,
      sentAt: q.sentAt?.toISOString() ?? null,
      sendCount: q.sendCount,
    };
  });

  return NextResponse.json({ items, total, page, limit });
}

export async function PATCH(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
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
