import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { generateQuotePdf, type QuoteForPdf } from "@/lib/pdf";
import { sendQuotePdf } from "@/lib/mailer";
import { VAT_RATE } from "@/lib/constants";

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
  grandTotal: number;
  expiresAt: Date | null;
}): string {
  const exp = opts.expiresAt ? fmtDate(opts.expiresAt) : "발행일 +14일";
  return `<div style="font-family:'Malgun Gothic','Apple SD Gothic Neo',Arial,sans-serif;color:#222;line-height:1.7;font-size:14px">
  <p>${opts.company} ${opts.contactName} 님, 안녕하세요. <strong>(주)스마텍</strong>입니다.</p>
  <p>요청하신 견적서를 첨부하여 송부드립니다. 검토 후 회신 부탁드립니다.</p>
  <table style="border-collapse:collapse;margin:18px 0;font-size:13px">
    <tr><td style="padding:6px 12px;color:#666;border:1px solid #ddd">견적번호</td>
        <td style="padding:6px 12px;border:1px solid #ddd"><strong>${opts.quoteNo}</strong></td></tr>
    <tr><td style="padding:6px 12px;color:#666;border:1px solid #ddd">총액 (VAT 포함)</td>
        <td style="padding:6px 12px;border:1px solid #ddd"><strong>${fmtKRW(opts.grandTotal)}</strong></td></tr>
    <tr><td style="padding:6px 12px;color:#666;border:1px solid #ddd">유효기간</td>
        <td style="padding:6px 12px;border:1px solid #ddd">${exp}</td></tr>
  </table>
  <p style="color:#555;font-size:13px">
    <strong>거래조건</strong><br>
    · 결제: 세금계산서 발행 / 익월 말 결제<br>
    · 납기: 국내재고 D+1 / 해외주문 D+14<br>
    · 보증: 12개월 제품 보증
  </p>
  <p style="margin-top:20px">감사합니다.<br><strong>(주)스마텍 영업팀</strong></p>
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

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      user: { select: { name: true, company: true, email: true, phone: true } },
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
    const quoteForPdf: QuoteForPdf = {
      id: quote.id,
      createdAt: quote.createdAt,
      expiresAt: quote.expiresAt,
      taxInvoiceRequested: quote.taxInvoiceRequested,
      totalAmount: quote.totalAmount,
      note: quote.note,
      user: {
        name: recipientName,
        company: recipientCompany,
        email: recipientEmail,
        phone: quote.user?.phone ?? quote.guestPhone ?? null,
        title: quote.guestTitle ?? null,
      },
      items: quote.items.map((it) => ({
        quantity: it.quantity,
        unitPrice: it.unitPrice,
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

    const subtotal = quote.items.reduce(
      (s, i) => s + i.unitPrice * i.quantity,
      0
    );
    const grandTotal =
      quote.totalAmount ?? subtotal + Math.round(subtotal * VAT_RATE);

    try {
      await sendQuotePdf(recipientEmail, pdfBuffer, quoteNo, {
        html: buildHtmlBody({
          quoteNo,
          company: recipientCompany,
          contactName: recipientName,
          grandTotal,
          expiresAt: quote.expiresAt,
        }),
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
