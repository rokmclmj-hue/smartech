import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";

  const notes = await prisma.manualDeliveryNote.findMany({
    where: q
      ? { toCompany: { contains: q, mode: "insensitive" } }
      : {},
    include: {
      items: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const items = notes.map((n) => ({
    id: n.id,
    noteNo: n.noteNo,
    createdAt: n.createdAt.toISOString(),
    toCompany: n.toCompany,
    toName: n.toName,
    toTitle: n.toTitle,
    toEmail: n.toEmail,
    toPhone: n.toPhone,
    toBizNo: n.toBizNo,
    memo: n.memo,
    remarks: n.remarks,
    includeBankInfo: n.includeBankInfo,
    totalAmount: n.totalAmount,
    itemCount: n.items.length,
    previewItems: n.items.map((i) => ({
      partNo: i.partNo,
      description: i.description,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      productId: i.productId,
      sortOrder: i.sortOrder,
    })),
  }));

  return NextResponse.json({ items });
}
