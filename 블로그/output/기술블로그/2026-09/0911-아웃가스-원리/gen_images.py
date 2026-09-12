# -*- coding: utf-8 -*-
"""Render original HTML/CSS educational diagrams; copy product reference unchanged.

PIL is used only to read dimensions and measure margins, never to edit images.
"""
from pathlib import Path
import json
import shutil
from playwright.sync_api import sync_playwright
from PIL import Image

BASE = Path(__file__).resolve().parent
ROOT = BASE.parents[4]
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
.accent { color:#8cded9; }
.diagram { position:relative; height:250px; margin:10px 0 20px; overflow:hidden; }
.vacuum { position:absolute; top:0; left:0; color:#b8c7de; font-size:22px; }
.slab { position:absolute; left:0; right:0; top:150px; bottom:0; background:#526681; border-top:5px solid #d4e1ef; }
.slab span { position:absolute; bottom:12px; left:16px; font-size:22px; color:#edf2f8; }
.dot { width:17px; height:17px; border-radius:50%; background:#8cded9; position:absolute; }
.arrow { position:absolute; color:#8cded9; font-size:55px; font-weight:700; line-height:1; }
.mini { height:125px; display:flex; align-items:center; justify-content:center; gap:10px; font-size:25px; color:#8cded9; }
.mini .wall { height:75px; width:22px; background:#a7b8d1; }
.mini .pocket { border:4px solid #a7b8d1; padding:18px 8px; font-size:20px; color:#d8e2f2; }
.mini .flow { font-size:44px; }
.n { display:inline-flex; align-items:center; justify-content:center; width:48px; height:48px; border-radius:50%; background:#314969; color:#9de5df; font-size:25px; margin-bottom:16px; }
"""


def html(body, extra=""):
    return f'<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>{CSS}{extra}</style></head><body>{body}</body></html>'


THUMBNAIL = html("""
<div id="thumb"><div class="wrap">
<div class="badge">일반 진공이론</div>
<h1>진공 챔버 속<br>아웃가스의 원리</h1>
<div class="sub">기체는 어디서 나올까?</div>
</div></div>
""", """
#thumb { width:1080px; height:1080px; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#1a1a2e,#16213e); }
.wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:132px; width:100%; padding:35px; }
.badge { font-size:60px; color:#a9bbdc; border:2px solid #50627e; border-radius:80px; padding:32px 64px; }
h1 { font-size:108px; line-height:1.3; letter-spacing:-3px; font-weight:800; white-space:nowrap; }
.sub { font-size:60px; line-height:1.4; color:#bbc9de; }
""")

ORIGINS = html("""
<div id="card"><div class="eyebrow">OUTGASSING · 원리 개념도</div>
<h2>표면과 재료 내부도 기체의 출처입니다</h2>
<div class="grid">
<div class="box"><h3>01 · 표면에서 탈착</h3>
<div class="diagram"><div class="vacuum">진공 공간</div><div class="slab"><span>재료 표면</span></div>
<i class="dot" style="left:70px;top:132px"></i><i class="dot" style="left:185px;top:132px"></i><i class="dot" style="left:290px;top:132px"></i>
<b class="arrow" style="left:178px;top:76px">↑</b><i class="dot" style="left:185px;top:42px"></i></div>
<p>표면에 붙어 있던 분자가<br>떨어져 나와 기체가 됩니다.</p></div>
<div class="box"><h3>02 · 내부에서 확산·방출</h3>
<div class="diagram"><div class="vacuum">진공 공간</div><div class="slab"><span>재료 내부</span></div>
<i class="dot" style="left:95px;top:180px"></i><b class="arrow" style="left:133px;top:139px">↗</b>
<i class="dot" style="left:198px;top:131px"></i><b class="arrow" style="left:190px;top:74px">↑</b><i class="dot" style="left:198px;top:41px"></i></div>
<p>내부 분자가 표면으로 이동한 뒤<br>진공 공간으로 나옵니다.</p></div>
</div><div class="note">설명용 도식입니다. 분자 크기·이동 거리·속도를 실제 비율로 나타내지 않았습니다.</div></div>
""")

PATHS = html("""
<div id="card"><div class="eyebrow">GAS SOURCES · 출처 구분</div>
<h2>압력이 남는다고 모두 누설은 아닙니다</h2>
<div class="grid" style="grid-template-columns:repeat(3,1fr)">
<div class="box"><h3>아웃가스</h3><div class="mini"><span>재료</span><span class="flow">→</span><span>진공</span></div><p>표면·내부에서<br>기체가 방출됩니다.</p></div>
<div class="box"><h3>실제 누설</h3><div class="mini"><span>외부</span><span class="flow">→</span><span>진공</span></div><p>구멍·틈을 통해<br>외부 기체가 들어옵니다.</p></div>
<div class="box"><h3>가상 누설</h3><div class="mini"><span class="pocket">갇힌 기체</span><span class="flow">→</span></div><p>막힌 공간의 기체가<br>좁은 통로로 나옵니다.</p></div>
</div><div class="note">투과는 별도 경로: 외부 기체가 재료 자체를 통과합니다.<br>압력값 하나만으로 원인을 확정할 수는 없습니다.</div></div>
""")

CHECKS = html("""
<div id="card"><div class="eyebrow">CHECK POINTS · 조건 확인</div>
<h2>재료와 취급 이력부터 확인하세요</h2>
<div class="grid">
<div class="box"><div class="n">01</div><h3>대기 노출</h3><p>챔버를 연 시간과 습도,<br>시료를 넣은 시점을 기록합니다.</p></div>
<div class="box"><div class="n">02</div><h3>청정 취급</h3><p>손자국·오염·세정 잔류물을 살피고<br>허용된 세정·건조 절차를 따릅니다.</p></div>
<div class="box"><div class="n">03</div><h3>제조사 허용 조건</h3><p>가열 전 모든 부품의 허용 온도와<br>장비의 베이크아웃 절차를 확인합니다.</p></div>
<div class="box"><div class="n">04</div><h3>압력 변화 기록</h3><p>같은 조건에서 시간별 압력을 비교하고<br>필요하면 누설 검사를 병행합니다.</p></div>
</div><div class="note">베이크아웃은 진공 상태에서 장비를 가열해 기체 방출을 촉진하는 작업입니다.<br>일괄 온도를 적용하거나 임의로 가열하지 않습니다.</div></div>
""")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1200, "height": 1400}, device_scale_factor=1)
    for name, markup, selector in [
        ("thumbnail.png", THUMBNAIL, "#thumb"),
        ("사진1.png", ORIGINS, "#card"),
        ("사진2.png", PATHS, "#card"),
        ("사진4.png", CHECKS, "#card"),
    ]:
        page.set_content(markup)
        page.evaluate("document.fonts.ready")
        page.locator(selector).screenshot(path=str(IMAGES / name))
        overflow = page.evaluate("""() => [...document.querySelectorAll('h1,h2,h3,p,.sub,.badge,.note')].filter(e=>{ const r=e.getBoundingClientRect(); const c=e.closest('#card,#thumb').getBoundingClientRect(); return r.right>c.right || r.left<c.left || e.scrollWidth>e.clientWidth+1; }).map(e=>e.textContent)""")
        if overflow:
            raise RuntimeError(f"Text overflow: {name}: {overflow}")
    browser.close()

shutil.copyfile(ROOT / "public/images/products/hardware.png", IMAGES / "사진3.png")

report = {"method": "Original HTML/CSS rendered with Playwright; product PNG copied without modification", "images": {}}
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
