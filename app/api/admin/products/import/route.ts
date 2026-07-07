import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import * as XLSX from "xlsx";

async function requireAdmin() {
  const session = await auth();
  return (session?.user as { tier?: string })?.tier === "ADMIN";
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "파일이 없습니다" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "buffer" });
  } catch {
    return NextResponse.json({ error: "엑셀 파일을 읽을 수 없습니다" }, { status: 400 });
  }

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

  if (!rows.length) {
    return NextResponse.json({ error: "데이터가 없습니다" }, { status: 400 });
  }

  // 1단계: 엑셀 파싱 — 유효한 행만 추림
  const validRows: { partNo: string; costPrice: number }[] = [];
  let skipped = 0;

  for (const row of rows) {
    const partNo = String(
      row["partNo"] ?? row["코드번호"] ?? row["code"] ??
      row["Part No"] ?? row["Part NO"] ?? row["PartNo"] ?? ""
    );

    if (!partNo.trim()) { skipped++; continue; }

    const costPriceRaw =
      row["costPrice"] ?? row["원가"] ?? row["cost"] ??
      row["Cost Price"] ?? row["Price"] ?? row["price"] ?? null;

    const costPrice = parseFloat(String(costPriceRaw));
    if (isNaN(costPrice) || costPrice < 0) { skipped++; continue; }

    validRows.push({ partNo: partNo.trim(), costPrice });
  }

  if (validRows.length === 0) {
    return NextResponse.json({ ok: true, total: rows.length, updated: 0, skipped, errors: [] });
  }

  // 2단계: DB에 있는 파트번호만 한 번에 조회 (N+1 방지)
  const partNos = validRows.map((r) => r.partNo);
  const existing = await prisma.product.findMany({
    where: { partNo: { in: partNos } },
    select: { partNo: true },
  });
  const existingSet = new Set(existing.map((p) => p.partNo));

  // 3단계: 존재하는 제품만 업데이트 (배치 처리, 50개씩)
  const toUpdate = validRows.filter((r) => existingSet.has(r.partNo));
  skipped += validRows.length - toUpdate.length;

  const BATCH = 50;
  let updated = 0;
  for (let i = 0; i < toUpdate.length; i += BATCH) {
    const batch = toUpdate.slice(i, i + BATCH);
    await Promise.all(
      batch.map((r) =>
        prisma.product.update({ where: { partNo: r.partNo }, data: { costPrice: r.costPrice } })
      )
    );
    updated += batch.length;
  }

  return NextResponse.json({ ok: true, total: rows.length, updated, skipped, errors: [] });
}
