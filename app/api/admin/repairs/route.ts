import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Session } from "next-auth";

function isAdmin(session: Session | null) {
  return (session?.user as any)?.tier === "ADMIN";
}

// GET /api/admin/repairs — 수리 접수 전체 목록
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // 필터
  const page = Number(searchParams.get("page") ?? 1);
  const limit = 20;

  const where = status && status !== "ALL" ? { status } : {};

  const [repairs, total] = await Promise.all([
    prisma.repairRequest.findMany({
      where,
      include: {
        files: { select: { fileType: true } },
        statusLogs: { orderBy: { createdAt: "desc" }, take: 1 },
        uploadTokens: { select: { id: true, expiresAt: true, usedAt: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.repairRequest.count({ where }),
  ]);

  return NextResponse.json({ repairs, total, page, pages: Math.ceil(total / limit) });
}

// PATCH /api/admin/repairs — 수리 상태 업데이트
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const body = await req.json();
  const { id, status, adminNote, extraAmount } = body;

  if (!id || !status) return NextResponse.json({ error: "id, status 필수" }, { status: 400 });

  const current = await prisma.repairRequest.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: "접수 없음" }, { status: 404 });

  const totalAmount = (current.baseAmount ?? 0) + (extraAmount ?? current.extraAmount ?? 0);

  const updated = await prisma.repairRequest.update({
    where: { id },
    data: {
      status,
      adminNote: adminNote ?? current.adminNote,
      extraAmount: extraAmount ?? current.extraAmount,
      totalAmount,
      statusLogs: {
        create: {
          fromStatus: current.status,
          toStatus: status,
          note: adminNote ?? null,
          changedBy: "admin",
        },
      },
    },
  });

  // 고객에게 SMS (연락처 있을 때만)
  if (current.contactPhone) {
    try {
      const { notifyRepairStatus } = await import("@/lib/solapi");
      await notifyRepairStatus(current.contactPhone, current.repairNo, status);
    } catch {
      // SMS 실패해도 상태 업데이트는 성공
    }
  }

  return NextResponse.json({ repair: updated });
}
