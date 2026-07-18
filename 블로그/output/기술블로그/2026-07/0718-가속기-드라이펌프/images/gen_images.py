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
  .content {{ text-align:center; display:flex; flex-direction:column; gap:20px; align-items:center; padding:60px; }}
  .badge {{ display:inline-block; background:rgba(13,58,138,0.18); border:1px solid rgba(13,58,138,0.5); color:#7EB3F7;
    font-size:15px; font-weight:600; letter-spacing:0.12em; padding:7px 20px; border-radius:20px; text-transform:uppercase; }}
  h1 {{ color:#FFFFFF; font-size:50px; font-weight:800; line-height:1.3; letter-spacing:-0.02em; max-width:860px; }}
  .subtitle {{ color:#9B9590; font-size:22px; font-weight:400; letter-spacing:0.01em; }}
</style></head>
<body>
  <div class="bg-circle bg-circle-1"></div>
  <div class="bg-circle bg-circle-2"></div>
  <div class="content">
    <span class="badge">Fusion / Accelerator</span>
    <h1>대형 과학장비 러프 진공<br>가속기·핵융합 드라이펌프 선택 기준</h1>
    <p class="subtitle">터보펌프 백킹부터 챔버 배기까지</p>
  </div>
</body></html>"""

# ── 사진2: 소형 드라이펌프 vs 대형 드라이펌프 비교 ─────────────
img2_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ width:1200px; height:520px; background:#111214; display:flex; flex-direction:column;
    align-items:center; justify-content:center; font-family:{FONT}; padding:36px 60px; gap:22px; }}
  h2 {{ color:#FFFFFF; font-size:26px; font-weight:700; text-align:center; letter-spacing:-0.01em; }}
  .cards {{ width:100%; display:flex; gap:20px; }}
  .card {{ flex:1; background:#1A1C1F; border-radius:14px; border:1px solid rgba(255,255,255,0.08);
    padding:22px 20px; display:flex; flex-direction:column; gap:10px; }}
  .card.accent {{ border:2px solid rgba(13,58,138,0.45); background:linear-gradient(135deg,#1A1C1F,#0a1730); }}
  .card.accent2 {{ border:2px solid rgba(192,0,32,0.45); background:linear-gradient(135deg,#1A1C1F,#210a0d); }}
  .model-name {{ font-size:21px; font-weight:800; color:#FFFFFF; }}
  .model-sub {{ font-size:12px; color:#6A6660; }}
  .divider {{ width:100%; height:1px; background:rgba(255,255,255,0.07); margin:2px 0; }}
  .spec-row {{ display:flex; justify-content:space-between; gap:10px; }}
  .spec-label {{ font-size:11px; color:#6A6660; white-space:nowrap; }}
  .spec-value {{ font-size:13px; font-weight:700; color:#E3DFD6; text-align:right; }}
</style></head>
<body>
  <h2>TMP 백킹용 소형 드라이펌프 vs 대형 챔버 배기용 산업용 드라이펌프</h2>
  <div class="cards">
    <div class="card accent">
      <div class="model-name" style="color:#7EB3F7;">nXDS / XDS 계열</div>
      <div class="model-sub">드라이 스크롤 펌프</div>
      <div class="divider"></div>
      <div class="spec-row"><span class="spec-label">배기속도</span><span class="spec-value">6.2 ~ 40 m³/h</span></div>
      <div class="spec-row"><span class="spec-label">용도</span><span class="spec-value">TMP 백킹 (빔라인 개별 포트)</span></div>
      <div class="spec-row"><span class="spec-label">특징</span><span class="spec-value">허밀틱 실링 · 52 dB(A)</span></div>
    </div>
    <div class="card accent2">
      <div class="model-name" style="color:#E46F75;">GXS 계열</div>
      <div class="model-sub">산업용 드라이 스크류 펌프</div>
      <div class="divider"></div>
      <div class="spec-row"><span class="spec-label">배기속도</span><span class="spec-value">160 ~ 740 m³/h</span></div>
      <div class="spec-row"><span class="spec-label">용도</span><span class="spec-value">대형 챔버 초기 배기</span></div>
      <div class="spec-row"><span class="spec-label">특징</span><span class="spec-value">수냉 · 퍼지가스 필수</span></div>
    </div>
  </div>
</body></html>"""

# ── 사진3: 가속기·핵융합 연구시설 도입사례 요약 ─────────────
img3_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ width:1200px; height:420px; background:#111214; display:flex; flex-direction:column;
    align-items:center; justify-content:center; font-family:{FONT}; padding:36px 60px; gap:22px; }}
  h2 {{ color:#FFFFFF; font-size:24px; font-weight:700; text-align:center; letter-spacing:-0.01em; }}
  .cards {{ width:100%; display:flex; gap:18px; }}
  .card {{ flex:1; background:#1A1C1F; border-radius:14px; border:1px solid rgba(255,255,255,0.08);
    padding:20px 18px; display:flex; flex-direction:column; gap:8px; align-items:center; text-align:center; }}
  .num {{ font-size:30px; font-weight:800; color:#7EB3F7; }}
  .label {{ font-size:13px; color:#E3DFD6; font-weight:600; line-height:1.5; }}
  .note {{ font-size:12px; color:#6A6660; text-align:center; }}
</style></head>
<body>
  <h2>가속기·핵융합 연구시설 드라이 스크롤 펌프 도입 사례</h2>
  <div class="cards">
    <div class="card">
      <div class="num">500+</div>
      <div class="label">드라이 스크롤 펌프<br>공급 대수</div>
    </div>
    <div class="card">
      <div class="num">2배</div>
      <div class="label">팁씰 수명<br>이전 모델 대비</div>
    </div>
    <div class="card">
      <div class="num">52 dB</div>
      <div class="label">소음 수준<br>(A) 미만</div>
    </div>
  </div>
  <div class="note">싱크로트론·가속기 응용처에 설치 — 중성자·뮤온·레이저·X선 연구 인프라 지원</div>
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


base = r"C:\Users\rokmc\smartech\블로그\output\기술블로그\2026-07\0718-가속기-드라이펌프\images"

generate(thumbnail_html, f"{base}\\thumbnail.png", 1080, 1080)
generate(img2_html, f"{base}\\사진2.png", 1200, 520)
generate(img3_html, f"{base}\\사진3.png", 1200, 420)
print("모든 이미지 생성 완료")
