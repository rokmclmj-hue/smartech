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
.box { border:1px solid #4b5a77; border-radius:18px; padding:24px; background:#202e48; }
.note { margin-top:22px; color:#b9c7de; font-size:22px; line-height:1.6; }
.row { display:grid; grid-template-columns:280px 1fr 160px; align-items:center; gap:16px; margin-bottom:20px; font-size:24px; }
.row .lab { color:#cbd5e5; } .row .val { color:#9de5df; font-weight:700; text-align:right; }
.track { background:#314969; border-radius:8px; height:38px; }
.bar { height:38px; border-radius:8px; background:#8cded9; }
"""

def html(body, extra=""):
    return f'<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>{CSS}{extra}</style></head><body>{body}</body></html>'

THUMBNAIL = html("""
<div id="thumb"><div class="wrap">
<div class="badge2">진공 실생활</div>
<h1>고도와<br>과자 봉지</h1>
<div class="sub">왜 산에 가면 빵빵해질까?</div>
</div></div>
""", """
#thumb { width:1080px; height:1080px; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#1a1a2e,#16213e); }
.wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:130px; width:100%; padding:35px; }
.badge2 { font-size:56px; color:#a9bbdc; border:2px solid #50627e; border-radius:80px; padding:28px 56px; }
h1 { font-size:100px; line-height:1.35; letter-spacing:-2px; font-weight:800; }
.sub { font-size:50px; line-height:1.4; color:#bbc9de; }
""")

DIFF = html("""
<div id="card"><div class="eyebrow">PRESSURE GAP · 압력 차이</div>
<h2>봉지 안은 그대로, 바깥은 낮아집니다</h2>
<div class="grid">
<div class="box"><h3>포장 당시</h3><p>봉지 안에 그 순간의<br>대기압 수준 공기가 갇힘</p></div>
<div class="box"><h3>고도가 높아지면</h3><p>바깥 압력만 낮아짐<br>→ 안팎 압력차 발생 → 팽창</p></div>
</div></div>
""")

ALTITUDE = html("""
<div id="card"><div class="eyebrow">ISA · 고도별 압력</div>
<h2>고도가 높을수록 압력이 가파르게 낮아집니다</h2>
<div class="row"><span class="lab">해수면 (101,325 Pa)</span><div class="track"><div class="bar" style="width:100%"></div></div><span class="val">100%</span></div>
<div class="row"><span class="lab">약 2,438m (8,000ft)</span><div class="track"><div class="bar" style="width:74%"></div></div><span class="val">약 74%</span></div>
<div class="row"><span class="lab">약 3,776m (후지산급)</span><div class="track"><div class="bar" style="width:63%"></div></div><span class="val">약 63%</span></div>
<div class="note">국제표준대기(ISA) 공식에 직접 대입한 계산값. 실제 기상 조건에 따라 다를 수 있습니다.</div></div>
""")

VOLUME = html("""
<div id="card"><div class="eyebrow">VOLUME · 부피 팽창 (계산)</div>
<h2>압력이 낮을수록 부피는 늘어납니다</h2>
<div class="grid">
<div class="box"><h3>8,000ft (약 74%)</h3><p>부피 이론상<br>약 1.35배까지 증가</p></div>
<div class="box"><h3>후지산급 (약 63%)</h3><p>부피 이론상<br>약 1.6배까지 증가</p></div>
</div><div class="note">압력×부피 일정 가정(온도 일정)의 단순 계산이며, 특정 제품의 실측치가 아닙니다.</div></div>
""")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1200, "height": 1400}, device_scale_factor=1)
    for name, markup, selector in [
        ("thumbnail.png", THUMBNAIL, "#thumb"),
        ("사진1.png", DIFF, "#card"),
        ("사진2.png", ALTITUDE, "#card"),
        ("사진3.png", VOLUME, "#card"),
    ]:
        page.set_content(markup)
        page.evaluate("document.fonts.ready")
        page.locator(selector).screenshot(path=str(IMAGES / name))
        overflow = page.evaluate("""() => [...document.querySelectorAll('h1,h2,h3,p,.sub,.badge2,.note,.row span')].filter(e=>{ const r=e.getBoundingClientRect(); const c=e.closest('#card,#thumb').getBoundingClientRect(); return r.right>c.right-10 || r.left<c.left+10; }).map(e=>e.textContent.slice(0,30))""")
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
