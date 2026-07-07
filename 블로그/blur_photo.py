"""
blur_photo.py — 현장사진 EXIF 보정 + 배경 블러 처리

사용법:
  python blur_photo.py <원본사진경로> <출력경로> [--config <blur-config.json경로>]

blur-config.json 형식:
  {
    "pump_box": [x1, y1, x2, y2],
    "extra_blur_regions": [[x1,y1,x2,y2]],
    "blur_radius": 30
  }

  pump_box 좌표는 EXIF 회전 보정 후 이미지 기준으로 입력.
  Claude가 사진을 보고 Read 도구로 확인한 뒤 이 파일에 기록.

blur-config.json 자동 탐색 순서:
  1. --config 인수로 지정한 경로
  2. 출력 파일의 상위 폴더 (images/../blur-config.json)
  3. 출력 파일과 같은 폴더
"""
import sys, os, json
from PIL import Image, ImageFilter, ImageOps

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")


def main():
    args = sys.argv[1:]
    if len(args) < 2:
        print("사용법: python blur_photo.py <원본사진> <출력경로> [--config <config.json>]")
        sys.exit(1)

    src, dst = args[0], args[1]
    config_path = None

    if "--config" in args:
        idx = args.index("--config")
        if idx + 1 < len(args):
            config_path = args[idx + 1]

    if config_path is None:
        out_dir = os.path.dirname(os.path.abspath(dst))
        for candidate_dir in [os.path.dirname(out_dir), out_dir]:
            c = os.path.join(candidate_dir, "blur-config.json")
            if os.path.exists(c):
                config_path = c
                break

    if not config_path or not os.path.exists(config_path):
        print("[ERROR] blur-config.json을 찾을 수 없습니다.")
        print("  아래 형식으로 blur-config.json을 만들고 다시 실행하세요:")
        print('  {"pump_box": [x1, y1, x2, y2], "blur_radius": 30}')
        sys.exit(1)

    config = json.loads(open(config_path, encoding="utf-8").read())
    pump_box = config.get("pump_box")
    extra_regions = config.get("extra_blur_regions", [])
    blur_radius = config.get("blur_radius", 30)

    if not pump_box or len(pump_box) != 4:
        print("[ERROR] blur-config.json에 pump_box가 없거나 형식이 잘못됐습니다.")
        print('  예: "pump_box": [200, 800, 1200, 2000]')
        sys.exit(1)

    # 1. 원본 읽기 + EXIF 회전 보정
    img = Image.open(src)
    img = ImageOps.exif_transpose(img)
    w, h = img.size
    print(f"원본 크기: {w}x{h}px (EXIF 회전 보정 완료)")

    # 2. pump_box 범위 검증 + 클리핑
    px1, py1, px2, py2 = pump_box
    if px1 < 0 or py1 < 0 or px2 > w or py2 > h:
        print(f"[WARNING] pump_box {pump_box}가 이미지 범위({w}x{h})를 벗어납니다. 경계로 클리핑합니다.")
        px1, py1 = max(0, px1), max(0, py1)
        px2, py2 = min(w, px2), min(h, py2)

    area_ratio = (px2 - px1) * (py2 - py1) / (w * h)
    print(f"펌프 영역: ({px1},{py1})~({px2},{py2}), 면적 비율 {area_ratio:.1%}")

    # 3. 전체 배경 블러
    blurred = img.filter(ImageFilter.GaussianBlur(radius=blur_radius))

    # 4. 추가 블러 영역 (더 강하게)
    for region in extra_regions:
        rx1, ry1, rx2, ry2 = region
        patch = img.crop((rx1, ry1, rx2, ry2))
        patch = patch.filter(ImageFilter.GaussianBlur(radius=blur_radius + 20))
        blurred.paste(patch, (rx1, ry1))

    # 5. 펌프 본체 선명하게 복원
    pump_patch = img.crop((px1, py1, px2, py2))
    blurred.paste(pump_patch, (px1, py1))

    # 6. 1000px 폭으로 리사이즈
    new_h = int(h * 1000 / w)
    result = blurred.resize((1000, new_h), Image.LANCZOS)

    # 7. 저장
    os.makedirs(os.path.dirname(os.path.abspath(dst)), exist_ok=True)
    result.save(dst, optimize=True)

    # 8. 원본 크기 기록 — check_quality.py가 리사이즈된 field-*.png가 아닌
    #    원본 좌표 기준으로 pump_box를 검증할 수 있도록 함
    config["source_image_size"] = [w, h]
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(config, f, ensure_ascii=False, indent=2)
    size_mb = os.path.getsize(dst) / 1024 / 1024
    print(f"저장 완료: {dst} ({size_mb:.2f}MB, 1000x{new_h}px)")
    print()
    print("=" * 50)
    print("⚠️  눈으로 반드시 확인하세요 (check_quality.py 실행 전 필수)")
    print(f"   ✓ 펌프 본체 ({px1},{py1})~({px2},{py2}) 가 선명한가?")
    print(f"   ✓ 펌프 외 배경이 흐릿한가?")
    print(f"   ✓ 모델명·라벨·고객사 정보가 안 보이는가?")
    print(f"   ✓ 사진 방향이 올바른가? (누운 사진 아닌가?)")
    print("=" * 50)
    print("확인 완료 후: python check_quality.py <글폴더경로>")


if __name__ == "__main__":
    main()
