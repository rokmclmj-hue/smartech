"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useToast } from "@/lib/toast";

type EdwardsOpenOrder = {
  id: number;
  poNumber: string;
  documentNo: string;
  itemLine: string;
  materialCode: string;
  description: string;
  quantity: number;
  currentMad: string;
  previousMad: string | null;
  supplier: string | null;
  status: "OPEN" | "PENDING_CONFIRM" | "DELIVERED";
  firstSeenAt: string;
  lastSeenAt: string;
  deliveredAt: string | null;
  hqReceived: boolean;
  hqReceivedAt: string | null;
};

type PoGroupSetting = { poNumber: string; requireFullShipment: boolean };

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

// 오늘부터 currentMad까지 남은 일수 (자정 기준, UTC로 저장된 MAD와 맞춰 비교)
function daysUntil(dateStr: string) {
  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const mad = new Date(dateStr).getTime();
  return Math.round((mad - todayUtc) / 86400000);
}

function gcalUrl(item: EdwardsOpenOrder) {
  const d = new Date(item.currentMad);
  const end = new Date(d.getTime() + 86400000);
  const fmt = (x: Date) => x.toISOString().slice(0, 10).replace(/-/g, "");
  const text = encodeURIComponent(`[에드워드납기] ${item.poNumber} - ${item.description}`);
  const details = encodeURIComponent(
    `수량 ${item.quantity} / 자재코드 ${item.materialCode} / 발주업체 ${item.supplier ?? "미정"}`
  );
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${fmt(d)}/${fmt(end)}&details=${details}`;
}

// MAD가 직전 스냅샷보다 당겨졌는지(🟢)/밀렸는지(🔴) 배지
function MadBadge({ item }: { item: EdwardsOpenOrder }) {
  if (!item.previousMad) return null;
  const diffDays = Math.round(
    (new Date(item.currentMad).getTime() - new Date(item.previousMad).getTime()) / 86400000
  );
  if (diffDays === 0) return null;
  const pulled = diffDays < 0;
  return (
    <span className={`ml-2 mono text-[10px] font-bold ${pulled ? "text-smblue" : "text-edred"}`}>
      {pulled ? "▲당겨짐" : "▼밀림"} {Math.abs(diffDays)}일
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    OPEN: { label: "진행중", cls: "bg-smblue/10 text-smblue" },
    PENDING_CONFIRM: { label: "입고완료 후보", cls: "bg-edred/10 text-edred" },
    DELIVERED: { label: "입고완료", cls: "bg-ink/10 text-dim" },
  };
  const s = map[status] ?? { label: status, cls: "bg-ink/10 text-dim" };
  return (
    <span className={`mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${s.cls}`}>
      {s.label}
    </span>
  );
}

// ── 발주업체 인라인 편집 셀 ───────────────────────
function SupplierCell({
  value,
  suggestions,
  onSave,
}: {
  value: string | null;
  suggestions: string[];
  onSave: (v: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  if (!editing) {
    return (
      <button
        onClick={() => { setDraft(value ?? ""); setEditing(true); }}
        className={`text-[13px] px-2 py-0.5 rounded transition-colors hover:bg-ink/5 ${
          value ? "text-ink" : "text-edred font-semibold"
        }`}
        title="클릭하여 수정"
      >
        {value || "입력 필요"}
      </button>
    );
  }

  return (
    <input
      list="supplier-suggestions"
      value={draft}
      autoFocus
      className="text-[13px] w-28 border hair px-2 py-0.5 rounded focus:outline-none focus:border-ink"
      onChange={(e) => setDraft(e.target.value)}
      onBlur={async () => {
        if (draft.trim() !== (value ?? "")) await onSave(draft.trim());
        setEditing(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "Escape") setEditing(false);
      }}
    />
  );
}

export default function EdwardsOrdersPage() {
  const { success, error: toastError, info } = useToast();
  const [items, setItems] = useState<EdwardsOpenOrder[]>([]);
  const [poSettings, setPoSettings] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<"active" | "delivered">("active");
  const fileRef = useRef<HTMLInputElement>(null);
  const [supplierSuggestions, setSupplierSuggestions] = useState<string[]>([]);

  const load = useCallback(async (which: "active" | "delivered") => {
    setLoading(true);
    const res = await fetch(which === "active" ? "/api/admin/edwards-orders" : "/api/admin/edwards-orders?status=DELIVERED");
    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  }, []);

  const loadPoSettings = useCallback(async () => {
    const res = await fetch("/api/admin/edwards-orders/po-groups");
    const data = await res.json();
    const map: Record<string, boolean> = {};
    for (const s of (data.settings ?? []) as PoGroupSetting[]) map[s.poNumber] = s.requireFullShipment;
    setPoSettings(map);
  }, []);

  // 발주업체 자동완성은 현재 탭에 상관없이 전체 이력에서 뽑아야 진행중/입고완료 어느 쪽에서든 다 보임
  const loadSupplierSuggestions = useCallback(async () => {
    const res = await fetch("/api/admin/edwards-orders?status=ALL");
    const data = await res.json();
    const names = new Set<string>((data.items ?? []).map((i: EdwardsOpenOrder) => i.supplier).filter(Boolean));
    setSupplierSuggestions([...names] as string[]);
  }, []);

  useEffect(() => { load(tab); }, [tab, load]);
  useEffect(() => { loadSupplierSuggestions(); loadPoSettings(); }, [loadSupplierSuggestions, loadPoSettings]);

  async function handleUpload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/edwards-orders/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { toastError(data.error ?? "업로드 실패"); return; }
      const skippedNote = data.skippedRows > 0 ? `, 인식 실패 ${data.skippedRows}건(확인 필요)` : "";
      success(
        `업로드 완료 — 신규 ${data.created}건, MAD변경 ${data.madChanged}건, 입고완료 후보 ${data.disappeared}건${skippedNote}`
      );
      load(tab);
      loadSupplierSuggestions();
    } catch {
      toastError("업로드 중 오류가 발생했습니다");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function updateSupplier(id: number, supplier: string) {
    const res = await fetch(`/api/admin/edwards-orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplier }),
    });
    if (!res.ok) { toastError("발주업체 저장 실패"); return; }
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, supplier } : it)));
  }

  async function toggleHqReceived(id: number) {
    const res = await fetch(`/api/admin/edwards-orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggleHqReceived" }),
    });
    if (!res.ok) { toastError("입고 표시 저장 실패"); return; }
    const updated = await res.json();
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, hqReceived: updated.hqReceived, hqReceivedAt: updated.hqReceivedAt } : it)));
  }

  async function toggleRequireFullShipment(poNumber: string) {
    const prevValue = poSettings[poNumber] ?? true;
    const next = !prevValue;
    setPoSettings((prev) => ({ ...prev, [poNumber]: next }));
    const res = await fetch("/api/admin/edwards-orders/po-groups", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ poNumber, requireFullShipment: next }),
    });
    if (!res.ok) {
      toastError("PO 설정 저장 실패");
      setPoSettings((prev) => ({ ...prev, [poNumber]: prevValue }));
    }
  }

  function toggleCollapsed(poNumber: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(poNumber)) next.delete(poNumber); else next.add(poNumber);
      return next;
    });
  }

  async function confirmDelivered(id: number) {
    const res = await fetch(`/api/admin/edwards-orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "confirmDelivered" }),
    });
    if (!res.ok) { toastError("확정 실패"); return; }
    info("입고완료로 확정했습니다");
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  async function reopen(id: number) {
    const res = await fetch(`/api/admin/edwards-orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reopen" }),
    });
    if (!res.ok) { toastError("되돌리기 실패"); return; }
    load(tab);
  }

  // PO 번호로 그룹핑 + 그룹은 가장 빠른 MAD 순으로, 그룹 안은 MAD 빠른 순으로 정렬
  const groups = useMemo(() => {
    const map = new Map<string, EdwardsOpenOrder[]>();
    for (const it of items) {
      const arr = map.get(it.poNumber) ?? [];
      arr.push(it);
      map.set(it.poNumber, arr);
    }
    const list = [...map.entries()].map(([poNumber, group]) => {
      const sorted = [...group].sort((a, b) => a.currentMad.localeCompare(b.currentMad));
      const earliestMad = sorted[0]?.currentMad ?? "";
      const receivedCount = group.filter((g) => g.hqReceived).length;
      return { poNumber, items: sorted, earliestMad, receivedCount, total: group.length };
    });
    list.sort((a, b) => a.earliestMad.localeCompare(b.earliestMad));
    return list;
  }, [items]);

  // 임박 알림 — 1주일 이내(지난 것 포함) MAD, 진행중 탭에서만
  const upcoming = useMemo(() => {
    if (tab !== "active") return [];
    return items
      .filter((it) => it.status !== "DELIVERED" && daysUntil(it.currentMad) <= 7)
      .sort((a, b) => a.currentMad.localeCompare(b.currentMad));
  }, [items, tab]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
      <datalist id="supplier-suggestions">
        {supplierSuggestions.map((s) => <option key={s} value={s} />)}
      </datalist>

      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">에드워드 Open Orders</h1>
          <p className="text-[13px] dim mt-1">본사 발주 품목의 납기(MAD)·발주업체·입고 현황 — 내부 전용, 본사에 비공개</p>
        </div>
        <label className={`mono text-[11px] tracking-[0.08em] uppercase border hair px-4 py-2.5 cursor-pointer hover:border-ink transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
          {uploading ? "업로드 중…" : "＋ 새 Open Orders 엑셀 업로드"}
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
          />
        </label>
      </div>

      {upcoming.length > 0 && (
        <div className="mb-6 border border-edred/30 bg-edred/[0.04] rounded-lg p-4">
          <div className="text-[13px] font-semibold text-edred mb-2">
            ⏰ 1주일 이내 납기(MAD) — {upcoming.length}건
          </div>
          <div className="space-y-1.5">
            {upcoming.map((it) => {
              const d = daysUntil(it.currentMad);
              return (
                <div key={it.id} className="flex items-center justify-between flex-wrap gap-2 text-[12px]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="mono text-[11px] dim shrink-0">{fmtDate(it.currentMad)}</span>
                    <span className={`mono text-[10px] font-bold shrink-0 ${d < 0 ? "text-edred" : "text-ink"}`}>
                      {d < 0 ? `${Math.abs(d)}일 지남` : d === 0 ? "오늘" : `D-${d}`}
                    </span>
                    <span className="mono text-[11px] dim shrink-0">{it.poNumber}</span>
                    <span className="truncate text-ink">{it.description}</span>
                  </div>
                  <a
                    href={gcalUrl(it)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono text-[10px] tracking-[0.04em] uppercase border hair px-2.5 py-1 rounded hover:border-ink hover:text-ink dim shrink-0"
                  >
                    📅 캘린더에 추가
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-1 mb-4 border-b hair">
        <button
          onClick={() => setTab("active")}
          className={`px-4 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
            tab === "active" ? "border-edred text-ink" : "border-transparent dim hover:text-ink"
          }`}
        >
          진행중 / 입고완료 후보
        </button>
        <button
          onClick={() => setTab("delivered")}
          className={`px-4 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
            tab === "delivered" ? "border-edred text-ink" : "border-transparent dim hover:text-ink"
          }`}
        >
          입고완료 이력
        </button>
      </div>

      {loading ? (
        <div className="mono text-[11px] dim py-12 text-center">— Loading</div>
      ) : items.length === 0 ? (
        <div className="mono text-[11px] dim py-12 text-center">
          {tab === "active" ? "진행중인 오더가 없습니다. 엑셀을 업로드해주세요." : "입고완료 이력이 없습니다."}
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((g) => {
            const requireFull = poSettings[g.poNumber] ?? true;
            const ready = requireFull && g.receivedCount === g.total;
            const isCollapsed = collapsed.has(g.poNumber);
            return (
              <div key={g.poNumber} className={`border hair rounded-lg overflow-hidden ${ready ? "border-smblue/40" : ""}`}>
                <div className={`flex items-center justify-between flex-wrap gap-3 px-4 py-3 ${ready ? "bg-smblue/[0.06]" : "bg-ink/[0.02]"}`}>
                  <button onClick={() => toggleCollapsed(g.poNumber)} className="flex items-center gap-3 text-left min-w-0">
                    <span className="mono text-[11px] dim shrink-0">{isCollapsed ? "▸" : "▾"}</span>
                    <span className="mono text-[13px] font-semibold text-ink shrink-0">{g.poNumber}</span>
                    <span className="text-[12px] dim truncate">가장 빠른 MAD {fmtDate(g.earliestMad)}</span>
                  </button>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`mono text-[11px] font-bold ${ready ? "text-smblue" : "dim"}`}>
                      {g.receivedCount}/{g.total} 입고됨
                    </span>
                    {ready && (
                      <span className="mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-smblue text-paper uppercase tracking-wide">
                        출고 가능
                      </span>
                    )}
                    <label className="flex items-center gap-1.5 text-[11px] dim cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={requireFull}
                        onChange={() => toggleRequireFullShipment(g.poNumber)}
                      />
                      전량출고 필요
                    </label>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className="border-b hair bg-ink/[0.015] text-left">
                          <th className="px-3 py-2 font-medium dim text-[11px] uppercase tracking-wide"></th>
                          <th className="px-3 py-2 font-medium dim text-[11px] uppercase tracking-wide">품명</th>
                          <th className="px-3 py-2 font-medium dim text-[11px] uppercase tracking-wide text-right">수량</th>
                          <th className="px-3 py-2 font-medium dim text-[11px] uppercase tracking-wide">Current MAD</th>
                          <th className="px-3 py-2 font-medium dim text-[11px] uppercase tracking-wide">발주업체</th>
                          <th className="px-3 py-2 font-medium dim text-[11px] uppercase tracking-wide">상태</th>
                          <th className="px-3 py-2 font-medium dim text-[11px] uppercase tracking-wide"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {g.items.map((it) => (
                          <tr key={it.id} className={`border-b hair last:border-b-0 hover:bg-ink/[0.015] ${it.hqReceived ? "bg-amber-50" : ""}`}>
                            <td className="px-3 py-2.5">
                              <button
                                onClick={() => toggleHqReceived(it.id)}
                                title="본사 입고 여부 (메일의 노란색 표시)"
                                className={`mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${
                                  it.hqReceived
                                    ? "bg-amber-200 border-amber-300 text-amber-900"
                                    : "border-line dim hover:border-ink hover:text-ink"
                                }`}
                              >
                                {it.hqReceived ? "입고됨" : "미입고"}
                              </button>
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="text-ink">{it.description}</div>
                              <div className="mono text-[10px] dim">{it.materialCode}</div>
                            </td>
                            <td className="px-3 py-2.5 text-right mono">{it.quantity}</td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <span className="mono">{fmtDate(it.currentMad)}</span>
                              <MadBadge item={it} />
                            </td>
                            <td className="px-3 py-2.5">
                              <SupplierCell
                                value={it.supplier}
                                suggestions={supplierSuggestions}
                                onSave={(v) => updateSupplier(it.id, v)}
                              />
                            </td>
                            <td className="px-3 py-2.5"><StatusBadge status={it.status} /></td>
                            <td className="px-3 py-2.5 text-right">
                              {it.status === "PENDING_CONFIRM" && (
                                <button
                                  onClick={() => confirmDelivered(it.id)}
                                  className="mono text-[10px] tracking-[0.06em] uppercase bg-ink text-paper px-3 py-1.5 rounded hover:bg-ink/80 transition-colors"
                                >
                                  입고완료 확정
                                </button>
                              )}
                              {it.status === "DELIVERED" && (
                                <button
                                  onClick={() => reopen(it.id)}
                                  className="mono text-[10px] tracking-[0.06em] uppercase border hair dim px-3 py-1.5 rounded hover:border-ink hover:text-ink transition-colors"
                                >
                                  되돌리기
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
