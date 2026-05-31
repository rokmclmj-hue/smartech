import { NextRequest, NextResponse } from "next/server";
import { head } from "@vercel/blob";

const BLOB_BASE = "https://s2ewpp0blvbzv3no.private.blob.vercel-storage.com/catalogs/";

export async function GET(req: NextRequest) {
  const filename = req.nextUrl.searchParams.get("file");
  if (!filename) {
    return NextResponse.json({ error: "file 파라미터 필요" }, { status: 400 });
  }

  const blobUrl = `${BLOB_BASE}${encodeURIComponent(filename)}`;

  try {
    const blob = await head(blobUrl, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.redirect(blob.downloadUrl);
  } catch {
    return NextResponse.json({ error: "카탈로그를 찾을 수 없습니다" }, { status: 404 });
  }
}
