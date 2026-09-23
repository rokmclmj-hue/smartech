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
.n { display:inline-flex; align-items:center; justify-content:center; width:44px; height:44px; border-radius:50%; background:#314969; color:#9de5df; font-size:22px; margin-bottom:12px; }
"""

def html(body, extra=""):
    return f'<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>{CSS}{extra}</style></head><body>{body}</body></html>'

THUMBNAIL = html("""
<div id="thumb"><div class="wrap">
<div class="badge2">진공이론 · 진단</div>
<h1>펌프다운이<br>느려졌다면</h1>
<div class="sub">확인할 5가지 원인</div>
</div></div>
""", """
#thumb { width:1080px; height:1080px; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#1a1a2e,#16213e); }
.wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:110px; width:100%; padding:35px; }
.badge2 { font-size:56px; color:#a9bbdc; border:2px solid #50627e; border-radius:80px; padding:28px 56px; }
h1 { font-size:96px; line-height:1.35; letter-spacing:-2px; font-weight:800; }
.sub { font-size:52px; line-height:1.4; color:#bbc9de; }
""")

BALLAST = html("""
<div id="card"><div class="eyebrow">CAUSE 1 · 발라스트 밸브</div>
<h2>열려 있으면 도달압력에 이르지 못합니다</h2>
<div class="grid">
<div class="box"><h3>발라스트가 열려 있으면</h3><p>공기가 계속 유입되어<br>도달압력에 절대 이르지 못함<br>(Edwards)</p></div>
<div class="box"><h3>확인할 것</h3><p>수증기 처리 공정 후<br>밸브를 닫았는지<br>가장 먼저 확인</p></div>
</div><div class="note">Edwards가 꼽는 가장 흔한 원인입니다.</div></div>
""")

OIL = html("""
<div id="card"><div class="eyebrow">CAUSE 2 · 오일 상태</div>
<h2>오염된 오일이 과열·부식으로 이어집니다</h2>
<div class="grid">
<div class="box"><h3>오일 오염</h3><p>정품이 아니거나<br>관리되지 않은 오일</p></div>
<div class="box"><h3>결과</h3><p>과열 → 내부 산화<br>→ 부식으로 부품 손상<br>(Edwards)</p></div>
</div><div class="note">오일씰 펌프라면 오일 색·오일량을 먼저 확인합니다.</div></div>
""")

LEAK = html("""
<div id="card"><div class="eyebrow">CAUSE 3 · 작은 누설</div>
<h2>펌프가 더 세게 일하게 만듭니다</h2>
<div class="grid">
<div class="box"><h3>작은 누설이 있으면</h3><p>온도 상승 · 회전수 증가<br>에너지 소비 증가<br>(Edwards)</p></div>
<div class="box"><h3>점검 대상</h3><p>배관·플랜지 연결부<br>O링(시간이 지나면<br>다공질화·균열 가능)</p></div>
</div></div>
""")

DIAGNOSE = html("""
<div id="card"><div class="eyebrow">CAUSE 4 · 아웃가스 vs 누설</div>
<h2>압력 회복 속도로 구분합니다</h2>
<div class="grid">
<div class="box"><h3>회복 시간이 일정하면</h3><p>실제 누설이 있다는 뜻<br>(Leybold)</p></div>
<div class="box"><h3>회복 시간이 줄어들면</h3><p>아웃가스(가상 누설) 감소<br>다만 누설이 없다는<br>뜻은 아님</p></div>
</div><div class="note">두 현상이 동시에 일어나는 경우가 많아 완전히 분리하기는 어렵습니다.</div></div>
""")

SURFACE = html("""
<div id="card"><div class="eyebrow">CAUSE 5 · 표면 오염</div>
<h2>세정만으로 아웃가스를 크게 줄일 수 있습니다</h2>
<div class="grid">
<div class="box"><h3>줄이는 방법</h3><p>세정·베이크아웃<br>표면처리(연마)<br>패시베이션 · 건조가스 퍼지</p></div>
<div class="box"><h3>효과</h3><p>적절한 세정만으로<br>아웃가스율 50%~10만 배 감소<br>(Edwards)</p></div>
</div><div class="note">재료 준비가 충분하지 않으면 초고진공 도달이 어렵습니다.</div></div>
""")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1200, "height": 1400}, device_scale_factor=1)
    for name, markup, selector in [
        ("thumbnail.png", THUMBNAIL, "#thumb"),
        ("사진1.png", BALLAST, "#card"),
        ("사진2.png", OIL, "#card"),
        ("사진3.png", LEAK, "#card"),
        ("사진4.png", DIAGNOSE, "#card"),
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
