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
        {/* 왼쪽 콘텐츠 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 64px",
            flex: 1,
          }}
        >
          {/* Edwards 배지 */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <div style={{ width: 28, height: 3, backgroundColor: "#c00020" }} />
            <span style={{ color: "#c00020", fontSize: 13, letterSpacing: "0.18em", fontWeight: 700 }}>
              EDWARDS 공식 채널 파트너
            </span>
          </div>

          {/* 회사명 */}
          <div
            style={{
              color: "#ffffff",
              fontSize: 76,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1,
              marginBottom: 18,
            }}
          >
            SMARTECH
          </div>

          {/* 슬로건 */}
          <div style={{ color: "#d1d5db", fontSize: 24, lineHeight: 1.4, marginBottom: 40 }}>
            진공 기술의 정직한 파트너
          </div>

          {/* 스탯 3개 */}
          <div style={{ display: "flex", gap: 36 }}>
            {[
              { num: "900+", label: "수리 실적" },
              { num: "1,800+", label: "누적 납품" },
              { num: "20년", label: "전문 경력" },
            ].map((s) => (
              <div key={s.num} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ color: "#ffffff", fontSize: 30, fontWeight: 700 }}>{s.num}</span>
                <span style={{ color: "#6b7280", fontSize: 13 }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* URL */}
          <div style={{ color: "#4b5563", fontSize: 14, marginTop: 44, letterSpacing: "0.04em" }}>
            smartechvacuum.com
          </div>
        </div>

        {/* 오른쪽 제품 이미지 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 400,
            backgroundColor: "#111112",
          }}
        >
          <img
            src={`${SITE}/images/products/gxs.jpeg`}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }}
          />
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
