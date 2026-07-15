import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// 대표님 승인 완료된 슬러그 매핑 (2026-07-16). 번역 없이 안전하게 갈 수 있는 기계적 생성 대신,
// 표준 진공 업계 영어 용어로 직접 초안해 사용자 검토를 받은 값.
const SLUGS = {
  1: "discontinued-vacuum-pump-model-replacement",
  2: "dry-pump-dp-temp-high-alarm",
  3: "vacuum-pump-lead-time-delay",
  4: "edwards-rv-rotary-vane-pump-new-repair-used",
  19: "sputtering-dry-vacuum-pump-features",
  20: "eld500w-leak-detector-guide",
  22: "vacuum-pump-repair-precautions",
  23: "gas-ballast-oil-rotary-vane-pump-guide",
  26: "vacuum-gauge-selection-guide",
  32: "pumping-speed-roots-booster-selection",
  33: "rv-oil-rotary-vane-pump-maintenance",
  36: "hydrogen-station-fuel-cell-vacuum-pump",
  40: "battery-manufacturing-dry-pump-pfpe-oil",
  45: "vacuum-drying-dry-pump-selection",
  46: "freeze-drying-vacuum-pump-selection",
  48: "pirani-vs-ion-gauge-comparison",
  50: "vacuum-furnace-sintering-dry-screw-pump",
  51: "edwards-t-station-85d-installation",
  52: "kf-vs-iso-k-flange-fitting-guide",
  53: "rv-oil-rotary-vane-pump-repair-cost",
  57: "vacuum-pump-exhaust-noise-muffler",
  58: "oled-lcd-dry-pump-conversion",
  59: "special-gas-filling-dry-screw-pump",
  60: "freeze-drying-pump-oil-selection",
  61: "ultra-high-vacuum-ion-gauge-cold-cathode",
  62: "liquid-nitrogen-piping-dry-pump-selection",
  66: "semiconductor-etch-cmp-dry-pump-selection",
  67: "solar-cell-manufacturing-dry-pump-selection",
};

async function main() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, title: true, slug: true },
  });

  const missing = posts.filter((p) => !SLUGS[p.id]);
  if (missing.length > 0) {
    console.error("슬러그 매핑 누락:", missing.map((p) => `${p.id}: ${p.title}`));
    process.exit(1);
  }

  const slugValues = Object.values(SLUGS);
  const dupes = slugValues.filter((s, i) => slugValues.indexOf(s) !== i);
  if (dupes.length > 0) {
    console.error("중복 슬러그:", dupes);
    process.exit(1);
  }

  for (const post of posts) {
    const slug = SLUGS[post.id];
    await prisma.blogPost.update({ where: { id: post.id }, data: { slug } });
    console.log(`id=${post.id} -> slug=${slug}`);
  }

  console.log(`완료: ${posts.length}건`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
