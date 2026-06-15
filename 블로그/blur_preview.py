"""
blur_preview.py — 원본 사진을 800px 미리보기 + 좌표 격자로 변환

사용법:
  python blur_preview.py <원본사진경로> [--out <출력경로>]

출력: 800px 폭, 500px 격자(원본 좌표 기준) + 눈금 숫자 표시
Claude가 이 이미지를 보고 pump_box 좌표를 추정한 뒤 blur-config.json을 생성함.
"""
import sys, os
from PIL import Image, ImageDraw, ImageFont, ImageOps

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")


PREVIEW_W = 800
GRID_STEP = 500   # 원본 좌표 기준 격자 간격


def main():
    args = sys.argv[1:]
    if not args:
        print("사용법: python blur_preview.py <원본사진경로> [--out <출력경로>]")
        sys.exit(1)

    src = args[0]
    out_path = None
    if "--out" in args:
        idx = args.index("--out")
        if idx + 1 < len(args):
            out_path = args[idx + 1]

    if out_path is None:
        base = os.path.splitext(os.path.basename(src))[0]
        out_path = os.path.join(os.path.dirname(os.path.abspath(src)), f"_preview_{base}.jpg")

    img = Image.open(src)
    img = ImageOps.exif_transpose(img)
    orig_w, orig_h = img.size
    print(f"원본 크기: {orig_w}x{orig_h}px")

    # 800px 폭으로 축소
    scale = PREVIEW_W / orig_w
    prev_h = int(orig_h * scale)
    preview = img.resize((PREVIEW_W, prev_h), Image.LANCZOS)

    draw = ImageDraw.Draw(preview)

    # 폰트: 기본 PIL 폰트 사용 (외부 폰트 불필요)
    try:
        font = ImageFont.truetype("arial.ttf", 16)
    except Exception:
        font = ImageFont.load_default()

    # 격자 그리기 (원본 좌표 기준 GRID_STEP마다 선 + 숫자)
    x_orig = GRID_STEP
    while x_orig < orig_w:
        x_prev = int(x_orig * scale)
        draw.line([(x_prev, 0), (x_prev, prev_h)], fill=(255, 80, 80), width=1)
        draw.text((x_prev + 3, 4), str(x_orig), fill=(255, 80, 80), font=font)
        x_orig += GRID_STEP

    y_orig = GRID_STEP
    while y_orig < orig_h:
        y_prev = int(y_orig * scale)
        draw.line([(0, y_prev), (PREVIEW_W, y_prev)], fill=(255, 80, 80), width=1)
        draw.text((4, y_prev + 3), str(y_orig), fill=(255, 80, 80), font=font)
        y_orig += GRID_STEP

    # 테두리
    draw.rectangle([(0, 0), (PREVIEW_W - 1, prev_h - 1)], outline=(255, 80, 80), width=2)

    preview.save(out_path, quality=85)
    print(f"미리보기 저장: {out_path}")
    print(f"격자 간격: {GRID_STEP}px (원본 기준)")
    print()
    print("Claude에게 이 이미지를 보여주면:")
    print("  → 격자 눈금을 보고 선명하게 할 부분의 좌표를 추정합니다.")
    print(f"  → pump_box는 [x1, y1, x2, y2] 형식 (원본 {orig_w}x{orig_h} 기준)")


if __name__ == "__main__":
    main()
