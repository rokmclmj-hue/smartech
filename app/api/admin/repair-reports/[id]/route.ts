import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { resolveCompanyId } from "@/lib/known-company";
import { randomUUID } from "crypto";

type Params = { params: Promise<{ id: string }> };

// GET — 단건 상세
export async function GET(_req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const report = await prisma.repairReport.findUnique({
    where: { id: Number(id) },
    include: {
      company: { include: { contacts: true } },
      items: { orderBy: [{ section: "asc" }, { sortOrder: "asc" }] },
      photos: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!report) return NextResponse.json({ error: "찾을 수 없음" }, { status: 404 });
  return NextResponse.json(report);
}

// PATCH — action 기반 수정
export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const nId = Number(id);
  const body = await req.json().catch(() => ({}));

  // 외주업체 제출 링크 발급
  if (body.action === "generate_submit_token") {
    const report = await prisma.repairReport.findUnique({ where: { id: nId } });
    if (!report) return NextResponse.json({ error: "찾을 수 없음" }, { status: 404 });

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30일
    const created = await prisma.repairReportSubmitToken.create({
      data: { reportId: nId, token: randomUUID(), expiresAt },
    });
    await prisma.repairReport.update({ where: { id: nId }, data: { status: "SENT_TO_SUB" } });

    const origin = process.env.NEXTAUTH_URL ?? "https://www.smartechvacuum.com";
    return NextResponse.json({
      token: created.token,
      expiresAt: created.expiresAt,
      url: `${origin}/repair-report/submit/${created.token}`,
    });
  }

  // 고객 열람 링크 발급 (제출 완료 이후에만 발급 가능)
  if (body.action === "generate_view_token") {
    const report = await prisma.repairReport.findUnique({ where: { id: nId } });
    if (!report) return NextResponse.json({ error: "찾을 수 없음" }, { status: 404 });
    if (["DRAFT", "SENT_TO_SUB"].includes(report.status))
      return NextResponse.json({ error: "외주업체 제출이 완료된 이후에 고객 열람 링크를 발급할 수 있습니다." }, { status: 400 });

    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1년
    const created = await prisma.repairReportViewToken.create({
      data: { reportId: nId, token: randomUUID(), expiresAt },
    });
    if (report.status !== "VIEWED") {
      await prisma.repairReport.update({ where: { id: nId }, data: { status: "SENT_TO_CUSTOMER" } });
    }

    const origin = process.env.NEXTAUTH_URL ?? "https://www.smartechvacuum.com";
    return NextResponse.json({
      token: created.token,
      expiresAt: created.expiresAt,
      url: `${origin}/repair-report/view/${created.token}`,
    });
  }

  // 항목 추가/수정/삭제 (체크리스트·측정치표·부품교환내역 공용)
  if (body.action === "update_items") {
    const items = Array.isArray(body.items) ? body.items : [];
    const deletedIds: number[] = Array.isArray(body.deletedIds) ? body.deletedIds : [];

    await prisma.$transaction(async (tx) => {
      if (deletedIds.length) {
        await tx.repairReportItem.deleteMany({ where: { id: { in: deletedIds }, reportId: nId } });
      }
      for (const item of items as {
        id?: number | null; section: string; sortOrder?: number; label: string;
        isChecked?: boolean; specValue?: string | null; measured?: string | null;
        judgment?: string | null; quantity?: string | null; partNo?: string | null; remark?: string | null;
      }[]) {
        const data = {
          section: item.section,
          sortOrder: item.sortOrder ?? 0,
          label: item.label ?? "",
          isChecked: item.isChecked ?? false,
          specValue: item.specValue ?? null,
          measured: item.measured ?? null,
          judgment: item.judgment ?? null,
          quantity: item.quantity ?? null,
          partNo: item.partNo ?? null,
          remark: item.remark ?? null,
        };
        if (item.id) {
          await tx.repairReportItem.updateMany({ where: { id: item.id, reportId: nId }, data });
        } else {
          await tx.repairReportItem.create({ data: { ...data, reportId: nId } });
        }
      }
    });
    return NextResponse.json({ ok: true });
  }

  // 사진 선택 토글 (고객 열람/PDF 포함 여부)
  if (body.action === "toggle_photo" && body.photoId) {
    const photo = await prisma.repairReportPhoto.findUnique({ where: { id: Number(body.photoId) } });
    if (!photo) return NextResponse.json({ error: "사진 없음" }, { status: 404 });
    const updated = await prisma.repairReportPhoto.update({
      where: { id: Number(body.photoId) },
      data: { isSelected: !photo.isSelected },
    });
    return NextResponse.json({ isSelected: updated.isSelected });
  }

  // 헤더 필드 수정
  let companyId: number | null | undefined = undefined;
  if (body.companyId !== undefined || body.companyName !== undefined) {
    try {
      companyId = await resolveCompanyId(body.companyId, body.companyName);
    } catch {
      return NextResponse.json({ error: "거래처 저장 실패 (잠시 후 다시 시도해주세요)" }, { status: 500 });
    }
  }

  const updated = await prisma.repairReport.update({
    where: { id: nId },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.pumpModel !== undefined && { pumpModel: body.pumpModel }),
      ...(body.pumpSerial !== undefined && { pumpSerial: body.pumpSerial || null }),
      ...(body.pumpLocation !== undefined && { pumpLocation: body.pumpLocation || null }),
      ...(body.pumpAssetNo !== undefined && { pumpAssetNo: body.pumpAssetNo || null }),
      ...(body.symptomText !== undefined && { symptomText: body.symptomText || null }),
      ...(body.reasonText !== undefined && { reasonText: body.reasonText || null }),
      ...(body.subName !== undefined && { subName: body.subName || null }),
      ...(body.subEmail !== undefined && { subEmail: body.subEmail || null }),
      ...(body.adminNote !== undefined && { adminNote: body.adminNote || null }),
      ...(body.repairedDate !== undefined && { repairedDate: body.repairedDate ? new Date(body.repairedDate) : null }),
      ...(companyId !== undefined && { companyId }),
    },
  });
  return NextResponse.json(updated);
}

// DELETE
export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  await prisma.repairReport.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
