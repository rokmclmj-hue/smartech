from playwright.sync_api import sync_playwright
import os

OUT = os.path.dirname(os.path.abspath(__file__))

THUMBNAIL_HTML = """
<html><head><meta charset="utf-8"><style>
@font-face {
  font-family: 'sys';
}
body {
  margin:0; width:1080px; height:1080px;
  display:flex; align-items:center; justify-content:center;
  background: linear-gradient(135deg,#1a1a2e,#16213e);
  font-family: 'Malgun Gothic', 'Pretendard', sans-serif;
}
.wrap {
  text-align:center; padding:60px;
  display:flex; flex-direction:column; gap:20px; align-items:center;
}
.badge {
  color:#a0aec0; font-size:24px; letter-spacing:2px; border:1px solid #3a3a5c;
  padding:8px 20px; border-radius:20px;
}
h1 {
  color:#ffffff; font-size:64px; font-weight:800; line-height:1.35; margin:0; max-width:820px;
}
.accent { color:#4fd1c5; }
p.sub {
  color:#a0aec0; font-size:28px; margin:0;
}
</style></head>
<body>
  <div class="wrap">
    <span class="badge">기술문의 · 부품/배관</span>
    <h1>극저온 이중배관<br><span class="accent">벨로우즈·플랜지</span> 선택 기준</h1>
    <p class="sub">KF · ISO · CF — 실 재질과 온도 범위로 판단한다</p>
  </div>
</body></html>
"""

FLANGE_COMPARE_HTML = """
<html><head><meta charset="utf-8"><style>
* { box-sizing: border-box; }
body {
  margin:0; width:1200px; height:700px;
  background:#12121f;
  font-family: 'Malgun Gothic', 'Pretendard', sans-serif;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  padding:0 60px;
}
h2 { color:#fff; font-size:36px; margin:0 0 36px 0; }
.row { display:flex; gap:24px; width:100%; justify-content:center; }
.card {
  width:320px; background:#1c1c30; border-radius:16px; padding:28px;
  border:1px solid #33334f;
}
.card h3 { color:#4fd1c5; font-size:28px; margin:0 0 16px 0; }
.card ul { list-style:none; padding:0; margin:0; }
.card li {
  color:#e2e2f0; font-size:19px; line-height:1.7; margin-bottom:10px;
  padding-left:18px; position:relative;
}
.card li::before {
  content:"-"; position:absolute; left:0; color:#4fd1c5;
}
.card .range { color:#f6ad55; font-weight:700; }
</style></head>
<body>
  <h2>진공 배관 플랜지 3종 비교</h2>
  <div class="row">
    <div class="card">
      <h3>KF (NW)</h3>
      <ul>
        <li>지름 <span class="range">10~50mm</span></li>
        <li>압력 <span class="range">10⁻⁷ mbar↑</span></li>
        <li>O링·클램프 체결</li>
        <li>잦은 분해조립용</li>
      </ul>
    </div>
    <div class="card">
      <h3>ISO</h3>
      <ul>
        <li>지름 <span class="range">40~630mm</span></li>
        <li>압력 <span class="range">10⁻⁸ mbar↑</span></li>
        <li>클로클램프·볼트</li>
        <li>대구경 산업용</li>
      </ul>
    </div>
    <div class="card">
      <h3>CF</h3>
      <ul>
        <li>지름 <span class="range">16~350mm</span></li>
        <li>압력 <span class="range">10⁻⁸ mbar↓</span></li>
        <li>구리개스킷 금속 실</li>
        <li>초고진공·극저온</li>
      </ul>
    </div>
  </div>
</body></html>
"""

TEMP_RANGE_HTML = """
<html><head><meta charset="utf-8"><style>
* { box-sizing: border-box; }
body {
  margin:0; width:1200px; height:700px;
  background:#12121f;
  font-family: 'Malgun Gothic', 'Pretendard', sans-serif;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  padding:0 60px;
}
h2 { color:#fff; font-size:32px; margin:0 0 34px 0; text-align:center; }
.chart { width:100%; }
.bar-row { display:flex; align-items:center; margin-bottom:20px; }
.label { width:220px; color:#e2e2f0; font-size:19px; text-align:right; padding-right:20px; flex-shrink:0; }
.track { flex:1; height:36px; background:#1c1c30; border-radius:8px; position:relative; overflow:visible; }
.fill { height:36px; border-radius:8px; background:linear-gradient(90deg,#4fd1c5,#38b2ac); position:absolute; top:0; }
.val { color:#a0aec0; font-size:16px; margin-left:14px; white-space:nowrap; width:280px; flex-shrink:0; }
.cryo-zone {
  position:absolute; left:0; top:-16px; bottom:-16px; width:60px;
  background:rgba(245,101,101,0.18); border-right:2px dashed #f56565;
}
.cryo-label {
  position:absolute; left:4px; top:0; color:#f56565; font-size:14px; font-weight:700; writing-mode: vertical-rl;
}
.wrap-inner { position:relative; padding-top:16px; padding-bottom:16px; }
</style></head>
<body>
  <h2>실 재질별 사용 온도 범위 vs 극저온 구간(액화질소 -196℃)</h2>
  <div class="chart">
    <div class="wrap-inner">
      <div class="cryo-zone"></div>
      <div class="cryo-label">극저온</div>
      <div class="bar-row">
        <div class="label">폴리머 Co-Seal</div>
        <div class="track"><div class="fill" style="left:23%; width:18%;"></div></div>
        <div class="val">-10 ~ 80℃</div>
      </div>
      <div class="bar-row">
        <div class="label">나이트릴 O링</div>
        <div class="track"><div class="fill" style="left:23%; width:22%;"></div></div>
        <div class="val">-10 ~ 100℃</div>
      </div>
      <div class="bar-row">
        <div class="label">불소고무 O링</div>
        <div class="track"><div class="fill" style="left:23%; width:32%;"></div></div>
        <div class="val">-10 ~ 150℃</div>
      </div>
      <div class="bar-row">
        <div class="label">스테인리스 클램프</div>
        <div class="track"><div class="fill" style="left:23%; width:42%;"></div></div>
        <div class="val">-10 ~ 200℃</div>
      </div>
      <div class="bar-row">
        <div class="label">CF 금속 실(구리)</div>
        <div class="track"><div class="fill" style="left:0%; width:100%; background:linear-gradient(90deg,#f6ad55,#ed8936);"></div></div>
        <div class="val">탄성체 없음 · 저온 취성 없음</div>
      </div>
    </div>
  </div>
</body></html>
"""

def shot(html, path, w, h):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.set_content(html)
        page.set_viewport_size({"width": w, "height": h})
        page.screenshot(path=path, full_page=False)
        browser.close()

shot(THUMBNAIL_HTML, os.path.join(OUT, "thumbnail.png"), 1080, 1080)
shot(FLANGE_COMPARE_HTML, os.path.join(OUT, "사진2.png"), 1200, 700)
shot(TEMP_RANGE_HTML, os.path.join(OUT, "사진3.png"), 1200, 700)
print("done")
