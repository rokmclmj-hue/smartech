# 진공펌프 + 루츠 부스터 조합 선택법 리서치

> 리서치 기준일: 2026년 06월 06일
> 소스 수: 13개

---

## 루츠 부스터란 무엇인가 (작동 원리)

루츠 부스터(Roots Booster)는 두 개의 8자형 로터(회전체)가 동시에 반대 방향으로 회전하면서 기체를 한쪽에서 반대쪽으로 밀어내는 방식으로 작동한다. 로터끼리는 직접 맞닿지 않고 미세한 간격(클리어런스)을 유지한 채 회전하기 때문에 오일 없이도 작동 가능하다(오일프리 구조).

- 자체적으로 진공을 만들 수 없다. 반드시 배후 펌프(backing pump)와 함께 써야 한다.
- 배후 펌프가 먼저 거칠게(rough) 압력을 낮추면, 루츠 부스터가 그 위에서 배기속도를 크게 높여준다.
- 단독으로는 대기압 상태에서 작동 불가. 시스템 압력이 충분히 낮아진 뒤에 기동해야 한다.

**출처:** Pfeiffer Vacuum 기술 자료, Leybold 기술 자료, EVP Vacuum Solution

---

## 언제 부스터가 필요한가 (압력 범위, 배기량)

### 부스터가 효과적인 압력 범위
- **주 활용 구간: 0.001 mbar ~ 100 mbar** (대략 1 Pa ~ 10,000 Pa)
- 루츠 부스터는 이 중간 진공 구간에서 배기속도가 급격히 감소하는 드라이펌프/로터리펌프의 한계를 보완한다.
- 100 mbar 이상 고압 구간에서는 로터 과열 위험이 있어 일반적으로 단독 운전 금지.

### 부스터가 필요한 상황
1. 드라이펌프 단독으로는 배기 시간이 너무 오래 걸릴 때
2. 챔버 용적이 크거나, 짧은 시간에 여러 챔버를 펌핑해야 할 때
3. 10 mbar 이하의 진공이 필요하면서 높은 처리량(throughput)이 동시에 요구될 때
4. 리크디텍터(leak detector), 코팅, 반도체 공정 등 빠른 사이클 타임이 필요한 공정

### 부스터 없이 드라이펌프 단독이 충분한 상황
- 소량/단시간 사용이고 극한 진공이 불필요할 때
- 분석 장비(터보 백킹용)처럼 용량 자체가 작을 때
- 대기 가스 처리량이 적고 사이클 속도가 중요하지 않을 때

**출처:** Pfeiffer Vacuum, EVP Vacuum, rhblowers.com

---

## 드라이펌프 단독 vs 드라이펌프 + 부스터 조합 비교

| 항목 | 드라이펌프 단독 | 드라이펌프 + 루츠 부스터 |
|------|----------------|--------------------------|
| 배기속도 | 기준 (100%) | 약 2~8배 향상 |
| 도달 진공도 | 펌프 사양에 따름 | 약 10배 더 낮은 압력 도달 가능 |
| 초기 비용 | 낮음 | 높음 (부스터 추가) |
| 유지보수 | 단순 | 부스터 오일/기어 관리 추가 필요 |
| 오염 처리 | 드라이펌프 사양에 따름 | 로터 클리어런스로 인해 파티클 처리 취약 |
| 적합 용도 | 소~중형 챔버, 분석 장비 | 대용량 챔버, 반도체, 밸브 테스트, 코팅 |

- 루츠 부스터 조합은 배기속도를 7배, 최대 진공 압력을 10배 개선한다는 벤치마크 데이터가 있다.
- 부스터의 배기속도는 배후 펌프의 약 2~8배로 선정하는 것이 일반적이다.

**출처:** vacaero.com, goldleaflabs.com, Pfeiffer Vacuum

---

## Edwards EH 부스터 시리즈 소개

Edwards EH 시리즈는 산업용 기계식 부스터 펌프(Mechanical Booster Pump)로, 드라이펌프·로터리펌프와 조합해 사용한다.

### 주요 모델 사양 (50 Hz 기준)

| 모델 | 배기속도 (m³/h) | 냉각 방식 | 비고 |
|------|----------------|-----------|------|
| EH250 | 310 m³/h | 공냉 | 소~중형 시스템 |
| EH500 | 505 m³/h | 공냉 | 중형 시스템 |
| EH1200 | 1,195 m³/h | **수냉** | 대형 시스템 |
| EH2600 | — | 수냉 | 대형 시스템 |
| EH4200 | — | 수냉 | 초대형 시스템 |

- EH250, EH500: 공냉식 모터 + 범용 전압
- EH1200 이상: 펌프 바디 수냉 필수
- 반드시 적합한 배후 펌프(backing pump)와 함께 사용해야 함
- HC(탄화수소 오일)형과 FX(PFPE 내화학성) 두 가지 오일 사양 제공

**출처:** Edwards Vacuum 공식 데이터시트, Vacuum Pump Rebuilders, Edwards US Webshop

---

## GXS/EXS + EH 조합 사례

Edwards GXS(드라이 스크류 펌프)는 자체 배기속도가 최대 740 m³/h이며 도달 진공도 0.003 mbar를 실현한다. 여기에 EH 부스터를 조합하면 배기속도와 진공도를 추가로 향상할 수 있다.

### 공식 조합 구성 예시
- **Drystar 80 + EH500**: 500 m³/h 배기속도, 중형 응용 공정에 적합
- **GXS + EH 시리즈**: GXS를 배후 펌프로, EH를 1차 부스터로 구성. 반도체 제조, 평판 디스플레이, LED, 태양전지 공정에 적용
- EH 부스터와 드라이펌프의 조합으로 최대 4,200 m³/h까지 배기속도 확장 가능

### 조합 선택 기준
- 배후 펌프(GXS 등) 배기속도의 2~8배 수준으로 EH 모델 선정
- 처리 압력 구간이 0.001~100 mbar이면 EH250~EH1200 범위에서 선택
- 고온 가스(180°C 이상) 처리 시 수냉 모델 + 질소(N2) 퍼지 조합 필수

**출처:** Edwards Vacuum GXS 브로슈어, IBERICA VACUUM, idealvac.com

---

## 주의사항 (압력비, 온도, 오일)

### 1. 압력비 (Compression Ratio)
- 루츠 부스터의 최대 허용 차압은 약 5,000 Pa (50 mbar)
- 입구~출구 압력비가 너무 크면 역류(backflow) 발생 및 로터 과열
- 가장 낮은 역류·최고 효율 구간: 입구 압력 0.75 mbar ~ 10 mbar
- **100 mbar 이상 고압에서 단독 기동 금지** → 바이패스 밸브 또는 인버터 기동 필수

### 2. 온도
- 고압 입력 시 로터가 열팽창하여 로터-하우징 간격이 줄어 접촉 위험
- EH1200 이상 대형 모델은 수냉 필수
- 고온 가스(수분, 히팅 공정 등) 처리 시: IXH 계열 또는 수냉+N2 퍼지 조합 사용 권장
- NXDI 계열(분석 장비용)은 고온 환경에서 열팽창 문제로 내구성 저하 → 양산용 고온 공정 부적합

### 3. 오일 관리
- 기어박스 및 베어링 윤활용 오일은 별도 관리 필요
- 오일 레벨 부족: 베어링·기어 손상
- 오일 과다: 오일 온도 상승 → 조기 고장
- HC형(탄화수소 오일) vs FX형(PFPE, 부식성 가스 환경)으로 구분 선택

### 4. 기동 순서
- 반드시 배후 펌프(드라이펌프)를 먼저 기동하여 시스템 압력을 낮춘 후 부스터 기동
- 바이패스 밸브 없이 대기압에서 기동 시 모터 과부하 위험

**출처:** EVP Vacuum, vacaero.com, Edwards EH 인스트럭션 매뉴얼

---

## 현장 사례 (상담기록에서 추출)

**출처:** 상담기록 통화녹음 이사임운택_260602_144333 (2026.06.02)

### 사례 1: 밸브 테스트 설비 — 드라이펌프 단독 vs 부스터 조합 검토

- **현장 상황**: 밸브 4개 연결, 히팅 공정(온도 180°C), 수분 처리 필요
- **기존 설비**: Kashima KD-120 (N2 없이 Water만 투입) — 양산용으로 운영 중
- **검토 옵션 1 (드라이 단독)**: IXH 100 (배기속도 약 1,600 L/s) — 드라이 단독으로 10 mbar 이하 도달 가능. 무게 약 120 kg. 가격 약 2,000만 원 이상.
- **검토 옵션 2 (부스터 조합)**: IGX 1000(중고) + 로터리 부스터 조합 — 비용 절감 가능. 실제 비트로 VM 납품 사례: IH 3만 L/s급 드라이 + 1만 L/s급 오일 로타리 부스터 조합, 1년 이상 무고장 운영.
- **현장 권고**: 밸브 4개를 동시에 1차 펌핑하려면 드라이 대용량 + 부스터 조합이 효율 최우선. 단, 고온·수분 환경이므로 NXDI 계열(분석장비용)은 부적합 → IXH 계열 필수.
- **1대 1 vs 대용량 중앙화**: 밸브별 1:1 구성이 개별 성능은 우수하나, 오른쪽 공간에 대용량 1대를 두고 4개 동시 펌핑하면 작업 시간을 크게 단축 가능.

---

## 참고 소스

- [루츠 부스터 진공펌프 — Becker International](https://www.becker-international.com/kr/products/vacuum-pumps/roots-booster-vacuum-pumps.htm)
- [루츠 진공 펌프 작동 원리 — vacuumpumpsupplier.com](https://ko.vacuumpumpsupplier.com/info/roots-vacuum-pump-working-principle-41628696.html)
- [진공 생성: 다단계 루츠 펌프 — Pfeiffer Vacuum](https://www.pfeiffer-vacuum.com/global/ko/knowledge/vacuum-technology/vacuum-generation/multi-stage-roots-pumps-vacuum-processes)
- [Roots Vacuum Pump Selection Guide — rhblowers.com](https://www.rhblowers.com/news/industry-news/roots-vacuum-pump-working-principle-applications-selection-guide.html)
- [How to Choose Roots Vacuum Pump — EVP Vacuum](https://www.evpvacuum.com/how-to-choose-roots-vacuum-pump-correctly.html)
- [Roots Vacuum Pump Systems — COOLINK](https://hvacolink.com/roots-vacuum-pump-systems/)
- [Vacuum Generation: Roots Vacuum Pumps — Pfeiffer Vacuum](https://www.pfeiffer-vacuum.com/global/en/knowledge/vacuum-technology/knowledge-book/4-vacuum-generation/4_7_roots_vacuum_pumps/)
- [Mechanical Booster Pumps for Vacuum Systems — vacaero.com](https://vacaero.com/information-resources/vacuum-pump-technology-education-and-training/670-mechanical-booster-pumps-for-vacuum-systems.html)
- [Roots Blowers (aka Booster Pumps) — vacaero.com](https://vacaero.com/information-resources/vacuum-pump-technology-education-and-training/10009-roots-blowers-aka-booster-pumps.html)
- [Roots Booster — When Needed? — goldleaflabs.com](https://www.goldleaflabs.com/blogs/articles/roots-blowers-aka-booster-pumps/)
- [EH Mechanical Booster Pumps Datasheet — Edwards Vacuum](https://www.edwardsvacuum.com/content/dam/brands/edwards-vacuum/general-vacuum/downloads/mechanical-booster-pumps/edwards-EH-mechanical-booster-pumps-datasheet.pdf)
- [Edwards EH250/EH500/EH1200 — Vacuum Pump Rebuilders](https://vacuumpumprebuilders.com/edwards-booster-pumps/)
- [GXS Dry Screw Vacuum Pumps — Edwards Vacuum](https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-products/dry-screw-pumps/gxs)
- [Roots Vacuum Pump Relief Valve and Bypass — EVP Vacuum](https://www.evpvacuum.com/roots-vacuum-pump-relief-valve-and-bypass-pipeline.html)
- [Notes and Possible Problems of Roots Vacuum Pump — EVP Vacuum](https://www.evpvacuum.com/newsview-255-378-Notes_and_Possible_Problems_of_Roots_Vacuum_Pump.html)
