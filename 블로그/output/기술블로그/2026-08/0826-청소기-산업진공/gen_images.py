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
body {{ width:1080px; height:1080px; background: linear-gradient(135deg,#1a1a2e,#16213e); display:flex; align-items:center; justify-content:center; }}
.wrap {{ text-align:center; padding:60px; display:flex; flex-direction:column; gap:90px; align-items:center; }}
.badge {{ font-size:46px; color:#a0aec0; letter-spacing:2px; border:2px solid #4a5568; border-radius:44px; padding:18px 46px; }}
h1 {{ font-size:92px; color:#ffffff; line-height:1.32; font-weight:800; }}
.sub {{ font-size:62px; color:#8ea6ff; line-height:1.4; }}
</style></head>
<body>
  <div class="wrap">
    <div class="badge">진공 상식</div>
    <h1>청소기와 진공펌프<br>뭐가 다를까</h1>
    <div class="sub">압력차 vs 실제 배기</div>
  </div>
</body></html>
"""

VACUUM_CLEANER_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#1a1a2e,#16213e); display:flex; align-items:center; justify-content:center; }}
.wrap {{ display:flex; align-items:center; gap:70px; }}
.box {{ position:relative; width:280px; height:280px; border:6px solid #6b7690; border-radius:20px; background:#10142c; display:flex; align-items:center; justify-content:center; }}
.arrow-in {{ position:absolute; left:-90px; top:50%; transform:translateY(-50%); font-size:60px; color:#8ea6ff; }}
.label-out {{ position:absolute; top:-50px; font-size:22px; color:#c3c9d6; }}
.fan {{ font-size:70px; }}
.info {{ max-width:480px; }}
.info h2 {{ font-size:38px; color:#ffffff; margin-bottom:24px; }}
.info p {{ font-size:24px; color:#c3c9d6; line-height:1.7; margin-bottom:14px; }}
.dot {{ color:#8ea6ff; }}
</style></head>
<body>
  <div class="wrap">
    <div class="box">
      <div class="label-out">청소기 내부 (저압)</div>
      <div class="arrow-in">→</div>
      <div class="fan">🌀</div>
    </div>
    <div class="info">
      <h2>청소기 = 압력차 흡입</h2>
      <p><span class="dot">●</span> 팬을 돌려 내부 압력을 대기압보다 낮춤</p>
      <p><span class="dot">●</span> 바깥의 높은 압력이 낮은 압력 쪽으로 밀려 들어옴</p>
      <p><span class="dot">●</span> 공기 흐름은 막지 않고, 부분 감압만 발생</p>
    </div>
  </div>
</body></html>
"""

INDUSTRIAL_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#1a1a2e,#16213e); display:flex; align-items:center; justify-content:center; }}
.wrap {{ display:flex; align-items:center; gap:70px; }}
.chamber {{ position:relative; width:280px; height:280px; border:6px solid #6b7690; border-radius:16px; background: radial-gradient(circle, #10142c, #05070f 80%); display:flex; align-items:center; justify-content:center; }}
.dots {{ position:absolute; width:8px; height:8px; background:#8ea6ff; border-radius:50%; opacity:0.5; }}
.pump {{ font-size:60px; }}
.arrow-out {{ position:absolute; right:-90px; top:50%; transform:translateY(-50%); font-size:60px; color:#ff9d8e; }}
.info {{ max-width:480px; }}
.info h2 {{ font-size:38px; color:#ffffff; margin-bottom:24px; }}
.info p {{ font-size:24px; color:#c3c9d6; line-height:1.7; margin-bottom:14px; }}
.dot {{ color:#ff9d8e; }}
</style></head>
<body>
  <div class="wrap">
    <div class="chamber">
      <div class="pump">⚙️</div>
      <div class="arrow-out">→</div>
      <div class="dots" style="top:40px; left:60px;"></div>
      <div class="dots" style="top:200px; left:220px;"></div>
    </div>
    <div class="info">
      <h2>산업용 펌프 = 실제 배기</h2>
      <p><span class="dot">●</span> 밀폐 챔버 안의 기체 분자를 기계적으로 밀어냄</p>
      <p><span class="dot">●</span> 챔버 내부 기체 분자 수 자체를 줄여나감</p>
      <p><span class="dot">●</span> 저진공부터 초고진공까지 도달 가능</p>
    </div>
  </div>
</body></html>
"""

COMPARE_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#1a1a2e,#16213e); display:flex; align-items:center; justify-content:center; }}
.wrap {{ width:1080px; display:flex; flex-direction:column; gap:30px; }}
.title {{ font-size:38px; color:#ffffff; font-weight:700; text-align:center; margin-bottom:6px; }}
.row {{ display:flex; align-items:center; justify-content:center; gap:0; }}
.step {{ background:#22283a; border:1px solid #3a4258; border-radius:16px; padding:26px 30px; width:280px; text-align:center; }}
.step .n {{ font-size:20px; color:#8ea6ff; margin-bottom:8px; }}
.step .t {{ font-size:26px; color:#ffffff; font-weight:600; margin-bottom:6px; }}
.step .d {{ font-size:17px; color:#9aa3b5; }}
.arrow {{ font-size:34px; color:#5a6478; padding:0 20px; }}
.foot {{ font-size:19px; color:#7b8397; text-align:center; margin-top:10px; }}
</style></head>
<body>
  <div class="wrap">
    <div class="title">압력 수준 비교</div>
    <div class="row">
      <div class="step"><div class="n">가정용</div><div class="t">청소기</div><div class="d">대기압 대비 부분 감압</div></div>
      <div class="arrow">≪</div>
      <div class="step"><div class="n">산업용</div><div class="t">저진공~초고진공</div><div class="d">대기압과 비교 불가 수준</div></div>
    </div>
    <div class="foot">같은 "진공"이라는 말을 쓰지만 깊이가 다릅니다</div>
  </div>
</body></html>
"""

SUMMARY_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#1a1a2e,#16213e); display:flex; align-items:center; justify-content:center; }}
.wrap {{ width:1080px; display:flex; flex-direction:column; gap:36px; }}
.title {{ font-size:40px; color:#ffffff; font-weight:700; text-align:center; margin-bottom:10px; }}
.cards {{ display:flex; gap:28px; justify-content:center; }}
.card {{ flex:1; background:#22283a; border-radius:20px; padding:36px 28px; border:1px solid #3a4258; }}
.icon {{ font-size:48px; margin-bottom:18px; }}
.card h2 {{ font-size:28px; color:#ffffff; margin-bottom:14px; }}
.card p {{ font-size:20px; color:#c3c9d6; line-height:1.55; }}
</style></head>
<body>
  <div class="wrap">
    <div class="title">진공청소기 vs 산업용 진공펌프</div>
    <div class="cards">
      <div class="card"><div class="icon">🌀</div><h2>청소기</h2><p>압력차로 흡입<br>부분 감압에 그침</p></div>
      <div class="card"><div class="icon">⚙️</div><h2>산업용 펌프</h2><p>기체 분자 실제 배기<br>저진공~초고진공</p></div>
      <div class="card"><div class="icon">🎯</div><h2>목적</h2><p>먼지 흡입 vs<br>정밀 공정 환경</p></div>
    </div>
  </div>
</body></html>
"""

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()

    page.set_content(THUMBNAIL_HTML)
    page.set_viewport_size({"width": 1080, "height": 1080})
    page.screenshot(path=os.path.join(IMG_DIR, "thumbnail.png"))

    page.set_content(VACUUM_CLEANER_HTML)
    page.set_viewport_size({"width": 1200, "height": 800})
    page.screenshot(path=os.path.join(IMG_DIR, "사진1.png"))

    page.set_content(INDUSTRIAL_HTML)
    page.set_viewport_size({"width": 1200, "height": 800})
    page.screenshot(path=os.path.join(IMG_DIR, "사진2.png"))

    page.set_content(COMPARE_HTML)
    page.set_viewport_size({"width": 1200, "height": 800})
    page.screenshot(path=os.path.join(IMG_DIR, "사진3.png"))

    page.set_content(SUMMARY_HTML)
    page.set_viewport_size({"width": 1200, "height": 800})
    page.screenshot(path=os.path.join(IMG_DIR, "사진4.png"))

    browser.close()

print("done")
