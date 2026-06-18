import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

// 전 모델 공통 마스터 항목 (엑셀 파싱 후 해당 항목만 isNA: false로 전환)
const DEFAULT_ITEMS = [
  { sortOrder:  0, itemLabel: "Vacuum Test (Combi)",   unit: "Torr",       spec: null, isNA: true },
  { sortOrder:  1, itemLabel: "Vacuum Test (Single)",  unit: "Torr",       spec: null, isNA: true },
  { sortOrder:  2, itemLabel: "Vacuum (Booster)",      unit: "Torr",       spec: null, isNA: true },
  { sortOrder:  3, itemLabel: "Vacuum (Scroll)",       unit: "Torr",       spec: null, isNA: true },
  { sortOrder:  4, itemLabel: "Current (Combi)",       unit: "A",          spec: null, isNA: true },
  { sortOrder:  5, itemLabel: "Current (Single)",      unit: "A",          spec: null, isNA: true },
  { sortOrder:  6, itemLabel: "Current (Booster)",     unit: "A",          spec: null, isNA: true },
  { sortOrder:  7, itemLabel: "Current (Scroll)",      unit: "A",          spec: null, isNA: true },
  { sortOrder:  8, itemLabel: "Current (Rotary)",      unit: "A",          spec: null, isNA: true },
  { sortOrder:  9, itemLabel: "Body temp",             unit: "℃",          spec: null, isNA: true },
  { sortOrder: 10, itemLabel: "Body temp (Booster)",   unit: "℃",          spec: null, isNA: true },
  { sortOrder: 11, itemLabel: "Body temp (Scroll)",    unit: "℃",          spec: null, isNA: true },
  { sortOrder: 12, itemLabel: "Body temp (Rotary)",    unit: "℃",          spec: null, isNA: true },
  { sortOrder: 13, itemLabel: "Leak (sys.mod)",        unit: "mbar·ℓ/sec", spec: null, isNA: true },
  { sortOrder: 14, itemLabel: "Oil leak",              unit: "유/무",       spec: null, isNA: true },
  { sortOrder: 15, itemLabel: "Water leak",            unit: "유/무",       spec: null, isNA: true },
  { sortOrder: 16, itemLabel: "Noise",                 unit: "유/무",       spec: null, isNA: true },
  { sortOrder: 17, itemLabel: "Function test",         unit: "정상/이상",   spec: null, isNA: true },
  { sortOrder: 18, itemLabel: "Test time",             unit: "hr",          spec: null, isNA: true },
  { sortOrder: 19, itemLabel: "Oil",                   unit: "N/A",         spec: null, isNA: true },
];

// GET — 목록
export async function GET() {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const jobs = await prisma.offlineRepairJob.findMany({
    include: {
      company: { select: { id: true, companyName: true } },
      files: { select: { id: true, fileType: true, isSelected: true } },
      inspectionItems: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(jobs);
}

// POST — 수리접수 생성
export async function POST(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body?.pumpModel?.trim())
    return NextResponse.json({ error: "펌프 모델을 입력해주세요." }, { status: 400 });

  const year = new Date().getFullYear();

  const job = await prisma.$transaction(async (tx) => {
    const created = await tx.offlineRepairJob.create({
      data: {
        jobNo: "TEMP",
        pumpMaker:    body.pumpMaker?.trim() || "EDWARDS",
        pumpModel:    body.pumpModel.trim(),
        serialNo:     body.serialNo?.trim() || null,
        voltage:      body.voltage?.trim() || null,
        repairReason: body.repairReason?.trim() || null,
        subName:      body.subName?.trim() || null,
        companyId:    body.companyId ? Number(body.companyId) : null,
        contactName:  body.contactName?.trim() || null,
        contactEmail: body.contactEmail?.trim() || null,
        contactPhone: body.contactPhone?.trim() || null,
        receivedDate: body.receivedDate ? new Date(body.receivedDate) : new Date(),
        requestedDate: body.requestedDate ? new Date(body.requestedDate) : null,
        memo:         body.memo?.trim() || null,
        inspectionItems: {
          create: DEFAULT_ITEMS,
        },
      },
    });
    const jobNo = `SMT-${year}-R-${String(created.id).padStart(6, "0")}`;
    return tx.offlineRepairJob.update({
      where: { id: created.id },
      data: { jobNo },
      include: {
        company: { select: { id: true, companyName: true } },
        inspectionItems: { orderBy: { sortOrder: "asc" } },
      },
    });
  });

  return NextResponse.json(job, { status: 201 });
}
