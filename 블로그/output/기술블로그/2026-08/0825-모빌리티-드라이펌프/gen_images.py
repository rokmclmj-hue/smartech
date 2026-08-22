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
body {{ width:1080px; height:1080px; background: linear-gradient(135deg,#101828,#1e2a3a); display:flex; align-items:center; justify-content:center; }}
.wrap {{ text-align:center; padding:60px; display:flex; flex-direction:column; gap:90px; align-items:center; }}
.badge {{ font-size:46px; color:#a0aec0; letter-spacing:2px; border:2px solid #4a5568; border-radius:44px; padding:18px 46px; }}
h1 {{ font-size:96px; color:#ffffff; line-height:1.32; font-weight:800; }}
.sub {{ font-size:64px; color:#7ee0c0; line-height:1.4; }}
</style></head>
<body>
  <div class="wrap">
    <div class="badge">기술문의</div>
    <h1>전기차 배터리 팩·모터<br>진공은 어디에 쓰일까</h1>
    <div class="sub">팩 리크 테스트 · 모터 함침</div>
  </div>
</body></html>
"""

LEAK_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#101828,#1e2a3a); display:flex; align-items:center; justify-content:center; }}
.wrap {{ width:1080px; display:flex; flex-direction:column; gap:30px; }}
.title {{ font-size:38px; color:#ffffff; font-weight:700; text-align:center; margin-bottom:6px; }}
.row {{ display:flex; align-items:center; justify-content:center; gap:0; }}
.step {{ background:#1a2436; border:1px solid #33465c; border-radius:16px; padding:24px 26px; width:250px; text-align:center; }}
.step .n {{ font-size:19px; color:#7ee0c0; margin-bottom:8px; }}
.step .t {{ font-size:24px; color:#ffffff; font-weight:600; margin-bottom:6px; }}
.step .d {{ font-size:16px; color:#9aa3b5; }}
.arrow {{ font-size:32px; color:#5a6478; padding:0 12px; }}
.foot {{ font-size:19px; color:#7b8397; text-align:center; margin-top:10px; }}
</style></head>
<body>
  <div class="wrap">
    <div class="title">배터리 팩 헬륨 리크 테스트</div>
    <div class="row">
      <div class="step"><div class="n">1</div><div class="t">진공 챔버</div><div class="d">팩을 챔버에 넣고 배기</div></div>
      <div class="arrow">→</div>
      <div class="step"><div class="n">2</div><div class="t">헬륨 주입</div><div class="d">팩 내부에 헬륨 충전</div></div>
      <div class="arrow">→</div>
      <div class="step"><div class="n">3</div><div class="t">리크디텍터</div><div class="d">누설 헬륨 신호 검출</div></div>
    </div>
    <div class="foot">진공법 · 스니퍼법으로 미세 누설까지 정밀 검출</div>
  </div>
</body></html>
"""

VPI_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#101828,#1e2a3a); display:flex; align-items:center; justify-content:center; }}
.wrap {{ width:1080px; display:flex; flex-direction:column; gap:30px; }}
.title {{ font-size:38px; color:#ffffff; font-weight:700; text-align:center; margin-bottom:6px; }}
.row {{ display:flex; align-items:center; justify-content:center; gap:0; }}
.step {{ background:#1a2436; border:1px solid #33465c; border-radius:16px; padding:24px 26px; width:250px; text-align:center; }}
.step .n {{ font-size:19px; color:#7ee0c0; margin-bottom:8px; }}
.step .t {{ font-size:24px; color:#ffffff; font-weight:600; margin-bottom:6px; }}
.step .d {{ font-size:16px; color:#9aa3b5; }}
.arrow {{ font-size:32px; color:#5a6478; padding:0 12px; }}
.foot {{ font-size:19px; color:#7b8397; text-align:center; margin-top:10px; }}
</style></head>
<body>
  <div class="wrap">
    <div class="title">e-모터 권선 진공함침(VPI)</div>
    <div class="row">
      <div class="step"><div class="n">1</div><div class="t">진공 배기</div><div class="d">권선 공극의 공기 제거</div></div>
      <div class="arrow">→</div>
      <div class="step"><div class="n">2</div><div class="t">바니시 주입</div><div class="d">공극에 절연 수지 침투</div></div>
      <div class="arrow">→</div>
      <div class="step"><div class="n">3</div><div class="t">경화</div><div class="d">절연·방열 성능 확보</div></div>
    </div>
    <div class="foot">공기를 먼저 비워야 바니시가 구석구석 스며듭니다</div>
  </div>
</body></html>
"""

COMPARE_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#101828,#1e2a3a); display:flex; align-items:center; justify-content:center; }}
.wrap {{ width:1080px; display:flex; flex-direction:column; gap:36px; }}
.title {{ font-size:40px; color:#ffffff; font-weight:700; text-align:center; margin-bottom:10px; }}
.cards {{ display:flex; gap:28px; justify-content:center; }}
.card {{ flex:1; background:#1a2436; border-radius:20px; padding:32px 26px; border:1px solid #33465c; }}
.card h2 {{ font-size:28px; color:#ffffff; margin-bottom:14px; }}
.card p {{ font-size:20px; color:#c3c9d6; line-height:1.55; }}
.tag {{ margin-top:14px; color:#7ee0c0; font-size:18px; }}
</style></head>
<body>
  <div class="wrap">
    <div class="title">공정별 진공 선정 기준</div>
    <div class="cards">
      <div class="card"><h2>셀 공정</h2><p>전해액·용제 노출<br>화학 반응 예민</p><div class="tag">기준: 내화학성</div></div>
      <div class="card"><h2>팩 리크 테스트</h2><p>미세 누설 검출<br>기밀 신뢰도</p><div class="tag">기준: 검출 감도</div></div>
      <div class="card"><h2>모터 함침</h2><p>권선 공극 배기<br>바니시 침투</p><div class="tag">기준: 도달 진공도</div></div>
    </div>
  </div>
</body></html>
"""

SUMMARY_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#101828,#1e2a3a); display:flex; align-items:center; justify-content:center; }}
.wrap {{ width:1080px; display:flex; flex-direction:column; gap:30px; }}
.title {{ font-size:38px; color:#ffffff; font-weight:700; text-align:center; margin-bottom:6px; }}
.row {{ display:flex; align-items:center; justify-content:center; gap:0; }}
.step {{ background:#1a2436; border:1px solid #33465c; border-radius:16px; padding:22px 20px; width:220px; text-align:center; }}
.step .n {{ font-size:18px; color:#7ee0c0; margin-bottom:6px; }}
.step .t {{ font-size:22px; color:#ffffff; font-weight:600; margin-bottom:6px; }}
.step .d {{ font-size:16px; color:#9aa3b5; }}
.arrow {{ font-size:30px; color:#5a6478; padding:0 10px; }}
.foot {{ font-size:19px; color:#7b8397; text-align:center; margin-top:10px; }}
</style></head>
<body>
  <div class="wrap">
    <div class="title">전기차 생산라인, 진공이 쓰이는 3지점</div>
    <div class="row">
      <div class="step"><div class="n">지점 1</div><div class="t">셀 내부</div><div class="d">전해액 디개싱</div></div>
      <div class="arrow">→</div>
      <div class="step"><div class="n">지점 2</div><div class="t">배터리 팩</div><div class="d">헬륨 리크 테스트</div></div>
      <div class="arrow">→</div>
      <div class="step"><div class="n">지점 3</div><div class="t">e-모터</div><div class="d">권선 진공함침</div></div>
    </div>
    <div class="foot">공정 단계를 먼저 정하면 펌프 선정이 명확해집니다</div>
  </div>
</body></html>
"""

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()

    page.set_content(THUMBNAIL_HTML)
    page.set_viewport_size({"width": 1080, "height": 1080})
    page.screenshot(path=os.path.join(IMG_DIR, "thumbnail.png"))

    page.set_content(LEAK_HTML)
    page.set_viewport_size({"width": 1200, "height": 800})
    page.screenshot(path=os.path.join(IMG_DIR, "사진1.png"))

    page.set_content(VPI_HTML)
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
