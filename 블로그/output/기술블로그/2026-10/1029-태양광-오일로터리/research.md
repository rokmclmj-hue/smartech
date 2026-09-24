# 태양광 패널 생산 라인의 오일로터리 백킹펌프 선택 — 리서치

> 리서치 기준일: 2026년 9월 24일
> 허용 소스: Leybold ✅ 2개 / 스마텍 내부 자료(E2M/RV 데이터시트) ✅
> 상담기록·현장사진 폴더 비어 있음.

## 핵심 질문
- 태양광 제조 공정 전체가 오일로터리(오일씰) 펌프만 쓰는 것은 아니다. 공정 단계별로 오일로터리·드라이가 나뉘어 쓰이며, 이번 글은 **오일로터리(백킹) 펌프가 실제로 쓰이는 지점과 그 이유**, 그리고 최근 순도가 중요한 공정에서는 드라이로 넘어가는 흐름까지 균형 있게 정리한다.

## 오일로터리 펌프가 표준으로 쓰이는 공정
- Leybold: SOGEVAC 오일씰 로터리베인 펌프는 대형 건축용 유리 코팅 인라인 PVD 시스템에서 오일씰 표준 펌프다. ✅ "SOGEVAC oil-sealed rotary vane pumps are the oil-sealed standard on huge architectural glass coating inline PVD systems." [Leybold — Solar Technology](https://www.leybold.com/en/applications-and-industries/solar-technology)
- Leybold: TRIVAC(PFPE 버전)은 태양광 결정 성장(잉곳 성장, crystal pulling & growing) 공정, 특히 실리콘카바이드 응용에서 오일씰 표준 솔루션이다. ✅ "TRIVAC - PFPE versions are the standard oil-sealed solution for solar crystal pulling & growing and especially for silicon carbide applications." (같은 자료)
- 부스터(루츠블로워) RUVAC는 시스템 규모에 따라 250~7,000 m³/h 범위로 제공된다. ✅ "from 250 up to 7000 m³/h" (같은 자료)

## 순도가 중요한 공정에서는 드라이로 이동
- Leybold: 태양광 제조에서 "순도와 오일 프리 솔루션이 필수적"이라고 설명하며, 드라이(무오일) 압축 펌프는 오일 배출이 없어 오일이 공정 쪽으로 넘어갈 위험을 피한다고 설명한다. ✅ "Purity and oil-free solutions are essential" / "Dry-compressing pumps are oil emission-free and avoid the potential risk of oil migration." (같은 자료)
- 박막(PECVD/PVD) 공정, 특히 CIGS·CdTe·헤테로접합(HJT) 박막 코팅 공정에 쓰이는 가스는 DRYVAC(드라이 스크류) 펌프가 처리한다. ✅ "gases used in PECVD and PVD thin film coating processes like CIGS, CdTe and Hetero Junction." (같은 자료)
- 로드락(load lock)을 빠르게 배기해야 하는 경우에는 Leybold가 POWERBOOST 시스템을 별도로 개발했으며, 이 경우도 오일씰보다 드라이 스크류(DRYVAC/RUVAC) 쪽이 강조된다. ✅ [Leybold — Solar Coating](https://www.leybold.com/en-us/applications-and-industries/solar-technology/solar-coating) "For fast load lock pumping, Leybold has specifically developed its POWERBOOST system." / "The DRYVAC excels here, as it's hermetically sealed, and the pump materials are specifically selected to handle such processes" (먼지·유독 도핑가스를 다루는 HJT 공정 맥락)

## 스마텍 취급 제품과의 연결
- 스마텍이 취급하는 Edwards E2M 시리즈(중대형 오일로터리베인)는 데이터시트의 적용 공정(Applications) 목록에 "Coating"이 명시돼 있고, FX 변형(PFPE 윤활유 사용, 산소농도 21% 초과 환경 호환)을 별도로 제공한다. ✅ 스마텍 내부 `data/Product_master_table/2.오일펌프_중대형E2M.txt` (Edwards 공식 데이터시트 원문). 이는 위에서 설명한 "코팅 공정+PFPE 오일" 조합과 원리적으로 같은 방향이나, 이 데이터시트 자체가 "태양광"을 명시하지는 않는다는 점을 밝힌다.
- 스마텍이 취급하는 소형 RV 시리즈도 산소가 풍부한 환경을 위한 PFPE 사양 옵션을 제공한다. ✅ 같은 폴더 `1.오일펌프_소형RV.txt` "For oxygen rich applications PFPE prepared pumps are also available."
- GXS 드라이 스크류 펌프의 적용 공정 목록에는 "태양광"이 명시적으로 포함된다(9/23 이차전지 글 리서치에서도 확인). ✅ 스마텍 내부 `data/Product_master_table/7.산업용드라이펌프_GXS Dry.txt`.

## 이번 글에서 결론적으로 전달할 균형
1. 태양광 제조에서 오일로터리(오일씰) 펌프는 여전히 "표준"으로 쓰이는 지점이 있다 — 대형 유리 코팅 인라인 PVD, 결정 성장 공정.
2. 다만 순도·청정도가 중요한 박막 공정(CIGS·CdTe·HJT)이나 빠른 로드락 배기에는 드라이 스크류가 강조되는 추세다.
3. 오일로터리를 쓸 때는 오일 종류(일반 vs PFPE)가 산소·공정가스 호환성에 영향을 준다는 점이 선택 기준의 핵심이다.

## 글에서 쓰지 않을 것
- "태양광 라인은 전부 오일로터리를 쓴다" 또는 "전부 드라이로 바뀌었다"는 식의 단정 — 자료는 공정별로 나뉜다고 설명한다.
- 스마텍 E2M/RV 데이터시트에 없는 "태양광 전용" 문구를 있는 것처럼 서술하지 않는다 — Coating 적용만 명시돼 있음을 정확히 구분.
- RUVAC 250~7,000 m³/h를 특정 모델 추천처럼 쓰지 않는다 — 부스터 규모 범위 설명으로만 인용.

## 참고 소스
- ✅ [Leybold — Solar Technology](https://www.leybold.com/en/applications-and-industries/solar-technology)
- ✅ [Leybold — Solar Coating](https://www.leybold.com/en-us/applications-and-industries/solar-technology/solar-coating)
- ✅ 스마텍 내부 `data/Product_master_table/2.오일펌프_중대형E2M.txt`, `1.오일펌프_소형RV.txt`, `7.산업용드라이펌프_GXS Dry.txt`
