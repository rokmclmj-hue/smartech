import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

type Params = { params: Promise<{ id: string }> };

// GET — 단건 조회
export async function GET(_req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const note = await prisma.manualDeliveryNote.findUnique({
    where: { id: parseInt(id) },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!note) return NextResponse.json({ error: "찾을 수 없음" }, { status: 404 });
  return NextResponse.json(note);
}

// PATCH — 수정 (상태 변경 등)
export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });

  const updated = await prisma.manualDeliveryNote.update({
    where: { id: parseInt(id) },
    data: {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.sentAt !== undefined && { sentAt: body.sentAt }),
      ...(body.sentTo !== undefined && { sentTo: body.sentTo }),
    },
  });
  return NextResponse.json({ ok: true, note: updated });
}

// DELETE — 삭제
export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  await prisma.manualDeliveryNote.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}
