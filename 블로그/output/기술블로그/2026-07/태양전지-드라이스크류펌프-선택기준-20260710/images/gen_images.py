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
  .bg-circle-1 {{ width:460px; height:460px; background:#c00020; top:-80px; left:-100px; }}
  .bg-circle-2 {{ width:420px; height:420px; background:#0d3a8a; bottom:-100px; right:-80px; }}
  .content {{ text-align:center; display:flex; flex-direction:column; gap:20px; align-items:center; padding:60px; }}
  .badge {{ display:inline-block; background:rgba(192,0,32,0.15); border:1px solid rgba(192,0,32,0.5); color:#E46F75;
    font-size:15px; font-weight:600; letter-spacing:0.12em; padding:7px 20px; border-radius:20px; text-transform:uppercase; }}
  h1 {{ color:#FFFFFF; font-size:54px; font-weight:800; line-height:1.25; letter-spacing:-0.02em; max-width:840px; }}
  .subtitle {{ color:#9B9590; font-size:22px; font-weight:400; letter-spacing:0.01em; }}
</style></head>
<body>
  <div class="bg-circle bg-circle-1"></div>
  <div class="bg-circle bg-circle-2"></div>
  <div class="content">
    <span class="badge">Solar / Photovoltaic</span>
    <h1>태양전지 증착 라인<br>드라이펌프 선택 기준</h1>
    <p class="subtitle">대면적 배기속도부터 청정도까지</p>
  </div>
</body></html>"""

# ── 사진1: 오일식 펌프 오염 경로 vs 드라이 펌프 비교 ─────────────
img1_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ width:1200px; height:520px; background:#111214; display:flex; flex-direction:column;
    align-items:center; justify-content:center; font-family:{FONT}; padding:40px 60px; gap:28px; }}
  h2 {{ color:#FFFFFF; font-size:26px; font-weight:700; text-align:center; letter-spacing:-0.01em; }}
  .cards {{ width:100%; display:flex; gap:24px; }}
  .card {{ flex:1; background:#1A1C1F; border-radius:14px; padding:26px 22px; display:flex;
    flex-direction:column; gap:12px; border:1px solid rgba(255,255,255,0.08); }}
  .card.bad {{ border:2px solid rgba(192,0,32,0.5); background:linear-gradient(135deg,#1A1C1F,#210a0d); }}
  .card.good {{ border:2px solid rgba(13,58,138,0.5); background:linear-gradient(135deg,#1A1C1F,#0a1730); }}
  .tag {{ align-self:flex-start; font-size:12px; font-weight:700; letter-spacing:0.05em; padding:5px 14px; border-radius:14px; }}
  .tag.bad {{ background:rgba(192,0,32,0.18); color:#E46F75; }}
  .tag.good {{ background:rgba(13,58,138,0.25); color:#7EB3F7; }}
  .card-title {{ font-size:19px; font-weight:800; color:#FFFFFF; }}
  .card-desc {{ font-size:14px; color:#9B9590; line-height:1.6; }}
</style></head>
<body>
  <h2>오일식 펌프 vs 드라이 펌프 — 박막 오염 경로</h2>
  <div class="cards">
    <div class="card bad">
      <span class="tag bad">카본 오염 위험</span>
      <div class="card-title">오일식 펌프</div>
      <div class="card-desc">오일 증기가 챔버로 역류하면 박막에 카본 성분이 섞여 전지 효율에 영향을 줄 수 있습니다.</div>
    </div>
    <div class="card good">
      <span class="tag good">청정 진공</span>
      <div class="card-title">드라이 스크류 펌프</div>
      <div class="card-desc">오일 미스트 없이 대배기량을 처리해 박막 순도를 안정적으로 유지할 수 있습니다.</div>
    </div>
  </div>
</body></html>"""

# ── 사진2: 반도체 웨이퍼 vs 태양전지 기판 배기 면적 비교 ─────────────
img2_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ width:1200px; height:520px; background:#111214; display:flex; flex-direction:column;
    align-items:center; justify-content:center; font-family:{FONT}; padding:36px 60px; gap:26px; }}
  h2 {{ color:#FFFFFF; font-size:26px; font-weight:700; text-align:center; letter-spacing:-0.01em; }}
  .compare {{ width:100%; display:flex; align-items:flex-end; justify-content:center; gap:60px; }}
  .item {{ display:flex; flex-direction:column; align-items:center; gap:14px; }}
  .box {{ border-radius:10px; }}
  .box.small {{ width:120px; height:120px; background:linear-gradient(135deg,#0d3a8a,#7EB3F7); }}
  .box.large {{ width:320px; height:220px; background:linear-gradient(135deg,#c00020,#E46F75); }}
  .item-label {{ font-size:15px; font-weight:700; color:#E3DFD6; }}
  .item-sub {{ font-size:12px; color:#6A6660; }}
</style></head>
<body>
  <h2>기판 면적 비교 — 반도체 웨이퍼 vs 태양전지 기판</h2>
  <div class="compare">
    <div class="item">
      <div class="box small"></div>
      <div class="item-label">반도체 웨이퍼</div>
      <div class="item-sub">상대적으로 작은 면적</div>
    </div>
    <div class="item">
      <div class="box large"></div>
      <div class="item-label">태양전지 기판(대형 유리·롤투롤)</div>
      <div class="item-sub">훨씬 넓은 면적 · 배기속도 요구 큼</div>
    </div>
  </div>
</body></html>"""

# ── 사진3: 도핑 에칭 공정 분진 배출 구조 ─────────────
img3_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ width:1200px; height:340px; background:#111214; display:flex; flex-direction:column;
    align-items:center; justify-content:center; font-family:{FONT}; padding:40px 60px; gap:26px; }}
  h2 {{ color:#FFFFFF; font-size:26px; font-weight:700; text-align:center; letter-spacing:-0.01em; }}
  .flow {{ width:100%; display:flex; align-items:center; justify-content:center; gap:20px; }}
  .box {{ background:#1A1C1F; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:20px 22px; width:230px; text-align:center; }}
  .box-title {{ font-size:15px; font-weight:700; color:#E3DFD6; margin-bottom:6px; }}
  .box-desc {{ font-size:12px; color:#9B9590; line-height:1.5; }}
  .arrow {{ color:#E46F75; font-size:28px; }}
</style></head>
<body>
  <h2>도핑·에칭 공정 — 분진·부식가스 배출 흐름</h2>
  <div class="flow">
    <div class="box">
      <div class="box-title">① 도핑·확산·에칭</div>
      <div class="box-desc">부식성 가스 + 분진(dust) 동시 발생</div>
    </div>
    <div class="arrow">→</div>
    <div class="box">
      <div class="box-title">② 스크류 방식 배기</div>
      <div class="box-desc">분진·부식 혼합 환경에서 안정적 작동</div>
    </div>
    <div class="arrow">→</div>
    <div class="box">
      <div class="box-title">③ 내식 코팅 + 정기 퍼지</div>
      <div class="box-desc">배기 라인 퇴적 속도 지연</div>
    </div>
  </div>
</body></html>"""

# ── 사진4: 드라이펌프+루츠부스터 조합 구성 ─────────────
img4_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ width:1200px; height:520px; background:#111214; display:flex; flex-direction:column;
    align-items:center; justify-content:center; font-family:{FONT}; padding:36px 60px; gap:24px; }}
  h2 {{ color:#FFFFFF; font-size:26px; font-weight:700; text-align:center; letter-spacing:-0.01em; }}
  .stack {{ display:flex; flex-direction:column; gap:14px; align-items:center; }}
  .layer {{ width:420px; padding:16px 20px; border-radius:10px; text-align:center; font-size:15px; font-weight:700; }}
  .layer.chamber {{ background:rgba(255,255,255,0.06); color:#E3DFD6; border:1px solid rgba(255,255,255,0.1); }}
  .layer.booster {{ background:rgba(192,0,32,0.15); color:#E46F75; border:1px solid rgba(192,0,32,0.4); }}
  .layer.pump {{ background:rgba(13,58,138,0.2); color:#7EB3F7; border:1px solid rgba(13,58,138,0.4); }}
  .arrow-down {{ color:#6A6660; font-size:20px; }}
</style></head>
<body>
  <h2>대면적 챔버 — 드라이펌프 + 루츠부스터 조합</h2>
  <div class="stack">
    <div class="layer chamber">대면적 증착 챔버</div>
    <div class="arrow-down">↓</div>
    <div class="layer booster">루츠부스터 (초기 배기속도 향상)</div>
    <div class="arrow-down">↓</div>
    <div class="layer pump">드라이 스크류 펌프 (최종 진공도 유지)</div>
  </div>
</body></html>"""

# ── 사진5: 태양전지 생산라인 드라이펌프 적용 예시 ─────────────
img5_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ width:1200px; height:340px; background:#111214; display:flex; flex-direction:column;
    align-items:center; justify-content:center; font-family:{FONT}; padding:36px 60px; gap:22px; }}
  h2 {{ color:#FFFFFF; font-size:26px; font-weight:700; text-align:center; letter-spacing:-0.01em; }}
  .cards {{ width:100%; display:flex; gap:20px; }}
  .card {{ flex:1; background:#1A1C1F; border-radius:14px; border:1px solid rgba(255,255,255,0.08);
    padding:20px 18px; display:flex; flex-direction:column; gap:10px; }}
  .model-name {{ font-size:20px; font-weight:800; color:#FFFFFF; }}
  .model-sub {{ font-size:12px; color:#6A6660; }}
  .divider {{ width:100%; height:1px; background:rgba(255,255,255,0.07); }}
  .spec-row {{ display:flex; justify-content:space-between; }}
  .spec-label {{ font-size:11px; color:#6A6660; }}
  .spec-value {{ font-size:13px; font-weight:700; color:#E3DFD6; }}
</style></head>
<body>
  <h2>태양전지 생산라인 드라이펌프 구성 예시</h2>
  <div class="cards">
    <div class="card">
      <div class="model-name" style="color:#7EB3F7;">GXS / EXS</div>
      <div class="model-sub">산업용 드라이펌프</div>
      <div class="divider"></div>
      <div class="spec-row"><span class="spec-label">용도</span><span class="spec-value">증착·도핑 라인 메인 배기</span></div>
      <div class="spec-row"><span class="spec-label">특징</span><span class="spec-value">오일프리 · 내식 옵션</span></div>
    </div>
    <div class="card">
      <div class="model-name" style="color:#E46F75;">EH 시리즈</div>
      <div class="model-sub">루츠 부스터</div>
      <div class="divider"></div>
      <div class="spec-row"><span class="spec-label">용도</span><span class="spec-value">대면적 챔버 펌프다운 단축</span></div>
      <div class="spec-row"><span class="spec-label">조합</span><span class="spec-value">GXS/EXS와 직렬 구성</span></div>
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


base = r"C:\Users\rokmc\smartech\블로그\output\기술블로그\2026-07\태양전지-드라이스크류펌프-선택기준-20260710\images"

generate(thumbnail_html, f"{base}\\thumbnail.png", 1080, 1080)
generate(img1_html, f"{base}\\사진1.png", 1200, 520)
generate(img2_html, f"{base}\\사진2.png", 1200, 520)
generate(img3_html, f"{base}\\사진3.png", 1200, 340)
generate(img4_html, f"{base}\\사진4.png", 1200, 520)
generate(img5_html, f"{base}\\사진5.png", 1200, 380)
print("모든 이미지 생성 완료")
