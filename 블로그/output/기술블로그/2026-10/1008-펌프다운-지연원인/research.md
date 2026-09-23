# 펌프다운 시간이 예상보다 길어지는 이유 5가지 — 리서치

> 리서치 기준일: 2026년 9월 23일
> 허용 소스 수: 3개(Edwards 2개, Leybold 2개) / 참고 소스 없음
> 스마텍 내부 상담기록·현장사진 폴더 비어 있음.

## 핵심 질문 (기존 글과 겹치지 않는 지점)
- 기존 "아웃가스"(원리) · "배기속도와 컨덕턴스"(설계 개념) · "재가동 전 점검사항"(장기정지 후 점검) 글과 겹치지 않게, 이번 글은 **"오늘 펌프다운이 평소보다 느리다"는 증상을 원인별로 진단하는 점검 순서**에 집중한다.

## 원인 1 — 가스 발라스트 밸브가 열려 있음
- Edwards는 진공펌프가 도달압력에 이르지 못하는 가장 흔한 원인으로 가스 발라스트 밸브가 열려 있는 상태를 꼽는다. ✅ "The gas ballast valve is the most common culprit when a pump fails to reach ultimate pressure. If left open, it will prevent the pump from ever reaching its ultimate pressure." [Edwards — Why Your Vacuum Pump Keeps Failing](https://www.edwardsvacuum.com/en-us/vacuum-pumps/knowledge/applications/whyyourvacuumpumpkeepsfailing-6commonmaintenancemistakes)
- 발라스트는 수증기 등을 처리할 때 일부러 여는 밸브이므로(9/24 글에서 다룸), 그 공정이 끝난 뒤에도 닫는 것을 잊으면 이후 배기 때마다 도달압력이 계속 낮아진다.

## 원인 2 — 오일 상태 저하·오염 (오일씰 펌프)
- Edwards는 정품이 아닌 오일이나 관리되지 않은 오일 상태가 펌프 과열, 산화, 내부 부식으로 이어진 사례를 설명한다. ✅ "The pump soon began to run hot, oxidation formed inside, and corrosion damaged internal components." (같은 자료)
- 진단 절차 일반: 오일 색과 오일량을 먼저 확인한다(Edwards 트러블슈팅 자료 공통 안내, 정량적 비율 수치는 확인 못 함 → 수치 없이 "가장 먼저 확인할 항목"으로만 서술).

## 원인 3 — 작은 누설 하나가 계속 부담을 준다
- Edwards는 작은 누설이 있으면 펌프가 더 세게 일해야 해서 온도가 오르고 RPM이 올라가며 에너지 소비가 늘어난다고 설명한다. ✅ "A small leak forces the pump to work harder, raising temperatures, increasing RPMs, and consuming more energy." (같은 자료)
- O링이 시간이 지나며 다공질화되거나 갈라질 수 있다는 점도 지적된다. ✅ "Over time, O-rings can become porous or cracked." (같은 자료)

## 원인 4 — 아웃가스(가상 누설)와 실제 누설을 구분하기
- Leybold는 압력 상승이 벽면에서 나오는 기체 방출(아웃가스) 때문이라면, 압력 상승 폭이 점점 줄어들어 일정한 값에서 안정된다고 설명한다. ✅ "if the pressure rise is due to gas liberation from the system walls, the rise will gradually taper off to reach a final, stable value." [Leybold — Basics of Vacuum Leak Detection](https://www.leybold.com/en-us/knowledge/vacuum-fundamentals/leak-detection/basics-of-leak-detection)
- 압력이 원래 수준으로 돌아오는 시간이 매번 일정하면 누설이 있다는 뜻이고, 이 시간이 점점 줄어들면 아웃가스(가상 누설) 감소를 뜻하지만 그렇다고 실제 누설이 없다고 단정할 수는 없다. ✅ "If this time period decreases, this indicates reduced gas liberation (outgassing) on the inside of the system (i.e. a 'virtual' leak), however, it does not exclude a leak from also being present." (같은 자료)
- 실제로는 두 현상이 동시에 일어나는 경우가 많아 완전히 분리하기 어렵다는 것이 Leybold의 설명. ✅ "In most instances both phenomena occur simultaneously, which makes separating one from the other almost impossible." (같은 자료)

## 원인 5 — 대기에 노출됐던 새 부품·시료의 표면 오염
- Edwards는 아웃가스를 줄이는 방법으로 세정·베이크아웃, 표면처리(기계연마·전해연마), 코팅을 통한 패시베이션, 건조가스 퍼지·백필을 든다. ✅ [Edwards — Four ways to reduce outgassing in vacuum systems](https://www.edwardsvacuum.com/en-us/vacuum-pumps/knowledge/applications/four-ways-to-reduce-outgassing-in-vacuum-systems)
- 적절한 세정으로 아웃가스율을 "50%에서 다섯 자릿수(10만 배)까지" 줄일 수 있다고 설명한다. ✅ "can reduce outgassing rates by anything from 50% to five orders of magnitude." (같은 자료)
- 재료 준비가 충분하지 않으면 초고진공(UHV) 도달이 어렵다는 점도 강조된다. ✅ "Proper material preparation is vital to achieve low outgassing rates and reach UHV." (같은 자료)

## 진단 순서 (research 종합, 계산이 아닌 절차 정리)
1. 발라스트 밸브가 열려 있는지 먼저 확인한다(가장 흔한 원인, Edwards).
2. 오일씰 펌프라면 오일 색·오일량을 확인한다(Edwards).
3. 배관·플랜지 연결부와 O링 상태를 점검한다(Edwards).
4. 챔버를 밀폐한 뒤 압력이 다시 오르는 속도가 매번 같은지, 점점 느려지는지 관찰해 누설과 아웃가스를 구분한다(Leybold). 두 가지가 함께 있을 수 있다는 점을 감안한다.
5. 최근에 새로 넣은 부품·시료가 있다면 세정·베이크아웃 여부를 확인한다(Edwards).

## 글에서 쓰지 않을 것
- "오일 오염 80%, 누설 15%, 마모 5%" 같은 원인 비율 수치 — 이 수치는 elitevak.com(허용 소스 아님)에서만 확인됐고 Edwards·Leybold 공식 자료에는 없음. 절대 사용 금지.
- 특정 펌프 모델의 도달압력 스펙 수치 — 이번 글은 진단 절차 글이라 모델별 스펙은 다루지 않는다.

## 참고 소스
- ✅ [Edwards — Why Your Vacuum Pump Keeps Failing: 6 Common Maintenance & Service Mistakes](https://www.edwardsvacuum.com/en-us/vacuum-pumps/knowledge/applications/whyyourvacuumpumpkeepsfailing-6commonmaintenancemistakes)
- ✅ [Edwards — Four ways to reduce outgassing in vacuum systems](https://www.edwardsvacuum.com/en-us/vacuum-pumps/knowledge/applications/four-ways-to-reduce-outgassing-in-vacuum-systems)
- ✅ [Leybold — Basics of Vacuum Leak Detection](https://www.leybold.com/en-us/knowledge/vacuum-fundamentals/leak-detection/basics-of-leak-detection)
- ⚠️ Leybold — How to calculate pump-down time (개념 참고: 챔버 부피·배기속도·가스방출량이 펌프다운 시간을 결정한다는 일반 원리만 참고, 이번 글에서 수식·수치 예시는 사용하지 않음)
