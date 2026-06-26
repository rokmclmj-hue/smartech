"""
check_quality.py — 블로그 글 업로드 전 통합 품질 검수 게이트

사용법: python check_quality.py <글폴더경로>
예시:  python check_quality.py "2026-06/진공건조-드라이펌프-선택기준-20260613"

검수 항목 (8개):
  1. 글자수   — final.md 마크다운 제거 후 2,000자 이상
  2. 메타설명 — meta.txt description 비어있지 않음
  3. 현장사진 — field-*.png 최소 1장 존재
  4. EXIF 회전 — 방향값 1 또는 태그 없음 (보정 완료 기준)
  5. 펌프좌표 — blur-config.json의 pump_box가 이미지 범위 내 + 면적 비율 정상
  6. GEO형식  — ## 스마텍 H2 섹션 없음 (홍보 섹션 금지)
  7. 연락처   — 문의: 전화번호 단독 줄 없음 (홈페이지 자동 표시로 중복 방지)
  8. 네이버글 — naver.md 글자수 1,500자↑ + [IMAGE] 마커 1개↑ + 해시태그 + 서명

결과: quality-log.jsonl 에 항목별 상세 기록 (임계값 조정 시 참고)
종료코드: 0=전체통과, 1=하나이상반려
"""
import sys, os, json, re
from datetime import datetime

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR  = os.path.join(SCRIPT_DIR, "output")
LOG_FILE    = os.path.join(SCRIPT_DIR, "quality-log.jsonl")

MIN_CHARS           = 2000
PUMP_BOX_MIN_RATIO  = 0.01   # 1%  — 너무 작은 좌표 차단
PUMP_BOX_MAX_RATIO  = 0.70   # 70% — 사진 전체를 펌프로 잡은 오류 차단


# ── 유틸 ─────────────────────────────────────────────────

def strip_markdown(text: str) -> str:
    text = re.sub(r"^---[\s\S]*?---\s*", "", text)           # frontmatter
    text = re.sub(r"<!--.*?-->", "", text, flags=re.DOTALL)  # HTML 주석
    text = re.sub(r"!\[.*?\]\(.*?\)", "", text)              # 이미지
    text = re.sub(r"\[IMAGE:.*?\]", "", text)                # 이미지 마커
    text = re.sub(r"\[.*?\]\(.*?\)", "", text)               # 링크
    text = re.sub(r"^\|.*\|$", "", text, flags=re.MULTILINE) # 표
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.MULTILINE)
    text = re.sub(r"[`*_~|]", "", text)
    text = re.sub(r"^\s*[-*+]\s+", "", text, flags=re.MULTILINE)
    text = re.sub(r"^\s*\d+\.\s+", "", text, flags=re.MULTILINE)
    text = re.sub(r"\s+", "", text)  # 공백 제외 카운트
    return text


def parse_meta_desc(meta_path: str) -> str:
    lines = open(meta_path, encoding="utf-8").read().strip().splitlines()
    for line in lines:
        s = line.strip()
        if s.lower().startswith("description:"):
            return s.split(":", 1)[1].strip()
    # 접두사 없는 형식 — 첫 의미있는 줄
    for line in lines:
        s = line.strip()
        if s and not any(s.lower().startswith(p) for p in ("title:", "keywords:", "og_")):
            return s
    return ""


# ── 5개 검수 항목 ─────────────────────────────────────────

def chk_char_count(folder: str) -> dict:
    path = os.path.join(folder, "final.md")
    if not os.path.exists(path):
        return {"pass": False, "reason": "final.md 없음", "value": 0}
    count = len(strip_markdown(open(path, encoding="utf-8").read()))
    ok = count >= MIN_CHARS
    return {
        "pass": ok,
        "value": count,
        "threshold": MIN_CHARS,
        "reason": None if ok else f"{count}자 (최소 {MIN_CHARS}자 필요, {MIN_CHARS - count}자 부족)",
    }


def chk_meta_desc(folder: str) -> dict:
    path = os.path.join(folder, "meta.txt")
    if not os.path.exists(path):
        return {"pass": False, "reason": "meta.txt 없음", "value": ""}
    desc = re.sub(r"\s*031-\d{3}-\d{4}", "", parse_meta_desc(path)).strip().rstrip(".")
    ok = bool(desc)
    return {
        "pass": ok,
        "value": (desc[:60] + "…") if len(desc) > 60 else desc,
        "reason": None if ok else "description이 비어있음 — meta.txt 확인 필요",
    }


def chk_field_photo(folder: str) -> dict:
    img_dir = os.path.join(folder, "images")
    if not os.path.exists(img_dir):
        return {"pass": False, "reason": "images/ 폴더 없음", "files": []}
    files = [f for f in os.listdir(img_dir) if f.startswith("field-") and f.endswith((".png", ".jpg"))]
    ok = len(files) > 0
    return {
        "pass": ok,
        "files": files,
        "reason": None if ok else "field-*.png 없음 — blur_photo.py로 처리 필요",
    }


def chk_exif(folder: str) -> dict:
    try:
        from PIL import Image as PILImage
    except ImportError:
        return {"pass": True, "note": "Pillow 없어 건너뜀", "files": []}

    img_dir = os.path.join(folder, "images")
    if not os.path.exists(img_dir):
        return {"pass": True, "note": "images/ 없어 건너뜀", "files": []}

    field_files = [f for f in os.listdir(img_dir) if f.startswith("field-")]
    if not field_files:
        return {"pass": True, "note": "field 사진 없어 건너뜀", "files": []}

    results, all_ok = [], True
    for fname in field_files:
        try:
            img = PILImage.open(os.path.join(img_dir, fname))
            exif = img._getexif() if hasattr(img, "_getexif") else None
            orientation = (exif or {}).get(274)  # 274 = Orientation tag
            # 태그 없음(None) 또는 1이면 통과 — 보정 완료 시 태그가 사라질 수 있음
            ok = orientation is None or orientation == 1
            results.append({"file": fname, "orientation": orientation, "pass": ok})
            if not ok:
                all_ok = False
        except Exception as e:
            results.append({"file": fname, "orientation": "error", "pass": True, "note": str(e)})

    return {
        "pass": all_ok,
        "files": results,
        "reason": None if all_ok else "EXIF 회전 미보정 — blur_photo.py로 처리하면 자동 수정됨",
    }


def chk_pump_box(folder: str) -> dict:
    cfg_path = os.path.join(folder, "blur-config.json")
    if not os.path.exists(cfg_path):
        return {
            "pass": True, "skipped": True,
            "area_ratio": None,
            "note": "blur-config.json 없음 — 건너뜀 (blur_photo.py 미사용 글)",
        }

    try:
        from PIL import Image as PILImage
    except ImportError:
        return {"pass": True, "skipped": True, "area_ratio": None, "note": "Pillow 없어 건너뜀"}

    cfg = json.loads(open(cfg_path, encoding="utf-8").read())
    box = cfg.get("pump_box")
    if not box or len(box) != 4:
        return {"pass": False, "area_ratio": None, "reason": "pump_box 형식 오류"}

    px1, py1, px2, py2 = box

    # source_image_size가 있으면 원본 크기 기준으로 검사
    # (blur_photo.py가 리사이즈하므로 field-*.png 크기와 다름)
    source_size = cfg.get("source_image_size")
    if source_size and len(source_size) == 2:
        w, h = source_size
    else:
        img_dir = os.path.join(folder, "images")
        field_files = [f for f in os.listdir(img_dir) if f.startswith("field-")] if os.path.exists(img_dir) else []
        if not field_files:
            return {"pass": True, "skipped": True, "area_ratio": None, "note": "field 사진 없어 건너뜀"}
        img = PILImage.open(os.path.join(img_dir, field_files[0]))
        w, h = img.size

    if px1 < 0 or py1 < 0 or px2 > w or py2 > h or px1 >= px2 or py1 >= py2:
        return {
            "pass": False,
            "area_ratio": None,
            "pump_box": box,
            "image_size": [w, h],
            "reason": f"pump_box {box}가 이미지 범위({w}x{h}) 밖이거나 비정상",
        }

    ratio = (px2 - px1) * (py2 - py1) / (w * h)
    ok = PUMP_BOX_MIN_RATIO <= ratio <= PUMP_BOX_MAX_RATIO
    return {
        "pass": ok,
        "area_ratio": round(ratio, 4),
        "area_ratio_pct": f"{ratio:.1%}",   # 나중에 임계값 조정 시 참고
        "threshold": f"{PUMP_BOX_MIN_RATIO:.0%}~{PUMP_BOX_MAX_RATIO:.0%}",
        "pump_box": box,
        "image_size": [w, h],
        "reason": None if ok else f"펌프 면적 {ratio:.1%}이 허용 범위({PUMP_BOX_MIN_RATIO:.0%}~{PUMP_BOX_MAX_RATIO:.0%}) 밖",
    }


def _strip_code_fences(text: str) -> str:
    """코드 블록(```...```) 안의 내용을 제거해 오탐 방지"""
    return re.sub(r"```[\s\S]*?```", "", text)


def chk_naver_md(folder: str) -> dict:
    path = os.path.join(folder, "naver.md")
    if not os.path.exists(path):
        return {"pass": False, "reason": "naver.md 없음"}
    with open(path, encoding="utf-8") as f:
        content = f.read()

    errors = []

    # 1. 글자수 (공백 제외 1,500자 이상)
    char_count = len(re.sub(r"\s+", "", re.sub(r"^#[^\s].*", "", re.sub(r"\[IMAGE:.*?\]", "", re.sub(r"^#.+$", "", content, flags=re.MULTILINE)), flags=re.MULTILINE)))
    if char_count < 1500:
        errors.append(f"글자수 {char_count}자 (최소 1,500자)")

    # 2. [IMAGE] 마커 최소 1개
    image_markers = re.findall(r"\[IMAGE:", content)
    if len(image_markers) < 1:
        errors.append("[IMAGE:] 마커 없음 — 이미지 삽입 위치 표시 필요")

    # 3. 해시태그
    if not re.search(r"#[가-힣a-zA-Z]+", content):
        errors.append("해시태그 없음")

    # 4. 서명(footer)
    if "031-204-7170" not in content and "smartechvacuum.com" not in content:
        errors.append("서명(연락처) 없음")

    ok = len(errors) == 0
    return {
        "pass": ok,
        "char_count": char_count,
        "image_markers": len(image_markers),
        "reason": " / ".join(errors) if errors else None,
    }


def chk_geo_format(folder: str) -> dict:
    path = os.path.join(folder, "final.md")
    if not os.path.exists(path):
        return {"pass": True, "note": "final.md 없음 — 건너뜀"}
    content = _strip_code_fences(open(path, encoding="utf-8").read())

    # 금지 ③: "## 스마텍" H2 섹션
    if re.search(r"^##\s+스마텍", content, re.MULTILINE):
        return {
            "pass": False,
            "reason": "'## 스마텍' H2 섹션 발견 — AI가 홍보 섹션으로 분류함. 구분선+1줄 형식으로 교체하세요. (writer.md 금지③)",
        }
    return {"pass": True}


def chk_no_contact(folder: str) -> dict:
    path = os.path.join(folder, "final.md")
    if not os.path.exists(path):
        return {"pass": True, "note": "final.md 없음 — 건너뜀"}
    content = _strip_code_fences(open(path, encoding="utf-8").read())

    # 금지 ①: 연락처 단독 줄 (문의: 031-xxx-xxxx 형태)
    if re.search(r"^문의\s*[:：].*031-\d{3}-\d{4}", content, re.MULTILINE):
        return {
            "pass": False,
            "reason": "전화번호 연락처 줄 발견 — 홈페이지 자동 문의 박스와 중복됨. 해당 줄 삭제하세요. (writer.md 금지①)",
        }
    return {"pass": True}


# ── 메인 ─────────────────────────────────────────────────

def run(folder_arg: str) -> bool:
    # 폴더 경로 결정
    folder = os.path.join(OUTPUT_DIR, folder_arg)
    if not os.path.isdir(folder):
        # 카테고리/월/폴더 구조에서 폴더명으로 탐색 (최대 3단계)
        found = False
        for cat in os.listdir(OUTPUT_DIR):
            cat_path = os.path.join(OUTPUT_DIR, cat)
            if not os.path.isdir(cat_path):
                continue
            c = os.path.join(cat_path, folder_arg)
            if os.path.isdir(c):
                folder = c
                found = True
                break
            for month in os.listdir(cat_path):
                month_path = os.path.join(cat_path, month)
                if not os.path.isdir(month_path):
                    continue
                c = os.path.join(month_path, folder_arg)
                if os.path.isdir(c):
                    folder = c
                    found = True
                    break
            if found:
                break

    if not os.path.isdir(folder):
        print(f"[ERROR] 폴더를 찾을 수 없습니다: {folder_arg}")
        sys.exit(1)

    folder_name = os.path.relpath(folder, OUTPUT_DIR)
    print(f"\n🔍 품질 검수: {folder_name}")
    print("=" * 55)

    checks = {
        "char_count":  chk_char_count(folder),
        "meta_desc":   chk_meta_desc(folder),
        "field_photo": chk_field_photo(folder),
        "exif":        chk_exif(folder),
        "pump_box":    chk_pump_box(folder),
        "geo_format":  chk_geo_format(folder),
        "no_contact":  chk_no_contact(folder),
        "naver_md":    chk_naver_md(folder),
    }

    labels = {
        "char_count":  "글자수",
        "meta_desc":   "메타설명",
        "field_photo": "현장사진",
        "exif":        "EXIF 회전",
        "pump_box":    "펌프좌표",
        "geo_format":  "GEO형식",
        "no_contact":  "연락처중복",
        "naver_md":    "네이버글",
    }

    failed = []
    for key, res in checks.items():
        icon  = "✅" if res["pass"] else "❌"
        label = labels[key]

        # 항목별 요약 출력
        if key == "char_count":
            detail = f"{res.get('value', 0)}자 (기준 {MIN_CHARS}자)"
        elif key == "meta_desc":
            v = res.get("value", "")
            detail = (v[:45] + "…") if len(v) > 45 else v or "(없음)"
        elif key == "field_photo":
            detail = ", ".join(res.get("files", [])) or "없음"
        elif key == "exif":
            flist = res.get("files", [])
            if flist:
                detail = " / ".join(f"{r['file']}(방향={r['orientation']})" for r in flist)
            else:
                detail = res.get("note", "")
        elif key == "pump_box":
            if res.get("skipped"):
                detail = res.get("note", "건너뜀")
            else:
                ar = res.get("area_ratio_pct")
                detail = f"면적 {ar}" if ar else "(오류)"
        elif key == "naver_md":
            if res["pass"]:
                detail = f"{res.get('char_count',0)}자 / [IMAGE] {res.get('image_markers',0)}개"
            else:
                detail = ""
        elif key in ("geo_format", "no_contact"):
            detail = res.get("note", "통과") if res["pass"] else ""
        else:
            detail = ""

        print(f"  {icon} {label:<8} {detail}")
        if not res["pass"] and res.get("reason"):
            print(f"          → {res['reason']}")
        if not res["pass"]:
            failed.append(label)

    overall = len(failed) == 0
    print()

    if overall:
        print("✅ 전체 통과")
    else:
        print(f"❌ 반려 — 실패: {', '.join(failed)}")
        print("   위 항목을 수정한 뒤 다시 실행하세요.")

    # 블러 확인 알림 — 통과 여부와 무관하게 항상 표시
    field_files = checks["field_photo"].get("files", [])
    if field_files:
        print()
        print("👁️  블러 시각 확인 (사람이 직접 확인 필요):")
        print("   ✓ 펌프 본체가 선명하게 보이는가?")
        print("   ✓ 배경(벽·바닥·다른 장비)이 흐릿한가?")
        print("   ✓ 모델명·라벨·고객사 정보가 보이지 않는가?")
        print("   확인 완료 → upload-queue.json에서 approved: true 로 변경 후 업로드")

    # 로그 기록
    entry = {
        "timestamp":    datetime.now().isoformat(),
        "folder":       folder_name,
        "checks":       checks,
        "overall":      "PASS" if overall else "FAIL",
        "failed_items": failed,
    }
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    print(f"\n📋 로그: {LOG_FILE}")
    return overall


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("사용법: python check_quality.py <글폴더경로>")
        print('예시:  python check_quality.py "2026-06/진공건조-드라이펌프-선택기준-20260613"')
        sys.exit(1)
    ok = run(sys.argv[1])
    sys.exit(0 if ok else 1)
