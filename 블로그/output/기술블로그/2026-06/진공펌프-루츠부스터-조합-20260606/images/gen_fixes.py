# -*- coding: utf-8 -*-
from playwright.sync_api import sync_playwright
import os

OUT_DIR = r"C:\Users\rokmc\smartech\블로그\output\진공펌프-루츠부스터-조합\images"

# ── 썸네일: 연락처 없이 SMARTECH 텍스트만 ──
THUMBNAIL = """<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1080px; height: 1080px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    position: relative;
  }
  .circle {
    position: absolute; border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.08);
  }
  .c1 { width: 700px; height: 700px; top: 190px; left: 190px; }
  .c2 { width: 500px; height: 500px; top: 290px; left: 290px; }
  .brand-badge {
    background: #c00020; color: white;
    padding: 10px 28px; border-radius: 4px;
    font-size: 18px; font-weight: 700; letter-spacing: 2px;
    margin-bottom: 40px; position: relative; z-index: 1;
  }
  .title {
    font-size: 68px; font-weight: 900; color: white;
    text-align: center; line-height: 1.2; margin-bottom: 20px;
    position: relative; z-index: 1;
  }
  .divider { width: 200px; height: 3px; background: #c00020; margin: 20px auto 30px; }
  .tags { display: flex; gap: 16px; margin-bottom: 40px; position: relative; z-index: 1; }
  .tag {
    border: 2px solid rgba(255,255,255,0.3); border-radius: 8px;
    padding: 14px 20px; text-align: center; min-width: 160px;
  }
  .tag-num { font-size: 13px; color: #c00020; font-weight: 700; margin-bottom: 6px; }
  .tag-text { font-size: 22px; font-weight: 700; color: white; }
  .eh-label { font-size: 22px; font-weight: 700; color: #c00020; margin-bottom: 10px; position: relative; z-index: 1; }
  .eh-models { font-size: 17px; color: rgba(255,255,255,0.6); position: relative; z-index: 1; }
  .smartech {
    position: absolute; bottom: 36px; right: 40px;
    font-size: 16px; font-weight: 700;
    color: rgba(255,255,255,0.35); letter-spacing: 2px;
  }
</style>
</head>
<body>
  <div class="circle c1"></div>
  <div class="circle c2"></div>
  <div class="title">진공펌프 + 루츠 부스터<br>조합 선택법</div>
  <div class="divider"></div>
  <div class="tags">
    <div class="tag"><div class="tag-num">01</div><div class="tag-text">압력 구간</div></div>
    <div class="tag"><div class="tag-num">02</div><div class="tag-text">배기속도</div></div>
    <div class="tag"><div class="tag-num">03</div><div class="tag-text">선정 기준</div></div>
  </div>
  <div class="eh-label">Edwards EH 시리즈</div>
  <div class="eh-models">EH250 &middot; EH500 &middot; EH1200 &middot; EH2600 &middot; EH4200</div>
</body>
</html>"""

# ── image-01: "10배 낮은 압력" 문구 제거 ──
IMAGE_01 = """<!DOCTYPE html>
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
  .header { background: #1a3a6b; color: white; text-align: center; padding: 22px 0; font-size: 32px; font-weight: 700; }
  .content { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0; padding: 30px 50px; }
  .step-box {
    flex: 1; border: 2.5px solid; border-radius: 12px; padding: 24px 20px;
    display: flex; flex-direction: column; align-items: center; text-align: center;
    position: relative; background: #fff; height: 300px; justify-content: flex-start;
  }
  .step-box.red { border-color: #c00020; }
  .step-box.blue { border-color: #1a3a6b; }
  .step-box.green { border-color: #1a6b3a; }
  .step-num { width: 44px; height: 44px; border-radius: 50%; color: white; font-size: 22px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
  .num-red { background: #c00020; }
  .num-blue { background: #1a3a6b; }
  .num-green { background: #1a6b3a; }
  .step-label { font-size: 13px; font-weight: 700; letter-spacing: 1px; margin-bottom: 10px; }
  .label-red { color: #c00020; }
  .label-blue { color: #1a3a6b; }
  .label-green { color: #1a6b3a; }
  .step-title { font-size: 22px; font-weight: 700; color: #111; margin-bottom: 14px; line-height: 1.3; }
  .step-desc { font-size: 15px; color: #444; line-height: 2; }
  .arrow { font-size: 30px; color: #aaa; margin: 0 10px; flex-shrink: 0; padding-top: 120px; }
  .footer-bar { background: #1a3a6b; color: white; text-align: center; padding: 16px 30px; font-size: 15px; font-weight: 600; line-height: 1.5; }
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
      <div class="step-desc">드라이펌프/로터리펌프가<br>대기압 → 100 mbar로<br>기초 배기</div>
    </div>
    <div class="arrow">&#9658;</div>
    <div class="step-box blue">
      <div class="step-num num-blue">2</div>
      <div class="step-label label-blue">STEP 2</div>
      <div class="step-title">루츠 부스터 ON</div>
      <div style="width:60px;height:1px;background:#eee;margin:0 auto 12px;"></div>
      <div class="step-desc">8자형 로터 2개 회전<br>접촉 없이 기체 전송<br>배기속도 대폭 향상</div>
    </div>
    <div class="arrow">&#9658;</div>
    <div class="step-box green">
      <div class="step-num num-green">3</div>
      <div class="step-label label-green">STEP 3</div>
      <div class="step-title">목표 진공 달성</div>
      <div style="width:60px;height:1px;background:#eee;margin:0 auto 12px;"></div>
      <div class="step-desc">0.001 mbar 구간까지<br>드라이펌프 단독 대비<br>우수한 도달 진공도</div>
    </div>
  </div>
  <div class="footer-bar">핵심: 배후 펌프 먼저 → 압력 낮아지면 루츠 부스터 투입 → 고진공 달성</div>
</body>
</html>"""

# ── image-03: GXS250 → EH2600 예시 수정 ──
IMAGE_03 = """<!DOCTYPE html>
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
  .header { background: #1a3a6b; color: white; text-align: center; padding: 18px 0; font-size: 26px; font-weight: 700; }
  .cards { flex: 1; display: flex; align-items: stretch; padding: 20px 30px; gap: 16px; }
  .card { flex: 1; border-radius: 10px; padding: 18px 14px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; }
  .card.blue { border: 2px solid #1a3a6b; }
  .card.red  { border: 2px solid #c00020; }
  .card-model { font-size: 20px; font-weight: 700; padding: 8px 0 4px; }
  .card.blue .card-model { color: #1a3a6b; }
  .card.red  .card-model { color: #c00020; }
  .divider { width: 50px; height: 1px; background: #e0ddd8; margin: 4px 0; }
  .label { font-size: 12px; color: #888; }
  .value { font-size: 16px; font-weight: 700; color: #111; }
  .cool { font-size: 15px; font-weight: 700; }
  .card.blue .cool { color: #1a3a6b; }
  .card.red  .cool { color: #c00020; }
  .bottom-bar { background: #111; color: #fff; text-align: center; padding: 12px 0; font-size: 14px; font-weight: 600; }
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
    선정 기준: 배후 펌프 배기속도와 공정 조건에 맞춰 모델 선택
    <span>현장 사례: GXS250(250 m³/h) + EH2600(2,590 m³/h)</span>
  </div>
</body>
</html>"""

# ── image-04: EH500→EH2600, "10배 향상" 제거 ──
IMAGE_04 = """<!DOCTYPE html>
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
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .header { text-align: center; padding: 26px 0 0; font-size: 28px; font-weight: 700; }
  .flow-container { padding: 0 40px; }
  .label-row { display: flex; align-items: center; height: 30px; margin-bottom: 0; }
  .box-row { display: flex; align-items: center; }
  .box-slot { flex: 3; min-width: 0; }
  .arrow-slot { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; }
  .label-box-spacer { flex: 3; }
  .label-arrow-slot { flex: 1; display: flex; justify-content: center; align-items: center; }
  .arrow-label { font-size: 12px; color: rgba(255,255,255,0.80); font-weight: 700; white-space: nowrap; text-align: center; }
  .arrow-line { display: flex; align-items: center; width: 100%; }
  .arrow-shaft { flex: 1; height: 2px; background: rgba(255,255,255,0.40); }
  .arrow-head { font-size: 16px; color: rgba(255,255,255,0.60); line-height: 1; margin-left: -3px; }
  .box { border-radius: 10px; padding: 20px 14px; text-align: center; width: 100%; }
  .box-chamber { background: #1e3a70; border: 2px solid #4a7fcb; }
  .box-roots   { background: #8b0019; border: 2px solid #e04060; }
  .box-dry     { background: #1a4080; border: 2px solid #5090d0; }
  .box-exhaust { background: #1a5c30; border: 2px solid #3aac60; }
  .box-title { font-size: 18px; font-weight: 700; line-height: 1.3; }
  .box-sub   { font-size: 13px; color: rgba(255,255,255,0.75); margin-top: 5px; }
  .info-cards { display: flex; gap: 14px; padding: 0 40px; margin-bottom: 16px; }
  .info-card { flex: 1; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 20px 10px; text-align: center; }
  .info-label { font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 9px; }
  .info-value { font-size: 18px; font-weight: 700; color: #fff; }
  .criteria { display: flex; gap: 14px; padding: 0 40px 28px; }
  .crit-box { flex: 1; border: 1.5px solid #c00020; border-radius: 8px; padding: 18px 12px; text-align: center; }
  .crit-title { font-size: 13px; font-weight: 700; color: #e04060; margin-bottom: 10px; }
  .crit-desc  { font-size: 14px; color: rgba(255,255,255,0.85); line-height: 1.7; }
</style>
</head>
<body>
  <div class="header">GXS + EH 조합 시스템 구성</div>
  <div class="flow-container">
    <div class="label-row">
      <div class="label-box-spacer"></div>
      <div class="label-arrow-slot"><span class="arrow-label">기체 흡입</span></div>
      <div class="label-box-spacer"></div>
      <div class="label-arrow-slot"><span class="arrow-label">배기속도 증폭</span></div>
      <div class="label-box-spacer"></div>
      <div class="label-arrow-slot"><span class="arrow-label">최종 배기</span></div>
      <div class="label-box-spacer"></div>
    </div>
    <div class="box-row">
      <div class="box-slot"><div class="box box-chamber"><div class="box-title">진공 챔버</div><div class="box-sub">Chamber</div></div></div>
      <div class="arrow-slot"><div class="arrow-line"><div class="arrow-shaft"></div><div class="arrow-head">&#9654;</div></div></div>
      <div class="box-slot"><div class="box box-roots"><div class="box-title">루츠 부스터</div><div class="box-sub">EH2600</div></div></div>
      <div class="arrow-slot"><div class="arrow-line"><div class="arrow-shaft"></div><div class="arrow-head">&#9654;</div></div></div>
      <div class="box-slot"><div class="box box-dry"><div class="box-title">드라이펌프</div><div class="box-sub">GXS250</div></div></div>
      <div class="arrow-slot"><div class="arrow-line"><div class="arrow-shaft"></div><div class="arrow-head">&#9654;</div></div></div>
      <div class="box-slot"><div class="box box-exhaust"><div class="box-title">배기</div><div class="box-sub">Exhaust</div></div></div>
    </div>
  </div>
  <div class="info-cards">
    <div class="info-card"><div class="info-label">배기속도</div><div class="info-value">대폭 향상</div></div>
    <div class="info-card"><div class="info-label">유효 압력 구간</div><div class="info-value">0.001~100 mbar</div></div>
    <div class="info-card"><div class="info-label">기동 순서</div><div class="info-value">배후펌프 먼저</div></div>
    <div class="info-card"><div class="info-label">EH 구동방식</div><div class="info-value">유체커플링</div></div>
  </div>
  <div class="criteria">
    <div class="crit-box"><div class="crit-title">기준 1</div><div class="crit-desc">챔버 용적이 크거나<br>동시 펌핑 수 많을 때</div></div>
    <div class="crit-box"><div class="crit-title">기준 2</div><div class="crit-desc">목표 진공도<br>0.01 mbar 이하</div></div>
    <div class="crit-box"><div class="crit-title">기준 3</div><div class="crit-desc">사이클 타임<br>단축이 핵심일 때</div></div>
  </div>
</body>
</html>"""

def render(html, path, w, h):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": w, "height": h})
        page.set_content(html, wait_until="networkidle")
        page.wait_for_timeout(300)
        page.screenshot(path=path, clip={"x":0,"y":0,"width":w,"height":h})
        browser.close()
    print(f"저장: {path}")

render(THUMBNAIL, os.path.join(OUT_DIR, "thumbnail.png"), 1080, 1080)
render(IMAGE_01, os.path.join(OUT_DIR, "image-01.png"), 1200, 600)
render(IMAGE_03, os.path.join(OUT_DIR, "image-03.png"), 1200, 400)
render(IMAGE_04, os.path.join(OUT_DIR, "image-04.png"), 1200, 700)
print("모두 완료!")
