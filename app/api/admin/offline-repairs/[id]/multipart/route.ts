import { NextRequest, NextResponse } from "next/server";
import { createMultipartUpload, uploadPart, completeMultipartUpload } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const nId = parseInt(id);
  if (isNaN(nId)) return NextResponse.json({ error: "잘못된 ID" }, { status: 400 });

  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    try {
      const form = await req.formData();
      const uploadId = form.get("uploadId") as string;
      const key = form.get("key") as string;
      const partNumber = parseInt(form.get("partNumber") as string);
      const pathname = form.get("pathname") as string;
      const chunk = form.get("chunk") as File;

      if (!uploadId || !key || !pathname || !chunk || isNaN(partNumber)) {
        return NextResponse.json({ error: "잘못된 파라미터" }, { status: 400 });
      }

      const buffer = Buffer.from(await chunk.arrayBuffer());
      const part = await uploadPart(pathname, buffer, { access: "private", uploadId, key, partNumber });
      return NextResponse.json({ etag: part.etag, partNumber: part.partNumber });
    } catch (e) {
      console.error("[multipart/part]", e);
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON 파싱 실패" }, { status: 400 });
  }

  if (body.action === "init") {
    try {
      const pathname = body.pathname as string;
      const { uploadId, key } = await createMultipartUpload(pathname, { access: "private" });
      return NextResponse.json({ uploadId, key });
    } catch (e) {
      console.error("[multipart/init]", e);
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }

  if (body.action === "complete") {
    try {
      const { uploadId, key, pathname, parts, filename } = body as {
        uploadId: string;
        key: string;
        pathname: string;
        parts: { etag: string; partNumber: number }[];
        filename: string;
      };

      const blob = await completeMultipartUpload(pathname, parts, { access: "private", uploadId, key });

      const existing = await prisma.offlineRepairFile.findFirst({
        where: { jobId: nId, fileType: "PHOTO_ZIP" },
      });
      if (existing) await prisma.offlineRepairFile.delete({ where: { id: existing.id } });
      await prisma.offlineRepairFile.create({
        data: { jobId: nId, fileType: "PHOTO_ZIP", fileName: filename, fileUrl: blob.url, isSelected: true },
      });
      return NextResponse.json({ ok: true });
    } catch (e) {
      console.error("[multipart/complete]", e);
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "알 수 없는 action" }, { status: 400 });
}
