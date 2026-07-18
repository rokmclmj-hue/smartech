# 대형 과학장비 러프 진공 — 가속기·핵융합 설비 드라이펌프 요건 리서치

> 리서치 기준일: 2026년 07월 18일
> 허용 소스 수: 6개 / 참고 소스 수: 2개
> 산업군: 핵융합/가속기 (13번) / 제품 카테고리: A. 드라이펌프
> 중복 확인: 같은 산업군 기발행 글 `0704-초전도가속기-이온게이지`(진공게이지 주제)와 research.md를 대조함. 겹치는 회사 사례·제품 없음 — 해당 글은 냉음극 이온게이지(AIM200·WRG200)와 자기장 간섭 문제를 다뤘고, 이번 글은 러프 진공 드라이펌프(nXDS/XDS/GXS)를 다룸. 상담기록도 서로 다름.

---

## 0단계 — 스마텍 내부 자료 확인 결과

### product_combos.txt 확인
`블로그/knowledge/product_combos.txt`의 "Edwards 드라이펌프 전체 라인업" 섹션에 nXDS/XDS 계열이 명시돼 있다.

- **nXDS/XDS** — Mechanism: Scroll(스크롤) / 모델: nXDS6i~XDS35 / 조합: Dry only(단독 사용) / 용량: 100~550L / 적용공정: **질량분석기(GCMS/LCMS), 전자현미경(SEM/TEM), 건조기, 글로브박스, 빔라인, 가속기, 동결건조, 증류/추출/여과, 원심분리기** ✅ [블로그/knowledge/product_combos.txt — 스마텍 내부 지식 파일, Edwards 공식 라인업표 기반]

→ 빔라인·가속기가 nXDS/XDS 계열의 명시된 적용 공정으로 이미 정리돼 있음. 이번 글의 핵심 근거로 사용한다.

### product_master_table.csv 확인 (최우선 기준)
`data/Product_master_table/product_master_table.csv`에서 확인한 수치는 아래 "제품 스펙" 섹션에 정리했다. 특히 **Edwards nEXT 터보분자펌프 시리즈의 "권장 백킹펌프" 컬럼**에 nXRi·XDS35i·E2M28 등 구체적 백킹 펌프 모델이 CSV 자체에 이미 매칭돼 있어, 이 표를 1차 근거로 사용한다.

---

## 대형 과학 장비의 진공 시스템 구조 — 왜 "러프 진공"이 별도로 필요한가

가속기 빔라인·핵융합 실험 장치(토카막 등)는 최종적으로 초고진공(UHV)~극초고진공(XHV) 수준을 요구하지만, 이 압력은 터보분자펌프(TMP) 단독으로 만들어지지 않는다. TMP는 대기압에서 바로 작동하지 못하고, 입구 압력이 일정 수준(통상 수 mbar 이하)까지 내려간 뒤에야 정상 배기 성능을 낸다. 이 초기~중간 단계의 압력을 만들어주는 것이 **백킹펌프(러프 진공 펌프)**이며, 대형 과학 장비에서는 이 백킹펌프의 선정이 전체 시스템의 청정도·정비 주기·소음·설치 환경을 좌우한다.

대형 과학 장비의 러프 진공 요구는 두 층위로 나뉜다.
1. **TMP 백킹용 소형 드라이펌프** — 빔라인 각 구간, 실험 챔버 개별 포트에 설치되는 TMP를 받쳐주는 역할.
2. **대형 챔버 초기 배기용 산업용 드라이펌프** — 대형 진공 챔버(우주 시뮬레이션 챔버 등 대형 진공 용기)를 대기압에서 TMP가 작동 가능한 압력까지 끌어내리는 역할.

---

## 오일프리(드라이)가 필수인 이유

가속기·핵융합 설비의 진공 챔버는 오염에 극도로 민감하다. 오일이 챔버 쪽으로 역류하면 탄화수소가 표면에 흡착되어 초고진공 도달을 방해하고, 빔라인 광학계·검출기 표면 오염으로 이어진다. nXDS 드라이 스크롤 펌프는 **허밀틱(hermetic) 벨로우즈 실링 구조로 베어링 윤활유가 진공 공간과 완전히 격리**돼 있어 오일 없는 청정 진공 환경을 만든다. ✅ [Edwards nXDS 공식 데이터시트/브로슈어]

Pfeiffer 역시 가속기용 백킹펌프로 **불소·오일 프리(fluorine- and oil-free) 다단 루츠 펌프(ACP 시리즈)**를 제시하며, 방사선이 강한 구역(J-PARC 등)에서는 드라이 러닝 백킹펌프에 쓰이는 테프론 소재가 방사선에 취약해질 수 있다는 우려 때문에, 실링재가 필요 없는 다단 루츠 방식을 택한 사례가 있다. ✅ [Pfeiffer Vacuum 공식 — Vacuum Technology Challenges: Radiation-Resistant Pumps for Spallation Sources]

---

## 스마텍 취급 제품 스펙 — TMP 백킹용 소형 드라이 스크롤 (nXDS/XDS)

아래 수치는 모두 `data/Product_master_table/product_master_table.csv` 기준(1차 근거)이다.

- **nXDS6i**: 피크 배기속도 6.2 m³/h, 도달진공 2.0×10⁻² mbar, NW25, 노이즈 52 dB(A), 적용: 질량분석기·전자현미경·연구실·터보펌프 백킹·동결건조 ✅ [product_master_table.csv]
- **nXDS10i**: 피크 배기속도 11.4 m³/h, 도달진공 7.0×10⁻³ mbar, NW25, 터보펌프 백킹용 도달진공 최상위 모델 ✅ [product_master_table.csv]
- **nXDS15i**: 피크 배기속도 15.1 m³/h, 도달진공 7.0×10⁻³ mbar, NW25 ✅ [product_master_table.csv]
- **nXDS20i**: 피크 배기속도 22 m³/h, 도달진공 3.0×10⁻² mbar, NW25, 최대연속입력압력 50 mbar 주의 ✅ [product_master_table.csv]
- **XDS35i**: 피크 배기속도 35 m³/h, 도달진공 1.0×10⁻² mbar, NW40 입구, 허밀틱 실링, 터보펌프 백킹·연구실·분석기기 ✅ [product_master_table.csv]
- **XDS46i**: 피크 배기속도 40 m³/h, 도달진공 5.0×10⁻² mbar, NW40 입구, **1~10 mbar 구간 터보 백킹 특화** ✅ [product_master_table.csv]

Edwards 공식 nXDS 브로슈어 기준 보강 수치:
- nXDS6i/10i/15i/20i 정격 회전수 1800 rpm, 최소 스탠바이 회전수 1200 rpm, 소음 52 dB(A) (경쟁사 대비 최대 20배 낮은 수준으로 소개됨), 리크 타이트니스(정적) 1×10⁻⁶ mbar·l/s 미만 ✅ [Edwards nXDS 공식 브로슈어, Publication 3601 0088 01]
- nXDS 응용 분야 목록에 **"High energy physics — Beam lines, accelerators, mobile pump carts, turbopump backing, laser evacuation"** 이 공식 항목으로 명시돼 있다. ✅ [Edwards nXDS 공식 브로슈어, Publication 3601 0088 01]

XDS35i/46i 관련 Edwards 공식 데이터시트 보강:
- XDS46i는 **"1 mbar~10 mbar 입구 압력 구간에서 최대 배기속도를 내도록 최적화되어 터보분자펌프 백킹에 특히 적합(well suited for backing turbomolecular pumps)"** 하다고 명시됨. ✅ [Edwards XDS 공식 데이터시트, Publication 3601 0428 01]
- XDS35i/46i 리크 타이트니스 1×10⁻⁶ mbar·l/s 미만, 무게 48kg, 입구 NW40/출구 NW25 ✅ [Edwards XDS 공식 데이터시트]

---

## 스마텍 취급 제품 스펙 — 대형 챔버용 산업용 드라이 스크류(GXS)

대형 진공 챔버(예: 우주환경 모사 챔버 등 대형 진공 용기) 자체를 대기압에서 초기 배기할 때는 nXDS/XDS급으로는 배기속도가 부족하다. Edwards GXS 시리즈는 산업용 드라이 스크류 펌프로, 아래 적용 분야가 공식 브로슈어에 명시돼 있다.

- GXS 응용 분야: 금속 열처리(진공 브레이징·소결 등), 코팅, 건조(동결건조·리튬이온배터리 건조 등), **진공 챔버 배기(Vacuum chamber evacuation) — 우주환경 시뮬레이션 챔버(Space simulation chambers), 가스 회수/순환, 로드락 챔버** ✅ [Edwards GXS 공식 브로슈어, Publication 3602 100 6 01]

GXS 스펙(product_master_table.csv 기준):
- **GXS160**: 피크 배기속도 160 m³/h, 도달진공 7.0×10⁻³ mbar, ISO63 입구, 수냉, 온보드 컨트롤러 ✅ [product_master_table.csv]
- **GXS250**: 피크 배기속도 250 m³/h, 도달진공 4.0×10⁻³ mbar, ISO63 입구, 수냉 ✅ [product_master_table.csv]
- **GXS450**: 피크 배기속도 450 m³/h, 도달진공 5.0×10⁻³ mbar, ISO100 입구, 수냉 ✅ [product_master_table.csv]
- **GXS750**: 피크 배기속도 740 m³/h, 도달진공 3.0×10⁻³ mbar, ISO100 입구, 수냉 ✅ [product_master_table.csv]

GXS 윤활: 오일이 공정부(진공부)에는 닿지 않는 구조이며, 기어박스 윤활유로 PFPE Drynert 25/6(저증기압 특수 오일)을 사용한다. ✅ [product_master_table.csv / Edwards GXS 공식 브로슈어]

> **주의(product_combos.txt AI 에이전트 사용 규칙 준수)**: GXS 콤비타입(예: GXS250/2600)은 부스터가 일체형으로 통합된 별도 제품이며, "GXS250 + EH2600"처럼 별도 조합으로 표현하지 않는다. 대형 과학장비의 러프 진공(TMP 백킹, 챔버 초기 배기) 용도에서는 대부분 GXS/nXDS/XDS **단독(Dry only)** 구성이 표준이며, 이 글에서는 부스터 조합형 콤비 모델을 특정 추천하지 않는다.

---

## Edwards nEXT 터보분자펌프 — 공식 권장 백킹펌프 (실제 조합 근거)

`product_master_table.csv`의 nEXT 터보펌프 행에는 **모델별 공식 권장 백킹펌프**가 이미 매칭되어 있다. 이는 대형 과학장비에서 어떤 러프 진공 드라이펌프를 선택해야 하는지의 직접적 근거가 된다.

- **nEXT55D** (55 l/s N₂): 권장 백킹펌프 **nXDS6i** ✅ [product_master_table.csv]
- **nEXT85D** (84 l/s N₂): 권장 백킹펌프 **nXDS6i** ✅ [product_master_table.csv]
- **nEXT240D** (240 l/s N₂): 권장 백킹펌프 **RV12 또는 nXDS10i** ✅ [product_master_table.csv]
- **nEXT300D** (300 l/s N₂): 권장 백킹펌프 **RV12 또는 nXDS10i** ✅ [product_master_table.csv]
- **nEXT400D** (400 l/s N₂): 권장 백킹펌프 **RV12 또는 nXDS10i** ✅ [product_master_table.csv]
- **nEXT730D** (730 l/s N₂, 도달진공 3.5×10⁻⁹ mbar 미만): 권장 백킹펌프 **nXRi·XDS35i·E2M28** ✅ [product_master_table.csv]
- **nEXT930D** (925 l/s N₂): 권장 백킹펌프 **nXRi·XDS35i·E2M28** ✅ [product_master_table.csv]
- **nEXT1230H** (1250 l/s N₂, He·H2 고압축비 특화): 권장 백킹펌프 **nXRi·XDS35i·E2M28**, 적용공정에 **"고에너지물리"**가 명시됨 ✅ [product_master_table.csv]

→ 대형 챔버·고에너지물리 실험에 쓰이는 대용량 터보펌프(nEXT1230H 등)일수록 공식 권장 백킹펌프에 **드라이 스크롤(XDS35i)** 이 포함돼 있다는 점이, 대형 과학장비에서도 오일프리 러프 진공이 표준 선택지임을 뒷받침한다.

---

## 현장 사례 (상담기록)

**한경빈 / 막스플랑크 / 포항가속기빔라인** 관련 상담기록 4건을 확인했다. (파일: `상담_20260704_0817_...260701_131325.txt`, `...260702_091812.txt`, `상담_20260704_0818_...260703_135006.txt`, `상담_20260710_1037_...260706_134115.txt`)

- 포항가속기연구소 산하 빔라인을 운영하는 연구 그룹(포스텍 포톤사이언스 관련)이 **8인치(CF160) 터보분자펌프** 견적을 문의했다. 이전에는 4.5인치(CF63 추정) TMP를 사용한 이력이 있고, 이번에는 더 큰 사이즈가 필요해 문의한 사례다.
- 상담 과정에서 스마텍 담당자가 제시한 모델이 **Edwards nEXT730D (CF160, 730 l/s급)** 이며, 실제 상담기록 원문에서 "next 730으로 검색하시면 될 거예요", "CF가 지금 19kg... CF730D가 수소 기준 715, N2 730" 등 구체적 스펙이 언급됐다.
- 이 상담은 TMP 본체 견적이 중심이었고 백킹(러프 진공) 펌프 기종을 구체적으로 지정하는 대화는 없었다. 다만 **product_master_table.csv 기준 nEXT730D의 공식 권장 백킹펌프가 nXRi·XDS35i·E2M28**이므로, 이 현장처럼 CF160급 대형 TMP를 빔라인에 설치할 때는 XDS35i(드라이 스크롤)가 유력한 러프 진공 후보임을 연결해 서술할 수 있다. **이 연결은 스마텍 자체 판단이며, 상담 통화에서 고객이 직접 XDS35i를 요청한 것은 아니다** — 글에서는 "TMP 사양이 이 정도일 때 스마텍이 함께 검토하는 백킹펌프" 정도의 톤으로 서술하고, 고객이 확정한 사실인 것처럼 쓰지 않는다.
- 상담 중 확인된 배경 정보(수치 아닌 정황 정보, 글에 분위기 묘사로만 활용 가능):
  - 대형 TMP 계열은 납기가 3~6개월로 길다(반도체 수요로 물량 지연).
  - 국내 수리 불가 — 고장 시 해외(영국/체코 등) 발송 필요, 백업 유닛 확보가 중요.
  - 구매 방식이 경쟁입찰 등 행정 절차를 거치는 경우가 많다(연구기관 특성).
  - 고객사(연구기관)는 스펙 동등성이 확인되면 가격 경쟁력을 중요하게 본다.
- 업체 실명(막스플랑크·한경빈)은 리서치에만 사용하며, 글 본문에는 "포항 소재 가속기 빔라인 연구 그룹" 등으로 일반화해 서술한다.

> 이번 리서치에서 위 4개 파일을 실제로 읽고 내용을 반영했으므로, `블로그/knowledge/topic-tracker.json`의 `used_consultation_records`에 추가 예정.

---

## 실제 도입 사례 (Edwards 공식 — 참고 사례)

Edwards는 영국 STFC(과학기술시설위원회) 데어스베리 연구소(Daresbury Laboratory)와 러더포드 애플턴 연구소(Rutherford Appleton Laboratory), 그리고 CCFE(Culham Centre for Fusion Energy)에 **500대 이상의 nXDS/XDS 드라이 스크롤 펌프를 공급**했다. 이 펌프들은 **싱크로트론(synchrotron)과 가속기를 포함한 다양한 응용처**에 설치돼 중성자·뮤온·레이저·X선 연구 인프라를 지원한다. ✅ [Edwards 공식 뉴스 — "Edwards Supplies more than 500 Dry Scroll Vacuum Pumps to STFC and CCFE"]

선정 근거로 Edwards가 공식 제시한 내용:
- 오일프리 구조로 "독보적이고 견고한(unique, robust) 오일프리 진공 솔루션"을 제공한다는 점 ✅ [Edwards 공식 뉴스]
- 52 dB(A) 미만의 저소음으로 업계 최고 수준(best-in-class) 성능 ✅ [Edwards 공식 뉴스]
- 팁씰(tip-seal) 설계 개선으로 이전 XDS 모델 대비 팁씰 수명이 2배로 늘어남 ✅ [Edwards 공식 뉴스]
- 특수 공구가 거의 없이 현장에서 직접 정비 가능해 다운타임과 유지비용을 낮춤 ✅ [Edwards 공식 뉴스]

> CCFE(Culham Centre for Fusion Energy)는 핵융합 연구기관으로, 이 사례는 핵융합·가속기 두 영역 모두에 드라이 스크롤 펌프가 표준 러프 진공 솔루션으로 쓰이고 있음을 보여준다.

---

## 경쟁사 비교 참고 (Pfeiffer / Leybold)

- **Pfeiffer**: 가속기용 백킹펌프로 ACP 다단 루츠 펌프(불소·오일 프리, NEG 호환), HiScroll 스크롤 펌프, MVP 다이어프램 펌프, COBRA NS 드라이 스크류 펌프를 제시한다. 유럽 XFEL 빔라인에는 터보펌프·맞춤 플랜지·질량분석기·게이지를 공급해 고진공/초고진공을 유지한다고 밝히고 있다. ✅ [Pfeiffer Vacuum 공식 — Applications: Accelerators / Radiation-Resistant Pumps for Spallation Sources]
- J-PARC(일본 대형 양성자가속기시설)처럼 방사선이 강한 구역에서는, 드라이 러닝 백킹펌프에 쓰이는 테프론(불소수지) 실링재가 방사선에 취약해질 수 있다는 우려 때문에 실링재가 필요 없는 **다단 루츠 방식**을 택한 사례가 있다고 Pfeiffer가 설명한다. ✅ [Pfeiffer Vacuum 공식]
- **Leybold**: SCROLLVAC plus(오일프리 스크롤), SCREWLINE SP·LEYVAC·DRYVAC·NOVADRY(드라이 스크류) 등 오일프리 러프 진공 라인업을 보유하고 있다. 다만 이번 검색 범위에서는 Leybold 공식 자료 중 빔라인 응용을 구체적으로 명시한 페이지를 확인하지 못했다. — "확인 불가"로 표시. ⚠️ [leybold.com — 제품 라인업만 확인, 빔라인 적용 근거 문서 미확인]

---

## 선택 기준 정리

- **TMP 백킹(개별 빔라인 포트, 실험 챔버 소형 TMP)**: nXDS 시리즈(nXDS6i~20i) — 소형 TMP(nEXT55D~400D급)의 공식 권장 백킹펌프
- **대형 TMP 백킹(대형 빔라인 포트, CF160급 이상 TMP)**: XDS35i/46i — nEXT730D~1230H급 공식 권장 백킹펌프, 1~10 mbar 구간 최적화
- **대형 챔버 자체 초기 배기(우주환경 챔버·대형 진공 용기)**: GXS 시리즈(GXS160~750) — 산업용 드라이 스크류, 대용량 배기속도
- **방사선 강도가 매우 높은 구역**: 드라이 스크롤의 실링재(테프론 등) 방사선 열화 우려가 제기된 바 있어(Pfeiffer 공식 설명), 이 경우 별도의 방사선 내성 검토가 필요 — 스마텍 취급 제품 중 방사선 등급 인증 여부는 "확인 불가"이며 별도 확인 필요

---

## 참고 소스

- ✅ [스마텍 product_master_table.csv] — nXDS/XDS/GXS/nEXT 시리즈 배기속도·도달진공·권장 백킹펌프 수치 인용
- ✅ [블로그/knowledge/product_combos.txt] — nXDS/XDS 적용공정(빔라인·가속기 포함) 인용
- ✅ [Edwards nXDS 공식 브로슈어](https://www.edwardsvacuum.com) Publication 3601 0088 01 — 스펙·응용분야(고에너지물리) 인용
- ✅ [Edwards XDS 공식 데이터시트](https://www.edwardsvacuum.com) Publication 3601 0428 01 — XDS35i/46i 스펙, 터보 백킹 최적화 구간 인용
- ✅ [Edwards GXS 공식 브로슈어](https://www.edwardsvacuum.com) Publication 3602 100 6 01 — 응용분야(우주환경 챔버 등) 인용
- ✅ [Edwards 공식 뉴스 — STFC·CCFE 500대 공급 사례](https://www.edwardsvacuum.com/en-us/about-us/news-and-events/edwards-supplies-more-than-500-dry-scroll-vacuum-pumps-to-stfc-and-ccfe) — 도입 사례·선정 근거 인용
- ✅ [Pfeiffer Vacuum 공식 — Accelerators 응용 페이지](https://www.pfeiffer-vacuum.com/us/en/applications/accelerators/) — 백킹펌프 라인업 인용
- ✅ [Pfeiffer Vacuum 공식 — 방사선 내성 펌프(Spallation Sources)](https://www.pfeiffer-vacuum.com/en/solutions/applications/vacuum-technology-challenges-radiation-resistant-pumps-for-spallation-sources/) — J-PARC 사례, 다단 루츠 선택 근거 인용
- ⚠️ [leybold.com 제품 페이지] — 참고만, 빔라인 적용 구체 수치 미확인
- 스마텍 상담기록 4건 (한경빈/막스플랑크/포항가속기빔라인, 2026-07-01~07-06 녹취) — 현장 사례 서술에 활용
