"""
approve_post.py — upload-queue.json approved=true 설정 후 upload_post.py 실행

사용법:
  python approve_post.py "2026-06/진공건조-드라이펌프-선택기준-20260613"
"""
import sys, json, os, subprocess

sys.stdout.reconfigure(encoding="utf-8")

folder = sys.argv[1].strip() if len(sys.argv) > 1 else None
if not folder:
    print("사용법: python approve_post.py <폴더경로>")
    sys.exit(1)

queue_path = os.path.join(os.path.dirname(__file__), "upload-queue.json")
if os.path.exists(queue_path):
    with open(queue_path, encoding="utf-8") as f:
        queue = json.load(f)

    matched = None
    for slot in ("day1", "day2", "day3"):
        if queue.get(slot, {}).get("folder", "").strip() == folder:
            matched = slot
            break

    if matched:
        queue[matched]["approved"] = True
        with open(queue_path, "w", encoding="utf-8") as f:
            json.dump(queue, f, ensure_ascii=False, indent=2)
        print(f"[OK] {matched} → approved=true")
    else:
        print("[INFO] upload-queue.json에 없는 폴더 — 직접 업로드로 진행합니다.")
else:
    print("[INFO] upload-queue.json 없음 — 직접 업로드로 진행합니다.")

subprocess.run(
    [sys.executable, os.path.join(os.path.dirname(__file__), "upload_post.py"), folder],
    check=False,
)
