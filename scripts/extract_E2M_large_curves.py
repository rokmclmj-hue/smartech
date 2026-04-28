"""
E2M Large Pump Speed Curve 추출
파일: 펌프칼시뮬레이션데이터/EM/EM.csv
조건: 100L SUS+Nitrile, NW40 10m, Air, Gas Ballast OFF, 60Hz
컬럼(E2M40):   Time, ChamberP, BPP, BPSpeed → p_col=2, s_col=3
컬럼(E2M80+):  Time, BPP, ChamberP, BPSpeed → p_col=1, s_col=3
"""

import math

TORR = 1.33322

FILE_EM = "C:/Users/Robin/Desktop/펌프칼시뮬레이션데이터/EM/EM.csv"

# (file, data_start_1indexed, data_end_1indexed, model, p_col, s_col)
SECTIONS = [
    (FILE_EM,  20, 109, "E2M40",  2, 3),
    (FILE_EM, 131, 271, "E2M80",  1, 3),
    (FILE_EM, 293, 469, "E2M175", 1, 3),
    (FILE_EM, 491, 672, "E2M275", 1, 3),
]


def logspace(p_start, p_end, n):
    if p_start <= 0 or p_end <= 0:
        return []
    ls, le = math.log10(p_start), math.log10(p_end)
    return [10 ** (ls + i * (le - ls) / (n - 1)) for i in range(n)]


file_cache = {}


def get_lines(path):
    if path not in file_cache:
        with open(path, encoding="utf-8-sig", errors="replace") as f:
            file_cache[path] = f.readlines()
    return file_cache[path]


def extract(file, start, end, model, p_col, s_col):
    lines = get_lines(file)
    raw = []
    p_min_inlet = float("inf")

    for line in lines[start - 1 : end]:
        parts = line.strip().split(",")
        if len(parts) <= max(p_col, s_col):
            continue
        try:
            t = float(parts[0])
            p = float(parts[p_col]) * TORR
            s = float(parts[s_col])
        except ValueError:
            continue
        if t < 0.005 or s <= 0:
            continue
        raw.append((p, s))
        if p < p_min_inlet:
            p_min_inlet = p

    if not raw:
        return [], 0

    raw.sort(key=lambda x: -x[0])
    p_max, p_min = raw[0][0], raw[-1][0]
    targets = logspace(p_max, p_min, 20)

    curve, used = [], set()
    for target in targets:
        best_i, best_d = -1, float("inf")
        for i, (p, _) in enumerate(raw):
            if i in used:
                continue
            d = abs(math.log10(p) - math.log10(target))
            if d < best_d:
                best_d, best_i = d, i
        if best_i == -1:
            continue
        p_v, s_v = raw[best_i]
        if curve and abs(math.log10(p_v) - math.log10(curve[-1][0])) < 0.07:
            continue
        curve.append((round(p_v, 4), round(s_v, 2)))
        used.add(best_i)

    ult = round(p_min_inlet, 4) if p_min_inlet < float("inf") else 0.0005
    curve.append((ult, 0.0))
    return curve, ult


print("// E2M Large Speed Curves - Edwards PumpCalc (2026-04-23)")
print("// 100L SUS+Nitrile, NW40 10m, Air, Gas Ballast OFF, 60Hz")
print("// X = pump inlet pressure [mbar], Y = pumping speed [m³/h]")
print()

for sec in SECTIONS:
    file, start, end, model, p_col, s_col = sec
    curve, ult = extract(file, start, end, model, p_col, s_col)
    if not curve:
        print(f"// {model}: 데이터 없음")
        continue
    pts = ", ".join(f"[{p},{s}]" for p, s in curve)
    max_s = max(s for _, s in curve[:-1]) if len(curve) > 1 else 0
    print(f"// {model}  (ultimate~{ult:.4f} mbar, peak speed~{max_s:.1f} m3/h)")
    print(f"  speedCurve: [{pts}],")
    print()
