# -*- coding: utf-8 -*-
from playwright.sync_api import sync_playwright
import os

BASE = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(BASE, "images")

FONT_CSS = """
* { font-family: 'Malgun Gothic', 'Pretendard', sans-serif; box-sizing: border-box; margin:0; padding:0; }
"""

THUMBNAIL_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1080px; height:1080px; background: linear-gradient(135deg,#1a1a2e,#16213e); display:flex; align-items:center; justify-content:center; }}
.wrap {{ text-align:center; padding:60px; display:flex; flex-direction:column; gap:100px; align-items:center; }}
.badge {{ font-size:54px; color:#a0aec0; letter-spacing:2px; border:2px solid #4a5568; border-radius:44px; padding:20px 50px; }}
h1 {{ font-size:104px; color:#ffffff; line-height:1.32; font-weight:800; }}
.sub {{ font-size:66px; color:#a0aec0; line-height:1.4; }}
</style></head>
<body>
  <div class="wrap">
    <div class="badge">수리문의</div>
    <h1>진공펌프 냄새로<br>이상 진단하기</h1>
    <div class="sub">탄내 · 오일냄새 · 가스냄새</div>
  </div>
</body></html>
"""

OIL_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#1a1a2e,#16213e); display:flex; align-items:center; justify-content:center; }}
.wrap {{ width:1080px; display:flex; flex-direction:column; gap:34px; }}
.title {{ font-size:38px; color:#ffffff; font-weight:700; text-align:center; }}
.row {{ display:flex; gap:0; align-items:stretch; justify-content:center; }}
.stage {{ background:#22283a; border:1px solid #3a4258; border-radius:16px; padding:26px 22px; width:230px; text-align:center; }}
.stage .t {{ font-size:23px; color:#ffffff; font-weight:600; margin-bottom:10px; }}
.stage .d {{ font-size:17px; color:#9aa3b5; line-height:1.5; }}
.swatch {{ width:60px; height:60px; border-radius:10px; margin:12px auto; }}
.arrow {{ font-size:30px; color:#5a6478; padding:0 10px; display:flex; align-items:center; }}
.foot {{ font-size:19px; color:#7b8397; text-align:center; }}
</style></head>
<body>
  <div class="wrap">
    <div class="title">오일 열화 진행 단계</div>
    <div class="row">
      <div class="stage"><div class="swatch" style="background:#e8c97a;"></div><div class="t">정상</div><div class="d">맑은 황색<br>정상 점도</div></div>
      <div class="arrow">→</div>
      <div class="stage"><div class="swatch" style="background:#b8863f;"></div><div class="t">열화 진행</div><div class="d">색 짙어짐<br>점도 상승</div></div>
      <div class="arrow">→</div>
      <div class="stage"><div class="swatch" style="background:#3a2a1f;"></div><div class="t">열화 심화</div><div class="d">검게 변색<br>끈적임 심함</div></div>
    </div>
    <div class="foot">색·점도 변화가 보이면 교환 주기·냉각계통 점검</div>
  </div>
</body></html>
"""

CHECKLIST_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#1a1a2e,#16213e); display:flex; align-items:center; justify-content:center; }}
.wrap {{ width:1040px; display:flex; flex-direction:column; gap:24px; }}
.title {{ font-size:38px; color:#ffffff; font-weight:700; text-align:center; margin-bottom:6px; }}
.item {{ display:flex; align-items:center; gap:20px; background:#22283a; border:1px solid #3a4258; border-radius:14px; padding:22px 28px; }}
.tag {{ font-size:20px; color:#ffffff; background:#3a5a8f; padding:8px 16px; border-radius:8px; white-space:nowrap; }}
.txt {{ font-size:21px; color:#e2e6ee; line-height:1.5; }}
</style></head>
<body>
  <div class="wrap">
    <div class="title">냄새별 점검 체크리스트</div>
    <div class="item"><div class="tag">탄내</div><div class="txt">즉시 전원 차단 → 오일 점도·색 확인 → 베어링 소음·진동 점검</div></div>
    <div class="item"><div class="tag">오일냄새</div><div class="txt">오일 색·점도 확인 → 냉각수 유량·온도 점검 → 교환 주기 재검토</div></div>
    <div class="item"><div class="tag">가스냄새</div><div class="txt">즉시 환기 → 씰·플랜지 연결부 점검 → 유해가스면 즉시 운전 중단</div></div>
  </div>
</body></html>
"""

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()

    page.set_content(THUMBNAIL_HTML)
    page.set_viewport_size({"width": 1080, "height": 1080})
    page.screenshot(path=os.path.join(IMG_DIR, "thumbnail.png"))

    page.set_content(OIL_HTML)
    page.set_viewport_size({"width": 1200, "height": 800})
    page.screenshot(path=os.path.join(IMG_DIR, "사진2.png"))

    page.set_content(CHECKLIST_HTML)
    page.set_viewport_size({"width": 1200, "height": 800})
    page.screenshot(path=os.path.join(IMG_DIR, "사진4.png"))

    browser.close()

print("done")
