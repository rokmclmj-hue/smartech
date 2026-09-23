# 진공 오븐 건조 공정, 진공도는 어떻게 확인할까 — 리서치

> 리서치 기준일: 2026년 9월 23일
> 허용 소스: Leybold ✅ 2개 / 스마텍 내부 자료(product_master_table, 게이지 사양) ✅
> 상담기록·현장사진 폴더 비어 있음. 9/20 E2M18 진공오븐 납품 현장사례(id=99)와는 별개 글로, 이번 글은 진공도 확인 방법에 집중한다.

## 핵심 원리 — 왜 진공을 거는가 (기존 글과 연결, 중복 아님)
- 압력이 낮아지면 물은 더 낮은 온도에서 끓는다는 원리는 이미 스마텍 블로그에서 다뤘다 — "진공에서는 물이 왜 낮은 온도에서 끓을까"(id=98, 공개 확인됨: https://www.smartechvacuum.com/blog/98 ). 이번 글은 그 원리를 반복하지 않고, **진공 오븐을 돌릴 때 진공도를 실제로 어떻게 확인·판단하는지**에 집중한다.

## 건조 공정의 단계 — Leybold 배치 건조 예시
- Leybold는 배치식 진공 건조 공정을 A~D 4단계로 설명한다: A) 가스 발라스트 펌프와 루츠펌프로 용기를 배기, B) 재료를 가열하며 수증기압이 올라가면 두 개의 콘덴서(응축기)를 연결, C) 메인 콘덴서 우회, D) 중간 콘덴서 우회. ✅ [Leybold — How does the drying process work with a vacuum pump system](https://www.leybold.com/en-us/knowledge/vacuum-fundamentals/vacuum-generation/how-does-the-drying-process-work)
- 수분 함량은 시간에 따라 지수적으로 줄어드는 모델(E = E₀ exp(-qt), q는 온도에 따른 계수)로 나타난다는 설명도 있다. ✅ 같은 자료. (이 식 자체는 이번 글에서 계산 예시로 쓰지 않고, "시간이 지날수록 수분 제거 속도가 느려진다"는 정성적 설명으로만 인용)

## 진공도(압력) 기준 — 언제 펌프 구성을 바꾸는가
- Leybold: 챔버 내 수분 압력이 27 mbar 아래로 떨어지면 루츠펌프를 추가로 가동한다. ✅ "After the water pressure in the chamber falls below 27 mbar, the Roots pump is switched in." [Leybold — How to select a vacuum pump for drying applications](https://www.leybold.com/en-in/knowledge/vacuum-fundamentals/vacuum-generation/pump-selection-for-drying-process)
- 최종 건조 단계에서는 약 6.5×10⁻² mbar 압력에 도달한다는 예시 수치가 있다. ✅ "a pressure of about 6.5·10-2 mbar is reached" (같은 자료) — 이는 해당 자료가 다루는 특정 건조 예시의 수치이며, 모든 진공 오븐에 그대로 적용되는 절대 기준은 아니라고 명시해야 한다.
- 로터리베인(오일) 펌프는 자체 수증기 허용치(60 mbar)를 넘지 않도록 앞단(루츠펌프)이 수증기압을 낮춰줘야 한다. ✅ "the water vapor pressure at the inlet port of the rotary pump does not exceed its water vapor tolerance of 60 mbar." (같은 자료)
- 가스 발라스트를 쓰는 백킹 펌프는 수증기압이 약 0.65 mbar에 이를 때까지 루츠펌프와 함께 배기를 담당한다는 예시도 있다. ✅ "pumping is accomplished by the Roots pump with a gas ballast backing pump until the water vapor pressure reaches about 0.65 mbar." (같은 자료)
- 최신 드라이(오일 없는) 펌프 기술에서는 순간적으로 펌프의 수증기 허용치를 넘어서도 그 수분이 펌프 안에서 잠깐 응축됐다가 다시 배출되는 방식으로 처리되어, 복잡한 압력 조절 장치 없이도 운전할 수 있다는 설명이 있다. ✅ "the vapor tolerance of the pump will be short time exceeded. This will cause some condensation of water inside the pump. Those will be pumped out." (같은 자료)

## 진공도를 "어떻게 확인"하는가 — 게이지 방식
- 실무적으로 진공도 확인은 위 압력 기준값을 게이지로 읽어 판단하는 것이다. 스마텍이 취급하는 저진공 게이지 APG200(피라니 방식, 측정범위 대기압~5×10⁻⁴ mbar)이 이 범위(27 mbar, 6.5×10⁻² mbar 등)를 충분히 커버한다. ✅ 스마텍 내부 `data/Product_master_table/product_master_table.csv`.
- 앞서 다룬 "수소 설비 진공게이지" 글에서 설명한 대로, 피라니 게이지는 가스 종류에 따라 표시값이 달라지는 방식이다. 건조 공정 중 챔버 안은 수증기 비중이 높아지므로, 질소 기준으로 교정된 게이지가 실제 수증기압을 정확히 반영하지 못할 수 있다는 점은 같은 원리로 이어진다. 다만 이번 조사에서 "수증기 전용 보정계수" 수치는 확인하지 못했다.

## 건조 완료를 판단하는 실무적 방법 (장기 건조 공정 예시)
- Leybold는 장기간 진행하는 건조 공정에서는 응축수 수집기를 콘덴서에서 차단해 두면, 냉각관에 남은 응축막만 재증발하게 되고 이 재증발이 가스 발라스트 펌프 크기에 따라 30~60분 안에 끝난다고 설명한다. ✅ "Depending on the size of the gas ballast pump, this re-evaporation ensues in 30 - 60 min." (Leybold — how-does-the-drying-process-work) — 이는 압력계만으로 판단하기 애매할 때 쓰는 보조적인 시간 기준으로 소개하되, 모든 설비에 적용되는 고정값이 아님을 명시.

## 글에서 쓰지 않을 것
- "27 mbar", "6.5×10⁻² mbar" 등의 수치를 모든 진공 오븐의 보편적 기준으로 단정하지 않는다 — Leybold 자료의 특정 예시 수치임을 명시.
- 스마텍 게이지가 이 압력대를 "정확하게" 잰다고 단정하지 않는다 — 가스(수증기) 의존성 한계를 함께 밝힌다.
- E=E₀exp(-qt) 수식을 활용한 계산 예시는 만들지 않는다(q값 등 구체 조건 확인 안 됨).

## 참고 소스
- ✅ [Leybold — How does the drying process work with a vacuum pump system](https://www.leybold.com/en-us/knowledge/vacuum-fundamentals/vacuum-generation/how-does-the-drying-process-work)
- ✅ [Leybold — How to select a vacuum pump for drying applications](https://www.leybold.com/en-in/knowledge/vacuum-fundamentals/vacuum-generation/pump-selection-for-drying-process)
- ✅ 스마텍 내부 `data/Product_master_table/product_master_table.csv` (APG200 사양)
- 관련 공개 글(참고용, 원리 반복 안 함): [진공에서는 물이 왜 낮은 온도에서 끓을까](https://www.smartechvacuum.com/blog/98)
