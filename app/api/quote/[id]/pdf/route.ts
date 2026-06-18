import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateQuotePdf } from "@/lib/pdf";

function stripCompanyPrefix(name: string): string {
  return name
    .replace(/^(주식회사|유한회사|합자회사|합명회사)\s*/u, "")
    .replace(/^\(주\)\s*/u, "")
    .replace(/^㈜\s*/u, "")
    .trim();
}

function buildSmartFilename(
  date: Date,
  company: string,
  items: { description: string; quantity: number }[]
): string {
  const d = date;
  const yyyymmdd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const co = stripCompanyPrefix(company) || company;
  if (items.length === 0) return `견적서_${yyyymmdd}_${co}.pdf`;
  const first = items[0];
  const desc = first.description || "품목";
  const label = items.length === 1
    ? `${desc} x ${first.quantity}ea`
    : `${desc} x ${first.quantity}ea 외`;
  return `견적서_${yyyymmdd}_${co}(${label}).pdf`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const quoteId = parseInt(id);
  if (isNaN(quoteId)) {
    return NextResponse.json({ error: "잘못된 견적 ID입니다." }, { status: 400 });
  }

  const su = session.user as { id?: string; tier?: string };
  const userId = parseInt(su.id ?? "0");
  const tier = su.tier ?? "";
  const isAdmin = tier === "ADMIN";

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      items: { include: { product: true } },
      user: true,
    },
  });

  if (!quote) {
    return NextResponse.json({ error: "견적을 찾을 수 없습니다." }, { status: 404 });
  }

  // 본인 또는 관리자만 접근 가능
  if (!isAdmin && quote.userId !== userId) {
    return NextResponse.json({ error: "접근 권한이 없습니다." }, { status: 403 });
  }

  try {
    const tier = (quote as { guestTier?: string | null }).guestTier ?? quote.user?.tier ?? "ENDUSER";
    const priceBasis = (tier && tier !== "ENDUSER" && tier !== "PENDING") ? "우대적용" : null;

    const pdfBuffer = await generateQuotePdf({
      id: quote.id,
      createdAt: quote.createdAt,
      expiresAt: quote.expiresAt,
      taxInvoiceRequested: quote.taxInvoiceRequested,
      totalAmount: quote.totalAmount,
      note: quote.note,
      priceBasis,
      paymentTerm: quote.paymentTerm ?? null,
      user: {
        name: quote.user?.name ?? quote.guestName ?? "",
        company: quote.user?.company ?? quote.guestCompany ?? "",
        email: quote.user?.email ?? quote.guestEmail ?? "",
        phone: quote.user?.phone ?? quote.guestPhone ?? null,
        title: quote.guestTitle ?? quote.user?.title ?? null,
      },
      items: quote.items.map((item) => ({
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        leadTime: (item as { leadTime?: string | null }).leadTime ?? null,
        product: {
          partNo: item.customPartNo ?? item.product?.partNo ?? "",
          description: item.customDescription ?? item.product?.description ?? "",
        },
      })),
    });

    const company = quote.user?.company ?? quote.guestCompany ?? "";
    const pdfFilename = buildSmartFilename(
      quote.createdAt,
      company,
      quote.items.map((it) => ({
        description: it.customDescription ?? it.product?.description ?? "",
        quantity: it.quantity,
      }))
    );

    return new NextResponse(pdfBuffer.buffer as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(pdfFilename)}`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (err) {
    console.error("[PDF 생성 오류]", err);
    return NextResponse.json({ error: "PDF 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
