import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import * as XLSX from "xlsx";

async function requireAdmin() {
  const session = await auth();
  return (session?.user as { tier?: string } | undefined)?.tier === "ADMIN";
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
  contactName: string | null;
  contactTitle: string | null;
  contactTel: string | null;
  contactMobile: string | null;
  contactEmail: string | null;
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

      // 회사 전화: 별도 전화 컬럼이 있으면 우선, 없으면 핸드폰을 회사전화로 사용
      const phone = normalizePhone(r["전화"] ?? r["phone"] ?? r["Phone"] ?? r["핸드폰"]);
      const email = normalizeEmail(r["이메일"] ?? r["email"] ?? r["Email"]);

      const contactName = String(r["담당자"] ?? r["담당자명"] ?? r["성명"] ?? "").trim() || null;
      // 직책/직급/직위/직함 모두 인식
      const contactTitle = String(r["직책"] ?? r["직급"] ?? r["직위"] ?? r["직함"] ?? "").trim() || null;
      const contactTel = normalizePhone(r["직통"] ?? r["직통전화"] ?? r["내선"]);
      // 담당자 모바일: 전용 컬럼 없으면 핸드폰 컬럼 사용
      const contactMobile = normalizePhone(r["담당자핸드폰"] ?? r["담당자휴대폰"] ?? r["모바일"] ?? r["핸드폰"]);
      // 담당자 이메일: 전용 컬럼 없으면 이메일 컬럼 사용
      const contactEmail = normalizeEmail(r["담당자이메일"] ?? r["담당이메일"] ?? r["이메일"] ?? r["email"] ?? r["Email"]);

      rows.push({ companyName, phone, email, tier, contactName, contactTitle, contactTel, contactMobile, contactEmail });
    }
  }

  if (!rows.length)
    return NextResponse.json({ error: "가져올 데이터가 없습니다" }, { status: 400 });

  // 업서트 처리
  let created = 0;
  let updated = 0;

  // 같은 임포트 내 회사명 → id 캐시 (같은 회사 여러 행 처리용)
  const companyCache = new Map<string, number>();

  for (const row of rows) {
    // 회사명으로 먼저 찾기 (동일 회사에 담당자 여러 명인 경우 대비)
    const existing =
      companyCache.has(row.companyName)
        ? await prisma.knownCompany.findFirst({ where: { id: companyCache.get(row.companyName) } })
        : await prisma.knownCompany.findFirst({ where: { companyName: row.companyName } })
          ?? (row.phone ? await prisma.knownCompany.findFirst({ where: { phone: row.phone } }) : null)
          ?? (row.email ? await prisma.knownCompany.findFirst({ where: { email: row.email } }) : null);

    let companyId: number;

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
      companyId = existing.id;
      companyCache.set(row.companyName, companyId);
      updated++;
    } else {
      const created_ = await prisma.knownCompany.create({
        data: {
          companyName: row.companyName,
          phone: row.phone,
          email: row.email,
          tier: row.tier,
          source: "excel",
        },
      });
      companyId = created_.id;
      companyCache.set(row.companyName, companyId);
      created++;
    }

    // 담당자 정보가 있으면 upsert (이름 기준 중복 방지)
    if (row.contactName) {
      const existingContact = await prisma.knownContact.findFirst({
        where: { companyId, name: row.contactName },
      });
      if (existingContact) {
        await prisma.knownContact.update({
          where: { id: existingContact.id },
          data: {
            title: row.contactTitle ?? existingContact.title,
            tel: row.contactTel ?? existingContact.tel,
            mobile: row.contactMobile ?? existingContact.mobile,
            email: row.contactEmail ?? existingContact.email,
          },
        });
      } else {
        await prisma.knownContact.create({
          data: {
            companyId,
            name: row.contactName,
            title: row.contactTitle,
            tel: row.contactTel,
            mobile: row.contactMobile,
            email: row.contactEmail,
          },
        });
      }
    }
  }

  return NextResponse.json({ ok: true, total: rows.length, created, updated });
}
