/**
 * public/catalogs/ 의 PDF 파일을 Vercel Blob에 업로드하고
 * 업로드된 URL 목록을 출력하는 스크립트
 *
 * 실행: node scripts/upload-catalogs.mjs
 */

import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// .env 파일에서 환경변수 수동 로드 (CRLF 대응)
const __dir = path.dirname(fileURLToPath(import.meta.url));
for (const envFile of [".env", ".env.local"]) {
  const envPath = path.join(__dir, "..", envFile);
  if (!fs.existsSync(envPath)) continue;
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split(/\r?\n/)) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match) {
      const val = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[match[1]]) process.env[match[1]] = val;
    }
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOGS_DIR = path.join(__dirname, "..", "public", "catalogs");

const files = fs.readdirSync(CATALOGS_DIR).filter(f =>
  f.toLowerCase().endsWith(".pdf")
);

console.log(`총 ${files.length}개 PDF 업로드 시작...\n`);

const urlMap = {};

for (const filename of files) {
  const filePath = path.join(CATALOGS_DIR, filename);
  const fileBuffer = fs.readFileSync(filePath);

  try {
    process.stdout.write(`업로드: ${filename} ... `);
    const blob = await put(`catalogs/${filename}`, fileBuffer, {
      access: "private",
      contentType: "application/pdf",
      addRandomSuffix: false,
    });
    urlMap[filename] = blob.url;
    console.log(`✅`);
  } catch (e) {
    console.log(`❌ ${e.message}`);
  }
}

console.log("\n=== 업로드 완료 URL 목록 ===");
for (const [name, url] of Object.entries(urlMap)) {
  console.log(`"${name}": "${url}"`);
}

const outputPath = path.join(__dirname, "catalog-urls.json");
fs.writeFileSync(outputPath, JSON.stringify(urlMap, null, 2), "utf-8");
console.log(`\n결과 저장: scripts/catalog-urls.json`);
