import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// id=58 (oled-lcd-dry-pump-conversion) 글에서 GXS(드라이 스크류)를 "루츠 부스터"로
// 잘못 서술한 부분 수정. 실제 Edwards 분류: GXS=드라이 스크류, EH=루츠(기계식) 부스터.
// 대형 스퍼터링 챔버 GXS 납품 사례는 실제 사실(대표님 확인), iXH 조합 부분은 사실무근이라 제거.
const REPLACEMENTS = [
  [
    "## Edwards 드라이펌프 + GXS 부스터 조합 사례",
    "## Edwards 드라이 스크류 펌프 + 루츠 부스터 조합 사례",
  ],
  [
    "챔버 용적이 크거나 배기 속도가 부족할 경우, GXS(루츠 부스터)와 드라이 스크류 펌프를 조합하는 구성을 검토한다.",
    "챔버 용적이 크거나 배기 속도가 부족할 경우, 드라이 스크류 펌프(GXS)와 루츠 부스터(EH 시리즈)를 조합하는 구성을 검토한다.",
  ],
  [
    "GXS 시리즈는 루츠 원리로 작동하며, 드라이 백킹 펌프와 결합하면 중간 진공 구간의 배기 속도를 크게 높인다. 오일 없는 구성이 유지되므로 챔버 오염 위험이 없다. 스마텍에서 납품한 사례 중, 대형 스퍼터링 챔버에 GXS + iXH 조합을 적용해 배기 시간을 단축한 경우가 있다. 챔버 용적과 공정 가스 종류에 따라 최적 조합이 달라지므로, 현장 조건 확인이 먼저다.",
    "루츠 부스터(EH)는 루츠 원리로 작동하며, 드라이 백킹 펌프(GXS 등)와 결합하면 중간 진공 구간의 배기 속도를 크게 높인다. 오일 없는 구성이 유지되므로 챔버 오염 위험이 없다. 스마텍에서 대형 스퍼터링 챔버에 GXS를 납품해 배기 시간을 단축한 사례가 있다. 챔버 용적과 공정 가스 종류에 따라 최적 조합이 달라지므로, 현장 조건 확인이 먼저다.",
  ],
  [
    "GXS 부스터와 조합 구성이 필요하거나 특수 사양(가스 처리 옵션 등)이 포함되면 납기가 늘어날 수 있다.",
    "루츠 부스터(EH)와 조합 구성이 필요하거나 특수 사양(가스 처리 옵션 등)이 포함되면 납기가 늘어날 수 있다.",
  ],
  [
    "OLED·LCD 증착·스퍼터링 공정용 드라이 스크류 펌프 및 GXS 부스터 선정, 오일로터리 대체 구성 상담. 공정 가스 호환성 및 챔버 용적 기반 최적 조합 검토 가능.",
    "OLED·LCD 증착·스퍼터링 공정용 드라이 스크류 펌프(GXS) 및 루츠 부스터 선정, 오일로터리 대체 구성 상담. 공정 가스 호환성 및 챔버 용적 기반 최적 조합 검토 가능.",
  ],
];

async function main() {
  const post = await prisma.blogPost.findUnique({ where: { id: 58 } });
  if (!post) throw new Error("id=58 글을 찾을 수 없음");

  let content = post.content;
  for (const [before, after] of REPLACEMENTS) {
    if (!content.includes(before)) {
      throw new Error(`치환 대상 문자열을 찾지 못함:\n${before}`);
    }
    content = content.split(before).join(after);
  }

  await prisma.blogPost.update({ where: { id: 58 }, data: { content } });
  console.log("id=58 본문 수정 완료");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
