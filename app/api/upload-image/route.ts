import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

// 블로그 에이전트가 이미지를 Vercel Blob에 업로드하는 엔드포인트
// multipart/form-data로 이미지 파일 받아서 Blob에 저장 후 URL 반환
export async function POST(req: NextRequest) {
  const secret = process.env.BLOG_UPLOAD_SECRET;
  const auth = req.headers.get("Authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) ?? "blog";

  if (!file) {
    return NextResponse.json({ error: "file 필드 필요" }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const filename = `${folder}/${Date.now()}-${file.name}`;

  const blob = await put(filename, buffer, {
    access: "private",
    contentType: file.type || "image/png",
    addRandomSuffix: false,
  });

  return NextResponse.json({ ok: true, url: blob.url });
}
