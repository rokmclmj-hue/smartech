import { prisma } from "@/lib/db";

// companyId가 있으면 그대로 사용, 없고 companyName(검색창에 입력한 텍스트)이 있으면
// 기존 거래처를 찾아 연결하거나 없으면 새로 등록한다. 둘 다 없으면 연결 해제(null).
export async function resolveCompanyId(companyId: unknown, companyName: unknown): Promise<number | null> {
  if (companyId) return Number(companyId);

  const name = typeof companyName === "string" ? companyName.trim() : "";
  if (!name) return null;

  const existing = await prisma.knownCompany.findFirst({ where: { companyName: name } });
  if (existing) return existing.id;

  const created = await prisma.knownCompany.create({
    data: { companyName: name, tier: "ENDUSER", source: "manual" },
  });
  return created.id;
}
