import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Session } from "next-auth";

function isAdmin(session: Session | null) {
  return (session?.user as any)?.tier === "ADMIN";
}

// POST /api/admin/repairs/[id]/upload-token — 외주업체 일회용 업로드 링크 생성
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const repairId = Number(id);

  const repair = await prisma.repairRequest.findUnique({ where: { id: repairId } });
  if (!repair) return NextResponse.json({ error: "접수 없음" }, { status: 404 });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7일

  const uploadToken = await prisma.uploadToken.create({
    data: { repairId, expiresAt },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";
  const uploadUrl = `${baseUrl}/repair/upload/${uploadToken.token}`;

  // 외주업체 전화번호가 있으면 SMS 발송 (요청 body에서 받음)
  const body = await req.json().catch(() => ({}));
  if (body.phone) {
    try {
      const { notifyPartnerUpload } = await import("@/lib/solapi");
      // 링크를 문자로 보내는 용도로 활용
      const { SolapiMessageService } = await import("solapi");
      const svc = new SolapiMessageService(
        process.env.SOLAPI_API_KEY!,
        process.env.SOLAPI_API_SECRET!
      );
      await svc.send({
        to: body.phone,
        from: process.env.ADMIN_PHONE!,
        text: `[스마텍] 수리 접수 ${repair.repairNo} 업로드 링크\n${uploadUrl}\n(7일 후 만료)`,
      });
    } catch {
      // SMS 실패해도 링크는 반환
    }
  }

  return NextResponse.json({ token: uploadToken.token, uploadUrl, expiresAt });
}
