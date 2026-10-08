# -*- coding: utf-8 -*-
"""Original HTML/CSS educational diagrams rendered with Playwright (no photos, AI-free).
Thumbnail uses the real Edwards E2M18 product photo (see thumb_build step), not regenerated here."""
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
.grid4 { display:grid; gap:16px; grid-template-columns:repeat(4,1fr); }
.box { border:1px solid #4b5a77; border-radius:18px; padding:22px; background:#202e48; }
.note { margin-top:22px; color:#b9c7de; font-size:22px; line-height:1.6; }
.n { display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; border-radius:50%; background:#314969; color:#9de5df; font-size:20px; margin-bottom:10px; }
"""

def html(body, extra=""):
    return f'<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>{CSS}{extra}</style></head><body>{body}</body></html>'

STAGES = html("""
<div id="card"><div class="eyebrow">WATER VAPOUR · 수증기압</div>
<h2>수분이 남아 있는 동안 압력은 여기서 머뭅니다</h2>
<div class="grid">
<div class="box"><h3>약 24 mbar (18 Torr)</h3><p>20℃에서 물의 포화 증기압<br>물이 다 빠질 때까지의 한계</p></div>
<div class="box"><h3>수분이 빠진 뒤</h3><p>압력이 다시 내려가<br>빈 챔버의 평소 도달압력에 접근</p></div>
</div><div class="note">재료 온도가 높으면 압력이 머무는 구간도 더 높아집니다.</div></div>
""")

PRESSURE = html("""
<div id="card"><div class="eyebrow">PUMP OPERATION · 펌프 운전</div>
<h2>수증기를 배기할 때 지킬 세 가지</h2>
<div class="grid3">
<div class="box"><div class="n">1</div><h3>미리 데우기</h3><p>흡입구를 닫고 운전<br>보통 최대 60분</p></div>
<div class="box"><div class="n">2</div><h3>발라스트 열기</h3><p>증기가 지나는 동안<br>계속 열어 둠</p></div>
<div class="box"><div class="n">3</div><h3>마무리 운전</h3><p>공정 후 흡입구를 막고<br>최소 20~30분</p></div>
</div><div class="note">오일씰 펌프와 드라이 펌프 모두에 해당합니다.</div></div>
""", ".grid3 { display:grid; gap:18px; grid-template-columns:repeat(3,1fr); }")

GAUGE = html("""
<div id="card"><div class="eyebrow">GAUGE LIMIT · 게이지의 한계</div>
<h2>피라니 게이지는 가스에 따라 달라집니다</h2>
<div class="grid">
<div class="box"><h3>APG200(피라니)</h3><p>측정범위 대기압~5×10⁻⁴ mbar<br>질소 기준 교정</p></div>
<div class="box"><h3>건조 공정 중</h3><p>수증기 비중이 높아<br>표시값이 실제와 다를 수 있음</p></div>
</div><div class="note">절댓값이 중요하면 가스 종류와 무관한 정전용량식 게이지를 씁니다.</div></div>
""")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1200, "height": 1400}, device_scale_factor=1)
    for name, markup, selector in [
        ("사진1.png", STAGES, "#card"),
        ("사진2.png", PRESSURE, "#card"),
        ("사진3.png", GAUGE, "#card"),
    ]:
        page.set_content(markup)
        page.evaluate("document.fonts.ready")
        page.locator(selector).screenshot(path=str(IMAGES / name))
        overflow = page.evaluate("""() => [...document.querySelectorAll('h1,h2,h3,p,.note')].filter(e=>{ const r=e.getBoundingClientRect(); const c=e.closest('#card').getBoundingClientRect(); return r.right>c.right-10 || r.left<c.left+10; }).map(e=>e.textContent.slice(0,30))""")
        if overflow:
            raise RuntimeError(f"Text overflow: {name}: {overflow}")
    browser.close()

report = {"method": "Body diagrams: Original HTML/CSS via Playwright. Thumbnail: real Edwards E2M18 product photo (public/images/products/e2m.png), see no-field-photo.md.", "images": {}}
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
        assert path.stat().st_size < 4 * 1024 * 1024
(BASE / "image-validation.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, ensure_ascii=False, indent=2))
