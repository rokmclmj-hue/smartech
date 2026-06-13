from playwright.sync_api import sync_playwright

OUT = r"C:\Users\rokmc\smartech\블로그\output\2026-06\수소-에너지-드라이펌프-20260610\images"

html = """<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{width:1080px;height:1080px;background:linear-gradient(160deg,#0a1628 0%,#0d2240 45%,#091830 100%);font-family:'Segoe UI',Arial,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;overflow:hidden;}

  /* 배경 장식 — 진공 게이지 원형 */
  .ring{position:absolute;border-radius:50%;border:1px solid rgba(255,255,255,0.05);}
  .r1{width:700px;height:700px;top:-150px;right:-200px;}
  .r2{width:500px;height:500px;top:-80px;right:-100px;}
  .r3{width:900px;height:900px;bottom:-400px;left:-300px;}

  /* 수소 분자 점 */
  .dots{position:absolute;top:0;left:0;width:100%;height:100%;}
  .dot{position:absolute;width:3px;height:3px;background:rgba(100,180,255,0.2);border-radius:50%;}

  /* 메인 콘텐츠 */
  .content{position:relative;z-index:10;display:flex;flex-direction:column;align-items:center;padding:80px 80px;}
  .label{font-size:13px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#4a90d9;margin-bottom:28px;border:1px solid rgba(74,144,217,0.3);padding:6px 16px;border-radius:2px;}
  .icon-row{display:flex;align-items:center;gap:16px;margin-bottom:36px;}
  .h2-badge{background:rgba(255,60,60,0.15);border:1px solid rgba(255,80,80,0.35);color:#ff8888;font-size:13px;font-weight:700;padding:5px 14px;border-radius:3px;letter-spacing:0.06em;}
  .title{color:#f0f4f8;font-size:46px;font-weight:800;text-align:center;line-height:1.25;letter-spacing:-0.02em;margin-bottom:24px;}
  .title em{font-style:normal;color:#60b0ff;}
  .sub{color:#7090a8;font-size:18px;text-align:center;line-height:1.6;margin-bottom:44px;max-width:700px;}
  .tags{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;}
  .tag{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#90a8c0;font-size:13px;padding:6px 14px;border-radius:3px;}
  .tag.highlight{background:rgba(74,144,217,0.15);border-color:rgba(74,144,217,0.35);color:#80b8e8;}

  /* 하단 라인 */
  .bottom-line{position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#3a78c9,#60a0ff,transparent);}
</style></head><body>
  <div class="ring r1"></div>
  <div class="ring r2"></div>
  <div class="ring r3"></div>
  <div class="content">
    <div class="label">수소 에너지 · 연료전지</div>
    <div class="icon-row">
      <div class="h2-badge">H₂</div>
    </div>
    <div class="title">수소 설비에<br><em>드라이 진공펌프</em>를<br>써야 하는 이유</div>
    <div class="sub">GXS · EXS 시리즈 선택 기준<br>공정별 진공도 요건 · ATEX 방폭 인증</div>
    <div class="tags">
      <span class="tag highlight">드라이 스크류 펌프</span>
      <span class="tag">오일 프리</span>
      <span class="tag">ATEX 방폭</span>
      <span class="tag highlight">Edwards GXS · EXS</span>
    </div>
  </div>
  <div class="bottom-line"></div>
</body></html>"""

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.set_viewport_size({"width": 1080, "height": 1080})
    page.set_content(html)
    page.wait_for_timeout(300)
    page.screenshot(path=f"{OUT}\\thumbnail.png", full_page=False)
    print("thumbnail.png saved")
    browser.close()
