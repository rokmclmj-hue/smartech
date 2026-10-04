# -*- coding: utf-8 -*-
"""이미 올린 숏츠 중 자막(CC)이 없는 영상에 자막 파일을 채운다. 다시 돌려도 이미 있는 영상은 건너뛴다.

사용법: python 블로그/shorts/backfill_captions.py
"""
import glob
import json
import os
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from publish_short import OUTPUT_DIR, RESULT_NAME, build_scenes, get_service  # noqa: E402
from shorts_lib import scenes_to_srt  # noqa: E402


def legacy():
    """8월 묶음 42편: 영상 폴더의 N.srt를 올린다. 하루 사용량이 다 차면 멈추고, 다음 날 다시 돌리면 이어서 한다."""
    from googleapiclient.http import MediaFileUpload
    from shorts_lib import VIDEO_DIR

    sys.path.insert(0, os.path.join(os.path.dirname(OUTPUT_DIR), "youtube"))
    from video_ids import VIDEO_IDS

    youtube = get_service()
    done = skipped = failed = 0
    for num, video_id in sorted(VIDEO_IDS.items()):
        srt_path = os.path.join(VIDEO_DIR, f"{num}.srt")
        try:
            existing = youtube.captions().list(part="snippet", videoId=video_id).execute().get("items", [])
            if any(c["snippet"]["language"] == "ko" and c["snippet"].get("trackKind") != "asr" for c in existing):
                skipped += 1
                continue
            if not os.path.exists(srt_path):
                print(f"[실패] {num}번 — 자막 파일 없음: {srt_path}")
                failed += 1
                continue
            youtube.captions().insert(
                part="snippet",
                body={"snippet": {"videoId": video_id, "language": "ko", "name": "한국어", "isDraft": False}},
                media_body=MediaFileUpload(srt_path, mimetype="application/octet-stream"),
            ).execute()
            print(f"[성공] {num}번 ({video_id})", flush=True)
            done += 1
        except Exception as e:
            if "quotaExceeded" in str(e):
                print(f"[중단] {num}번에서 하루 사용량 초과 — 내일 다시 실행하면 이어서 합니다.")
                break
            print(f"[실패] {num}번 ({video_id}): {e}")
            failed += 1
    print(f"성공 {done} / 이미 있음 {skipped} / 실패 {failed} / 전체 {len(VIDEO_IDS)}")
    return 1 if failed else 0


def main():
    from googleapiclient.http import MediaInMemoryUpload

    if "--legacy" in sys.argv:
        return legacy()

    youtube = get_service()
    done = skipped = failed = 0
    for result_path in sorted(glob.glob(os.path.join(OUTPUT_DIR, "*", "*", "*", RESULT_NAME))):
        folder = os.path.dirname(result_path)
        name = os.path.basename(folder)
        with open(result_path, encoding="utf-8") as f:
            video_id = json.load(f)["videoId"]
        try:
            existing = youtube.captions().list(part="snippet", videoId=video_id).execute().get("items", [])
            if any(c["snippet"]["language"] == "ko" for c in existing):
                print(f"[건너뜀] {name} — 이미 자막 있음")
                skipped += 1
                continue
            with open(os.path.join(folder, "shorts.json"), encoding="utf-8") as f:
                spec = json.load(f)
            srt = scenes_to_srt(build_scenes(folder, spec))
            youtube.captions().insert(
                part="snippet",
                body={"snippet": {"videoId": video_id, "language": "ko", "name": "한국어", "isDraft": False}},
                media_body=MediaInMemoryUpload(srt.encode("utf-8"), mimetype="application/octet-stream"),
            ).execute()
            print(f"[성공] {name} ({video_id})")
            done += 1
        except Exception as e:
            print(f"[실패] {name} ({video_id}): {e}")
            failed += 1
    print(f"성공 {done} / 건너뜀 {skipped} / 실패 {failed}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
