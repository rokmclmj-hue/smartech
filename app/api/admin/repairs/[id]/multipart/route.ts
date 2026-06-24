import { NextRequest, NextResponse } from "next/server";
import { createMultipartUpload, uploadPart, completeMultipartUpload } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";

type Params = { params: Promise<{ id: string }> };

function isAdmin(session: Session | null) {
  return (session?.user as { tier?: string })?.tier === "ADMIN";
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const repairId = Number(id);
  if (isNaN(repairId)) return NextResponse.json({ error: "잘못된 ID" }, { status: 400 });

  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
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
    const part = await uploadPart(pathname, buffer, { access: "public", uploadId, key, partNumber });
    return NextResponse.json({ etag: part.etag, partNumber: part.partNumber });
  }

  const body = await req.json();

  if (body.action === "init") {
    const { pathname } = body as { pathname: string };
    try {
      const { uploadId, key } = await createMultipartUpload(pathname, { access: "public" });
      return NextResponse.json({ uploadId, key });
    } catch (e) {
      console.error("[multipart/init]", e);
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }

  if (body.action === "complete") {
    const { uploadId, key, pathname, parts, filename, fileType, fileSize } = body as {
      uploadId: string;
      key: string;
      pathname: string;
      parts: { etag: string; partNumber: number }[];
      filename: string;
      fileType: string;
      fileSize: number;
    };

    const blob = await completeMultipartUpload(pathname, parts, { access: "public", uploadId, key });

    try {
      await prisma.repairFile.create({
        data: { repairId, fileType, fileName: filename, fileUrl: blob.url, fileSize: fileSize ?? 0, uploadedBy: "admin" },
      });
      return NextResponse.json({ ok: true });
    } catch (e) {
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "알 수 없는 action" }, { status: 400 });
}
