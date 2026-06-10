import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

const DEPT_CODES = ["IV", "SV", "AK"] as const;

const DEFAULT_MESSAGES: Record<string, string> = {
  IV: `안녕하세요.\n(주)스마텍 영업팀입니다.\n\n아래와 같이 발주 드리오니 검토 후 납기 회신 부탁드립니다.\n\n감사합니다.`,
  SV: `안녕하세요.\n(주)스마텍 영업팀입니다.\n\n아래와 같이 발주 드리오니 검토 후 납기 회신 부탁드립니다.\n\n감사합니다.`,
  AK: `안녕하세요.\n(주)스마텍 영업팀입니다.\n\n아래와 같이 발주 드리오니 검토 후 납기 회신 부탁드립니다.\n\n감사합니다.`,
};

// GET — 전체 조회 (없으면 기본값으로 초기화)
export async function GET() {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const existing = await prisma.departmentContact.findMany({
    orderBy: { code: "asc" },
  });

  const existingCodes = existing.map((d) => d.code);
  const missing = DEPT_CODES.filter((c) => !existingCodes.includes(c));

  if (missing.length > 0) {
    await prisma.departmentContact.createMany({
      data: missing.map((code) => ({
        code,
        contactName: "",
        contactEmail: "",
        defaultMessage: DEFAULT_MESSAGES[code],
      })),
    });
    const all = await prisma.departmentContact.findMany({ orderBy: { code: "asc" } });
    return NextResponse.json(all);
  }

  return NextResponse.json(existing);
}

// PATCH — 단건 수정
export async function PATCH(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body?.code) return NextResponse.json({ error: "code 필요" }, { status: 400 });

  const updated = await prisma.departmentContact.upsert({
    where: { code: body.code },
    update: {
      ...(body.contactName !== undefined && { contactName: body.contactName }),
      ...(body.contactEmail !== undefined && { contactEmail: body.contactEmail }),
      ...(body.ccEmails !== undefined && { ccEmails: body.ccEmails || null }),
      ...(body.defaultMessage !== undefined && { defaultMessage: body.defaultMessage }),
    },
    create: {
      code: body.code,
      contactName: body.contactName ?? "",
      contactEmail: body.contactEmail ?? "",
      ccEmails: body.ccEmails || null,
      defaultMessage: body.defaultMessage ?? DEFAULT_MESSAGES[body.code] ?? "",
    },
  });

  return NextResponse.json({ ok: true, contact: updated });
}
