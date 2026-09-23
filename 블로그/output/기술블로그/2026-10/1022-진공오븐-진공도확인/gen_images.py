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
<div id="card"><div class="eyebrow">DRYING STAGES · 건조 4단계</div>
<h2>배기부터 응축기 우회까지</h2>
<div class="grid4">
<div class="box"><div class="n">A</div><h3>배기</h3><p>가스 발라스트+루츠펌프로<br>용기 배기</p></div>
<div class="box"><div class="n">B</div><h3>콘덴서 연결</h3><p>수증기압 상승 시<br>콘덴서 2개 연결</p></div>
<div class="box"><div class="n">C</div><h3>메인 우회</h3><p>메인 콘덴서<br>우회</p></div>
<div class="box"><div class="n">D</div><h3>중간 우회</h3><p>중간 콘덴서<br>우회</p></div>
</div><div class="note">Leybold 배치식 건조 공정 설명 기준.</div></div>
""")

PRESSURE = html("""
<div id="card"><div class="eyebrow">PRESSURE THRESHOLD · 압력 전환점</div>
<h2>특정 압력 아래로 떨어지면 구성이 바뀝니다</h2>
<div class="grid">
<div class="box"><h3>27 mbar 이하</h3><p>루츠펌프 추가 가동<br>(Leybold 예시)</p></div>
<div class="box"><h3>약 6.5×10⁻² mbar</h3><p>최종 건조 단계 목표<br>(Leybold 예시)</p></div>
</div><div class="note">특정 건조 공정 예시 수치이며 모든 설비의 절대 기준은 아닙니다. 로터리베인 펌프 수증기 허용치는 예시 자료 기준 60 mbar.</div></div>
""")

GAUGE = html("""
<div id="card"><div class="eyebrow">GAUGE LIMIT · 게이지의 한계</div>
<h2>피라니 게이지는 가스에 따라 달라집니다</h2>
<div class="grid">
<div class="box"><h3>APG200(피라니)</h3><p>측정범위 대기압~5×10⁻⁴ mbar<br>질소 기준 교정</p></div>
<div class="box"><h3>건조 공정 중</h3><p>수증기 비중이 높아<br>표시값이 실제와 다를 수 있음</p></div>
</div><div class="note">수증기 전용 보정계수 수치는 확인하지 못했습니다.</div></div>
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
