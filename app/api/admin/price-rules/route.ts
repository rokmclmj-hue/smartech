import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  return (session?.user as any)?.tier === "ADMIN";
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  const rules = await prisma.priceRule.findMany();
  return NextResponse.json(rules);
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  const { tier, multiplier } = await req.json();
  const rule = await prisma.priceRule.upsert({
    where: { tier },
    update: { multiplier },
    create: { tier, multiplier },
  });
  return NextResponse.json(rule);
}
