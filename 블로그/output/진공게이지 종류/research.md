# 진공게이지 종류 리서치

> 리서치 기준일: 2026년 06월 05일
> 소스 수: 12개

---

## 진공게이지란 무엇이고 왜 필요한가

진공게이지(Vacuum Gauge)는 대기압보다 낮은 압력 환경, 즉 진공 상태의 압력을 측정하는 장비다. 반도체·디스플레이·이차전지 제조 공정, 연구소 실험 장비, 식품 포장, 우주 시뮬레이션 등 진공이 필요한 모든 산업 현장에서 사용된다.

진공펌프만으로는 현재 챔버 내 진공도가 어느 수준인지 알 수 없다. 게이지가 없으면 공정 조건을 맞출 수 없고, 장비 이상이 생겨도 감지하지 못한다. 진공게이지는 공정 압력 모니터링, 펌프 상태 진단, 공정 재현성 확보를 위한 필수 측정 수단이다.

진공의 압력 영역은 크게 네 단계로 나뉜다:
- 저진공(Rough Vacuum): 대기압 ~ 1 mbar — HVAC, 식품 포장, 흡입 시스템
- 중진공(Medium Vacuum): 1 ~ 10⁻³ mbar — 실험실 장비, 제약 공정
- 고진공(High Vacuum): 10⁻³ ~ 10⁻⁷ mbar — 반도체 제조, 연구소
- 초고진공(Ultra-High Vacuum): 10⁻⁷ ~ 10⁻¹² mbar — 우주 시뮬레이션, 입자가속기

어떤 영역의 진공을 다루느냐에 따라 게이지 종류가 달라진다.

---

## 게이지 분류: 직접 측정 vs 간접 측정

진공게이지는 측정 방식에 따라 두 가지로 나뉜다.

**직접 측정 게이지**는 압력 그 자체를 물리적으로 감지한다. 기체 종류와 무관하게 압력값을 읽을 수 있는 것이 장점이다. 커패시턴스 마노미터(정전용량식 게이지)가 대표적이다.

**간접 측정 게이지**는 압력에 따라 변하는 다른 물리량(열전도율, 이온 전류 등)을 측정해 압력을 역산한다. 피라니 게이지, 이온 게이지, 컨벡션 게이지가 여기에 해당한다. 기체 종류에 따라 읽음값이 달라질 수 있어 보정이 필요한 경우가 있다.

---

## 주요 게이지 종류별 원리, 범위, 장단점

### 1. 피라니 게이지 (Pirani Gauge)

**원리**: 가열된 필라멘트(와이어)에서 주변 기체로 빠져나가는 열량이 기체 밀도(압력)에 비례한다는 원리를 이용한다. 압력이 낮아질수록 기체 분자가 줄어 열 손실이 감소하고, 이 변화를 전기 신호로 변환해 압력을 읽는다. 브릿지 회로를 사용해 필라멘트를 약 100~150℃로 가열하는 방식이 일반적이다.

**측정 범위**: 약 10⁻⁴ ~ 1000 mbar (제품에 따라 10⁻³ ~ 10⁻⁴ mbar까지 가능)

**장점**:
- 구조가 비교적 단순하고 내구성이 좋다
- 중저진공 영역에서 가장 널리 사용되는 표준 게이지
- 응답 속도가 빠르고 연속 모니터링에 적합

**단점**:
- 기체 종류에 따라 열전도율이 다르므로 기체 조성이 바뀌면 읽음값 오차 발생
- 정확도는 일반적으로 ±15% 수준으로, 정밀 공정용으로는 한계가 있음
- 고진공 영역(10⁻⁴ mbar 이하)에서는 사용 불가

**주요 용도**: 진공펌프 상태 확인, 공정 챔버 러프-다운(대기압에서 진공 시작 구간) 모니터링, 일반 산업용 진공 시스템

---

### 2. 컨벡션 게이지 (Convection-Enhanced Pirani Gauge)

**원리**: 피라니 게이지의 변형으로, 기본 열전도 원리에 대류(Convection) 열 손실을 추가로 활용한다. 고압 환경에서는 기체가 대류를 일으켜 추가적인 열 손실이 발생하는데, 이를 측정해 대기압 근처까지 측정 범위를 확장한 것이다. 피라니 단독으로는 측정할 수 없는 고압 구간을 커버한다.

**측정 범위**: 대기압(~1000 mbar) ~ 10⁻⁴ mbar 수준 (피라니보다 상한 확장)

**장점**:
- 피라니 게이지 하나로 대기압부터 고진공 입구까지 연속 측정 가능
- 별도 대기압 게이지 없이도 전 과정을 한 게이지로 모니터링할 수 있어 비용 절감

**단점**:
- 기체 종류 의존성은 피라니와 동일하게 존재
- 정확도는 피라니 수준

**주요 용도**: 진공 시스템 시작(벤트)부터 공정 진입까지 전 구간을 단일 게이지로 커버해야 하는 경우

---

### 3. 이온 게이지 (Ionization Gauge) — 열음극형 / 냉음극형

이온 게이지는 고진공~초고진공 영역(10⁻³ mbar 이하)을 측정하기 위해 사용하는 게이지다. 기체 분자를 이온화해 발생하는 이온 전류가 압력에 비례한다는 원리를 이용한다.

#### 열음극 이온 게이지 (Hot Cathode Ion Gauge)

**원리**: 가열된 필라멘트(열음극, Hot Cathode)에서 전자를 방출해 주변 기체 분자와 충돌시켜 이온을 만든다. 생성된 양이온이 컬렉터 전극에 모이는 전류를 측정해 압력을 산출한다. Bayard-Alpert 형식이 가장 대표적이다.

**측정 범위**: 10⁻¹ ~ 10⁻¹² mbar (사용 기술에 따라 다름)

**장점**: 초고진공 영역까지 측정 가능, 측정 범위가 매우 넓음

**단점**: 필라멘트가 대기에 노출되면 즉시 끊어짐(산화), 가스 방출(Outgassing) 발생 가능, 정기적 필라멘트 교체 필요

#### 냉음극 이온 게이지 (Cold Cathode Ion Gauge / Inverted Magnetron)

**원리**: 가열 없이 고전압 방전으로 전자를 생성한다. 자기장을 이용해 전자의 이동 경로를 연장하여 이온화 효율을 높이는 방식(역 마그네트론 방식이 대표적)이다.

**측정 범위**: 10⁻² ~ 10⁻⁹ mbar 수준

**장점**:
- 필라멘트가 없어 대기 노출에 의한 단선 위험이 없음
- 교체 빈도가 낮아 유지비가 경제적
- 초고진공에서 X선 유도 오류가 없음

**단점**: 저압에서 방전이 꺼질 수 있어 기동이 필요한 경우 있음, 측정 정확도가 열음극에 비해 낮을 수 있음

**주요 용도**: 반도체 CVD/PVD 챔버, 전자빔 장비, 연구소 초고진공 시스템

---

### 4. 커패시턴스 마노미터 (Capacitance Manometer / CDG)

**원리**: 얇은 금속 다이어프램(막)에 압력이 가해지면 막이 휘고, 막과 기준 전극 사이의 정전용량(Capacitance) 변화가 생긴다. 이 변화를 전기 신호로 변환해 압력을 직접 측정한다. 기체의 종류와 무관한 절대 압력 측정이 가능하다.

**측정 범위**: 측정 상한에 따라 제품마다 다르나, 일반적으로 0.001 ~ 1000 Torr 범위의 다양한 제품군 존재

**장점**:
- 기체 종류에 무관한 절대 압력 측정 — 공정 가스가 바뀌어도 보정 불필요
- 정확도 0.1 ~ 0.5% (피라니·열전대 게이지의 5~25%와 비교해 10~50배 정확)
- 부식성 가스 환경에도 적합한 제품이 있어 반도체 공정에 최적
- 다른 게이지의 교정 기준(기준기)으로 활용될 만큼 신뢰도 높음

**단점**:
- 측정 범위가 단일 게이지로 넓지 않아, 범위별로 게이지를 별도로 갖춰야 함
- 가격이 피라니나 이온 게이지에 비해 높음
- 가열 방식(히팅 모델)은 추가 전원 및 설치 공간 필요

**주요 용도**: 반도체 CVD/ALD/에칭 공정, 공정 압력 정밀 제어, 다른 게이지의 교정 기준

---

## 진공 영역별 게이지 선택 요약

| 진공 영역 | 압력 범위 | 권장 게이지 |
|---|---|---|
| 저진공 (Rough) | 대기압 ~ 1 mbar | 컨벡션 피라니, 부르동관 |
| 중진공 (Medium) | 1 ~ 10⁻³ mbar | 피라니, 컨벡션 피라니, 커패시턴스 마노미터 |
| 고진공 (High) | 10⁻³ ~ 10⁻⁷ mbar | 이온 게이지(냉음극/열음극), 커패시턴스 마노미터 |
| 초고진공 (UHV) | 10⁻⁷ ~ 10⁻¹² mbar | 열음극 이온 게이지(Bayard-Alpert), 냉음극 이온 게이지 |

---

## 산업·용도별 선택 기준

**반도체 제조(CVD, PVD, 에칭)**: 공정 가스가 다양하고 부식성 가스가 사용되므로, 기체 독립적인 커패시턴스 마노미터가 공정 압력 제어에 주로 쓰인다. 러프-다운 구간에는 피라니 또는 컨벡션 게이지를 병용한다. 고진공 챔버에는 이온 게이지가 필요하다.

**디스플레이(OLED, LCD 증착)**: 고진공 챔버가 많고, 오염에 민감한 공정이 많아 냉음극 이온 게이지(자기장 누설이 적은 제품)가 선호된다. 분석 장비 근처에서는 외부 자기장이 영향을 주지 않는 제품 선택이 중요하다.

**이차전지(배터리) 제조**: 건조룸·드라이룸 진공 유지, 전해질 충전 공정 등에 중진공 게이지가 사용된다. 공정 특성상 피라니 또는 커패시턴스 마노미터가 적합하다.

**연구소·대학**: 초고진공이 필요한 표면 분석, 입자빔 장비에는 열음극 이온 게이지가 필수다. 범용 연구 목적으로는 와이드 레인지 게이지(피라니+이온 복합)가 편리하다.

**핵심 선택 기준 정리**:
1. 측정이 필요한 압력 범위 확인 (이 범위를 커버하는 게이지 선택)
2. 공정 기체 종류 — 기체가 바뀌거나 부식성이면 커패시턴스 마노미터 우선
3. 정확도 요구 수준 — 공정 제어용은 커패시턴스 마노미터, 일반 모니터링은 피라니
4. 분석 장비 근접 설치 여부 — 자기장 누설이 적은 이온 게이지 필요 여부 확인
5. 유지보수 빈도 및 비용 — 필라멘트 교체가 잦으면 냉음극 이온 게이지 고려

---

## Edwards 제품 라인 (APG, AIM, WRG)

Edwards는 영국 기반의 글로벌 진공 전문 기업으로, 간접 압력 측정 게이지 라인업을 통해 저진공부터 초고진공까지 커버한다.

### APG (Active Pirani Gauge) — 피라니 게이지

APG100 시리즈는 Edwards의 표준 열전도 방식 피라니 게이지다.

- **APG100-XM**: 측정 범위 10⁻⁴ ~ 1000 mbar / 부식성이 낮은 일반 공정 환경용
- **APG100-XLC**: 측정 범위 10⁻⁴ ~ 1000 mbar / 내부식성 강화 버전 (부식성 가스 환경 적합)
- 출력: 0~10V DC 아날로그 신호 (선형 출력)
- 정확도: 100 mbar 미만 구간에서 ±15% 수준
- 특징: 소형 설계, 사용자 교체 가능한 센서 튜브, 간편 설치

### AIM (Active Inverted Magnetron) — 냉음극 이온 게이지

AIM200 시리즈는 역 마그네트론(Inverted Magnetron) 방식의 냉음극 이온 게이지다.

- **측정 범위**: 1×10⁻² ~ 1×10⁻⁹ mbar
- 게이지 헤드와 컨트롤러가 하나의 컴팩트 유닛으로 통합 (별도 컨트롤러 불필요)
- 특징: 매우 낮은 외부 자기장 — 질량분석기, 전자빔 장비 등 민감한 분석 장비 근처 설치에 적합
- 개선된 방전 기동 메커니즘으로 신뢰성 향상
- 산업용(반도체, 디스플레이, 코팅 장비)부터 과학 계측 장비까지 폭넓게 적용 가능

### WRG (Wide Range Gauge) — 광범위 복합 게이지

WRG는 피라니 게이지와 역 마그네트론 이온 게이지를 하나의 포트에 내장해, 대기압부터 초고진공까지 단일 게이지로 연속 측정이 가능한 제품이다.

- **측정 범위**: 대기압(~1000 mbar) ~ 10⁻⁹ mbar — 전 범위 단일 포트 커버
- 내부에서 피라니 방식(고압 구간)과 역 마그네트론(저압 구간) 사이를 자동으로 전환(seamless switchover)
- 출력: 선형 아날로그 출력
- 특징: 특허 받은 방전 기동(striker) 메커니즘, 푸시버튼 교정 및 설정값 제어, 종합 자가진단 기능
- 제품 변형:
  - **S형**: 표준 버전
  - **SL형**: 초저 외부 자기장 — 분석 장비 근접 설치용
  - **D형**: 커넥터 사양 차이 (D-sub 9핀)
- 하나의 포트로 전 범위를 커버하므로 배관 포트를 절약하고 설치 복잡도를 낮추는 장점이 있음

---

## 참고 소스

- [피라니 게이지(Pirani Vacuum Gauge)란 뭘까요? — 인포라드](https://www.inforad.co.kr/single-post/pirani-gauge)
- [진공 게이지의 분류 — IKS PVD Technology](https://ko.iksvacuum.com/info/classifications-of-vacuum-gauges-27578444.html)
- [Indirect Pressure Measurement Gauges — Edwards Vacuum](https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-products/measurement-and-control/indirect-pressure-measurement-gauges)
- [Fundamentals of Convection-Enhanced Pirani Gauges — Digivac](https://digivac.com/fundamentals-of-convection-enhanced-pirani-gauges/)
- [Proper Selection and Use of Vacuum Gauges — Vac Aero](https://vacaero.com/information-resources/vacuum-pump-technology-education-and-training/192176-proper-selection-and-use-of-vacuum-gauges.html)
- [Pirani Gauge — Wikipedia](https://en.wikipedia.org/wiki/Pirani_gauge)
- [Capacitance Manometer Physics — MKS Instruments](https://www.mks.com/n/capacitance-manometers)
- [Capacitance Diaphragm Gauge Explained — Sens4](https://www.sens4.com/blog/vacuum-technology-2/capacitance-diaphragm-gauge-explained-4)
- [Vacuum Gauge Selection — Kurt J. Lesker Company](https://www.lesker.com/newweb/technical_info/vacuumtech/pressure_04_bestgauge.cfm)
- [Features and benefits: APG100 Active Pirani Gauge — High Vac Depot](https://highvacdepot.com/wp-content/uploads/2019/05/Edwards-APG-100-DataSheet.pdf)
- [Features and benefits: WRG Wide Range Gauge — High Vac Depot](https://highvacdepot.com/wp-content/uploads/2022/03/Edwards-WRG-Wide-range-gauge-Datasheet.pdf)
- [Vacuum Measurement Using Modern Cold Cathode Technology — Fredericks](https://www.frederickscompany.com/resources/vacuum-measurement-using-modern-cold-cathode-technology/)
