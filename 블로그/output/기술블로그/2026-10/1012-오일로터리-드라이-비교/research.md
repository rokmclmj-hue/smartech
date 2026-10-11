# 오일로터리펌프 vs 드라이펌프 — 차이와 교체 판단 기준 리서치

> 리서치 기준일: 2026년 10월 12일
> 허용 소스 수: 7개(Edwards 웹 5 + Edwards 브로슈어 3종은 내부 보관본) / 참고 소스 수: 0개
> 공개 글 출처 문장: Edwards 자료만, 2곳 이내(10/9 규칙)

---

## 1. 오일로터리펌프에서 오일이 하는 일

- 오일의 역할 4가지: ① 로터와 베인 사이 밀봉 ② 베인과 스테이터 사이 밀봉 ③ 로터의 열을 하우징 바깥으로 전달(냉각) ④ 배기하는 가스로부터 금속 부품 부식 보호
  ✅ [Edwards, 8 top tips for working with oil-sealed rotary vane pumps](https://www.edwardsvacuum.com/en-uk/vacuum-pumps/knowledge/applications/working-with-oil-sealed-rotary-vane-pumps) — 10/12 원문 확인
- "wet" 펌프라는 말은 배기하는 가스가 오일에 노출된다는 뜻. 오일을 밀봉재로 쓰는 것이 드라이펌프에 없는 특징. ✅ 같은 문서
- 오일이 압축된 가스와 함께 미스트로 빠져나가는 성질이 있고, 트랩·부속품이 없으면 여러 용도에 맞지 않음. 이런 장치도 효율 100%는 아님("never 100% efficient"). ✅ 같은 문서
- 펌프가 진공 상태에서 멈추면 "suck-back"(오일이 흡입 쪽으로 빨려 올라감)에 취약한 밸브 구조가 있음. ✅ 같은 문서
- 이 문서에는 도달압력 수치·오일 교환 주기 수치가 없음 → 글에 주기 수치를 쓰지 않는다.

## 2. RV 시리즈(소형 오일로터리) 사양

- 최대 배기속도(50 Hz): RV3 3.3 / RV5 5.1 / RV8 8.5 / RV12 12 m³/h
- 도달압력(Total, 50 Hz): 2.0×10⁻³ mbar (Fomblin 사용 시 2.0×10⁻² mbar)
- 가스 발라스트 2단: 수증기 60 g/h 또는 220 g/h(RV12는 290 g/h). 오일 리턴 부속 + 오일 미스트 필터와 조합하면 윤활 손실 없이 연속 운전 가능
- 흡입 밸브: 펌프 정지 후 0.4초 이내 닫힘(오일 역류 방지)
- 정비: 육각 렌치 한 종류로 분해, 부품 자동 정렬 등 "쉬운 정비" 설계
  ✅ Edwards RV 브로슈어(내부 보관본 `data/Product_master_table/1.오일펌프_소형RV.txt`, Technical data·Features 페이지)
- "wet pumping 용도(동결건조·추출·여과·겔 건조)에 적합", 배기속도 3~12 m³/h, 수증기 60/220/290 g/h, 안티 석백 보호
  ✅ [Edwards RV Two Stage Rotary Vane Pumps](https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-products/oil-rotary-vane-pumps-two-stage/rv) — 10/12 확인
- 산소 농도 21% 초과 시 PFPE(Fomblin) 오일 필요 ✅ product_master_table.csv RV 행

## 3. nXDS 시리즈(소형 드라이 스크롤) 사양

- 최대 배기속도: nXDS6i 6.2 / 10i 11.4 / 15i 15.1 / 20i 22.0 m³/h
- 도달압력(total): 6i 0.020 / 10i 0.007 / 15i 0.007 / 20i 0.030 mbar
- 최대 수증기 처리량: 6i 110 / 10i 145 / 15i 240 / 20i 220 g/h
- 밀폐(hermetic) 구조: 진공 쪽이 베어링 윤활제로 오염되지 않고, 베어링도 공정 가스로 오염되지 않음
- 부속·정비 부품: 팁씰 서비스 키트, 베어링 서비스 키트, 흡입/배기 필터 5 μm, 가스 발라스트 어댑터
  ✅ Edwards nXDS 브로슈어(내부 보관본 `4.스크롤펌프_소형nXDS.txt`, Technical data·Ordering 페이지)
- "up to five years service interval", 현장 정비 가능 설계, "no oil to top up, replace or dispose of"(mXDS)
  ✅ [Edwards mXDS, nXDS and XDS Dry Scroll Pumps](https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-products/dry-scroll-pumps/xds) — 10/12 확인. 5년의 조건(어느 부품 기준인지)은 페이지에 없음 → 글에서는 "최대 5년, 사용 조건에 따라 달라짐"으로 한정
- 조건 주의: nXDS20i는 최대 연속 흡입압력 50 mbar(다른 모델 200 mbar) — 글에서는 다루지 않음

## 4. 직접 비교(비슷한 용량 한 쌍)

- RV12: 12 m³/h(50 Hz) · 2.0×10⁻³ mbar · 수증기 최대 290 g/h(가스 발라스트 2단)
- nXDS15i: 15.1 m³/h · 7×10⁻³ mbar · 수증기 최대 240 g/h
- 해석: 도달압력은 오일로터리가 한 자릿수 가까이 낮고, 수증기 처리량은 비슷한 수준. 드라이는 오일이 없음.
- 계산·해석은 스마텍 정리이며 제조사의 비교 문장이 아님.

## 5. 드라이펌프도 관리가 필요

- "Dry pumps still need monitoring but are engineered and designed to last longer with less maintenance requirements." 오일 펌프는 정비·오일 교환을 맡을 사람이 필요.
  ✅ [Edwards, Wet2Dry: Scaling Up (2024-03-20)](https://www.edwardsvacuum.com/en-us/news-and-events/wet2dry-dry-vacuum-solutions)
- 오일 펌프: 정비가 쉽고 부품을 구하기 쉬움 / 시간이 지나면 오일이 열화하고 진공 품질도 함께 떨어짐 / 드라이는 설치·운전에 조금 더 주의 필요 / "both have their place"
  ✅ [Edwards, Why More Heat Treaters Are Moving from Wet to Dry Vacuum Pumps (2025-04-04)](https://www.edwardsvacuum.com/en-us/news-and-events/why-more-heat-treaters-are-moving-from-wet-to-dry-vacuum-pumps) — 특정 제품 홍보 글이므로 일반 원칙만 사용

## 6. 산업용 드라이 스크류(GXS)

- 기어는 오일 윤활, 비접촉 축 씰 + 래버린스 씰, 분당 6 L 씰 퍼지로 기어박스 보호. "no contaminated or dirty disposable oil".
  ✅ Edwards GXS 브로슈어(내부 보관본 `7.산업용드라이펌프_GXS Dry.txt`)
- GXS160: 160 m³/h, 수냉, 퍼지 가스 필수 ✅ product_master_table.csv

## 7. 확인하지 못한 것(글에 수치로 쓰지 않음)

- ⚠️ 구입 가격 비교: Edwards 원문에서 직접 확인하지 못함(검색 요약에만 "low capital cost" 언급). 글에는 수치 없이 "대체로 오일로터리가 낮다"로만 쓰고 **대표님 확인 필요**.
- ⚠️ 오일 교환 주기(3~6개월 등): 원문 직접 확인 안 함 → 미사용.
- ⚠️ 소비전력 비교: 수치 없음 → 미사용.

## 현장 사진

- `data/현장사진/06_비교도식/nXDS10i_분석장비 SEM.jpg` — 명판·표기 확대 확인: 왼쪽 Edwards RV8(본체 숫자 "8", 상단에 미스트 필터), 오른쪽 nXDS 10i("10i" 표기). 두 펌프가 나란히 놓인 장면. 교체 경위는 기록이 없어 글에 쓰지 않는다.

## 기존 글과의 관계

- id 70(의료·생명공학, 오일 유지 vs 드라이 전환)은 산업 한정 글. "GC 같은 분석 장비는 오일로터리가 표준"이라는 기존 설명과 충돌하지 않게 쓴다.
- 관련 링크: /blog/76(백스트리밍), /blog/77(미스트필터), /products/edwards-rv12, /products/edwards-nxds15i — 10/12 모두 200 확인.

---

## 참고 소스

- ✅ [8 top tips for working with oil-sealed rotary vane pumps](https://www.edwardsvacuum.com/en-uk/vacuum-pumps/knowledge/applications/working-with-oil-sealed-rotary-vane-pumps) — 오일 역할
- ✅ [RV Two Stage Rotary Vane Pumps](https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-products/oil-rotary-vane-pumps-two-stage/rv) — 수치
- ✅ [mXDS, nXDS and XDS Dry Scroll Pumps](https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-products/dry-scroll-pumps/xds) — 수치·정비
- ✅ [Wet2Dry: Scaling Up](https://www.edwardsvacuum.com/en-us/news-and-events/wet2dry-dry-vacuum-solutions) — 관리 차이
- ✅ [Why More Heat Treaters Are Moving from Wet to Dry Vacuum Pumps](https://www.edwardsvacuum.com/en-us/news-and-events/why-more-heat-treaters-are-moving-from-wet-to-dry-vacuum-pumps) — 일반 원칙
- ✅ Edwards RV·nXDS·GXS 브로슈어(내부 보관본) — 기술 데이터
