# 분석 장비 RV 오일로터리펌프 유지관리 핵심 3가지 리서치

> 리서치 기준일: 2026년 06월 06일
> 허용 소스 수: 3개 / 참고 소스 수: 0개

---

## 제품 사양 (스마텍 내부 자료)

✅ [Edwards 공식 데이터시트 — 1.오일펌프_소형RV.txt]

### RV 시리즈 기술 수치 (50Hz 기준)

| 모델 | 배기속도 (m³/h) | 도달진공도 (mbar, Total) | 오일 용량 (L) |
|------|----------------|--------------------------|--------------|
| RV3  | 3.3            | 2.0 × 10⁻³               | 0.7          |
| RV5  | 5.1            | 2.0 × 10⁻³               | 0.7          |
| RV8  | 8.5            | 2.0 × 10⁻³               | 0.75         |
| RV12 | 12             | 2.0 × 10⁻³               | 1.0          |

- 가스 발라스트 Position II 수증기 처리 용량:
  - RV3, RV5, RV8: 220 g/h ✅ [Edwards RV 데이터시트]
  - RV12: 290 g/h ✅ [Edwards RV 데이터시트]
- 가스 발라스트 Position I 수증기 처리 용량: 60 g/h (전 모델 공통) ✅ [Edwards RV 데이터시트]
- 권장 오일 타입: **Ultragrade 19** ✅ [Edwards RV 데이터시트]
- 오일 타입(Ultragrade 19) 점도: 55 cSt @ 40°C ✅ [Edwards Ultragrade MSDS]
- 동작 온도 범위: 12~40°C ✅ [Edwards RV 데이터시트]
- 소음 수준: 48 dB(A) (50Hz) ✅ [Edwards RV 데이터시트]
- 인렛/이그조스트 플랜지: NW25 ✅ [Edwards RV 데이터시트]

### 주요 적용 분야 (Edwards 공식 자료)
✅ [Edwards RV 데이터시트]
- 질량 분석기(GCMS, LCMS, ICPMS, MALDI, RGA)
- 전자현미경(TEM, SEM)
- 샘플 준비(겔 드라이어, 글러브 박스, 회전 증발기, 원심분리기)
- 연구개발(챔버 배기, 코팅 시스템, 터보펌프 백킹)
- 화학(증류·추출·여과)

---

## 핵심 유지관리 3가지

### 1. 오일 교환 (Oil Change)

✅ [Edwards 공식 웹사이트 — working-with-oil-sealed-rotary-vane-pumps]

- 권장 오일: Ultragrade 19 (Edwards 순정 오일)
- 오일 교환 전 펌프를 충분히 워밍업하여 오일을 묽게 만든 뒤 드레인
- 절차: 펌프 정지 → 최소 1시간 냉각 → 드레인 플러그 개방 → 구오일 완전 배출 → 신유 보충(올바른 레벨까지)
- 오일 상태 모니터링: 오일 색상을 정기적으로 확인. 변색(검게 탄화, 우유빛 유화) 발견 시 즉시 교환
- 오일 교환 주기: 확인 불가 (Edwards 공식 사이트에 구체적 수치 미명시) — 운전 시간 및 공정 조건에 따라 결정. 일반적으로 오일이 오염되거나 성능 저하 시 교환.
- 플러싱(Flushing): 심하게 오염된 경우 신유로 한 번 플러시 후 완전히 배출하고 다시 채움

### 2. 가스 발라스트 (Gas Ballast)

✅ [Edwards 공식 웹사이트 — why-gas-ballast-is-important-on-oil-sealed-rotary-vane-pumps]
✅ [Edwards 공식 웹사이트 — working-with-oil-sealed-rotary-vane-pumps]
✅ [Edwards RV 데이터시트]

- 역할: 응축성 증기(특히 수증기)가 펌프 내부에서 액화되는 것을 방지
- 물의 포화 증기압: 20°C에서 약 24 mbar(18 Torr) ✅ [Edwards 공식 웹사이트]
- 수분이 펌프 오일에 혼입되면 오일 에멀전화 → 진공 성능 저하 → 부식 가속
- RV 시리즈 가스 발라스트 모드:
  - Position I: 60 g/h 수증기 처리 ✅ [Edwards RV 데이터시트]
  - Position II: 220 g/h (RV3/5/8), 290 g/h (RV12) ✅ [Edwards RV 데이터시트]
- 사용 방법:
  - 수분·증기 함유 공정 중 가스 발라스트를 열어 놓고 운전
  - 공정 시작 전후로 가스 발라스트를 열고 무부하 운전하여 오일 내 응축물 퍼징
  - Edwards RV 시리즈는 2포지션 가스 발라스트 밸브 내장 (소레노이드 자동화 옵션 가능)
- 가스 발라스트를 열면 도달 진공도가 다소 낮아짐:
  - GB Position I 도달진공도: 3.0 × 10⁻² mbar ✅ [Edwards RV 데이터시트]
  - GB Position II 도달진공도: 1.2 × 10⁻¹ mbar (RV3/5/12), 6.0 × 10⁻² mbar (RV8) ✅ [Edwards RV 데이터시트]

### 3. 오일 미스트 필터 (Oil Mist Filter, EMF)

✅ [Edwards 공식 웹사이트 — prevent-oil-mist-with-an-exhaust-mist-filter]
✅ [Edwards EMF 인스트럭션 매뉴얼 — 19.미스트필터(EMF).txt]

- RV 시리즈 권장 모델:
  - RV3, RV5, RV8 → **EMF10** (A46226000) ✅ [Edwards EMF 매뉴얼]
  - RV12 → **EMF20** (A46229000) ✅ [Edwards EMF 매뉴얼]
- EMF10 유량: 12 m³/h ✅ [Edwards EMF 매뉴얼]
- EMF20 유량: 20 m³/h ✅ [Edwards EMF 매뉴얼]
- 플랜지: NW25 (EMF10, EMF20 모두) ✅ [Edwards EMF 매뉴얼]
- 필터 구성: 에폭시 함침 보로실리케이트 유리섬유(미스트 필터) + 활성탄(취기 제거) ✅ [Edwards EMF 매뉴얼]
- 필터 엘레먼트 교환 주기:
  - 미스트 필터 엘레먼트: **6개월마다** ✅ [Edwards EMF 매뉴얼]
  - 취기(오도) 엘레먼트: **매월 또는 오일 냄새 발생 시** ✅ [Edwards EMF 매뉴얼]
- 오일 레벨 확인: sight panel(사이트 패널)로 오일 레벨 확인. 최대 레벨 도달 시 드레인 플러그로 배출 ✅ [Edwards EMF 매뉴얼]
- 압력 릴리프 밸브: 필터 막힘 시 자동으로 바이패스. 단, 바이패스 시 미처리 오일 미스트가 배출됨 → 조기 교환 중요 ✅ [Edwards EMF 매뉴얼]
- 오일 리턴 키트 옵션:
  - EMF Clean Application Oil Drain Kit (A50419000): RV3~RV12용. 오일 미스트 필터에 포집된 오일을 펌프로 자동 반환 ✅ [Edwards EMF 매뉴얼]
  - EMF Gas Ballast Oil Drain Kit (A50523000): RV3~RV12용. 가스 발라스트 포트를 통해 오일 반환 ✅ [Edwards EMF 매뉴얼]
- 오일 미스트 발생이 많은 조건: 대형 챔버 배기, 높은 가스 유량, 가스 발라스트 운전 중 ✅ [Edwards 공식 웹사이트]
- 장시간 운전 시 오일 미스트 필터 미설치 시: 펌프 오일 충전량이 심각하게 소실될 수 있음 ✅ [Edwards 공식 웹사이트]

---

## 현장 사례 (상담기록)

**출처: 상담_20260603_1729_통화 녹음 #이사임경태 글리트머티리얼즈RV12_260602_155647.txt**

- 업체명: 글리트머티리얼즈 (이사: 임경태)
- 문의 제품: RV12
- 문의 내용: 견적 문의 (납품업체로 납품가 제공)
- 현황: 에드워즈 코리아(수원) 견적 문의 후 스마텍으로 연결됨
- 납기: 선발주 현황 있어 약 1주 소요 예상
- 특이사항: 직접 사용 확인됨 (납품업체가 아닌 직접 사용)

→ G사(분석 분야 추정)에서 RV12 직접 사용 사례로 익명 활용 가능

---

## 참고 소스

- ✅ [Edwards RV 데이터시트](edwardsvacuum.com — 1.오일펌프_소형RV.txt) — 수치 인용
- ✅ [Edwards EMF 인스트럭션 매뉴얼](edwardsvacuum.com — 19.미스트필터(EMF).txt) — 수치 인용
- ✅ [Edwards Ultragrade MSDS](edwardsvacuum.com — 20.진공펌프오일_Ultra19.txt) — 수치 인용
- ✅ [Edwards 공식 웹사이트 — 가스 발라스트](https://www.edwardsvacuum.com/en-us/vacuum-pumps/knowledge/applications/why-gas-ballast-is-important-on-oil-sealed-rotary-vane-pumps) — 내용 인용
- ✅ [Edwards 공식 웹사이트 — 유지관리 8 팁](https://www.edwardsvacuum.com/en-us/vacuum-pumps/knowledge/applications/working-with-oil-sealed-rotary-vane-pumps) — 내용 인용
- ✅ [Edwards 공식 웹사이트 — 오일 미스트 필터](https://www.edwardsvacuum.com/en-us/vacuum-pumps/knowledge/applications/prevent-oil-mist-with-an-exhaust-mist-filter) — 내용 인용
