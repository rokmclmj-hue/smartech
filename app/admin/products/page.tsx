"use client";

import { useEffect, useState, useCallback, useRef } from "react";

type Product = {
  id: number;
  partNo: string;
  description: string;
  category: string | null;
  costPrice: number;
  stock: number;
  isImportant: boolean;
};

type PriceRule = {
  tier: string;
  multiplier: number;
};

const TIER_LABELS: Record<string, string> = {
  ENDUSER: "Enduser",
  CONSUMER: "일반소비자",
  OEM: "OEM",
  DEALER: "딜러",
  KEY_DEALER: "Key딜러",
  ADMIN: "관리자",
};

export default function AdminProductsPage() {
  const [tab, setTab] = useState<"products" | "prices">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [rules, setRules] = useState<PriceRule[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingStock, setEditingStock] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [ruleSaving, setRuleSaving] = useState<string | null>(null);

  // 엑셀 업로드 상태
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    fetch(`/api/admin/products?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setError(null);
      })
      .catch(() => setError("제품 데이터를 불러오지 못했습니다"))
      .finally(() => setLoading(false));
  }, [search, category]);

  useEffect(() => {
    if (tab === "products") fetchProducts();
  }, [tab, fetchProducts]);

  useEffect(() => {
    if (tab === "prices") {
      fetch("/api/admin/price-rules")
        .then((r) => r.json())
        .then(setRules)
        .catch(() => setError("가격 규칙을 불러오지 못했습니다"));
    }
  }, [tab]);

  async function saveStock(productId: number) {
    const val = editingStock[productId];
    if (val === undefined) return;
    const stock = parseInt(val);
    if (isNaN(stock) || stock < 0) {
      alert("재고 수량은 0 이상이어야 합니다");
      return;
    }
    setSaving(productId);
    try {
      await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, stock }),
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock } : p))
      );
      setEditingStock((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    } catch {
      alert("저장에 실패했습니다");
    } finally {
      setSaving(null);
    }
  }

  async function saveRule(tier: string, multiplier: number) {
    setRuleSaving(tier);
    try {
      await fetch("/api/admin/price-rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, multiplier }),
      });
    } catch {
      alert("저장에 실패했습니다");
    } finally {
      setRuleSaving(null);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress("업로드 중...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) {
        setUploadProgress(`오류: ${result.error}`);
      } else {
        setUploadProgress(
          `완료: 총 ${result.total}행 중 ${result.updated}개 업데이트, ${result.skipped}개 건너뜀`
        );
        fetchProducts();
      }
    } catch {
      setUploadProgress("업로드 실패");
    }

    // 파일 입력 초기화
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // 카테고리 목록 추출
  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  ) as string[];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">제품/가격/재고 관리</h1>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-sm bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            📥 엑셀 업로드
          </button>
        </div>
      </div>

      {/* 업로드 진행 메시지 */}
      {uploadProgress && (
        <div className={`text-sm px-4 py-3 rounded-lg border ${
          uploadProgress.startsWith("오류") || uploadProgress.startsWith("업로드 실패")
            ? "bg-red-50 border-red-200 text-red-700"
            : uploadProgress.startsWith("완료")
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-blue-50 border-blue-200 text-blue-700"
        }`}>
          {uploadProgress}
          <button
            onClick={() => setUploadProgress(null)}
            className="ml-2 text-current opacity-50 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      {/* 탭 */}
      <div className="flex gap-2 border-b border-gray-200">
        {(["products", "prices"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "products" ? "제품 목록" : "가격 규칙"}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* 제품 목록 탭 */}
      {tab === "products" && (
        <>
          {/* 검색 + 필터 */}
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              placeholder="제품명 또는 코드번호 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체 카테고리</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm">불러오는 중...</div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {["코드번호", "제품명", "카테고리", "원가", "재고", "상태"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                          제품이 없습니다
                        </td>
                      </tr>
                    ) : (
                      products.map((p) => (
                        <tr
                          key={p.id}
                          className={`hover:bg-gray-50 ${p.stock === 0 ? "bg-red-50" : ""}`}
                        >
                          <td className="px-4 py-3 font-mono text-xs text-blue-700">{p.partNo}</td>
                          <td className="px-4 py-3 text-gray-800 max-w-[240px] truncate">
                            {p.description}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{p.category ?? "-"}</td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-700">
                            ₩{p.costPrice.toLocaleString("ko-KR")}
                          </td>
                          <td className="px-4 py-3">
                            {editingStock[p.id] !== undefined ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={0}
                                  value={editingStock[p.id]}
                                  onChange={(e) =>
                                    setEditingStock((prev) => ({
                                      ...prev,
                                      [p.id]: e.target.value,
                                    }))
                                  }
                                  className="w-16 border border-blue-400 rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  autoFocus
                                />
                                <button
                                  onClick={() => saveStock(p.id)}
                                  disabled={saving === p.id}
                                  className="text-xs text-white bg-blue-600 px-2 py-0.5 rounded hover:bg-blue-500 disabled:opacity-50"
                                >
                                  저장
                                </button>
                                <button
                                  onClick={() =>
                                    setEditingStock((prev) => {
                                      const next = { ...prev };
                                      delete next[p.id];
                                      return next;
                                    })
                                  }
                                  className="text-xs text-gray-500 hover:text-gray-700"
                                >
                                  취소
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  setEditingStock((prev) => ({
                                    ...prev,
                                    [p.id]: String(p.stock),
                                  }))
                                }
                                className={`text-xs px-2 py-0.5 rounded font-medium cursor-pointer hover:opacity-80 ${
                                  p.stock === 0
                                    ? "bg-red-100 text-red-700"
                                    : p.stock < 5
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {p.stock}개
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                p.stock === 0
                                  ? "bg-red-100 text-red-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {p.stock === 0 ? "품절" : "판매중"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* 가격 규칙 탭 */}
      {tab === "prices" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl">
          {rules.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-400 text-sm">
              가격 규칙이 없습니다
            </div>
          ) : (
            rules.map((r) => (
              <div key={r.tier} className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="font-semibold text-sm text-slate-700 mb-3">
                  {TIER_LABELS[r.tier] ?? r.tier}
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={r.multiplier}
                    onChange={(e) =>
                      setRules((prev) =>
                        prev.map((x) =>
                          x.tier === r.tier
                            ? { ...x, multiplier: parseFloat(e.target.value) || 1 }
                            : x
                        )
                      )
                    }
                    className="w-24 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-500">배</span>
                  <button
                    onClick={() => saveRule(r.tier, r.multiplier)}
                    disabled={ruleSaving === r.tier}
                    className="ml-auto text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-colors"
                  >
                    {ruleSaving === r.tier ? "저장 중..." : "저장"}
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  원가 × {r.multiplier} = 판매가
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
