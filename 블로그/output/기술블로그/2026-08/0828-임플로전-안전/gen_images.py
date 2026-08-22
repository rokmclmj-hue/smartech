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
  background: linear-gradient(135deg,#1a0f0f,#2e1a1a);
  display:flex; align-items:center; justify-content:center;
}}
.wrap {{ text-align:center; padding:30px; display:flex; flex-direction:column; gap:170px; align-items:center; }}
.badge {{ font-size:58px; color:#c7a0a0; letter-spacing:2px; border:2px solid #5a4040; border-radius:44px; padding:24px 58px; }}
h1 {{ font-size:82px; color:#ffffff; line-height:1.32; font-weight:800; white-space:nowrap; }}
.sub {{ font-size:80px; color:#ff8e8e; line-height:1.4; }}
</style></head>
<body>
  <div class="wrap">
    <div class="badge">기술문의</div>
    <h1>진공 챔버 임플로전<br>사고와 안전 기준</h1>
    <div class="sub">내파(Implosion)</div>
  </div>
</body></html>
"""

# 사진1 — 임플로전 vs 폭발 압력 방향 비교
COMPARE_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#1a0f0f,#2e1a1a); display:flex; align-items:center; justify-content:center; }}
.wrap {{ width:1080px; display:flex; flex-direction:column; gap:64px; }}
.title {{ font-size:48px; color:#ffffff; font-weight:700; text-align:center; }}
.row {{ display:flex; gap:40px; justify-content:center; }}
.card {{ flex:1; background:#241515; border:1px solid #4a2c2c; border-radius:20px; padding:40px 32px; text-align:center; }}
.card h2 {{ font-size:34px; color:#ffffff; margin-bottom:20px; }}
.card p {{ font-size:24px; color:#c9b3b3; line-height:1.6; }}
.arrowbox {{ font-size:56px; margin:20px 0; }}
.out {{ color:#ff8e8e; }}
.in {{ color:#8ea6ff; }}
.foot {{ font-size:23px; color:#9a8080; text-align:center; }}
</style></head>
<body>
  <div class="wrap">
    <div class="title">임플로전 vs 폭발 — 압력 방향</div>
    <div class="row">
      <div class="card">
        <h2>폭발 (Explosion)</h2>
        <div class="arrowbox out">⇦ ⇨</div>
        <p>내부 압력 &gt; 외부<br>안에서 밖으로 터짐</p>
      </div>
      <div class="card">
        <h2>임플로전 (Implosion)</h2>
        <div class="arrowbox in">⇨ ⇦</div>
        <p>내부 압력 &lt; 외부<br>밖에서 안으로 붕괴</p>
      </div>
    </div>
    <div class="foot">진공 용기는 대기압이 사방에서 안쪽으로 균일하게 작용합니다</div>
  </div>
</body></html>
"""

# 사진2 — 유리 데시케이터 점검 포인트
CHECK_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#1a0f0f,#2e1a1a); display:flex; align-items:center; justify-content:center; }}
.wrap {{ width:1080px; display:flex; flex-direction:column; gap:56px; }}
.title {{ font-size:48px; color:#ffffff; font-weight:700; text-align:center; }}
.list {{ display:flex; flex-direction:column; gap:26px; }}
.item {{ display:flex; align-items:center; gap:24px; background:#241515; border:1px solid #4a2c2c; border-radius:16px; padding:28px 34px; }}
.mark {{ font-size:34px; color:#8ee6a0; }}
.txt {{ font-size:27px; color:#e8dcdc; }}
</style></head>
<body>
  <div class="wrap">
    <div class="title">유리 데시케이터 진공 사용 전 점검</div>
    <div class="list">
      <div class="item"><span class="mark">✓</span><span class="txt">붕규산(파이렉스급) 유리인지 확인</span></div>
      <div class="item"><span class="mark">✓</span><span class="txt">스크래치·칩·크랙 육안 점검</span></div>
      <div class="item"><span class="mark">✓</span><span class="txt">진공 걸린 채로 절대 들거나 옮기지 않기</span></div>
    </div>
  </div>
</body></html>
"""

# 사진3 — 격자 테이프 보호 + 차폐 구성
PROTECT_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#1a0f0f,#2e1a1a); display:flex; align-items:center; justify-content:center; }}
.wrap {{ width:1080px; display:flex; flex-direction:column; gap:60px; }}
.title {{ font-size:48px; color:#ffffff; font-weight:700; text-align:center; }}
.row {{ display:flex; gap:28px; justify-content:center; }}
.card {{ flex:1; background:#241515; border:1px solid #4a2c2c; border-radius:20px; padding:40px 30px; text-align:center; }}
.icon {{ font-size:52px; margin-bottom:20px; }}
.card h2 {{ font-size:29px; color:#ffffff; margin-bottom:14px; }}
.card p {{ font-size:22px; color:#c9b3b3; line-height:1.55; }}
</style></head>
<body>
  <div class="wrap">
    <div class="title">보호 처리와 안전 차폐</div>
    <div class="row">
      <div class="card"><div class="icon">🧵</div><h2>격자 테이프</h2><p>250mL 이상 유리 용기<br>테이프·네팅으로 감싸기</p></div>
      <div class="card"><div class="icon">🥽</div><h2>차폐 장비</h2><p>보안경 + 페이스실드<br>블라스트 실드</p></div>
      <div class="card"><div class="icon">🔧</div><h2>릴리프 장치</h2><p>승압 시 급격한<br>압력 변화 방지</p></div>
    </div>
  </div>
</body></html>
"""

# 사진4 — 산업용 챔버 뷰포트 취약 부위
CHAMBER_HTML = f"""
<html><head><style>
{FONT_CSS}
body {{ width:1200px; height:800px; background: linear-gradient(135deg,#1a0f0f,#2e1a1a); display:flex; align-items:center; justify-content:center; }}
.wrap {{ display:flex; align-items:center; gap:70px; }}
.chamber {{ position:relative; width:420px; height:340px; border-radius:24px; border:8px solid #6b7690; background:#10142c; }}
.viewport {{ position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:150px; height:150px; border-radius:50%; border:6px solid #ff8e8e; background: radial-gradient(circle, #2a1a1a, #10142c); }}
.label {{ position:absolute; bottom:-46px; left:50%; transform:translateX(-50%); font-size:20px; color:#ff8e8e; white-space:nowrap; }}
.info {{ max-width:480px; }}
.info h2 {{ font-size:44px; color:#ffffff; margin-bottom:26px; }}
.info p {{ font-size:26px; color:#c9b3b3; line-height:1.75; margin-bottom:20px; }}
.dot {{ color:#ff8e8e; }}
</style></head>
<body>
  <div class="wrap">
    <div class="chamber">
      <div class="viewport"></div>
      <div class="label">뷰포트(취약 부위)</div>
    </div>
    <div class="info">
      <h2>산업용 챔버 취약점</h2>
      <p><span class="dot">●</span> 챔버 벽은 두꺼워 강도 확보</p>
      <p><span class="dot">●</span> 관측용 뷰포트·대면적 도어는 얇고 넓어 취약</p>
      <p><span class="dot">●</span> 검증된 설계 + 정기 점검이 원칙</p>
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

    page.set_content(COMPARE_HTML)
    page.set_viewport_size({"width": 1200, "height": 800})
    page.screenshot(path=os.path.join(IMG_DIR, "사진1.png"))

    page.set_content(CHECK_HTML)
    page.set_viewport_size({"width": 1200, "height": 800})
    page.screenshot(path=os.path.join(IMG_DIR, "사진2.png"))

    page.set_content(PROTECT_HTML)
    page.set_viewport_size({"width": 1200, "height": 800})
    page.screenshot(path=os.path.join(IMG_DIR, "사진3.png"))

    page.set_content(CHAMBER_HTML)
    page.set_viewport_size({"width": 1200, "height": 800})
    page.screenshot(path=os.path.join(IMG_DIR, "사진4.png"))

    browser.close()

print("done")
