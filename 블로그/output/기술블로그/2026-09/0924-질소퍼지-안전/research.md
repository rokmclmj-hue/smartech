# 진공펌프 정지 시 질소 퍼지가 필요한 이유 — 역류·응축 방지 리서치

> 리서치 기준일: 2026년 9월 17일
> 허용 소스 수: 4개 / 참고 소스 수: 0개

---

## 정지 직전 — 가스 발라스트를 연 채로 콘덴세이트를 먼저 빼야 한다

펌프를 끄기 전에 무부하(zero load) 상태에서 가스 발라스트 밸브를 열고 잠시 더 운전해 오일 속 콘덴세이트(응축수)를 배출시키는 절차가 있다.

"run the pump (again on zero load with the gas ballast valve open, to purge the oil of condensates) before shutting down" — 이 절차를 거치면 부식 가능성이 크게 줄어든다고 설명한다.
✅ [Edwards — 8 top tips for working with oil-sealed rotary vane pumps, Tip 2 "Vent condensates to avoid corrosion"](https://www.edwardsvacuum.com/en-us/vacuum-pumps/knowledge/applications/working-with-oil-sealed-rotary-vane-pumps)

이 절차는 기존 발행글 `0731-백스트리밍`·`0814-재가동전점검사항`에 나온 "정지 시 석백(suck-back)"·"재가동 시 워밍업"과는 다른 시점을 다룬다 — 이번 글은 "펌프를 끄는 그 순간"의 절차에 초점을 맞춘다.

## 응축이 생기면 왜 문제인가 (원리)

"Allowing water vapour to condense inside a pump will make the time to recover ultimate pressure much longer than if it remains in vapour phase because it has to be re-evaporated before it can be pumped out."
✅ [Edwards — How to pump condensable vapours?](https://www.edwardsvacuum.com/en-us/vacuum-pumps/knowledge/applications/how-to-pump-condensable-vapours)

"Condensate formation inside the pump increases the ultimate pressure, results in corrosion and at worst to total failure of the pump."
✅ [Pfeiffer Vacuum — Know-How, 4.7 Roots Vacuum Pumps](https://www.pfeiffervacuum.com/us/en/knowledge/vacuum-technology/knowledge-book/4-vacuum-generation/4_7_roots_vacuum_pumps/)

두 제조사 모두 "응축 → 도달진공 저하 → 부식·고장"으로 이어지는 인과관계를 명시한다. 정지 순간 챔버·펌프 내부가 저온·저압 상태에서 그대로 대기(공기)에 노출되면, 공기 중 수분이 차가운 내부 표면에서 응축되기 쉬운 조건이 만들어진다.

## 정지·보관 시 왜 공기 대신 질소로 채우나

**정비 작업 전 절차 (안전 매뉴얼 공식 지침)**
"Vent and purge the pumping system with nitrogen before starting maintenance work."
✅ [Edwards — Vacuum Pump and Vacuum Systems SAFETY MANUAL (P40040100_E)](https://www.edwardsvacuum.com/content/dam/brands/edwards-vacuum/edwards-website-assets/corporate/documents/edwards-vacuum-safety-booklet.pdf)

"Dilution with inert gas purge (for example, nitrogen), introduced into the pump inlet and/or purge connections is used to maintain safe operating conditions."
✅ [Edwards — Vacuum Pump and Vacuum Systems SAFETY MANUAL (P40040100_E)](https://www.edwardsvacuum.com/content/dam/brands/edwards-vacuum/edwards-website-assets/corporate/documents/edwards-vacuum-safety-booklet.pdf)

이 두 문장은 "정비 작업 시작 전"이 전제 조건이다 — 정지 직후 장기 보관 목적의 퍼지와는 절차 목적이 다르므로, 글에서는 이 둘을 구분해서 서술한다(정비 전 잔류 유해가스 제거 목적 vs 보관 중 표면 보호 목적).

**단기 보관·출하 목적의 표면 보호 절차**
"Upon request, the suction chamber can be phosphated, vented with nitrogen and vacuum sealed in order to provide short-term surface protection, e.g. for warehousing and shipment."
✅ [Pfeiffer Vacuum — Know-How, 4.7 Roots Vacuum Pumps, 4.7.4 Accessories "Surface protection"](https://www.pfeiffervacuum.com/us/en/knowledge/vacuum-technology/knowledge-book/4-vacuum-generation/4_7_roots_vacuum_pumps/)

이 문장은 루츠 펌프(Roots pump) 제품군 기준이며, "phosphated"(인산 처리)는 별도 표면처리 옵션이라 모든 펌프에 자동 적용되는 절차는 아니다. 글에서는 "질소로 벤트 후 vacuum sealed 상태로 보관"이라는 원리만 일반화하고, 인산 처리 자체를 모든 모델의 표준 절차처럼 서술하지 않는다.

**축 관통부(shaft feedthrough) 보호용 실링가스**
"For the most part, this risk can be avoided by admitting a sealing gas in the area of the shaft feedthrough between working space and gear chamber." / "Inert gases, mostly nitrogen (N2), are used as the sealing gas."
✅ [Pfeiffer Vacuum — Know-How, 4.7 Roots Vacuum Pumps, 4.7.4 Accessories "Sealing gas connection"](https://www.pfeiffervacuum.com/us/en/knowledge/vacuum-technology/knowledge-book/4-vacuum-generation/4_7_roots_vacuum_pumps/)

이 항목은 가동 중 실(seal) 보호용 실링가스이며, "정지 후 벤트"와는 다른 용도다. 글에서는 혼동하지 않도록 "가동 중 실 보호"와 "정지 후 보관용 벤트"를 별개 항목으로 분리해 설명한다.

## 가연성·반응성 증기를 다뤘다면 발라스트 가스 자체를 질소로 써야 한다

"When pumping potentially flammable vapours inert gas such as nitrogen should be used as the ballast gas."
✅ [Edwards — How to pump condensable vapours?](https://www.edwardsvacuum.com/en-us/vacuum-pumps/knowledge/applications/how-to-pump-condensable-vapours)

이 문장은 "정지 시 벤트"가 아니라 "가동 중 가스 발라스트에 넣는 기체 종류"를 다룬다. 공정에서 가연성 증기를 다뤘다면, 정지 직전 클린업 운전 단계의 발라스트 가스부터 질소로 바꿔야 한다는 뜻이며, 정지 후 벤트 절차와 같은 원리(불활성 분위기 유지)를 공유하지만 적용 시점이 다르다.

## 왜 "그냥 열어놓지 말고" 밸브를 잠그거나 질소로 채우는가

`0814-재가동전점검사항`(기존 발행글)에는 "부식성 가스를 다루던 설비는 정지 상태를 짧게라도 방치하면 내부에 부식과 잔류물이 빠르게 쌓인다", "질소 같은 불활성 가스로 충진해 보관하는 방식이 권장된다"는 문장이 이미 있다. 이번 글은 그 문장의 "왜"를 제조사 원문 근거로 뒷받침하고, "정비 전 퍼지" vs "정지 후 보관용 벤트" vs "가동 중 실링가스"라는 세 가지 상황을 구분해 정리하는 것이 차별점이다.

## 확인 불가 항목

- 정지 후 몇 분/몇 시간 이내에 벤트해야 하는지에 대한 구체적 시간 기준은 허용 소스에서 확인하지 못했다. "정지 직후"라고만 서술하고 특정 숫자(분·시간)는 기재하지 않는다.
- 질소 대신 건조 공기(dry air)를 써도 되는지에 대한 제조사 비교 문구는 확인하지 못했다. 위 소스들은 모두 "질소"를 명시했으므로 "질소"로만 서술한다.
- 모델별(RV·nXDS·GXS 등) 구체적 벤트 밸브 조작 절차(어느 밸브를 몇 초 여는지)는 모델별 개별 매뉴얼 확인이 필요하며 이번 리서치에서는 일반 원리 수준까지만 확인했다. 글에서는 "해당 모델 매뉴얼의 정지·벤트 절차를 따른다"로 안내하고 임의 절차를 창작하지 않는다.

## 산업군 반영

이 글은 특정 산업이 아닌 공통 안전·이론 주제다. `블로그/CLAUDE.md`의 산업군 반영 지침에 따라 특정 산업 공정을 억지로 연결하지 않는다. 다만 위 "가연성·반응성 증기" 항목은 특수가스·반도체·이차전지처럼 반응성 가스를 다루는 공정 독자에게 특히 해당한다는 점만 자연스럽게 언급한다.

## 현장 사례 (상담기록)

이번 주제와 정확히 일치하는 "정지 시 질소 퍼지" 상담기록은 확인하지 못했다. 상담기록에서 "퍼지" 키워드로 검색된 파일들은 대부분 배관·챔버 퍼지 공정 자체(공정 중 퍼지)에 관한 것으로, 이번 글의 "펌프 정지 시점" 주제와는 결이 달라 원고에 반영하지 않는다. 실제 사용한 상담기록은 없다.

---

## 참고 소스

- ✅ [Edwards — 8 top tips for working with oil-sealed rotary vane pumps](https://www.edwardsvacuum.com/en-us/vacuum-pumps/knowledge/applications/working-with-oil-sealed-rotary-vane-pumps) — Tip 2 콘덴세이트 배출 절차, 수치 미포함·절차 인용
- ✅ [Edwards — How to pump condensable vapours?](https://www.edwardsvacuum.com/en-us/vacuum-pumps/knowledge/applications/how-to-pump-condensable-vapours) — 응축 원리, 질소 발라스트 가스 사용 조건
- ✅ [Edwards — Vacuum Pump and Vacuum Systems SAFETY MANUAL (P40040100_E)](https://www.edwardsvacuum.com/content/dam/brands/edwards-vacuum/edwards-website-assets/corporate/documents/edwards-vacuum-safety-booklet.pdf) — 정비 전 질소 벤트·퍼지, 불활성가스 퍼지
- ✅ [Pfeiffer Vacuum — Know-How, 4.7 Roots Vacuum Pumps](https://www.pfeiffervacuum.com/us/en/knowledge/vacuum-technology/knowledge-book/4-vacuum-generation/4_7_roots_vacuum_pumps/) — 콘덴세이트-부식-고장 인과, 질소 벤트 보관, 실링가스
