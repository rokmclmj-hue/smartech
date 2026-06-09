import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fetchNewEmails } from "@/lib/gmail-imap";
import { classifyEmail } from "@/lib/email-classifier";

export const maxDuration = 60;

async function requireAdmin() {
  const session = await auth();
  return (session?.user as { tier?: string })?.tier === "ADMIN";
}

export async function POST() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  // 마지막 동기화 시각 조회 (없으면 3일 전부터)
  const setting = await prisma.siteSetting.findUnique({
    where: { key: "gmail_last_sync" },
  });

  const sinceDate = setting?.value
    ? new Date(setting.value)
    : new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  // Gmail에서 새 이메일 가져오기
  let rawEmails;
  try {
    rawEmails = await fetchNewEmails(sinceDate);
  } catch (e) {
    console.error("[email-sync] IMAP 연결 실패:", e);
    return NextResponse.json(
      { error: "Gmail 연결 실패. IMAP 설정을 확인해주세요." },
      { status: 500 }
    );
  }

  let created = 0;
  let skipped = 0;

  for (const raw of rawEmails) {
    // 이미 처리된 이메일 건너뜀
    const exists = await prisma.emailTask.findUnique({
      where: { gmailMessageId: raw.messageId },
    });
    if (exists) { skipped++; continue; }

    // 스마텍 발신 이메일 제외
    const ownEmails = [
      process.env.GMAIL_USER ?? "",
      "info@smartechvacuum.com",
      "mjlee@smartechvacuum.com",
    ].map((e) => e.toLowerCase());
    if (ownEmails.includes(raw.fromEmail.toLowerCase())) { skipped++; continue; }

    // AI 분류
    let classified;
    try {
      classified = await classifyEmail(raw.subject, raw.bodyText, raw.fromEmail);
    } catch {
      classified = { emailType: "OTHER" as const, confidence: 0, parsedData: {}, aiDraft: "" };
    }

    await prisma.emailTask.create({
      data: {
        gmailMessageId: raw.messageId,
        fromEmail: raw.fromEmail,
        fromName: raw.fromName,
        subject: raw.subject,
        bodyText: raw.bodyText,
        receivedAt: raw.receivedAt,
        emailType: classified.emailType,
        aiConfidence: classified.confidence,
        parsedData: classified.parsedData as object,
        aiDraft: classified.aiDraft,
        status: "PENDING",
      },
    });
    created++;
  }

  // 마지막 동기화 시각 업데이트
  await prisma.siteSetting.upsert({
    where: { key: "gmail_last_sync" },
    update: { value: new Date().toISOString() },
    create: { key: "gmail_last_sync", value: new Date().toISOString() },
  });

  return NextResponse.json({ created, skipped, total: rawEmails.length });
}
