import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

type LineInput = {
  productId: number | null;
  quantity: number;
  unitPrice: number;
  leadTime?: string;
  customPartNo?: string;
  customDescription?: string;
};

type GuestInput = {
  name: string;
  company: string;
  email: string;
  phone?: string;
  title?: string;
  tier: string;
};

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "요청 형식이 잘못되었습니다." }, { status: 400 });
  }

  const items = body.items as LineInput[] | undefined;
  const note = typeof body.note === "string" ? body.note : null;
  const taxInvoiceRequested = Boolean(body.taxInvoiceRequested);
  const paymentTerm = typeof body.paymentTerm === "string" ? body.paymentTerm : null;

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "품목이 없습니다." }, { status: 400 });
  }

  // 품목 유효성 검증
  const registeredIds = items
    .map((i) => (i.productId != null ? Number(i.productId) : null))
    .filter((n): n is number => n !== null && Number.isFinite(n));

  const products = await prisma.product.findMany({
    where: { id: { in: registeredIds } },
    select: { id: true },
  });
  const validIds = new Set(products.map((p) => p.id));

  const itemData: {
    productId?: number;
    quantity: number;
    unitPrice: number;
    leadTime?: string | null;
    customPartNo?: string;
    customDescription?: string;
  }[] = [];

  for (const i of items) {
    const qty = Number(i.quantity);
    const price = Number(i.unitPrice);
    if (!Number.isFinite(qty) || qty < 1)
      return NextResponse.json({ error: "수량이 올바르지 않습니다." }, { status: 400 });
    if (!Number.isFinite(price) || price < 0)
      return NextResponse.json({ error: "단가가 올바르지 않습니다." }, { status: 400 });

    const leadTime = i.leadTime?.trim() || null;
    if (i.productId != null) {
      const pid = Number(i.productId);
      if (!validIds.has(pid))
        return NextResponse.json({ error: `제품 ID ${pid}를 찾을 수 없습니다.` }, { status: 400 });
      itemData.push({
        productId: pid, quantity: qty, unitPrice: price, leadTime,
        customPartNo: i.customPartNo ?? undefined,
        customDescription: i.customDescription ?? undefined,
      });
    } else {
      itemData.push({
        quantity: qty, unitPrice: price, leadTime,
        customPartNo: i.customPartNo ?? "",
        customDescription: i.customDescription ?? "",
      });
    }
  }

  const totalAmount = itemData.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);

  // ── 등록 고객 모드 ──────────────────────────────────────
  if (body.customerId) {
    const customerId = Number(body.customerId);
    if (!Number.isFinite(customerId) || customerId <= 0) {
      return NextResponse.json({ error: "고객을 선택해주세요." }, { status: 400 });
    }
    const customer = await prisma.user.findUnique({ where: { id: customerId } });
    if (!customer) {
      return NextResponse.json({ error: "고객을 찾을 수 없습니다." }, { status: 404 });
    }

    const quote = await prisma.quote.create({
      data: {
        userId: customer.id,
        createdByAdminId: admin.userId,
        status: "SENT",
        note,
        taxInvoiceRequested,
        paymentTerm,
        totalAmount,
        expiresAt,
        items: { create: itemData },
      },
    });
    return NextResponse.json({ quoteId: quote.id });
  }

  // ── 직접 입력(비회원) 모드 ─────────────────────────────
  if (body.guest) {
    const g = body.guest as GuestInput;
    if (!g.name?.trim() || !g.company?.trim()) {
      return NextResponse.json({ error: "상호와 담당자 이름을 입력해주세요." }, { status: 400 });
    }

    const quote = await prisma.quote.create({
      data: {
        createdByAdminId: admin.userId,
        status: "SENT",
        note,
        taxInvoiceRequested,
        paymentTerm,
        totalAmount,
        expiresAt,
        guestName: g.name.trim(),
        guestCompany: g.company.trim(),
        guestEmail: g.email?.trim() || null,
        guestPhone: g.phone?.trim() || null,
        guestTitle: g.title?.trim() || null,
        guestTier: g.tier || "ENDUSER",
        items: { create: itemData },
      },
    });

    // 거래처 자동 등록
    if (body.saveToCompany) {
      const existing = await prisma.knownCompany.findFirst({
        where: { companyName: g.company.trim() },
      });
      if (!existing) {
        const companyData: Parameters<typeof prisma.knownCompany.create>[0]["data"] = {
          companyName: g.company.trim(),
          phone: g.phone?.trim() || null,
          email: g.email?.trim() || null,
          tier: g.tier || "ENDUSER",
          source: "manual",
        };
        if (g.name.trim()) {
          companyData.contacts = {
            create: {
              name: g.name.trim(),
              title: g.title?.trim() || null,
              mobile: g.phone?.trim() || null,
              email: g.email?.trim() || null,
            },
          };
        }
        await prisma.knownCompany.create({ data: companyData });
      }
    }

    return NextResponse.json({ quoteId: quote.id });
  }

  return NextResponse.json({ error: "고객 정보를 입력해주세요." }, { status: 400 });
}
