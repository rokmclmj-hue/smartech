import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import nodemailer from "nodemailer";

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

// ─── DELETE: 차단 도메인 이메일 일괄 정리 ───────────
export async function DELETE() {
  const session = await auth();
  if ((session?.user as { tier?: string })?.tier !== "ADMIN") {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const BLOCK_DOMAINS = [
    "hometax.go.kr", "google.com", "edwardsvacuum.com",
    "ecount.com", "accounts.google.com",
  ];
  const BLOCK_PREFIXES = [
    "noreply", "no-reply", "donotreply", "do-not-reply",
    "notify-noreply", "noreply-accounts", "mailer-daemon", "postmaster",
  ];

  const all = await prisma.emailTask.findMany({ select: { id: true, fromEmail: true } });
  const toDelete = all.filter(({ fromEmail }) => {
    const lower = fromEmail.toLowerCase();
    const [local, domain] = lower.split("@");
    if (!domain) return false;
    if (BLOCK_DOMAINS.some((d) => domain === d || domain.endsWith("." + d))) return true;
    if (BLOCK_PREFIXES.some((p) => local.startsWith(p))) return true;
    return false;
  });

  if (toDelete.length > 0) {
    await prisma.emailTask.deleteMany({ where: { id: { in: toDelete.map((t) => t.id) } } });
  }

  return NextResponse.json({ deleted: toDelete.length });
}

// ─── PATCH: 승인 / 반려 / 무시 ──────────────────────
export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const body = await req.json();
  const { id, action, finalDraft, adminNote, replyTo } = body;
  // action: "approve" | "reject" | "ignore"

  const task = await prisma.emailTask.findUnique({ where: { id: Number(id) } });
  if (!task) return NextResponse.json({ error: "이메일 없음" }, { status: 404 });

  if (action === "approve") {
    // 이메일 발송
    const sendFrom = `"스마텍" <info@smartechvacuum.com>`;
    const replyAddress = replyTo ?? task.fromEmail;

    await transporter.sendMail({
      from: sendFrom,
      to: replyAddress,
      subject: `Re: ${task.subject}`,
      text: finalDraft ?? task.aiDraft ?? "",
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

  if (action === "ignore") {
    await prisma.emailTask.update({
      where: { id: Number(id) },
      data: { status: "IGNORED", adminNote: adminNote ?? null },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "잘못된 action" }, { status: 400 });
}
