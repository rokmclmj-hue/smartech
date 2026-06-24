import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const secret = process.env.BLOG_UPLOAD_SECRET;
  const auth = req.headers.get("Authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  let path: string;
  try {
    const body = await req.json();
    path = body?.path;
  } catch {
    return NextResponse.json({ error: "잘못된 JSON" }, { status: 400 });
  }

  if (!path || !/^\/blog\/\d+$/.test(path)) {
    return NextResponse.json({ error: "path는 /blog/{숫자} 형식만 허용" }, { status: 400 });
  }

  revalidatePath(path);
  return NextResponse.json({ ok: true, path });
}
