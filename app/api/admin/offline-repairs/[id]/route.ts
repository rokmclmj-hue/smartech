import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { randomUUID } from "crypto";

type Params = { params: Promise<{ id: string }> };

// GET — 단건 상세
export async function GET(_req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const job = await prisma.offlineRepairJob.findUnique({
    where: { id: Number(id) },
    include: {
      company: { select: { id: true, companyName: true } },
      inspectionItems: { orderBy: { sortOrder: "asc" } },
      files: { orderBy: { uploadedAt: "asc" } },
    },
  });
  if (!job) return NextResponse.json({ error: "찾을 수 없음" }, { status: 404 });
  return NextResponse.json(job);
}

// PATCH — 상태·내용 수정 / 토큰 생성
export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const nId = Number(id);
  const body = await req.json().catch(() => ({}));

  // 토큰 생성 요청
  if (body.action === "generate_token") {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14일
    const updated = await prisma.offlineRepairJob.update({
      where: { id: nId },
      data: { uploadToken: token, tokenExpiresAt: expiresAt, status: "SENT_TO_SUB" },
    });
    return NextResponse.json({ token: updated.uploadToken, expiresAt: updated.tokenExpiresAt });
  }

  // 검사항목 수정
  if (body.action === "update_inspection" && Array.isArray(body.items)) {
    await Promise.all(
      body.items.map((item: { id: number; value?: string; isNA?: boolean; pass?: boolean; remark?: string }) =>
        prisma.offlineRepairInspectionItem.update({
          where: { id: item.id },
          data: {
            ...(item.value !== undefined && { value: item.value }),
            ...(item.isNA !== undefined && { isNA: item.isNA }),
            ...(item.pass !== undefined && { pass: item.pass }),
            ...(item.remark !== undefined && { remark: item.remark }),
          },
        })
      )
    );
    return NextResponse.json({ ok: true });
  }

  // 파일 선택 토글 (PDF 삽입용)
  if (body.action === "toggle_file" && body.fileId) {
    const file = await prisma.offlineRepairFile.findUnique({ where: { id: Number(body.fileId) } });
    if (!file) return NextResponse.json({ error: "파일 없음" }, { status: 404 });
    const updated = await prisma.offlineRepairFile.update({
      where: { id: Number(body.fileId) },
      data: { isSelected: !file.isSelected },
    });
    return NextResponse.json({ isSelected: updated.isSelected });
  }

  // 상태·기본정보·견적 수정
  const updated = await prisma.offlineRepairJob.update({
    where: { id: nId },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.memo !== undefined && { memo: body.memo }),
      ...(body.contactEmail !== undefined && { contactEmail: body.contactEmail }),
      ...(body.requestedDate !== undefined && { requestedDate: body.requestedDate ? new Date(body.requestedDate) : null }),
      // 수리 견적 필드 (Phase 2)
      ...(body.repairCost !== undefined && { repairCost: body.repairCost }),
      ...(body.repairPartsText !== undefined && { repairPartsText: body.repairPartsText }),
      ...(body.inspectorName !== undefined && { inspectorName: body.inspectorName }),
    },
  });
  return NextResponse.json(updated);
}

// DELETE
export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  await prisma.offlineRepairJob.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
