import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";

// ──────────────────────────────────────────────
// GET /api/admin/orders
// 쿼리: status, search, page, limit
// ──────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);

  const status = searchParams.get("status") ?? "ALL";
  const search = searchParams.get("search")?.trim() ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
  const skip = (page - 1) * limit;

  // 상태 필터
  const statusFilter = status !== "ALL" ? { status } : {};

  // 검색 필터: 회사명 / 담당자 / 이메일 / 주문ID
  const searchFilter = search
    ? {
        OR: [
          { user: { company: { contains: search, mode: "insensitive" as const } } },
          { user: { name: { contains: search, mode: "insensitive" as const } } },
          { user: { email: { contains: search, mode: "insensitive" as const } } },
          { contactName: { contains: search, mode: "insensitive" as const } },
          // 주문ID 숫자 검색
          ...(isNaN(Number(search)) ? [] : [{ id: Number(search) }]),
        ],
      }
    : {};

  const where = { ...statusFilter, ...searchFilter };

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: {
          select: { name: true, company: true, email: true, phone: true },
        },
        quote: {
          select: {
            totalAmount: true,
            taxInvoiceRequested: true,
            items: { select: { unitPrice: true, quantity: true } },
          },
        },
      },
    }),
  ]);

  const items = orders.map((o) => {
    const amount =
      o.quote.totalAmount != null
        ? o.quote.totalAmount
        : o.quote.items.reduce((s, item) => s + item.unitPrice * item.quantity, 0);

    return {
      id: o.id,
      quoteId: o.quoteId,
      company: o.user.company,
      contactName: o.contactName ?? o.user.name,
      contactPhone: o.contactPhone ?? o.user.phone,
      amount,
      taxInvoiceRequested: o.quote.taxInvoiceRequested,
      deliveryIssue: o.deliveryIssue,
      status: o.status,
      confirmedAt: o.confirmedAt?.toISOString() ?? null,
      createdAt: o.createdAt.toISOString(),
      deliveryNoteIssuedAt: o.deliveryNoteIssuedAt?.toISOString() ?? null,
      deliveryNoteCount: o.deliveryNoteCount,
    };
  });

  return NextResponse.json({ items, total, page, limit });
}

// ──────────────────────────────────────────────
// PATCH /api/admin/orders
// Body: { orderId: number; action: "confirm" | "cancel" | "taxInvoiceDone" }
// ──────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const body = await req.json();
  const { orderId, action } = body as { orderId: number; action: string };

  if (!orderId || !action) {
    return NextResponse.json({ error: "orderId와 action이 필요합니다" }, { status: 400 });
  }

  const validActions = ["confirm", "cancel", "taxInvoiceDone"];
  if (!validActions.includes(action)) {
    return NextResponse.json({ error: "유효하지 않은 action" }, { status: 400 });
  }

  // ── confirm ────────────────────────────────
  if (action === "confirm") {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1. 주문 + 아이템 조회
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: {
            quote: {
              include: {
                items: {
                  include: { product: true },
                },
              },
            },
          },
        });

        if (!order) {
          throw Object.assign(new Error("주문을 찾을 수 없습니다"), { code: "NOT_FOUND" });
        }

        // 2. 상태 체크 (이미 처리된 주문)
        if (order.status !== "PENDING") {
          throw Object.assign(
            new Error("이미 처리된 주문입니다"),
            { code: "CONFLICT", currentStatus: order.status }
          );
        }

        // 3. 재고 충분 여부 체크
        for (const item of order.quote.items) {
          if (item.product.stock < item.quantity) {
            throw Object.assign(
              new Error("재고 부족"),
              {
                code: "STOCK_SHORT",
                partNo: item.product.partNo,
                requested: item.quantity,
                available: item.product.stock,
              }
            );
          }
        }

        // 4. 재고 차감
        for (const item of order.quote.items) {
          await tx.product.update({
            where: { id: item.product.id },
            data: { stock: { decrement: item.quantity } },
          });
        }

        // 5. 주문 상태 변경 (race condition 방지: updateMany + status 조건)
        const updated = await tx.order.updateMany({
          where: { id: orderId, status: "PENDING" },
          data: { status: "CONFIRMED", confirmedAt: new Date() },
        });

        if (updated.count === 0) {
          throw Object.assign(
            new Error("이미 처리된 주문입니다"),
            { code: "CONFLICT", currentStatus: "UNKNOWN" }
          );
        }

        return {
          orderId,
          items: order.quote.items.map((i) => ({
            partNo: i.product.partNo,
            qty: i.quantity,
          })),
        };
      });

      // 감사 로그
      await logAudit({
        userId: admin.userId,
        action: "order.confirm",
        target: "order",
        targetId: orderId,
        payload: { items: result.items },
      });

      return NextResponse.json({ ok: true, orderId, status: "CONFIRMED" });
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      if (e.code === "CONFLICT") {
        return NextResponse.json(
          { error: String(e.message), currentStatus: e.currentStatus },
          { status: 409 }
        );
      }
      if (e.code === "STOCK_SHORT") {
        return NextResponse.json(
          {
            error: String(e.message),
            partNo: e.partNo,
            requested: e.requested,
            available: e.available,
          },
          { status: 400 }
        );
      }
      if (e.code === "NOT_FOUND") {
        return NextResponse.json({ error: String(e.message) }, { status: 404 });
      }
      console.error("[order.confirm error]", err);
      return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
  }

  // ── cancel ─────────────────────────────────
  if (action === "cancel") {
    const updated = await prisma.order.updateMany({
      where: { id: orderId, status: { in: ["PENDING", "DELIVERY_INQUIRY"] } },
      data: { status: "CANCELLED" },
    });

    if (updated.count === 0) {
      const current = await prisma.order.findUnique({
        where: { id: orderId },
        select: { status: true },
      });
      return NextResponse.json(
        {
          error: "이미 처리된 주문입니다",
          currentStatus: current?.status ?? null,
        },
        { status: 409 }
      );
    }

    await logAudit({
      userId: admin.userId,
      action: "order.cancel",
      target: "order",
      targetId: orderId,
    });

    return NextResponse.json({ ok: true, orderId, status: "CANCELLED" });
  }

  // ── taxInvoiceDone ─────────────────────────
  if (action === "taxInvoiceDone") {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { quoteId: true },
    });

    if (!order) {
      return NextResponse.json({ error: "주문을 찾을 수 없습니다" }, { status: 404 });
    }

    await prisma.quote.update({
      where: { id: order.quoteId },
      data: { taxInvoiceRequested: false },
    });

    await logAudit({
      userId: admin.userId,
      action: "order.tax_invoice_done",
      target: "order",
      targetId: orderId,
    });

    return NextResponse.json({ ok: true, orderId, status: "TAX_INVOICE_DONE" });
  }

  return NextResponse.json({ error: "처리 실패" }, { status: 500 });
}
