"""
SmartechBlog 자동 업로드 스크립트
Windows 작업 스케줄러가 월/수/금에 자동 실행함.
Claude 없이 독립 실행 가능. Python만 있으면 됨.

사용법:
  python auto_upload.py --slot day1   (월요일)
  python auto_upload.py --slot day2   (수요일)
  python auto_upload.py --slot day3   (금요일)
"""

import json
import subprocess
import sys
import os
from datetime import datetime

PYTHON_EXE = r"C:\Users\rokmc\AppData\Local\Programs\Python\Python312\python.exe"
UPLOAD_SCRIPT = r"C:\Users\rokmc\smartech\블로그\upload_post.py"
QUEUE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "upload-queue.json")
LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "upload-log.txt")

SLOT_LABEL = {
    "day1": "월요일",
    "day2": "수요일",
    "day3": "금요일",
}


def log(msg):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {msg}"
    print(line)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def main():
    slot = None
    if "--slot" in sys.argv:
        idx = sys.argv.index("--slot")
        if idx + 1 < len(sys.argv):
            slot = sys.argv[idx + 1]

    if slot not in ("day1", "day2", "day3"):
        log("❌ 슬롯 인수가 없거나 잘못됨. --slot day1 / day2 / day3 중 하나 필요.")
        sys.exit(1)

    label = SLOT_LABEL[slot]
    log(f"--- 자동 업로드 시작: {label} ({slot}) ---")

    if not os.path.exists(QUEUE_FILE):
        log("❌ upload-queue.json 파일 없음. 주말에 Claude로 주제 생성 먼저 필요.")
        sys.exit(1)

    with open(QUEUE_FILE, "r", encoding="utf-8") as f:
        queue = json.load(f)

    post = queue.get(slot, {})
    folder = post.get("folder", "").strip()
    title = post.get("title", "").strip()

    if not folder:
        log(f"⚠️ [{label}] 업로드 항목이 비어 있음. 주말에 Claude로 주제 생성 필요.")
        sys.exit(0)

    if post.get("uploaded"):
        log(f"✅ [{label}] 이미 업로드 완료: {title}")
        sys.exit(0)

    log(f"📤 [{label}] 업로드 시작: {title} (폴더: {folder})")

    result = subprocess.run(
        [PYTHON_EXE, UPLOAD_SCRIPT, folder],
        cwd=r"C:\Users\rokmc\smartech",
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )

    if result.stdout:
        log(result.stdout.strip())

    if result.returncode == 0:
        queue[slot]["uploaded"] = True
        with open(QUEUE_FILE, "w", encoding="utf-8") as f:
            json.dump(queue, f, ensure_ascii=False, indent=2)
        log(f"✅ [{label}] 업로드 완료: {title}")
    else:
        log(f"❌ [{label}] 업로드 실패 (exit code {result.returncode})")
        if result.stderr:
            log(result.stderr.strip())
        sys.exit(1)


if __name__ == "__main__":
    main()
