"""
GXS / GXS+GXB 시스템 Speed Curve 추출
100L SUS chamber, NW25 1.1m foreline, Air, 60Hz

컬럼 구조 (확인 완료):
  Standalone GXS160:          [Time, ChamberP, BPP,         BPSpeed, ...]   p_col=2, s_col=3
  Standalone GXS250/450/750:  [Time, BPP,      ChamberP,   BPSpeed, ...]   p_col=1, s_col=3
  GXS160/1750 (file1 PD5):    [Time, GXB_Inlet, GXB_GBVol, BPP, ChamberP, GXB_Speed, ...] p_col=1, s_col=5
  GXS250/2600 (file1 PD6):    [Time, GXB_Inlet, GXB_GBVol, BPP, ChamberP, GXB_Speed, ...] p_col=1, s_col=5
  GXS450/2600 (file2 PD1):    [Time, GXB_GBVol, GXB_Inlet, BPP, ChamberP, GXB_Speed, ...] p_col=2, s_col=5
  GXS450/4200 (file2 PD2):    [Time, GXB_Inlet, GXB_GBVol, BPP, ChamberP, GXB_Speed, ...] p_col=1, s_col=5
  GXS750/2600 (file2 PD3):    [Time, GXB_GBVol, GXB_Inlet, BPP, ChamberP, GXB_Speed, ...] p_col=2, s_col=5
  GXS750/4200 (file2 PD4):    [Time, GXB_Inlet, GXB_GBVol, BPP, ChamberP, GXB_Speed, ...] p_col=1, s_col=5
"""

import math

TORR = 1.33322

FILE1 = r"C:\Users\Robin\Desktop\data_GXS160에서GXS2502600.csv"
FILE2 = r"C:\Users\Robin\Desktop\GXS4502600부터GXS7504200.csv"

SECTIONS = [
    # (file, data_start, data_end, model, p_col, s_col, ultimate_mbar)
    (FILE1, 20,   277,  "GXS160",      2, 3, 1e-2),
    (FILE1, 292,  555,  "GXS250",      1, 3, 1e-2),
    (FILE1, 570,  835,  "GXS450",      1, 3, 1e-2),
    (FILE1, 850, 1115,  "GXS750",      1, 3, 1e-2),
    (FILE1,1130, 1524,  "GXS160/1750", 1, 5, 5e-3),
    (FILE1,1539, 1933,  "GXS250/2600", 1, 5, 5e-3),
    (FILE2,  20,  382,  "GXS450/2600", 2, 5, 5e-3),
    (FILE2, 396,  736,  "GXS450/4200", 1, 5, 5e-3),
    (FILE2, 750, 1112,  "GXS750/2600", 2, 5, 5e-3),
    (FILE2,1126, 1462,  "GXS750/4200", 1, 5, 5e-3),
]

def logspace(p_start, p_end, n):
    if p_start <= 0 or p_end <= 0: return []
    ls, le = math.log10(p_start), math.log10(p_end)
    return [10 ** (ls + i * (le - ls) / (n - 1)) for i in range(n)]

file_cache = {}
def get_lines(path):
    if path not in file_cache:
        with open(path, encoding="utf-8") as f:
            file_cache[path] = f.readlines()
    return file_cache[path]

def extract(file, start, end, model, p_col, s_col, ultimate):
    lines = get_lines(file)
    raw = []
    for line in lines[start-1 : end]:
        parts = line.strip().split(",")
        if len(parts) <= max(p_col, s_col):
            continue
        try:
            t = float(parts[0])
            p = float(parts[p_col]) * TORR   # Torr → mbar
            s = float(parts[s_col])
        except ValueError:
            continue
        if t < 0.005 or s <= 0:   # 초기 과도 상태 + 속도=0 제외
            continue
        raw.append((p, s))

    if not raw:
        return []

    raw.sort(key=lambda x: -x[0])
    p_max, p_min = raw[0][0], raw[-1][0]
    targets = logspace(p_max, p_min, 20)

    curve, used = [], set()
    for target in targets:
        best_i, best_d = -1, float("inf")
        for i, (p, _) in enumerate(raw):
            if i in used: continue
            d = abs(math.log10(p) - math.log10(target))
            if d < best_d:
                best_d, best_i = d, i
        if best_i == -1: continue
        p_v, s_v = raw[best_i]
        if curve and abs(math.log10(p_v) - math.log10(curve[-1][0])) < 0.07:
            continue
        curve.append((round(p_v, 4), round(s_v, 2)))
        used.add(best_i)

    curve.append((ultimate, 0.0))
    return curve

print("// GXS / GXS+GXB Speed Curves — Edwards PumpCalc (2026-04-21)")
print("// 100L SUS+Nitrile, NW25 1.1m, Air, 60Hz")
print("// Standalone GXS: X=BP inlet P [mbar], Y=BP speed [m³/h]")
print("// GXS+GXB system: X=GXB inlet P [mbar], Y=GXB inlet speed (system) [m³/h]")
print()

for sec in SECTIONS:
    file, start, end, model, p_col, s_col, ult = sec
    curve = extract(*sec)
    pts = ", ".join(f"[{p},{s}]" for p, s in curve)
    print(f'// {model}  (ultimate: {ult} mbar)')
    print(f'  speedCurve: [{pts}],')
    print()
