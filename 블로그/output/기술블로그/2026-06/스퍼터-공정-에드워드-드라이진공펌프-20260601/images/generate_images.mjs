import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const OUTPUT_DIR = String.raw`c:\Users\rokmc\Desktop\블로그\output\스퍼터 공정 에드워드 드라이진공펌프\images`;

// ─────────────────────────────────────────────
// thumbnail.png  1080×1080  대표 이미지
// ─────────────────────────────────────────────
const thumbnailHTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width:1080px; height:1080px; overflow:hidden;
    background: linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    font-family: 'Malgun Gothic', 'Nanum Gothic', sans-serif;
    display:flex; flex-direction:column;
    align-items:center; justify-content:center;
  }
  .badge {
    background: rgba(100,200,255,0.15);
    border: 1px solid rgba(100,200,255,0.4);
    color: #64c8ff;
    font-size: 22px;
    letter-spacing: 3px;
    padding: 10px 30px;
    border-radius: 30px;
    margin-bottom: 40px;
    text-transform: uppercase;
  }
  .icon-row {
    display:flex; gap:28px; margin-bottom:48px;
  }
  .icon-box {
    width:72px; height:72px;
    background: rgba(100,200,255,0.12);
    border: 1.5px solid rgba(100,200,255,0.35);
    border-radius: 16px;
    display:flex; align-items:center; justify-content:center;
    font-size: 34px;
  }
  .main-title {
    font-size: 52px;
    font-weight: 900;
    color: #ffffff;
    text-align: center;
    line-height: 1.35;
    max-width: 860px;
    margin-bottom: 32px;
    text-shadow: 0 2px 24px rgba(0,0,0,0.5);
  }
  .highlight { color: #64c8ff; }
  .sub-title {
    font-size: 26px;
    color: #a0aec0;
    text-align: center;
    letter-spacing: 1px;
    margin-bottom: 60px;
  }
  .features {
    display:flex; gap:24px;
  }
  .feat {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 14px;
    padding: 18px 28px;
    color: #cbd5e0;
    font-size: 20px;
    text-align: center;
    line-height: 1.5;
  }
  .feat strong { color: #90cdf4; display:block; font-size:22px; margin-bottom:4px; }
  .bottom-bar {
    position:absolute;
    bottom:0; left:0; right:0;
    height:6px;
    background: linear-gradient(90deg, #3182ce, #805ad5, #d53f8c);
  }
</style>
</head><body>
  <div class="badge">Edwards Vacuum · PVD Solution</div>
  <div class="icon-row">
    <div class="icon-box">⚙️</div>
    <div class="icon-box">💨</div>
    <div class="icon-box">🔬</div>
  </div>
  <div class="main-title">스퍼터 공정용<br><span class="highlight">에드워드 드라이진공펌프</span><br>핵심 특성 3가지</div>
  <div class="sub-title">PVD 공정 필수 솔루션</div>
  <div class="features">
    <div class="feat"><strong>무오일 설계</strong>박막 오염 제로</div>
    <div class="feat"><strong>고속 펌핑</strong>에너지 96% 절감</div>
    <div class="feat"><strong>내부식성</strong>가혹 공정 대응</div>
  </div>
  <div class="bottom-bar"></div>
</body></html>`;

// ─────────────────────────────────────────────
// body-1.png  1200×630  단계별 다이어그램
// nXDS 스크롤 펌프 오일프리 작동 원리
// ─────────────────────────────────────────────
const body1HTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width:1200px; height:630px; overflow:hidden;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    font-family: 'Malgun Gothic', 'Nanum Gothic', sans-serif;
    padding: 48px 60px;
    display:flex; flex-direction:column;
  }
  .header {
    display:flex; align-items:center; gap:16px; margin-bottom:40px;
  }
  .tag {
    background: #3182ce; color:#fff;
    font-size:15px; padding:5px 16px; border-radius:20px;
    letter-spacing:1px;
  }
  h2 {
    color:#fff; font-size:28px; font-weight:800;
  }
  .steps {
    display:flex; align-items:stretch; gap:0; flex:1;
  }
  .step {
    flex:1;
    background: rgba(255,255,255,0.05);
    border: 1.5px solid rgba(100,180,255,0.25);
    border-radius: 18px;
    padding: 32px 28px;
    display:flex; flex-direction:column; align-items:center;
    text-align:center;
  }
  .step-num {
    width:48px; height:48px;
    background: linear-gradient(135deg,#3182ce,#805ad5);
    border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    color:#fff; font-size:22px; font-weight:900;
    margin-bottom:20px;
  }
  .step-icon { font-size:48px; margin-bottom:16px; }
  .step-title { color:#90cdf4; font-size:20px; font-weight:700; margin-bottom:12px; }
  .step-desc { color:#cbd5e0; font-size:16px; line-height:1.7; }
  .arrow {
    display:flex; align-items:center; justify-content:center;
    width:56px; flex-shrink:0;
    color:#4a9eff; font-size:36px;
  }
  .note {
    margin-top:28px;
    background: rgba(49,130,206,0.15);
    border-left: 4px solid #3182ce;
    border-radius: 0 10px 10px 0;
    padding: 14px 20px;
    color:#a0aec0; font-size:15px; line-height:1.6;
  }
  .note strong { color:#63b3ed; }
</style>
</head><body>
  <div class="header">
    <div class="tag">작동 원리</div>
    <h2>nXDS 드라이 스크롤 펌프 — 오일프리 2단계 배기 흐름</h2>
  </div>
  <div class="steps">
    <div class="step">
      <div class="step-num">1</div>
      <div class="step-icon">🌀</div>
      <div class="step-title">흡입 · 압축 단계</div>
      <div class="step-desc">고정 스크롤과 선회 스크롤이<br>비접촉 상태로 맞물려 회전<br><br>외부에서 유입된 기체를<br>나선 통로를 따라 중심부로<br>이송하며 연속 압축</div>
    </div>
    <div class="arrow">→</div>
    <div class="step">
      <div class="step-num">2</div>
      <div class="step-icon">💨</div>
      <div class="step-title">배기 단계</div>
      <div class="step-desc">중심부에서 최대 압축된 기체를<br>배기구로 밀어냄<br><br>오일 없이 팁 씰(tip seal)만으로<br>밀봉 → 탄화수소 역류 zero<br>챔버 측 오염 원천 차단</div>
    </div>
    <div class="arrow">→</div>
    <div class="step">
      <div class="step-num">✓</div>
      <div class="step-icon">🏭</div>
      <div class="step-title">공정 측 효과</div>
      <div class="step-desc">오일 교환·폐기물 제거<br>박막 오염 리스크 zero<br><br>TMP 백킹·스퍼터 코터<br>직접 탑재(on-tool) 가능<br>소형·저소음 6~20 m³/h</div>
    </div>
  </div>
  <div class="note"><strong>베어링 실드(bearing shield)</strong> 구조가 공정 가스와 윤활부를 물리적으로 완전 분리 — 오일 혼입 현상 자체를 원천 차단합니다.</div>
</body></html>`;

// ─────────────────────────────────────────────
// body-2.png  1200×630  인용·강조 박스
// iXL 그린모드 에너지 절감 수치 강조
// ─────────────────────────────────────────────
const body2HTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width:1200px; height:630px; overflow:hidden;
    background: linear-gradient(135deg, #1a1a2e 0%, #0d2137 100%);
    font-family: 'Malgun Gothic', 'Nanum Gothic', sans-serif;
    display:flex; align-items:center; justify-content:center;
    padding: 48px 64px;
  }
  .container { display:flex; gap:48px; align-items:center; width:100%; }
  .left { flex:1.1; }
  .right { flex:0.9; display:flex; flex-direction:column; gap:20px; }
  .series-badge {
    display:inline-block;
    background: linear-gradient(90deg,#3182ce,#805ad5);
    color:#fff; font-size:16px; font-weight:700;
    padding: 8px 22px; border-radius:24px; margin-bottom:24px;
    letter-spacing:2px;
  }
  .big-quote {
    color:#63b3ed; font-size:80px; font-weight:900;
    line-height:1;
    margin-bottom:0;
  }
  .stat-value {
    font-size:110px; font-weight:900;
    background: linear-gradient(135deg,#63b3ed,#9f7aea);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    line-height:1;
    margin-bottom:4px;
  }
  .stat-label {
    font-size:24px; color:#a0aec0; line-height:1.5;
    margin-bottom:28px;
  }
  .stat-label strong { color:#90cdf4; }
  .source { font-size:14px; color:#718096; }
  .card {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(100,180,255,0.2);
    border-radius:14px;
    padding:20px 24px;
  }
  .card-title { color:#63b3ed; font-size:16px; font-weight:700; margin-bottom:8px; }
  .card-val { color:#fff; font-size:26px; font-weight:800; }
  .card-sub { color:#a0aec0; font-size:14px; margin-top:4px; }
</style>
</head><body>
  <div class="container">
    <div class="left">
      <div class="series-badge">iXL 시리즈 · Green Mode</div>
      <div class="big-quote">"</div>
      <div class="stat-value">96%</div>
      <div class="stat-label">
        <strong>대기(idle) 구간 에너지 소비 절감</strong><br>
        그린 모드(Green Mode) 적용 시
      </div>
      <div class="source">출처: Edwards Vacuum — iXL 시리즈 공식 제품 사양</div>
    </div>
    <div class="right">
      <div class="card">
        <div class="card-title">⚡ iXM 시리즈</div>
        <div class="card-val">60% 절감</div>
        <div class="card-sub">입력 전력 기존 대비 (약 1.3 kW)</div>
      </div>
      <div class="card">
        <div class="card-title">🔇 nXDS 스크롤</div>
        <div class="card-val">최대 20배</div>
        <div class="card-sub">기존 펌프 대비 저소음·저진동</div>
      </div>
      <div class="card">
        <div class="card-title">📐 소형 설계</div>
        <div class="card-val">on-tool 탑재</div>
        <div class="card-sub">스퍼터 장비 직접 장착 가능</div>
      </div>
    </div>
  </div>
</body></html>`;

// ─────────────────────────────────────────────
// body-3.png  1200×630  핵심 포인트 카드
// iXH 4가지 핵심 기술 카드
// ─────────────────────────────────────────────
const body3HTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width:1200px; height:630px; overflow:hidden;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    font-family: 'Malgun Gothic', 'Nanum Gothic', sans-serif;
    padding: 40px 56px;
    display:flex; flex-direction:column;
  }
  .header { display:flex; align-items:center; gap:16px; margin-bottom:36px; }
  .tag { background:#9b2c2c; color:#fff; font-size:15px; padding:5px 18px; border-radius:20px; letter-spacing:1px; }
  h2 { color:#fff; font-size:26px; font-weight:800; }
  .cards { display:grid; grid-template-columns:1fr 1fr; gap:22px; flex:1; }
  .card {
    background: rgba(255,255,255,0.05);
    border: 1.5px solid rgba(255,150,100,0.25);
    border-radius:18px;
    padding: 26px 28px;
    display:flex; gap:18px; align-items:flex-start;
  }
  .card-icon {
    font-size:36px; flex-shrink:0;
    width:56px; height:56px;
    background: rgba(255,150,100,0.12);
    border-radius:12px;
    display:flex; align-items:center; justify-content:center;
  }
  .card-body {}
  .card-title { color:#fc8181; font-size:18px; font-weight:800; margin-bottom:8px; }
  .card-desc { color:#cbd5e0; font-size:15px; line-height:1.65; }
  .card-desc strong { color:#fbd38d; }
</style>
</head><body>
  <div class="header">
    <div class="tag">iXH 시리즈 · Harsh Process</div>
    <h2>가혹 공정 전용 — 4대 핵심 기술</h2>
  </div>
  <div class="cards">
    <div class="card">
      <div class="card-icon">💥</div>
      <div class="card-body">
        <div class="card-title">Gas Buster™ 기술</div>
        <div class="card-desc">공정 중 발생하는 <strong>파우더·분진 축적</strong>으로 인한 고장 방지<br>에드워드 독자 기술로 반응성 스퍼터링 환경에 최적화</div>
      </div>
    </div>
    <div class="card">
      <div class="card-icon">🛡️</div>
      <div class="card-body">
        <div class="card-title">내부식성 4배 향상</div>
        <div class="card-desc">가스 배리어(gas barrier) + 개선된 열 설계(thermal design)<br>전 세대 iH 시리즈 대비 <strong>내부식성 4배</strong> 향상</div>
      </div>
    </div>
    <div class="card">
      <div class="card-icon">🔧</div>
      <div class="card-body">
        <div class="card-title">'5-in-1' 퍼지 분배</div>
        <div class="card-desc"><strong>5개 위치</strong>에서 퍼지 가스를 균등 분배<br>침착물 발생 및 부식 가능성 최소화 → 오버홀 간격 연장</div>
      </div>
    </div>
    <div class="card">
      <div class="card-icon">⭕</div>
      <div class="card-body">
        <div class="card-title">Mk2 혁신 씰(Seal) 기술</div>
        <div class="card-desc">씰 수명 연장 + 누설 위험 감소<br>가혹 환경에서 <strong>장기 안정 운영</strong> 지원, TCO 절감에 기여</div>
      </div>
    </div>
  </div>
</body></html>`;

// ─────────────────────────────────────────────
// body-4.png  1200×630  비교 표
// XCEDE 처리 vs 일반 처리 내부식성 비교
// ─────────────────────────────────────────────
const body4HTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width:1200px; height:630px; overflow:hidden;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    font-family: 'Malgun Gothic', 'Nanum Gothic', sans-serif;
    padding: 40px 56px;
    display:flex; flex-direction:column;
  }
  .header { display:flex; align-items:center; gap:16px; margin-bottom:36px; }
  .tag { background:#276749; color:#9ae6b4; font-size:15px; padding:5px 18px; border-radius:20px; letter-spacing:1px; }
  h2 { color:#fff; font-size:26px; font-weight:800; }
  table {
    width:100%; border-collapse:collapse; flex:1;
    font-size:17px;
  }
  thead th {
    padding:14px 20px;
    text-align:center; font-weight:800;
    font-size:18px;
  }
  thead .th-cat { color:#a0aec0; background:rgba(255,255,255,0.04); border-radius:10px 0 0 0; text-align:left; }
  thead .th-std { color:#fc8181; background:rgba(252,129,129,0.08); }
  thead .th-xcede { color:#68d391; background:rgba(104,211,145,0.12); border-radius:0 10px 0 0; }
  tbody tr { border-bottom:1px solid rgba(255,255,255,0.07); }
  tbody tr:last-child { border-bottom:none; }
  tbody td { padding:16px 20px; }
  .td-cat { color:#a0aec0; font-weight:600; text-align:left; }
  .td-std { color:#fc8181; text-align:center; background:rgba(252,129,129,0.05); }
  .td-xcede { color:#68d391; text-align:center; background:rgba(104,211,145,0.07); font-weight:700; }
  .badge-bad { background:rgba(252,129,129,0.2); border-radius:20px; padding:4px 14px; font-size:15px; }
  .badge-good { background:rgba(104,211,145,0.2); border-radius:20px; padding:4px 14px; font-size:15px; }
  .note {
    margin-top:24px;
    background:rgba(104,211,145,0.08); border-left:4px solid #68d391;
    border-radius:0 10px 10px 0; padding:12px 18px;
    color:#a0aec0; font-size:14px; line-height:1.6;
  }
  .note strong { color:#68d391; }
</style>
</head><body>
  <div class="header">
    <div class="tag">XCEDE 기술</div>
    <h2>일반 처리 vs XCEDE 처리 — 내부식성·내마모성 비교</h2>
  </div>
  <table>
    <thead>
      <tr>
        <th class="th-cat">비교 항목</th>
        <th class="th-std">일반 처리 (표준)</th>
        <th class="th-xcede">XCEDE 처리</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="td-cat">부식 저항성</td>
        <td class="td-std"><span class="badge-bad">기준 (1×)</span></td>
        <td class="td-xcede"><span class="badge-good">대폭 향상 (최대 4×)</span></td>
      </tr>
      <tr>
        <td class="td-cat">화학적 마모 내성</td>
        <td class="td-std"><span class="badge-bad">일반 수준</span></td>
        <td class="td-xcede"><span class="badge-good">표면 처리 + 정밀 엔지니어링</span></td>
      </tr>
      <tr>
        <td class="td-cat">서비스 간격 (MTBS)</td>
        <td class="td-std"><span class="badge-bad">표준 주기</span></td>
        <td class="td-xcede"><span class="badge-good">연장된 오버홀 주기</span></td>
      </tr>
      <tr>
        <td class="td-cat">적용 시리즈</td>
        <td class="td-std"><span class="badge-bad">iXH 기본 구성</span></td>
        <td class="td-xcede"><span class="badge-good">iXH 기본 / iXL·iXM 옵션</span></td>
      </tr>
      <tr>
        <td class="td-cat">TCO 영향</td>
        <td class="td-std"><span class="badge-bad">표준 유지보수 비용</span></td>
        <td class="td-xcede"><span class="badge-good">비계획 다운타임 감소</span></td>
      </tr>
    </tbody>
  </table>
  <div class="note"><strong>XCEDE 기술</strong>은 표면 처리와 정밀 엔지니어링을 결합하여 화학적·기계적 마모를 줄이고 서비스 간격을 연장합니다. iXL 및 iXM 시리즈에도 옵션으로 제공됩니다.</div>
</body></html>`;

// ─────────────────────────────────────────────
// body-5.png  1200×630  비교 표
// nXDS / iXL / iXH / iXM 4개 시리즈 종합 비교
// ─────────────────────────────────────────────
const body5HTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width:1200px; height:630px; overflow:hidden;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    font-family: 'Malgun Gothic', 'Nanum Gothic', sans-serif;
    padding: 36px 48px;
    display:flex; flex-direction:column;
  }
  .header { display:flex; align-items:center; gap:16px; margin-bottom:30px; }
  .tag { background:#2c5282; color:#90cdf4; font-size:15px; padding:5px 18px; border-radius:20px; letter-spacing:1px; }
  h2 { color:#fff; font-size:26px; font-weight:800; }
  table { width:100%; border-collapse:collapse; font-size:16px; }
  thead th {
    padding:13px 16px; font-size:16px; font-weight:800; text-align:center;
    border-bottom:2px solid rgba(255,255,255,0.12);
  }
  .th-h { color:#a0aec0; text-align:left; }
  .th-nxds { color:#63b3ed; }
  .th-ixl  { color:#68d391; }
  .th-ixh  { color:#fc8181; }
  .th-ixm  { color:#fbd38d; }
  tbody tr { border-bottom:1px solid rgba(255,255,255,0.06); }
  tbody tr:last-child { border-bottom:none; }
  tbody td { padding:13px 16px; text-align:center; vertical-align:middle; line-height:1.5; }
  .td-head { color:#a0aec0; font-weight:700; text-align:left; font-size:15px; }
  .td-nxds { color:#bee3f8; background:rgba(99,179,237,0.05); }
  .td-ixl  { color:#c6f6d5; background:rgba(104,211,145,0.05); }
  .td-ixh  { color:#fed7d7; background:rgba(252,129,129,0.05); }
  .td-ixm  { color:#fefcbf; background:rgba(251,211,141,0.05); }
  .chip {
    display:inline-block; border-radius:12px; padding:3px 11px; font-size:13px; font-weight:700;
  }
  .chip-blue { background:rgba(99,179,237,0.2); color:#63b3ed; }
  .chip-green { background:rgba(104,211,145,0.2); color:#68d391; }
  .chip-red { background:rgba(252,129,129,0.2); color:#fc8181; }
  .chip-yellow { background:rgba(251,211,141,0.2); color:#f6e05e; }
</style>
</head><body>
  <div class="header">
    <div class="tag">제품 라인업</div>
    <h2>에드워드 드라이진공펌프 4개 시리즈 종합 비교</h2>
  </div>
  <table>
    <thead>
      <tr>
        <th class="th-h">비교 항목</th>
        <th class="th-nxds">nXDS (스크롤)</th>
        <th class="th-ixl">iXL (PVD 전용)</th>
        <th class="th-ixh">iXH (가혹 공정)</th>
        <th class="th-ixm">iXM (저에너지)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="td-head">주요 용도</td>
        <td class="td-nxds">스퍼터 코터 백킹<br>TMP 백킹</td>
        <td class="td-ixl">PVD 공정<br>Pre-Clean, 로드락</td>
        <td class="td-ixh">반응성 스퍼터링<br>FPD PVD</td>
        <td class="td-ixm">반도체 일반 PVD</td>
      </tr>
      <tr>
        <td class="td-head">대표 특성</td>
        <td class="td-nxds"><span class="chip chip-blue">오일프리</span> 저소음·저진동<br>6~20 m³/h</td>
        <td class="td-ixl"><span class="chip chip-green">Green Mode</span><br>소형 on-tool 탑재</td>
        <td class="td-ixh"><span class="chip chip-red">Gas Buster™</span><br>내부식성 4배</td>
        <td class="td-ixm"><span class="chip chip-yellow">루츠 메커니즘</span><br>입력전력 60% 절감</td>
      </tr>
      <tr>
        <td class="td-head">에너지 절감</td>
        <td class="td-nxds">저전력 구동</td>
        <td class="td-ixl">Idle 시 <strong>96% 절감</strong></td>
        <td class="td-ixh">10% 추가 절감<br>(iH 대비)</td>
        <td class="td-ixm"><strong>60% 절감</strong><br>(약 1.3 kW)</td>
      </tr>
      <tr>
        <td class="td-head">XCEDE 기술</td>
        <td class="td-nxds">해당 없음</td>
        <td class="td-ixl">옵션 제공</td>
        <td class="td-ixh">기본 내장</td>
        <td class="td-ixm">옵션 제공</td>
      </tr>
      <tr>
        <td class="td-head">가혹 공정 대응</td>
        <td class="td-nxds">일반 수준</td>
        <td class="td-ixl">일반 수준</td>
        <td class="td-ixh"><strong>최고 수준</strong><br>5-in-1 퍼지, Mk2 씰</td>
        <td class="td-ixm">일반 수준</td>
      </tr>
    </tbody>
  </table>
</body></html>`;

// ─────────────────────────────────────────────
// Main capture function
// ─────────────────────────────────────────────
const images = [
  { name: 'thumbnail.png', html: thumbnailHTML, width: 1080, height: 1080 },
  { name: 'body-1.png',    html: body1HTML,     width: 1200, height: 630  },
  { name: 'body-2.png',    html: body2HTML,     width: 1200, height: 630  },
  { name: 'body-3.png',    html: body3HTML,     width: 1200, height: 630  },
  { name: 'body-4.png',    html: body4HTML,     width: 1200, height: 630  },
  { name: 'body-5.png',    html: body5HTML,     width: 1200, height: 630  },
];

const browser = await chromium.launch();
for (const img of images) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: img.width, height: img.height });
  await page.setContent(img.html, { waitUntil: 'networkidle' });
  const path = `${OUTPUT_DIR}\\${img.name}`;
  await page.screenshot({ path, fullPage: false, clip: { x:0, y:0, width: img.width, height: img.height } });
  await page.close();
  console.log(`Generated: ${img.name}`);
}
await browser.close();
console.log('All images generated successfully.');
