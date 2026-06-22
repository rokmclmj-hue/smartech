import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { put, del } from "@vercel/blob";

const KEYS = {
  biz: { url: "company_doc_biz_url", name: "company_doc_biz_name" },
  bank: { url: "company_doc_bank_url", name: "company_doc_bank_name" },
} as const;

type DocType = keyof typeof KEYS;

// GET — 저장된 서류 URL/파일명 반환
export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const allKeys = Object.values(KEYS).flatMap((k) => [k.url, k.name]);
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: allKeys } } });
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;

  return NextResponse.json({
    biz:  { url: map[KEYS.biz.url]  ?? null, name: map[KEYS.biz.name]  ?? null },
    bank: { url: map[KEYS.bank.url] ?? null, name: map[KEYS.bank.name] ?? null },
  });
}

// POST — 파일 업로드 → Vercel Blob 저장 → SiteSetting upsert
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const form = await req.formData();
  const type = form.get("type") as DocType | null;
  const file = form.get("file") as File | null;

  if (!type || !KEYS[type]) return NextResponse.json({ error: "type 필요 (biz | bank)" }, { status: 400 });
  if (!file) return NextResponse.json({ error: "file 필요" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "5MB 이하 파일만 가능합니다" }, { status: 400 });

  // 기존 파일 삭제
  const existing = await prisma.siteSetting.findUnique({ where: { key: KEYS[type].url } });
  if (existing?.value) {
    await del(existing.value).catch(() => null);
  }

  const blob = await put(`company-docs/${type}-${Date.now()}-${file.name}`, file, { access: "public" });

  await Promise.all([
    prisma.siteSetting.upsert({ where: { key: KEYS[type].url },  update: { value: blob.url },  create: { key: KEYS[type].url,  value: blob.url } }),
    prisma.siteSetting.upsert({ where: { key: KEYS[type].name }, update: { value: file.name }, create: { key: KEYS[type].name, value: file.name } }),
  ]);

  return NextResponse.json({ ok: true, url: blob.url, name: file.name });
}

// DELETE — 서류 삭제
export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { type } = await req.json() as { type: DocType };
  if (!type || !KEYS[type]) return NextResponse.json({ error: "type 필요" }, { status: 400 });

  const existing = await prisma.siteSetting.findUnique({ where: { key: KEYS[type].url } });
  if (existing?.value) await del(existing.value).catch(() => null);

  await Promise.all([
    prisma.siteSetting.deleteMany({ where: { key: KEYS[type].url } }),
    prisma.siteSetting.deleteMany({ where: { key: KEYS[type].name } }),
  ]);

  return NextResponse.json({ ok: true });
}
