from playwright.sync_api import sync_playwright

OUT = r"C:\Users\rokmc\smartech\블로그\output\2026-06\수소-에너지-드라이펌프-20260610\images"

html_03 = """<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{width:1080px;height:560px;background:linear-gradient(135deg,#0d1b2a 0%,#1b2838 100%);font-family:'Segoe UI',Arial,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 56px;}
  .title{color:#e8e8e8;font-size:21px;font-weight:700;margin-bottom:10px;text-align:center;}
  .sub{color:#7090a8;font-size:14px;margin-bottom:32px;text-align:center;letter-spacing:0.04em;}
  .cards{display:flex;gap:20px;width:100%;}
  .card{flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:22px 20px;}
  .card-label{font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:14px;}
  .label-gxs{color:#6aa8f0;}
  .label-exs{color:#70e8b0;}
  .spec-row{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.07);}
  .spec-row:last-child{border-bottom:none;}
  .spec-key{color:#8098b0;font-size:13px;}
  .spec-val-gxs{color:#b0cef8;font-size:14px;font-weight:600;}
  .spec-val-exs{color:#90e8c0;font-size:14px;font-weight:600;}
  .atex-row{margin-top:16px;display:flex;align-items:center;gap:8px;}
  .atex-badge{background:rgba(255,160,0,0.2);border:1px solid rgba(255,160,0,0.4);color:#ffd070;font-size:12px;font-weight:700;padding:3px 10px;border-radius:4px;}
  .atex-text{color:#8098b0;font-size:13px;}
</style></head><body>
<div class="title">Edwards GXS · EXS 드라이 스크류 펌프 — 핵심 사양</div>
<div class="sub">수소 에너지 설비 적용 | PFPE 씰 오일 | 오일 프리 가스 경로</div>
<div class="cards">
  <div class="card">
    <div class="card-label label-gxs">GXS 시리즈</div>
    <div class="spec-row"><span class="spec-key">배기속도</span><span class="spec-val-gxs">160 ~ 740 m³/h</span></div>
    <div class="spec-row"><span class="spec-key">도달진공도</span><span class="spec-val-gxs">3~7 × 10⁻³ mbar</span></div>
    <div class="spec-row"><span class="spec-key">최대소비전력</span><span class="spec-val-gxs">5 ~ 37 kW</span></div>
    <div class="spec-row"><span class="spec-key">VFD</span><span class="spec-val-gxs">외장 옵션</span></div>
    <div class="spec-row"><span class="spec-key">씰 오일</span><span class="spec-val-gxs">PFPE Drynert</span></div>
    <div class="atex-row"><span class="atex-badge">ATEX</span><span class="atex-text">방폭 인증 옵션</span></div>
  </div>
  <div class="card">
    <div class="card-label label-exs">EXS 시리즈</div>
    <div class="spec-row"><span class="spec-key">배기속도</span><span class="spec-val-exs">160 ~ 740 m³/h</span></div>
    <div class="spec-row"><span class="spec-key">도달진공도</span><span class="spec-val-exs">1 × 10⁻² mbar</span></div>
    <div class="spec-row"><span class="spec-key">최대소비전력</span><span class="spec-val-exs">5 ~ 22 kW</span></div>
    <div class="spec-row"><span class="spec-key">VFD</span><span class="spec-val-exs">내장 기본</span></div>
    <div class="spec-row"><span class="spec-key">통신</span><span class="spec-val-exs">Modbus RTU</span></div>
    <div class="atex-row"><span class="atex-badge">ATEX</span><span class="atex-text">방폭 인증 옵션</span></div>
  </div>
</div>
</body></html>"""

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.set_viewport_size({"width": 1080, "height": 560})
    page.set_content(html_03)
    page.wait_for_timeout(300)
    page.screenshot(path=f"{OUT}\\image-03.png", full_page=False)
    print("image-03.png saved")
    browser.close()
