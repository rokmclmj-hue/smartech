const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { tier: { not: "ADMIN" } },
    select: { id: true, name: true, tier: true },
  });
  console.log("삭제 대상 유저:", users.length, "명");
  users.forEach((u) => console.log(` - [${u.tier}] ${u.name} (id:${u.id})`));

  if (users.length === 0) {
    console.log("삭제할 유저 없음");
    return;
  }

  const ids = users.map((u) => u.id);

  await prisma.auditLog.deleteMany({ where: { userId: { in: ids } } });
  console.log("AuditLog 삭제 완료");

  const quotes = await prisma.quote.findMany({
    where: { userId: { in: ids } },
    select: { id: true },
  });
  const quoteIds = quotes.map((q) => q.id);

  if (quoteIds.length > 0) {
    await prisma.order.deleteMany({ where: { quoteId: { in: quoteIds } } });
    await prisma.quoteItem.deleteMany({ where: { quoteId: { in: quoteIds } } });
    await prisma.quote.deleteMany({ where: { id: { in: quoteIds } } });
    console.log("Quote/Order 삭제 완료");
  }

  await prisma.magicLinkToken.deleteMany({});
  console.log("MagicLinkToken 삭제 완료");

  await prisma.user.deleteMany({ where: { id: { in: ids } } });
  console.log("유저 삭제 완료! 총", ids.length, "명 삭제됨");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
