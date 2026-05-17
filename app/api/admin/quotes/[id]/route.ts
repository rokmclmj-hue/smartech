import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const { id } = await params;
  const quoteId = parseInt(id);
  if (!Number.isFinite(quoteId)) {
    return NextResponse.json({ error: "잘못된 견적 ID" }, { status: 400 });
  }

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    select: { id: true, status: true, userId: true },
  });
  if (!quote) {
    return NextResponse.json({ error: "견적을 찾을 수 없습니다" }, { status: 404 });
  }
  if (quote.status === "CONFIRMED") {
    return NextResponse.json({ error: "확정된 견적은 삭제할 수 없습니다" }, { status: 409 });
  }

  await prisma.quote.delete({ where: { id: quoteId } });

  await logAudit({
    userId: admin.userId,
    action: "quote.delete",
    target: "Quote",
    targetId: quoteId,
    payload: { status: quote.status },
  });

  return NextResponse.json({ ok: true });
}
