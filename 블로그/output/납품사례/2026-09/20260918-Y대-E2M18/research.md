# 대학 연구시설 진공오븐용 E2M18 오일로터리펌프 납품 리서치

> 리서치 기준일: 2026년 09월 20일
> 허용 소스 수: 3개(스마텍 내부 자료 1 + Edwards 공식 2) / 참고 소스 수: 0개

---

## 납품 배경 (info.txt 기반 확인된 사실)

- 납품일: 2026-09-18
- 기존 사용 모델: RV12 (오일식 로터리베인, 2단)
- 신규 구매 모델: E2M18 (오일식 로터리베인, 2단)
- 교체 사유: 기존 RV12로 진공오븐 공정을 운용하던 중 처리용량 부족 → 한 단계 상위 모델로 신규 구매·업그레이드
- 공정: 진공오븐(건조/열처리 공정)
- 납품 형태: 신품, 오일(Ultragrade 19) 2병 동봉 상태로 포장 배송 확인(사진 근거)

---

## 제품 사양 비교 — RV12 vs E2M18

✅ [스마텍 내부 Product Master Table](data/Product_master_table/product_master_table.csv)

- **RV12**: 배기속도 12 m³/h, 도달진공도 2.0×10⁻³ mbar, 오일식, Ultragrade 19 오일 사용, 수증기처리 290 g/h(가스발라스트 II), 적용 예시로 질량분석기·전자현미경·동결건조·코팅·진공오븐 기재
- **E2M18**: 배기속도 17 m³/h, 도달진공도 1.0×10⁻³ mbar, 오일식(소형 EM 계열), Ultragrade 19 오일 사용(PFPE 모델은 별도), NW25 입구·2단계 구성, 적용 예시로 터보펌프 백킹·연구실·코팅·동결건조 기재

**용량 비교**: E2M18은 RV12 대비 배기속도가 약 1.4배(12→17 m³/h), 도달진공도도 2.0×10⁻³ mbar에서 1.0×10⁻³ mbar로 더 낮은 압력까지 도달 가능 — "용량 부족" 문제(배기 시간 지연, 목표 진공도 미도달)를 해소하는 방향의 상위 모델 교체로 확인됨.

✅ [Edwards RV 시리즈 공식 제품페이지](https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-products/oil-rotary-vane-pumps-two-stage/rv) — RV 시리즈는 3~12 m³/h 범위의 2단 로터리베인 펌프로, 수증기 처리(class-leading 290 g/hr)에 강점이 있어 동결건조·추출·여과·젤건조 등 습식 공정에 적합하다고 명시. RV12가 이 시리즈 중 최상위 용량 모델임을 확인.

⚠️ E2M18 공식 데이터시트 원문 페이지는 검색 결과에서 제품 카탈로그·구매 페이지 위주로 확인되었고, 배기속도·도달진공도 수치가 페이지 본문에 직접 노출되지 않아 수치는 스마텍 내부 Product Master Table(✅)만 사용함. E2M 시리즈가 0.7~28 m³/h 범위의 오일 밀봉 2단 로터리베인 펌프임은 [Edwards E2M 시리즈 공식 페이지](https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-products/oil-rotary-vane-pumps-two-stage/e2m)에서 확인.

---

## 소모품·부속 호환

✅ [스마텍 내부 Product Master Table] — EMF20 미스트필터가 RV12·E2M18 배기부 오일포집용으로 공용 사용 가능하며, Ultragrade 19 오일도 RV·E2M18·E2M28·E1M18 등 Edwards 오일펌프 범용으로 기재됨. 오일·미스트필터 소모품 계열을 그대로 유지하며 펌프만 상위 모델로 교체 가능한 조합.

---

## 진공오븐 공정 일반 특성 (업체 특정 없이 일반화)

대학 연구시설의 진공오븐은 시료·소재의 건조, 탈가스, 열처리 공정에 사용되며 처리하는 시료의 양·챔버 크기가 늘어나면 동일 압력에 도달하는 시간이 길어지거나 목표 진공도에 도달하지 못하는 상황이 발생할 수 있다. 이 경우 배기속도가 더 큰 상위 모델의 로터리베인 펌프로 교체하는 것이 일반적인 대응 방향이며, 본 사례의 RV12→E2M18 교체도 같은 맥락으로 확인된다(내부 자료 기준 배기속도 12→17 m³/h 증가).

---

## 참고 소스

- ✅ [스마텍 내부 Product Master Table](data/Product_master_table/product_master_table.csv) — RV12·E2M18 수치 인용
- ✅ [Edwards RV 시리즈 공식 제품페이지](https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-products/oil-rotary-vane-pumps-two-stage/rv) — RV12 특성 확인
- ✅ [Edwards E2M 시리즈 공식 제품페이지](https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-products/oil-rotary-vane-pumps-two-stage/e2m) — E2M 시리즈 개요 확인
