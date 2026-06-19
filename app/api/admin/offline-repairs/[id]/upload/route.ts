import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { put, del } from "@vercel/blob";
import * as XLSX from "xlsx";

const LABEL_MAP: Record<string, string> = {
  "Vacuum Test(Combi)":  "Vacuum Test (Combi)",
  "Vacuum Test(Single)": "Vacuum Test (Single)",
  "Vacuum (Booster)":    "Vacuum (Booster)",
  "Vacuum (Scroll)":     "Vacuum (Scroll)",
  "Current (Combi)":     "Current (Combi)",
  "Current (Single)":    "Current (Single)",
  "Current (Booster)":   "Current (Booster)",
  "Current (Scroll)":    "Current (Scroll)",
  "Current (Rotary)":    "Current (Rotary)",
  "Current (BP)":        "Current (Booster)",
  "Current (RP)":        "Current (Rotary)",
  "Body temp":           "Body temp",
  "Body temp (Booster)": "Body temp (Booster)",
  "Body temp (Scroll)":  "Body temp (Scroll)",
  "Body temp (Rotary)":  "Body temp (Rotary)",
  "Body temp (RP)":      "Body temp (Rotary)",
  "Leak (sys.mod)":      "Leak (sys.mod)",
  "Oil leak":            "Oil leak",
  "Water leak":          "Water leak",
  "Noise":               "Noise",
  "Function test":       "Function test",
  "Test time":           "Test time",
  "Oil":                 "Oil",
  "Oil ":                "Oil",
};

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
    access: "public",
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
  const wb = XLSX.read(fileBuffer, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<(string | number)[]>(ws, { header: 1, defval: "" });

  let startRow = -1;
  let o = 0;
  for (let i = 0; i < rows.length; i++) {
    if (Number(rows[i][0]) === 1) { startRow = i; o = 0; break; }
    if (Number(rows[i][1]) === 1) { startRow = i; o = 1; break; }
  }

  // Fix #2: 파싱 실패 시 경고 반환 (ok:false로 명확히)
  if (startRow < 0)
    return NextResponse.json({ ok: false, fileId: fileRecord.id, matched: 0, warning: "검사항목 테이블을 찾을 수 없습니다. 엑셀 파일 형식을 확인해 주세요." }, { status: 422 });

  const dbByLabel = Object.fromEntries(job.inspectionItems.map(it => [it.itemLabel, it]));
  const updates: { id: number; spec: string | null; value: string; pass: boolean | null; isNA: boolean }[] = [];

  for (let i = startRow; i < rows.length; i++) {
    const row = rows[i];
    if (!Number.isFinite(Number(row[o])) || Number(row[o]) < 1) continue;

    const excelLabel = String(row[o + 1] ?? "").trim();
    const masterLabel = LABEL_MAP[excelLabel];
    if (!masterLabel) continue;

    const dbItem = dbByLabel[masterLabel];
    if (!dbItem) continue;

    const spec     = String(row[o + 5] ?? "").trim();
    const rawValue = String(row[o + 8] ?? "").trim();
    const rawPass  = String(row[o + 11] ?? "").trim().toUpperCase();

    const isDot = rawValue === "." || rawValue === "";
    const isNA  = isDot && (rawPass === "." || rawPass === "");
    const pass  = rawPass === "OK" || rawPass === "PASS" ? true
                : rawPass === "NG" || rawPass === "FAIL" ? false
                : null;

    updates.push({ id: dbItem.id, spec: spec || null, value: isDot ? "" : rawValue, pass: isNA ? null : pass, isNA });
  }

  if (updates.length > 0) {
    await prisma.$transaction(
      updates.map(u =>
        prisma.offlineRepairInspectionItem.update({
          where: { id: u.id },
          data: { spec: u.spec, value: u.value, pass: u.pass, isNA: u.isNA },
        })
      )
    );
  }

  const matched = updates.filter(u => !u.isNA).length;
  return NextResponse.json({ ok: true, fileId: fileRecord.id, matched });
}
