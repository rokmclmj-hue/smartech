import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { resolveCompanyId } from "@/lib/known-company";
import { DEFAULT_ITEMS } from "@/lib/offline-repair-defaults";

// GET — 목록
export async function GET() {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const jobs = await prisma.offlineRepairJob.findMany({
    include: {
      company: { include: { contacts: true } },
      files: { select: { id: true, fileType: true, isSelected: true } },
      inspectionItems: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(jobs);
}

// POST — 수리접수 생성 (단건 또는 items 배열로 다건)
export async function POST(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const body = await req.json().catch(() => null);

  // items 배열이 있으면 다건, 없으면 단건을 배열로 래핑
  type RawItem = { pumpMaker?: string; pumpModel?: string; serialNo?: string; voltage?: string; repairReason?: string };
  const rawItems: RawItem[] = body?.items ?? [{ pumpMaker: body?.pumpMaker, pumpModel: body?.pumpModel, serialNo: body?.serialNo, voltage: body?.voltage, repairReason: body?.repairReason }];

  if (!rawItems.length || rawItems.some(it => !it.pumpModel?.trim()))
    return NextResponse.json({ error: "펌프 모델을 입력해주세요." }, { status: 400 });

  const year = new Date().getFullYear();
  const createdIds: number[] = [];

  try {
    await prisma.$transaction(async (tx) => {
      // 같은 트랜잭션 안에서 거래처를 찾거나 만든다 — 이후 단계가 실패하면 거래처 생성도 함께 롤백된다.
      const companyId = await resolveCompanyId(body.companyId, body.companyName, tx);
      for (const item of rawItems) {
        const created = await tx.offlineRepairJob.create({
          data: {
            jobNo: "TEMP",
            pumpMaker:    item.pumpMaker?.trim() || "EDWARDS",
            pumpModel:    item.pumpModel!.trim(),
            serialNo:     item.serialNo?.trim() || null,
            voltage:      item.voltage?.trim() || null,
            repairReason: item.repairReason?.trim() || null,
            subName:      body.subName?.trim() || null,
            subEmail:     body.subEmail?.trim() || null,
            companyId,
            contactName:  body.contactName?.trim() || null,
            contactEmail: body.contactEmail?.trim() || null,
            contactPhone: body.contactPhone?.trim() || null,
            receivedDate: body.receivedDate ? new Date(body.receivedDate) : new Date(),
            requestedDate: body.requestedDate ? new Date(body.requestedDate) : null,
            memo:         body.memo?.trim() || null,
            inspectionItems: { create: DEFAULT_ITEMS },
          },
        });
        const jobNo = `SMT-${year}-R-${String(created.id).padStart(6, "0")}`;
        await tx.offlineRepairJob.update({ where: { id: created.id }, data: { jobNo } });
        createdIds.push(created.id);
      }
    });
  } catch {
    return NextResponse.json({ error: "수리접수 저장 실패 (잠시 후 다시 시도해주세요)" }, { status: 500 });
  }

  return NextResponse.json({ id: createdIds[0], ids: createdIds }, { status: 201 });
}
