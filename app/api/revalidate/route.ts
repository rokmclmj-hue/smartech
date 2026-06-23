import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const secret = process.env.BLOG_UPLOAD_SECRET;
  const auth = req.headers.get("Authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  const { path } = await req.json();
  if (!path) return NextResponse.json({ error: "path 필수" }, { status: 400 });

  revalidatePath(path);
  return NextResponse.json({ ok: true, path });
}
