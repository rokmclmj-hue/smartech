# Smartech 홈페이지 디자인 시스템

> 파일 위치: `app/globals.css` (색상·애니메이션), `app/layout.tsx` (폰트), `app/page.tsx` (레이아웃 구조)

---

## 1. 색상 (Colors)

`globals.css` `@theme` 블록에 정의. Tailwind 클래스(`bg-ink`, `text-edred` 등)로 바로 사용.

| 토큰 | HEX | 의미 |
|------|-----|------|
| `ink` | `#0B0B0C` | 기본 글자색 (거의 검정) |
| `paper` | `#F6F4EF` | 기본 배경색 (따뜻한 흰색) |
| `edred` | `#c00020` | 에드워즈 레드 · 주 강조색 |
| `edred2` | `#E46F75` | 연한 레드 · 버튼 hover |
| `edred3` | `#621318` | 짙은 레드 · 보조 |
| `smblue` | `#0d3a8a` | 스마텍 블루 |
| `dim` | `#6A6660` | 흐린 글자 (설명, 메타) |
| `line` | `#E3DFD6` | 구분선 · 테두리 |

**배경 공식:** 섹션 기본 = `bg-paper`, 반전 섹션(Contact) = `bg-ink text-paper`, 강조 셀 = `bg-edred text-paper`

---

## 2. 글꼴 (Typography)

### 폰트 패밀리

```
--font-sans : Inter, Pretendard Variable, Pretendard, system-ui
--font-mono : JetBrains Mono, ui-monospace
```

- **Inter + Pretendard** : 본문·제목 전반 (영문 + 한글)
- **JetBrains Mono** : 숫자 데이터, 라벨, 코드형 텍스트 (`mono` 클래스)

### body 기본 설정

```css
font-feature-settings: "ss01","cv11","cv02","cv03","cv04";
letter-spacing: -0.005em;
```

### 제목 유틸리티 클래스

| 클래스 | 크기 | 굵기 | 자간 | 용도 |
|--------|------|------|------|------|
| `.display` | — | 800 | -0.04em | 대형 헤드라인 |
| `.display.italic` | — | 500 | -0.035em | 이탤릭 강조 (색: `dim`) |
| `.hero-h1` | clamp(28px→72px, 4.8vw) | 800 | -0.04em | 히어로 h1 |
| `.section-title` | clamp(28px→76px, 4.8vw) | 700 | -0.035em | 섹션 h2 |
| `.mono` | — | — | 0 | 레이블·메타·숫자 |

### 텍스트 유틸리티

```
.dim      → color: #6A6660  (흐린 텍스트)
.hair     → border-color: #E3DFD6  (얇은 테두리)
.tabular  → font-variant-numeric: tabular-nums  (정렬되는 숫자)
.stroke-ink → -webkit-text-stroke: 1px #0B0B0C; color: transparent
```

---

## 3. 레이아웃 시스템

### 최대 너비 & 여백

```
max-width : 1400px
padding   : px-4 md:px-6  (모바일 16px / 데스크톱 24px)
```

### 그리드

- 기본 12컬럼: `grid grid-cols-12 gap-6`
- 히어로: 7컬럼(헤드라인) + 5컬럼(트러스트 벤토)
- 산업 카드: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`
- 섹션 기본 패딩: `py-28` (데스크톱) → `py-14` (모바일 자동 축소)

### 모바일 패딩 자동 조정 (breakpoint: 767px)

```css
section[class*="py-28"] → padding-top/bottom: 3.5rem
section[class*="py-24"] → padding-top/bottom: 3rem
```

---

## 4. UI 컴포넌트 패턴

### 버튼 3가지 패턴

```
주 버튼 (solid red)  : bg-edred text-paper px-6 py-4 hover:bg-edred2
보조 버튼 (outline)  : border border-ink px-6 py-4 hover:bg-ink hover:text-paper
어두운 배경 outline  : border border-paper/30 px-6 py-4 hover:bg-paper hover:text-ink
```

### 칩 (Chip) `.chip`

작은 알약 모양 태그. 필터, 로그인/로그아웃 버튼에 사용.

```css
border: 1px solid #0B0B0C; border-radius: 999px; padding: 4px 10px; font-size: 11px;
hover/active → bg: #0B0B0C; color: #F6F4EF;
```

### KPI 패널 `.kpi-panel`

유리(glass) 느낌 흰색 카드. 통계 수치 표시용.

```css
border-radius: 14px;
background: rgba(255,255,255,0.92); backdrop-filter: blur(8px);
box-shadow: 0 1px 0 rgba(255,255,255,0.6) inset, 0 10px 40px -16px rgba(11,11,12,0.12);
```

내부 구성: `.kpi-eyebrow` (모노 9.5px 라벨) + `.kpi-num` (굵은 숫자) + `.kpi-meta` (빨간 작은 설명)

### 벤토 셀 (Bento) `.bento-hero` `.bento-cell`

```css
hover → border-color: rgba(192,0,32,0.45); transform: translateY(-2px);
```

히어로 오른쪽 트러스트 패널 구성:
- `col-span-2 row-span-2` : 연도 카운터 대형 셀
- 1×1 셀 2개 : RV Shipped / Product Lineup 수치
- `col-span-3` 하단 바 : 에드워즈 공식 대리점 인증 (배경 edred)

### 산업 카드 `.ind-card`

```css
기본 : bg-paper border hair
hover/open : bg-ink text-paper border-ink
  └ .ind-num → color: edred
transition: background-color .35s ease, color .35s ease, border-color .35s ease;
```

### 쇼케이스 카드 `.showcase-card`

```css
hover → translateY(-4px); box-shadow: ...;
  └ .showcase-accent (하단 빨간 밑줄) → scaleX(0→1) from left
```

### 섹션 번호 라벨 패턴

```
.mono text-[11px] dim mb-4
예: "— 01 · TOTAL SOLUTION"
```

---

## 5. 네비게이션

### 상단 테이프 (Red Tape)

```
height: 36px; background: #c00020 (edred);
내용: 진공 압력 게이지 (ATM 10³mbar → UHV 10⁻¹⁰mbar)
```

### 스티키 헤더

```
position: sticky; top: 0; z-index: 40;
background: bg-paper/90; backdrop-blur;
height: h-16 (64px);
```

로고: `display text-[32px] tracking-[-0.045em]` — `Smartech` + 빨간 점 `.dot-settle`
네비 링크: `font-medium text-[16px] hover:text-edred`

---

## 6. 페이지 섹션 구조

| 번호 | ID | 이름 | 배경 |
|------|----|------|------|
| — | — | HERO | paper + noisebg |
| 01 | `#solution` | 토탈 솔루션 | paper |
| 02 | `#industries` | 20 산업 | paper |
| 03 | `#products` | 제품 라인업 | paper |
| 04a | `#b2b` | B2B 전용 견적 | **ink** (반전) |
| 04b | — | B2C 펌프 선택기 | paper |
| 05 | `#ai` | AI 상담 | paper |
| 06 | `#about` | 회사 소개 / 타임라인 | paper |
| 07 | `#contact` | CTA / 연락처 | **ink** (반전) |
| — | — | FOOTER | paper |

---

## 7. 애니메이션

### 등장 애니메이션

| 클래스 | 동작 | 트리거 |
|--------|------|--------|
| `.mask-line > span` | 텍스트 아래→위 슬라이드 (`mask-up` 1s) | CSS delay `--md` |
| `.hero-rise` | 패딩 아래→위 fade-in (`hero-rise` .85s) | CSS delay `--rd` |
| `.reveal` | 스크롤 시 아래→위 fade-in | `.in` 클래스 추가로 발동 |
| `.dot-settle` | 로고 점 수렴 등장 (`dot-materialize` 1.1s) | `html.intro-mounted:not(.intro-playing)` |

**delay 사용법 예시:**
```jsx
<div className="hero-rise" style={{ "--rd": "0.4s" }}>
```

### 파티클 `.float-dot`

- `particle-fade-in` → `particle-float` → `particle-collect` (3단계 합성)
- 소개 인트로 종료 후 로고로 빨려 들어가는 연출
- 색상: 에드워즈 레드 방사형 그라디언트 + 글로우

### 게이지 애니메이션

- `.gauge-needle` + `.gauge-track-fill` : 상단 테이프 진공 수치 스위프 (7초, 1회)
- `.gauge-needle--lg` + `.gauge-track-fill--lg` : 대형 섹션용 (6초, 유사 정지 구간 포함)

### 기타

| 클래스 | 동작 |
|--------|------|
| `.marquee-track` | 45초 무한 좌→우 흐름 |
| `.showcase-marquee` | 75초 무한 우→좌 흐름 (hover 정지) |
| `.rotor` | 14초 무한 회전 |
| `.rotor-fast` | 4초 무한 회전 |
| `.impeller-rotor` | 7초 가속 후 3초 일정 속도 연속 |
| `.vacuum-dot` | 진공 흡입 점 (위치 CSS var `--x --y`) |
| `.noisebg::before` | 배경 붉은 블러 그라디언트 → 7초 수축 소멸 |
| `.editorial-range-fill` | 연도 범위 바 채움 (3.6초, 1회) |
| `.march-border` | 점선 이동 테두리 (1.2초 반복) |

---

## 8. 배경 & 특수 효과

### Noisebg (히어로 배경)

```css
radial-gradient: edred 0.08 opacity @ 20% -10%, edred 0.05 @ 110% 10%
mask: ellipse 75% 85% at 35% 30% (유기적 형태)
filter: blur(3px) → 7초 후 소멸
```

### 라이브 상태 점 `.kpi-status`

```css
::before → ping 확장 (2.2초 반복, edred)
::after  → 내부 고정 점 (edred + 글로우)
```

### 그레인 오버레이 `.grain`

```css
radial-gradient dot 1px / 3px×3px; opacity: .35; mix-blend-mode: multiply;
```

---

## 9. 강조 패턴

### 브랜드명 하이라이트

- `Edwards` → `text-edred font-semibold`
- `Smartech.` → `display tracking-[-0.045em]` + 빨간 점
- `Smartech.` 점 → `.dot-settle` (인트로 종료 후 수렴 등장)

### 하이라이트 밑줄 `.underline-red`

```css
background-image: linear-gradient(#c00020, #c00020);
background-size: 100% 1px; background-position: 0 100%;
```

### 섹션 구분선

```
border-b hair  →  border-bottom: 1px solid #E3DFD6
divide-x hair  →  column divider
```

### Ghost Index 텍스트

```jsx
<div aria-hidden className="absolute ... display text-[220px] opacity-[0.04] select-none">04a</div>
```
배경에 거대한 섹션 번호를 투명하게 깔아 시각적 무게감 추가.

---

## 10. 반응형 요약

| 분기점 | 변화 |
|--------|------|
| `md` (768px+) | 12컬럼 본격 활성, 네비 데스크톱 표시 |
| `lg` (1024px+) | 히어로 7+5 분리, 섹션 좌우 배치 |
| `xl` (1280px+) | 산업 카드 5컬럼 |
| 모바일 (<767px) | 섹션 패딩 자동 축소, display 폰트 강제 축소 |

---

## 11. 자주 쓰는 조합 예시

### 섹션 도입부 (eyebrow + 제목 + 설명)

```jsx
<div className="mono text-[11px] dim mb-4">— 01 · SECTION NAME</div>
<h2 className="section-title display">
  제목 <span className="italic text-edred">강조</span>
</h2>
<p className="mt-6 text-[15px] leading-[1.75] text-[#2a2823]">설명 본문</p>
```

### 격자형 카드 목록

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l hair">
  <div className="border-r border-b hair p-8 hover:bg-ink hover:text-paper transition-colors">
    ...
  </div>
</div>
```

### 마커 리스트

```jsx
<li className="flex gap-3 items-start">
  <span className="text-edred shrink-0 mt-0.5">→</span>
  <div>
    <div>항목 제목</div>
    <div className="text-[11px] opacity-55 mt-1">설명</div>
  </div>
</li>
```
