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
body {{ width:1080px; height:1080px; background: linear-gradient(135deg,#241a2e,#2e1f3e); display:flex; align-items:center; justify-content:center; }}
.wrap {{ text-align:center; padding:60px; display:flex; flex-direction:column; gap:64px; align-items:center; }}
.badge {{ font-size:42px; color:#b8a0c9; letter-spacing:2px; border:2px solid #6b4a8a; border-radius:44px; padding:16px 42px; }}
h1 {{ font-size:82px; color:#ffffff; line-height:1.32; font-weight:800; }}
.sub {{ font-size:58px; color:#e0a7ff; line-height:1.4; }}
</style></head>
<body>
  <div class="wrap">
    <div class="badge">기술문의</div>
    <h1>리튬 1차전지 건조<br>드라이펌프 전환</h1>
    <div class="sub">전해질 용제 대응</div>
  </div>
</body></html>
"""

PATH_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#241a2e,#2e1f3e); display:flex; align-items:center; justify-content:center; }}
.wrap {{ width:1080px; display:flex; flex-direction:column; gap:30px; }}
.title {{ font-size:36px; color:#ffffff; font-weight:700; text-align:center; margin-bottom:6px; }}
.row {{ display:flex; align-items:center; justify-content:center; gap:0; }}
.step {{ background:#33244a; border:1px solid #5a3f78; border-radius:16px; padding:22px 18px; width:220px; text-align:center; }}
.step .t {{ font-size:21px; color:#ffffff; font-weight:600; margin-bottom:6px; }}
.step .d {{ font-size:15px; color:#b8a0c9; }}
.arrow {{ font-size:28px; color:#6b5480; padding:0 8px; }}
.foot {{ font-size:19px; color:#9880ad; text-align:center; margin-top:10px; }}
</style></head>
<body>
  <div class="wrap">
    <div class="title">전해질 용제 증기 유입 경로</div>
    <div class="row">
      <div class="step"><div class="t">챔버(건조)</div><div class="d">전해질 용제 증기 발생</div></div>
      <div class="arrow">→</div>
      <div class="step"><div class="t">배기 라인</div><div class="d">필터 3개월 한계</div></div>
      <div class="arrow">→</div>
      <div class="step"><div class="t">펌프</div><div class="d">씰·부품 마모·부식</div></div>
    </div>
    <div class="foot">장기간 누적 노출이 핵심 문제입니다</div>
  </div>
</body></html>
"""

DRYPUMP_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#241a2e,#2e1f3e); display:flex; align-items:center; justify-content:center; }}
.wrap {{ display:flex; align-items:center; gap:70px; }}
.icon {{ position:relative; width:280px; height:280px; border:6px solid #6b4a8a; border-radius:16px; background: radial-gradient(circle, #33244a, #180f24 80%); display:flex; align-items:center; justify-content:center; font-size:70px; }}
.info {{ max-width:480px; }}
.info h2 {{ font-size:34px; color:#ffffff; margin-bottom:24px; }}
.info p {{ font-size:22px; color:#d2c3e0; line-height:1.7; margin-bottom:14px; }}
.dot {{ color:#e0a7ff; }}
</style></head>
<body>
  <div class="wrap">
    <div class="icon">⚙️</div>
    <div class="info">
      <h2>무급유 드라이펌프 구조</h2>
      <p><span class="dot">●</span> 오일 없어 오일 오염 경로 자체가 없음</p>
      <p><span class="dot">●</span> 단, 씰·재질 부식은 별도 사양 확인 필요</p>
      <p><span class="dot">●</span> 리튬이온 건조 공정 공식 적용 사례</p>
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

    page.set_content(PATH_HTML)
    page.set_viewport_size({"width": 1200, "height": 800})
    page.screenshot(path=os.path.join(IMG_DIR, "사진1.png"))

    page.set_content(DRYPUMP_HTML)
    page.set_viewport_size({"width": 1200, "height": 800})
    page.screenshot(path=os.path.join(IMG_DIR, "사진2.png"))

    browser.close()

print("done")
