"""
PumpCalc CSV에서 nXRi 실제 속도 곡선을 추출하는 스크립트.

CSV 구조:
  Pump Down 1 (nXR30i): col2=BP_Pressure(Torr), col3=BP_Speed(m³/h)
  Pump Down 2 (nXR40i): col1=BP_Pressure(Torr), col3=BP_Speed(m³/h)
  Pump Down 3 (nXR60i): col1=BP_Pressure(Torr), col3=BP_Speed(m³/h)
  Pump Down 4 (nXR90i): col1=BP_Pressure(Torr), col3=BP_Speed(m³/h)

1 Torr = 1.33322 mbar
"""

import csv

CSV_PATH = r"C:\Users\rokmc\Desktop\data720291.csv"
TORR_TO_MBAR = 1.33322

def parse_float(s):
    try:
        return float(s)
    except:
        return None

def read_section(all_rows, start_line, end_line, p_col, s_col, skip_initial=5):
    """start_line~end_line 범위 데이터를 읽어 (P_mbar, Speed) 쌍 반환."""
    points = []
    for i, row in enumerate(all_rows[start_line:end_line]):
        if i < skip_initial:
            continue
        if len(row) <= max(p_col, s_col):
            continue
        p_torr = parse_float(row[p_col])
        speed  = parse_float(row[s_col])
        if p_torr is None or speed is None:
            continue
        if p_torr <= 0 or speed < 0:
            continue
        p_mbar = p_torr * TORR_TO_MBAR
        points.append((p_mbar, speed))
    return points

def select_samples(points, n_target=22):
    """로그 압력 공간에서 균등 샘플 선택."""
    if len(points) <= n_target:
        return points
    import math
    # 압력 내림차순 정렬
    points = sorted(points, key=lambda x: x[0], reverse=True)
    p_max = math.log(points[0][0])
    p_min = math.log(points[-1][0])
    step = (p_max - p_min) / (n_target - 1)

    selected = []
    targets = [math.exp(p_max - step * i) for i in range(n_target)]

    for target in targets:
        best = min(points, key=lambda x: abs(math.log(x[0]) - math.log(target)))
        if best not in selected:
            selected.append(best)

    return sorted(selected, key=lambda x: x[0], reverse=True)

def format_curve(points, model_name):
    lines = [f"    // {model_name} - PumpCalc CSV 실측 속도 곡선"]
    curve_parts = []
    # 속도가 0이 되는 마지막 포인트 추가 (최저 압력의 80%)
    last_p, last_s = points[-1]
    zero_p = last_p * 0.8
    for p, s in points:
        curve_parts.append(f"[{p:.4f},{s:.2f}]")
    curve_parts.append(f"[{zero_p:.5f},0.0]")

    # 3개씩 한 줄로 묶기
    rows = []
    for i in range(0, len(curve_parts), 4):
        rows.append(",".join(curve_parts[i:i+4]))

    lines.append("    speedCurve: [")
    for row in rows:
        lines.append(f"      {row},")
    lines[-1] = lines[-1].rstrip(",")
    lines.append("    ],")
    return "\n".join(lines)

def main():
    with open(CSV_PATH, encoding="utf-8", newline="") as f:
        reader = csv.reader(f)
        all_rows = list(reader)

    print(f"총 {len(all_rows)} 행 읽음\n")

    # 섹션 데이터 범위 (0-indexed 행)
    # Pump Down 1 (nXR30i): 데이터 행 19~190
    # Pump Down 2 (nXR40i): 데이터 행 212~415
    # Pump Down 3 (nXR60i): 데이터 행 437~659
    # Pump Down 4 (nXR90i): 데이터 행 681~904

    sections = [
        ("nXR30i", 19, 191, 2, 3),  # p_col=2 (col2=BP_P), s_col=3
        ("nXR40i", 212, 416, 1, 3), # p_col=1 (col1=BP_P), s_col=3
        ("nXR60i", 437, 661, 1, 3),
        ("nXR90i", 681, 905, 1, 3),
    ]

    for name, start, end, p_col, s_col in sections:
        points = read_section(all_rows, start, end, p_col, s_col)

        print(f"=== {name} ===")
        print(f"원시 데이터 점 수: {len(points)}")
        if points:
            print(f"압력 범위: {points[-1][0]:.4f} ~ {points[0][0]:.1f} mbar")
            print(f"속도 범위: {min(s for _,s in points):.2f} ~ {max(s for _,s in points):.2f} m³/h")

        sampled = select_samples(points, n_target=21)

        print(f"\n선택된 샘플 ({len(sampled)}개):")
        print(f"{'P_mbar':>12} {'Speed m³/h':>12}")
        print("-" * 26)
        for p, s in sorted(sampled, key=lambda x: x[0], reverse=True):
            print(f"{p:12.4f} {s:12.2f}")

        print("\n[pumpSpeedData.ts 형식]:")
        print(format_curve(sampled, name))
        print()

if __name__ == "__main__":
    main()
