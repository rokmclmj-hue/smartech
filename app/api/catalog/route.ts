import { NextRequest, NextResponse } from "next/server";

// 업로드된 Blob URL 정확한 매핑
const CATALOG_URLS: Record<string, string> = {
  "1-1.오일펌프_소형E2M.pdf": "https://s2ewpp0blvbzv3no.private.blob.vercel-storage.com/catalogs/1-1.%EC%98%A4%EC%9D%BC%ED%8E%8C%ED%94%84_%EC%86%8C%ED%98%95E2M.pdf",
  "1.오일펌프_소형RV.pdf": "https://s2ewpp0blvbzv3no.private.blob.vercel-storage.com/catalogs/1.%EC%98%A4%EC%9D%BC%ED%8E%8C%ED%94%84_%EC%86%8C%ED%98%95RV.pdf",
  "10.nEXT 터보펌프.pdf": "https://s2ewpp0blvbzv3no.private.blob.vercel-storage.com/catalogs/10.nEXT%20%ED%84%B0%EB%B3%B4%ED%8E%8C%ED%94%84.pdf",
  "11.터보펌프_nEXT_Pumping_Station.pdf": "https://s2ewpp0blvbzv3no.private.blob.vercel-storage.com/catalogs/11.%ED%84%B0%EB%B3%B4%ED%8E%8C%ED%94%84_nEXT_Pumping_Station.pdf",
  "12.터보펌프_STP.pdf": "https://s2ewpp0blvbzv3no.private.blob.vercel-storage.com/catalogs/12.%ED%84%B0%EB%B3%B4%ED%8E%8C%ED%94%84_STP.pdf",
  "13.저진공게이지_APG200.pdf": "https://s2ewpp0blvbzv3no.private.blob.vercel-storage.com/catalogs/13.%EC%A0%80%EC%A7%84%EA%B3%B5%EA%B2%8C%EC%9D%B4%EC%A7%80_APG200.pdf",
  "14.고진공게이지AIM200.pdf": "https://s2ewpp0blvbzv3no.private.blob.vercel-storage.com/catalogs/14.%EA%B3%A0%EC%A7%84%EA%B3%B5%EA%B2%8C%EC%9D%B4%EC%A7%80AIM200.pdf",
  "15.저진공+고진공게이지_WRG200.pdf": "https://s2ewpp0blvbzv3no.private.blob.vercel-storage.com/catalogs/15.%EC%A0%80%EC%A7%84%EA%B3%B5%2B%EA%B3%A0%EC%A7%84%EA%B3%B5%EA%B2%8C%EC%9D%B4%EC%A7%80_WRG200.pdf",
  "16.디스플레이진공게이지_P4-P5.pdf": "https://s2ewpp0blvbzv3no.private.blob.vercel-storage.com/catalogs/16.%EB%94%94%EC%8A%A4%ED%94%8C%EB%A0%88%EC%9D%B4%EC%A7%84%EA%B3%B5%EA%B2%8C%EC%9D%B4%EC%A7%80_P4-P5.pdf",
  "17.컨트롤러_TIC.pdf": "https://s2ewpp0blvbzv3no.private.blob.vercel-storage.com/catalogs/17.%EC%BB%A8%ED%8A%B8%EB%A1%A4%EB%9F%AC_TIC.pdf",
  "18.컨트롤러_ADC.pdf": "https://s2ewpp0blvbzv3no.private.blob.vercel-storage.com/catalogs/18.%EC%BB%A8%ED%8A%B8%EB%A1%A4%EB%9F%AC_ADC.pdf",
  "19.미스트필터(EMF).pdf": "https://s2ewpp0blvbzv3no.private.blob.vercel-storage.com/catalogs/19.%EB%AF%B8%EC%8A%A4%ED%8A%B8%ED%95%84%ED%84%B0%28EMF%29.pdf",
  "2-1오일펌프 중대형E2S.pdf": "https://s2ewpp0blvbzv3no.private.blob.vercel-storage.com/catalogs/2-1%EC%98%A4%EC%9D%BC%ED%8E%8C%ED%94%84%20%EC%A4%91%EB%8C%80%ED%98%95E2S.pdf",
  "2.오일펌프_중대형E2M.pdf": "https://s2ewpp0blvbzv3no.private.blob.vercel-storage.com/catalogs/2.%EC%98%A4%EC%9D%BC%ED%8E%8C%ED%94%84_%EC%A4%91%EB%8C%80%ED%98%95E2M.pdf",
  "20.진공펌프오일_Ultra19.pdf": "https://s2ewpp0blvbzv3no.private.blob.vercel-storage.com/catalogs/20.%EC%A7%84%EA%B3%B5%ED%8E%8C%ED%94%84%EC%98%A4%EC%9D%BC_Ultra19.pdf",
  "21.피팅_52~57페이지사용.PDF": "https://s2ewpp0blvbzv3no.private.blob.vercel-storage.com/catalogs/21.%ED%94%BC%ED%8C%85_52~57%ED%8E%98%EC%9D%B4%EC%A7%80%EC%82%AC%EC%9A%A9.PDF",
  "3.오일펌프_nES.pdf": "https://s2ewpp0blvbzv3no.private.blob.vercel-storage.com/catalogs/3.%EC%98%A4%EC%9D%BC%ED%8E%8C%ED%94%84_nES.pdf",
  "4.스크롤펌프_소형nXDS.pdf": "https://s2ewpp0blvbzv3no.private.blob.vercel-storage.com/catalogs/4.%EC%8A%A4%ED%81%AC%EB%A1%A4%ED%8E%8C%ED%94%84_%EC%86%8C%ED%98%95nXDS.pdf",
  "5.스크롤펌프_중형XDS.pdf": "https://s2ewpp0blvbzv3no.private.blob.vercel-storage.com/catalogs/5.%EC%8A%A4%ED%81%AC%EB%A1%A4%ED%8E%8C%ED%94%84_%EC%A4%91%ED%98%95XDS.pdf",
  "6.부스터펌프EH.pdf": "https://s2ewpp0blvbzv3no.private.blob.vercel-storage.com/catalogs/6.%EB%B6%80%EC%8A%A4%ED%84%B0%ED%8E%8C%ED%94%84EH.pdf",
  "7-1.산업용드라이_EXS.pdf": "https://s2ewpp0blvbzv3no.private.blob.vercel-storage.com/catalogs/7-1.%EC%82%B0%EC%97%85%EC%9A%A9%EB%93%9C%EB%9D%BC%EC%9D%B4_EXS.pdf",
  "7.산업용드라이펌프_GXS Dry.pdf": "https://s2ewpp0blvbzv3no.private.blob.vercel-storage.com/catalogs/7.%EC%82%B0%EC%97%85%EC%9A%A9%EB%93%9C%EB%9D%BC%EC%9D%B4%ED%8E%8C%ED%94%84_GXS%20Dry.pdf",
  "8-1.반도체드라이_nXRi.pdf": "https://s2ewpp0blvbzv3no.private.blob.vercel-storage.com/catalogs/8-1.%EB%B0%98%EB%8F%84%EC%B2%B4%EB%93%9C%EB%9D%BC%EC%9D%B4_nXRi.pdf",
  "8.반도체드라이_iXH.pdf": "https://s2ewpp0blvbzv3no.private.blob.vercel-storage.com/catalogs/8.%EB%B0%98%EB%8F%84%EC%B2%B4%EB%93%9C%EB%9D%BC%EC%9D%B4_iXH.pdf",
  "9-1.헬륨리크디텍터_ELD500.pdf": "https://s2ewpp0blvbzv3no.private.blob.vercel-storage.com/catalogs/9-1.%ED%97%AC%EB%A5%A8%EB%A6%AC%ED%81%AC%EB%94%94%ED%85%8D%ED%84%B0_ELD500.pdf",
  "9.반도체드라이_iXL.pdf": "https://s2ewpp0blvbzv3no.private.blob.vercel-storage.com/catalogs/9.%EB%B0%98%EB%8F%84%EC%B2%B4%EB%93%9C%EB%9D%BC%EC%9D%B4_iXL.pdf",
};

export async function GET(req: NextRequest) {
  const filename = req.nextUrl.searchParams.get("file");
  if (!filename) {
    return NextResponse.json({ error: "file 파라미터 필요" }, { status: 400 });
  }

  const blobUrl = CATALOG_URLS[filename];
  if (!blobUrl) {
    return NextResponse.json({ error: "카탈로그를 찾을 수 없습니다" }, { status: 404 });
  }

  const res = await fetch(blobUrl, {
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "다운로드 실패" }, { status: 502 });
  }

  return new NextResponse(res.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${encodeURIComponent(filename)}"`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
