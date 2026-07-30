# -*- coding: utf-8 -*-
from playwright.sync_api import sync_playwright
import os

BASE = os.path.dirname(os.path.abspath(__file__))

THUMBNAIL_HTML = """
<body style="margin:0; width:1080px; height:1080px; display:flex; align-items:center; justify-content:center;
  background: linear-gradient(135deg,#1a1a2e,#16213e); font-family: 'Malgun Gothic', 'Pretendard', sans-serif;">
  <div style="text-align:center; padding:60px; display:flex; flex-direction:column; gap:20px; align-items:center; width:820px;">
    <span style="display:inline-block; padding:8px 22px; border-radius:999px; background:rgba(255,255,255,0.08);
      color:#a0aec0; font-size:22px; letter-spacing:2px;">HYDROGEN · SAFETY</span>
    <h1 style="color:#ffffff; font-size:60px; font-weight:800; line-height:1.35; margin:0;">
      수소 설비 오일로터리펌프<br>사용 시 주의사항
    </h1>
    <p style="color:#a0aec0; font-size:26px; margin:0;">가스발라스트 차단 · ATEX 방폭 · 오일 수분 관리</p>
  </div>
</body>
"""

QUOTE_HTML = """
<body style="margin:0; width:1200px; height:800px; display:flex; align-items:center; justify-content:center;
  background: linear-gradient(135deg,#1a1a2e,#16213e); font-family: 'Malgun Gothic', 'Pretendard', sans-serif;">
  <div style="width:980px; padding:60px; border-left:8px solid #E46F75; display:flex; flex-direction:column; gap:28px;">
    <div style="color:#E46F75; font-size:80px; font-weight:900; line-height:1;">&ldquo;</div>
    <p style="color:#ffffff; font-size:42px; font-weight:700; line-height:1.55; margin:0;">
      수소를 다룰 때는<br>가스발라스트 밸브를<br>절대 열면 안 됩니다.
    </p>
    <p style="color:#a0aec0; font-size:24px; margin:0;">
      펌프 구동 모터는 방폭(ATEX) 설계여야 하며,<br>가스발라스트로 유입된 공기가 수소와 섞이면<br>폭발성 혼합물이 만들어질 수 있습니다.
    </p>
  </div>
</body>
"""

CHECKLIST_HTML = """
<body style="margin:0; width:1200px; height:900px; display:flex; align-items:center; justify-content:center;
  background: linear-gradient(135deg,#1a1a2e,#16213e); font-family: 'Malgun Gothic', 'Pretendard', sans-serif;">
  <div style="width:1000px; padding:50px; display:flex; flex-direction:column; gap:26px;">
    <h2 style="color:#ffffff; font-size:38px; font-weight:800; margin:0 0 10px 0;">
      수소 라인 오일로터리펌프 유지 체크리스트
    </h2>
    <div style="display:flex; flex-direction:column; gap:18px;">
      <div style="background:rgba(255,255,255,0.06); border-radius:16px; padding:26px 30px; display:flex; gap:20px; align-items:flex-start;">
        <span style="color:#E46F75; font-size:32px; font-weight:900;">1</span>
        <div>
          <p style="color:#ffffff; font-size:26px; font-weight:700; margin:0 0 6px 0;">ATEX 방폭 모터 확인</p>
          <p style="color:#a0aec0; font-size:20px; margin:0;">RV Ex 시리즈 / E2M EX 배리언트 / nES Ex 시리즈 중 하나여야 함</p>
        </div>
      </div>
      <div style="background:rgba(255,255,255,0.06); border-radius:16px; padding:26px 30px; display:flex; gap:20px; align-items:flex-start;">
        <span style="color:#E46F75; font-size:32px; font-weight:900;">2</span>
        <div>
          <p style="color:#ffffff; font-size:26px; font-weight:700; margin:0 0 6px 0;">가스발라스트 상시 차단</p>
          <p style="color:#a0aec0; font-size:20px; margin:0;">대기 유입 금지, 필요 시 불활성가스로만 대체</p>
        </div>
      </div>
      <div style="background:rgba(255,255,255,0.06); border-radius:16px; padding:26px 30px; display:flex; gap:20px; align-items:flex-start;">
        <span style="color:#E46F75; font-size:32px; font-weight:900;">3</span>
        <div>
          <p style="color:#ffffff; font-size:26px; font-weight:700; margin:0 0 6px 0;">별도 수분 트랩·필터 설계</p>
          <p style="color:#a0aec0; font-size:20px; margin:0;">가스발라스트로 수분 배출이 불가하므로 배기 앞단에서 관리</p>
        </div>
      </div>
      <div style="background:rgba(255,255,255,0.06); border-radius:16px; padding:26px 30px; display:flex; gap:20px; align-items:flex-start;">
        <span style="color:#E46F75; font-size:32px; font-weight:900;">4</span>
        <div>
          <p style="color:#ffffff; font-size:26px; font-weight:700; margin:0 0 6px 0;">오일 점검 주기 단축</p>
          <p style="color:#a0aec0; font-size:20px; margin:0;">일반 공정보다 짧은 주기로 오염·수분 상태 확인</p>
        </div>
      </div>
    </div>
  </div>
</body>
"""

with sync_playwright() as p:
    browser = p.chromium.launch()

    page = browser.new_page()
    page.set_content(THUMBNAIL_HTML)
    page.set_viewport_size({"width": 1080, "height": 1080})
    page.screenshot(path=os.path.join(BASE, "thumbnail.png"))
    page.close()

    page = browser.new_page()
    page.set_content(QUOTE_HTML)
    page.set_viewport_size({"width": 1200, "height": 800})
    page.screenshot(path=os.path.join(BASE, "사진1.png"))
    page.close()

    page = browser.new_page()
    page.set_content(CHECKLIST_HTML)
    page.set_viewport_size({"width": 1200, "height": 900})
    page.screenshot(path=os.path.join(BASE, "사진2.png"))
    page.close()

    browser.close()

print("done")
