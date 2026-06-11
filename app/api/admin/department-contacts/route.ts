import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

const DEPT_CODES = ["IV", "SV", "AK"] as const;

const DEFAULT_MESSAGES: Record<string, string> = {
  IV: `안녕하세요 이종원 수석님,\n\n첨부와 같이 발주서를 송부하오니 진행부탁드립니다.\n\n감사합니다.`,
  SV: `안녕하세요 현지선 수석님,\n\n첨부와 같이 발주서를 송부하오니 진행부탁드립니다.\n\n감사합니다.`,
  AK: `안녕하세요 정재희 차장님,\n\n첨부와 같이 발주서를 송부하오니 진행부탁드립니다.\n\n감사합니다.`,
};

const DEFAULT_CONTACTS: Record<string, { contactName: string; contactEmail: string; ccEmails: string | null }> = {
  IV: { contactName: "이종원 수석부장님", contactEmail: "patrick.lee@edwardsvacuum.com", ccEmails: null },
  SV: { contactName: "현지선 수석부장님", contactEmail: "Monica.hyun@edwardsvacuum.com", ccEmails: null },
  AK: { contactName: "정재희 차장님", contactEmail: "Jenny.Jung@edwardsvacuum.com", ccEmails: "anthony.kim@edwardsvacuum.com" },
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
        contactName: DEFAULT_CONTACTS[code]?.contactName ?? "",
        contactEmail: DEFAULT_CONTACTS[code]?.contactEmail ?? "",
        ccEmails: DEFAULT_CONTACTS[code]?.ccEmails ?? null,
        defaultMessage: DEFAULT_MESSAGES[code],
      })),
    });
  }

  // contactEmail이 비어있거나 이전 기본 문구인 레코드 업데이트
  const needsUpdate = existing.filter(
    (d) => !d.contactEmail || d.defaultMessage?.includes("(주)스마텍 영업팀입니다")
  );
  if (needsUpdate.length > 0) {
    await Promise.all(
      needsUpdate.map((d) =>
        prisma.departmentContact.update({
          where: { code: d.code },
          data: {
            contactName: DEFAULT_CONTACTS[d.code]?.contactName ?? d.contactName,
            contactEmail: DEFAULT_CONTACTS[d.code]?.contactEmail ?? d.contactEmail,
            ccEmails: DEFAULT_CONTACTS[d.code]?.ccEmails ?? d.ccEmails,
            defaultMessage: DEFAULT_MESSAGES[d.code] ?? d.defaultMessage,
          },
        })
      )
    );
  }

  const all = await prisma.departmentContact.findMany({ orderBy: { code: "asc" } });
  return NextResponse.json(all);
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
