import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

const ALLOWED_KEYS = [
  "contact_phone",
  "contact_fax",
  "contact_email",
  "contact_website",
  "contact_mobile",
  "notice_text",
];

// GET: 설정 값 읽기
export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: ALLOWED_KEYS } },
  });

  const result: Record<string, string> = {};
  for (const s of settings) {
    result[s.key] = s.value;
  }
  return NextResponse.json(result);
}

// POST: 설정 값 저장 (upsert)
export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const body = await req.json();

  for (const [key, value] of Object.entries(body)) {
    if (!ALLOWED_KEYS.includes(key)) continue;
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
  }

  return NextResponse.json({ ok: true });
}
