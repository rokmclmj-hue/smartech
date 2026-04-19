import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { email, password, name, company } = await req.json();

  if (!email || !password || !name || !company) {
    return NextResponse.json({ error: "모든 필드를 입력해주세요" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "이미 등록된 이메일입니다" }, { status: 409 });
  }

  const passwordHash = await hash(password, 12);
  await prisma.user.create({
    data: { email, name, company, passwordHash, tier: "PENDING" },
  });

  return NextResponse.json({ ok: true });
}
