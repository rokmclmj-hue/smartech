# 이중창·진공유리·진공 단열패널, 진공은 어떻게 열을 막나 — 리서치

> 리서치 기준일: 2026년 9월 23일
> 허용 소스: NIST(물리량) ✅, 미국 에너지부(DOE, energy.gov) ✅(정부기관, 비제조사 — 일반 과학사실로 준용) / 참고: 특허문서·유리 제조사 홈페이지(개념 설명용, 수치 인용 안 함)
> Edwards·Atlas Copco·Pfeiffer·Leybold는 건축용 진공유리·단열패널 전용 자료를 갖고 있지 않음(취급 분야 아님).

## 핵심 원리 — 왜 진공이 단열이 되는가
- 열은 전도(고체·접촉을 통한 전달), 대류(기체·액체의 흐름을 통한 전달), 복사(전자기파를 통한 전달) 세 가지 방식으로 이동한다. 이 중 전도와 대류는 매개할 물질(공기 등)이 필요하다. 진공은 물질 자체가 거의 없는 상태이므로 전도·대류로 열이 옮겨갈 통로가 크게 줄어든다. ⚠️ 일반 열전달 물리 원리(교과서 수준 상식), 특정 출처 수치 인용 없음.
- 표준 대기압 101,325 Pa. ✅ [NIST CODATA — standard atmosphere](https://physics.nist.gov/cgi-bin/cuu/Value?stdatm=)

## 진공 단열패널(VIP) — 미국 에너지부 자료 기준
- 미국 에너지부(DOE) 자료: 진공 단열패널의 다공성 심재는 약 10 mbar 미만으로 배기되며, 열전도율이 낮은 배리어 필름과 함께 써서 인치당 R값(단열 성능 지표) 20 이상을 낸다. ✅ "VIPs consist of a core porous material that is evacuated to pressures < ~10 mbar with the use of a low thermal conductivity barrier film to enable an R-value per inch > 20." [DOE — Inexpensive and Durable Aerogel-Based VIP Cores](https://www.energy.gov/eere/buildings/articles/inexpensive-and-durable-aerogel-based-vip-cores-0)
- 비교 대상으로 언급된 발포폴리스티렌(EPS, 흔한 단열재)은 인치당 R값이 5 미만이라고 같은 자료가 설명한다. ✅ "expanded polystyrene has an R-value per inch < 5." (같은 자료)
- 만약 겉면 필름이 찢어져 진공이 깨지면(밀봉 실패), 심재 자체만으로도 최소한의 단열 성능을 유지해야 한다는 기준으로 "대기압 상태에서 인치당 R값 7.2 이상"을 개발 목표로 언급한다. ✅ "an R-value per inch > 7.2 at ambient pressure to ensure a sufficient level of thermal insulation in case of envelope failure" (같은 자료) → 이는 진공이 깨지면(대기압 상태) 성능이 20 이상에서 7.2 수준으로 크게 떨어진다는 것을 보여주는 근거로 쓸 수 있다(직접적인 "몇 % 감소" 문장은 아니며, 두 수치를 나란히 제시하는 방식으로 인용).

## 진공유리(VIG) — 개념 설명 (일반 특허문서 기준, 수치 인용 최소화)
- 진공유리는 두 장의 유리판 사이를 배기한 얇은 저압 공간으로 채운 구조다. 이 저압 공간을 유지하려고 유리판 테두리를 유리 프릿(가루 유리)으로 녹여 붙이는 밀봉 방식을 쓴다. ⚠️ [USPTO 특허문서 — VIG 제조 특허 다수](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/8833105) 등, 일반 구조 설명으로만 사용.
- 두 유리판이 진공 압력차로 서로 붙어버리지(휘어지지) 않도록, 그 사이에 아주 작은 기둥(필러·스페이서)을 일정 간격으로 배치해 간격을 유지한다. ⚠️ 같은 특허문서군, 개념 설명.
- 배기용 관(펌프아웃 튜브)으로 공기를 뺀 뒤 그 관 끝을 녹여 막아 밀봉을 완성한다. ⚠️ 같은 자료.
- 구체적인 진공유리 내부 압력 수치, 필러 간격(mm), 실제 시판 제품의 단열 성능(U값) 수치는 화이트리스트 자료로 확인하지 못했다 → 이 글에서 구체적 수치는 쓰지 않는다.

## 실생활 연결 — 이중창(일반 페어유리)과의 차이
- 흔히 보는 이중창(페어유리)은 두 유리판 사이에 공기나 아르곤 같은 기체를 채운 방식으로, 완전한 진공이 아니다. 반면 진공유리는 그 틈을 아예 배기한다는 점이 다르다. 이 차이는 앞서 다룬 "열전달 3가지로 이해하는 진공 단열의 원리"(보온병) 글과 원리는 같지만, 이번 글은 건축 자재(창문·벽면 패널)에 초점을 맞춘다. ⚠️ 일반 상식 수준 비교, 특정 제조사 성능 비교 수치는 쓰지 않는다.

## 글에서 쓰지 않을 것
- 진공유리의 구체적인 내부 압력·필러 간격·U값 수치 — 화이트리스트 자료로 확인 못 함.
- "진공유리가 이중창보다 몇 배 단열이 좋다"는 정량 비교 — 근거 없음(패널 R값 비교는 DOE 자료가 있으나 유리 제품 비교 자료는 없음).
- 스마텍이 건축용 진공유리·단열패널 제품을 취급한다는 근거 없음 — 특정 제품 추천 안 함.

## 참고 소스
- ✅ [NIST CODATA — standard atmosphere](https://physics.nist.gov/cgi-bin/cuu/Value?stdatm=)
- ✅ [미국 에너지부(DOE) — Inexpensive and Durable Aerogel-Based VIP Cores](https://www.energy.gov/eere/buildings/articles/inexpensive-and-durable-aerogel-based-vip-cores-0)
- ⚠️ USPTO VIG 관련 특허문서군 — 구조·제조 공정의 일반 개념 설명에만 사용, 수치 인용 없음
