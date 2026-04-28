"""
E2M + EH 부스터 조합 Speed Curve 추출
조건: 100L SUS+Viton, NW40 10m 3-bend, Air, Gas Ballast OFF, 60Hz, t=600s
컬럼: Time | BP_or_EH_Inlet | EH_or_BP_Inlet | Chamber | EH_Speed | ...
  p_col=1: col1=EH inlet (booster system inlet)
  p_col=2: col1=Backing Pump, col2=EH inlet
  s_col=4: EH inlet Speed (m3/h) = system effective speed
X = EH inlet pressure [mbar], Y = system effective speed [m3/h]

섹션 경계 계산:
  data_start_1indexed = PumpSet_0indexed + 7
  data_end_1indexed   = next_PumpSet_0indexed - 15   (2 blank + 14-line config - 1)
"""

import math

TORR = 1.33322

DESK = "C:/Users/Robin/Desktop/펌프칼시뮬레이션데이터/EM"
FILE1 = f"{DESK}/EM+EH250.csv"    # E2M40/80/175 + EH250/500/1200
FILE2 = f"{DESK}/EM+EH2600.csv"   # E2M175/275 + EH1200/2600/4200/500
FILE3 = f"{DESK}/E2M275+EH4200.csv"

# (file, start_1idx, end_1idx, model_name, p_col, s_col)
SECTIONS = [
    # FILE1: PumpSets at 0-idx 13,311,622,908,1207,1512
    (FILE1,   20,  296, "E2M40/EH250",  2, 4),
    (FILE1,  318,  607, "E2M40/EH500",  1, 4),
    (FILE1,  629,  893, "E2M80/EH250",  1, 4),
    (FILE1,  915, 1192, "E2M80/EH500",  1, 4),
    (FILE1, 1214, 1497, "E2M175/EH500", 1, 4),
    (FILE1, 1519, 1832, "E2M175/EH1200",1, 4),
    # FILE2: PumpSets at 0-idx 13,348,684,1005,1323,1649
    # skip line 13 (E2M175+EH1200 duplicate) and 684 (E1M275 typo = E2M275+EH4200 dup)
    (FILE2,  355,  669, "E2M175/EH2600",1, 4),
    (FILE2, 1012, 1308, "E2M275/EH500", 1, 4),
    (FILE2, 1330, 1634, "E2M275/EH1200",1, 4),
    (FILE2, 1656, 1956, "E2M275/EH2600",1, 4),
    # FILE3: standalone E2M275+EH4200
    (FILE3,   20,  326, "E2M275/EH4200",2, 4),
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


print("// E2M+EH Booster Combo Speed Curves - Edwards PumpCalc (2026-04-23)")
print("// 100L SUS+Viton, NW40 10m 3-bend, Air, GB OFF, 60Hz, t=600s")
print("// X = EH inlet pressure [mbar], Y = system effective speed [m3/h]")
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
