# -*- coding: utf-8 -*-
from playwright.sync_api import sync_playwright

FONT = "'Pretendard Variable', 'Pretendard', 'Noto Sans KR', sans-serif"
MONO = "'JetBrains Mono', monospace"

# ── 사진1: 다단 드라이펌프 압력 구간별 구조 ─────────────────
img1_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{
    width:1200px; height:520px; background:#111214;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    font-family:{FONT}; padding:40px 60px; gap:26px;
  }}
  h2 {{ color:#FFFFFF; font-size:26px; font-weight:700; text-align:center; letter-spacing:-0.01em; }}
  .stages {{ width:100%; display:flex; gap:16px; align-items:flex-end; }}
  .stage {{
    flex:1; background:#1A1C1F; border-radius:12px; border:1px solid rgba(255,255,255,0.08);
    display:flex; flex-direction:column; align-items:center; justify-content:flex-end;
    padding:16px 10px; gap:8px;
  }}
  .stage-bar {{ width:100%; border-radius:8px; }}
  .stage-label {{ font-size:13px; color:#E3DFD6; font-weight:700; text-align:center; }}
  .stage-value {{ font-size:12px; color:#6A6660; font-family:{MONO}; text-align:center; }}
</style></head>
<body>
  <h2>다단 드라이펌프 — 압력 구간별 단(Stage) 구조</h2>
  <div class="stages">
    <div class="stage">
      <div class="stage-bar" style="height:60px;background:linear-gradient(90deg,#0d3a8a,#7EB3F7);"></div>
      <div class="stage-label">1단</div>
      <div class="stage-value">대기압~10⁻¹ Torr</div>
    </div>
    <div class="stage">
      <div class="stage-bar" style="height:100px;background:linear-gradient(90deg,#0d3a8a,#7EB3F7);"></div>
      <div class="stage-label">2단</div>
      <div class="stage-value">10⁻¹~10⁻³ Torr</div>
    </div>
    <div class="stage">
      <div class="stage-bar" style="height:150px;background:linear-gradient(90deg,#c00020,#E46F75);"></div>
      <div class="stage-label">3단</div>
      <div class="stage-value">10⁻³~10⁻⁵ Torr</div>
    </div>
    <div class="stage">
      <div class="stage-bar" style="height:200px;background:linear-gradient(90deg,#c00020,#E46F75);"></div>
      <div class="stage-label">4단</div>
      <div class="stage-value">10⁻⁵~10⁻⁶ Torr</div>
    </div>
  </div>
</body></html>"""

# ── 사진2: 부식성 가스 배기 라인 내부 퇴적물 비교 ─────────────
img2_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{
    width:1200px; height:520px; background:#111214;
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
  .tag {{ align-self:flex-start; font-size:12px; font-weight:700; letter-spacing:0.05em; padding:5px 14px; border-radius:14px; }}
  .tag.bad {{ background:rgba(192,0,32,0.18); color:#E46F75; }}
  .tag.good {{ background:rgba(13,58,138,0.25); color:#7EB3F7; }}
  .card-title {{ font-size:19px; font-weight:800; color:#FFFFFF; }}
  .card-desc {{ font-size:14px; color:#9B9590; line-height:1.6; }}
</style></head>
<body>
  <h2>배기 라인 내부 상태 — 일반 펌프 vs 내식 대응 펌프</h2>
  <div class="cards">
    <div class="card bad">
      <span class="tag bad">부식·퇴적 진행</span>
      <div class="card-title">일반 공정용 드라이펌프</div>
      <div class="card-desc">Cl₂·BCl₃·HBr 반응 부산물이 저온 구간에서 응축, 고형물로 축적되며 유량이 서서히 저하됩니다.</div>
    </div>
    <div class="card good">
      <span class="tag good">퇴적 지연</span>
      <div class="card-title">내식 코팅 + 가스발라스트</div>
      <div class="card-desc">내식 재질과 가스발라스트·배기 라인 히팅을 병행하면 부산물 고형화 시점을 늦출 수 있습니다.</div>
    </div>
  </div>
</body></html>"""

# ── 사진3: 스크류 펌프와 스크롤 펌프 구조 비교 ─────────────
img3_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{
    width:1200px; height:520px; background:#111214;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    font-family:{FONT}; padding:36px 60px; gap:22px;
  }}
  h2 {{ color:#FFFFFF; font-size:26px; font-weight:700; text-align:center; letter-spacing:-0.01em; }}
  .cards {{ width:100%; display:flex; gap:20px; }}
  .card {{
    flex:1; background:#1A1C1F; border-radius:14px; border:1px solid rgba(255,255,255,0.08);
    padding:22px 20px; display:flex; flex-direction:column; gap:12px;
  }}
  .model-name {{ font-size:24px; font-weight:800; color:#FFFFFF; letter-spacing:-0.02em; }}
  .model-sub {{ font-size:13px; color:#6A6660; }}
  .divider {{ width:100%; height:1px; background:rgba(255,255,255,0.07); }}
  .spec-row {{ display:flex; justify-content:space-between; align-items:baseline; }}
  .spec-label {{ font-size:12px; color:#6A6660; font-weight:500; }}
  .spec-value {{ font-size:14px; font-weight:700; color:#E3DFD6; }}
</style></head>
<body>
  <h2>스크류 방식 vs 스크롤 방식</h2>
  <div class="cards">
    <div class="card">
      <div class="model-name" style="color:#E46F75;">스크류(screw)</div>
      <div class="model-sub">고부하 · 파티클/부식 대응</div>
      <div class="divider"></div>
      <div class="spec-row"><span class="spec-label">적용 공정</span><span class="spec-value">플라즈마 에칭</span></div>
      <div class="spec-row"><span class="spec-label">유로</span><span class="spec-value">넓음 · 자정 능력</span></div>
      <div class="spec-row"><span class="spec-label">부산물 대응</span><span class="spec-value">상대적으로 강함</span></div>
    </div>
    <div class="card">
      <div class="model-name" style="color:#7EB3F7;">스크롤(scroll)</div>
      <div class="model-sub">클린룸 민감 공정</div>
      <div class="divider"></div>
      <div class="spec-row"><span class="spec-label">적용 공정</span><span class="spec-value">웨이퍼 검사·리소그래피</span></div>
      <div class="spec-row"><span class="spec-label">진동/오염</span><span class="spec-value">낮음</span></div>
      <div class="spec-row"><span class="spec-label">부산물 대응</span><span class="spec-value">고부하엔 부적합</span></div>
    </div>
  </div>
</body></html>"""

# ── 사진4: 가스발라스트 운전 원리 다이어그램 ─────────────
img4_html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{
    width:1200px; height:320px; background:#111214;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    font-family:{FONT}; padding:40px 60px; gap:26px;
  }}
  h2 {{ color:#FFFFFF; font-size:26px; font-weight:700; text-align:center; letter-spacing:-0.01em; }}
  .flow {{ width:100%; display:flex; align-items:center; justify-content:center; gap:20px; }}
  .box {{
    background:#1A1C1F; border:1px solid rgba(255,255,255,0.08); border-radius:12px;
    padding:20px 22px; width:220px; text-align:center;
  }}
  .box-title {{ font-size:15px; font-weight:700; color:#E3DFD6; margin-bottom:6px; }}
  .box-desc {{ font-size:12px; color:#9B9590; line-height:1.5; }}
  .arrow {{ color:#E46F75; font-size:28px; }}
</style></head>
<body>
  <h2>가스발라스트 운전 흐름</h2>
  <div class="flow">
    <div class="box">
      <div class="box-title">① 불활성 가스 주입</div>
      <div class="box-desc">펌프 내부에 소량 투입해 응축점을 낮춤</div>
    </div>
    <div class="arrow">→</div>
    <div class="box">
      <div class="box-title">② 고형화 이전 배출</div>
      <div class="box-desc">부산물이 굳기 전에 배기 라인으로 이동</div>
    </div>
    <div class="arrow">→</div>
    <div class="box">
      <div class="box-title">③ 라인 히팅 병행</div>
      <div class="box-desc">배기 라인 온도를 응축점 이상으로 유지</div>
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


base = r"C:\Users\rokmc\smartech\블로그\output\기술블로그\2026-07\반도체-정밀가공-드라이펌프-선택기준-20260710\images"

generate(img1_html, f"{base}\\사진1.png", 1200, 520)
generate(img2_html, f"{base}\\사진2.png", 1200, 520)
generate(img3_html, f"{base}\\사진3.png", 1200, 520)
generate(img4_html, f"{base}\사진4.png", 1200, 320)
print("모든 이미지 생성 완료")
