# -*- coding: utf-8 -*-
"""Body diagrams: Original HTML/CSS via Playwright. Thumbnail uses the real Edwards GXS product photo (public/images/products/gxs.jpeg), built in this script (see thumb_build step, not regenerated here)."""
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
"""

def html(body, extra=""):
    return f'<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>{CSS}{extra}</style></head><body>{body}</body></html>'

import base64
_photo = base64.b64encode((BASE.parents[4] / "public" / "images" / "products" / "gxs.jpeg").read_bytes()).decode()
THUMB = html(f"""
<div id="thumb"><div class="pill">태양광 · 산업</div>
<div class="panel"><img src="data:image/jpeg;base64,{_photo}"></div>
<div class="t1">태양광 생산라인<br>진공펌프 선택</div>
<div class="t2">드라이펌프와 오일로터리</div></div>
""", """
#thumb { width:1080px; height:1080px; background:linear-gradient(135deg,#1a1a2e,#16213e); display:flex; flex-direction:column; align-items:center; padding:76px 90px 0; }
.pill { border:2px solid #4b5a77; border-radius:60px; padding:18px 48px; color:#a9bbdc; font-size:46px; letter-spacing:4px; }
.panel { margin-top:38px; width:900px; height:500px; background:#fff; border-radius:36px; display:flex; align-items:center; justify-content:center; overflow:hidden; }
.panel img { max-width:86%; max-height:86%; object-fit:contain; }
.t1 { margin-top:44px; font-size:72px; font-weight:700; line-height:1.3; text-align:center; letter-spacing:2px; }
.t2 { margin-top:26px; font-size:40px; color:#a9bbdc; letter-spacing:2px; }
""")

STANDARD = html("""
<div id="card"><div class="eyebrow">SOLAR PROCESS · 태양광 공정과 펌프</div>
<h2>태양광 공정 전체에 드라이펌프가 쓰입니다</h2>
<div class="grid">
<div class="box"><h3>제조 방식</h3><p>결정질 실리콘 · CdTe<br>CIGS · 실리콘 박막</p></div>
<div class="box"><h3>펌프 구성</h3><p>드라이 진공펌프 + 터보분자펌프<br>+ 배기가스 처리 시스템</p></div>
</div><div class="note">제품군: iXM·iXH·iXL(드라이), GXS·EDS(드라이 스크류), STP(터보분자).</div></div>
""")

DRY_SHIFT = html("""
<div id="card"><div class="eyebrow">WHY DRY · 드라이펌프인 이유</div>
<h2>드라이 스크류 펌프가 맞는 세 가지 이유</h2>
<div class="grid3">
<div class="box"><div class="n">1</div><h3>폐오일 없음</h3><p>오일 교환과<br>폐유 처리가 없음</p></div>
<div class="box"><div class="n">2</div><h3>오일 차단</h3><p>씰 퍼지로 진공 공간에<br>오일이 들어가지 않음</p></div>
<div class="box"><div class="n">3</div><h3>분말·액체 내성</h3><p>물 5 L · 분말 1 kg<br>투입 시험 통과</p></div>
</div><div class="note">GXS 도달진공 5×10⁻⁴ mbar. 분말이 많은 공정에는 흡입구 필터를 함께 씁니다.</div></div>
""", ".grid3 { display:grid; gap:18px; grid-template-columns:repeat(3,1fr); } .n { display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; border-radius:50%; background:#314969; color:#9de5df; font-size:20px; margin-bottom:10px; }")

OIL_CHOICE = html("""
<div id="card"><div class="eyebrow">OIL CHOICE · 오일 선택 기준</div>
<h2>산소가 관여하면 PFPE 오일을 씁니다</h2>
<div class="grid">
<div class="box"><h3>일반 탄화수소 오일</h3><p>일반 공정용<br>산소 풍부 환경에서<br>반응성 우려</p></div>
<div class="box"><h3>PFPE 오일(FX 사양)</h3><p>산소 농도 21% 초과<br>혼합가스 배기용<br>(Edwards E2M FX)</p></div>
</div><div class="note">오일 선택은 씰링재·배관 재질을 포함한 시스템 전체 검토의 일부입니다.</div></div>
""")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1200, "height": 1400}, device_scale_factor=1)
    for name, markup, selector in [
        ("thumbnail.png", THUMB, "#thumb"),
        ("사진1.png", STANDARD, "#card"),
        ("사진2.png", DRY_SHIFT, "#card"),
        ("사진3.png", OIL_CHOICE, "#card"),
    ]:
        page.set_content(markup)
        page.evaluate("document.fonts.ready")
        page.locator(selector).screenshot(path=str(IMAGES / name))
        if selector != "#card":
            continue
        overflow = page.evaluate("""() => [...document.querySelectorAll('h1,h2,h3,p,.note')].filter(e=>{ const r=e.getBoundingClientRect(); const c=e.closest('#card').getBoundingClientRect(); return r.right>c.right-10 || r.left<c.left+10; }).map(e=>e.textContent.slice(0,30))""")
        if overflow:
            raise RuntimeError(f"Text overflow: {name}: {overflow}")
    browser.close()

report = {"method": "Body diagrams: Original HTML/CSS via Playwright. Thumbnail: real Edwards E2M product photo (public/images/products/e2m-large.png), see no-field-photo.md.", "images": {}}
for path in sorted(IMAGES.glob("*.png")):
    with Image.open(path) as im:
        report["images"][path.name] = {"width": im.width, "height": im.height, "bytes": path.stat().st_size}
        assert path.stat().st_size < 4 * 1024 * 1024
(BASE / "image-validation.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, ensure_ascii=False, indent=2))
