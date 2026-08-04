"""
SmartechBlog 자동 업로드 스크립트
Windows 작업 스케줄러가 월/수/금에 자동 실행함.
Claude 없이 독립 실행 가능. Python만 있으면 됨.

사용법:
  python auto_upload.py --slot day1              (월요일, 실제 업로드)
  python auto_upload.py --slot day2              (수요일, 실제 업로드)
  python auto_upload.py --slot day3              (금요일, 실제 업로드)
  python auto_upload.py --slot day1 --dry-run   (연결만 확인, 업로드 안 함)
  python auto_upload.py --slot day3 --force     (예정 요일이 아니어도 강제 업로드)
"""

import json
import subprocess
import sys
import os
import time
from datetime import datetime

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

MAX_RETRY = 3
RETRY_DELAY = 30  # 업로드 실패 시 재시도 대기 시간 (초)

PYTHON_EXE = r"C:\Users\rokmc\AppData\Local\Programs\Python\Python312\python.exe"
UPLOAD_SCRIPT = r"C:\Users\rokmc\smartech\블로그\upload_post.py"
QUEUE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "upload-queue.json")
LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "upload-log.txt")

SLOT_LABEL = {
    "day1": "월요일",
    "day2": "수요일",
    "day3": "금요일",
}

# datetime.weekday(): 월=0 ... 일=6
SLOT_WEEKDAY = {
    "day1": 0,
    "day2": 2,
    "day3": 4,
}
WEEKDAY_NAMES = ["월", "화", "수", "목", "금", "토", "일"]


def log(msg):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {msg}"
    print(line)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def main():
    slot = None
    dry_run = "--dry-run" in sys.argv
    force = "--force" in sys.argv

    if "--slot" in sys.argv:
        idx = sys.argv.index("--slot")
        if idx + 1 < len(sys.argv):
            slot = sys.argv[idx + 1]

    if slot not in ("day1", "day2", "day3"):
        log("❌ 슬롯 인수가 없거나 잘못됨. --slot day1 / day2 / day3 중 하나 필요.")
        sys.exit(1)

    label = SLOT_LABEL[slot]
    mode = "[테스트]" if dry_run else ""
    log(f"--- 자동 업로드 시작{mode}: {label} ({slot}) ---")

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

    if dry_run:
        import urllib.request
        env_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
        api_url = "https://smartechvacuum.com/api/upload-blog"
        if os.path.exists(env_file):
            with open(env_file, "r", encoding="utf-8") as ef:
                for line in ef:
                    if line.startswith("API_URL="):
                        api_url = line.strip().split("=", 1)[1]
        try:
            req = urllib.request.Request(api_url, method="HEAD")
            urllib.request.urlopen(req, timeout=5)
            log(f"✅ [테스트] 연결 성공: {api_url}")
        except Exception as e:
            log(f"❌ [테스트] 연결 실패: {api_url} → {e}")
            sys.exit(1)
        log(f"ℹ️ [테스트] 실제 업로드는 하지 않았습니다. --dry-run 모드.")
        sys.exit(0)

    if post.get("uploaded"):
        log(f"✅ [{label}] 이미 업로드 완료: {title}")
        sys.exit(0)

    if not post.get("approved"):
        log(f"⏸️ [{label}] 승인 대기 중: {title}")
        log(f"   → upload-queue.json 에서 \"{slot}\".approved 를 true 로 바꾸면 다음 실행 시 업로드됩니다.")
        sys.exit(0)

    if not force:
        today_weekday = datetime.now().weekday()
        expected_weekday = SLOT_WEEKDAY[slot]
        if today_weekday != expected_weekday:
            log(f"⏸️ [{label}] 아직 예정 요일이 아님 (예정: {label}, 오늘: {WEEKDAY_NAMES[today_weekday]}요일). 업로드 건너뜀.")
            log(f"   예정보다 먼저 올리려면 --force 옵션을 추가하세요.")
            sys.exit(0)

    log(f"📤 [{label}] 업로드 시작: {title} (폴더: {folder})")

    success = False
    for attempt in range(1, MAX_RETRY + 1):
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
            success = True
            break

        log(f"❌ [{label}] 업로드 실패 (시도 {attempt}/{MAX_RETRY}, exit code {result.returncode})")
        if result.stderr:
            log(result.stderr.strip())
        if attempt < MAX_RETRY:
            log(f"⏳ {RETRY_DELAY}초 후 재시도합니다...")
            time.sleep(RETRY_DELAY)

    if success:
        queue[slot]["uploaded"] = True
        with open(QUEUE_FILE, "w", encoding="utf-8") as f:
            json.dump(queue, f, ensure_ascii=False, indent=2)
        log(f"✅ [{label}] 업로드 완료: {title}")
    else:
        log(f"❌ [{label}] {MAX_RETRY}회 시도 모두 실패. 수동 업로드 필요: {folder}")
        sys.exit(1)


if __name__ == "__main__":
    main()
