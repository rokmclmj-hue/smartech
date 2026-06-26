# 진공 열처리로·소결로의 드라이 스크류 진공펌프 선택 기준 리서치

> 리서치 기준일: 2026년 06월 23일
> 허용 소스 수: 4개 / 참고 소스 수: 0개
> 상담기록 참조: 없음

---

## 1. 진공로(Vacuum Furnace) 개요 및 필요 진공 범위

진공로는 진공 또는 저압 환경에서 금속 부품을 가열·냉각하는 공정 장비다.
산업별로 용도가 다르지만, 한국에서 주로 사용되는 진공로 유형은 아래 세 가지다.

| 공정 | 설명 | 주요 산업 |
|------|------|----------|
| 진공 열처리(Vacuum Heat Treatment) | 금속 강도·인성 개선, 표면 산화 방지 | 자동차부품, 항공우주, 금형 |
| 진공 브레이징(Vacuum Brazing) | 두 금속을 진공 중 접합 | 열교환기, 항공부품, 의료기기 |
| 진공 소결(Vacuum Sintering) | 금속 분말 압축체를 열처리로 소결 | MIM(금속사출성형), 초경합금, 세라믹 |
| 저압 침탄(LPC, Low Pressure Carburising) | 저압 분위기에서 표면 탄소 침투 | 기어, 축, 베어링 |
| 저압 질화(LPN, Low Pressure Nitriding) | 저압 질소 분위기에서 표면 경화 | 금형, 공구강 |

**진공 압력 범위 (공정별)**
- 진공 소결·브레이징·어닐링: 수 mbar ~ 10⁻² mbar 범위 ✅ [Edwards GXS 카탈로그 — p.6, Applications 표 / edwardsvacuum.com]
- GXS 단독 도달진공도: GXS160 기준 7×10⁻³ mbar, GXS250 기준 4×10⁻³ mbar ✅ [Edwards GXS 데이터시트 Technical data 표]
- GXS 콤비타입(부스터 일체형) 도달진공도: GXS160/1750 기준 7×10⁻⁴ mbar, GXS250/2600 기준 5×10⁻⁴ mbar ✅ [Edwards GXS 데이터시트 Technical data 표]
- EXS 단독 도달진공도: 1×10⁻² mbar ✅ [Edwards EXS 데이터시트 Technical Specifications 표]
- EXS 콤비타입 도달진공도: <1×10⁻³ mbar ✅ [Edwards EXS 데이터시트 Technical Specifications 표]

> 진공로 대부분의 핵심 공정은 10⁻² ~ 10⁻³ mbar 범위에서 이루어지며, 이 범위는 드라이 스크류 펌프 단독 또는 부스터 조합으로 충분히 커버된다. ✅ [Edwards GXS/EXS 데이터시트]

---

## 2. 왜 오일 로터리 펌프가 아닌 드라이 스크류 펌프인가

### 오일 로터리 펌프의 문제점 (진공로 환경에서)

진공로 공정에서 오일 로터리 펌프(예: Edwards E2M 계열)를 사용할 경우 아래 문제가 발생한다.

| 문제 | 원인 | 진공로에서의 영향 |
|------|------|-----------------|
| 오일 역류(Oil backstreaming) | 고진공 영역에서 오일 증기가 챔버 측으로 역류 | 열처리 제품 표면 오염, 품질 불량 |
| 금속 분말 흡입 | 소결·MIM 공정에서 미세 금속 파우더 발생 | 오일 오염 → 잦은 오일 교환, 펌프 손상 |
| 바인더·왁스 응축 | 탈지(debinding) 공정에서 유기물 가스 발생 | 오일과 혼합되어 펌프 내부 막힘 |
| 유지보수 부담 | 오일 교환·폐유 처리 필요 | 비용·환경 부담 증가 |

> Edwards 공식 자료: "Dry pumping is the optimum solution for harsh and challenging processes where the cleanliness of the final product is essential, and is environmentally friendly as it eliminates handling and disposal of contaminated oil." ✅ [Edwards Metallurgy 페이지 — edwardsvacuum.com/en-us/vacuum-pumps/our-markets/metallurgy]

### 드라이 스크류 펌프(GXS)의 진공로 적합성

Edwards 공식 GXS 카탈로그(p.6, Applications)에 진공로 적용 공정이 명시되어 있다.

**GXS가 공식 적용 공정으로 명시한 진공로 공정 목록** ✅ [Edwards GXS 카탈로그 p.6]
- Sintering (소결) — Metal Injection Moulding(MIM) 포함
- Vacuum Brazing (진공 브레이징)
- E-beam welding (전자빔 용접)
- Nitro carburising / Low pressure nitriding (질화 처리)
- Low pressure carburising (저압 침탄)
- Carbon vapour impregnation (탄소 증기 함침)
- Annealing (어닐링)
- Gas quenching (가스 퀀칭)
- Tempering (템퍼링)
- Precision investment casting (정밀 주조)
- Oil quenching (오일 퀀칭)
- Plasma nitriding (플라즈마 질화)

---

## 3. GXS 시리즈 핵심 스펙 (진공로 선택 기준)

모든 수치는 Edwards GXS 공식 데이터시트에서 발췌. ✅ [Edwards GXS 데이터시트 Technical data 표]

| 모델 | 배기속도 | 도달진공도(퍼지 포함) | 전부하 전력 (피크) | 냉각수 유량 | 중량 |
|------|---------|-------------------|-----------------|-----------|------|
| GXS160 | 160 m³/h | 7×10⁻³ mbar | 5.0 kW | 4.0 L/min | 305 kg |
| GXS250 | 250 m³/h | 4×10⁻³ mbar | 9.0 kW | 4.0 L/min | 305 kg |
| GXS450 | 450 m³/h | 5×10⁻³ mbar | 17.3 kW | 10 L/min | 640 kg |
| GXS750 | 740 m³/h | 3×10⁻³ mbar | 37.0 kW | 12 L/min | 640 kg |

**콤비타입(드라이+루츠 부스터 일체형) 스펙** ✅ [Edwards GXS 데이터시트 Technical data 표]

| 모델 | 피크 배기속도 | 도달진공도 |
|------|------------|----------|
| GXS160/1750 | 1,200 m³/h | 7×10⁻⁴ mbar |
| GXS250/2600 | 1,900 m³/h | 5×10⁻⁴ mbar |
| GXS450/2600 | 2,200 m³/h | 5×10⁻⁴ mbar |
| GXS450/4200 | 3,026 m³/h | 5×10⁻⁴ mbar |
| GXS750/2600 | 2,300 m³/h | 5×10⁻⁴ mbar |
| GXS750/4200 | 3,450 m³/h | 5×10⁻⁴ mbar |

---

## 4. EXS 시리즈 핵심 스펙

EXS는 GXS 동일 스크류 기술 기반에 VFD(가변주파수드라이브)를 내장한 최신 모델.
VFD 내장으로 공정 압력에 따른 속도 제어가 가능하다. ✅ [Edwards EXS 브로셔 p.2]

| 모델 | 배기속도 | 도달진공도 | 전부하 전력 (피크) | 비고 |
|------|---------|----------|-----------------|------|
| EXS160 | 160 m³/h | 1×10⁻² mbar | 5.0 kW | VFD 내장 |
| EXS250 | 250 m³/h | 1×10⁻² mbar | 9.0 kW | VFD 내장 |
| EXS450 | 450 m³/h | 1×10⁻² mbar | 17.3 kW | VFD 내장 + blow-off valve |
| EXS750 | 740 m³/h | 1×10⁻² mbar | 22.0 kW | VFD 내장 + blow-off valve |

**EXS 콤비타입**

| 모델 | 피크 배기속도 | 도달진공도 |
|------|------------|----------|
| EXS160/1750 | 1,200 m³/h | <1×10⁻³ mbar |
| EXS250/2600 | 1,900 m³/h | <1×10⁻³ mbar |
| EXS450/2600 | 2,200 m³/h | <1×10⁻³ mbar |
| EXS450/4200 | 3,026 m³/h | <1×10⁻³ mbar |
| EXS750/2600 | 2,300 m³/h | <1×10⁻³ mbar |
| EXS750/4200 | 3,450 m³/h | <1×10⁻³ mbar |
| EXS750/8000 | 5,980 m³/h | <1×10⁻³ mbar |

> EXS750/8000은 GXS 계열에 없는 모델로 EXS에만 존재. 대형 진공로(대용량 챔버)에 적합. ✅ [Edwards EXS 데이터시트]

---

## 5. 루츠 부스터(EH) 조합 여부

### 진공로에서 부스터가 필요한 경우

- 챔버 용적이 크고 펌프다운 시간 단축이 필요한 경우
- 공정 압력이 10⁻³ mbar 이하로 요구되는 경우 (예: 고진공 브레이징)
- 처리량(throughput)이 많아 빠른 사이클 타임이 필요한 경우

### 스마텍 현장 확인 조합 (GXS 단독 + EH 부스터 별도 구성)

✅ [스마텍 내부 자료 — product_combos.txt]

| GXS 드라이 단독 | EH 부스터 | EH 배기속도(50Hz) |
|----------------|----------|-----------------|
| GXS160 (160 m³/h) | EH1200 | 1,195 m³/h |
| GXS250 (250 m³/h) | EH2600 | 2,590 m³/h |
| GXS450 (450 m³/h) | EH4200 | 4,140 m³/h |

> ⚠️ 주의: "배기속도의 2~8배" 일반 공식을 GXS+EH 조합에 적용하면 잘못된 모델이 추천된다. 위 표를 기준으로 사용할 것. ✅ [스마텍 내부 자료]

> ⚠️ 주의: GXS250/2600, GXS450/2600, GXS450/4200 등 슬래시(/) 모델은 부스터가 이미 일체형으로 통합된 콤비타입 제품이다. "GXS250 + EH2600 조합"과 혼동하지 않는다. ✅ [스마텍 내부 자료]

---

## 6. 공정별 GXS 구성 권고 (Edwards 공식 자료 기반)

Edwards GXS 카탈로그(p.7)에 공정별 GXS 듀티(duty) 구성 권장표가 있다. ✅ [Edwards GXS 카탈로그 p.7]

| 공정 | GXS 구성 권장 | 주요 퍼지 구성 |
|------|-------------|-------------|
| Annealing (어닐링) | LIGHT DUTY | Shaft Seal Purge만 |
| Vacuum Brazing (진공 브레이징) | MEDIUM DUTY | SSP + 가스 밸러스트 + 입구/출구 퍼지 |
| Sintering, MIM Debinding | MEDIUM DUTY | SSP + High Vac Purge + 가스 밸러스트 |
| LPC (저압 침탄) — 프로판 사용 시 | MEDIUM DUTY+ | High Flow Purge + Solvent Flush 추가 |
| LPN (저압 질화) | MEDIUM DUTY | SSP + 가스 밸러스트 |
| EB Welding (전자빔 용접) | LIGHT DUTY | Shaft Seal Purge만 |
| Gas Quenching (가스 퀀칭) | MEDIUM DUTY | SSP + 가스 밸러스트 |
| Plasma Nitriding | MEDIUM DUTY | SSP + 가스 밸러스트 |
| Tempering (템퍼링) | LIGHT DUTY | Shaft Seal Purge만 |

> 소결·탈지(MIM Debinding) 공정은 바인더 가스 및 왁스 성분이 배기되므로 반드시 MEDIUM DUTY 이상 구성이 권장된다. ✅ [Edwards GXS 카탈로그 p.7]

---

## 7. GXS 드라이 스크류 펌프의 분말·이물질 처리 능력

진공로(특히 소결로, MIM 공정)에서는 미세 금속 분말이 챔버에서 배출될 수 있다.

- GXS는 **물 5리터 슬러그 + 고운 분말 1kg 슬러그** 동시 처리 능력을 테스트로 검증 ✅ [Edwards GXS 카탈로그 p.4]
- 비접촉식(Non-contacting) 장기 수명 씰 + 오일 차단 래비린스 씰 → 분말 유입 시 씰 손상 위험 낮음 ✅ [Edwards GXS 카탈로그 p.4]
- 비캔틸레버(Non-cantilever) 로터 지지 설계 → 분말·이물질 흡입 시에도 안정적 기동 ✅ [Edwards GXS 카탈로그 p.4]
- **입구 필터(Inlet Filter) 권장**: 소결·MIM 공정처럼 분말이 지속적으로 발생하는 환경에서는 입구 필터를 장착해 서비스 주기를 대폭 연장 가능 ✅ [Edwards GXS 카탈로그 p.13]

---

## 8. Sandvik 소결 공정 전환 사례 (Edwards 공식 케이스)

Edwards 공식 페이지에 소결로 오일 펌프 → GXS 드라이 펌프 전환 사례가 기재되어 있다.

**전환 전**: 오일 봉인 펌프 + 기계식 부스터 복수 조합 → 유지보수·오일 교환 비용·시간 과다
**전환 후**: Edwards GXS 드라이 스크류 펌프 도입

**전환 효과** (정성적, 정량 수치 Edwards 공식 페이지에 미기재):
- 풋프린트(설치 면적)·높이 감소
- 소음 감소 (소음기 장착)
- 전력 소비 감소
- 자동 압력 제어 (프로그래밍된 압력 설정값 자동 추종)

> 정량 수치(에너지 절감 %, 유지보수 비용 절감액 등)는 Edwards 공식 페이지에서 확인 불가. ✅ [Edwards 소결 공정 케이스 스터디 — edwardsvacuum.com]

---

## 9. 현장 사진 정보

- **field-1 지정 사진**: `C:\Users\rokmc\smartech\data\현장설치\20210127_110004.jpg`
- **내용**: Edwards GXS 275 드라이 스크류 펌프 실물 현장 설치 사진
- **활용 방향**: 진공로 현장 설치 대표 이미지로 사용 (블러 처리 후 업로드)

---

## 10. 한국 진공로 시장 현황

한국에서 진공로가 주로 활용되는 산업 분야:
- 자동차 부품 열처리 (기어·베어링 침탄, 어닐링)
- 항공우주 부품 브레이징·열처리
- 초경합금(절삭공구, 금형) 소결
- MIM(금속사출성형) 소결 — 스마트폰·의료기기 부품
- 이차전지 양극재 소결 (확인 불가 — 별도 리서치 필요)

> 한국 진공로 시장 규모 수치는 허용 소스에서 확인 불가. "확인 불가"로 표시.

---

## 글쓰기 방향 제안

1. **핵심 메시지**: 진공로 공정에서 오일 로터리 펌프를 계속 쓰는 것은 낭비다 — GXS/EXS 드라이 스크류 펌프로 교체하면 오일 역류 없이 깨끗한 열처리가 가능하다.
2. **독자 타깃**: 진공로를 이미 운영 중이며 오일 펌프 유지보수 비용에 고민이 있는 현장 담당자
3. **차별화 포인트**: 분말 처리 능력(5L 물 + 1kg 분말 슬러그 검증) → 소결·MIM 현장에서 특히 강점
4. **CTA**: 진공로 용량에 맞는 GXS/EXS 모델 추천 — 스마텍 기술 상담

---

## 참고 소스

- ✅ [Edwards GXS 공식 카탈로그 PDF](https://www.edwardsvacuum.com/content/dam/brands/edwards-vacuum/general-vacuum/downloads/dry-screw-pumps/edwards-GXS-dry-pumps-product-brochure.pdf) — 기술 수치 전량 인용, 공정별 구성 권장표
- ✅ [Edwards EXS 공식 브로셔 PDF](https://www.edwardsvacuum.com/content/dam/brands/edwards-vacuum/general-vacuum/downloads/dry-screw-pumps/3602117101-EXS%20Brochure-EN-Web.pdf) — EXS 기술 수치 인용
- ✅ [Edwards — How dry vacuum pumps enable an efficient sintering process](https://www.edwardsvacuum.com/en-us/vacuum-pumps/knowledge/applications/how-dry-vacuum-pumps-enable-an-efficient-sintering-process) — Sandvik 소결 사례, 드라이 펌프 장점
- ✅ [Edwards Metallurgy 페이지](https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-markets/metallurgy) — 야금 분야 공정 목록, 드라이 펌프 권장 이유
- ✅ [스마텍 내부 자료 — product_combos.txt] — GXS+EH 현장 확인 조합표
