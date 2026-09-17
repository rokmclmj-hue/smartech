# 항공우주 시험 설비 — 오일로터리펌프를 쓸 수 없는 이유 리서치

> 리서치 기준일: 2026년 9월 21일
> 허용 소스 수: 4개 / 참고 소스 수: 0개

---

## 1. Edwards RV 시리즈 공식 데이터시트 — 적용 산업 목록

RV 시리즈(RV3/RV5/RV8/RV12) 데이터시트의 "Applications" 항목에 명시된 산업군은 다음과 같다.
✅ [Edwards RV oil sealed rotary vane pumps 데이터시트](data/Product_master_table/1.오일펌프_소형RV.txt, Publication Number 3601 0076 01)

- Mass spectrometry — GCMS, LCMS, ICPMS, MALDI, RGA, surface science, leak detectors
- Electron microscopy — TEM, SEM, sample coaters
- Sample preparation — Gel dryers, glove boxes, rotary evaporators, centrifuges
- Research and development — Chamber evacuation, coating systems, turbomolecular pump backing
- High energy physics — Beam lines, accelerators, mobile pump carts, turbomolecular pump backing, laser evacuation
- Industrial — Glove boxes, coating systems, freeze drying, gas bottle filling/emptying, refrigeration system manufacture, degassing/curing (oil, epoxy resin)
- Chemical — Gel dryers, glove boxes, rotary evaporators, centrifuges, distillation/extraction/filtration

**핵심 확인 사항**: 이 목록에 "space simulation" 또는 "aerospace"는 포함되지 않는다.

## 2. Edwards GXS 드라이 스크류펌프 공식 데이터시트 — 적용 산업 목록 (대조군)

✅ [Edwards GXS Dry Screw Vacuum Pumps 데이터시트](data/Product_master_table/7.산업용드라이펌프_GXS Dry.txt)

"Vacuum chamber evacuation" 카테고리에 아래 3개 항목이 명시돼 있다.
- Space simulation chambers
- Gas recovery/circulation
- Load lock chambers

**대조**: 같은 Edwards 제조사 공식 문서 기준으로, GXS(드라이 스크류)는 "Space simulation chambers"를 명시적 적용 분야로 표기하지만 RV(오일 로터리베인)는 그렇지 않다. 이는 [[project_blog_pipeline]] 기존 글 `0810-항공우주-드라이펌프`에서 GXS를 항공우주 챔버 배기용으로 소개한 근거와 동일 출처다.

## 3. 오일 역류(Backstreaming)·오염 메커니즘

✅ [Edwards "8 top tips for working with oil-sealed rotary vane pumps"](https://www.edwardsvacuum.com/en-uk/vacuum-pumps/knowledge/applications/working-with-oil-sealed-rotary-vane-pumps)

- Suck-back(역류) 조건: "All-metal valves are susceptible to 'suck-back' if the pump stops under vacuum with oil leaking past the valve and being 'sucked' back through the pump and into the vacuum chamber." — 펌프가 진공 상태에서 정지하면 밸브를 통해 오일이 챔버 쪽으로 역류할 수 있다는 것이 Edwards 공식 설명.
- 방지책: "An effective exhaust valve is essential in avoiding/reducing oil losses" — 배기밸브 설계가 오일 손실·역류 방지의 핵심.
- 응축수 오염: 펌프를 차가운 상태에서 기동하면 "condensates (e.g. water vapour) to collect in the oil" — 수증기 응축물이 오일에 섞여 오일 자체가 오염원이 될 수 있음.
- 오일미스트 필터: "An oil mist filter will capture this expelled oil" — 가스발라스트로 배출되는 오일 미스트는 별도 필터로 포집해야 대기·주변 오염을 줄일 수 있음.
- 가스발라스트로 수증기 배출 시 소요시간: "Depending on contamination levels, gas ballasting may take several hours to achieve" (오염 제거까지 수 시간 소요 가능).
- 점검 지표: "Any change of colour (particularly a darkening) will indicate an unacceptably high level of degradation, contamination and/or condensate" — 오일 변색은 오염·열화 지표.

**해석 (원문 대조 필요 조건)**: 위 내용은 오일로터리펌프의 정상 유지보수 항목이지, 항공우주 시험 전용 규정은 아니다. "오일로터리펌프는 무조건 위험하다"가 아니라, **역류·미스트 형태로 오일 성분이 챔버 쪽으로 이동할 수 있는 구조적 경로가 존재하며, 이를 막으려면 배기밸브·미스트필터·정기 오일 점검이 필요하다**는 것이 공식 문서가 실제로 말하는 범위다.

## 4. 오일프리 대안 — Edwards 드라이 스크롤펌프 공식 설명

✅ [Edwards mXDS/nXDS/XDS Dry Scroll Pumps](https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-products/dry-scroll-pumps/xds)

- "Dry scroll pumps are an excellent alternative to rotary vane pumps where oil free pumping is desirable." — Edwards가 공식적으로 "오일프리가 필요한 상황에서는 드라이 스크롤펌프가 로터리베인펌프의 대안"이라고 명시.

## 5. 항공우주 시험 챔버(TVAC) 일반 조건 — 기존 원고 재확인용 (신규 인용 아님)

기존 발행글 `0824-우주진공챔버`에서 이미 검증·인용한 내용이므로 이번 글에서는 동일 수치를 반복 인용하지 않고, 다른 관점(오일 오염 경로)으로 접근한다. 참고로 해당 글은 NASA GSFC-STD-7000·MSFC-SPEC-1238 등 열진공 시험 규격과 ASTM E595(outgassing 기준, TML 1.0%·CVCM 0.10%)를 이미 다뤘다.

## 6. 폴린트랩(Foreline trap) — 오일펌프를 부분적으로 병행할 때의 보조 수단

✅ [Edwards RV oil sealed rotary vane pumps 데이터시트 — Ordering information](data/Product_master_table/1.오일펌프_소형RV.txt, Publication Number 3601 0076 01)

- RV 시리즈 공식 주문 정보의 "Inlet accessories" 항목에 "Foreline trap - FL20K" (주문번호 A13305000)이 별도 부속품으로 등재돼 있다.
- 데이터시트 원문에는 FL20K의 상세 포집 원리(흡착제 종류 등)까지는 기재돼 있지 않다. 다만 "Inlet accessories"로 분류돼 있다는 것은 **펌프 흡입구(진공 공간 쪽) 앞단에 설치해 역류 경로를 한 번 더 차단하는 부속품**이라는 의미이며, RV 펌프 자체의 배기밸브·오일미스트필터와는 별개의 추가 방어층이다.
- **해석 (확인 조건)**: FL20K가 항공우주 인증 시험에 사용 가능하다는 근거는 확인하지 못했다. "폴린트랩을 달면 항공우주 챔버에도 오일펌프를 쓸 수 있다"는 결론은 내리지 않는다. 다만 비진공 보조 설비·예비 배기 등 오염에 상대적으로 덜 민감한 용도에서 오일펌프를 유지해야 하는 경우, 역류 방지 옵션이 공식적으로 존재한다는 사실만 기록한다.

## 7. 스마텍 내부 자료 확인 결과

- `data/상담기록/`: "항공우주", "우주", "TVAC" 키워드로 검색했으나 관련 상담기록 없음. 현장 사례 섹션은 작성하지 않는다.
- `블로그/knowledge/product_combos.txt`: 이번 글은 펌프+부스터 조합을 추천하는 글이 아니므로(RV 단독 펌프의 적용 한계를 다루는 글) 해당 없음.
- `data/Product_master_table/product_master_table.csv`: RV3/RV5/RV8/RV12 배기속도·도달진공도 수치는 위 1번 데이터시트 원문과 동일(별도 충돌 없음).

## 확인 불가 항목

- "항공우주 업계에서 오일로터리펌프를 실제로 몇 % 사용하는가/안 쓰는가" 같은 업계 통계는 허용 소스에서 확인되지 않아 사용하지 않는다.
- NASA TVAC 규격 문서가 펌프 종류(오일 vs 드라이)를 직접 지정하는지 여부는 이번 리서치에서 원문 접근 실패(인증서 오류)로 확인하지 못했다. "NASA가 오일펌프를 금지한다"는 식의 단정적 서술은 하지 않는다.

---

## 참고 소스

- ✅ [Edwards RV 데이터시트](data/Product_master_table/1.오일펌프_소형RV.txt) — 적용 산업 목록, 기술 사양 인용
- ✅ [Edwards GXS 데이터시트](data/Product_master_table/7.산업용드라이펌프_GXS Dry.txt) — 대조 인용
- ✅ [Edwards 8 top tips](https://www.edwardsvacuum.com/en-uk/vacuum-pumps/knowledge/applications/working-with-oil-sealed-rotary-vane-pumps) — 오일 역류·오염 메커니즘 인용
- ✅ [Edwards Dry Scroll Pumps 제품 페이지](https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-products/dry-scroll-pumps/xds) — 오일프리 대안 명시
