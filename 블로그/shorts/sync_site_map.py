# -*- coding: utf-8 -*-
"""lib/blog-shorts.json을 유튜브의 실제 상태와 맞춘다.

홈페이지는 이 파일의 공개 시각(publishAt)을 보고 영상을 넣는다. 유튜브에서 예약 시각을 바꾸거나
영상을 지우면 파일과 어긋나 "볼 수 없는 동영상"이 글에 나올 수 있으므로, 일정을 바꾼 뒤에는 이 도구를 돌린다.

사용법:
  python 블로그/shorts/sync_site_map.py           <- 차이만 보여줌(파일 변경 없음)
  python 블로그/shorts/sync_site_map.py --apply   <- 파일을 유튜브 상태로 고침(그 뒤 커밋·push 필요)
"""
import json
import os
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from publish_short import SITE_MAP_PATH, get_service  # noqa: E402


def main():
    apply = "--apply" in sys.argv
    with open(SITE_MAP_PATH, encoding="utf-8") as f:
        data = json.load(f)
    youtube = get_service()
    ids = [v["videoId"] for v in data.values()]
    actual = {}
    for i in range(0, len(ids), 50):
        resp = youtube.videos().list(part="status,snippet", id=",".join(ids[i:i + 50])).execute()
        for item in resp.get("items", []):
            status = item["status"]
            if status.get("privacyStatus") == "public":
                actual[item["id"]] = item["snippet"]["publishedAt"]
            elif status.get("publishAt"):
                actual[item["id"]] = status["publishAt"]
            else:
                actual[item["id"]] = None  # 비공개인데 예약도 없음 → 글에 넣으면 안 됨

    changes = 0
    for blog_id in list(data):
        entry = data[blog_id]
        vid = entry["videoId"]
        if vid not in actual or actual[vid] is None:
            reason = "유튜브에 없음(삭제됨)" if vid not in actual else "비공개·예약 없음"
            print(f"[제거] 글 {blog_id} {vid} — {reason}")
            del data[blog_id]
            changes += 1
        elif actual[vid][:16] != entry["publishAt"][:16]:
            print(f"[시각 변경] 글 {blog_id} {vid}: {entry['publishAt']} → {actual[vid]}")
            entry["publishAt"] = actual[vid]
            changes += 1

    print(f"확인 {len(ids)}건, 차이 {changes}건")
    if changes and apply:
        tmp = SITE_MAP_PATH + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write(chr(10))
        os.replace(tmp, SITE_MAP_PATH)
        print("lib/blog-shorts.json을 고쳤습니다 — 커밋·push해야 라이브에 반영됩니다.")
    elif changes:
        print("파일은 바꾸지 않았습니다. 고치려면 --apply를 붙여 다시 실행하세요.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
