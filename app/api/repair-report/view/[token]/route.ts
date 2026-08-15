import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ token: string }> };

// GET — 고객(TEMC)이 토큰으로 완성된 보고서 열람 (읽기 전용, 내부 필드 제외)
export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;
  const viewToken = await prisma.repairReportViewToken.findUnique({
    where: { token },
    include: {
      report: {
        include: {
          company: { select: { companyName: true } },
          items: { orderBy: [{ section: "asc" }, { sortOrder: "asc" }] },
          photos: { where: { isSelected: true }, orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });
  if (!viewToken) return NextResponse.json({ error: "유효하지 않은 링크입니다." }, { status: 404 });
  if (viewToken.expiresAt < new Date())
    return NextResponse.json({ error: "링크가 만료됐습니다." }, { status: 410 });

  await prisma.$transaction([
    prisma.repairReportViewToken.update({
      where: { id: viewToken.id },
      data: { viewedAt: viewToken.viewedAt ?? new Date(), viewCount: { increment: 1 } },
    }),
    ...(viewToken.report.status === "SENT_TO_CUSTOMER"
      ? [prisma.repairReport.update({ where: { id: viewToken.reportId }, data: { status: "VIEWED" } })]
      : []),
  ]);

  const r = viewToken.report;
  return NextResponse.json({
    reportNo: r.reportNo,
    company: r.company,
    pumpModel: r.pumpModel,
    pumpSerial: r.pumpSerial,
    pumpLocation: r.pumpLocation,
    pumpAssetNo: r.pumpAssetNo,
    symptomText: r.symptomText,
    reasonText: r.reasonText,
    receivedDate: r.receivedDate,
    repairedDate: r.repairedDate,
    items: r.items,
    photos: r.photos,
  });
}
