import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { put, del } from "@vercel/blob";
import { parseInspectionExcel } from "@/lib/inspectionExcelParse";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const nId = parseInt(id);
  if (isNaN(nId)) return NextResponse.json({ error: "잘못된 ID" }, { status: 400 });

  const job = await prisma.offlineRepairJob.findUnique({
    where: { id: nId },
    include: { inspectionItems: { orderBy: { sortOrder: "asc" } } },
  });
  if (!job) return NextResponse.json({ error: "수리접수 없음" }, { status: 404 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "파일 없음" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const isExcel = ["xlsx", "xls"].includes(ext);
  const isZip = ["zip", "7z"].includes(ext);

  if (!isExcel && !isZip)
    return NextResponse.json({ error: "xlsx 또는 zip/7z 파일만 업로드 가능합니다." }, { status: 400 });

  // Fix #4: Excel 중복 업로드 방지
  if (isExcel) {
    const existing = await prisma.offlineRepairFile.findFirst({ where: { jobId: nId, fileType: "EXCEL" } });
    if (existing)
      return NextResponse.json({ error: "엑셀 파일이 이미 업로드되어 있습니다. 기존 파일을 삭제한 후 재업로드해 주세요." }, { status: 409 });
  }

  const fileType = isExcel ? "EXCEL" : "PHOTO_ZIP";

  // Fix #8: arrayBuffer 먼저 읽어서 put()에 전달 (스트림 소진 방지)
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const blob = await put(`offline-repairs/${nId}/admin_${Date.now()}_${file.name}`, fileBuffer, {
    access: "private",
    contentType: file.type || "application/octet-stream",
  });

  // Fix #1: DB 저장 실패 시 Blob 정리
  let fileRecord;
  try {
    fileRecord = await prisma.offlineRepairFile.create({
      data: { jobId: nId, fileType, fileName: file.name, fileUrl: blob.url, fileSize: file.size, isSelected: true },
    });
  } catch {
    try { await del(blob.url); } catch {}
    return NextResponse.json({ error: "파일 정보 저장에 실패했습니다. 다시 시도해 주세요." }, { status: 500 });
  }

  if (!isExcel) return NextResponse.json({ ok: true, fileId: fileRecord.id });

  // Excel 파싱 → 검사성적서 자동 입력
  let parsed;
  try {
    parsed = parseInspectionExcel(fileBuffer);
  } catch {
    return NextResponse.json({ ok: false, fileId: fileRecord.id, matched: 0, warning: "엑셀 파일을 읽을 수 없습니다. 파일 형식(.xlsx/.xls)을 확인해 주세요." }, { status: 422 });
  }

  // Fix #2: 파싱 실패 시 경고 반환 (ok:false로 명확히)
  if (parsed === null)
    return NextResponse.json({ ok: false, fileId: fileRecord.id, matched: 0, warning: "검사항목 테이블을 찾을 수 없습니다. 엑셀 파일 형식을 확인해 주세요." }, { status: 422 });

  const dbByLabel = Object.fromEntries(job.inspectionItems.map(it => [it.itemLabel, it]));
  const updates = parsed
    .map(p => ({ p, dbItem: dbByLabel[p.masterLabel] }))
    .filter((x): x is { p: typeof parsed[number]; dbItem: (typeof job.inspectionItems)[number] } => !!x.dbItem);

  if (updates.length > 0) {
    await prisma.$transaction(
      updates.map(({ p, dbItem }) =>
        prisma.offlineRepairInspectionItem.update({
          where: { id: dbItem.id },
          data: { spec: p.spec, value: p.value, pass: p.pass, isNA: p.isNA },
        })
      )
    );
  }

  const matched = updates.filter(({ p }) => !p.isNA).length;
  return NextResponse.json({ ok: true, fileId: fileRecord.id, matched });
}
