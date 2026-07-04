# 액화질소·극저온 배관 단열 시스템의 드라이펌프 선택 기준 리서치

> 리서치 기준일: 2026년 7월 4일
> 허용 소스 수: 4개 / 참고 소스 수: 6개
> 산업군: 03. 진공 이중배관/극저온 (cryogenic-piping) / 제품 카테고리: A. 드라이펌프

---

## 1. 액화질소 이중배관(VIP)의 구조와 진공의 역할

VIP(Vacuum Insulated Piping, 진공 단열 배관)는 극저온 유체(액화질소·액체산소·LNG 등)를 이송하는 내관과, 그 바깥을 감싸는 외관(재킷) 두 겹으로 구성된다. 내관과 외관 사이 환형 공간(annular space)을 진공으로 배기해 대류·전도에 의한 열침입(heat leak)을 최소화하는 방식이다. ⚠️ [whatispiping.com — 구조 개요 참고, 수치 미사용]

각 배관 구간에는 배기용 포트(evacuation port)와 압력 릴리프 장치가 결합된 형태로 설치되며, 환형 공간 내부에 게터(getter) 재료를 넣어 배기 후에도 시간이 지나며 방출되는 잔류 가스를 흡착해 진공도를 유지하는 구조가 일반적이다. ⚠️ [whatispiping.com — 게터 구성 참고, 수치 미사용]

공장 조립형 VIP 세그먼트는 출하 전 진공 배기·밀봉까지 마친 상태로 납품되는 경우가 많지만, 현장에서 배관을 절단·용접·보수하거나 신규 조립하는 경우에는 반드시 현장에서 별도의 진공 배기 장비로 재배기해야 한다. 이 재배기 단계에 사용하는 펌프의 종류가 이 글의 핵심 주제다.

---

## 2. 왜 오일펌프가 아닌 드라이펌프인가

### 2-1. 오일 역류 오염 문제
극저온 환경에서 진공 단열 성능을 좌우하는 것은 환형 공간의 청정도다. 오일 로터리 베인 펌프를 초기 배기에 사용하면 저압 구간에서 오일 증기가 역류(backstreaming)해 배관 내벽·게터 표면에 흡착될 위험이 있다. 오일 성분이 극저온 표면에 응축·고착되면 게터의 가스 흡착 성능이 저하되고, 재배기 주기가 짧아지는 원인이 된다. ⚠️ [일반 진공공학 원리, 특정 수치 없음 — 원리 설명에만 사용]

nXDS·XDS 시리즈는 스크롤 방식의 완전 무급유(oil-free) 구조로, 베어링부와 배기 공간이 벨로우즈로 밀봉(hermetically sealed)되어 있어 배기 가스에 윤활유가 섞여 들어가지 않는다. ✅ [Edwards nXDS Dry Scroll Pump 데이터시트]

### 2-2. 청정 배기가 필요한 이유(적용처)
nXDS 시리즈의 공식 적용 분야에는 R&D 챔버 배기, 터보펌프 백킹, 진공 코팅 시스템 등이 포함되며, 오일 오염을 허용하지 않는 정밀 진공 환경에 폭넓게 쓰인다. ✅ [Edwards nXDS Dry Scroll Pump 데이터시트]

---

## 3. 드라이펌프 사양 비교 (VIP 재배기 규모별)

### 3-1. 소형 스크롤 드라이펌프 — nXDS 시리�즈 (배관 세그먼트 단위 재배기)
| 모델 | 배기속도(Peak) | 도달진공도(총압) | 흡기 플랜지 |
|------|--------------|--------------|-----------|
| nXDS6i | 6.2 m³/h | 0.020 mbar | NW25 |
| nXDS10i | 11.4 m³/h | 0.007 mbar | NW25 |
| nXDS15i | 15.1 m³/h | 0.007 mbar | NW25 |
| nXDS20i | 22.0 m³/h | 0.030 mbar | NW25 |

✅ [Edwards nXDS Dry Scroll Pump 데이터시트] — 배기속도·도달진공도·흡기플랜지 모두 공식 수치
소음 레벨 52 dB(A), 정적 기밀도(leak tightness) 1×10⁻⁶ mbar·L/s 이하. ✅ [Edwards nXDS Dry Scroll Pump 데이터시트]

### 3-2. 중형 스크롤 드라이펌프 — XDS 시리즈 (배관 매니폴드·복수 구간 동시 배기)
| 모델 | 피크 배기속도 | 도달진공도 | 가스발라스트 사용 시 도달진공도 | 흡기 플랜지 |
|------|-------------|----------|--------------------------|-----------|
| XDS35i | 35 m³/h | 0.01 mbar | 0.02 mbar | NW40 |
| XDS46i | 40 m³/h | 0.05 mbar | 0.08 mbar | NW40 |

✅ [Edwards XDS Dry Scroll Pumps 제품 데이터시트]
최대 연속 흡기압력 40 mbar, 정적 기밀도 1×10⁻⁶ mbar·L/s 이하. ✅ [Edwards XDS Dry Scroll Pumps 제품 데이터시트]

### 3-3. 대용량 산업용 드라이펌프 — GXS/EXS 시리즈 (대형 저장탱크·모관 라인 초기 배기)
현장 확인 조합 기준(스마텍 내부 자료):
| GXS 드라이 단독 | EH 부스터 | 비율(EH/GXS) |
|---|---|---|
| GXS160 (160 m³/h) | EH1200 (1195 m³/h) | 약 7.5배 |
| GXS250 (250 m³/h) | EH2600 (2590 m³/h) | 약 10배 |
| GXS450 (450 m³/h) | EH4200 (4140 m³/h) | 약 9.2배 |

✅ [스마텍 내부 자료 — product_combos.txt, 현장 확인 조합]
EXS 시리즈는 GXS와 배기속도 라인업이 동일하며, VFD(가변주파수드라이브) 내장으로 배기 속도를 공정에 맞춰 조절할 수 있다는 점이 특징이다. ✅ [스마텍 내부 자료 — product_combos.txt]

> VIP 환형 공간처럼 배기 대상 부피가 작고 압력도 이미 낮은 편(대기압에서 시작하되 목표 진공도가 낮은 mbar대)인 경우, 대형 GXS/EXS+EH 조합보다는 nXDS·XDS 단독으로 충분한 경우가 대부분이다. 배관 길이가 길거나 복수 세그먼트를 한 번에 묶어 배기해야 하는 대형 저장탱크·모관 라인에서만 GXS/EXS급이 필요하다.

### 3-4. 규모 판단 기준 요약
- 배관 세그먼트 1~2개, 소구경(NW25 이하 배기 포트) → nXDS 시리즈
- 배관 매니폴드, 다수 세그먼트 동시 배기, NW40 포트 → XDS 시리즈
- 대형 저장탱크 재킷, 장거리 모관 라인 초기 배기 → GXS/EXS + EH 조합 (현장 확인 필요, 스마텍 문의)

---

## 4. 배기 후 검증 — 헬륨 리크 테스트

VIP 환형 공간은 배기만으로 끝나지 않는다. 용접부·플랜지·벨로우즈 이음부의 미세 누설이 있으면 시간이 지나며 진공도가 서서히 무너지고 단열 성능이 저하된다. 배기 완료 후 헬륨 리크 테스트로 기밀성을 검증하는 절차가 필요하다.

ELD500 리크 디텍터의 진공 모드 최소 검출 누설률은 웨트(Wet) 타입 기준 5×10⁻¹² mbar·L/s, 드라이(Dry) 타입 기준 3×10⁻¹¹ mbar·L/s다. ✅ [Edwards ELD500 Precision Leak Detector 데이터시트]
측정 준비 시간은 2분 이내이며, 흡기 플랜지는 NW25 규격이다. ✅ [Edwards ELD500 Precision Leak Detector 데이터시트]

헬륨 스프레이 방식(외부에서 의심 부위에 헬륨을 분사해 검출기 신호 변화를 관찰)은 리크 테스트 방식 중 감도가 가장 높은 방식으로 꼽히며, 진공로부터 배관 라인까지 폭넓게 적용된다. ⚠️ [pfeiffer-vacuum.com — 일반 원리 참고, 수치 미사용]

극저온 환경 특유의 사례로는, 초전도 자석에 삽입되는 빔 스크린을 극저온 상태에서 미리 헬륨 리크 체크한 뒤 삽입하는 절차가 학술 자료에서 언급된다. ⚠️ [학술 문헌 참고 — 일반 원리 설명에만 사용, 수치 미사용]

---

## 5. 현장 사례 (상담기록)

이번 주제는 특정 상담기록과 연결되지 않았다. 스마텍 취급 드라이펌프(nXDS, XDS, GXS/EXS)의 VIP·극저온 배관 재배기 적용은 일반적인 진공 원리와 제품 사양을 근거로 작성한다.

---

## 참고 소스

- ✅ [Edwards nXDS Dry Scroll Pump 데이터시트](data/Product_master_table/4.스크롤펌프_소형nXDS.txt) — 수치 인용
- ✅ [Edwards XDS Dry Scroll Pumps 제품 데이터시트](data/Product_master_table/5.스크롤펌프_중형XDS.txt) — 수치 인용
- ✅ [Edwards ELD500 Precision Leak Detector 데이터시트](data/Product_master_table/9-1.헬륨리크디텍터_ELD500.txt) — 수치 인용
- ✅ [스마텍 내부 자료 — product_combos.txt](블로그/knowledge/product_combos.txt) — 수치 인용
- ⚠️ [Vacuum Insulated Piping Systems — whatispiping.com](https://whatispiping.com/vacuum-insulated-piping/) — 구조 개요 참고, 수치 미사용
- ⚠️ [Helium Leak Detection on Vacuum Systems — pfeiffer-vacuum.com](https://www.pfeiffer-vacuum.com/global/en/applications/helium-leak-detection/) — 원리 참고, 수치 미사용
- ⚠️ [Cryopumping and Vacuum Systems — arxiv.org](https://arxiv.org/pdf/2006.01574) — 초전도 자석 빔스크린 리크체크 사례 참고, 수치 미사용
- ⚠️ [Four Ways to Reduce Outgassing — edwardsvacuum.com](https://www.edwardsvacuum.com/content/dam/brands/edwards-vacuum/general-vacuum/gated-downloads/application-notes/3601-2181-01-four-ways-reduce-outgassing.pdf) — 아웃가싱 원리 참고, 수치 미사용

---

## 지킬 것 체크

- 출처 없는 수치는 기재하지 않았다.
- GXS/EXS + EH 조합은 스마텍 현장 확인 조합표 기준으로만 기술했다 (product_combos.txt).
- 일반 공식(2~8배)은 원리 설명에도 사용하지 않고, 조합표만 사용했다.
- 상담기록 미사용 — topic-tracker.json 업데이트 불필요.
