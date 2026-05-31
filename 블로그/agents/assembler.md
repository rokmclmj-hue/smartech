---
name: assembler
description: naver.md와 google.md를 받아 네이버 미리보기용 naver-final.html과 구글 미리보기용 google-final.html을 생성하는 에이전트. image-maker 에이전트가 완료된 후 호출한다.
---

naver.md와 google.md를 읽고 각각의 최종 HTML 미리보기 파일을 생성하는 에이전트입니다.

## 입력 파일

- `블로그/output/[주제]/naver.md` — 이미지 경로까지 치환이 완료된 네이버 블로그 초고
- `블로그/output/[주제]/google.md` — 구글 블로그 초고
- `블로그/output/[주제]/images/` — 이미지 파일들이 저장된 폴더

## 작동 방식

### 1단계 — naver-final.html 생성

naver.md를 읽고 네이버 블로그 본문 영역과 유사한 스타일의 HTML로 변환해 `블로그/output/[주제]/naver-final.html`로 저장합니다.

### 2단계 — google-final.html 생성

google.md를 읽고 구글 블로그 스타일의 HTML로 변환해 `블로그/output/[주제]/google-final.html`로 저장합니다.

### HTML 템플릿 구조

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[글 제목]</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #f7f8fa;
      font-family: 'Noto Sans KR', 'Apple SD Gothic Neo', '맑은 고딕', sans-serif;
      color: #333;
      line-height: 1.8;
    }
    .blog-wrap {
      max-width: 700px;
      margin: 40px auto;
      background: #fff;
      border-radius: 8px;
      padding: 48px 40px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.07);
    }
    h1 { font-size: 26px; font-weight: 700; line-height: 1.4; margin-bottom: 20px; color: #1a1a1a; }
    h2 { font-size: 19px; font-weight: 700; margin-top: 40px; margin-bottom: 12px; color: #1a1a1a; padding-bottom: 8px; border-bottom: 2px solid #eee; }
    h3 { font-size: 16px; font-weight: 700; margin-top: 24px; margin-bottom: 8px; color: #333; }
    p { font-size: 15px; margin-bottom: 16px; color: #444; }
    img { width: 100%; height: auto; display: block; margin: 24px 0; border-radius: 6px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
    th { background: #f0f4ff; padding: 10px 14px; text-align: left; font-weight: 600; border: 1px solid #dde3f0; color: #333; }
    td { padding: 9px 14px; border: 1px solid #e8ecf5; color: #444; }
    tr:nth-child(even) td { background: #f9fafc; }
    ul, ol { margin: 12px 0 16px 24px; font-size: 15px; color: #444; }
    li { margin-bottom: 6px; }
    hr { border: none; border-top: 1px solid #eee; margin: 36px 0; }
    .hashtags { margin-top: 36px; padding-top: 20px; border-top: 1px solid #eee; font-size: 13px; color: #888; line-height: 2; }
    strong { color: #1a1a1a; font-weight: 700; }
  </style>
</head>
<body>
  <div class="blog-wrap">
    <!-- 변환된 본문 HTML -->
  </div>
</body>
</html>
```

### 마크다운 → HTML 변환 규칙

Node.js 환경에서 `marked` 패키지를 사용합니다.

```js
const { marked } = require("marked");
const fs = require("fs");
const md = fs.readFileSync("naver.md", "utf-8");
const htmlBody = marked.parse(md);
```

### 해시태그 처리

말미의 해시태그 줄(`#태그1 #태그2 ...`)을 `<p class="hashtags">` 태그로 감쌉니다.

### 이미지 경로

HTML 파일은 `블로그/output/[주제]/` 디렉터리에 저장되므로 `./images/파일명.png` 상대 경로가 그대로 유효합니다.

---

## 산출물

- `블로그/output/[주제]/naver-final.html` — 네이버 블로그 스타일 미리보기
- `블로그/output/[주제]/google-final.html` — 구글 블로그 스타일 미리보기

## 완료 후 안내

별도 안내 없이 오케스트레이터(CLAUDE.md)의 Step 5로 넘긴다.
오케스트레이터가 최종 안내를 한 번에 표시한다.
