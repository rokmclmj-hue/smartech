import { NextRequest, NextResponse } from "next/server";

const BLOB_BASE = "https://s2ewpp0blvbzv3no.private.blob.vercel-storage.com/catalogs/";

// Vercel Blob에 저장된 카탈로그 PDF를 서빙하는 엔드포인트
// 사용: /api/catalog?file=4.스크롤펌프_소형nXDS.pdf
export async function GET(req: NextRequest) {
  const filename = req.nextUrl.searchParams.get("file");
  if (!filename) {
    return NextResponse.json({ error: "file 파라미터 필요" }, { status: 400 });
  }

  const blobUrl = `${BLOB_BASE}${encodeURIComponent(filename)}`;

  try {
    const res = await fetch(blobUrl, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "카탈로그를 찾을 수 없습니다" }, { status: 404 });
    }

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${encodeURIComponent(filename)}"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
