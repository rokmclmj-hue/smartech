// X(트위터)는 한글·한자·전각기호 등을 1글자당 가중치 2로 계산해 280자 제한에 적용한다.
// JS 문자열 .length(코드유닛 개수)는 이 가중치를 반영하지 않아, 실제로는 초과인데도
// 화면에는 제한 안쪽으로 표시되는 문제가 있었다(2026-09 X 게시 403 원인).
// 범위는 twitter-text(공식 라이브러리) v3 weightedLength 설정 중 한글·CJK·전각 문자 구간을 반영한다.
const WIDE_RANGES: [number, number][] = [
  [0x1100, 0x115f], // 한글 자모
  [0x11a3, 0x11a7],
  [0x11fa, 0x11ff],
  [0x2e80, 0x303e], // CJK 부수·기호
  [0x3041, 0x33ff], // 히라가나·가타카나·CJK 기호·한자 확장
  [0x3400, 0x4db5], // CJK 확장 A
  [0x4e00, 0x9fff], // CJK 통합 한자
  [0xa000, 0xa4c6], // 이彝 문자
  [0xac00, 0xd7a3], // 한글 음절
  [0xf900, 0xfaff], // CJK 호환 한자
  [0xfe30, 0xfe6b], // CJK 호환 자소
  [0xff01, 0xff60], // 전각 문자
  [0xffe0, 0xffe6],
];

function isWideCodePoint(codePoint: number): boolean {
  return WIDE_RANGES.some(([start, end]) => codePoint >= start && codePoint <= end);
}

// X 기준 가중 글자 수 계산 (링크 자동단축 등은 미반영 — 일반 텍스트 글에 한함)
export function getXWeightedLength(text: string): number {
  let weighted = 0;
  for (const ch of text) {
    const codePoint = ch.codePointAt(0) ?? 0;
    weighted += isWideCodePoint(codePoint) ? 2 : 1;
  }
  return weighted;
}
