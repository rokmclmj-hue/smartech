import { ImageResponse } from "next/og";
import { loadKoreanFont } from "@/lib/og-font";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SITE = "https://www.smartechvacuum.com";

export default async function Image() {
  const font = await loadKoreanFont().catch(() => null);

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
        {/* 배경 이미지 (Gold Award 사진, 어둡게) */}
        <img
          src={`${SITE}/images/about/gold-award.png`}
          alt=""
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: "55%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.25,
          }}
        />

        {/* 왼쪽→오른쪽 그라디언트 오버레이 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to right, #0B0B0C 45%, transparent 80%)",
          }}
        />

        {/* 콘텐츠 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 72px",
            position: "relative",
            zIndex: 1,
            maxWidth: 680,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 28, height: 3, backgroundColor: "#c00020" }} />
            <span style={{ color: "#c00020", fontSize: 13, letterSpacing: "0.18em", fontWeight: 700 }}>
              COMPANY
            </span>
          </div>

          <div style={{ color: "#ffffff", fontSize: 54, fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
            진공 기술의
            <br />
            정직한 파트너
          </div>

          <div style={{ color: "#9ca3af", fontSize: 20, lineHeight: 1.6, marginBottom: 36 }}>
            Edwards Gold Award 수상 · 한국 최우수 채널 파트너
          </div>

          <div style={{ display: "flex", gap: 28 }}>
            {[
              { num: "20년", label: "업력" },
              { num: "900+", label: "수리 실적" },
              { num: "1,800+", label: "납품 실적" },
            ].map((s) => (
              <div key={s.num} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ color: "#ffffff", fontSize: 26, fontWeight: 700 }}>{s.num}</span>
                <span style={{ color: "#6b7280", fontSize: 13 }}>{s.label}</span>
              </div>
            ))}
          </div>

          <div style={{ color: "#4b5563", fontSize: 14, marginTop: 40, letterSpacing: "0.04em" }}>
            SMARTECH · smartechvacuum.com/about
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
