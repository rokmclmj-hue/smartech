import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { formatBlogInline, prepareBlogBody, getBlogDescription, getBlogImage } from "../lib/blog-inline";

const render = (text: string) => renderToStaticMarkup(createElement("p", null, formatBlogInline(text)));
assert.match(render("[제조사 자료](https://example.com/manual?model=RV&lang=ko)"), /href="https:\/\/example.com\/manual\?model=RV&amp;lang=ko"/);
assert.match(render("[관련 제품](/products/RV)"), /href="\/products\/RV"/);
assert.match(render("**강조** · *조건* · `mbar`"), /<strong>강조<\/strong> · <em>조건<\/em> · <code/);
assert.match(render("[**공식 자료**](https://example.com)"), /<a[^>]*><strong>공식 자료<\/strong><\/a>/);
assert.doesNotMatch(render("<img src=x onerror=alert(1)><script>alert(1)</script>"), /<img|<script/);
for (const href of ["javascript:alert(1)", "data:text/html,test", "//evil.example", "/\\evil.example", "https://example.com/\\evil"]) {
  assert.doesNotMatch(render(`[링크](${href})`), /<a /, href);
}
assert.doesNotMatch(render("`[문자](https://example.com)`"), /<a /);
assert.equal(prepareBlogBody("<!-- internal -->\n# 제목\n본문\n## 조건\n# 다른 제목", "제목"), "\n\n본문\n## 조건\n# 다른 제목");
assert.equal(prepareBlogBody("# 제목\r\n본문", "제목"), "\n본문");
console.log("PASS: blog sources, formatting, escaped HTML, unsafe URLs, editorial comments and duplicate title");

const article = "<!-- 편집 메모 -->\n# 제목\n\n![도식](https://example.com/image.webp)\n## 원리\n**진공**의 [기본 원리](https://example.com/manual)를 설명합니다.";
assert.equal(getBlogDescription(article, "제목", " 기존 요약 "), "기존 요약");
assert.equal(getBlogDescription(article, "제목"), "진공의 기본 원리를 설명합니다.");
assert.equal(getBlogDescription("# 제목\n![그림](https://example.com/a.png)", "제목"), "제목");
assert.equal(getBlogImage(article), "https://example.com/image.webp");
assert.equal(getBlogImage("<!--\n![내부](https://example.com/private.png)\n-->\n본문"), undefined);
assert.equal(getBlogImage("![위험](javascript:alert(1))"), undefined);
assert.equal(getBlogImage("![오류](https://)"), undefined);
console.log("PASS: existing descriptions preserved; fallback excludes headings/images/comments; article image uses visible content");
