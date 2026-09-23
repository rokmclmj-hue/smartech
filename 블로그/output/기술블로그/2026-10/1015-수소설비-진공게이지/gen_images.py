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
.formula { font-size:32px; color:#9de5df; text-align:center; margin:12px 0; }
"""

def html(body, extra=""):
    return f'<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>{CSS}{extra}</style></head><body>{body}</body></html>'

THUMBNAIL = html("""
<div id="thumb"><div class="wrap">
<div class="badge2">수소 · 산업</div>
<h1>수소 설비<br>진공게이지 오차</h1>
<div class="sub">왜 눈금이 다르게 나올까?</div>
</div></div>
""", """
#thumb { width:1080px; height:1080px; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#1a1a2e,#16213e); }
.wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:130px; width:100%; padding:35px; }
.badge2 { font-size:52px; color:#a9bbdc; border:2px solid #50627e; border-radius:80px; padding:26px 52px; }
h1 { font-size:84px; line-height:1.35; letter-spacing:-2px; font-weight:800; }
.sub { font-size:48px; line-height:1.4; color:#bbc9de; }
""")

CALIBRATION = html("""
<div id="card"><div class="eyebrow">CALIBRATION · 교정 기준</div>
<h2>게이지는 질소 기준으로 교정됩니다</h2>
<div class="formula">Pi = (SN2 ÷ Si) × PN2</div>
<div class="grid">
<div class="box"><h3>질소를 측정하면</h3><p>보정계수 = 1<br>표시값 = 실제 압력</p></div>
<div class="box"><h3>수소를 측정하면</h3><p>보정계수가 1이 아님<br>표시값 ≠ 실제 압력<br>(Edwards)</p></div>
</div><div class="note">수소 전용 보정계수 수치는 이번 조사에서 확인하지 못했습니다.</div></div>
""")

GASDEP = html("""
<div id="card"><div class="eyebrow">GAS DEPENDENCE · 방식별 의존성</div>
<h2>피라니·이온화 게이지 모두 가스에 영향받습니다</h2>
<div class="grid">
<div class="box"><h3>피라니(열식)</h3><p>가스별 열전도도가 달라<br>표시값이 달라짐</p></div>
<div class="box"><h3>이온화 게이지</h3><p>가스별 이온화 확률이 달라<br>표시값이 달라짐<br>(예: 헬륨은 낮게 표시)</p></div>
</div><div class="note">Pfeiffer 설명 기준.</div></div>
""")

CAPACITANCE = html("""
<div id="card"><div class="eyebrow">GAS-INDEPENDENT · 예외 방식</div>
<h2>정전용량식은 가스와 무관합니다</h2>
<div class="grid">
<div class="box"><h3>정전용량식(다이어프램)</h3><p>막을 미는 힘 자체를 측정<br>가스 종류와 무관 (Pfeiffer)</p></div>
<div class="box"><h3>스마텍 취급 게이지</h3><p>APG200·AIM200·WRG200<br>모두 가스 의존적 방식</p></div>
</div><div class="note">스마텍이 정전용량식 제품을 취급한다는 근거는 확인되지 않았습니다.</div></div>
""")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1200, "height": 1400}, device_scale_factor=1)
    for name, markup, selector in [
        ("thumbnail.png", THUMBNAIL, "#thumb"),
        ("사진1.png", CALIBRATION, "#card"),
        ("사진2.png", GASDEP, "#card"),
        ("사진3.png", CAPACITANCE, "#card"),
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
