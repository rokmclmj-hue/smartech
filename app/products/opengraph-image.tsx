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
          backgroundColor: "#0d3a8a",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 배경 미묘한 텍스처 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, #0d3a8a 0%, #071f4d 100%)",
          }}
        />

        {/* 오른쪽 제품 이미지 그룹 */}
        <div
          style={{
            position: "absolute",
            right: -30,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            opacity: 0.35,
          }}
        >
          <img
            src={`${SITE}/images/products/gxs.jpeg`}
            alt=""
            style={{ width: 380, height: 220, objectFit: "cover" }}
          />
          <img
            src={`${SITE}/images/products/nxri.jpeg`}
            alt=""
            style={{ width: 380, height: 220, objectFit: "cover" }}
          />
        </div>

        {/* 콘텐츠 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 72px",
            position: "relative",
            zIndex: 1,
            maxWidth: 700,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <div style={{ width: 28, height: 3, backgroundColor: "#ffffff" }} />
            <span style={{ color: "#93c5fd", fontSize: 13, letterSpacing: "0.18em", fontWeight: 700 }}>
              EDWARDS 진공펌프 전문 공급
            </span>
          </div>

          <div style={{ color: "#ffffff", fontSize: 58, fontWeight: 800, lineHeight: 1.1, marginBottom: 18 }}>
            진공펌프
            <br />
            전체 카탈로그
          </div>

          <div style={{ color: "#bfdbfe", fontSize: 20, lineHeight: 1.5, marginBottom: 36 }}>
            드라이펌프 · 오일로터리 · 터보분자 · 게이지 · 컨트롤러
          </div>

          <div style={{ display: "flex", gap: 28 }}>
            {[
              { num: "1,014+", label: "취급 품목" },
              { num: "5개", label: "제품 카테고리" },
              { num: "B2B", label: "등급별 우대가" },
            ].map((s) => (
              <div
                key={s.num}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  padding: "12px 20px",
                  borderRadius: 4,
                }}
              >
                <span style={{ color: "#ffffff", fontSize: 24, fontWeight: 700 }}>{s.num}</span>
                <span style={{ color: "#93c5fd", fontSize: 13 }}>{s.label}</span>
              </div>
            ))}
          </div>

          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, marginTop: 40, letterSpacing: "0.04em" }}>
            SMARTECH · smartechvacuum.com/products
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
