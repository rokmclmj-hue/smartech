import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// 관리자만 호출 가능한 국세청 API 테스트 엔드포인트
export async function GET(req: NextRequest) {
  const session = await auth();
  if ((session?.user as any)?.tier !== "ADMIN") {
    return NextResponse.json({ error: "관리자만 접근 가능" }, { status: 403 });
  }

  const apiKey = process.env.BIZ_API_KEY;
  const result: Record<string, unknown> = {
    hasKey: !!apiKey,
    keyLength: apiKey?.length ?? 0,
  };

  if (!apiKey) {
    return NextResponse.json(result);
  }

  try {
    const url = `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${encodeURIComponent(apiKey)}&returnType=JSON`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ b_no: ["2158624821"] }),
    });
    result.httpStatus = res.status;
    result.httpOk = res.ok;
    const text = await res.text();
    result.rawResponse = text.slice(0, 500);
    try { result.parsed = JSON.parse(text); } catch { /* ignore */ }
  } catch (err) {
    result.fetchError = String(err);
  }

  return NextResponse.json(result);
}
