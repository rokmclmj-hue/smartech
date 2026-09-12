# 스마텍 홈페이지

Next.js 16.2.4 · React 19.2.4 · Prisma · Tailwind v4 기반 홈페이지, 블로그, 관리자 시스템.
라이브: https://www.smartechvacuum.com

작업 전 [AGENTS.md](AGENTS.md), [CLAUDE.md](CLAUDE.md), [Astra 인수인계](docs/astra_handoff.md),
[현재 메모리](docs/memory/README.md)를 읽는다. 블로그 작업은 [블로그 규칙](블로그/CLAUDE.md)도 적용한다.

```powershell
npm.cmd run dev
npm.cmd run seo-check
```

개발 서버는 http://localhost:3000 에서 확인한다. 코드 작성 전 설치된 Next.js 가이드
`node_modules/next/dist/docs/`의 해당 항목을 읽는다. 패키지·디자인 토큰·폰트는 임의 변경하지 않는다.

`.env`와 비밀값은 커밋하지 않는다. 변경은 검증·커밋·push 전 검토 후 `master`에 push하고
Vercel 배포와 실제 동작을 확인한다. 블로그 DB 발행과 Windows 예약 적용은 코드 push와 별개다.

- [작업 기록](docs/astra_work_log.md)
- [SEO/GEO 점검](docs/audits/2026-09-09-seo-geo-review.md)
- [블로그 검토·다음주 후보](docs/audits/2026-09-09-blog-review.md)
