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
.wrap {{ text-align:center; padding:40px; display:flex; flex-direction:column; gap:130px; align-items:center; }}
.badge {{ font-size:60px; color:#a0aec0; letter-spacing:2px; border:2px solid #4a5568; border-radius:44px; padding:32px 64px; }}
h1 {{ font-size:118px; color:#ffffff; line-height:1.3; font-weight:800; }}
.sub {{ font-size:54px; color:#ffca7a; line-height:1.4; }}
</style></head>
<body>
  <div class="wrap">
    <div class="badge">기술문의</div>
    <h1>진공 열처리로<br>백킹펌프 선택</h1>
    <div class="sub">오일로터리 vs 드라이 스크류</div>
  </div>
</body></html>
"""

DIAGRAM_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1300px; }}
.wrap {{ width:1200px; background: linear-gradient(135deg,#1a1a2e,#16213e); padding:44px; display:flex; flex-direction:column; gap:28px; }}
.title {{ font-size:38px; color:#ffffff; font-weight:700; text-align:center; }}
.row {{ display:flex; align-items:center; justify-content:center; gap:0; }}
.step {{ background:#22263a; border:1px solid #3d4258; border-radius:16px; padding:24px 20px; width:230px; text-align:center; }}
.step .n {{ font-size:18px; color:#ffca7a; margin-bottom:8px; }}
.step .t {{ font-size:23px; color:#ffffff; font-weight:600; margin-bottom:6px; }}
.step .d {{ font-size:16px; color:#9aa3b5; }}
.arrow {{ font-size:30px; color:#5a6478; padding:0 10px; }}
.foot {{ font-size:19px; color:#7b8397; text-align:center; }}
</style></head>
<body>
  <div class="wrap">
    <div class="title">진공 열처리로 배기 계통 구성</div>
    <div class="row">
      <div class="step"><div class="n">1</div><div class="t">챔버(로)</div><div class="d">열처리·소결·브레이징</div></div>
      <div class="arrow">→</div>
      <div class="step"><div class="n">2</div><div class="t">부스터(EH)</div><div class="d">배기속도 증대</div></div>
      <div class="arrow">→</div>
      <div class="step"><div class="n">3</div><div class="t">백킹펌프</div><div class="d">오일로터리 or 드라이</div></div>
    </div>
    <div class="foot">백킹펌프 선택에 따라 수분·분진 대응력이 달라집니다</div>
  </div>
</body></html>
"""

GASBALLAST_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1300px; }}
.wrap {{ width:1200px; background: linear-gradient(135deg,#1a1a2e,#16213e); padding:52px 48px; display:flex; align-items:center; gap:70px; }}
.chamber {{ position:relative; width:280px; height:280px; border:6px solid #6b7690; border-radius:16px; background: radial-gradient(circle, #22263a, #0d1626 80%); display:flex; align-items:center; justify-content:center; flex-shrink:0; }}
.gauge {{ font-size:60px; }}
.info {{ max-width:480px; }}
.info h2 {{ font-size:34px; color:#ffffff; margin-bottom:22px; }}
.info p {{ font-size:22px; color:#c3c9d6; line-height:1.7; margin-bottom:14px; }}
.dot {{ color:#ffca7a; }}
</style></head>
<body>
  <div class="wrap">
    <div class="chamber">
      <div class="gauge">💧</div>
    </div>
    <div class="info">
      <h2>가스발라스트 수증기 처리</h2>
      <p><span class="dot">●</span> 수증기를 압축 전에 밀어내는 구조</p>
      <p><span class="dot">●</span> 기종별 처리 용량(g/h)에 한계 있음</p>
      <p><span class="dot">●</span> 용량 초과 시 오일 유화 → 궁극압력 저하</p>
    </div>
  </div>
</body></html>
"""

CONFIG_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1300px; }}
.wrap {{ width:1200px; background: linear-gradient(135deg,#1a1a2e,#16213e); padding:44px; display:flex; flex-direction:column; gap:32px; }}
.title {{ font-size:40px; color:#ffffff; font-weight:700; text-align:center; }}
.cards {{ display:flex; gap:28px; justify-content:center; }}
.card {{ flex:1; background:#22263a; border-radius:20px; padding:32px 28px; border:1px solid #3d4258; }}
.card h2 {{ font-size:27px; color:#ffffff; margin-bottom:14px; }}
.card p {{ font-size:20px; color:#c3c9d6; line-height:1.6; }}
.tag {{ margin-top:16px; color:#ffca7a; font-size:18px; }}
</style></head>
<body>
  <div class="wrap">
    <div class="title">백킹펌프 선택 기준</div>
    <div class="cards">
      <div class="card"><h2>오일로터리(E2M)</h2><p>낮은 가동률·제한된 예산<br>수분·분진 부하 적을 때</p><div class="tag">초기비용 유리</div></div>
      <div class="card"><h2>드라이 스크류(GXS)</h2><p>연속 가동·고분진 소결<br>수분·고온 부하 클 때</p><div class="tag">내구성 우선</div></div>
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

    page.set_content(DIAGRAM_HTML)
    page.set_viewport_size({"width": 1300, "height": 1400})
    page.locator(".wrap").screenshot(path=os.path.join(IMG_DIR, "사진1.png"))

    page.set_content(GASBALLAST_HTML)
    page.set_viewport_size({"width": 1300, "height": 1400})
    page.locator(".wrap").screenshot(path=os.path.join(IMG_DIR, "사진2.png"))

    page.set_content(CONFIG_HTML)
    page.set_viewport_size({"width": 1300, "height": 1400})
    page.locator(".wrap").screenshot(path=os.path.join(IMG_DIR, "사진3.png"))

    browser.close()

print("done")
