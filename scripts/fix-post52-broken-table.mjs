import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// id=52 naverContent의 표는 헤더 행 자체가 유실되어 "---|------|...|" 형태로 깨져 있었음.
// content(홈페이지 버전)에 이미 있는 정확한 라벨(규격/별칭/크기 범위/도달 진공도/조립 방법)을 그대로 사용.
const BROKEN = `---|------|----------|-----------|---------|
| KF(NW) | QF, Klein Flange | NW10~NW50 | ~10⁻⁸ mbar | 클램프 1개 + O링 |
| ISO-K | DN63~DN500 | DN63~DN500 | ~10⁻⁹ mbar | 클램프 또는 볼트 |
| CF | ConFlat | CF35~CF200 | ~10⁻¹² mbar | 볼트 + 금속 개스킷 |`;

const FIXED = `- **규격: KF(NW)** — 별칭: QF, Klein Flange / 크기 범위: NW10~NW50 / 도달 진공도: ~10⁻⁸ mbar / 조립 방법: 클램프 1개 + O링
- **규격: ISO-K** — 별칭: DN63~DN500 / 크기 범위: DN63~DN500 / 도달 진공도: ~10⁻⁹ mbar / 조립 방법: 클램프 또는 볼트
- **규격: CF** — 별칭: ConFlat / 크기 범위: CF35~CF200 / 도달 진공도: ~10⁻¹² mbar / 조립 방법: 볼트 + 금속 개스킷`;

async function main() {
  const post = await prisma.blogPost.findUnique({ where: { id: 52 } });
  if (!post.naverContent.includes(BROKEN)) throw new Error("대상 문자열을 찾지 못함");
  const naverContent = post.naverContent.split(BROKEN).join(FIXED);
  await prisma.blogPost.update({ where: { id: 52 }, data: { naverContent } });
  console.log("id=52 naverContent 표 수정 완료");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
