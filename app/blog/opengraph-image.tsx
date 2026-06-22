import { ImageResponse } from "next/og";
import { loadKoreanFont } from "@/lib/og-font";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const font = await loadKoreanFont().catch(() => null);

  const categories = ["드라이펌프", "오일로터리", "터보분자", "진공게이지", "소모품·부품"];

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
        {/* 배경 그리드 패턴 (미묘한 선) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* 콘텐츠 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 80px",
            position: "relative",
            zIndex: 1,
            width: "100%",
          }}
        >
          {/* 상단 배지 */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <div style={{ width: 28, height: 3, backgroundColor: "#c00020" }} />
            <span style={{ color: "#c00020", fontSize: 13, letterSpacing: "0.18em", fontWeight: 700 }}>
              TECHNICAL BLOG
            </span>
          </div>

          {/* 메인 타이틀 */}
          <div style={{ color: "#ffffff", fontSize: 64, fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>
            스마텍
            <br />
            기술 블로그
          </div>

          <div style={{ color: "#9ca3af", fontSize: 20, marginBottom: 44 }}>
            진공 기술 전문 지식 · 산업별 적용 가이드 · 유지보수 노하우
          </div>

          {/* 카테고리 태그들 */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {categories.map((c) => (
              <div
                key={c}
                style={{
                  backgroundColor: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 4,
                  padding: "8px 16px",
                  color: "#d1d5db",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {c}
              </div>
            ))}
          </div>

          <div style={{ color: "#4b5563", fontSize: 14, marginTop: 44, letterSpacing: "0.04em" }}>
            SMARTECH · smartechvacuum.com/blog
          </div>
        </div>

        {/* 오른쪽 빨간 세로 액센트 바 */}
        <div
          style={{
            position: "absolute",
            right: 80,
            top: "50%",
            transform: "translateY(-50%)",
            width: 3,
            height: 180,
            backgroundColor: "#c00020",
            opacity: 0.4,
          }}
        />

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
