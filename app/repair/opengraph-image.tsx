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
        {/* 배경 수리 현장 이미지 */}
        <img
          src={`${SITE}/images/repair/ih1800-rotors.jpg`}
          alt=""
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: "52%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.3,
          }}
        />

        {/* 그라디언트 오버레이 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to right, #0B0B0C 40%, transparent 75%)",
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
              REPAIR &amp; MAINTENANCE
            </span>
          </div>

          <div style={{ color: "#ffffff", fontSize: 54, fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
            진공펌프
            <br />
            수리 · 정비 전문
          </div>

          <div style={{ color: "#9ca3af", fontSize: 19, lineHeight: 1.6, marginBottom: 36 }}>
            Edwards 정품 부품 사용 · AI 명판 인식 · 당일 접수
          </div>

          {/* 체크리스트 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "드라이펌프 · 오일로터리 · 터보분자 전 기종 수리",
              "Edwards 공인 부품 · 전국 2센터 운영",
              "온라인 수리 접수 · SMS 진행 알림",
            ].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: "#c00020",
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: "#d1d5db", fontSize: 16 }}>{item}</span>
              </div>
            ))}
          </div>

          <div style={{ color: "#4b5563", fontSize: 14, marginTop: 40, letterSpacing: "0.04em" }}>
            SMARTECH · smartechvacuum.com/repair
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
