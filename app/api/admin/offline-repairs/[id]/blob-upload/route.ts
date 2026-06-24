import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const nId = parseInt(id);
  if (isNaN(nId)) return NextResponse.json({ error: "잘못된 ID" }, { status: 400 });

  const body = (await req.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          "application/zip",
          "application/x-zip-compressed",
          "application/x-7z-compressed",
          "application/octet-stream",
        ],
        maximumSizeInBytes: 100 * 1024 * 1024,
        tokenPayload: JSON.stringify({ jobId: nId }),
      }),
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const { jobId } = JSON.parse(tokenPayload ?? "{}");
        const existing = await prisma.offlineRepairFile.findFirst({
          where: { jobId, fileType: "PHOTO_ZIP" },
        });
        if (existing) await prisma.offlineRepairFile.delete({ where: { id: existing.id } });
        await prisma.offlineRepairFile.create({
          data: {
            jobId,
            fileType: "PHOTO_ZIP",
            fileName: blob.pathname.split("/").pop() ?? "photos.zip",
            fileUrl: blob.url,
            isSelected: true,
          },
        });
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
