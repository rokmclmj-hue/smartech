"""
XDS35i PumpCalc CSV → speedCurve 추출
CSV 컬럼:
  0: Time(s)  1: Chamber Pressure(Torr)
  2: Backing Pump Pressure(Torr) ← pump inlet pressure
  3: Backing Pump Speed(m³/h)   ← pump speed
"""

import math

TORR_TO_MBAR = 1.33322

csv_path = r"C:\Users\Robin\Desktop\XDS35_100L.csv"

with open(csv_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# 데이터 파싱 (헤더 20줄 제외, 빈 줄 제외)
raw = []
for line in lines[19:]:
    parts = line.strip().split(",")
    if len(parts) < 4:
        continue
    try:
        t     = float(parts[0])
        bp_p  = float(parts[2])   # pump inlet pressure (Torr)
        speed = float(parts[3])   # pump speed (m³/h)
    except ValueError:
        continue
    if t < 0.1:       # 초기 과도 상태(밸브 막힘) 제외
        continue
    if speed <= 0.0:
        continue
    raw.append((bp_p * TORR_TO_MBAR, round(speed, 4)))

raw.sort(key=lambda x: -x[0])   # 고압 → 저압

p_max = raw[0][0]
p_min = raw[-1][0]

print(f"// 데이터 압력 범위: {p_max:.2f} ~ {p_min:.5f} mbar")
print(f"// 데이터 포인트 수: {len(raw)}")
print(f"// 최고속: {raw[0][1]:.2f} m³/h  최저(끝): {raw[-1][1]:.2f} m³/h @ {p_min:.5f} mbar")
print()

def logspace(a, b, n):
    return [10 ** (math.log10(a) + i * (math.log10(b) - math.log10(a)) / (n - 1))
            for i in range(n)]

targets = logspace(p_max, p_min, 18)
curve = []
used = set()

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
    p_m, sp = raw[best_i]
    if curve and abs(math.log10(p_m) - math.log10(curve[-1][0])) < 0.08:
        continue
    curve.append((round(p_m, 5), sp))
    used.add(best_i)

# XDS35i 얼티밋 추정:
# 마지막 데이터 추세에서 속도가 P에 거의 선형 → 외삽
# last 5 points 기준 선형 회귀 추정
n_fit = min(10, len(raw))
ps = [raw[-(i+1)][0] for i in range(n_fit)]
ss = [raw[-(i+1)][1] for i in range(n_fit)]
# S = k*P + b (선형 근사)
mean_p = sum(ps) / n_fit
mean_s = sum(ss) / n_fit
num = sum((ps[i] - mean_p) * (ss[i] - mean_s) for i in range(n_fit))
den = sum((ps[i] - mean_p) ** 2 for i in range(n_fit))
k = num / den if den != 0 else 0
b = mean_s - k * mean_p
# S=0 → P_ult = -b/k (단, k>0이어야 물리적 의미 있음)
if k > 0:
    p_ult_est = -b / k
    print(f"// 선형 외삽 얼티밋 추정: {p_ult_est:.5f} mbar ({p_ult_est/TORR_TO_MBAR:.5f} Torr)")
    ultimate_mbar = max(p_ult_est * 0.5, 0.003)  # 보수적 하한
else:
    ultimate_mbar = 0.005
    print(f"// 외삽 불가 → 기본값 사용: {ultimate_mbar} mbar")

curve.append((round(ultimate_mbar, 5), 0.0))

print()
pts = ",\n      ".join(f"[{p}, {s}]" for p, s in curve)
print(f"// XDS35i (60Hz)  |  ultimate ~{ultimate_mbar:.4f} mbar")
print(f"  speedCurve: [\n      {pts},\n  ],")
