"""파일럿 확정본 — Close Up 음악으로 최종 렌더링"""
import os
import sys
sys.path.insert(0, os.path.dirname(__file__))
from shorts_lib import build_video

folder = r"C:\Users\rokmc\smartech\블로그\output\기술블로그\2026-08\0803-베어링소음진단\images"
out_dir = r"C:\Users\rokmc\Desktop\스마텍_유튜브숏츠"
os.makedirs(out_dir, exist_ok=True)

scenes = [
    dict(image=os.path.join(folder, "thumbnail.png"), caption=None,
         duration=3.5, is_full_bleed=True, zoom_from=1.0, zoom_to=1.05),
    dict(image=os.path.join(folder, "field-1.png"),
         caption=["웅웅거리는 저주파 소음,", "그냥 두면 안 됩니다"],
         highlight=["저주파"], duration=4.0),
    dict(image=os.path.join(folder, "field-2.png"),
         caption=["베어링 유격이 커지면", "로터·실린더까지 손상됩니다"],
         highlight=["로터·실린더"], duration=4.0),
    dict(image=os.path.join(folder, "사진1.png"),
         caption=["오일 열화 → 베어링 유격", "→ 로터 간섭 → 모터 소손"],
         highlight=["모터 소손"], duration=4.5),
    dict(image=os.path.join(folder, "사진2.png"),
         caption=["소모품 교환 1.5~2년", "오버홀은 2~3년이 기준입니다"],
         highlight=["1.5~2년", "2~3년"], duration=4.5),
]

out_path = os.path.join(out_dir, "1.베어링소음진단.mp4")
build_video(scenes, out_path)
print(f"완료: {out_path}")
