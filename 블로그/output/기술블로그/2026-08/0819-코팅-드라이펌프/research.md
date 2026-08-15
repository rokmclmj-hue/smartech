# 스마트폰 코팅 진공 공정의 드라이펌프 선택법 리서치

> 리서치 기준일: 2026년 8월 15일
> 허용 소스 수: 4개 / 참고 소스 수: 1개
> 산업군: 09. 코팅/스마트폰 (coating) / 제품 카테고리: A. 드라이펌프
> 키워드: 코팅기진공펌프 (data/keyword_map.csv 기준 월 검색량 낮음, `<10` 구간 — 사용자 제공 참고치 "월 10회" 근사)

---

## 0단계 — 내부 자료 확인 결과

### ① product_combos.txt 확인
`블로그/knowledge/product_combos.txt`에서 GXS·EXS 드라이 스크류 펌프의 적합 공정 목록에 **"코팅(Coating)"**이 명시돼 있음을 확인 ✅ [Edwards 공식 라인업 자료 기반 스마텍 내부 정리 파일].
- GXS 적용공정: 태양광, 동결건조, 살균, **코팅**, 금속, 리크검사, 챔버배기, 식품포장, 가스실린더 충전
- GXS는 Screw(다단 스크류) 방식 — iGX/iH/iXH(루츠+클로 방식)와 메커니즘이 다름. 코팅 공정에는 GXS/EXS 계열이 적합.

### ② product_master_table 원본 데이터시트 확인
`data/Product_master_table/7.산업용드라이펌프_GXS Dry.txt`, `7-1.산업용드라이_EXS.txt` (Edwards 공식 브로슈어 원문)를 직접 확인.

**GXS 데이터시트 "Applications - Coating" 항목** ✅ [Edwards GXS 공식 브로슈어]:
- Roll web coating (롤투롤 웹 코팅)
- Hard coating (CVD/DLC)
- Surface activation (표면 활성화)
- Plasma spray
- Glass coating

**EXS 데이터시트 "APPLICATIONS - Coating" 항목** ✅ [Edwards EXS 공식 브로슈어]:
- Roll web coating
- Hard coating (CVD/DLC)
- Surface activation
- Plasma spray
- Glass coating

→ 두 브로슈어 모두 코팅 공정을 공식 적용분야로 명시. 스마트폰 부품(커버글라스, 카메라 렌즈, 메탈 하우징 등)에 쓰이는 PVD/스퍼터링·CVD 하드코�팅·표면활성화(플라즈마 전처리) 공정이 이 "Coating" 분류에 해당한다.

---

## 1단계 — GXS/EXS 스펙 비교 (Edwards 공식 데이터시트 수치)

### GXS 시리즈 (드라이 단독 모델 기준)
- GXS160: 피크 배기속도 160 m³/hr, 도달진공도(퍼지 없음) 7×10⁻³ mbar ✅ [Edwards GXS 공식 데이터시트]
- GXS250: 피크 배기속도 250 m³/hr, 도달진공도 4×10⁻³ mbar ✅ [Edwards GXS 공식 데이터시트]
- GXS450: 피크 배기속도 450 m³/hr, 도달진공도 5×10⁻³ mbar ✅ [Edwards GXS 공식 데이터시트]
- GXS750: 피크 배기속도 740 m³/hr, 도달진공도 3×10⁻³ mbar ✅ [Edwards GXS 공식 데이터시트]
- 소음: 64dB(A) 미만(GXS160/250/450), GXS750은 70dB(A) 미만 ✅ [Edwards GXS 공식 데이터시트]
- 윤활유: PFPE Drynert 25/6 ✅ [Edwards GXS 공식 데이터시트]

### EXS 시리즈 (드라이 단독 모델 기준)
- EXS160: 도달진공도 1×10⁻² mbar, 피크 배기속도 160 m³/hr ✅ [Edwards EXS 공식 데이터시트]
- EXS250: 도달진공도 1×10⁻² mbar, 피크 배기속도 250 m³/hr ✅ [Edwards EXS 공식 데이터시트]
- EXS450: 도달진공도 1×10⁻² mbar, 피크 배기속도 450 m³/hr ✅ [Edwards EXS 공식 데이터시트]
- EXS는 VFD(가변주파수드라이브)를 표준 내장 — 속도 제어와 에너지 절감이 가능하고, Modbus RTU 통신을 기본 지원 ✅ [Edwards EXS 공식 데이터시트]
- EXS는 GXS와 동일한 스크류 기술 기반이지만 제어를 단순화한 모델로 소개됨(원문: "based around the same technology... focuses on simplicity and robustness") ✅ [Edwards EXS 공식 브로슈어]

### GXS vs EXS 선택 포인트 (브로슈어 서술 기반)
- GXS: 온보드 컨트롤러가 더 정교하고(자동 시작/정지, 파워세이빙, self-cleaning 옵션 등) 옵션이 다양함 ✅ [Edwards GXS 공식 브로슈어]
- EXS: VFD 내장으로 속도 가변 제어가 기본 제공되고, 설치·운용이 더 단순함 — 다양한 산업 공정에 맞춘 속도 조절이 필요할 때 유리 ✅ [Edwards EXS 공식 브로슈어]
- 두 시리즈 모두 코팅 공정을 공식 적용분야로 제시하므로, 세부 선택은 공정 조건(요구 진공도, 속도 가변 필요 여부, 기존 통신 인프라)에 따라 달라진다 — "현장 조건에 따라 스마텍에 문의"로 안내.

---

## 2단계 — 펌프+부스터 조합 규칙 적용

이 글은 스마트폰 부품 코팅(커버글라스·렌즈·하우징 표면처리) 규모를 다루므로, 대용량 조합(GXS750/8000급)보다는 GXS160~450, EXS160~450 구간이 현실적인 선택 범위다. 대면적 유리 코팅(디스플레이 유리 등 별도 산업군)과 달리 스마트폰 부품은 상대적으로 소형 챔버가 많다.

- GXS160+EH1200, GXS250+EH2600, GXS450+EH4200 조합은 스마텍 현장 확인 조합표 기준(product_combos.txt) ✅ [스마텍 현장 확인 데이터].
- 다만 이 조합은 대유량·고진공 요구 공정(예: 대면적 스퍼터링)에 적용되는 예시이며, 스마트폰 부품처럼 챔버가 작고 요구 배기속도가 낮은 공정에서는 GXS160/EXS160 드라이 단독 모델만으로도 충분한 경우가 많다 — 정확한 사양은 챔버 부피·목표 도달시간에 따라 스마텍에 문의해 확인해야 한다.
- 부스터 필요 여부를 일반 공식(2~8배)으로 임의 추천하지 않는다.

---

## 3단계 — 코팅 공정 특성 (Edwards 브로슈어 서술 기반)

- 코팅 공정은 오일 미스트나 오일 증기가 코팅막 표면에 재부착(백스트리밍)되면 불량으로 직결되는 특성이 있다 — 그래서 오일프리(드라이) 펌프가 오일 로터리펌프보다 선호되는 배경이 된다. (이 문장은 일반적으로 알려진 드라이펌프 채택 이유이며, GXS/EXS 브로슈어의 "no contaminated or dirty disposable oil"(오염되거나 지저분한 폐유가 없음) 서술과 일치 ✅ [Edwards GXS/EXS 공식 브로슈어])
- GXS/EXS는 비접촉식 장수명 씰(non-contacting long-life seals)과 씰 퍼지(seal purge) 구조로 기어박스 오염을 막고 진공 공간에 오일이 유입되지 않도록 설계됐다 ✅ [Edwards GXS/EXS 공식 브로슈어].
- GXS는 이중 지지축(non-cantilever) 설계로 미세 분말·소량의 액체 슬러그 처리 테스트를 통과했다는 서술이 있음(5리터 물 슬러그, 1kg 분말 슬러그 처리 가능) ✅ [Edwards GXS 공식 브로슈어] — 코팅 공정에서 발생할 수 있는 소량의 입자성 부산물 대응력 근거로 활용 가능.

---

## 현장 사례 (상담기록)
이번 리서치에서는 09번 산업(코팅/스마트폰)에 특정된 상담기록을 찾지 못함 — `used_consultation_records` 갱신 대상 없음. 현장 사례 섹션은 생략하고 공정 특성 설명 위주로 작성한다.

---

## 참고 소스

- ✅ [Edwards GXS Dry Screw Vacuum Pumps 공식 브로슈어] (`data/Product_master_table/7.산업용드라이펌프_GXS Dry.txt`) — 스펙·적용분야 수치 인용
- ✅ [Edwards EXS Dry Screw Vacuum Pump 공식 브로슈어] (`data/Product_master_table/7-1.산업용드라이_EXS.txt`) — 스펙·적용분야 수치 인용
- ✅ [스마텍 내부 정리 — product_combos.txt] — GXS/EXS+EH 부스터 현장 확인 조합
- ⚠️ 코팅기진공펌프 검색량(`data/keyword_map.csv`) — 참고만, 정확한 회차 수치는 CSV 원본(`<10`) 그대로 인용, 본문에 "월 10회 수준" 등 과장 없이 사용
