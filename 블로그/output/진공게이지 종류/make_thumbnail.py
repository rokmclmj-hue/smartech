from playwright.sync_api import sync_playwright

html = """<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body {
  width:1080px; height:1080px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
  font-family: "Malgun Gothic", "Apple SD Gothic Neo", sans-serif;
  display:flex; align-items:center; justify-content:center;
  position:relative; overflow:hidden;
}
.circle1 { position:absolute; width:400px; height:400px; border-radius:50%;
  background:rgba(99,179,237,0.07); top:-80px; left:-80px; }
.circle2 { position:absolute; width:300px; height:300px; border-radius:50%;
  background:rgba(99,179,237,0.05); bottom:100px; right:-60px; }
.center {
  text-align:center; padding:60px; position:relative; z-index:1;
}
.badge {
  display:inline-block; border:1px solid rgba(99,179,237,0.5);
  border-radius:20px; padding:8px 24px; font-size:18px;
  color:#a0aec0; letter-spacing:3px; margin-bottom:40px;
}
h1 {
  font-size:80px; font-weight:900; color:#ffffff;
  line-height:1.2; margin-bottom:30px; letter-spacing:-1px;
}
.sub {
  font-size:28px; color:#a0aec0; margin-bottom:50px; line-height:1.6;
}
.tags { display:flex; gap:16px; justify-content:center; flex-wrap:wrap; }
.tag {
  border:1px solid rgba(99,179,237,0.4); border-radius:8px;
  padding:10px 22px; font-size:20px; color:#90cdf4;
}
.brand {
  position:absolute; bottom:40px; right:50px;
  font-size:18px; color:rgba(160,174,192,0.6); letter-spacing:3px;
}
</style></head>
<body>
<div class="circle1"></div>
<div class="circle2"></div>
<div class="center">
  <div class="badge">진공 측정 기술</div>
  <h1>진공게이지 종류<br>완전 정리</h1>
  <div class="sub">피라니 · 이온 · 컨벡션 · 커패시턴스<br>뭐가 다를까?</div>
  <div class="tags">
    <div class="tag">피라니</div>
    <div class="tag">컨벡션</div>
    <div class="tag">이온</div>
    <div class="tag">커패시턴스</div>
  </div>
</div>
<div class="brand">SMARTECH</div>
</body></html>"""

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.set_viewport_size({"width": 1080, "height": 1080})
    page.set_content(html)
    page.wait_for_timeout(1000)
    page.screenshot(
        path=r"C:\Users\rokmc\smartech\블로그\output\진공게이지 종류\images\thumbnail.png",
        full_page=False
    )
    browser.close()

print("썸네일 생성 완료")
