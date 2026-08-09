# 항공우주 환경시험 챔버 드라이펌프 요건 리서치

> 리서치 기준일: 2026년 8월 8일
> 허용 소스 수: 4개 / 참고 소스 수: 1개
> 상담기록 검색 결과: `data/상담기록/` 전체에서 "우주", "위성", "로켓", "항공기", "항공우주" 키워드로 검색했으나 관련 파일 없음 → **상담기록 없음으로 진행**

---

## 1. 항공우주 환경시험 챔버란 무엇인가

TVAC(Thermal Vacuum Chamber, 열진공챔버)는 위성·발사체 부품·전자장비가 실제 우주 환경(진공 + 극한 온도)에서 정상 작동하는지 지상에서 검증하는 시험 설비다. 챔버 안에서 진공과 온도 사이클(태양열 가열 ~ 심우주 냉각)을 동시에 재현한다. ✅ [Edwards TVAC 플래닝 가이드]

- 온도 범위: -180°C ~ +150°C (냉동순환기 또는 액체질소(LN2) 시스템으로 초저온 구현) ✅ [Edwards TVAC 플래닝 가이드]
- 챔버 크기: 지름 0.3m(1ft) ~ 6m(20ft)까지 다양 ✅ [Edwards 우주시뮬레이션 캠페인 페이지]
- 도달 진공도: 저진공부터 초고진공(UHV)까지, 저궤도(LEO)·심우주 미션 요구조건에 맞춰 결정 ✅ [Edwards 우주시뮬레이션 캠페인 페이지]
- 목표 시험 규격: NASA GSFC-STD-7000, NASA-STD-7012A, NASA MSFC-SPEC-1238(열진공 베이크아웃 규격) ✅ [Edwards TVAC 플래닝 가이드 / Edwards 우주시뮬레이션 캠페인 페이지]
- UHV 영역 목표 압력: 10⁻¹⁰ mbar 이하까지 요구되는 경우도 있음 ✅ [Edwards TVAC 플래닝 가이드]

---

## 2. 드라이펌프가 필요한 이유 — 챔버 초기 배기(러핑) 단계

TVAC 시스템은 단일 펌프가 아니라 **러핑(초기 배기) 펌프 + 고진공 펌프(터보/크라이오) + UHV 유지 펌프(이온/NEG)**로 이어지는 다단 구조다. ✅ [Edwards TVAC 플래닝 가이드]

- **러핑 펌프**: 오일식/드라이 중 선택에 따라 유지보수·비용·오염 위험이 달라진다. 대형 챔버를 대기압에서 초기 배기하는 역할.
- **터보분자펌프**: 기계식 베어링형 또는 자기부상(maglev)형. 자기부상형이 신뢰성 높고 진동이 낮음.
- **크라이오펌프**: 극저온으로 가스를 흡착해 초고진공 도달.
- **이온·NEG 펌프**: 초고진공 상태를 장시간 유지.

이 중 스마텍이 취급하는 **드라이 스크류/스크롤 펌프(GXS, EXS, XDS, nXDS, nXRi)**가 담당하는 구간은 "대기압 → 러핑 완료" 단계와 "터보펌프 백킹" 단계다.

**오일프리가 필수인 이유**: 위성 부품·광학계·센서는 극미량의 오일 증기 오염에도 성능이 저하될 수 있다. 오일이 없는 드라이 스크류/스크롤 방식은 챔버 내부 오염원 자체를 없애는 구조적 장점이 있다. (일반 원리 설명 — 특정 수치 아님)

---

## 3. GXS/EXS 드라이 스크류 — 대형 챔버 초기 배기용

Edwards GXS 드라이 스크류 펌프의 공식 애플리케이션 목록에 **"Vacuum chamber evacuation — Space simulation chambers"(진공챔버 배기 — 우주 시뮬레이션 챔버)**가 명시돼 있다. ✅ [Edwards GXS 공식 제품 브로슈어]

### GXS 기술 사양 (일부 발췌)
- GXS160: 배기속도 160 m³/h, 도달진공도(퍼지 없음) 7×10⁻³ mbar ✅ [Edwards GXS 공식 제품 브로슈어]
- GXS160/1750 (콤비타입): 피크 배기속도 1200 m³/h, 도달진공도 7×10⁻⁴ mbar ✅ [Edwards GXS 공식 제품 브로슈어]
- GXS250: 배기속도 250 m³/h, 도달진공도 4×10⁻³ mbar ✅ [Edwards GXS 공식 제품 브로슈어]
- GXS250/2600 (콤비타입): 피크 배기속도 1900 m³/h, 도달진공도 5×10⁻⁴ mbar ✅ [Edwards GXS 공식 제품 브로슈어]
- GXS450/2600: 피크 배기속도 2200 m³/h / GXS450/4200: 피크 배기속도 3026 m³/h ✅ [Edwards GXS 공식 제품 브로슈어]
- GXS750/4200: 피크 배기속도 3450 m³/h (라인업 중 최대) ✅ [Edwards GXS 공식 제품 브로슈어]
- 소음: 64dB(A) 미만(750 계열은 최대 70dB(A)) ✅ [Edwards GXS 공식 제품 브로슈어]
- 윤활유: PFPE Drynert 25/6 (저증기압 오일로 진공 환경 오염 최소화) ✅ [Edwards GXS 공식 제품 브로슈어]

> **콤비타입 주의**: GXS250/2600처럼 슬래시(/)가 붙은 모델명은 이미 부스터가 통합된 일체형 제품이다. "GXS250 단독 + EH2600을 별도 연결"과 혼동하지 않는다. ✅ [블로그/knowledge/product_combos.txt]

### EH 부스터 별도 구성 시 (대형 챔버 대용량 배기가 필요할 때)
GXS 드라이 단독 + EH 부스터 조합은 스마텍 현장 확인 기준으로 아래와 같다.
- GXS160(160 m³/h) + EH1200(1195 m³/h) — 약 7.5배
- GXS250(250 m³/h) + EH2600(2590 m³/h) — 약 10배
- GXS450(450 m³/h) + EH4200(4140 m³/h) — 약 9.2배
✅ [블로그/knowledge/product_combos.txt — 스마텍 현장 확인 조합]

EXS 시리즈는 GXS와 동일한 배기속도 라인업이며 VFD(가변주파수드라이브) 내장으로 제어가 간편하다. EH 조합 기준도 GXS와 동일하게 적용한다. ✅ [블로그/knowledge/product_combos.txt]

---

## 4. nXDS/XDS 드라이 스크롤 — 소형 챔버·터보펌프 백킹용

연구용 소형 TVAC 챔버나 터보분자펌프의 백킹(backing)용으로는 스크롤 방식의 nXDS/XDS가 적합하다.

- nXDS6i: 피크 배기속도 6.2 m³/h, 도달진공도 0.020 mbar ✅ [Edwards nXDS 공식 제품 브로슈어]
- nXDS10i: 피크 배기속도 11.4 m³/h, 도달진공도 0.007 mbar ✅ [Edwards nXDS 공식 제품 브로슈어]
- nXDS15i: 피크 배기속도 15.1 m³/h, 도달진공도 0.007 mbar ✅ [Edwards nXDS 공식 제품 브로슈어]
- nXDS20i: 피크 배기속도 22.0 m³/h, 도달진공도 0.030 mbar ✅ [Edwards nXDS 공식 제품 브로슈어]
- 소음 52dB(A) — 경쟁 제품 대비 최대 20배 낮은 소음 수준 ✅ [Edwards nXDS 공식 제품 브로슈어]
- XDS35i: 피크 배기속도 35 m³/h, 도달진공도 0.01 mbar / XDS46i: 피크 배기속도 40 m³/h, 도달진공도 0.05 mbar ✅ [Edwards XDS 공식 제품 데이터시트]
- nXDS 응용분야에 "고에너지 물리 — 빔라인, 가속기, 터보펌프 백킹"이 명시돼 있어 대형 연구시설의 UHV 시스템에도 쓰인다. ✅ [Edwards nXDS 공식 제품 브로슈어]

nEXT 터보분자펌프의 공식 권장 백킹펌프로 nXDS6i(nEXT55/85), nXDS10i(nEXT240/300/400), nXRi/XDS35i/E2M28(nEXT730/930/1230)가 지정돼 있다. ✅ [Edwards nEXT 공식 제품 브로슈어]

---

## 5. nXRi — UHV·초고에너지물리 응용 명시

nXRi(다단 루츠) 드라이펌프는 공식 애플리케이션 목록에 **"Scientific research and development — UHV, High energy physics"**가 포함돼 있어, 항공우주 시험 챔버처럼 UHV 영역까지 내려가야 하는 시스템의 러핑·백킹 단에 적합하다. ✅ [Edwards nXRi 공식 제품 브로슈어]

- 배기속도 라인업: nXR30i/40i/60i/90i/120i, 30~120 m³/h ✅ [Edwards nXRi 공식 제품 브로슈어]
- 도달진공도(전압력): 0.03 mbar (전 모델 공통) ✅ [Edwards nXRi 공식 제품 브로슈어]
- 무게: nXR30/40i 27kg, nXR60/90/120i 29kg — 30kg 미만의 휴대성으로 벤치탑·소형 시험 설비에도 통합 용이 ✅ [Edwards nXRi 공식 제품 브로슈어]
- 완전 오일프리·무진동 유지보수 — 위성 부품 오염 방지에 유리 (일반 특성 서술) ✅ [Edwards nXRi 공식 제품 브로슈어]

---

## 6. 항공우주 환경시험 챔버 드라이펌프 선정 시 체크포인트

- **챔버 크기·초기 배기 시간**: 대형 챔버(수 m급)는 GXS/EXS 계열, 소형 벤치탑 챔버는 nXDS/nXRi 계열이 기본 방향. (원리 설명 — product_master_table 기준)
- **최종 목표 진공도**: 저진공~중진공까지면 드라이 스크류/스크롤 단독으로 충분하나, UHV(10⁻⁸ mbar 이하)까지 요구되면 터보펌프·크라이오펌프·이온펌프와 조합해야 한다. ✅ [Edwards TVAC 플래닝 가이드]
- **오염 민감도**: 광학계·태양전지판·센서류가 챔버 안에 있으면 오일프리 드라이 방식이 필수에 가깝다. (일반 원리)
- **소음·진동**: GXS 계열은 64dB(A) 미만으로 설계돼 있어 실험동 인접 시험 환경에 유리 ✅ [Edwards GXS 공식 제품 브로슈어]
- **NASA 규격 대응 여부는 시스템 통합사(스마텍 등)와 함께 챔버 전체 설계 단계에서 확인 필요** — 개별 펌프 데이터시트에는 NASA 규격 준수 여부가 명시되지 않음. "확인 불가"로 표시.

---

## 현장 사례 (상담기록)

- `data/상담기록/` 폴더 전체를 "우주", "위성", "로켓", "항공기", "항공우주" 키워드로 검색했으나 항공우주 산업 관련 상담 기록이 확인되지 않았다.
- 참고: "챔버" 단어가 포함된 상담기록 다수가 검색됐지만, 실제 내용은 반도체·이차전지·연구용 진공오븐 등 다른 산업의 일반적인 "챔버" 언급이며 항공우주 산업과 무관해 사용하지 않았다.
- → **이번 글은 상담기록 없이 진행.**

---

## 참고 소스

- ✅ [Edwards TVAC 플래닝 가이드](https://www.edwardsvacuum.com/en-us/vacuum-pumps/knowledge/applications/what-you-need-to-plan-your-tvac-system) — 수치·규격 인용
- ✅ [Edwards 우주시뮬레이션 캠페인 페이지](https://www.edwardsvacuum.com/en-us/campaigns/vacuum-solutions-for-space-simulation-and-research) — 수치·제품 라인업 인용
- ✅ [Edwards GXS 공식 제품 브로슈어](https://www.edwardsvacuum.com/content/dam/brands/edwards-vacuum/general-vacuum/downloads/dry-screw-pumps/edwards-GXS-dry-pumps-product-brochure.pdf) (data/Product_master_table/7.산업용드라이펌프_GXS Dry.txt) — 수치 인용
- ✅ [Edwards nXDS 공식 제품 브로슈어] (data/Product_master_table/4.스크롤펌프_소형nXDS.txt) — 수치 인용
- ✅ [Edwards XDS 공식 제품 데이터시트] (data/Product_master_table/5.스크롤펌프_중형XDS.txt) — 수치 인용
- ✅ [Edwards nXRi 공식 제품 브로슈어] (data/Product_master_table/8-1.반도체드라이_nXRi.txt) — 수치 인용
- ✅ [Edwards nEXT 터보분자펌프 공식 제품 브로슈어] (data/Product_master_table/10.nEXT 터보펌프.txt) — 백킹펌프 권장사항 인용
- ✅ [블로그/knowledge/product_combos.txt] — 스마텍 현장 확인 GXS+EH 조합 기준
- ⚠️ [Wikipedia - Thermal vacuum chamber] — 검색 결과에만 노출, 수치 미사용 (금지 소스)
