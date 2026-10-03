# 시험연구기관 GC-MS용 RV3 오일로터리펌프 + EMF10 납품 리서치

> 리서치 기준일: 2026년 10월 03일
> 허용 소스 수: 2개(스마텍 내부 Product Master Table + Edwards 공식 1) / 참고 소스 수: 0개

---

## 납품 배경 (info.txt·대표님 확인 사실)

- 납품일: 2026-09-30
- 납품처: 시험연구기관(실명·이니셜·지역은 본문 기재 금지 — 10/3 대표님 확인)
- 장비: GC-MS(가스크로마토그래프 질량분석기)
- 기존 사용 모델: 타사 소형 2단 오일 로터리 펌프 (브랜드·모델명·용량 수치는 본문 기재 안 함 — 타사 제품 비교 다툼 방지, 용량 수치 미검증)
- 교체 사유: 기존 펌프의 오일 리크(누유) 발생 → 내구성을 이유로 Edwards RV3로 모델 변경 (대표님 확인)
- 납품 구성: RV3 1대 + EMF10 오일 미스트필터 (함께 납품 — 대표님 확인)
- 설치 상태(사진 근거): 실험대 아래 바닥 설치, RV3 배기구에 EMF10 장착, EMF10 출구에 배기 호스 연결, 신품 포장 상자 확인

---

## 제품 사양

✅ [스마텍 내부 Product Master Table](data/Product_master_table/product_master_table.csv)

- **RV3**: 제품군 오일식 로터리베인(소형), 배기속도 3.3 m³/h, 도달진공도 2.0×10⁻³ mbar, 권장오일 Ultragrade 19, 백킹펌프 불필요, 주요응용분야에 질량분석기·전자현미경·동결건조·코팅·진공오븐 기재, 비고: 가스발라스트 2단계 / PFPE 준비 모델 별도 주문 가능 / 산소농도 21% 초과 시 Fomblin(PFPE) 오일 필수
- **EMF10**: 소모품(미스트필터), RV3~RV8 배기 오일포집용, NW25, 정격유량 12 m³/h

✅ [Edwards RV 시리즈 공식 제품페이지](https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-products/oil-rotary-vane-pumps-two-stage/rv) (2026-10-03 확인)

- RV 시리즈 배기속도 범위 3~12 m³/h
- "built in anti-suck back protection prevents oil mist entering your system. The rapid closing inlet valve acts within 0.4 seconds" — 내장 역류 방지(흡입 밸브 0.4초 이내 닫힘)로 오일 미스트가 장비 쪽으로 들어가는 것을 막음
- "O-ring sealed sight glass" — O-링으로 밀봉된 오일 게이지 창으로 오일 양·상태 육안 확인
- "mode selector and 2 position gas ballast" — 모드 선택 + 2단 가스발라스트
- 적용 분야: analytical instruments, laboratory bench work, turbomolecular pump backing, freeze drying, R&D

⚠️ 페이지에 RV3 단독 수치(입구 플랜지 등)는 직접 노출되지 않음 → 수치는 Product Master Table만 사용.
⚠️ "RV3는 누유가 없다/적다" 같은 내구성 비교 근거는 확인 못 함 → 본문에 비교·보장 표현 쓰지 않음. 교체 사유는 고객 판단 사실로만 서술.

---

## 글에 반영할 판단 기준 (일반 점검 항목, 수치 없음)

- 누유가 보이면 위치부터 기록(오일 게이지 창 주변, 배수 플러그, 축 쪽, 배기구 주변)하고 오일 양이 기준선을 넘지 않았는지 확인
- 배기구 주변 오일 흔적은 누유가 아니라 배기 오일 미스트일 수 있어 미스트필터 유무 확인
- 실내 실험실에 설치되는 분석장비용 펌프는 배기 처리(미스트필터 + 배기 호스) 구성을 함께 검토
