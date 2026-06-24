# -*- coding: utf-8 -*-
"""
진공펌프-루츠부스터-조합 블로그 이미지 재생성
- image-01 ~ image-04 푸터 제거
- image-04 화살표 레이블 위치 수정 (아래→위)
- image-02 비교표 형태로 변경
"""

from playwright.sync_api import sync_playwright
import os

OUT_DIR = r"C:\Users\rokmc\smartech\블로그\output\진공펌프-루츠부스터-조합\images"

# ─────────────────────────────────────────────
# image-01: 루츠 부스터 작동 원리 3단계
# ─────────────────────────────────────────────
HTML_01 = """<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 600px;
    background: #ffffff;
    font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
    display: flex; flex-direction: column;
  }
  .header {
    background: #1a3a6b;
    color: white;
    text-align: center;
    padding: 22px 0;
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }
  .content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    padding: 30px 50px;
  }
  .step-box {
    flex: 1;
    border: 2.5px solid;
    border-radius: 12px;
    padding: 24px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    position: relative;
    background: #fff;
    height: 300px;
    justify-content: flex-start;
  }
  .step-box.red  { border-color: #c00020; }
  .step-box.blue { border-color: #1a3a6b; }
  .step-box.green { border-color: #1a6b3a; }
  .step-num {
    width: 44px; height: 44px;
    border-radius: 50%;
    color: white;
    font-size: 22px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 8px;
  }
  .num-red   { background: #c00020; }
  .num-blue  { background: #1a3a6b; }
  .num-green { background: #1a6b3a; }
  .step-label {
    font-size: 13px; font-weight: 700;
    letter-spacing: 1px;
    margin-bottom: 10px;
  }
  .label-red   { color: #c00020; }
  .label-blue  { color: #1a3a6b; }
  .label-green { color: #1a6b3a; }
  .step-title {
    font-size: 22px; font-weight: 700;
    color: #111;
    margin-bottom: 14px;
    line-height: 1.3;
  }
  .step-desc {
    font-size: 15px;
    color: #444;
    line-height: 2;
  }
  .arrow {
    font-size: 30px;
    color: #aaa;
    margin: 0 10px;
    flex-shrink: 0;
    padding-top: 120px;
  }
  .footer-bar {
    background: #1a3a6b;
    color: white;
    text-align: center;
    padding: 16px 30px;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.5;
  }
</style>
</head>
<body>
  <div class="header">루츠 부스터 작동 원리</div>
  <div class="content">
    <div class="step-box red">
      <div class="step-num num-red">1</div>
      <div class="step-label label-red">STEP 1</div>
      <div class="step-title">배후 펌프 기동</div>
      <div style="width:60px;height:1px;background:#eee;margin:0 auto 12px;"></div>
      <div class="step-desc">드라이펌프/로터리펌프가<br>대기압→100 mbar로<br>기초 배기</div>
    </div>
    <div class="arrow">&#9658;</div>
    <div class="step-box blue">
      <div class="step-num num-blue">2</div>
      <div class="step-label label-blue">STEP 2</div>
      <div class="step-title">루츠 부스터 ON</div>
      <div style="width:60px;height:1px;background:#eee;margin:0 auto 12px;"></div>
      <div class="step-desc">8자형 로터 2개 회전<br>접촉 없이 기체 전송<br>배기속도 2~8배 향상</div>
    </div>
    <div class="arrow">&#9658;</div>
    <div class="step-box green">
      <div class="step-num num-green">3</div>
      <div class="step-label label-green">STEP 3</div>
      <div class="step-title">목표 진공 달성</div>
      <div style="width:60px;height:1px;background:#eee;margin:0 auto 12px;"></div>
      <div class="step-desc">0.001 mbar 구간까지<br>드라이펌프 단독 대비<br>10배 낮은 압력 가능</div>
    </div>
  </div>
  <div class="footer-bar">
    핵심: 배후 펌프 먼저 → 압력 낮아지면 루츠 부스터 투입 → 고진공 달성
  </div>
</body>
</html>"""

# ─────────────────────────────────────────────
# image-02: 드라이펌프 단독 vs 부스터 조합 비교표
# ─────────────────────────────────────────────
HTML_02 = """<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 500px;
    background: #ffffff;
    font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
    display: flex; flex-direction: column;
  }
  .header {
    background: #1a3a6b;
    color: white;
    text-align: center;
    padding: 20px 0;
    font-size: 26px;
    font-weight: 700;
  }
  .table-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    padding: 24px 50px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 15px;
  }
  th, td {
    padding: 14px 18px;
    text-align: center;
    border: 1px solid #e0ddd8;
  }
  thead th {
    background: #1a3a6b;
    color: white;
    font-size: 16px;
    font-weight: 700;
  }
  thead th:first-child {
    background: #f6f4ef;
    color: #333;
  }
  tbody tr:nth-child(odd) { background: #f9f8f5; }
  tbody tr:nth-child(even) { background: #ffffff; }
  .item-col {
    font-weight: 700;
    color: #1a3a6b;
    text-align: left;
    background: #eef1f8 !important;
    width: 200px;
  }
  .good { color: #c00020; font-weight: 700; }
  .normal { color: #555; }
</style>
</head>
<body>
  <div class="header">드라이펌프 단독 vs 루츠 부스터 조합 비교</div>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>비교 항목</th>
          <th>드라이펌프 단독</th>
          <th>루츠 부스터 조합</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="item-col">배기 속도</td>
          <td class="normal">기준 (1배)</td>
          <td class="good">최대 7배 향상</td>
        </tr>
        <tr>
          <td class="item-col">도달 진공도</td>
          <td class="normal">~0.01 mbar</td>
          <td class="good">0.001 mbar 이하</td>
        </tr>
        <tr>
          <td class="item-col">배기 시간</td>
          <td class="normal">길다</td>
          <td class="good">최대 70% 단축</td>
        </tr>
        <tr>
          <td class="item-col">적합 환경</td>
          <td class="normal">소형 챔버 / 저真空</td>
          <td class="good">대형 챔버 / 고진공 공정</td>
        </tr>
        <tr>
          <td class="item-col">비용</td>
          <td class="normal">초기비용 낮음</td>
          <td class="normal">초기비용 높으나 생산성 우위</td>
        </tr>
      </tbody>
    </table>
  </div>
</body>
</html>"""

# ─────────────────────────────────────────────
# image-03: Edwards EH 시리즈 사양 카드
# ─────────────────────────────────────────────
HTML_03 = """<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 400px;
    background: #ffffff;
    font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
    display: flex; flex-direction: column;
  }
  .header {
    background: #1a3a6b;
    color: white;
    text-align: center;
    padding: 18px 0;
    font-size: 26px;
    font-weight: 700;
  }
  .cards {
    flex: 1;
    display: flex;
    align-items: stretch;
    padding: 20px 30px;
    gap: 16px;
  }
  .card {
    flex: 1;
    border-radius: 10px;
    padding: 18px 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 6px;
  }
  .card.blue { border: 2px solid #1a3a6b; }
  .card.red  { border: 2px solid #c00020; }
  .card-model {
    font-size: 20px; font-weight: 700;
    padding: 8px 0 4px;
  }
  .card.blue .card-model { color: #1a3a6b; }
  .card.red  .card-model { color: #c00020; }
  .divider { width: 50px; height: 1px; background: #e0ddd8; margin: 4px 0; }
  .label { font-size: 12px; color: #888; }
  .value { font-size: 16px; font-weight: 700; color: #111; }
  .cool { font-size: 15px; font-weight: 700; }
  .card.blue .cool { color: #1a3a6b; }
  .card.red  .cool { color: #c00020; }
  .bottom-bar {
    background: #111;
    color: #fff;
    text-align: center;
    padding: 12px 0;
    font-size: 14px;
    font-weight: 600;
  }
  .bottom-bar span { font-size: 12px; font-weight: 400; color: #ccc; margin-left: 10px; }
</style>
</head>
<body>
  <div class="header">Edwards EH 부스터 시리즈</div>
  <div class="cards">
    <div class="card blue">
      <div class="card-model">EH250</div>
      <div class="divider"></div>
      <div class="label">배기속도</div>
      <div class="value">310 m³/h</div>
      <div class="divider"></div>
      <div class="label">냉각</div>
      <div class="cool">공냉</div>
    </div>
    <div class="card blue">
      <div class="card-model">EH500</div>
      <div class="divider"></div>
      <div class="label">배기속도</div>
      <div class="value">505 m³/h</div>
      <div class="divider"></div>
      <div class="label">냉각</div>
      <div class="cool">공냉</div>
    </div>
    <div class="card red">
      <div class="card-model">EH1200</div>
      <div class="divider"></div>
      <div class="label">배기속도</div>
      <div class="value">1,195 m³/h</div>
      <div class="divider"></div>
      <div class="label">냉각</div>
      <div class="cool">수냉</div>
    </div>
    <div class="card red">
      <div class="card-model">EH2600</div>
      <div class="divider"></div>
      <div class="label">배기속도</div>
      <div class="value">2,590 m³/h</div>
      <div class="divider"></div>
      <div class="label">냉각</div>
      <div class="cool">수냉</div>
    </div>
    <div class="card red">
      <div class="card-model">EH4200</div>
      <div class="divider"></div>
      <div class="label">배기속도</div>
      <div class="value">4,140 m³/h</div>
      <div class="divider"></div>
      <div class="label">냉각</div>
      <div class="cool">수냉</div>
    </div>
  </div>
  <div class="bottom-bar">
    선정 기준: 배후 펌프 배기속도의 2~8배 수준으로 EH 모델 선택
    <span>예) GXS250(250 m³/h) → EH500(505 m³/h) 조합 권장</span>
  </div>
</body>
</html>"""

# ─────────────────────────────────────────────
# image-04: GXS+EH 조합 시스템 구성 (레이블 화살표 위로)
# ─────────────────────────────────────────────
HTML_04 = """<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 700px;
    background: #0d1b3e;
    font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .header {
    text-align: center;
    padding: 26px 0 0;
    font-size: 28px;
    font-weight: 700;
  }

  /* ── 플로우 영역: 상단 row(레이블+화살표) + 하단 row(박스) ── */
  .flow-container {
    padding: 0 40px;
  }

  /* 레이블+화살표 행 */
  .label-row {
    display: flex;
    align-items: center;
    height: 30px;
    margin-bottom: 0;
  }
  /* 박스 행 */
  .box-row {
    display: flex;
    align-items: center;
  }

  /* 박스 자리와 화살표 자리를 동일한 비율로 배치 */
  .box-slot {
    flex: 3;        /* 박스 너비 비율 */
    min-width: 0;
  }
  .arrow-slot {
    flex: 1;        /* 화살표 너비 비율 */
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* 레이블 행에서 박스 위치와 화살표 위치를 box-row와 동일하게 맞춤 */
  .label-box-spacer {
    flex: 3;  /* box-slot과 같은 비율 */
  }
  .label-arrow-slot {
    flex: 1;  /* arrow-slot과 같은 비율 */
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .arrow-label {
    font-size: 12px;
    color: rgba(255,255,255,0.80);
    font-weight: 700;
    white-space: nowrap;
    text-align: center;
  }

  /* 화살표 선 */
  .arrow-line {
    display: flex;
    align-items: center;
    width: 100%;
  }
  .arrow-shaft {
    flex: 1;
    height: 2px;
    background: rgba(255,255,255,0.40);
  }
  .arrow-head {
    font-size: 16px;
    color: rgba(255,255,255,0.60);
    line-height: 1;
    margin-left: -3px;
  }

  .box {
    border-radius: 10px;
    padding: 20px 14px;
    text-align: center;
    width: 100%;
  }
  .box-chamber { background: #1e3a70; border: 2px solid #4a7fcb; }
  .box-roots   { background: #8b0019; border: 2px solid #e04060; }
  .box-dry     { background: #1a4080; border: 2px solid #5090d0; }
  .box-exhaust { background: #1a5c30; border: 2px solid #3aac60; }
  .box-title { font-size: 18px; font-weight: 700; line-height: 1.3; }
  .box-sub   { font-size: 13px; color: rgba(255,255,255,0.75); margin-top: 5px; }

  /* ── 정보 카드 4개 ── */
  .info-cards {
    display: flex;
    gap: 14px;
    padding: 0 40px;
    margin-bottom: 16px;
  }
  .info-card {
    flex: 1;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 8px;
    padding: 20px 10px;
    text-align: center;
  }
  .info-label { font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 9px; }
  .info-value { font-size: 18px; font-weight: 700; color: #fff; }

  /* ── 기준 박스 3개 ── */
  .criteria {
    display: flex;
    gap: 14px;
    padding: 0 40px 28px;
  }
  .crit-box {
    flex: 1;
    border: 1.5px solid #c00020;
    border-radius: 8px;
    padding: 18px 12px;
    text-align: center;
  }
  .crit-title { font-size: 13px; font-weight: 700; color: #e04060; margin-bottom: 10px; }
  .crit-desc  { font-size: 14px; color: rgba(255,255,255,0.85); line-height: 1.7; }
</style>
</head>
<body>
  <div class="header">GXS + EH 조합 시스템 구성</div>

  <div class="flow-container">
    <!-- 레이블 행: 화살표 위에 텍스트 -->
    <div class="label-row">
      <div class="label-box-spacer"></div>
      <div class="label-arrow-slot"><span class="arrow-label">기체 흡입</span></div>
      <div class="label-box-spacer"></div>
      <div class="label-arrow-slot"><span class="arrow-label">배기속도 증폭</span></div>
      <div class="label-box-spacer"></div>
      <div class="label-arrow-slot"><span class="arrow-label">최종 배기</span></div>
      <div class="label-box-spacer"></div>
    </div>

    <!-- 박스+화살표 행 -->
    <div class="box-row">
      <div class="box-slot">
        <div class="box box-chamber">
          <div class="box-title">진공 챔버</div>
          <div class="box-sub">Chamber</div>
        </div>
      </div>
      <div class="arrow-slot">
        <div class="arrow-line">
          <div class="arrow-shaft"></div>
          <div class="arrow-head">&#9654;</div>
        </div>
      </div>
      <div class="box-slot">
        <div class="box box-roots">
          <div class="box-title">루츠 부스터</div>
          <div class="box-sub">EH500</div>
        </div>
      </div>
      <div class="arrow-slot">
        <div class="arrow-line">
          <div class="arrow-shaft"></div>
          <div class="arrow-head">&#9654;</div>
        </div>
      </div>
      <div class="box-slot">
        <div class="box box-dry">
          <div class="box-title">드라이펌프</div>
          <div class="box-sub">GXS250</div>
        </div>
      </div>
      <div class="arrow-slot">
        <div class="arrow-line">
          <div class="arrow-shaft"></div>
          <div class="arrow-head">&#9654;</div>
        </div>
      </div>
      <div class="box-slot">
        <div class="box box-exhaust">
          <div class="box-title">배기</div>
          <div class="box-sub">Exhaust</div>
        </div>
      </div>
    </div>
  </div>

  <!-- 정보 카드 -->
  <div class="info-cards">
    <div class="info-card">
      <div class="info-label">배기속도</div>
      <div class="info-value">최대 7배</div>
    </div>
    <div class="info-card">
      <div class="info-label">도달 진공도</div>
      <div class="info-value">10배 향상</div>
    </div>
    <div class="info-card">
      <div class="info-label">작동 구간</div>
      <div class="info-value">0.001~100 mbar</div>
    </div>
    <div class="info-card">
      <div class="info-label">기동 순서</div>
      <div class="info-value">배후펌프 먼저</div>
    </div>
  </div>

  <!-- 기준 박스 -->
  <div class="criteria">
    <div class="crit-box">
      <div class="crit-title">기준 1</div>
      <div class="crit-desc">챔버 용적이 크거나<br>동시 펌핑 수 많을 때</div>
    </div>
    <div class="crit-box">
      <div class="crit-title">기준 2</div>
      <div class="crit-desc">목표 진공도<br>0.01 mbar 이하</div>
    </div>
    <div class="crit-box">
      <div class="crit-title">기준 3</div>
      <div class="crit-desc">사이클 타임<br>단축이 핵심일 때</div>
    </div>
  </div>
</body>
</html>"""

def render(html: str, path: str, width: int, height: int):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": width, "height": height})
        page.set_content(html, wait_until="networkidle")
        page.wait_for_timeout(500)
        page.screenshot(path=path, clip={"x": 0, "y": 0, "width": width, "height": height})
        browser.close()
    print(f"저장됨: {path}")

if __name__ == "__main__":
    render(HTML_01, os.path.join(OUT_DIR, "image-01.png"), 1200, 600)
    render(HTML_02, os.path.join(OUT_DIR, "image-02.png"), 1200, 500)
    render(HTML_03, os.path.join(OUT_DIR, "image-03.png"), 1200, 400)
    render(HTML_04, os.path.join(OUT_DIR, "image-04.png"), 1200, 700)
    print("완료!")
