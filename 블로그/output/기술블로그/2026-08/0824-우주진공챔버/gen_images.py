# -*- coding: utf-8 -*-
from playwright.sync_api import sync_playwright
import os

BASE = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(BASE, "images")

FONT_CSS = """
@font-face {
  font-family: 'Pretendard';
  src: local('Malgun Gothic');
}
* { font-family: 'Pretendard', 'Malgun Gothic', sans-serif; box-sizing: border-box; margin:0; padding:0; }
"""

THUMBNAIL_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{
  width:1080px; height:1080px;
  background: linear-gradient(135deg,#0b0f2e,#1a1a2e);
  display:flex; align-items:center; justify-content:center;
}}
.wrap {{ text-align:center; padding:30px; display:flex; flex-direction:column; gap:170px; align-items:center; }}
.badge {{ font-size:58px; color:#a0aec0; letter-spacing:2px; border:2px solid #4a5568; border-radius:44px; padding:24px 58px; }}
h1 {{ font-size:88px; color:#ffffff; line-height:1.32; font-weight:800; white-space:nowrap; }}
.sub {{ font-size:88px; color:#8ea6ff; line-height:1.4; }}
</style></head>
<body>
  <div class="wrap">
    <div class="badge">기술문의</div>
    <h1>우주 진공을 지상에서<br>재현하는 법</h1>
    <div class="sub">열진공챔버(TVAC)</div>
  </div>
</body></html>
"""

# 사진1 — 진공챔버 내부 개념도 (구형 챔버 + 시험체)
CHAMBER_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#0b0f2e,#1a1a2e); display:flex; align-items:center; justify-content:center; }}
.wrap {{ display:flex; align-items:center; gap:70px; }}
.chamber {{ position:relative; width:520px; height:520px; border-radius:50%; border:8px solid #6b7690; background: radial-gradient(circle at 35% 30%, #10142c, #05070f 75%); }}
.sat {{ position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:150px; height:94px; background:#c3c9d6; border-radius:6px; }}
.wing {{ position:absolute; top:50%; left:50%; width:300px; height:18px; background:#8ea6ff; transform:translate(-50%,-50%); }}
.stars {{ position:absolute; width:8px; height:8px; background:#ffffff; border-radius:50%; opacity:0.7; }}
.info {{ max-width:500px; }}
.info h2 {{ font-size:50px; color:#ffffff; margin-bottom:32px; }}
.info p {{ font-size:29px; color:#c3c9d6; line-height:1.8; margin-bottom:22px; }}
.dot {{ color:#8ea6ff; }}
</style></head>
<body>
  <div class="wrap">
    <div class="chamber">
      <div class="wing"></div>
      <div class="sat"></div>
      <div class="stars" style="top:40px; left:60px;"></div>
      <div class="stars" style="top:90px; left:280px;"></div>
      <div class="stars" style="top:280px; left:50px;"></div>
      <div class="stars" style="top:300px; left:300px;"></div>
    </div>
    <div class="info">
      <h2>진공챔버 내부 개념</h2>
      <p><span class="dot">●</span> 밀폐된 구형·원통형 챔버 안에 시험체를 배치</p>
      <p><span class="dot">●</span> 저진공부터 초고진공(UHV)까지 임무 조건에 맞춰 배기</p>
      <p><span class="dot">●</span> 대기 분자를 최대한 제거해 우주 궤도 압력을 재현</p>
    </div>
  </div>
</body></html>
"""

# 사진2 — 열실드/냉각 구성 (온도 비교 카드)
THERMAL_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#0b0f2e,#1a1a2e); display:flex; align-items:center; justify-content:center; }}
.wrap {{ width:1080px; display:flex; flex-direction:column; gap:44px; }}
.title {{ font-size:48px; color:#ffffff; font-weight:700; text-align:center; margin-bottom:10px; }}
.cards {{ display:flex; gap:28px; justify-content:center; }}
.card {{ flex:1; background:#151a36; border-radius:20px; padding:44px 32px; border:1px solid #2c3454; }}
.icon {{ font-size:56px; margin-bottom:22px; }}
.card h2 {{ font-size:36px; color:#ffffff; margin-bottom:16px; }}
.card p {{ font-size:26px; color:#c3c9d6; line-height:1.6; }}
.foot {{ font-size:23px; color:#7b8397; text-align:center; margin-top:10px; }}
</style></head>
<body>
  <div class="wrap">
    <div class="title">위성이 궤도에서 겪는 온도차</div>
    <div class="cards">
      <div class="card">
        <div class="icon">🌑</div>
        <h2>그늘</h2>
        <p>영하 80도 이하까지<br>급격히 냉각</p>
        <p style="margin-top:14px;color:#8ea6ff;">극저온 냉각 시스템으로 재현</p>
      </div>
      <div class="card">
        <div class="icon">☀️</div>
        <h2>태양광</h2>
        <p>영상 180도까지<br>가열</p>
        <p style="margin-top:14px;color:#ff9d8e;">챔버 가열 기술로 재현</p>
      </div>
      <div class="card">
        <div class="icon">🔄</div>
        <h2>반복</h2>
        <p>궤도 1회전마다<br>온도차 반복</p>
        <p style="margin-top:14px;color:#c3c9d6;">열순환(thermal cycling) 시험</p>
      </div>
    </div>
    <div class="foot">열실드 + 진동시험 지그로 열·기계 조건 동시 검증</div>
  </div>
</body></html>
"""

# 사진3 — 크라이오펌프 흡착 원리 다이어그램
CRYO_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#0b0f2e,#1a1a2e); display:flex; align-items:center; justify-content:center; }}
.wrap {{ width:1080px; display:flex; flex-direction:column; gap:64px; }}
.title {{ font-size:50px; color:#ffffff; font-weight:700; text-align:center; margin-bottom:6px; }}
.row {{ display:flex; align-items:center; justify-content:center; gap:0; }}
.step {{ background:#151a36; border:1px solid #2c3454; border-radius:16px; padding:44px 40px; width:290px; text-align:center; }}
.step .n {{ font-size:26px; color:#8ea6ff; margin-bottom:12px; }}
.step .t {{ font-size:30px; color:#ffffff; font-weight:600; margin-bottom:10px; }}
.step .d {{ font-size:21px; color:#9aa3b5; }}
.arrow {{ font-size:40px; color:#5a6478; padding:0 14px; }}
.foot {{ font-size:24px; color:#7b8397; text-align:center; margin-top:14px; }}
</style></head>
<body>
  <div class="wrap">
    <div class="title">크라이오펌프는 어떻게 진공을 만드나</div>
    <div class="row">
      <div class="step"><div class="n">1</div><div class="t">극저온 표면</div><div class="d">펌프 내부를 극저온으로 냉각</div></div>
      <div class="arrow">→</div>
      <div class="step"><div class="n">2</div><div class="t">기체 흡착</div><div class="d">기체 분자가 표면에 얼어붙음</div></div>
      <div class="arrow">→</div>
      <div class="step"><div class="n">3</div><div class="t">초고진공</div><div class="d">오염 없이 UHV 도달</div></div>
    </div>
    <div class="foot">기계적으로 밀어내는 오일·드라이펌프와는 원리가 다릅니다</div>
  </div>
</body></html>
"""

# 사진4 — TVAC 전체 시스템 구성도 (단계별 펌프)
SYSTEM_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#0b0f2e,#1a1a2e); display:flex; align-items:center; justify-content:center; }}
.wrap {{ width:1080px; display:flex; flex-direction:column; gap:64px; }}
.title {{ font-size:50px; color:#ffffff; font-weight:700; text-align:center; margin-bottom:6px; }}
.row {{ display:flex; align-items:center; justify-content:center; gap:0; }}
.step {{ background:#151a36; border:1px solid #2c3454; border-radius:16px; padding:38px 32px; width:260px; text-align:center; }}
.step .n {{ font-size:24px; color:#8ea6ff; margin-bottom:10px; }}
.step .t {{ font-size:28px; color:#ffffff; font-weight:600; margin-bottom:10px; }}
.step .d {{ font-size:20px; color:#9aa3b5; }}
.arrow {{ font-size:36px; color:#5a6478; padding:0 10px; }}
.foot {{ font-size:24px; color:#7b8397; text-align:center; margin-top:14px; }}
</style></head>
<body>
  <div class="wrap">
    <div class="title">TVAC 챔버 배기 단계</div>
    <div class="row">
      <div class="step"><div class="n">1단계</div><div class="t">러핑펌프</div><div class="d">대기압 → 저진공</div></div>
      <div class="arrow">→</div>
      <div class="step"><div class="n">2단계</div><div class="t">터보펌프</div><div class="d">저진공 → 고진공</div></div>
      <div class="arrow">→</div>
      <div class="step"><div class="n">3단계</div><div class="t">크라이오·이온펌프</div><div class="d">고진공 → 초고진공</div></div>
    </div>
    <div class="foot">진공게이지 · RGA · 헬륨 리크디텍터가 전 구간을 모니터링</div>
  </div>
</body></html>
"""

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()

    page.set_content(THUMBNAIL_HTML)
    page.set_viewport_size({"width": 1080, "height": 1080})
    page.screenshot(path=os.path.join(IMG_DIR, "thumbnail.png"))

    page.set_content(CHAMBER_HTML)
    page.set_viewport_size({"width": 1200, "height": 800})
    page.screenshot(path=os.path.join(IMG_DIR, "사진1.png"))

    page.set_content(THERMAL_HTML)
    page.set_viewport_size({"width": 1200, "height": 800})
    page.screenshot(path=os.path.join(IMG_DIR, "사진2.png"))

    page.set_content(CRYO_HTML)
    page.set_viewport_size({"width": 1200, "height": 800})
    page.screenshot(path=os.path.join(IMG_DIR, "사진3.png"))

    page.set_content(SYSTEM_HTML)
    page.set_viewport_size({"width": 1200, "height": 800})
    page.screenshot(path=os.path.join(IMG_DIR, "사진4.png"))

    browser.close()

print("done")
