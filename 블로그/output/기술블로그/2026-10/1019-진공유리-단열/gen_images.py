# -*- coding: utf-8 -*-
"""Original HTML/CSS educational diagrams rendered with Playwright (no photos, AI-free)."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from PIL import Image

BASE = Path(__file__).resolve().parent
IMAGES = BASE / "images"
IMAGES.mkdir(exist_ok=True)

CSS = """
* { box-sizing:border-box; margin:0; padding:0; }
body { color:#fff; font-family:'Pretendard Variable','Pretendard','Malgun Gothic',sans-serif; }
#card { width:1200px; padding:40px; background:linear-gradient(135deg,#1a1a2e,#16213e); }
.eyebrow { color:#a9bbdc; font-size:24px; letter-spacing:2px; margin-bottom:14px; }
h2 { font-size:42px; line-height:1.4; margin-bottom:26px; letter-spacing:-1px; }
h3 { font-size:29px; line-height:1.4; margin-bottom:12px; }
p { color:#cbd5e5; font-size:24px; line-height:1.6; word-break:keep-all; }
.grid { display:grid; gap:20px; grid-template-columns:1fr 1fr; }
.grid3 { display:grid; gap:18px; grid-template-columns:repeat(3,1fr); }
.box { border:1px solid #4b5a77; border-radius:18px; padding:24px; background:#202e48; }
.note { margin-top:22px; color:#b9c7de; font-size:22px; line-height:1.6; }
"""

def html(body, extra=""):
    return f'<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>{CSS}{extra}</style></head><body>{body}</body></html>'

THUMBNAIL = html("""
<div id="thumb"><div class="wrap">
<div class="badge2">건축 · 진공 단열</div>
<h1>진공유리 &<br>단열패널</h1>
<div class="sub">진공은 열을 어떻게 막을까?</div>
</div></div>
""", """
#thumb { width:1080px; height:1080px; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#1a1a2e,#16213e); }
.wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:130px; width:100%; padding:35px; }
.badge2 { font-size:52px; color:#a9bbdc; border:2px solid #50627e; border-radius:80px; padding:26px 52px; }
h1 { font-size:88px; line-height:1.35; letter-spacing:-2px; font-weight:800; }
.sub { font-size:48px; line-height:1.4; color:#bbc9de; }
""")

TRANSFER = html("""
<div id="card"><div class="eyebrow">HEAT TRANSFER · 열전달 3가지</div>
<h2>진공이 막는 것과 못 막는 것</h2>
<div class="grid3">
<div class="box"><h3>전도</h3><p>접촉을 통한 전달<br>→ 진공이 막음</p></div>
<div class="box"><h3>대류</h3><p>기체·액체 흐름<br>→ 진공이 막음</p></div>
<div class="box"><h3>복사</h3><p>전자기파를 통한 전달<br>→ 진공도 못 막음</p></div>
</div></div>
""")

VIP = html("""
<div id="card"><div class="eyebrow">VIP · 진공 단열패널</div>
<h2>배기 압력과 R값 (미국 에너지부 자료)</h2>
<div class="grid">
<div class="box"><h3>진공 상태</h3><p>약 10 mbar 미만 배기<br>R값(인치당) 20 이상</p></div>
<div class="box"><h3>진공이 깨지면</h3><p>대기압 상태<br>R값(인치당) 7.2 수준으로 하락</p></div>
</div><div class="note">비교: 발포폴리스티렌(EPS)은 R값(인치당) 5 미만.</div></div>
""")

VIG = html("""
<div id="card"><div class="eyebrow">VIG · 진공유리 구조</div>
<h2>필러가 압력을 버텨줍니다</h2>
<div class="grid">
<div class="box"><h3>저압 공간</h3><p>유리 두 장 사이를 배기<br>유리 프릿으로 테두리 밀봉</p></div>
<div class="box"><h3>필러(스페이서)</h3><p>대기압 힘을 분산해서 지지<br>유리판이 붙거나 휘는 것을 방지</p></div>
</div><div class="note">구체적 내부 압력·필러 간격 수치는 확인하지 못했습니다.</div></div>
""")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1200, "height": 1400}, device_scale_factor=1)
    for name, markup, selector in [
        ("thumbnail.png", THUMBNAIL, "#thumb"),
        ("사진1.png", TRANSFER, "#card"),
        ("사진2.png", VIP, "#card"),
        ("사진3.png", VIG, "#card"),
    ]:
        page.set_content(markup)
        page.evaluate("document.fonts.ready")
        page.locator(selector).screenshot(path=str(IMAGES / name))
        overflow = page.evaluate("""() => [...document.querySelectorAll('h1,h2,h3,p,.sub,.badge2,.note')].filter(e=>{ const r=e.getBoundingClientRect(); const c=e.closest('#card,#thumb').getBoundingClientRect(); return r.right>c.right-10 || r.left<c.left+10; }).map(e=>e.textContent.slice(0,30))""")
        if overflow:
            raise RuntimeError(f"Text overflow: {name}: {overflow}")
    browser.close()

report = {"method": "Original HTML/CSS rendered with Playwright", "images": {}}
for path in sorted(IMAGES.glob("*.png")):
    with Image.open(path) as im:
        report["images"][path.name] = {"width": im.width, "height": im.height, "bytes": path.stat().st_size}
        if path.name == "thumbnail.png":
            pixels = im.convert("RGB")
            w, h = pixels.size
            bright = lambda y: max(max(pixels.getpixel((x, y))) for x in range(0, w, 4))
            top = next(y for y in range(h) if bright(y) > 120)
            bottom = next(y for y in range(h - 1, -1, -1) if bright(y) > 120)
            margins = {"top_percent": round(top / h * 100, 2), "bottom_percent": round((h - 1 - bottom) / h * 100, 2)}
            report["thumbnail_margins"] = margins
            assert max(margins.values()) <= 20, margins
        assert path.stat().st_size < 4 * 1024 * 1024
(BASE / "image-validation.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, ensure_ascii=False, indent=2))
