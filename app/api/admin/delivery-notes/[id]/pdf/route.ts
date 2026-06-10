import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { generateManualDeliveryNotePdf } from "@/lib/pdf";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const nId = parseInt(id);
  if (isNaN(nId)) return NextResponse.json({ error: "잘못된 ID" }, { status: 400 });

  const note = await prisma.manualDeliveryNote.findUnique({
    where: { id: nId },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!note) return NextResponse.json({ error: "찾을 수 없음" }, { status: 404 });

  const pdf = await generateManualDeliveryNotePdf({
    noteNo: note.noteNo,
    createdAt: note.createdAt,
    toCompany: note.toCompany,
    toName: note.toName,
    toEmail: note.toEmail,
    toPhone: note.toPhone,
    toBizNo: note.toBizNo,
    includeBankInfo: note.includeBankInfo,
    items: note.items.map((i) => ({
      partNo: i.partNo,
      description: i.description,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
  });

  const preview = req.nextUrl.searchParams.get("preview") === "1";
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": preview
        ? `inline; filename="거래명세표_${note.noteNo}.pdf"`
        : `attachment; filename="거래명세표_${note.noteNo}.pdf"`,
    },
  });
}
