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
h2 { font-size:44px; line-height:1.4; margin-bottom:28px; letter-spacing:-1px; }
h3 { font-size:30px; line-height:1.4; margin-bottom:14px; }
p { color:#cbd5e5; font-size:25px; line-height:1.65; word-break:keep-all; }
.grid { display:grid; gap:22px; grid-template-columns:1fr 1fr; }
.box { border:1px solid #4b5a77; border-radius:18px; padding:26px; background:#202e48; }
.note { margin-top:24px; color:#b9c7de; font-size:23px; line-height:1.6; }
.formula { font-size:40px; color:#9de5df; text-align:center; margin:16px 0; }
.diagram { position:relative; height:220px; margin:10px 0; }
.cup { position:absolute; left:50%; transform:translateX(-50%); }
.arrow-in { font-size:50px; color:#8cded9; text-align:center; }
"""

def html(body, extra=""):
    return f'<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>{CSS}{extra}</style></head><body>{body}</body></html>'

THUMBNAIL = html("""
<div id="thumb"><div class="wrap">
<div class="badge2">진공 실생활</div>
<h1>진공 흡착의<br>원리</h1>
<div class="sub">압착 컵은 왜 벽에 붙을까?</div>
</div></div>
""", """
#thumb { width:1080px; height:1080px; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#1a1a2e,#16213e); }
.wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:110px; width:100%; padding:35px; }
.badge2 { font-size:56px; color:#a9bbdc; border:2px solid #50627e; border-radius:80px; padding:28px 56px; }
h1 { font-size:100px; line-height:1.35; letter-spacing:-2px; font-weight:800; }
.sub { font-size:52px; line-height:1.4; color:#bbc9de; }
""")

FORCE = html("""
<div id="card"><div class="eyebrow">FORCE · 힘 계산</div>
<h2>흡착력 = 압력 차이 × 접촉 면적</h2>
<div class="formula">F = ΔP × A</div>
<div class="grid">
<div class="box"><h3>조건</h3><p>지름 10cm 컵<br>면적 약 0.00785 m²<br>완전 진공(0 Pa) 가정</p></div>
<div class="box"><h3>계산 결과</h3><p>101,325 Pa × 0.00785 m²<br>≈ 795 N (약 81kgf)</p></div>
</div><div class="note">직접 계산한 이상적인 상한값입니다. 특정 제품의 정격 흡착력이 아닙니다.</div></div>
""")

SURFACE = html("""
<div id="card"><div class="eyebrow">SURFACE · 표면 상태</div>
<h2>매끈할수록 흡착력이 오래 유지됩니다</h2>
<div class="grid">
<div class="box"><h3>매끈한 표면(유리·타일)</h3><p>컵 테두리와 완전히 밀착되어<br>공기가 다시 들어오기 어려움</p></div>
<div class="box"><h3>거친 표면(벽지·콘크리트)</h3><p>미세한 틈이 남아<br>공기가 서서히 다시 들어옴</p></div>
</div><div class="note">틈으로 공기가 들어오면 압력 차이가 줄어 흡착력이 떨어집니다.</div></div>
""")

SOURCE = html("""
<div id="card"><div class="eyebrow">VACUUM SOURCE · 지속적인 진공 생성</div>
<h2>산업 현장은 진공을 계속 만들어야 합니다</h2>
<div class="grid">
<div class="box"><h3>벤츄리 이젝터</h3><p>압축공기를 좁은 통로로 흘려<br>옆 통로의 공기를 함께 빨아들임<br>(압축공기 설비가 있을 때 간단)</p></div>
<div class="box"><h3>진공펌프</h3><p>압축공기 없이도<br>더 큰 유량을 지속적으로 배기</p></div>
</div><div class="note">업계에 일반적으로 알려진 구분이며, 정량적 성능 비교 자료는 확인하지 못했습니다.</div></div>
""")

SAFETY = html("""
<div id="card"><div class="eyebrow">SAFETY · 정전 대비</div>
<h2>진공원이 멈춰도 바로 떨어지지 않게</h2>
<div class="grid">
<div class="box"><h3>예비 저장(리저버)</h3><p>진공을 잠시 저장해<br>정전 시에도 흡착 유지</p></div>
<div class="box"><h3>체크밸브</h3><p>진공원이 멈춰도<br>저장된 진공이 새지 않게 차단</p></div>
</div><div class="note">업계에 일반적으로 알려진 설계 개념입니다. 특정 제품의 실제 탑재 기능은 아닙니다.</div></div>
""")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1200, "height": 1400}, device_scale_factor=1)
    for name, markup, selector in [
        ("thumbnail.png", THUMBNAIL, "#thumb"),
        ("사진1.png", FORCE, "#card"),
        ("사진2.png", SURFACE, "#card"),
        ("사진3.png", SOURCE, "#card"),
        ("사진4.png", SAFETY, "#card"),
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
