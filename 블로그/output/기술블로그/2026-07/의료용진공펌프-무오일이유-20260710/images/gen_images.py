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
  h1 {{ color:#FFFFFF; font-size:52px; font-weight:800; line-height:1.3; letter-spacing:-0.02em; max-width:840px; }}
  .subtitle {{ color:#9B9590; font-size:22px; font-weight:400; letter-spacing:0.01em; }}
</style></head>
<body>
  <div class="bg-circle bg-circle-1"></div>
  <div class="bg-circle bg-circle-2"></div>
  <div class="content">
    <span class="badge">Medical / Biotech</span>
    <h1>의료·생명공학 진공 시스템<br>무오일 드라이펌프 선택 기준</h1>
    <p class="subtitle">오일 프리부터 동결건조까지</p>
  </div>
</body></html>"""

# ── 사진1: 오일 역류 경로와 멸균 공정 오염 위험 ─────────────
img1_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ width:1200px; height:340px; background:#111214; display:flex; flex-direction:column;
    align-items:center; justify-content:center; font-family:{FONT}; padding:40px 60px; gap:26px; }}
  h2 {{ color:#FFFFFF; font-size:26px; font-weight:700; text-align:center; letter-spacing:-0.01em; }}
  .flow {{ width:100%; display:flex; align-items:center; justify-content:center; gap:20px; }}
  .box {{ background:#1A1C1F; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:20px 22px; width:230px; text-align:center; }}
  .box.warn {{ border:2px solid rgba(192,0,32,0.5); background:linear-gradient(135deg,#1A1C1F,#210a0d); }}
  .box-title {{ font-size:15px; font-weight:700; color:#E3DFD6; margin-bottom:6px; }}
  .box-title.warn {{ color:#E46F75; }}
  .box-desc {{ font-size:12px; color:#9B9590; line-height:1.5; }}
  .arrow {{ color:#E46F75; font-size:28px; }}
</style></head>
<body>
  <h2>오일 역류(backstreaming) → 멸균 공정 오염 경로</h2>
  <div class="flow">
    <div class="box">
      <div class="box-title">① 오일식 펌프 운전</div>
      <div class="box-desc">배기 라인 내 오일 증기 발생</div>
    </div>
    <div class="arrow">→</div>
    <div class="box">
      <div class="box-title">② 배기 라인 역류</div>
      <div class="box-desc">오일 증기가 챔버 방향으로 이동</div>
    </div>
    <div class="arrow">→</div>
    <div class="box warn">
      <div class="box-title warn">③ 제품 오염 위험</div>
      <div class="box-desc">백신·주사제 등 멸균 제품 오염 가능성</div>
    </div>
  </div>
</body></html>"""

# ── 사진2: 동결건조 챔버 응축기 진공펌프 구성도 ─────────────
img2_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ width:1200px; height:520px; background:#111214; display:flex; flex-direction:column;
    align-items:center; justify-content:center; font-family:{FONT}; padding:36px 60px; gap:24px; }}
  h2 {{ color:#FFFFFF; font-size:26px; font-weight:700; text-align:center; letter-spacing:-0.01em; }}
  .stack {{ display:flex; flex-direction:column; gap:14px; align-items:center; }}
  .layer {{ width:440px; padding:16px 20px; border-radius:10px; text-align:center; font-size:15px; font-weight:700; }}
  .layer.chamber {{ background:rgba(255,255,255,0.06); color:#E3DFD6; border:1px solid rgba(255,255,255,0.1); }}
  .layer.cond {{ background:rgba(13,58,138,0.2); color:#7EB3F7; border:1px solid rgba(13,58,138,0.4); }}
  .layer.pump {{ background:rgba(192,0,32,0.15); color:#E46F75; border:1px solid rgba(192,0,32,0.4); }}
  .arrow-down {{ color:#6A6660; font-size:20px; }}
  .note {{ font-size:12px; color:#6A6660; margin-top:6px; text-align:center; }}
</style></head>
<body>
  <h2>동결건조 시스템 구성 — 챔버·응축기·진공펌프</h2>
  <div class="stack">
    <div class="layer chamber">건조 챔버 (1~10⁻³ mbar)</div>
    <div class="arrow-down">↓</div>
    <div class="layer cond">응축기 (-55°C ~ -85°C)</div>
    <div class="arrow-down">↓</div>
    <div class="layer pump">무오일 드라이 스크류 펌프</div>
  </div>
  <div class="note">물의 삼중점: 0°C · 약 6 mbar — 이보다 낮은 조건에서 승화</div>
</body></html>"""

# ── 사진3: 스크류 드라이펌프 재생모드 작동 흐름 ─────────────
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
  .arrow {{ color:#7EB3F7; font-size:28px; }}
</style></head>
<body>
  <h2>스크류 드라이펌프 — 재생모드 작동 흐름</h2>
  <div class="flow">
    <div class="box">
      <div class="box-title">① 공정 종료</div>
      <div class="box-desc">배치 처리 완료</div>
    </div>
    <div class="arrow">→</div>
    <div class="box">
      <div class="box-title">② 재생 모드 가동</div>
      <div class="box-desc">내부 잔류 수분·오염 빠르게 건조</div>
    </div>
    <div class="arrow">→</div>
    <div class="box">
      <div class="box-title">③ 다음 배치 준비</div>
      <div class="box-desc">대기 시간 단축 · 처리량 향상</div>
    </div>
  </div>
</body></html>"""

# ── 사진4: 오일식 무오일 비교표 ─────────────
img4_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ width:1200px; height:520px; background:#111214; display:flex; flex-direction:column;
    align-items:center; justify-content:center; font-family:{FONT}; padding:36px 60px; gap:22px; }}
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
  <h2>오일식 펌프 vs 무오일 드라이 스크류 펌프</h2>
  <div class="cards">
    <div class="card bad">
      <span class="tag bad">역류 위험</span>
      <div class="card-title">오일식 펌프</div>
      <div class="card-desc">정기 오일 교환 필요, 규제 대상 공정에는 사용이 제한될 수 있습니다.</div>
    </div>
    <div class="card good">
      <span class="tag good">규제 적합</span>
      <div class="card-title">무오일 드라이 스크류 펌프</div>
      <div class="card-desc">오일 교환 불필요, 재생모드로 반복 배치 처리량을 안정적으로 유지합니다.</div>
    </div>
  </div>
</body></html>"""

# ── 사진5: 의료 바이오 연구실 드라이펌프 적용 예시 ─────────────
img5_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ width:1200px; height:380px; background:#111214; display:flex; flex-direction:column;
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
  <h2>의료·바이오 연구실 드라이펌프 적용 예시</h2>
  <div class="cards">
    <div class="card">
      <div class="model-name" style="color:#7EB3F7;">nXDS / XDS</div>
      <div class="model-sub">드라이 스크롤 펌프</div>
      <div class="divider"></div>
      <div class="spec-row"><span class="spec-label">용도</span><span class="spec-value">연구실·소형 동결건조</span></div>
      <div class="spec-row"><span class="spec-label">특징</span><span class="spec-value">오일프리 · 저진동</span></div>
    </div>
    <div class="card">
      <div class="model-name" style="color:#E46F75;">GXS / EXS</div>
      <div class="model-sub">산업용 드라이 스크류 펌프</div>
      <div class="divider"></div>
      <div class="spec-row"><span class="spec-label">용도</span><span class="spec-value">대형 동결건조·생산라인</span></div>
      <div class="spec-row"><span class="spec-label">특징</span><span class="spec-value">재생모드 · 고배기량</span></div>
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


base = r"C:\Users\rokmc\smartech\블로그\output\기술블로그\2026-07\의료용진공펌프-무오일이유-20260710\images"

generate(thumbnail_html, f"{base}\\thumbnail.png", 1080, 1080)
generate(img1_html, f"{base}\\사진1.png", 1200, 340)
generate(img2_html, f"{base}\\사진2.png", 1200, 520)
generate(img3_html, f"{base}\\사진3.png", 1200, 340)
generate(img4_html, f"{base}\\사진4.png", 1200, 520)
generate(img5_html, f"{base}\\사진5.png", 1200, 380)
print("모든 이미지 생성 완료")
