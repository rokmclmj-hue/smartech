# -*- coding: utf-8 -*-
from playwright.sync_api import sync_playwright

FONT = "'Pretendard Variable', 'Pretendard', 'Noto Sans KR', sans-serif"
MONO = "'JetBrains Mono', monospace"

# ── 썸네일 (1080x1080) ──────────────────────────────────────────
thumbnail_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{
    width:1080px; height:1080px;
    background: linear-gradient(135deg,#1a1a2e,#16213e);
    display:flex; align-items:center; justify-content:center;
    font-family:{FONT}; position:relative; overflow:hidden;
  }}
  .bg-circle {{ position:absolute; border-radius:50%; filter:blur(90px); opacity:0.22; }}
  .bg-circle-1 {{ width:460px; height:460px; background:#0d3a8a; top:-80px; left:-100px; }}
  .bg-circle-2 {{ width:420px; height:420px; background:#c00020; bottom:-100px; right:-80px; }}
  .content {{ text-align:center; display:flex; flex-direction:column; gap:22px; align-items:center; padding:60px; }}
  .badge {{ display:inline-block; background:rgba(13,58,138,0.18); border:1px solid rgba(13,58,138,0.5); color:#7EB3F7;
    font-size:15px; font-weight:600; letter-spacing:0.12em; padding:7px 20px; border-radius:20px; text-transform:uppercase; }}
  h1 {{ color:#FFFFFF; font-size:46px; font-weight:800; line-height:1.32; letter-spacing:-0.02em; max-width:900px; }}
  .subtitle {{ color:#9B9590; font-size:22px; font-weight:400; letter-spacing:0.01em; }}
  .compare-row {{ display:flex; align-items:center; justify-content:center; gap:18px; margin-top:2px; }}
  .chip {{ padding:14px 28px; border-radius:14px; font-size:20px; font-weight:800; color:#fff; }}
  .chip.oil {{ background:linear-gradient(135deg,#c00020,#7a0716); }}
  .chip.dry {{ background:linear-gradient(135deg,#0d3a8a,#123b7a); }}
  .neq {{ color:#9B9590; font-size:24px; font-weight:700; }}
  .compare-caption {{ display:flex; align-items:center; justify-content:center; gap:60px; }}
  .compare-caption span {{ color:#9B9590; font-size:15px; }}
</style></head>
<body>
  <div class="bg-circle bg-circle-1"></div>
  <div class="bg-circle bg-circle-2"></div>
  <div class="content">
    <span class="badge">Vacuum Pump / Backstreaming</span>
    <h1>진공펌프 백스트리밍이란?<br>오일 증기 역류 원인과 방지법</h1>
    <div class="compare-row">
      <span class="chip oil">오일펌프(RV)</span>
      <span class="neq">≠</span>
      <span class="chip dry">드라이펌프(nXDS)</span>
    </div>
    <div class="compare-caption">
      <span>오일 역류 발생</span>
      <span>역류 없음</span>
    </div>
    <p class="subtitle">가스 밸러스트·트랩으로 방지 가능</p>
  </div>
</body></html>"""

# ── 사진1: 오일씰 로터리베인 펌프 내부 구조 (구조 다이어그램) ─────
img1_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ width:1200px; height:500px; background:#111214; display:flex; flex-direction:column;
    align-items:center; justify-content:center; font-family:{FONT}; padding:32px 60px; gap:24px; }}
  h2 {{ color:#FFFFFF; font-size:26px; font-weight:700; text-align:center; letter-spacing:-0.01em; }}
  .diagram {{ width:100%; display:flex; align-items:center; justify-content:center; gap:0; position:relative; }}
  .flow {{ display:flex; align-items:center; gap:0; }}
  .stage {{ width:210px; background:#1A1C1F; border-radius:14px; border:1px solid rgba(255,255,255,0.08);
    padding:20px 16px; display:flex; flex-direction:column; gap:8px; align-items:center; text-align:center; }}
  .stage.oil {{ border:2px solid rgba(192,0,32,0.5); background:linear-gradient(135deg,#1A1C1F,#210a0d); }}
  .icon {{ font-size:30px; }}
  .stage-title {{ font-size:15px; font-weight:800; color:#FFFFFF; }}
  .stage-desc {{ font-size:12px; color:#9B9590; line-height:1.5; }}
  .arrow {{ width:56px; display:flex; align-items:center; justify-content:center; color:#6A6660; font-size:24px; }}
  .back-row {{ display:flex; align-items:center; justify-content:center; gap:10px; margin-top:6px; }}
  .back-arrow {{ color:#E46F75; font-size:20px; font-weight:700; }}
  .back-label {{ color:#E46F75; font-size:14px; font-weight:700; background:rgba(192,0,32,0.12);
    border:1px solid rgba(192,0,32,0.4); padding:8px 18px; border-radius:20px; }}
</style></head>
<body>
  <h2>오일씰 로터리베인 펌프 내부 구조 — 백스트리밍 경로</h2>
  <div class="diagram">
    <div class="flow">
      <div class="stage">
        <div class="icon">⬇️</div>
        <div class="stage-title">흡기구 (Inlet)</div>
        <div class="stage-desc">챔버와 연결된<br>진공 흡입 라인</div>
      </div>
      <div class="arrow">→</div>
      <div class="stage">
        <div class="icon">⚙️</div>
        <div class="stage-title">로터·베인</div>
        <div class="stage-desc">회전자와 베인 사이<br>오일로 밀봉·윤활</div>
      </div>
      <div class="arrow">→</div>
      <div class="stage oil">
        <div class="icon">🛢️</div>
        <div class="stage-title">오일 저장부</div>
        <div class="stage-desc">저압에서 오일 증기압<br>상승 → 증발 시작</div>
      </div>
      <div class="arrow">→</div>
      <div class="stage">
        <div class="icon">⬆️</div>
        <div class="stage-title">배기 밸브</div>
        <div class="stage-desc">압축된 가스<br>대기로 배출</div>
      </div>
    </div>
  </div>
  <div class="back-row">
    <span class="back-arrow">⟲</span>
    <span class="back-label">저압일수록 오일 증기가 흡기구 쪽으로 역류·확산 — 이것이 백스트리밍</span>
  </div>
</body></html>"""

# ── 사진2: RV 오일펌프 vs nXDS 드라이펌프 비교 표 ─────────────
img2_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ width:1200px; height:600px; background:#111214; display:flex; flex-direction:column;
    align-items:center; justify-content:center; font-family:{FONT}; padding:32px 60px; gap:20px; }}
  h2 {{ color:#FFFFFF; font-size:25px; font-weight:700; text-align:center; letter-spacing:-0.01em; }}
  table {{ width:100%; border-collapse:collapse; background:#1A1C1F; border-radius:14px; overflow:hidden;
    border:1px solid rgba(255,255,255,0.08); }}
  th, td {{ padding:16px 18px; text-align:left; font-size:14px; }}
  th {{ font-size:15px; font-weight:800; color:#FFFFFF; background:#1F2124; border-bottom:1px solid rgba(255,255,255,0.1); }}
  th.rv {{ color:#E46F75; }}
  th.dry {{ color:#7EB3F7; }}
  td {{ color:#E3DFD6; border-bottom:1px solid rgba(255,255,255,0.06); line-height:1.4; }}
  tr:last-child td {{ border-bottom:none; }}
  .row-label {{ color:#9B9590; font-weight:600; width:200px; }}
</style></head>
<body>
  <h2>오일씰 로터리베인 펌프(RV) vs 드라이 스크롤펌프(nXDS) — 백스트리밍 비교</h2>
  <table>
    <tr><th class="row-label">구분</th><th class="rv">RV 오일펌프</th><th class="dry">nXDS 드라이펌프</th></tr>
    <tr><td class="row-label">백스트리밍</td><td>발생 가능 (오일 증기 역류)</td><td>구조적으로 발생하지 않음</td></tr>
    <tr><td class="row-label">도달진공(총압)</td><td>1.5×10⁻³ Torr 수준</td><td>0.007~0.030 mbar 수준</td></tr>
    <tr><td class="row-label">정지 시 역류 방지</td><td>자동 인렛 밸브 (0.4초 이내)</td><td>별도 설계 불필요</td></tr>
    <tr><td class="row-label">오염 방지 수단</td><td>배플·트랩·미스트필터 조합</td><td>헤르메틱 밀봉 구조</td></tr>
    <tr><td class="row-label">수분 처리 능력</td><td>가스밸러스트 최대 290g/h</td><td>가스밸러스트 응축 방지</td></tr>
  </table>
</body></html>"""

# ── 사진3: 가스 밸러스트 밸브 작동 원리 (단계별 다이어그램) ─────
img3_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ width:1200px; height:440px; background:#111214; display:flex; flex-direction:column;
    align-items:center; justify-content:center; font-family:{FONT}; padding:30px 60px; gap:22px; }}
  h2 {{ color:#FFFFFF; font-size:25px; font-weight:700; text-align:center; letter-spacing:-0.01em; }}
  .flow {{ display:flex; align-items:center; }}
  .step {{ width:230px; background:#1A1C1F; border-radius:14px; border:1px solid rgba(255,255,255,0.08);
    padding:22px 18px; display:flex; flex-direction:column; gap:10px; align-items:center; text-align:center; }}
  .step.highlight {{ border:2px solid rgba(13,58,138,0.5); background:linear-gradient(135deg,#1A1C1F,#0a1730); }}
  .num {{ width:32px; height:32px; border-radius:50%; background:#0d3a8a; color:#fff; font-size:15px;
    font-weight:800; display:flex; align-items:center; justify-content:center; }}
  .step-title {{ font-size:15px; font-weight:800; color:#FFFFFF; }}
  .step-desc {{ font-size:12px; color:#9B9590; line-height:1.5; }}
  .arrow {{ width:36px; text-align:center; color:#6A6660; font-size:22px; }}
</style></head>
<body>
  <h2>가스 밸러스트 밸브 작동 원리</h2>
  <div class="flow">
    <div class="step">
      <div class="num">1</div>
      <div class="step-title">압축 시작</div>
      <div class="step-desc">흡입된 증기·가스가<br>펌프 내부에서 압축</div>
    </div>
    <div class="arrow">→</div>
    <div class="step highlight">
      <div class="num">2</div>
      <div class="step-title">밸러스트 밸브 개방</div>
      <div class="step-desc">압축 도중 비응축성<br>공기를 추가 주입</div>
    </div>
    <div class="arrow">→</div>
    <div class="step">
      <div class="num">3</div>
      <div class="step-title">응축 방지</div>
      <div class="step-desc">증기가 포화되기 전<br>배기 압력에 도달</div>
    </div>
    <div class="arrow">→</div>
    <div class="step">
      <div class="num">4</div>
      <div class="step-title">증기 상태로 배출</div>
      <div class="step-desc">오일 내 응축 없이<br>그대로 대기로 배출</div>
    </div>
  </div>
</body></html>"""

# ── 사진4: 백스트리밍 방지용 부속품 구성 (핵심 포인트 카드) ─────
img4_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ width:1200px; height:420px; background:#111214; display:flex; flex-direction:column;
    align-items:center; justify-content:center; font-family:{FONT}; padding:28px 60px; gap:18px; }}
  h2 {{ color:#FFFFFF; font-size:25px; font-weight:700; text-align:center; letter-spacing:-0.01em; }}
  .cards {{ width:100%; display:flex; gap:18px; }}
  .card {{ flex:1; background:#1A1C1F; border-radius:14px; border:1px solid rgba(255,255,255,0.08);
    padding:22px 18px; display:flex; flex-direction:column; gap:10px; }}
  .card-num {{ font-size:13px; font-weight:800; color:#7EB3F7; letter-spacing:0.05em; }}
  .card-title {{ font-size:16px; font-weight:800; color:#FFFFFF; line-height:1.35; }}
  .card-desc {{ font-size:12px; color:#9B9590; line-height:1.6; }}
</style></head>
<body>
  <h2>백스트리밍 방지용 부속품 4가지</h2>
  <div class="cards">
    <div class="card">
      <div class="card-num">01</div>
      <div class="card-title">배플 · 콜드트랩</div>
      <div class="card-desc">냉각 표면으로 오일 증기<br>분자를 응축·제거</div>
    </div>
    <div class="card">
      <div class="card-num">02</div>
      <div class="card-title">포어라인 트랩<br>(FL20K)</div>
      <div class="card-desc">활성 알루미나 흡착<br>최대 6개월 사용</div>
    </div>
    <div class="card">
      <div class="card-num">03</div>
      <div class="card-title">가스 밸러스트</div>
      <div class="card-desc">증기 응축 전에<br>미리 배출</div>
    </div>
    <div class="card">
      <div class="card-num">04</div>
      <div class="card-title">오일 미스트<br>필터(EMF)</div>
      <div class="card-desc">배기가스 중 오일 미스트<br>·냄새 포집</div>
    </div>
  </div>
</body></html>"""


def generate(html, path, width, height):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.set_viewport_size({"width": width, "height": height})
        page.set_content(html, wait_until="networkidle")
        page.screenshot(path=path, full_page=False)
        browser.close()
    print(f"저장 완료: {path}")


base = r"C:\Users\rokmc\smartech\블로그\output\기술블로그\2026-07\0731-백스트리밍\images"

generate(thumbnail_html, f"{base}\\thumbnail.png", 1080, 1080)
generate(img1_html, f"{base}\\사진1.png", 1200, 500)
generate(img2_html, f"{base}\\사진2.png", 1200, 600)
generate(img3_html, f"{base}\\사진3.png", 1200, 440)
generate(img4_html, f"{base}\\사진4.png", 1200, 420)
print("모든 이미지 생성 완료")
