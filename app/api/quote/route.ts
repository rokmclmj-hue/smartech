import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getMultiplier } from "@/lib/pricing";

type SessionUser = { id: string; tier: string };

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  const { id, tier } = session.user as SessionUser;
  const userId = parseInt(id);
  const { items, note } = await req.json();

  if (!items?.length) return NextResponse.json({ error: "품목이 없습니다" }, { status: 400 });

  const multiplier = await getMultiplier(tier);

  const quote = await prisma.quote.create({
    data: {
      userId,
      note,
      items: {
        create: await Promise.all(
          items.map(async (item: { productId: number; quantity: number }) => {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            return {
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: Math.round((product?.costPrice ?? 0) * multiplier),
            };
          })
        ),
      },
    },
    include: { items: { include: { product: true } } },
  });

  return NextResponse.json({ quoteId: quote.id });
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  const { id, tier } = session.user as SessionUser;
  const userId = parseInt(id);
  const isAdmin = tier === "ADMIN";

  const quotes = await prisma.quote.findMany({
    where: isAdmin ? {} : { userId },
    include: {
      user: { select: { name: true, company: true, email: true } },
      items: {
        select: {
          quantity: true,
          unitPrice: true,
          customPartNo: true,
          customDescription: true,
          product: { select: { partNo: true, description: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(quotes);
}
