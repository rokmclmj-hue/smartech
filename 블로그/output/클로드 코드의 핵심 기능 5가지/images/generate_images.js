const { chromium } = require('playwright');
const path = require('path');

const outputDir = path.resolve(__dirname);

const thumbnailHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1080px;
    height: 1080px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
    overflow: hidden;
    position: relative;
  }
  .bg-grid {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image:
      linear-gradient(rgba(99,179,237,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,179,237,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
  }
  .accent-circle {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
  }
  .accent-circle.c1 {
    width: 400px; height: 400px;
    background: rgba(102, 126, 234, 0.2);
    top: -100px; right: -80px;
  }
  .accent-circle.c2 {
    width: 300px; height: 300px;
    background: rgba(240, 147, 251, 0.12);
    bottom: -80px; left: -60px;
  }
  .content {
    position: relative;
    z-index: 10;
    text-align: center;
    padding: 80px;
    width: 100%;
  }
  .badge {
    display: inline-block;
    background: rgba(99,179,237,0.15);
    border: 1px solid rgba(99,179,237,0.4);
    border-radius: 100px;
    padding: 10px 28px;
    color: #63b3ed;
    font-size: 22px;
    letter-spacing: 0.05em;
    margin-bottom: 48px;
    font-family: 'Courier New', monospace;
  }
  .title {
    font-size: 72px;
    font-weight: 900;
    color: #ffffff;
    line-height: 1.2;
    margin-bottom: 32px;
    letter-spacing: -0.02em;
    text-shadow: 0 4px 30px rgba(0,0,0,0.5);
  }
  .title .highlight {
    background: linear-gradient(90deg, #63b3ed, #9f7aea);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .subtitle {
    font-size: 30px;
    color: #a0aec0;
    letter-spacing: 0.02em;
    margin-bottom: 64px;
  }
  .tags {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
  }
  .tag {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 8px;
    padding: 8px 20px;
    color: #e2e8f0;
    font-size: 20px;
  }
  .corner-code {
    position: absolute;
    bottom: 60px;
    right: 60px;
    font-family: 'Courier New', monospace;
    font-size: 18px;
    color: rgba(99,179,237,0.35);
    text-align: right;
    line-height: 1.8;
  }
  .top-deco {
    position: absolute;
    top: 48px;
    left: 60px;
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .dot {
    width: 14px; height: 14px;
    border-radius: 50%;
  }
  .dot.red { background: #fc8181; }
  .dot.yellow { background: #f6e05e; }
  .dot.green { background: #68d391; }
</style>
</head>
<body>
  <div class="bg-grid"></div>
  <div class="accent-circle c1"></div>
  <div class="accent-circle c2"></div>
  <div class="top-deco">
    <div class="dot red"></div>
    <div class="dot yellow"></div>
    <div class="dot green"></div>
  </div>
  <div class="content">
    <div class="badge">Claude Code 2026</div>
    <div class="title">
      클로드 코드<br><span class="highlight">핵심 기능 5가지</span>
    </div>
    <div class="subtitle">2026년 완전 정리</div>
    <div class="tags">
      <span class="tag">에이전틱 코딩</span>
      <span class="tag">멀티 에이전트</span>
      <span class="tag">확장된 사고</span>
      <span class="tag">MCP</span>
      <span class="tag">메모리 시스템</span>
    </div>
  </div>
  <div class="corner-code">
    const claude = new ClaudeCode();<br>
    await claude.run({ features: 5 });
  </div>
</body>
</html>`;

const image01Html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1080px;
    height: 640px;
    background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
    font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 56px 64px;
  }
  h2 {
    font-size: 32px;
    color: #e6edf3;
    margin-bottom: 48px;
    text-align: center;
    letter-spacing: -0.01em;
  }
  h2 span { color: #58a6ff; }
  .flow {
    display: flex;
    align-items: center;
    gap: 0;
    width: 100%;
  }
  .step {
    flex: 1;
    background: rgba(88,166,255,0.08);
    border: 1.5px solid rgba(88,166,255,0.25);
    border-radius: 16px;
    padding: 28px 20px;
    text-align: center;
    position: relative;
  }
  .step .icon { font-size: 36px; margin-bottom: 14px; display: block; }
  .step .num {
    position: absolute;
    top: -14px;
    left: 50%;
    transform: translateX(-50%);
    background: #58a6ff;
    color: #0d1117;
    font-size: 14px;
    font-weight: 700;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .step .label { font-size: 22px; font-weight: 700; color: #e6edf3; margin-bottom: 8px; }
  .step .desc { font-size: 16px; color: #8b949e; line-height: 1.5; }
  .arrow { font-size: 28px; color: #58a6ff; padding: 0 12px; flex-shrink: 0; }
  .note {
    margin-top: 36px;
    font-size: 18px;
    color: #8b949e;
    font-family: 'Courier New', monospace;
    background: rgba(88,166,255,0.05);
    border: 1px solid rgba(88,166,255,0.15);
    border-radius: 8px;
    padding: 12px 28px;
  }
</style>
</head>
<body>
  <h2>클로드 코드 <span>에이전틱 코딩</span> 흐름도</h2>
  <div class="flow">
    <div class="step">
      <span class="num">1</span>
      <span class="icon">📋</span>
      <div class="label">작업 계획</div>
      <div class="desc">코드베이스 분석<br>태스크 분해</div>
    </div>
    <div class="arrow">→</div>
    <div class="step">
      <span class="num">2</span>
      <span class="icon">⚡</span>
      <div class="label">실행</div>
      <div class="desc">파일 생성·수정<br>터미널 명령 실행</div>
    </div>
    <div class="arrow">→</div>
    <div class="step">
      <span class="num">3</span>
      <span class="icon">🧪</span>
      <div class="label">테스트</div>
      <div class="desc">자동 실행<br>실패 시 재수정</div>
    </div>
    <div class="arrow">→</div>
    <div class="step">
      <span class="num">4</span>
      <span class="icon">📦</span>
      <div class="label">커밋</div>
      <div class="desc">Git 커밋<br>CI/CD 모니터링</div>
    </div>
  </div>
  <div class="note">// 종단 간(end-to-end) 자율 실행 — 인간 개입 최소화</div>
</body>
</html>`;

const image02Html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1080px;
    height: 680px;
    background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
    font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 56px 64px;
  }
  h2 { font-size: 32px; color: #e6edf3; margin-bottom: 44px; text-align: center; }
  h2 span { color: #f0a0ff; }
  .diagram { width: 100%; display: flex; flex-direction: column; align-items: center; }
  .orchestrator {
    background: linear-gradient(135deg, rgba(240,160,255,0.15), rgba(130,80,255,0.15));
    border: 2px solid rgba(240,160,255,0.5);
    border-radius: 16px;
    padding: 20px 60px;
    text-align: center;
    width: 340px;
  }
  .orchestrator .label { font-size: 24px; font-weight: 700; color: #f0a0ff; }
  .orchestrator .sub { font-size: 15px; color: #8b949e; margin-top: 6px; }
  .connector-area {
    display: flex;
    align-items: flex-start;
    gap: 40px;
    position: relative;
    padding-top: 20px;
  }
  .v-line {
    position: absolute; top: 0; left: 50%; transform: translateX(-50%);
    width: 2px; height: 20px; background: rgba(240,160,255,0.4);
  }
  .h-line {
    position: absolute; top: 20px; left: calc(50% - 220px);
    width: 440px; height: 2px; background: rgba(240,160,255,0.25);
  }
  .agent-col { display: flex; flex-direction: column; align-items: center; }
  .agent-tick { width: 2px; height: 20px; background: rgba(240,160,255,0.3); }
  .agent-box {
    width: 240px;
    background: rgba(88,166,255,0.08);
    border: 1.5px solid rgba(88,166,255,0.3);
    border-radius: 12px;
    padding: 18px 20px;
    text-align: center;
  }
  .agent-box .title { font-size: 18px; font-weight: 700; color: #58a6ff; margin-bottom: 10px; }
  .agent-box ul { list-style: none; text-align: left; }
  .agent-box ul li {
    font-size: 14px; color: #8b949e; padding: 3px 0 3px 16px; position: relative;
  }
  .agent-box ul li::before { content: '›'; position: absolute; left: 0; color: #58a6ff; }
  .note {
    margin-top: 32px; font-size: 17px; color: #e6edf3;
    background: rgba(255,200,0,0.08); border: 1px solid rgba(255,200,0,0.25);
    border-radius: 8px; padding: 12px 28px;
  }
  .note span { color: #f6e05e; font-weight: 700; }
</style>
</head>
<body>
  <h2>멀티 에이전트 <span>협업 구조</span></h2>
  <div class="diagram">
    <div class="orchestrator">
      <div class="label">오케스트레이터</div>
      <div class="sub">Claude Code 메인 세션</div>
    </div>
    <div class="connector-area">
      <div class="v-line"></div>
      <div class="h-line"></div>
      <div class="agent-col">
        <div class="agent-tick"></div>
        <div class="agent-box">
          <div class="title">서브에이전트 A</div>
          <ul>
            <li>테스트 실행</li>
            <li>버그 조사</li>
            <li>독립 컨텍스트</li>
          </ul>
        </div>
      </div>
      <div class="agent-col">
        <div class="agent-tick"></div>
        <div class="agent-box">
          <div class="title">서브에이전트 B</div>
          <ul>
            <li>문서 생성</li>
            <li>모듈 리팩터링</li>
            <li>독립 컨텍스트</li>
          </ul>
        </div>
      </div>
      <div class="agent-col">
        <div class="agent-tick"></div>
        <div class="agent-box">
          <div class="title">에이전트 팀</div>
          <ul>
            <li>공유 태스크 목록</li>
            <li>에이전트 간 소통</li>
            <li>병렬 처리</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <div class="note">⚠ <span>병렬 실행 시 토큰 쿼터도 병렬 소모</span> — 예산 전략 필요</div>
</body>
</html>`;

const image03Html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1080px;
    height: 620px;
    background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
    font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 56px 80px;
  }
  h2 { font-size: 32px; color: #e6edf3; margin-bottom: 48px; text-align: center; }
  h2 span { color: #fbd38d; }
  .flow { display: flex; align-items: stretch; gap: 0; width: 100%; }
  .phase {
    flex: 1; border-radius: 16px; padding: 32px 28px;
    text-align: center; display: flex; flex-direction: column; align-items: center; gap: 14px;
  }
  .phase.input { background: rgba(88,166,255,0.08); border: 1.5px solid rgba(88,166,255,0.25); }
  .phase.think { background: rgba(251,211,141,0.08); border: 1.5px solid rgba(251,211,141,0.35); }
  .phase.output { background: rgba(104,211,145,0.08); border: 1.5px solid rgba(104,211,145,0.3); }
  .phase .icon { font-size: 42px; }
  .phase .title { font-size: 22px; font-weight: 700; color: #e6edf3; }
  .phase .desc { font-size: 16px; color: #8b949e; line-height: 1.6; }
  .phase .tag { font-family: 'Courier New', monospace; font-size: 13px; padding: 5px 14px; border-radius: 100px; }
  .phase.input .tag { background: rgba(88,166,255,0.15); color: #58a6ff; }
  .phase.think .tag { background: rgba(251,211,141,0.15); color: #fbd38d; }
  .phase.output .tag { background: rgba(104,211,145,0.15); color: #68d391; }
  .arrow-box { display: flex; align-items: center; padding: 0 16px; flex-shrink: 0; }
  .arrow-box .arrow-inner { font-size: 32px; color: rgba(255,255,255,0.2); }
  .effort-row { margin-top: 32px; display: flex; gap: 16px; align-items: center; }
  .effort-label { font-size: 18px; color: #8b949e; margin-right: 8px; }
  .effort-badge {
    padding: 8px 24px; border-radius: 100px; font-size: 17px;
    font-weight: 700; font-family: 'Courier New', monospace;
  }
  .effort-badge.low { background: rgba(104,211,145,0.15); color: #68d391; border: 1px solid rgba(104,211,145,0.4); }
  .effort-badge.med { background: rgba(251,211,141,0.15); color: #fbd38d; border: 1px solid rgba(251,211,141,0.4); }
  .effort-badge.high { background: rgba(252,129,129,0.15); color: #fc8181; border: 1px solid rgba(252,129,129,0.4); }
</style>
</head>
<body>
  <h2>확장된 사고 <span>(Extended Thinking)</span> 동작 방식</h2>
  <div class="flow">
    <div class="phase input">
      <span class="icon">💬</span>
      <div class="title">입력</div>
      <div class="desc">사용자 요청<br>복잡한 작업<br>아키텍처 설계 등</div>
      <span class="tag">user prompt</span>
    </div>
    <div class="arrow-box"><div class="arrow-inner">→</div></div>
    <div class="phase think">
      <span class="icon">🧠</span>
      <div class="title">추론 단계</div>
      <div class="desc">내부 사고 전개<br>전략 수립<br>단계별 검토</div>
      <span class="tag">thinking tokens</span>
    </div>
    <div class="arrow-box"><div class="arrow-inner">→</div></div>
    <div class="phase output">
      <span class="icon">✅</span>
      <div class="title">응답 생성</div>
      <div class="desc">더 정확한 결과<br>검증된 코드<br>최적화된 설계</div>
      <span class="tag">final response</span>
    </div>
  </div>
  <div class="effort-row">
    <span class="effort-label">effort 파라미터:</span>
    <span class="effort-badge low">low</span>
    <span class="effort-badge med">medium</span>
    <span class="effort-badge high">high</span>
  </div>
</body>
</html>`;

const image04Html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1080px;
    height: 660px;
    background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
    font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 52px 64px;
  }
  h2 { font-size: 32px; color: #e6edf3; margin-bottom: 40px; text-align: center; }
  h2 span { color: #68d391; }
  .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; width: 100%; }
  .card {
    background: rgba(255,255,255,0.04); border-radius: 16px; padding: 28px 24px;
    border: 1.5px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; gap: 12px;
  }
  .card.card-main { border-color: rgba(104,211,145,0.4); background: rgba(104,211,145,0.06); }
  .card.card-slash { border-color: rgba(88,166,255,0.4); background: rgba(88,166,255,0.06); }
  .card.card-hook { border-color: rgba(251,211,141,0.4); background: rgba(251,211,141,0.06); }
  .card .icon { font-size: 36px; }
  .card .title { font-size: 22px; font-weight: 700; font-family: 'Courier New', monospace; }
  .card.card-main .title { color: #68d391; }
  .card.card-slash .title { color: #58a6ff; }
  .card.card-hook .title { color: #fbd38d; }
  .card .filepath {
    font-size: 13px; font-family: 'Courier New', monospace; color: #8b949e;
    background: rgba(255,255,255,0.05); border-radius: 6px; padding: 6px 10px;
  }
  .card ul { list-style: none; margin-top: 4px; }
  .card ul li {
    font-size: 15px; color: #8b949e; padding: 4px 0 4px 18px; position: relative; line-height: 1.5;
  }
  .card.card-main ul li::before { content: '▸'; position: absolute; left: 0; color: #68d391; }
  .card.card-slash ul li::before { content: '▸'; position: absolute; left: 0; color: #58a6ff; }
  .card.card-hook ul li::before { content: '▸'; position: absolute; left: 0; color: #fbd38d; }
  .bottom-note {
    margin-top: 28px; font-size: 18px; color: #8b949e; text-align: center;
    font-family: 'Courier New', monospace; background: rgba(104,211,145,0.06);
    border: 1px solid rgba(104,211,145,0.2); border-radius: 8px; padding: 12px 28px; width: 100%;
  }
  .bottom-note span { color: #68d391; }
</style>
</head>
<body>
  <h2>클로드 코드 <span>메모리 시스템</span> 구조</h2>
  <div class="grid">
    <div class="card card-main">
      <span class="icon">📄</span>
      <div class="title">CLAUDE.md</div>
      <div class="filepath">./CLAUDE.md</div>
      <ul>
        <li>프로젝트 개요 기록</li>
        <li>핵심 명령어 저장</li>
        <li>팀 선호도 유지</li>
        <li>계층 구조 지원</li>
      </ul>
    </div>
    <div class="card card-slash">
      <span class="icon">⌨️</span>
      <div class="title">/slash 명령어</div>
      <div class="filepath">.claude/commands/</div>
      <ul>
        <li>마크다운으로 정의</li>
        <li>코드 리뷰 규칙</li>
        <li>배포 절차 표준화</li>
        <li>팀 공유 가능</li>
      </ul>
    </div>
    <div class="card card-hook">
      <span class="icon">🔗</span>
      <div class="title">훅(Hooks)</div>
      <div class="filepath">settings.json</div>
      <ul>
        <li>파일 저장 후 Prettier</li>
        <li>편집 후 타입 체크</li>
        <li>라이프사이클 개입</li>
        <li>자동화 스크립트</li>
      </ul>
    </div>
  </div>
  <div class="bottom-note">
    ✨ <span>Dreaming</span> — 과거 세션 검토 → 실수 패턴 학습 → 메모리 자동 개선 (2026)
  </div>
</body>
</html>`;

const images = [
  { filename: 'thumbnail.png', html: thumbnailHtml, width: 1080, height: 1080 },
  { filename: 'image-01.png', html: image01Html, width: 1080, height: 640 },
  { filename: 'image-02.png', html: image02Html, width: 1080, height: 680 },
  { filename: 'image-03.png', html: image03Html, width: 1080, height: 620 },
  { filename: 'image-04.png', html: image04Html, width: 1080, height: 660 },
];

(async () => {
  const browser = await chromium.launch();
  for (const img of images) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: img.width, height: img.height });
    await page.setContent(img.html, { waitUntil: 'networkidle' });
    const outPath = path.join(outputDir, img.filename);
    await page.screenshot({ path: outPath, fullPage: false });
    await page.close();
    console.log('Captured:', img.filename);
  }
  await browser.close();
  console.log('All images generated successfully.');
})();
