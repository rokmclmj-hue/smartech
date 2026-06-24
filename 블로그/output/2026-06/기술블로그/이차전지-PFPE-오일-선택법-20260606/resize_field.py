# -*- coding: utf-8 -*-
from PIL import Image
import os

path = r"C:\Users\rokmc\smartech\블로그\output\2026-06\이차전지-PFPE-오일-선택법-20260606\images\field-1.png"
img = Image.open(path)
w, h = img.size
new_w = 1000
new_h = int(h * new_w / w)
img = img.resize((new_w, new_h), Image.LANCZOS)
img.save(path, "PNG", optimize=True)
size_mb = os.path.getsize(path) / 1024 / 1024
print(f"완료: {new_w}x{new_h}, {size_mb:.2f} MB")
