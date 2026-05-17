import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const partNo = req.nextUrl.searchParams.get("partNo");
  if (!partNo) return NextResponse.json({ error: "partNo required" }, { status: 400 });

  const product = await prisma.product.findUnique({
    where: { partNo },
    select: { id: true, partNo: true, description: true, isDiscontinued: true },
  });

  if (!product) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(product);
}
