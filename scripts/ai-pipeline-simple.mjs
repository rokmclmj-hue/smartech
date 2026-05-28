/**
 * 스마텍 AI 콘텐츠 파이프라인 — 간소화 버전
 * 에이전트 3명: 주제선정 + 글작성 + 사진선정
 * 형식: 표제 + 1문단 (200~300자) + 사진 1장
 * 검수 없음 — 관리자가 직접 검토 후 발행
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// 환경변수 로드
const envPath = new URL('../.env', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=\s][^=]*)=["']?(.+?)["']?\s*$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
}
process.env.DATABASE_URL = envVars['DATABASE_URL'];

const client = new Anthropic({ apiKey: envVars['ANTHROPIC_API_KEY'] });
const prisma = new PrismaClient();
const root = new URL('../', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');

// ── 데이터 로더 ──────────────────────────────────
function loadEmails() {
  try {
    const csv = fs.readFileSync(
      path.join(root, 'data/gmail-export/smartech_gmail_database_fixed.csv'), 'utf8'
    ).replace(/^﻿/, '');
    return csv.trim().split('\n').slice(1, 30).join('\n'); // 최근 30건
  } catch { return ''; }
}

function loadCallTranscripts() {
  try {
    const dir = path.join(root, 'data', '상담기록');
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.txt')).slice(-5);
    return files.map(f => fs.readFileSync(path.join(dir, f), 'utf8').slice(0, 500)).join('\n\n');
  } catch { return ''; }
}

function loadCeoVoice() {
  try {
    return fs.readFileSync(path.join(root, 'data/brand/이명재_말투_가이드.md'), 'utf8').slice(0, 1500);
  } catch { return ''; }
}

// 사진 폴더 매핑
const PHOTO_FOLDER_MAP = {
  '수리문의':   '04_수리정비',
  '견적문의':   '02_납품출고',
  '기술문의':   '01_장비외관',
  '단종문의':   '01_장비외관',
  '일반':       '07_기타',
};

function pickPhoto(category) {
  const folder = PHOTO_FOLDER_MAP[category] || '01_장비외관';
  const photoBase = path.join(root, 'data', '현장사진', folder);
  try {
    const files = fs.readdirSync(photoBase).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
    if (files.length === 0) return null;
    return `${folder}/${files[Math.floor(Math.random() * files.length)]}`;
  } catch { return null; }
}

// ── AI 호출 ──────────────────────────────────────
async function ask(system, user, label) {
  console.log(`  🤖 [${label}] 작업 중...`);
  const res = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system,
    messages: [{ role: 'user', content: user }],
  });
  console.log(`  ✅ [${label}] 완료`);
  return res.content[0].type === 'text' ? res.content[0].text.trim() : '';
}

// ── 메인 ─────────────────────────────────────────
async function main() {
  console.log('\n========================================');
  console.log('  스마텍 AI 콘텐츠 (간소화 v1)');
  console.log('  주제선정 → 1문단 작성 → 사진 1장');
  console.log('========================================\n');

  const emails      = loadEmails();
  const calls       = loadCallTranscripts();
  const ceoVoice    = loadCeoVoice();

  // ── 에이전트 1: 주제 선정 ──────────────────────
  console.log('[1/3] 주제 선정 중...');
  const topicRaw = await ask(
    `당신은 스마텍 블로그 편집장입니다. 고객 이메일과 상담 기록을 보고 이미 완료된 일 1건을 블로그 주제로 선정합니다.

[중요] 반드시 이미 일어난 일을 선택하세요:
- 납품 완료된 제품
- 수리 완료된 펌프
- 현장 출동해서 처리한 건
- 견적 발송 완료한 건
- 절대 "예정", "진행 중", "방문 전" 같은 미래/진행 이슈 금지

출력 형식 (반드시 아래 형식만):
주제: [완료된 일 한 줄, 과거형으로]
카테고리: [수리문의 / 견적문의 / 기술문의 / 단종문의 / 일반 중 1개]
표제: [* 모델명 + 완료된 업무 * 형식, 예: * RV8 수리 완료 * 또는 * nXDS15i 납품(수원) *]`,
    `[고객 이메일 최근 30건]\n${emails}\n\n[상담 통화 기록]\n${calls}\n\n이미 완료된 일 1건을 선정하세요. 미래 예정 건은 절대 선택하지 마세요.`
  , '주제선정');

  // 파싱
  const topic    = (topicRaw.match(/주제:\s*(.+)/)    || [])[1]?.trim() || '진공펌프 현장 이슈';
  const category = (topicRaw.match(/카테고리:\s*(.+)/) || [])[1]?.trim() || '일반';
  const headline = (topicRaw.match(/표제:\s*(.+)/)    || [])[1]?.trim() || `* 현장 이슈 *`;

  console.log(`\n  📌 주제: ${topic} [${category}]`);
  console.log(`  📌 표제: ${headline}\n`);

  // ── 에이전트 2: 글 작성 ────────────────────────
  console.log('[2/3] 글 작성 중...');
  const content = await ask(
    `당신은 스마텍 이명재 대표입니다. 아래 말투 가이드를 따라 블로그 글을 씁니다.

${ceoVoice}

[글쓰기 규칙]
- 분량: 200~300자 (공백 포함), 1문단
- 첫 줄: 표제만 단독으로 (예: * RV8 수리 완료 *)
- 표제 다음 줄: 본문 바로 시작
- 반드시 완료된 일을 과거형으로 서술 ("납품했습니다", "수리 완료됐습니다", "처리됐습니다")
- 구체적 모델명 포함 (고객사명 금지 — "경기 지역 고객사", "반도체 장비업체" 등으로만)
- 에드워즈(Edwards) 첫 언급 시 영문 병기
- "탁월한", "최고의" 등 과장 표현 금지
- 마지막 줄: "문의사항은 언제든지 스마텍으로 연락 부탁드립니다."`,
    `표제: ${headline}\n주제: ${topic}\n카테고리: ${category}\n\n위 표제와 주제로 블로그 1문단을 작성하세요.`
  , '글작성');

  // ── 에이전트 3: 사진 선정 ──────────────────────
  console.log('[3/3] 사진 선정 중...');
  const photo = pickPhoto(category);
  if (photo) {
    console.log(`  📷 사진: ${photo}`);
  } else {
    console.log('  📷 (사진 없음)');
  }

  // ── 저장 ───────────────────────────────────────
  const now = new Date();
  const ts  = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;

  // 파일 저장
  const outputDir = path.join(root, 'data', '콘텐츠');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const filePath = path.join(outputDir, `글_${ts}_통과.md`);
  const fileContent = [
    `# AI 콘텐츠 (간소화 v1)`,
    `## 주제: ${topic}`,
    `## 카테고리: ${category}`,
    `## 생성 시각: ${ts}`,
    photo ? `## 사진: ${photo}` : '',
    '',
    '---',
    '',
    content,
  ].join('\n');
  fs.writeFileSync(filePath, fileContent, 'utf8');

  // DB DRAFT 저장 (관리자에서 바로 확인 가능)
  let postId = null;
  try {
    const post = await prisma.blogPost.create({
      data: {
        title:      headline.replace(/\*/g, '').trim(),
        content,
        metaDesc:   topic,
        tags:       '',
        category,
        status:     'DRAFT',
        sourceFile: path.basename(filePath),
        photos:     photo ? JSON.stringify([photo]) : null,
      },
    });
    postId = post.id;
  } catch (e) {
    console.log('  ⚠️  DB 저장 실패 (파일만 저장됨):', e.message);
  }

  console.log('\n========================================');
  console.log('  ✅ 완료!');
  console.log(`  파일: ${path.basename(filePath)}`);
  if (postId) console.log(`  블로그 DRAFT ID: ${postId} → /admin/blog 에서 확인`);
  console.log('========================================\n');

  await prisma.$disconnect();
}

main().catch(async e => {
  console.error('\n❌ 오류:', e.message);
  await prisma.$disconnect();
  process.exit(1);
});
