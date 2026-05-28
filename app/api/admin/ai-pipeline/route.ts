import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import fs from "fs";
import path from "path";

function parsePostFile(filename: string, content: string) {
  const nameMatch = filename.match(/글_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})_(통과|반려)\.md/);
  const date = nameMatch
    ? `${nameMatch[1]}-${nameMatch[2]}-${nameMatch[3]} ${nameMatch[4]}:${nameMatch[5]}`
    : "";
  const status = nameMatch ? nameMatch[6] : "알수없음";

  const categoryMatch = content.match(/## 주제 카테고리:\s*(.+)/);
  const category = categoryMatch ? categoryMatch[1].trim() : "일반";

  const titleMatch = content.match(/\*\*제목:\*\*\s*(.+)/) ||
                     content.match(/\*\*선정 주제:\*\*\s*"?([^"\n]+)"?\s*$/m);
  const seoTitle = titleMatch ? titleMatch[1].trim().replace(/^"|"$/g, "") : "";

  const metaMatch = content.match(/\*\*메타설명:\*\*\s*(.+)/);
  const metaDesc = metaMatch ? metaMatch[1].trim() : "";

  const tagsMatch = content.match(/\*\*태그:\*\*\s*(.+)/);
  const tags = tagsMatch ? tagsMatch[1].trim() : "";

  const reasonMatch = content.match(/이유:\s*(.+)/);
  const rejectionReason = status === "반려" ? (reasonMatch ? reasonMatch[1].trim() : "") : "";

  // 발행용 글 본문 추출
  let finalContent = "";
  const publishMatch = content.match(/---발행용---\n([\s\S]+?)(?=\n---네이버블로그---|$)/);
  if (publishMatch) {
    finalContent = publishMatch[1].trim();
  } else {
    const draftMatch = content.match(/## 최종 초안 \(2팀 반려[^)]*\)\n\n([\s\S]+)$/);
    if (draftMatch) {
      finalContent = draftMatch[1].trim();
    } else {
      const simpleDraftMatch = content.match(/## 최종 초안\n\n([\s\S]+)$/);
      if (simpleDraftMatch) finalContent = simpleDraftMatch[1].trim();
    }
  }

  // 네이버 블로그 버전 추출
  const naverMatch = content.match(/---네이버블로그---\n([\s\S]+)$/);
  const naverContent = naverMatch ? naverMatch[1].trim() : "";

  // D1 사진 메타데이터 추출
  const photoTop = (content.match(/## 사진_상단:\s*(.+)/) || [])[1]?.trim() || "";
  const photoMid = (content.match(/## 사진_중간:\s*(.+)/) || [])[1]?.trim() || "";
  const photoEnd = (content.match(/## 사진_하단:\s*(.+)/) || [])[1]?.trim() || "";

  return { filename, date, status, category, seoTitle, metaDesc, tags, rejectionReason, finalContent, naverContent, photoTop, photoMid, photoEnd };
}

// GET: 파일 목록 또는 단일 파일 내용
export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const file = searchParams.get("file");
  const contentDir = path.join(process.cwd(), "data", "콘텐츠");

  if (!fs.existsSync(contentDir)) {
    return NextResponse.json({ posts: [] });
  }

  if (file) {
    const filePath = path.join(contentDir, file);
    if (!fs.existsSync(filePath) || !file.endsWith(".md")) {
      return NextResponse.json({ error: "파일 없음" }, { status: 404 });
    }
    const content = fs.readFileSync(filePath, "utf8");
    const parsed = parsePostFile(file, content);
    return NextResponse.json(parsed);
  }

  const files = fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith(".md"))
    .sort((a, b) => b.localeCompare(a));

  const posts = files.map((filename) => {
    const content = fs.readFileSync(path.join(contentDir, filename), "utf8");
    const parsed = parsePostFile(filename, content);
    return {
      filename: parsed.filename,
      date: parsed.date,
      status: parsed.status,
      category: parsed.category,
      seoTitle: parsed.seoTitle,
      rejectionReason: parsed.rejectionReason,
    };
  });

  return NextResponse.json({ posts });
}

// POST: 블로그에 등록 (BlogPost 테이블 저장)
export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { filename } = await req.json();
  const contentDir = path.join(process.cwd(), "data", "콘텐츠");
  const filePath = path.join(contentDir, filename);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "파일 없음" }, { status: 404 });
  }

  const content = fs.readFileSync(filePath, "utf8");
  const parsed = parsePostFile(filename, content);

  if (parsed.status !== "통과") {
    return NextResponse.json({ error: "통과된 글만 등록 가능합니다" }, { status: 400 });
  }

  const { prisma } = await import("@/lib/db");

  // 이미 등록된 파일인지 확인
  const existing = await prisma.blogPost.findFirst({ where: { sourceFile: filename } });
  if (existing) {
    return NextResponse.json({ error: "이미 등록된 글입니다", id: existing.id }, { status: 409 });
  }

  const post = await prisma.blogPost.create({
    data: {
      title: parsed.seoTitle || parsed.category + " 관련 글",
      content: parsed.finalContent,
      metaDesc: parsed.metaDesc,
      tags: parsed.tags,
      category: parsed.category,
      status: "DRAFT",
      sourceFile: filename,
    },
  });

  return NextResponse.json({ id: post.id });
}
