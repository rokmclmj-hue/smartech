import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { randomUUID } from "crypto";
import { sendSubUploadLink } from "@/lib/mailer";

type Params = { params: Promise<{ id: string }> };

// GET — 단건 상세
export async function GET(_req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const job = await prisma.offlineRepairJob.findUnique({
    where: { id: Number(id) },
    include: {
      company: { include: { contacts: true } },
      inspectionItems: { orderBy: { sortOrder: "asc" } },
      files: { orderBy: { uploadedAt: "asc" } },
      quoteItems: { orderBy: { sortOrder: "asc" } },
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
    const job = await prisma.offlineRepairJob.findUnique({ where: { id: nId } });
    if (!job) return NextResponse.json({ error: "찾을 수 없음" }, { status: 404 });

    let updated;
    try {
      updated = await prisma.offlineRepairJob.update({
        where: { id: nId },
        data: { uploadToken: token, tokenExpiresAt: expiresAt, status: "SENT_TO_SUB" },
      });
    } catch {
      return NextResponse.json({ error: "업데이트 실패 (동시 삭제됐을 수 있음)" }, { status: 409 });
    }

    // 협력사 이메일 자동 발송 (subEmail 우선, 없으면 환경변수)
    const subEmail = job.subEmail || process.env.REPAIR_SUB_EMAIL;
    let emailSent = false;
    if (subEmail && updated.uploadToken) {
      const origin = process.env.NEXTAUTH_URL ?? "https://www.smartechvacuum.com";
      const uploadUrl = `${origin}/repair/offline-upload/${updated.uploadToken}`;
      try {
        await sendSubUploadLink({
          to: subEmail,
          jobNo: updated.jobNo,
          pumpMaker: updated.pumpMaker,
          pumpModel: updated.pumpModel,
          serialNo: updated.serialNo,
          uploadUrl,
          expiresAt,
        });
        emailSent = true;
      } catch (e) {
        console.error("[협력사 이메일 발송 오류]", e);
      }
    }

    return NextResponse.json({ token: updated.uploadToken, expiresAt: updated.tokenExpiresAt, emailSent });
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
      ...(body.contactName !== undefined && { contactName: body.contactName || null }),
      ...(body.contactEmail !== undefined && { contactEmail: body.contactEmail }),
      ...(body.contactPhone !== undefined && { contactPhone: body.contactPhone || null }),
      ...(body.requestedDate !== undefined && { requestedDate: body.requestedDate ? new Date(body.requestedDate) : null }),
      // 수리 견적 필드 (Phase 2)
      ...(body.repairCost !== undefined && { repairCost: body.repairCost != null ? Math.round(Number(body.repairCost)) : null }),
      ...(body.repairPartsText !== undefined && { repairPartsText: body.repairPartsText }),
      ...(body.inspectorName !== undefined && { inspectorName: body.inspectorName }),
      ...(body.quoteRemarks !== undefined && { quoteRemarks: body.quoteRemarks || null }),
      ...(body.subEmail !== undefined && { subEmail: body.subEmail || null }),
      ...(body.subName !== undefined && { subName: body.subName || null }),
      ...(body.companyId !== undefined && { companyId: body.companyId ?? null }),
      // 견적 품목 (기본수리 + 추가파트) — 통째로 교체
      ...(Array.isArray(body.quoteItems) && {
        quoteItems: {
          deleteMany: {},
          create: (body.quoteItems as { name: string; quantity: number; unitPrice: number }[])
            .filter(it => it.name?.trim())
            .map((it, i) => ({
              name: it.name.trim(),
              quantity: Math.max(1, Math.round(Number(it.quantity) || 1)),
              unitPrice: Math.round(Number(it.unitPrice) || 0),
              sortOrder: i,
            })),
        },
      }),
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
