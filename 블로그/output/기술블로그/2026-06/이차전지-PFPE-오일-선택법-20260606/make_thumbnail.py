from playwright.sync_api import sync_playwright

html = """<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body {
  width:1080px; height:1080px;
  background: linear-gradient(135deg, #0d1b2a 0%, #1b2838 60%, #0f3460 100%);
  font-family: "Malgun Gothic", "Apple SD Gothic Neo", sans-serif;
  display:flex; align-items:center; justify-content:center;
  position:relative; overflow:hidden;
}
.circle1 { position:absolute; width:500px; height:500px; border-radius:50%;
  background:rgba(13,58,138,0.15); top:-120px; left:-100px; }
.circle2 { position:absolute; width:350px; height:350px; border-radius:50%;
  background:rgba(13,58,138,0.10); bottom:80px; right:-80px; }
.center {
  text-align:center; padding:60px; position:relative; z-index:1;
}
.badge {
  display:inline-block; border:1px solid rgba(100,160,255,0.4);
  border-radius:20px; padding:8px 28px; font-size:18px;
  color:#90b8f8; letter-spacing:3px; margin-bottom:40px;
}
h1 {
  font-size:76px; font-weight:900; color:#ffffff;
  line-height:1.25; margin-bottom:28px; letter-spacing:-1px;
}
h1 span { color:#4f9cf9; }
.sub {
  font-size:26px; color:#a0b8d0; margin-bottom:50px; line-height:1.6;
}
.tags { display:flex; gap:16px; justify-content:center; flex-wrap:wrap; }
.tag {
  border:1px solid rgba(100,160,255,0.35); border-radius:8px;
  padding:10px 24px; font-size:20px; color:#7bb8f8;
  display:flex; flex-direction:column; align-items:center; gap:4px;
}
.tag-name { font-size:22px; font-weight:700; }
.tag-desc { font-size:16px; color:#7090b0; }
</style></head>
<body>
<div class="circle1"></div>
<div class="circle2"></div>
<div class="center">
  <div class="badge">이차전지 / 오일 소모품</div>
  <h1>이차전지 공정 진공펌프에<br><span>PFPE 오일</span>이 필요한 이유</h1>
  <div class="sub">NMP LiPF6 HF 환경에서<br>일반 오일이 망가지는 3가지 구체적 원인</div>
  <div class="tags">
    <div class="tag"><span class="tag-name">NMP</span><span class="tag-desc">용제 침투</span></div>
    <div class="tag"><span class="tag-name">HF</span><span class="tag-desc">부식 반응</span></div>
    <div class="tag"><span class="tag-name">PFPE</span><span class="tag-desc">불활성 내화</span></div>
  </div>
</div>
</body></html>"""

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.set_viewport_size({"width": 1080, "height": 1080})
    page.set_content(html)
    page.wait_for_timeout(1000)
    page.screenshot(
        path=r"C:\Users\rokmc\smartech\블로그\output\이차전지-PFPE-오일-선택법-20260606\images\thumbnail.png",
        full_page=False
    )
    browser.close()

print("썸네일 생성 완료")
