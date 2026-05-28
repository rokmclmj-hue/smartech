import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await prisma.product.groupBy({
    by: ["category"],
    _count: { _all: true },
  });

  const counts: Record<string, number> = {};
  let total = 0;
  for (const r of rows) {
    const key = r.category ?? "기타";
    counts[key] = r._count._all;
    total += r._count._all;
  }

  return NextResponse.json(
    { counts, total },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
