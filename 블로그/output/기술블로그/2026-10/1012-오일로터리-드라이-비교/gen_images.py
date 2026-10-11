# -*- coding: utf-8 -*-
"""Body diagrams: Original HTML/CSS via Playwright (no AI images).
Thumbnail: Edwards RV / nXDS product photos (public/images/products/rv.jpeg, xds.jpeg) on a title card.
사진2.png is the blurred field photo made by blur_photo.py (not generated here)."""
from pathlib import Path
import base64
import json
from playwright.sync_api import sync_playwright
from PIL import Image

BASE = Path(__file__).resolve().parent
IMAGES = BASE / "images"
IMAGES.mkdir(exist_ok=True)
PRODUCTS = BASE.parents[4] / "public" / "images" / "products"


def data_uri(name):
    return "data:image/jpeg;base64," + base64.b64encode((PRODUCTS / name).read_bytes()).decode()


CSS = """
* { box-sizing:border-box; margin:0; padding:0; }
body { color:#fff; font-family:'Pretendard Variable','Pretendard','Malgun Gothic',sans-serif; }
#card { width:1200px; padding:40px; background:linear-gradient(135deg,#1a1a2e,#16213e); }
.eyebrow { color:#a9bbdc; font-size:24px; letter-spacing:2px; margin-bottom:14px; }
h2 { font-size:42px; line-height:1.4; margin-bottom:26px; letter-spacing:-1px; }
h3 { font-size:29px; line-height:1.4; margin-bottom:12px; }
p { color:#cbd5e5; font-size:24px; line-height:1.6; word-break:keep-all; }
.grid { display:grid; gap:20px; grid-template-columns:1fr 1fr; }
.box { border:1px solid #4b5a77; border-radius:18px; padding:22px; background:#202e48; }
.note { margin-top:22px; color:#b9c7de; font-size:22px; line-height:1.6; }
.tag { display:inline-block; padding:6px 16px; border-radius:999px; background:#314969; color:#9de5df; font-size:21px; margin-bottom:12px; }
ul { list-style:none; }
li { color:#cbd5e5; font-size:24px; line-height:1.55; padding:7px 0 7px 26px; position:relative; word-break:keep-all; }
li:before { content:''; position:absolute; left:4px; top:21px; width:9px; height:9px; border-radius:50%; background:#9de5df; }
.row { display:grid; grid-template-columns:250px 1fr 1fr; gap:14px; margin-bottom:14px; }
.cell { border:1px solid #4b5a77; border-radius:14px; padding:18px 20px; background:#202e48; font-size:27px; line-height:1.4; }
.head { background:#314969; color:#fff; font-weight:700; }
.label { background:transparent; border:none; color:#a9bbdc; font-size:24px; padding-left:4px; display:flex; align-items:center; }
.small { display:block; color:#a9bbdc; font-size:20px; margin-top:4px; }
"""


def html(body, extra=""):
    return f'<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>{CSS}{extra}</style></head><body>{body}</body></html>'


THUMB = html(f"""
<div id="thumb"><div class="pill">진공펌프 선택</div>
<h1>오일로터리펌프<br>vs 드라이펌프</h1>
<div class="sub">무엇이 다르고 언제 바꿀까</div>
<div class="photos"><div class="ph"><img src="{data_uri('rv.jpeg')}"></div><div class="ph"><img src="{data_uri('xds.jpeg')}"></div></div>
</div>
""", """
#thumb { width:1080px; height:1080px; background:linear-gradient(135deg,#1a1a2e,#16213e); display:flex; flex-direction:column; align-items:center; padding:64px 60px 0; }
.pill { font-size:44px; padding:18px 48px; border-radius:999px; background:#314969; color:#9de5df; margin-bottom:38px; }
h1 { font-size:104px; line-height:1.25; text-align:center; letter-spacing:-3px; margin-bottom:28px; }
.sub { font-size:50px; color:#cbd5e5; margin-bottom:44px; }
.photos { display:grid; grid-template-columns:1fr 1fr; gap:28px; width:100%; }
.ph { background:#fff; border-radius:26px; height:400px; display:flex; align-items:center; justify-content:center; overflow:hidden; }
.ph img { max-width:94%; max-height:94%; }
""")

CRITERIA = html("""
<div id="card"><div class="eyebrow">DECISION · 판단 기준</div>
<h2>바꿀 때와 그대로 쓸 때</h2>
<div class="grid">
<div class="box"><div class="tag">드라이펌프로 교체 검토</div><ul>
<li>오일이 공정·제품에 닿으면 안 됨</li>
<li>오일 교환 주기가 계속 짧아짐</li>
<li>오일 미스트·폐오일 처리가 어려움</li>
<li>펌프를 살펴볼 사람이 없음</li></ul></div>
<div class="box"><div class="tag">오일로터리펌프 유지</div><ul>
<li>더 낮은 도달압력이 필요함</li>
<li>수분이 많은 일반 용도</li>
<li>오일 관리가 자리 잡혀 문제없음</li>
<li>초기 비용이 우선</li></ul></div>
</div><div class="note">비용은 오일·필터·폐유 처리·정지 시간까지 더한 몇 년 치로 비교합니다.</div></div>
""")

SPECS = html("""
<div id="card"><div class="eyebrow">SPEC · 같은 급 비교</div>
<h2>RV12와 nXDS15i, 수치로 보면</h2>
<div class="row"><div class="cell label"></div><div class="cell head">RV12<span class="small" style="color:#cfe0f5">오일로터리펌프</span></div><div class="cell head">nXDS15i<span class="small" style="color:#cfe0f5">드라이 스크롤펌프</span></div></div>
<div class="row"><div class="cell label">배기속도</div><div class="cell">12 m³/h<span class="small">50 Hz 기준</span></div><div class="cell">15.1 m³/h</div></div>
<div class="row"><div class="cell label">도달압력</div><div class="cell">2.0×10⁻³ mbar</div><div class="cell">7×10⁻³ mbar</div></div>
<div class="row"><div class="cell label">수증기 처리량</div><div class="cell">최대 290 g/h<span class="small">가스 발라스트 2단</span></div><div class="cell">최대 240 g/h</div></div>
<div class="note">도달압력은 오일로터리펌프가 더 낮고, 수증기 처리량은 비슷한 수준입니다.</div></div>
""")

CARE = html("""
<div id="card"><div class="eyebrow">MAINTENANCE · 관리 항목</div>
<h2>관리해야 하는 것이 다릅니다</h2>
<div class="grid">
<div class="box"><h3>오일로터리펌프</h3><ul>
<li>오일 양·색 확인과 교환</li>
<li>배기 쪽 미스트 필터 관리</li>
<li>폐오일 처리</li>
<li>구조가 단순해 정비하기 쉬움</li></ul></div>
<div class="box"><h3>드라이 스크롤펌프</h3><ul>
<li>오일 보충·교환·폐기 없음</li>
<li>팁씰과 베어링은 교체 부품</li>
<li>분진이 있으면 흡입 필터 검토</li>
<li>정비 주기는 사용 조건에 따라 다름</li></ul></div>
</div><div class="note">드라이펌프도 정비가 없는 펌프는 아닙니다.</div></div>
""")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1200, "height": 1400}, device_scale_factor=1)
    for name, markup, selector in [
        ("thumbnail.png", THUMB, "#thumb"),
        ("사진1.png", CRITERIA, "#card"),
        ("사진3.png", SPECS, "#card"),
        ("사진4.png", CARE, "#card"),
    ]:
        page.set_content(markup)
        page.evaluate("document.fonts.ready")
        page.wait_for_timeout(200)
        page.locator(selector).screenshot(path=str(IMAGES / name))
        overflow = page.evaluate("""(sel) => { const c=document.querySelector(sel).getBoundingClientRect(); return [...document.querySelectorAll('h1,h2,h3,p,li,.note,.cell,.sub')].filter(e=>{ const r=e.getBoundingClientRect(); return r.right>c.right-10 || r.left<c.left+10 || e.scrollWidth>e.clientWidth+1; }).map(e=>e.textContent.slice(0,30)); }""", selector)
        if overflow:
            raise RuntimeError(f"Text overflow: {name}: {overflow}")
    browser.close()

report = {"method": "사진1·3·4: Original HTML/CSS via Playwright. 사진2: field photo (data/현장사진/06_비교도식/nXDS10i_분석장비 SEM.jpg) blurred with blur_photo.py. Thumbnail: Edwards RV and nXDS product photos (public/images/products/rv.jpeg, xds.jpeg) on a title card.", "images": {}}
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
            assert margins["top_percent"] <= 20 and margins["bottom_percent"] <= 20, margins
        assert path.stat().st_size < 4 * 1024 * 1024
(BASE / "image-validation.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, ensure_ascii=False, indent=2))
