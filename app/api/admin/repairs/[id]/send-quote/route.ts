import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { generateRepairQuotePdf } from "@/lib/pdf";
import { sendRepairQuote } from "@/lib/mailer";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const repair = await prisma.repairRequest.findUnique({ where: { id: Number(id) } });
  if (!repair) return NextResponse.json({ error: "접수 없음" }, { status: 404 });

  const email = repair.contactEmail;
  if (!email) return NextResponse.json({ error: "이메일 없음" }, { status: 400 });
  if (repair.totalAmount <= 0) return NextResponse.json({ error: "견적 금액이 0입니다" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const adminNote: string = (body as { adminNote?: string }).adminNote ?? repair.adminNote ?? "";

  try {
    const pdfBuffer = await generateRepairQuotePdf({
      jobNo: repair.repairNo,
      pumpMaker: repair.pumpMaker,
      pumpModel: repair.pumpModel,
      serialNo: repair.pumpSerial ?? null,
      voltage: null,
      repairReason: repair.symptoms?.join(", ") || null,
      receivedDate: repair.createdAt,
      requestedDate: null,
      companyName: repair.company ?? null,
      contactName: repair.contactName,
      contactEmail: email,
      contactPhone: repair.contactPhone,
      repairCost: repair.totalAmount,
      repairPartsText: adminNote || null,
      inspectorName: null,
      quoteRemarks: repair.quoteRemarks ?? null,
    });

    // 수리견적서만 첨부 (온라인 수리는 검사성적서 없음)
    await sendRepairQuote({
      to: email,
      jobNo: repair.repairNo,
      companyName: repair.company ?? "고객",
      contactName: repair.contactName,
      quotePdfBuffer: pdfBuffer,
    });

    await prisma.repairRequest.update({
      where: { id: Number(id) },
      data: { docsSentAt: new Date(), docsSentCount: { increment: 1 } },
    });

    return NextResponse.json({ ok: true, sentTo: email });
  } catch (e: unknown) {
    console.error("[온라인 수리 견적 발송]", e);
    return NextResponse.json({ error: "발송 실패" }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const repair = await prisma.repairRequest.findUnique({ where: { id: Number(id) } });
  if (!repair) return NextResponse.json({ error: "접수 없음" }, { status: 404 });

  const { generateRepairQuotePdf: gen } = await import("@/lib/pdf");
  const pdfBuffer = await gen({
    jobNo: repair.repairNo,
    pumpMaker: repair.pumpMaker,
    pumpModel: repair.pumpModel,
    serialNo: repair.pumpSerial ?? null,
    voltage: null,
    repairReason: repair.symptoms?.join(", ") || null,
    receivedDate: repair.createdAt,
    requestedDate: null,
    companyName: repair.company ?? null,
    contactName: repair.contactName,
    contactEmail: repair.contactEmail ?? null,
    contactPhone: repair.contactPhone,
    repairCost: repair.totalAmount,
    repairPartsText: repair.adminNote ?? null,
    inspectorName: null,
    quoteRemarks: repair.quoteRemarks ?? null,
  });

  const filename = `수리견적서_${repair.repairNo}.pdf`;
  return new NextResponse(pdfBuffer.buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}
