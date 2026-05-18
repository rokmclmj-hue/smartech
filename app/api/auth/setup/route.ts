import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  const { company } = (await req.json()) as { company?: string };
  if (!company?.trim()) return NextResponse.json({ error: "회사명을 입력해주세요" }, { status: 400 });

  const userId = parseInt((session.user as any).id ?? "0", 10);
  if (!userId) return NextResponse.json({ error: "사용자 정보 오류" }, { status: 400 });

  await prisma.user.update({
    where: { id: userId },
    data: { company: company.trim() },
  });

  return NextResponse.json({ ok: true });
}
