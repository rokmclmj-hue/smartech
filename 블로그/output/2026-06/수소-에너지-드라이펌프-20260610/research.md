# 수소 충전소·연료전지 설비의 드라이 진공펌프 선택 기준 리서치

> 리서치 기준일: 2026년 06월 10일
> 허용 소스 수: 3개 / 참고 소스 수: 1개

---

## 수소 산업에서 진공펌프가 필요한 공정

### 1. 연료전지 제조 (Fuel Cell Manufacturing)
- 전해질 혼합 (Electrolyte mixing) — 균일 분산을 위한 진공 탈포
- 탈기 (Degassing) — 전해질·막 내부 기포 제거, 요구 진공도 약 1~10 mbar 구간
- 양극판 PVD 코팅 (Bipolar plate coating) — 내식성·전도성 확보, 고진공 필요
- 셀 스택 누설 시험 (Leak testing) — 수소 가스 가연성 특성상 완전 밀폐성 필수
✅ [Edwards Vacuum — Energy Solutions 페이지]

### 2. 수전해조 (Electrolyzer)
- PEM/알칼리 전해조 양극판 PVD 코팅
- 배관 사전 진공 처리 — 가스 순도 확보, 잔류 가스·수분 제거
✅ [Leybold — Hydrogen Industry 페이지]

### 3. 수소 건조 (VPSA — Vacuum Pressure Swing Adsorption)
- 전해조 생산 수소의 습도 제거
- 실리카겔 건조제 재생에 진공 적용
- 드라이 스크류 펌프(SCREWLINE/GXS/EXS 계열) 적합
✅ [Leybold — Hydrogen Industry 페이지]

### 4. 수소 크래킹 (Hydrogen Cracking)
- 암모니아(NH₃), 메탄(CH₄) 등 운반 가스에서 수소 분리
- 투과막 양측 압력차 활용
- ATEX 인증(방폭) 펌프 필수
✅ [Leybold — Hydrogen Industry 페이지]

### 5. 극저온 용기 진공 단열 (Cryogenic Tank Vacuum Insulation)
- 액화 수소(-253°C) 보냉을 위한 이중벽 진공 단열
- 다층 단열재(MLI) 적용, 진공도 요구: 10⁻³~10⁻⁴ mbar 이하
✅ [Leybold — Hydrogen Industry 페이지]

### 6. 연료전지 MEA 진공 함침 (참고)
- 셀 스택 냉각수 유로 코팅 함침 시 진공 챔버 사용
- 요구 압력: 10⁻² Torr (약 1.3×10⁻² mbar) 이하
⚠️ [USPTO 특허 자료 — 참고만, 수치 미사용]

---

## 왜 드라이 스크류 펌프인가 — 수소 환경 적합성

### 수소 가스의 위험 특성
- 폭발 범위 넓음: LEL 4% ~ UEL 75% (공기 중)
- 착화 에너지 매우 낮음: 약 0.017 mJ (정전기·스파크에도 착화 가능)
- 오일 펌프 사용 시 리스크: 역류 오일이 수소와 혼합 → 오염 + 위험

### 드라이 스크류 펌프가 수소 환경에 적합한 이유
1. **오일 없음** — 수소와 오일 혼합 없음, 역류·오염 리스크 제거
2. **비접촉 스크류 회전** — 내부 마찰 최소화, 스파크 발생 위험 낮음
3. **ATEX 방폭 인증 옵션** — 가연성 가스 환경에서도 안전 사용 가능
4. **PFPE 오일 사용(씰 부위)** — 화학적 불활성 불소계 오일, 수소 환경에서도 안정
5. **밀폐형 배기** — 가스를 외부 처리 설비(스크러버 등)로 안전 배출 가능

✅ [Edwards Vacuum — Energy Solutions] / ✅ [Leybold — Hydrogen Industry]

---

## Edwards 드라이 스크류 펌프 제품 사양

### GXS 시리즈 (산업용 드라이 스크류)
| 모델 | 배기속도 | 도달진공도 | 소비전력 | 오일 |
|------|---------|-----------|---------|------|
| GXS160 | 160 m³/h | 7×10⁻³ mbar | 5 kW | PFPE Drynert 25/6 |
| GXS250 | 250 m³/h | 4×10⁻³ mbar | 9 kW | PFPE Drynert 25/6 |
| GXS450 | 450 m³/h | 5×10⁻³ mbar | 17.3 kW | PFPE Drynert 25/6 |
| GXS750 | 740 m³/h | 3×10⁻³ mbar | 37 kW | PFPE Drynert 25/6 |
✅ [스마텍 내부 — product_master_table.csv]

### EXS 시리즈 (GXS 기반 차세대, VFD 내장)
| 모델 | 배기속도 | 도달진공도 | 소비전력 | 특징 |
|------|---------|-----------|---------|------|
| EXS160 | 160 m³/h | 1×10⁻² mbar | 5 kW | VFD 내장 |
| EXS250 | 250 m³/h | 1×10⁻² mbar | 9 kW | VFD 내장 |
| EXS450 | 450 m³/h | 1×10⁻² mbar | 17.3 kW | VFD 내장 |
| EXS750 | 740 m³/h | 1×10⁻² mbar | 22 kW | VFD 내장 |
- 부스터 조합 시 도달진공도: <1×10⁻³ mbar
✅ [스마텍 내부 — product_master_table.csv] / ✅ [Edwards Vacuum — EXS 제품 페이지]

### GXS vs EXS 비교
| 항목 | GXS | EXS |
|------|-----|-----|
| VFD(주파수 변환기) | 외장 옵션 | 내장 기본 |
| 도달진공도 | 3~7×10⁻³ mbar | 1×10⁻² mbar |
| Modbus RTU | 없음 | 지원 |
| 적용 확장성 | 표준 공정 | 이차전지·이너셔가스 공정 포함 |
✅ [스마텍 내부 — product_master_table.csv]

---

## 공정별 펌프 선택 가이드

| 공정 | 요구 진공도 | 권장 펌프 |
|------|-----------|---------|
| 전해질 탈기 | 1~10 mbar | GXS160/EXS160 이상 |
| 양극판 PVD 코팅 | 10⁻³ mbar 이하 | GXS+EH 부스터 조합 |
| 배관 사전 진공 처리 | 1~10 mbar | GXS/EXS 단독 |
| 누설 시험 | 1~100 mbar | GXS/EXS + 리크디텍터 |
| 수소 건조 VPSA | 수십~수백 mbar | GXS/EXS 시리즈 |
| 극저온 용기 단열 | 10⁻³~10⁻⁴ mbar | GXS+EH 부스터 |
(진공도 범위는 공정 조건에 따라 달라짐 — 스마텍 문의 권장)

---

## 현장 사례 (상담기록)

수소 에너지 전용 상담기록 없음.
일반 드라이펌프 관련 내용 참고:
- 이차전지 공정 문의 시 "드라이 펌프에서 오일 오염 걱정 없냐"는 질문 패턴 반복됨
- → 수소 공정에서도 동일한 오일 오염·역류 우려가 핵심 관심사로 예상됨

---

## 참고 소스

- ✅ [Edwards Vacuum — Energy Solutions](https://www.edwardsvacuum.com/en-uk/vacuum-pumps/our-markets/energy-solutions) — 연료전지 제조 공정 인용
- ✅ [Leybold — Hydrogen Industry](https://www.leybold.com/en/applications-and-industries/hydrogen-industry) — 수소 산업 공정별 진공 요건 인용
- ✅ [Edwards EXS 제품 페이지](https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-products/dry-screw-pumps/exs) — EXS 사양 인용
- ✅ [스마텍 내부 — product_master_table.csv] — GXS/EXS 전 모델 사양
