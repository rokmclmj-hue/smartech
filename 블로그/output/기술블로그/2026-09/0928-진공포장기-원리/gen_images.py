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
h2 { font-size:46px; line-height:1.4; margin-bottom:28px; letter-spacing:-1px; }
h3 { font-size:32px; line-height:1.4; margin-bottom:14px; }
p { color:#cbd5e5; font-size:26px; line-height:1.65; word-break:keep-all; }
.grid { display:grid; gap:22px; grid-template-columns:1fr 1fr; }
.box { border:1px solid #4b5a77; border-radius:18px; padding:28px; background:#202e48; }
.note { margin-top:24px; color:#b9c7de; font-size:24px; line-height:1.6; }
.n { display:inline-flex; align-items:center; justify-content:center; width:48px; height:48px; border-radius:50%; background:#314969; color:#9de5df; font-size:25px; margin-bottom:16px; }
.bar { height:44px; border-radius:8px; background:#8cded9; }
.row { display:grid; grid-template-columns:330px 1fr 190px; align-items:center; gap:18px; margin-bottom:22px; font-size:26px; }
.row .lab { color:#cbd5e5; } .row .val { color:#9de5df; font-weight:700; text-align:right; }
.track { background:#314969; border-radius:8px; height:44px; }
"""

def html(body, extra=""):
    return f'<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>{CSS}{extra}</style></head><body>{body}</body></html>'

THUMBNAIL = html("""
<div id="thumb"><div class="wrap">
<div class="badge">진공 실생활</div>
<h1>진공 포장기의<br>원리</h1>
<div class="sub">공기를 빼면 무엇이 달라질까?</div>
</div></div>
""", """
#thumb { width:1080px; height:1080px; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#1a1a2e,#16213e); }
.wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:132px; width:100%; padding:35px; }
.badge { font-size:60px; color:#a9bbdc; border:2px solid #50627e; border-radius:80px; padding:32px 64px; }
h1 { font-size:108px; line-height:1.3; letter-spacing:-3px; font-weight:800; white-space:nowrap; }
.sub { font-size:60px; line-height:1.4; color:#bbc9de; }
""")

CYCLE = html("""
<div id="card"><div class="eyebrow">ONE CYCLE · 한 사이클</div>
<h2>배기, 밀봉, 대기 개방 순서로 진행됩니다</h2>
<div class="grid" style="grid-template-columns:repeat(3,1fr)">
<div class="box"><div class="n">01</div><h3>배기</h3><p>봉지 안 공기를<br>펌프가 뽑아냅니다.</p></div>
<div class="box"><div class="n">02</div><h3>밀봉</h3><p>원하는 압력에서<br>열로 봉지 입구를 봉합니다.</p></div>
<div class="box"><div class="n">03</div><h3>대기 개방</h3><p>바깥 공기가 들어오면<br>봉지가 제품에 밀착됩니다.</p></div>
</div><div class="note">설명용 도식입니다. 기기별 세부 순서와 시간은 다를 수 있습니다.</div></div>
""")

OXYGEN = html("""
<div id="card"><div class="eyebrow">REMAINING OXYGEN · 계산 추정</div>
<h2>최종 압력이 낮을수록 산소가 적게 남습니다</h2>
<div class="row"><span class="lab">101,325 Pa (대기압)</span><div class="track"><div class="bar" style="width:100%"></div></div><span class="val">약 100%</span></div>
<div class="row"><span class="lab">약 50,000 Pa</span><div class="track"><div class="bar" style="width:49%"></div></div><span class="val">약 절반</span></div>
<div class="row"><span class="lab">약 10,000 Pa</span><div class="track"><div class="bar" style="width:10%"></div></div><span class="val">약 10%</span></div>
<div class="row"><span class="lab">약 1,000 Pa</span><div class="track"><div class="bar" style="width:1%"></div></div><span class="val">약 1%</span></div>
<div class="note">남는 산소 비율 ≈ 최종 압력 ÷ 101,325 Pa (직접 계산한 추정치, 실측 아님).<br>식품에서 나오는 수분·가스와 봉지 안 잔류 공기는 포함하지 않았습니다.</div></div>
""")

LIMITS = html("""
<div id="card"><div class="eyebrow">WHAT IT DOES · 한계</div>
<h2>진공 포장은 냉장·냉동을 대신하지 않습니다</h2>
<div class="grid">
<div class="box"><h3>늦춰 주는 것</h3><p>산소를 쓰는 부패균과<br>곰팡이의 성장 속도.</p></div>
<div class="box"><h3>대신하지 못하는 것</h3><p>산소 없이 자라는 균에 대한 방어.<br>냉장·냉동 보관이 여전히 필요합니다.</p></div>
</div><div class="note">FDA 수산물 지침 기준: 냉장이 유일한 방어선인 제품은 3.3°C(38°F) 이하 유지.<br>어류 대상 지침이므로 모든 식품에 그대로 적용하지 않습니다.</div></div>
""")

BALLAST = html("""
<div id="card"><div class="eyebrow">GAS BALLAST · 수증기 응축 방지</div>
<h2>가스 발라스트는 응축 전에 수증기를 내보냅니다</h2>
<div class="grid">
<div class="box"><h3>발라스트 없이</h3><p>수증기가 압축되며 응축되어<br>오일과 섞여 윤활이 나빠집니다.</p></div>
<div class="box"><h3>발라스트를 열면</h3><p>압축 전에 소량의 공기를 넣어<br>압축비를 최대 10:1로 낮추고<br>수증기를 응축 전에 내보냅니다.</p></div>
</div><div class="note">Leybold 설명 기준. 펌프가 운전 온도에 있고 발라스트 밸브가 열려 있어야 합니다.</div></div>
""")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1200, "height": 1400}, device_scale_factor=1)
    for name, markup, selector in [
        ("thumbnail.png", THUMBNAIL, "#thumb"),
        ("사진1.png", CYCLE, "#card"),
        ("사진2.png", OXYGEN, "#card"),
        ("사진3.png", LIMITS, "#card"),
        ("사진4.png", BALLAST, "#card"),
    ]:
        page.set_content(markup)
        page.evaluate("document.fonts.ready")
        page.locator(selector).screenshot(path=str(IMAGES / name))
        overflow = page.evaluate("""() => [...document.querySelectorAll('h1,h2,h3,p,.sub,.badge,.note,.row span')].filter(e=>{ const r=e.getBoundingClientRect(); const c=e.closest('#card,#thumb').getBoundingClientRect(); return r.right>c.right-10 || r.left<c.left+10; }).map(e=>e.textContent.slice(0,30))""")
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
