// PDF 텍스트 추출 스크립트 (pdfjs-dist 사용)
import { getDocument, GlobalWorkerOptions } from '../node_modules/pdfjs-dist/legacy/build/pdf.mjs';
import { readFileSync, writeFileSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

GlobalWorkerOptions.workerSrc = new URL('../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).href;

const catalogDir = 'C:/Users/rokmc/smartech/public/catalogs';
const outputDir = 'C:/Users/rokmc/smartech/data';

// 커맨드라인 인수로 파일명 받기
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('사용법: node pdf-extract.mjs <파일명1> [파일명2] ...');
  process.exit(1);
}

async function extractText(filePath) {
  const data = new Uint8Array(readFileSync(filePath));
  const pdf = await getDocument({ data, useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    text += `\n--- 페이지 ${i} ---\n${pageText}`;
  }
  return text;
}

for (const filename of args) {
  const filePath = join(catalogDir, filename);
  const outName = basename(filename, '.pdf').replace('.PDF', '') + '.txt';
  const outPath = join(outputDir, outName);
  console.log(`처리 중: ${filename}`);
  try {
    const text = await extractText(filePath);
    writeFileSync(outPath, text, 'utf8');
    console.log(`  → 저장: ${outPath} (${text.length}자)`);
  } catch (e) {
    console.error(`  에러: ${e.message}`);
  }
}
