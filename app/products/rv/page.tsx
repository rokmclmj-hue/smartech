import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "RV 오일 로터리 베인 펌프 시리즈 — 스마텍 | Edwards Vacuum",
  description:
    "Edwards RV3·RV5·RV8·RV12 소형 오일 로터리 베인 펌프 스펙 비교표. 배기속도·도달압력·소음·무게를 한눈에 비교하고 스마텍에서 정품 공급·견적·문의.",
  alternates: { canonical: "https://smartechvacuum.com/products/rv" },
  openGraph: {
    title: "RV 오일 로터리 베인 펌프 시리즈 — 스마텍",
    description: "Edwards RV3·RV5·RV8·RV12 스펙 비교표. 스마텍 정품 공급.",
    url: "https://smartechvacuum.com/products/rv",
    type: "website",
    siteName: "스마텍",
    locale: "ko_KR",
  },
};

const SPECS = [
  { label: "배기속도 (50 Hz)", unit: "m³/h", values: ["3.3", "5.1", "8.5", "12"] },
  { label: "도달압력 (Total)", unit: "mbar", values: ["2.0×10⁻³", "2.0×10⁻³", "2.0×10⁻³", "2.0×10⁻³"] },
  { label: "모터 출력 (1상 · 50 Hz)", unit: "W", values: ["450", "450", "450", "450"] },
  { label: "소음", unit: "dB(A)", values: ["48", "48", "48", "48"] },
  { label: "무게", unit: "kg", values: ["25", "25", "28", "29"] },
  { label: "오일 용량", unit: "L", values: ["0.7", "0.7", "0.75", "1.0"] },
  { label: "인렛 플랜지", unit: "", values: ["NW25", "NW25", "NW25", "NW25"] },
  { label: "배기 플랜지", unit: "", values: ["NW25", "NW25", "NW25", "NW25"] },
  { label: "작동 온도", unit: "°C", values: ["12 ~ 40", "12 ~ 40", "12 ~ 40", "12 ~ 40"] },
];

const MODELS = ["RV3", "RV5", "RV8", "RV12"];

const FEATURES = [
  "75년 이상 Edwards 오일 로터리 베인 기술의 집약체",
  "고진공 모드 / 고유량 모드 전환 가능 (Mode Switch)",
  "2단계 가스 밸러스트 — 수분 처리 최대 220 g/h (RV12: 290 g/h)",
  "빠른 자동 인렛 밸브 — 정전 시 0.4초 이내 닫힘 (역류 방지)",
  "단일 육각 렌치로 전체 분해 가능한 유지보수 설계",
  "UL · CSA 외부 인증 완료",
];

export default function RvSeriesPage() {
  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-10 md:py-16">
      {/* 브레드크럼 */}
      <div className="text-[12px] mono dim mb-8 flex items-center gap-2">
        <Link href="/products" className="hover:text-edred transition-colors">제품 카탈로그</Link>
        <span>›</span>
        <span>RV 시리즈</span>
      </div>

      {/* 헤더 */}
      <div className="mb-10 md:mb-14 grid md:grid-cols-2 gap-8 items-end">
        <div>
          <div className="mono text-[11px] dim mb-3">오일 로터리 베인 펌프 · 소형</div>
          <h1 className="display text-[clamp(32px,5vw,56px)] leading-[1.05] tracking-tight">
            RV 시리즈<span className="text-edred">.</span>
          </h1>
          <p className="mt-5 text-[15px] leading-[1.75] text-[#2a2823] max-w-[44ch]">
            연구·분석·산업 공정에 검증된 Edwards 소형 오일 로터리 베인 펌프.
            RV3부터 RV12까지 4가지 배기속도로 공정 조건에 맞게 선택할 수 있습니다.
          </p>
        </div>
        <div className="flex justify-center md:justify-end">
          <img
            src="/images/products/rv.jpeg"
            alt="Edwards RV 시리즈 오일 로터리 베인 펌프"
            className="max-h-[200px] object-contain"
          />
        </div>
      </div>

      {/* 스펙 비교표 */}
      <section className="mb-14">
        <h2 className="display text-[22px] mb-6">모델 스펙 비교</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13.5px]">
            <thead>
              <tr className="bg-ink text-paper">
                <th className="text-left px-4 py-3 font-medium mono text-[11px] tracking-wider w-[40%]">스펙 항목</th>
                {MODELS.map((m) => (
                  <th key={m} className="px-4 py-3 font-bold text-center display text-[18px]">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SPECS.map((row, i) => (
                <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-paper"}>
                  <td className="px-4 py-3 text-[13px] text-[#2a2823]">
                    {row.label}
                    {row.unit && <span className="ml-1 text-[11px] dim">({row.unit})</span>}
                  </td>
                  {row.values.map((v, j) => (
                    <td key={j} className="px-4 py-3 text-center font-mono tabular-nums text-[13px]">
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] dim mono">※ 50 Hz 기준. 60 Hz 사양은 카탈로그 PDF 참조.</p>
      </section>

      {/* 주요 특징 */}
      <section className="mb-14">
        <h2 className="display text-[22px] mb-6">주요 특징</h2>
        <ul className="space-y-3">
          {FEATURES.map((f, i) => (
            <li key={i} className="flex gap-3 text-[14px] leading-[1.7] text-[#2a2823]">
              <span className="text-edred font-bold shrink-0">{String(i + 1).padStart(2, "0")}</span>
              {f}
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <div className="border-t hair pt-10 flex flex-col sm:flex-row gap-4">
        <a
          href="/catalogs/1.오일펌프_소형RV.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-ink px-6 py-3 text-[13px] hover:bg-ink hover:text-paper transition-colors"
        >
          카탈로그 PDF →
        </a>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-edred text-paper px-6 py-3 text-[13px] hover:bg-ink transition-colors"
        >
          견적 담기 / 가격 확인 →
        </Link>
      </div>
    </div>
  );
}
