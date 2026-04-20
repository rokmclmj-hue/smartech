"""
Oil Pump Speed Curve 추출
조건: 10L SUS+Nitrile, NW25 1.1m, Air, Gas Ballast OFF
컬럼: [Time, ChamberP, BPP, BPSpeed, ...] → p_col=2, s_col=3
BPP = pump inlet pressure (Torr), BPSpeed = pump speed (m³/h)

RV5 is 50Hz data → speed values scaled ×1.2 for 60Hz equivalent
nES300ex treated as nES300 (explosion-proof variant, same performance)
E2M30 treated as E2M28 (closest match in our catalog)
"""

import math, os

TORR = 1.33322

desk = "C:/Users/Robin/Desktop"
files = os.listdir(desk)

FILE_NES = os.path.join(desk, [f for f in files if f.endswith(".csv") and "nES" in f][0])
FILE_E2M = os.path.join(desk, [f for f in files if f.endswith(".csv") and "E2M" in f][0])
FILE_RV  = os.path.join(desk, [f for f in files if f.endswith(".csv") and "RV3" in f][0])

# (file, data_start, data_end, model_output, p_col, s_col, s_scale)
SECTIONS = [
    (FILE_NES,   20,  226, "nES40",   2, 3, 1.0),
    (FILE_NES,  233,  440, "nES65",   2, 3, 1.0),
    (FILE_NES,  447,  652, "nES100",  2, 3, 1.0),
    (FILE_NES,  659,  911, "nES200",  2, 3, 1.0),
    (FILE_NES,  918, 1155, "nES300",  2, 3, 1.0),  # nES300ex → nES300
    (FILE_NES, 1162, 1401, "nES630",  2, 3, 1.0),
    (FILE_E2M,   20,  288, "E2M0.7",  2, 3, 1.0),
    (FILE_E2M,  295,  567, "E2M1.5",  2, 3, 1.0),
    (FILE_E2M,  574,  890, "E2M18",   2, 3, 1.0),
    (FILE_E2M,  897, 1200, "E2M28",   2, 3, 1.0),  # E2M30 → E2M28
    (FILE_RV,    20,  312, "RV3",     2, 3, 1.0),
    (FILE_RV,   319,  616, "RV5",     2, 3, 1.2),  # 50Hz data → ×1.2 for 60Hz
    (FILE_RV,   623,  923, "RV8",     2, 3, 1.0),
    (FILE_RV,   930, 1221, "RV12",    2, 3, 1.0),
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


def extract(file, start, end, model, p_col, s_col, s_scale):
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
            s = float(parts[s_col]) * s_scale
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


print("// 오일 펌프 Speed Curves — Edwards PumpCalc (2026-04-21)")
print("// 10L SUS+Nitrile, NW25 1.1m, Air, Gas Ballast OFF")
print("// RV5: 50Hz 데이터 → speed ×1.2로 60Hz 환산")
print("// nES300ex → nES300 매핑 / E2M30 → E2M28 매핑")
print("// X = pump inlet pressure [mbar], Y = pumping speed [m³/h]")
print()

for sec in SECTIONS:
    file, start, end, model, p_col, s_col, s_scale = sec
    curve, ult = extract(*sec)
    if not curve:
        print(f"// {model}: 데이터 없음")
        continue
    pts = ", ".join(f"[{p},{s}]" for p, s in curve)
    max_s = max(s for _, s in curve[:-1]) if len(curve) > 1 else 0
    print(f"// {model}  (ultimate≈{ult:.4f} mbar, peak speed≈{max_s:.1f} m³/h)")
    print(f"  speedCurve: [{pts}],")
    print()
