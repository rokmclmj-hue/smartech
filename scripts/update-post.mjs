/**
 * 특정 블로그 글을 재업로드 (이미지 Blob 업로드 후 DB 업데이트)
 * 사용법: node scripts/update-post.mjs <postId> <주제>
 */
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// .env 로드
const envPath = new URL('../.env', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=\s][^=]*)=["']?(.+?)["']?\s*$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
}

const SECRET = envVars['BLOG_UPLOAD_SECRET'];
const BASE_URL = envVars['API_URL']?.rsplit?.('/api/', 1)?.[0] ?? 'https://www.smartechvacuum.com';
const IMG_UPLOAD_URL = `${BASE_URL.replace('/api/upload-blog', '')}/api/upload-image`.replace(/\/api\/upload-blog/, '');

const postId = parseInt(process.argv[2]);
const topic  = process.argv[3];

if (!postId || !topic) {
  console.error('사용법: node scripts/update-post.mjs <postId> <주제>');
  process.exit(1);
}

const BLOG_FOLDER = path.join('블로그', 'output', topic);
const IMAGES_DIR  = path.join(BLOG_FOLDER, 'images');

// Blob 업로드
async function uploadToBlob(filepath, filename) {
  const fileData = fs.readFileSync(filepath);
  const boundary = `boundary${Date.now()}`;
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="folder"\r\n\r\nblog\r\n--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: image/png\r\n\r\n`),
    fileData,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);
  const res = await fetch(`https://www.smartechvacuum.com/api/upload-image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SECRET}`, 'Content-Type': `multipart/form-data; boundary=${boundary}` },
    body,
  });
  const json = await res.json();
  return json.url;
}

// final.md 읽고 이미지 업로드 후 URL 치환
let content = fs.readFileSync(path.join(BLOG_FOLDER, 'final.md'), 'utf8');

// frontmatter 파싱
let category = '기술문의';
if (content.startsWith('---')) {
  const end = content.indexOf('---', 3);
  if (end !== -1) {
    const fm = content.slice(3, end).trim();
    for (const line of fm.split('\n')) {
      if (line.startsWith('category:')) category = line.split(':', 1)[1]?.trim() ?? category;
    }
    content = content.slice(end + 3).trimStart();
  }
}

// 이미지 업로드 및 치환
const imagePattern = /!\[([^\]]*)\]\(\.\/images\/([^)]+)\)/g;
const matches = [...content.matchAll(imagePattern)];
console.log(`이미지 ${matches.length}개 업로드 중...`);

for (const match of matches) {
  const [full, alt, filename] = match;
  const filepath = path.join(IMAGES_DIR, filename);
  if (!fs.existsSync(filepath)) { console.log(`  [SKIP] ${filename}`); continue; }
  console.log(`  업로드: ${filename}`);
  const url = await uploadToBlob(filepath, filename);
  console.log(`  완료:   ${url}`);
  content = content.replace(full, `![${alt}](${url})`);
}

// 제목 추출
const titleMatch = content.match(/^#\s+(.+)$/m);
const title = titleMatch?.[1]?.trim() ?? topic;

// 태그 추출
const tagsMatch = content.match(/(#\S+(?:\s+#\S+)+)\s*$/m);
const tags = tagsMatch?.[1]?.trim() ?? '';

// meta.txt
const metaPath = path.join(BLOG_FOLDER, 'meta.txt');
const metaDesc = fs.existsSync(metaPath) ? fs.readFileSync(metaPath, 'utf8').trim() : '';

// naver.md
const naverPath = path.join(BLOG_FOLDER, 'naver.md');
const naverContent = fs.existsSync(naverPath) ? fs.readFileSync(naverPath, 'utf8').trim() : '';

// DB 업데이트
console.log(`\nDB 업데이트 (id=${postId}, 카테고리=${category})...`);
await prisma.blogPost.update({
  where: { id: postId },
  data: { title, content, naverContent, metaDesc, tags, category },
});

console.log(`\n✅ 완료! https://www.smartechvacuum.com/blog/${postId}`);
await prisma.$disconnect();
