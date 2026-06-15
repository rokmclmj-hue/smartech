"""
approve_post.py — upload-queue.json approved=true 설정 후 upload_post.py 실행

사용법:
  python approve_post.py "2026-06/진공건조-드라이펌프-선택기준-20260613"
"""
import sys, json, os, subprocess, tempfile, shutil

sys.stdout.reconfigure(encoding="utf-8")

folder = sys.argv[1].strip() if len(sys.argv) > 1 else None
if not folder:
    print("사용법: python approve_post.py <폴더경로>")
    sys.exit(1)

queue_path = os.path.join(os.path.dirname(__file__), "upload-queue.json")
matched = None

if os.path.exists(queue_path):
    with open(queue_path, encoding="utf-8") as f:
        queue = json.load(f)

    for slot in ("day1", "day2", "day3"):
        if queue.get(slot, {}).get("folder", "").strip() == folder:
            matched = slot
            break

    if matched:
        queue[matched]["approved"] = True
        # 원자적 쓰기: 임시 파일에 쓴 뒤 rename으로 교체 (중간 크래시 시 파일 손상 방지)
        tmp_fd, tmp_path = tempfile.mkstemp(dir=os.path.dirname(queue_path), suffix=".tmp")
        try:
            with os.fdopen(tmp_fd, "w", encoding="utf-8") as tmp_f:
                json.dump(queue, tmp_f, ensure_ascii=False, indent=2)
            shutil.move(tmp_path, queue_path)
        except Exception:
            os.unlink(tmp_path)
            raise
        print(f"[OK] {matched} → approved=true")
    else:
        print("[BLOCKED] upload-queue.json에 없는 폴더입니다.")
        print("  upload-queue.json에 등록된 폴더만 이 스크립트로 업로드할 수 있습니다.")
        print("  폴더 경로를 확인하거나 upload-queue.json에 먼저 등록하세요.")
        sys.exit(1)
else:
    print("[BLOCKED] upload-queue.json을 찾을 수 없습니다.")
    sys.exit(1)

result = subprocess.run(
    [sys.executable, os.path.join(os.path.dirname(__file__), "upload_post.py"), folder],
    check=False,
)

if result.returncode != 0:
    print(f"[ERROR] upload_post.py가 실패했습니다 (exit {result.returncode}). 위 오류 메시지를 확인하세요.")
    sys.exit(1)

# 업로드 성공 → uploaded=true 기록 (스케줄러 중복 업로드 방지)
with open(queue_path, encoding="utf-8") as f:
    queue = json.load(f)
queue[matched]["uploaded"] = True
tmp_fd, tmp_path = tempfile.mkstemp(dir=os.path.dirname(queue_path), suffix=".tmp")
try:
    with os.fdopen(tmp_fd, "w", encoding="utf-8") as tmp_f:
        json.dump(queue, tmp_f, ensure_ascii=False, indent=2)
    shutil.move(tmp_path, queue_path)
except Exception:
    os.unlink(tmp_path)
    raise
print(f"[OK] {matched} → uploaded=true 기록 완료")
