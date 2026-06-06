# 가스 발라스트 리서치

> 리서치 기준일: 2026년 6월 3일
> 소스 수: 9개

---

## 가스 발라스트란 무엇인가

가스 발라스트(Gas Ballast)는 오일 실드 로터리 베인 펌프(oil-sealed rotary vane pump)의 압축 챔버 안으로 소량의 건조한 기체(공기 또는 불활성 기체)를 제어하여 주입하는 기능이다.

작동 원리는 다음과 같다. 로터리 베인 펌프가 기체를 압축할 때, 응축성 증기(수분, 용제 등)가 압력이 올라가면서 액체로 변할 수 있다. 가스 발라스트 밸브를 열면, 압축이 시작되기 전에 소량의 기체가 챔버에 추가로 유입된다. 이렇게 되면 혼합 기체의 전체 압력이 대기압에 가깝게 유지되어, 증기가 응축점에 도달하기 전에 배기구 밖으로 밀려 나가게 된다. 결과적으로 수분이나 용제 증기가 펌프 내부에서 액체로 변하지 않고 그대로 배출된다.

(출처: Leybold, Edwards Vacuum, EVP Vacuum, VACUUBRAND)

---

## 언제 열어야 하는가

### 수분/응축성 증기를 다룰 때

- 수분이 많은 공정(건조 공정, 챔버 베이킹 후 진공 뽑기 등)을 시작할 때 반드시 열어야 한다.
- 용제(솔벤트), 고온 공정에서 나오는 증기 등 응축성 기체를 배출할 때 사용한다.
- 가스 발라스트를 열지 않으면, 이들 증기가 펌프 오일에 섞여 에멀젼(emulsion, 물과 기름이 뒤섞인 상태)을 형성한다. 이 상태의 오일은 윤활 능력을 잃고, 심하면 펌프가 고착(seize)될 수 있다.

### 운전 전 예열(워밍업) 절차

- 가스 발라스트를 열고 **30분 이상 공회전**시켜 펌프를 워밍업한 뒤 공정을 시작하도록 권장된다.
- 펌프 내부 온도가 100°C 이상이 되어야 수분이 효과적으로 증기 상태로 배출된다.

### 공정 종료 후 오일 정화(퍼지) 절차

- 공정이 끝난 뒤 펌프를 끄기 전에, 가스 발라스트를 열고 잠시 더 공회전시켜 오일 안에 남은 응축수를 제거하는 것이 권장된다.
- 이 절차는 오일 오염과 펌프 부식을 예방하는 데 효과적이다.

(출처: Edwards Vacuum, Leybold, VacAero, VACUUBRAND)

---

## 언제 닫아야 하는가

- **고진공(high vacuum)이 필요한 시점**에는 닫아야 한다. 가스 발라스트를 열면 공기가 계속 유입되므로, 도달 가능한 최저 압력(ultimate pressure)이 올라간다.
- 수분이나 증기가 충분히 배출된 이후 — 일반적으로 시스템 압력이 **1~2 Torr 이하**로 내려갔을 때 — 닫으면 펌프가 최저 도달 압력에 가까워진다.
- 공정상 응축성 기체가 없는 상태에서 순수하게 불활성 기체나 건조한 기체만 다룰 때는 닫은 상태로 운전한다.

요약: "수분·증기가 남아 있을 때 → 열어서 배출 → 증기가 사라지면 → 닫아서 고진공 달성"

(출처: Gizmo Cleaning, ProVac, COOLINK/HvacOLink, Edwards Vacuum)

---

## 에드워드(Edwards) 펌프 기준 포지션 설명

에드워드 로터리 베인 펌프(RV 시리즈, E2M 시리즈 등)의 가스 발라스트 밸브는 **0, I(1), II(2)** 세 가지 포지션을 가진다.

| 포지션 | 의미 | 유량 |
|--------|------|------|
| 0 | 완전 닫힘 (Closed) | 0 (유입 없음) |
| I | 저유량 개방 (Low Flow) | 기존 E2M 시리즈 기준 유량과 동일한 수준 |
| II | 고유량 개방 (High Flow) | 포지션 I의 약 2배 — 더 많은 응축성 증기 처리 가능 |

- 포지션 0: 고진공이 필요하거나 건조한 기체만 다룰 때. 펌프 종료 직전에도 이 포지션으로 닫고 종료한다.
- 포지션 I: 수분·증기가 적당량 있을 때. 일반적인 수분 처리에 사용.
- 포지션 II: 수분·증기가 많을 때, 또는 초기 공회전(워밍업) 시 최대 퍼지가 필요할 때.

가스 발라스트를 열고 운전할 경우, 펌프 출구에 오일 미스트 필터(oil mist filter)를 장착하는 것이 권장된다.

(출처: Edwards Vacuum 공식 애플리케이션 노트, Edwards RV 시리즈 매뉴얼, IdealVac)

---

## N2(질소) 가스 발라스트 어댑터와의 차이

일반 가스 발라스트 밸브는 **대기 중 공기**를 유입시킨다. 반면 **N2 가스 발라스트 어댑터**는 가스 발라스트 노브를 제거하고 그 자리에 질소(N₂) 공급 라인을 연결하여, 공기 대신 질소가 유입되도록 한다.

차이점:
- 공기 유입 방식: 대기 중 산소가 함께 들어가므로, 용제(솔벤트) 등 가연성 기체와 함께 쓰면 폭발 위험이 있다.
- N2 어댑터 방식: 불활성 기체인 질소만 유입되어 산소 유입을 차단한다. 반도체·화학 공정 등 폭발·오염에 민감한 환경에서 표준으로 사용된다.
- N2 어댑터 내부에는 오리피스(orifice, 작은 구멍)가 있어 공급 압력이 아무리 높아도 일정량의 질소만 유입되도록 설계되어 있다. 에드워드 기준 권장 공급 압력은 약 0.5 bar.
- 반도체 장비 제조사(Matheson, Merck, Air Products, Entegris 등)에서 이 어댑터를 표준 사용한다.

(출처: VACUUBRAND, Leybold, Edwards Vacuum 애플리케이션 노트, 상담기록)

---

## 현장에서 자주 하는 실수

1. **가스 발라스트를 장시간 열어 두기**: 열어 두면 펌프 온도가 정상보다 높아지고(약 10°C 이상 상승), 오일이 과열·열화(burn)될 수 있다. 증기가 충분히 배출된 후에는 닫아야 한다.
2. **펌프가 충분히 워밍업되기 전에 공정 시작**: 내부 온도가 100°C 미만인 상태에서 수분을 배출하면, 증기가 제대로 배기되지 않고 오일에 녹아들 수 있다.
3. **오일 오염을 모르고 계속 운전**: 오일이 에멀젼 상태가 되면 색이 뿌옇고 거품이 생긴다. 이 상태에서 계속 운전하면 윤활 불량으로 펌프가 손상된다.
4. **N2 어댑터를 공기 유입 방식 가스 발라스트로 혼동**: N2 어댑터는 잠긴 상태(포지션 0)에서 가운데 구멍으로 질소를 공급한다. 이 상태에서 밸브를 돌려 열면 질소와 함께 공기까지 유입되어 진공 누설이 발생한다.
5. **고진공이 필요한 상황에서 발라스트를 열어 두기**: 가스 발라스트가 열린 상태에서는 최저 압력에 도달하지 못한다.

(출처: VacAero, Leybold, Gizmo Cleaning, 상담기록)

---

## 현장 사례 (상담기록 기반)

아래는 2026년 6월 2일 실제 상담 통화에서 확인된 현장 사례이다.

### 사례 1 — 가스 발라스트 포지션 개념 혼동 (와이지엔지니어링 납품 현장)

에드워드 펌프(모델 미상, 상담 문맥상 RV 계열 또는 IH 시리즈)를 납품하면서 가스 발라스트 설치 및 사용법을 현장에서 직접 설명해 준 사례. 고객사 이사가 가스 발라스트 포지션 0·1·2의 의미를 명확히 이해하지 못한 상태였다.

- 고객 표현: "발라스트 위치에 따른 유량 매뉴얼 표기량이 뭔지 모르겠다", "N2 유량을 가스 발라스트 유량으로 잘못 줬다"
- 문제: N2 가스 발라스트 어댑터를 공급했는데, 고객이 이를 일반 가스 발라스트(0·1·2 회전)와 동일하게 인식하여 혼동이 발생했다.
- 현장 설명 내용: "N2 어댑터는 꽉 잠긴 상태에서 가운데 구멍으로 N2가 들어간다. 만약 포지션 1이나 2로 돌리면, 공기도 같이 들어가서 진공 누설이 난다."
- 고객사가 건설사에 유틸리티 조건을 제출해야 하는 상황에서, 가스 발라스트 유량 수치를 N2 유량으로 잘못 기재하는 오류가 발생했다. 에드워드 본사에 문의했을 때 "어댑터 유량은 별도로 규정되지 않는다"고 답변을 받은 사례.

### 사례 2 — N2 퍼지 목적 구분 미흡 (같은 현장)

- 고객 표현: "가스 발라스트는 N2 희석 용도가 아니냐"
- 실제 설명: 일반 가스 발라스트(공기 유입)는 수분·오염물을 배출하는 용도이고, N2 퍼지는 공기(산소) 대신 불활성 기체를 유입해 희석·안전을 확보하는 별개의 목적이다. 두 기능이 동일한 포트를 쓰더라도 목적과 방식이 다르다.

### 사례 3 — 수분·고온 공정에서 N2 없이 운전하는 현장 (강구성TheV 상담)

- 180°C 고온 챔버에서 잔류 수분을 배출하는 드라이 펌핑 공정에서, 카샤마(Kashiyama) 1220-1 펌프를 N2 없이 물(워터 쿨링)만 연결하여 운전하고 있었다.
- 상담 결과: N2 유입이 없는 환경에서는 에드워드 IGX 또는 IH 시리즈처럼 N2 센서가 없는 드라이 펌프 계열을 고려하는 방향으로 논의.
- 수분 배출과 고진공 달성이 동시에 요구되는 공정에서, 가스 발라스트 또는 N2 퍼지 구성을 갖추지 않으면 펌프 오염과 성능 저하가 발생할 수 있다는 것을 보여주는 사례.

---

## 참고 소스

- [What is a gas ballast and how does it work — Leybold USA](https://www.leybold.com/en-us/knowledge/vacuum-fundamentals/vacuum-generation/how-does-a-gas-ballast-work)
- [Why gas ballast is important on oil sealed rotary vane pumps — Edwards Vacuum](https://www.edwardsvacuum.com/en-us/vacuum-pumps/knowledge/applications/why-gas-ballast-is-important-on-oil-sealed-rotary-vane-pumps)
- [The Gas Ballast on a Oil-sealed Rotary Vane Pump — Edwards Vacuum (Application Note PDF)](https://www.edwardsvacuum.com/content/dam/brands/edwards-vacuum/general-vacuum/gated-downloads/application-notes/3601-2054-01_The-Gas-Ballast-on-a-Oil-sealed-Rotary-Vane-Pump.pdf)
- [Gas Ballasting of Mechanical Oil Sealed Rotary Vacuum Pumps — VacAero](https://vacaero.com/information-resources/vacuum-pump-technology-education-and-training/666-gas-ballasting-of-mechanical-oil-sealed-rotary-vacuum-pumps.html)
- [How to Use the Gas Ballast Valve — COOLINK/HvacOLink](https://hvacolink.com/gas-ballast-valve/)
- [Clean, durable pump – Thanks to gas ballast — VACUUBRAND](https://www.vacuubrand.com/news/all-blog-posts/gas-ballast-as-a-simple-solution-against-condensate)
- [Gas Ballasting — What Is It & Why Is It Important? — ProVac](https://www.provac.com/blogs/news/gas-ballasting)
- [Mastering Your Vacuum Pump: When to Close the Gas Ballast — Gizmo Cleaning](https://gizmocleaning.com/when-to-close-gas-ballast-on-vacuum-pump/)
- [Rotary Vane Pumps and Gas Ballast Explained — BVV](https://shopbvv.com/blogs/bvv-resources/rotary-vane-pumps-and-gas-ballast-explained)
