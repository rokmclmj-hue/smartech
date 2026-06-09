import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fetchNewEmails } from "@/lib/gmail-imap";

// AI 분류 없이 IMAP 수신만 — 10초 제한 안에 완료
export async function POST() {
  const session = await auth();
  if ((session?.user as { tier?: string })?.tier !== "ADMIN") {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const setting = await prisma.siteSetting.findUnique({
    where: { key: "gmail_last_sync" },
  });

  const sinceDate = setting?.value
    ? new Date(setting.value)
    : new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  let rawEmails;
  try {
    rawEmails = await fetchNewEmails(sinceDate);
  } catch (e) {
    console.error("[email-sync] IMAP 실패:", e);
    return NextResponse.json(
      { error: "Gmail 연결 실패. IMAP이 활성화되어 있는지 확인해주세요." },
      { status: 500 }
    );
  }

  const ownEmails = [
    process.env.GMAIL_USER ?? "",
    "info@smartechvacuum.com",
    "mjlee@smartechvacuum.com",
  ].map((e) => e.toLowerCase());

  let created = 0;
  let skipped = 0;

  for (const raw of rawEmails) {
    // 중복 건너뜀
    const exists = await prisma.emailTask.findUnique({
      where: { gmailMessageId: raw.messageId },
    });
    if (exists) { skipped++; continue; }

    // 자기 자신이 보낸 이메일 제외
    if (ownEmails.includes(raw.fromEmail.toLowerCase())) { skipped++; continue; }

    // AI 분류 없이 일단 저장 (분류는 클릭 시 on-demand)
    await prisma.emailTask.create({
      data: {
        gmailMessageId: raw.messageId,
        fromEmail: raw.fromEmail,
        fromName: raw.fromName,
        subject: raw.subject,
        bodyText: raw.bodyText,
        receivedAt: raw.receivedAt,
        emailType: "OTHER",      // 클릭 시 분류됨
        aiConfidence: null,
        parsedData: undefined,
        aiDraft: null,
        status: "PENDING",
      },
    });
    created++;
  }

  await prisma.siteSetting.upsert({
    where: { key: "gmail_last_sync" },
    update: { value: new Date().toISOString() },
    create: { key: "gmail_last_sync", value: new Date().toISOString() },
  });

  return NextResponse.json({ created, skipped, total: rawEmails.length });
}
