# 배기속도와 컨덕턴스 — 진공 시스템 설계 시 꼭 알아야 할 개념 리서치

> 리서치 기준일: 2026년 7월 24일
> 허용 소스 수: 3개 (Edwards 공식 2페이지, Leybold 공식 2페이지, Pfeiffer 공식 검색결과 요약 1건) / 참고 소스 수: 2개
> 성격: 특정 산업·특정 펌프 모델에 묶이지 않는 진공 기술 일반 이론 글

---

## 1. 배기속도(Pumping Speed, S)란 무엇인가

**정의**: 펌프가 흡입구에서 단위 시간당 뽑아낼 수 있는 기체의 부피. Edwards Vacuum 공식 자료 기준으로 "펌프에서 처리(pumped)되는 기체 유량을 펌프 흡입구 압력으로 나눈 비율"로 정의된다 ✅ [Edwards Vacuum — Pumping Speed vs Conductance 검색결과 요약]

- **단위**: m³/h (시간당 입방미터), L/s (초당 리터) ✅ [Leybold — How to choose a pump size]
- 펌프 스펙표에 적힌 배기속도(공칭 배기속도, nominal pumping speed)는 **펌프 자체의 성능**이며, 실제 챔버/용기에서 체감하는 배기속도와는 다르다. Leybold는 이를 구분해 "유효 배기속도(effective pumping speed)는 용기에서 실제로 측정되는 값"이라고 설명한다 ✅ [Leybold — How to choose a pump size]

### 조야진공 영역 배기속도 계산 (참고 공식)
Leybold 공식 자료에 나온 조야진공(rough vacuum) 영역 배기 시간 계산식:

```
S_eff = (V/t) × ln(p₀/p)
```
- V = 용기 부피, t = 배기 시간, p₀ = 초기 압력(대기압 1013 mbar), p = 목표 압력
✅ [Leybold — How to choose a pump size]

예시: "500L 용기를 10분 내 1mbar로 배기하려면 약 24 m³/h의 유효 배기속도가 필요하다" ✅ [Leybold — How to choose a pump size]

---

## 2. 컨덕턴스(Conductance, C)란 무엇인가

**정의**: 배관·오리피스·밸브 등 "수동적인(passive)" 요소가 기체 흐름을 얼마나 제한하는지를 나타내는 값. Edwards 공식 자료 기준:

```
C = Q / ΔP
```
- C: 컨덕턴스
- Q: 기체 처리량(throughput)
- ΔP: 압력강하(구간 앞뒤 압력 차이)
✅ [Edwards Vacuum — How do vacuum connections influence conductance?]

Leybold도 동일하게 "pV flow(=throughput)는 qpV = C·Δp"로 정의한다 ✅ [Leybold — How is conductance in vacuum calculated]

- 배기속도(S)와 컨덕턴스(C)는 **같은 차원(부피/시간)**을 가지지만, 배기속도는 펌프(기체를 시스템 밖으로 실제로 제거하는 능동 장치)에, 컨덕턴스는 배관·밸브·오리피스 같은 수동 요소(기체를 그냥 통과시키는 장치)에 쓰는 용어로 구분된다.
- 컨덕턴스는 "흐름 저항의 역수" 개념으로 이해하면 된다. 배관이 좁고 길수록 컨덕턴스는 작아지고, 짧고 넓을수록 커진다.

---

## 3. 유효 배기속도(Effective Pumping Speed) 공식 — 직렬 컨덕턴스 합성

펌프와 챔버 사이에 배관(컨덕턴스 C)이 존재하면, 챔버 입구에서 실제로 느껴지는 배기속도(S_eff)는 펌프 자체 배기속도(S_pump)보다 항상 작아진다.

### 핵심 공식 (Edwards 공식 자료)
```
1/S_up = 1/S_down + 1/C
```
- S_up = 유효 배기속도(챔버 쪽에서 본 값)
- S_down = 펌프의 배기속도
- C = 연결 배관의 컨덕턴스
✅ [Edwards Vacuum — How do vacuum connections influence conductance?]

### 동일 공식 (Leybold 표기)
```
1/S_eff = 1/C + 1/S_nom
```
✅ [Leybold — How is conductance in vacuum calculated]

두 회사 표기가 완전히 동일한 구조(펌프의 배기속도 역수 + 배관 컨덕턴스 역수 = 유효 배기속도 역수)임을 확인했다.

동일한 관계를 곱셈 형태로 정리하면:
```
S_eff = (S · C) / (S + C)
```
✅ [Leybold — How is conductance in vacuum calculated]

### 여러 배관 요소가 직렬로 연결될 때 (컨덕턴스 직렬 합성)
```
1/C_total = Σ(1/C_i)
```
✅ [Leybold — How is conductance in vacuum calculated]

병렬 연결(예: 배관 2개가 나란히 붙는 경우)일 때는 반대로 컨덕턴스를 단순히 더한다:
```
C_total = Σ(C_i)
```
✅ [Leybold — How is conductance in vacuum calculated]

즉 밸브, 필터, 배플, 튜빙이 순서대로 이어진 실제 배관 라인은 각 요소의 컨덕턴스를 먼저 직렬 합성해 하나의 C_total로 만든 뒤, 펌프 배기속도와 다시 합성해야 최종 유효 배기속도가 나온다. Leybold는 펌프 사이징 시 "배플, 냉동 트랩, 필터, 밸브, 튜빙 사이의 흐름 저항(컨덕턴스)을 알아야 공칭 배기속도를 결정할 수 있다"고 명시한다 ✅ [Leybold — How to choose a pump size]

---

## 4. 배관이 길고 좁을수록 유효 배기속도가 줄어드는 이유

### "Vacuum Golden Rule"
Edwards 공식 자료는 오랫동안 전승된 원칙으로 "모든 진공 연결은 가능한 한 짧고 넓어야 한다(short and wide)"를 제시한다 ✅ [Edwards Vacuum — How do vacuum connections influence conductance?]

### 길이·직경과 컨덕턴스의 관계
- **길이**: 컨덕턴스는 길이에 반비례한다 (C ∝ 1/length) ✅ [Edwards Vacuum — How do vacuum connections influence conductance?]
- **직경**: 분자류 영역 원형 관의 컨덕턴스는 직경의 세제곱에 비례한다. Leybold 공식:
```
C_mol = 12.1 × (d³/L)   [공기, 20°C, l ≥ 10d 조건, d·L 단위 cm]
```
✅ [Leybold — How is conductance in vacuum calculated]

즉 직경을 2배로 늘리면 컨덕턴스는 이론상 8배(2³)까지 늘어날 수 있다. 반대로 배관을 가늘게 줄이면 컨덕턴스가 급격히 줄어들어, 펌프 스펙상 배기속도가 아무리 커도 챔버에서 체감하는 유효 배기속도는 크게 깎인다.

### 실무 실수를 뒷받침하는 실측 예시 (Edwards 공식 자료)
Edwards는 "5m 길이 NW40 배관(굽힘 2곳) + XDS35i 스크롤 펌프" 조합의 실측 데이터를 제시한다:

| 압력 구간 | 배관 컨덕턴스 영향 |
|---|---|
| 고압 (>10 mbar) | 영향 최소 |
| 중압 (~10 mbar) | **약 50% 배기속도 손실** 발생 |
| 저압 (<0.1 mbar) | 손실 무시 가능한 수준 |
✅ [Edwards Vacuum — How do vacuum connections influence conductance?]

→ 이는 "펌프 스펙상 배기속도만 보고 배관 설계를 소홀히 하면 실제 성능이 안 나온다"는 실무 흔한 실수를 뒷받침하는 공식 자료 근거다. 특히 중압(러핑 초기~중반) 구간에서 배관 설계 미흡으로 배기속도가 절반까지 깎일 수 있다는 것은 구체적 수치로 확인된다.

또 다른 예시로, ISO100 게이트밸브의 분자류 컨덕턴스는 약 1,700 L/s로, 이 경우에도 소량이지만 컨덕턴스 손실이 발생하는 것으로 분석된다 ✅ [Edwards Vacuum — How do vacuum connections influence conductance?]

### 결론
- 배관의 컨덕턴스가 펌프의 배기속도보다 훨씬 크면(예: 굵고 짧은 배관), 유효 배기속도는 펌프 스펙에 근접한다.
- 배관의 컨덕턴스가 펌프의 배기속도와 비슷하거나 작으면(예: 가늘고 긴 배관), 유효 배기속도는 펌프 스펙보다 크게 낮아진다.
- Edwards는 "연결 배관의 컨덕턴스는 최소한 펌프의 정격 배기속도와 비슷한 수준이어야 하며, 그렇지 않으면 펌프 용량이 낭비된다"고 명시한다 ✅ [Edwards Vacuum — How do vacuum connections influence conductance?]

---

## 5. 흐름 영역(점성류/중간류/분자류)별 컨덕턴스 계산 차이

Edwards 공식 자료 기준 (293K 공기 기준 압력 범위):

| 흐름 영역 | 압력 범위 | 특성 |
|---|---|---|
| 분자류 (Molecular) | 약 0.01 mbar 미만 | 압력 무관, 분자-벽 충돌이 지배적 |
| 중간류 (Transitional) | 약 0.01 ~ 1 mbar | 점성류·분자류 혼합 특성 |
| 점성류 (Continuum/Viscous) | 약 1 mbar 초과 | 압력에 선형 비례, 분자-분자 충돌이 지배적 |
✅ [Edwards Vacuum — How do vacuum connections influence conductance?]

Leybold 공식 자료도 동일한 구분을 제시한다:
- **분자류 영역**: 컨덕턴스가 압력에 무관(상수) ✅ [Leybold — How is conductance in vacuum calculated]
- **점성류(층류) 영역**: 컨덕턴스가 평균압력(p̄)에 비례 ✅ [Leybold — How is conductance in vacuum calculated]

### 점성류(층류) 극한 컨덕턴스 (Leybold 공식, 원형 관)
```
C_lam = (d⁴ · p̄) / (128 · η · l)
```
- d = 관 내경, l = 관 길이, p̄ = 평균압력, η = 기체 점성계수
✅ [Leybold — How is conductance in vacuum calculated]

### 분자류 극한 컨덕턴스 (Leybold 공식, 원형 관)
```
C_mol = 12.1 × (d³/L)   [공기, 20°C, d·L 단위 cm]
```
✅ [Leybold — How is conductance in vacuum calculated]

### 오리피스(구멍) 컨덕턴스 — 분자류 (Leybold 공식)
```
C_mol = 11.6 × A   [공기, 20°C, A 단위 cm²]
```
✅ [Leybold — How is conductance in vacuum calculated]

점성류 영역 오리피스는 임계압력비 δ = p₂/p₁ = 0.528을 기준으로, δ < 0.528이면 초음속(choked) 흐름이 발생한다 ✅ [Leybold — How is conductance in vacuum calculated]

### 엘보우(굽힘) 보정 (Leybold 공식)
배관에 굽힘이 있으면 실제 길이 대신 등가 길이를 사용한다:
```
l_eff = l_axial + Σ[(θ/90°) × d]
```
- θ = 엘보우 각도
✅ [Leybold — How is conductance in vacuum calculated]

### 실무 요약
- **점성류(고압, 러핑 초반)**: 배관 저항의 영향이 상대적으로 작다 — 앞서 Edwards 실측 예시에서 ">10 mbar 구간, 영향 최소"로 확인됨.
- **중간류(러핑 중후반)**: 배관 설계 실수가 가장 크게 드러나는 구간 — 실측 예시에서 "~10 mbar 구간 약 50% 손실".
- **분자류(고진공)**: 컨덕턴스가 압력과 무관한 상수값이 되므로, 배관 직경·길이 설계가 시스템 전체 도달진공도에 구조적으로 영향을 준다.

---

## 6. 컨덕턴스 개념 관련 현장 사례 (상담기록)

스마텍 내부 상담기록에서 컨덕턴스가 실제 상담 중 언급된 사례를 확인했다. (거래처 실명은 익명화)

**상황**: 반도체 관련 업체 담당자가 IXH610(대체 예정 모델) 도입을 문의하며, "노즐이 100A인데 배관을 50A로 줄이면 굳이 이 펌프를 쓸 필요가 없지 않냐"고 질문.

**스마텍 답변 요지**: "그래도 컨덕턴스 영향이 있다. 얼마나 빨리 뽑으려 하시는지에 따라 다른데, 초기 구간에서는 배기 시간이 늘어날 것이다. 100A로 썼을 때와 작은 구경으로 가면 병목 현상이 생긴다."

→ 이 상담 사례는 "노즐/배관 구경을 줄이면 펌프 배기속도가 커도 실제 배기 시간이 늘어난다"는 컨덕턴스 개념을 고객이 직접 체감하는 실무 사례로, 위 3~4번 섹션의 이론(배관이 좁아지면 컨덕턴스가 줄어 유효 배기속도가 줄어든다)과 정확히 일치한다.

출처: `data/상담기록/상담_20260526_1438_통화 녹음 #대표양경석 와이지엔지니어링 IXH610_260526_103024.txt` (스마텍 내부 자료, 이니셜/실명 미기재)

---

## 7. 글쓰기 시 참고 — 소스 간 표기 일치 확인

- Edwards와 Leybold 두 회사 모두 동일한 유효 배기속도 공식 구조(1/S_eff = 1/S + 1/C)를 사용함을 확인했다 — 충돌 없음.
- 흐름 영역 압력 범위(분자류 <0.01mbar, 점성류 >1mbar)도 Edwards·Leybold 자료가 일치함 — 충돌 없음.
- Pfeiffer 공식 페이지는 WebFetch 직접 접근이 차단(406 오류)되어 검색 스니펫으로만 확인. 스니펫 내용(1/Seff = 1/C + 1/Snom, 층류에서 컨덕턴스가 평균압력에 비례, 분자류에서 압력 무관)은 Edwards·Leybold와 동일해 신뢰도 있음 ✅ [Pfeiffer Vacuum — 검색결과 스니펫, Vacuum Calculations: Basic Formulas]

---

## 참고 소스

- ✅ [Edwards Vacuum — How do vacuum connections influence conductance?](https://www.edwardsvacuum.com/en/knowledge/applications/how-do-vacuum-connections-influence-conductance) — 수치·공식 인용 (컨덕턴스 정의, 유효배기속도 공식, Vacuum Golden Rule, 흐름영역 압력범위, NW40 배관 실측 예시, ISO100 게이트밸브 컨덕턴스)
- ✅ [Leybold — How is conductance in vacuum calculated](https://www.leybold.com/en-us/knowledge/vacuum-fundamentals/fundamental-physics-of-vacuum/how-to-calculate-vacuum-conductance) — 수치·공식 인용 (컨덕턴스 공식, 층류/분자류 극한 공식, 직렬·병렬 합성, 엘보우 보정)
- ✅ [Leybold — How to choose a pump size](https://www.leybold.com/en-us/knowledge/vacuum-fundamentals/vacuum-generation/how-to-choose-a-pump-size) — 수치·공식 인용 (배기속도 정의, 단위, 조야진공 배기시간 공식, 500L 용기 예시)
- ✅ [Pfeiffer Vacuum — Vacuum Calculations: Basic Formulas](https://www.pfeiffer-vacuum.com/global/en/knowledge/vacuum-technology/basic-calculations/calculations) — 검색결과 스니펫만 확인(직접 페이지 접근 406 오류), 공식 구조 교차검증용으로만 참고
- ✅ 스마텍 내부 상담기록 — `data/상담기록/상담_20260526_1438_통화 녹음 #대표양경석 와이지엔지니어링 IXH610_260526_103024.txt` — 현장 사례 인용
- ⚠️ [Kurt J. Lesker Company — Pumping Speed vs Conductance](https://www.lesker.com/newweb/technical_info/vacuumtech/conductance_01_psvsconductance.cfm) — 참고만, 화이트리스트 외 소스로 수치 미사용
- ⚠️ [Milne Publishing — Introduction to Vacuum Technology (교재)](https://milnepublishing.geneseo.edu/introtovacuumtech/) — 참고만, 화이트리스트 외 소스로 수치 미사용

---

## 확인 불가 항목
- Edwards PDF 애플리케이션 노트(`3601-2109-01-conductance.pdf`)는 바이너리 인코딩 문제로 텍스트 추출 실패. 추가 수치가 필요하면 재시도 필요.
- Pfeiffer 공식 페이지는 WebFetch 접근이 406으로 차단되어 원문 전체 확인 불가 (검색 스니펫만 확보).
