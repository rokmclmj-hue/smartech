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
    font-family:{FONT};
    position:relative; overflow:hidden;
  }}
  .bg-circle {{ position:absolute; border-radius:50%; filter:blur(90px); opacity:0.22; }}
  .bg-circle-1 {{ width:460px; height:460px; background:#c00020; top:-80px; left:-100px; }}
  .bg-circle-2 {{ width:420px; height:420px; background:#0d3a8a; bottom:-100px; right:-80px; }}
  .content {{
    text-align:center; display:flex; flex-direction:column;
    gap:20px; align-items:center; padding:60px;
  }}
  .badge {{
    display:inline-block; background:rgba(192,0,32,0.15);
    border:1px solid rgba(192,0,32,0.5); color:#E46F75;
    font-size:15px; font-weight:600; letter-spacing:0.12em;
    padding:7px 20px; border-radius:20px; text-transform:uppercase;
  }}
  h1 {{
    color:#FFFFFF; font-size:58px; font-weight:800;
    line-height:1.25; letter-spacing:-0.02em; max-width:820px;
  }}
  .subtitle {{ color:#9B9590; font-size:24px; font-weight:400; letter-spacing:0.01em; }}
</style></head>
<body>
  <div class="bg-circle bg-circle-1"></div>
  <div class="bg-circle bg-circle-2"></div>
  <div class="content">
    <span class="badge">Fusion / Accelerator</span>
    <h1>초고진공 이온게이지 선택</h1>
    <p class="subtitle">초전도·가속기 실험 환경의 진공 측정</p>
  </div>
</body></html>"""

# ── field-1: 냉음극 게이지 내부 구조 + 영구자석 배치 ────────────────
field1_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{
    width:1200px; height:660px; background:#111214;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    font-family:{FONT}; padding:40px 60px; gap:26px;
  }}
  h2 {{ color:#FFFFFF; font-size:26px; font-weight:700; text-align:center; letter-spacing:-0.01em; }}
  .diagram {{
    width:100%; display:flex; align-items:center; justify-content:center; gap:50px;
  }}
  .gauge {{
    position:relative; width:280px; height:340px;
    border:3px solid rgba(255,255,255,0.15); border-radius:20px;
    background:#1A1C1F; display:flex; flex-direction:column; align-items:center;
    justify-content:center; gap:14px;
  }}
  .magnet-ring {{
    width:200px; height:60px; border-radius:12px;
    background:linear-gradient(90deg,#0d3a8a,#c00020);
    display:flex; align-items:center; justify-content:center;
    color:#fff; font-size:13px; font-weight:700; letter-spacing:0.04em;
  }}
  .electron-path {{
    width:160px; height:160px; border-radius:50%;
    border:3px dashed #E46F75;
    display:flex; align-items:center; justify-content:center;
    position:relative;
  }}
  .electron-path::after {{
    content:'e⁻'; color:#E46F75; font-size:20px; font-weight:800;
    font-family:{MONO};
  }}
  .label {{ color:#9B9590; font-size:13px; text-align:center; }}
  .legend-col {{
    display:flex; flex-direction:column; gap:18px; max-width:420px;
  }}
  .legend-item {{
    display:flex; gap:12px; align-items:flex-start;
  }}
  .dot {{ width:12px; height:12px; border-radius:50%; margin-top:5px; flex-shrink:0; }}
  .legend-text {{ font-size:14px; color:#E3DFD6; line-height:1.55; }}
  .legend-text b {{ color:#E46F75; }}
</style></head>
<body>
  <h2>냉음극(역자장) 이온게이지 — 내장 영구자석 구조</h2>
  <div class="diagram">
    <div class="gauge">
      <div class="magnet-ring">영구자석 (내장)</div>
      <div class="electron-path"></div>
      <div class="label">전자가 나선형 경로로<br>오래 움직이며 이온화</div>
    </div>
    <div class="legend-col">
      <div class="legend-item">
        <div class="dot" style="background:#c00020;"></div>
        <div class="legend-text"><b>내장 자석</b>이 방전을 유지시켜 필라멘트 없이도 저압 이온화가 가능합니다.</div>
      </div>
      <div class="legend-item">
        <div class="dot" style="background:#E46F75;"></div>
        <div class="legend-text"><b>외부 누설자장</b>이 겹치면 전자 궤적이 흐트러져 판독값이 불안정해질 수 있습니다.</div>
      </div>
      <div class="legend-item">
        <div class="dot" style="background:#0d3a8a;"></div>
        <div class="legend-text">초전도 자석 인근 설치 시 <b>이격·차폐·축 정렬</b> 검토가 필요합니다.</div>
      </div>
    </div>
  </div>
</body></html>"""

# ── image-01: 설치 위치별 자기장 간섭 비교 ────────────────────────
image01_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{
    width:1200px; height:660px; background:#111214;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    font-family:{FONT}; padding:40px 60px; gap:28px;
  }}
  h2 {{ color:#FFFFFF; font-size:26px; font-weight:700; text-align:center; letter-spacing:-0.01em; }}
  .cards {{ width:100%; display:flex; gap:24px; }}
  .card {{
    flex:1; background:#1A1C1F; border-radius:14px; padding:26px 22px;
    display:flex; flex-direction:column; gap:12px;
    border:1px solid rgba(255,255,255,0.08);
  }}
  .card.bad {{ border:2px solid rgba(192,0,32,0.5); background:linear-gradient(135deg,#1A1C1F,#210a0d); }}
  .card.good {{ border:2px solid rgba(13,58,138,0.5); background:linear-gradient(135deg,#1A1C1F,#0a1730); }}
  .tag {{
    align-self:flex-start; font-size:12px; font-weight:700; letter-spacing:0.05em;
    padding:5px 14px; border-radius:14px;
  }}
  .tag.bad {{ background:rgba(192,0,32,0.18); color:#E46F75; }}
  .tag.good {{ background:rgba(13,58,138,0.25); color:#7EB3F7; }}
  .card-title {{ font-size:19px; font-weight:800; color:#FFFFFF; }}
  .card-desc {{ font-size:14px; color:#9B9590; line-height:1.6; }}
  .bar {{
    width:100%; height:14px; border-radius:7px; background:rgba(255,255,255,0.08);
    position:relative; overflow:hidden; margin-top:6px;
  }}
  .bar-fill {{ position:absolute; top:0; left:0; bottom:0; border-radius:7px; }}
  .bar-fill.bad {{ width:82%; background:linear-gradient(90deg,#c00020,#E46F75); }}
  .bar-fill.good {{ width:18%; background:linear-gradient(90deg,#0d3a8a,#7EB3F7); }}
  .bar-label {{ font-size:12px; color:#6A6660; margin-top:6px; font-family:{MONO}; }}
</style></head>
<body>
  <h2>초전도 자석과 게이지 설치 거리에 따른 간섭 수준</h2>
  <div class="cards">
    <div class="card bad">
      <span class="tag bad">간섭 위험 높음</span>
      <div class="card-title">자석 인근 근접 설치</div>
      <div class="card-desc">누설자장이 게이지 내장 자석과 겹쳐 전자 궤적이 흐트러지고 판독값이 불안정해질 수 있습니다.</div>
      <div class="bar"><div class="bar-fill bad"></div></div>
      <div class="bar-label">간섭 수준: 높음</div>
    </div>
    <div class="card good">
      <span class="tag good">간섭 위험 낮음</span>
      <div class="card-title">이격 + 차폐 + 축 정렬</div>
      <div class="card-desc">충분한 이격 거리와 자기 차폐, 외부 자기장선과 평행한 축 정렬로 간섭을 줄일 수 있습니다.</div>
      <div class="bar"><div class="bar-fill good"></div></div>
      <div class="bar-label">간섭 수준: 낮음</div>
    </div>
  </div>
</body></html>"""

# ── image-02: AIM200 / WRG200 / APG200 비교 카드 ─────────────────
image02_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{
    width:1200px; height:660px; background:#111214;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    font-family:{FONT}; padding:36px 60px; gap:22px;
  }}
  h2 {{ color:#FFFFFF; font-size:26px; font-weight:700; text-align:center; letter-spacing:-0.01em; }}
  .subtitle {{ color:#6A6660; font-size:15px; text-align:center; margin-top:-10px; }}
  .cards {{ width:100%; display:flex; gap:20px; }}
  .card {{
    flex:1; background:#1A1C1F; border-radius:14px; border:1px solid rgba(255,255,255,0.08);
    padding:22px 20px; display:flex; flex-direction:column; gap:12px; position:relative;
  }}
  .card.rec {{ border:2px solid #c00020; background:linear-gradient(135deg,#1A1C1F,#200810); }}
  .rec-badge {{
    position:absolute; top:0; right:0; background:#c00020; color:#fff; font-size:11px;
    font-weight:700; padding:5px 14px; border-radius:0 14px 0 8px; letter-spacing:0.05em;
  }}
  .model-name {{ font-size:26px; font-weight:800; color:#FFFFFF; letter-spacing:-0.02em; }}
  .model-sub {{ font-size:12px; color:#6A6660; margin-top:-8px; }}
  .divider {{ width:100%; height:1px; background:rgba(255,255,255,0.07); }}
  .spec-row {{ display:flex; justify-content:space-between; align-items:baseline; }}
  .spec-label {{ font-size:12px; color:#6A6660; font-weight:500; }}
  .spec-value {{ font-size:14px; font-weight:700; color:#E3DFD6; font-family:{MONO}; }}
  .spec-value.hl {{ color:#E46F75; }}
</style></head>
<body>
  <h2>스마텍 취급 진공게이지 비교</h2>
  <p class="subtitle">초전도·가속기 실험 환경 적용 기준</p>
  <div class="cards">
    <div class="card">
      <div class="model-name">APG200</div>
      <div class="model-sub">피라니 방식</div>
      <div class="divider"></div>
      <div class="spec-row"><span class="spec-label">측정범위</span><span class="spec-value">대기압~5×10⁻⁴ mbar</span></div>
      <div class="spec-row"><span class="spec-label">필라멘트</span><span class="spec-value">없음</span></div>
      <div class="spec-row"><span class="spec-label">적용 구간</span><span class="spec-value">펌프다운 초기</span></div>
    </div>
    <div class="card rec">
      <div class="rec-badge">냉음극 주력</div>
      <div class="model-name" style="color:#E46F75;">AIM200</div>
      <div class="model-sub">역자장(냉음극) 방식</div>
      <div class="divider"></div>
      <div class="spec-row"><span class="spec-label">측정범위</span><span class="spec-value hl">1×10⁻²~1×10⁻⁹ mbar</span></div>
      <div class="spec-row"><span class="spec-label">필라멘트</span><span class="spec-value hl">없음</span></div>
      <div class="spec-row"><span class="spec-label">주의사항</span><span class="spec-value hl">위치·차폐 검토</span></div>
    </div>
    <div class="card">
      <div class="model-name">WRG200</div>
      <div class="model-sub">피라니+역자장 복합</div>
      <div class="divider"></div>
      <div class="spec-row"><span class="spec-label">측정범위</span><span class="spec-value">1×10⁻⁹~1000 mbar</span></div>
      <div class="spec-row"><span class="spec-label">필라멘트</span><span class="spec-value">없음</span></div>
      <div class="spec-row"><span class="spec-label">적용 구간</span><span class="spec-value">포트 제한 챔버</span></div>
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


base = r"C:\Users\rokmc\smartech\블로그\output\기술블로그\2026-07\초전도-가속기-이온게이지-20260704\images"

generate(thumbnail_html, f"{base}\\thumbnail.png", 1080, 1080)
generate(field1_html,    f"{base}\\field-1.png",   1200, 660)
generate(image01_html,   f"{base}\\image-01.png",  1200, 660)
generate(image02_html,   f"{base}\\image-02.png",  1200, 660)
print("모든 이미지 생성 완료")
