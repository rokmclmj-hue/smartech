import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// --- 환경변수 로드 ---
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
const BLOG_AGENTS_ROOT = 'C:/Users/rokmc/blog-agents';

// ===========================
// 데이터 로더
// ===========================

function loadKeywords() {
  const csv = fs.readFileSync(path.join(root, 'data/keyword_map.csv'), 'utf8').replace(/^﻿/, '');
  const lines = csv.trim().split('\n').slice(1);
  const results = [];
  for (const line of lines) {
    const parts = line.split(',');
    if (parts.length < 4) continue;
    const category = parts[0].trim();
    const keyword = parts[1].trim();
    const totalStr = parts[parts.length - 2].trim().replace(/[<\s]/g, '');
    const total = parseInt(totalStr) || 0;
    const competition = parts[parts.length - 1].trim();
    if (category !== '기타' && total >= 200) {
      results.push({ category, keyword, total, competition });
    }
  }
  return results.sort((a, b) => b.total - a.total).slice(0, 40);
}

function loadEmailsAll() {
  const csv = fs.readFileSync(
    path.join(root, 'data/gmail-export/smartech_gmail_database_fixed.csv'), 'utf8'
  ).replace(/^﻿/, '');
  return csv.trim().split('\n');
}

function loadEmailsByCategory(category) {
  const lines = loadEmailsAll();
  const header = lines[0];
  const catMap = { '견적문의': '견적', '기술문의': '기술상담', '단종문의': '제품문의', '수리문의': '수리' };
  const catKey = catMap[category];
  if (!catKey) return lines.slice(1, 50).join('\n');
  const filtered = lines.slice(1).filter(l => {
    const cols = l.split(',');
    return cols[2] && cols[2].trim() === catKey;
  });
  return header + '\n' + filtered.slice(0, 80).join('\n');
}

function loadCallTranscripts() {
  const dir = path.join(root, 'data', '상담기록');
  if (!fs.existsSync(dir)) return '';
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.txt'))
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 20);
  if (files.length === 0) return '';
  return files.map(f => {
    try {
      const content = fs.readFileSync(path.join(dir, f), 'utf8');
      return `[${f}]\n${content.slice(0, 1000)}`;
    } catch { return ''; }
  }).filter(Boolean).join('\n\n---\n\n');
}

function loadBrandVoice() {
  return fs.readFileSync(path.join(root, 'data/brand/brand-voice.md'), 'utf8');
}

function loadAllProductMaster() {
  const dir = path.join(root, 'data/Product_master_table');
  try {
    return fs.readdirSync(dir)
      .filter(f => f.endsWith('.txt'))
      .map(f => {
        try { return `[${f}]\n` + fs.readFileSync(path.join(dir, f), 'utf8').slice(0, 400); }
        catch { return ''; }
      })
      .filter(Boolean)
      .join('\n\n---\n\n');
  } catch { return ''; }
}

// C1 전용 Reference DB 로드
function loadReferenceDB() {
  const refDir = path.join(BLOG_AGENTS_ROOT, 'reference-db');
  const sections = [];

  for (const file of ['delivery-rules.md', 'forbidden-list.md', 'brand-voice-guide.md']) {
    try {
      const content = fs.readFileSync(path.join(refDir, file), 'utf8');
      sections.push(`=== ${file} ===\n${content}`);
    } catch {}
  }

  const edwardsDir = path.join(refDir, 'edwards');
  try {
    const files = fs.readdirSync(edwardsDir)
      .filter(f => f.endsWith('.md') && f !== 'README.md')
      .sort();
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(edwardsDir, file), 'utf8');
        sections.push(`=== edwards/${file} ===\n${content.slice(0, 1200)}`);
      } catch {}
    }
  } catch {}

  return sections.join('\n\n---\n\n');
}

// ===========================
// 주간 주제 관리
// ===========================

function getTopicsDir() {
  return path.join(BLOG_AGENTS_ROOT, 'A-intelligence', 'topics');
}

function loadCurrentWeeklyTopics() {
  const dir = getTopicsDir();
  if (!fs.existsSync(dir)) return null;

  const files = fs.readdirSync(dir)
    .filter(f => f.startsWith('weekly-topics-') && f.endsWith('.md'))
    .sort()
    .reverse();

  if (files.length === 0) return null;

  const filePath = path.join(dir, files[0]);
  const content = fs.readFileSync(filePath, 'utf8');

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(\d+)\.\s+\[ \]\s+(.+)$/);
    if (match) {
      return { filePath, lineIndex: i, topicIndex: parseInt(match[1]), topicText: match[2] };
    }
  }
  return null;
}

function markTopicComplete(filePath, lineIndex) {
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  lines[lineIndex] = lines[lineIndex].replace('[ ]', '[완료]');
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
}

function saveWeeklyTopics(topicLines) {
  const dir = getTopicsDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const d = new Date();
  const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const filePath = path.join(dir, `weekly-topics-${dateStr}.md`);
  fs.writeFileSync(filePath, `# 이번 주 블로그 주제 목록 (${dateStr})\n\n${topicLines}\n`, 'utf8');
  console.log(`📋 주간 주제 저장: ${filePath}`);
  return filePath;
}

function parseTopic(text) {
  const catMatch = text.match(/카테고리:\s*(견적문의|기술문의|단종문의|수리문의|일반)/);
  const category = catMatch ? catMatch[1] : '일반';
  const title = text.replace(/—.*$/, '').replace(/\|.*$/, '').trim().replace(/^\d+\.\s*/, '');
  return { topicText: text, title, category };
}

// ===========================
// 에이전트 호출
// ===========================

async function callAgent(system, user, label, maxTokens = 1024) {
  console.log(`\n🤖 [${label}] 작업 중...`);
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: user }],
  });
  const result = msg.content[0].text;
  console.log(`✅ [${label}] 완료`);
  return result;
}

// ===========================
// 브랜드 보이스 공통 규칙
// ===========================

const BRAND_RULES = `[필수 규칙]
- 분량: 900~1300자 (공백 포함)
- 첫 문장: 고객이 주어. "많이들 문의하시는~", "주로 문의하시는~" 형태로 시작
- 실제 모델명(iXH, EXS, nXDS 등), 구체적 수치(납기 주수 등) 반드시 포함
- 소제목(##)으로 구조화

[고객 존중 말투]
- 절대 스마텍이 주어인 첫 문장 금지
- "현장에서 자주 겪으시는 상황" (O), "현장에서 자주 보는 상황" (X)
- "스마텍으로 연락 부탁드립니다" (O), "저희에게 연락 주세요" (X)

[절대 금지 표현]
- 탁월한, 최고의, 혁신적인, 우수한, 완벽한
- "결론적으로 말씀드리면", "~라고 할 수 있습니다"
- 고객사 실명 → 반드시 영문 이니셜 약자로 표기 (예: GR사, MH사, NT사)
- 금액(원, 만원 등) 절대 언급 금지
- "에드워즈" 절대 금지 → 반드시 "에드워드(Edwards)" (첫 언급), 이후 "에드워드"로만 표기

[영문 병기 필수 — 첫 등장 시]
- 에드워드(Edwards), 로터리 베인(Rotary Vane), 드라이 펌프(Dry Pump), 오버홀(Overhaul)

[마무리 문장]
반드시 이 패턴으로 끝낼 것:
"[글의 핵심 주제] 관련하여 문의 사항이 있으시면 언제든지 스마텍으로 연락 부탁드립니다."`;

// 네이버 블로그 표시용 카테고리명 (SEO 최적화)
const CATEGORY_DISPLAY = {
  '견적문의':  '납기·견적 안내',
  '기술문의':  '기술자료·알람코드',
  '단종문의':  '단종·후속 모델',
  '수리문의':  '수리·오버홀',
  '일반':      '일반',
};

const CATEGORY_RULES = {
  '견적문의': `[견적문의 특화]
- 납기 안내 시 구체적 주수 포함 (RV/nXDS: 1주, E2M40이상/EH: 8~10주, GXS/EXS: 12~14주)
- 가격(금액) 절대 직접 언급 금지 → "견적 문의 시 안내드립니다"로 처리`,
  '기술문의': `[기술문의 특화]
- 기술 정보는 반드시 공식 데이터 기준. 불확실한 수치 절대 금지
- 어렵고 생소한 기술 용어는 괄호 안에 쉬운 설명 추가`,
  '단종문의': `[단종문의 특화]
- 단종으로 당황하신 고객의 상황을 충분히 공감하며 시작
- 대체 모델 제안 시 "공식 후속 모델은 ~입니다" 형태로 명확히 안내`,
  '수리문의': `[수리문의 특화]
- 고객이 증상 설명 시 쓰는 표현(소리, 냄새, 알람 등) 자연스럽게 활용
- 수리 비용 절대 직접 언급 금지 → "분해 후 부품 확인 시 안내드립니다"
- 자가 수리 유도 금지. "전문 점검이 필요합니다"로 마무리`,
  '일반': '',
};

// ===========================
// A팀: 인텔리전스
// ===========================

async function runATeam(isMonday, keywords, recentEmails, callTranscripts) {
  const keywordText = keywords
    .map(k => `[${k.category}] ${k.keyword}: 월 ${k.total.toLocaleString()}회 (경쟁도: ${k.competition})`)
    .join('\n');
  const callInfo = callTranscripts ? `\n\n[통화 상담 기록 (최근 20건)]\n${callTranscripts}` : '';

  if (isMonday) {
    console.log('\n📅 월요일 — 주간 주제 10개 선정 모드');

    // A1, A2, A3 병렬 실행
    const [a1, a2, a3] = await Promise.all([
      callAgent(
        `당신은 스마텍(에드워드 진공펌프 공식 대리점) A1 시장레이더입니다. 검색 데이터와 고객 이메일을 분석해 이번 주 블로그 주제 후보를 발굴합니다.`,
        `[네이버 검색량 데이터]\n${keywordText}\n\n[고객 이메일 (최근 50건)]\n${recentEmails}${callInfo}\n\n이번 주 블로그 주제 후보 4개를 제안하세요.\n형식: [제목] | 카테고리: [...] | 타겟: [...] | 핵심키워드: [...]`,
        'A1 시장레이더', 1024
      ),
      callAgent(
        `당신은 스마텍 A2 고객심리분석관입니다. 4가지 고객 유형(엔지니어/구매담당/유지보수/연구소)의 심리적 니즈를 분석해 공감되는 주제를 발굴합니다.`,
        `[고객 이메일 및 상담 데이터]\n${recentEmails}${callInfo}\n\n고객 심리 관점에서 이번 주 주제 후보 3개를 제안하세요.\n형식: [제목] | 카테고리: [...] | 타겟유형: [...] | 핵심불안·욕구: [...]`,
        'A2 고객심리분석', 768
      ),
      callAgent(
        `당신은 스마텍 A3 콘텐츠갭파인더입니다. 네이버에 검색해도 제대로 된 답이 없는, 스마텍만이 답할 수 있는 틈새 주제를 발굴합니다.`,
        `[검색량 데이터]\n${keywordText}\n\n[고객 이메일]\n${recentEmails}\n\n스마텍만의 전문성으로 차별화 가능한 주제 3개를 제안하세요.\n형식: [제목] | 카테고리: [...] | 갭 이유: [...] | 스마텍 강점: [...]`,
        'A3 콘텐츠갭파인더', 768
      ),
    ]);

    // A팀장: 주간 주제 10개 확정
    const weeklyTopics = await callAgent(
      `당신은 스마텍 A팀 팀장입니다. 세 팀원의 제안을 검토해 이번 주 블로그 주제 10개를 최종 선정합니다. 카테고리(견적/기술/단종/수리/일반) 균형을 고려하세요.`,
      `A1 제안:\n${a1}\n\nA2 제안:\n${a2}\n\nA3 제안:\n${a3}\n\n이번 주 최종 주제 10개를 선정하세요.\n\n반드시 정확히 이 형식으로:\n1. [ ] [제목] — 카테고리: [견적문의/기술문의/단종문의/수리문의/일반] | 타겟: [...] | 핵심키워드: [...]\n2. [ ] ...\n...\n10. [ ] ...`,
      'A팀장 주간주제확정', 1500
    );

    saveWeeklyTopics(weeklyTopics);

    // 오늘 첫 번째 주제 선택 후 완료 처리
    const topicInfo = loadCurrentWeeklyTopics();
    if (topicInfo) {
      markTopicComplete(topicInfo.filePath, topicInfo.lineIndex);
      return parseTopic(topicInfo.topicText);
    }
    // 파싱 실패 시 첫 줄에서 추출
    const firstLine = weeklyTopics.split('\n').find(l => l.match(/^1\.\s+\[ \]/));
    return parseTopic(firstLine || weeklyTopics.split('\n')[0]);

  } else {
    // 평일: 저장된 주제에서 선택
    const topicInfo = loadCurrentWeeklyTopics();

    if (topicInfo) {
      console.log(`\n📌 오늘의 주제 #${topicInfo.topicIndex}: ${topicInfo.topicText}`);
      markTopicComplete(topicInfo.filePath, topicInfo.lineIndex);
      return parseTopic(topicInfo.topicText);
    }

    // 주제 파일 없음 → A1+A2 즉석 생성
    console.log('\n⚠️ 주간 주제 파일 없음 — 즉석 주제 생성');
    const [a1, a2] = await Promise.all([
      callAgent(
        `당신은 스마텍 A1 시장레이더입니다.`,
        `[검색량 데이터]\n${keywordText}\n\n[고객 이메일]\n${recentEmails}\n\n오늘의 블로그 주제 1개를 즉시 제안하세요.\n형식: [제목] — 카테고리: [...] | 타겟: [...] | 핵심키워드: [...]`,
        'A1 긴급주제', 512
      ),
      callAgent(
        `당신은 스마텍 A2 고객심리분석관입니다.`,
        `[고객 이메일 및 상담]\n${recentEmails}${callInfo}\n\n오늘의 블로그 주제 1개를 제안하세요.\n형식: [제목] — 카테고리: [...] | 타겟: [...] | 핵심키워드: [...]`,
        'A2 긴급주제', 512
      ),
    ]);
    const chosen = await callAgent(
      `당신은 스마텍 A팀 팀장입니다. 두 제안 중 더 효과적인 주제 1개를 선택하세요.`,
      `A1: ${a1}\nA2: ${a2}\n\n최종 선택 (형식 그대로 한 줄):\n[제목] — 카테고리: [...] | 타겟: [...] | 핵심키워드: [...]`,
      'A팀장 즉석주제확정', 256
    );
    return parseTopic(chosen);
  }
}

// ===========================
// B팀: 콘텐츠 작성 (직렬)
// ===========================

async function runBTeam(topicText, title, category, emailData, callTranscripts) {
  const catRule = CATEGORY_RULES[category] || '';
  const callInfo = callTranscripts
    ? `\n\n[실제 통화 상담 기록 (최근)]\n${callTranscripts.slice(0, 2000)}`
    : '';

  // B1: 기술 번역
  const b1 = await callAgent(
    `당신은 스마텍 B1 기술번역 에이전트입니다. 에드워드 공식 기술 문서를 고객이 이해할 수 있는 한국어로 번역·해석합니다. 영어 기술 용어는 반드시 한국어로 풀어쓰고 괄호로 원어를 병기합니다.`,
    `다음 주제에 필요한 기술 내용을 정리하세요.\n\n주제: ${topicText}\n\n[고객 이메일 데이터]\n${emailData.slice(0, 3000)}\n\n핵심 기술 개념 5~7개를 각 2~3줄로 정리하세요:`,
    'B1 기술번역', 1024
  );

  // B2: 스토리텔러 (이메일 + 통화기록 모두 활용)
  const b2 = await callAgent(
    `당신은 스마텍 B2 스토리텔러입니다. 실제 고객 사례를 바탕으로 공감되는 이야기를 만듭니다. 고객사 실명은 반드시 영문 이니셜로 처리합니다. (예: 그린리소스→GR사, 미코하이테크→MH사)\n\n통화 상담 기록이 있으면 실제 대화 맥락을 최대한 살려 현장감 있게 작성하세요.`,
    `다음 기술 내용을 바탕으로 실제 현장 사례 스토리 2~3개를 작성하세요. 고객이 "맞아, 나도 이런 상황이었어"라고 느낄 수 있도록.\n\n주제: ${topicText}\n\n[B1 기술 내용]\n${b1}\n\n[고객 이메일 데이터]\n${emailData.slice(0, 2000)}${callInfo}\n\n현장 사례 스토리:`,
    'B2 스토리텔러', 1024
  );

  // B3: 네이버 작가
  const draft = await callAgent(
    `당신은 스마텍 B3 네이버 작가입니다. B1의 기술 내용과 B2의 현장 사례를 통합해 완성도 높은 네이버 블로그 글을 작성합니다.\n\n${BRAND_RULES}\n\n${catRule}`,
    `다음 자료를 모두 활용해 완성된 블로그 글을 작성하세요.\n\n주제: ${topicText}\n\n[B1 기술 내용]\n${b1}\n\n[B2 현장 사례]\n${b2}\n\n[추가 규칙]\n- 글 분량: 900~1300자\n- 소제목(##)으로 구조화\n- 글 중간 적절한 위치에 [DIAGRAM] 자리표시자 1개 삽입\n\n완성된 블로그 글:`,
    'B3 네이버작가', 2048
  );

  return draft;
}

// ===========================
// C팀: 품질 검수 (병렬)
// ===========================

async function runCTeam(draft, referenceDB, allProductMaster) {
  // C1, C2, C3 병렬 실행
  const [c1, c2, c3] = await Promise.all([
    callAgent(
      `당신은 스마텍 C1 기술검수관입니다. Reference DB를 기준으로 블로그 글의 기술적 사실을 검수합니다.

[핵심 검수 규칙]
1. EH 부스터 단독 사용 언급 → 즉시 REJECT (EH는 반드시 로터리 베인 펌프와 조합)
2. 드라이 펌프(nXDS, GXS, EXS, nXRi)에 오일 관련 표현 → 즉시 REJECT
3. 오일 펌프(RV, E2M, nES)에 "오일리스", "드라이" 표현 → 즉시 REJECT
4. 납기 기준: RV/nXDS/E2M0.7/E2M1.5/EMF = 1 week | E2M40이상/EH = 8~10 weeks | GXS/EXS = 12~14 weeks | 나머지 = TBC
5. 수치 동치 허용: 5×10⁻³ = 0.005 = 5 x 10^-3 (모두 동일값)
6. [PDF확인필요] 표시 스펙을 확정적으로 언급 → REJECT`,
      `[블로그 초안]\n${draft}\n\n[Reference DB]\n${referenceDB.slice(0, 8000)}\n\n[제품 마스터]\n${allProductMaster.slice(0, 3000)}\n\n형식:\n판정: [통과 / REJECT]\nREJECT 이유: [구체적으로] (통과 시 "없음")\n수정 권고: [구체적으로] (없으면 "없음")`,
      'C1 기술검수', 768
    ),
    callAgent(
      `당신은 스마텍 C2 품질감시관입니다. (1) AI 작성 감지 위험 요소, (2) 표현 안전성을 검수합니다.

[AI 감지 방지 체크리스트]
- 제목이 "X가지 방법", "완벽 가이드" 형태 → 위험
- 단락이 모두 비슷한 길이로 균일 → 위험
- 현장감 없는 교과서 표현 → 위험
- 고객사·모델명 등 구체적 사례 없음 → 위험

[표현 안전성]
- 근거 없는 과장 표현 ("최고", "완벽", "100% 보장")
- 가격·납기를 확정적으로 약속하는 표현
- 비전문가가 따라 하다 위험할 수 있는 자가수리 지침`,
      `[블로그 초안]\n${draft}\n\n형식:\nAI감지위험: [낮음/중간/높음]\n표현안전성: [통과/수정필요]\n판정: [통과 / REJECT]\n수정 권고: [구체적으로] (없으면 "없음")`,
      'C2 품질감시', 768
    ),
    callAgent(
      `당신은 스마텍 C3 리스크검토관입니다. 5가지 필터로 법적·영업적 리스크를 검토합니다.

[5가지 리스크 필터]
1. 업체명 노출: 고객사·거래처 실명이 그대로 노출 → REJECT
2. 공정 노하우 유출: 고객사 고유 공정·비밀 정보 노출 → REJECT
3. 사고·사망 묘사: 구체적 사고 경위나 피해 상황 묘사 → REJECT
4. 경쟁사 직접 비교: 특정 경쟁사 제품 직접 비교 → REJECT
5. 금액 노출: 수리비·부품비·제품 가격 등 금액 언급 → REJECT`,
      `[블로그 초안]\n${draft}\n\n형식:\n필터1(업체명): [통과/REJECT - 내용]\n필터2(공정노하우): [통과/REJECT - 내용]\n필터3(사고묘사): [통과/REJECT - 내용]\n필터4(경쟁사비교): [통과/REJECT - 내용]\n필터5(금액노출): [통과/REJECT - 내용]\n판정: [통과 / REJECT]\n수정 권고: [구체적으로] (없으면 "없음")`,
      'C3 리스크검토', 768
    ),
  ]);

  // C팀장: 최종 판정
  const cLeader = await callAgent(
    `당신은 스마텍 C팀 팀장입니다. C1·C2·C3 세 검수관의 결과를 종합해 최종 통과/반려를 결정합니다. 세 검수관 중 한 명이라도 REJECT이면 반려입니다. 사소한 표현 차이는 수정 권고만 하고 통과. 실제 오류·법적 문제만 반려합니다.`,
    `C1 기술검수:\n${c1}\n\nC2 품질감시:\n${c2}\n\nC3 리스크검토:\n${c3}\n\n형식:\n판정: [통과 / 반려]\n반려 이유: [구체적으로] (통과 시 "없음")\n수정 지시사항: [B팀이 수정할 내용] (없으면 "없음")`,
    'C팀장 최종판정', 512
  );

  const passed = cLeader.includes('판정: 통과');
  const feedbackIdx = cLeader.indexOf('수정 지시사항:');
  const feedback = feedbackIdx >= 0
    ? cLeader.slice(feedbackIdx + '수정 지시사항:'.length).trim()
    : '';

  console.log(`\n${passed ? '✅ C팀 판정: 통과' : '❌ C팀 판정: 반려'}`);
  if (!passed) console.log(`반려 사유: ${feedback}`);

  return { passed, feedback, detail: `C1:\n${c1}\n\nC2:\n${c2}\n\nC3:\n${c3}\n\nC팀장:\n${cLeader}` };
}

async function reviseDraft(draft, feedback) {
  return await callAgent(
    `당신은 스마텍 B3 네이버 작가입니다. C팀의 검수 피드백을 반영해 초안을 수정합니다.\n\n${BRAND_RULES}`,
    `다음 초안을 C팀 피드백에 따라 수정하세요.

[C팀 수정 지시사항]
${feedback}

[추가 필수 확인 사항 — 반드시 지켜야 함]
- "에드워드(Edwards)" 첫 언급 시 반드시 영문 병기. 이후 "에드워드"로만 표기
- "로터리 베인(Rotary Vane)", "드라이 펌프(Dry Pump)", "오버홀(Overhaul)" 첫 언급 시 영문 병기
- 수리비·부품비·제품가격 등 모든 금액 표현 삭제 → "견적 문의 시 안내드립니다"로 교체
- 고객사 실명 → 영문 이니셜로 교체 (예: GR사, MH사)
- "에드워즈" 표기 → 반드시 "에드워드"로 수정

[수정 전 초안]
${draft}

수정된 최종 글:`,
    'B3 수정재작성', 2048
  );
}

// ===========================
// D팀: 비주얼
// ===========================

async function runD2(draft, topicText) {
  return await callAgent(
    `당신은 스마텍 D2 다이어그램 디자이너입니다. 블로그 글에 가장 적합한 시각 자료를 생성합니다.

[출력 형식 선택 기준]
1. Markdown 표: 모델 스펙 비교, 납기 비교, 사양 목록
2. ASCII 흐름도: 선택 과정, 점검 순서, 의사결정 흐름
3. Mermaid: 복잡한 시스템 구성, 단계별 프로세스

[규칙]
- 3가지 형식 중 1가지만 선택
- 글 내용과 직접 관련된 내용으로만 구성
- ## 소제목 포함
- 너무 복잡하면 Markdown 표로 단순화`,
    `다음 블로그 글에 가장 잘 어울리는 시각 자료를 생성하세요.\n\n[블로그 글]\n${draft.slice(0, 2000)}\n\n[주제]\n${topicText}\n\n완성된 시각 자료:`,
    'D2 다이어그램', 1024
  );
}

function insertDiagram(draft, diagram) {
  if (draft.includes('[DIAGRAM]')) {
    return draft.replace('[DIAGRAM]', diagram);
  }
  const lines = draft.split('\n');
  const insertIdx = Math.max(0, lines.length - 4);
  lines.splice(insertIdx, 0, '', diagram, '');
  return lines.join('\n');
}

// ===========================
// E팀: SEO + 발행
// ===========================

async function runETeam(draft, topicText, title, category, keywords) {
  const keywordText = keywords.slice(0, 20).map(k => `${k.keyword}: 월 ${k.total.toLocaleString()}회`).join(', ');

  // SEO 제목 + 메타설명·태그 병렬
  const [seoRaw, metaRaw] = await Promise.all([
    callAgent(
      `당신은 네이버 SEO 전문가입니다. 블로그 제목을 검색 최적화합니다.`,
      `다음 글의 최적화된 제목 3개를 제안하세요. 길이 25~35자, 핵심 키워드 앞에 배치, "스마텍" 브랜드명 제목에 포함하지 않음.\n\n주제: ${topicText}\n검색량 데이터: ${keywordText}\n\n형식:\n1. [제목]\n2. [제목]\n3. [제목]\n최선선택: [번호]`,
      'E팀 SEO제목', 512
    ),
    callAgent(
      `당신은 네이버 SEO 전문가입니다. 메타 설명과 해시태그를 최적화합니다.`,
      `다음 글의 메타 설명(160자 이내)과 해시태그 15개를 작성하세요.\n\n[글 내용]\n${draft.slice(0, 1500)}\n\n형식:\n메타설명: [160자 이내]\n해시태그: #에드워드진공펌프 #진공펌프 ... (총 15개)`,
      'E팀 SEO메타태그', 512
    ),
  ]);

  // 제목 확정
  const bestIdx = (seoRaw.match(/최선선택:\s*(\d+)/) || [])[1];
  const titleLines = [...seoRaw.matchAll(/\d+\.\s+(.+)/g)].map(m => m[1].trim());
  const seoTitle = titleLines[(parseInt(bestIdx) || 1) - 1] || title;

  const seoMeta = (metaRaw.match(/메타설명:\s*(.+?)(?:\n|$)/) || [])[1]?.trim() || '';
  const seoTags = (metaRaw.match(/해시태그:\s*(.+?)(?:\n|$)/s) || [])[1]?.trim() || '';

  console.log(`\n🔍 SEO 확정 제목: ${seoTitle}`);
  console.log(`📌 태그: ${seoTags}`);

  // E3: 네이버 버전 생성
  const naverContent = await callAgent(
    `당신은 네이버 블로그 전문 에디터입니다.
[네이버 블로그 규칙]
- 분량: 400~500자
- 첫 줄: 핵심 상황으로 시작 (독자가 바로 공감)
- 단락 2~3줄씩 짧게 끊기 (모바일 가독성)
- 마지막 줄: "자세한 내용은 스마텍 홈페이지에서 확인하실 수 있습니다."
- 글 맨 끝에 해시태그 5개 (가장 중요한 5개만)
- 금액·고객사 실명 절대 언급 금지`,
    `다음 글을 네이버 블로그용으로 변환하세요.\n\n[원본 제목]\n${seoTitle}\n\n[원본 글]\n${draft}`,
    'E3 네이버버전', 1024
  );

  // E2: 홈페이지 DRAFT 저장 (Prisma 직접)
  let postId = null;
  try {
    const post = await prisma.blogPost.create({
      data: {
        title: seoTitle,
        content: draft,
        metaDesc: seoMeta,
        tags: seoTags,
        category: CATEGORY_DISPLAY[category] || category,
        status: 'DRAFT',
        sourceFile: `ai-pipeline-${new Date().toISOString().slice(0, 10)}`,
      },
    });
    postId = post.id;
    console.log(`\n🌐 홈페이지 DRAFT 저장 완료 (ID: ${postId})`);
  } catch (e) {
    console.log(`\n⚠️ 홈페이지 DB 저장 실패 (파일로만 저장): ${e.message}`);
  }

  return { seoTitle, seoMeta, seoTags, naverContent, postId };
}

// ===========================
// 에스컬레이션
// ===========================

function saveEscalation(draft, feedback, topicText) {
  const outputDir = path.join(root, 'data', '콘텐츠');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const ts = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  const filePath = path.join(outputDir, `에스컬레이션_${ts}.md`);
  const content = [
    '# ⚠️ 에스컬레이션 보고 (C팀 2회 반려)',
    '',
    `## 발생 시각: ${ts}`,
    `## 주제: ${topicText}`,
    '',
    '## 반려 사유',
    feedback,
    '',
    '## 수정이 필요한 초안',
    draft,
    '',
    '## 처리 방법',
    '1. 위 반려 사유를 확인하세요',
    '2. 초안을 직접 수정하거나 Claude Code에서 수동 재작성하세요',
    '3. 수정 후 data/콘텐츠/ 폴더에 저장하세요',
  ].join('\n');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`\n🚨 에스컬레이션 저장: ${filePath}`);
}

// ===========================
// 결과물 저장
// ===========================

function saveOutput({ topicText, category, draft, cDetail, seoTitle, seoMeta, seoTags, naverContent, postId }) {
  const outputDir = path.join(root, 'data', '콘텐츠');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const now = new Date();
  const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;

  const content = [
    '# 스마텍 AI 파이프라인 결과 (v2 — 15 에이전트)',
    '',
    `## 주제: ${topicText}`,
    `## 카테고리: ${CATEGORY_DISPLAY[category] || category}`,
    `## 생성 시각: ${ts}`,
    postId ? `## 홈페이지 DRAFT ID: ${postId}` : '## 홈페이지 저장: 실패 (파일만 저장됨)',
    '',
    '---',
    '',
    '## C팀 검수 상세',
    cDetail,
    '',
    '---',
    '',
    '## 최종 발행본 (SEO 적용)',
    `**제목:** ${seoTitle}`,
    `**메타설명:** ${seoMeta}`,
    `**태그:** ${seoTags}`,
    '',
    draft,
    '',
    '---',
    '',
    '## 네이버 블로그 버전',
    '',
    '---네이버블로그---',
    naverContent,
  ].join('\n');

  const filePath = path.join(outputDir, `글_${ts}_통과.md`);
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

// ===========================
// 메인
// ===========================

async function main() {
  console.log('========================================');
  console.log('  스마텍 AI 콘텐츠 파이프라인 v2');
  console.log('  A/B/C/D/E 5팀 | 최대 15 에이전트');
  console.log('========================================\n');

  const today = new Date();
  const isMonday = today.getDay() === 1;

  // 데이터 로드
  const keywords = loadKeywords();
  const recentEmails = loadEmailsAll().slice(1, 50).join('\n');
  const callTranscripts = loadCallTranscripts();
  const brandVoice = loadBrandVoice();
  const allProductMaster = loadAllProductMaster();
  const referenceDB = loadReferenceDB();

  if (callTranscripts) console.log('📞 통화 상담 기록 로드됨');
  console.log(`📚 Reference DB 로드됨 (${Math.round(referenceDB.length / 1000)}KB)\n`);

  // A팀: 주제 선정
  const { topicText, title, category } = await runATeam(isMonday, keywords, recentEmails, callTranscripts);
  console.log(`\n📌 오늘의 주제: ${title} [${category}]\n`);

  // 카테고리별 이메일 로드
  const emailData = loadEmailsByCategory(category);

  // B팀: 콘텐츠 작성 (직렬 B1→B2→B3)
  let draft = await runBTeam(topicText, title, category, emailData, callTranscripts);

  // C팀: 품질 검수 (최대 2회, 1회 반려 시 재작성)
  let passed = false;
  let cDetail = '';

  for (let attempt = 1; attempt <= 2; attempt++) {
    console.log(`\n🔍 C팀 검수 ${attempt}회차...`);
    const cResult = await runCTeam(draft, referenceDB, allProductMaster);
    cDetail = cResult.detail;

    if (cResult.passed) {
      passed = true;
      break;
    }

    if (attempt === 1) {
      console.log('\n🔄 1회 반려 — B3 수정 재작성...');
      draft = await reviseDraft(draft, cResult.feedback);
    } else {
      console.log('\n🚨 2회 연속 반려 — 에스컬레이션');
      saveEscalation(draft, cResult.feedback, topicText);
      await prisma.$disconnect();
      return;
    }
  }

  if (!passed) {
    await prisma.$disconnect();
    return;
  }

  // D팀: 다이어그램 생성
  const diagram = await runD2(draft, topicText);
  const draftWithDiagram = insertDiagram(draft, diagram);

  // E팀: SEO + 홈페이지 DRAFT + 네이버 버전
  const eResult = await runETeam(draftWithDiagram, topicText, title, category, keywords);

  // 결과물 저장
  const savedPath = saveOutput({
    topicText, category,
    draft: draftWithDiagram,
    cDetail,
    ...eResult,
  });

  console.log('\n========================================');
  console.log('  완료!');
  console.log(`  저장: ${savedPath}`);
  if (eResult.postId) console.log(`  홈페이지 DRAFT ID: ${eResult.postId} (관리자에서 검토 후 발행)`);
  console.log('========================================\n');
  console.log(`제목: ${eResult.seoTitle}`);
  console.log(`태그: ${eResult.seoTags}\n`);

  await prisma.$disconnect();
}

main().catch(async err => {
  console.error('\n❌ 오류:', err.message);
  await prisma.$disconnect();
});
