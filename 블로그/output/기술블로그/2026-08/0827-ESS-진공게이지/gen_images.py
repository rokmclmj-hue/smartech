# -*- coding: utf-8 -*-
from playwright.sync_api import sync_playwright
import os

BASE = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(BASE, "images")

FONT_CSS = """
@font-face { font-family: 'Pretendard'; src: local('Malgun Gothic'); }
* { font-family: 'Pretendard', 'Malgun Gothic', sans-serif; box-sizing: border-box; margin:0; padding:0; }
"""

THUMBNAIL_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1080px; height:1080px; background: linear-gradient(135deg,#14213d,#1f3a5f); display:flex; align-items:center; justify-content:center; }}
.wrap {{ text-align:center; padding:60px; display:flex; flex-direction:column; gap:90px; align-items:center; }}
.badge {{ font-size:46px; color:#a0aec0; letter-spacing:2px; border:2px solid #4a5568; border-radius:44px; padding:18px 46px; }}
h1 {{ font-size:88px; color:#ffffff; line-height:1.32; font-weight:800; }}
.sub {{ font-size:60px; color:#ffca7a; line-height:1.4; }}
</style></head>
<body>
  <div class="wrap">
    <div class="badge">기술문의</div>
    <h1>ESS 전해질 주입<br>진공도는 어떻게 잴까</h1>
    <div class="sub">진공게이지 선택 기준</div>
  </div>
</body></html>
"""

COMPARE_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; background: linear-gradient(135deg,#14213d,#1f3a5f); display:flex; align-items:center; justify-content:center; }}
.wrap {{ width:1080px; padding:40px; display:flex; flex-direction:column; gap:36px; }}
.title {{ font-size:40px; color:#ffffff; font-weight:700; text-align:center; margin-bottom:10px; }}
.cards {{ display:flex; gap:28px; justify-content:center; }}
.card {{ flex:1; background:#1c2f4e; border-radius:20px; padding:34px 28px; border:1px solid #34527a; }}
.card h2 {{ font-size:28px; color:#ffffff; margin-bottom:14px; }}
.card p {{ font-size:21px; color:#c3c9d6; line-height:1.6; }}
.tag {{ margin-top:16px; color:#ffca7a; font-size:19px; }}
</style></head>
<body>
  <div class="wrap">
    <div class="title">진공게이지 두 계열</div>
    <div class="cards">
      <div class="card"><h2>정전용량식</h2><p>다이어프램 압력차 측정<br>가스 종류와 무관</p><div class="tag">정확도 우선</div></div>
      <div class="card"><h2>간접식(피라니 등)</h2><p>열전도율·이온화율 기반<br>가스 종류에 영향받음</p><div class="tag">범위·비용 우선</div></div>
    </div>
  </div>
</body></html>
"""

VAPOR_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; background: linear-gradient(135deg,#14213d,#1f3a5f); display:flex; align-items:center; justify-content:center; }}
.wrap {{ padding:40px; display:flex; align-items:center; gap:70px; }}
.chamber {{ position:relative; width:280px; height:280px; border:6px solid #6b7690; border-radius:16px; background: radial-gradient(circle, #1c2f4e, #0d1626 80%); display:flex; align-items:center; justify-content:center; }}
.dots {{ position:absolute; width:10px; height:10px; background:#ffca7a; border-radius:50%; opacity:0.7; }}
.gauge {{ font-size:60px; }}
.info {{ max-width:480px; }}
.info h2 {{ font-size:36px; color:#ffffff; margin-bottom:24px; }}
.info p {{ font-size:23px; color:#c3c9d6; line-height:1.7; margin-bottom:14px; }}
.dot {{ color:#ffca7a; }}
</style></head>
<body>
  <div class="wrap">
    <div class="chamber">
      <div class="gauge">🌡️</div>
      <div class="dots" style="top:40px; left:60px;"></div>
      <div class="dots" style="top:200px; left:220px;"></div>
      <div class="dots" style="top:100px; left:200px;"></div>
    </div>
    <div class="info">
      <h2>전해질 증기가 섞인 챔버</h2>
      <p><span class="dot">●</span> 유기 용제 증기가 기체 조성에 혼입</p>
      <p><span class="dot">●</span> 열전도 특성이 공기와 달라짐</p>
      <p><span class="dot">●</span> 간접식 게이지는 이 환경에서 오차 위험</p>
    </div>
  </div>
</body></html>
"""

STAGES_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; background: linear-gradient(135deg,#14213d,#1f3a5f); display:flex; align-items:center; justify-content:center; }}
.wrap {{ width:1080px; padding:40px; display:flex; flex-direction:column; gap:30px; }}
.title {{ font-size:38px; color:#ffffff; font-weight:700; text-align:center; margin-bottom:6px; }}
.row {{ display:flex; align-items:center; justify-content:center; gap:0; }}
.step {{ background:#1c2f4e; border:1px solid #34527a; border-radius:16px; padding:20px 18px; width:210px; text-align:center; }}
.step .n {{ font-size:17px; color:#ffca7a; margin-bottom:6px; }}
.step .t {{ font-size:21px; color:#ffffff; font-weight:600; margin-bottom:6px; }}
.step .d {{ font-size:15px; color:#9aa3b5; }}
.arrow {{ font-size:28px; color:#5a6478; padding:0 8px; }}
.foot {{ font-size:19px; color:#7b8397; text-align:center; margin-top:10px; }}
</style></head>
<body>
  <div class="wrap">
    <div class="title">ESS 셀 제조, 진공이 쓰이는 4단계</div>
    <div class="row">
      <div class="step"><div class="n">1</div><div class="t">혼합</div><div class="d">기포 방지</div></div>
      <div class="arrow">→</div>
      <div class="step"><div class="n">2</div><div class="t">건조</div><div class="d">수분 제거</div></div>
      <div class="arrow">→</div>
      <div class="step"><div class="n">3</div><div class="t">전해질 주입</div><div class="d">게이지 선택 중요</div></div>
      <div class="arrow">→</div>
      <div class="step"><div class="n">4</div><div class="t">밀봉</div><div class="d">진공 상태 봉합</div></div>
    </div>
    <div class="foot">전해질 주입 단계만 유독 가스 조성이 복잡합니다</div>
  </div>
</body></html>
"""

RANGE_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; background: linear-gradient(135deg,#14213d,#1f3a5f); display:flex; align-items:center; justify-content:center; }}
.wrap {{ width:1080px; padding:40px; display:flex; flex-direction:column; gap:30px; }}
.title {{ font-size:38px; color:#ffffff; font-weight:700; text-align:center; margin-bottom:6px; }}
.row {{ display:flex; align-items:center; justify-content:center; gap:0; }}
.step {{ background:#1c2f4e; border:1px solid #34527a; border-radius:16px; padding:24px 26px; width:270px; text-align:center; }}
.step .n {{ font-size:19px; color:#ffca7a; margin-bottom:8px; }}
.step .t {{ font-size:24px; color:#ffffff; font-weight:600; margin-bottom:6px; }}
.step .d {{ font-size:16px; color:#9aa3b5; }}
.arrow {{ font-size:32px; color:#5a6478; padding:0 14px; }}
.foot {{ font-size:19px; color:#7b8397; text-align:center; margin-top:10px; }}
</style></head>
<body>
  <div class="wrap">
    <div class="title">구간별 게이지 조합 구성</div>
    <div class="row">
      <div class="step"><div class="n">저진공 구간</div><div class="t">정전용량식</div><div class="d">정밀한 절대압력 기준</div></div>
      <div class="arrow">+</div>
      <div class="step"><div class="n">전체 구간</div><div class="t">피라니</div><div class="d">넓은 범위, 낮은 비용</div></div>
    </div>
    <div class="foot">한 게이지로 전 구간을 커버하기보다 조합하는 방식</div>
  </div>
</body></html>
"""

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()

    page.set_content(THUMBNAIL_HTML)
    page.set_viewport_size({"width": 1080, "height": 1080})
    page.screenshot(path=os.path.join(IMG_DIR, "thumbnail.png"))

    page.set_content(COMPARE_HTML)
    page.set_viewport_size({"width": 1200, "height": 1400})
    page.locator(".wrap").screenshot(path=os.path.join(IMG_DIR, "사진1.png"))

    page.set_content(VAPOR_HTML)
    page.set_viewport_size({"width": 1200, "height": 1400})
    page.locator(".wrap").screenshot(path=os.path.join(IMG_DIR, "사진2.png"))

    page.set_content(RANGE_HTML)
    page.set_viewport_size({"width": 1200, "height": 1400})
    page.locator(".wrap").screenshot(path=os.path.join(IMG_DIR, "사진3.png"))

    page.set_content(STAGES_HTML)
    page.set_viewport_size({"width": 1200, "height": 1400})
    page.locator(".wrap").screenshot(path=os.path.join(IMG_DIR, "사진4.png"))

    browser.close()

print("done")
