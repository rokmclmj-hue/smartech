import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { resolveCompanyId } from "@/lib/known-company";
import { DEFAULT_ITEMS, SYMPTOM_KO } from "@/lib/offline-repair-defaults";

type Params = { params: Promise<{ id: string }> };

// POST — 온라인 수리접수 1건을 수리접수(OfflineRepairJob)로 등록
// 한 접수당 한 번만 등록된다 (sourceRepairId unique).
export async function POST(_req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const repairId = Number(id);
  if (!repairId) return NextResponse.json({ error: "id 필수" }, { status: 400 });

  const repair = await prisma.repairRequest.findUnique({
    where: { id: repairId },
    include: { offlineJob: { select: { id: true, jobNo: true } } },
  });
  if (!repair) return NextResponse.json({ error: "접수 없음" }, { status: 404 });
  if (repair.offlineJob)
    return NextResponse.json({ error: "이미 수리접수로 등록된 건입니다.", offlineJob: repair.offlineJob }, { status: 409 });
  if (!repair.pumpModel?.trim())
    return NextResponse.json({ error: "모델명을 먼저 저장해주세요." }, { status: 400 });

  const pumpModel = repair.pumpModel.trim();
  const symptomText = repair.symptoms.map((s) => SYMPTOM_KO[s] ?? s).join(", ");
  const memo = [
    `온라인접수 ${repair.repairNo}`,
    symptomText && `증상: ${symptomText}`,
    repair.symptomNote?.trim(),
  ].filter(Boolean).join("\n");

  // 온라인 수리견적서(send-quote)와 같은 품목 구성: 기본수리 1줄 + 추가파트 1줄
  // 기본 수리비가 0(상담필요)이면 비워 둔다 — 수리접수 화면의 기본수리 자동 채우기가 동작한다.
  const quoteItems = repair.baseAmount > 0
    ? [
        { name: `기본수리 — ${pumpModel}`, quantity: 1, unitPrice: repair.baseAmount, sortOrder: 0 },
        ...(repair.extraAmount > 0
          ? [{ name: repair.extraPartsName || "추가 파트 교체", quantity: 1, unitPrice: repair.extraAmount, sortOrder: 1 }]
          : []),
      ]
    : [];
  const repairCost = quoteItems.length
    ? quoteItems.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0)
    : null;

  try {
    const job = await prisma.$transaction(async (tx) => {
      // 같은 트랜잭션 안에서 거래처를 찾거나 만든다 — 이후 단계가 실패하면 거래처 생성도 함께 롤백된다.
      const companyId = await resolveCompanyId(null, repair.company, tx);
      const created = await tx.offlineRepairJob.create({
        data: {
          jobNo: `TEMP-${repair.id}`,
          sourceRepairId: repair.id,
          pumpMaker: repair.pumpMaker?.trim() || "EDWARDS",
          pumpModel,
          serialNo: repair.pumpSerial?.trim() || null,
          repairReason: "고장",
          companyId,
          contactName: repair.contactName?.trim() || null,
          contactEmail: repair.contactEmail?.trim() || null,
          contactPhone: repair.contactPhone?.trim() || null,
          receivedDate: repair.createdAt,
          memo,
          repairCost,
          quoteRemarks: repair.quoteRemarks,
          inspectionItems: { create: DEFAULT_ITEMS },
          quoteItems: { create: quoteItems },
        },
      });
      const jobNo = `SMT-${new Date().getFullYear()}-R-${String(created.id).padStart(6, "0")}`;
      return tx.offlineRepairJob.update({
        where: { id: created.id },
        data: { jobNo },
        select: { id: true, jobNo: true },
      });
    });
    return NextResponse.json({ offlineJob: job }, { status: 201 });
  } catch (e) {
    // 버튼을 연달아 눌러 동시에 두 번 들어온 경우 — 먼저 만들어진 건을 알려준다.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const existing = await prisma.offlineRepairJob.findUnique({
        where: { sourceRepairId: repairId },
        select: { id: true, jobNo: true },
      });
      return NextResponse.json({ error: "이미 수리접수로 등록된 건입니다.", offlineJob: existing }, { status: 409 });
    }
    return NextResponse.json({ error: "수리접수 등록 실패 (잠시 후 다시 시도해주세요)" }, { status: 500 });
  }
}
