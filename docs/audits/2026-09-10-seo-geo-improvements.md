# 홈페이지 SEO·GEO 개선 — 2026-09-10

대표님의 홈페이지 개선 진행 요청에 따라 9/9 진단 중 공통 화면·검색 정보 오류와 이미지 전달을 수정했다. 기존 공개 글의 기술 본문 교정, 관리자 계정의 검색 실적 확인, Windows 예약 변경은 이번 코드 반영과 별개다.

## 변경

- 홈페이지 설명문이 등장 애니메이션을 기다리지 않고 처음부터 보이게 했다. 모바일 0px·PC 32px 상단 간격과 문구는 유지한다.
- 자동 스크롤 제품 카드 22개(제품 11개 반복)의 원본 이미지 요청을 Next Image로 변경했다. 실제 카드 너비 200/220px에 맞춰 브라우저가 크기를 선택한다. 기존 이미지·링크·카드 크기와 동영상은 유지한다.
- 제품 목록 제목·소개를 서버 영역으로 옮겨 최초 HTML에도 H1이 들어간다. 검색 영역에는 로딩 안내를 제공한다. 제품 수는 기존 검색 결과 영역에서 계속 확인할 수 있다.
- 제품별 실제 재고와 연결되지 않은 `InStock` 속성을 삭제했다. 품절로 바꾼 것이 아니다. 가격 계산·로그인·고객 등급·캐시는 수정하지 않았다.
- 전체 페이지에 들어가던 공통 FAQ와 개별 부품 페이지의 화면에 없는 고정 FAQ를 제거했다. 글별로 저장된 FAQ는 유지한다.
- 블로그 공통 링크·중복 제목·편집 주석 처리와 React 텍스트 이스케이프는 9/9 미반영 작업을 검토해 포함했다. JSON-LD의 `<` 문자도 이스케이프한다.
- 비어 있는 블로그 설명은 제목·이미지·편집 메모를 제외한 실제 본문 문단으로 보완한다. 기존에 입력된 설명은 유지한다. 공유 미리보기와 Article 설명도 같은 값을 사용한다.
- 본문에 실제 표시되는 Markdown 이미지가 있는 경우 Article 대표 이미지로 연결한다. 사진 API만 사용하는 글의 이미지 접근 경로는 아직 후속 과제다.
- SEO 검사 성공 메시지를 metadata·canonical 선언 검사로 한정한 기존 수정도 포함했다.

## 판단 근거

현재 설치된 Next.js 문서의 Image, useSearchParams, JSON-LD 가이드를 읽었다. 검색용 정보는 화면의 실제 정보와 일치해야 하고, 이미지도 해당 글과 관련된 실제 이미지여야 한다.

- [Google 구조화 데이터 일반 지침](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Google Product 안내](https://developers.google.com/search/docs/appearance/structured-data/product-snippet)
- [Google Article 안내](https://developers.google.com/search/docs/appearance/structured-data/article)

## 검증

- `npm.cmd run build`: Prisma client 생성·컴파일·타입 검사·정적 페이지 130개 생성 성공. 모바일 간격 최종 반영 후 재실행했다.
- `node node_modules/typescript/bin/tsc --noEmit --incremental false`: 통과.
- 변경 TS/TSX 8개 ESLint: 오류 0, 기존 `app/page.tsx`의 미사용 Reveal import 경고 1개.
- `npm.cmd run seo-check`: 13개 페이지 통과.
- `scripts/test-blog-inline.tsx`: 링크·위험 URL·HTML 이스케이프·중복 제목·요약 추출·대표 이미지 검사 통과. 굵은 글씨로 시작하는 문단을 잘못 제외하는 첫 구현을 검사에서 발견해 수정했다.
- 공개 수정 전 / 로컬 수정 후: 홈, 제품 목록, 부품 A41821946, 블로그 96, battery-manufacturing-dry-pump-pfpe-oil의 5개 페이지 HTTP 200. 로컬에서 모두 H1 1개, 설명 존재, JSON-LD 파싱 오류 없음. 제품 목록 초기 H1은 0→1, 두 블로그 H1은 2→1.
- `?q=RV12` 검색어 유지 및 결과 링크 확인. 비로그인 제품 가격과 검색용 가격이 일치한다. 실제 고객 계정별 로그인 검증을 했다는 뜻은 아니다.
- 초기 제한 환경의 로컬 서버는 DB 네트워크 차단으로 500 응답했다. 권한 있는 로컬 서버로 재검증해 정상 응답을 확인했다. 브라우저 외부 접속도 제한 밖에서 검증했다.
- 백업: 로컬 비공개 `tools/seo-backup-2026-09-10/`. TS/TSX 백업은 `.bak` 확장자로 보존해 빌드 대상에 들어가지 않게 했다.

## 측정·배포

- 수정 전 동일 공개 주소 모바일 Lighthouse: 성능 55, LCP 약 7.80초, 전송량 4,237,873바이트. 2026-09-10 KST 측정. 각 측정은 단일 실험실 결과이며 검색 순위·실사용자 성과가 아니다.
- Lighthouse 브라우저 임시 폴더 정리에서 EPERM이 났으나 보고서가 생성됐고 runtimeError가 없는 것을 확인했다.
- 코드 커밋 `a5ae84c3ceab8b4352e4071341bd2e229f3a176a`를 master에 push하고 원격 해시 일치를 확인했다. [Vercel 배포](https://vercel.com/rokmclmj-hues-projects/smartech/Av4faKbQJEqBhJmk4chk12vMA7uC) success 확인.
- 배포 후 공개 홈페이지 5개 페이지 검사 통과: HTTP 200, H1 1개씩, 제품 목록 초기 H1 존재, 설명 누락 보완, 고정 재고/공통 FAQ 제거. RV12 검색 결과 영역의 실제 제품 링크에 RV12가 포함되는 것까지 확인했다. 브라우저 오류 0.
- 같은 공개 주소·동일 Lighthouse 설정의 모바일 비교: **성능 55→80, LCP 7.80→2.97초, 전송량 4,237,873→3,094,873바이트(약 27% 감소)**. CLS 0.00053→0.00145. 각 1회 측정으로 인과효과·실사용자 성능·검색 성과를 보장하지 않는다. LCP 2.5초 이하 목표에는 아직 도달하지 않았다.
- TBT(검사 중 화면 반응을 막은 누적 시간)는 376→524ms로 늘었다. 전체 성능 지표가 모두 개선된 것은 아니며 초기 JavaScript 실행·외부 스크립트 비용은 추가 분석 대상이다. 접근성 97·권장 기술 준수 100·Lighthouse SEO 100은 전후 동일하다.
- 측정 시각: 수정 전 9/10 06:11 KST, 수정 후 9/10 07:22 KST. [설정·측정 요약·공개 브라우저 검증](2026-09-10-seo-verification.json). 원시 Lighthouse 보고서는 로컬 `tools/seo-before-2026-09-10.json`, `tools/seo-after-2026-09-10.json`에 보존했다.
- 재검증 명령: `node scripts/verify-seo-browser.mjs https://www.smartechvacuum.com live-check --verify`. 이 명령은 읽기 전용 공개 페이지 검사이며 문의·로그인·DB 쓰기를 실행하지 않는다.

## 남은 진단 항목

- 기존 기술 글 10편의 근거 확인과 개별 본문·FAQ 교정. 기존 공개 DB 원고를 이번에 덮어쓰지 않았다.
- 사진·카탈로그 공개 자산 경로의 검색 접근성, Article 수정 시각과 실제 내용 수정 이력의 일치.
- 모바일 첫 화면의 남은 표시 지연 원인 추적. 이미지 전달 개선과 종합 성능 목표 달성은 구분한다.
- Search Console·GA4 계정의 최신 노출·클릭·문의, 실제 AI 인용, 업체 프로필 정보 대조.
- 월·목 Windows 자동 예약 전환은 기존 관리자 권한 문제로 대기 상태를 유지한다.
