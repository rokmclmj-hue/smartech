"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useToast } from "@/lib/toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type Product = {
  id: number;
  partNo: string;
  description: string;
  category: string | null;
  costPrice: number;
  stock: number;
  isImportant: boolean;
  isDiscontinued: boolean;
};

type ApiResponse = {
  items: Product[];
  total: number;
  page: number;
  limit: number;
};

// ─── 신제품 추가 모달 폼 상태 ────────────────────────────────────────────────

type NewProductForm = {
  partNo: string;
  description: string;
  category: string;
  costPrice: string;
  stock: string;
};

// ─── 편집 모달 폼 상태 ───────────────────────────────────────────────────────

type EditProductForm = {
  productId: number;
  partNo: string;
  description: string;
  category: string;
};

// ─── 상수 ────────────────────────────────────────────────────────────────────

const EMPTY_NEW_FORM: NewProductForm = {
  partNo: "",
  description: "",
  category: "",
  costPrice: "",
  stock: "0",
};

// ─── 디바운스 훅 ─────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const { success, error: toastError, info } = useToast();

  // 탭
  const [tab] = useState<"products">("products");

  // 제품 목록 상태
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 100;
  const [loading, setLoading] = useState(true);

  // 필터 상태
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const [showDiscontinued, setShowDiscontinued] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const debouncedCategory = useDebounce(category, 300);

  // 인라인 편집: stock
  const [editingStock, setEditingStock] = useState<Record<number, string>>({});
  const [savingStock, setSavingStock] = useState<number | null>(null);

  // 인라인 편집: costPrice
  const [editingCost, setEditingCost] = useState<Record<number, string>>({});
  const [savingCost, setSavingCost] = useState<number | null>(null);

  // 신제품 추가 모달
  const [showNewModal, setShowNewModal] = useState(false);
  const [newForm, setNewForm] = useState<NewProductForm>(EMPTY_NEW_FORM);
  const [savingNew, setSavingNew] = useState(false);

  // 편집 모달 (partNo / description / category)
  const [editModal, setEditModal] = useState<EditProductForm | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // 엑셀 업로드
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── 제품 목록 fetch ────────────────────────────────────────────────────────

  const fetchProducts = useCallback(
    (overridePage?: number) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (debouncedCategory) params.set("category", debouncedCategory);
      if (lowStock) params.set("lowStock", "1");
      if (showDiscontinued) params.set("discontinued", "1");
      params.set("page", String(overridePage ?? page));
      params.set("limit", String(limit));

      fetch(`/api/admin/products?${params}`)
        .then((r) => r.json())
        .then((data: ApiResponse) => {
          setProducts(data.items);
          setTotal(data.total);
        })
        .catch(() => toastError("제품 데이터를 불러오지 못했습니다"))
        .finally(() => setLoading(false));
    },
    [debouncedSearch, debouncedCategory, lowStock, showDiscontinued, page, toastError]
  );

  // 필터 변경 시 페이지 초기화
  useEffect(() => {
    if (tab === "products") {
      setPage(1);
      fetchProducts(1);
    }
    // fetchProducts를 deps에 넣으면 무한루프 발생 가능. 필터 변경에만 반응.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, debouncedSearch, debouncedCategory, lowStock, showDiscontinued]);

  // 페이지 변경 시 fetch
  useEffect(() => {
    if (tab === "products") fetchProducts(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);


  // ─── 카테고리 목록 (현재 로드된 제품 기준) ─────────────────────────────────

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  ) as string[];

  // ─── 인라인 편집: 재고 ─────────────────────────────────────────────────────

  async function saveStock(productId: number) {
    const val = editingStock[productId];
    if (val === undefined) return;
    const stock = parseInt(val, 10);
    if (isNaN(stock) || stock < 0) {
      toastError("재고 수량은 0 이상이어야 합니다");
      return;
    }
    setSavingStock(productId);
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, stock }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toastError((j as { error?: string }).error ?? "저장에 실패했습니다");
        return;
      }
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock } : p))
      );
      setEditingStock((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      success("재고가 저장되었습니다");
    } catch {
      toastError("저장에 실패했습니다");
    } finally {
      setSavingStock(null);
    }
  }

  // ─── 인라인 편집: 원가 ─────────────────────────────────────────────────────

  async function saveCostPrice(productId: number) {
    const val = editingCost[productId];
    if (val === undefined) return;
    const costPrice = parseFloat(val);
    if (isNaN(costPrice) || costPrice < 0) {
      toastError("원가는 0 이상이어야 합니다");
      return;
    }
    setSavingCost(productId);
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, costPrice }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toastError((j as { error?: string }).error ?? "저장에 실패했습니다");
        return;
      }
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, costPrice } : p))
      );
      setEditingCost((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      success("원가가 저장되었습니다");
    } catch {
      toastError("저장에 실패했습니다");
    } finally {
      setSavingCost(null);
    }
  }

  // ─── 상태(판매중/품절/단종) 변경 ─────────────────────────────────────────────

  const [savingStatus, setSavingStatus] = useState<number | null>(null);

  async function saveStatus(product: Product, newStatus: "판매중" | "품절" | "단종") {
    setSavingStatus(product.id);
    try {
      let patchData: { isDiscontinued?: boolean; stock?: number } = {};
      if (newStatus === "단종") {
        patchData = { isDiscontinued: true };
      } else if (newStatus === "품절") {
        patchData = { isDiscontinued: false, stock: 0 };
      } else {
        patchData = { isDiscontinued: false, ...(product.stock === 0 ? { stock: 1 } : {}) };
      }
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, ...patchData }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toastError((j as { error?: string }).error ?? "저장에 실패했습니다");
        return;
      }
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? {
                ...p,
                isDiscontinued: patchData.isDiscontinued ?? p.isDiscontinued,
                stock: patchData.stock !== undefined ? patchData.stock : p.stock,
              }
            : p
        )
      );
      success(`상태가 ${newStatus}(으)로 변경되었습니다`);
    } catch {
      toastError("저장에 실패했습니다");
    } finally {
      setSavingStatus(null);
    }
  }

  // ─── 신제품 추가 ───────────────────────────────────────────────────────────

  async function handleCreateProduct() {
    if (!newForm.partNo.trim()) {
      toastError("파트번호를 입력해주세요");
      return;
    }
    if (!newForm.description.trim()) {
      toastError("제품명을 입력해주세요");
      return;
    }
    const costPrice = parseFloat(newForm.costPrice);
    if (isNaN(costPrice) || costPrice < 0) {
      toastError("원가는 0 이상의 숫자여야 합니다");
      return;
    }
    const stock = parseInt(newForm.stock, 10);
    if (isNaN(stock) || stock < 0) {
      toastError("초기 재고는 0 이상이어야 합니다");
      return;
    }

    setSavingNew(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partNo: newForm.partNo.trim(),
          description: newForm.description.trim(),
          costPrice,
          stock,
          category: newForm.category.trim() || undefined,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.status === 409) {
        toastError("이미 존재하는 파트번호입니다");
        return;
      }
      if (!res.ok) {
        toastError((j as { error?: string }).error ?? "제품 추가에 실패했습니다");
        return;
      }
      success(`${newForm.partNo.trim()} 제품이 추가되었습니다`);
      setShowNewModal(false);
      setNewForm(EMPTY_NEW_FORM);
      setPage(1);
      fetchProducts(1);
    } catch {
      toastError("제품 추가에 실패했습니다");
    } finally {
      setSavingNew(false);
    }
  }

  // ─── 편집 모달 저장 ────────────────────────────────────────────────────────

  async function handleSaveEdit() {
    if (!editModal) return;
    if (!editModal.partNo.trim()) {
      toastError("파트번호를 입력해주세요");
      return;
    }
    if (!editModal.description.trim()) {
      toastError("제품명을 입력해주세요");
      return;
    }

    setSavingEdit(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: editModal.productId,
          partNo: editModal.partNo.trim(),
          description: editModal.description.trim(),
          category: editModal.category.trim() || null,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.status === 409) {
        toastError("이미 존재하는 파트번호입니다");
        return;
      }
      if (!res.ok) {
        toastError((j as { error?: string }).error ?? "저장에 실패했습니다");
        return;
      }
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editModal.productId
            ? {
                ...p,
                partNo: editModal.partNo.trim(),
                description: editModal.description.trim(),
                category: editModal.category.trim() || null,
              }
            : p
        )
      );
      success("제품 정보가 수정되었습니다");
      setEditModal(null);
    } catch {
      toastError("저장에 실패했습니다");
    } finally {
      setSavingEdit(false);
    }
  }

  // ─── 엑셀 업로드 ───────────────────────────────────────────────────────────

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
        const msg = `오류: ${(result as { error?: string }).error ?? "알 수 없는 오류"}`;
        setUploadProgress(msg);
        toastError(msg);
      } else {
        const r = result as { total: number; updated: number; skipped: number };
        const msg = `완료: 총 ${r.total}행 중 ${r.updated}개 업데이트, ${r.skipped}개 건너뜀`;
        setUploadProgress(msg);
        success(msg);
        setPage(1);
        fetchProducts(1);
      }
    } catch {
      setUploadProgress("업로드 실패");
      toastError("업로드에 실패했습니다");
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ─── 페이지네이션 ─────────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(total / limit));

  // ─── 업로드 배너 스타일 ────────────────────────────────────────────────────

  const isUploadError =
    !!uploadProgress &&
    (uploadProgress.startsWith("오류") || uploadProgress.startsWith("업로드 실패"));
  const isUploadDone = !!uploadProgress && uploadProgress.startsWith("완료");

  // ─── 렌더 ─────────────────────────────────────────────────────────────────

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10 max-w-[1400px] mx-auto space-y-6 sm:space-y-8">
      {/* 헤더 */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="mono text-[11px] dim tracking-[0.15em] uppercase mb-3">
            — 03 · INVENTORY
          </div>
          <h1 className="display text-[28px] sm:text-[40px] leading-none text-ink">
            제품 / <span className="italic text-edred">재고</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mono text-[11px] tracking-[0.12em] uppercase border border-ink text-ink px-5 py-2.5 hover:bg-ink hover:text-paper transition-colors"
          >
            ↓ 엑셀 업로드
          </button>
          <button
            onClick={() => {
              setNewForm(EMPTY_NEW_FORM);
              setShowNewModal(true);
            }}
            className="mono text-[11px] tracking-[0.12em] uppercase bg-ink text-paper px-5 py-2.5 hover:bg-edred transition-colors"
          >
            + 신제품
          </button>
        </div>
      </div>

      {/* 업로드 진행 메시지 */}
      {uploadProgress && (
        <div
          className={`text-sm px-5 py-3 border ${
            isUploadError
              ? "border-edred/30 bg-edred/5 text-edred"
              : isUploadDone
              ? "border-ink bg-ink text-paper"
              : "border-line text-ink"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="mono text-[12px]">{uploadProgress}</span>
            <button
              onClick={() => setUploadProgress(null)}
              className="mono text-[12px] opacity-60 hover:opacity-100 ml-3"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* 탭 */}
      <div className="flex gap-2">
        <button className="chip active">제품 목록</button>
      </div>

      {/* ─── 제품 목록 탭 ──────────────────────────────────────────────────── */}
      {tab === "products" && (
        <>
          {/* 검색 + 카테고리 + 재고부족 필터 */}
          <div className="flex gap-3 flex-wrap items-center">
            <input
              type="text"
              placeholder="제품명 또는 코드번호 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] border hair bg-paper px-3 py-2 text-[13px] focus:outline-none focus:border-ink"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border hair bg-paper px-3 py-2 text-[13px] focus:outline-none focus:border-ink"
            >
              <option value="">전체 카테고리</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              onClick={() => setLowStock((v) => !v)}
              className={`chip ${lowStock ? "active" : ""} mono text-[11px]`}
            >
              재고부족
            </button>
            <button
              onClick={() => setShowDiscontinued((v) => !v)}
              className={`chip ${showDiscontinued ? "active" : ""} mono text-[11px]`}
            >
              단종만
            </button>
          </div>

          {/* 총 건수 + 페이지 정보 */}
          {!loading && (
            <div className="mono text-[11px] dim tracking-[0.1em] uppercase">
              총 {total.toLocaleString("ko-KR")}건 · {page}/{totalPages} 페이지
            </div>
          )}

          {loading ? (
            <div className="text-center py-16 mono text-[11px] dim tracking-[0.12em] uppercase">
              — Loading
            </div>
          ) : (
            <>
              <div className="border hair bg-paper overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px] min-w-[820px]">
                    <thead>
                      <tr className="border-b hair">
                        {[
                          "코드번호",
                          "제품명",
                          "카테고리",
                          "원가",
                          "재고",
                          "상태",
                          "편집",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left mono text-[10px] dim tracking-[0.12em] uppercase font-normal"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {products.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-16 text-center dim text-[13px]"
                          >
                            제품이 없습니다
                          </td>
                        </tr>
                      ) : (
                        products.map((p) => (
                          <tr
                            key={p.id}
                            className={`border-b hair last:border-b-0 hover:bg-ink/[0.02] transition-colors ${
                              p.isDiscontinued
                                ? "opacity-50 bg-ink/[0.02]"
                                : p.stock === 0
                                ? "bg-edred/[0.04]"
                                : ""
                            }`}
                          >
                            {/* 코드번호 */}
                            <td className="px-4 py-3 mono text-[12px] text-edred">
                              {p.partNo}
                            </td>

                            {/* 제품명 */}
                            <td className="px-4 py-3 text-ink max-w-[240px] truncate">
                              {p.description}
                            </td>

                            {/* 카테고리 */}
                            <td className="px-4 py-3 dim text-[12px]">
                              {p.category ?? "—"}
                            </td>

                            {/* 원가 인라인 편집 */}
                            <td className="px-4 py-3 mono text-[12px] tabular">
                              {editingCost[p.id] !== undefined ? (
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={editingCost[p.id]}
                                    onChange={(e) =>
                                      setEditingCost((prev) => ({
                                        ...prev,
                                        [p.id]: e.target.value,
                                      }))
                                    }
                                    className="w-24 border border-ink bg-paper px-2 py-0.5 text-[13px] focus:outline-none mono tabular"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => saveCostPrice(p.id)}
                                    disabled={savingCost === p.id}
                                    className="mono text-[10px] tracking-[0.1em] uppercase bg-ink text-paper px-2 py-0.5 hover:bg-edred disabled:opacity-40"
                                  >
                                    저장
                                  </button>
                                  <button
                                    onClick={() =>
                                      setEditingCost((prev) => {
                                        const next = { ...prev };
                                        delete next[p.id];
                                        return next;
                                      })
                                    }
                                    className="mono text-[10px] dim hover:text-ink"
                                  >
                                    취소
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() =>
                                    setEditingCost((prev) => ({
                                      ...prev,
                                      [p.id]: String(p.costPrice),
                                    }))
                                  }
                                  className="mono text-[12px] tabular border border-line text-ink px-2 py-0.5 hover:border-ink transition-colors"
                                >
                                  ₩{p.costPrice.toLocaleString("ko-KR")}
                                </button>
                              )}
                            </td>

                            {/* 재고 인라인 편집 */}
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
                                    className="w-16 border border-ink bg-paper px-2 py-0.5 text-[13px] focus:outline-none mono tabular"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => saveStock(p.id)}
                                    disabled={savingStock === p.id}
                                    className="mono text-[10px] tracking-[0.1em] uppercase bg-ink text-paper px-2 py-0.5 hover:bg-edred disabled:opacity-40"
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
                                    className="mono text-[10px] dim hover:text-ink"
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
                                  className={`mono text-[11px] tabular border px-2 py-0.5 hover:border-ink transition-colors ${
                                    p.stock === 0
                                      ? "border-edred text-edred"
                                      : p.stock < 5
                                      ? "border-ink/40 text-ink"
                                      : "border-line text-dim"
                                  }`}
                                >
                                  {p.stock}
                                </button>
                              )}
                            </td>

                            {/* 상태 */}
                            <td className="px-4 py-3">
                              <select
                                value={
                                  p.isDiscontinued
                                    ? "단종"
                                    : p.stock === 0
                                    ? "품절"
                                    : "판매중"
                                }
                                onChange={(e) =>
                                  saveStatus(
                                    p,
                                    e.target.value as "판매중" | "품절" | "단종"
                                  )
                                }
                                disabled={savingStatus === p.id}
                                className={`mono text-[10px] tracking-[0.08em] border px-2 py-0.5 bg-paper focus:outline-none focus:border-ink disabled:opacity-40 cursor-pointer transition-colors ${
                                  p.isDiscontinued
                                    ? "border-line text-dim"
                                    : p.stock === 0
                                    ? "border-edred text-edred"
                                    : "border-ink text-ink"
                                }`}
                              >
                                <option value="판매중">판매중</option>
                                <option value="품절">품절</option>
                                <option value="단종">단종</option>
                              </select>
                            </td>

                            {/* 편집 버튼 */}
                            <td className="px-4 py-3">
                              <button
                                onClick={() =>
                                  setEditModal({
                                    productId: p.id,
                                    partNo: p.partNo,
                                    description: p.description,
                                    category: p.category ?? "",
                                  })
                                }
                                className="mono text-[10px] tracking-[0.08em] uppercase border border-line text-dim px-2 py-0.5 hover:border-ink hover:text-ink transition-colors"
                              >
                                편집
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2 justify-center">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="mono text-[11px] tracking-[0.1em] uppercase border hair text-ink px-3 py-1.5 hover:bg-ink hover:text-paper disabled:opacity-30 transition-colors"
                  >
                    ←
                  </button>
                  <span className="mono text-[11px] dim tracking-[0.08em]">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="mono text-[11px] tracking-[0.1em] uppercase border hair text-ink px-3 py-1.5 hover:bg-ink hover:text-paper disabled:opacity-30 transition-colors"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}


      {/* ─── 신제품 추가 모달 ──────────────────────────────────────────────── */}
      {showNewModal && (
        <div
          className="fixed inset-0 z-[101] bg-ink/40 flex items-center justify-center p-4"
          onClick={() => {
            if (!savingNew) setShowNewModal(false);
          }}
        >
          <div
            className="bg-paper border hair max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="mono text-[10px] dim tracking-[0.15em] uppercase mb-3">
              — New Product
            </div>
            <p className="text-[15px] text-ink mb-5">신제품 추가</p>

            <div className="space-y-3">
              <div>
                <label className="mono text-[10px] dim tracking-[0.12em] uppercase block mb-1">
                  파트번호 *
                </label>
                <input
                  type="text"
                  value={newForm.partNo}
                  onChange={(e) =>
                    setNewForm((f) => ({ ...f, partNo: e.target.value }))
                  }
                  placeholder="예: ST-1234"
                  className="w-full border hair bg-paper px-3 py-2 text-[13px] focus:outline-none focus:border-ink mono"
                />
              </div>
              <div>
                <label className="mono text-[10px] dim tracking-[0.12em] uppercase block mb-1">
                  제품명 *
                </label>
                <input
                  type="text"
                  value={newForm.description}
                  onChange={(e) =>
                    setNewForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="예: 스마텍 펌프 A형"
                  className="w-full border hair bg-paper px-3 py-2 text-[13px] focus:outline-none focus:border-ink"
                />
              </div>
              <div>
                <label className="mono text-[10px] dim tracking-[0.12em] uppercase block mb-1">
                  카테고리
                </label>
                <input
                  type="text"
                  value={newForm.category}
                  onChange={(e) =>
                    setNewForm((f) => ({ ...f, category: e.target.value }))
                  }
                  placeholder="예: 펌프"
                  className="w-full border hair bg-paper px-3 py-2 text-[13px] focus:outline-none focus:border-ink"
                />
              </div>
              <div>
                <label className="mono text-[10px] dim tracking-[0.12em] uppercase block mb-1">
                  원가 (₩) *
                </label>
                <input
                  type="number"
                  min={0}
                  value={newForm.costPrice}
                  onChange={(e) =>
                    setNewForm((f) => ({ ...f, costPrice: e.target.value }))
                  }
                  placeholder="0"
                  className="w-full border hair bg-paper px-3 py-2 text-[13px] focus:outline-none focus:border-ink mono tabular"
                />
              </div>
              <div>
                <label className="mono text-[10px] dim tracking-[0.12em] uppercase block mb-1">
                  초기 재고
                </label>
                <input
                  type="number"
                  min={0}
                  value={newForm.stock}
                  onChange={(e) =>
                    setNewForm((f) => ({ ...f, stock: e.target.value }))
                  }
                  className="w-full border hair bg-paper px-3 py-2 text-[13px] focus:outline-none focus:border-ink mono tabular"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setShowNewModal(false)}
                disabled={savingNew}
                className="mono text-[11px] tracking-[0.1em] uppercase border border-line text-dim px-4 py-2 hover:border-ink hover:text-ink transition-colors disabled:opacity-40"
              >
                취소
              </button>
              <button
                onClick={handleCreateProduct}
                disabled={savingNew}
                className="mono text-[11px] tracking-[0.1em] uppercase bg-ink text-paper px-4 py-2 hover:bg-edred transition-colors disabled:opacity-40"
              >
                {savingNew ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 편집 모달 (partNo / description / category) ───────────────────── */}
      {editModal && (
        <div
          className="fixed inset-0 z-[101] bg-ink/40 flex items-center justify-center p-4"
          onClick={() => {
            if (!savingEdit) setEditModal(null);
          }}
        >
          <div
            className="bg-paper border hair max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="mono text-[10px] dim tracking-[0.15em] uppercase mb-3">
              — Edit Product
            </div>
            <p className="text-[15px] text-ink mb-5">제품 정보 수정</p>

            <div className="space-y-3">
              <div>
                <label className="mono text-[10px] dim tracking-[0.12em] uppercase block mb-1">
                  파트번호 *
                </label>
                <input
                  type="text"
                  value={editModal.partNo}
                  onChange={(e) =>
                    setEditModal((m) => m && { ...m, partNo: e.target.value })
                  }
                  className="w-full border hair bg-paper px-3 py-2 text-[13px] focus:outline-none focus:border-ink mono"
                />
              </div>
              <div>
                <label className="mono text-[10px] dim tracking-[0.12em] uppercase block mb-1">
                  제품명 *
                </label>
                <input
                  type="text"
                  value={editModal.description}
                  onChange={(e) =>
                    setEditModal(
                      (m) => m && { ...m, description: e.target.value }
                    )
                  }
                  className="w-full border hair bg-paper px-3 py-2 text-[13px] focus:outline-none focus:border-ink"
                />
              </div>
              <div>
                <label className="mono text-[10px] dim tracking-[0.12em] uppercase block mb-1">
                  카테고리
                </label>
                <input
                  type="text"
                  value={editModal.category}
                  onChange={(e) =>
                    setEditModal((m) => m && { ...m, category: e.target.value })
                  }
                  className="w-full border hair bg-paper px-3 py-2 text-[13px] focus:outline-none focus:border-ink"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setEditModal(null)}
                disabled={savingEdit}
                className="mono text-[11px] tracking-[0.1em] uppercase border border-line text-dim px-4 py-2 hover:border-ink hover:text-ink transition-colors disabled:opacity-40"
              >
                취소
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="mono text-[11px] tracking-[0.1em] uppercase bg-ink text-paper px-4 py-2 hover:bg-edred transition-colors disabled:opacity-40"
              >
                {savingEdit ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
