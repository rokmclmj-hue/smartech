import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { resolveCompanyId } from "@/lib/known-company";

// 보고서 생성 시 자동으로 채워지는 "예상수리내용" 체크리스트 6단계 (관리자가 자유롭게 추가·삭제 가능)
const DEFAULT_CHECKLIST = [
  "Analysis test",
  "Acc'y & Module disassembly",
  "Cleaning & Leveling",
  "Parts inspection & New parts change",
  "Module & Function test",
  "Final visual inspection",
];

// GET — 목록
export async function GET() {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const reports = await prisma.repairReport.findMany({
    include: {
      company: true,
      photos: { orderBy: { sortOrder: "asc" } },
      items: { orderBy: [{ section: "asc" }, { sortOrder: "asc" }] },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reports);
}

// POST — 보고서 생성
export async function POST(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body?.pumpModel?.trim())
    return NextResponse.json({ error: "펌프 모델을 입력해주세요." }, { status: 400 });

  const year = new Date().getFullYear();

  let createdId: number;
  try {
    createdId = await prisma.$transaction(async (tx) => {
      const companyId = await resolveCompanyId(body.companyId, body.companyName, tx);

      const created = await tx.repairReport.create({
        data: {
          reportNo: "TEMP",
          companyId,
          pumpModel: body.pumpModel.trim(),
          pumpSerial: body.pumpSerial?.trim() || null,
          pumpLocation: body.pumpLocation?.trim() || null,
          pumpAssetNo: body.pumpAssetNo?.trim() || null,
          symptomText: body.symptomText?.trim() || null,
          reasonText: body.reasonText?.trim() || null,
          subName: body.subName?.trim() || null,
          subEmail: body.subEmail?.trim() || null,
          receivedDate: body.receivedDate ? new Date(body.receivedDate) : new Date(),
          items: {
            create: DEFAULT_CHECKLIST.map((label, i) => ({
              section: "CHECKLIST",
              sortOrder: i,
              label,
            })),
          },
        },
      });

      const reportNo = `TEMC-${year}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${String(created.id).padStart(4, "0")}`;
      await tx.repairReport.update({ where: { id: created.id }, data: { reportNo } });
      return created.id;
    });
  } catch {
    return NextResponse.json({ error: "보고서 저장 실패 (잠시 후 다시 시도해주세요)" }, { status: 500 });
  }

  return NextResponse.json({ id: createdId }, { status: 201 });
}
