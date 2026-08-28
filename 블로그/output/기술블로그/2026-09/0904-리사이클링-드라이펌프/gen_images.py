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
body {{ width:1080px; height:1080px; background: linear-gradient(135deg,#1e2a1a,#2d3d24); display:flex; align-items:center; justify-content:center; }}
.wrap {{ text-align:center; padding:60px; display:flex; flex-direction:column; gap:64px; align-items:center; }}
.badge {{ font-size:42px; color:#a8b89a; letter-spacing:2px; border:2px solid #566b48; border-radius:44px; padding:16px 42px; }}
h1 {{ font-size:84px; color:#ffffff; line-height:1.32; font-weight:800; }}
.sub {{ font-size:60px; color:#c9e07a; line-height:1.4; }}
</style></head>
<body>
  <div class="wrap">
    <div class="badge">기술문의</div>
    <h1>재활용 공정<br>드라이펌프 선택</h1>
    <div class="sub">부식성 가스 대응 조건</div>
  </div>
</body></html>
"""

SLUG_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#1e2a1a,#2d3d24); display:flex; align-items:center; justify-content:center; }}
.wrap {{ display:flex; align-items:center; gap:70px; }}
.icon {{ position:relative; width:280px; height:280px; border:6px solid #6b8060; border-radius:16px; background: radial-gradient(circle, #263420, #10160c 80%); display:flex; align-items:center; justify-content:center; font-size:70px; }}
.info {{ max-width:480px; }}
.info h2 {{ font-size:34px; color:#ffffff; margin-bottom:24px; }}
.info p {{ font-size:22px; color:#c9d4c0; line-height:1.7; margin-bottom:14px; }}
.dot {{ color:#c9e07a; }}
</style></head>
<body>
  <div class="wrap">
    <div class="icon">💧🧱</div>
    <div class="info">
      <h2>슬러그 처리 테스트</h2>
      <p><span class="dot">●</span> 물 슬러그 5리터 처리 검증</p>
      <p><span class="dot">●</span> 분말 슬러그 1kg 처리 검증</p>
      <p><span class="dot">●</span> 양단 지지 로터로 진동 최소화</p>
    </div>
  </div>
</body></html>
"""

PURGE_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#1e2a1a,#2d3d24); display:flex; align-items:center; justify-content:center; }}
.wrap {{ width:1080px; display:flex; flex-direction:column; gap:30px; }}
.title {{ font-size:38px; color:#ffffff; font-weight:700; text-align:center; margin-bottom:6px; }}
.row {{ display:flex; align-items:center; justify-content:center; gap:22px; }}
.step {{ background:#263420; border:1px solid #445934; border-radius:16px; padding:22px 18px; width:230px; text-align:center; }}
.step .t {{ font-size:21px; color:#ffffff; font-weight:600; margin-bottom:8px; }}
.step .d {{ font-size:15px; color:#a8b89a; }}
.foot {{ font-size:19px; color:#8ea081; text-align:center; margin-top:10px; }}
</style></head>
<body>
  <div class="wrap">
    <div class="title">퍼지 구성 3단계</div>
    <div class="row">
      <div class="step"><div class="t">라이트 듀티</div><div class="d">씰 퍼지만</div></div>
      <div class="step"><div class="t">미디엄 듀티</div><div class="d">인렛+가스발라스트</div></div>
      <div class="step"><div class="t">미디엄 듀티+</div><div class="d">고유량 퍼지+솔벤트 플러시</div></div>
    </div>
    <div class="foot">부식성·응축성 배기 예상 시 미디엄 듀티+ 권장</div>
  </div>
</body></html>
"""

GAS_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#1e2a1a,#2d3d24); display:flex; align-items:center; justify-content:center; }}
.wrap {{ width:1080px; display:flex; flex-direction:column; gap:36px; }}
.title {{ font-size:40px; color:#ffffff; font-weight:700; text-align:center; margin-bottom:10px; }}
.cards {{ display:flex; gap:24px; justify-content:center; }}
.card {{ flex:1; background:#263420; border-radius:20px; padding:28px 22px; border:1px solid #445934; }}
.card h2 {{ font-size:23px; color:#ffffff; margin-bottom:12px; }}
.card p {{ font-size:18px; color:#c9d4c0; line-height:1.6; }}
</style></head>
<body>
  <div class="wrap">
    <div class="title">재활용 공정 배기가스 구성 예시</div>
    <div class="cards">
      <div class="card"><h2>부식성 성분</h2><p>불균질 원료에서<br>발생 가능</p></div>
      <div class="card"><h2>미세 분진</h2><p>파쇄·분해 과정에서<br>혼입</p></div>
      <div class="card"><h2>응축성 유기물</h2><p>가열·정제 과정에서<br>증발·혼입</p></div>
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

    page.set_content(SLUG_HTML)
    page.set_viewport_size({"width": 1200, "height": 800})
    page.screenshot(path=os.path.join(IMG_DIR, "사진1.png"))

    page.set_content(PURGE_HTML)
    page.set_viewport_size({"width": 1200, "height": 800})
    page.screenshot(path=os.path.join(IMG_DIR, "사진2.png"))

    page.set_content(GAS_HTML)
    page.set_viewport_size({"width": 1200, "height": 800})
    page.screenshot(path=os.path.join(IMG_DIR, "사진3.png"))

    browser.close()

print("done")
