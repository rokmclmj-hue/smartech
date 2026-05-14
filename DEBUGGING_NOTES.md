# 빌드 실패 디버깅 노트

**작성일**: 2026-05-14 23:00
**작성자**: JONGHO (acabar45@gmail.com) - 후배 컴퓨터에서 사전 조사
**대상 빌드**: `36ecf67` 푸시 후 Vercel Production/Preview 모두 Error

다음 세션에 선배가 처음부터 다시 조사하지 않도록 후배가 사용자님 컴퓨터에서 미리 좁혀놓은 후보 목록입니다.

---

## ✅ 이미 확인된 안전 영역 (다시 안 봐도 됨)

| 항목 | 상태 | 검증 방법 |
|---|---|---|
| TypeScript 컴파일 | ✅ Clean | `npx tsc --noEmit` → 0 errors |
| `next.config.ts` | ✅ Clean | `serverExternalPackages: ["bcryptjs"]` + `allowedDevOrigins`만 있음 |
| 페이지의 module-level prisma | ✅ 안전 | `app/products/[partNo]/page.tsx`만 prisma 직접 사용, `force-dynamic` 적용됨 |
| `generateStaticParams` | ✅ 안전 | `app/industries/[slug]/page.tsx` 1곳만 사용, 정적 데이터(`INDUSTRIES`)에서 가져옴 |
| Next.js 16 async params | ✅ 적용됨 | 검사한 7개 라우트 모두 `params: Promise<{...}>` + `await params` 사용 |
| Top-level await in routes | ✅ 없음 | API 라우트에 모듈 레벨 await 없음 |
| `"use server"` 파일 | ✅ 없음 | Server Actions 관련 이슈 가능성 없음 |
| Module-level PrismaClient | ✅ 격리됨 | `scripts/` 내부에만 존재 (빌드 대상 아님) |

---

## ⚠️ 의심 영역 (우선순위 순서로 확인)

### 🥇 1순위 - `lib/mailer.ts` 모듈 레벨 transporter 생성

```typescript
// lib/mailer.ts L3-9
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});
```

**왜 의심**:
- 모듈 import 시 즉시 실행되는 코드
- `GMAIL_USER`/`GMAIL_APP_PASSWORD`가 Vercel 빌드 환경에 없으면 undefined로 transporter 생성 → 일부 nodemailer 버전에서 빌드 시점 에러 발생
- nodemailer v7 (`^7.0.13`)이 매우 최신이라 Next.js 16과 호환성 검증 부족

**해결 제안**:
```typescript
// lazy initialization으로 변경
let _transporter: nodemailer.Transporter | null = null;
function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({ ... });
  }
  return _transporter;
}
```

`lib/solapi.ts`는 이미 이 패턴(`function getService()`)으로 되어있음. mailer만 정리하면 일관성도 살아남.

### 🥈 2순위 - NextAuth v5 beta + Next.js 16 호환성

```
package.json:
  "next": "16.2.4"
  "next-auth": "^5.0.0-beta.31"   ← 베타!
```

**왜 의심**:
- NextAuth v5는 아직 베타 (`beta.31`)
- Next.js 16은 매우 최신 (2026-05 출시)
- 베타 + 최신 메이저 조합은 빌드 시점에 미묘한 충돌 발생 가능
- `lib/auth.ts` 가 빌드 시점에 평가되면서 NextAuth 내부에서 에러 가능

**확인 명령**:
```bash
# Vercel 빌드 로그에서 next-auth 관련 에러 키워드 검색
vercel inspect <fail-deployment-url> --logs | grep -i "next-auth\|authjs"
```

### 🥉 3순위 - `@react-pdf/renderer` 빌드 시 호환성

```
package.json: "@react-pdf/renderer": "^4.3.0"
```

**왜 의심**:
- `lib/pdf.ts`에서 사용, API 라우트 4곳에서 import
- @react-pdf는 과거 Next.js 빌드 시점에 native dep 이슈로 실패한 사례 있음
- 4일 전엔 통과했으므로 가능성 낮지만 0은 아님

**확인 명령**:
```bash
vercel inspect <fail-deployment-url> --logs | grep -i "@react-pdf\|renderToBuffer"
```

### 🏅 4순위 - 환경변수 누락

빌드 시점에 평가되는 위치:
- `lib/mailer.ts`: `GMAIL_USER`, `GMAIL_APP_PASSWORD`
- `lib/db.ts`: `DATABASE_URL`, `NODE_ENV`
- `app/api/ocr/card/route.ts`: Anthropic API 키 (체크 필요)
- `lib/auth.ts`: NextAuth secret 등

**확인 명령**:
```bash
vercel env ls --environment production
```

빠진 변수 있으면 추가 후 재빌드.

---

## 🎯 선배가 다음에 처음 5분에 할 일 (순서대로)

### Step 1 — 실제 에러 로그 확보 (1분)

```bash
# 가장 최근 실패한 배포 ID 찾기
vercel ls smartech --next 3

# 그 ID로 로그 가져오기
vercel inspect <deployment-id> --logs 2>&1 | tee build_error_actual.log

# 에러 키워드만 보기
grep -iE "error|fail|cannot|module not found" build_error_actual.log | head -20
```

### Step 2 — 위 의심 영역 4가지에 매칭 (2분)

빌드 로그에 나타난 키워드로 위 1~4순위 중 어느 것인지 매칭. 매칭되는 게 있으면 그것부터 처리.

### Step 3 — 매칭 안 되면 환경변수부터 (2분)

```bash
vercel env ls --environment production | grep -E "GMAIL|SOLAPI|DATABASE|NEXTAUTH|ANTHROPIC"
```

빠진 환경변수가 있으면 거기서부터 출발.

---

## 📦 후배가 이미 시도한 것

| 시도 | 결과 |
|---|---|
| 로컬 `npm run build` | EPERM 에러 (dev 서버가 prisma 파일 잠금). 진짜 빌드 에러까진 못 봄 |
| 로컬 `npx tsc --noEmit` | 0 errors. TypeScript는 깨끗 |
| 코드베이스 정적 분석 | 위 안전 영역 + 의심 영역 도출 |

---

## 🚫 시도 가능하지만 효과 없는 것 (시간 낭비 주의)

- `vercel deploy` 또 실행 → 같은 에러로 또 실패
- `npm run build` 로컬 재시도 → DATABASE_URL 없어서 Prisma 단계에서 막힘
- TypeScript 코드 더 고치기 → 이미 0 에러
- Production Branch 먼저 바꾸기 → 빌드 통과 안 하면 의미 없음

---

## 📋 진행 순서 (전체 플로우 재확인)

```
1. 빌드 에러 로그 확보 (vercel inspect)        ← Step 1
2. 위 의심 영역 중 매칭 찾기                    ← Step 2
3. 환경변수 누락 확인                          ← Step 3
4. 코드 수정 + 푸시                            
5. 빌드 성공 확인                              
6. Production Branch를 master로 변경 (API)     
7. 후배 acabar45@gmail.com Member 초대         
8. 검증 (X-Vercel-Id가 icn1::icn1, TTFB 0.1초)
```

---

## 🧰 참고 정보

- master HEAD: `f3490c8 docs: 견적서 라이트 디자인 mockup 추가`
- 마지막 성공 빌드: 4일 전 Preview (URL: `smartech-bi7eqrl71-rokmclmj-hues-projects.vercel.app`)
- 마지막 실패 빌드 URL: `smartech-rokmclmj-hues-projects.vercel.app` (Production), `smartech-4hk4kwt8r-rokmclmj-hues-projects.vercel.app` (Preview)
- 후배 vercel.json: `{"regions": ["icn1"]}` (master에 보존, Production Branch 바뀌면 자동 적용)
- 후배 mockup: `mockups/smartech_quote_light.html` (디자인 참고용, git 보존)
