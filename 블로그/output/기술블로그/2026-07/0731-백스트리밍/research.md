# 진공펌프 백스트리밍이란? — 오일 증기가 챔버를 오염시키는 원리와 방지법 리서치

> 리서치 기준일: 2026년 7월 24일
> 허용 소스 수: 7개 / 참고 소스 수: 3개

---

## 1. 백스트리밍(Backstreaming)이란

백스트리밍은 펌프 쪽에 있던 증기(주로 오일 증기)가 정상적인 배기 흐름과 반대 방향으로 챔버 쪽을 향해 역류·확산하는 현상이다.
오일씰 로터리베인 펌프, 확산펌프(diffusion pump)처럼 오일을 사용하는 펌프에서 발생하며, 챔버 내부 표면에 얇은 탄화수소 막을 남겨 코팅·분석 공정을 오염시키거나, 실효 가스 부하(outgassing)를 높여 도달진공도를 떨어뜨리는 원인이 된다.
✅ [Edwards 공식 지식자료 검색결과 종합 — vacuum knowledge base]

민감한 응용에서는 백스트리밍이 매우 바람직하지 않을 수 있으며, 이 경우 펌프 상부에 배플(baffle) 또는 트랩(trap)을 장착해 백스트리밍을 최소화할 수 있다.
✅ [Edwards 공식 지식자료 — foreline trap/baffle 관련 페이지]

**드라이펌프(오일 프리)와의 비교**
Edwards 드라이 진공펌프는 압축실 내부에 오일이 없는 구조이므로 백스트리밍과 그로 인한 오염 문제 자체가 발생하지 않는다.
✅ [Edwards 공식 지식자료]

---

## 2. 왜 발생하는가 — 원리

### 2-1. 오일씰 펌프의 구조적 원인
- 오일씰 로터리베인·로터리피스톤 펌프는 회전자와 베인 사이 밀봉·윤활을 위해 펌프 오일을 사용한다. 저압(고진공) 영역에서는 오일의 증기압이 무시할 수 없는 수준이 되어, 오일 분자가 증발해 흡기 쪽(챔버 방향)으로 확산될 수 있다.
- 확산에 의한 역류는 압력이 낮을수록(진공도가 높을수록) 상대적으로 더 잘 일어나는 현상으로, 배기가스 흐름이 이를 상쇄하지 못하는 조건에서 두드러진다.
✅ [Edwards RV 데이터시트 — Ultimate pressure(Total) 항목: 1.5×10⁻³ Torr(RV3/5/8/12, 60Hz) / 2.0×10⁻³ mbar(50Hz)]

### 2-2. 펌프 정지 시 압력 역전(suck-back)
- 펌프가 정지하면 펌프 내부(입구 쪽) 압력이 챔버보다 낮은 상태에서 급격히 상승할 수 있고, 이때 흡기 밸브가 즉시 닫히지 않으면 펌프 오일이나 오일 증기가 챔버 쪽으로 빨려 들어가는 "석백(suck-back)" 현상이 발생한다.
- Edwards RV 시리즈는 이를 막기 위해 "Fast acting, automatic inlet valve for best in class anti-suck back protection"을 채택했으며, 오일 압력으로 부드럽게 열리고 펌프 정지 후 0.4초 이내에 닫히도록 설계되어 있다.
✅ [Edwards RV 데이터시트 — "Rapid closing within 0.4 seconds of pump stopping"]
- Leybold TRIVAC B 시리즈도 흡기부에 오일 압력으로 유압 제어되는 anti-suckback valve(ASBV)를 두어, 펌프 정지 시 매우 빠르게 흡기를 차단함으로써 챔버 쪽 압력 상승과 오일 백스트리밍을 함께 억제한다고 설명한다.
✅ [Leybold 공식 제품 페이지 — TRIVAC B, "Low oil back streaming thanks to Anti-suckback valve controlled via the oil pressure"]

### 2-3. 저진공 영역에서의 오일 증기압 문제
- 수분(물)의 포화 증기압은 20°C에서 약 24 mbar(18 Torr)이며, 이 수분이 펌프 내부에서 응축되면 오일을 열화시키고 도달진공 회복 시간을 크게 늘린다. Edwards는 이 응축 방지가 가스 밸러스트의 핵심 기능이라고 설명한다.
✅ [Edwards 공식 지식자료 — "Why gas ballast is important on oil sealed rotary vane pumps"]
- Pfeiffer Vacuum은 가스 밸러스트 밸브를 열면 비응축성 가스가 펌프로 유입되어 증기가 응축되기 전에 혼합되고 배기구로 함께 배출된다고 설명하며, 대유량·가스밸러스트 운전 시 오일 미스트가 펌프 밖으로 동반 배출되기 쉬워진다고 언급한다.
✅ [Pfeiffer Vacuum 공식 지식자료 — Rotary Vane Vacuum Pumps Know-How]

---

## 3. 방지법

### 3-1. 배플(Baffle) / 콜드 트랩(Cold Trap)
- 배플이나 트랩을 펌프(또는 시스템) 상부에 장착하면 백스트리밍을 최소화할 수 있다.
✅ [Edwards 공식 지식자료]
- 콜드 트랩은 냉각된 표면(또는 배플)을 이용해 오일 증기가 펌프에서 챔버 쪽으로 흐르는 것을 막는 방식이다. 흡기 쪽에 냉각된 베인이 든 배플이나 배관 구간을 부착하고, 이를 액체질소(LN2)나 펠티어 소자 등으로 냉각하면 오일 증기 분자가 응축되어 배기 대상 공간에서 제거된다.
✅ [Edwards 공식 지식자료]
- Edwards의 Schlenk Line 관련 자료에서는 "Schlenk Line과 진공펌프 사이에 액체질소 또는 드라이아이스/아세톤 콜드 트랩을 설치해 실험에서 발생하는 용매 등으로부터 펌프를 보호한다"고 설명하며, 이 콜드 트랩은 Schlenk Line에 이미 포함되어 있는 경우가 많다고 안내한다.
✅ [Edwards 공식 지식자료 — Schlenk lines]
- Pfeiffer Vacuum은 극저온 용기를 배기할 때 콜드 트랩이 로터리베인 펌프에서 역류하는 작동유체 증기로부터 챔버를 보호할 수 있으며, 콜드 트랩·흡착 트랩(adsorption trap)을 사용하면 공정가스 흐름에서 응축성 매질을 걸러내 펌프와 장비 수명을 함께 늘릴 수 있다고 설명한다.
✅ [Pfeiffer Vacuum 공식 지식자료 — Rotary Vane Vacuum Pumps Know-How]

### 3-2. 포어라인 트랩(Foreline Trap) — Edwards FL20K 사례
- FL20K는 클린 펌핑 시스템에서 로터리 펌프 오일 미스트가 시스템(챔버) 쪽으로 역류(back-migration)하는 것을 막기 위해 개발된 인렛(포어라인) 트랩이며, 1 mbar 이하에서 작동하는 2단 로터리 펌프에 가장 유용하다.
- 흡착재로 활성 알루미나(activated alumina)를 사용하며, 포화되기까지 최대 6개월까지 사용 가능하고, 250~300°C에서 2시간 베이킹하면 재생(rejuvenate)할 수 있다.
✅ [Edwards 공식 제품자료 — FL20K Foreline Trap, edwardsvacuum.com 웹샵/매뉴얼]
- 스마텍 취급 RV 시리즈의 정식 액세서리로 FL20K(Inlet accessories - Foreline trap)가 등록되어 있으며, RV3/RV5/RV8/RV12에 공용으로 적용된다.
✅ [Edwards RV 데이터시트 — Ordering information, "Inlet accessories: Foreline trap - FL20K (A13305000)"]

### 3-3. 가스 밸러스트(Gas Ballast) 사용
- 가스 밸러스트는 증기가 펌프를 통과하는 동안에는 항상 가동하는 것이 원칙이며, 압축 과정에서 비응축성 가스를 추가로 도입해 증기가 펌프 내부에서 응축되는 것을 막는 방식으로 작동한다.
✅ [Edwards 공식 지식자료 — "Why gas ballast is important on oil sealed rotary vane pumps"]
- Edwards는 시동·정지 전후로 가스 밸러스트 밸브를 연 상태에서 무부하로 펌프를 예열/공회전시켜 내부에 남은 응축물을 배출할 것을 권장한다.
✅ [Edwards 공식 지식자료 — "8 top tips for working with oil-sealed rotary vane pumps"]
- 단, 가스 밸러스트 가동 시 배기구로 오일 미스트가 더 많이 동반 배출되므로 오일량 점검이 중요하며, 이를 위해 오일 미스트 필터(EMF 등)를 함께 사용해야 한다.
✅ [Edwards 공식 지식자료 — "8 top tips for working with oil-sealed rotary vane pumps"]
- RV 시리즈는 2단계 가스 밸러스트(GB I / GB II)를 지원하며, 수분 처리 용량은 GB I 60 g/h(전 모델 공통), GB II 220 g/h(RV3/5/8) ~ 290 g/h(RV12)이다. 가스 밸러스트 사용 시 도달진공도는 GB I 기준 2.3×10⁻² Torr(3.0×10⁻² mbar), GB II 기준 모델별 4.6×10⁻²~9.1×10⁻² Torr(6.0×10⁻²~1.2×10⁻¹ mbar)로, 가스 밸러스트를 끈 상태(1.5×10⁻³ Torr, 2.0×10⁻³ mbar)보다 높아진다(=도달진공도는 다소 희생하고 수분 배출 능력을 확보하는 트레이드오프).
✅ [Edwards RV 데이터시트 — Technical data 표]
- 자동화가 필요하면 솔레노이드 작동 가스 밸러스트 밸브를 옵션으로 장착할 수 있다.
✅ [Edwards RV 데이터시트 — Features and benefits: Gas ballast]

### 3-4. 오일 미스트 필터(EMF) — 배기측 오염 확산 방지
- EMF 오일 미스트 필터는 오일씰 로터리 펌프 배기가스에서 오일 미스트와 냄새를 분리·포집하는 장치로, 섬유 복합 오일 미스트 필터 요소와 활성탄 냄새 필터 요소로 구성된다. 필터 요소가 막히면 압력 릴리프 밸브가 작동해 펌프 내 압력 상승을 막는다.
- 정격 유량: EMF3 3 m³/h, EMF10 12 m³/h, EMF20 20 m³/h. 최대 배압 12 psig(1.8 bar abs). 미스트 필터 요소 교환 주기는 통상 6개월(공정에 따라 단축), 냄새(활성탄) 요소는 매월 또는 오일 냄새가 날 때마다 교환 권장.
- 적용 펌프: EMF10 → RV3/RV5/RV8 등, EMF20 → RV12 등(스마텍 취급 RV 시리즈에 직접 대응).
✅ [Edwards 공식 EMF3/EMF10/EMF20 Instruction Manual — 스마텍 내부 자료 data/Product_master_table/19.미스트필터(EMF).txt]
- 오일 리턴 키트 3종(Clean Application / Gas Ballast / Gravity)을 통해 필터에 포집된 오일을 펌프로 되돌려 오일 손실을 줄일 수 있다. 단, Clean Application 키트는 응축성 증기나 아지드화나트륨을 배기하는 공정에는 사용할 수 없다.
✅ [Edwards 공식 EMF Instruction Manual]

### 3-5. 펌프 정지 시 벤트 밸브(Vent Valve) 사용 순서
- 효과적인 배기 밸브(exhaust valve)는 오일 손실을 막거나 줄이는 데 핵심적이며, 올바르게 설계된 밸브는 펌프가 진공 상태에서 정지할 때 발생하는 "석백(suck-back)"을 방지한다.
✅ [Edwards 공식 지식자료 — "8 top tips for working with oil-sealed rotary vane pumps"]
- RV 시리즈는 흡기측에 자동 인렛 밸브(오일 압력으로 부드럽게 열리고, 펌프 정지 0.4초 이내 닫힘)를 기본 탑재해 별도 수동 조작 없이도 정지 시 역류를 억제하도록 설계돼 있다.
✅ [Edwards RV 데이터시트]
- Leybold는 정전이나 정지 상황에서 흡기부 anti-suckback valve가 유압으로 즉시 닫혀 챔버 쪽 압력 상승을 막으면서 동시에 펌프는 벤트(대기 개방)되도록 하는 구조를 채택하고 있으며, 이 동작은 가스 밸러스트 밸브가 열려 있는 상태에서도 동일하게 작동한다고 설명한다.
✅ [Leybold 공식 제품 페이지 — TRIVAC B]

### 3-6. 드라이펌프로 전환
- 드라이 스크롤펌프(nXDS 등)는 헤르메틱 씰(hermetic bellows sealing) 구조로, 베어링 윤활유가 진공 환경을 오염시키지 않고 반대로 공정가스가 베어링을 오염시키지도 않는 구조다. 오일이 없는 진짜 드라이(truly dry) 방식이므로 오일 백스트리밍 자체가 구조적으로 발생하지 않는다.
✅ [Edwards nXDS 데이터시트 — "Hermetic sealing ensures that the vacuum environment is not contaminated by bearing lubricant..."]
- nXDS 도달진공도(총압)는 모델별 0.007~0.030 mbar(0.005~0.022 Torr) 수준으로, 오일씰 로터리베인 펌프에 필적하는 수준까지 개선되었다("comparable with those of oil-sealed rotary vane pumps – without the inconvenience of oil").
✅ [Edwards nXDS 데이터시트]
- 다만 드라이펌프도 가스 밸러스트를 통해 응축성 증기·용매 유입을 방지하는 것이 권장된다(오일 백스트리밍은 없지만, 응축물이 펌프 내부에 쌓이는 문제는 별개로 존재).
✅ [Edwards 공식 지식자료 — Schlenk lines, "nXDS dry scroll pumps should be operated with inert gas ballast to avoid condensation of vapours and dilute solvents entering the pump"]

---

## 4. 오일펌프 vs 드라이펌프 — 백스트리밍 리스크 비교

| 구분 | 오일씰 로터리베인/피스톤 펌프 (RV 시리즈 등) | 드라이 스크롤펌프 (nXDS 시리즈 등) |
|---|---|---|
| 백스트리밍 발생 여부 | 발생 가능 (오일 증기 역류) | 구조적으로 발생하지 않음 (오일 없음) |
| 도달진공(총압) | 1.5×10⁻³ Torr / 2.0×10⁻³ mbar (RV, GB 미사용) | 0.007~0.030 mbar (모델별) |
| 오염 방지 수단 | 배플/콜드트랩/포어라인트랩(FL20K)/EMF 오일미스트필터/가스밸러스트/오토 인렛밸브 | 헤르메틱 밀봉 구조 자체가 오염 원천 차단 |
| 정지 시 역류 방지 | 오토 인렛밸브(0.4초 이내 닫힘) 등 별도 설계 필요 | 별도 오일 역류 방지 설계 불필요 |
| 수분·용매 처리 | 가스 밸러스트로 GB I 60 g/h / GB II 최대 290 g/h(RV12) 대응 | 가스 밸러스트로 최대 220 g/h(nXDS20i, 35 mbar 이하) 대응 |

✅ [Edwards RV 데이터시트, Edwards nXDS 데이터시트 — 스마텍 내부 자료 data/Product_master_table/ 종합]

> **주의**: 위 표는 스마텍이 취급하는 RV(오일)와 nXDS(드라이) 시리즈의 공식 데이터시트 수치를 병기한 것이며, "오일펌프는 무조건 나쁘고 드라이펌프는 무조건 좋다"는 식의 일반화는 지양한다. 오일펌프는 수증기·입자 처리 능력이 뛰어나고(RV는 GB II 최대 290 g/h 처리), 여전히 질량분석·전자현미경 등 다수 응용에서 표준으로 쓰인다. 백스트리밍이 공정상 치명적인 응용(초고진공 준비단계, 정밀 코팅, 분석장비 등)에서는 배플·트랩·EMF 조합으로 관리하거나 드라이펌프로 전환하는 것이 선택지가 된다.

---

## 5. 현장 사례 (상담기록)

### 5-1. 드라이펌프는 오일 백스트리밍이 없다 — 현장 기술 문의
2026-07-04, 미코하이테크 조태현 팀장과의 통화에서 드라이펌프(단축 스크류 타입) 운전 중 벨로우즈가 찌그러지는 현상에 대해 상담했다. 통화 중 고객이 "펌프 벤트 라인 압력 때문에 질소가 흡기 쪽으로 역류할 수 있는지" 질문했고, 스마텍 담당자는 다음과 같이 답변했다.

> "아니요, 역류할 수가 없죠. 이거는 오일로타리가 아니기 때문에 안 되죠. 오일 로타리는 오일 백스팀이라고 그래서 10⁻³~10⁻² 구간으로 가면 진공이 펌핑을 하더라도 미세 오일이 이렇게 조금씩 위로 타고 올라가는 그 오일 백스트 현상이 있는데, 드라이 펌프에서는 그런 게 없습니다. 스크류 타입이라 오일 종류는 없습니다."

이 상담은 (1) 오일 로터리 펌프에서 백스트리밍이 실제로 10⁻³~10⁻² Torr(또는 mbar, 발화상 단위 명시 안 됨) 압력대에서 발생한다는 현장 인식과, (2) 드라이(스크류) 펌프에는 이 현상이 구조적으로 없다는 것을 스마텍이 고객에게 직접 설명한 사례로, 오일펌프 vs 드라이펌프 비교 섹션에 반영할 수 있는 실제 대화 근거다.

> 참고: 통화 중 압력 단위(Torr/mbar)를 명시적으로 특정하지 않았으므로, 이 수치는 "현장 설명" 맥락으로만 인용하고 정밀 수치 근거는 Edwards RV 데이터시트의 공식 압력값(1.5×10⁻³ Torr / 2.0×10⁻³ mbar)을 기준으로 삼는다.

- 출처 파일: `상담_20260704_0823_통화 녹음 팀장조태현 미코하이테크_260703_101434.txt`

### 5-2. 검토했으나 미채택
"백스트리밍/오일 증기/챔버 오염/역류/배플/콜드트랩/가스밸러스트" 키워드로 상담기록 649건 전체를 검색한 결과 직접 관련 언급은 위 1건뿐이었다. 그 외 오일 오염·역류 관련 별도 상담 사례는 발견되지 않았다.

---

## 참고 소스

- ✅ [Edwards RV Oil Sealed Rotary Vane Pumps 데이터시트](스마텍 내부 자료 data/Product_master_table/1.오일펌프_소형RV.txt) — 수치 인용 (가스밸러스트 수분처리량, 도달진공, 인렛밸브 응답시간, FL20K 액세서리)
- ✅ [Edwards nXDS Dry Scroll Pump 데이터시트](스마텍 내부 자료 data/Product_master_table/4.스크롤펌프_소형nXDS.txt) — 수치 인용 (도달진공, 수분처리량, 헤르메틱 구조)
- ✅ [Edwards EMF3/EMF10/EMF20 Oil Mist Filter Instruction Manual](스마텍 내부 자료 data/Product_master_table/19.미스트필터(EMF).txt) — 수치 인용 (정격유량, 배압, 교환주기, 적용펌프)
- ✅ [Edwards 공식 지식자료 — "Why gas ballast is important on oil sealed rotary vane pumps"](https://www.edwardsvacuum.com/en-us/vacuum-pumps/knowledge/applications/why-gas-ballast-is-important-on-oil-sealed-rotary-vane-pumps) — 원리 및 수치(수분 포화증기압 24 mbar) 인용
- ✅ [Edwards 공식 지식자료 — "8 top tips for working with oil-sealed rotary vane pumps"](https://www.edwardsvacuum.com/en-us/vacuum-pumps/knowledge/applications/working-with-oil-sealed-rotary-vane-pumps) — 가스밸러스트 운전법, 배기밸브·석백 방지 원리 인용
- ✅ [Edwards 공식 지식자료 — "What are schlenk lines?"](https://www.edwardsvacuum.com/en-us/vacuum-pumps/knowledge/applications/schlenk-lines) — 콜드트랩 사용법, 가스밸러스트 병행 사용 원리 인용
- ✅ [Edwards FL20K Foreline Trap 제품자료](https://us.my.edwardsvacuum.com/en_US/USD/Catalog/Accessories/Accessories-Industrial-Vacuum-Pumps/Filters-Separators/Separators/p/A13305000) — 수치 인용 (작동압력 1 mbar 이하, 흡착재 수명 6개월, 재생조건 250~300°C 2시간)
- ✅ [Leybold TRIVAC B 제품 페이지](https://www.leybold.com/en-us/products/vacuum-pumps/oil-sealed-vacuum-pumps/rotary-vane-pumps-trivac-b) — anti-suckback valve 원리 인용
- ⚠️ [Pfeiffer Vacuum Rotary Vane Vacuum Pumps Know-How](https://www.pfeiffer-vacuum.com/us/en/knowledge/vacuum-technology/knowledge-book/4-vacuum-generation/4_2_rotary_vane_vacuum_pumps/) — 직접 페이지 열람은 접속 차단(HTTP 406)되어 검색엔진 요약을 통해서만 확인. 콜드트랩·흡착트랩·가스밸러스트 작동 원리는 참고했으나, 구체 수치(예: 특정 압력 임계값)는 출처가 불명확해 미사용
- ⚠️ [스마텍 내부 상담기록](data/상담기록/상담_20260704_0823_통화 녹음 팀장조태현 미코하이테크_260703_101434.txt) — 현장 설명 인용, 압력 단위 불명확으로 정밀 수치 근거로는 미사용(현장 사례 섹션에 대화 인용으로만 사용)

### 확인 불가 (허용 소스에서 수치 확인 못함)
- 배플/콜드트랩 장착 시 백스트리밍 저감률(예: "90~95% 저감")은 vacaero.com, highvacdepot.com 등 화이트리스트 외 소스에서만 발견되어 본 리서치에는 반영하지 않음. 정밀 저감률이 필요하면 Edwards/Pfeiffer/Leybold 공식 응용노트를 추가로 확인해야 함.
- 오일 증기압의 구체적 수치(예: Ultragrade 19 오일의 mbar 단위 증기압 값)는 Ultragrade 오일 MSDS(스마텍 내부 자료)에서 확인되지 않음 — MSDS에는 인화점(220°C)·점도(55 cSt@40°C) 등은 있으나 증기압 항목은 "사용 가능한 데이터 없음"으로 기재됨.
