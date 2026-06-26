"""
진공로-드라이펌프-선택기준-20260623 이미지 생성 스크립트
"""
from playwright.sync_api import sync_playwright

# ── 썸네일 (1200×628) ──────────────────────────────────────────
thumbnail_html = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 628px;
    background: #0B0B0C;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Pretendard Variable', 'Pretendard', 'Noto Sans KR', sans-serif;
    position: relative;
    overflow: hidden;
  }
  /* 배경 그라데이션 원형 */
  .bg-circle {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.25;
  }
  .bg-circle-1 {
    width: 500px; height: 500px;
    background: #c00020;
    top: -100px; left: -80px;
  }
  .bg-circle-2 {
    width: 400px; height: 400px;
    background: #0d3a8a;
    bottom: -100px; right: -60px;
  }
  /* 왼쪽 빨간 세로 바 */
  .accent-bar {
    position: absolute;
    left: 60px; top: 50%;
    transform: translateY(-50%);
    width: 5px; height: 200px;
    background: #c00020;
    border-radius: 3px;
  }
  /* 텍스트 컨테이너 */
  .content {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 18px;
    align-items: center;
    padding: 40px 80px;
  }
  .badge {
    display: inline-block;
    background: rgba(192,0,32,0.15);
    border: 1px solid rgba(192,0,32,0.5);
    color: #E46F75;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.12em;
    padding: 6px 18px;
    border-radius: 20px;
    text-transform: uppercase;
  }
  h1 {
    color: #FFFFFF;
    font-size: 56px;
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.02em;
  }
  .subtitle {
    color: #9B9590;
    font-size: 22px;
    font-weight: 400;
    letter-spacing: 0.02em;
  }
  /* 브랜드 텍스트 */
  .brand {
    position: absolute;
    right: 48px; bottom: 30px;
    color: rgba(255,255,255,0.35);
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.15em;
  }
</style>
</head>
<body>
  <div class="bg-circle bg-circle-1"></div>
  <div class="bg-circle bg-circle-2"></div>
  <div class="accent-bar"></div>
  <div class="content">
    <span class="badge">Vacuum Furnace</span>
    <h1>진공로 드라이펌프</h1>
    <p class="subtitle">GXS 스크류 펌프 선택 기준</p>
  </div>
  <div class="brand">SMARTECH</div>
</body>
</html>"""

# ── image-01: 진공로 압력 범위 도식 ────────────────────────────
image01_html = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 660px;
    background: #111214;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    font-family: 'Pretendard Variable', 'Pretendard', 'Noto Sans KR', sans-serif;
    padding: 40px 60px;
    gap: 28px;
  }
  h2 {
    color: #FFFFFF;
    font-size: 26px;
    font-weight: 700;
    text-align: center;
    letter-spacing: -0.01em;
  }
  /* 압력 바 전체 */
  .pressure-bar-wrap {
    width: 100%;
  }
  /* 연속 그라데이션 바 */
  .pressure-bar {
    width: 100%;
    height: 52px;
    border-radius: 8px;
    background: linear-gradient(to right,
      #3a7bd5 0%,        /* 대기압 */
      #2563a8 12%,
      #1a4a80 28%,
      #0d3a8a 45%,
      #0a2a60 62%,
      #061840 80%,
      #020810 100%       /* 고진공 */
    );
    position: relative;
    display: flex;
    align-items: center;
  }
  /* 구간 구분선 */
  .div-line {
    position: absolute;
    top: 0; bottom: 0;
    width: 2px;
    background: rgba(255,255,255,0.25);
  }
  /* GXS 작동 범위 강조 박스 */
  .gxs-range {
    position: absolute;
    top: -8px; bottom: -8px;
    left: 14%;
    width: 50%;
    border: 2.5px solid #c00020;
    border-radius: 6px;
    background: rgba(192,0,32,0.12);
  }
  .gxs-label {
    position: absolute;
    top: -32px;
    left: 50%;
    transform: translateX(-50%);
    color: #E46F75;
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
    background: rgba(192,0,32,0.15);
    border: 1px solid rgba(192,0,32,0.4);
    padding: 3px 10px;
    border-radius: 4px;
  }
  /* 구간 레이블 */
  .labels-row {
    width: 100%;
    display: flex;
    margin-top: 6px;
  }
  .seg-label {
    flex: 1;
    text-align: center;
    font-size: 13px;
    color: #9B9590;
    font-weight: 500;
  }
  /* 압력 단위 바 */
  .pressure-values {
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-top: 2px;
  }
  .pval {
    font-size: 12px;
    color: #6A6660;
    font-family: 'JetBrains Mono', monospace;
  }
  /* 구간 설명 카드 */
  .cards {
    width: 100%;
    display: flex;
    gap: 14px;
    margin-top: 4px;
  }
  .card {
    flex: 1;
    border-radius: 10px;
    padding: 16px 14px;
    border: 1px solid rgba(255,255,255,0.08);
  }
  .card.atm    { background: rgba(58,123,213,0.12); }
  .card.rough  { background: rgba(13,58,138,0.18); border: 1px solid rgba(192,0,32,0.3); }
  .card.medium { background: rgba(13,58,138,0.12); border: 1px solid rgba(192,0,32,0.2); }
  .card.fine   { background: rgba(6,24,64,0.4); }
  .card-title {
    font-size: 14px; font-weight: 700; margin-bottom: 6px;
  }
  .card.atm    .card-title { color: #7EB3F7; }
  .card.rough  .card-title { color: #E46F75; }
  .card.medium .card-title { color: #E46F75; }
  .card.fine   .card-title { color: #8899BB; }
  .card-range {
    font-size: 11px;
    color: #6A6660;
    font-family: 'JetBrains Mono', monospace;
    margin-bottom: 6px;
  }
  .card-desc {
    font-size: 12px; color: #9B9590; line-height: 1.5;
  }
  .gxs-badge {
    display: inline-block;
    background: rgba(192,0,32,0.2);
    border: 1px solid #c00020;
    color: #E46F75;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 4px;
    margin-top: 6px;
  }
</style>
</head>
<body>
  <h2>진공로 운전 압력 범위와 GXS 드라이펌프 작동 구간</h2>

  <div class="pressure-bar-wrap">
    <!-- 그라데이션 바 -->
    <div style="position:relative; margin-top:40px;">
      <div class="pressure-bar">
        <!-- 구간 구분선 -->
        <div class="div-line" style="left:14%"></div>
        <div class="div-line" style="left:45%"></div>
        <div class="div-line" style="left:64%"></div>
        <!-- GXS 범위 강조 -->
        <div class="gxs-range">
          <div class="gxs-label">▶ GXS 스크류 펌프 작동 구간</div>
        </div>
      </div>
    </div>
    <!-- 압력값 -->
    <div class="pressure-values" style="margin-top:10px;">
      <span class="pval">1013 mbar</span>
      <span class="pval">760 mbar</span>
      <span class="pval">1 mbar</span>
      <span class="pval">10⁻³ mbar</span>
      <span class="pval">10⁻⁷ mbar</span>
    </div>
    <!-- 구간 이름 -->
    <div class="labels-row" style="margin-top:4px;">
      <div class="seg-label" style="flex:0.7">대기압</div>
      <div class="seg-label" style="flex:1.5; color:#E46F75;">저진공 (Rough)</div>
      <div class="seg-label" style="flex:1; color:#E46F75;">중진공 (Medium)</div>
      <div class="seg-label" style="flex:1.2">고진공 (Fine)</div>
    </div>
  </div>

  <!-- 카드 -->
  <div class="cards">
    <div class="card atm">
      <div class="card-title">대기압</div>
      <div class="card-range">1013 ~ 1 mbar</div>
      <div class="card-desc">공정 시작 전 가스 퍼지 구간. 펌프 기동 초기 단계.</div>
    </div>
    <div class="card rough">
      <div class="card-title">저진공 (Rough Vacuum)</div>
      <div class="card-range">1 ~ 10⁻¹ mbar</div>
      <div class="card-desc">소결·열처리 대부분의 공정 압력 영역.</div>
      <div><span class="gxs-badge">GXS 단독 대응</span></div>
    </div>
    <div class="card medium">
      <div class="card-title">중진공 (Medium Vacuum)</div>
      <div class="card-range">10⁻¹ ~ 10⁻³ mbar</div>
      <div class="card-desc">GXS + 부스터 조합으로 도달. 정밀 소결 요구 구간.</div>
      <div><span class="gxs-badge">GXS + Booster</span></div>
    </div>
    <div class="card fine">
      <div class="card-title">고진공 (Fine Vacuum)</div>
      <div class="card-range">10⁻³ mbar 이하</div>
      <div class="card-desc">터보/확산 펌프 영역. GXS는 backing pump 역할.</div>
    </div>
  </div>
</body>
</html>"""

# ── image-02: GXS 모델 비교 카드 ────────────────────────────────
image02_html = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 660px;
    background: #111214;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    font-family: 'Pretendard Variable', 'Pretendard', 'Noto Sans KR', sans-serif;
    padding: 36px 60px;
    gap: 24px;
  }
  h2 {
    color: #FFFFFF;
    font-size: 26px;
    font-weight: 700;
    text-align: center;
    letter-spacing: -0.01em;
  }
  .subtitle {
    color: #6A6660;
    font-size: 15px;
    text-align: center;
    margin-top: -16px;
  }
  .cards {
    width: 100%;
    display: flex;
    gap: 20px;
  }
  .card {
    flex: 1;
    background: #1A1C1F;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.08);
    padding: 24px 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    position: relative;
    overflow: hidden;
  }
  .card.recommended {
    border: 2px solid #c00020;
    background: linear-gradient(135deg, #1A1C1F 0%, #200810 100%);
  }
  .rec-badge {
    position: absolute;
    top: 0; right: 0;
    background: #c00020;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    padding: 5px 14px;
    border-radius: 0 14px 0 8px;
    letter-spacing: 0.06em;
  }
  .model-name {
    font-size: 28px;
    font-weight: 800;
    color: #FFFFFF;
    letter-spacing: -0.02em;
  }
  .model-sub {
    font-size: 13px;
    color: #6A6660;
    margin-top: -10px;
  }
  .divider {
    width: 100%;
    height: 1px;
    background: rgba(255,255,255,0.07);
  }
  .spec-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .spec-label {
    font-size: 12px;
    color: #6A6660;
    font-weight: 500;
  }
  .spec-value {
    font-size: 16px;
    font-weight: 700;
    color: #E3DFD6;
    font-family: 'JetBrains Mono', monospace;
  }
  .spec-value.highlight {
    color: #E46F75;
  }
  .tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 4px;
  }
  .tag {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    color: #9B9590;
    font-size: 11px;
    padding: 3px 10px;
    border-radius: 12px;
  }
  .tag.red {
    background: rgba(192,0,32,0.12);
    border-color: rgba(192,0,32,0.35);
    color: #E46F75;
  }
  /* 범례 */
  .legend {
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 28px;
  }
  .legend-item {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; color: #6A6660;
  }
  .legend-dot {
    width: 10px; height: 10px; border-radius: 50%;
  }
</style>
</head>
<body>
  <h2>Edwards GXS 드라이 스크류 펌프 모델 비교</h2>
  <p class="subtitle">진공로 용량에 따른 적정 모델 선택 기준</p>

  <div class="cards">
    <!-- GXS 160 -->
    <div class="card">
      <div>
        <div class="model-name">GXS 160</div>
        <div class="model-sub">소형 진공로 / 연구용</div>
      </div>
      <div class="divider"></div>
      <div class="spec-row">
        <span class="spec-label">최대 배기속도</span>
        <span class="spec-value">160 m³/h</span>
      </div>
      <div class="spec-row">
        <span class="spec-label">도달 진공도</span>
        <span class="spec-value">≤ 0.1 mbar</span>
      </div>
      <div class="spec-row">
        <span class="spec-label">모터 출력</span>
        <span class="spec-value">4.0 kW</span>
      </div>
      <div class="spec-row">
        <span class="spec-label">연결 챔버 용적</span>
        <span class="spec-value">~ 500 L</span>
      </div>
      <div class="tag-row">
        <span class="tag">R&D 랩</span>
        <span class="tag">소형 소결로</span>
        <span class="tag">파일럿 라인</span>
      </div>
    </div>

    <!-- GXS 250 (추천) -->
    <div class="card recommended">
      <div class="rec-badge">가장 많이 선택</div>
      <div>
        <div class="model-name" style="color:#E46F75;">GXS 250</div>
        <div class="model-sub">중형 진공로 / 양산 범용</div>
      </div>
      <div class="divider"></div>
      <div class="spec-row">
        <span class="spec-label">최대 배기속도</span>
        <span class="spec-value highlight">250 m³/h</span>
      </div>
      <div class="spec-row">
        <span class="spec-label">도달 진공도</span>
        <span class="spec-value highlight">≤ 0.05 mbar</span>
      </div>
      <div class="spec-row">
        <span class="spec-label">모터 출력</span>
        <span class="spec-value highlight">5.5 kW</span>
      </div>
      <div class="spec-row">
        <span class="spec-label">연결 챔버 용적</span>
        <span class="spec-value highlight">500 ~ 2,000 L</span>
      </div>
      <div class="tag-row">
        <span class="tag red">중형 열처리로</span>
        <span class="tag red">소결로 주력</span>
        <span class="tag">저렴한 유지비</span>
      </div>
    </div>

    <!-- GXS 450 -->
    <div class="card">
      <div>
        <div class="model-name">GXS 450</div>
        <div class="model-sub">대형 진공로 / 연속 양산</div>
      </div>
      <div class="divider"></div>
      <div class="spec-row">
        <span class="spec-label">최대 배기속도</span>
        <span class="spec-value">450 m³/h</span>
      </div>
      <div class="spec-row">
        <span class="spec-label">도달 진공도</span>
        <span class="spec-value">≤ 0.05 mbar</span>
      </div>
      <div class="spec-row">
        <span class="spec-label">모터 출력</span>
        <span class="spec-value">11.0 kW</span>
      </div>
      <div class="spec-row">
        <span class="spec-label">연결 챔버 용적</span>
        <span class="spec-value">2,000 L 이상</span>
      </div>
      <div class="tag-row">
        <span class="tag">대형 소결로</span>
        <span class="tag">연속 생산</span>
        <span class="tag">부스터 조합</span>
      </div>
    </div>
  </div>

  <!-- 범례 -->
  <div class="legend">
    <div class="legend-item">
      <div class="legend-dot" style="background:#E46F75;"></div>
      <span>강조 = 진공로 적용 시 권장 사양</span>
    </div>
    <div class="legend-item">
      <div class="legend-dot" style="background:rgba(255,255,255,0.3);"></div>
      <span>챔버 용적은 단독 펌프 기준 (부스터 미포함)</span>
    </div>
  </div>
</body>
</html>"""

def generate(html, path, width, height):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.set_viewport_size({"width": width, "height": height})
        page.set_content(html, wait_until="networkidle")
        page.screenshot(path=path, full_page=False)
        browser.close()
    print(f"저장 완료: {path}")

base = r"C:\Users\rokmc\smartech\블로그\output\2026-06\진공로-드라이펌프-선택기준-20260623\images"

generate(thumbnail_html, f"{base}\\thumbnail.png", 1200, 628)
generate(image01_html,   f"{base}\\image-01.png",  1200, 660)
generate(image02_html,   f"{base}\\image-02.png",  1200, 660)
print("모든 이미지 생성 완료")
