import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { INQUIRY_SOURCES } from "@/lib/inquiry-source";

export const dynamic = "force-dynamic";

const MONTHS = 6;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

// 한국시간 기준 "YYYY-MM"
function monthKey(d: Date) {
  return new Date(d.getTime() + KST_OFFSET_MS).toISOString().slice(0, 7);
}

type Cell = { quotes: number; delivered: number };

// GET — 월별 견적 → 납품(거래명세표) 집계. 건수만 내보낸다(금액·업체명 없음).
export async function GET() {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  // 한국시간 기준 (MONTHS-1)개월 전 1일 00:00부터
  const nowKst = new Date(Date.now() + KST_OFFSET_MS);
  const since = new Date(Date.UTC(nowKst.getUTCFullYear(), nowKst.getUTCMonth() - (MONTHS - 1), 1) - KST_OFFSET_MS);

  const quotes = await prisma.quote.findMany({
    where: { status: { not: "DRAFT" }, createdAt: { gte: since } },
    select: { id: true, createdAt: true, inquirySource: true },
  });

  const linked = await prisma.manualDeliveryNote.findMany({
    where: { sourceQuoteId: { in: quotes.map((q) => q.id) } },
    select: { sourceQuoteId: true },
  });
  const deliveredIds = new Set(linked.map((n) => n.sourceQuoteId));

  const sourceKeys = [...INQUIRY_SOURCES.map((s) => s.value), "NONE"] as string[];
  const blank = () => ({
    total: { quotes: 0, delivered: 0 } as Cell,
    bySource: Object.fromEntries(sourceKeys.map((k) => [k, { quotes: 0, delivered: 0 }])) as Record<string, Cell>,
  });

  const byMonth = new Map<string, ReturnType<typeof blank>>();
  for (let i = MONTHS - 1; i >= 0; i--) {
    byMonth.set(monthKey(new Date(Date.UTC(nowKst.getUTCFullYear(), nowKst.getUTCMonth() - i, 15))), blank());
  }

  for (const q of quotes) {
    const row = byMonth.get(monthKey(q.createdAt));
    if (!row) continue;
    const key = q.inquirySource && sourceKeys.includes(q.inquirySource) ? q.inquirySource : "NONE";
    const delivered = deliveredIds.has(q.id);
    row.total.quotes++;
    row.bySource[key].quotes++;
    if (delivered) {
      row.total.delivered++;
      row.bySource[key].delivered++;
    }
  }

  return NextResponse.json({
    sources: [...INQUIRY_SOURCES, { value: "NONE", label: "미입력" }],
    months: [...byMonth.entries()].map(([month, v]) => ({ month, ...v })),
  });
}
