import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { put } from "@vercel/blob";
import type { Session } from "next-auth";

function isAdmin(session: Session | null) {
  return (session?.user as any)?.tier === "ADMIN";
}

// POST /api/admin/repairs/[id]/files — 관리자 직접 파일 업로드
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const repairId = Number(id);

  const repair = await prisma.repairRequest.findUnique({ where: { id: repairId } });
  if (!repair) return NextResponse.json({ error: "접수 없음" }, { status: 404 });

  const formData = await req.formData();
  const fileType = formData.get("fileType") as string;
  const files = formData.getAll("files") as File[];

  if (!fileType || files.length === 0) {
    return NextResponse.json({ error: "파일 또는 타입 누락" }, { status: 400 });
  }

  const saved: { fileName: string; fileUrl: string }[] = [];

  for (const file of files) {
    const ext = file.name.split(".").pop() ?? "bin";
    const blobName = `repairs/${repair.repairNo}/${fileType}/${Date.now()}-${file.name}`;

    let fileUrl: string;
    try {
      const blob = await put(blobName, file, { access: "public" });
      fileUrl = blob.url;
    } catch {
      // BLOB_READ_WRITE_TOKEN 없을 때 임시 처리
      fileUrl = `[BLOB 미설정] ${file.name}`;
    }

    await prisma.repairFile.create({
      data: {
        repairId,
        fileType,
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        uploadedBy: "admin",
      },
    });
    saved.push({ fileName: file.name, fileUrl });
  }

  return NextResponse.json({ saved, count: saved.length });
}

// GET /api/admin/repairs/[id]/files — 파일 목록
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const files = await prisma.repairFile.findMany({
    where: { repairId: Number(id) },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ files });
}
