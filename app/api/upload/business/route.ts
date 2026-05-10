import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const timestamp = Date.now();
    const safeUserId = userId ? userId.replace(/[^a-zA-Z0-9]/g, "") : "unknown";
    const fileName = `${safeUserId}_${timestamp}.${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "business");
    await mkdir(uploadDir, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    return NextResponse.json({ url: `/uploads/business/${fileName}` });
  } catch (err) {
    console.error("파일 업로드 오류:", err);
    return NextResponse.json({ error: "파일 업로드에 실패했습니다" }, { status: 500 });
  }
}
