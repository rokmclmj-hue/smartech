import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

async function main() {
  const orders = await prisma.manualPurchaseOrder.findMany({
    orderBy: { id: "desc" },
    take: 10,
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });

  orders.forEach(order => {
    console.log(`\n=== ID:${order.id} ${order.orderNo} (${order.department}) status=${order.status} ===`);
    console.log(`  orderDate: ${order.orderDate} (type: ${typeof order.orderDate})`);
    console.log(`  toCompany: ${order.toCompany}`);
    console.log(`  items: ${order.items.length}개`);
    order.items.forEach((i, idx) => {
      console.log(`  [${idx}] partNo="${i.partNo}" desc="${i.description.slice(0, 30)}" qty=${i.quantity}(${typeof i.quantity}) price=${i.unitPrice}(${typeof i.unitPrice})`);
    });
  });

  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
