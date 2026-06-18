import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateQuotePdf } from "@/lib/pdf";

type PreviewItem = {
  productId: number;
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

  const user = session.user as { id?: string; name?: string | null; email?: string | null; company?: string };
  const userId = user.id ? Number(user.id) : null;
  const now = new Date();

  // ── PDF 생성 ───────────────────────────────────────────
  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await generateQuotePdf({
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
  } catch (err) {
    console.error("[PDF 미리보기 오류]", err);
    return NextResponse.json({ error: "PDF 생성 중 오류가 발생했습니다." }, { status: 500 });
  }

  // ── DRAFT 견적 저장 (이력 추적용) ─────────────────────
  if (userId) {
    try {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const newIds = items.map((i) => i.productId).sort((a, b) => a - b);

      // 24시간 내 같은 품목 구성의 DRAFT가 있으면 중복 생성 안 함
      const existingDraft = await prisma.quote.findFirst({
        where: { userId, status: "DRAFT", note: "[PDF저장]", createdAt: { gte: yesterday } },
        include: { items: { select: { productId: true } } },
        orderBy: { createdAt: "desc" },
      });

      const existingIds = (existingDraft?.items ?? [])
        .map((i) => i.productId ?? 0)
        .sort((a, b) => a - b);

      const isSame = JSON.stringify(newIds) === JSON.stringify(existingIds);

      if (existingDraft && isSame) {
        await prisma.quote.update({
          where: { id: existingDraft.id },
          data: { note: "[PDF저장]" },
        });
      } else {
        await prisma.quote.create({
          data: {
            userId,
            status: "DRAFT",
            note: "[PDF저장]",
            items: {
              create: items.map((i) => ({
                productId: i.productId,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
              })),
            },
          },
        });
      }
    } catch (err) {
      console.error("[DRAFT 저장 오류]", err);
      // 이력 저장 실패해도 PDF 다운로드는 정상 처리
    }
  }

  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

  function stripPrefix(name: string) {
    return name
      .replace(/^(주식회사|유한회사|합자회사|합명회사)\s*/u, "")
      .replace(/^\(주\)\s*/u, "")
      .replace(/^㈜\s*/u, "")
      .trim();
  }
  const co = stripPrefix(user.company ?? "") || (user.company ?? "");
  let pdfFilename: string;
  if (items.length === 0) {
    pdfFilename = `견적서_${dateStr}_${co}.pdf`;
  } else {
    const first = items[0];
    const desc = first.description || "품목";
    const label = items.length === 1
      ? `${desc} x ${first.quantity}ea`
      : `${desc} x ${first.quantity}ea 외`;
    pdfFilename = `견적서_${dateStr}_${co}(${label}).pdf`;
  }

  return new NextResponse(pdfBuffer.buffer as ArrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(pdfFilename)}`,
      "Content-Length": String(pdfBuffer.length),
    },
  });
}
