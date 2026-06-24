# 이차전지 배터리 공정 PFPE 오일 리서치

> 리서치 기준일: 2026년 06월 06일
> 허용 소스 수: 3개 / 참고 소스 수: 0개

---

## 1편(실험실-진공펌프-오일-선택법)과의 차별화 방향

1편에서 다룬 내용 (반복 금지):
- Ultragrade vs PFPE 기본 비교 (점도·화학적 안정성·가격 차이)
- 실험실 환경에서의 오일 선택 기준 일반론
- 오일 교환주기 개념 설명

이 글(2편)의 차별화 포커스:
- **이차전지 공정의 구체적 화학 환경** — NMP, 전해액(LiPF6), HF(불화수소)가 왜 특별한가
- **배터리 공정 단계별** 진공 요구사항 — 전극 건조 → NMP 회수 → 전해액 주입 → 디개싱 → 셀 봉합
- **GXS 건식 드라이펌프가 이차전지 공정 표준이 된 이유** — PFPE Drynert® 윤활 구조 포함
- 오일식 펌프가 이차전지 공정에 부적합한 구체적 이유

---

## 2. 이차전지 배터리 공정 단계별 진공 요구사항

Edwards 공식 자료 기준 ✅ [edwardsvacuum.com/lithium-ion-battery-manufacturing PDF]

이차전지 제조 공정에서 진공이 필요한 단계:

| 공정 단계 | 진공 목적 | 주요 위험 물질 |
|-----------|-----------|---------------|
| 슬러리 혼합 (Slurry Mixing) | 기포 제거, 균일 혼합 | NMP 용제 증기 |
| 전극 건조 (Electrode Drying) | NMP 제거, 수분 40ppm 이하 달성 | NMP 증기, 극미량 수분 |
| NMP 회수 (NMP Recovery) | 용제 재활용, 환경 규제 대응 | NMP 고농도 증기 |
| 전해액 주입 (Electrolyte Filling) | 기포 없는 균일 주입 | LiPF6 전해액, EC/DMC/DME |
| 디개싱 (Degassing) | 전해액 기포 제거 | LiPF6, 유기 용제 증기, HF 가능 |
| 셀 봉합 (Cell Sealing) | 파우치·원통형 셀 밀봉 | 전해액 잔류 가스 |
| 화성 (Formation) | 초기 충방전, 가스 배출 | CO2, H2, HF 등 반응 가스 |

수치 기준: 전해액 디개싱 공정 요구 진공도 < 0.1 mbar ✅ [Edwards GXS Application Note — Lithium-Ion Battery Electrolyte Degassing]

---

## 3. NMP 용제가 일반 오일에 미치는 영향

⚠️ 이 섹션은 원리 설명이며, 구체적 용해도 수치는 허용 소스 미확인으로 기재하지 않음.

**NMP(N-메틸-2-피롤리돈)란?**
- 양극재·음극재 슬러리 제조 시 바인더(PVDF)를 녹이는 데 사용하는 유기 용제
- 비점 약 202°C, 상온에서 액체이나 진공 환경에서 증기로 존재
- 탁월한 용해력이 특징 → 일반 탄화수소 오일을 서서히 용해시킴

**일반 탄화수소 오일(Ultragrade 계열)과 NMP의 반응:**
- NMP 증기가 오일에 흡수되면 점도 저하 발생
- 점도 저하 → 밀봉력 감소 → 도달 진공도 악화
- 오일 오염 가속화 → 교환주기 대폭 단축 → 유지비 급증
- 최악의 경우 오일이 NMP와 혼합되어 펌프 내부 침전물 형성

**PFPE 오일이 NMP에 강한 이유:**
- PFPE(퍼플루오로폴리에테르)는 탄소-불소 결합만으로 구성된 합성 오일
- 거의 모든 유기 용제(NMP 포함)에 불용성 — 서로 섞이지 않음
- NMP를 흡수하지 않으므로 점도·윤활 성능이 유지됨

---

## 4. 전해액 환경 — LiPF6와 HF 발생 메커니즘

✅ [Edwards GXS Electrolyte Degassing Application Note]
✅ [edwardsvacuum.com — Why dry pumps better for electrolyte degassing]

**리튬이온 배터리 전해액 구성:**
- 용매: DME(다이메톡시에탄), Dioxolane, EC(에틸렌카보네이트), DMC(디메틸카보네이트) 혼합
- 리튬염: LiPF6(리튬헥사플루오로포스페이트)
- 이 혼합물이 진공 디개싱·주입 공정 중 펌프로 유입될 수 있음

**HF 발생 경로:**
- LiPF6는 수분(H₂O)과 반응 시 LiF + PF₅ 생성
- PF₅가 추가 수분과 반응 → HF(불화수소산) 발생
- 공정 중 미량 수분 유입 시 HF가 지속 발생
- HF는 강산성 부식성 가스 → 일반 탄화수소 오일과 금속 부품 급속 부식

**PFPE 오일이 HF에 강한 이유:**
- 화학적 비반응성(불활성) — 불소화합물이므로 불소 계열 가스·산(HF)에 대한 내성 보유
- 탄화수소 오일은 산에 의해 산화·분해되나, PFPE는 구조적으로 반응하지 않음

Edwards 공식 설명: "PFPE oils have corrosive resistant properties and chemical inertness, used in applications where hostile process conditions quickly destroy normal hydrocarbon pump oil." ✅ [edwardsvacuum.com — Vacuum pump oil and fluids]

Edwards 추가 공식 설명: "Oxidants such as oxygen (O2), ozone (O3), fluorine (F2), nitrogen trifluoride (NF3) and tungsten hexafluoride (WF6) are often pumped — Edwards recommends PFPE lubricant in pumps used to pump these reactive gases." ✅ [edwardsvacuum.com — Vacuum pump oil and fluids]

---

## 5. GXS 드라이펌프가 이차전지 공정 표준이 된 이유

✅ [Edwards GXS Product Brochure] ✅ [Edwards Lithium-Ion Battery Manufacturing PDF]

**GXS의 이차전지 적합성:**
- GXS 재질이 전해액 성분(DME, Dioxolane, LiPF6)에 내화학성 보유하도록 설계됨 ✅ [Edwards GXS Application Note]
- 도달진공도: GXS160 단독 7×10⁻³ mbar / GXS250 단독 4×10⁻³ mbar ✅ [Edwards GXS 브로슈어]
- 콤비 타입: GXS160/1750 조합 7×10⁻⁴ mbar, GXS250/2600 조합 5×10⁻⁴ mbar ✅ [Edwards GXS 브로슈어]
- 전해액 디개싱 요구 진공도 < 0.1 mbar 충분히 달성 ✅

**핵심 구조 — PFPE Drynert® 25/6 윤활 채택:**
- GXS 전 모델(GXS160, GXS250, GXS450, GXS750 및 콤비 전부)의 윤활유: **PFPE Drynert® 25/6** ✅ [Edwards GXS 브로슈어 Technical Data]
- 기어박스 오일이 PFPE이므로 부식성 가스(HF 등) 침투 시에도 오일 열화 없음
- 샤프트 씰 퍼지(Shaft Seal Purge) 구조: 기어박스가 공정 가스로부터 격리
- "Advanced shaft sealing — non-contacting seals with integral oil blocking labyrinth seal + 6L/min seal purge keeps vacuum space free of oil" ✅ [Edwards GXS 브로슈어]

**오일식 펌프(E2M, RV 등) 대비 GXS 우위:**
- 오일식 펌프: 공정 가스가 오일과 직접 접촉 → NMP·HF에 의한 오일 오염 불가피
- GXS 드라이: 오일이 기어박스에만 존재, 공정 가스 경로와 격리 구조
- 드라이펌프는 오일 역류(backstreaming)가 없어 배터리 전극 오염 위험 없음

**Edwards 공식 이차전지 적용 사례:**
- 주요 리튬이온 배터리 제조사에 최적화된 드라이 진공 솔루션 공급 ✅ [edwardsvacuum.com — Energy Storage]
- GXS 적용 공정 확인: 슬러리 혼합, 전극 건조, 전해액 충전, 진공 디개싱, 셀 봉합, 화성 ✅ [Edwards Lithium-Ion Battery Manufacturing PDF]
- GXS 브로슈어 Application 섹션에 "Lithium-Ion battery drying" 명시 ✅ [Edwards GXS 브로슈어]

---

## 6. 오일식 펌프(Ultragrade 오일 사용)가 부적합한 구체적 이유

이차전지 공정에서 오일식 로터리베인 펌프(E2M, RV) 사용 시 문제:

| 문제 유형 | 원인 | 결과 |
|-----------|------|------|
| 오일 오염 | NMP 증기가 Ultragrade 오일에 흡수됨 | 점도 저하, 도달 진공도 악화 |
| 오일 산화 | HF(불화수소) 발생 시 탄화수소 오일 부식 | 오일 슬러지 생성, 부품 마모 |
| 전극 오염 | 오일 역류(backstreaming) 가능성 | 배터리 성능 저하, 수율 손실 |
| 교환 주기 | 오염 가속으로 빈번한 교환 필요 | 유지비 급증, 생산 중단 |
| 안전 위험 | HF+탄화수소 오일 반응 | 폐오일 처리 위험 증가 |

Edwards 공식 권고: "유해 공정 조건이 일반 탄화수소 펌프 오일을 빠르게 파괴하는 응용 분야에서 PFPE 사용" ✅ [edwardsvacuum.com]

---

## 7. 현장 사례 (상담기록)

이차전지 전문 상담기록 없음 (현재 보유 상담기록 내 이차전지 관련 파일 미존재)

---

## 참고 소스

- ✅ [Edwards 공식 — Vacuum pump oil and fluids](https://www.edwardsvacuum.com/en-us/vacuum-pumps/services/vacuum-pump-oil) — PFPE 오일 특성 및 적용 기준 인용
- ✅ [Edwards 공식 — GXS Application Note (Lithium-Ion Battery Electrolyte Degassing)](https://www.edwardsvacuum.com/content/dam/brands/edwards-vacuum/edwards-website-assets/knowledge-and-insights/edwards-application-knowledge/ivd-blog-posts/download/edwards-lithium-ion-battery-electrolyte-degassing-application-note.pdf) — 공정 단계 및 재질 호환성 인용
- ✅ [Edwards 공식 — Lithium-Ion Battery Manufacturing PDF](https://www.edwardsvacuum.com/content/dam/brands/edwards-vacuum/general-vacuum/downloads/applications/edwards-industrial-lithium-ion-battery-manufacturing.pdf) — 공정 단계별 적용 사례 인용
- ✅ [Edwards 공식 — GXS Product Brochure](https://www.edwardsvacuum.com/content/dam/brands/edwards-vacuum/general-vacuum/downloads/dry-screw-pumps/edwards-GXS-dry-pumps-product-brochure.pdf) — GXS 기술 데이터(PFPE Drynert® 25/6, 도달진공도) 인용
- ✅ [Edwards 공식 — Why dry pumps better for Li-ion battery electrolyte degassing](https://www.edwardsvacuum.com/en-us/knowledge/applications/why-are-dry-pumps-better-for-li-ion-battery-electrolyte-degassing) — 드라이펌프 우위 근거 인용
- ✅ [Edwards 공식 — Energy Storage (lithium-ion battery production)](https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-markets/energy-solutions/lithium-ion-battery-production) — 이차전지 산업 적용 현황
