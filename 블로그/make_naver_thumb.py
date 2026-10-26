"""
네이버 붙여넣기용 작은 썸네일 만들기 (2026-10-26 대표님 요청)
- images/thumbnail.png(1080×1080)는 홈페이지·숏츠용이라 그대로 두고,
  가로·세로 절반 크기의 images/네이버_썸네일.png를 따로 만든다.

사용법:
  python make_naver_thumb.py "기술블로그/2026-10/1026-고도-과자봉지"
"""
import os, sys
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")
NAVER_THUMB_NAME = "네이버_썸네일.png"


def make_naver_thumb(folder: str) -> str | None:
    img_dir = os.path.join(folder, "images")
    src = os.path.join(img_dir, "thumbnail.png")
    if not os.path.exists(src):
        print(f"  [SKIP] thumbnail.png 없음: {img_dir}")
        return None
    dst = os.path.join(img_dir, NAVER_THUMB_NAME)
    with Image.open(src) as im:
        small = im.resize((im.width // 2, im.height // 2), Image.LANCZOS)
        small.save(dst, optimize=True)
    print(f"  네이버 썸네일: {dst} ({small.width}×{small.height})")
    return dst


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    target = sys.argv[1]
    folder = target if os.path.isabs(target) else os.path.join(OUTPUT_DIR, target)
    if not os.path.isdir(folder):
        print(f"[ERROR] 폴더 없음: {folder}")
        sys.exit(1)
    make_naver_thumb(folder)
