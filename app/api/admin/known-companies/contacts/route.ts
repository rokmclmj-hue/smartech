import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  return (session?.user as { tier?: string } | undefined)?.tier === "ADMIN";
}

// POST — 담당자 추가
export async function POST(req: NextRequest) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { companyId, name, title, tel, mobile, email } = await req.json();
  if (!companyId || !name?.trim())
    return NextResponse.json({ error: "companyId와 이름은 필수입니다" }, { status: 400 });

  const contact = await prisma.knownContact.create({
    data: {
      companyId: Number(companyId),
      name: name.trim(),
      title: title?.trim() || null,
      tel: tel?.trim() || null,
      mobile: mobile?.trim() || null,
      email: email?.trim().toLowerCase() || null,
    },
  });
  return NextResponse.json({ contact });
}

// PATCH — 담당자 수정
export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id, name, title, tel, mobile, email } = await req.json();
  if (!id) return NextResponse.json({ error: "id 필수" }, { status: 400 });

  const contact = await prisma.knownContact.update({
    where: { id: Number(id) },
    data: {
      name: name?.trim(),
      title: title?.trim() || null,
      tel: tel?.trim() || null,
      mobile: mobile?.trim() || null,
      email: email?.trim().toLowerCase() || null,
    },
  });
  return NextResponse.json({ contact });
}

// DELETE — 담당자 삭제
export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id 필수" }, { status: 400 });

  await prisma.knownContact.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
