import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateQuotePdf } from "@/lib/pdf";

type PreviewItem = {
  partNo: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { items, note } = (await req.json()) as {
    items: PreviewItem[];
    note?: string;
  };

  if (!items?.length) {
    return NextResponse.json({ error: "품목이 없습니다." }, { status: 400 });
  }

  const user = session.user as { name?: string | null; email?: string | null; company?: string };
  const now = new Date();

  try {
    const pdfBuffer = await generateQuotePdf({
      id: 0,
      createdAt: now,
      expiresAt: null,
      taxInvoiceRequested: false,
      totalAmount: null,
      note: note ?? null,
      user: {
        name: user.name ?? "",
        company: user.company ?? "",
        email: user.email ?? "",
      },
      items: items.map((i) => ({
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        product: { partNo: i.partNo, description: i.description },
      })),
    });

    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

    return new NextResponse(pdfBuffer.buffer as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="견적서_${dateStr}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (err) {
    console.error("[PDF 미리보기 오류]", err);
    return NextResponse.json({ error: "PDF 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
