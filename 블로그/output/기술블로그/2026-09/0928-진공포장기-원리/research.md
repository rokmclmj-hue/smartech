# 진공 포장기는 어떻게 공기를 빼고, 왜 음식이 오래갈까 — 리서치

> 리서치 기준일: 2026년 9월 22일
> 허용 소스 수: 3개(Atlas Copco·Leybold·NIST) / 참고 소스 수: 1개(FDA, 안전 문구만)
> 상담기록·현장사진 폴더는 비어 있어 스마텍 내부 사례 없음. 제품 연결은 `product_combos.txt`의 적합 공정 문구(식품포장)만 사용.

## 핵심 질문 (기존 글과 겹치지 않는 지점)
- 기존 글 중 "청소기 vs 공장 진공펌프", "물이 낮은 온도에서 끓는 이유", "아웃가스"와 다르게 **식품 포장 한 사이클에서 무슨 일이 일어나는가**와 **진공이 왜 부패를 늦추는가(그리고 늦추지 못하는 것)**에 집중한다.

## 1. 진공 포장의 기본 원리
- 포장 전에 봉지 안 공기를 빼고 밀봉한다. 필름 봉지에 넣고 공기를 빼서 밀봉한다는 정의. ✅ [Atlas Copco — vacuum packaged food](https://www.atlascopco.com/en-us/vacuum-solutions/blog/vacuum-packaged-food)
- 방식은 슈링크(열수조), 스킨(필름이 제품을 감쌈), MAP(CO₂·질소·산소 혼합가스 치환)으로 구분. ✅ 같은 자료
- MAP은 "배기 후 가스 주입" 공정이며 열성형기·트레이 실러에서 쓴다. ✅ [Leybold — Food Packaging](https://www.leybold.com/en/applications-and-industries/food-processing-and-packaging/food-packaging)
- 회전식(캐러셀) 포장기는 처리량이 가장 높고 큰 육류 덩어리·치즈에 쓴다. ✅ 같은 자료

## 2. 공기를 얼마나 빼야 산소가 얼마나 남는가 (계산)
- 표준 대기압은 101,325 Pa. ✅ [NIST CODATA — standard atmosphere](https://physics.nist.gov/cgi-bin/cuu/Value?stdatm=)
- **계산(직접 산출, 출처 문서의 수치 아님)**: 밀폐 용기 안 공기를 이상기체로 보고 배기하면 남는 산소 비율 ≈ 최종 압력 ÷ 101,325 Pa. 예) 약 10,000 Pa까지 빼면 처음 산소의 약 10%, 약 1,000 Pa까지 빼면 약 1%. 식품에서 나오는 수분·가스(아웃가스)와 봉지 내부 잔류 공기는 무시한 단순 추정임을 글에 명시한다.
- 소비자용 진공 포장기(노즐식)의 실제 도달 압력은 허용 소스에서 확인 불가 → 글에 수치를 쓰지 않는다.

## 3. 왜 오래가는가 / 무엇은 못 막는가
- 제조사 주장: 진공 포장 식품은 일반 보관보다 "최대 3~5배" 오래갈 수 있다. ⚠️ 이는 Atlas Copco(펌프 제조사)의 홍보성 문구이며 조건(식품·온도)이 없으므로 글에서는 "제조사가 이렇게 주장한다" 수준으로만 인용하거나 생략. ✅(출처 확인) [Atlas Copco](https://www.atlascopco.com/en-us/vacuum-solutions/blog/vacuum-packaged-food)
- 같은 자료는 "산소와 기타 가스를 완전히 제거한다"고 쓰지만, 실제 봉지 안에는 완전 진공이 아니므로 이 표현은 그대로 쓰지 않는다(위 2번 계산 참조).
- 안전 주의: 산소를 줄인 포장에서는 호기성 부패균의 성장은 느려지지만 보툴리눔균(산소를 싫어하는 균)의 독소가 부패 징후 없이 생길 수 있고, 냉장이 유일한 방어선인 제품은 포장 후 소비까지 3.3°C(38°F) 이하 유지가 필요하다는 FDA 수산물 지침. 산성도·염분 조절도 관리 방법. ⚠️ 어류 대상 미국 지침이므로 "가정에서 모든 식품에 적용"으로 확장하지 않고, "진공 포장이 냉장·냉동을 대신하지 못한다"는 일반 문장으로만 사용. [FDA Chapter 13](https://www.fda.gov/files/food/published/Fish-and-Fishery-Products-Hazards-and-Controls-Guidance-Chapter-13-Download.pdf)

## 4. 펌프 쪽 이야기 (산업 연결)
- 포장기용 펌프는 오일 밀봉 로터리 베인과 건식 모두 쓴다. ✅ Atlas Copco 육류 포장 페이지, ✅ Leybold — SOGEVAC/TRIVAC B(오일식), NOVADRY(오일 프리)
- 식품 수분이 있으면 펌프 안에서 응축되어 오일과 섞일 수 있고, 가스 발라스트는 압축비를 최대 10:1로 낮춰 응축 전에 수증기를 내보낸다. 발라스트 밸브를 열고 펌프가 운전 온도에 있어야 한다. ✅ [Leybold — gas ballast](https://www.leybold.com/en-us/knowledge/vacuum-fundamentals/vacuum-generation/how-does-a-gas-ballast-work)
- Leybold 펌프의 수증기 허용치 "33~66 mbar"는 Leybold 펌프 종류별 값이므로 Edwards 제품에 옮겨 쓰지 않는다(글에서 생략).
- 회전식 포장기는 펌프를 기계 가까이 설치해 사이클마다 긴 배관을 다시 배기하지 않게 하면 처리량과 에너지에 유리. ✅ Leybold 식품포장 페이지
- 오일 프리(건식)는 산소 호환 오일이 필요 없고 유지보수 부담이 적다는 Leybold 주장(적색육 포장). ✅ 같은 자료 (제조사 주장으로 표기)
- 스마텍 내부: `product_combos.txt`에 GXS(식품포장 적합 공정 명시). 구체 배기속도·조합 수치는 이번 글에서 쓰지 않는다(확인된 공식 조합 필요).

## 글에서 쓰면 안 되는 것
- "완전 진공", "영구 보관", 구체 보관 기간(일수), 가정용 기기 성능 수치, 특정 가정용 브랜드 언급.
- 진공 포장으로 냉동 화상이 방지된다 등 이번에 검증하지 못한 주장.

## 참고 소스
- ✅ [Atlas Copco — 6 reasons why vacuum packaged food could be better for you](https://www.atlascopco.com/en-us/vacuum-solutions/blog/vacuum-packaged-food)
- ✅ [Atlas Copco — Meat packaging with vacuum](https://www.atlascopco.com/en-us/vacuum-solutions/industries/meat-packaging)
- ✅ [Leybold — Food Packaging](https://www.leybold.com/en/applications-and-industries/food-processing-and-packaging/food-packaging)
- ✅ [Leybold — How does a gas ballast work](https://www.leybold.com/en-us/knowledge/vacuum-fundamentals/vacuum-generation/how-does-a-gas-ballast-work)
- ✅ [NIST CODATA — standard atmosphere](https://physics.nist.gov/cgi-bin/cuu/Value?stdatm=)
- ⚠️ [FDA — Fish and Fishery Products Hazards Guidance, Chapter 13](https://www.fda.gov/files/food/published/Fish-and-Fishery-Products-Hazards-and-Controls-Guidance-Chapter-13-Download.pdf) — 안전 일반 문장에만 사용
