import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as XLSX from "xlsx";

// POST — 협력사 엑셀 성적서 파싱 → 검사항목 자동 저장
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
  const wb = XLSX.read(buffer, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<(string | number)[]>(ws, { header: 1, defval: "" });

  // 검사항목 테이블 시작 행 탐색 (순번 1이 있는 행)
  let startRow = -1;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === 1) { startRow = i; break; }
  }
  if (startRow < 0) return NextResponse.json({ error: "검사항목 테이블을 찾을 수 없습니다." }, { status: 422 });

  // 항목 파싱: 순번 있는 행만 추출
  const parsed: { seq: number; label: string; unit: string; spec: string; value: string; pass: string }[] = [];
  for (let i = startRow; i < rows.length; i++) {
    const row = rows[i];
    const seq = row[0];
    if (typeof seq !== "number" || seq < 1) continue;
    parsed.push({
      seq,
      label: String(row[1] ?? "").trim(),
      unit:  String(row[3] ?? "").trim(),
      spec:  String(row[5] ?? "").trim(),
      value: String(row[8] ?? "").trim(),
      pass:  String(row[11] ?? "").trim(),
    });
  }

  if (parsed.length === 0)
    return NextResponse.json({ error: "파싱된 항목이 없습니다." }, { status: 422 });

  // DB 검사항목과 sortOrder 순서로 매핑
  const dbItems = job.inspectionItems;
  const updates: { id: number; value: string; pass: boolean | null; isNA: boolean }[] = [];

  for (let i = 0; i < dbItems.length; i++) {
    const parsed_item = parsed[i];
    if (!parsed_item) continue;
    const rawVal = parsed_item.value;
    const rawPass = parsed_item.pass.toUpperCase();
    const isNA = rawVal === "." || rawVal === "" || rawVal === "N/A";
    const pass = rawPass === "OK" || rawPass === "PASS" ? true
               : rawPass === "NG" || rawPass === "FAIL" ? false
               : null;
    updates.push({ id: dbItems[i].id, value: isNA ? "" : rawVal, pass, isNA });
  }

  await Promise.all(
    updates.map(u =>
      prisma.offlineRepairInspectionItem.update({
        where: { id: u.id },
        data: { value: u.value, pass: u.pass, isNA: u.isNA },
      })
    )
  );

  return NextResponse.json({ ok: true, count: updates.length, parsed });
}
