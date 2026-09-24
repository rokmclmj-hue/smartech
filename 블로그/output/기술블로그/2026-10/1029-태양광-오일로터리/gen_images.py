# -*- coding: utf-8 -*-
"""Body diagrams: Original HTML/CSS via Playwright. Thumbnail uses real Edwards E2M product photo (see thumb_build step, not regenerated here)."""
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

STANDARD = html("""
<div id="card"><div class="eyebrow">OIL-SEALED STANDARD · 오일씰 표준 공정</div>
<h2>여전히 오일로터리가 표준인 공정이 있습니다</h2>
<div class="grid">
<div class="box"><h3>대형 유리 코팅 PVD</h3><p>SOGEVAC 오일씰<br>로터리베인 펌프가 표준<br>(Leybold)</p></div>
<div class="box"><h3>결정 성장(잉곳)</h3><p>PFPE 오일 TRIVAC이<br>표준 솔루션<br>실리콘카바이드 응용 포함</p></div>
</div><div class="note">부스터(루츠블로워) RUVAC는 250~7,000 m³/h 범위로 제공됩니다.</div></div>
""")

DRY_SHIFT = html("""
<div id="card"><div class="eyebrow">SHIFT TO DRY · 드라이로 이동</div>
<h2>순도가 중요한 공정은 드라이 스크류로</h2>
<div class="grid">
<div class="box"><h3>박막 코팅(CIGS·CdTe·HJT)</h3><p>오일 배출 없는<br>드라이 스크류 필요<br>(오일 이행 위험 회피)</p></div>
<div class="box"><h3>로드락 배기</h3><p>반복 배기 속도 우선<br>Leybold POWERBOOST 개발</p></div>
</div><div class="note">"순도와 오일 프리 솔루션이 필수적"이라는 것이 Leybold의 설명입니다.</div></div>
""")

OIL_CHOICE = html("""
<div id="card"><div class="eyebrow">OIL CHOICE · 오일 선택 기준</div>
<h2>산소가 관여하면 PFPE 오일을 씁니다</h2>
<div class="grid">
<div class="box"><h3>일반 탄화수소 오일</h3><p>일반 공정용<br>산소 풍부 환경에서<br>반응성 우려</p></div>
<div class="box"><h3>PFPE 오일(FX 변형 등)</h3><p>산소농도 21% 초과 환경 호환<br>(Edwards E2M FX 사양)</p></div>
</div><div class="note">오일 선택은 씰링재·배관 재질을 포함한 시스템 전체 검토의 일부입니다.</div></div>
""")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1200, "height": 1400}, device_scale_factor=1)
    for name, markup, selector in [
        ("사진1.png", STANDARD, "#card"),
        ("사진2.png", DRY_SHIFT, "#card"),
        ("사진3.png", OIL_CHOICE, "#card"),
    ]:
        page.set_content(markup)
        page.evaluate("document.fonts.ready")
        page.locator(selector).screenshot(path=str(IMAGES / name))
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
