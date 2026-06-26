import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

// GET — 목록 조회
export async function GET() {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const notes = await prisma.manualDeliveryNote.findMany({
    include: { items: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(notes);
}

// POST — 거래명세표 생성
export async function POST(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });

  if (!body.toCompany?.trim())
    return NextResponse.json({ error: "업체명을 입력해주세요." }, { status: 400 });

  const items = body.items as { partNo: string; description: string; quantity: number; unitPrice: number; productId?: number; sortOrder?: number }[] | undefined;
  if (!items || items.length === 0)
    return NextResponse.json({ error: "품목을 1개 이상 추가해주세요." }, { status: 400 });

  const totalSupply = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const totalVat = Math.round(totalSupply * 0.1);
  const totalAmount = totalSupply + totalVat;

  const year = new Date().getFullYear();

  // 트랜잭션으로 TEMP 생성 → 실제 번호 업데이트를 원자적으로 처리
  const [, updated] = await prisma.$transaction(async (tx) => {
    const note = await tx.manualDeliveryNote.create({
      data: {
        noteNo: "TEMP",
        toCompany: body.toCompany.trim(),
        toName: body.toName?.trim() || null,
        toTitle: body.toTitle?.trim() || null,
        toEmail: body.toEmail?.trim() || null,
        toPhone: body.toPhone?.trim() || null,
        toBizNo: body.toBizNo?.trim() || null,
        memo: body.memo?.trim() || null,
        remarks: body.remarks?.trim() || null,
        includeBankInfo: body.includeBankInfo !== false,
        totalSupply,
        totalVat,
        totalAmount,
        items: {
          create: items.map((item, idx) => ({
            partNo: item.partNo,
            description: item.description,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            productId: item.productId ?? null,
            sortOrder: item.sortOrder ?? idx,
          })),
        },
      },
    });
    const noteNo = `SMT-${year}-D-${String(note.id).padStart(6, "0")}`;
    const u = await tx.manualDeliveryNote.update({ where: { id: note.id }, data: { noteNo } });
    return [note, u] as const;
  });

  return NextResponse.json({ id: updated.id, noteNo: updated.noteNo });
}
