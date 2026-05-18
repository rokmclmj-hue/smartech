import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import * as XLSX from "xlsx";

async function requireAdmin() {
  const session = await auth();
  return (session?.user as any)?.tier === "ADMIN";
}

// 전화번호 정규화: 숫자만, 010xxxxxxxx 형식
function normalizePhone(raw: unknown): string | null {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length < 9) return null;
  return digits;
}

// 이메일 정규화
function normalizeEmail(raw: unknown): string | null {
  if (!raw) return null;
  const s = String(raw).trim().toLowerCase();
  return s.includes("@") ? s : null;
}

// 시트명 → 등급 매핑
const SHEET_TIER: Record<string, "DEALER" | "OEM" | "ENDUSER"> = {
  딜러: "DEALER",
  OEM: "OEM",
  oem: "OEM",
  엔드유저: "ENDUSER",
  "End User": "ENDUSER",
  enduser: "ENDUSER",
};

type ImportRow = {
  companyName: string;
  phone: string | null;
  email: string | null;
  tier: "DEALER" | "OEM" | "ENDUSER";
};

export async function POST(req: NextRequest) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof Blob))
    return NextResponse.json({ error: "파일이 없습니다" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "buffer" });
  } catch {
    return NextResponse.json({ error: "엑셀 파일을 읽을 수 없습니다" }, { status: 400 });
  }

  // 3개 시트 파싱
  const rows: ImportRow[] = [];

  for (const sheetName of workbook.SheetNames) {
    const tier = SHEET_TIER[sheetName] ?? SHEET_TIER[sheetName.trim()];
    if (!tier) continue; // 알 수 없는 시트 무시

    const sheet = workbook.Sheets[sheetName];
    const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
    });

    for (const r of raw) {
      const companyName = String(
        r["회사명"] ?? r["company"] ?? r["Company"] ?? ""
      ).trim();
      if (!companyName) continue;

      const phone = normalizePhone(r["핸드폰"] ?? r["전화"] ?? r["phone"] ?? r["Phone"]);
      const email = normalizeEmail(r["이메일"] ?? r["email"] ?? r["Email"]);

      rows.push({ companyName, phone, email, tier });
    }
  }

  if (!rows.length)
    return NextResponse.json({ error: "가져올 데이터가 없습니다" }, { status: 400 });

  // 업서트 처리
  let created = 0;
  let updated = 0;

  for (const row of rows) {
    // 전화번호로 기존 항목 검색 (가장 신뢰도 높음)
    const existing = row.phone
      ? await prisma.knownCompany.findFirst({ where: { phone: row.phone } })
      : row.email
      ? await prisma.knownCompany.findFirst({ where: { email: row.email } })
      : null;

    if (existing) {
      await prisma.knownCompany.update({
        where: { id: existing.id },
        data: {
          companyName: row.companyName,
          phone: row.phone ?? existing.phone,
          email: row.email ?? existing.email,
          tier: row.tier,
          source: "excel",
        },
      });
      updated++;
    } else {
      await prisma.knownCompany.create({
        data: {
          companyName: row.companyName,
          phone: row.phone,
          email: row.email,
          tier: row.tier,
          source: "excel",
        },
      });
      created++;
    }
  }

  return NextResponse.json({ ok: true, total: rows.length, created, updated });
}
