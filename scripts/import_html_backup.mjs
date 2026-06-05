/**
 * 견적서_AI.html 백업 JSON → DB 가져오기
 * 사용법: node scripts/import_html_backup.mjs <백업파일경로>
 */
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';

const TIER_MAP = {
  '딜러': 'DEALER',
  '키딜러': 'KEY_DEALER',
  'VIP딜러': 'VIP_DEALER',
  'oem': 'OEM',
  'OEM': 'OEM',
  '엔드유저': 'ENDUSER',
  'enduser': 'ENDUSER',
};

function mapTier(raw) {
  return TIER_MAP[raw?.trim()] ?? 'ENDUSER';
}

function isValidContact(ct) {
  const name = ct.name?.trim() ?? '';
  return name.length > 0 && name !== ':' && name !== '-';
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('사용법: node scripts/import_html_backup.mjs <백업파일경로>');
    process.exit(1);
  }

  const raw = readFileSync(filePath, 'utf8');
  const backup = JSON.parse(raw);

  const book = JSON.parse(backup.receiverBook2 || '[]');
  console.log(`\n📋 거래처 ${book.length}개 발견`);

  const prisma = new PrismaClient();

  let companyCreated = 0, companySkipped = 0;
  let contactCreated = 0;

  for (const entry of book) {
    const companyName = entry.company?.trim();
    if (!companyName) { companySkipped++; continue; }

    const tier = mapTier(entry.type);
    const validContacts = (entry.contacts || []).filter(isValidContact);

    // 대표 연락처 (첫 번째 유효 담당자)
    const primary = validContacts[0];
    const phone = primary?.mobile?.trim() || primary?.tel?.trim() || null;
    const email = primary?.email?.trim() || null;

    // 기존 거래처 확인 (중복 방지)
    const existing = await prisma.knownCompany.findFirst({
      where: { companyName },
    });

    let company;
    if (existing) {
      company = existing;
      companySkipped++;
    } else {
      company = await prisma.knownCompany.create({
        data: {
          companyName,
          phone,
          email,
          tier,
          source: 'html_backup',
        },
      });
      companyCreated++;
    }

    // 담당자 추가 (기존 담당자와 중복 방지)
    for (const ct of validContacts) {
      const name = ct.name.trim();
      const existing = await prisma.knownContact.findFirst({
        where: { companyId: company.id, name },
      });
      if (!existing) {
        await prisma.knownContact.create({
          data: {
            companyId: company.id,
            name,
            title: ct.title?.trim() || null,
            tel: ct.tel?.trim() || null,
            mobile: ct.mobile?.trim() || null,
            email: ct.email?.trim() || null,
          },
        });
        contactCreated++;
      }
    }
  }

  console.log(`\n✅ 가져오기 완료`);
  console.log(`   거래처 신규: ${companyCreated}개 / 기존(스킵): ${companySkipped}개`);
  console.log(`   담당자 신규: ${contactCreated}명`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
