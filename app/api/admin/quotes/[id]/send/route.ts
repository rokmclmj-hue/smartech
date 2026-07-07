import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { generateQuotePdf, type QuoteForPdf } from "@/lib/pdf";
import { sendQuotePdf } from "@/lib/mailer";
import { VAT_RATE } from "@/lib/constants";

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

function fmtKRW(n: number): string {
  return "₩" + n.toLocaleString("ko-KR");
}

function fmtDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function buildHtmlBody(opts: {
  quoteNo: string;
  company: string;
  contactName: string;
  contactTitle: string | null;
  grandTotal: number;
  expiresAt: Date | null;
}): string {
  const exp = opts.expiresAt ? fmtDate(opts.expiresAt) : "발행일 +14일";
  const salutation = opts.contactTitle
    ? `${opts.contactName} ${opts.contactTitle}님`
    : `${opts.contactName} 님`;
  return `<div style="font-family:'Malgun Gothic','Apple SD Gothic Neo',Arial,sans-serif;color:#222;line-height:1.7;font-size:14px">
  <p>안녕하세요 ${salutation},<br>스마텍 이명재입니다.</p>
  <p>귀사의 일익 번창하심을 기원합니다.</p>
  <p>요청하신 견적서를 송부하오니, 검토 후 회신 부탁드립니다.</p>
  <table style="border-collapse:collapse;margin:18px 0;font-size:13px">
    <tr><td style="padding:6px 12px;color:#666;border:1px solid #ddd">견적번호</td>
        <td style="padding:6px 12px;border:1px solid #ddd"><strong>${opts.quoteNo}</strong></td></tr>
    <tr><td style="padding:6px 12px;color:#666;border:1px solid #ddd">총액 (VAT 포함)</td>
        <td style="padding:6px 12px;border:1px solid #ddd"><strong>${fmtKRW(opts.grandTotal)}</strong></td></tr>
    <tr><td style="padding:6px 12px;color:#666;border:1px solid #ddd">유효기간</td>
        <td style="padding:6px 12px;border:1px solid #ddd">${exp}</td></tr>
  </table>
  <p style="margin-top:24px">감사합니다.</p>
  <p style="margin-top:16px;font-size:13px;color:#444;line-height:2">
    <strong>SMARTECH.</strong><br>
    T. 031-204-7170 &nbsp;·&nbsp; M. 010-3194-7170<br>
    F. 031-206-7178 &nbsp;·&nbsp; <a href="https://smartechvacuum.com" style="color:#0d3a8a;text-decoration:none">smartechvacuum.com</a>
  </p>
</div>`;
}

export async function POST(
  req: NextRequest,
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

  // ?force=1 이면 24시간 가드 우회
  const force = req.nextUrl.searchParams.get("force") === "1";

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return NextResponse.json(
      {
        error:
          "메일 환경변수(GMAIL_USER / GMAIL_APP_PASSWORD)가 설정되지 않았습니다. .env 파일을 확인하세요.",
      },
      { status: 503 }
    );
  }

  // body에서 추가 첨부파일 파싱 (사업자등록증·통장사본 등)
  let bodyData: {
    attachments?: { filename: string; base64: string; contentType: string }[];
    blobAttachments?: { url: string; filename: string; contentType: string }[];
  } = {};
  try { bodyData = await req.json(); } catch { /* body 없음 */ }
  const extraAttachments = bodyData.attachments ?? [];

  // Blob URL 첨부파일 → 서버에서 fetch 후 Buffer 변환 (private blob: Bearer 토큰 필요)
  const blobAttachments: { filename: string; content: Buffer; contentType: string }[] = [];
  for (const b of bodyData.blobAttachments ?? []) {
    try {
      const r = await fetch(b.url, {
        headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN ?? ""}` },
      });
      if (r.ok) {
        const buf = Buffer.from(await r.arrayBuffer());
        blobAttachments.push({ filename: b.filename, content: buf, contentType: b.contentType });
      }
    } catch { /* fetch 실패 시 건너뜀 */ }
  }

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      user: { select: { name: true, company: true, email: true, phone: true, tier: true, title: true } },
      items: {
        include: {
          product: { select: { partNo: true, description: true, category: true } },
        },
      },
    },
  });

  if (!quote) {
    return NextResponse.json({ error: "견적을 찾을 수 없습니다" }, { status: 404 });
  }

  // 등록 고객 또는 비회원(guest) 이메일 결정
  const recipientEmail = quote.user?.email ?? quote.guestEmail ?? null;
  const recipientName = quote.user?.name ?? quote.guestName ?? "담당자";
  const recipientCompany = quote.user?.company ?? quote.guestCompany ?? "";

  if (!recipientEmail) {
    return NextResponse.json(
      { error: "수신자 이메일이 없습니다" },
      { status: 400 }
    );
  }

  if (quote.items.length === 0) {
    return NextResponse.json({ error: "품목이 없는 견적입니다" }, { status: 400 });
  }

  // 멱등성 가드: 24시간 이내 발송 기록이 있고 force가 아니면 409
  if (!force && quote.sentAt) {
    const hoursSince =
      (Date.now() - quote.sentAt.getTime()) / (1000 * 60 * 60);
    if (hoursSince < 24) {
      return NextResponse.json(
        {
          error: "최근 24시간 내에 이미 발송됨",
          lastSentAt: quote.sentAt.toISOString(),
        },
        { status: 409 }
      );
    }
  }

  try {
    const tier = (quote as { guestTier?: string | null }).guestTier ?? quote.user?.tier ?? "ENDUSER";
    const priceBasis = (tier && tier !== "ENDUSER" && tier !== "PENDING") ? "우대적용" : null;

    const quoteForPdf: QuoteForPdf = {
      id: quote.id,
      createdAt: quote.createdAt,
      expiresAt: quote.expiresAt,
      taxInvoiceRequested: quote.taxInvoiceRequested,
      totalAmount: quote.totalAmount,
      note: quote.note,
      priceBasis,
      paymentTerm: quote.paymentTerm ?? null,
      user: {
        name: recipientName,
        company: recipientCompany,
        email: recipientEmail,
        phone: quote.user?.phone ?? quote.guestPhone ?? null,
        title: quote.guestTitle ?? quote.user?.title ?? null,
      },
      items: quote.items.map((it) => ({
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        leadTime: (it as { leadTime?: string | null }).leadTime ?? null,
        product: {
          partNo: it.customPartNo ?? it.product?.partNo ?? "",
          description: it.customDescription ?? it.product?.description ?? "",
          category: it.product?.category ?? null,
        },
      })),
    };

    const pdfBuffer = await generateQuotePdf(quoteForPdf);

    const year = quote.createdAt.getFullYear();
    const seq = String(quote.id).padStart(6, "0");
    const quoteNo = `SMT-${year}-Q-${seq}`;

    const pdfFilename = buildSmartFilename(
      quote.createdAt,
      recipientCompany,
      quote.items.map((it) => ({
        description: it.customDescription ?? it.product?.description ?? "",
        quantity: it.quantity,
      }))
    );

    const subtotal = quote.items.reduce(
      (s, i) => s + i.unitPrice * i.quantity,
      0
    );
    const grandTotal = subtotal + Math.round(subtotal * VAT_RATE);

    try {
      await sendQuotePdf(recipientEmail, pdfBuffer, quoteNo, {
        html: buildHtmlBody({
          quoteNo,
          company: recipientCompany,
          contactName: recipientName,
          contactTitle: quote.guestTitle ?? quote.user?.title ?? null,
          grandTotal,
          expiresAt: quote.expiresAt,
        }),
        pdfFilename,
        extraAttachments: [
          ...extraAttachments.map((a) => ({
            filename: a.filename,
            content: Buffer.from(a.base64, "base64"),
            contentType: a.contentType,
          })),
          ...blobAttachments,
        ],
      });
    } catch (e: unknown) {
      console.error("[quote send / mail]", e);
      const err = e as { code?: string; message?: string };
      const msg =
        err?.code === "EAUTH"
          ? "Gmail 인증 실패: 앱 비밀번호를 확인하세요"
          : `메일 발송 실패: ${err?.message ?? "알 수 없는 오류"}`;
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    // DB 업데이트: sentAt, sendCount 증가, CONFIRMED가 아닐 때만 SENT
    const newSendCount = quote.sendCount + 1;
    try {
      await prisma.quote.update({
        where: { id: quoteId },
        data: {
          sentAt: new Date(),
          sendCount: { increment: 1 },
          ...(quote.status !== "CONFIRMED" ? { status: "SENT" } : {}),
        },
      });
    } catch (e) {
      console.error("[quote send / status update]", e);
      return NextResponse.json({
        ok: true,
        sentTo: recipientEmail,
        quoteNo,
        warning: "메일은 발송됐으나 견적 상태 업데이트에 실패했습니다",
      });
    }

    // audit 로그
    await logAudit({
      userId: admin.userId,
      action: "quote.send",
      target: "Quote",
      targetId: quoteId,
      payload: {
        to: recipientEmail,
        sendCount: newSendCount,
        force: !!force,
      },
    });

    return NextResponse.json({ ok: true, sentTo: recipientEmail, quoteNo });
  } catch (e: unknown) {
    console.error("[quote send]", e);
    const err = e as { message?: string };
    return NextResponse.json(
      { error: `처리 실패: ${err?.message ?? "알 수 없는 오류"}` },
      { status: 500 }
    );
  }
}
