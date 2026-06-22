// Google Fonts에서 한글 지원 폰트를 런타임에 로드 (next/og용)
export async function loadKoreanFont(): Promise<ArrayBuffer> {
  const css = await fetch(
    "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&display=swap",
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    }
  ).then((r) => r.text());

  const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype|woff2)'\)/);
  if (!match) throw new Error("og-font: failed to parse Google Fonts CSS");

  return fetch(match[1]).then((r) => r.arrayBuffer());
}
