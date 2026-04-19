"use client";
import { useEffect, useState, useCallback } from "react";
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

const CATEGORIES = [
  "오일펌프(소형 RV)", "오일펌프(소형 E2M)", "오일펌프(중대형 E2M)", "오일펌프(중대형 E2S)", "오일펌프(nES)",
  "스크롤펌프(소형 nXDS)", "스크롤펌프(중형 XDS)", "부스터펌프(EH)",
  "산업용드라이펌프(GXS)", "산업용드라이펌프(EXS)",
  "반도체드라이펌프(iXH)", "반도체드라이펌프(nXRi)", "반도체드라이펌프(iXL)",
  "헬륨리크디텍터(ELD500)",
  "터보펌프(nEXT)", "터보펌프(nEXT Station)", "터보펌프(STP)",
  "저진공게이지(APG200)", "고진공게이지(AIM200)", "복합진공게이지(WRG200)", "디스플레이게이지(P4/P5)",
  "컨트롤러(TIC)", "컨트롤러(ADC)", "미스트필터(EMF)", "진공펌프오일(Ultra19)", "피팅/액세서리",
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "24" });
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data.products ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, q, category]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">제품 카탈로그</h1>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">카테고리</p>
          <button
            onClick={() => { setCategory(""); setPage(1); }}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${!category ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-100 text-gray-700"}`}
          >
            전체
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1); }}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${category === cat ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-100 text-gray-700"}`}
            >
              {cat}
            </button>
          ))}
        </aside>

        {/* Main */}
        <div className="flex-1">
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <input
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="제품명 또는 파트번호 검색..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm transition-colors">
              검색
            </button>
          </form>

          <p className="text-sm text-gray-500 mb-4">총 {total.toLocaleString()}개 제품</p>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-36 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${encodeURIComponent(p.partNo)}`}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition-all"
                >
                  {p.isImportant && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mb-2 inline-block">주요 제품</span>
                  )}
                  <div className="text-xs text-blue-600 font-mono mb-1">{p.partNo}</div>
                  <div className="text-sm font-medium text-gray-800 leading-snug mb-2 line-clamp-2">{p.description}</div>
                  <div className="text-xs text-gray-400 mb-2">{p.category}</div>
                  {p.priceStatus === "visible" && p.displayPrice ? (
                    <p className="text-blue-700 font-semibold text-sm">
                      {new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(p.displayPrice)}
                    </p>
                  ) : p.priceStatus === "pending" ? (
                    <p className="text-xs text-amber-600">등급 승인 대기중</p>
                  ) : (
                    <p className="text-xs text-gray-400">로그인 후 가격 확인</p>
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > 24 && (
            <div className="flex justify-center gap-2 mt-8">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">이전</button>
              <span className="px-4 py-2 text-sm text-gray-600">{page} / {Math.ceil(total / 24)}</span>
              <button disabled={page >= Math.ceil(total / 24)} onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">다음</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
