import type { ReactNode } from "react";

// Deliberately small Markdown subset. Plain text stays React text (never raw HTML).
export function formatBlogInline(text: string, allowLinks = true): ReactNode[] {
  const token = /`([^`\n]+)`|\[([^\]\n]+)\]\((https?:\/\/[^\s)]+|\/(?!\/)[^\s)]*)\)|\*\*([^*\n]+)\*\*|\*([^*\n]+)\*/g;
  const result: ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(token)) {
    const start = match.index!;
    result.push(text.slice(cursor, start));
    if (match[1] !== undefined) {
      result.push(<code key={start} className="bg-ink/10 px-1 py-0.5 rounded text-[13px] mono">{match[1]}</code>);
    } else if (match[2] !== undefined && allowLinks) {
      // Reject backslashes/control characters that browsers can reinterpret in URLs.
      const href = match[3];
      if (/[\\\u0000-\u0020\u007f]/.test(href)) {
        result.push(match[0]);
      } else {
        result.push(<a key={start} href={href} className="underline underline-offset-4 text-smblue break-words">{formatBlogInline(match[2], false)}</a>);
      }
    } else if (match[4] !== undefined) {
      result.push(<strong key={start}>{formatBlogInline(match[4], allowLinks)}</strong>);
    } else if (match[5] !== undefined) {
      result.push(<em key={start}>{match[5]}</em>);
    } else {
      result.push(match[0]);
    }
    cursor = start + match[0].length;
  }
  result.push(text.slice(cursor));
  return result;
}

export function prepareBlogBody(content: string, title: string): string {
  // Editorial comments are not reader content. Keep the page header as the title.
  return content.replace(/<!--[\s\S]*?-->/g, "").replace(/^# (.+)\r?$/gm, (line, heading: string) =>
    heading.trim() === title.trim() ? "" : line
  );
}

export function getBlogDescription(content: string, title: string, metaDesc?: string | null): string {
  if (metaDesc?.trim()) return metaDesc.trim();
  const paragraph = prepareBlogBody(content, title).split(/\r?\n/)
    .map(line => line.trim())
    .find(line => line && !/^(?:#|!\[|[-*]\s|---+$|[|>]|\d+\.\s)/.test(line));
  return (paragraph ?? title)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*`]/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ").trim().slice(0, 160);
}

// Only use an image actually rendered from the article's Markdown body.
export function getBlogImage(content: string): string | undefined {
  const match = content.replace(/<!--[\s\S]*?-->/g, "")
    .match(/^!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/m);
  if (!match || /[\\\u0000-\u0020\u007f]/.test(match[1])) return undefined;
  try {
    return new URL(match[1]).href;
  } catch {
    return undefined;
  }
}
