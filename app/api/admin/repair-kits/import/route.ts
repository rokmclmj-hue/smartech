import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";
import { parseRepairExcel, importRepairPartsToDb } from "@/lib/repairImport";

function isAdmin(session: Session | null) {
  return (session?.user as { tier?: string })?.tier === "ADMIN";
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "파일 없음" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const sheets = parseRepairExcel(buffer);

  if (sheets.length === 0) {
    return NextResponse.json({ error: "파싱된 데이터 없음" }, { status: 400 });
  }

  const result = await importRepairPartsToDb(sheets, { upsert: true });
  return NextResponse.json({ ok: true, sheets: sheets.length, ...result });
}
