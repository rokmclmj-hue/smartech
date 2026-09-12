# 0911-아웃가스-원리 교정 검토 — 2026-09-09

상태: 미발행 원고 교정 완료. 대표님의 금요일 업로드 요청과 사진·내용 확인 대기. 업로드·예약·승인 상태 변경 없음.

## 변경 이유와 내용

- 마지막 부분에서 반복되던 기록 권고를 하나의 목록으로 정리했다.
- 기체 공급과 배기 능력의 관계, 표면·재료 내부·외부 기체의 출발점, 일반 배기 기록과 압력 상승 시험의 차이를 보강했다.
- 가열 배기는 장비·씰·내부 부품·연결 펌프의 허용 조건을 함께 확인하도록 정리했다. 특정 온도·시간의 공통 처방은 추가하지 않았다.
- `final.md`와 `google.md`를 같은 내용으로 맞췄다. 기존 `google.md`의 짧은 초안과 최종본 차이를 해소했다.
- 공개 원고에 제조사 근거 링크 8개를 해당 설명 근처에 넣었다. 기존 출처 표현 제한보다 이번 SEO·GEO 품질 개선 지시의 근거 확인 목적을 우선했다.
- `naver.md`는 부품 교체 이후 확인하는 독자의 관점으로 별도 구성했다. 실제 상담 사례·작성자 경력·반복 접수 빈도를 만들어 넣지 않았다.
- FAQ 6개를 본문 내용에 맞춰 정리했다. FAQ를 통한 검색 결과 확장이나 AI 인용은 보장하지 않는다.
- `meta.txt` 설명은 공백 포함 150자다.
- `marketing.txt`의 미발행 글 추정 주소를 삭제하고 발행 준비 중·실제 주소는 업로드 확인 후 입력한다고 명시했다. 홍보 문구는 발송하지 않았다.
- 기존 이미지 5개는 수정하지 않았다. 부품 참고 이미지를 실제 고객 설비 사진으로 표현하지 않았다.

## 공식 출처 재확인

기존 `research.md`의 8개 링크를 모두 다시 열고 이번 원고에서 사용하는 설명을 대조했다. 도달 압력·방출률·가열 온도·시간 등 기술 수치를 원고에 추가하지 않았다. 넓은 일반론을 특정 장비의 보증 조건으로 바꾸지 않았다.

1. [Leybold 아웃가스 정의](https://www.leybold.com/en/knowledge/vacuum-fundamentals/fundamental-physics-of-vacuum/outgassing-and-the-mean-free-path) — 정의와 표면적·재료·시간 영향 확인.
2. [Edwards Outgassing](https://www.edwardsvacuum.com/content/dam/brands/edwards-vacuum/general-vacuum/gated-downloads/application-notes/3601-2171-01-outgassing.pdf) — 방출 경로와 전체 가스 부하 구분 확인.
3. [Leybold 누설 분류](https://www.leybold.com/en-us/knowledge/vacuum-fundamentals/leak-detection/definition-and-measurement-of-vacuum-leaks) — 실제 누설·갇힌 공간·투과 구분 확인.
4. [Pfeiffer UHV 챔버 설계](https://www.pfeiffer-vacuum.com/api/empolis/resource/environment/project1_p/documents/pfeifferSharepointProd/12438-article-uhv-chambers.pdf) — 표면·재료·내부 구성과 배기 능력의 관계 확인.
5. [Edwards 베이크아웃 검토 요소](https://www.edwardsvacuum.com/en-ca/vacuum-pumps/knowledge/applications/three-factors-to-consider-when-performing-a-system-bake-out) — 구성품별 허용 온도와 터보펌프 열 노출 주의 확인.
6. [Edwards 아웃가스 저감](https://www.edwardsvacuum.com/content/dam/brands/edwards-vacuum/general-vacuum/gated-downloads/application-notes/3601-2181-01-four-ways-reduce-outgassing.pdf) — 세정·취급·지문·습기 관리 확인.
7. [Leybold 아웃가스 저감](https://www.leybold.com/en/knowledge/blog/how-to-reduce-outgassing-in-vacuum-systems) — 건조 가스 퍼지·벤트 설명 확인.
8. [Leybold 압력 상승 시험](https://www.leybold.com/content/leybold/en-us/knowledge/vacuum-fundamentals/leak-detection/pressure-rise-and-drop-tests.html) — 원인 혼재와 곡선 판정 한계 확인.

자료별 내용을 직접 인용하지 않고 재서술했다. 부품 목록·기록 항목은 위 원리에서 도출한 편집 제안이며 제조사 공통 판정표가 아님을 원고에 명시했다. 기존 연구 문서는 변경하지 않았다.

## 검증 결과

실행: `python 블로그/check_quality.py 기술블로그/2026-09/0911-아웃가스-원리`

- 검사 결과: PASS.
- `final.md`: 검사 도구의 마크다운·공백 제거 기준 2,294자.
- `google.md`: `final.md`와 문자 단위 동일, 같은 기준 2,294자.
- `naver.md`: 도구의 네이버 검사값 3,278자. 이 값은 출처 URL 등을 포함할 수 있으므로 별도 `strip_markdown`으로 재확인한 실질 텍스트는 2,179자.
- 메타 설명: 공백 포함 150자.
- FAQ: JSON 읽기 성공, 질문 6개.
- 이미지: 썸네일 1개 + 본문 4개, 실제 이미지 5개. 네이버 본문 마커 4개와 사진 파일 4개 일치.
- 표 문법·사진 용량·연락처 중복 검사 통과.
- 현장사진은 기존 `no-field-photo.md` 예외로 통과. EXIF 회전·펌프 좌표는 해당 현장사진이 없어 건너뛴 항목이다.
- `git diff --check` 대상 폴더 점검 통과.
- 검사 도구 실행으로 `블로그/quality-log.jsonl`에 PASS 기록 1건 자동 추가됨. 해당 파일의 다른 기존 기록은 수정하지 않았다.

## 남은 확인

- 홈페이지 마크다운 링크가 실제로 표시되는지는 홈페이지 렌더러 검토 결과와 함께 확인한다. 원고 링크 추가가 이미 배포되거나 라이브에서 확인됐다는 뜻은 아니다.
- 글 업로드 전 원고·사진을 대표님이 검토한다. 네이버 게시 시 `[THUMBNAIL]`, `[IMAGE: ...]`, 검수 주석은 사진으로 교체하거나 제거하고, 출처 링크는 네이버 에디터에서 실제 링크로 표시되는지 확인한다.
- 이번 교정은 내용 준비 작업이며 `approved` 변경·업로드 API 호출·홍보 전송은 하지 않았다. 커밋·푸시와 프로젝트 공통 작업 기록은 메인 작업에서 취합한다.
