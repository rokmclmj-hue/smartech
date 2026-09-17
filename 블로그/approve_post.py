"""
approve_post.py — upload-queue.json approved=true 설정 후 upload_post.py 실행

사용법:
  python approve_post.py "2026-06/진공건조-드라이펌프-선택기준-20260613"
"""
import sys, json, os, re, subprocess, tempfile, shutil
from datetime import datetime

sys.stdout.reconfigure(encoding="utf-8")

LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "upload-log.txt")


def log(msg):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {msg}"
    print(line)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")


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

proc = subprocess.Popen(
    [sys.executable, os.path.join(os.path.dirname(__file__), "upload_post.py"), folder],
    stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, encoding="utf-8", bufsize=1,
)
uploaded_blog_id = None
for line in proc.stdout:
    print(line, end="")
    m = re.search(r"\[SUCCESS\] id=(\d+)", line)
    if m:
        uploaded_blog_id = m.group(1)
proc.wait()

if proc.returncode != 0:
    print(f"[ERROR] upload_post.py가 실패했습니다 (exit {proc.returncode}). 위 오류 메시지를 확인하세요.")
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
log(f"✅ [수동승인/approve_post.py] 업로드 완료: {queue[matched].get('title', folder)} (폴더: {folder})")

# 발행된 블로그 글 기반 X(트위터) 초안 자동 생성 (PENDING, 게시는 여전히 관리자 수동 승인)
if uploaded_blog_id:
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    print(f"\n=== X 초안 자동 생성 (블로그 id={uploaded_blog_id}) ===")
    x_result = subprocess.run(
        ["node", "--env-file=.env", "scripts/generate-x-posts-from-blog.mjs", "--id", uploaded_blog_id],
        cwd=project_root, check=False,
    )
    if x_result.returncode != 0:
        print("[WARN] X 초안 자동 생성 실패 — 블로그 발행 자체는 정상 완료됨. 필요하면 수동 실행:")
        print(f"  node --env-file=.env scripts/generate-x-posts-from-blog.mjs --id {uploaded_blog_id}")
        log(f"⚠️ X 초안 자동생성 실패 (블로그 id={uploaded_blog_id}) — 블로그 발행은 정상")
    else:
        log(f"✅ X 초안 자동생성 완료 (블로그 id={uploaded_blog_id}), /admin/x-posts에서 승인 대기")
else:
    print("[INFO] 업로드 로그에서 블로그 id를 찾지 못해 X 초안 자동 생성을 건너뜁니다.")
