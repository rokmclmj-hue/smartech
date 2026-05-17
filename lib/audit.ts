import { prisma } from "./db";

export type AuditAction =
  | "quote.send"
  | "quote.duplicate"
  | "quote.delete"
  | "quote.update"
  | "quote.cancel"
  | "order.confirm"
  | "order.cancel"
  | "order.tax_invoice_done"
  | "order.delivery_pdf"
  | "user.approve"
  | "user.reject"
  | "user.tier_change"
  | "user.delete"
  | "product.create"
  | "product.update"
  | "product.stock_change"
  | "price_rule.update";

export interface AuditEntry {
  userId: number;
  action: AuditAction;
  target: string;
  targetId?: number | null;
  payload?: Record<string, unknown>;
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        target: entry.target,
        targetId: entry.targetId ?? null,
        payload: (entry.payload as any) ?? undefined,
      },
    });
  } catch (e) {
    console.error("[audit log failed]", entry.action, e);
  }
}
