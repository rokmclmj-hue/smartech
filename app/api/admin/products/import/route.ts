import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import * as XLSX from "xlsx";

async function requireAdmin() {
  const session = await auth();
  return (session?.user as any)?.tier === "ADMIN";
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

  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    // 코드번호 컬럼 (partNo, 코드번호, code, Part No 등 허용)
    const partNo =
      (row["partNo"] ?? row["코드번호"] ?? row["code"] ?? row["Part No"] ?? row["PartNo"] ?? "") as string;
    const costPriceRaw =
      row["costPrice"] ?? row["원가"] ?? row["cost"] ?? row["Cost Price"] ?? null;

    if (!partNo) {
      skipped++;
      continue;
    }

    const costPrice = parseFloat(String(costPriceRaw));
    if (isNaN(costPrice) || costPrice < 0) {
      errors.push(`파트번호 ${partNo}: 원가 값이 올바르지 않습니다`);
      skipped++;
      continue;
    }

    const existing = await prisma.product.findUnique({ where: { partNo } });
    if (!existing) {
      skipped++;
      continue;
    }

    await prisma.product.update({
      where: { partNo },
      data: { costPrice },
    });
    updated++;
  }

  return NextResponse.json({
    ok: true,
    total: rows.length,
    updated,
    skipped,
    errors: errors.slice(0, 20),
  });
}
