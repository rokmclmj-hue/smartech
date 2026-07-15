import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const DRY_RUN = process.argv.includes("--dry-run");

function parseTableBlock(lines) {
  // lines: 마크다운 표 전체 라인 배열 (헤더 + 구분선 + 데이터행)
  const cells = (line) =>
    line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
  const header = cells(lines[0]);
  const dataLines = lines.slice(2); // lines[1]은 |---|---| 구분선
  const rows = dataLines.map(cells);
  return { header, rows };
}

function tableToBullets({ header, rows }) {
  const out = [];
  if (header.length === 2) {
    // 2열: 항목/값 → 단순 불릿
    for (const row of rows) {
      out.push(`- **${row[0]}**: ${row[1]}`);
    }
    return out.join("\n");
  }
  // 3열 이상: 1열=행 라벨, 나머지 열=그룹(비교 대상) → writer.md 표준 형식
  const groupNames = header.slice(1);
  for (let g = 0; g < groupNames.length; g++) {
    out.push(`**${groupNames[g]}**`);
    for (const row of rows) {
      out.push(`- ${row[0]}: ${row[g + 1]}`);
    }
    if (g < groupNames.length - 1) out.push("");
  }
  return out.join("\n");
}

function convertTablesInText(text) {
  const lines = text.split("\n");
  const out = [];
  let i = 0;
  let count = 0;
  while (i < lines.length) {
    const line = lines[i];
    const isTableHeader = /^\|.*\|\s*$/.test(line.trim());
    const nextIsSeparator = i + 1 < lines.length && /^\|?[\s:-]+\|[\s:|-]+$/.test(lines[i + 1].trim());
    if (isTableHeader && nextIsSeparator) {
      const block = [lines[i], lines[i + 1]];
      let j = i + 2;
      while (j < lines.length && /^\|.*\|\s*$/.test(lines[j].trim())) {
        block.push(lines[j]);
        j++;
      }
      const parsed = parseTableBlock(block);
      out.push(tableToBullets(parsed));
      count++;
      i = j;
      continue;
    }
    out.push(line);
    i++;
  }
  return { text: out.join("\n"), count };
}

async function main() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, slug: true, naverContent: true },
  });

  for (const post of posts) {
    const { text, count } = convertTablesInText(post.naverContent);
    if (count === 0) continue;
    console.log(`\n=== id=${post.id} slug=${post.slug} — 표 ${count}개 변환 ===`);
    console.log(text);
    if (!DRY_RUN) {
      await prisma.blogPost.update({ where: { id: post.id }, data: { naverContent: text } });
    }
  }

  console.log(DRY_RUN ? "\n(dry-run — DB 미반영)" : "\nDB 반영 완료");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
