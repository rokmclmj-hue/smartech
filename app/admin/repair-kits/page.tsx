"use client";

import { useEffect, useState, useCallback } from "react";

type RepairKit = {
  id: number;
  pumpFamily: string;
  pumpMaker: string;
  pumpModel: string;
  modelGroup: string | null;
  basePrice: number;
  tier2Price: number;
  tier3Price: number;
  description: string | null;
  isActive: boolean;
  parts: { id: number; name: string; quantity: string | null }[];
  extraParts: { id: number; name: string; price: number }[];
};

const FAMILY_LABELS: Record<string, string> = {
  scroll:      "Scroll (nXDS · XDS)",
  rotary_vane: "Rotary Vane (RV · E2M)",
  booster:     "Booster (EH)",
  dry:         "Dry Pump (iH · iGX)",
  other:       "기타",
};

const FAMILIES = Object.keys(FAMILY_LABELS);

function formatPrice(n: number) {
  return n > 0 ? n.toLocaleString("ko-KR") + "원" : "—";
}

const EMPTY_KIT = {
  pumpFamily: "scroll",
  pumpMaker: "EDWARDS",
  pumpModel: "",
  modelGroup: "",
  basePrice: "",
  tier2Price: "",
  tier3Price: "",
  description: "",
};

export default function AdminRepairKitsPage() {
  const [kits, setKits] = useState<RepairKit[]>([]);
  const [loading, setLoading] = useState(true);
  const [familyFilter, setFamilyFilter] = useState("ALL");
  const [showInactive, setShowInactive] = useState(false);

  // 편집 패널
  const [editing, setEditing] = useState<RepairKit | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_KIT);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/repair-kits");
      const data = await res.json();
      setKits(data.kits ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openEdit(kit: RepairKit) {
    setEditing(kit);
    setCreating(false);
    setForm({
      pumpFamily: kit.pumpFamily,
      pumpMaker: kit.pumpMaker,
      pumpModel: kit.pumpModel,
      modelGroup: kit.modelGroup ?? "",
      basePrice: kit.basePrice > 0 ? String(kit.basePrice) : "",
      tier2Price: kit.tier2Price > 0 ? String(kit.tier2Price) : "",
      tier3Price: kit.tier3Price > 0 ? String(kit.tier3Price) : "",
      description: kit.description ?? "",
    });
  }

  function openCreate() {
    setEditing(null);
    setCreating(true);
    setForm(EMPTY_KIT);
  }

  function closePanel() {
    setEditing(null);
    setCreating(false);
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        pumpFamily: form.pumpFamily,
        pumpMaker: form.pumpMaker,
        pumpModel: form.pumpModel.trim(),
        modelGroup: form.modelGroup.trim() || null,
        basePrice: form.basePrice ? Number(form.basePrice) : 0,
        tier2Price: form.tier2Price ? Number(form.tier2Price) : 0,
        tier3Price: form.tier3Price ? Number(form.tier3Price) : 0,
        description: form.description.trim() || null,
      };

      if (creating) {
        const res = await fetch("/api/admin/repair-kits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("생성 실패");
      } else if (editing) {
        const res = await fetch("/api/admin/repair-kits", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
        if (!res.ok) throw new Error("저장 실패");
      }

      await load();
      closePanel();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(kit: RepairKit) {
    await fetch("/api/admin/repair-kits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: kit.id, isActive: !kit.isActive }),
    });
    await load();
  }

  const filtered = kits.filter((k) => {
    if (!showInactive && !k.isActive) return false;
    if (familyFilter !== "ALL" && k.pumpFamily !== familyFilter) return false;
    return true;
  });

  return (
    <div className="flex overflow-hidden" style={{ height: "calc(100vh - 100px)" }}>
      {/* 왼쪽: 목록 */}
      <div className="flex-1 min-w-0 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight">수리 키트 관리</h1>
            <p className="text-[13px] text-dim mt-0.5">
              모델별 수리 단가 및 교체 파트 관리
            </p>
          </div>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-ink text-paper text-[13px] font-semibold hover:bg-edred transition"
          >
            + 새 키트 추가
          </button>
        </div>

        {/* 필터 */}
        <div className="flex gap-2 mb-4 flex-wrap items-center">
          {["ALL", ...FAMILIES].map((f) => (
            <button
              key={f}
              onClick={() => setFamilyFilter(f)}
              className={`text-[11px] mono px-3 py-1.5 border transition ${
                familyFilter === f
                  ? "bg-ink text-paper border-ink"
                  : "border-line hover:border-ink text-dim"
              }`}
            >
              {f === "ALL" ? "전체" : FAMILY_LABELS[f]}
            </button>
          ))}
          <label className="ml-2 flex items-center gap-1.5 text-[11px] text-dim cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="w-3 h-3"
            />
            비활성 포함
          </label>
        </div>

        {/* 테이블 */}
        {loading ? (
          <div className="text-[13px] text-dim py-8 text-center animate-pulse">로딩 중...</div>
        ) : (
          <div className="border border-line overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line bg-paper/50">
                  <th className="text-left px-4 py-3 font-medium text-dim mono text-[11px]">모델</th>
                  <th className="text-left px-4 py-3 font-medium text-dim mono text-[11px]">계열</th>
                  <th className="text-right px-4 py-3 font-medium text-dim mono text-[11px]">기본수리 (T1)</th>
                  <th className="text-right px-4 py-3 font-medium text-dim mono text-[11px]">+파트교체 (T2)</th>
                  <th className="text-right px-4 py-3 font-medium text-dim mono text-[11px]">전체수리 (T3)</th>
                  <th className="text-left px-4 py-3 font-medium text-dim mono text-[11px]">파트</th>
                  <th className="text-left px-4 py-3 font-medium text-dim mono text-[11px]">상태</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-dim text-[13px]">
                      키트가 없습니다.
                    </td>
                  </tr>
                )}
                {filtered.map((k) => (
                  <tr
                    key={k.id}
                    className={`border-b border-line hover:bg-paper/80 transition ${
                      !k.isActive ? "opacity-40" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold">{k.pumpModel}</div>
                      {k.modelGroup && (
                        <div className="text-[11px] text-dim">{k.modelGroup}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-dim">
                      {FAMILY_LABELS[k.pumpFamily] ?? k.pumpFamily}
                    </td>
                    <td className="px-4 py-3 text-right tabular">
                      {k.basePrice > 0 ? (
                        <span className="font-medium">{formatPrice(k.basePrice)}</span>
                      ) : (
                        <span className="text-dim text-[11px]">미설정</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular">
                      {k.tier2Price > 0 ? (
                        <span className="font-medium">{formatPrice(k.tier2Price)}</span>
                      ) : (
                        <span className="text-dim text-[11px]">미설정</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular">
                      {k.tier3Price > 0 ? (
                        <span className="font-medium">{formatPrice(k.tier3Price)}</span>
                      ) : (
                        <span className="text-dim text-[11px]">미설정</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] text-dim">
                        기본 {k.parts.length}종 / 추가 {k.extraParts.length}종
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleActive(k); }}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          k.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-ink/10 text-dim"
                        }`}
                      >
                        {k.isActive ? "활성" : "비활성"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openEdit(k)}
                        className="text-[12px] border border-line px-3 py-1 hover:border-ink hover:bg-ink hover:text-paper transition"
                      >
                        편집
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 오른쪽: 편집 패널 */}
      {(editing || creating) && (
        <div className="w-[420px] shrink-0 border-l border-line overflow-y-auto bg-paper">
          <div className="sticky top-0 bg-paper border-b border-line px-6 py-4 flex items-center justify-between z-10">
            <h2 className="font-bold text-[16px]">
              {creating ? "새 키트 추가" : `${editing?.pumpModel} 편집`}
            </h2>
            <button onClick={closePanel} className="text-dim hover:text-ink text-xl leading-none">×</button>
          </div>

          <div className="px-6 py-5 space-y-4">
            {/* 펌프 계열 */}
            <div>
              <label className="text-[12px] font-medium block mb-1.5">
                펌프 계열 <span className="text-edred">*</span>
              </label>
              <select
                value={form.pumpFamily}
                onChange={(e) => setForm((f) => ({ ...f, pumpFamily: e.target.value }))}
                className="w-full border border-line px-3 py-2.5 text-[13px] focus:outline-none focus:border-ink bg-paper"
              >
                {FAMILIES.map((fam) => (
                  <option key={fam} value={fam}>{FAMILY_LABELS[fam]}</option>
                ))}
              </select>
            </div>

            {/* 제조사 */}
            <div>
              <label className="text-[12px] font-medium block mb-1.5">제조사</label>
              <input
                type="text"
                value={form.pumpMaker}
                onChange={(e) => setForm((f) => ({ ...f, pumpMaker: e.target.value }))}
                placeholder="EDWARDS"
                className="w-full border border-line px-3 py-2.5 text-[13px] focus:outline-none focus:border-ink bg-paper"
              />
            </div>

            {/* 모델명 */}
            <div>
              <label className="text-[12px] font-medium block mb-1.5">
                모델명 <span className="text-edred">*</span>
              </label>
              <input
                type="text"
                value={form.pumpModel}
                onChange={(e) => setForm((f) => ({ ...f, pumpModel: e.target.value }))}
                placeholder="예: nXDS10i, XDS35iE, RV8"
                className="w-full border border-line px-3 py-2.5 text-[13px] focus:outline-none focus:border-ink bg-paper"
              />
            </div>

            {/* 모델 그룹 */}
            <div>
              <label className="text-[12px] font-medium block mb-1.5">
                모델 그룹 <span className="text-dim font-normal">(표시용 — 예: nXDS10i/15i)</span>
              </label>
              <input
                type="text"
                value={form.modelGroup}
                onChange={(e) => setForm((f) => ({ ...f, modelGroup: e.target.value }))}
                placeholder="예: nXDS10i/15i 계열"
                className="w-full border border-line px-3 py-2.5 text-[13px] focus:outline-none focus:border-ink bg-paper"
              />
            </div>

            {/* 3단계 금액 */}
            <div className="border border-line p-4 space-y-3">
              <div className="mono text-[10px] text-dim tracking-widest mb-1">수리 단가 (원, VAT 별도)</div>

              {[
                { key: "basePrice",  label: "Tier 1 — 기본수리",          hint: "소모품 교체 + 기본 점검" },
                { key: "tier2Price", label: "Tier 2 — 기본수리 + 파트교체", hint: "주요 파트 추가 교체" },
                { key: "tier3Price", label: "Tier 3 — 전체수리",           hint: "전체 분해 · 완전 오버홀" },
              ].map(({ key, label, hint }) => (
                <div key={key}>
                  <label className="text-[12px] font-semibold block mb-0.5">{label}</label>
                  <p className="text-[10px] text-dim mb-1.5">{hint}</p>
                  <div className="relative">
                    <input
                      type="number"
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder="0 (미설정 시 상담 후 확정)"
                      className="w-full border border-line px-3 py-2 pr-10 text-[13px] focus:outline-none focus:border-ink bg-paper tabular"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-dim">원</span>
                  </div>
                  {form[key as keyof typeof form] && Number(form[key as keyof typeof form]) > 0 && (
                    <p className="text-[11px] text-dim mt-0.5">
                      = {Number(form[key as keyof typeof form]).toLocaleString("ko-KR")}원
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* 설명 */}
            <div>
              <label className="text-[12px] font-medium block mb-1.5">설명 (내부용)</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="내부 참고 메모"
                className="w-full border border-line px-3 py-2 text-[13px] focus:outline-none focus:border-ink bg-paper resize-none"
              />
            </div>

            {/* 저장 */}
            <button
              onClick={save}
              disabled={saving || !form.pumpModel.trim()}
              className="w-full py-3 bg-edred text-paper text-[13px] font-semibold hover:bg-ink transition disabled:opacity-40"
            >
              {saving ? "저장 중..." : creating ? "키트 추가" : "변경사항 저장"}
            </button>

            {editing && (
              <button
                onClick={() => toggleActive(editing).then(load).then(closePanel)}
                className="w-full py-2.5 border border-line text-[12px] text-dim hover:border-ink hover:text-ink transition"
              >
                {editing.isActive ? "비활성화" : "활성화"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
