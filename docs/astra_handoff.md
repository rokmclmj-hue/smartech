# Astra(Codex) 인수인계 문서

> 이 파일은 스마텍(smartech) 프로젝트를 Claude Code에서 OpenAI Codex CLI(GPT-6 Astra 등)로
> 병행/이관해서 사용하기 위해 정리한 요약본입니다.
> 원본 규칙은 `CLAUDE.md`, 원본 컨텍스트는 `AGENTS.md`이며, 이 파일은 **그 둘을 대체하지 않습니다.**
> 새 에이전트는 이 파일과 함께 루트의 `AGENTS.md`, `CLAUDE.md`도 반드시 같이 읽어야 합니다.

작성일: 2026-09-09
작성 주체: Claude Code (Sonnet 5)
갱신 방식: 자동 동기화 아님 — **이 문서를 만든 시점의 스냅샷**입니다.
이후 Claude와 Astra가 각자 작업하면 서로 아는 내용이 어긋날(drift) 수 있으니,
정기적으로 이 파일을 다시 정리해서 갱신해야 합니다.

---

## 1. 프로젝트 개요

- **스마텍(SMARTECH)**: 진공펌프 제조·수리 전문 회사의 홈페이지 + 블로그 + 관리자 시스템
- 목표: 한국 진공 시장 1위, 차세대 AI 자동화 시스템 구축
- 기술 스택: Next.js 16.2.4 (App Router) + React 19.2.4, Prisma, Tailwind v4
- 배포: `master` 브랜치에 직접 push → Vercel 자동 배포 (별도 PR/머지 절차 없음)
- 라이브 도메인: smartechvacuum.com

## 2. 절대 수정 금지 / 승인 필요 파일

아래 파일은 사용자의 명시적 승인 없이 수정하지 않습니다.

| 파일 | 이유 |
|------|------|
| `app/globals.css` | 디자인 토큰(@theme) 정의 |
| `prisma/schema.prisma` | DB 구조. 변경 시 `npx prisma db push` 필수 |
| `next.config.ts` | Vercel 빌드·외부 패키지 설정 |
| `vercel.json` | 배포 설정 |
| `tsconfig.json` | TypeScript 설정 |
| `package.json` | 패키지 목록 |
| `lib/auth.ts` | 로그인·인증 핵심 로직 |
| `.claude/settings.json` | Claude 전용 훅 설정 (Astra는 관여 안 함) |
| `app/api/chat/route.ts` | 실시간 AI 문의란 스트리밍. API 응답 포맷 변경 금지 |
| `components/FloatingChat.tsx` | 챗봇 팝업 UI. 구조 변경 금지 |
| **`AGENTS.md`(루트)** | Codex 계열 도구가 자동으로 읽는 파일. **이 문서와 별개로 절대 덮어쓰지 말 것** |

## 3. 디자인 시스템 (변경 금지)

색상 토큰은 `app/globals.css`의 `@theme` 블록에 정의되어 있고, 값 임의 변경 금지.

| 토큰 | 값 | 용도 |
|------|----|------|
| `ink` | `#0B0B0C` | 기본 텍스트·다크 배경 |
| `paper` | `#F6F4EF` | 밝은 배경 |
| `edred` | `#c00020` | 브랜드 레드 (메인) |
| `edred2` | `#E46F75` | 연한 레드 |
| `edred3` | `#621318` | 진한 레드 |
| `smblue` | `#0d3a8a` | 스마텍 블루 |
| `line` | `#E3DFD6` | 구분선 |
| `dim` | `#6A6660` | 흐린 텍스트 |

폰트: 본문 `Inter, Pretendard Variable, Pretendard` / 코드 `JetBrains Mono`. 새 웹폰트 추가 금지.
Tailwind v4 사용 중 — `tailwind.config.js` 생성 금지, `@apply` 방식 전환 금지.

## 4. 기술 스택 제한

- 새 npm 패키지 추가 금지 (사용자 승인 필요)
- 현재 허용된 패키지: `@anthropic-ai/sdk`, `@prisma/client`, `@react-pdf/renderer`,
  `@vercel/blob`, `bcryptjs`, `next-auth`, `nodemailer`, `solapi`, `xlsx`, `react-countup`
- axios, Zustand, date-fns 같은 대체 라이브러리 도입 금지

## 5. 블로그 콘텐츠 규칙

- 블로그 원고/파이프라인은 로컬 폴더 `블로그`(스마텍 프로젝트 폴더 내)에 있음
- **마크다운 표 형식 금지** — `writer.md` 규칙. 표 대신 다른 형식 사용
- 블로그 글을 지칭할 때는 완성 기사 제목이 아니라 **VS Code 탐색기 폴더명**으로 지칭
  (예: "0904-리사이클링-드라이펌프")
- 업로드 주기: 주 3편(월·수·금) — 필요 시 대표님이 스케줄 조정
- 주제 구성: 매트릭스(산업별 특화) 기반 글만 뽑지 말고, 산업 무관한 일반 진공이론/안전 주의사항 계열 글도 1~2개씩 항상 섞을 것
- 업로드 자동화 스케줄러(Windows 작업 스케줄러)는 콘솔창 QuickEdit 모드에서 클릭하면 멈추는 버그가 있었음 → Hidden 모드로 해결됨

## 6. SEO 규칙 (새 page.tsx 생성 시)

- `app/**/page.tsx`(admin·auth·mypage·quote 제외)는 반드시 `export const metadata` 또는
  `generateMetadata` 포함
- `"use client"` 페이지는 metadata 선언 불가 → 서버 컴포넌트 래퍼 패턴 필수
  (인터랙티브 코드는 `*Client.tsx`로 분리, `page.tsx`는 서버 컴포넌트로 metadata만 선언)
- 각 페이지 metadata에 `alternates: { canonical: "https://smartechvacuum.com/경로" }` 필수
- 점검: `npm run seo-check`

## 7. 보안 수칙

- `.env` 파일 수정 금지. 환경 변수는 Vercel 대시보드에서만 관리
- 하드코딩 절대 금지: `ANTHROPIC_API_KEY`, `DATABASE_URL`, `SOLAPI_*`, `VERCEL_BLOB_*`,
  `KAKAO_CLIENT_SECRET`, `GOOGLE_CLIENT_SECRET`, `GMAIL_*`, `NEXTAUTH_SECRET`
- 위 패턴 발견 시 즉시 경고 후 작업 중단

## 8. 운영 원칙 (작업 방식)

- 정의된 구조와 범위를 벗어나지 않는다. 새 기능/구조 추가는 금지 — 필요 시 제안 후 승인받는다
- 한 번에 하나의 작업만 수행, 30~60분 내 데모 가능한 결과를 만든다
- 불확실하면 추측하지 말고 필요한 질문만 하고 진행한다
- 작업(코드 수정, 설정 변경 등)이 완료되면 그 내용을 기록해 남긴다 (Astra 쪽에서는 이 문서나
  별도 로그 파일에 직접 기록 — Claude의 MEMORY.md 자동 기억 시스템은 Astra가 접근 못 함)
- 작업 완료 후 커밋 + `git push origin master`로 라이브에 반영해야 실제 배포됨 (push 안 하면
  라이브에 반영 안 됨)
- 커밋 메시지는 한글로 간결하게, 변경 이유 중심으로 작성

## 9. 사용자(대표님) 관련 — 커뮤니케이션 방식

- 비개발자, 코딩 초보. 전문 용어 사용 금지 — 쉬운 말로 설명하고, 모르는 단어는 괄호로 부연 설명
- 한 번에 한 단계씩만 안내. 터미널 명령어는 코드 블록으로 명확히 표시하고, 각 단계마다
  "잘 됐는지 확인하는 방법"도 같이 안내
- 에러 발생 시: 원인 → 이유 → 1번부터 순서대로 해결 방법
- "간단히", "쉽게" 같은 표현 쓰지 않기 (사용자에게는 쉽지 않음)
- 지시하지 않은 코드 구현 금지, 승인("작업하자"/"ok" 등) 전에는 의견만 제시하고 코드 작업 시작
  하지 않음
- 여러 방법을 한꺼번에 나열하지 않기 (혼란 방지)

## 10. Claude 전용이라 Astra가 호환 못 하는 것 (참고용)

이 프로젝트에는 Claude Code 전용 자동 기억/설정 시스템이 있습니다. Astra는 이를 직접 읽을 수
없으므로, 필요한 내용은 이 문서에 사람이 요약해서 옮겨야 합니다.

- `CLAUDE.md` 규칙 파일 (Claude 전용 규칙 로더)
- `MEMORY.md` + 개별 메모리 파일들 (`C:\Users\rokmc\.claude\projects\...\memory\`) — 프로젝트
  진행 이력, 과거 버그 수정 이력, 대표님과의 합의사항 등이 담긴 자동 기억 시스템
- `.claude/settings.json` 훅 설정
- Claude 스킬/슬래시 명령어 (`/code-review`, `/loop` 등)

호환 가능한 것: 코드 파일 전체, git 커밋 이력, `AGENTS.md`(Codex 네이티브 규칙 파일 — 그대로 읽힘)

---

## 반복 작업 바로가기

새 Codex 세션에서도 아래 작업들은 긴 설명 없이 한 줄로 요청할 수 있습니다.
(이 문서와 루트 `AGENTS.md`를 세션 시작 시 먼저 읽었다는 전제)

### 0) 세션 시작·종료 시 git 동기화 (Claude Code와 동일한 습관)

Claude Code는 매 대화 시작 시 `git pull origin master`를 자동 실행해 최신 상태로
동기화하는 규칙이 `CLAUDE.md`에 있습니다. Astra도 동일하게 적용합니다.

- **세션 시작 시**: 첫 작업을 받기 전에 `git pull origin master`를 먼저 실행해
  Claude Code가 그동안 push한 최신 내용을 받아옵니다. 충돌(conflict)이 뜨면
  바로 진행하지 말고 사용자에게 먼저 알립니다.
- **작업 완료 시**: 사용자가 "커밋하고 push 해줘"라고 요청하면 `git add`, `git commit`,
  `git push origin master`를 실행합니다. push 없이 세션을 끝내면 작업이 라이브에
  반영되지 않으므로, 세션을 마무리하기 전에 커밋·push 여부를 사용자에게 확인합니다.

### 1) 블로그 주제 후보 뽑기

한 줄 요청 예: `이번 주 O요일 블로그 주제 후보 3개 뽑아줘`

이 요청을 받으면 아래 파일을 먼저 읽고 판단합니다.
- `블로그/CLAUDE.md` (블로그 전용 작성 규칙)
- `블로그/knowledge/industry-product-matrix.md` (산업별 주제 매트릭스)
- `블로그/knowledge/topic-tracker.json` (이미 다룬 주제 이력 — 중복 방지)

**신선도 확인 (2026-09-09 사고 재발 방지)**: 이 두 파일이 실제 발행 폴더(`블로그/output/기술블로그/`)보다
오래됐을 수 있습니다. 후보를 뽑기 전에 `블로그/output/기술블로그/`의 최근 월 폴더를 훑어보고,
`topic-tracker.json`의 `completed_topics`나 매트릭스 체크(✅)에 없는 최근 발행글이 있으면 먼저
반영(추가)한 뒤에 후보를 뽑습니다. (2026-09-09에 한 달치 누락이 방치돼 있던 것을 발견해 수동으로
바로잡은 적 있음 — 매번 같은 실수가 반복되지 않도록 확인 단계를 넣음)

후보를 낼 때 지킬 것:
- 산업별 특화 주제 위주로 하되, 후보 중 1개는 일반 진공이론·안전 주의사항 계열로 포함
- `topic-tracker.json`에 이미 있는 주제와 중복 금지
- 후보만 제시하고 (제목 + 선정 이유 한 줄), 사용자가 하나를 고르기 전까지 글쓰기 시작 안 함

### 2) 배포 전 체크리스트

`master`에 push하기 전 아래를 확인합니다.
- [ ] 변경 파일이 "절대 수정 금지" 목록(위 2번 항목)에 없는지 재확인
- [ ] `.env`, API 키 등 비밀값이 코드에 하드코딩되지 않았는지 확인
- [ ] 새 `page.tsx`를 만들었다면 metadata/canonical 규칙(6번 항목) 준수 확인
- [ ] 커밋 메시지에 변경 이유를 한글로 간결하게 작성
- [ ] push 후 `git log --oneline origin/master | head -3`로 실제 반영 확인
- [ ] 이 문서(`docs/astra_handoff.md`)나 별도 로그에 작업 내용 기록 (10번 항목 참고)

### 3) 아스트라에게 없는 기능 — 사람 검토 필요

Claude Code에는 `/code-review` 같은 자동 코드 검토 기능이 있지만, **Astra(Codex CLI)에는
동일한 기능이 없습니다.** 아래 경우엔 push 전에 사람(대표님 또는 Claude Code)이 한 번 더
검토하는 것을 권장한다고 안내합니다.
- 수정 파일이 3개 이상인 작업
- DB 스키마, API 응답 포맷, 인증 관련 변경이 섞인 작업

---

## Astra(Codex)에게 전달할 초기 프롬프트 예시

Codex CLI 프롬프트 창에 아래처럼 입력하면 됩니다.

```
docs/astra_handoff.md 파일과 프로젝트 루트의 AGENTS.md를 읽고 작업을 이어받아줘.
astra_handoff.md는 기존에 Claude Code로 작업하던 규칙과 맥락을 요약한 문서야.
읽은 뒤 이 프로젝트의 규칙을 어떻게 이해했는지 핵심만 요약해서 브리핑해줘.
```

---

## 검증 기록 (2026-09-09)

Codex CLI(`gpt-6-astra medium`)에 이 문서와 `AGENTS.md`를 읽힌 뒤, 3라운드에 걸쳐
브리핑 내용을 원본(이 문서 + `CLAUDE.md`)과 대조 검증함. Claude Code(Sonnet 5)가 대조 진행.

- **1차 브리핑**: 프로젝트 목적, 작업 전 확인 절차, 작업 범위 원칙, 핵심 파일 승인 규칙,
  콘텐츠/보안 규칙, 배포 방식, 소통 방식은 정확히 이해함. 다만 세부 값이 다수 누락됨
  (보호 파일 일부, 디자인 토큰 실제 값, 패키지 목록, 블로그 운영 주기, 30~60분 원칙,
  기록 책임 인식).
- **2차 브리핑**: 지적한 6개 항목 모두 원본과 정확히 일치하게 보완함 (보호 파일 11개 전체,
  색상 토큰 8개 hex 값, 허용 패키지 10개, 블로그 주3회 월수금+일반주제 혼합, 30~60분 원칙,
  "자동 기억 없음 → 직접 기록 책임" 명확히 인식).
- **3차 브리핑**: 남은 2개 항목(SEO 서버 컴포넌트 래퍼 패턴 + `npm run seo-check`, 대표님과의
  소통 제약 — 승인 전 코드작업 금지/방법 나열 금지/"간단히" 표현 금지) 보완함. 원본과 정확히
  일치. 특히 "이번 요청은 규칙 보완이지 작업 승인이 아니다"라고 스스로 판단해 규칙을
  실시간으로 올바르게 적용하는 모습을 확인함.

**결론**: 3라운드 검증 결과 핵심 규칙 전체를 정확히 이해한 것으로 확인. 실제 작업 테스트 진행 가능.

---

## 주의사항 (재확인)

- 이 문서는 **스냅샷**입니다. Claude와 Astra를 병행 사용하면서 한쪽에서만 반영한 규칙 변경은
  자동으로 다른 쪽에 전달되지 않습니다. 중요한 규칙이 바뀌면 양쪽 파일(`CLAUDE.md`와 이 문서)을
  사람이 직접 동기화해야 합니다.
- 루트의 `AGENTS.md`는 절대 이 문서로 덮어쓰지 않습니다. 별도 파일로 유지합니다.
