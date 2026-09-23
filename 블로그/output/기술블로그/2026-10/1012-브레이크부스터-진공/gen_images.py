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
h2 { font-size:44px; line-height:1.4; margin-bottom:26px; letter-spacing:-1px; }
h3 { font-size:30px; line-height:1.4; margin-bottom:12px; }
p { color:#cbd5e5; font-size:25px; line-height:1.6; word-break:keep-all; }
.grid { display:grid; gap:22px; grid-template-columns:1fr 1fr; }
.box { border:1px solid #4b5a77; border-radius:18px; padding:26px; background:#202e48; }
.note { margin-top:22px; color:#b9c7de; font-size:23px; line-height:1.6; }
.formula { font-size:38px; color:#9de5df; text-align:center; margin:14px 0; }
"""

def html(body, extra=""):
    return f'<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>{CSS}{extra}</style></head><body>{body}</body></html>'

THUMBNAIL = html("""
<div id="thumb"><div class="wrap">
<div class="badge2">진공 실생활</div>
<h1>브레이크 부스터의<br>진공 원리</h1>
<div class="sub">페달이 가벼운 이유</div>
</div></div>
""", """
#thumb { width:1080px; height:1080px; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#1a1a2e,#16213e); }
.wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:130px; width:100%; padding:35px; }
.badge2 { font-size:52px; color:#a9bbdc; border:2px solid #50627e; border-radius:80px; padding:26px 52px; }
h1 { font-size:88px; line-height:1.35; letter-spacing:-2px; font-weight:800; }
.sub { font-size:50px; line-height:1.4; color:#bbc9de; }
""")

CHAMBERS = html("""
<div id="card"><div class="eyebrow">TWO CHAMBERS · 압력 차이</div>
<h2>페달 쪽만 대기와 연결됩니다</h2>
<div class="formula">F = ΔP × A</div>
<div class="grid">
<div class="box"><h3>평소</h3><p>두 방 모두 진공과 연결<br>압력이 같음</p></div>
<div class="box"><h3>페달을 밟으면</h3><p>페달 쪽만 대기 연결<br>반대쪽은 진공 유지 → 압력차 발생</p></div>
</div><div class="note">예시 계산: 지름 20cm 다이어프램 × 101,325 Pa ≈ 3,182 N(약 324kgf). 실제 차종 수치 아님.</div></div>
""")

SOURCE = html("""
<div id="card"><div class="eyebrow">VACUUM SOURCE · 진공은 어디서</div>
<h2>엔진 종류에 따라 공급 방식이 다릅니다</h2>
<div class="grid">
<div class="box"><h3>자연흡기 엔진</h3><p>흡입 행정 중 흡기다기관에<br>생기는 진공을 그대로 사용</p></div>
<div class="box"><h3>터보·디젤 엔진</h3><p>진공이 잘 안 생기거나 불안정<br>→ 별도 보조 진공펌프 사용</p></div>
</div></div>
""")

MISCONCEPTION = html("""
<div id="card"><div class="eyebrow">MYTH · 흔한 오해</div>
<h2>진공이 없어져도 브레이크는 됩니다</h2>
<div class="grid">
<div class="box"><h3>잘못된 통념</h3><p>"진공이 없으면<br>브레이크가 아예 안 된다"</p></div>
<div class="box"><h3>실제로는</h3><p>배력만 사라지고<br>제동 자체는 가능<br>(단, 훨씬 세게 밟아야 함)</p></div>
</div><div class="note">체크밸브가 잔여 진공을 한동안 유지해 시동 꺼진 후에도 몇 번은 배력이 남습니다.</div></div>
""")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1200, "height": 1400}, device_scale_factor=1)
    for name, markup, selector in [
        ("thumbnail.png", THUMBNAIL, "#thumb"),
        ("사진1.png", CHAMBERS, "#card"),
        ("사진2.png", SOURCE, "#card"),
        ("사진3.png", MISCONCEPTION, "#card"),
    ]:
        page.set_content(markup)
        page.evaluate("document.fonts.ready")
        page.locator(selector).screenshot(path=str(IMAGES / name))
        overflow = page.evaluate("""() => [...document.querySelectorAll('h1,h2,h3,p,.sub,.badge2,.note,.formula')].filter(e=>{ const r=e.getBoundingClientRect(); const c=e.closest('#card,#thumb').getBoundingClientRect(); return r.right>c.right-10 || r.left<c.left+10; }).map(e=>e.textContent.slice(0,30))""")
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
