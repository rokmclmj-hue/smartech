# 인공위성·우주선을 지상에서 시험하는 법 — 우주 진공을 재현하는 챔버 리서치

> 리서치 기준일: 2026년 8월 24일
> 허용 소스 수: 2개 / 참고 소스 수: 1개

---

## 왜 지상에서 우주 진공을 재현해야 하는가

위성·우주선 부품은 발사 전 지상에서 우주 환경(진공 + 극한 온도)을 미리 겪어보게 하는 시험을 거친다. 이 시험 설비를 열진공챔버(TVAC, Thermal Vacuum Chamber)라고 부른다. TVAC는 우주선·인공위성 구성품, 추진 시스템을 시험하기 위해 우주의 진공을 시뮬레이션하는 통제된 환경을 만든다 ✅ [Edwards Vacuum — TVAC 시스템 계획 가이드]

## 온도 시뮬레이션 범위

TVAC는 진공뿐 아니라 온도도 함께 재현한다. 극저온 냉각 시스템으로 우주 장비가 견뎌야 하는 -80°C 이하의 극한 저온 환경을 시뮬레이션하고, 동시에 챔버 내 가열 기술로 태양열 부하에 해당하는 +180°C까지의 고온 환경도 재현한다 ✅ [Edwards Vacuum — Space Simulation and Research]

## 진공도 수준

Edwards는 저진공부터 초고진공(UHV)까지 다양한 임무 프로파일(저궤도 LEO~심우주)에 맞는 압력대를 구현할 수 있다고 밝히고 있다 ✅ [Edwards Vacuum — Space Simulation and Research]. 초고진공(UHV)은 통상 10⁻⁷ hPa(mbar) 이하로 정의된다 ✅ [Pfeiffer Vacuum — Generation of Ultra-High Vacuum]

## 챔버 진공 시스템 구성

Edwards는 1차 펌프(러핑용 드라이/오일펌프), 터보펌프, 크라이오펌프, 이온펌프에 진공게이지·잔류가스분석기(RGA)·헬륨 리크디텍터 같은 모니터링 장비까지 맞춤 구성해 시스템을 통합한다고 설명한다 ✅ [Edwards Vacuum — Space Simulation and Research]

크라이오펌프는 극저온으로 기체 분자를 표면에 얼려 붙잡아(cryocondensation·cryosorption) 초고진공을 만드는 방식으로, 오염이 거의 없어 초고진공이 필요한 응용에 필수적이라고 설명된다 ✅ [Edwards Vacuum — Space Simulation and Research]. 크라이오펌프 계열 제품으로 On-Board Cryopump, Cryo-Torr 시리즈가 있다 ✅ [Edwards Vacuum — Cryo-Torr Cryopumps 제품 페이지]

## TVAC 설계 시 고려 사항

Edwards가 안내하는 TVAC 시스템 기획 체크리스트 ✅ [Edwards Vacuum — TVAC 시스템 계획 가이드]:
- **챔버 규격/풋프린트**: 시험 대상물이 들어가고 실험실 공간에 맞아야 하며, 이 크기가 곧 챔버 내부 체적과 필요한 배기 용량을 결정한다.
- **적용 목적 명확화**: 위성 부품 시험인지, 소재 아웃가싱(outgassing) 연구인지, 열순환 시험인지에 따라 시스템 구성이 달라진다.
- **챔버 재질**: 극한의 온도·진공 조건을 견디는 재질을 선택해야 한다.
- **챔버 형상**: 원통형 또는 정육면체형에 따라 챔버 내부의 열·진공 조건 분포가 달라진다.
- **부가 장치**: 균일한 온도 분포를 위한 열실드(thermal shroud), 큐브샛(CubeSat) 진동시험용 고정지그 등 목적에 맞는 부속 설계가 필요하다.

## 확인 불가 항목

- 특정 배기속도(m³/h) 수치나 특정 크라이오펌프 모델의 냉각 온도(K) 스펙은 이번 리서치 범위 내 화이트리스트 소스에서 확인하지 못함 → 본문에서 구체적 수치 대신 원리·구성 중심으로 서술.
- 국내(한국항공우주연구원 등) 실제 TVAC 운용 사례는 확인 불가 → 본문에 포함하지 않음.

## 현장 사례 (상담기록)

이번 주제와 직접 연결된 상담기록 없음(스마텍 국내 고객 중 위성 시험설비 운용 사례 미확인). 다만 같은 8월 상담기록 중 크라이오펌프 신규 도입을 검토 중인 연구소(IMS 대리점 통해 에드워드 vs 유럽사 견적 비교) 사례가 있어, 크라이오펌프가 실제로도 국내 연구현장에서 도입 검토되는 장비임을 뒷받침하는 참고 맥락으로만 언급 가능(구체 수치·업체 인용은 하지 않음).

---

## 참고 소스

- ✅ [Edwards Vacuum — Vacuum Solutions for Space Simulation and Research](https://www.edwardsvacuum.com/en-us/campaigns/vacuum-solutions-for-space-simulation-and-research) — 수치·구성 인용
- ✅ [Edwards Vacuum — What you need to consider when planning your TVAC system](https://www.edwardsvacuum.com/en-us/vacuum-pumps/knowledge/applications/what-you-need-to-plan-your-tvac-system) — 설계 체크리스트 인용
- ✅ [Pfeiffer Vacuum — Generation of Ultra-High Vacuum](https://www.pfeiffer-vacuum.com/us/en/applications/ultra-high-vacuum/) — UHV 정의 인용
- ⚠️ [Edwards Vacuum — Cryo-Torr Cryopumps](https://www.edwardsvacuum.com/en-us/semiconductor/our-products/on-chamber-solutions/cryogenics/on-board-cryopumps/cryo-torr-cryopumps) — 참고만, 제품 라인명만 인용
