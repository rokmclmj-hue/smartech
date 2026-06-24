from playwright.sync_api import sync_playwright

OUT = r"C:\Users\rokmc\smartech\블로그\output\2026-06\수소-에너지-드라이펌프-20260610\images"

# image-01: 오일식 vs 드라이 스크류 펌프 — 수소 환경 위험 비교
html_01 = """<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{width:1080px;height:680px;background:linear-gradient(135deg,#0d1b2a 0%,#1b2838 100%);font-family:'Segoe UI',Arial,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px;}
  .title{color:#e8e8e8;font-size:22px;font-weight:700;letter-spacing:-0.3px;margin-bottom:36px;text-align:center;}
  .cols{display:flex;gap:24px;width:100%;}
  .col{flex:1;border-radius:12px;padding:28px 24px;}
  .col-oil{background:rgba(180,40,40,0.18);border:1.5px solid rgba(220,60,60,0.45);}
  .col-dry{background:rgba(20,80,160,0.18);border:1.5px solid rgba(40,120,220,0.45);}
  .col-head{font-size:16px;font-weight:700;margin-bottom:18px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.12);}
  .col-oil .col-head{color:#f07070;}
  .col-dry .col-head{color:#6aa8f0;}
  .item{display:flex;align-items:flex-start;gap:10px;margin-bottom:14px;}
  .dot-oil{width:8px;height:8px;border-radius:50%;background:#f07070;margin-top:6px;flex-shrink:0;}
  .dot-dry{width:8px;height:8px;border-radius:50%;background:#6aa8f0;margin-top:6px;flex-shrink:0;}
  .item-text{color:#d0d8e8;font-size:15px;line-height:1.55;}
  .badge-danger{display:inline-block;background:rgba(200,0,32,0.35);color:#ff8888;font-size:11px;font-weight:700;border-radius:4px;padding:2px 7px;margin-bottom:6px;}
  .badge-safe{display:inline-block;background:rgba(20,120,60,0.35);color:#70e0a0;font-size:11px;font-weight:700;border-radius:4px;padding:2px 7px;margin-bottom:6px;}
  .footer{color:#607080;font-size:12px;margin-top:28px;letter-spacing:0.04em;}
</style></head><body>
<div class="title">수소 환경에서의 진공펌프 — 오일식 vs 드라이 스크류</div>
<div class="cols">
  <div class="col col-oil">
    <div class="badge-danger">위험 요소</div>
    <div class="col-head">오일 회전 베인 펌프</div>
    <div class="item"><div class="dot-oil"></div><div class="item-text">오일 역류로 수소 가스 오염<br><span style="color:#f09090;font-size:13px;">연료전지 효율 저하</span></div></div>
    <div class="item"><div class="dot-oil"></div><div class="item-text">내부 마찰 · 열 발생<br><span style="color:#f09090;font-size:13px;">착화 위험 상승</span></div></div>
    <div class="item"><div class="dot-oil"></div><div class="item-text">수소 폭발 범위 4~75%<br><span style="color:#f09090;font-size:13px;">착화 에너지 0.017 mJ</span></div></div>
  </div>
  <div class="col col-dry">
    <div class="badge-safe">안전 특성</div>
    <div class="col-head">드라이 스크류 펌프</div>
    <div class="item"><div class="dot-dry"></div><div class="item-text">가스 경로 오일 없음<br><span style="color:#90d0b0;font-size:13px;">역류 오염 리스크 제로</span></div></div>
    <div class="item"><div class="dot-dry"></div><div class="item-text">비접촉 스크류 회전<br><span style="color:#90d0b0;font-size:13px;">내부 스파크 발생 낮음</span></div></div>
    <div class="item"><div class="dot-dry"></div><div class="item-text">ATEX 방폭 인증 옵션<br><span style="color:#90d0b0;font-size:13px;">가연성 가스 환경 안전 사용</span></div></div>
  </div>
</div>
<div class="footer">PFPE 계열 씰 오일 사용 — 화학적 불활성, 가스와 비접촉</div>
</body></html>"""

# image-02: GXS vs EXS 스펙 비교 표
html_02 = """<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{width:1080px;height:620px;background:linear-gradient(135deg,#0d1b2a 0%,#1b2838 100%);font-family:'Segoe UI',Arial,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 56px;}
  .title{color:#e8e8e8;font-size:22px;font-weight:700;margin-bottom:32px;text-align:center;}
  table{width:100%;border-collapse:collapse;}
  th,td{padding:13px 18px;text-align:left;font-size:15px;border-bottom:1px solid rgba(255,255,255,0.08);}
  thead th{color:#a0b8d0;font-weight:600;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;border-bottom:1.5px solid rgba(255,255,255,0.15);}
  thead th:first-child{color:#a0b8d0;}
  tbody tr:last-child td{border-bottom:none;}
  tbody tr:hover td{background:rgba(255,255,255,0.03);}
  .row-label{color:#c8d8e8;font-weight:600;}
  .val-gxs{color:#6aa8f0;}
  .val-exs{color:#70e8b0;}
  .badge{display:inline-block;font-size:12px;font-weight:700;border-radius:4px;padding:2px 8px;}
  .b-std{background:rgba(40,80,160,0.4);color:#90b8f8;}
  .b-next{background:rgba(20,120,60,0.4);color:#70e8b0;}
  .b-yes{background:rgba(20,120,60,0.3);color:#70e8b0;}
  .b-no{background:rgba(80,80,80,0.3);color:#909090;}
</style></head><body>
<div class="title">Edwards GXS vs EXS — 수소 설비 적용 비교</div>
<table>
  <thead>
    <tr>
      <th>항목</th>
      <th>GXS 시리즈 <span class="badge b-std">표준형</span></th>
      <th>EXS 시리즈 <span class="badge b-next">차세대형</span></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="row-label">배기속도</td>
      <td class="val-gxs">160 ~ 740 m³/h</td>
      <td class="val-exs">160 ~ 740 m³/h</td>
    </tr>
    <tr>
      <td class="row-label">도달진공도</td>
      <td class="val-gxs">3~7 × 10⁻³ mbar</td>
      <td class="val-exs">1 × 10⁻² mbar</td>
    </tr>
    <tr>
      <td class="row-label">VFD (인버터)</td>
      <td><span class="badge b-no">외장 옵션</span></td>
      <td><span class="badge b-yes">내장 기본</span></td>
    </tr>
    <tr>
      <td class="row-label">Modbus RTU 통신</td>
      <td><span class="badge b-no">없음</span></td>
      <td><span class="badge b-yes">지원</span></td>
    </tr>
    <tr>
      <td class="row-label">적합 공정</td>
      <td class="val-gxs">고정 부하 · 전해질 탈기 · 누설 시험</td>
      <td class="val-exs">VPSA 건조 · 자동화 · 변동 부하</td>
    </tr>
    <tr>
      <td class="row-label">ATEX 방폭</td>
      <td><span class="badge b-yes">옵션 선택 가능</span></td>
      <td><span class="badge b-yes">옵션 선택 가능</span></td>
    </tr>
  </tbody>
</table>
</body></html>"""

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()

    page.set_viewport_size({"width": 1080, "height": 680})
    page.set_content(html_01)
    page.wait_for_timeout(300)
    page.screenshot(path=f"{OUT}\\image-01.png", full_page=False)
    print("image-01.png saved")

    page.set_viewport_size({"width": 1080, "height": 620})
    page.set_content(html_02)
    page.wait_for_timeout(300)
    page.screenshot(path=f"{OUT}\\image-02.png", full_page=False)
    print("image-02.png saved")

    browser.close()
    print("all done")
