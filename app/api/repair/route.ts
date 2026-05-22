import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notifyNewRepair } from "@/lib/solapi";

// POST /api/repair — 수리 접수 생성
export async function POST(req: NextRequest) {
  const session = await auth();
  const body = await req.json();

  const {
    pumpFamily,
    pumpMaker,
    pumpModel,
    pumpSerial,
    kitId,
    symptoms,
    symptomNote,
    baseAmount,
    selectedTier,
    contactName,
    contactPhone,
    contactEmail,
    company,
    aiConfidence,
    aiModelRaw,
  } = body;

  // 필수값 검증
  if (!pumpFamily || !pumpModel || !contactName || !contactPhone) {
    return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
  }

  // 접수번호 생성: SM-YYMMDD-NN
  const today = new Date();
  const yy = String(today.getFullYear()).slice(2);
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const prefix = `SM-${yy}${mm}${dd}`;

  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86400000);
  const todayCount = await prisma.repairRequest.count({
    where: { createdAt: { gte: todayStart, lt: todayEnd } },
  });
  const repairNo = `${prefix}-${String(todayCount + 1).padStart(2, "0")}`;

  const repair = await prisma.repairRequest.create({
    data: {
      repairNo,
      userId: session?.user?.id ? Number(session.user.id) : null,
      pumpFamily,
      pumpMaker: pumpMaker ?? "EDWARDS",
      pumpModel,
      pumpSerial: pumpSerial ?? null,
      kitId: kitId ?? null,
      symptoms: symptoms ?? [],
      symptomNote: symptomNote ?? null,
      baseAmount: baseAmount ?? 0,
      totalAmount: baseAmount ?? 0,
      contactName,
      contactPhone,
      contactEmail: contactEmail ?? null,
      company: company ?? null,
      aiConfidence: aiConfidence ?? null,
      aiModelRaw: aiModelRaw ?? null,
      repairTier: selectedTier ?? null,
      status: "RECEIVED",
      statusLogs: {
        create: {
          fromStatus: null,
          toStatus: "RECEIVED",
          note: "수리 접수 완료",
          changedBy: "system",
        },
      },
    },
  });

  // SMS 알림 (실패해도 접수는 성공으로 처리)
  try {
    await notifyNewRepair(repairNo, pumpModel, contactName, company, baseAmount ?? 0);
  } catch {
    console.error("[Repair] SMS 알림 실패 (접수는 정상 처리됨)");
  }

  return NextResponse.json({ repairNo: repair.repairNo, id: repair.id }, { status: 201 });
}

// GET /api/repair — 로그인한 사용자의 수리 접수 목록
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const repairs = await prisma.repairRequest.findMany({
    where: { userId: Number(session.user.id) },
    include: {
      files: { select: { fileType: true, fileName: true, fileUrl: true } },
      statusLogs: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ repairs });
}
