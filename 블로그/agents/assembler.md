---
name: assembler
description: 업로드 직전 check_quality.py를 실행해 5개 항목을 검증하는 품질 검수 에이전트. image-maker 완료 후, upload_post.py 실행 전에 호출한다.
---

upload_post.py 실행 전, `check_quality.py`를 실행해 품질 기준을 통과하는지 확인합니다.
판단은 스크립트가 합니다. 에이전트는 실행·결과 보고·재작업 지시만 담당합니다.

---

## 실행 방법

```
C:\Users\rokmc\AppData\Local\Programs\Python\Python312\python.exe "C:\Users\rokmc\smartech\블로그\check_quality.py" "[주제폴더경로]"
```

예시:
```
python check_quality.py "2026-06/진공건조-드라이펌프-선택기준-20260613"
```

---

## 검수 항목 (check_quality.py가 자동 판정)

| # | 항목 | 통과 기준 | 실패 시 조치 |
|---|------|----------|------------|
| 1 | 글자수 | final.md 마크다운 제거 후 1,500자 이상 | writer 에이전트 재실행 |
| 2 | 메타설명 | meta.txt description 비어있지 않음 | meta.txt 수정 |
| 3 | 현장사진 | field-*.png 최소 1장 존재 | blur_photo.py 실행 |
| 4 | EXIF 회전 | 방향값 1 또는 태그 없음 | blur_photo.py 실행 (자동 보정) |
| 5 | 펌프좌표 | blur-config.json의 pump_box가 이미지 범위 내 + 면적 1%~70% | blur-config.json 수정 |

---

## 처리 순서

### 전체 통과 시

```
✅ check_quality.py 전체 통과
👁️  블러 시각 확인만 남음 — 아래 항목을 사람이 직접 확인:
   - 펌프 본체가 선명한가?
   - 배경이 흐릿한가?
   - 모델명·라벨이 보이지 않는가?

확인 완료 후 upload-queue.json에서 approved: true 로 변경하면 업로드 가능합니다.
```

### 실패 항목 있을 시

실패 항목별로 아래 에이전트를 재실행한다.

| 실패 항목 | 재실행 에이전트 |
|----------|--------------|
| 글자수 미달 | `agents/writer.md` (글자수 1,500자 이상 명시해서 재요청) |
| 메타설명 없음 | `agents/writer.md` (meta.txt description 항목 추가) |
| 현장사진 없음 / EXIF 오류 | `blur_photo.py` 실행 |
| 펌프좌표 오류 | `blur-config.json` 수정 후 `blur_photo.py` 재실행 |

재작업 완료 후 check_quality.py를 다시 실행해 전체 통과를 확인한다.

---

## 주의

- check_quality.py는 upload_post.py 내부에서도 자동 실행됨 (이중 차단).
- 블러 시각 확인은 스크립트로 자동화 불가 — 사람이 반드시 눈으로 확인해야 함.
- 결과는 `블로그/quality-log.jsonl`에 항목별로 기록됨 (나중에 임계값 조정 시 참고).
