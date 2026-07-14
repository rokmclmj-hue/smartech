import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseInspectionExcel } from "@/lib/inspectionExcelParse";

export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "토큰 없음" }, { status: 400 });

  const job = await prisma.offlineRepairJob.findUnique({
    where: { uploadToken: token },
    include: { inspectionItems: { orderBy: { sortOrder: "asc" } } },
  });
  if (!job) return NextResponse.json({ error: "유효하지 않은 링크입니다." }, { status: 404 });
  if (!job.tokenExpiresAt || job.tokenExpiresAt < new Date())
    return NextResponse.json({ error: "링크가 만료됐습니다." }, { status: 410 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "파일 없음" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const parsed = parseInspectionExcel(buffer);
  if (parsed === null)
    return NextResponse.json({ error: "검사항목 테이블을 찾을 수 없습니다." }, { status: 422 });
  if (parsed.length === 0)
    return NextResponse.json({ error: "매핑 가능한 항목이 없습니다." }, { status: 422 });

  // DB 항목과 이름으로 매칭
  const dbByLabel = Object.fromEntries(
    job.inspectionItems.map(it => [it.itemLabel, it])
  );

  const updates = parsed
    .map(p => ({ p, dbItem: dbByLabel[p.masterLabel] }))
    .filter((x): x is { p: typeof parsed[number]; dbItem: (typeof job.inspectionItems)[number] } => !!x.dbItem);

  await prisma.$transaction(
    updates.map(({ p, dbItem }) =>
      prisma.offlineRepairInspectionItem.update({
        where: { id: dbItem.id },
        data: { spec: p.spec, value: p.value, pass: p.pass, isNA: p.isNA },
      })
    )
  );

  // 매핑되지 않은 항목은 isNA: true 유지 (이미 기본값)
  const matched = updates.filter(({ p }) => !p.isNA).length;
  return NextResponse.json({ ok: true, matched, total: updates.length });
}
