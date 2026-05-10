import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { QUOTE_VALID_DAYS } from "@/lib/constants";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const { id } = await params;
  const originalId = parseInt(id);
  if (!Number.isFinite(originalId)) {
    return NextResponse.json({ error: "잘못된 견적 ID" }, { status: 400 });
  }

  const src = await prisma.quote.findUnique({
    where: { id: originalId },
    include: { items: true },
  });
  if (!src) {
    return NextResponse.json({ error: "원본 견적 없음" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const targetUserId =
    typeof body.userId === "number" && Number.isFinite(body.userId)
      ? body.userId
      : src.userId;

  const expiresAt = new Date(Date.now() + QUOTE_VALID_DAYS * 24 * 60 * 60 * 1000);

  try {
    const created = await prisma.quote.create({
      data: {
        userId: targetUserId,
        status: "DRAFT",
        note: typeof body.note === "string" ? body.note : src.note,
        expiresAt,
        totalAmount: src.totalAmount,
        taxInvoiceRequested: src.taxInvoiceRequested,
        createdByAdminId: admin.userId,
        items: {
          create: src.items.map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
          })),
        },
      },
    });

    await logAudit({
      userId: admin.userId,
      action: "quote.duplicate",
      target: "Quote",
      targetId: created.id,
      payload: { originalId, itemCount: src.items.length },
    });

    return NextResponse.json({ ok: true, quoteId: created.id, originalId });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === "P2003") {
      return NextResponse.json(
        { error: "참조 오류: 사용자 또는 제품이 존재하지 않습니다" },
        { status: 400 }
      );
    }
    console.error("[quote duplicate]", e);
    return NextResponse.json({ error: "복제 실패" }, { status: 500 });
  }
}
