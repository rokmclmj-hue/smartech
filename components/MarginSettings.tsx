"use client";

import { useState, useEffect } from "react";

type Rule = { tier: string; multiplier: number };

// 관리자에게 보여줄 등급 설정 목록 (고객에게는 등급명 비공개)
const TIER_CONFIG = [
  {
    tier: "PUBLIC",
    label: "공개 가격",
    desc: "로그인하지 않은 방문자에게 표시되는 가격",
    color: "text-gray-600",
  },
  {
    tier: "ENDUSER",
    label: "일반 회원",
    desc: "신규 가입 또는 미분류 고객",
    color: "text-gray-600",
  },
  {
    tier: "OEM",
    label: "OEM",
    desc: "제조사 직납 고객 (관리자만 확인 가능)",
    color: "text-purple-600",
  },
  {
    tier: "DEALER",
    label: "딜러",
    desc: "유통·판매 대리점 (관리자만 확인 가능)",
    color: "text-blue-600",
  },
];

// multiplier → 마진율 변환 (1.20 → 20)
function toMargin(multiplier: number) {
  return Math.round((multiplier - 1) * 100);
}

// 마진율 → multiplier 변환 (20 → 1.20)
function toMultiplier(margin: number) {
  return 1 + margin / 100;
}

export default function MarginSettings() {
  const [rules, setRules] = useState<Record<string, number>>({});
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/price-rules")
      .then((r) => r.json())
      .then((data: Rule[]) => {
        const map: Record<string, number> = {};
        for (const r of data) map[r.tier] = r.multiplier;
        setRules(map);
      })
      .finally(() => setLoading(false));
  }, []);

  function getMultiplier(tier: string) {
    // DB 값 우선, 없으면 기본값
    const DEFAULTS: Record<string, number> = {
      PUBLIC: 1.40, ENDUSER: 1.40, OEM: 1.30, DEALER: 1.20,
    };
    return rules[tier] ?? DEFAULTS[tier] ?? 1.40;
  }

  function getEditValue(tier: string) {
    return editing[tier] ?? String(toMargin(getMultiplier(tier)));
  }

  async function handleSave(tier: string) {
    const raw = editing[tier];
    const margin = raw !== undefined ? parseInt(raw) : toMargin(getMultiplier(tier));
    if (isNaN(margin) || margin < 0 || margin > 200) return;

    setSaving(tier);
    try {
      const res = await fetch("/api/admin/price-rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, multiplier: toMultiplier(margin) }),
      });
      if (res.ok) {
        setRules((prev) => ({ ...prev, [tier]: toMultiplier(margin) }));
        setEditing((prev) => { const n = { ...prev }; delete n[tier]; return n; });
        setSaved(tier);
        setTimeout(() => setSaved(null), 2000);
      }
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="py-8 text-center mono text-[11px] dim tracking-[0.12em]">LOADING...</div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-[12px] dim leading-[1.6] mb-4">
        원가에 아래 마진율을 적용해 각 등급의 표시 가격을 계산합니다.
        고객에게는 등급명 없이 가격만 표시됩니다.
      </div>

      {TIER_CONFIG.map(({ tier, label, desc, color }) => {
        const margin = toMargin(getMultiplier(tier));
        const editVal = getEditValue(tier);
        const isDirty = editing[tier] !== undefined;
        const isSaving = saving === tier;
        const isSaved = saved === tier;

        return (
          <div key={tier} className="border hair px-5 py-4 grid grid-cols-[1fr_auto] gap-4 items-center">
            <div>
              <div className={`text-[14px] font-semibold ${color}`}>{label}</div>
              <div className="text-[12px] dim mt-0.5">{desc}</div>
              <div className="mono text-[11px] text-ink/40 mt-1">
                원가 × {getMultiplier(tier).toFixed(2)} = 판매가
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center border hair bg-white">
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={editVal}
                  onChange={(e) =>
                    setEditing((prev) => ({ ...prev, [tier]: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleSave(tier)}
                  className="w-16 px-3 py-2 text-[14px] text-right focus:outline-none mono"
                />
                <span className="px-2 text-[13px] dim border-l hair bg-ink/[0.02]">%</span>
              </div>

              <button
                onClick={() => handleSave(tier)}
                disabled={isSaving || !isDirty}
                className={`px-3 py-2 text-[12px] font-medium transition-colors border ${
                  isSaved
                    ? "border-green-400 text-green-600 bg-green-50"
                    : isDirty
                    ? "border-ink bg-ink text-paper hover:bg-ink/80"
                    : "border-gray-200 text-dim cursor-not-allowed"
                }`}
              >
                {isSaving ? "..." : isSaved ? "✓" : "저장"}
              </button>
            </div>
          </div>
        );
      })}

      <div className="px-4 py-3 bg-ink/[0.02] border hair text-[12px] dim">
        ※ 저장 즉시 전체 제품 페이지에 반영됩니다. DEALER(딜러)·OEM 등급명은 고객에게 노출되지 않습니다.
      </div>
    </div>
  );
}
