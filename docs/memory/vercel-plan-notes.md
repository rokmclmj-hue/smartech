# Vercel 요금제·조건 정리 (유료 전환 참고용)

확인일: 2026-09-25. 출처: [Vercel Pricing](https://vercel.com/pricing), [Fair Use Guidelines](https://vercel.com/docs/limits/fair-use-guidelines)(2026-09-14 갱신본), [계정 정지 안내](https://vercel.com/kb/guide/why-is-my-account-deployment-blocked). 요금은 바뀔 수 있으니 전환 직전에 공식 페이지로 다시 확인한다.

## 현재 상태

- 팀: `rokmclmj-hue's projects` — **Hobby(무료)**. 스마텍 홈페이지 운영 중.
- 9/7 Function Storage 75% 알림 → 코드 크기 지표라 지켜보기로 결정([[project_vercel_supabase_cleanup]]).
- 9/25 블로그 사진 최적화(next.config remotePatterns)는 Hobby 변환 한도 위험·효과 작음으로 보류.

## 요금제 비교

| 항목 | Hobby (무료) | Pro |
|---|---|---|
| 가격 | $0 | **개발자 1인당 월 $20** (보기 전용 인원은 무료·무제한) |
| 포함 사용량 | 아래 한도까지 | 매월 **$20 크레딧** 포함, 넘으면 사용한 만큼 추가 청구 |
| 데이터 전송 | 월 100GB | 월 1TB(정액 CDN) |
| 요청 수(Edge Requests) | 월 100만 | 월 1,000만 |
| 서버 기능 실행 | 월 100만 회 | 100만 회당 $0.60 |
| 서버 CPU 사용 | 월 4시간 | 시간당 $0.128~ |
| 사진 변환 | 월 5,000회 | 1,000회당 $0.05 |
| 사진 캐시 읽기/쓰기 | 월 30만 / 10만 | 100만당 $0.40 / $4.00 |
| 파일 저장소(Blob) | 1GB | GB당 $0.023 |
| 방화벽 규칙 | 3개 | 40개 |
| 한도 초과 시 | **사이트 일시정지** | 추가 요금 청구(예산 한도 설정 가능) |

스마텍은 개발자 1명(대표님 계정)이면 충분하다 → 예상 **월 $20(약 2만 7천~2만 8천 원, 환율에 따라 변동)**. 부가세 포함 여부는 첫 청구서에서 확인한다.

## 🔴 상업적 사용 조건 — 핵심

> "Hobby teams are restricted to non-commercial personal use only. All commercial usage of the platform requires either a Pro or Enterprise plan."

- 상업적 사용 예시에 **"Advertising the sale of a product or service"**(제품·서비스 판매 홍보), 방문자 결제 요청, 광고 게재가 포함된다.
- 스마텍 홈페이지는 제품 가격·견적·발주·수리 접수를 제공하므로 **상업적 사용에 해당**한다.
- 위반으로 판단되면 Vercel이 사이트를 **일시정지**하고 이메일로 알린다. 이 경우는 대시보드에서 스스로 재개할 수 없고 **Vercel 지원팀에 연락**해야 한다.
- 한도 초과로 인한 정지는 대시보드 프로젝트 화면에서 재개(Resume) 가능.

## 전환 판단 기준

- 지금 당장 문제는 없지만 **약관상 Pro가 맞다.** 홈페이지가 영업 창구이므로, 갑작스러운 정지 위험을 없애려면 전환을 권장한다.
- 전환하면 사진 최적화처럼 보류한 기능도 한도 걱정 없이 쓸 수 있다(사용량만큼 과금).
- 전환 시: Vercel 대시보드 → Settings → Billing에서 Pro로 업그레이드(화면 안내 확인). 전환 직후 **Spend Management(지출 한도)**를 설정해 예상 밖 청구를 막는다.
