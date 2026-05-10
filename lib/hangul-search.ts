const CHO = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

const CHO_SET = new Set(CHO);

export function extractCho(str: string): string {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code >= 0xac00 && code <= 0xd7a3) {
      result += CHO[Math.floor((code - 0xac00) / (21 * 28))];
    } else {
      result += str[i].toLowerCase();
    }
  }
  return result;
}

export function isAllCho(str: string): boolean {
  if (str.length === 0) return false;
  for (const ch of str) {
    if (!CHO_SET.has(ch)) return false;
  }
  return true;
}

export function matchesQuery(target: string | null | undefined, query: string): boolean {
  if (!target || !query) return false;
  const t = target.toLowerCase();
  const q = query.toLowerCase();
  if (t.includes(q)) return true;
  if (isAllCho(query)) {
    return extractCho(target).includes(query);
  }
  return false;
}
