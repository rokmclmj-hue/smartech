# ESS 배터리 셀 전해질 주입 공정 진공게이지 리서치

> 리서치 기준일: 2026년 8월 27일
> 허용 소스 수: 3개 / 참고 소스 수: 0개

---

## 기존 이차전지(04)·모빌리티(17) 글과의 차별화

- `기술블로그/2026-06/이차전지-PFPE-오일-선택법-20260606`: 셀 제조 단계별 진공 요구, PFPE 오일
- `기술블로그/2026-08/0825-모빌리티-드라이펌프`: 배터리 팩 리크 테스트, e-모터 함침 — 펌프(배기) 중심
- 이번 글(20.ESS, 제품군 C.진공게이지): **배기 펌프가 아니라 측정(게이지) 중심**. 전해질 주입 공정에서 진공도를 "어떻게 정확히 재는가"에 초점 — 게이지 종류 선택 문제로 차별화.

## 1. ESS 셀 제조 공정에서 진공이 쓰이는 단계

초기 화학물질·슬러리 혼합 단계에서는 페이스트에 기포가 들어가지 않도록 진공을 적용하고, 건조 단계에서는 가혹한 조건에서 수분을 제거하는 데 진공을 사용하며, 배터리 파우치의 실제 밀봉도 진공 상태에서 이뤄진다 ✅ [Edwards Vacuum — Energy Storage]

## 2. 진공게이지 두 계열의 근본적 차이

정전용량식 게이지(capacitance manometer)는 가스 종류와 무관하게 압력을 측정하는 반면, 피라니 게이지나 이온게이지 같은 간접식 게이지는 열전도율·이온화율 같은 가스의 물리적 성질에 기반해 압력을 판단하므로 가스 종류에 따라 측정값이 달라진다(gas-dependent). 다만 간접식 게이지는 더 넓은 압력 범위를 다루고 비용 면에서 유리하다는 장점이 있다 ✅ [Leybold — How indirect pressure measurement works]

정전용량식 게이지는 얇은 다이어프램이 측정 대상 진공과 안정된 기준 진공 사이의 압력차에 반응하는 방식으로 작동한다 ✅ [Leybold — How indirect pressure measurement works]

## 3. 왜 전해질 주입 공정에는 이 차이가 중요한가

전해질 주입·디개싱 공정에서는 전해질 용제 증기(유기 용제)가 챔버 내 기체 조성에 섞여 들어간다. 피라니 게이지처럼 가스 열전도율에 의존하는 간접식 게이지는 공기와 다른 열전도 특성을 가진 유기 용제 증기 환경에서 오차가 발생할 수 있다는 것이 정전용량식 게이지와 간접식 게이지의 원리 차이(위 2번 항목)에서 유추되는 일반적 결론이다. ⚠️ "전해질 증기 환경에서 피라니 게이지 오차가 구체적으로 몇 % 발생한다"는 정량 수치는 이번 리서치의 허용 소스에서 확인하지 못함 — 수치 인용 금지, 원리적 설명만 사용.

## 4. 조합형 게이지도 있다

일부 제품(TTR 101 계열)은 피라니 필라멘트와 소형 정전용량 센서를 결합해, 초기 저진공 구간은 정전용량 소자로 측정하고 나머지 구간은 피라니로 커버하는 방식도 있다 ✅ [Leybold — THERMOVAC Pirani]. 이 조합형 구조는 원리 소개 수준으로만 언급하고 특정 스마텍 취급 모델과 연결하지 않는다(취급 여부 미확인).

## 확인 불가 항목
- 전해질 증기 환경에서 피라니 게이지의 정량적 오차율
- ESS 셀(그리드용 대형 셀) 전해질 주입 공정의 구체적 목표 진공도(mbar) 수치 — 이번 리서치에서 확인 못함

## 현장 사례 (상담기록)
이번 주제와 직접 연결된 8월 상담기록 없음.

---

## 참고 소스
- ✅ [Edwards Vacuum — Energy Storage](https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-markets/energy-solutions/lithium-ion-battery-production)
- ✅ [Leybold — How indirect pressure measurement works](https://www.leybold.com/en-us/knowledge/vacuum-fundamentals/vacuum-measurement/how-indirect-pressure-measurement-works)
- ✅ [Leybold — THERMOVAC Pirani](https://www.leybold.com/en/products/vacuum-measurement-and-control/broad-range-vacuum-gauging/thermovac-ttr-pirani-gauges)
