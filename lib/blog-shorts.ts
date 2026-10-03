import shortsData from "@/lib/blog-shorts.json";

// 블로그 글 id → 그 글로 만든 유튜브 숏츠. 데이터는 lib/blog-shorts.json
// (블로그/shorts/publish_short.py가 업로드할 때 자동으로 추가한다).
export type BlogShort = { videoId: string; publishAt: string };

const SHORTS = shortsData as Record<string, BlogShort>;

// 유튜브 예약 공개가 정각보다 조금 늦을 수 있어 여유를 둔다.
const PUBLISH_BUFFER_MS = 10 * 60 * 1000;

// 공개 시각이 지난 숏츠만 돌려준다. 예약(비공개) 상태의 영상을 넣으면 "볼 수 없는 동영상"으로 보인다.
export function getPublishedBlogShort(postId: number, now: Date = new Date()): BlogShort | null {
  const short = SHORTS[String(postId)];
  if (!short) return null;
  const publishAt = Date.parse(short.publishAt);
  if (Number.isNaN(publishAt) || now.getTime() < publishAt + PUBLISH_BUFFER_MS) return null;
  return short;
}
