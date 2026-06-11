import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { put } from "@vercel/blob";

// POST — 협력사 파일 업로드 + 검사항목 제출
export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "토큰 없음" }, { status: 400 });

  const job = await prisma.offlineRepairJob.findUnique({ where: { uploadToken: token } });
  if (!job) return NextResponse.json({ error: "유효하지 않은 링크입니다." }, { status: 404 });
  if (!job.tokenExpiresAt || job.tokenExpiresAt < new Date())
    return NextResponse.json({ error: "링크가 만료됐습니다." }, { status: 410 });

  const form = await req.formData();

  // 파일 업로드
  const files = form.getAll("files") as File[];
  for (const file of files) {
    if (!file.name) continue;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const fileType = ["zip", "7z"].includes(ext) ? "PHOTO_ZIP" : "PHOTO";
    const blob = await put(`offline-repairs/${job.id}/${Date.now()}_${file.name}`, file, {
      access: "public",
      contentType: file.type || "application/octet-stream",
    });
    await prisma.offlineRepairFile.create({
      data: {
        jobId: job.id,
        fileType,
        fileName: file.name,
        fileUrl: blob.url,
        fileSize: file.size,
      },
    });
  }

  // 검사항목 저장
  const itemsRaw = form.get("items");
  if (itemsRaw) {
    const items = JSON.parse(itemsRaw as string) as {
      id: number; value?: string; isNA?: boolean; remark?: string;
    }[];
    await Promise.all(
      items.map((item) =>
        prisma.offlineRepairInspectionItem.update({
          where: { id: item.id },
          data: {
            value: item.value ?? null,
            isNA: item.isNA ?? false,
            remark: item.remark ?? null,
          },
        })
      )
    );
  }

  // 상태 업데이트
  await prisma.offlineRepairJob.update({
    where: { id: job.id },
    data: { status: "UPLOADED", uploadedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}

// GET — 토큰으로 수리접수 정보 조회 (협력사용)
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "토큰 없음" }, { status: 400 });

  const job = await prisma.offlineRepairJob.findUnique({
    where: { uploadToken: token },
    include: {
      inspectionItems: { orderBy: { sortOrder: "asc" } },
      files: { select: { id: true, fileName: true, fileType: true, uploadedAt: true } },
    },
  });
  if (!job) return NextResponse.json({ error: "유효하지 않은 링크입니다." }, { status: 404 });
  if (!job.tokenExpiresAt || job.tokenExpiresAt < new Date())
    return NextResponse.json({ error: "링크가 만료됐습니다." }, { status: 410 });

  return NextResponse.json({
    jobNo: job.jobNo,
    pumpMaker: job.pumpMaker,
    pumpModel: job.pumpModel,
    serialNo: job.serialNo,
    status: job.status,
    tokenExpiresAt: job.tokenExpiresAt,
    inspectionItems: job.inspectionItems,
    files: job.files,
  });
}
