import { NextRequest, NextResponse } from "next/server";
import { verifyBusinessNo } from "@/lib/verify-biz";

export async function POST(req: NextRequest) {
  try {
    const { businessNo } = await req.json();
    if (!businessNo || typeof businessNo !== "string") {
      return NextResponse.json({ error: "사업자등록번호를 입력해 주세요." }, { status: 400 });
    }
    const result = await verifyBusinessNo(businessNo);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
