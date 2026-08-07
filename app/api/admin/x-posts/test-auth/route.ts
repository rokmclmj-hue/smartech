import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyXAuth } from "@/lib/x-post";

async function requireAdmin() {
  const session = await auth();
  return (session?.user as { tier?: string })?.tier === "ADMIN";
}

// GET: X API 키가 유효한지만 확인 (트윗을 올리지 않는 진단용, 부작용 없음)
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }
  const result = await verifyXAuth();
  return NextResponse.json(result);
}
