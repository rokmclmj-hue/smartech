import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { generateManualDeliveryNotePdf } from "@/lib/pdf";
import { sendManualDeliveryNote } from "@/lib/mailer";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const note = await prisma.manualDeliveryNote.findUnique({
    where: { id: parseInt(id) },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!note) return NextResponse.json({ error: "찾을 수 없음" }, { status: 404 });

  const toEmail = body.toEmail ?? note.toEmail;
  if (!toEmail?.trim())
    return NextResponse.json({ error: "수신 이메일을 입력해주세요." }, { status: 400 });

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

  await sendManualDeliveryNote({
    to: toEmail.trim(),
    pdfBuffer: pdf,
    noteNo: note.noteNo,
    toCompany: note.toCompany,
    bodyText: body.bodyText ?? undefined,
  });

  await prisma.manualDeliveryNote.update({
    where: { id: note.id },
    data: { status: "SENT", sentAt: new Date(), sentTo: toEmail.trim() },
  });

  return NextResponse.json({ ok: true });
}
