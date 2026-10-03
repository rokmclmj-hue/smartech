# -*- coding: utf-8 -*-
"""블로그 글 1편 → 유튜브 숏츠 1편 (연결 방식, 2026-10-04 대표님 승인).

원고 폴더의 shorts.json(자막·설명·해시태그)을 읽어 영상을 만들고, 유튜브에 비공개+예약으로 올린다.
upload_post.py가 블로그 발행 직후 호출한다. 여기서 실패해도 블로그 발행에는 영향이 없다.

사용법:
  python shorts/publish_short.py "기술블로그/2026-10/1005-진공흡착-원리" --check        <- 검사만(원고 작성 단계)
  python shorts/publish_short.py "기술블로그/2026-10/1005-진공흡착-원리" --render-only  <- 영상만 만들기(업로드 없음)
  python shorts/publish_short.py "기술블로그/2026-10/1005-진공흡착-원리" --blog-id 106  <- 영상 + 유튜브 예약

shorts.json 형식:
  {
    "description": "글 핵심 2~4문장(final.md 내용만)",
    "hashtags": ["#핵심키워드1", "#핵심키워드2", "#스마텍"],
    "tags": ["검색용 단어 5~8개"],
    "scenes": [
      {"image": "사진1.png", "caption": ["첫 줄", "둘째 줄"], "highlight": ["강조어"], "duration": 4.0}
    ]
  }
제목은 final.md의 H1을 그대로 쓴다. 첫 장면(thumbnail)과 마지막 로고 화면은 자동으로 붙는다.
"""
import argparse
import json
import os
import re
import sys
from datetime import datetime, timedelta, timezone

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HERE = os.path.dirname(os.path.abspath(__file__))
BLOG_DIR = os.path.dirname(HERE)
OUTPUT_DIR = os.path.join(BLOG_DIR, "output")
YT_DIR = os.path.join(BLOG_DIR, "youtube")
TOKEN_PATH = os.path.join(YT_DIR, "token.json")
VIDEO_DIR = r"C:\Users\rokmc\Desktop\진공펌프_소개_자동화\스마텍_유튜브숏츠"
SCOPES = ["https://www.googleapis.com/auth/youtube"]
SITE = "https://www.smartechvacuum.com"
RESULT_NAME = "shorts-result.json"
# 홈페이지 블로그 글이 이 목록을 읽어 해당 숏츠를 본문 아래에 넣는다(lib/blog-shorts.ts). 바뀌면 커밋·push해야 라이브에 반영된다.
SITE_MAP_PATH = os.path.join(os.path.dirname(BLOG_DIR), "lib", "blog-shorts.json")

KST = timezone(timedelta(hours=9))
PUBLISH_HOUR = 12          # 블로그 발행 당일 낮 12시 공개
MIN_LEAD_MINUTES = 30      # 12시까지 30분도 안 남았으면 다음 평일 12시
MAX_TOTAL_SECONDS = 58.0   # 숏츠 길이 제한(60초) 안쪽
OPENER_SECONDS = 3.5
CLOSING_SECONDS = 4.0
CAPTION_FONT_SIZE = 62     # shorts_lib.draw_caption_attached와 같은 값
CAPTION_SIDE_MARGIN = 40

sys.path.insert(0, HERE)


def find_folder(topic):
    """upload_post.py와 같은 규칙: '카테고리/월/폴더' 또는 폴더명만."""
    direct = os.path.join(OUTPUT_DIR, topic)
    if os.path.isdir(direct):
        return direct
    for cat in os.listdir(OUTPUT_DIR):
        cat_path = os.path.join(OUTPUT_DIR, cat)
        if not os.path.isdir(cat_path):
            continue
        for sub in [cat_path] + [os.path.join(cat_path, m) for m in os.listdir(cat_path)]:
            cand = os.path.join(sub, topic)
            if os.path.isdir(cand):
                return cand
    return None


def read_final(folder):
    with open(os.path.join(folder, "final.md"), encoding="utf-8") as f:
        text = f.read()
    m = re.search(r"^# (.+)$", text, re.M)
    if not m:
        raise ValueError("final.md에서 제목(# )을 찾지 못했습니다.")
    return m.group(1).strip(), text


def _numbers(text):
    """숫자 토큰(쉼표 제거). 예: '101,325 Pa' -> {'101325'}"""
    return {n.replace(",", "").rstrip(".") for n in re.findall(r"\d[\d,]*(?:\.\d+)?", text)}


def validate(folder, spec, title, final_text):
    """문제 목록을 돌려준다. 빈 목록이면 통과."""
    from PIL import Image, ImageDraw, ImageFont
    from shorts_lib import FONT_BOLD, make_foreground

    errors = []
    images_dir = os.path.join(folder, "images")
    if not os.path.exists(os.path.join(images_dir, "thumbnail.png")):
        errors.append("images/thumbnail.png 없음")

    desc = spec.get("description", "")
    if not (40 <= len(desc) <= 400):
        errors.append(f"description 길이 {len(desc)}자 (40~400자)")
    hashtags = spec.get("hashtags", [])
    if len(hashtags) != 3 or any(not h.startswith("#") or " " in h for h in hashtags):
        errors.append("hashtags는 '#'로 시작하고 띄어쓰기 없는 3개여야 함")
    elif hashtags[-1] != "#스마텍":
        errors.append("hashtags 마지막은 '#스마텍' 고정")
    tags = spec.get("tags", [])
    if not (5 <= len(tags) <= 8):
        errors.append(f"tags {len(tags)}개 (5~8개)")
    if len(title) > 100:
        errors.append(f"제목 {len(title)}자 — 유튜브 제한 100자 초과")

    scenes = spec.get("scenes", [])
    if not (2 <= len(scenes) <= 6):
        errors.append(f"scenes {len(scenes)}개 (2~6개)")

    final_numbers = _numbers(final_text)
    font = ImageFont.truetype(FONT_BOLD, CAPTION_FONT_SIZE)
    draw = ImageDraw.Draw(Image.new("RGB", (10, 10)))
    total = OPENER_SECONDS + CLOSING_SECONDS
    used_images = set()
    for i, sc in enumerate(scenes, 1):
        label = f"장면{i}"
        path = os.path.join(images_dir, sc.get("image", ""))
        caption = sc.get("caption") or []
        if not os.path.isfile(path):
            errors.append(f"{label}: 이미지 없음 — {sc.get('image')}")
            continue
        if sc["image"] == "thumbnail.png":
            errors.append(f"{label}: thumbnail.png는 첫 화면에 자동으로 들어가므로 장면에 쓰지 않음")
        if sc["image"] in used_images:
            errors.append(f"{label}: 같은 이미지를 두 번 사용 — {sc['image']}")
        used_images.add(sc["image"])
        if not (1 <= len(caption) <= 2):
            errors.append(f"{label}: caption은 1~2줄")
        with Image.open(path) as im:
            box_w = make_foreground(im).width
        for line in caption:
            w = draw.textbbox((0, 0), line, font=font)[2]
            if w > box_w - CAPTION_SIDE_MARGIN:
                errors.append(f"{label}: 자막이 화면보다 김({w}px > {box_w - CAPTION_SIDE_MARGIN}px) — '{line}'")
        for hw in sc.get("highlight") or []:
            if not any(hw in line for line in caption):
                errors.append(f"{label}: 강조어 '{hw}'가 자막에 없음")
        dur = float(sc.get("duration", 4.0))
        if not (3.0 <= dur <= 6.0):
            errors.append(f"{label}: duration {dur}초 (3~6초)")
        total += dur
        # 창작 금지 안전장치: 자막의 숫자는 원고에 있는 숫자여야 한다.
        missing = _numbers(" ".join(caption)) - final_numbers
        if missing:
            errors.append(f"{label}: 원고(final.md)에 없는 숫자 {sorted(missing)}")
    missing = _numbers(desc) - final_numbers
    if missing:
        errors.append(f"description: 원고(final.md)에 없는 숫자 {sorted(missing)}")
    if total > MAX_TOTAL_SECONDS:
        errors.append(f"전체 길이 {total:.1f}초 — {MAX_TOTAL_SECONDS}초 초과")
    return errors


def build_scenes(folder, spec):
    from PIL import Image

    images_dir = os.path.join(folder, "images")
    thumb = os.path.join(images_dir, "thumbnail.png")
    # 세로로 긴 썸네일만 화면 가득 채운다. 정사각형·가로형을 가득 채우면 양옆 글자가 잘린다.
    with Image.open(thumb) as im:
        fills_screen = im.width / im.height <= 0.7
    scenes = [dict(image=thumb, caption=None, duration=OPENER_SECONDS,
                   is_full_bleed=fills_screen, zoom_from=1.0, zoom_to=1.05)]
    for sc in spec["scenes"]:
        scenes.append(dict(image=os.path.join(images_dir, sc["image"]), caption=sc["caption"],
                           highlight=sc.get("highlight") or [], duration=float(sc.get("duration", 4.0))))
    return scenes


def publish_time(now_kst):
    """블로그 발행 당일 낮 12시. 이미 늦었으면 다음 평일(월~금) 12시."""
    target = now_kst.replace(hour=PUBLISH_HOUR, minute=0, second=0, microsecond=0)
    if target - now_kst < timedelta(minutes=MIN_LEAD_MINUTES):
        target += timedelta(days=1)
    while target.weekday() >= 5:
        target += timedelta(days=1)
    return target


def record_for_site(blog_id, video_id, publish_at_kst):
    """lib/blog-shorts.json에 글 id → 숏츠를 기록한다. 실패해도 업로드 결과에는 영향이 없다."""
    try:
        with open(SITE_MAP_PATH, encoding="utf-8") as f:
            data = json.load(f)
        data[str(blog_id)] = {
            "videoId": video_id,
            "publishAt": publish_at_kst.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        }
        data = dict(sorted(data.items(), key=lambda kv: int(kv[0])))
        tmp = SITE_MAP_PATH + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write(chr(10))
        os.replace(tmp, SITE_MAP_PATH)
        print("  홈페이지용 목록(lib/blog-shorts.json)에 기록 — 커밋·push 후 글에 영상이 나타납니다")
    except Exception as e:
        print(f"  [WARN] lib/blog-shorts.json 기록 실패(유튜브 예약은 정상): {e}")


def get_service():
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build

    creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        with open(TOKEN_PATH, "w", encoding="utf-8") as f:
            f.write(creds.to_json())
    return build("youtube", "v3", credentials=creds)


def upload(video_path, srt_path, title, description, tags, publish_at_kst):
    from googleapiclient.http import MediaFileUpload

    youtube = get_service()
    body = {
        "snippet": {"title": title[:100], "description": description, "tags": tags, "categoryId": "28"},
        "status": {
            "privacyStatus": "private",
            "publishAt": publish_at_kst.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "selfDeclaredMadeForKids": False,
        },
    }
    media = MediaFileUpload(video_path, chunksize=-1, resumable=True, mimetype="video/mp4")
    request = youtube.videos().insert(part="snippet,status", body=body, media_body=media)
    response = None
    while response is None:
        _, response = request.next_chunk()
    video_id = response["id"]

    # 자막 실패는 영상 업로드를 되돌리지 않는다.
    try:
        youtube.captions().insert(
            part="snippet",
            body={"snippet": {"videoId": video_id, "language": "ko", "name": "한국어", "isDraft": False}},
            media_body=MediaFileUpload(srt_path, mimetype="application/octet-stream"),
        ).execute()
        print("  자막(CC) 업로드 성공")
    except Exception as e:
        print(f"  [WARN] 자막 업로드 실패(영상은 정상 업로드됨): {e}")
    return video_id


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("topic")
    ap.add_argument("--blog-id", type=int)
    ap.add_argument("--blog-url", help="이미 발행된 글의 주소(주소가 /blog/영문-이름 형태일 때). --blog-id 대신 사용")
    ap.add_argument("--publish-at", help='공개 시각 직접 지정 "YYYY-MM-DD HH:MM" (한국시간). 없으면 당일 낮 12시 규칙')
    ap.add_argument("--check", action="store_true", help="shorts.json 검사만")
    ap.add_argument("--render-only", action="store_true", help="영상만 만들고 업로드하지 않음")
    ap.add_argument("--force", action="store_true", help="이미 올린 기록이 있어도 다시 올림")
    args = ap.parse_args()

    folder = find_folder(args.topic)
    if not folder:
        print(f"[ERROR] 폴더를 찾지 못했습니다: {args.topic}")
        return 1
    name = os.path.basename(folder)
    spec_path = os.path.join(folder, "shorts.json")
    if not os.path.exists(spec_path):
        print(f"[INFO] shorts.json 없음 — 숏츠를 만들지 않습니다: {name}")
        return 0

    with open(spec_path, encoding="utf-8") as f:
        spec = json.load(f)
    title, final_text = read_final(folder)
    errors = validate(folder, spec, title, final_text)
    if errors:
        print(f"[BLOCKED] shorts.json 검사 실패 ({name})")
        for e in errors:
            print(f"  - {e}")
        return 1
    total = OPENER_SECONDS + CLOSING_SECONDS + sum(float(s.get("duration", 4.0)) for s in spec["scenes"])
    print(f"[OK] shorts.json 검사 통과 — 장면 {len(spec['scenes'])}개, 약 {total:.1f}초")
    if args.check:
        return 0

    result_path = os.path.join(folder, RESULT_NAME)
    if os.path.exists(result_path) and not args.force and not args.render_only:
        with open(result_path, encoding="utf-8") as f:
            prev = json.load(f)
        print(f"[SKIP] 이미 올린 숏츠입니다: https://youtube.com/shorts/{prev.get('videoId')} (공개 {prev.get('publishAt')})")
        return 0
    if not args.render_only and not (args.blog_id or args.blog_url):
        print("[ERROR] 업로드에는 --blog-id 또는 --blog-url이 필요합니다(설명란에 글 주소를 넣기 위해).")
        return 1
    if args.publish_at:
        publish_at = datetime.strptime(args.publish_at, "%Y-%m-%d %H:%M").replace(tzinfo=KST)
        if publish_at - datetime.now(KST) < timedelta(minutes=MIN_LEAD_MINUTES):
            print(f"[ERROR] --publish-at이 지금보다 {MIN_LEAD_MINUTES}분 이상 뒤여야 합니다: {args.publish_at}")
            return 1
    else:
        publish_at = None

    from shorts_lib import build_video, scenes_to_srt

    os.makedirs(VIDEO_DIR, exist_ok=True)
    stem = os.path.join(VIDEO_DIR, f"블로그.{name}")
    video_path, srt_path = stem + ".mp4", stem + ".srt"
    scenes = build_scenes(folder, spec)
    print(f"영상 만드는 중... ({video_path})")
    build_video(scenes, video_path)
    with open(srt_path, "w", encoding="utf-8") as f:
        f.write(scenes_to_srt(scenes))
    print("[OK] 영상 완성")
    if args.render_only:
        return 0

    blog_url = args.blog_url or f"{SITE}/blog/{args.blog_id}"
    description = (
        f"{spec['description']}\n\n"
        f"글 전문: {blog_url}\n"
        f"스마텍 진공펌프 수리·부품 문의: {SITE}\n"
        f"{' '.join(spec['hashtags'])}"
    )
    publish_at = publish_at or publish_time(datetime.now(KST))
    target = f"--blog-url {args.blog_url}" if args.blog_url else f"--blog-id {args.blog_id}"
    retry = f'python 블로그/shorts/publish_short.py "{args.topic}" {target}'
    try:
        video_id = upload(video_path, srt_path, title, description, spec["tags"], publish_at)
    except Exception as e:
        if "invalid_grant" in str(e):
            print("[WARN] 유튜브 로그인 열쇠가 만료됐습니다. 영상은 만들어져 있습니다.")
            print("  1) python 블로그/youtube/authorize.py  (rokmclmj@gmail.com으로 로그인)")
            print(f"  2) {retry}")
        elif "uploadLimitExceeded" in str(e):
            print("[WARN] 유튜브 하루 업로드 한도를 넘었습니다(2026-10-04 실측: 하루 10편까지 성공). 영상은 만들어져 있습니다.")
            print(f"  24시간 뒤 다시 실행: {retry}")
        else:
            print(f"[WARN] 유튜브 업로드 실패: {e}")
            print(f"  다시 실행: {retry}")
        return 2

    record = {
        "videoId": video_id,
        "url": f"https://youtube.com/shorts/{video_id}",
        "publishAt": publish_at.strftime("%Y-%m-%d %H:%M KST"),
        "blogId": args.blog_id,
        "blogUrl": blog_url,
        "title": title,
    }
    with open(result_path, "w", encoding="utf-8") as f:
        json.dump(record, f, ensure_ascii=False, indent=2)
    print(f"[SUCCESS] 유튜브 예약 완료: {record['url']} (공개 {record['publishAt']})")
    blog_id = args.blog_id
    if not blog_id:
        m = re.search(r"/blog/(\d+)$", blog_url)
        blog_id = int(m.group(1)) if m else None
    if blog_id:
        record_for_site(blog_id, video_id, publish_at)
    return 0


if __name__ == "__main__":
    sys.exit(main())
