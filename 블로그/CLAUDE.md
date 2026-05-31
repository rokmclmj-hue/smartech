# 블로그 글 작성 자동화 시스템

주제를 받으면 서브 에이전트 4개를 순서대로 호출해 리서치 → 글쓰기 → 이미지 → 통합까지 자동으로 처리하는 오케스트레이터 시스템.

---

## 폴더 구조

```
블로그/agents/       서브 에이전트 정의 파일
블로그/guides/       각 에이전트가 참고하는 가이드 (SEO, 문체, 이미지)
블로그/output/       산출물 (주제별 폴더로 분리)
```

---

## 사용자가 주제를 주면 따라야 할 단계

**Step 1 — 리서치** (`블로그/agents/research.md`)
- 산출물: `블로그/output/[주제]/research.md`

**Step 2 — 글쓰기** (`블로그/agents/writer.md`)
- research.md + 블로그/guides/seo-guide.md + 블로그/guides/style-guide.md + 블로그/guides/company-info.md 기반
- 산출물: naver.md, google.md, meta.txt, faq.json, marketing.txt

**Step 3 — 이미지** (`블로그/agents/image-maker.md`)
- 이미지 소스 순서: 현장사진(1순위) → AI 생성(2순위)
- 재사용 금지: `블로그/output/used-images.json` 확인 후 미사용 사진만 선택
- 산출물: `블로그/output/[주제]/images/` 내 모든 이미지

**Step 4 — 통합** (`블로그/agents/assembler.md`)
- naver.md → naver-final.html, google.md → google-final.html

---

## 반드시 지킬 것

- 메인(오케스트레이터)은 직접 글을 쓰거나 리서치하지 않는다. 모든 실제 작업은 서브 에이전트에게 위임한다.
- 각 단계 진행 중에는 중간 알림 없이 조용히 진행한다. 단, 오류 발생 시에만 즉시 알린다.
- 서브 에이전트 호출 시 해당 `블로그/agents/*.md` 파일을 읽고 지침을 따른다.

---

## 홈페이지 업로드 + 최종 안내 (Step 5)

모든 단계 완료 후 아래 순서로 진행한다.

### 1. 이미지 폴더 자동 열기
아래 명령으로 사진 폴더를 파일 탐색기에서 바로 연다:
```
explorer "C:\Users\rokmc\smartech\블로그\output\[주제]\images"
```

### 2. 홈페이지 업로드 시도
upload_post.py 자동 실행을 시도한다.

### 3. 최종 안내 (항상 표시)
모든 작업이 끝나면 아래 형식으로 한 번만 표시한다. [주제], [id]는 실제 값으로 채운다:

```
✅ 완료!

🌐 홈페이지: https://www.smartechvacuum.com/blog/[id]
📝 네이버 복사: 블로그\output\[주제]\naver.md
📁 사진 폴더: 파일 탐색기에서 열렸습니다
```

업로드가 막혔을 경우 🌐 줄을 아래로 대체한다:
```
⬆️ 홈페이지 업로드: 아래를 프롬프트에 붙여넣으세요
! C:\Users\rokmc\AppData\Local\Programs\Python\Python312\python.exe "C:\Users\rokmc\smartech\블로그\upload_post.py" "[주제]"
```

---

## 세션 마무리 자동 체크 (필수)

사용자가 종료 의사를 표현하면 ("여기까지", "저장해줘", "수고했어", "내일 이어서", "끝내자" 등)
아래 두 가지를 반드시 수행한다.

### 1. 에이전트 업데이트 체크

이번 세션에서 변경된 내용 중 아직 에이전트 파일에 반영 안 된 것이 있으면
해당 파일을 직접 수정한다. 없으면 "에이전트 업데이트 없음"으로 표시.

### 2. VS Code 알림 파일 작성

`C:\Users\rokmc\smartech\블로그\vscode-notify.md` 파일을 생성 또는 업데이트한다.
VS Code에 알려야 할 내용이 있으면 기록하고, 없으면 "없음"으로 표시.

```markdown
# VS Code 알림 — [날짜]

## 알릴 내용
- [항목]

## 없음
(없으면 이 줄만 표시)
```

파일 작성 후 사용자에게 안내:
"📋 VS Code에 알릴 내용을 vscode-notify.md에 저장했어요. VS Code 열면 확인해 주세요."
