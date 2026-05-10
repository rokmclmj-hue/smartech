# Smartech 디자인 레퍼런스 문서

> **목적**: 스마텍(진공펌프 B2B, Edwards Vacuum 한국 공식 대리점)의 웹사이트를 세계 최고 수준의 산업용품 B2B 사이트와 동등한 UX/UI 품질로 끌어올리기 위한 설계도.
> **사용처**: 다른 개발 에이전트(Front/Back/UI 구현)들이 컴포넌트·페이지·플로우를 만들 때 참고하는 단일 출처(Single Source of Truth).
> **작성 기준일**: 2026-05-10
> **분석 대상**: Grainger, McMaster-Carr, Misumi, RS Components, ThomasNet
> **핵심 기조**: "꾸미지 말고, 빠르게 찾고, 정확히 견적 보내라."

---

## 0. 한 줄 요약 — 스마텍이 따라야 할 디자인 원칙

| 원칙 | 출처 | 스마텍 적용 |
|---|---|---|
| **Utility > Decoration** | McMaster-Carr | 화려한 배너·캐러셀·애니메이션 금지. 검색·스펙·견적 버튼이 무조건 가장 빠름. |
| **Parametric Filter** | McMaster-Carr / Misumi | 진공도(Pa), 배기속도(m³/h), 펌프 타입, 전압 등 정량 스펙으로 좌측 필터 구성. |
| **Add-by-SKU 빠른 입력** | Grainger | 재구매 고객(딜러)을 위해 모델명/SKU 직접 입력 → 바로 견적함 추가. |
| **Quote Basket(견적함)** | Optimizely / Salesforce 260 | "장바구니"가 아니라 "견적 바구니". 결제 버튼 없음. CTA는 [견적 요청]. |
| **Tiered Pricing** | Virto / BigCommerce | 로그인 등급(Enduser/일반딜러/Key딜러/OEM)에 따라 가격 자동 표시. 비로그인은 가격 숨김 + "로그인 후 가격 보기". |
| **승인 대기 회원가입** | SparkLayer / WooCommerce B2B | 가입 즉시 승인 X. 관리자 승인 후 등급 부여. 대기 중에는 카탈로그만 열람. |
| **Mobile First (필드 영업)** | Hum Commerce | 영업사원·엔지니어가 현장에서 폰으로 견적 추가·발송. 클릭콜·견적요청 버튼 항상 노출. |

---

## 1. 사이트별 핵심 패턴 분석

### 1-1. Grainger (grainger.com) — 미국 1위 산업용품

**참고 스크린샷·자료**
- Baymard UX Case Study: https://baymard.com/ux-benchmark/case-studies/grainger
- Medusa.js 분석: https://medusajs.com/blog/top-5-b2b-ecommerce-sites-grainger/
- ecommerceinsiders 분석: https://ecommerceinsiders.com/ecommerce-websites-grainger-b2b-retail-2213/

**핵심 패턴**
1. **메인 홈** — 상단 검색바가 화면의 거의 1/3 차지. 플레이스홀더에 "model number, part number 입력 가능" 명시. 그 아래 "최근 본 상품(Recently Viewed)"이 [장바구니 추가] 버튼과 함께 노출.
2. **Add-by-SKU** — 글로벌 네비게이션 바 자체에 "주문번호로 바로 담기" 입력창. 재구매 비율이 높은 B2B 특성을 가장 잘 반영.
3. **검색 자동완성** — 입력 중 실시간으로 ① 키워드 추천 ② 추천 상품 카드 ③ 상품 카테고리 ④ 브랜드 4개 영역 분리 표시.
4. **좌측 필터** — 상단에 업종별 use case 필터(예: "Healthcare에서 자주 쓰는") → 그 다음 스펙 필터 → 가장 아래에 가격·리뷰. "스펙으로 먼저 좁히고 가격은 마지막에 본다"는 B2B 구매 심리 반영.
5. **재고 라이브 표시** — 상품 카드에서 바로 재고 수량 + 가까운 지점 보기.

**스마텍 적용 포인트**
- 헤더에 `[모델명/품번 직접 입력 → 견적함 담기]` 인풋 상시 배치(모바일 포함).
- 로그인 후 메인에 "최근 본 펌프", "이전 견적 다시 보내기" 카드 노출.
- 검색 자동완성: 모델(E2M28, nXDS10i 등) / 카테고리(로터리/스크류/터보) / 브랜드(Edwards / 호환부품) 4분할.

---

### 1-2. McMaster-Carr (mcmaster.com) — UX 교과서

**참고 자료**
- 분석 1 (Unmatched Style): https://unmatchedstyle.com/news/the-relentless-utility-of-mcmaster-carrs-website.php
- 분석 2 (Ben Edelstein): https://www.bedelstein.com/post/mcmaster-carr
- 분석 3 (Medium / 7 Key Learnings): https://medium.com/design-bootcamp/7-key-learnings-from-mcmaster-carrs-website-how-speed-and-stability-drive-great-ux-e290f7e59a5d
- HN 토론: https://news.ycombinator.com/item?id=34000502

**핵심 패턴 (스마텍이 가장 많이 베껴야 할 사이트)**
1. **그레이스케일 + 노랑/녹색 단 2개 액센트** — 팝업·캐러셀·비디오·배너 0개. 이미지조차 흑백으로 처리해 시선을 안 뺏김.
2. **카탈로그 메타포** — 종이 카탈로그를 그대로 웹으로. 카테고리 → 서브카테고리 → 스펙 표 → 상품 라인. 사용자가 "어디 있는지" 절대 헷갈리지 않음.
3. **Parametric Filter (왼쪽)** — 볼트라면 "나사산 크기, 길이, 재질, 표면처리"로 분리. 각 옵션 옆에 작은 매칭 비주얼(미니 도면) 동반.
4. **상품 상세 = 스펙 표 자체가 메인** — 큰 사진보다 표가 우선. 한 모델의 사이즈별 변형이 표 형태로 한눈에. 각 행이 곧 SKU.
5. **속도** — 페이지 로드, 검색, 필터링이 즉시. "기다린다는 느낌이 없음".

**스마텍 적용 포인트**
- 진공펌프 시리즈(예: nXDS 시리즈) 페이지는 **모델별 변형을 표(table)로 한 화면에**: 행=모델명, 열=배기속도/도달압력/전력/무게/가격(등급별)/[견적함 담기].
- 컬러: 화이트(#FFFFFF) + 그레이(#F5F5F7, #1F2937) + 액센트 1개(스마텍 브랜드 컬러). 캐러셀 금지.
- 로딩 스피너 대신 **즉시 렌더 + skeleton**. 필터는 클라이언트 사이드.

---

### 1-3. Misumi (us.misumi-ec.com) — 컨피규레이터의 정석

**참고 자료**
- 메인: https://us.misumi-ec.com/
- Configurable Component 설명: https://us.misumi-ec.com/maker/misumi/mech/tech/configurablecomponent/

**핵심 패턴**
1. **Configure Now** — 표준품을 고른 뒤 "치수·재질·표면처리·옵션"을 단계별로 입력하면 part number가 자동 생성. 80 sextillion(800해)개 조합.
2. **CAD 다운로드** — 컨피규어 끝나면 그 자리에서 2D/3D CAD 파일 다운로드.
3. **No MOQ** — 1개부터 주문 가능, 셋업 비용 없음을 첫 화면에서 강조.
4. **Application Library** — "엔지니어가 이 부품을 어디에 쓰는지" 사례집. SEO + 신뢰 확보.

**스마텍 적용 포인트**
- 진공펌프는 컨피규레이터까지 안 가도 됨. 대신 "**솔루션 셀렉터**" 도입 — 사용자에게 ① 사용 산업(반도체/제약/화학/연구소) ② 필요 진공도 ③ 배기속도 ④ 가스 종류를 묻고 추천 모델 3개 제시.
- 각 모델 페이지에 **"기술 자료실"** 탭: 카탈로그 PDF, CAD 도면, 매뉴얼, 인증서. (Edwards 공식 자료 활용)
- "추천 부속품(소모품, 오일, 필터)" 자동 매칭 — Misumi의 관련부품 추천과 동일 패턴.

---

### 1-4. RS Components (rs-online.com) — 상세 페이지의 모범

**참고 자료**
- Econsultancy CRO/UX 케이스: https://econsultancy.com/the-ultimate-ecommerce-cro-ux-case-study-rs-components/
- Baymard B2B 연구: https://baymard.com/research/b2b-electronic-components-machinery
- NN/G B2B Spec 가이드라인: https://www.nngroup.com/articles/b2b-specs/

**핵심 패턴**
1. **데이터시트 즉시 다운로드** — 상품 카드/상세에 PDF 데이터시트 링크 항상 노출. 클릭 한 번.
2. **상품 사진 ≠ 박스 사진** — 박스가 아니라 실제 내용물 사진. (RS가 CRO 개선 후 매출 상승 케이스로 유명)
3. **재고 상태 명확화** — Baymard 지적: "출고 미정 상품을 [장바구니 담기] 눌러야만 알 수 있는 건 나쁨". 카드에서 즉시 "재고 있음 / 입고 예정 / 단종" 표시.
4. **B2B Spec 5요소** (NN/G) — Footprint(크기), Ingredients(재질·구성), Requirements(필요 환경/전원), Performance(성능), Tolerances(허용오차).

**스마텍 적용 포인트**
- 상품 상세 우측 sticky 박스: ① 모델명 ② 등급별 가격 ③ 재고 상태 ④ [견적함 담기] ⑤ [기술 문의] ⑥ [데이터시트 PDF].
- 스펙 탭은 NN/G 5요소 구조로 정리:
  - **크기/무게**: 흡입구경, 외형치수(WxDxH), 무게
  - **구성/재질**: 펌프 방식, 윤활 방식, 접가스부 재질
  - **요구사항**: 전원(V/Hz), 냉각수, 설치환경
  - **성능**: 배기속도, 도달압력, 소음, 소비전력
  - **허용오차/인증**: 누설률, CE/UL/KC

---

### 1-5. ThomasNet (thomasnet.com) — RFQ(견적요청) 워크플로우

**참고 자료**
- 메인: https://www.thomasnet.com/
- RFI Tips: https://help.thomasnet.com/tips-for-developing-effective-requests-for-information

**핵심 패턴**
1. **Supplier Profile** — 공급사 페이지에 인증서, 생산능력, 카탈로그가 한 화면에 정리. 신뢰 신호 압축.
2. **Multi-supplier RFQ** — 한 번의 폼으로 여러 공급사에 동시 견적 요청.
3. **잘 쓴 RFI 가이드** — "수량, 자재, 사양, 납기, 인증요건"을 미리 채워서 요청하면 답변 품질 ↑.

**스마텍 적용 포인트**
- 스마텍은 단일 공급사이므로 multi-supplier는 불필요. 대신 견적요청 폼에 **사전 입력 필드** 강화:
  - 필수: 회사명, 담당자, 연락처, 이메일, 수량, 납기 희망일
  - 선택: 사용 환경(가스 종류·온도), 설치 일정, 기존 사용 모델, 추가 요구사항(CCC, A/S 등)
- 견적함의 각 라인에 [수량] [메모(예: 2025년 10월 납기)] 인라인 편집.

---

## 2. 스마텍 컴포넌트별 권장 디자인

### 2-1. 글로벌 헤더

```
[로고 Smartech] [카테고리▼] [솔루션▼] [기술자료] [브랜드 Edwards]      [SKU 빠른담기 ___] [🔍 검색바 (60% width)] [👤 로그인/마이] [🛒 견적함 (3)]
```

- **모바일**: 햄버거 + 검색 아이콘 + 견적함만 노출. SKU 빠른담기는 "검색바" 안에 통합.
- **로그인 후**: "👤 김철수 / Key딜러" 등급 뱃지 색상으로 표시(예: Key=골드, OEM=네이비).

### 2-2. 메인 홈

| 섹션 | 내용 | 비고 |
|---|---|---|
| 1. Hero (단순) | "진공펌프 전문, Edwards 한국 공식 대리점" + 큰 검색창 + 솔루션 셀렉터 진입 버튼 | 캐러셀 금지. 정적 1장. |
| 2. 카테고리 그리드 (3x2 또는 4x2) | 로터리베인 / 스크류 / 스크롤 / 터보분자 / 다이아프램 / 부속품 | 각 칸에 대표 이미지 + "n개 모델" 카운트 |
| 3. (로그인 시) 최근 본 / 이전 견적 다시 보내기 | Grainger 패턴 | 비로그인 시 인기 모델로 대체 |
| 4. 솔루션 셀렉터 진입 | "어떤 펌프가 필요한지 모르세요? 3가지 질문으로 추천받기" | Misumi 컨피규레이터 미니 버전 |
| 5. 신뢰 시그널 | Edwards 공식 대리점 마크, 주요 고객 로고(반도체·제약·연구소), A/S 보증 | 푸터 위 |
| 6. 푸터 | 사업자정보, 연락처, 견적·기술문의 클릭콜 | 모바일에서도 동일 |

### 2-3. 제품 목록(카테고리) 페이지

```
[좌측 필터 280px]                        [상품 영역]
- 펌프 타입 (체크박스)                    [정렬: 인기순▼  표시: 표/카드 토글]
- 배기속도 m³/h (슬라이더)                ────────────────────────
- 도달압력 Pa (슬라이더)                  ┌─ 모델 표(McMaster-Carr 스타일)
- 전압/전원 (체크박스)                    │ 모델 │ 배기속도 │ 도달압력 │ 가격 │ 재고 │ [담기]
- 적용 산업 (체크박스)                    │ E2M28│ 32 m³/h │ 1×10⁻³ │ ... │ 있음 │ [+]
- 가격대 (슬라이더)                       │ ...
- 인증 (CE/UL/KC)                         └─ 페이지네이션
```

- **표 모드 default** (B2B 비교 효율). "카드" 모드는 보조.
- 각 행에 [+ 견적함] 버튼이 있어 페이지 이동 없이 비교·담기 가능.
- 비로그인 시 가격 칸은 "🔒 로그인 후 가격 확인".

### 2-4. 제품 상세 페이지

```
[브레드크럼: 홈 > 로터리베인 > E2M 시리즈 > E2M28]

┌────────────────┬───────────────────────────┐
│                │ E2M28 Rotary Vane Pump    │
│ [상품 이미지]  │ Edwards | SKU: A37117984  │
│ [썸네일 4장]   │ ★★★★☆ (12 리뷰)          │
│ [3D/CAD 보기]  │                            │
│                │ ────────────────────────  │
│                │ 등급별 가격 (로그인 시):  │
│                │  Enduser  ₩2,400,000      │
│                │  일반딜러 ₩2,160,000  -10%│
│                │  Key딜러  ₩1,920,000  -20%│ ← 본인 등급 강조
│                │  OEM      별도 협의       │
│                │                            │
│                │ 재고: ✅ 즉시 출고 가능   │
│                │ 납기: 영업일 3-5일       │
│                │                            │
│                │ 수량 [- 1 +]              │
│                │ ┌──────────────────────┐ │
│                │ │ [+ 견적함 담기]       │ │ ← Primary CTA
│                │ │ [📞 기술 문의]        │ │
│                │ │ [📄 데이터시트 PDF]  │ │
│                │ └──────────────────────┘ │
└────────────────┴───────────────────────────┘

[탭] 개요 | 스펙 | 기술자료 | 호환 부속품 | A/S
- 스펙: NN/G 5요소(크기/구성/요구/성능/허용오차)
- 기술자료: PDF 카탈로그, CAD, 매뉴얼, 인증서
- 호환 부속품: 오일, 필터, 가스켓 자동 추천 + 일괄 담기
- A/S: 보증기간, 정기점검 안내, 수리 견적 요청
```

- **우측 견적 박스는 sticky** (스크롤해도 항상 보임).
- 등급별 가격은 4줄 모두 표시하되 본인 등급만 굵게/배경색으로 강조 → 딜러에게 "내가 받는 혜택"을 시각적으로 각인.

### 2-5. 견적함(Quote Basket) — 가장 중요

> ⚠️ 일반 이커머스의 "장바구니"가 아닙니다. 결제 버튼 절대 금지.

```
견적함 (3)                                    [전체 비우기]

┌───────────────────────────────────────────┐
│ ☑ E2M28 Rotary Vane Pump                  │
│   수량 [- 1 +]   메모 [2025년 10월 납기..] │
│   가격(Key딜러): ₩1,920,000               │
│                                  [라인 삭제]│
├───────────────────────────────────────────┤
│ ☑ 호환 진공오일 Ultragrade 19 (1L) x 2    │
│   ...                                      │
└───────────────────────────────────────────┘

소계(부가세 별도): ₩X,XXX,XXX
※ 최종 견적은 운송비·납기에 따라 조정될 수 있습니다.

┌────────────────────────────────┐
│ [➡ 견적 요청서 작성하기]      │ ← Primary CTA, 풀폭
└────────────────────────────────┘

[📥 견적함 PDF로 저장] [💾 임시저장 후 나중에]
```

**견적 요청 플로우 (4단계, ThomasNet RFI 가이드 + Salesforce 260 패턴)**

1. **Step 1 — 품목 확인**: 견적함의 모델·수량·메모 최종 확인
2. **Step 2 — 요청자 정보**: 회사명/담당자/연락처/이메일/배송지 (로그인 시 자동 채움)
3. **Step 3 — 추가 요구사항**: 납기 희망일, 사용환경(가스/온도), 설치 일정, 기존 사용 모델, 메모
4. **Step 4 — 검토 후 제출**: 한 화면에 전체 요약 → [견적 요청 보내기]

제출 즉시:
- 사용자에게 "접수번호 #Q-2026-0510-001" 화면 + 이메일 자동 발송
- 마이페이지 "내 견적" 목록에 **상태 뱃지** 추가: `접수됨 → 검토중 → 견적 발송됨 → 주문확정 → 납기확인 → 출고`
- 관리자에게 Slack/이메일 알림

### 2-6. 회원가입/로그인 (B2B 특화)

**로그인 화면**: 단순 — 이메일 + 비밀번호. "회원가입" / "비밀번호 찾기" 링크.

**회원가입 폼 (필수 필드)**:
- 회사명 *
- 사업자등록번호 * (10자리, 형식 검증)
- 사업자등록증 첨부 * (PDF/JPG, 5MB 이하)
- 대표자명 *
- 담당자명 *
- 담당자 직책 / 부서
- 이메일 * (이게 로그인 ID)
- 비밀번호 * / 확인 *
- 휴대폰 * (인증)
- 회사 전화 *
- 회사 주소 * (도로명 검색)
- 업종 (드롭다운: 반도체/제약/화학/연구소/기타) — **등급 추천에 활용**
- 월 평균 구매 예상 (선택, 등급 산정 참고)
- 추천인/거래처 코드 (선택)
- [✓] 약관 동의 / 개인정보 / (선택) 마케팅

**가입 직후**:
- "승인 대기" 상태로 가입 완료 화면
- 로그인은 가능하지만 가격 표시 X, 견적함은 사용 가능
- 안내 메시지: "관리자 승인 후 1영업일 내 등급이 부여됩니다"
- 관리자에게 신규 가입 알림

### 2-7. 마이페이지

좌측 메뉴 / 우측 컨텐츠:
- **대시보드**: 진행 중 견적 n건, 최근 주문, 추천 부속품
- **내 견적**: 상태별 필터, 검색, 재발송, 복제
- **내 주문**: 납기 확인 상태, 송장번호, 인수증
- **즐겨찾기 모델**
- **재구매 (1-Click)**: 이전 견적/주문 그대로 다시 보내기 (Grainger 패턴)
- **회사 정보**: 등급(읽기 전용), 거래처 정보, 추가 담당자 초대
- **A/S 신청**

---

## 3. 색상 / 타이포그래피 / 레이아웃

### 3-1. 컬러 시스템 (McMaster-Carr 그레이스케일 + Edwards 블루)

```
/* Neutrals — 90% 사용 */
--gray-50:  #F9FAFB    /* 배경 */
--gray-100: #F3F4F6    /* 카드 배경, 호버 */
--gray-200: #E5E7EB    /* 보더 */
--gray-400: #9CA3AF    /* 보조 텍스트 */
--gray-600: #4B5563    /* 본문 */
--gray-900: #111827    /* 제목 */

/* Primary — Edwards 브랜드 블루 계열 */
--primary-600: #1E40AF /* CTA 버튼 (견적함 담기, 견적 요청) */
--primary-700: #1E3A8A /* 호버 */

/* Status */
--success: #16A34A     /* 재고 있음, 견적 발송됨 */
--warning: #F59E0B     /* 입고 예정, 검토중 */
--danger:  #DC2626     /* 단종, 거절 */
--info:    #0EA5E9     /* 안내 */

/* Tier Badges (등급 시각화) */
--tier-enduser: #6B7280  /* 회색 */
--tier-dealer:  #16A34A  /* 녹색 */
--tier-key:     #D97706  /* 골드 */
--tier-oem:     #1E3A8A  /* 네이비 */
```

**원칙**: 90%는 그레이, 10%만 컬러. 액센트는 CTA·상태·등급 뱃지에만.

### 3-2. 타이포그래피

```
/* Font Family */
--font-sans: "Pretendard", "Noto Sans KR", -apple-system, sans-serif;
--font-mono: "JetBrains Mono", monospace;  /* SKU, 모델명 표시 */

/* Scale (1.25 Major Third) */
--text-xs:   12px / 16px   /* 라벨, 캡션 */
--text-sm:   14px / 20px   /* 본문 보조 */
--text-base: 16px / 24px   /* 본문 */
--text-lg:   18px / 28px   /* 강조 본문 */
--text-xl:   20px / 28px   /* 카드 제목 */
--text-2xl:  24px / 32px   /* 섹션 제목 */
--text-3xl:  30px / 36px   /* 페이지 제목 */
--text-4xl:  36px / 40px   /* Hero */
```

- 모델명·SKU·스펙 수치는 **mono 폰트** (`A37117984` 같은 코드의 가독성 확보).
- 한글 본문은 Pretendard, 영문 폰트 fallback 자동.

### 3-3. 레이아웃 그리드

- **데스크톱**: 12컬럼, max-width 1280px, gutter 24px.
- **태블릿** (768~1023px): 8컬럼, gutter 16px.
- **모바일** (~767px): 4컬럼, gutter 16px, 좌우 padding 16px.
- 카드 라운드: 8px (보수적). 그림자: `0 1px 2px rgba(0,0,0,0.05)` 최소 사용.

---

## 4. 견적 시스템 UX 최적안 (스마텍 핵심 워크플로우)

```
┌─ 카탈로그 탐색 ──────────────────────────────────────────────┐
│ 검색 / 카테고리 / 솔루션 셀렉터로 모델 찾기                  │
└──────┬───────────────────────────────────────────────────────┘
       ▼
┌─ 상품 상세 ──────────────────────────────────────────────────┐
│ 스펙 비교, 데이터시트 다운로드, 등급별 가격 확인              │
│ [+ 견적함 담기] (수량·메모 입력)                              │
└──────┬───────────────────────────────────────────────────────┘
       ▼
┌─ 견적함 ─────────────────────────────────────────────────────┐
│ 여러 모델·소모품 일괄 관리, 라인별 메모, 임시저장 가능        │
│ [➡ 견적 요청서 작성]                                         │
└──────┬───────────────────────────────────────────────────────┘
       ▼
┌─ 4-Step 견적 요청 ──────────────────────────────────────────┐
│ 1.품목확인 → 2.요청자정보 → 3.추가요구 → 4.검토&제출        │
└──────┬───────────────────────────────────────────────────────┘
       ▼
┌─ 접수 완료 ─────────────────────────────────────────────────┐
│ 화면: 접수번호 #Q-2026-0510-001 + 진행상태 안내              │
│ 자동: 고객·관리자에게 이메일/Slack 알림                       │
└──────┬───────────────────────────────────────────────────────┘
       ▼
┌─ 관리자 처리 ───────────────────────────────────────────────┐
│ 어드민에서 검토 → 가격·납기 확정 → PDF 견적서 자동 생성      │
│ [견적서 발송] 버튼 → 고객에게 이메일 + 마이페이지 업데이트   │
└──────┬───────────────────────────────────────────────────────┘
       ▼
┌─ 고객 확인 → 주문 확정 ─────────────────────────────────────┐
│ 마이페이지에서 PDF 다운로드 + [주문 확정] 버튼                │
│ 주문확정 후 → 납기확인 단계 → 출고                            │
└──────────────────────────────────────────────────────────────┘
```

**상태 뱃지(고객·관리자 공통 시각 언어)**

| 상태 | 색상 | 뱃지 |
|---|---|---|
| 접수됨 | gray-400 | `접수됨` |
| 검토중 | warning(amber) | `검토중` |
| 견적 발송됨 | info(blue) | `견적 발송됨` |
| 주문 확정 | primary | `주문 확정` |
| 납기 확인 | warning | `납기 확인 중` |
| 출고 완료 | success | `출고 완료` |
| 거절/취소 | danger | `취소됨` |

---

## 5. 관리자 대시보드 레이아웃 최적안

### 5-1. 좌측 사이드바 메뉴

```
[Smartech Admin]
─────────────
📊 대시보드
📝 견적 관리           ← 가장 많이 쓰는 메뉴, 상단 배치
   - 신규 접수 (5)
   - 검토중 (12)
   - 발송됨 (45)
🛒 주문 관리
   - 신규 주문 (3)
   - 납기 확인
   - 출고 대기
👥 고객 관리
   - 승인 대기 (2)    ← 빨간 뱃지로 강조
   - 전체 고객
   - 등급 관리
📦 상품 관리
   - 카탈로그
   - 재고
   - 가격(등급별)
📈 통계 / 리포트
🛠 A/S 관리
⚙️ 설정
```

### 5-2. 메인 대시보드 (UXPin/Medium 권장 패턴)

**상단 (Above the fold) — KPI 카드 4개**
1. 오늘 신규 견적 요청 (+전일 대비 %)
2. 처리 대기 견적 (SLA 임박 건 강조)
3. 이번 달 발송 견적 / 전환율 %
4. 이번 달 주문 확정 금액

**중앙 영역 (좌우 2분할)**
- 좌: "처리 대기 견적 큐" — 접수일/요청자/금액/대기시간(SLA)/[처리하기] 버튼
- 우: "신규 가입 승인 대기" — 회사명/사업자번호/등록증 미리보기/[승인]/[등급 부여]

**하단**
- 라인 차트: 최근 30일 견적 요청 추이
- 막대 차트: 카테고리별 견적 금액
- 테이블: 최근 활동 로그 (감사 추적)

### 5-3. 견적 상세 처리 화면 (가장 중요한 어드민 페이지)

```
┌─ 견적 #Q-2026-0510-001 ────────── 상태: 검토중 ▼ ─┐
│ 요청자: ABC반도체 / 김철수 (Key딜러)                │
│ 요청일: 2026-05-10 14:32   대기: 2시간 18분 (SLA 4h)│
├─────────────────────────────────────────────────────┤
│ 품목 (편집 가능)                                     │
│ ┌─ E2M28  수량 1  단가 ₩1,920,000  소계 ₩1,920,000│
│ │ [할인%] [메모(내부용)]                            │
│ └─ Ultragrade 19 1L  수량 2  ...                   │
│                                                      │
│ 운송비 [_______] 부가세 [_______] 합계 ₩X,XXX,XXX   │
│ 납기 [영업일 ___일]  유효기간 [____년__월__일]      │
├─────────────────────────────────────────────────────┤
│ 고객 메모: "2025년 10월 납기 필요"                  │
│ 내부 메모: [_____________________]                   │
├─────────────────────────────────────────────────────┤
│ [PDF 미리보기] [📧 견적서 발송] [거절] [복제]       │
└─────────────────────────────────────────────────────┘
```

- 한 화면에서 모든 처리 가능 (페이지 이동 최소화).
- 발송 버튼은 우측 하단 sticky.
- 변경 사항은 자동 저장 + 감사 로그.

### 5-4. 고객 등급 승급 화면

- 고객 카드: 회사 정보, 누적 거래액(자동 계산), 현재 등급, 가입일
- [등급 변경] 드롭다운: Enduser → 일반딜러 → Key딜러 → OEM
- 변경 시 사유 입력 필수, 자동으로 고객에게 안내 메일 발송.

---

## 6. 모바일 반응형 권장 패턴

### 6-1. 헤더 (모바일)

```
[☰]  [Smartech]               [🔍] [🛒3] [👤]
     ──────────────────────────────────────
     [통합 검색바 (SKU 빠른담기 통합)]
```

### 6-2. 카테고리 페이지 (모바일)

- 좌측 필터 → **하단 슬라이드업 시트**(`Filter` 버튼 탭하면 등장).
- 표 모드 default가 아니라 **카드 모드 default** (모바일에선 표가 가독성↓).
- 카드: 사진(좌) + 모델명·핵심스펙·가격·재고·[+ 담기](우) 가로 레이아웃.
- 무한 스크롤 + "맨 위로" 플로팅 버튼.

### 6-3. 상품 상세 (모바일)

- 이미지 풀폭 → 제목/가격/재고 → **고정 하단 바**(`[+ 견적함]` `[기술 문의]` 2분할 sticky).
- 탭(개요/스펙/자료/A/S)은 가로 스크롤 + 클릭 시 해당 섹션으로 부드러운 스크롤.
- 스펙 표는 가로 스크롤 가능하게.

### 6-4. 견적함 / 견적 요청 (모바일)

- 4-Step 폼은 **한 단계당 한 화면** 원칙. 진행률 바 상단 노출.
- 상단/하단에 [이전] [다음] 버튼 sticky.
- 사업자등록증 첨부는 카메라 직접 촬영 옵션 노출.

### 6-5. 핵심 모바일 원칙 (Hum Commerce, BigCommerce 인용)

- 페이지 로드 **3초 이내** (60% B2B 구매자가 느린 사이트에서 이탈).
- 폰트 최소 **16px** (자동 확대 방지).
- 터치 타겟 **44x44px** 이상.
- **클릭콜 버튼**(`tel:`) 푸터에 항상 노출 — 현장 영업/엔지니어용.
- 오프라인 캐시: 견적함 임시저장은 LocalStorage 백업.

---

## 7. 접근성 / 성능 체크리스트 (필수)

- [ ] 모든 인터랙티브 요소 키보드 접근 가능
- [ ] 컬러 대비 WCAG AA 이상 (본문 4.5:1, 큰 텍스트 3:1)
- [ ] 이미지 `alt` 텍스트 — 특히 펌프 이미지엔 모델명 포함
- [ ] 폼 라벨 `<label for>` 명시적 연결
- [ ] 에러 메시지는 색상만이 아니라 아이콘 + 텍스트로
- [ ] LCP < 2.5s, CLS < 0.1, INP < 200ms
- [ ] Next.js `Image` 컴포넌트로 lazy load + WebP 자동 변환
- [ ] 카탈로그·견적 데이터는 ISR/SSR 적절히 분리

---

## 8. 구현 우선순위 (개발 에이전트용)

### Phase 1 (MVP, 4주)
1. 카탈로그 표 형태 목록 페이지 + 좌측 파라메트릭 필터
2. 상품 상세 + sticky 견적 박스 + 등급별 가격 표시
3. 견적함(Quote Basket) + 4-Step 견적 요청 폼
4. 회원가입(승인 대기) + 로그인 + 등급 시스템
5. 어드민: 견적 처리 화면 + 고객 승인 + PDF 견적서 자동 생성·발송

### Phase 2 (4주)
6. 솔루션 셀렉터(3-step 추천)
7. 마이페이지 재구매(1-Click)
8. 모바일 최적화(필터 시트, sticky CTA, 클릭콜)
9. 어드민 대시보드 KPI + 차트
10. 통계 리포트, A/S 모듈

### Phase 3 (선택)
- 호환 부속품 자동 추천
- 다국어(한/영)
- ERP 연동(재고/단가 실시간)
- 고객별 즐겨찾기 카탈로그

---

## 9. 출처

### Grainger
- [Baymard UX Case Study](https://baymard.com/ux-benchmark/case-studies/grainger)
- [Top 5 B2B Ecommerce sites: Grainger - Medusa.js](https://medusajs.com/blog/top-5-b2b-ecommerce-sites-grainger/)
- [Best eCommerce Websites: Grainger - ecommerceinsiders](https://ecommerceinsiders.com/ecommerce-websites-grainger-b2b-retail-2213/)
- [B2B Ecommerce Strategies from Grainger & Amazon - venue.cloud](https://venue.cloud/news/insights/b2b-e-commerce-ux-what-grainger-and-amazon-get-right)

### McMaster-Carr
- [The Relentless Utility of McMaster-Carr's Website - Unmatched Style](https://unmatchedstyle.com/news/the-relentless-utility-of-mcmaster-carrs-website.php)
- [McMaster Carr - The Smartest Website You Haven't Heard of - Ben Edelstein](https://www.bedelstein.com/post/mcmaster-carr)
- [7 Key Learnings from McMaster-Carr's Website - Medium](https://medium.com/design-bootcamp/7-key-learnings-from-mcmaster-carrs-website-how-speed-and-stability-drive-great-ux-e290f7e59a5d)
- [Best ecommerce UX practices from mcmaster.com - Hacker News](https://news.ycombinator.com/item?id=34000502)
- [Mastering Site Search with McMaster-Carr - PINT Blog](https://blog.pint.com/mastering-site-search-with-mcmaster-carr/)

### Misumi
- [MISUMI USA Main](https://us.misumi-ec.com/)
- [The Configurable Component - MISUMI](https://us.misumi-ec.com/maker/misumi/mech/tech/configurablecomponent/)
- [MISUMI's Configurable Solution](https://us.misumi-ec.com/misumi-configurable-solution/)
- [MISUMI Application Example Library](https://us.misumi-ec.com/eglib/)

### RS Components
- [The ultimate ecommerce CRO & UX case study: RS Components - Econsultancy](https://econsultancy.com/the-ultimate-ecommerce-cro-ux-case-study-rs-components/)
- [Baymard B2B Components & Machinery Ecommerce UX Research](https://baymard.com/research/b2b-electronic-components-machinery)
- [B2B Electronics Sites: 2 High-Level Takeaways - Baymard](https://baymard.com/blog/b2b-electronic-components-machinery-launch)
- [B2B Product Specifications Guidelines - NN/G](https://www.nngroup.com/articles/b2b-specs/)

### ThomasNet
- [Thomasnet Main](https://www.thomasnet.com/)
- [Tips for writing effective RFIs - Thomasnet Help](https://help.thomasnet.com/tips-for-developing-effective-requests-for-information)
- [Understanding ThomasNet - Oreate AI](https://www.oreateai.com/blog/understanding-thomasnet-your-gateway-to-industrial-sourcing/66897ede0e83ba26098121cd308511aa)

### B2B 일반 (RFQ, 회원가입, 대시보드, 모바일)
- [B2B eCommerce Glossary: RFQ - ChannelSoftware](https://www.channelsoftware.com/glossary/rfq)
- [Salesforce RFQ Enhancements Release 260 - SmartHub](https://www.smarthubtech.com/blog/salesforce-request-for-quote-release-260)
- [B2B eCommerce Quote Management - Virto Commerce](https://virtocommerce.com/blog/b2b-ecommerce-quote-management)
- [B2B registration forms - SparkLayer](https://www.sparklayer.io/blog/2023/01/24/b2b-registration-form-shopify/)
- [Multi-Tier Pricing for B2B eCommerce - Virto](https://virtocommerce.com/blog/multi-tier-pricing-b2b-ecommerce)
- [How to Create a B2B Registration Form with Admin Approval](https://onlinemoneyspinner.com/how-to-create-a-b2b-registration-form-with-admin-approval/)
- [Admin Dashboard UI/UX Best Practices for 2025 - Medium](https://medium.com/@CarlosSmith24/admin-dashboard-ui-ux-best-practices-for-2025-8bdc6090c57d)
- [Effective Dashboard Design Principles for 2025 - UXPin](https://www.uxpin.com/studio/blog/dashboard-design-principles/)
- [How to Build a Mobile-First B2B Ecommerce Experience - Hum Commerce](https://humcommerce.com/knowledge-center/how-to-build-a-mobile-first-b2b-ecommerce-experience-for-modern-buyers/)
- [B2B Ecommerce Websites in 2026 - BigCommerce](https://www.bigcommerce.com/articles/b2b-ecommerce/b2b-ecommerce-website/)

### Edwards / 산업 도메인
- [Edwards Vacuum Korea](http://kr.edwardsvacuum.com/?langtype=1042)
- [Edwards US Webshop - Pumps Catalog](https://us.my.edwardsvacuum.com/en_US/USD/Catalog/Pumps/c/pumps)

---

**문서 버전**: v1.0 (2026-05-10)
**다음 단계**: 이 문서를 기준으로 디자인 토큰(`tokens.css`)과 컴포넌트 스토리북을 만든 뒤, Phase 1부터 순차 구현.
