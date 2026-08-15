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
h1 {{ font-size:100px; color:#ffffff; line-height:1.32; font-weight:800; }}
.sub {{ font-size:70px; color:#a0aec0; line-height:1.4; }}
</style></head>
<body>
  <div class="wrap">
    <div class="badge">기술문의</div>
    <h1>스마트폰 코팅<br>드라이펌프 선택법</h1>
    <div class="sub">GXS · EXS 비교</div>
  </div>
</body></html>
"""

STRUCTURE_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#1a1a2e,#16213e); display:flex; align-items:center; justify-content:center; }}
.wrap {{ display:flex; align-items:center; gap:60px; }}
.diagram {{ position:relative; width:360px; height:460px; background:#22283a; border-radius:20px; border:1px solid #3a4258; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; }}
.box {{ width:280px; padding:16px; border-radius:12px; text-align:center; font-size:20px; color:#ffffff; }}
.inlet {{ background:#4a7a5a; }}
.rotor {{ background:#3a5a8f; }}
.motor {{ background:#3a4258; }}
.outlet {{ background:#8f5a3a; }}
.arrow {{ font-size:24px; color:#8ea6ff; }}
.info {{ max-width:480px; }}
.info h2 {{ font-size:36px; color:#ffffff; margin-bottom:22px; }}
.info p {{ font-size:23px; color:#c3c9d6; line-height:1.7; margin-bottom:12px; }}
</style></head>
<body>
  <div class="wrap">
    <div class="diagram">
      <div class="box inlet">흡입구 (챔버측)</div>
      <div class="arrow">▼</div>
      <div class="box rotor">2단 스크류 로터 (비접촉)</div>
      <div class="arrow">▼</div>
      <div class="box motor">모터 + VFD/컨트롤러</div>
      <div class="arrow">▼</div>
      <div class="box outlet">배기구</div>
    </div>
    <div class="info">
      <h2>드라이 스크류 펌프 구조</h2>
      <p>· 로터끼리 접촉 없이 맞물려 회전 — 오일 불필요</p>
      <p>· 다단 스크류로 압축, 이중 지지축으로 진동 저감</p>
      <p>· 씰 퍼지 구조가 기어박스 오일 유입을 원천 차단</p>
    </div>
  </div>
</body></html>
"""

COMPARE_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#1a1a2e,#16213e); display:flex; align-items:center; justify-content:center; }}
.wrap {{ width:1080px; display:flex; flex-direction:column; gap:34px; }}
.title {{ font-size:40px; color:#ffffff; font-weight:700; text-align:center; }}
.cards {{ display:flex; gap:28px; justify-content:center; }}
.card {{ flex:1; background:#22283a; border-radius:20px; padding:34px 30px; border:1px solid #3a4258; }}
.card h2 {{ font-size:32px; color:#8ea6ff; margin-bottom:16px; }}
.card p {{ font-size:22px; color:#c3c9d6; line-height:1.6; margin-bottom:8px; }}
.foot {{ font-size:20px; color:#7b8397; text-align:center; }}
</style></head>
<body>
  <div class="wrap">
    <div class="title">GXS vs EXS 드라이 스크류 펌프</div>
    <div class="cards">
      <div class="card">
        <h2>GXS</h2>
        <p>· 정교한 온보드 컨트롤러</p>
        <p>· 자동 시작/정지, 파워세이빙</p>
        <p>· 셀프 클리닝 옵션</p>
        <p>· 세밀한 자동 제어에 강점</p>
      </div>
      <div class="card">
        <h2>EXS</h2>
        <p>· VFD 가변주파수드라이브 기본 내장</p>
        <p>· Modbus RTU 통신 표준 지원</p>
        <p>· 설치·운용이 단순</p>
        <p>· 속도 가변 제어에 강점</p>
      </div>
    </div>
    <div class="foot">둘 다 스크류 압축 방식 · 코팅 공정 공식 적용분야</div>
  </div>
</body></html>
"""

SEAL_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#1a1a2e,#16213e); display:flex; align-items:center; justify-content:center; }}
.wrap {{ display:flex; align-items:center; gap:60px; }}
.diagram {{ position:relative; width:360px; height:420px; background:#22283a; border-radius:20px; border:1px solid #3a4258; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:22px; }}
.box {{ width:260px; padding:18px; border-radius:12px; text-align:center; font-size:22px; color:#ffffff; }}
.gear {{ background:#3a4258; }}
.seal {{ background:#3a5a8f; }}
.vac {{ background:#4a7a5a; }}
.arrow {{ font-size:26px; color:#8ea6ff; }}
.info {{ max-width:480px; }}
.info h2 {{ font-size:36px; color:#ffffff; margin-bottom:22px; }}
.info p {{ font-size:23px; color:#c3c9d6; line-height:1.7; margin-bottom:12px; }}
</style></head>
<body>
  <div class="wrap">
    <div class="diagram">
      <div class="box gear">기어박스 (오일)</div>
      <div class="arrow">차단 ▲ 씰 퍼지</div>
      <div class="box seal">비접촉 장수명 씰</div>
      <div class="arrow">▲</div>
      <div class="box vac">진공 공간 (챔버측)</div>
    </div>
    <div class="info">
      <h2>씰 퍼지 구조</h2>
      <p>· 오일이 진공 공간으로 유입되지 않도록 물리적으로 차단</p>
      <p>· 퍼지 가스가 씰 부위 오염 경로를 막음</p>
      <p>· 코팅처럼 오염에 민감한 공정에 적합한 이유</p>
    </div>
  </div>
</body></html>
"""

CHECKLIST_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#1a1a2e,#16213e); display:flex; align-items:center; justify-content:center; }}
.wrap {{ width:1000px; display:flex; flex-direction:column; gap:26px; }}
.title {{ font-size:40px; color:#ffffff; font-weight:700; text-align:center; margin-bottom:10px; }}
.item {{ display:flex; align-items:center; gap:20px; background:#22283a; border:1px solid #3a4258; border-radius:14px; padding:24px 30px; }}
.chk {{ font-size:30px; color:#8ea6ff; }}
.txt {{ font-size:24px; color:#e2e6ee; line-height:1.5; }}
</style></head>
<body>
  <div class="wrap">
    <div class="title">드라이펌프 선택 체크리스트</div>
    <div class="item"><div class="chk">✓</div><div class="txt">코팅막 오일 얼룩·접착 불량 이력이 있다면 드라이 전환 우선 검토</div></div>
    <div class="item"><div class="chk">✓</div><div class="txt">속도 가변 제어·통신망 연동이 필요하면 EXS 계열 검토</div></div>
    <div class="item"><div class="chk">✓</div><div class="txt">세밀한 파워세이빙·자동 제어가 필요하면 GXS 계열 검토</div></div>
    <div class="item"><div class="chk">✓</div><div class="txt">챔버가 작은 부품 코팅이면 드라이 단독 모델부터 검토</div></div>
  </div>
</body></html>
"""

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()

    page.set_content(THUMBNAIL_HTML)
    page.set_viewport_size({"width": 1080, "height": 1080})
    page.screenshot(path=os.path.join(IMG_DIR, "thumbnail.png"))

    page.set_content(STRUCTURE_HTML)
    page.set_viewport_size({"width": 1200, "height": 800})
    page.screenshot(path=os.path.join(IMG_DIR, "사진1.png"))

    page.set_content(COMPARE_HTML)
    page.set_viewport_size({"width": 1200, "height": 800})
    page.screenshot(path=os.path.join(IMG_DIR, "사진2.png"))

    page.set_content(SEAL_HTML)
    page.set_viewport_size({"width": 1200, "height": 800})
    page.screenshot(path=os.path.join(IMG_DIR, "사진3.png"))

    page.set_content(CHECKLIST_HTML)
    page.set_viewport_size({"width": 1200, "height": 800})
    page.screenshot(path=os.path.join(IMG_DIR, "사진4.png"))

    browser.close()

print("done")
