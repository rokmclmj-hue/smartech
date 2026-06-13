"""
블로그 글 홈페이지 업로드 스크립트
- AI 생성 이미지 + 현장사진(field-*.png) 모두 Blob 업로드
- 현장사진은 thumbnail 뒤, body-2 뒤에 자동 삽입

사용법:
  python upload_post.py                          <- 스퍼터 공정 글 (기본값)
  python upload_post.py "진공펌프 수리 시 주의사항"   <- 다른 글
"""
import urllib.request, json, sys, os, re, mimetypes, time

sys.stdout.reconfigure(encoding="utf-8")

# ── .env 로드 ──────────────────────────────────────────
ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")

def load_env(path):
    env = {}
    if not os.path.exists(path):
        return env
    for line in open(path, encoding="utf-8"):
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip()
    return env

env = load_env(ENV_PATH)
SECRET        = env.get("BLOG_UPLOAD_SECRET", "")
API_URL       = env.get("API_URL", "https://www.smartechvacuum.com/api/upload-blog")
BASE_URL      = API_URL.rsplit("/api/", 1)[0]
IMG_UPLOAD_URL = f"{BASE_URL}/api/upload-image"

if not SECRET:
    print("[ERROR] .env 파일에 BLOG_UPLOAD_SECRET이 없습니다.")
    sys.exit(1)

# ── 경로 설정 ──────────────────────────────────────────
OUTPUT_DIR  = os.path.join(os.path.dirname(__file__), "output")
topic       = sys.argv[1] if len(sys.argv) > 1 else "스퍼터 공정 에드워드 드라이진공펌프"

# "2026-06/폴더명" 형식이면 그대로, 아니면 월별 서브폴더 자동 탐색
BLOG_FOLDER = os.path.join(OUTPUT_DIR, topic)
if not os.path.isdir(BLOG_FOLDER):
    for entry in os.listdir(OUTPUT_DIR):
        candidate = os.path.join(OUTPUT_DIR, entry, topic)
        if os.path.isdir(candidate):
            BLOG_FOLDER = candidate
            break
IMAGES_DIR  = os.path.join(BLOG_FOLDER, "images")

print(f"주제: {topic}")

# ── Blob 업로드 함수 ───────────────────────────────────
def upload_to_blob(filepath, filename):
    with open(filepath, "rb") as f:
        file_data = f.read()
    content_type = mimetypes.guess_type(filename)[0] or "image/png"
    boundary = f"boundary{int(time.time() * 1000)}"
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="folder"\r\n\r\n'
        f"blog\r\n"
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        f"Content-Type: {content_type}\r\n\r\n"
    ).encode("utf-8") + file_data + f"\r\n--{boundary}--\r\n".encode("utf-8")
    req = urllib.request.Request(
        IMG_UPLOAD_URL, data=body,
        headers={"Authorization": f"Bearer {SECRET}",
                 "Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as res:
            return json.loads(res.read())["url"]
    except urllib.error.HTTPError as e:
        raise Exception(f"ImageUpload {e.code}: {e.read().decode('utf-8', errors='replace')[:200]}")

# ── 마크다운 읽기 ──────────────────────────────────────
md_path = os.path.join(BLOG_FOLDER, "final.md")
if not os.path.exists(md_path):
    print(f"[ERROR] final.md 없음: {md_path}")
    sys.exit(1)
content = open(md_path, encoding="utf-8").read()

# ── AI 생성 이미지 업로드 및 URL 교체 ─────────────────
print("=== AI 생성 이미지 업로드 ===")

def replace_ai_image(match):
    alt, filename = match.group(1), match.group(2)
    filepath = os.path.join(IMAGES_DIR, filename)
    if not os.path.exists(filepath):
        print(f"  [SKIP] {filename}")
        return match.group(0)
    try:
        print(f"  업로드: {filename}")
        url = upload_to_blob(filepath, filename)
        print(f"  완료:   {url}")
        return f"![{alt}]({url})"
    except Exception as e:
        print(f"  [ERROR] {filename}: {e}")
        return match.group(0)

# field-*.png는 아래 현장사진 섹션에서 별도 처리 (중복 방지)
content = re.sub(r"!\[([^\]]*)\]\(\./images/((?!field-)[^)]+)\)", replace_ai_image, content)

# ── 현장사진 업로드 및 삽입 ────────────────────────────
field_photos = sorted([
    f for f in os.listdir(IMAGES_DIR)
    if f.startswith("field-") and f.endswith((".png", ".jpg"))
]) if os.path.exists(IMAGES_DIR) else []

if field_photos:
    print("\n=== 현장사진 업로드 ===")
    field_urls = []
    for fname in field_photos:
        fpath = os.path.join(IMAGES_DIR, fname)
        try:
            print(f"  업로드: {fname}")
            url = upload_to_blob(fpath, fname)
            print(f"  완료:   {url}")
            field_urls.append((fname, url))
        except Exception as e:
            print(f"  [ERROR] {fname}: {e}")

    for fname, url in field_urls:
        alt = fname.replace("-", " ").replace(".png", "").replace(".jpg", "")
        # final.md에 이미 참조된 경우 → 경로만 교체 (중복 삽입 방지)
        pattern = r"!\[([^\]]*)\]\(\./images/" + re.escape(fname) + r"\)"
        if re.search(pattern, content):
            content = re.sub(pattern, lambda m, u=url: f"![{m.group(1)}]({u})", content)
        else:
            # 참조 없는 경우 → 첫 번째 이미지 뒤에 삽입
            content = re.sub(
                r'(!\[[^\]]*\]\(https?://[^\)]+\))',
                r'\1\n\n![' + alt + '](' + url + ')',
                content,
                count=1
            )

# ── frontmatter 파싱 (category 추출 후 제거) ──────────
category = "기술문의"
if content.startswith("---"):
    end = content.find("---", 3)
    if end != -1:
        frontmatter = content[3:end].strip()
        for line in frontmatter.splitlines():
            if line.startswith("category:"):
                category = line.split(":", 1)[1].strip()
        content = content[end + 3:].lstrip("\n")

# ── 제목·태그·메타 추출 ────────────────────────────────
title_match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
title = title_match.group(1).strip() if title_match else topic

tags_match = re.search(r"(#\S+(?:\s+#\S+)+)\s*$", content, re.MULTILINE)
tags = tags_match.group(1).strip() if tags_match else ""

meta_path = os.path.join(BLOG_FOLDER, "meta.txt")
meta_desc = ""
if os.path.exists(meta_path):
    for line in open(meta_path, encoding="utf-8"):
        if line.strip().lower().startswith("description:"):
            meta_desc = line.split(":", 1)[1].strip()
            # 전화번호(031-...) 등 연락처 제거 — 리드 문장으로만 사용
            meta_desc = re.sub(r"\s*031-\d{3}-\d{4}", "", meta_desc).strip().rstrip(".")
            break

naver_path = os.path.join(BLOG_FOLDER, "naver.md")
naver_content = open(naver_path, encoding="utf-8").read().strip() if os.path.exists(naver_path) else ""

faq_path = os.path.join(BLOG_FOLDER, "faq.json")
faq_schema = ""
if os.path.exists(faq_path):
    faq_schema = open(faq_path, encoding="utf-8").read().strip()
    print(f"  FAQ 스키마 로드: {faq_path}")

# ── API 전송 ───────────────────────────────────────────
print(f"\n=== 홈페이지 업로드 (카테고리: {category}) ===")
payload = {
    "title":        title,
    "content":      content,
    "naverContent": naver_content,
    "metaDesc":     meta_desc,
    "tags":         tags,
    "category":     category,
    "faqSchema":    faq_schema,
    "sourceFile":   topic,
}
data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
req = urllib.request.Request(
    API_URL, data=data,
    headers={"Content-Type": "application/json",
             "Authorization": f"Bearer {SECRET}"},
    method="POST",
)
try:
    with urllib.request.urlopen(req) as res:
        result = json.loads(res.read())
        print(f"[SUCCESS] id={result['id']}")
        print(f"[URL]     {result['url']}")
except urllib.error.HTTPError as e:
    print(f"[HTTP {e.code}]", e.read().decode("utf-8", errors="replace"))
except Exception as e:
    print(f"[ERROR] {e}")
