# 스마텍 홈페이지 SEO·GEO 중간 점검 — 2026-10-04

9/9·9/25와 같은 `scripts/audit-public-seo.py` 로직(출력 경로만 변경)으로 재측정. 원본: [2026-10-04-public-crawl.json](2026-10-04-public-crawl.json). 속도(PSI)·Search Console·GA4·실제 AI 답변 인용은 이번에 측정하지 않았다.

## 9/9 → 9/25 → 10/4

| 항목 | 9/9 | 9/25 | 10/4 |
|---|---|---|---|
| 사이트맵 URL / 블로그 | 1,162 / 54 | 1,173 / 59 | 1,177 / 63 |
| 표본 HTTP 200 | 102/102 | 107/107 | 111/111 |
| H1 1개 아님 / 설명문 없음 | 53 / 1 | 0 / 0 | 0 / 0 |
| canonical 불일치·제목 중복·JSON-LD 오류 | 0 | 0 | 0 |
| 블로그 Article 대표 이미지 | 0/54 | 56/59 | 60/63 (같은 3편 누락) |
| 블로그 사진 width/height 없음 | 214 | 235 | 2 |
| 본문 링크 있는 블로그 | 0 | 3 | 5 |
| 설명문 50자 미만·170자 초과 | 25 | 24 | 24 (산업 20쪽 30~47자 등) |
| llms.txt·llms-full.txt·AI봇 허용 | 있음 | 있음 | 있음(GPTBot·ClaudeBot·PerplexityBot·Google-Extended·OAI-SearchBot·Yeti 모두 200, llms.txt에 id=105까지 반영) |
| Organization sameAs | 없음 | 4곳 | 4곳 유지 |

## 유튜브 쇼츠

- 공개 피드 기준 9/1~10/2 월·수·금 09:00에 빠짐없이 공개, 24번(반도체 에칭·CMP)까지 공개. 남은 18편은 11/13까지 예약(기록상). 최근 15편 조회수 12~338회.
- `check_status.py`는 token 만료(invalid_grant)로 실패 — 비공개 예약분 직접 조회는 못 함.
- 쇼츠 원본은 8/17 기준 블로그 42편. 이후 발행 글은 쇼츠 없음. 11/13 이후 대기 영상 0.
- 블로그 글에는 채널 링크만 있고 해당 글의 쇼츠 삽입·VideoObject 없음.

## 외부 노출 (웹 검색 3건, 미국 기준 도구)

- "스마텍 진공펌프": 인더스트리투데이·투데이안·뉴스와이어·한국인포맥스 기사 + 자사 페이지. 9/25와 같은 기사들이며 새 제3자 언급은 확인 못 함. 옛 주소 `/About-Us`·`/Location` 여전히 노출.
- "에드워드 진공펌프 공식 대리점 수리": 요약이 스마텍을 공식 대리점·수원/천안·전화번호로 정확히 설명.
- "smartechvacuum.com": 인도 Smart Tech Vacuum Solutions(smarttechvacuum.com)가 다수 차지 — 혼동 여전.

## 보완 후보 (미착수, 대표님 결정 대기)

1. 11/13 이후 쇼츠 다음 묶음 제작(8월 이후 블로그 글).
2. 블로그 글에 해당 쇼츠 삽입 + VideoObject.
3. 산업 페이지 20개 설명문 보강(30~47자).
4. Article 이미지 누락 3편(`edwards-rv-rotary-vane-pump-new-repair-used`, `discontinued-vacuum-pump-model-replacement`, `vacuum-pump-lead-time-delay`).
5. 새 제3자 언급(구글 리뷰·업계지 기고).
