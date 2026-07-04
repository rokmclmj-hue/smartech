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
    color:#FFFFFF; font-size:54px; font-weight:800;
    line-height:1.3; letter-spacing:-0.02em; max-width:840px;
  }}
  .subtitle {{ color:#9B9590; font-size:23px; font-weight:400; letter-spacing:0.01em; }}
</style></head>
<body>
  <div class="bg-circle bg-circle-1"></div>
  <div class="bg-circle bg-circle-2"></div>
  <div class="content">
    <span class="badge">Cryogenic Piping</span>
    <h1>극저온 이중배관<br>진공펌프 선택기준</h1>
    <p class="subtitle">액화질소 VIP 배관 진공 단열 재배기</p>
  </div>
</body></html>"""

# ── image-01: 오일펌프 오염 vs 드라이펌프 무급유 구조 비교 ──────────
image01_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{
    width:1200px; height:660px; background:#111214;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    font-family:{FONT}; padding:36px 60px; gap:24px;
  }}
  h2 {{ color:#FFFFFF; font-size:25px; font-weight:700; text-align:center; letter-spacing:-0.01em; }}
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
  .card-title {{ font-size:20px; font-weight:800; color:#FFFFFF; }}
  .card-desc {{ font-size:14px; color:#9B9590; line-height:1.65; }}
  .row {{ display:flex; justify-content:space-between; font-size:13px; margin-top:4px; }}
  .row-label {{ color:#6A6660; }}
  .row-value {{ font-weight:700; font-family:{MONO}; }}
  .row-value.bad {{ color:#E46F75; }}
  .row-value.good {{ color:#7EB3F7; }}
</style></head>
<body>
  <h2>오일 로터리 펌프 vs 드라이펌프 — 환형 공간 재배기 비교</h2>
  <div class="cards">
    <div class="card bad">
      <span class="tag bad">오염 위험</span>
      <div class="card-title">오일 로터리 베인 펌프</div>
      <div class="card-desc">저압 구간에서 오일 증기가 역류해 좁고 긴 환형 공간의 게터·내벽에 눌러붙기 쉽습니다.</div>
      <div class="row"><span class="row-label">배기 구조</span><span class="row-value bad">오일 윤활</span></div>
      <div class="row"><span class="row-label">게터 영향</span><span class="row-value bad">흡착 성능 저하</span></div>
    </div>
    <div class="card good">
      <span class="tag good">무급유</span>
      <div class="card-title">nXDS·XDS 스크롤 드라이펌프</div>
      <div class="card-desc">베어링부와 배기 공간이 벨로우즈로 밀봉돼 배기 가스에 윤활유가 섞이지 않습니다.</div>
      <div class="row"><span class="row-label">배기 구조</span><span class="row-value good">완전 무급유</span></div>
      <div class="row"><span class="row-label">게터 영향</span><span class="row-value good">오염 없음</span></div>
    </div>
  </div>
</body></html>"""

# ── image-02: 배관 규모별 드라이펌프 3단계 선택 기준 ─────────────────
image02_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{
    width:1200px; height:660px; background:#111214;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    font-family:{FONT}; padding:34px 60px; gap:20px;
  }}
  h2 {{ color:#FFFFFF; font-size:25px; font-weight:700; text-align:center; letter-spacing:-0.01em; }}
  .subtitle {{ color:#6A6660; font-size:14px; text-align:center; margin-top:-8px; }}
  .cards {{ width:100%; display:flex; gap:20px; }}
  .card {{
    flex:1; background:#1A1C1F; border-radius:14px; border:1px solid rgba(255,255,255,0.08);
    padding:22px 20px; display:flex; flex-direction:column; gap:10px; position:relative;
  }}
  .card.rec {{ border:2px solid #c00020; background:linear-gradient(135deg,#1A1C1F,#200810); }}
  .step-badge {{
    align-self:flex-start; font-size:11px; font-weight:700; letter-spacing:0.05em;
    padding:4px 12px; border-radius:12px; background:rgba(255,255,255,0.08); color:#9B9590;
  }}
  .card.rec .step-badge {{ background:#c00020; color:#fff; }}
  .model-name {{ font-size:23px; font-weight:800; color:#FFFFFF; letter-spacing:-0.02em; }}
  .model-sub {{ font-size:12px; color:#6A6660; margin-top:-6px; }}
  .divider {{ width:100%; height:1px; background:rgba(255,255,255,0.07); }}
  .spec-row {{ display:flex; justify-content:space-between; align-items:baseline; }}
  .spec-label {{ font-size:12px; color:#6A6660; font-weight:500; }}
  .spec-value {{ font-size:13px; font-weight:700; color:#E3DFD6; font-family:{MONO}; }}
  .spec-value.hl {{ color:#E46F75; }}
</style></head>
<body>
  <h2>VIP 배관 재배기 — 규모별 드라이펌프 선택 3단계</h2>
  <p class="subtitle">배관 세그먼트 수와 배기 포트 규격 기준</p>
  <div class="cards">
    <div class="card">
      <span class="step-badge">STEP 1 · 소형</span>
      <div class="model-name">nXDS 시리즈</div>
      <div class="model-sub">배관 1~2구간, NW25 포트</div>
      <div class="divider"></div>
      <div class="spec-row"><span class="spec-label">피크 배기속도</span><span class="spec-value">6.2~22.0 m³/h</span></div>
      <div class="spec-row"><span class="spec-label">소음</span><span class="spec-value">52 dB(A)</span></div>
    </div>
    <div class="card">
      <span class="step-badge">STEP 2 · 중형</span>
      <div class="model-name">XDS 시리즈</div>
      <div class="model-sub">매니폴드, NW40 포트</div>
      <div class="divider"></div>
      <div class="spec-row"><span class="spec-label">피크 배기속도</span><span class="spec-value">35~40 m³/h</span></div>
      <div class="spec-row"><span class="spec-label">최대 흡기압력</span><span class="spec-value">40 mbar</span></div>
    </div>
    <div class="card rec">
      <span class="step-badge">STEP 3 · 대용량</span>
      <div class="model-name" style="color:#E46F75;">GXS/EXS+EH</div>
      <div class="model-sub">저장탱크 재킷, 장거리 모관</div>
      <div class="divider"></div>
      <div class="spec-row"><span class="spec-label">부스터 비율</span><span class="spec-value hl">약 7.5~10배</span></div>
      <div class="spec-row"><span class="spec-label">기준</span><span class="spec-value hl">현장 확인 조합표</span></div>
    </div>
  </div>
</body></html>"""

# ── image-03: 헬륨 리크 디텍터 배관 이음부 검사 (인용·강조 박스) ────
image03_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{
    width:1200px; height:660px; background:#111214;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    font-family:{FONT}; padding:40px 70px; gap:28px;
  }}
  h2 {{ color:#FFFFFF; font-size:25px; font-weight:700; text-align:center; letter-spacing:-0.01em; }}
  .quote-box {{
    width:100%; background:linear-gradient(135deg,#1A1C1F,#0a1730);
    border:2px solid rgba(13,58,138,0.5); border-radius:16px;
    padding:30px 36px; display:flex; flex-direction:column; gap:18px;
  }}
  .quote-text {{ color:#E3DFD6; font-size:17px; line-height:1.7; }}
  .quote-text b {{ color:#7EB3F7; }}
  .spec-grid {{ display:flex; gap:18px; margin-top:4px; }}
  .spec-item {{
    flex:1; background:rgba(255,255,255,0.04); border-radius:10px;
    padding:16px 18px; display:flex; flex-direction:column; gap:6px;
  }}
  .spec-item .label {{ font-size:12px; color:#6A6660; }}
  .spec-item .value {{ font-size:16px; font-weight:800; color:#E46F75; font-family:{MONO}; }}
</style></head>
<body>
  <h2>배기 완료 후, 헬륨 리크 테스트로 이음부 기밀성 확인</h2>
  <div class="quote-box">
    <p class="quote-text">
      용접부·플랜지·벨로우즈 이음부에 미세 누설이 있으면 시간이 지나며 진공도가 서서히 무너지고,
      <b>단열 성능 저하는 한참 뒤에야 드러납니다.</b> 이음부에 헬륨을 분사해 신호 변화를 보는
      스프레이 방식이 현장에서 가장 흔합니다.
    </p>
    <div class="spec-grid">
      <div class="spec-item">
        <span class="label">검출감도 (웨트)</span>
        <span class="value">5×10⁻¹² mbar·L/s</span>
      </div>
      <div class="spec-item">
        <span class="label">검출감도 (드라이)</span>
        <span class="value">3×10⁻¹¹ mbar·L/s</span>
      </div>
      <div class="spec-item">
        <span class="label">측정 준비시간</span>
        <span class="value">2분 이내</span>
      </div>
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


base = r"C:\Users\rokmc\smartech\블로그\output\기술블로그\2026-07\극저온배관-드라이펌프-선택기준-20260704\images"

generate(thumbnail_html, f"{base}\\thumbnail.png", 1080, 1080)
generate(image01_html,   f"{base}\\image-01.png",  1200, 660)
generate(image02_html,   f"{base}\\image-02.png",  1200, 660)
generate(image03_html,   f"{base}\\image-03.png",  1200, 660)
print("모든 이미지 생성 완료")
