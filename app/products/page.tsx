"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

type Product = {
  id: number;
  partNo: string;
  description: string;
  displayPrice: number | null;
  priceStatus: "login" | "pending" | "visible";
  category: string;
  isImportant: boolean;
};

// Grouped category tree — keeps UI tidy
const CATEGORY_GROUPS: { label: string; items: string[] }[] = [
  {
    label: "오일 로터리 / 부스터",
    items: [
      "오일펌프(소형 RV)",
      "오일펌프(소형 E2M)",
      "오일펌프(중대형 E2M)",
      "오일펌프(중대형 E2S)",
      "오일펌프(nES)",
      "부스터펌프(EH)",
    ],
  },
  {
    label: "드라이 / 스크롤",
    items: [
      "스크롤펌프(소형 nXDS)",
      "스크롤펌프(중형 XDS)",
      "산업용드라이펌프(GXS)",
      "산업용드라이펌프(EXS)",
      "반도체드라이펌프(iXH)",
      "반도체드라이펌프(nXRi)",
      "반도체드라이펌프(iXL)",
    ],
  },
  {
    label: "터보 / 리크",
    items: [
      "터보펌프(nEXT)",
      "터보펌핑스테이션(T-Station)",
      "터보펌프(STP)",
      "헬륨리크디텍터(ELD500)",
    ],
  },
  {
    label: "게이지 / 컨트롤러",
    items: [
      "저진공게이지(APG200)",
      "고진공게이지(AIM200)",
      "복합진공게이지(WRG200)",
      "디스플레이게이지(P4/P5)",
      "컨트롤러(TIC)",
      "컨트롤러(ADC)",
    ],
  },
  {
    label: "소모품 / 액세서리",
    items: [
      "미스트필터(EMF)",
      "진공펌프오일(Ultra19)",
      "피팅/액세서리",
      "기타",
    ],
  },
];

function formatKRW(v: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(v);
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [all, setAll] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [view, setView] = useState<"table" | "grid">("table");

  // Load entire catalog once
  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch("/api/products?limit=2000")
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setAll(d.products ?? []);
        setLoading(false);
      })
      .catch(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  // Reflect filters in URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    const qs = params.toString();
    router.replace(`/products${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [q, category, router]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter((p) => {
      if (category && p.category !== category) return false;
      if (needle) {
        const hay = `${p.partNo} ${p.description}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [all, q, category]);

  // Count per category (respecting search only, not category)
  const categoryCounts = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const map = new Map<string, number>();
    for (const p of all) {
      if (needle) {
        const hay = `${p.partNo} ${p.description}`.toLowerCase();
        if (!hay.includes(needle)) continue;
      }
      map.set(p.category, (map.get(p.category) ?? 0) + 1);
    }
    return map;
  }, [all, q]);

  // Group filtered results by category for display
  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of filtered) {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category)!.push(p);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [filtered]);

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* ── Header ─────────────────────────────── */}
      <header className="border-b hair">
        <div className="max-w-7xl mx-auto px-6 pt-14 pb-10">
          <div className="mono text-[10.5px] tracking-[0.18em] uppercase text-dim mb-4">
            CATALOG / 2026 · <span className="text-edred">EDWARDS</span> KOREA
          </div>
          <h1 className="display text-[44px] md:text-[64px] leading-[0.98] tracking-[-0.04em]">
            전 제품 카탈로그
            <span className="text-edred">.</span>
          </h1>
          <p className="mt-4 text-sm md:text-base text-dim max-w-2xl leading-relaxed">
            스마텍이 공급하는 <span className="text-edred font-semibold">Edwards</span> 진공펌프·게이지·컨트롤러·액세서리 전 라인업.
            총 <span className="kpi-num text-ink">{all.length.toLocaleString()}</span>개 SKU. 가격은 로그인 후 등급별로 표시됩니다.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ── Controls ─────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
          <div className="flex-1">
            <label className="block mono text-[10px] tracking-[0.14em] uppercase text-dim mb-2">
              검색 — 파트번호 / 모델명 / 설명
            </label>
            <input
              className="w-full bg-transparent border-b-2 border-ink/80 focus:border-edred outline-none py-2 text-sm mono placeholder:text-dim/60"
              placeholder="예: RV12, A70316934, nXDS, TIC..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="mono text-[10px] tracking-[0.14em] uppercase text-dim mr-1">VIEW</span>
            <button
              onClick={() => setView("table")}
              className={`px-3 py-1.5 text-[11px] mono uppercase tracking-wider border hair transition ${
                view === "table" ? "bg-ink text-paper border-ink" : "hover:bg-ink hover:text-paper"
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setView("grid")}
              className={`px-3 py-1.5 text-[11px] mono uppercase tracking-wider border hair transition ${
                view === "grid" ? "bg-ink text-paper border-ink" : "hover:bg-ink hover:text-paper"
              }`}
            >
              Grid
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* ── Sidebar — category tree ───────── */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-6">
              <div className="mono text-[10px] tracking-[0.14em] uppercase text-dim mb-3">
                CATEGORIES
              </div>
              <button
                onClick={() => setCategory("")}
                className={`w-full text-left px-3 py-2 text-xs border-l-2 transition flex justify-between ${
                  !category
                    ? "border-edred text-edred font-semibold bg-edred/5"
                    : "border-transparent hover:border-ink/30 text-ink"
                }`}
              >
                <span>전체</span>
                <span className="mono text-dim">{filtered.length}</span>
              </button>

              <div className="mt-4 space-y-5">
                {CATEGORY_GROUPS.map((group) => (
                  <div key={group.label}>
                    <div className="mono text-[9.5px] tracking-[0.16em] uppercase text-edred/80 mb-2 pl-3">
                      {group.label}
                    </div>
                    {group.items.map((cat) => {
                      const count = categoryCounts.get(cat) ?? 0;
                      if (count === 0 && cat !== category) return null;
                      const active = category === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setCategory(active ? "" : cat)}
                          className={`w-full text-left px-3 py-1.5 text-[12px] border-l-2 transition flex justify-between items-center ${
                            active
                              ? "border-edred text-edred font-semibold bg-edred/5"
                              : "border-transparent hover:border-ink/30 text-ink/80 hover:text-ink"
                          }`}
                        >
                          <span className="truncate pr-2">{cat}</span>
                          <span className="mono text-[10px] text-dim tabular">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Main ───────────────────────────── */}
          <main className="flex-1 min-w-0">
            {/* Active filters summary */}
            <div className="flex items-center justify-between mb-4 text-[11px] mono uppercase tracking-[0.12em] text-dim">
              <span>
                {loading
                  ? "LOADING..."
                  : `${filtered.length.toLocaleString()} / ${all.length.toLocaleString()} ITEMS`}
              </span>
              {(category || q) && (
                <button
                  onClick={() => {
                    setCategory("");
                    setQ("");
                  }}
                  className="underline-red pb-0.5 text-ink hover:text-edred"
                >
                  필터 초기화 ×
                </button>
              )}
            </div>

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="h-9 bg-line/50 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="border hair bg-white/60 p-10 text-center">
                <div className="display text-2xl mb-2">결과 없음</div>
                <div className="text-sm text-dim">
                  검색어와 필터를 조정해 주세요.
                </div>
              </div>
            ) : view === "table" ? (
              <CatalogTable groups={grouped} />
            ) : (
              <CatalogGrid groups={grouped} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ─── Table View ─────────────────────────────── */
function CatalogTable({ groups }: { groups: [string, Product[]][] }) {
  return (
    <div className="space-y-10">
      {groups.map(([cat, items]) => (
        <section key={cat}>
          <div className="flex items-baseline justify-between border-b-2 border-ink pb-2 mb-0">
            <h2 className="display text-xl tracking-tight">
              {cat}
            </h2>
            <span className="mono text-[10px] tracking-[0.14em] uppercase text-dim">
              {items.length} SKU
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="text-left mono text-[9.5px] tracking-[0.14em] uppercase text-dim">
                  <th className="py-2 pr-3 w-8"></th>
                  <th className="py-2 pr-3 w-[140px]">PART NO</th>
                  <th className="py-2 pr-3">DESCRIPTION</th>
                  <th className="py-2 pr-3 w-[170px] text-right">PRICE (KRW)</th>
                  <th className="py-2 pr-3 w-[60px]"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b hair hover:bg-edred/[0.03] transition group"
                  >
                    <td className="py-2 pr-3 align-middle">
                      {p.isImportant ? (
                        <span
                          aria-label="주요 제품"
                          title="주요 제품"
                          className="inline-block w-1.5 h-1.5 rounded-full bg-edred"
                        />
                      ) : (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-line" />
                      )}
                    </td>
                    <td className="py-2 pr-3 align-middle">
                      <Link
                        href={`/products/${encodeURIComponent(p.partNo)}`}
                        className="mono text-[12px] text-ink group-hover:text-edred underline decoration-transparent group-hover:decoration-edred underline-offset-2"
                      >
                        {p.partNo}
                      </Link>
                    </td>
                    <td className="py-2 pr-3 align-middle text-ink/90">
                      <Link
                        href={`/products/${encodeURIComponent(p.partNo)}`}
                        className="hover:text-edred"
                      >
                        {p.description}
                      </Link>
                    </td>
                    <td className="py-2 pr-3 align-middle text-right tabular">
                      {p.priceStatus === "visible" && p.displayPrice ? (
                        <span className="font-semibold text-ink">{formatKRW(p.displayPrice)}</span>
                      ) : p.priceStatus === "pending" ? (
                        <span className="text-[11px] text-dim">승인 대기</span>
                      ) : (
                        <Link
                          href="/auth/login"
                          className="text-[11px] text-dim hover:text-edred underline-red pb-0.5"
                        >
                          로그인 후 확인
                        </Link>
                      )}
                    </td>
                    <td className="py-2 pr-3 align-middle text-right">
                      <Link
                        href={`/products/${encodeURIComponent(p.partNo)}`}
                        className="mono text-[10px] tracking-wider text-dim group-hover:text-edred"
                        aria-label="상세"
                      >
                        →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

/* ─── Dense Grid View ────────────────────────── */
function CatalogGrid({ groups }: { groups: [string, Product[]][] }) {
  return (
    <div className="space-y-10">
      {groups.map(([cat, items]) => (
        <section key={cat}>
          <div className="flex items-baseline justify-between border-b-2 border-ink pb-2 mb-3">
            <h2 className="display text-xl tracking-tight">{cat}</h2>
            <span className="mono text-[10px] tracking-[0.14em] uppercase text-dim">
              {items.length} SKU
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-line">
            {items.map((p) => (
              <Link
                key={p.id}
                href={`/products/${encodeURIComponent(p.partNo)}`}
                className="bg-paper hover:bg-edred hover:text-paper transition p-3 flex flex-col justify-between min-h-[112px] group"
              >
                <div>
                  <div className="flex items-center justify-between mono text-[9.5px] tracking-[0.1em] uppercase">
                    <span className={p.isImportant ? "text-edred group-hover:text-paper" : "text-dim group-hover:text-paper/70"}>
                      {p.isImportant ? "★ KEY" : "SKU"}
                    </span>
                    <span className="opacity-60">→</span>
                  </div>
                  <div className="mono text-[11px] mt-1 truncate">{p.partNo}</div>
                  <div className="text-[11.5px] leading-snug mt-1 line-clamp-2">
                    {p.description}
                  </div>
                </div>
                <div className="mt-2 tabular text-[11px]">
                  {p.priceStatus === "visible" && p.displayPrice ? (
                    <span className="font-semibold">{formatKRW(p.displayPrice)}</span>
                  ) : p.priceStatus === "pending" ? (
                    <span className="opacity-60">승인 대기</span>
                  ) : (
                    <span className="opacity-60">로그인 후 가격</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
