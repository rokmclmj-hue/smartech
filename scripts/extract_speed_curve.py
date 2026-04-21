"""
PumpCalc CSV → Speed Curve 추출 (개선판)
- t=0 초기값(밸브 닫힘) 제외
- Speed > 0 인 점만 사용
- 로그 압력 공간에서 균등 샘플링
- 스펙 얼티밋 지점 추가

Column layout:
  PD1 (nXDS6i):  [Time, ChamberP, BPP, BPSpeed, ...]
  PD2-4:         [Time, BPP, ChamberP, BPSpeed, ...]
"""

import math

TORR_TO_MBAR = 1.33322

csv_path = r"C:\Users\Robin\Downloads\data47491.csv"

sections = {
    1: {"name": "nXDS6i",  "data_start": 19,  "data_end": 289,  "bp_col": 2, "speed_col": 3, "ultimate_mbar": 5e-3},
    2: {"name": "nXDS10i", "data_start": 309, "data_end": 602,  "bp_col": 1, "speed_col": 3, "ultimate_mbar": 5e-3},
    3: {"name": "nXDS15i", "data_start": 622, "data_end": 916,  "bp_col": 1, "speed_col": 3, "ultimate_mbar": 5e-3},
    4: {"name": "nXDS20i", "data_start": 935, "data_end": 1200, "bp_col": 1, "speed_col": 3, "ultimate_mbar": 5e-3},
}

with open(csv_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

def logspace(p_start, p_end, n):
    """n개 로그 등간격 압력값."""
    if p_start <= 0 or p_end <= 0:
        return []
    lstart, lend = math.log10(p_start), math.log10(p_end)
    return [10 ** (lstart + i * (lend - lstart) / (n - 1)) for i in range(n)]

def extract_curve(sec):
    raw = []
    for line in lines[sec["data_start"]:sec["data_end"]]:
        parts = line.strip().split(",")
        if len(parts) < 4:
            continue
        try:
            t = float(parts[0])
            bp_torr = float(parts[sec["bp_col"]])
            speed = float(parts[sec["speed_col"]])
        except ValueError:
            continue
        if t < 0.001:          # 초기 과도 상태 제외 (≈0.06초)
            continue
        if speed <= 0.0:        # 속도 0 제외 (얼티밋은 별도 추가)
            continue
        bp_mbar = bp_torr * TORR_TO_MBAR
        raw.append((bp_mbar, speed))

    if not raw:
        return []

    raw.sort(key=lambda x: -x[0])   # 고압 → 저압 정렬
    p_max = raw[0][0]
    p_min = raw[-1][0]

    targets = logspace(p_max, p_min, 18)
    curve = []
    used_indices = set()

    for target in targets:
        best_i, best_dist = -1, float("inf")
        for i, (p, _) in enumerate(raw):
            if i in used_indices:
                continue
            dist = abs(math.log10(p) - math.log10(target))
            if dist < best_dist:
                best_dist = dist
                best_i = i
        if best_i == -1:
            continue
        p_mbar, speed = raw[best_i]
        # 직전 포인트와 너무 가까우면 생략
        if curve and abs(math.log10(p_mbar) - math.log10(curve[-1][0])) < 0.08:
            continue
        curve.append((round(p_mbar, 5), round(speed, 4)))
        used_indices.add(best_i)

    # 스펙 얼티밋 포인트 추가
    curve.append((sec["ultimate_mbar"], 0.0))
    return curve

print("// Speed curves extracted from Edwards PumpCalc CSV (2026-04-21)")
print("// Source: 1L SUS+Nitrile chamber, NW25 1.1m foreline, Air, 60Hz")
print("// X = pump inlet pressure [mbar], Y = pumping speed [m³/h]")
print("// Last point = spec ultimate vacuum (speed→0)")
print()
for pd_num, sec in sections.items():
    curve = extract_curve(sec)
    pts = ", ".join(f"[{p}, {s}]" for p, s in curve)
    print(f'// {sec["name"]}  (ultimate spec: {sec["ultimate_mbar"]} mbar)')
    print(f"  speedCurve: [{pts}],")
    print()
