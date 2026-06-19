import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { del } from "@vercel/blob";

type Params = { params: Promise<{ id: string; fileId: string }> };

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id, fileId } = await params;
  const nId = parseInt(id);
  const nFileId = parseInt(fileId);
  if (isNaN(nId) || isNaN(nFileId))
    return NextResponse.json({ error: "잘못된 ID" }, { status: 400 });

  const file = await prisma.offlineRepairFile.findUnique({ where: { id: nFileId } });
  if (!file || file.jobId !== nId)
    return NextResponse.json({ error: "파일 없음" }, { status: 404 });

  try { await del(file.fileUrl); } catch { /* Blob에 없어도 계속 진행 */ }

  await prisma.offlineRepairFile.delete({ where: { id: nFileId } });

  // Excel 삭제 시 검사성적서 항목값 초기화
  if (file.fileType === "EXCEL") {
    await prisma.offlineRepairInspectionItem.updateMany({
      where: { jobId: nId },
      data: { value: null, isNA: false, pass: null, spec: null },
    });
    return NextResponse.json({ ok: true, clearedInspection: true });
  }

  return NextResponse.json({ ok: true, clearedInspection: false });
}
