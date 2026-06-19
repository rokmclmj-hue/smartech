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

  // Fix #3: 클라이언트가 검사성적서 초기화 여부를 직접 선택
  const body = await req.json().catch(() => ({}));
  const resetInspection: boolean = body.resetInspection === true;

  const file = await prisma.offlineRepairFile.findUnique({ where: { id: nFileId } });
  if (!file || file.jobId !== nId)
    return NextResponse.json({ error: "파일 없음" }, { status: 404 });

  try { await del(file.fileUrl); } catch { /* Blob에 없어도 계속 진행 */ }

  // Fix #11: 동시 삭제 시 P2025 처리
  try {
    await prisma.offlineRepairFile.delete({ where: { id: nFileId } });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === "P2025") return NextResponse.json({ error: "이미 삭제된 파일입니다." }, { status: 404 });
    throw e;
  }

  // Fix #3: resetInspection이 true일 때만 항목 초기화
  if (file.fileType === "EXCEL" && resetInspection) {
    await prisma.offlineRepairInspectionItem.updateMany({
      where: { jobId: nId },
      data: { value: null, isNA: false, pass: null, spec: null },
    });
    return NextResponse.json({ ok: true, clearedInspection: true });
  }

  return NextResponse.json({ ok: true, clearedInspection: false });
}
