"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type InventoryItem = {
  id: number;
  category: string;
  department: string;
  partNo: string;
  name: string;
  currentStock: number;
  minStock: number;
  orderQty: number;
  unitPrice: number;
  leadTime: string | null;
  supplier: string | null;
  memo: string | null;
  isActive: boolean;
  updatedAt: string;
};

type ReorderItem = {
  id: number;
  partNo: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  orderQty: number;
  unitPrice: number;
};

const DEPT_LABEL: Record<string, string> = { SV: "SV", AK: "AK" };
const DEPT_COLOR: Record<string, string> = {
  SV: "bg-smblue/10 text-smblue",
  AK: "bg-edred/10 text-edred",
};

function fmt(n: number) {
  return n.toLocaleString("ko-KR");
}

// ── 인라인 수량 편집 셀 ───────────────────────────
function StockCell({
  value,
  min,
  onSave,
}: {
  value: number;
  min: number;
  onSave: (v: number) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const low = value < min;

  if (!editing) {
    return (
      <button
        onClick={() => { setDraft(String(value)); setEditing(true); }}
        className={`mono text-[13px] font-semibold px-2 py-0.5 rounded transition-colors hover:bg-ink/5 ${
          low ? "text-edred" : "text-ink"
        }`}
        title="클릭하여 수정"
      >
        {value}
        {low && <span className="ml-1 text-[9px] font-bold text-edred">▼부족</span>}
      </button>
    );
  }

  return (
    <input
      type="number"
      value={draft}
      min={0}
      autoFocus
      className="mono text-[13px] w-16 border hair px-2 py-0.5 rounded focus:outline-none focus:border-ink"
      onChange={(e) => setDraft(e.target.value)}
      onBlur={async () => {
        const v = parseInt(draft, 10);
        if (!isNaN(v) && v >= 0 && v !== value) await onSave(v);
        setEditing(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "Escape") setEditing(false);
      }}
    />
  );
}

// ── 발주 대기함 탭 ────────────────────────────────
function ReorderTab() {
  const [sv, setSv] = useState<ReorderItem[]>([]);
  const [ak, setAk] = useState<ReorderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<"SV" | "AK" | null>(null);
  const [msg, setMsg] = useState("");
  const [hiding, setHiding] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/inventory/reorder");
    const data = await res.json();
    setSv(data.sv ?? []);
    setAk(data.ak ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function hideItem(id: number, name: string) {
    if (!confirm(`"${name}" 품목을 발주 대기함에서 제외할까요?\n재고 목록에서 숨김 처리됩니다. (재고 목록 > 숨긴 품목 보기에서 복원 가능)`)) return;
    setHiding(id);
    await fetch(`/api/admin/inventory/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: false }),
    });
    setHiding(null);
    load();
  }

  async function generate(dept: "SV" | "AK") {
    setGenerating(dept);
    setMsg("");
    try {
      const res = await fetch("/api/admin/inventory/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department: dept }),
      });
      const data = await res.json();
      if (data.ok) {
        setMsg(`✅ ${dept} 발주서 초안 생성 완료 — ${data.order.orderNo}`);
      } else {
        setMsg(`오류: ${data.error}`);
      }
    } catch {
      setMsg("네트워크 오류");
    } finally {
      setGenerating(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-dim text-[13px]">
        불러오는 중…
      </div>
    );
  }

  const total = sv.length + ak.length;

  return (
    <div className="space-y-6">
      {msg && (
        <div className="flex items-center gap-3 px-4 py-3 bg-paper border hair rounded text-[13px]">
          <span>{msg}</span>
          {msg.startsWith("✅") && (
            <Link
              href="/admin/purchase-orders"
              className="ml-auto mono text-[11px] text-smblue underline"
            >
              발주서 확인 →
            </Link>
          )}
        </div>
      )}

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <div className="text-[32px]">✅</div>
          <div className="text-[14px] text-ink font-medium">발주 필요 품목 없음</div>
          <div className="text-[12px] text-dim">모든 품목이 최소재고 이상입니다.</div>
        </div>
      ) : (
        <>
          {[{ dept: "SV" as const, items: sv }, { dept: "AK" as const, items: ak }].map(
            ({ dept, items }) =>
              items.length > 0 && (
                <section key={dept} className="border hair rounded">
                  <div className="flex items-center justify-between px-4 py-3 border-b hair bg-paper/60">
                    <div className="flex items-center gap-3">
                      <span className={`mono text-[11px] font-bold px-2 py-0.5 rounded ${DEPT_COLOR[dept]}`}>
                        {dept}
                      </span>
                      <span className="text-[14px] font-semibold text-ink">
                        {dept === "SV" ? "에드워드 SV — 현지선 수석" : "에드워드 AK — 정재희 차장"}
                      </span>
                      <span className="mono text-[11px] text-dim">
                        {items.length}건
                      </span>
                    </div>
                    <button
                      onClick={() => generate(dept)}
                      disabled={generating !== null}
                      className="mono text-[11px] font-bold bg-ink text-white px-3 py-1.5 hover:opacity-80 transition-opacity disabled:opacity-40"
                    >
                      {generating === dept ? "생성 중…" : `${dept} 발주서 초안 생성`}
                    </button>
                  </div>

                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="border-b hair text-dim mono">
                        <th className="text-left px-4 py-2 font-medium">카테고리</th>
                        <th className="text-left px-4 py-2 font-medium">PART NO</th>
                        <th className="text-left px-4 py-2 font-medium">품목명</th>
                        <th className="text-right px-4 py-2 font-medium">현재</th>
                        <th className="text-right px-4 py-2 font-medium">최소</th>
                        <th className="text-right px-4 py-2 font-medium">발주수량</th>
                        <th className="text-right px-4 py-2 font-medium">단가</th>
                        <th className="px-4 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id} className="border-b hair last:border-b-0 hover:bg-paper/40">
                          <td className="px-4 py-2.5 text-dim">{item.category}</td>
                          <td className="px-4 py-2.5 mono text-[11px]">{item.partNo}</td>
                          <td className="px-4 py-2.5 text-ink">{item.name}</td>
                          <td className="px-4 py-2.5 text-right mono font-bold text-edred">{item.currentStock}</td>
                          <td className="px-4 py-2.5 text-right mono text-dim">{item.minStock}</td>
                          <td className="px-4 py-2.5 text-right mono font-semibold">{item.orderQty}</td>
                          <td className="px-4 py-2.5 text-right mono text-dim">
                            {item.unitPrice > 0 ? fmt(item.unitPrice) + " 원" : "—"}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              onClick={() => hideItem(item.id, item.name)}
                              disabled={hiding === item.id}
                              className="mono text-[10px] text-dim hover:text-edred border hair px-2 py-0.5 hover:border-edred/30 transition-colors disabled:opacity-40"
                              title="이 품목을 발주 대기함에서 제외 (재고 목록에서 숨김)"
                            >
                              {hiding === item.id ? "…" : "제외"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )
          )}
        </>
      )}
    </div>
  );
}

// ── 품목 추가 폼 ──────────────────────────────────
function AddItemForm({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    category: "", department: "SV", partNo: "", name: "",
    currentStock: 0, minStock: 0, orderQty: 1, unitPrice: 0,
    leadTime: "4주", supplier: "에드워드코리아", memo: "",
  });

  function set(k: string, v: string | number) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    if (!form.partNo || !form.name) return;
    setSaving(true);
    await fetch("/api/admin/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setOpen(false);
    setForm({ category: "", department: "SV", partNo: "", name: "", currentStock: 0, minStock: 0, orderQty: 1, unitPrice: 0, leadTime: "4주", supplier: "에드워드코리아", memo: "" });
    onAdded();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mono text-[11px] font-bold border hair px-3 py-1.5 hover:border-ink transition-colors"
      >
        + 품목 추가
      </button>
    );
  }

  return (
    <div className="border hair rounded p-4 bg-paper/60 space-y-3">
      <div className="text-[13px] font-semibold text-ink">새 품목 추가</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { k: "department", label: "부서", type: "select", opts: ["SV", "AK"] },
          { k: "category",   label: "카테고리", type: "text" },
          { k: "partNo",     label: "PART NO *", type: "text" },
          { k: "name",       label: "품목명 *", type: "text" },
          { k: "currentStock", label: "현재재고", type: "number" },
          { k: "minStock",     label: "최소재고", type: "number" },
          { k: "orderQty",     label: "발주수량", type: "number" },
          { k: "unitPrice",    label: "단가(원)", type: "number" },
          { k: "leadTime",  label: "납기", type: "text" },
          { k: "supplier",  label: "납품업체", type: "text" },
          { k: "memo",      label: "메모", type: "text" },
        ].map(({ k, label, type, opts }) => (
          <div key={k} className="flex flex-col gap-1">
            <label className="mono text-[10px] text-dim uppercase tracking-wide">{label}</label>
            {type === "select" ? (
              <select
                value={(form as Record<string, string | number>)[k] as string}
                onChange={(e) => set(k, e.target.value)}
                className="border hair px-2 py-1.5 text-[12px] bg-white focus:outline-none focus:border-ink"
              >
                {opts!.map((o) => <option key={o}>{o}</option>)}
              </select>
            ) : (
              <input
                type={type}
                value={(form as Record<string, string | number>)[k]}
                onChange={(e) => set(k, type === "number" ? Number(e.target.value) : e.target.value)}
                className="border hair px-2 py-1.5 text-[12px] focus:outline-none focus:border-ink"
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={save}
          disabled={saving || !form.partNo || !form.name}
          className="mono text-[11px] font-bold bg-ink text-white px-4 py-1.5 hover:opacity-80 disabled:opacity-40 transition-opacity"
        >
          {saving ? "저장 중…" : "저장"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="mono text-[11px] border hair px-4 py-1.5 hover:border-ink transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────
export default function InventoryPage() {
  const [items, setItems]           = useState<InventoryItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState<"list" | "reorder">("list");
  const [showHidden, setShowHidden] = useState(false);
  const [reorderCount, setReorderCount] = useState(0);
  const [deptFilter, setDeptFilter] = useState<"ALL" | "SV" | "AK">("ALL");
  const [catFilter, setCatFilter]   = useState("ALL");

  const loadItems = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/inventory${showHidden ? "?hidden=1" : ""}`);
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }, [showHidden]);

  // 발주 필요 건수
  const loadReorderCount = useCallback(async () => {
    const res = await fetch("/api/admin/inventory/reorder");
    const data = await res.json();
    setReorderCount(data.total ?? 0);
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);
  useEffect(() => { loadReorderCount(); }, [loadReorderCount]);

  async function patchItem(id: number, patch: Partial<InventoryItem>) {
    await fetch(`/api/admin/inventory/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    await loadItems();
    await loadReorderCount();
  }

  async function deleteItem(id: number) {
    if (!confirm("완전 삭제하시겠습니까? 복구할 수 없습니다.")) return;
    const res = await fetch(`/api/admin/inventory/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error);
      return;
    }
    await loadItems();
  }

  // 카테고리 목록 (중복 제거)
  const categories = ["ALL", ...Array.from(new Set(items.map((i) => i.category))).sort()];

  const filtered = items.filter((i) => {
    if (deptFilter !== "ALL" && i.department !== deptFilter) return false;
    if (catFilter !== "ALL" && i.category !== catFilter) return false;
    return true;
  });

  const lowCount = items.filter((i) => i.isActive && i.currentStock < i.minStock).length;

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-ink tracking-tight">재고 관리</h1>
          <p className="text-[12px] text-dim mt-0.5">
            총 {items.length}개 품목
            {lowCount > 0 && (
              <span className="ml-2 text-edred font-semibold">· 발주 필요 {lowCount}건</span>
            )}
          </p>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-0 border-b hair">
        {[
          { key: "list",    label: "재고 목록" },
          { key: "reorder", label: `발주 대기함${reorderCount > 0 ? ` (${reorderCount})` : ""}` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key as "list" | "reorder")}
            className={`px-5 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px ${
              tab === key
                ? "border-edred text-ink"
                : "border-transparent text-dim hover:text-ink"
            }`}
          >
            {label}
            {key === "reorder" && reorderCount > 0 && (
              <span className="ml-1.5 mono text-[9px] font-bold bg-edred text-white px-1.5 py-px rounded-full">
                {reorderCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 재고 목록 탭 */}
      {tab === "list" && (
        <div className="space-y-4">
          {/* 필터 + 숨기기 토글 */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* 부서 필터 */}
            {(["ALL", "SV", "AK"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDeptFilter(d)}
                className={`mono text-[11px] font-bold px-3 py-1 rounded transition-colors ${
                  deptFilter === d
                    ? "bg-ink text-white"
                    : "border hair text-dim hover:border-ink"
                }`}
              >
                {d === "ALL" ? "전체" : d}
              </button>
            ))}
            <span className="w-px h-4 bg-line" />
            {/* 카테고리 필터 */}
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="mono text-[11px] border hair px-2 py-1 focus:outline-none focus:border-ink"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === "ALL" ? "카테고리 전체" : c}</option>
              ))}
            </select>
            <span className="ml-auto" />
            {/* 숨긴 품목 토글 */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-[12px] text-dim">숨긴 품목 보기</span>
              <div
                onClick={() => setShowHidden((v) => !v)}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  showHidden ? "bg-ink" : "bg-line"
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  showHidden ? "translate-x-4" : "translate-x-0.5"
                }`} />
              </div>
            </label>
          </div>

          {/* 품목 추가 폼 */}
          {!showHidden && <AddItemForm onAdded={loadItems} />}

          {/* 테이블 */}
          {loading ? (
            <div className="flex items-center justify-center py-16 text-dim text-[13px]">불러오는 중…</div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-dim text-[13px]">
              {showHidden ? "숨긴 품목 없음" : "품목 없음"}
            </div>
          ) : (
            <div className="border hair rounded overflow-hidden">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b hair bg-paper/80 text-dim mono">
                    <th className="text-left px-4 py-2.5 font-medium">부서</th>
                    <th className="text-left px-4 py-2.5 font-medium">카테고리</th>
                    <th className="text-left px-4 py-2.5 font-medium">PART NO</th>
                    <th className="text-left px-4 py-2.5 font-medium">품목명</th>
                    <th className="text-right px-4 py-2.5 font-medium">현재재고</th>
                    <th className="text-right px-4 py-2.5 font-medium">최소</th>
                    <th className="text-right px-4 py-2.5 font-medium">발주수량</th>
                    <th className="text-right px-4 py-2.5 font-medium">단가</th>
                    <th className="text-right px-4 py-2.5 font-medium">납기</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const low = item.isActive && item.currentStock < item.minStock;
                    return (
                      <tr
                        key={item.id}
                        className={`border-b hair last:border-b-0 transition-colors ${
                          low ? "bg-edred/[0.03] hover:bg-edred/[0.06]" : "hover:bg-paper/40"
                        } ${!item.isActive ? "opacity-40" : ""}`}
                      >
                        <td className="px-4 py-2.5">
                          <span className={`mono text-[10px] font-bold px-1.5 py-0.5 rounded ${DEPT_COLOR[item.department] ?? "bg-line text-dim"}`}>
                            {DEPT_LABEL[item.department] ?? item.department}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-dim">{item.category}</td>
                        <td className="px-4 py-2.5 mono text-[11px] text-dim">{item.partNo}</td>
                        <td className="px-4 py-2.5 text-ink max-w-[200px] truncate" title={item.name}>{item.name}</td>
                        <td className="px-4 py-2.5 text-right">
                          {item.isActive ? (
                            <StockCell
                              value={item.currentStock}
                              min={item.minStock}
                              onSave={(v) => patchItem(item.id, { currentStock: v })}
                            />
                          ) : (
                            <span className="mono text-[13px] text-dim">{item.currentStock}</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {item.isActive ? (
                            <StockCell
                              value={item.minStock}
                              min={-1}
                              onSave={(v) => patchItem(item.id, { minStock: v })}
                            />
                          ) : (
                            <span className="mono text-[13px] text-dim">{item.minStock}</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {item.isActive ? (
                            <StockCell
                              value={item.orderQty}
                              min={-1}
                              onSave={(v) => patchItem(item.id, { orderQty: v })}
                            />
                          ) : (
                            <span className="mono text-[13px] text-dim">{item.orderQty}</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right mono text-dim">
                          {item.unitPrice > 0 ? fmt(item.unitPrice) : "—"}
                        </td>
                        <td className="px-4 py-2.5 text-right text-dim">{item.leadTime ?? "—"}</td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {item.isActive ? (
                              <button
                                onClick={() => patchItem(item.id, { isActive: false })}
                                className="mono text-[10px] text-dim hover:text-ink border hair px-2 py-0.5 transition-colors"
                                title="숨기기"
                              >
                                숨기기
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => patchItem(item.id, { isActive: true })}
                                  className="mono text-[10px] text-smblue border border-smblue/30 px-2 py-0.5 hover:bg-smblue/5 transition-colors"
                                >
                                  복원
                                </button>
                                <button
                                  onClick={() => deleteItem(item.id)}
                                  className="mono text-[10px] text-edred border border-edred/30 px-2 py-0.5 hover:bg-edred/5 transition-colors"
                                >
                                  삭제
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 발주 대기함 탭 */}
      {tab === "reorder" && <ReorderTab />}
    </div>
  );
}
