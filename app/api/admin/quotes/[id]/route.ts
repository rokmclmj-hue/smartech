import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { QUOTE_VALID_DAYS } from "@/lib/constants";

// PATCH — 작성일 수정 (유효기간도 새 작성일 + QUOTE_VALID_DAYS로 함께 이동)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const { id } = await params;
  const quoteId = parseInt(id);
  if (!Number.isFinite(quoteId)) {
    return NextResponse.json({ error: "잘못된 견적 ID" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const dateStr = typeof body?.createdDate === "string" ? body.createdDate : "";
  // 한국시간 정오로 저장 — 서버(UTC)에서 PDF를 만들 때도, 한국 브라우저에서 볼 때도 같은 날짜로 나온다.
  const createdAt = /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? new Date(`${dateStr}T12:00:00+09:00`) : null;
  // 2월 31일처럼 없는 날짜는 Date가 다음 달로 넘겨 버리므로, 저장할 날짜를 다시 문자열로 바꿔 입력과 같은지 확인한다.
  const year = Number(dateStr.slice(0, 4));
  if (
    !createdAt || isNaN(createdAt.getTime()) || year < 2020 || year > 2100 ||
    createdAt.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" }) !== dateStr
  ) {
    return NextResponse.json({ error: "잘못된 날짜" }, { status: 400 });
  }

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    select: { id: true, createdAt: true, status: true },
  });
  if (!quote) {
    return NextResponse.json({ error: "견적을 찾을 수 없습니다" }, { status: 404 });
  }
  // 발주 확정된 견적은 주문·거래명세표와 맞물려 있어 삭제와 같이 날짜 수정도 막는다 (2026-10-03 대표님 결정)
  if (quote.status === "CONFIRMED") {
    return NextResponse.json({ error: "발주 확정된 견적은 작성일을 수정할 수 없습니다" }, { status: 409 });
  }

  const expiresAt = new Date(createdAt.getTime() + QUOTE_VALID_DAYS * 24 * 60 * 60 * 1000);
  await prisma.quote.update({ where: { id: quoteId }, data: { createdAt, expiresAt } });

  await logAudit({
    userId: admin.userId,
    action: "quote.update",
    target: "Quote",
    targetId: quoteId,
    payload: { from: quote.createdAt.toISOString(), to: createdAt.toISOString() },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const { id } = await params;
  const quoteId = parseInt(id);
  if (!Number.isFinite(quoteId)) {
    return NextResponse.json({ error: "잘못된 견적 ID" }, { status: 400 });
  }

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    select: { id: true, status: true, userId: true },
  });
  if (!quote) {
    return NextResponse.json({ error: "견적을 찾을 수 없습니다" }, { status: 404 });
  }
  if (quote.status === "CONFIRMED") {
    return NextResponse.json({ error: "확정된 견적은 삭제할 수 없습니다" }, { status: 409 });
  }

  await prisma.quote.delete({ where: { id: quoteId } });

  await logAudit({
    userId: admin.userId,
    action: "quote.delete",
    target: "Quote",
    targetId: quoteId,
    payload: { status: quote.status },
  });

  return NextResponse.json({ ok: true });
}
