import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Session } from "next-auth";

function isAdmin(session: Session | null) {
  return (session?.user as any)?.tier === "ADMIN";
}

// GET — 전체 키트 목록
export async function GET() {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const kits = await prisma.repairKit.findMany({
    include: {
      parts: { orderBy: { sortOrder: "asc" } },
      extraParts: true,
    },
    orderBy: [{ pumpFamily: "asc" }, { pumpModel: "asc" }],
  });

  return NextResponse.json({ kits });
}

// POST — 새 키트 생성
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const body = await req.json();
  const { pumpFamily, pumpMaker, pumpModel, modelGroup, basePrice, tier2Price, tier3Price, description } = body;

  if (!pumpFamily || !pumpModel) {
    return NextResponse.json({ error: "pumpFamily, pumpModel 필수" }, { status: 400 });
  }

  const kit = await prisma.repairKit.create({
    data: {
      pumpFamily,
      pumpMaker: pumpMaker ?? "EDWARDS",
      pumpModel,
      modelGroup: modelGroup ?? null,
      basePrice: basePrice ?? 0,
      tier2Price: tier2Price ?? 0,
      tier3Price: tier3Price ?? 0,
      description: description ?? null,
    },
    include: { parts: true, extraParts: true },
  });

  return NextResponse.json({ kit }, { status: 201 });
}

// PATCH — 키트 수정
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const body = await req.json();
  const { id, pumpFamily, pumpMaker, pumpModel, modelGroup, basePrice, tier2Price, tier3Price, description, isActive } = body;

  if (!id) return NextResponse.json({ error: "id 필수" }, { status: 400 });

  const kit = await prisma.repairKit.update({
    where: { id },
    data: {
      ...(pumpFamily !== undefined && { pumpFamily }),
      ...(pumpMaker !== undefined && { pumpMaker }),
      ...(pumpModel !== undefined && { pumpModel }),
      ...(modelGroup !== undefined && { modelGroup }),
      ...(basePrice !== undefined && { basePrice }),
      ...(tier2Price !== undefined && { tier2Price }),
      ...(tier3Price !== undefined && { tier3Price }),
      ...(description !== undefined && { description }),
      ...(isActive !== undefined && { isActive }),
    },
    include: { parts: true, extraParts: true },
  });

  return NextResponse.json({ kit });
}

// DELETE — 키트 삭제 (비활성화)
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id 필수" }, { status: 400 });

  await prisma.repairKit.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
