# -*- coding: utf-8 -*-
from playwright.sync_api import sync_playwright

OUT = r"C:\Users\rokmc\smartech\블로그\output\2026-06\이차전지-PFPE-오일-선택법-20260606\images"

thumbnail_html = """<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1080px; height: 1080px;
    background: linear-gradient(135deg, #0d1b2a 0%, #1b2838 40%, #0d3a8a 100%);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    font-family: "Malgun Gothic", sans-serif;
    color: white; overflow: hidden;
  }
  .tag {
    background: rgba(13, 58, 138, 0.6);
    border: 1px solid rgba(100, 160, 255, 0.5);
    border-radius: 30px;
    padding: 10px 28px;
    font-size: 24px;
    color: #90c4ff;
    margin-bottom: 40px;
    letter-spacing: 2px;
  }
  .main-title {
    font-size: 48px;
    font-weight: 700;
    text-align: center;
    line-height: 1.4;
    color: #ffffff;
    margin-bottom: 30px;
    max-width: 900px;
  }
  .accent { color: #60b0ff; }
  .sub-title {
    font-size: 26px;
    color: #b0cce8;
    text-align: center;
    max-width: 820px;
    line-height: 1.5;
    margin-bottom: 50px;
  }
  .points {
    display: flex;
    gap: 20px;
    margin-top: 10px;
  }
  .point-card {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(100,160,255,0.3);
    border-radius: 16px;
    padding: 20px 26px;
    text-align: center;
    min-width: 180px;
  }
  .point-num {
    font-size: 30px;
    font-weight: 800;
    color: #60b0ff;
    display: block;
    margin-bottom: 8px;
  }
  .point-label {
    font-size: 19px;
    color: #d0e8ff;
  }
</style>
</head>
<body>
  <div class="tag">이차전지 / 진공펌프 선택</div>
  <div class="main-title">2차전지 제조 공정에서<br><span class="accent">드라이펌프</span> 및 <span class="accent">PFPE 오일</span><br>진공펌프가 필요한 이유</div>
  <div class="sub-title">NMP · LiPF6 · HF 환경에서<br>일반 오일이 망가지는 원인과 올바른 선택법</div>
  <div class="points">
    <div class="point-card">
      <span class="point-num">드라이</span>
      <span class="point-label">완전 격리 구조</span>
    </div>
    <div class="point-card">
      <span class="point-num">PFPE</span>
      <span class="point-label">불활성 내화학성</span>
    </div>
    <div class="point-card">
      <span class="point-num">GXS</span>
      <span class="point-label">이차전지 표준</span>
    </div>
  </div>
</body>
</html>"""

img01_html = """<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 680px;
    background: linear-gradient(180deg, #0d1b2a 0%, #1b2838 100%);
    font-family: "Malgun Gothic", sans-serif;
    color: white;
    padding: 40px 50px;
    overflow: hidden;
  }
  h2 {
    font-size: 28px;
    color: #90c4ff;
    margin-bottom: 32px;
    text-align: center;
    letter-spacing: 1px;
  }
  .flow {
    display: flex;
    align-items: stretch;
    justify-content: center;
    gap: 0;
  }
  .step {
    background: rgba(13,58,138,0.5);
    border: 1.5px solid rgba(100,160,255,0.4);
    border-radius: 14px;
    padding: 18px 14px;
    text-align: center;
    width: 168px;
    flex-shrink: 0;
  }
  .step-num {
    font-size: 13px;
    color: #60b0ff;
    margin-bottom: 8px;
    display: block;
    letter-spacing: 1px;
  }
  .step-title {
    font-size: 18px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 10px;
    line-height: 1.3;
  }
  .step-risk {
    font-size: 13px;
    color: #f97316;
    background: rgba(249,115,22,0.12);
    border-radius: 6px;
    padding: 5px 7px;
    margin-top: 4px;
    display: inline-block;
    line-height: 1.4;
  }
  .arrow {
    color: #60b0ff;
    font-size: 26px;
    padding: 0 6px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }
  .note {
    text-align: center;
    margin-top: 26px;
    font-size: 17px;
    color: #b0cce8;
    background: rgba(255,255,255,0.05);
    border-radius: 10px;
    padding: 12px 20px;
  }
  .highlight { color: #60b0ff; font-weight: 700; }
</style>
</head>
<body>
  <h2>2차전지 공정 단계별 진공 적용 및 위험 가스</h2>
  <div class="flow">
    <div class="step">
      <span class="step-num">STEP 1</span>
      <div class="step-title">전극 건조</div>
      <span class="step-risk">NMP 증기<br>대량 발생</span>
    </div>
    <div class="arrow">&#8594;</div>
    <div class="step">
      <span class="step-num">STEP 2</span>
      <div class="step-title">NMP 회수</div>
      <span class="step-risk">NMP<br>고농도</span>
    </div>
    <div class="arrow">&#8594;</div>
    <div class="step">
      <span class="step-num">STEP 3</span>
      <div class="step-title">전해액<br>주입</div>
      <span class="step-risk">LiPF6<br>유기용제</span>
    </div>
    <div class="arrow">&#8594;</div>
    <div class="step">
      <span class="step-num">STEP 4</span>
      <div class="step-title">디개싱<br>기포 제거</div>
      <span class="step-risk">HF 발생<br>가능</span>
    </div>
    <div class="arrow">&#8594;</div>
    <div class="step">
      <span class="step-num">STEP 5</span>
      <div class="step-title">셀 봉합<br>화성</div>
      <span class="step-risk">CO&#8322; H&#8322;<br>HF 가스</span>
    </div>
  </div>
  <div class="note">
    디개싱 요구 진공도 <span class="highlight">&lt; 0.1 mbar</span> &nbsp;|&nbsp; 전극 건조 수분 목표 <span class="highlight">&lt; 40 ppm</span> &nbsp;|&nbsp; 출처: Edwards 공식 자료
  </div>
</body>
</html>"""

img02_html = """<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 720px;
    background: linear-gradient(180deg, #0d1b2a 0%, #1b2838 100%);
    font-family: "Malgun Gothic", sans-serif;
    color: white;
    padding: 36px 44px;
    overflow: hidden;
  }
  h2 {
    font-size: 26px;
    color: #90c4ff;
    margin-bottom: 24px;
    text-align: center;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 16px;
  }
  th {
    padding: 13px 16px;
    text-align: center;
    font-size: 17px;
    font-weight: 700;
  }
  th:first-child { color: #b0cce8; text-align: left; width: 22%; }
  th.bad { background: rgba(220,38,38,0.18); color: #f87171; }
  th.pfpe { background: rgba(13,100,60,0.3); color: #4ade80; }
  th.dry { background: rgba(13,58,138,0.45); color: #60b0ff; }
  td {
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    text-align: center;
  }
  td:first-child { text-align: left; color: #b0cce8; font-size: 15px; }
  td.bad { background: rgba(220,38,38,0.06); color: #fca5a5; }
  td.pfpe { background: rgba(13,100,60,0.1); color: #86efac; }
  td.dry { background: rgba(13,58,138,0.12); color: #93c5fd; }
  .icon-bad { color: #f87171; font-weight: 700; }
  .icon-ok { color: #4ade80; font-weight: 700; }
  .icon-best { color: #60b0ff; font-weight: 700; }
</style>
</head>
<body>
  <h2>이차전지 공정 : 진공펌프 유형별 비교</h2>
  <table>
    <thead>
      <tr>
        <th>비교 항목</th>
        <th class="bad">일반 오일식 펌프<br><small>(Ultragrade 오일)</small></th>
        <th class="pfpe">PFPE 오일 사양 펌프<br><small>(오일식 + PFPE)</small></th>
        <th class="dry">드라이펌프<br><small>(GXS 등)</small></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>NMP 증기 노출</td>
        <td class="bad"><span class="icon-bad">✗</span> 오일 흡수 → 점도 저하</td>
        <td class="pfpe"><span class="icon-ok">△</span> 흡수 없음, 단 오염 가능</td>
        <td class="dry"><span class="icon-best">✓</span> 오일 접촉 없음</td>
      </tr>
      <tr>
        <td>HF 가스 노출</td>
        <td class="bad"><span class="icon-bad">✗</span> 오일 산화·분해</td>
        <td class="pfpe"><span class="icon-ok">△</span> PFPE 불활성 — 안정</td>
        <td class="dry"><span class="icon-best">✓</span> PFPE 기어 + 격리 구조</td>
      </tr>
      <tr>
        <td>전극 오염 위험</td>
        <td class="bad"><span class="icon-bad">✗</span> 오일 역류 가능</td>
        <td class="pfpe"><span class="icon-bad">✗</span> 오일 역류 가능</td>
        <td class="dry"><span class="icon-best">✓</span> 역류 없음</td>
      </tr>
      <tr>
        <td>오일 교환 주기</td>
        <td class="bad"><span class="icon-bad">✗</span> 매우 짧음 (수 주)</td>
        <td class="pfpe"><span class="icon-ok">△</span> 긺 (수 개월~1년)</td>
        <td class="dry"><span class="icon-best">✓</span> 기어박스만 (장기)</td>
      </tr>
      <tr>
        <td>이차전지 권장</td>
        <td class="bad"><span class="icon-bad">✗</span> 비권장</td>
        <td class="pfpe"><span class="icon-ok">△</span> 차선책</td>
        <td class="dry"><span class="icon-best">✓</span> 권장 (표준)</td>
      </tr>
    </tbody>
  </table>
</body>
</html>"""

with sync_playwright() as p:
    browser = p.chromium.launch()

    page = browser.new_page()
    page.set_content(thumbnail_html)
    page.set_viewport_size({"width": 1080, "height": 1080})
    page.screenshot(path=OUT + r"\thumbnail.png", full_page=False)
    print("thumbnail.png OK")

    page2 = browser.new_page()
    page2.set_content(img01_html)
    page2.set_viewport_size({"width": 1200, "height": 540})
    page2.screenshot(path=OUT + r"\image-01.png", full_page=False)
    print("image-01.png OK")

    page3 = browser.new_page()
    page3.set_content(img02_html)
    page3.set_viewport_size({"width": 1200, "height": 580})
    page3.screenshot(path=OUT + r"\image-02.png", full_page=False)
    print("image-02.png OK")

    browser.close()
print("DONE")
