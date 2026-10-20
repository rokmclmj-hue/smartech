// 재고 장부 하나로 맞추기 (2026-10-20 대표님 승인)
// 기준: Product.stock(홈페이지 재고 표시·구글 재고). 같은 파트번호의 InventoryItem.currentStock(재고 관리·발주 대기함)을
// 어느 쪽에서 고치든 같은 숫자로 맞춘다. 두 표는 partNo(둘 다 unique)로만 연결 — 한쪽에만 있는 품목은 그대로.
import type { Prisma } from "@prisma/client";

type Db = Prisma.TransactionClient;

/** 제품 재고 차감(발주 확정) + 재고 관리 숫자도 같은 값으로 */
export async function decrementProductStock(tx: Db, productId: number, quantity: number) {
  const p = await tx.product.update({
    where: { id: productId },
    data: { stock: { decrement: quantity } },
    select: { partNo: true, stock: true },
  });
  await tx.inventoryItem.updateMany({ where: { partNo: p.partNo }, data: { currentStock: p.stock } });
}

/** 제품 화면에서 재고를 고쳤을 때 → 재고 관리 숫자도 */
export async function syncInventoryStock(tx: Db, partNo: string, stock: number) {
  await tx.inventoryItem.updateMany({ where: { partNo }, data: { currentStock: stock } });
}

/** 재고 관리 화면에서 재고를 고쳤을 때 → 제품(홈페이지) 숫자도 */
export async function syncProductStock(tx: Db, partNo: string, stock: number) {
  await tx.product.updateMany({ where: { partNo }, data: { stock } });
}
