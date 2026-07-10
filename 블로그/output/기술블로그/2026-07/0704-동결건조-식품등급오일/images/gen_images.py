# -*- coding: utf-8 -*-
from playwright.sync_api import sync_playwright

FONT = "'Pretendard Variable', 'Pretendard', 'Noto Sans KR', sans-serif"
MONO = "'JetBrains Mono', monospace"

# ── 썸네일 (1080x1080) — 식용그리스/PFPE 표현 제거, 미네랄오일 vs 식품등급오일로 정정 ──
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
  .bg-circle-1 {{ width:460px; height:460px; background:#0d3a8a; top:-80px; left:-100px; }}
  .bg-circle-2 {{ width:420px; height:420px; background:#c00020; bottom:-100px; right:-80px; }}
  .content {{
    text-align:center; display:flex; flex-direction:column;
    gap:20px; align-items:center; padding:60px;
  }}
  .badge {{
    display:inline-block; background:rgba(13,58,138,0.18);
    border:1px solid rgba(13,58,138,0.5); color:#7EB3F7;
    font-size:15px; font-weight:600; letter-spacing:0.12em;
    padding:7px 20px; border-radius:20px; text-transform:uppercase;
  }}
  h1 {{
    color:#FFFFFF; font-size:52px; font-weight:800;
    line-height:1.3; letter-spacing:-0.02em; max-width:880px;
  }}
  .subtitle {{ color:#9B9590; font-size:22px; font-weight:400; letter-spacing:0.01em; }}
</style></head>
<body>
  <div class="bg-circle bg-circle-1"></div>
  <div class="bg-circle bg-circle-2"></div>
  <div class="content">
    <span class="badge">기술문의 · 오일/소모품</span>
    <h1>동결건조 진공펌프 오일<br>미네랄오일 vs 식품등급오일</h1>
    <p class="subtitle">오일 선택 기준 정리</p>
  </div>
</body></html>"""

# ── image-01: 미네랄오일 vs 식품등급오일 적용 기준 비교 ──────────
image01_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{
    width:1200px; height:660px; background:#111214;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    font-family:{FONT}; padding:36px 60px; gap:22px;
  }}
  h2 {{ color:#FFFFFF; font-size:25px; font-weight:700; text-align:center; letter-spacing:-0.01em; }}
  .cards {{ width:100%; display:flex; gap:24px; }}
  .card {{
    flex:1; background:#1A1C1F; border-radius:14px; padding:24px 22px;
    display:flex; flex-direction:column; gap:10px;
    border:1px solid rgba(255,255,255,0.08);
  }}
  .card.base {{ border:2px solid rgba(255,255,255,0.14); }}
  .card.food {{ border:2px solid rgba(13,58,138,0.5); background:linear-gradient(135deg,#1A1C1F,#0a1730); }}
  .tag {{
    align-self:flex-start; font-size:12px; font-weight:700; letter-spacing:0.05em;
    padding:5px 14px; border-radius:14px;
  }}
  .tag.base {{ background:rgba(255,255,255,0.08); color:#9B9590; }}
  .tag.food {{ background:rgba(13,58,138,0.25); color:#7EB3F7; }}
  .card-title {{ font-size:20px; font-weight:800; color:#FFFFFF; }}
  .row {{ display:flex; justify-content:space-between; font-size:13px; margin-top:2px; }}
  .row-label {{ color:#6A6660; }}
  .row-value {{ font-weight:700; font-family:{MONO}; color:#E3DFD6; }}
  .row-value.hl {{ color:#7EB3F7; }}
  .note {{ color:#9B9590; font-size:13px; text-align:center; margin-top:2px; }}
</style></head>
<body>
  <h2>미네랄오일 vs 식품등급오일 — 언제 바꿔야 할까</h2>
  <div class="cards">
    <div class="card base">
      <span class="tag base">기본 사용</span>
      <div class="card-title">미네랄오일</div>
      <div class="row"><span class="row-label">펌프 본체</span><span class="row-value">Ultragrade 19 / 70</span></div>
      <div class="row"><span class="row-label">부스터</span><span class="row-value">Ultragrade 20</span></div>
      <div class="row"><span class="row-label">적용 조건</span><span class="row-value">원료 접촉 리스크 낮음</span></div>
    </div>
    <div class="card food">
      <span class="tag food">교체 검토</span>
      <div class="card-title">식품등급오일 (H1)</div>
      <div class="row"><span class="row-label">목적</span><span class="row-value hl">식품·의약품 접촉 안전</span></div>
      <div class="row"><span class="row-label">기준</span><span class="row-value hl">우발적 접촉 10ppm 이하</span></div>
      <div class="row"><span class="row-label">적용 조건</span><span class="row-value hl">배기 라인 접촉 위험 있음</span></div>
    </div>
  </div>
  <p class="note">두 오일 모두 로터리베인 펌프에 쓰이며, 라인의 원료 접촉 구조에 따라 선택이 갈립니다</p>
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


base = r"C:\Users\rokmc\smartech\블로그\output\기술블로그\2026-07\동결건조-식품등급오일-20260704\images"

generate(thumbnail_html, f"{base}\\thumbnail.png", 1080, 1080)
generate(image01_html,   f"{base}\\image-01.png",  1200, 660)
print("모든 이미지 생성 완료")
