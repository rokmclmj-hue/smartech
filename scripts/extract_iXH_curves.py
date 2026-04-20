"""
iXH 반도체 드라이펌프 Speed Curve 추출
조건: 100L SUS+Nitrile, NW25 1.1m, Air, 60Hz (or 56slm purge)

파일 1 컬럼 (iXH100~1820):
  [Time, ChamberP, BPP, BPSpeed, ...] → p_col=2, s_col=3

파일 2 컬럼 (iXH3030~6060H, 멀티스테이지):
  [Time, GearboxP, InletP, BackingP, ChamberP, InletSpeed, ...] → p_col=2, s_col=5
"""

import math, os

TORR = 1.33322

desk = 'C:/Users/Robin/Desktop'
files = os.listdir(desk)
FILE1 = os.path.join(desk, [f for f in files if f.endswith('.csv') and ('iXH100' in f or 'iXH1820' in f)][0])
FILE2 = os.path.join(desk, [f for f in files if f.endswith('.csv') and ('iXH3030' in f or 'iXH6060' in f)][0])

# (file, data_start, data_end, model, p_col, s_col)
# FILE1 column structures vary by pump:
#   iXH100:         [Time, ChamberP, BPP,      BPSpeed]        → p=2,s=3
#   iXH200H:        [Time, BPP,      ChamberP, BPSpeed]        → p=1,s=3
#   iXH610:         [Time, InletP,   BPP,      ChamberP, InletSpeed, ...] → p=1,s=4
#   iXH1210/20/820H:[Time, InletP,   GearboxP, BPP, ChamberP, InletSpeed,...] → p=1,s=5
# FILE2: [Time, GearboxP, InletP, BackingP, ChamberP, InletSpeed, ...] → p=2,s=5
SECTIONS = [
    (FILE1,   20,   274, "iXH100",    2, 3),
    (FILE1,  281,   522, "iXH200H",   1, 3),
    (FILE1,  529,   860, "iXH610",    1, 4),
    (FILE1,  867,  1262, "iXH1210H",  1, 5),
    (FILE1, 1269,  1667, "iXH1220H",  1, 5),
    (FILE1, 1674,  2071, "iXH1820H",  1, 5),
    (FILE2,   20,   425, "iXH3030",   2, 5),
    (FILE2,  432,   823, "iXH3045H",  2, 5),
    (FILE2,  830,  1235, "iXH4550HT", 2, 5),
    (FILE2, 1242,  1639, "iXH6050H",  2, 5),
]

def logspace(p_start, p_end, n):
    if p_start <= 0 or p_end <= 0: return []
    ls, le = math.log10(p_start), math.log10(p_end)
    return [10 ** (ls + i * (le - ls) / (n - 1)) for i in range(n)]

file_cache = {}
def get_lines(path):
    if path not in file_cache:
        with open(path, encoding='utf-8-sig', errors='replace') as f:
            file_cache[path] = f.readlines()
    return file_cache[path]

def extract(file, start, end, model, p_col, s_col):
    lines = get_lines(file)
    raw = []
    p_min_bpp = float('inf')

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
        if t < 0.005 or s <= 0:
            continue
        raw.append((p, s))
        if p < p_min_bpp:
            p_min_bpp = p

    if not raw:
        return [], 0

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

    # ultimate 추정: BPP 최솟값을 반올림하여 사용
    ult = round(p_min_bpp, 4) if p_min_bpp < float('inf') else 0.005
    curve.append((ult, 0.0))
    return curve, ult

print("// iXH 반도체 드라이펌프 Speed Curves — Edwards PumpCalc (2026-04-21)")
print("// 100L SUS+Nitrile, NW25 1.1m, Air")
print("// iXH100~1820: 44/56 slm purge, 60Hz")
print("// iXH3030~6060H: 44/96/133 slm purge")
print("// X = pump inlet pressure [mbar], Y = pumping speed [m³/h]")
print()

for sec in SECTIONS:
    file, start, end, model, p_col, s_col, *_ = sec
    curve, ult = extract(*sec)
    if not curve:
        print(f'// {model}: 데이터 없음')
        continue
    pts = ", ".join(f"[{p},{s}]" for p, s in curve)
    max_s = max(s for _, s in curve[:-1]) if len(curve) > 1 else 0
    print(f'// {model}  (ultimate≈{ult:.4f} mbar, peak speed≈{max_s:.1f} m³/h)')
    print(f'  speedCurve: [{pts}],')
    print()
