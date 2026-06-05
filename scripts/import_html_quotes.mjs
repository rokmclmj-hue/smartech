/**
 * 견적서_AI.html 백업 → 견적 이력 DB 가져오기 (업체별 최신 1건)
 */
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';

const TIER_MAP = {
  'keyd': 'KEY_DEALER', 'key_dealer': 'KEY_DEALER',
  'dealer': 'DEALER', '딜러': 'DEALER',
  'oem': 'OEM', 'OEM': 'OEM',
  'enduser': 'ENDUSER', '엔드유저': 'ENDUSER',
};
function mapTier(raw) {
  return TIER_MAP[raw?.trim()?.toLowerCase()] ?? 'ENDUSER';
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) { console.error('사용법: node scripts/import_html_quotes.mjs <백업파일>'); process.exit(1); }

  const backup = JSON.parse(readFileSync(filePath, 'utf8'));
  const all = JSON.parse(backup.quoteHistory || '[]');
  console.log(`\n📋 전체 견적 이력: ${all.length}건`);

  // 업체별 최신 1건만 선택
  const latestMap = new Map();
  for (const h of all) {
    const company = h.rName?.trim() || '미상';
    const prev = latestMap.get(company);
    if (!prev || new Date(h.savedAt) > new Date(prev.savedAt)) {
      latestMap.set(company, h);
    }
  }
  const selected = [...latestMap.values()];
  console.log(`✂️  업체별 최신 1건: ${selected.length}건`);

  const prisma = new PrismaClient();
  // 관리자(admin) ID 가져오기
  const admin = await prisma.user.findFirst({ where: { tier: 'ADMIN' }, select: { id: true } });
  if (!admin) { console.error('관리자 계정이 없습니다.'); await prisma.$disconnect(); process.exit(1); }

  let created = 0;
  for (const h of selected) {
    const expiresAt = new Date(h.savedAt || h.qdate);
    expiresAt.setDate(expiresAt.getDate() + 14);

    const items = (h.items || []).filter(i => i.qty > 0 && i.unitPrice >= 0);
    if (items.length === 0) continue;

    const totalAmount = items.reduce((s, i) => s + (i.unitPrice * i.qty), 0);

    await prisma.quote.create({
      data: {
        createdByAdminId: admin.id,
        status: h.status === 'ordered' ? 'CONFIRMED' : 'SENT',
        guestCompany: h.rName?.trim() || '',
        guestName: h.rContact?.trim() || '',
        guestEmail: h.rEmail?.trim() || null,
        guestPhone: h.rMobile?.trim() || null,
        guestTier: mapTier(h.ptype),
        totalAmount,
        expiresAt,
        createdAt: new Date(h.savedAt || h.qdate),
        note: `[HTML이력] ${h.qnum}`,
        items: {
          create: items.map(i => ({
            quantity: i.qty,
            unitPrice: i.unitPrice,
            customPartNo: i.code === '*' ? null : (i.code?.trim() || null),
            customDescription: i.name?.trim() || '',
          })),
        },
      },
    });
    created++;
    console.log(`  ✓ ${h.rName} (${h.qnum}) — ${totalAmount.toLocaleString()}원`);
  }

  console.log(`\n✅ ${created}건 가져오기 완료`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
