"""
nES 신규 모델 + nES+EH 부스터 조합 + EXS750 Speed Curve 추출
조건: 100L SUS+Viton, NW40 10m 3-bend, Air, GB OFF, 60Hz, t=300s

컬럼 주의:
  nES300:         col1=Chamber, col2=BP Pressure → p_col=2, s_col=3
  nES470/630/300S:col1=BP Pressure, col2=Chamber  → p_col=1, s_col=3
  nES630/EH***:   col1=EH Inlet, col2=BP          → p_col=1, s_col=4
  EXS750:         col1=Chamber, col2=BP Pressure  → p_col=2, s_col=3
    (EXS750 조건: 100L, NW100 1m 3-bend, t=300s)
"""

import math

TORR = 1.33322

FILE_NES = "C:/Users/Robin/Desktop/nES300_nES300S_nES630EH4200.csv"
FILE_EXS = "C:/Users/Robin/Desktop/EXS750.csv"

# (file, start_1idx, end_1idx, model, p_col, s_col)
# nES_CSV: PumpSets at 0-idx 13,259,506,754,1001,1307
SECTIONS = [
    # standalone nES (새 조건: 100L, NW40 10m)
    (FILE_NES,   20,  244, "nES300",   2, 3),
    (FILE_NES,  266,  491, "nES470",   1, 3),
    (FILE_NES,  513,  739, "nES630",   1, 3),
    (FILE_NES,  761,  986, "nES300S",  1, 3),
    # nES+EH 부스터 조합
    (FILE_NES, 1008, 1292, "nES630/EH2600", 1, 4),
    (FILE_NES, 1314, 1599, "nES630/EH4200", 1, 4),
    # EXS750 (NW100 1m 3-bend, 100L)
    (FILE_EXS,   20,  292, "EXS750",   2, 3),
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
    p_min = float("inf")

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
        if p < p_min:
            p_min = p

    if not raw:
        return [], 0

    raw.sort(key=lambda x: -x[0])
    p_max = raw[0][0]
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

    ult = round(p_min, 5)
    curve.append((ult, 0.0))
    return curve, ult


print("// nES new + nES+EH + EXS750 Speed Curves - Edwards PumpCalc (2026-04-23)")
print("// standalone: 100L, NW40 10m 3-bend, Air, GB OFF, 60Hz, t=300s")
print("// EXS750:     100L, NW100 1m 3-bend, Air, 60Hz, t=300s")
print("// X = pump inlet pressure [mbar], Y = pumping speed [m3/h]")
print()

for sec in SECTIONS:
    file, start, end, model, p_col, s_col = sec
    curve, ult = extract(file, start, end, model, p_col, s_col)
    if not curve:
        print(f"// {model}: no data")
        continue
    pts = ", ".join(f"[{p},{s}]" for p, s in curve)
    max_s = max(s for _, s in curve[:-1]) if len(curve) > 1 else 0
    print(f"// {model}  (sim_min~{ult:.5f} mbar, peak~{max_s:.0f} m3/h)")
    print(f"  speedCurve: [{pts}],")
    print()
