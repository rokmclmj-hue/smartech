import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const SKIP_PATTERNS = ["admin", "auth", "mypage", "quote", "upload", "offline-upload"];

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, files);
    else if (entry.name === "page.tsx") files.push(p);
  }
  return files;
}

const pages = walk("./app");
let issues = 0;

console.log("\n🔍 SEO 메타데이터 점검 결과\n");
console.log("─".repeat(70));

for (const page of pages) {
  const rel = page.replace(/\\/g, "/");
  const skip = SKIP_PATTERNS.some((s) => rel.includes(`/${s}/`) || rel.endsWith(`/${s}/page.tsx`));
  if (skip) continue;

  const content = readFileSync(page, "utf-8");
  const hasMetadata = /generateMetadata|export const metadata/.test(content);
  const isClient = content.includes('"use client"');
  const hasCanonical = content.includes("canonical");

  const label = rel.replace("./app/", "app/").replace(/\\/g, "/");

  if (!hasMetadata && !isClient) {
    console.log(`❌ metadata 없음          : ${label}`);
    issues++;
  } else if (isClient && !hasMetadata) {
    console.log(`⚠️  use client (래퍼 필요) : ${label}`);
    issues++;
  } else if (hasMetadata && !hasCanonical) {
    console.log(`🔸 canonical 누락         : ${label}`);
    issues++;
  } else {
    console.log(`✅ 정상                   : ${label}`);
  }
}

console.log("─".repeat(70));
if (issues === 0) {
  console.log("\n✨ 모든 페이지 SEO 정상!\n");
} else {
  console.log(`\n총 ${issues}개 문제 발견. 수정 후 다시 확인하세요.\n`);
  process.exit(1);
}
