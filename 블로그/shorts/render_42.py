# -*- coding: utf-8 -*-
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from shorts_lib import build_video

BASE = r"C:\Users\rokmc\smartech\블로그\output"
OUT_DIR = r"C:\Users\rokmc\Desktop\스마텍_유튜브숏츠"
f2 = "납품사례/2026-06/20260622-H사-TStation85D"

scenes = [
    dict(image=os.path.join(BASE, f2, "images", "field-2.jpg"),
         caption=["촉매 연구 분석장비에", "T-Station 85D 납품"], highlight=["T-Station 85D"], duration=4.5),
    dict(image=os.path.join(BASE, f2, "images", "field-1.jpg"),
         caption=["오일없는 XDD1", "다이어프램 백킹펌프"], highlight=["오일없는"], duration=4.5),
]

out_path = os.path.join(OUT_DIR, "42.촉매연구소-TStation85D-납품사례.mp4")
build_video(scenes, out_path)
print(f"완료: {out_path}")
