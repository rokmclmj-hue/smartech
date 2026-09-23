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
.grid3 { display:grid; gap:20px; grid-template-columns:repeat(3,1fr); }
.box { border:1px solid #4b5a77; border-radius:18px; padding:26px; background:#202e48; }
.note { margin-top:24px; color:#b9c7de; font-size:23px; line-height:1.6; }
.n { display:inline-flex; align-items:center; justify-content:center; width:46px; height:46px; border-radius:50%; background:#314969; color:#9de5df; font-size:24px; margin-bottom:14px; }
.badge { display:inline-block; font-size:20px; color:#9de5df; border:1px solid #4b5a77; border-radius:20px; padding:4px 14px; margin-bottom:10px; }
"""

def html(body, extra=""):
    return f'<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>{CSS}{extra}</style></head><body>{body}</body></html>'

THUMBNAIL = html("""
<div id="thumb"><div class="wrap">
<div class="badge2">이차전지 · 산업</div>
<h1>이차전지 공정<br>드라이펌프 선택법</h1>
<div class="sub">건조·전해액 탈기, 왜 오일 없는 펌프일까?</div>
</div></div>
""", """
#thumb { width:1080px; height:1080px; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#1a1a2e,#16213e); }
.wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:110px; width:100%; padding:35px; }
.badge2 { font-size:56px; color:#a9bbdc; border:2px solid #50627e; border-radius:80px; padding:28px 56px; }
h1 { font-size:92px; line-height:1.35; letter-spacing:-2px; font-weight:800; }
.sub { font-size:50px; line-height:1.4; color:#bbc9de; }
""")

STEPS = html("""
<div id="card"><div class="eyebrow">VACUUM STEPS · 진공 적용 단계</div>
<h2>혼합, 건조, 밀봉 세 단계에서 진공을 씁니다</h2>
<div class="grid3">
<div class="box"><div class="n">01</div><h3>슬러리 혼합</h3><p>페이스트에 기포가<br>들어가지 않도록 배기</p></div>
<div class="box"><div class="n">02</div><h3>전극 건조</h3><p>가혹한 조건에서<br>수분을 제거</p></div>
<div class="box"><div class="n">03</div><h3>파우치 밀봉</h3><p>전해액 주입 후<br>진공 상태에서 밀봉</p></div>
</div><div class="note">Edwards 설명 기준. 어느 모델을 어느 단계에 쓰는지는 명시되어 있지 않습니다.</div></div>
""")

DEGASSING = html("""
<div id="card"><div class="eyebrow">DEGASSING · 전해액 탈기</div>
<h2>0.1 mbar 미만을 안정적으로 유지해야 합니다</h2>
<div class="grid">
<div class="box"><h3>압력 요구</h3><p>탈기 공정은 안정적으로<br>0.1 mbar 미만 진공압력이 필요<br>(Edwards)</p></div>
<div class="box"><h3>공정가스</h3><p>디메톡시에탄(DME)<br>디옥솔레인<br>육불화인산리튬(LiPF6)</p></div>
</div><div class="note">공정가스가 오일씰 펌프의 기어박스에 유입되면 오일이 쉽게 오염됩니다.</div></div>
""")

DRY = html("""
<div id="card"><div class="eyebrow">WHY DRY · 드라이펌프가 유리한 이유</div>
<h2>씰링 구조가 기어오일 오염을 막습니다</h2>
<div class="grid">
<div class="box"><h3>오일식 펌프</h3><p>공정가스가 기어박스로 유입되면<br>오일이 오염되어<br>잦은 오일 교환이 필요</p></div>
<div class="box"><h3>GXS 드라이펌프</h3><p>진보된 씰링 기술로<br>공정 물질의 기어박스 유입을 차단<br>(Edwards)</p></div>
</div><div class="note">GXS는 스크류 방식 드라이펌프이며, Edwards GXS 브로슈어 Drying 항목에 이차전지 건조가 명시되어 있습니다.</div></div>
""")

COMBO = html("""
<div id="card"><div class="eyebrow">SIZING · 조합 선정</div>
<h2>모델·조합은 공정 조건에 따라 달라집니다</h2>
<div class="grid">
<div class="box"><h3>확인할 조건</h3><p>셀 크기(파우치/각형)<br>챔버 용적<br>목표 탈기 사이클 시간</p></div>
<div class="box"><h3>주의할 점</h3><p>이차전지 전용 특정<br>부스터 조합을 명시한<br>공식 자료는 확인되지 않음</p></div>
</div><div class="note">일반 조합표만으로 모델을 단정하지 않고 실제 공정 조건으로 확인합니다.</div></div>
""")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1200, "height": 1400}, device_scale_factor=1)
    for name, markup, selector in [
        ("thumbnail.png", THUMBNAIL, "#thumb"),
        ("사진1.png", STEPS, "#card"),
        ("사진2.png", DEGASSING, "#card"),
        ("사진3.png", DRY, "#card"),
        ("사진4.png", COMBO, "#card"),
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
