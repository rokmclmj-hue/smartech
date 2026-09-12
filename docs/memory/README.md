# Astra 프로젝트 메모리

2026-09-09부터 Codex/Astra가 주 작업 도구다. 자동 기억을 기대하지 않고 이 파일을 시작점으로 직접 읽고 갱신한다.

## 새 세션에서 읽을 순서

1. 루트 `AGENTS.md`, `CLAUDE.md`, `docs/astra_handoff.md`의 현재 규칙.
2. [현재 합의·후속 작업](current-state.md), [작업 기록](../astra_work_log.md)의 최신 항목.
3. 블로그 작업이면 `블로그/CLAUDE.md`와 해당 `agents/`·`guides/`, 매트릭스·tracker·원고 폴더·예약 큐.
4. 과거 버그나 다른 업무이면 아래 원본 인덱스와 관련 메모리를 읽는다. 관계없는 예전 작업을 자동 재개하지 않는다.

## 과거 Claude 기록 보존

- 원본: `C:/Users/rokmc/.claude/projects/C--Users-rokmc-smartech/memory/`.
- 로컬 백업: `docs/memory/private-claude-snapshot/2026-09-09/`.
- **97개 Markdown 파일 전부** 복사 후 SHA-256 해시 일치 검증. [파일별 목록](claude-source-manifest.json).
- 백업 안의 `MEMORY.md`가 96개 개별 기록의 탐색 시작점이다. 원본과 백업은 이번 이관 이후의 자동 동기화를 하지 않는다.
- 계정·고객·내부 업무 맥락이 섞인 원문은 `.gitignore`로 제외했다. 코드 저장소에는 현재 운영 규칙과 비밀값 없는 결과만 기록한다.
- 다른 PC로 이동할 때 git clone만으로 이 비공개 백업이 따라오지는 않는다. 필요하면 승인된 비공개 저장 경로로 따로 이전한다.
- 전체 파일 보존 검증과 전체 내용의 사실 검증은 다르다. 이번에는 인덱스, 피드백 규칙, 블로그·SEO·성능·배포·도구 이관 관련 내용을 우선 대조했다. 결제·고객별 수리·견적 등 다른 업무는 해당 작업을 받을 때 원문과 현 코드를 다시 확인한다.

## 관련 과거 메모리 찾기

- 작업 승인·설명·검증: `feedback_wait_for_approval`, `feedback_check_existing_rules_first`, `feedback_verify_before_answer`, `feedback_subagent_self_report_verify`.
- 배포·리뷰: `feedback_review_before_push`, `feedback_merge_prevention`, `project_github_actions_review`, `project_www_domain_redirect_fix`.
- 블로그: `project_blog_pipeline`, `feedback_blog_upload_trigger`, `project_blog_auto_upload_stall`, `feedback_blog_general_vacuum_topics`, `feedback_no_markdown_tables`, `feedback_image_caption_mismatch`.
- 검색·성능: `project_geo_seo`, `project_aeo_geo_audit`, `project_seo_404_fix`, `project_lighthouse_performance`, `project_ga_analytics`, `project_google_business_profile`.
- 다른 업무: 백업 `MEMORY.md`의 전체 인덱스 또는 manifest의 파일명으로 찾는다. 과거의 “완료”가 현재 라이브 상태와 같다고 가정하지 않는다.

## 기록 방법

합의가 바뀌면 current-state와 해당 규칙을 함께 수정한다. 작업 로그에는 변경 이유·검증 명령과 결과·커밋/원격/배포 상태·외부 설정·미완료 사유·다음 행동을 적는다. 실패한 작업도 남긴다. 비밀값·원본 고객 정보는 로그에 붙이지 않는다.

플랫폼의 세션 압축이나 모델 변경 이후에도 이 파일에서 이어간다. 원격 커밋 확인, Vercel 배포 확인, 블로그 DB 발행, Windows 예약 적용은 각각 별도로 기록한다.
