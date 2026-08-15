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
  background: linear-gradient(135deg,#1a1a2e,#16213e);
  display:flex; align-items:center; justify-content:center;
}}
.wrap {{ text-align:center; padding:60px; display:flex; flex-direction:column; gap:104px; align-items:center; }}
.badge {{ font-size:56px; color:#a0aec0; letter-spacing:2px; border:2px solid #4a5568; border-radius:44px; padding:20px 50px; }}
h1 {{ font-size:126px; color:#ffffff; line-height:1.32; font-weight:800; }}
.sub {{ font-size:82px; color:#a0aec0; line-height:1.4; }}
</style></head>
<body>
  <div class="wrap">
    <div class="badge">기술문의</div>
    <h1>진공보온병의<br>열전달 원리</h1>
    <div class="sub">전도 · 대류 · 복사</div>
  </div>
</body></html>
"""

CARD_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#1a1a2e,#16213e); display:flex; align-items:center; justify-content:center; }}
.wrap {{ width:1080px; display:flex; flex-direction:column; gap:36px; }}
.title {{ font-size:40px; color:#ffffff; font-weight:700; text-align:center; margin-bottom:10px; }}
.cards {{ display:flex; gap:28px; justify-content:center; }}
.card {{ flex:1; background:#22283a; border-radius:20px; padding:36px 28px; border:1px solid #3a4258; }}
.icon {{ font-size:48px; margin-bottom:18px; }}
.card h2 {{ font-size:30px; color:#ffffff; margin-bottom:14px; }}
.card p {{ font-size:22px; color:#c3c9d6; line-height:1.55; }}
.foot {{ font-size:20px; color:#7b8397; text-align:center; margin-top:8px; }}
</style></head>
<body>
  <div class="wrap">
    <div class="title">열이 이동하는 3가지 방법</div>
    <div class="cards">
      <div class="card">
        <div class="icon">🔥</div>
        <h2>전도</h2>
        <p>입자끼리 충돌하며<br>에너지 전달</p>
        <p style="margin-top:14px;color:#8ea6ff;">매질 필요 — 진공에서 차단</p>
      </div>
      <div class="card">
        <div class="icon">💨</div>
        <h2>대류</h2>
        <p>유체가 직접 이동하며<br>열을 옮김</p>
        <p style="margin-top:14px;color:#8ea6ff;">매질 필요 — 진공에서 차단</p>
      </div>
      <div class="card">
        <div class="icon">☀️</div>
        <h2>복사</h2>
        <p>전자기파 형태로<br>에너지 방출</p>
        <p style="margin-top:14px;color:#ff9d8e;">매질 불필요 — 진공도 못 막음</p>
      </div>
    </div>
    <div class="foot">진공은 전도·대류만 차단합니다</div>
  </div>
</body></html>
"""

DEWAR_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#1a1a2e,#16213e); display:flex; align-items:center; justify-content:center; }}
.wrap {{ display:flex; align-items:center; gap:70px; }}
.flask {{ position:relative; width:260px; height:480px; }}
.outer {{ position:absolute; inset:0; border:8px solid #6b7690; border-radius:0 0 60px 60px; }}
.vacuum {{ position:absolute; left:16px; right:16px; top:16px; bottom:16px; border:4px dashed #4a5570; border-radius:0 0 48px 48px; }}
.inner {{ position:absolute; left:38px; right:38px; top:38px; bottom:38px; background:linear-gradient(180deg,#ffd27a,#ff9d5c); border-radius:0 0 32px 32px; }}
.mirror {{ position:absolute; left:38px; right:38px; top:38px; bottom:38px; border:3px solid #d9dde6; border-radius:0 0 32px 32px; box-shadow: inset 0 0 20px rgba(255,255,255,0.4); }}
.label {{ position:absolute; font-size:22px; color:#c3c9d6; }}
.l1 {{ top:60px; left:-190px; text-align:right; width:170px; }}
.l2 {{ top:230px; left:-190px; text-align:right; width:170px; }}
.l3 {{ top:400px; left:-190px; text-align:right; width:170px; }}
.info {{ max-width:480px; }}
.info h2 {{ font-size:38px; color:#ffffff; margin-bottom:24px; }}
.info p {{ font-size:24px; color:#c3c9d6; line-height:1.7; margin-bottom:14px; }}
.dot {{ color:#8ea6ff; }}
</style></head>
<body>
  <div class="wrap">
    <div class="flask">
      <div class="label l1">바깥벽</div>
      <div class="label l2">진공층<br>(전도·대류 차단)</div>
      <div class="label l3">반사 코팅<br>(복사 차단)</div>
      <div class="outer"></div>
      <div class="vacuum"></div>
      <div class="inner"></div>
      <div class="mirror"></div>
    </div>
    <div class="info">
      <h2>듀어 플라스크 구조</h2>
      <p><span class="dot">●</span> 이중벽 사이 <b>진공층</b>이 전도·대류를 막습니다</p>
      <p><span class="dot">●</span> 안쪽 벽면 <b>반사 코팅</b>이 복사를 되돌립니다</p>
      <p><span class="dot">●</span> 두 가지가 함께 있어야 완전한 단열입니다</p>
    </div>
  </div>
</body></html>
"""

INDUSTRY_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#1a1a2e,#16213e); display:flex; align-items:center; justify-content:center; }}
.wrap {{ width:1080px; display:flex; flex-direction:column; gap:30px; }}
.title {{ font-size:38px; color:#ffffff; font-weight:700; text-align:center; margin-bottom:6px; }}
.row {{ display:flex; align-items:center; justify-content:center; gap:0; }}
.step {{ background:#22283a; border:1px solid #3a4258; border-radius:16px; padding:26px 30px; width:220px; text-align:center; }}
.step .n {{ font-size:20px; color:#8ea6ff; margin-bottom:8px; }}
.step .t {{ font-size:24px; color:#ffffff; font-weight:600; margin-bottom:6px; }}
.step .d {{ font-size:17px; color:#9aa3b5; }}
.arrow {{ font-size:34px; color:#5a6478; padding:0 14px; }}
.foot {{ font-size:19px; color:#7b8397; text-align:center; margin-top:10px; }}
</style></head>
<body>
  <div class="wrap">
    <div class="title">보온병 진공 vs 산업용 진공</div>
    <div class="row">
      <div class="step"><div class="n">생활</div><div class="t">저진공</div><div class="d">보온 목적 충분</div></div>
      <div class="arrow">→</div>
      <div class="step"><div class="n">산업</div><div class="t">고진공</div><div class="d">반도체·디스플레이</div></div>
      <div class="arrow">→</div>
      <div class="step"><div class="n">정밀공정</div><div class="t">초고진공</div><div class="d">이차전지·연구분석</div></div>
    </div>
    <div class="foot">드라이펌프 · 오일 로터리펌프 · 터보분자펌프가 만드는 정밀 진공</div>
  </div>
</body></html>
"""

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()

    page.set_content(THUMBNAIL_HTML)
    page.set_viewport_size({"width": 1080, "height": 1080})
    page.screenshot(path=os.path.join(IMG_DIR, "thumbnail.png"))

    page.set_content(CARD_HTML)
    page.set_viewport_size({"width": 1200, "height": 800})
    page.screenshot(path=os.path.join(IMG_DIR, "사진1.png"))

    page.set_content(DEWAR_HTML)
    page.set_viewport_size({"width": 1200, "height": 800})
    page.screenshot(path=os.path.join(IMG_DIR, "사진2.png"))

    page.set_content(INDUSTRY_HTML)
    page.set_viewport_size({"width": 1200, "height": 800})
    page.screenshot(path=os.path.join(IMG_DIR, "사진3.png"))

    browser.close()

print("done")
