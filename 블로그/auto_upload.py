"""
SmartechBlog 자동 업로드 스크립트
Windows 작업 스케줄러가 2026-09-14부터 월/목에 자동 실행함.
AI 대화창 없이 독립 실행 가능. Python만 있으면 됨.

사용법:
  python auto_upload.py --slot day1              (월요일, 실제 업로드)
  python auto_upload.py --slot day2              (목요일, 실제 업로드)
  python auto_upload.py --slot day3              (전환 전 금요일만 지원)
  python auto_upload.py --slot day1 --dry-run   (일정·승인 확인, 네트워크/업로드 없음)
  --force는 조기 발행 방지를 위해 지원하지 않음. 일정 변경은 별도 사용자 승인 필요.
"""

import json
import subprocess
import sys
import os
import time
import re
import tempfile
from datetime import date, datetime, timedelta, timezone

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

MAX_RETRY = 3
RETRY_DELAY = 30  # 업로드 실패 시 재시도 대기 시간 (초)

PYTHON_EXE = r"C:\Users\rokmc\AppData\Local\Programs\Python\Python312\python.exe"
UPLOAD_SCRIPT = r"C:\Users\rokmc\smartech\블로그\upload_post.py"
QUEUE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "upload-queue.json")
LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "upload-log.txt")

# datetime.weekday(): 월=0 ... 일=6
TRANSITION_DATE = date(2026, 9, 14)
KST = timezone(timedelta(hours=9))
SLOT_WEEKDAY = {"day1": 0, "day2": 3}
LEGACY_SLOT_WEEKDAY = {
    "day1": 0,
    "day2": 2,
    "day3": 4,
    "day4": 1,
    "day5": 3,
}
WEEKDAY_NAMES = ["월", "화", "수", "목", "금", "토", "일"]


def scheduled_date(queue, slot):
    """큐의 ISO 주차에서 정확한 발행일을 계산한다. 과거 큐도 당시 규칙 유지."""
    week = queue.get("_week", "")
    if not isinstance(week, str) or not re.fullmatch(r"\d{4}-W\d{2}", week):
        raise ValueError("큐 _week는 YYYY-Www 형식이어야 합니다.")
    try:
        monday = date.fromisocalendar(int(week[:4]), int(week[6:]), 1)
    except ValueError as exc:
        raise ValueError("큐 _week에 유효한 ISO 주차가 필요합니다.") from exc
    slots = SLOT_WEEKDAY if monday >= TRANSITION_DATE else LEGACY_SLOT_WEEKDAY
    if slot not in slots:
        raise ValueError("2026-09-14부터 day1(월)·day2(목)만 사용합니다.")
    target = monday + timedelta(days=slots[slot])
    explicit = queue.get(slot, {}).get("scheduled_date")
    if explicit is not None and explicit != target.isoformat():
        raise ValueError("scheduled_date가 큐 주차·슬롯의 발행일과 다릅니다.")
    return target


def log(msg):
    timestamp = datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {msg}"
    print(line)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def main():
    slot = None
    dry_run = "--dry-run" in sys.argv
    if "--force" in sys.argv:
        log("❌ --force는 지원하지 않습니다. 승인 없이 발행일 검사를 우회할 수 없습니다.")
        sys.exit(1)

    if "--slot" in sys.argv:
        idx = sys.argv.index("--slot")
        if idx + 1 < len(sys.argv):
            slot = sys.argv[idx + 1]

    if slot not in ("day1", "day2", "day3", "day4", "day5"):
        log("❌ 슬롯 인수가 없거나 잘못됨. --slot day1~day5 중 하나 필요.")
        sys.exit(1)

    mode = "[테스트]" if dry_run else ""
    log(f"--- 자동 업로드 시작{mode}: {slot} ---")

    if not os.path.exists(QUEUE_FILE):
        log("❌ upload-queue.json 파일 없음. 원고 작성·검수 후 큐 등록이 필요합니다.")
        sys.exit(1)

    try:
        with open(QUEUE_FILE, "r", encoding="utf-8") as f:
            queue = json.load(f)
        if not isinstance(queue, dict) or not isinstance(queue.get(slot, {}), dict):
            raise ValueError("큐와 슬롯 항목은 JSON 객체여야 합니다.")
        target = scheduled_date(queue, slot)
    except (ValueError, OSError) as exc:
        log(f"❌ 예약 정보 오류: {exc}")
        sys.exit(1)

    label = WEEKDAY_NAMES[target.weekday()] + "요일"
    today = datetime.now(KST).date()
    if today != target:
        log(f"⏸️ [{label}] 발행일 불일치 (예정: {target}, 오늘: {today}). 업로드 건너뜀.")
        sys.exit(0)

    post = queue.get(slot, {})
    folder = post.get("folder", "")
    title = post.get("title", "")
    if not isinstance(folder, str) or not isinstance(title, str):
        log("❌ folder와 title은 문자열이어야 합니다.")
        sys.exit(1)
    folder, title = folder.strip(), title.strip()

    if not folder:
        log(f"⚠️ [{label}] 업로드 항목이 비어 있음. 원고 작성·검수 후 큐 등록이 필요합니다.")
        sys.exit(0)

    uploaded = post.get("uploaded")
    if uploaded is True:
        log(f"✅ [{label}] 이미 업로드 완료: {title}")
        sys.exit(0)

    if uploaded not in (False, None):
        log("❌ uploaded 값은 true/false로 명시해야 합니다. 중복 발행 방지를 위해 중단합니다.")
        sys.exit(1)

    if post.get("approved") is not True:
        log(f"⏸️ [{label}] 승인 대기 중: {title}")
        log("   → 사용자 사진·원고 승인 후 해당 발행일 예약을 승인해야 합니다.")
        sys.exit(0)

    if dry_run:
        log(f"✅ [테스트] {target} 일정·승인 확인 완료: {title}. 네트워크·업로드 실행 없음.")
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
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
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
        # 업로드 도중 다른 주차로 교체된 큐를 오래된 사본으로 덮어쓰지 않는다.
        with open(QUEUE_FILE, "r", encoding="utf-8") as f:
            current = json.load(f)
        if current != queue:
            log("❌ 업로드는 성공했지만 실행 중 큐가 변경됐습니다. 재실행 전에 발행 상태를 확인하세요.")
            sys.exit(1)
        queue[slot]["uploaded"] = True
        fd, temporary = tempfile.mkstemp(dir=os.path.dirname(QUEUE_FILE), suffix=".tmp")
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as f:
                json.dump(queue, f, ensure_ascii=False, indent=2)
            os.replace(temporary, QUEUE_FILE)
        finally:
            if os.path.exists(temporary):
                os.unlink(temporary)
        log(f"✅ [{label}] 업로드 완료: {title}")
    else:
        log(f"❌ [{label}] {MAX_RETRY}회 시도 모두 실패. 수동 업로드 필요: {folder}")
        sys.exit(1)


if __name__ == "__main__":
    main()
