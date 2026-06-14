"use client";
import { useEffect, useState } from "react";

type Product = {
  id: number;
  partNo: string;
  description: string;
  displayPrice: number | null;
  priceStatus: "login" | "pending" | "visible";
  category: string;
  isImportant: boolean;
};

export type PanelItem = {
  category: string;
  code: string;
  title: string;
  image: string;
};

type Props = {
  item: PanelItem | null;
  onClose: () => void;
  catalogUrl?: string;
};

type SpecData = {
  models: string[];
  rows: { label: string; unit: string; values: string[] }[];
};

const SPEC_DATA: Record<string, SpecData> = {
  "오일펌프(소형 RV)": {
    models: ["RV3", "RV5", "RV8", "RV12"],
    rows: [
      { label: "배기속도 (60 Hz)", unit: "m³/h", values: ["3.9", "6.1", "10.0", "14.3"] },
      { label: "도달압력 (Total)", unit: "mbar", values: ["2.0×10⁻³", "2.0×10⁻³", "2.0×10⁻³", "2.0×10⁻³"] },
      { label: "모터 출력 (60 Hz)", unit: "W", values: ["550", "550", "550", "550"] },
      { label: "회전수 (60 Hz)", unit: "rpm", values: ["1,800", "1,800", "1,800", "1,800"] },
      { label: "소음", unit: "dB(A)", values: ["48", "48", "48", "48"] },
      { label: "무게", unit: "kg", values: ["25", "25", "28", "29"] },
      { label: "오일 용량", unit: "L", values: ["0.7", "0.7", "0.75", "1.0"] },
      { label: "인렛 플랜지", unit: "", values: ["NW25", "NW25", "NW25", "NW25"] },
      { label: "배기 플랜지", unit: "", values: ["NW25", "NW25", "NW25", "NW25"] },
      { label: "작동 온도", unit: "°C", values: ["12~40", "12~40", "12~40", "12~40"] },
      { label: "외형 치수 (L×W×H)", unit: "mm", values: ["430×158×225", "430×158×225", "470×158×225", "490×158×225"] },
    ],
  },
  "오일펌프(소형 E2M)": {
    models: ["E2M0.7", "E2M1.5", "E2M18", "E2M28"],
    rows: [
      { label: "배기속도 (60 Hz)", unit: "m³/h", values: ["0.85", "2.0", "20.6", "33.1"] },
      { label: "도달압력 (Total)", unit: "mbar", values: ["3×10⁻³", "3×10⁻³", "1×10⁻³", "1×10⁻³"] },
      { label: "모터 출력 (60 Hz)", unit: "W", values: ["90", "160", "750", "900"] },
      { label: "회전수 (60 Hz)", unit: "rpm", values: ["1,700", "1,700", "1,720", "1,720"] },
      { label: "소음", unit: "dB(A)", values: ["43", "54", "57", "57"] },
      { label: "무게", unit: "kg", values: ["10", "10", "39", "44"] },
      { label: "오일 용량", unit: "L", values: ["0.2~0.28", "0.2~0.28", "0.75~1.05", "1.2~1.5"] },
      { label: "인렛 플랜지", unit: "", values: ["NW10", "NW10", "NW25", "NW25"] },
      { label: "작동 온도", unit: "°C", values: ["12~40", "12~40", "13~40", "13~40"] },
    ],
  },
  "오일펌프(중대형 E2S)": {
    models: ["E2S45", "E2S65", "E2S85"],
    rows: [
      { label: "배기속도 (60 Hz)", unit: "m³/h", values: ["50", "69", "94"] },
      { label: "도달압력 (Total)", unit: "mbar", values: ["3.0×10⁻³", "3.0×10⁻³", "3.0×10⁻³"] },
      { label: "모터 출력 (60 Hz)", unit: "kW", values: ["1.3", "1.8", "2.6"] },
      { label: "소음 (60 Hz)", unit: "dB(A)", values: ["60", "62", "62"] },
      { label: "무게", unit: "kg", values: ["80", "90", "100"] },
      { label: "오일 용량", unit: "L", values: ["4.3", "4.8", "5.5"] },
      { label: "인렛 플랜지", unit: "", values: ["NW40", "NW40", "NW40"] },
      { label: "배기 플랜지", unit: "", values: ["NW25", "NW25", "NW25"] },
      { label: "외형 치수 (L×W×H)", unit: "mm", values: ["740×244×405", "770×244×405", "857×244×405"] },
    ],
  },
  "오일펌프(중대형 E2M)": {
    models: ["E2M40", "E2M80", "E2M175", "E2M275"],
    rows: [
      { label: "배기속도 (60 Hz)", unit: "m³/h", values: ["44", "90", "196", "306"] },
      { label: "도달압력 (Total)", unit: "mbar", values: ["3.0×10⁻³", "3.0×10⁻³", "3.0×10⁻³", "3.0×10⁻³"] },
      { label: "모터 출력 (60 Hz)", unit: "kW", values: ["1.5", "3.0", "6.5", "8.5"] },
      { label: "소음", unit: "dB(A)", values: ["65", "65", "75", "75"] },
      { label: "무게", unit: "kg", values: ["75", "104", "198", "216"] },
      { label: "오일 용량", unit: "L", values: ["2.2~4", "4~6.3", "16~25", "18~28"] },
      { label: "인렛 플랜지", unit: "", values: ["NW40", "NW40", "NW63", "NW63"] },
      { label: "배기 플랜지", unit: "", values: ["NW25", "NW25", "NW40", "NW40"] },
      { label: "외형 치수 (L×W×H)", unit: "mm", values: ["780×240×395", "889×266×429", "1055×388×533", "1165×388×533"] },
    ],
  },
  "오일펌프(nES)": {
    models: ["nES40", "nES65", "nES100", "nES200"],
    rows: [
      { label: "배기속도 (60 Hz)", unit: "m³/h", values: ["47", "64", "105", "200"] },
      { label: "도달압력 (Total)", unit: "mbar", values: ["0.5", "0.5", "0.5", "0.08"] },
      { label: "모터 출력 (60 Hz)", unit: "kW", values: ["1.3", "1.8", "3.6", "5.5"] },
      { label: "소음 (60 Hz)", unit: "dB(A)", values: ["60", "64", "64", "73"] },
      { label: "무게", unit: "kg", values: ["67", "86", "104", "142"] },
      { label: "오일 용량", unit: "L", values: ["1", "2", "2", "5~9"] },
      { label: "인렛 플랜지", unit: "", values: ["NW40", "NW40", "NW40", "NW63"] },
      { label: "배기 플랜지", unit: "", values: ["NW40", "NW40", "NW40", "NW63"] },
      { label: "외형 치수 (L×W×H)", unit: "mm", values: ["540×284×303", "586×320×314", "721×400×319", "1002×535×415"] },
    ],
  },
  "스크롤펌프(소형 nXDS)": {
    models: ["nXDS6i", "nXDS10i", "nXDS15i", "nXDS20i"],
    rows: [
      { label: "배기속도 (Peak)", unit: "m³/h", values: ["6.2", "12.7", "17.1", "22.0"] },
      { label: "도달압력", unit: "mbar", values: ["2.0×10⁻²", "7.0×10⁻³", "7.0×10⁻³", "3.0×10⁻²"] },
      { label: "모터 출력", unit: "W", values: ["260", "280", "300", "260"] },
      { label: "회전수", unit: "rpm", values: ["1,800", "1,800", "1,800", "1,800"] },
      { label: "소음", unit: "dB(A)", values: ["<52", "<52", "<52", "<52"] },
      { label: "무게", unit: "kg", values: ["26.2", "25.8", "25.2", "25.6"] },
      { label: "인렛 플랜지", unit: "", values: ["NW25", "NW25", "NW25", "NW25"] },
      { label: "배기 플랜지", unit: "", values: ["NW25", "NW25", "NW25", "NW25"] },
      { label: "작동 온도", unit: "°C", values: ["10~40", "10~40", "10~40", "10~40"] },
      { label: "외형 치수 (L×W×H)", unit: "mm", values: ["432×282×302", "432×282×302", "432×282×302", "432×282×302"] },
    ],
  },
  "스크롤펌프(중형 XDS)": {
    models: ["XDS35i", "XDS46i"],
    rows: [
      { label: "배기속도 (Peak)", unit: "m³/h", values: ["35", "40"] },
      { label: "도달압력", unit: "mbar", values: ["0.01", "0.05"] },
      { label: "모터 출력", unit: "W", values: ["520", "520"] },
      { label: "회전수", unit: "rpm", values: ["1,750", "1,750"] },
      { label: "소음", unit: "dB(A)", values: ["57", "55.4"] },
      { label: "무게", unit: "kg", values: ["48", "48"] },
      { label: "인렛 플랜지", unit: "", values: ["NW40", "NW40"] },
      { label: "배기 플랜지", unit: "", values: ["NW25", "NW25"] },
      { label: "작동 온도", unit: "°C", values: ["5~40", "5~40"] },
    ],
  },
  "부스터펌프(EH)": {
    models: ["EH250", "EH500", "EH1200", "EH2600", "EH4200"],
    rows: [
      { label: "배기속도 (60 Hz)", unit: "m³/h", values: ["375", "605", "1,435", "3,110", "4,985"] },
      { label: "모터 출력", unit: "kW", values: ["2.2", "2.2", "3.0", "11.0", "11.0"] },
      { label: "냉각 방식", unit: "", values: ["공냉", "공냉", "수냉", "수냉", "수냉"] },
      { label: "무게", unit: "kg", values: ["69", "106", "149", "401", "481"] },
      { label: "인렛 플랜지", unit: "", values: ["ISO63", "ISO100", "ISO160", "ISO160", "ISO250"] },
      { label: "외형 치수 (L×W×H)", unit: "mm", values: ["705×305×272", "791×305×265", "953×380×334", "1156×522×479", "1336×522×479"] },
    ],
  },
};

function formatKRW(v: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(v);
}

export default function ProductPanel({ item, onClose, catalogUrl }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [added, setAdded] = useState<Set<number>>(new Set());
  const [showSpec, setShowSpec] = useState(false);

  const specData = item ? SPEC_DATA[item.category] : undefined;

  // ESC: 스펙 패널 먼저 닫고, 없으면 메인 패널 닫기
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showSpec) setShowSpec(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, showSpec]);

  // 카테고리 바뀌면 제품 목록 새로 가져오기 + 스펙 패널 초기화
  useEffect(() => {
    if (!item) {
      setProducts([]);
      setShowSpec(false);
      return;
    }
    setLoading(true);
    setQuantities({});
    setAdded(new Set());
    setShowSpec(false);
    const params = new URLSearchParams({ category: item.category, limit: "200" });
    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [item?.category]);

  // 패널 열릴 때 배경 스크롤 막기
  useEffect(() => {
    if (item) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [item]);

  function addToQuote(product: Product, qty: number) {
    const stored: { productId: number; partNo: string; description: string; quantity: number }[] =
      JSON.parse(localStorage.getItem("quoteCart") ?? "[]");
    const existing = stored.find((i) => i.productId === product.id);
    if (existing) {
      existing.quantity += qty;
    } else {
      stored.push({
        productId: product.id,
        partNo: product.partNo,
        description: product.description,
        quantity: qty,
      });
    }
    localStorage.setItem("quoteCart", JSON.stringify(stored));
    window.dispatchEvent(new Event("quoteCartUpdated"));

    setAdded((prev) => new Set([...prev, product.id]));
    setTimeout(() => {
      setAdded((prev) => {
        const s = new Set(prev);
        s.delete(product.id);
        return s;
      });
    }, 2000);
  }

  if (!item) return null;

  return (
    <>
      {/* ── 스펙 비교 패널 ── */}
      {showSpec && specData && (
        <div className="fixed inset-0 md:inset-auto md:top-0 md:bottom-0 md:right-[480px] md:left-0 z-[60] bg-paper border-r hair flex flex-col shadow-2xl">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-5 py-4 border-b hair shrink-0">
            <div className="display text-[17px]">스펙 비교</div>
            <button
              onClick={() => setShowSpec(false)}
              className="text-[12px] mono text-dim hover:text-ink transition-colors"
            >
              닫기 →
            </button>
          </div>

          {/* 스펙 표 */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[14px]">
                <thead>
                  <tr className="bg-ink text-paper">
                    <th className="text-left px-4 py-3 mono text-[12px] tracking-wider w-[42%]">스펙 항목</th>
                    {specData.models.map((m) => (
                      <th key={m} className="px-3 py-3 text-center display text-[18px]">{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {specData.rows.map((row, i) => (
                    <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-paper"}>
                      <td className="px-4 py-3 text-[13px] text-[#2a2823] leading-snug">
                        {row.label}
                        {row.unit && <span className="block text-[11px] dim">{row.unit}</span>}
                      </td>
                      {row.values.map((v, j) => (
                        <td key={j} className="px-3 py-3 text-center mono text-[13px] tabular-nums">{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[10px] dim mono">※ 60 Hz 기준 (국내 전원). 카탈로그 원본 기준.</p>

            {/* 연락처 */}
            <div className="mt-6 border-t hair pt-5">
              <div className="mono text-[10px] tracking-widest text-dim mb-3">수량 · 납기 · 커스텀 사양 문의</div>
              <div className="flex flex-col gap-2">
                <a href="tel:031-204-7170" className="flex items-center gap-2 group">
                  <span className="bg-edred text-paper mono text-[11px] px-2.5 py-1 tracking-wider">CALL</span>
                  <span className="display text-[18px] group-hover:text-edred transition-colors">031-204-7170</span>
                </a>
                <a href="mailto:info@smartechvacuum.com" className="flex items-center gap-2 group">
                  <span className="bg-ink text-paper mono text-[11px] px-2.5 py-1 tracking-wider">MAIL</span>
                  <span className="mono text-[13px] text-dim group-hover:text-ink transition-colors">info@smartechvacuum.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 메인 패널 ── */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[480px] bg-paper border-l hair flex flex-col shadow-2xl">

        {/* 헤더 */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b hair shrink-0">
          <div>
            <div className="mono text-[10px] tracking-[0.16em] uppercase text-dim">{item.code}</div>
            <h2 className="display text-[22px] leading-tight mt-1">{item.title}</h2>
            <div className="mono text-[11px] text-dim mt-1">{item.category}</div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 ml-4 w-8 h-8 flex items-center justify-center border hair hover:bg-ink hover:text-paper transition-colors text-[18px] leading-none"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* 이미지 + 버튼 */}
        <div className="px-6 py-5 border-b hair bg-white shrink-0">
          <div className="aspect-[3/2] relative">
            <img
              src={item.image}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
          <div className="mt-3 flex items-center gap-4">
            {specData && (
              <button
                onClick={() => setShowSpec(!showSpec)}
                className="text-[11px] mono text-ink hover:text-edred transition-colors"
              >
                ← 스펙 비교
              </button>
            )}
            {catalogUrl && (
              <a
                href={catalogUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] mono text-edred hover:underline font-medium tracking-[0.06em]"
              >
                카탈로그 PDF →
              </a>
            )}
          </div>
        </div>

        {/* 제품 목록 — 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-14 bg-line/50 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-6 text-center text-dim text-sm">
              제품 정보를 불러올 수 없습니다.
            </div>
          ) : (
            <div className="divide-y hair">
              {products.map((product) => {
                const qty = quantities[product.id] ?? 1;
                const isAdded = added.has(product.id);
                return (
                  <div
                    key={product.id}
                    className={`px-4 py-3 transition-colors ${
                      isAdded ? "bg-ink/[0.03]" : "hover:bg-edred/[0.03]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* 제품 정보 */}
                      <div className="flex-1 min-w-0">
                        {product.isImportant && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-edred mr-1.5 mb-0.5 align-middle" />
                        )}
                        <span className="mono text-[11px] text-dim">{product.partNo}</span>
                        <div className="text-[13px] leading-snug mt-0.5">{product.description}</div>
                        <div className="mt-1">
                          {product.priceStatus === "visible" && product.displayPrice ? (
                            <span className="mono text-[12px] font-semibold">
                              {formatKRW(product.displayPrice)}
                            </span>
                          ) : product.priceStatus === "pending" ? (
                            <span className="mono text-[11px] text-dim">승인 대기</span>
                          ) : (
                            <span className="mono text-[11px] text-dim">로그인 후 가격 확인</span>
                          )}
                        </div>
                      </div>

                      {/* 수량 + 담기 */}
                      <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                        <input
                          type="number"
                          min={1}
                          value={qty}
                          onChange={(e) =>
                            setQuantities((prev) => ({
                              ...prev,
                              [product.id]: Math.max(1, parseInt(e.target.value) || 1),
                            }))
                          }
                          className="w-12 border hair px-1 py-1.5 text-[12px] text-center focus:outline-none focus:border-ink bg-transparent"
                          aria-label="수량"
                        />
                        <button
                          onClick={() => addToQuote(product, qty)}
                          className={`px-2.5 py-1.5 text-[11px] mono tracking-wider border transition-colors whitespace-nowrap ${
                            isAdded
                              ? "bg-ink text-paper border-ink"
                              : "border-ink/40 hover:bg-ink hover:text-paper hover:border-ink"
                          }`}
                        >
                          {isAdded ? "✓" : "담기"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="px-6 py-3 border-t hair shrink-0">
          <div className="mono text-[10px] text-dim">
            ※ 로그인 시 우대 가격 적용 · 가격은 VAT 별도
          </div>
        </div>
      </div>
    </>
  );
}
