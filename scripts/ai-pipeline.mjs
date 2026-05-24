import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

// --- 환경변수 로드 ---
const envPath = new URL('../.env', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=\s][^=]*)=["']?(.+?)["']?\s*$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
}

const client = new Anthropic({ apiKey: envVars['ANTHROPIC_API_KEY'] });
const root = new URL('../', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');

// --- 키워드 CSV 파싱 (숫자 안의 콤마 처리) ---
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

// --- 이메일 데이터 로드 ---
function loadEmails() {
  const csv = fs.readFileSync(
    path.join(root, 'data/gmail-export/smartech_gmail_database_fixed.csv'), 'utf8'
  ).replace(/^﻿/, '');
  const lines = csv.trim().split('\n');
  // 헤더: 날짜,연도,카테고리,고객사,제품_모델,메일제목,내용요약,해결방법,스레드ID
  return lines.slice(1, 50).join('\n');
}

// --- 브랜드 보이스 로드 ---
function loadBrandVoice() {
  return fs.readFileSync(path.join(root, 'data/brand/brand-voice.md'), 'utf8');
}

// --- 제품 마스터 로드 (주제 선정용 핵심 4개) ---
function loadProductContext() {
  const dir = path.join(root, 'data/Product_master_table');
  const files = [
    '1.오일펌프_소형RV.txt',
    '4.스크롤펌프_소형nXDS.txt',
    '7.산업용드라이펌프_GXS Dry.txt',
    '6.부스터펌프EH.txt',
  ];
  return files.map(f => {
    try { return fs.readFileSync(path.join(dir, f), 'utf8').slice(0, 600); }
    catch { return ''; }
  }).filter(Boolean).join('\n\n---\n\n');
}

// --- 제품 마스터 전체 로드 (2팀 기술 검수용) ---
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

// --- 에이전트 호출 ---
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

// --- 메인 파이프라인 ---
async function main() {
  console.log('========================================');
  console.log('  스마텍 AI 콘텐츠 파이프라인');
  console.log('========================================\n');

  const keywords = loadKeywords();
  const emailData = loadEmails();
  const brandVoice = loadBrandVoice();
  const productContext = loadProductContext();
  const allProductMaster = loadAllProductMaster();

  const keywordText = keywords
    .map(k => `[${k.category}] ${k.keyword}: 월 ${k.total.toLocaleString()}회 검색 (경쟁도: ${k.competition})`)
    .join('\n');

  // ── 팀원A: 검색량 기반 주제 제안 ──
  const memberA = await callAgent(
    `당신은 스마텍(에드워드 진공펌프 한국 공식 대리점, 천안 AS센터)의 콘텐츠 마케팅 팀원입니다.
검색 데이터를 분석해서 블로그 주제를 제안하는 역할입니다.
스마텍이 실제로 30년 경력으로 답할 수 있는 주제만 제안하세요.
너무 광범위하거나 스마텍과 무관한 주제는 제외하세요.`,
    `다음은 네이버 월간 검색량 데이터입니다:\n\n${keywordText}\n\n이 데이터를 바탕으로 블로그 글 주제 3가지를 제안하세요.\n\n형식:\n1. [구체적인 글 제목] - [선택 이유 한 줄]`,
    '팀원A · 검색량 분석'
  );

  // ── 팀원B: 고객 현장 니즈 기반 주제 제안 ──
  const memberB = await callAgent(
    `당신은 스마텍(에드워드 진공펌프 한국 공식 대리점, 천안 AS센터)의 콘텐츠 마케팅 팀원입니다.
실제 고객 문의와 현장 사례를 분석해서 블로그 주제를 제안하는 역할입니다.
고객이 실제로 겪은 문제, 현장에서 반복되는 질문 중심으로 제안하세요.`,
    `다음은 스마텍 실제 고객 이메일 데이터(CSV)입니다:\n헤더: 날짜,연도,카테고리,고객사,제품_모델,메일제목,내용요약,해결방법,스레드ID\n\n${emailData}\n\n주요 제품 정보:\n${productContext}\n\n이 데이터를 바탕으로 블로그 글 주제 3가지를 제안하세요.\n고객이 실제로 겪은 문제나 자주 묻는 내용 중심으로.\n\n형식:\n1. [구체적인 글 제목] - [선택 이유 한 줄]`,
    '팀원B · 고객 현장 분석'
  );

  // ── 1팀 팀장: 최적 주제 1개 선정 ──
  const leader = await callAgent(
    `당신은 스마텍 콘텐츠 마케팅 1팀 팀장입니다.
두 팀원의 제안을 검토하고 가장 효과적인 주제 1개를 선정합니다.
선택 기준: 검색량이 충분하면서도 스마텍 30년 경험으로만 쓸 수 있는 독보적인 내용.
"AI가 쓴 것 같은 글"이 아닌 "현장 전문가가 쓴 글"이 나올 수 있는 주제를 고르세요.`,
    `팀원A 제안:\n${memberA}\n\n팀원B 제안:\n${memberB}\n\n위 6개 주제 중 최적 1개를 선정하고 다음 형식으로 답하세요:\n\n선정 주제: [글 제목]\n선정 이유: [2~3줄]\n글의 핵심 각도: [이 글에서 독자가 얻어갈 핵심 한 가지]\n타겟 독자: [누가 읽을 글인지 한 줄]\n꼭 담아야 할 내용: [3개 항목]`,
    '1팀 팀장 · 주제 선정'
  );

  console.log('\n📋 팀장 결정:\n');
  console.log(leader);
  console.log('\n');

  // ── 총괄 에이전트 브리핑 ──
  const orchestratorBrief = `다음 기획안으로 스마텍 블로그 글을 작성하라:\n\n${leader}\n\n브랜드 보이스 가이드 (반드시 준수):\n${brandVoice.slice(0, 4000)}`;

  // ── 초안 작성 에이전트 ──
  const draft = await callAgent(
    `당신은 스마텍(에드워드 진공펌프 한국 공식 대리점, 천안 AS센터 운영)의 블로그 글 작성 전문 에이전트입니다.
이명재 대표가 직접 현장에서 경험하고 쓴 글처럼 작성하세요.

【필수 규칙】
- 분량: 900~1300자 (공백 포함)
- 첫 문장: 고객이 주어. "많이들 문의하시는~", "주로 문의하시는~", "겪고 계신 분들이 많으셔서 정리해드립니다" 형태로 시작
- 실제 모델명(iXH, EXS, nXDS 등), 구체적 수치(금액, 부품 수량, 납기 주수) 반드시 포함
- 소제목(##)으로 구조화

【고객 존중 말투 — 가장 중요한 원칙】
고객은 항상 높이고 존중해야 한다. 연장자에게 말하듯 쓴다.
- 첫 문장은 고객이 주어: "많이들 문의하시는~", "주로 문의하시는~", "겪고 계신 분들이 많으셔서~"
- 절대 스마텍이 주어인 첫 문장 금지: "저희 AS센터에 연락이 자주 옵니다" → ❌
- "현장에서 자주 보는 상황" → ❌ / "현장에서 자주 겪으시는 상황" → ✅

【절대 금지 표현 — 아래 표현이 하나라도 들어가면 처음부터 다시 써야 함】
❌ "저희에게 연락 주세요" → 반드시 "스마텍으로 연락 부탁드립니다" 또는 "문의 사항 있으시면 언제든지 연락 주시기 바랍니다"
❌ "AS센터에 이런 연락이 꽤 자주 옵니다" → "많이들 문의하시는 증상입니다"로 교체
❌ "탁월한", "최고의", "혁신적인", "우수한" 등 과장 수식어
❌ "일반적으로 알려진", "대부분의 경우", "전반적으로 살펴보면"
❌ "이러한 이유로 인하여", "결론적으로 말씀드리면", "~라고 할 수 있습니다"
❌ "저희는 후자가 되려고 합니다" 같은 자화자찬 선언
❌ "30년이 만든 차이" 같은 마케팅 문구 → 대신 실제 현장 경험으로 보여줄 것
❌ "~한 바 있습니다" → "~했습니다"로 교체
❌ "측면에서 접근해보면", "핵심적인 포인트는"

【마무리 문장 규칙】
- 반드시 "[글의 핵심 주제] 관련하여 문의 사항이 있으시면 언제든지 스마텍으로 연락 부탁드립니다." 패턴으로 끝낼 것
- 예: "단종 관련하여 문의 사항이 있으시면 언제든지 스마텍으로 연락 부탁드립니다."
- 예: "수리 관련하여 문의 사항이 있으시면 언제든지 스마텍으로 연락 부탁드립니다."
- "지금 바로", "서둘러", "저희에게 연락 주세요" 강요 표현 절대 금지`,
    orchestratorBrief,
    '초안 작성 에이전트',
    2048
  );

  // ── 2팀 팀원A: 기술 스펙 정확성 검수 ──
  const verifyA = await callAgent(
    `당신은 스마텍 콘텐츠 2팀 팀원입니다. 블로그 글의 기술적 정확성을 검수합니다.
에드워드 진공펌프 제품 사양과 수치의 오류를 찾는 역할입니다.
제품 마스터 자료를 기준으로 검수하되, 자료에 없는 내용은 일반 진공펌프 기술 상식으로 판단합니다.`,
    `다음 블로그 초안의 기술적 정확성을 검수하세요.\n\n[초안]\n${draft}\n\n[제품 마스터 자료]\n${allProductMaster.slice(0, 6000)}\n\n검수 항목:\n1. 모델명이 실제 에드워드 제품인지\n2. 온도·압력·비용·납기 등 수치가 합리적인지\n3. 기술 설명이 진공펌프 원리상 맞는지\n\n형식:\n문제없음: [항목 목록]\n수정필요: [구체적 내용과 이유] (없으면 "없음")`,
    '2팀 팀원A · 기술 스펙 검수'
  );

  // ── 2팀 팀원B: 위험표현·과장광고 검수 ──
  const verifyB = await callAgent(
    `당신은 스마텍 콘텐츠 2팀 팀원입니다. 블로그 글의 표현 안전성을 검수합니다.
과장광고, 위험한 자가수리 유도, 법적 문제 표현을 찾는 역할입니다.`,
    `다음 블로그 초안의 표현을 검수하세요.\n\n[초안]\n${draft}\n\n검수 항목:\n1. 근거 없는 과장 표현 ("최고", "완벽", "100% 보장" 등)\n2. 비전문가가 따라 하다 위험할 수 있는 자가수리 지침\n3. 경쟁사 비방 또는 법적 문제가 될 수 있는 표현\n4. 가격·납기를 확정적으로 약속하는 표현 (분쟁 소지)\n\n형식:\n문제없음: [항목 목록]\n수정필요: [구체적 내용과 이유] (없으면 "없음")`,
    '2팀 팀원B · 표현 안전성 검수'
  );

  // ── 2팀 팀장: 최종 판정 ──
  const verifyLeader = await callAgent(
    `당신은 스마텍 콘텐츠 2팀 팀장입니다.
두 팀원의 검수 결과를 종합해 최종 통과/반려를 결정합니다.
관리자가 최종 확인하므로 심각한 문제가 없으면 통과입니다.
사소한 표현 차이는 통과, 실제 오류·위험 지침·법적 문제만 반려입니다.`,
    `팀원A 검수:\n${verifyA}\n\n팀원B 검수:\n${verifyB}\n\n다음 형식으로 답하세요:\n판정: [통과 / 반려]\n이유: [한 줄]\n수정 권고사항: [있으면 구체적으로, 없으면 "없음"]`,
    '2팀 팀장 · 최종 판정'
  );

  const isPassed = verifyLeader.includes('판정: 통과');
  console.log(`\n${ isPassed ? '✅ 2팀 판정: 통과' : '❌ 2팀 판정: 반려'}`);
  console.log(verifyLeader);

  // ── 3팀: SEO 최적화 (2팀 통과 시만 실행) ──
  let seoA = '', seoB = '', seoLeader = '';
  let seoTitle = '', seoMeta = '', seoTags = '', seoFinalDraft = draft;

  if (isPassed) {
    seoA = await callAgent(
      `당신은 스마텍 콘텐츠 3팀 팀원입니다. 네이버 검색 최적화(SEO) 전문가입니다.
블로그 글 제목이 네이버에서 잘 검색되도록 최적화하는 역할입니다.`,
      `다음 블로그 글을 보고 네이버 검색 최적화 제목 3개를 제안하세요.\n\n[글 내용]\n${draft}\n\n[검색량 데이터]\n${keywordText.slice(0, 1000)}\n\n규칙:\n- 제목 길이: 25~35자\n- 핵심 키워드를 앞쪽에 배치\n- 검색자의 의도(질문형 or 정보형)에 맞게\n- "스마텍" 브랜드명은 제목에 포함하지 않음\n\n형식:\n1. [제목] - [이유 한 줄]\n2. [제목] - [이유 한 줄]\n3. [제목] - [이유 한 줄]`,
      '3팀 팀원A · SEO 제목 최적화'
    );

    seoB = await callAgent(
      `당신은 스마텍 콘텐츠 3팀 팀원입니다. 네이버 블로그 콘텐츠 구조 최적화 전문가입니다.
소제목과 키워드 배치를 검색 최적화에 맞게 분석하는 역할입니다.`,
      `다음 블로그 글의 구조를 네이버 SEO에 맞게 분석하세요.\n\n[글 내용]\n${draft}\n\n분석 항목:\n1. 현재 소제목(##) 목록과 개선 제안\n2. 핵심 키워드가 첫 단락에 자연스럽게 들어가 있는지\n3. 추천 태그 키워드 5~8개\n4. 메타 설명(검색 결과에 표시되는 요약문) 160자 이내\n\n형식:\n현재소제목: [목록]\n개선소제목: [목록]\n키워드배치: [문제없음 / 수정필요: 내용]\n추천태그: [쉼표로 구분]\n메타설명: [160자 이내]`,
      '3팀 팀원B · 구조·키워드 최적화'
    );

    seoLeader = await callAgent(
      `당신은 스마텍 콘텐츠 3팀 팀장입니다.
두 팀원의 SEO 분석을 종합해 최종 발행 제목과 메타 설명을 확정하고, 최종 발행용 글을 완성합니다.
브랜드 보이스와 말투는 절대 바꾸지 않습니다. 소제목만 필요 시 SEO에 맞게 수정합니다.`,
      `팀원A 제목 제안:\n${seoA}\n\n팀원B 구조 분석:\n${seoB}\n\n원본 글:\n${draft}\n\n다음 형식을 정확히 지켜 완성하세요:\n\n최종제목: [선정된 제목]\n메타설명: [160자 이내]\n추천태그: [쉼표 구분 5~8개]\n\n---발행용---\n[소제목만 필요 시 수정된 최종 글 전체]`,
      '3팀 팀장 · 최종 SEO 발행본',
      2048
    );

    const titleMatch = seoLeader.match(/최종제목:\s*(.+)/);
    const metaMatch = seoLeader.match(/메타설명:\s*(.+)/);
    const tagsMatch = seoLeader.match(/추천태그:\s*(.+)/);
    const finalMatch = seoLeader.match(/---발행용---\n([\s\S]+)$/);

    seoTitle = titleMatch ? titleMatch[1].trim() : '';
    seoMeta = metaMatch ? metaMatch[1].trim() : '';
    seoTags = tagsMatch ? tagsMatch[1].trim() : '';
    seoFinalDraft = finalMatch ? finalMatch[1].trim() : draft;

    console.log(`\n🔍 3팀 SEO 최적화 완료`);
    console.log(`제목: ${seoTitle}`);
    console.log(`태그: ${seoTags}`);
  }

  // ── 결과 저장 ──
  const outputDir = path.join(root, 'data', '콘텐츠');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const now = new Date();
  const ts = now.getFullYear().toString()
    + String(now.getMonth()+1).padStart(2,'0')
    + String(now.getDate()).padStart(2,'0')
    + '_'
    + String(now.getHours()).padStart(2,'0')
    + String(now.getMinutes()).padStart(2,'0');

  const verdict = isPassed ? '✅ 통과' : '❌ 반려';
  const seoSection = isPassed ? [
    '',
    '---',
    '',
    '## 3팀 · SEO 최적화',
    '',
    '### 팀원A · SEO 제목 제안',
    seoA,
    '',
    '### 팀원B · 구조·키워드 분석',
    seoB,
    '',
    '### 팀장 · 최종 SEO 확정',
    seoLeader,
    '',
    '---',
    '',
    '## 최종 발행본 (SEO 적용)',
    `**제목:** ${seoTitle}`,
    `**메타설명:** ${seoMeta}`,
    `**태그:** ${seoTags}`,
    '',
    seoFinalDraft,
  ] : [
    '',
    '---',
    '',
    '## 최종 초안 (2팀 반려 — SEO 미실행)',
    '',
    draft,
  ];

  const fullOutput = [
    '# 스마텍 AI 파이프라인 결과',
    '',
    '## 1팀 · 팀원A 제안 (검색량 분석)',
    memberA,
    '',
    '## 1팀 · 팀원B 제안 (고객 현장)',
    memberB,
    '',
    '## 1팀 · 팀장 선정',
    leader,
    '',
    '---',
    '',
    `## 2팀 검수 결과: ${verdict}`,
    '',
    '### 팀원A · 기술 스펙 검수',
    verifyA,
    '',
    '### 팀원B · 표현 안전성 검수',
    verifyB,
    '',
    '### 팀장 · 최종 판정',
    verifyLeader,
    ...seoSection,
  ].join('\n');

  const outputPath = path.join(outputDir, `글_${ts}_${isPassed ? '통과' : '반려'}.md`);
  fs.writeFileSync(outputPath, fullOutput, 'utf8');

  console.log('========================================');
  console.log('  완료!');
  console.log(`  저장 위치: ${outputPath}`);
  console.log('========================================\n');
  if (isPassed) {
    console.log(`─── 최종 발행본 (SEO 적용) ───\n`);
    console.log(`제목: ${seoTitle}`);
    console.log(`태그: ${seoTags}\n`);
    console.log(seoFinalDraft);
  } else {
    console.log('─── 최종 초안 (반려) ───\n');
    console.log(draft);
  }
}

main().catch(err => console.error('\n❌ 오류:', err.message));
