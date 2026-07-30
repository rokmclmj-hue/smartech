# -*- coding: utf-8 -*-
from playwright.sync_api import sync_playwright
import os

BASE = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(BASE, "images")
os.makedirs(IMG_DIR, exist_ok=True)

THUMBNAIL_HTML = """
<html><head><style>
  * { margin:0; padding:0; box-sizing:border-box; font-family: 'Malgun Gothic', 'Pretendard', sans-serif; }
  body { width:1080px; height:1080px; display:flex; align-items:center; justify-content:center;
         background: linear-gradient(135deg,#1a1a2e,#16213e); }
  .wrap { text-align:center; padding:60px; display:flex; flex-direction:column; gap:20px; align-items:center; }
  .badge { display:inline-block; padding:10px 28px; border-radius:999px; background:rgba(255,255,255,0.08);
           border:1px solid rgba(255,255,255,0.25); color:#a0aec0; font-size:24px; letter-spacing:2px; }
  h1 { color:#ffffff; font-size:64px; font-weight:800; line-height:1.35; max-width:880px; }
  .sub { color:#a0aec0; font-size:30px; font-weight:500; max-width:760px; line-height:1.5; }
  .brand { position:absolute; bottom:50px; right:60px; color:#ffffff; font-size:26px; font-weight:700; letter-spacing:2px; opacity:0.85; }
  .icon { width:64px; height:64px; border-radius:16px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.25);
          display:flex; align-items:center; justify-content:center; font-size:32px; }
</style></head>
<body>
  <div class="wrap">
    <span class="badge">기술문의 · 오일/소모품</span>
    <div class="icon">&#128168;</div>
    <h1>오일로터리펌프<br>미스트필터 선택법</h1>
    <div class="sub">펌프 용량별 EMF3 ~ MF300 매칭 가이드</div>
  </div>
  <div class="brand">SMARTECH</div>
</body></html>
"""

CARD_HTML = """
<html><head><style>
  * { margin:0; padding:0; box-sizing:border-box; font-family: 'Malgun Gothic', 'Pretendard', sans-serif; }
  body { width:1200px; background: linear-gradient(160deg,#101425,#1b2140); padding:60px 60px 50px; }
  h2 { color:#ffffff; font-size:40px; font-weight:800; margin-bottom:12px; text-align:center; }
  .sub { color:#8892b0; font-size:22px; text-align:center; margin-bottom:44px; }
  .grid { display:flex; flex-direction:column; gap:22px; }
  .row { display:flex; align-items:center; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.12);
         border-radius:18px; padding:26px 32px; gap:24px; }
  .tag { min-width:150px; font-size:30px; font-weight:800; color:#7dd3fc; }
  .body { flex:1; }
  .pumps { color:#ffffff; font-size:24px; font-weight:700; margin-bottom:6px; }
  .spec { color:#a0aec0; font-size:20px; }
  .size { min-width:110px; text-align:right; font-size:20px; font-weight:700; color:#f6ad55; }
</style></head>
<body>
  <h2>펌프 용량별 미스트필터 매칭</h2>
  <div class="sub">EMF3 ~ MF300, 5단계 라인업</div>
  <div class="grid">
    <div class="row">
      <div class="tag">EMF3</div>
      <div class="body"><div class="pumps">E2M0.7 · E2M1.5</div><div class="spec">유량 3㎥/h · NW10 플랜지</div></div>
      <div class="size">소형</div>
    </div>
    <div class="row">
      <div class="tag">EMF10</div>
      <div class="body"><div class="pumps">RV3 · RV5 · RV8</div><div class="spec">유량 12㎥/h · NW25 플랜지</div></div>
      <div class="size">소형</div>
    </div>
    <div class="row">
      <div class="tag">EMF20</div>
      <div class="body"><div class="pumps">RV12 · E1M18 · E2M18</div><div class="spec">유량 20㎥/h · NW25 플랜지</div></div>
      <div class="size">중소형</div>
    </div>
    <div class="row">
      <div class="tag">MF100</div>
      <div class="body"><div class="pumps">E2M40 · E2M80</div><div class="spec">대용량 미스트필터 (규격 별도 확인)</div></div>
      <div class="size">중형</div>
    </div>
    <div class="row">
      <div class="tag">MF300</div>
      <div class="body"><div class="pumps">E2M175 · E2M275</div><div class="spec">대형 미스트필터 (규격 별도 확인)</div></div>
      <div class="size">대형</div>
    </div>
  </div>
</body></html>
"""

BEFORE_AFTER_HTML = """
<html><head><style>
  * { margin:0; padding:0; box-sizing:border-box; font-family: 'Malgun Gothic', 'Pretendard', sans-serif; }
  body { width:1200px; background: linear-gradient(160deg,#101425,#1b2140);
         display:flex; flex-direction:column; align-items:center; padding:50px; }
  h2 { color:#ffffff; font-size:36px; font-weight:800; margin-bottom:40px; text-align:center; }
  .row { display:flex; gap:36px; }
  .card { width:460px; border-radius:20px; padding:36px; border:1px solid rgba(255,255,255,0.14); }
  .before { background:rgba(239,68,68,0.08); border-color:rgba(239,68,68,0.35); }
  .after { background:rgba(45,212,191,0.08); border-color:rgba(45,212,191,0.35); }
  .label { font-size:24px; font-weight:800; margin-bottom:18px; }
  .before .label { color:#f87171; }
  .after .label { color:#5eead4; }
  .item { color:#e2e8f0; font-size:21px; margin-bottom:14px; line-height:1.5; }
  .dot { display:inline-block; width:8px; height:8px; border-radius:50%; background:#94a3b8; margin-right:10px; }
</style></head>
<body>
  <h2>미스트필터 교체 시점 판단 기준</h2>
  <div class="row">
    <div class="card before">
      <div class="label">교체가 필요한 상태</div>
      <div class="item"><span class="dot"></span>필터 내부 오일이 검게 변색</div>
      <div class="item"><span class="dot"></span>배기구 냄새가 이전보다 심해짐</div>
      <div class="item"><span class="dot"></span>필터 몸체 색이 눈에 띄게 탁해짐</div>
    </div>
    <div class="card after">
      <div class="label">정상 상태</div>
      <div class="item"><span class="dot"></span>오일 색이 맑고 투명함</div>
      <div class="item"><span class="dot"></span>배기구 주변 냄새 없음</div>
      <div class="item"><span class="dot"></span>필터 몸체 색 변화 없음</div>
    </div>
  </div>
</body></html>
"""

def shoot(html, path, width, height, full_page=False):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.set_content(html)
        page.set_viewport_size({"width": width, "height": height})
        page.screenshot(path=path, full_page=full_page)
        browser.close()

shoot(THUMBNAIL_HTML, os.path.join(IMG_DIR, "thumbnail.png"), 1080, 1080, full_page=False)
shoot(CARD_HTML, os.path.join(IMG_DIR, "image-02.png"), 1200, 1000, full_page=True)
shoot(BEFORE_AFTER_HTML, os.path.join(IMG_DIR, "image-03.png"), 1200, 420, full_page=True)
print("done")
