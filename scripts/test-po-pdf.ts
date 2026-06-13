import { PrismaClient } from "@prisma/client";
import { generateManualPurchaseOrderPdf } from "../lib/pdf";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

async function main() {
  const orders = await prisma.manualPurchaseOrder.findMany({
    orderBy: { id: "desc" },
    take: 5,
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });

  for (const order of orders) {
    console.log(`\n테스트: ID=${order.id} ${order.orderNo}`);
    try {
      const buf = await generateManualPurchaseOrderPdf({
        orderNo: order.orderNo,
        department: order.department,
        orderDate: order.orderDate,
        requestedDate: order.requestedDate,
        toCompany: order.toCompany,
        toName: order.toName,
        message: order.message,
        items: order.items.map(i => ({
          partNo: i.partNo,
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      });
      console.log(`  ✅ 성공: ${buf.length} bytes`);
    } catch(e) {
      console.error(`  ❌ 실패:`, e);
    }
  }

  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
