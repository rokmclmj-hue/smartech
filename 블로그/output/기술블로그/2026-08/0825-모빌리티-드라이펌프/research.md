# 전기차 배터리·모터 제조 라인 드라이펌프 리서치

> 리서치 기준일: 2026년 8월 25일
> 허용 소스 수: 3개 / 참고 소스 수: 0개

---

## 기존 이차전지(04) 글과의 차별화 방향

`기술블로그/2026-06/이차전지-PFPE-오일-선택법-20260606`에서 이미 다룬 내용(반복 금지):
- 배터리 셀 제조 단계별 진공 요구사항(슬러리 혼합~화성) 표
- 전해액 디개싱 0.1 mbar 요구치, GXS 드라이펌프의 NMP 내성
- PFPE 오일 vs 일반 오일 비교

이번 글(17.차세대 모빌리티)의 차별화 포커스:
- **셀 단위가 아니라 완성차 생산라인 단위**로 확장 — 배터리 팩 조립 후 기밀 시험, 전동 모터(e-모터) 권선 함침 공정
- 이차전지 글이 다루지 않은 **배터리 팩(모듈 단위) 헬륨 리크 테스트**와 **e-모터 진공함침(VPI)** 두 축으로 구성

---

## 1. 배터리 팩 헬륨 리크 테스트

리튬이온 배터리 생산은 물론 다양한 산업에서 헬륨 리크 테스트가 활용되며, "진공법"과 "스니퍼법" 두 가지 방식으로 정밀하게 누설을 검출한다 ✅ [Leybold — Helium leak detection]

배터리 팩은 냉각수 라인과 하우징 밀봉이 완벽해야 주행 중 침수·누액 사고를 막을 수 있다. 팩 조립 후 헬륨을 채우고 진공 챔버에서 헬륨 리크디텍터로 미세 누설을 검출하는 방식이 산업 전반의 표준적인 접근이다 ✅ [Leybold — How are helium leak detectors used for integral leak tests]

## 2. e-모터(전동 모터) 진공함침(VPI) — 원리만 확인, 수치는 확인 불가

전기차 구동 모터의 고정자(스테이터) 권선에는 절연·방열을 위해 바니시를 함침하는 공정이 있으며, 이 과정에서 권선 내부 공극을 완전히 채우기 위해 진공으로 공기를 제거한 뒤 바니시를 주입하는 방식이 쓰인다는 것이 일반적으로 알려진 공정 원리다. ⚠️ 구체적 진공도(mTorr/mbar) 수치는 이번 리서치의 허용 소스(Edwards/Pfeiffer/Leybold 공식 자료)에서 확인하지 못함 — 특허 문서에서만 확인됨(화이트리스트 외) → 본문에 수치 인용 금지, 원리 설명만 사용.

## 3. Edwards의 배터리 제조 단계 재확인 (팩 레벨 문맥용)

Edwards는 슬러리 혼합, 전극 건조, 전해액 주입, 진공 디개싱, 셀 진공 봉합, 화성까지 리튬이온 배터리 생산 전 단계에 최적화된 드라이 진공 솔루션을 제공해 왔다고 밝히고 있다 ✅ [Edwards Vacuum — Energy Solutions]. 이 셀 단위 공정은 이미 이차전지(04) 글에서 다뤘으므로 본문에서는 배경 설명 1~2문장으로만 축약 인용하고, 팩·모터 단위로 초점을 옮긴다.

## 확인 불가 항목
- e-모터 VPI 공정의 구체적 진공도(mTorr) 수치 — 특허 문서 외 화이트리스트 소스 미확인
- 국내 완성차·부품사의 실제 배터리 팩 리크테스트 장비 도입 사례 — 확인 불가

## 현장 사례 (상담기록)
이번 주제와 직접 연결된 8월 상담기록 없음. 기존에 스마텍이 취급하는 ELD500(헬륨 리크디텍터) 제품이 이미 블로그에 소개된 바 있어(`기술블로그/2026-06/ELD500W-리크디텍터-20260601`), 이번 글에서는 그 제품의 적용 산업 사례로 배터리 팩 리크테스트를 연결하는 방식으로만 짧게 언급(제품 재설명은 반복하지 않음).

---

## 참고 소스

- ✅ [Leybold — Helium leak detection](https://www.leybold.com/en-us/applications-and-industries/helium-leak-detection)
- ✅ [Leybold — How are helium leak detectors used for integral leak tests](https://www.leybold.com/en-in/knowledge/vacuum-fundamentals/leak-detection/using-helium-for-integral-leak-tests)
- ✅ [Edwards Vacuum — Energy Solutions](https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-markets/energy-solutions)
- ⚠️ 특허 문서(VPI 공정 수치) — 참고만, 수치 미사용
