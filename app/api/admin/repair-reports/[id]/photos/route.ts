import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { put } from "@vercel/blob";

type Params = { params: Promise<{ id: string }> };

// POST — 관리자가 직접 사진 업로드 (외주 토큰 없이)
export async function POST(req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const reportId = Number(id);
  const report = await prisma.repairReport.findUnique({ where: { id: reportId } });
  if (!report) return NextResponse.json({ error: "찾을 수 없음" }, { status: 404 });

  const form = await req.formData();
  const rawSection = form.get("section") as string;
  const section = ["DISASSEMBLY", "MAINTENANCE"].includes(rawSection) ? rawSection : "MAINTENANCE";
  const files = form.getAll("files") as File[];
  if (!files.length) return NextResponse.json({ error: "파일 없음" }, { status: 400 });

  const created = [];
  for (const file of files) {
    if (!file.name) continue;
    const blob = await put(`repair-reports/${reportId}/${section}/${Date.now()}_${file.name}`, file, {
      access: "public",
      contentType: file.type || "application/octet-stream",
    });
    const photo = await prisma.repairReportPhoto.create({
      data: {
        reportId,
        section,
        fileName: file.name,
        fileUrl: blob.url,
        fileSize: file.size,
        isSelected: true,
      },
    });
    created.push(photo);
  }

  return NextResponse.json({ photos: created });
}
