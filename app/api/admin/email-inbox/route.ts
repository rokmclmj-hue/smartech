import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import nodemailer from "nodemailer";
import { trashEmail } from "@/lib/gmail-imap";
import { generateQuotePdf } from "@/lib/pdf";

async function requireAdmin() {
  const session = await auth();
  return (session?.user as { tier?: string })?.tier === "ADMIN";
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// ─── GET: 이메일 목록 조회 ───────────────────────────
export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "PENDING";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;

  const [tasks, total] = await Promise.all([
    prisma.emailTask.findMany({
      where: status === "ALL" ? {} : { status },
      orderBy: { receivedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.emailTask.count({
      where: status === "ALL" ? {} : { status },
    }),
  ]);

  return NextResponse.json({ tasks, total, page, limit });
}

// ─── DELETE: 불필요 메일 일괄 정리 ─────────────────
// 삭제 기준 A: 자동화 발신자 도메인/프리픽스 (GitHub, 세금계산서 등)
// 삭제 기준 B: AI가 분류 완료(aiDraft 존재)했는데 "기타"로 판정된 것
// → 클릭 안 한 비즈니스 이메일(aiDraft=null)은 절대 삭제하지 않음
export async function DELETE() {
  const session = await auth();
  if ((session?.user as { tier?: string })?.tier !== "ADMIN") {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const BLOCK_DOMAINS = [
    "github.com", "hometax.go.kr", "accounts.google.com",
    "edwardsvacuum.com",
  ];
  const BLOCK_PREFIXES = [
    "noreply", "no-reply", "notifications", "mailer-daemon",
    "bounce", "postmaster", "donotreply",
  ];

  function isBlockedSender(email: string): boolean {
    const parts = email.toLowerCase().split("@");
    if (parts.length < 2) return false;
    const [prefix, domain] = parts;
    return (
      BLOCK_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`)) ||
      BLOCK_PREFIXES.some((p) => prefix === p || prefix.startsWith(`${p}.`) || prefix.startsWith(`${p}+`))
    );
  }

  const candidates = await prisma.emailTask.findMany({
    where: { status: { in: ["PENDING", "IGNORED"] } },
    select: { id: true, gmailMessageId: true, fromEmail: true, emailType: true, aiDraft: true },
  });

  const toDelete = candidates.filter(
    (t) =>
      isBlockedSender(t.fromEmail) ||
      (t.emailType === "OTHER" && !!t.aiDraft?.trim())
  );

  if (toDelete.length === 0) {
    return NextResponse.json({ deleted: 0 });
  }

  await Promise.allSettled(toDelete.map((t) => trashEmail(t.gmailMessageId)));
  await prisma.emailTask.deleteMany({ where: { id: { in: toDelete.map((t) => t.id) } } });

  return NextResponse.json({ deleted: toDelete.length });
}

// ─── PATCH: 승인 / 반려 / 무시 ──────────────────────
export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const body = await req.json();
  const { id, action, finalDraft, adminNote, replyTo, quoteId } = body;
  // action: "approve" | "reject" | "ignore"

  const task = await prisma.emailTask.findUnique({ where: { id: Number(id) } });
  if (!task) return NextResponse.json({ error: "이메일 없음" }, { status: 404 });

  if (action === "approve") {
    // PDF 첨부 생성
    const attachments: { filename: string; content: Buffer; contentType: string }[] = [];
    if (quoteId) {
      const quote = await prisma.quote.findUnique({
        where: { id: Number(quoteId) },
        include: { items: { include: { product: true } }, user: true },
      });
      if (quote) {
        const pdfBuffer = await generateQuotePdf({
          id: quote.id,
          createdAt: quote.createdAt,
          expiresAt: quote.expiresAt,
          taxInvoiceRequested: quote.taxInvoiceRequested,
          totalAmount: quote.totalAmount,
          note: quote.note,
          user: {
            name: quote.user?.name ?? quote.guestName ?? "",
            company: quote.user?.company ?? quote.guestCompany ?? "",
            email: quote.user?.email ?? quote.guestEmail ?? "",
            phone: quote.user?.phone ?? quote.guestPhone ?? null,
            title: (quote as { guestTitle?: string | null }).guestTitle ?? quote.user?.title ?? null,
          },
          items: quote.items.map((item) => ({
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            product: {
              partNo: (item as { customPartNo?: string | null }).customPartNo ?? item.product?.partNo ?? "",
              description: (item as { customDescription?: string | null }).customDescription ?? item.product?.description ?? "",
            },
          })),
        });
        const d = quote.createdAt;
        const quoteNo = `SMT-${d.getFullYear()}-Q-${String(quote.id).padStart(6, "0")}`;
        attachments.push({
          filename: `견적서_${quoteNo}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        });
      }
    }

    // 이메일 발송
    const sendFrom = `"스마텍" <info@smartechvacuum.com>`;
    const replyAddress = replyTo ?? task.fromEmail;

    await transporter.sendMail({
      from: sendFrom,
      to: replyAddress,
      subject: `Re: ${task.subject}`,
      text: finalDraft ?? task.aiDraft ?? "",
      attachments,
      // 원본 문의 메일의 Message-ID를 참조해 진짜 스레드 회신으로 연결 (고객 메일함에서 원본과 이어져 보임)
      inReplyTo: task.gmailMessageId,
      references: task.gmailMessageId,
    });

    await prisma.emailTask.update({
      where: { id: Number(id) },
      data: {
        status: "APPROVED",
        aiDraft: finalDraft ?? task.aiDraft, // 최종 발송 내용 저장
        adminNote: adminNote ?? null,
        approvedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true, message: "발송 완료" });
  }

  if (action === "reject") {
    await prisma.emailTask.update({
      where: { id: Number(id) },
      data: { status: "REJECTED", adminNote: adminNote ?? null },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "done") {
    await prisma.emailTask.update({
      where: { id: Number(id) },
      data: { status: "DONE", adminNote: adminNote ?? null, approvedAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "ignore") {
    await prisma.emailTask.update({
      where: { id: Number(id) },
      data: { status: "IGNORED", adminNote: adminNote ?? null },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "delete") {
    // Gmail 휴지통 이동 후 DB 삭제
    await trashEmail(task.gmailMessageId).catch(() => {});
    await prisma.emailTask.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "잘못된 action" }, { status: 400 });
}
