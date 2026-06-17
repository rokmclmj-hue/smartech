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

  try {
    const pdfBuffer = await generateManualDeliveryNotePdf({
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
    const arrayBuf = pdfBuffer.buffer.slice(
      pdfBuffer.byteOffset,
      pdfBuffer.byteOffset + pdfBuffer.byteLength
    ) as ArrayBuffer;

    // 스마트 파일명: 거래명세표_YYYYMMDD_거래처명(품목명 x Nea).pdf
    const dateStr = note.createdAt.toISOString().slice(0, 10).replace(/-/g, "");
    const firstItem = note.items[0];
    const itemLabel = firstItem
      ? note.items.length === 1
        ? `${firstItem.description || firstItem.partNo || "품목"} x ${firstItem.quantity}ea`
        : `${firstItem.description || firstItem.partNo || "품목"} x 외`
      : "품목없음";
    const smartFilename = `거래명세표_${dateStr}_${note.toCompany}(${itemLabel}).pdf`;
    const encodedFilename = encodeURIComponent(smartFilename);

    return new NextResponse(arrayBuf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": preview
          ? `inline; filename="DN_${note.noteNo}.pdf"`
          : `attachment; filename="DN_${note.noteNo}.pdf"; filename*=UTF-8''${encodedFilename}`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (e) {
    console.error("[delivery-note pdf] 생성 실패:", e);
    return NextResponse.json(
      { error: "PDF 생성 실패", detail: String(e) },
      { status: 500 }
    );
  }
}
