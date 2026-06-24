import asyncio
from playwright.async_api import async_playwright
import os

OUTPUT_DIR = r"C:\Users\rokmc\smartech\블로그\output\가스 발라스트\images"

# ─────────────────────────────────────────────
# 1. thumbnail.png  (1080×1080)
# ─────────────────────────────────────────────
THUMBNAIL_HTML = """<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width:1080px; height:1080px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
    display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
    overflow:hidden;
    position:relative;
  }
  .badge {
    background: rgba(255,100,60,0.18);
    border: 1.5px solid rgba(255,100,60,0.5);
    color: #ff6440;
    font-size:28px; font-weight:700;
    padding:10px 28px; border-radius:50px;
    letter-spacing:2px;
    margin-bottom:40px;
  }
  .title {
    color:#ffffff;
    font-size:72px; font-weight:900;
    line-height:1.15;
    text-align:center;
    max-width:860px;
    margin-bottom:32px;
  }
  .title .accent { color:#4fc3f7; }
  .sub {
    color:#a0aec0;
    font-size:32px;
    text-align:center;
    max-width:740px;
    line-height:1.5;
  }
  /* 배경 장식 */
  .circle1 {
    position:absolute; bottom:-120px; right:-80px;
    width:480px; height:480px;
    border-radius:50%;
    border:2px solid rgba(79,195,247,0.12);
  }
  .circle2 {
    position:absolute; top:-80px; left:-60px;
    width:320px; height:320px;
    border-radius:50%;
    border:2px solid rgba(255,100,64,0.10);
  }
  .line {
    position:absolute; bottom:120px; left:60px;
    width:200px; height:2px;
    background: linear-gradient(90deg, rgba(79,195,247,0.5), transparent);
  }
  .dot-grid {
    position:absolute; top:60px; right:80px;
    display:grid; grid-template-columns:repeat(5,1fr); gap:12px;
  }
  .dot-grid span {
    display:block; width:6px; height:6px;
    border-radius:50%; background:rgba(255,255,255,0.1);
  }
  .company {
    position:absolute; bottom:60px;
    color:rgba(255,255,255,0.35);
    font-size:22px; letter-spacing:3px;
  }
</style>
</head>
<body>
  <div class="circle1"></div>
  <div class="circle2"></div>
  <div class="line"></div>
  <div class="dot-grid">
    <span></span><span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span><span></span><span></span>
    <span></span><span></span><span></span><span></span><span></span>
  </div>
  <div class="badge">가스 발라스트</div>
  <div class="title">열어야 할 때<br>vs <span class="accent">닫아야 할 때</span></div>
  <div class="sub">에드워드 로터리 베인 펌프<br>3가지 판단 기준</div>
  <div class="company">SMARTECH VACUUM</div>
</body>
</html>"""

# ─────────────────────────────────────────────
# 2. image-01.png — 가스 발라스트 밸브 포지션 0·I·II 설명 다이어그램
# ─────────────────────────────────────────────
IMG01_HTML = """<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width:1200px; height:630px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    font-family: 'Malgun Gothic','Apple SD Gothic Neo',sans-serif;
    display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    padding:48px 60px;
  }
  h2 {
    color:#4fc3f7; font-size:32px; font-weight:800;
    margin-bottom:40px; letter-spacing:1px;
  }
  .cards {
    display:flex; gap:32px; width:100%;
  }
  .card {
    flex:1; border-radius:16px;
    padding:32px 28px;
    border: 1.5px solid;
    display:flex; flex-direction:column; align-items:center; gap:18px;
  }
  .card.pos0 { background:rgba(239,83,80,0.08); border-color:rgba(239,83,80,0.35); }
  .card.pos1 { background:rgba(79,195,247,0.08); border-color:rgba(79,195,247,0.35); }
  .card.pos2 { background:rgba(102,187,106,0.08); border-color:rgba(102,187,106,0.35); }
  .pos-badge {
    font-size:52px; font-weight:900;
    width:80px; height:80px;
    border-radius:50%;
    display:flex; align-items:center; justify-content:center;
  }
  .pos0 .pos-badge { background:rgba(239,83,80,0.2); color:#ef5350; }
  .pos1 .pos-badge { background:rgba(79,195,247,0.2); color:#4fc3f7; }
  .pos2 .pos-badge { background:rgba(102,187,106,0.2); color:#66bb6a; }
  .pos-name { font-size:22px; font-weight:700; color:#ffffff; }
  .pos-desc { font-size:16px; color:#b0bec5; text-align:center; line-height:1.6; }
  .pos-tag {
    font-size:14px; font-weight:700; padding:6px 16px; border-radius:20px;
    margin-top:4px;
  }
  .pos0 .pos-tag { background:rgba(239,83,80,0.25); color:#ef9a9a; }
  .pos1 .pos-tag { background:rgba(79,195,247,0.25); color:#80deea; }
  .pos2 .pos-tag { background:rgba(102,187,106,0.25); color:#a5d6a7; }
</style>
</head>
<body>
  <h2>에드워드 가스 발라스트 밸브 — 포지션 가이드</h2>
  <div class="cards">
    <div class="card pos0">
      <div class="pos-badge">0</div>
      <div class="pos-name">포지션 0 (닫힘)</div>
      <div class="pos-desc">완전히 닫힌 상태<br>외부 기체 유입 없음<br>고진공 운전 시 사용</div>
      <div class="pos-tag">최저 압력 달성</div>
    </div>
    <div class="card pos1">
      <div class="pos-badge">I</div>
      <div class="pos-name">포지션 I (저유량 개방)</div>
      <div class="pos-desc">소량의 건조 기체 유입<br>수분이 적당량 있을 때<br>일반 공정 초기에 사용</div>
      <div class="pos-tag">일반 퍼지 모드</div>
    </div>
    <div class="card pos2">
      <div class="pos-badge">II</div>
      <div class="pos-name">포지션 II (고유량 개방)</div>
      <div class="pos-desc">포지션 I의 약 2배 유량<br>수분 多·워밍업 초기<br>최대 퍼지 필요 시</div>
      <div class="pos-tag">강력 퍼지 모드</div>
    </div>
  </div>
</body>
</html>"""

# ─────────────────────────────────────────────
# 3. image-02.png — 오일 에멀젼 상태 비교 카드
# ─────────────────────────────────────────────
IMG02_HTML = """<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width:1200px; height:630px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    font-family: 'Malgun Gothic','Apple SD Gothic Neo',sans-serif;
    display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    padding:48px 80px;
  }
  h2 { color:#4fc3f7; font-size:30px; font-weight:800; margin-bottom:36px; }
  .compare {
    display:flex; gap:0; width:100%; border-radius:16px; overflow:hidden;
  }
  .panel {
    flex:1; padding:36px 36px;
    display:flex; flex-direction:column; align-items:center; gap:20px;
  }
  .panel.good { background:rgba(79,195,247,0.10); border-right:1px solid rgba(255,255,255,0.08); }
  .panel.bad  { background:rgba(239,83,80,0.10); }
  .oil-icon {
    width:80px; height:80px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-size:38px;
  }
  .good .oil-icon { background:rgba(79,195,247,0.2); }
  .bad  .oil-icon { background:rgba(239,83,80,0.2); }
  .panel-title { font-size:24px; font-weight:800; }
  .good .panel-title { color:#4fc3f7; }
  .bad  .panel-title { color:#ef5350; }
  .oil-visual {
    width:120px; height:60px; border-radius:10px;
    display:flex; align-items:center; justify-content:center;
    font-size:13px; font-weight:700; letter-spacing:1px;
  }
  .good .oil-visual {
    background:linear-gradient(135deg,#b8860b,#daa520);
    color:#fff8dc; border:2px solid rgba(218,165,32,0.5);
  }
  .bad .oil-visual {
    background:linear-gradient(135deg,#9e9e9e,#bdbdbd);
    color:#fff; border:2px solid rgba(200,200,200,0.5);
  }
  ul { list-style:none; }
  ul li {
    font-size:16px; color:#b0bec5;
    padding:5px 0; line-height:1.5;
  }
  ul li::before { content:"• "; }
  .good ul li::before { color:#4fc3f7; }
  .bad  ul li::before { color:#ef5350; }
  .status {
    margin-top:4px; font-size:14px; font-weight:700;
    padding:6px 18px; border-radius:20px;
  }
  .good .status { background:rgba(79,195,247,0.25); color:#80deea; }
  .bad  .status { background:rgba(239,83,80,0.25); color:#ef9a9a; }
  .divider {
    width:2px; background:rgba(255,255,255,0.08);
  }
</style>
</head>
<body>
  <h2>진공펌프 오일 상태 비교 — 정상 vs 에멀젼</h2>
  <div class="compare">
    <div class="panel good">
      <div class="oil-icon">🟡</div>
      <div class="panel-title">정상 오일</div>
      <div class="oil-visual">투명한 황금색</div>
      <ul>
        <li>맑고 투명한 황금빛 색상</li>
        <li>거품 없이 깨끗한 상태</li>
        <li>윤활 기능 정상 유지</li>
        <li>적정 점도 유지</li>
      </ul>
      <div class="status">정상 운전 가능</div>
    </div>
    <div class="divider"></div>
    <div class="panel bad">
      <div class="oil-icon">🌫</div>
      <div class="panel-title">에멀젼 오일</div>
      <div class="oil-visual">뿌연 회백색</div>
      <ul>
        <li>뿌옇게 변한 우유빛 색상</li>
        <li>거품·기포 발생</li>
        <li>수분 혼입으로 윤활 저하</li>
        <li>방치 시 펌프 고착 위험</li>
      </ul>
      <div class="status">즉시 교체 필요</div>
    </div>
  </div>
</body>
</html>"""

# ─────────────────────────────────────────────
# 4. image-03.png — 발라스트 열고/닫는 시점 다이어그램 (단계별)
# ─────────────────────────────────────────────
IMG03_HTML = """<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width:1200px; height:630px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    font-family: 'Malgun Gothic','Apple SD Gothic Neo',sans-serif;
    display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    padding:40px 60px;
  }
  h2 { color:#4fc3f7; font-size:30px; font-weight:800; margin-bottom:32px; }
  .timeline {
    display:flex; align-items:center; gap:0; width:100%;
  }
  .step {
    flex:1; display:flex; flex-direction:column; align-items:center; gap:12px;
    position:relative;
  }
  .step-num {
    width:52px; height:52px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-size:22px; font-weight:900; z-index:2;
  }
  .open .step-num  { background:#4fc3f7; color:#1a1a2e; }
  .close .step-num { background:#ef5350; color:#fff; }
  .open-badge, .close-badge {
    font-size:13px; font-weight:800; padding:4px 14px;
    border-radius:20px; letter-spacing:1px;
  }
  .open-badge  { background:rgba(79,195,247,0.25); color:#80deea; }
  .close-badge { background:rgba(239,83,80,0.25);  color:#ef9a9a; }
  .step-title { font-size:17px; font-weight:800; color:#fff; text-align:center; }
  .step-desc  { font-size:14px; color:#90a4ae; text-align:center; line-height:1.5; }
  .arrow {
    width:48px; display:flex; align-items:center; justify-content:center;
    font-size:24px; color:rgba(255,255,255,0.2);
    flex-shrink:0; margin-bottom:28px;
  }
</style>
</head>
<body>
  <h2>가스 발라스트 운용 타이밍 — 공정 흐름</h2>
  <div class="timeline">
    <div class="step open">
      <div class="step-num">1</div>
      <div class="open-badge">열기</div>
      <div class="step-title">펌프 시작<br>워밍업</div>
      <div class="step-desc">발라스트 열고<br>30분+ 공회전<br>내부 온도 ↑</div>
    </div>
    <div class="arrow">→</div>
    <div class="step open">
      <div class="step-num">2</div>
      <div class="open-badge">열기</div>
      <div class="step-title">수분/증기<br>공정 초기</div>
      <div class="step-desc">건조·베이킹·<br>용제 증기 공정<br>시작 전 개방</div>
    </div>
    <div class="arrow">→</div>
    <div class="step close">
      <div class="step-num">3</div>
      <div class="close-badge">닫기</div>
      <div class="step-title">압력<br>1~2 Torr↓</div>
      <div class="step-desc">증기 배출 완료<br>고진공 단계<br>밸브 잠금</div>
    </div>
    <div class="arrow">→</div>
    <div class="step open">
      <div class="step-num">4</div>
      <div class="open-badge">열기</div>
      <div class="step-title">공정 종료<br>퍼지</div>
      <div class="step-desc">발라스트 열고<br>잔류 응축수<br>제거 후 종료</div>
    </div>
    <div class="arrow">→</div>
    <div class="step close">
      <div class="step-num">5</div>
      <div class="close-badge">닫기</div>
      <div class="step-title">퍼지 완료<br>전원 OFF</div>
      <div class="step-desc">밸브 잠그고<br>펌프 정지</div>
    </div>
  </div>
</body>
</html>"""

# ─────────────────────────────────────────────
# 5. image-04.png — N2 어댑터 vs 일반 가스 발라스트 비교
# ─────────────────────────────────────────────
IMG04_HTML = """<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width:1200px; height:630px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    font-family: 'Malgun Gothic','Apple SD Gothic Neo',sans-serif;
    display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    padding:44px 80px;
  }
  h2 { color:#4fc3f7; font-size:30px; font-weight:800; margin-bottom:32px; }
  .compare { display:flex; gap:40px; width:100%; }
  .card {
    flex:1; border-radius:16px; padding:32px 36px;
    display:flex; flex-direction:column; gap:16px;
  }
  .card.std { background:rgba(79,195,247,0.08); border:1.5px solid rgba(79,195,247,0.3); }
  .card.n2  { background:rgba(255,183,77,0.08);  border:1.5px solid rgba(255,183,77,0.3); }
  .card-header { display:flex; align-items:center; gap:16px; }
  .icon {
    width:56px; height:56px; border-radius:12px;
    display:flex; align-items:center; justify-content:center; font-size:28px;
  }
  .std .icon { background:rgba(79,195,247,0.18); }
  .n2  .icon { background:rgba(255,183,77,0.18); }
  .card-title { font-size:22px; font-weight:800; }
  .std .card-title { color:#4fc3f7; }
  .n2  .card-title { color:#ffb74d; }
  .divider-h { height:1px; background:rgba(255,255,255,0.08); }
  ul { list-style:none; display:flex; flex-direction:column; gap:8px; }
  ul li { font-size:15px; color:#b0bec5; line-height:1.5; }
  ul li strong { color:#ffffff; }
  .warn {
    background:rgba(239,83,80,0.15); border:1px solid rgba(239,83,80,0.4);
    border-radius:10px; padding:12px 16px;
    font-size:14px; color:#ef9a9a; line-height:1.5;
  }
  .warn strong { color:#ef5350; }
</style>
</head>
<body>
  <h2>가스 발라스트 타입 비교 — 일반 vs N2 어댑터</h2>
  <div class="compare">
    <div class="card std">
      <div class="card-header">
        <div class="icon">🔵</div>
        <div class="card-title">일반 가스 발라스트 밸브</div>
      </div>
      <div class="divider-h"></div>
      <ul>
        <li><strong>포지션 0</strong> → 완전 잠금, 기체 유입 없음</li>
        <li><strong>포지션 I</strong> → 저유량 공기 유입</li>
        <li><strong>포지션 II</strong> → 고유량 공기 유입 (I의 2배)</li>
        <li>에드워드 RV·E2M 시리즈 기본 장착</li>
      </ul>
    </div>
    <div class="card n2">
      <div class="card-header">
        <div class="icon">🟡</div>
        <div class="card-title">N₂ 가스 발라스트 어댑터</div>
      </div>
      <div class="divider-h"></div>
      <ul>
        <li><strong>포지션 0 상태</strong>에서 중앙 포트로 N₂ 공급</li>
        <li>외관상 일반 발라스트와 유사</li>
        <li>반도체·FPD 공정 등 청정 환경에 적합</li>
        <li>질소 공급 라인 연결 필요</li>
      </ul>
      <div class="warn">
        <strong>⚠ 주의:</strong> N₂ 어댑터를 포지션 I·II로 돌리면<br>
        공기까지 유입 → 진공 누설 발생
      </div>
    </div>
  </div>
</body>
</html>"""

async def capture(playwright, html_content, output_path, width, height):
    browser = await playwright.chromium.launch()
    page = await browser.new_page(viewport={"width": width, "height": height})
    await page.set_content(html_content)
    await page.wait_for_timeout(300)
    await page.screenshot(path=output_path, full_page=False)
    await browser.close()
    print(f"  저장: {output_path}")

async def main():
    async with async_playwright() as pw:
        tasks = [
            (THUMBNAIL_HTML, os.path.join(OUTPUT_DIR, "thumbnail.png"),    1080, 1080),
            (IMG01_HTML,     os.path.join(OUTPUT_DIR, "image-01.png"),     1200, 630),
            (IMG02_HTML,     os.path.join(OUTPUT_DIR, "image-02.png"),     1200, 630),
            (IMG03_HTML,     os.path.join(OUTPUT_DIR, "image-03.png"),     1200, 630),
            (IMG04_HTML,     os.path.join(OUTPUT_DIR, "image-04.png"),     1200, 630),
        ]
        for html, path, w, h in tasks:
            await capture(pw, html, path, w, h)

asyncio.run(main())
print("완료!")
