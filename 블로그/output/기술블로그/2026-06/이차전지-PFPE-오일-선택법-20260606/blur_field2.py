# -*- coding: utf-8 -*-
from PIL import Image, ImageFilter
import os, shutil

SRC = r"C:\Users\rokmc\Desktop\20230622_094250.jpg"
DST_PROCESSED = r"C:\Users\rokmc\smartech\블로그\output\!processed-images\20230622_094250_blurred.png"
DST_FIELD = r"C:\Users\rokmc\smartech\블로그\output\2026-06\이차전지-PFPE-오일-선택법-20260606\images\field-1.png"

# 원본을 현장사진 폴더에도 복사
FIELD_PHOTO_DST = r"C:\Users\rokmc\smartech\data\현장사진\01_장비외관\20230622_094250.jpg"
if not os.path.exists(FIELD_PHOTO_DST):
    shutil.copy2(SRC, FIELD_PHOTO_DST)
    print(f"현장사진 복사 완료: {FIELD_PHOTO_DST}")

from PIL import ImageOps

img = Image.open(SRC)
img = ImageOps.exif_transpose(img)  # EXIF 회전 자동 보정
w, h = img.size
print(f"보정 후 크기: {w} x {h}")

# 1단계: 전체 초강력 블러 (3회 반복으로 완전히 뭉개기)
blurred = img.filter(ImageFilter.GaussianBlur(radius=40))
blurred = blurred.filter(ImageFilter.GaussianBlur(radius=40))
blurred = blurred.filter(ImageFilter.GaussianBlur(radius=40))

# 2단계: 펌프 본체 + 케이블 영역만 선명하게 복원 (양동이·프레임 제외)
px1 = int(w * 0.15)   # 좌측 — 양동이 제외
px2 = int(w * 0.80)   # 우측 — 프레임 제외
py1 = int(h * 0.60)   # 상단 — 펌프 위쪽부터
py2 = int(h * 0.90)   # 하단 — 바닥 제외

pump_region = img.crop((px1, py1, px2, py2))
blurred.paste(pump_region, (px1, py1))

os.makedirs(os.path.dirname(DST_PROCESSED), exist_ok=True)
blurred.save(DST_PROCESSED)
blurred.save(DST_FIELD)
print(f"블러 처리 완료: {DST_FIELD}")
