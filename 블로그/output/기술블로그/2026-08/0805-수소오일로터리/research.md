# 수소 설비에서 오일로터리펌프 사용 시 주의사항 리서치

> 리서치 기준일: 2026년 08월 05일
> 허용 소스 수: 5개 / 참고 소스 수: 1개
> 참고: 같은 산업(수소에너지) A편(드라이펌프, 2026-06-10 발행)과 논조 겹치지 않도록,
> "왜 드라이펌프가 기본 권장인가"가 아니라 "그럼에도 오일로터리펌프를 쓰는 경우 지켜야 할 주의사항"에 집중.

---

## 핵심 안전 사실 — 가스발라스트는 수소에서 절대 열면 안 된다

Leybold 공식 지식 문서(진공펌프 오일 교환·유지보수 페이지)에 아래 경고가 명시되어 있다.

> "The gas ballast valve may in no case be opened when dealing with hydrogen. The motors driving the pumps must be of explosion-proof design. ATEX regulations apply."
> (수소를 다룰 때는 가스발라스트 밸브를 절대 열어서는 안 된다. 펌프를 구동하는 모터는 반드시 방폭 설계여야 하며, ATEX 규정이 적용된다.)
✅ [Leybold — 로터리베인 펌프 오일 교환·유지보수 페이지]

- 가스발라스트는 일반적으로 대기(air)를 도입해 수증기 응축을 막는 구조다. 수소 환경에서 일반 공기를 가스발라스트로 도입하면 펌프 내부에서 수소-공기 폭발성 혼합물이 형성될 위험이 있다.
- 같은 문서군에서 "폭발성·독성 가스를 다룰 때는 대기 대신 불활성 가스(질소 등 퍼머넌트 가스)를 가스발라스트 매체로 사용하는 특수 사례가 있다"는 원칙도 확인된다.
✅ [Leybold — 가스발라스트 작동 원리 페이지]

---

## Edwards ATEX 오일로터리펌프 — 방폭 사양 옵션

### RV 시리즈 (소형, RV3/5/8/12)
- 표준 RV 펌프는 범용 모터가 기본이며, "특수 용도로 방폭(ATEX) 인증 모터를 장착한 펌프 제공 가능"이라고 명시돼 있다(문의 필요).
✅ [Edwards RV 오일로터리펌프 공식 데이터시트 — data/Product_master_table/1.오일펌프_소형RV.txt]
- Edwards 공식 판매 페이지(shop.edwardsvacuum.com)에는 "ATEX RV3/RV5/RV8/RV12" 제품이 별도로 등록돼 있으며, 외부 방폭 등급은 **Ex II 2G IIC T4**로 표기된다.
✅ [Edwards Vacuum 공식 — ATEX RV 시리즈 제품 페이지(shop.edwardsvacuum.com)]
- 검색 결과 요약에 따르면 "가연성 가스·증기를 배기할 때는 가스발라스트 포트에 불활성가스 퍼지를 연결해 해당 가스를 폭발 하한계(LEL) 이하로 희석해야 한다"는 조건이 붙는다.
✅ [Edwards Vacuum 공식 — ATEX RV 시리즈 제품 페이지(shop.edwardsvacuum.com)]

### nES 시리즈 (단단, Ex 전용 라인업)
- Edwards는 아예 "잠재적 폭발성 대기에서 가스를 취급하고, 그런 환경에서 작동하도록" 설계된 **nES Single Stage Ex Series** 를 별도 라인업으로 판매한다.
✅ [Edwards Vacuum 공식 — nES Single Stage Ex Series 제품 페이지]
- 세부 스펙(정확한 배기속도·모델별 파라미터)은 이번 리서치에서 확인하지 못함 → "사양 확인 필요"로 표시.

### E2M 시리즈 (중대형, EX/AZ 배리언트)
- E2M은 4가지 배리언트로 나뉜다: HC(표준 탄화수소 오일), FX(PFPE, 산소농도 21% 초과 환경용), AZ(옐로우메탈 프리, 아지드 화합물 호환), **EX(ATEX 인증, 폭발성 대기 및 그 주변에서 사용)**.
✅ [Edwards E2M 두 단계 로터리베인펌프 공식 데이터시트 — data/Product_master_table/2.오일펌프_중대형E2M.txt]
- EX 시리즈 모델: E2M40T4, E2M80T4, E2M175T3, E2M275T3 (220/240V 또는 380/415V, 50Hz 3상). 인증 등급은 "ATEX cat 3 internal / cat 2 external"로 표기.
✅ [Edwards E2M 공식 데이터시트 — Ordering Information]
- E2M 표준 오일은 Ultragrade 70(HC/AZ/EX 공통), FX 배리언트만 PFPE.
✅ [Edwards E2M 공식 데이터시트]

### E2S 시리즈 (중형)
- E2S45/65/85는 현재 확인된 공식 자료상 별도 EX(ATEX) 배리언트가 없다. 표준형만 확인됨 — 방폭이 필요한 공정이면 EX 인증이 있는 E2M 계열로 전환을 검토해야 한다.
✅ [Edwards E2S 공식 데이터시트 — data/Product_master_table/2-1오일펌프 중대형E2S.txt] (EX 배리언트 언급 없음, 확인 불가로 처리)

---

## 오일 열화 — 수소 자체보다 수분·오염 관리가 관건

- Edwards 순정 오일 Ultragrade 15/19/20의 인화점은 220°C, Ultragrade 70은 230°C로 MSDS에 명시돼 있다. 상온에서는 위험하지 않으나, "고온으로 가열하거나 기계적 조작을 하면 연무가 발생해 자극할 수 있다"고 경고한다.
✅ [Edwards Ultragrade 오일 MSDS — data/Product_master_table/20.진공펌프오일_Ultra19.txt]
- 오일 자체가 수소와 직접 반응해 위험해진다는 근거는 이번 리서치에서 확인되지 않았다. 실제 위험 요인은 ① 가스발라스트로 유입된 공기와 수소가 섞여 만드는 폭발성 혼합물, ② 정전기·스파크에 의한 점화(수소는 최소점화에너지가 매우 낮음)이다.
- Leybold는 별도로 "가스발라스트 운전 시 오일 손실이 커지고, 공정 증기·오염물질에 오일이 오염되면 오일을 교체해야 한다"고 안내하며, 정확한 교환 주기는 "운전 조건에 따라 달라져 일률적 규정이 불가능하다"고 명시한다.
✅ [Leybold — 로터리베인 펌프 오일 교환·유지보수 페이지]
- 수소 환경에서는 가스발라스트를 열 수 없으므로(위 핵심 안전 사실 참고), 수분 배출 목적의 정상적인 가스발라스트 활용 자체가 제한된다는 뜻이다. 대신 배기 라인의 수분·응축수는 별도 트랩·필터로 관리해야 한다는 것이 논리적 귀결이다(공식 문서에 이 대체 방법이 구체적으로 명시되지는 않음 — "현장 설계 필요"로 표시).

---

## 수소 가스 자체의 위험 특성 (일반 안전 공학 상식 — 규정 조항 인용 없이 수치만)

- 폭발(가연) 범위: 하한계(LEL) 약 4%, 상한계(UEL) 약 75% (공기 중 부피 기준) — 매우 넓은 범위로 알려져 있다.
- 최소점화에너지(MIE): 약 0.017 mJ 수준으로 매우 낮다고 알려져 있다.
⚠️ [일반 산업안전 자료 종합 — 정확한 1차 규정 문서(NFPA 원문 등) 대조는 이번 리서치에서 하지 못함. 수치 자체는 산업계에 널리 통용되는 값이나, 글에서는 "매우 넓은 폭발범위·매우 낮은 점화에너지"처럼 정성적 표현 위주로 쓰고, 구체적 수치는 보조적으로만 사용 권장]

---

## 오일로터리펌프를 그래도 쓰는 현실적 케이스

research.md 작성 시점 기준으로 스마텍 내부에 수소 전용 상담기록은 확인되지 않았다(A편 리서치와 동일 결과). 대신 아래는 제품 스펙·구조에서 도출 가능한 합리적 추론이다.

- **소규모 연구용 랩 라인**: 수소 사용량이 적고 배기 유량이 작은 실험실 단위 라인은, 대형 드라이펌프 도입 비용 대비 오일로터리펌프(RV3~RV12, 소형 E2M)가 초기 투자 부담이 작다.
- **저압·저부하 조건**: 연속 대유량 배기가 아니라 간헐적·저부하 공정이면 오일 펌프의 마모·오염 부담이 상대적으로 낮다.
- **기존 설비 유지**: 기존 라인에 이미 오일로터리펌프가 설치돼 있고 공정 변경 없이 수소 배관만 추가하는 경우, 전체 교체보다 ATEX 사양 확인·개조가 현실적 대안이 될 수 있다.
→ 다만 이 경우에도 위 "핵심 안전 사실"(가스발라스트 금지·방폭 모터 필수)은 예외 없이 적용된다.

---

## 현장 사례 (상담기록)

수소 에너지 전용 상담기록 없음 (A편 리서치와 동일).
- 일반 오일로터리펌프 상담에서 반복되는 패턴: 오일 오염·교환 주기 문의, 방폭이 필요한 화학 공정 문의 시 EX 모델 존재 여부를 묻는 경우가 있음 → 수소 라인에도 동일한 "EX 모델 있는지" 질문이 예상됨.

---

## 참고 소스

- ✅ [Leybold — Rotary vane vacuum pump maintenance and oil change](https://www.leybold.com/en-us/knowledge/vacuum-fundamentals/vacuum-maintenance/oil-change-for-rotary-vane-vacuum-pumps) — 수소·가스발라스트 경고문, 오일 교환 기준 인용
- ✅ [Leybold — The simple science behind gas ballast valves](https://www.leybold.com/en-us/knowledge/blog/the-simple-science-behind-gas-ballast-valves) — 가스발라스트 매체(공기 vs 불활성가스) 원리 인용
- ✅ [Edwards Vacuum — ATEX RV 시리즈 제품 페이지(shop.edwardsvacuum.com)] — RV ATEX 등급(Ex II 2G IIC T4), 불활성가스 퍼지 조건 인용
- ✅ [Edwards Vacuum — nES Single Stage Ex Series 제품 페이지](https://www.edwardsvacuum.com/en-uk/vacuum-pumps/our-products/oil-rotary-vane-pumps-single-stage/nes-ex-series) — Ex 전용 라인업 존재 인용
- ✅ [스마텍 내부 — data/Product_master_table/1.오일펌프_소형RV.txt] — RV 시리즈 공식 데이터시트
- ✅ [스마텍 내부 — data/Product_master_table/2.오일펌프_중대형E2M.txt] — E2M EX/AZ/FX/HC 배리언트, 모델명, 오일 종류
- ✅ [스마텍 내부 — data/Product_master_table/2-1오일펌프 중대형E2S.txt] — E2S 사양(EX 배리언트 미확인)
- ✅ [스마텍 내부 — data/Product_master_table/20.진공펌프오일_Ultra19.txt] — Ultragrade 오일 MSDS(인화점 등)
- ⚠️ [일반 산업안전 자료 종합 — 수소 LEL/UEL/MIE 수치] — 참고만, 정성적 표현 위주로 사용 권장
