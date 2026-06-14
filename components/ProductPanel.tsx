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
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr className="bg-ink text-paper">
                    <th className="text-left px-3 py-2 mono text-[10px] tracking-wider w-[42%]">스펙 항목</th>
                    {specData.models.map((m) => (
                      <th key={m} className="px-2 py-2 text-center display text-[14px]">{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {specData.rows.map((row, i) => (
                    <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-paper"}>
                      <td className="px-3 py-2 text-[11px] text-[#2a2823] leading-snug">
                        {row.label}
                        {row.unit && <span className="block text-[10px] dim">{row.unit}</span>}
                      </td>
                      {row.values.map((v, j) => (
                        <td key={j} className="px-2 py-2 text-center mono text-[11px] tabular-nums">{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[10px] dim mono">※ 60 Hz 기준 (국내 전원). cfm 단위 수치는 m³/h 환산값.</p>

            {/* 연락처 */}
            <div className="mt-6 border-t hair pt-5">
              <div className="mono text-[10px] tracking-widest text-dim mb-3">수량 · 납기 · 커스텀 사양 문의</div>
              <div className="flex flex-col gap-2">
                <a href="tel:031-204-7170" className="flex items-center gap-2 group">
                  <span className="bg-edred text-paper mono text-[11px] px-2.5 py-1 tracking-wider">CALL</span>
                  <span className="display text-[18px] group-hover:text-edred transition-colors">031-204-7170</span>
                </a>
                <a href="mailto:info@smartechvacuum.com" className="flex items-center gap-2 group">
                  <span className="border hair mono text-[11px] px-2.5 py-1 tracking-wider text-dim">MAIL</span>
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
                className={`text-[11px] mono transition-colors ${
                  showSpec ? "text-ink font-semibold" : "text-dim hover:text-ink"
                }`}
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
