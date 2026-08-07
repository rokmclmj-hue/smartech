"use client";

import { useEffect, useState, useCallback } from "react";

type XPost = {
  id: number;
  topic: string;
  content: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  approvedAt: string | null;
  postedAt: string | null;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:  { label: "대기중",   color: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "승인됨",   color: "bg-green-100 text-green-700" },
  REJECTED: { label: "반려됨",   color: "bg-red-100 text-red-600" },
  POSTED:   { label: "게시됨",   color: "bg-ink/10 text-dim" },
};

function formatDate(s: string) {
  const d = new Date(s);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function AdminXPostsPage() {
  const [posts, setPosts] = useState<XPost[]>([]);
  const [filter, setFilter] = useState<"PENDING" | "APPROVED" | "POSTED" | "REJECTED" | "ALL">("PENDING");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<XPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/x-posts?status=${filter}`);
      const data = await res.json();
      setPosts(data.posts ?? []);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/x-posts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("초안이 생성되었습니다", true);
        setTopic("");
        if (filter === "PENDING" || filter === "ALL") load();
      } else {
        showToast(data.error ?? "생성 실패", false);
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleAction = async (action: "approve" | "reject") => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/x-posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, action }),
      });
      if (res.ok) {
        showToast(action === "approve" ? "승인되었습니다" : "반려되었습니다", true);
        setSelected(null);
        load();
      }
    } finally {
      setSaving(false);
    }
  };

  const counts = {
    PENDING: posts.filter((p) => p.status === "PENDING").length,
    APPROVED: posts.filter((p) => p.status === "APPROVED").length,
    POSTED: posts.filter((p) => p.status === "POSTED").length,
    REJECTED: posts.filter((p) => p.status === "REJECTED").length,
    ALL: posts.length,
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
      <div className="flex items-baseline gap-4 mb-6">
        <h1 className="display text-[28px] md:text-[32px] tracking-[-0.03em]">X콘텐츠</h1>
        <span className="mono text-[10px] tracking-[0.18em] dim uppercase">Approval Queue</span>
      </div>

      {/* 새 초안 생성 */}
      <div className="border hair p-4 mb-6 bg-ink/[0.015] space-y-3">
        <div className="mono text-[9px] tracking-[0.18em] dim uppercase">새 초안 생성 (AI)</div>
        <div className="flex gap-2">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="예: 겨울철 펌프 오일 관리"
            onKeyDown={(e) => { if (e.key === "Enter" && !generating) handleGenerate(); }}
            className="flex-1 text-[13px] border hair px-3 py-2 bg-transparent focus:outline-none focus:border-ink"
          />
          <button
            onClick={handleGenerate}
            disabled={generating || !topic.trim()}
            className="mono text-[10px] tracking-[0.1em] uppercase bg-edred text-white px-4 py-2 hover:brightness-110 transition-all disabled:opacity-50 whitespace-nowrap"
          >
            {generating ? "생성 중..." : "초안 생성"}
          </button>
        </div>
        <div className="text-[11px] dim">주제를 입력하면 AI가 280자 이내 X 게시글 초안을 만들어 아래 대기중 목록에 추가합니다.</div>
      </div>

      {/* 필터 탭 */}
      <div className="flex items-center gap-1 mb-6 border-b hair">
        {(["PENDING", "APPROVED", "POSTED", "REJECTED", "ALL"] as const).map((tab) => {
          const label = tab === "ALL" ? "전체" : STATUS_LABELS[tab]?.label ?? tab;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 text-[13px] font-medium tracking-tight transition-colors relative ${
                filter === tab ? "text-ink" : "text-dim hover:text-ink"
              }`}
            >
              {label}
              <span className="ml-1.5 mono text-[10px] text-dim">({counts[tab]})</span>
              {filter === tab && (
                <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-edred" />
              )}
            </button>
          );
        })}
        <button
          onClick={load}
          className="ml-auto mono text-[10px] tracking-[0.1em] uppercase border hair text-dim px-3 py-1.5 hover:border-ink hover:text-ink transition-colors"
        >
          새로고침
        </button>
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="mono text-[11px] dim tracking-[0.12em] uppercase py-16 text-center">— Loading</div>
      ) : posts.length === 0 ? (
        <div className="mono text-[11px] dim tracking-[0.12em] uppercase py-16 text-center">— 글 없음</div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => {
            const s = STATUS_LABELS[post.status] ?? { label: post.status, color: "bg-ink/10 text-dim" };
            return (
              <button
                key={post.id}
                onClick={() => setSelected(post)}
                className="w-full text-left border hair px-5 py-4 hover:border-ink/30 hover:bg-ink/[0.02] transition-colors group"
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <span className={`shrink-0 mt-0.5 mono text-[9px] font-bold tracking-[0.1em] px-2 py-0.5 rounded ${s.color}`}>
                    {s.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] dim mb-0.5">{post.topic}</div>
                    <div className="text-[14px] font-medium tracking-tight truncate group-hover:text-edred transition-colors">
                      {post.content}
                    </div>
                  </div>
                  <span className="shrink-0 mono text-[10px] dim mt-0.5">{formatDate(post.createdAt)}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 상세 패널 */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-end bg-ink/20"
          onClick={() => setSelected(null)}
        >
          <div
            className="h-full w-full max-w-xl bg-paper border-l hair overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-8 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`mono text-[9px] font-bold tracking-[0.1em] px-2 py-0.5 rounded ${STATUS_LABELS[selected.status]?.color ?? "bg-ink/10 text-dim"}`}>
                      {STATUS_LABELS[selected.status]?.label ?? selected.status}
                    </span>
                    <span className="mono text-[10px] dim">{formatDate(selected.createdAt)}</span>
                  </div>
                  <h2 className="text-[15px] dim">{selected.topic}</h2>
                </div>
                <button onClick={() => setSelected(null)} className="shrink-0 p-1 text-dim hover:text-ink">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="mono text-[9px] tracking-[0.18em] dim uppercase">본문</div>
                  <div className="mono text-[9px] dim">{selected.content.length} / 280자</div>
                </div>
                <div className="text-[14px] leading-relaxed whitespace-pre-wrap border hair p-4 bg-ink/[0.015]">
                  {selected.content}
                </div>
              </div>

              {selected.status === "PENDING" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction("approve")}
                    disabled={saving}
                    className="flex-1 mono text-[10px] tracking-[0.1em] uppercase bg-edred text-white px-4 py-2.5 hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    승인
                  </button>
                  <button
                    onClick={() => handleAction("reject")}
                    disabled={saving}
                    className="flex-1 mono text-[10px] tracking-[0.1em] uppercase border hair text-dim px-4 py-2.5 hover:border-ink hover:text-ink transition-colors disabled:opacity-50"
                  >
                    반려
                  </button>
                </div>
              )}

              {selected.status === "APPROVED" && (
                <div className="border hair p-3 bg-ink/[0.015]">
                  <div className="mono text-[10px] tracking-[0.1em] uppercase text-dim mb-1">게시 대기</div>
                  <div className="text-[12px] dim">X API 키 발급 후 자동 게시 기능이 연결됩니다. 그 전까지는 승인된 글을 수동으로 X에 게시해주세요.</div>
                </div>
              )}

              {selected.adminNote && (
                <div className="text-[12px] dim">메모: {selected.adminNote}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 토스트 */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 text-[13px] font-medium shadow-lg ${toast.ok ? "bg-green-700 text-white" : "bg-red-700 text-white"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
