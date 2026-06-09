import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { classifyEmail } from "@/lib/email-classifier";

export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as { tier?: string })?.tier !== "ADMIN") {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const { id } = await req.json();

  const task = await prisma.emailTask.findUnique({ where: { id: Number(id) } });
  if (!task) return NextResponse.json({ error: "없음" }, { status: 404 });

  // 이미 분류됐으면 그대로 반환
  if (task.emailType !== "OTHER" || task.aiDraft) {
    return NextResponse.json({ task });
  }

  let classified;
  try {
    classified = await classifyEmail(task.subject, task.bodyText, task.fromEmail);
  } catch {
    classified = { emailType: "OTHER" as const, confidence: 0, parsedData: {}, aiDraft: "" };
  }

  const updated = await prisma.emailTask.update({
    where: { id: Number(id) },
    data: {
      emailType: classified.emailType,
      aiConfidence: classified.confidence,
      parsedData: classified.parsedData as object,
      aiDraft: classified.aiDraft,
    },
  });

  return NextResponse.json({ task: updated });
}
