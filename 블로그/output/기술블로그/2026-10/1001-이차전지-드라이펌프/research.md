# 이차전지 건조·전해액 주입 공정의 드라이펌프 선택법 — 리서치

> 리서치 기준일: 2026년 9월 23일
> 허용 소스 수: 2개(Edwards 공식) / 스마텍 내부 자료 1개(GXS 데이터시트)
> 상담기록·현장사진 폴더 비어 있음.

## 0단계 — 내부 자료
- `product_combos.txt`: GXS는 스크류 방식 드라이펌프. GXS160~GXS750, 조합은 GXS 단독~GXS750/4200(부스터 포함 최대 32,000 L/min급). 적용공정에 "태양광, 동결건조, 살균, 코팅, 금속, 리크검사, 챔버배기, 식품포장, 가스실린더 충전" 명시(이차전지는 명시 목록에 없음, 아래 Edwards 자료로 보완).
- `data/Product_master_table/7.산업용드라이펌프_GXS Dry.txt`(Edwards 공식 브로슈어 원문 그대로 저장된 파일): GXS 브로슈어의 Applications 목록 중 "Drying" 항목에 **"Lithium-Ion battery drying"**이 명시됨. ✅ [Edwards GXS 브로슈어](https://www.edwardsvacuum.com/content/dam/brands/edwards-vacuum/general-vacuum/downloads/dry-screw-pumps/edwards-GXS-dry-pumps-product-brochure.pdf)
- 같은 파일의 Technical data(GXS160/250/450/750, 각 단독·부스터 조합): Peak Pumping Speed, Ultimate Pressure(예: GXS160 Ultimate 7×10⁻³ mbar without purge / GXS160+1750 부스터 조합 7×10⁻⁴ mbar), 오일은 PFPE Drynert 25/6, 최대 배기압력 등 수치 확인. 이 수치들은 일반 사양이며, 이차전지 전해액 조건에서의 실측치는 아님.

## 1단계 — 왜 드라이(오일 없는) 펌프인가
- Edwards: 전해액 탈기(degassing) 공정은 "안정적으로 0.1 mbar 미만의 진공압력"을 요구한다. ✅ 원문 "Electrolyte degassing requires a stable vacuum pressure less than 0.1 mbar" [Edwards — Why are dry pumps better for Li-ion battery electrolyte degassing?](https://www.edwardsvacuum.com/en-us/knowledge/applications/why-are-dry-pumps-better-for-li-ion-battery-electrolyte-degassing)
- 전해액 관련 공정가스는 **DME(디메톡시에탄), 디옥솔레인, 육불화인산리튬(LiPF6)** 등 부식성·반응성 물질을 포함한다. ✅ 같은 자료
- 오일씰 펌프는 이 물질이 기어박스로 유입되면 오일이 쉽게 오염돼 "잦은 오일 교환으로 이어져 유지보수 비용과 가동중단 손실이 커진다"고 설명한다. ✅ 원문 "the oil can easily get contaminated. This results in frequent oil changes, leading to high maintenance costs and downtime losses." (같은 자료)
- GXS는 "공정 물질이 기어박스로 유입되는 것을 막는 진보된 씰링 기술을 갖춰 기어오일 오염을 없앤다"고 설명한다. ✅ 원문 "GXS has advanced sealing technology that prevents migration of process materials from entering in to the gearbox, eliminating gear-oil contamination." (같은 자료)
- 초기 투자비는 더 높지만, 오일 오염에 따른 반복 유지보수 비용을 줄여 총소유비용이 낮아진다는 것이 Edwards의 설명(정량적 비교 수치는 제공되지 않음, "낮아진다"는 정성적 주장으로만 인용).

## 2단계 — 공정 단계별 진공 사용처
Edwards 에너지솔루션 페이지 기준, 이차전지 제조의 진공 적용 단계는 3가지로 정리된다. ✅ [Edwards — Lithium-Ion Battery Production](https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-markets/energy-solutions/lithium-ion-battery-production)
1. **초기 혼합(슬러리 믹싱)**: "슬러리에 기포가 들어가는 것을 막기 위해" 진공을 적용한다. 원문 "Vacuum technology is applied to the initial chemical and slurry mixing stage to prevent gas bubbles from getting into the paste."
2. **건조**: "매우 가혹한 조건에서 수분을 제거하기 위해" 진공을 쓴다. 원문 "Vacuum is next used in the drying stage to remove moisture from the process under extremely harsh conditions."
3. **밀봉(전해액 주입 후 파우치 실링)**: "실제 배터리 파우치의 밀봉은 진공 상태에서 이뤄진다." 원문 "Finally, the actual sealing of the battery pouch is done under vacuum."
- 이 페이지는 "오일씰 로터리베인과 드라이펌프를 포함한 다양한 펌프 라인업을 갖췄다"고만 서술하고, **어느 모델을 어느 단계에 쓰라는 특정 조합은 명시하지 않는다.** 특정 모델-공정단계 매칭 문장은 이 페이지에서 확인 불가 → 글에서 "GXS는 건조·탈기 단계에 적용된다(브로슈어 Drying 항목)"까지만 쓰고, 그 이상 세부 매칭(혼합/밀봉 단계에 특정 모델)은 단정하지 않는다.

## 3단계 — 펌프+부스터 조합 규칙 적용
- 이차전지 전해액 탈기에 특정 GXS+부스터 조합(예: GXS250/2600)을 "권장 조합"으로 명시한 이차전지 전용 공식 문서는 확인하지 못했다.
- GXS 자체 브로슈어의 일반 조합표(GXS160/1750, GXS250/2600, GXS450/2600·4200, GXS750/2600·4200)는 확인되나, 이것이 이차전지 탈기 전용 권장값이라는 근거는 없음 → 글에서는 "일반 조합 옵션이 있다"로만 언급하고 특정 모델을 이차전지 공정에 못박아 추천하지 않는다. "현장 공정 조건에 따라 스마텍에 문의"로 안내.

## 글에서 쓰지 않을 것
- 이차전지 전용 특정 모델 추천(예: "이차전지에는 GXS250/2600이 정답") — 근거 없음.
- 정량적 총소유비용 비교(%나 원화 절감액) — 출처에 수치 없음.
- NMP 용제나 DRYVAC 계열(Leybold 전용 제품) 수치를 Edwards/GXS 설명에 섞어 쓰지 않는다(제조사 혼용 금지).

## 참고 소스
- ✅ [Edwards — Why are dry pumps better for Li-ion battery electrolyte degassing?](https://www.edwardsvacuum.com/en-us/knowledge/applications/why-are-dry-pumps-better-for-li-ion-battery-electrolyte-degassing)
- ✅ [Edwards — Lithium-Ion Battery Production](https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-markets/energy-solutions/lithium-ion-battery-production)
- ✅ [Edwards GXS 브로슈어 PDF](https://www.edwardsvacuum.com/content/dam/brands/edwards-vacuum/general-vacuum/downloads/dry-screw-pumps/edwards-GXS-dry-pumps-product-brochure.pdf) (스마텍 내부 저장본 `data/Product_master_table/7.산업용드라이펌프_GXS Dry.txt`)
- ⚠️ Leybold Lithium-Ion Batteries 페이지 — 열람했으나 DV4000/DRYVAC 등 Leybold 전용 제품명이라 Edwards 계열 글에는 인용하지 않음
