# -*- coding: utf-8 -*-
"""42개 숏츠의 화면 자막(caption)을 유튜브 CC 자막 파일(SRT)로 변환해 저장.
build_short.py(1번)·batch_render.py(2~42번)에 이미 있는 caption 텍스트를 그대로 재사용 — 새로 창작하지 않음."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from shorts_lib import scenes_to_srt
from build_short import scenes as scenes_1
from batch_render import ITEMS, START_NUM

OUT_DIR = r"C:\Users\rokmc\Desktop\스마텍_유튜브숏츠"
os.makedirs(OUT_DIR, exist_ok=True)


def write_srt(num: int, scenes: list, label: str):
    srt_text = scenes_to_srt(scenes)
    if not srt_text.strip():
        print(f"[{num}] {label}: 자막 없음(스킵)")
        return
    out_path = os.path.join(OUT_DIR, f"{num}.srt")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(srt_text)
    print(f"[{num}] {label}: {out_path}")


def main():
    write_srt(1, scenes_1, "베어링소음진단(파일럿)")
    for i, (name, scenes) in enumerate(ITEMS):
        num = START_NUM + i
        write_srt(num, scenes, name)


if __name__ == "__main__":
    main()
