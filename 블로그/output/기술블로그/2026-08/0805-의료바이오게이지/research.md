# 의료·바이오 공정 진공 측정 — 위생 기준에 맞는 게이지 선택 리서치

> 리서치 기준일: 2026년 08월 05일
> 허용 소스 수: 4개 (Edwards 공식 데이터시트 3건, Leybold 공식 1건) / 참고 소스 수: 2개 (Edwards 마켓 페이지, Pfeiffer 마켓 페이지 — 수치 미사용)

---

## 0단계 — 배경 확인 (기존 글과의 차별점)

`기술블로그/2026-07/0710-의료용진공펌프/` (발행 id=69/70)는 의료·생명공학 산업의 **A.드라이펌프** 선택 기준(오일프리, 동결건조 등)을 다룬 글로, 진공도 수치는 스치듯 1회만 언급했다. 이번 글은 **C.진공게이지** 카테고리로, 게이지 종류(피라니/캐패시턴스 마노미터/저항식/콜드캐소드 등)와 위생·세정·접액부 재질 기준에 집중한다. 산업군·제품 조합이 겹치지 않아 중복 아님.

---

## 1. 스마텍 취급 게이지 제품 스펙 (product_master_table 기준)

### APG200 — 저진공 피라니 게이지 (Edwards 공식 데이터시트, Publication 3601 0681 01 Issue2)
✅ [Edwards APG200 데이터시트]

3가지 시리즈(M / LC / MP)로 구분되며, **LC·MP 시리즈가 부식성 환경·위생 요구 공정용 변형 모델**이다.

| 항목 | APG200 M | APG200 LC (Corrosion Resistant) | APG200 MP (Corrosion Resistant) |
|---|---|---|---|
| 측정범위 | 대기압 ~ 5x10⁻⁴ mbar | 대기압 ~ 1x10⁻⁴ mbar | 대기압 ~ 5x10⁻⁴ mbar |
| 정확도(100mbar~1x10⁻³mbar) | ±15% | ±15% | ±15% |
| 재현성 | 2% (100~1x10⁻³ mbar) | 2% (10~1x10⁻³ mbar) | 2% (100~1x10⁻³ mbar) |
| 접액부 재질 | Tungsten/Rhenium, Stainless steel 316L·304L, Glass, Ni, NiFe, Stainless steel 302S26 | **Platinum/Iridium**, Stainless steel 316L·304L, Glass, Ni, NiFe, Stainless steel 302S26, **PTFE** | **Platinum/Rhodium**, Stainless steel 316L·304L, Glass, Ni, NiFe, Stainless steel 302S26 |
| 필라멘트 | Tungsten | Platinum | Platinum |
| 내압한계 | 10 Bar | 10 Bar | 10 Bar |
| 전원 | 15~48V dc | 동일 | 동일 |
| 베이크아웃(전자부 분리 시) | 150°C | 150°C | 150°C |
| 호환 컨트롤러 | TIC/ADC/TAG | TIC/ADC/TAG | TIC/ADC/TAG |

✅ [Edwards APG200 데이터시트] — "Materials exposed to vacuum" 표 원문 인용. LC/MP 시리즈는 텅스텐 필라멘트를 백금(Platinum) 계열로 바꾸고, PTFE(불소수지) 실링을 추가해 부식성 가스·습기에 대한 저항성을 높인 모델이다.

### AIM200 — 고진공 콜드캐소드(Active Inverted Magnetron) 게이지
✅ [Edwards AIM200 데이터시트, Publication 3601 0754 01]

- 측정원리: Inverted Magnetron (냉음극 방식)
- 측정범위: 1x10⁻⁹ ~ 1x10⁻² mbar
- 정확도(N₂ 기준): 측정값의 <30% (1x10⁻⁹ ~ 1x10⁻² mbar 전 구간)
- 접액부 재질: Stainless steel 304, 304L, 316L, 347, 430, Ni-Fe, Glass
- 실링: Glass/metal
- 데드볼륨: 20 cm³
- 내압한계: 10 Bar
- 전원: 15~48V dc / 베이크아웃 150°C(전자부 분리 시)
- 플랜지: NW25, NW40, DN40CF (EX NW25 확장튜브 옵션 있음 — C클램프 호환)

### WRG200 — 저진공+고진공 혼합(Wide Range) 게이지
✅ [Edwards WRG200 데이터시트, Publication 3601 0764 01]

- 측정원리: Inverted Magnetron + Pirani 복합
- 측정범위: 1x10⁻⁹ ~ 1000 mbar (단일 포트로 대기압~초고진공 전 구간 커버)
- 정확도(N₂ 기준): 1x10⁻⁹~1x10⁻³ mbar 구간 <30%, 1x10⁻³~10mbar 구간 <15%
- 접액부 재질: Stainless steel 304, 304L, 316L, 347, 430, Ni-Fe, Glass, Tungsten
- 데드볼륨: 20 cm³ / 내압한계 10 Bar
- 플랜지: NW25, EX NW25, NW40, DN40CF

### P4/P5 — 휴대용(Handheld) 게이지
✅ [Edwards P4/P5 데이터시트, Publication 3601 0815 01]

- P4: 압전저항식(Piezoresistive), 절대압 2000~1 mbar
- P5: 압전저항식 + 열전도 피라니 복합, 절대압 1200~5x10⁻⁵ mbar
- P4 접액부 재질: Stainless steel 1.4305, Al₂O₃ 세라믹, FKM(불소고무)
- P5 접액부 재질: Stainless steel 1.4307, Nickel, Tungsten, SiO₂, Glass
- 정확도(P4): 절대압 0.25% of scaled value
- 정확도(P5): 1200~40mbar 구간 0.3%, 40~10⁻³mbar 구간 10% of measured value
- 진공연결: DN16 ISO-KF, G1/4 (P4만 G1/4 추가 지원)

### ADC — 액티브 디지털 컨트롤러
✅ [Edwards ADC 데이터시트, Publication 3601 0196 01]

- 지원 압력범위: 2000 ~ 1x10⁻⁹ mbar (APG100, APGX-H, WRG 및 레거시 게이지 호환)
- MkII 버전: 게이지 2개 동시 지원, 셋포인트 2개(48V dc 1A 릴레이), RS232 인터페이스
- mbar/Torr/Pa/Volts 단위 선택 가능

---

## 2. 게이지 종류별 원리 비교 (허용 소스 기반 정리)

Edwards Passive Gauges 데이터시트(✅ Publication 3601 0307 01)에서 확인한 원리별 분류 — 스마텍이 취급하는 액티브(APG/AIM/WRG) 라인과 동일한 3원리(피라니/콜드캐소드/이온)를 사용하며, 이 문서는 **접액부 재질을 부식성·습윤 공정용으로 어떻게 바꾸는지** 원리를 잘 보여준다.

| 게이지 종류 | 측정원리 | 측정범위(예시 모델) | 접액부 재질(표준형) | 접액부 재질(내식성형) |
|---|---|---|---|---|
| 피라니(Pirani) | 열전도도 측정 | 5x10⁻⁴ ~ 1000 mbar (PRG20K) | 알루미늄 셀 + 텅스텐 필라멘트 (PRG20K-NW16 AI) | **스테인리스강 셀 + 백금 필라멘트 + 세라믹 피드스루** (PRG20KCR-NW16 SS) — "Well suited for corrosive processes and water vapour atmospheres" |
| 콜드캐소드(Penning) | 냉음극 방전 이온화 | 1x10⁻⁹ ~ 1x10⁻² mbar (CPG35K) | Stainless steel, Nichrome, Ceramics, Titanium (전 모델 공통) | — |
| 이온게이지(핫캐소드) | 열음극 방전 이온화 | 2x10⁻¹¹ ~ 10⁻² mbar (Bayard-Alpert), 2x10⁻¹² ~ 10⁻⁴ mbar (Extractor) | Iridium/이트륨산화물 코팅, Tungsten, Mo/Pt | — |

✅ [Edwards Passive Gauges and Controllers, Publication 3601 0307 01] — "PRG20KCR–NW16 SS: Stainless steel sensing cell with platinum filament and ceramics feed through. Well suited for corrosive processes and water vapour atmospheres." 원문 인용.

**참고**: 위 표의 PRG20K/CPG35K/IG40 시리즈는 Edwards Passive Gauge 라인으로, 스마텍이 취급하는 APG200/AIM200/WRG200(Active Gauge 라인)과는 별도 제품군이다. 다만 "표준 필라멘트(텅스텐) → 내식성 필라멘트(백금) + 스테인리스강 셀"로 바꾸는 설계 원리는 APG200 LC/MP 시리즈와 동일한 접근이다. 원리 설명에만 참고하고, 이 표의 모델명 자체를 스마텍 취급 제품처럼 서술하지 않는다.

---

## 3. 캐패시턴스 마노미터(Capacitance Manometer) — 내식성·위생 관련

✅ [Leybold CERAVAC CTR 공식 제품페이지]

- 측정범위: 1000 Torr ~ 1x10⁻⁵ Torr (Full scale 옵션: 1000 Torr ~ 0.1 Torr)
- 정확도: up to 0.12% of reading (rdg.)
- 센서 다이어프램 재질: **Inconel diaphragm**
- 입구 플랜지 재질: **Stainless steel 316** (inlet flange)
- 원문: "Inconel sensor and stainless steel 316 inlet flange" — "corrosion resistance and an increased longevity", "suited in very aggressive and corrosive applications", "highly resistant to corrosion from common process chemicals"

→ 캐패시턴스 마노미터는 가스 종류에 무관하게 압력을 절대값으로 측정하는 방식이라, 공정 가스가 자주 바뀌거나 부식성 증기(세정액 증기 등)에 노출되는 환경에서 피라니 대비 안정적이다. 다만 이 수치는 스마텍이 직접 취급하는 제품이 아닌 Leybold 공식 제품페이지 기준이므로, "동일 원리의 타사 제품 사례"로만 인용한다.

---

## 4. 위생(CIP/SIP)·GMP 규제 관련 — 확인 불가 항목

- **CIP(Clean-in-Place)/SIP(Sterilize-in-Place) 세정 프로토콜과 게이지 선택의 직접적 상관관계**: Edwards·Pfeiffer·Leybold 공식 자료 어디에도 CIP/SIP라는 용어로 게이지 사양을 명시한 문서를 찾지 못했다. → **확인 불가**
- Pfeiffer Vacuum 제약·바이오 마켓 페이지(⚠️ 참고만, 수치 미사용)에서 "GMP Annex 1", "21 CFR Part 11" 규정 준수가 언급되나, 게이지 재질·세정 기준 관련 구체 수치는 없음.
- Edwards 제약 마켓 페이지(⚠️ 참고만)도 "정확한 게이지 판독이 의료 응용에서 안전상 중요하다"는 일반 서술만 있고, CIP/SIP·접액부 세정성 관련 구체 스펙은 없음.

**결론**: 이 글에서 "위생 기준"은 CIP/SIP 프로토콜 자체가 아니라, **① 접액부 재질(스테인리스강 316L, PTFE 등 내식·내습 재질)**과 **② 부식성 세정제 증기·수증기 분위기에서의 게이지 안정성(내식성 시리즈 채택)**의 두 축으로 서술한다. 이 두 축은 위 1~3번의 공식 데이터시트로 뒷받침된다. CIP/SIP라는 용어 자체를 수치·규격과 결부해 서술하지 않는다(확인 불가이므로 창작 금지).

---

## 5. 현장 사례 (상담기록)

`data/상담기록/` 전체 폴더에서 "의료", "바이오", "제약", "병원", "CIP", "SIP", "멸균", "게이지" 등 키워드로 검색했다.

- 게이지 관련 상담 다수는 WRG/APG의 일반 트러블슈팅(알람 표시, 저진공·고진공 혼용 게이지 오버랩 구간 등)이며, 의료·바이오 위생 기준과는 무관했다.
- 의료 업체 관련 언급은 `상담_20260613_1531_통화 녹음 01033440972_260604_153338.txt`에서 "오송 쪽에 의료 업체랑 [펌프 도비작업을] 많이 해가지고"라는 발언이 있었으나, 이는 **게이지 선택이 아닌 일반 펌프 정비 작업** 언급으로, 이번 글 주제(위생 기준 게이지 선택)와 직접 연결되지 않는다.
- **CIP/SIP, 접액부 재질, 위생 기준을 명시적으로 언급한 상담기록은 없었다.** → 현장 사례 섹션은 "확인 불가"로 처리하며, `topic-tracker.json`의 `used_consultation_records`에는 추가하지 않는다(실질적으로 글에 반영할 만한 내용이 없었음).

---

## 6. product_combos.txt 확인 결과

`블로그/knowledge/product_combos.txt`는 GXS/EXS 드라이펌프 + EH 부스터 조합, iGX/iH/iXH 루츠+클로 방식 등 **펌프+부스터 조합 지식**을 다루는 파일로, 진공게이지 선택과는 직접 관련이 없다. 이번 주제에 적용할 조합 정보 없음.

---

## 참고 소스

- ✅ [Edwards APG200 데이터시트](edwardsvacuum.com, Publication 3601 0681 01 Issue2) — 수치 인용
- ✅ [Edwards AIM200 데이터시트](edwardsvacuum.com, Publication 3601 0754 01) — 수치 인용
- ✅ [Edwards WRG200 데이터시트](edwardsvacuum.com, Publication 3601 0764 01) — 수치 인용
- ✅ [Edwards P4/P5 데이터시트](edwardsvacuum.com, Publication 3601 0815 01) — 수치 인용
- ✅ [Edwards ADC 데이터시트](edwardsvacuum.com, Publication 3601 0196 01) — 수치 인용
- ✅ [Edwards Passive Gauges and Controllers 데이터시트](edwardsvacuum.com, Publication 3601 0307 01) — 원리 비교·내식성 설계 인용
- ✅ [Leybold CERAVAC CTR 공식 제품페이지](https://www.leybold.com/en/products/vacuum-measurement-and-control/precision-vacuum-gauging/ceravac-ctr) — 수치 인용
- ⚠️ [Edwards Pharmaceuticals 마켓 페이지](https://www.edwardsvacuum.com/en-ca/vacuum-pumps/our-markets/chemical-processing/pharmaceuticals) — 참고만, 수치 미사용
- ⚠️ [Pfeiffer Vacuum Pharma & Biotech 마켓 페이지](https://www.pfeiffervacuum.com/us/en/industries/pharma-and-biotech/) — 참고만, 수치 미사용. GMP Annex 1·21 CFR Part 11 언급만 확인, 구체 게이지 스펙 없음
- 스마텍 내부: `data/Product_master_table/13.저진공게이지_APG200.txt`, `14.고진공게이지AIM200.txt`, `15.저진공+고진공게이지_WRG200.txt`, `16.디스플레이진공게이지_P4-P5.txt`, `18.컨트롤러_ADC.txt`
- 스마텍 내부: `data/상담기록/` 전체 검색 — 위생 기준 게이지 선택 관련 사례 없음(확인 불가로 처리)
