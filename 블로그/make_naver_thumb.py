"""
네이버 붙여넣기용 가로형 썸네일 만들기 (2026-10-26 대표님 요청·승인)
- 네이버는 사진을 줄일 때 비율을 유지하므로, 정사각형 thumbnail.png(1080×1080)는 세로가 너무 길다.
- thumbnail.png는 홈페이지·숏츠용이라 그대로 두고, 같은 글자로 1200×440 가로형
  images/네이버_썸네일.png를 따로 만든다. 사진을 넣으면 오른쪽 흰 칸에 표시한다.

사용법:
  python make_naver_thumb.py "기술블로그/2026-10/1026-고도-과자봉지" --badge "진공 실생활" --title "고도와 과자 봉지" --sub "왜 산에 가면 빵빵해질까?"
  python make_naver_thumb.py "[폴더]" --badge ... --title "태양광 생산라인|진공펌프 선택" --sub ... --photo "public/images/products/gxs.jpeg"
  (제목의 | 는 줄바꿈. 글자가 폭을 넘으면 만들지 않고 오류로 알려 준다)
"""
import argparse, base64, html, mimetypes, os, sys
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding="utf-8")

BLOG_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BLOG_DIR, "output")
NAVER_THUMB_NAME = "네이버_썸네일.png"

CSS = """
* { box-sizing:border-box; margin:0; padding:0; }
body { color:#fff; font-family:'Pretendard Variable','Pretendard','Malgun Gothic',sans-serif; }
#wide { width:1200px; height:440px; display:flex; align-items:center; justify-content:center; gap:48px;
        padding:0 56px; background:linear-gradient(135deg,#1a1a2e,#16213e); }
.text { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:34px; text-align:center; }
.badge2 { font-size:40px; color:#a9bbdc; border:2px solid #50627e; border-radius:60px; padding:16px 44px; white-space:nowrap; }
h1 { font-size:96px; line-height:1.2; letter-spacing:-2px; font-weight:800; white-space:nowrap; }
.sub { font-size:44px; color:#bbc9de; white-space:nowrap; }
.photo h1 { font-size:68px; } .photo .sub { font-size:36px; } .photo .badge2 { font-size:34px; padding:12px 36px; }
.photo .text { gap:26px; }
.panel { width:420px; height:340px; flex-shrink:0; background:#fff; border-radius:28px; display:flex; align-items:center; justify-content:center; overflow:hidden; }
.panel img { max-width:86%; max-height:86%; object-fit:contain; }
"""


def make_naver_thumb(folder: str, badge: str, title: str, sub: str, photo: str | None = None) -> str:
    img_dir = os.path.join(folder, "images")
    os.makedirs(img_dir, exist_ok=True)
    dst = os.path.join(img_dir, NAVER_THUMB_NAME)
    panel = ""
    if photo:
        mime = mimetypes.guess_type(photo)[0] or "image/png"
        data = base64.b64encode(open(photo, "rb").read()).decode()
        panel = f'<div class="panel"><img src="data:{mime};base64,{data}"></div>'
    text = "".join([
        f'<div class="badge2">{html.escape(badge)}</div>' if badge else "",
        # 제목의 | 는 줄바꿈(긴 제목을 두 줄로)
        f"<h1>{'<br>'.join(html.escape(t.strip()) for t in title.split('|'))}</h1>",
        f'<div class="sub">{html.escape(sub)}</div>' if sub else "",
    ])
    markup = (f'<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>{CSS}</style></head>'
              f'<body><div id="wide" class="{"photo" if photo else ""}"><div class="text">{text}</div>{panel}</div></body></html>')
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1200, "height": 440}, device_scale_factor=1)
        page.set_content(markup)
        page.evaluate("document.fonts.ready")
        # 글자가 캔버스 밖으로 나가면 만들지 않는다(긴 제목은 짧게 줄여서 다시 실행)
        overflow = page.evaluate("""() => { const c = document.querySelector('#wide').getBoundingClientRect();
            return [...document.querySelectorAll('.badge2,h1,.sub,.panel')].filter(e => { const r = e.getBoundingClientRect();
            return r.left < c.left + 10 || r.right > c.right - 10; }).map(e => e.textContent.slice(0, 30)); }""")
        if overflow:
            browser.close()
            raise RuntimeError(f"글자가 가로 폭을 넘음 — 제목·부제를 줄여 주세요: {overflow}")
        page.locator("#wide").screenshot(path=dst)
        browser.close()
    print(f"  네이버 썸네일: {dst} (1200×440)")
    return dst


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="네이버 붙여넣기용 가로형 썸네일(1200×440)")
    ap.add_argument("folder")
    ap.add_argument("--badge", default="")
    ap.add_argument("--title", required=True)
    ap.add_argument("--sub", default="")
    ap.add_argument("--photo")
    a = ap.parse_args()
    folder = a.folder if os.path.isabs(a.folder) else os.path.join(OUTPUT_DIR, a.folder)
    if not os.path.isdir(folder):
        print(f"[ERROR] 폴더 없음: {folder}")
        sys.exit(1)
    photo = a.photo
    if photo and not os.path.isabs(photo):
        photo = os.path.join(os.path.dirname(BLOG_DIR), photo)
    make_naver_thumb(folder, a.badge, a.title, a.sub, photo)
