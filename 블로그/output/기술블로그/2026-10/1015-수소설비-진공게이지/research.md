# 수소 설비 진공 측정, 가스 때문에 게이지 눈금이 틀어지는 이유 — 리서치

> 리서치 기준일: 2026년 9월 23일
> 허용 소스 수: 2개(Edwards, Pfeiffer) / 스마텍 내부 자료 1개(제품 마스터 테이블)
> 상담기록·현장사진 폴더 비어 있음.

## 핵심 원리 — 왜 가스 종류에 따라 눈금이 달라지는가
- Edwards: 진공게이지는 보통 제조사가 질소로 교정하며, 질소를 측정할 때는 보정계수가 1이다. 다른 가스를 측정하면 실제 압력 Pi는 Pi = (SN2÷Si) × PN2 식으로 환산해야 한다. ✅ "Vacuum gauges usually come from the manufacturers who calibrate for nitrogen (which means that when measuring nitrogen, there is a correction factor of 1)." / "If the gas is different to nitrogen, then the true pressure Pi is expressed as: Pi = ((SN2÷Si) x PN2)" [Edwards — Seven factors affecting the sensitivity of vacuum gauges](https://www.edwardsvacuum.com/en-us/vacuum-pumps/knowledge/applications/seven-factors-affecting-the-sensitivity-of-vacuum-gauges)
- Edwards: 열식(피라니 계열) 게이지는 무거운 분자일수록 더 큰 보정계수가 필요한 경향이 있다고 설명한다. ✅ "It has been shown that higher mass molecules tend to require larger correction factors." (같은 자료) → 반대로 수소처럼 가벼운 분자는 보정 방향이 다르게 나타난다는 뜻이며, 구체적인 수소 보정계수 수치는 Edwards 자료에서 확인하지 못했다.
- Pfeiffer: 피라니(열전도) 게이지는 측정하는 가스 종류에 따라 압력 표시값이 달라지며, 이는 가스별로 이온화 확률(열전도 게이지의 경우 열전도 특성)이 다르기 때문이다. 질소·공기는 좋은 선형성을 보이지만 가벼운 가스(헬륨)와 무거운 가스(아르곤)는 뚜렷한 편차를 보인다는 그래프(Fig. 5.4)가 실려 있다. ✅ "The pressure reading will depend upon the type of gas in question..." / "While good linearity can still be seen for nitrogen and air, significant deviations are indicated for light (He) and heavy gases (Ar)." [Pfeiffer — Total Pressure Measurement Fundamentals](https://www.pfeiffervacuum.com/us/en/knowledge/vacuum-technology/knowledge-book/5-vacuum-measuring-equipment/5_1_fundamentals_of_total_pressure_measurement/) — 수소는 그래프에 함께 실린 가스 중 하나로 언급되나, 구체적인 수치·보정계수는 텍스트로 확인하지 못했다(그래프 이미지 값이라 인용 불가).
- Pfeiffer: 냉음극(콜드캐소드) 이온게이지도 가스 종류에 따라 다른 압력을 나타낸다 — 예를 들어 헬륨은 공기보다 낮은 압력으로 표시된다. 열음극(핫캐소드) 이온게이지도 마찬가지로 가스 의존적이다. ✅ "The pressure reading will depend upon the type of gas in question due to the different ionization probabilities of the various gases. For example, a lower pressure will be indicated for helium than for air." / "A hot cathode vacuum gauge also gives a gas type dependent pressure signal." (같은 자료)

## 가스에 영향받지 않는 방식도 있다
- Pfeiffer: 압력을 면적에 가해지는 힘으로 직접 측정하는 방식(정전용량식·다이어프램 게이지)은 가스 종류와 무관하게 압력을 측정한다. ✅ "If pressure is measured via the force that is exerted on an area, the pressure measurement is independent of the type of gas." (같은 자료)
- 스마텍 제품 마스터 테이블 확인 결과, 스마텍이 취급하는 진공게이지(APG200, AIM200, WRG200)는 모두 "모든 비부식성 가스"로 표기돼 있고, 방식은 각각 피라니(APG200), 역자장(冷음극 계열, AIM200), 피라니+역자장 복합(WRG200)이다. 이는 위에서 설명한 **가스 의존적** 방식에 해당한다. ✅ 스마텍 내부 `data/Product_master_table/product_master_table.csv` (원본은 Edwards 카탈로그 사양 정리). 스마텍이 가스 독립적인 정전용량식 게이지를 취급한다는 근거는 확인하지 못했다 → 이 글에서 스마텍 제품을 "수소에서도 오차 없는 게이지"로 서술하지 않는다.

## 글에서 쓸 진단·선택 기준 (연역, 계산 아님)
- 수소는 공기(질소)보다 가벼운 분자이므로, 피라니 게이지가 질소 기준으로 표시하는 압력값과 실제 수소 압력 사이에는 차이가 생긴다는 것이 원리적으로 도출된다(Edwards·Pfeiffer의 "가스별 열전도·이온화 확률이 다르다"는 설명에서 나오는 결론). 다만 정확한 방향(더 높게 표시되는지 낮게 표시되는지)과 배수는 게이지 모델·가스 조합마다 다르므로, 이번 조사에서 확인한 화이트리스트 자료로는 수소 전용 수치를 제시할 수 없다.
- 실무적으로는 게이지 제조사가 제공하는 가스 보정계수표(질소 대비)를 확인해 실제 압력으로 환산하거나, 처음부터 수소용으로 교정된 게이지·설정을 쓰는 것이 정확도를 높이는 방법이라는 것이 Edwards 설명(보정계수 공식)에서 나오는 실무 결론.
- 가스 의존성을 아예 피하고 싶다면 정전용량식(다이어프램) 게이지처럼 가스 종류와 무관한 방식을 선택하는 방법이 있다는 것이 Pfeiffer의 설명이나, 스마텍이 이 방식의 제품을 취급하는지는 확인되지 않았으므로 특정 모델 추천은 하지 않는다.

## 안전 — 수소 특유의 주의사항
- 수소는 가연성·폭발성 가스라는 것은 일반적으로 알려진 사실이나, 이번 리서치에서는 Edwards·Pfeiffer 자료로 방폭 게이지 규격이나 구체적 안전기준 수치를 확인하지 못했다 → 이 글에서 방폭인증 등급(ATEX 등) 수치는 다루지 않고, "가연성 가스 전용 사양 확인이 필요하다"는 수준의 일반적 권고만 남긴다.

## 글에서 쓰지 않을 것
- 수소 전용 구체적 보정계수(예: "1.2배", "0.5배") — 확인된 화이트리스트 자료에 수치 없음.
- 스마텍 취급 게이지가 수소에서도 오차 없이 정확하다는 주장 — 근거 없음. 오히려 반대(가스 의존적 방식)임을 밝힌다.
- 방폭 인증 등급 구체 수치 — 확인 못 함.

## 참고 소스
- ✅ [Edwards — Seven factors affecting the sensitivity of vacuum gauges](https://www.edwardsvacuum.com/en-us/vacuum-pumps/knowledge/applications/seven-factors-affecting-the-sensitivity-of-vacuum-gauges)
- ✅ [Pfeiffer Vacuum — Total Pressure Measurement Fundamentals](https://www.pfeiffervacuum.com/us/en/knowledge/vacuum-technology/knowledge-book/5-vacuum-measuring-equipment/5_1_fundamentals_of_total_pressure_measurement/)
- ✅ 스마텍 내부 `data/Product_master_table/product_master_table.csv` (APG200/AIM200/WRG200 사양)
