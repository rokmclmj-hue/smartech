# -*- coding: utf-8 -*-
from PIL import Image, ImageFilter
import os

SRC = r"C:\Users\rokmc\smartech\data\현장사진\03_현장설치\iXL500Q_현장설치사진.jpg"
DST_PROCESSED = r"C:\Users\rokmc\smartech\블로그\output\!processed-images\iXL500Q_blurred.png"
DST_FIELD = r"C:\Users\rokmc\smartech\블로그\output\2026-06\이차전지-PFPE-오일-선택법-20260606\images\field-1.png"

img = Image.open(SRC)
w, h = img.size
print(f"원본 크기: {w} x {h}")

# 1단계: 전체 강한 블러
blurred = img.filter(ImageFilter.GaussianBlur(radius=55))

# 2단계: 왼쪽 구역(가스 캐비닛 라벨) 추가 블러 — 완전히 안 보이게
left_region = blurred.crop((0, 0, int(w * 0.35), h))
left_extra = left_region.filter(ImageFilter.GaussianBlur(radius=40))
blurred.paste(left_extra, (0, 0))

# 3단계: 중앙 펌프 본체만 선명하게 복원
# 중앙 기둥+펌프 유닛: x=1250~2200, y=700~3000
px1, py1 = 1250, 700
px2, py2 = 2200, h
pump_region = img.crop((px1, py1, px2, py2))
blurred.paste(pump_region, (px1, py1))

os.makedirs(os.path.dirname(DST_PROCESSED), exist_ok=True)
blurred.save(DST_PROCESSED)
blurred.save(DST_FIELD)
print(f"블러 처리 완료: {DST_FIELD}")
print(f"캐시: {DST_PROCESSED}")
