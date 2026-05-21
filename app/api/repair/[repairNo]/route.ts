import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/repair/[repairNo] — 수리 접수 상세 (마이페이지 + 관리자)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ repairNo: string }> }
) {
  const session = await auth();
  const { repairNo } = await params;

  const repair = await prisma.repairRequest.findUnique({
    where: { repairNo },
    include: {
      files: { orderBy: { createdAt: "asc" } },
      statusLogs: { orderBy: { createdAt: "asc" } },
      kit: { include: { parts: true, extraParts: true } },
    },
  });

  if (!repair) {
    return NextResponse.json({ error: "접수를 찾을 수 없습니다." }, { status: 404 });
  }

  // 로그인한 사용자 본인 또는 관리자만 조회 가능
  const userId = session?.user?.id ? Number(session.user.id) : null;
  const tier = (session?.user as { tier?: string })?.tier;
  const isAdmin = tier === "ADMIN";
  const isOwner = repair.userId !== null && repair.userId === userId;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  return NextResponse.json({ repair });
}
