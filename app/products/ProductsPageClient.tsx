"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
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

// 카탈로그 데이터 캐시 모드 — 한 번 fetch한 카테고리는 메모리에 남겨 재사용
type FetchKey = string;
const keyFor = (q: string, category: string): FetchKey => `${q}::${category}`;

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

export default function ProductsPageClient() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [view, setView] = useState<"table" | "grid">("table");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // 좌측 메뉴 숫자 — 카운트 API에서 한 번만 받음 (CDN 캐시)
  const [staticCounts, setStaticCounts] = useState<Record<string, number>>({});
  const [totalCount, setTotalCount] = useState(0);

  // 현재 화면에 표시되는 제품 + 클라이언트 누적 캐시
  const [filtered, setFiltered] = useState<Product[]>([]);
  const cacheRef = useRef<Map<FetchKey, Product[]>>(new Map());
  const fetchSeqRef = useRef(0);

  // 마운트 시 카운트 API 호출 — 좌측 메뉴 숫자용
  useEffect(() => {
    let alive = true;
    fetch("/api/products/counts")
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setStaticCounts(d.counts ?? {});
        setTotalCount(d.total ?? 0);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // q / category 가 바뀔 때 해당 슬라이스만 fetch (캐시 우선)
  useEffect(() => {
    const trimmedQ = q.trim();
    const key = keyFor(trimmedQ, category);
    const cached = cacheRef.current.get(key);
    if (cached) {
      setFiltered(cached);
      setLoading(false);
      return;
    }

    const seq = ++fetchSeqRef.current;
    setLoading(true);

    const params = new URLSearchParams();
    if (trimmedQ) params.set("q", trimmedQ);
    if (category) params.set("category", category);
    params.set("limit", "2000");

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (seq !== fetchSeqRef.current) return; // stale 응답 폐기
        const items: Product[] = d.products ?? [];
        cacheRef.current.set(key, items);
        setFiltered(items);
        setLoading(false);
      })
      .catch(() => {
        if (seq !== fetchSeqRef.current) return;
        setLoading(false);
      });
  }, [q, category]);

  // Reflect filters in URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    const qs = params.toString();
    router.replace(`/products${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [q, category, router]);

  // 좌측 메뉴 표시용 카운트: 검색어 없을 땐 정적 카운트, 검색 중일 땐 현재 결과 기준
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    const needle = q.trim().toLowerCase();
    if (!needle) {
      for (const [cat, n] of Object.entries(staticCounts)) map.set(cat, n);
      return map;
    }
    for (const p of filtered) {
      map.set(p.category, (map.get(p.category) ?? 0) + 1);
    }
    return map;
  }, [staticCounts, filtered, q]);

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
            총 <span className="kpi-num text-ink">{totalCount.toLocaleString()}</span>개 SKU. 로그인 후 우대 가격을 확인하실 수 있습니다.
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
              className="w-full bg-transparent border-b-2 border-ink/80 focus:border-edred outline-none py-2 text-sm md:text-[14px] mono placeholder:text-dim/60"
              placeholder="예: RV12, A70316934, nXDS, TIC..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            {/* 모바일: 필터 버튼 */}
            <button
              onClick={() => setFilterSheetOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 text-[12px] mono uppercase tracking-wider border hair hover:bg-ink hover:text-paper transition min-h-[44px]"
              aria-label="카테고리 필터"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
              </svg>
              필터
              {category && (
                <span className="bg-edred text-paper text-[9px] px-1 rounded-full">1</span>
              )}
            </button>
            <span className="mono text-[10px] tracking-[0.14em] uppercase text-dim mr-1 hidden sm:inline">VIEW</span>
            <button
              onClick={() => setView("table")}
              className={`px-3 py-1.5 text-[11px] mono uppercase tracking-wider border hair transition min-h-[44px] ${
                view === "table" ? "bg-ink text-paper border-ink" : "hover:bg-ink hover:text-paper"
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setView("grid")}
              className={`px-3 py-1.5 text-[11px] mono uppercase tracking-wider border hair transition min-h-[44px] ${
                view === "grid" ? "bg-ink text-paper border-ink" : "hover:bg-ink hover:text-paper"
              }`}
            >
              Grid
            </button>
          </div>
        </div>

        {/* ── 모바일 필터 하단 시트 ────────────── */}
        {filterSheetOpen && (
          <>
            {/* 오버레이 */}
            <div
              className="lg:hidden fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm"
              onClick={() => setFilterSheetOpen(false)}
              aria-hidden="true"
            />
            {/* 시트 패널 */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-paper rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
              {/* 시트 핸들 */}
              <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b hair">
                <span className="display text-base tracking-tight">카테고리 필터</span>
                <button
                  onClick={() => setFilterSheetOpen(false)}
                  className="text-ink/60 hover:text-ink transition min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="필터 닫기"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-6 py-4">
                <button
                  onClick={() => { setCategory(""); setFilterSheetOpen(false); }}
                  className={`w-full text-left px-3 py-3 text-[14px] border-l-2 transition flex justify-between min-h-[44px] items-center ${
                    !category
                      ? "border-edred text-edred font-semibold bg-edred/5"
                      : "border-transparent hover:border-ink/30 text-ink"
                  }`}
                >
                  <span>전체</span>
                  <span className="mono text-dim text-[12px]">{filtered.length}</span>
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
                            onClick={() => { setCategory(active ? "" : cat); setFilterSheetOpen(false); }}
                            className={`w-full text-left px-3 py-2.5 text-[13px] border-l-2 transition flex justify-between items-center min-h-[44px] ${
                              active
                                ? "border-edred text-edred font-semibold bg-edred/5"
                                : "border-transparent hover:border-ink/30 text-ink/80 hover:text-ink"
                            }`}
                          >
                            <span className="truncate pr-2">{cat}</span>
                            <span className="mono text-[11px] text-dim tabular">{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

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
                  : `${filtered.length.toLocaleString()} / ${totalCount.toLocaleString()} ITEMS`}
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

          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-[12px] md:text-[12.5px] min-w-[480px]">
              <thead>
                <tr className="text-left mono text-[9.5px] tracking-[0.14em] uppercase text-dim">
                  <th className="py-2 pr-2 w-6 hidden sm:table-cell"></th>
                  <th className="py-2 pr-2 w-[120px] md:w-[140px]">PART NO</th>
                  <th className="py-2 pr-2">DESCRIPTION</th>
                  <th className="py-2 pr-2 w-[120px] md:w-[170px] text-right">PRICE</th>
                  <th className="py-2 w-[30px]"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b hair hover:bg-edred/[0.03] transition group"
                  >
                    <td className="py-2 pr-2 align-middle hidden sm:table-cell">
                      {p.isImportant ? (
                        <span aria-label="주요 제품" title="주요 제품" className="inline-block w-1.5 h-1.5 rounded-full bg-edred" />
                      ) : (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-line" />
                      )}
                    </td>
                    <td className="py-2 pr-2 align-middle">
                      <Link
                        href={`/products/${encodeURIComponent(p.partNo)}`}
                        className="mono text-[11px] md:text-[12px] text-ink group-hover:text-edred underline decoration-transparent group-hover:decoration-edred underline-offset-2 break-all"
                      >
                        {p.partNo}
                      </Link>
                    </td>
                    <td className="py-2 pr-2 align-middle text-ink/90">
                      <Link href={`/products/${encodeURIComponent(p.partNo)}`} className="hover:text-edred">
                        {p.description}
                      </Link>
                    </td>
                    <td className="py-2 pr-2 align-middle text-right tabular">
                      {p.priceStatus === "visible" && p.displayPrice ? (
                        <span className="font-semibold text-ink text-[11px] md:text-[12px]">{formatKRW(p.displayPrice)}</span>
                      ) : p.priceStatus === "pending" ? (
                        <span className="text-[10px] text-dim">승인 대기</span>
                      ) : (
                        <Link href="/auth/login" className="text-[10px] text-dim hover:text-edred underline-red pb-0.5">
                          로그인 후 확인
                        </Link>
                      )}
                    </td>
                    <td className="py-2 align-middle text-right">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-line">
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
