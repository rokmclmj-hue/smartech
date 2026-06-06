# -*- coding: utf-8 -*-
from playwright.sync_api import sync_playwright

OUT = r"C:\Users\rokmc\smartech\블로그\output\이차전지-PFPE-오일-선택법-20260606\images"

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
    font-size: 54px;
    font-weight: 700;
    text-align: center;
    line-height: 1.3;
    color: #ffffff;
    margin-bottom: 30px;
    max-width: 880px;
  }
  .accent { color: #60b0ff; }
  .sub-title {
    font-size: 28px;
    color: #b0cce8;
    text-align: center;
    max-width: 800px;
    line-height: 1.5;
    margin-bottom: 50px;
  }
  .points {
    display: flex;
    gap: 24px;
    margin-top: 10px;
  }
  .point-card {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(100,160,255,0.3);
    border-radius: 16px;
    padding: 22px 28px;
    text-align: center;
    min-width: 200px;
  }
  .point-num {
    font-size: 36px;
    font-weight: 800;
    color: #60b0ff;
    display: block;
    margin-bottom: 8px;
  }
  .point-label {
    font-size: 20px;
    color: #d0e8ff;
  }
</style>
</head>
<body>
  <div class="tag">이차전지 / 오일 소모품</div>
  <div class="main-title">배터리 공장 진공펌프에<br><span class="accent">PFPE 오일</span>이 필요한 이유</div>
  <div class="sub-title">NMP LiPF6 HF 환경에서<br>일반 오일이 망가지는 3가지 구체적 원인</div>
  <div class="points">
    <div class="point-card">
      <span class="point-num">NMP</span>
      <span class="point-label">용제 용해</span>
    </div>
    <div class="point-card">
      <span class="point-num">HF</span>
      <span class="point-label">부식 반응</span>
    </div>
    <div class="point-card">
      <span class="point-num">PFPE</span>
      <span class="point-label">불활성 내성</span>
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
    width: 1200px; height: 700px;
    background: linear-gradient(180deg, #0d1b2a 0%, #1b2838 100%);
    font-family: "Malgun Gothic", sans-serif;
    color: white;
    padding: 40px 50px;
    overflow: hidden;
  }
  h2 {
    font-size: 30px;
    color: #90c4ff;
    margin-bottom: 36px;
    text-align: center;
    letter-spacing: 1px;
  }
  .flow {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
  }
  .step {
    background: rgba(13,58,138,0.5);
    border: 1.5px solid rgba(100,160,255,0.4);
    border-radius: 14px;
    padding: 20px 16px;
    text-align: center;
    width: 155px;
    flex-shrink: 0;
  }
  .step-num {
    font-size: 14px;
    color: #60b0ff;
    margin-bottom: 8px;
    display: block;
    letter-spacing: 1px;
  }
  .step-title {
    font-size: 18px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 8px;
    line-height: 1.3;
  }
  .step-risk {
    font-size: 13px;
    color: #f97316;
    background: rgba(249,115,22,0.12);
    border-radius: 6px;
    padding: 4px 6px;
    margin-top: 6px;
    display: inline-block;
    line-height: 1.3;
  }
  .arrow {
    color: #60b0ff;
    font-size: 28px;
    padding: 0 8px;
    flex-shrink: 0;
  }
  .note {
    text-align: center;
    margin-top: 28px;
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
  <h2>이차전지 공정 단계별 진공 적용 및 위험 가스</h2>
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
      <span class="step-risk">LiPF6<br>용제</span>
    </div>
    <div class="arrow">&#8594;</div>
    <div class="step">
      <span class="step-num">STEP 4</span>
      <div class="step-title">디개싱<br>기포제거</div>
      <span class="step-risk">HF 발생<br>가능</span>
    </div>
    <div class="arrow">&#8594;</div>
    <div class="step">
      <span class="step-num">STEP 5</span>
      <div class="step-title">셀 봉합<br>화성</div>
      <span class="step-risk">CO2 H2<br>HF 가스</span>
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
    width: 1200px; height: 700px;
    background: linear-gradient(180deg, #0d1b2a 0%, #1b2838 100%);
    font-family: "Malgun Gothic", sans-serif;
    color: white;
    padding: 36px 50px;
    overflow: hidden;
  }
  h2 {
    font-size: 28px;
    color: #90c4ff;
    margin-bottom: 28px;
    text-align: center;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 17px;
  }
  th {
    padding: 14px 18px;
    text-align: center;
    font-size: 19px;
    font-weight: 700;
  }
  th:first-child { color: #b0cce8; text-align: left; width: 26%; }
  th.bad { background: rgba(220,38,38,0.18); color: #f87171; }
  th.good { background: rgba(13,58,138,0.45); color: #60b0ff; }
  td {
    padding: 13px 18px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    text-align: center;
  }
  td:first-child { text-align: left; color: #b0cce8; }
  td.bad { background: rgba(220,38,38,0.07); color: #fca5a5; }
  td.good { background: rgba(13,58,138,0.15); color: #93c5fd; }
  .icon-bad { color: #f87171; font-weight: 700; }
  .icon-good { color: #4ade80; font-weight: 700; }
</style>
</head>
<body>
  <h2>이차전지 공정 환경 : 일반 오일 vs PFPE 오일 비교</h2>
  <table>
    <thead>
      <tr>
        <th>항목</th>
        <th class="bad">일반 탄화수소 오일 (Ultragrade 계열)</th>
        <th class="good">PFPE 오일 (Drynert 계열)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>NMP 용제 노출 시</td>
        <td class="bad"><span class="icon-bad">X</span> 오일에 흡수 → 점도 저하</td>
        <td class="good"><span class="icon-good">O</span> 불용성 — 성능 유지</td>
      </tr>
      <tr>
        <td>HF 가스 노출 시</td>
        <td class="bad"><span class="icon-bad">X</span> 산화·분해 → 슬러지 생성</td>
        <td class="good"><span class="icon-good">O</span> 화학적 비반응 — 안정</td>
      </tr>
      <tr>
        <td>LiPF6 전해액 접촉</td>
        <td class="bad"><span class="icon-bad">X</span> 오염 가속 → 교환주기 단축</td>
        <td class="good"><span class="icon-good">O</span> 내화학성 — 장수명</td>
      </tr>
      <tr>
        <td>전극 오염 위험</td>
        <td class="bad"><span class="icon-bad">X</span> 오일 역류 가능성 있음</td>
        <td class="good"><span class="icon-good">O</span> 드라이펌프: 역류 없음</td>
      </tr>
      <tr>
        <td>유지 비용</td>
        <td class="bad"><span class="icon-bad">X</span> 잦은 교환 → 비용 급증</td>
        <td class="good"><span class="icon-good">O</span> 긴 교환주기 → 경제적</td>
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
    page2.set_viewport_size({"width": 1200, "height": 530})
    page2.screenshot(path=OUT + r"\image-01.png", full_page=False)
    print("image-01.png OK")

    page3 = browser.new_page()
    page3.set_content(img02_html)
    page3.set_viewport_size({"width": 1200, "height": 560})
    page3.screenshot(path=OUT + r"\image-02.png", full_page=False)
    print("image-02.png OK")

    browser.close()
print("DONE")
