import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { parseInquirySource } from "@/lib/inquiry-source";

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

const KNOWN_COMPANY_TIERS = ["DEALER", "OEM", "ENDUSER", "KEY_DEALER", "VIP_DEALER"];

// 견적을 낸 업체가 거래처 목록에 없으면 등록하고, 있으면 새 담당자만 추가한다.
// 주의: 거래처의 전화·이메일·사업자번호는 가입 시 등급을 바로 주는 명단으로도 쓰인다
// (lib/classify-company.ts, lib/auth.ts). 회원에서 넘어온 정보(fromMember)는 그 명단에 들어가지 않도록
// 거래처 칸에는 전화·이메일을 넣지 않고 담당자 칸에만 넣는다.
async function ensureKnownCompany(c: {
  company: string;
  name: string;
  title?: string | null;
  phone?: string | null;
  email?: string | null;
  tier?: string | null;
  businessNo?: string | null;
  fromMember?: boolean;
}) {
  const companyName = c.company.trim();
  if (!companyName) return;
  if (c.fromMember) {
    // 승인 전·거절 회원은 등록하지 않는다. 사업자번호 간편가입의 임시 상호(사업자_번호)도 건너뛴다.
    if (!c.tier || !KNOWN_COMPANY_TIERS.includes(c.tier)) return;
    if (companyName.startsWith("사업자_")) return;
  }
  // 담당자 이름이 상호와 같으면(간편가입 기본값) 담당자로 넣지 않는다.
  const name = c.name.trim() === companyName ? "" : c.name.trim();
  // 같은 거래처 찾기: 상호(대소문자 무시) 또는, 회원이면 사업자번호
  const bizNo = c.fromMember ? (c.businessNo ?? "").replace(/\D/g, "") : "";
  const existing = await prisma.knownCompany.findFirst({
    where: {
      OR: [
        { companyName: { equals: companyName, mode: "insensitive" } },
        ...(bizNo.length === 10 ? [{ businessNo: bizNo }] : []),
      ],
    },
  });
  if (!existing) {
    const companyData: Parameters<typeof prisma.knownCompany.create>[0]["data"] = {
      companyName,
      phone: c.fromMember ? null : c.phone?.trim() || null,
      email: c.fromMember ? null : c.email?.trim() || null,
      tier: c.tier && KNOWN_COMPANY_TIERS.includes(c.tier) ? c.tier : "ENDUSER",
      source: "manual",
    };
    if (name) {
      companyData.contacts = {
        create: {
          name,
          title: c.title?.trim() || null,
          mobile: c.phone?.trim() || null,
          email: c.email?.trim() || null,
        },
      };
    }
    await prisma.knownCompany.create({ data: companyData });
  } else if (name) {
    // 이미 있는 거래처 — 담당자만 새 사람이면 담당자 목록에 추가(띄어쓰기·대소문자 무시하고 같은 이름이면 건너뜀)
    const nameKey = (s: string) => s.replace(/\s/g, "").toLowerCase();
    const contacts = await prisma.knownContact.findMany({
      where: { companyId: existing.id },
      select: { name: true },
    });
    if (!contacts.some((k) => nameKey(k.name) === nameKey(name))) {
      await prisma.knownContact.create({
        data: {
          companyId: existing.id,
          name,
          title: c.title?.trim() || null,
          mobile: c.phone?.trim() || null,
          email: c.email?.trim() || null,
        },
      });
    }
  }
}

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
  const inquirySource = parseInquirySource(body.inquirySource);

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
        inquirySource,
        totalAmount,
        expiresAt,
        items: { create: itemData },
      },
    });

    // 회원을 골라 낸 견적도 거래처 목록에서 찾을 수 있게 등록한다(관리자 계정 제외).
    // 견적은 이미 만들어졌으므로 등록이 실패해도 견적 응답은 그대로 보낸다.
    if (customer.tier !== "ADMIN") {
      try {
        await ensureKnownCompany({
          company: customer.company,
          name: customer.name,
          title: customer.title,
          phone: customer.phone,
          email: customer.email,
          tier: customer.tier,
          businessNo: customer.businessNo,
          fromMember: true,
        });
      } catch (e) {
        console.error("[proxy-quotes] 거래처 자동 등록 실패", e);
      }
    }
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
        inquirySource,
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
    // 견적은 이미 만들어졌으므로 등록이 실패해도 견적 응답은 그대로 보낸다(다시 눌러 견적이 두 장 생기는 것 방지).
    if (body.saveToCompany) {
      try {
        await ensureKnownCompany({
          company: g.company,
          name: g.name,
          title: g.title,
          phone: g.phone,
          email: g.email,
          tier: g.tier,
        });
      } catch (e) {
        console.error("[proxy-quotes] 거래처 자동 등록 실패", e);
      }
    }

    return NextResponse.json({ quoteId: quote.id });
  }

  return NextResponse.json({ error: "고객 정보를 입력해주세요." }, { status: 400 });
}
