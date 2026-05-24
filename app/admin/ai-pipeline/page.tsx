"use client";

import { useEffect, useState, useCallback } from "react";

type PostSummary = {
  filename: string;
  date: string;
  status: string;
  category: string;
  seoTitle: string;
  rejectionReason: string;
};

type PostDetail = PostSummary & {
  metaDesc: string;
  tags: string;
  finalContent: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  "견적문의":   "bg-blue-100 text-blue-700",
  "기술문의":   "bg-purple-100 text-purple-700",
  "단종문의":   "bg-yellow-100 text-yellow-700",
  "수리문의":   "bg-orange-100 text-orange-700",
  "일반":       "bg-ink/10 text-dim",
};

export default function AiPipelinePage() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [filter, setFilter] = useState<"전체" | "통과" | "반려">("전체");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PostDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishedIds, setPublishedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ai-pipeline");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPosts(data.posts ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (filename: string) => {
    setDetailLoading(true);
    setSelected(null);
    try {
      const res = await fetch(`/api/admin/ai-pipeline?file=${encodeURIComponent(filename)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSelected(data);
    } finally {
      setDetailLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!selected) return;
    setPublishing(true);
    try {
      const res = await fetch("/api/admin/ai-pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: selected.filename }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("블로그에 등록되었습니다 (임시저장)", true);
        setPublishedIds((prev) => new Set(prev).add(selected.filename));
      } else if (res.status === 409) {
        showToast("이미 등록된 글입니다", false);
        setPublishedIds((prev) => new Set(prev).add(selected.filename));
      } else {
        showToast(data.error ?? "등록 실패", false);
      }
    } finally {
      setPublishing(false);
    }
  };

  const filtered = posts.filter((p) => {
    if (filter === "전체") return true;
    return p.status === filter;
  });

  const counts = {
    전체: posts.length,
    통과: posts.filter((p) => p.status === "통과").length,
    반려: posts.filter((p) => p.status === "반려").length,
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
      {/* 헤더 */}
      <div className="flex items-baseline gap-4 mb-6">
        <h1 className="display text-[28px] md:text-[32px] tracking-[-0.03em]">AI 콘텐츠</h1>
        <span className="mono text-[10px] tracking-[0.18em] dim uppercase">Pipeline</span>
      </div>

      {/* 필터 탭 */}
      <div className="flex items-center gap-1 mb-6 border-b hair">
        {(["전체", "통과", "반려"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-[13px] font-medium tracking-tight transition-colors relative ${
              filter === tab ? "text-ink" : "text-dim hover:text-ink"
            }`}
          >
            {tab}
            <span className="ml-1.5 mono text-[10px] text-dim">({counts[tab]})</span>
            {filter === tab && (
              <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-edred" />
            )}
          </button>
        ))}
        <button
          onClick={load}
          className="ml-auto mono text-[10px] tracking-[0.1em] uppercase border hair text-dim px-3 py-1.5 hover:border-ink hover:text-ink transition-colors"
        >
          새로고침
        </button>
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="mono text-[11px] dim tracking-[0.12em] uppercase py-16 text-center">
          — Loading
        </div>
      ) : filtered.length === 0 ? (
        <div className="mono text-[11px] dim tracking-[0.12em] uppercase py-16 text-center">
          — 글 없음
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((post) => (
            <button
              key={post.filename}
              onClick={() => openDetail(post.filename)}
              className="w-full text-left border hair px-5 py-4 hover:border-ink/30 hover:bg-ink/[0.02] transition-colors group"
            >
              <div className="flex items-start gap-3 md:gap-4">
                {/* 상태 배지 */}
                <span
                  className={`shrink-0 mt-0.5 mono text-[9px] font-bold tracking-[0.1em] px-2 py-0.5 rounded ${
                    post.status === "통과"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {post.status}
                </span>

                {/* 카테고리 배지 */}
                <span
                  className={`shrink-0 mt-0.5 mono text-[9px] tracking-[0.06em] px-2 py-0.5 rounded ${
                    CATEGORY_COLORS[post.category] ?? "bg-ink/10 text-dim"
                  }`}
                >
                  {post.category}
                </span>

                {/* 제목 + 반려 이유 */}
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium tracking-tight truncate group-hover:text-edred transition-colors">
                    {post.seoTitle || post.filename}
                  </div>
                  {post.status === "반려" && post.rejectionReason && (
                    <div className="mono text-[10px] text-red-500 mt-0.5 truncate">
                      반려 이유: {post.rejectionReason}
                    </div>
                  )}
                </div>

                {/* 날짜 */}
                <span className="shrink-0 mono text-[10px] dim mt-0.5">
                  {post.date}
                </span>

                {publishedIds.has(post.filename) && (
                  <span className="shrink-0 mt-0.5 mono text-[9px] font-bold tracking-[0.1em] bg-ink/10 text-dim px-2 py-0.5 rounded">
                    등록됨
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 상세 모달 */}
      {(selected || detailLoading) && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-end bg-ink/20"
          onClick={() => { if (!detailLoading) setSelected(null); }}
        >
          <div
            className="h-full w-full max-w-2xl bg-paper border-l hair overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {detailLoading ? (
              <div className="flex items-center justify-center h-32">
                <span className="mono text-[11px] dim tracking-[0.12em] uppercase">— Loading</span>
              </div>
            ) : selected ? (
              <div className="px-6 py-8 space-y-6">
                {/* 모달 헤더 */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`mono text-[9px] font-bold tracking-[0.1em] px-2 py-0.5 rounded ${
                          selected.status === "통과"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {selected.status}
                      </span>
                      <span
                        className={`mono text-[9px] tracking-[0.06em] px-2 py-0.5 rounded ${
                          CATEGORY_COLORS[selected.category] ?? "bg-ink/10 text-dim"
                        }`}
                      >
                        {selected.category}
                      </span>
                      <span className="mono text-[10px] dim">{selected.date}</span>
                    </div>
                    <h2 className="text-[18px] font-semibold tracking-tight leading-snug">
                      {selected.seoTitle || selected.filename}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="shrink-0 p-1 text-dim hover:text-ink transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* SEO 정보 */}
                {(selected.metaDesc || selected.tags) && (
                  <div className="border hair p-4 space-y-2 bg-ink/[0.015]">
                    <div className="mono text-[9px] tracking-[0.18em] dim uppercase mb-3">SEO 정보</div>
                    {selected.metaDesc && (
                      <div>
                        <span className="mono text-[10px] dim">메타설명 </span>
                        <span className="text-[12px]">{selected.metaDesc}</span>
                      </div>
                    )}
                    {selected.tags && (
                      <div>
                        <span className="mono text-[10px] dim">태그 </span>
                        <span className="text-[12px]">{selected.tags}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 반려 이유 */}
                {selected.status === "반려" && selected.rejectionReason && (
                  <div className="border border-red-200 bg-red-50 p-4">
                    <div className="mono text-[9px] tracking-[0.18em] text-red-500 uppercase mb-1">반려 이유</div>
                    <p className="text-[13px] text-red-700">{selected.rejectionReason}</p>
                  </div>
                )}

                {/* 본문 */}
                {selected.finalContent && (
                  <div>
                    <div className="mono text-[9px] tracking-[0.18em] dim uppercase mb-3">본문</div>
                    <div className="prose prose-sm max-w-none text-[13px] leading-relaxed whitespace-pre-wrap border hair p-4 bg-ink/[0.015] font-mono">
                      {selected.finalContent}
                    </div>
                  </div>
                )}

                {/* 등록 버튼 */}
                {selected.status === "통과" && (
                  <div className="pt-2">
                    {publishedIds.has(selected.filename) ? (
                      <div className="mono text-[11px] dim tracking-[0.1em] text-center py-3 border hair">
                        블로그에 등록 완료 (임시저장)
                      </div>
                    ) : (
                      <button
                        onClick={handlePublish}
                        disabled={publishing}
                        className="w-full py-3 bg-edred text-white text-[13px] font-semibold tracking-tight hover:brightness-110 transition-all disabled:opacity-50"
                      >
                        {publishing ? "등록 중..." : "블로그에 등록 (임시저장)"}
                      </button>
                    )}
                  </div>
                )}

                {/* 파일명 */}
                <div className="mono text-[9px] dim pt-2">{selected.filename}</div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* 토스트 */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 text-[13px] font-medium shadow-lg ${
            toast.ok ? "bg-green-700 text-white" : "bg-red-700 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
