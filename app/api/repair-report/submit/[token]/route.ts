import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { put } from "@vercel/blob";

type Params = { params: Promise<{ token: string }> };

// GET — 외주업체가 토큰으로 보고서 정보 조회
export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;
  const submitToken = await prisma.repairReportSubmitToken.findUnique({
    where: { token },
    include: {
      report: {
        include: {
          items: { orderBy: [{ section: "asc" }, { sortOrder: "asc" }] },
          photos: { select: { id: true, section: true, fileName: true } },
        },
      },
    },
  });
  if (!submitToken) return NextResponse.json({ error: "유효하지 않은 링크입니다." }, { status: 404 });
  if (submitToken.expiresAt < new Date())
    return NextResponse.json({ error: "링크가 만료됐습니다." }, { status: 410 });

  return NextResponse.json(submitToken.report);
}

// POST — 외주업체 제출 (증상/사유 텍스트, 항목, 사진)
export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params;
  const submitToken = await prisma.repairReportSubmitToken.findUnique({
    where: { token },
    include: { report: true },
  });
  if (!submitToken) return NextResponse.json({ error: "유효하지 않은 링크입니다." }, { status: 404 });
  if (submitToken.expiresAt < new Date())
    return NextResponse.json({ error: "링크가 만료됐습니다." }, { status: 410 });
  if (submitToken.usedAt || !["DRAFT", "SENT_TO_SUB"].includes(submitToken.report.status))
    return NextResponse.json({ error: "이미 제출된 보고서입니다." }, { status: 409 });

  const reportId = submitToken.reportId;
  const form = await req.formData();

  // 사진 업로드 (섹션별로 files_DISASSEMBLY / files_MAINTENANCE 로 전송)
  for (const section of ["DISASSEMBLY", "MAINTENANCE"]) {
    const files = form.getAll(`files_${section}`) as File[];
    for (const file of files) {
      if (!file.name) continue;
      const blob = await put(`repair-reports/${reportId}/${section}/${Date.now()}_${file.name}`, file, {
        access: "public",
        contentType: file.type || "application/octet-stream",
      });
      await prisma.repairReportPhoto.create({
        data: {
          reportId,
          section,
          fileName: file.name,
          fileUrl: blob.url,
          fileSize: file.size,
          isSelected: true,
        },
      });
    }
  }

  // 텍스트/항목 저장
  const symptomText = form.get("symptomText");
  const reasonText = form.get("reasonText");
  const itemsRaw = form.get("items");

  await prisma.$transaction(async (tx) => {
    if (itemsRaw) {
      const items = JSON.parse(itemsRaw as string) as {
        id?: number | null; section: string; sortOrder?: number; label: string;
        isChecked?: boolean; specValue?: string | null; measured?: string | null;
        judgment?: string | null; quantity?: string | null; partNo?: string | null; remark?: string | null;
      }[];
      for (const item of items) {
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
          await tx.repairReportItem.updateMany({ where: { id: item.id, reportId }, data });
        } else {
          await tx.repairReportItem.create({ data: { ...data, reportId } });
        }
      }
    }

    await tx.repairReport.update({
      where: { id: reportId },
      data: {
        symptomText: typeof symptomText === "string" ? symptomText : undefined,
        reasonText: typeof reasonText === "string" ? reasonText : undefined,
        status: "SUBMITTED",
        repairedDate: submitToken.report.repairedDate ?? new Date(),
      },
    });

    await tx.repairReportSubmitToken.update({
      where: { id: submitToken.id },
      data: { usedAt: submitToken.usedAt ?? new Date() },
    });
  });

  // 관리자 SMS 알림
  const adminPhone = process.env.ADMIN_PHONE;
  if (adminPhone) {
    try {
      const { SolapiMessageService } = await import("solapi");
      const svc = new SolapiMessageService(
        process.env.SOLAPI_API_KEY!,
        process.env.SOLAPI_API_SECRET!
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (svc as any).send({
        to: adminPhone,
        from: process.env.SOLAPI_SENDER ?? adminPhone,
        text: `[스마텍] ${submitToken.report.pumpModel} / ${submitToken.report.reportNo} 외주 수선보고서 제출 완료. 관리자 화면에서 확인해 주세요.`,
      });
    } catch (e) {
      console.error("[TEMC 수선보고서 SMS 오류]", e);
    }
  }

  return NextResponse.json({ ok: true });
}
