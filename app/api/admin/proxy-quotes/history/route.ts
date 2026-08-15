import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";

  const quotes = await prisma.quote.findMany({
    where: {
      createdByAdminId: { not: null },
      ...(q ? {
        OR: [
          { guestCompany: { contains: q, mode: "insensitive" } },
          { guestName: { contains: q, mode: "insensitive" } },
          { user: { company: { contains: q, mode: "insensitive" } } },
          { user: { name: { contains: q, mode: "insensitive" } } },
        ],
      } : {}),
    },
    include: {
      user: { select: { name: true, company: true, email: true } },
      items: {
        include: { product: { select: { partNo: true, description: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const items = quotes.map((q) => {
    const company = q.user?.company ?? q.guestCompany ?? "";
    const contactName = q.user?.name ?? q.guestName ?? "";
    const subtotal = q.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const quoteNo = `SMT-${q.createdAt.getFullYear()}-Q-${String(q.id).padStart(6, "0")}`;
    return {
      id: q.id,
      quoteNo,
      createdAt: q.createdAt.toISOString(),
      company,
      contactName,
      email: (q.user as { email?: string | null } | null)?.email ?? q.guestEmail ?? null,
      phone: q.guestPhone ?? null,
      contactTitle: q.guestTitle ?? null,
      tier: q.guestTier ?? "ENDUSER",
      isGuest: q.userId === null,
      subtotal,
      itemCount: q.items.length,
      previewItems: q.items.map((i) => ({
        partNo: i.customPartNo ?? i.product?.partNo ?? "",
        description: i.customDescription ?? i.product?.description ?? "",
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        leadTime: i.leadTime ?? "",
      })),
    };
  });

  return NextResponse.json({ items });
}

export async function DELETE(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id 필수" }, { status: 400 });

  await prisma.quote.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
