# ELD500W 리크디텍터 — 언제 리크디텍터를 써야 할까요? 리서치

> 리서치 기준일: 2026년 06월 01일
> 소스 수: 8개

---

## 리크디텍터란 무엇인가

리크디텍터(Leak Detector)는 진공 시스템에서 미세한 누설(leak)을 정밀하게 검출하는 장비입니다. 헬륨 질량분석계(Helium Mass Spectrometer)를 핵심 원리로 사용하며, 헬륨 가스를 추적 가스(tracer gas)로 사용하여 가스가 통과하는 누설 위치를 감지합니다.

작동 원리:
- 가스 분자가 질량분석계 내로 유입되면 이온 소스(ion source)가 이온화
- 이온화된 입자가 자기장(magnetic field)을 통과하면서 질량/전하비에 따라 경로가 분리됨
- 질량 4(헬륨)에 해당하는 이온만 이온 컬렉터에 도달하여 전류값으로 누설량을 정밀 측정

---

## 왜 헬륨을 추적 가스로 사용하는가

헬륨이 리크 테스트에 사용되는 이유는 물리·화학적 특성 때문입니다.

- **분자량이 극히 작음**: 헬륨의 원자질량(AMU)은 4로, 가장 가벼운 불활성 가스. 분자 크기가 작아 아주 좁은 누설 경로를 공기보다 2.7배 빠르게 통과함
- **대기 중 농도가 극히 낮음**: 대기 중 헬륨 농도는 약 5.24×10⁻⁴%(약 5 ppm)에 불과. 배경 잡음이 낮아 신호 대비 잡음비(S/N ratio)가 매우 우수하여 미세 누설도 구별 가능
- **안전하고 불활성**: 독성 없음, 비가연성, 비반응성으로 현장에서 안전하게 사용 가능
- **가장 민감한 검출 방법**: 헬륨 리크 테스트는 현재 상업적으로 사용되는 방법 중 가장 민감한 누설 검출 방법

---

## Edwards ELD500W 제품 사양

제품 마스터 테이블(product_master_table.csv) 기준:

| 항목 | ELD500 WET | ELD500 DRY | ELD500 FLEX |
|------|-----------|-----------|------------|
| 배기속도 | 2.5 m³/h | 1.6 m³/h | N/A |
| 최소 검출 누설량 | 5×10⁻¹² mbar·l/s | 3×10⁻¹¹ mbar·l/s | 5×10⁻¹² mbar·l/s |
| 내장 펌프 | 오일식 로터리 베인 | 다이어프램 드라이 | 없음(외부 펌프 필요) |
| 적용 가스 | 헬륨 전용 | 헬륨 전용 | 헬륨 전용 |
| 인터페이스 플랜지 | NW25 | NW25 | NW25 |
| 특징 | 완전자동, 이동형 | 오일프리, 이동형 | 외부 백킹펌프 사용 |

추가 사양(Edwards 공식 자료 기준):
- 헬륨 펌핑 속도: 3.1 l/s
- 스니퍼 모드 최소 검출: 7×10⁻⁹ mbar·l/s
- 기동 시간: 2분 이내
- 인터페이스: KF DN25 플랜지
- 내장 교정 누설(calibrated leak, TL7) 및 교정 성적서 포함
- 완전 자동화 캘리브레이션
- 진공 모드 / 스니퍼 모드 전환: 버튼 하나

---

## 작동 모드 두 가지

### 진공 모드 (Vacuum Mode)
- 시험체(검사 대상)를 리크디텍터에 연결한 뒤 진공을 걸고, 외부에서 헬륨을 뿌림
- 용도: 누설 위치가 불특정 다수이거나 전체 시스템의 누설량을 정밀하게 수치화할 때
- 장점: 매우 높은 민감도, 누설량 정량화 가능

### 스니퍼 모드 (Sniffer Mode)
- 시험체 내부에 헬륨 가스를 충전하고 외부에서 탐침(sniffer probe)으로 헬륨 누출 지점을 탐색
- 용도: 대형 시스템, 접근 불가 배관, 넓은 면적 검사
- 장점: 특정 누설 위치 파악에 유용, 이동이 자유로워 현장 적용성 높음

---

## 리크디텍터가 필요한 상황 — 반도체·디스플레이·연구소 현장

### 반도체 공정에서의 진공 누설 문제
- 반도체 공정(식각·증착·이온주입 등)은 10⁻² ~ 10⁻⁶ Torr 수준의 고진공 환경을 요구
- 진공도가 설정값에 도달하지 못하거나 펌핑 시간이 늘어나는 증상은 누설의 1차 신호
- 진공 챔버·게이트 밸브·O-링·가스 배관 어디서든 누설이 발생할 수 있으며, 눈으로 위치 특정 불가
- 누설이 있는 채로 공정 진행 시: 불순물(산소·수분·질소) 유입 → 공정 이상 → 수율 저하 → 불량

### 리크디텍터가 필요한 대표 상황
1. 진공 챔버 유지보수 또는 교체 후 재가동 전 밀봉 검증
2. 로드락(load lock), 전달 챔버(transfer chamber)의 O-링·가스켓 누설 확인
3. 배관·용접부 누설 검증 (가스 패널, 공정 가스 라인)
4. 터보펌프·크라이오펌프 주기 점검 시 누설 여부 확인
5. 장비 제조사의 출하 전(acceptance test) 밀봉 검사
6. 진공도가 지속적으로 나빠지는 원인 불명의 문제 진단

### 디스플레이·연구소 응용
- 디스플레이 패널 제조: 증착 챔버(스퍼터·CVD) 및 인-라인 진공 시스템
- 연구소·분석 장비: 질량분석기(mass spectrometer), 전자현미경(SEM/TEM), 표면분석 장비
- 기타: 우주항공 부품 시험, 고에너지물리 실험장비, 의료장비

---

## ELD500W의 주요 강점

- **완전 자동화**: 스타트업, 캘리브레이션, 측정이 모두 자동으로 처리 → 조작 부담 최소화
- **이동형 설계**: 바퀴와 운반 핸들이 있어 현장 어디서나 이동 가능 (trolley 또는 bench-top 모두 사용)
- **내장 캘리브레이션 리크**: TL7 교정 누설 내장으로 별도 장비 없이 현장 교정 가능
- **2분 기동**: 스타트업 2분 이내 → 빠른 검사 대응
- **다양한 변형 모델**: WET(오일식), DRY(오일프리), FLEX(외부 펌프 사용)로 환경에 따라 선택 가능
- **소프트웨어 지원**: ELD500 소프트웨어를 통한 데이터 로깅·분석·원격 모니터링 가능

---

## 전통적인 누설 감지 방법의 한계

헬륨 리크디텍터 사용 전 사용되던 방법들의 한계:
- **압력 강하 측정**: 시간이 오래 걸리고, 어느 부위에서 누설되는지 위치 특정 불가
- **물·비눗물 도포**: 극소 누설은 기포 불발생. 진공 환경에 적용 불가
- **음향 감지**: 미세 누설에서는 소리 발생 없어 감지 한계
- **질소 충전 후 압력 모니터링**: 위치 특정 불가, 고가 설비 적용 제한

헬륨 리크디텍터를 사용하면 5×10⁻¹² mbar·l/s 수준의 극미세 누설도 수치로 즉각 확인 가능하며, 위치 특정까지 가능.

---

## 참고 소스

- [Edwards Vacuum — ELD500 Helium Leak Detector 공식 페이지](https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-products/leak-detection/eld500-helium-leak-detector)
- [UHVTS — Edwards ELD500 제품 상세](https://uhvts.com/products/edwards-eld500/)
- [HVS Leak Detection — ELD500 DRY 제품 정보](https://heliumleakdetection.net/helium-leak-detectors/edwards-leak-detectors/edwards-eld500-dry-precision-leak-detector/)
- [Orbit & Skyline — Helium Leak Detectors for Vacuum Integrity in Semiconductor Manufacturing](https://orbitskyline.com/blog/ensuring-vacuum-integrity-in-semiconductor-manufacturing-with-helium-leak-detectors/)
- [LACO Technologies — Why Use Helium for Leak Testing?](https://lacotech.com/why-use-helium-for-leak-testing/)
- [Leybold — Benefits of Helium as a Tracer Gas](https://www.leybold.com/en-us/knowledge/vacuum-fundamentals/leak-detection/benefits-of-helium-as-a-tracer-gas)
- [Pfeiffer Vacuum — Helium Leak Detection on Vacuum Systems](https://www.pfeiffer-vacuum.com/global/en/applications/helium-leak-detection/)
- [High Vac Depot — Vacuum Mode versus Sniff Mode](https://highvacdepot.com/2020/11/05/vacuum-mode-versus-sniff-mode-on-your-leak-detector/)
