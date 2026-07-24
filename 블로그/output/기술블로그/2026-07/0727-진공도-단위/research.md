# 진공도 단위 완전정리 — Torr·mbar·Pa 환산과 저진공~초고진공 구간 이해 리서치

> 리서치 기준일: 2026년 07월 24일
> 허용 소스 수: 4개 (Leybold 3개 페이지, Edwards 3개 페이지) / 참고 소스 수: 2개
> 비고: 이 글은 특정 산업·특정 펌프 모델에 묶이지 않은 진공 기술 일반 이론 글이므로, research.md 지침의 "제품 조합 규칙"(2단계)과 상담기록 참조(0단계③)는 해당 없어 생략함. 스마텍 내부 product_master_table에도 "진공도 단위/구간"을 직접 다루는 자료는 없음(확인함).

---

## 1. 압력 단위 정의

### Pa (파스칼) — SI 단위
1 Pa = 1 N·m⁻² ✅ [Leybold 공식 — units-and-ranges-of-pressure]

### mbar (밀리바) — 진공 기술 표준 단위
유럽·영국 계열(Edwards, Leybold, Pfeiffer 데이터시트 등)에서 실무 표준으로 가장 많이 쓰는 단위 ✅ [girovac.com 등 참고 — 수치는 Leybold/Edwards로 재확인]
1 mbar = 100 Pa ✅ [Leybold 공식 — units-and-ranges-of-pressure]

### Torr — 역사적 단위 (미국계에서 여전히 통용)
정의: 0°C(원문은 32°F 표기)에서 수은주를 1 mm 밀어올릴 수 있는 압력 ✅ [Leybold 공식 — units-and-ranges-of-pressure]

### 상호 환산 계수
- 1 Torr = 4/3 mbar = 1.3333 mbar ✅ [Leybold 공식 — units-and-ranges-of-pressure]
- 1 mbar = 3/4 Torr = 0.75 Torr ✅ [Leybold 공식 — units-and-ranges-of-pressure]
- 1 mbar = 100 Pa ✅ [Leybold 공식 — units-and-ranges-of-pressure]
- 1 Torr ≈ 133.3 Pa (1 Torr = 4/3 mbar × 100 Pa/mbar = 133.33 Pa) — mbar↔Pa, mbar↔Torr 각각의 공식 환산값을 조합해 계산한 값 ✅ [Leybold 공식 환산계수 기반 계산]
- 표준 대기압(1 atm) = 760 Torr = 1013.25 mbar ✅ [Leybold 공식 — units-and-ranges-of-pressure]
  - Pa 환산: 1013.25 mbar × 100 = 101,325 Pa (mbar→Pa 공식 환산계수 적용한 계산값)

### 환산 요약표

| 단위 | 1 atm | 1 mbar (=1 hPa) | 1 Torr |
|---|---|---|---|
| Torr | 760 | 0.75 | 1 |
| mbar (hPa) | 1013.25 | 1 | 1.3333 |
| Pa | 101,325 | 100 | 133.33 (계산값) |

✅ [Leybold 공식 — units-and-ranges-of-pressure] (Pa 열 중 1013.25×100, 133.33 값은 위 공식 환산계수를 이용한 산술 계산값이며 원문에 Pa 직접 표기는 mbar=100Pa 관계식만 명시됨)

---

## 2. 저진공~극초고진공 구간 정의

### 2-1. Leybold 공식 구간표 (units-and-ranges-of-pressure 페이지)

| 구간 | 영문/약어 | 압력 범위 (mbar) |
|---|---|---|
| 저진공 | Rough Vacuum (RV) | 1000 ~ 1 mbar |
| 중진공 | Medium Vacuum (MV) | 1 ~ 10⁻³ mbar |
| 고진공 | High Vacuum (HV) | 10⁻³ ~ 10⁻⁷ mbar |
| 초고진공 | Ultra-High Vacuum (UHV) | 10⁻⁷ ~ 10⁻¹⁴ mbar |

✅ [Leybold 공식 — units-and-ranges-of-pressure] — 이 페이지는 극초고진공(XHV)을 별도 구간으로 명시하지 않음.

### 2-2. Leybold 공식 "High, ultra high and extreme high vacuum: the fundamentals" 페이지

| 구간 | 압력 범위 (mbar) |
|---|---|
| 고진공 (HV) | 10⁻³ ~ 10⁻⁷ mbar |
| 초고진공 (UHV) | 10⁻⁷ ~ 10⁻¹² mbar |
| 극초고진공 (XHV) | 10⁻¹² mbar 미만 |

✅ [Leybold 공식 — ultra-and-extreme-high-vacuum]

**⚠️ 소스 간 충돌 명시**: Leybold의 두 공식 페이지에서 UHV 하한(=XHV 시작점)이 서로 다르게 표기됨.
- units-and-ranges-of-pressure 페이지: UHV = 10⁻⁷ ~ 10⁻¹⁴ mbar (XHV 구간 없음)
- ultra-and-extreme-high-vacuum 페이지: UHV = 10⁻⁷ ~ 10⁻¹² mbar, XHV = 10⁻¹² mbar 미만

글쓰기 시 두 수치 모두 명시하고 "Leybold 자료 내에서도 페이지별로 UHV/XHV 경계 표기가 다르다"는 점을 밝히거나, XHV를 별도 구간으로 다루는 후자(ultra-and-extreme-high-vacuum 페이지)를 기준으로 채택하는 것을 권장. (임의 판단으로 하나만 쓰지 말 것)

### 2-3. 저진공(RV) 구간 세부 — Leybold "The Fundamentals of Rough & Medium Vacuum"
- 저진공(Rough Vacuum): 대기압 ~ 1 mbar ✅ [Leybold 공식 — rough-medium-vacuum 블로그]
- 중진공(Medium Vacuum): 1 ~ 10⁻³ mbar ✅ [Leybold 공식 — rough-medium-vacuum 블로그]

---

## 3. 구간별 사용 펌프 종류

### 저진공(RV) ~ 중진공(MV) — Leybold 공식
- 다이아프램 펌프: 10³ mbar ~ 저(低)mbar 영역, 2~4단 구성 ✅ [Leybold 공식 — rough-medium-vacuum 블로그]
- 스크롤 펌프: 10³ ~ 10⁻² mbar, 건식/청정 진공 ✅ [Leybold 공식 — rough-medium-vacuum 블로그]
- 회전 베인 펌프(오일로터리): 10³ ~ 10⁻⁴ mbar, 가장 일반적인 용적식 펌프 ✅ [Leybold 공식 — rough-medium-vacuum 블로그]
- 스크류 펌프: 10³ ~ 10⁻² mbar, 입자 내성 우수 ✅ [Leybold 공식 — rough-medium-vacuum 블로그]
- 루츠 블로워: 10 ~ 10⁻⁴ mbar, 주로 부스터(보조) 펌프로 사용 ✅ [Leybold 공식 — rough-medium-vacuum 블로그]

### 고진공(HV) ~ 초고진공(UHV)/극초고진공(XHV) — Leybold 공식
- 고진공 펌프는 단독으로 대기압에서 시작할 수 없어 백킹펌프(포어펌프)가 반드시 필요 ✅ [Leybold 공식 — ultra-and-extreme-high-vacuum 페이지]
- 터보분자펌프: 기계식 베어링(TURBOVAC i 등) / 자기부상식(TURBOVAC MAG 등) ✅ [Leybold 공식 — ultra-and-extreme-high-vacuum 페이지]
- 유분확산펌프(Oil Diffusion Pump): DIFFVAC DP 시리즈 ✅ [Leybold 공식 — ultra-and-extreme-high-vacuum 페이지]
- 극초고진공 전용 펌프(이온펌프·게터펌프 계열): 페이지 내 카테고리로만 언급되고 구체 모델·수치는 확인 불가 → "확인 불가"로 표기

---

## 4. 구간별 사용 게이지 종류

### Edwards 공식 — "Seven factors affecting the sensitivity of vacuum gauges"
| 압력 범위 (mbar) | 적합 게이지 |
|---|---|
| 10 mbar ~ 대기압 | Bourdon tube, bellows, active strain gauge, capacitance sensor ✅ [Edwards 공식] |
| 10¹ ~ 10⁻³ mbar | Capacitance manometer, thermocouple, Pirani형 게이지 ✅ [Edwards 공식] |
| 10⁻³ ~ 10⁻⁹ mbar | Cold cathode(Penning), Bayard-Alpert hot cathode 게이지 (사용 시 주기적 "wiping" 및 재교정 필요) ✅ [Edwards 공식] |

### Leybold 공식 — 저/중진공 구간 게이지
- 직접식(direct) 게이지로 측정: 기계식(다이아프램, 부르동관, 압전저항, 정전용량식) / 정압식(액주 높이 기반) ✅ [Leybold 공식 — rough-medium-vacuum 블로그]

### Leybold 공식 — 고진공/초고진공 구간 게이지
- 일반 진공게이지는 부적합 → 이온화게이지(냉음극형, 열음극형) 사용 ✅ [Leybold 공식 — ultra-and-extreme-high-vacuum 페이지]
- 헬륨 누설검출기: 10⁻⁷ mbar·l/s 이하의 미세 누설을 감지할 수 있는 유일한 신뢰 방법으로 UHV 구간에서 사용 ✅ [Leybold 공식 — ultra-and-extreme-high-vacuum 페이지]

### Edwards 공식 제품별 측정 범위 (참고용 — 실제 판매 제품 스펙)
| 제품 | 방식 | 측정 범위 |
|---|---|---|
| AIM200 | Inverted Magnetron | 1×10⁻² ~ 1×10⁻⁹ mbar ✅ [Edwards 공식 데이터시트/제품페이지] |
| WRG200 | Pirani + Cold Cathode 결합, 자동 전환 | 대기압 ~ 10⁻⁹ mbar ✅ [Edwards 공식 제품페이지] |
| APGX-H | Linear Convection (Pirani 계열) | 1333 ~ 3×10⁻⁴ mbar ✅ [Edwards 공식 제품페이지] |
| AIGX | Active Ion Gauge | 6.6×10⁻² ~ 6.6×10⁻¹⁰ mbar ✅ [Edwards 공식 제품페이지] |
| WRH | Hot Cathode Combination | 대기압 ~ 10⁻¹⁰ mbar ✅ [Edwards 공식 제품페이지] |
| IG40-EX (Passive) | — | 10⁻¹² mbar까지 측정 가능 ✅ [Edwards 공식 제품페이지] |
| APG200 | Pirani (Active) | 구체적 범위 수치는 페이지에서 확인 불가 → "확인 불가" |

---

## 5. 실무에서 어떤 상황에 어떤 단위를 쓰는가

- 유럽·영국계 제조사(Edwards, Leybold, Pfeiffer)의 공식 데이터시트는 mbar(=hPa)를 기본 단위로 표기 ✅ [Leybold/Edwards 자료 전반의 표기 방식 확인]
- 미국계 자료·문헌에서는 Torr가 여전히 널리 쓰임 (Leybold 정의 페이지에서도 Torr를 "역사적으로 미국에서 통용되는 단위"로 별도 설명) ✅ [Leybold 공식 — units-and-ranges-of-pressure]
- SI 단위인 Pa는 학술 논문·표준 규격 표기에서 기준 단위로 쓰이나, 실무 데이터시트에서는 mbar가 더 일반적 ✅ [Leybold 공식 — units-and-ranges-of-pressure 페이지의 단위 설명 순서 및 강조에서 확인]
- → 결론적으로 실무자는 "구매하려는 장비의 원산지·표기 관행에 따라 mbar/Torr/Pa를 넘나들며 환산하는 능력"이 필요함. 이 부분은 소스에 명시된 사실이 아니라 위 자료들을 종합한 리서치 요약이므로, 글쓰기 시 별도 출처 표기 없이 "일반적으로" 수준의 서술로만 사용 권장.

---

## 6. 현장 사례 (상담기록)

이 주제는 특정 산업·현장 사례가 아닌 일반 이론 글로, 상담기록 검색을 생략함 (research.md 지침 0단계③은 산업/제품 특정 글에 우선 적용되는 항목이며, 이번 주제는 해당 없음). topic-tracker.json의 `used_consultation_records`에 추가할 항목 없음.

---

## 참고 소스

### ✅ 수치 인용 가능 (허용 소스)
- ✅ [Leybold — Units and ranges of pressure](https://www.leybold.com/en-us/knowledge/vacuum-fundamentals/fundamental-physics-of-vacuum/units-and-ranges-of-pressure) — 단위 정의, 환산계수, RV/MV/HV/UHV 구간표
- ✅ [Leybold — High, ultra high and extreme high vacuum: the fundamentals](https://www.leybold.com/en-us/knowledge/vacuum-fundamentals/vacuum-generation/ultra-and-extreme-high-vacuum) — HV/UHV/XHV 구간표, 펌프·게이지 종류
- ✅ [Leybold — The Fundamentals of Rough & Medium Vacuum](https://www.leybold.com/en-us/knowledge/blog/rough-medium-vacuum) — RV/MV 구간, 펌프·게이지 종류
- ✅ [Edwards — Seven factors affecting the sensitivity of vacuum gauges](https://www.edwardsvacuum.com/en-us/vacuum-pumps/knowledge/applications/seven-factors-affecting-the-sensitivity-of-vacuum-gauges) — 압력구간별 게이지 적합성
- ✅ [Edwards — Indirect Pressure Measurement Gauges](https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-products/measurement-and-control/indirect-pressure-measurement-gauges) — 제품별 측정범위 스펙

### ⚠️ 참고만, 수치 미사용
- ⚠️ [girovac.com — Vacuum Pressure Units Explained](https://girovac.com/2026/07/08/vacuum-pressure-units-mbar-torr-pascal/) — mbar 실무 표준 관행 설명 참고만, 수치는 Leybold로 재확인
- ⚠️ [Pfeiffer Vacuum — Vacuum Technology Fundamentals](https://www.pfeiffer-vacuum.com/global/en/knowledge/vacuum-technology/knowledge-book/1-introduction/1_2_fundamentals/) — 접근 시 HTTP 406 오류로 페이지 내용 확인 불가. 검색 스니펫에서 "thermal conductivity gauge 1×10³~1×10⁻⁴ hPa", "capacitive diaphragm gauge ~10⁻¹⁰ hPa", "turbomolecular pump <10⁻¹¹ hPa(mbar)"가 노출되었으나 원문 페이지를 직접 열람하지 못해 수치 인용은 보류함 (확인 불가로 처리)

### 확인 불가 항목 (임의 기재 금지)
- Pfeiffer Vacuum 공식 페이지의 정확한 RV/MV/HV/UHV/XHV 구간 경계값 — 접근 오류(406)로 직접 확인 못함
- Edwards 공식 자료에서의 RV/MV/HV/UHV 구간 경계값 표(Edwards는 게이지별 적합 범위표는 있으나 별도의 "구간 명칭 정의표"는 검색 범위 내에서 발견 못함) — Leybold 표를 기준으로 사용 권장
- APG200(Pirani Active) 게이지의 구체적 측정범위 수치
- 극초고진공(XHV) 구간에서 쓰이는 구체적 펌프 모델명(이온펌프/게터펌프 계열은 언급되나 모델·수치 미확인)
