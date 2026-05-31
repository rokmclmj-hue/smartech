import { NextRequest, NextResponse } from "next/server";
import { getDownloadUrl } from "@vercel/blob";

// Vercel Blob에 저장된 카탈로그 PDF를 서빙하는 엔드포인트
// 사용: /api/catalog?file=4.스크롤펌프_소형nXDS.pdf
export async function GET(req: NextRequest) {
  const filename = req.nextUrl.searchParams.get("file");
  if (!filename) {
    return NextResponse.json({ error: "file 파라미터 필요" }, { status: 400 });
  }

  const blobUrl = `https://s2ewpp0blvbzv3no.private.blob.vercel-storage.com/catalogs/${encodeURIComponent(filename)}`;

  try {
    const { url } = await getDownloadUrl(blobUrl);
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.json({ error: "카탈로그를 찾을 수 없습니다" }, { status: 404 });
  }
}
