import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";
import { loadKoreanFont } from "@/lib/og-font";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const font = await loadKoreanFont().catch(() => null);

  // 블로그 글 제목·카테고리 조회
  const post = await prisma.blogPost
    .findUnique({ where: { id: Number(id) }, select: { title: true, category: true } })
    .catch(() => null);

  const title = post?.title ?? "스마텍 기술 블로그";
  const category = post?.category ?? "진공 기술";

  // 제목이 너무 길면 줄여서 표시
  const displayTitle = title.length > 40 ? title.slice(0, 38) + "…" : title;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "#0B0B0C",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 배경 그리드 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* 왼쪽 빨간 세로 바 */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 6,
            backgroundColor: "#c00020",
          }}
        />

        {/* 콘텐츠 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 80px 60px 86px",
            position: "relative",
            zIndex: 1,
            width: "100%",
          }}
        >
          {/* 카테고리 태그 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                backgroundColor: "#c00020",
                color: "#ffffff",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.12em",
                padding: "6px 14px",
                borderRadius: 2,
              }}
            >
              {category.toUpperCase()}
            </div>
            <span style={{ color: "#6b7280", fontSize: 13, letterSpacing: "0.1em" }}>
              스마텍 기술 블로그
            </span>
          </div>

          {/* 글 제목 */}
          <div
            style={{
              color: "#ffffff",
              fontSize: displayTitle.length > 24 ? 48 : 56,
              fontWeight: 800,
              lineHeight: 1.25,
              marginBottom: 32,
              maxWidth: 900,
            }}
          >
            {displayTitle}
          </div>

          {/* 구분선 */}
          <div
            style={{
              width: 60,
              height: 2,
              backgroundColor: "#374151",
              marginBottom: 28,
            }}
          />

          {/* 하단 브랜딩 */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ color: "#ffffff", fontSize: 18, fontWeight: 700, letterSpacing: "0.04em" }}>
              SMARTECH
            </span>
            <div style={{ width: 1, height: 16, backgroundColor: "#374151" }} />
            <span style={{ color: "#6b7280", fontSize: 14 }}>
              Edwards 공식 채널 파트너 · 진공 기술 전문
            </span>
          </div>
        </div>

        {/* 빨간 하단 바 */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 5,
            backgroundColor: "#c00020",
          }}
        />
      </div>
    ),
    {
      ...size,
      ...(font ? { fonts: [{ name: "NotoSansKR", data: font, weight: 700 }] } : {}),
    }
  );
}
