import { prisma } from "@/lib/db";
import type { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

// companyId가 있으면 그대로 사용, 없고 companyName(검색창에 입력한 텍스트)이 있으면
// 기존 거래처를 찾아 연결하거나 없으면 새로 등록한다. 둘 다 없으면 연결 해제(null).
// db에 트랜잭션 클라이언트를 넘기면 호출자의 트랜잭션 안에서 실행되어,
// 이후 단계가 실패해도 새로 만든 거래처가 롤백된다. 넘기지 않으면 자체 트랜잭션으로 감싼다.
export async function resolveCompanyId(
  companyId: unknown,
  companyName: unknown,
  db: DbClient = prisma
): Promise<number | null> {
  if (companyId) return Number(companyId);

  const name = typeof companyName === "string" ? companyName.trim() : "";
  if (!name) return null;

  const find = async (client: DbClient) => {
    const existing = await client.knownCompany.findFirst({
      where: { companyName: { equals: name, mode: "insensitive" } },
    });
    if (existing) return existing.id;

    const created = await client.knownCompany.create({
      data: { companyName: name, tier: "ENDUSER", source: "manual" },
    });
    return created.id;
  };

  // 이미 트랜잭션 클라이언트를 받았다면 그대로 사용, 아니면 새로 트랜잭션을 연다.
  if (db !== prisma) return find(db);
  return prisma.$transaction((tx) => find(tx));
}
