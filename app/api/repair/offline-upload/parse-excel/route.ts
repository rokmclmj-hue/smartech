import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as XLSX from "xlsx";

// 엑셀 라벨 → 마스터 항목명 매핑
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
  "Current (BP)":        "Current (Booster)",   // E2M275+EH2600 별칭
  "Current (RP)":        "Current (Rotary)",    // E2M275+EH2600 별칭
  "Body temp":           "Body temp",
  "Body temp (Booster)": "Body temp (Booster)",
  "Body temp (Scroll)":  "Body temp (Scroll)",
  "Body temp (Rotary)":  "Body temp (Rotary)",
  "Body temp (RP)":      "Body temp (Rotary)",  // E2M275+EH2600 별칭
  "Leak (sys.mod)":      "Leak (sys.mod)",
  "Oil leak":            "Oil leak",
  "Water leak":          "Water leak",
  "Noise":               "Noise",
  "Function test":       "Function test",
  "Test time":           "Test time",
  "Oil":                 "Oil",
  "Oil ":                "Oil",                 // 공백 포함 버전
};

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

  // 열 오프셋 자동 감지 (숫자·텍스트 혼용 대응: Number() 변환 사용)
  let startRow = -1;
  let o = 0;
  for (let i = 0; i < rows.length; i++) {
    if (Number(rows[i][0]) === 1) { startRow = i; o = 0; break; }
    if (Number(rows[i][1]) === 1) { startRow = i; o = 1; break; }
  }
  if (startRow < 0)
    return NextResponse.json({ error: "검사항목 테이블을 찾을 수 없습니다." }, { status: 422 });

  // 엑셀 항목 파싱 (이름 기반)
  const parsed: { masterLabel: string; spec: string; value: string; rawPass: string }[] = [];
  for (let i = startRow; i < rows.length; i++) {
    const row = rows[i];
    const seq = Number(row[o]);
    if (!Number.isFinite(seq) || seq < 1) continue;

    const excelLabel = String(row[o + 1] ?? "").trim();
    const masterLabel = LABEL_MAP[excelLabel];
    if (!masterLabel) continue; // 매핑 없는 항목 무시

    parsed.push({
      masterLabel,
      spec:     String(row[o + 5] ?? "").trim(),
      value:    String(row[o + 8] ?? "").trim(),
      rawPass:  String(row[o + 11] ?? "").trim().toUpperCase(),
    });
  }

  if (parsed.length === 0)
    return NextResponse.json({ error: "매핑 가능한 항목이 없습니다." }, { status: 422 });

  // DB 항목과 이름으로 매칭
  const dbByLabel = Object.fromEntries(
    job.inspectionItems.map(it => [it.itemLabel, it])
  );

  const updates: { id: number; spec: string | null; value: string; pass: boolean | null; isNA: boolean }[] = [];
  for (const p of parsed) {
    const dbItem = dbByLabel[p.masterLabel];
    if (!dbItem) continue;

    const isDot = p.value === "." || p.value === "";
    const isNA = isDot && (p.rawPass === "." || p.rawPass === "");
    const pass = p.rawPass === "OK" || p.rawPass === "PASS" ? true
               : p.rawPass === "NG" || p.rawPass === "FAIL" ? false
               : null;

    updates.push({
      id:    dbItem.id,
      spec:  p.spec || null,
      value: isDot ? "" : p.value,
      pass:  isNA ? null : pass,
      isNA,
    });
  }

  await prisma.$transaction(
    updates.map(u =>
      prisma.offlineRepairInspectionItem.update({
        where: { id: u.id },
        data: { spec: u.spec, value: u.value, pass: u.pass, isNA: u.isNA },
      })
    )
  );

  // 매핑되지 않은 항목은 isNA: true 유지 (이미 기본값)
  const matched = updates.filter(u => !u.isNA).length;
  return NextResponse.json({ ok: true, matched, total: updates.length });
}
