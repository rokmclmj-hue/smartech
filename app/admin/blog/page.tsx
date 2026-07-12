"use client";

import { useEffect, useState, useCallback } from "react";

type BlogStats = {
  published: number;
  draft: number;
  faqCount: number;
  daysSince: number | null;
  byCat: { category: string; _count: number }[];
};

function StatsBar() {
  const [stats, setStats] = useState<BlogStats | null>(null);
  useEffect(() => {
    fetch("/api/admin/blog/stats").then(r => r.json()).then(setStats);
  }, []);
  if (!stats) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div className="border hair bg-paper px-4 py-3">
        <div className="mono text-[9px] tracking-[0.14em] dim uppercase mb-1">발행됨</div>
        <div className="text-[24px] font-semibold tracking-tight">{stats.published}</div>
      </div>
      <div className="border hair bg-paper px-4 py-3">
        <div className="mono text-[9px] tracking-[0.14em] dim uppercase mb-1">임시저장</div>
        <div className="text-[24px] font-semibold tracking-tight">{stats.draft}</div>
      </div>
      <div className="border hair bg-paper px-4 py-3">
        <div className="mono text-[9px] tracking-[0.14em] dim uppercase mb-1">FAQ 적용</div>
        <div className="text-[24px] font-semibold tracking-tight">
          {stats.faqCount}
          <span className="text-[14px] dim font-normal ml-1">/ {stats.published}</span>
        </div>
      </div>
      <div className="border hair bg-paper px-4 py-3">
        <div className="mono text-[9px] tracking-[0.14em] dim uppercase mb-1">마지막 발행</div>
        <div className="text-[24px] font-semibold tracking-tight">
          {stats.daysSince === 0 ? "오늘" : stats.daysSince === null ? "—" : `${stats.daysSince}일 전`}
        </div>
      </div>
      {stats.byCat.length > 0 && (
        <div className="col-span-2 md:col-span-4 border hair bg-paper px-4 py-3">
          <div className="mono text-[9px] tracking-[0.14em] dim uppercase mb-2">카테고리별</div>
          <div className="flex flex-wrap gap-3">
            {stats.byCat.sort((a, b) => b._count - a._count).map(c => (
              <div key={c.category} className="flex items-center gap-2">
                <span className="text-[13px] font-medium">{c.category}</span>
                <span className="mono text-[11px] dim">{c._count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type Post = {
  id: number;
  title: string;
  category: string;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  sourceFile: string | null;
};

type PostDetail = Post & {
  content: string;
  naverContent: string;
  metaDesc: string;
  tags: string;
  photos: string | null;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT:     { label: "임시저장", color: "bg-yellow-100 text-yellow-700" },
  PUBLISHED: { label: "발행됨",   color: "bg-green-100 text-green-700" },
  ARCHIVED:  { label: "보관됨",   color: "bg-ink/10 text-dim" },
};

function formatDate(s: string) {
  const d = new Date(s);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<"ALL" | "DRAFT" | "PUBLISHED" | "ARCHIVED">("ALL");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PostDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editMeta, setEditMeta] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = filter === "ALL" ? "" : `?status=${filter}`;
      const res = await fetch(`/api/admin/blog${q}`);
      const data = await res.json();
      setPosts(data.posts ?? []);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (id: number) => {
    setDetailLoading(true);
    setSelected(null);
    setEditMode(false);
    try {
      const res = await fetch(`/api/admin/blog?id=${id}`);
      const data = await res.json();
      setSelected(data);
      setEditTitle(data.title);
      setEditContent(data.content);
      setEditMeta(data.metaDesc);
      setEditTags(data.tags);
      setEditCategory(data.category);
    } finally {
      setDetailLoading(false);
    }
  };


  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          title: editTitle,
          content: editContent,
          metaDesc: editMeta,
          tags: editTags,
          category: editCategory,
        }),
      });
      if (res.ok) {
        showToast("저장되었습니다", true);
        setEditMode(false);
        setSelected({ ...selected, title: editTitle, content: editContent, metaDesc: editMeta, tags: editTags, category: editCategory });
        load();
      } else {
        showToast("저장 실패", false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (status: string) => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, status }),
      });
      if (res.ok) {
        showToast(status === "PUBLISHED" ? "발행되었습니다" : status === "DRAFT" ? "임시저장으로 변경" : "보관됨", true);
        setSelected({ ...selected, status });
        load();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected || !confirm("이 글을 삭제하시겠습니까?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/blog?id=${selected.id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("삭제되었습니다", true);
        setSelected(null);
        load();
      }
    } finally {
      setDeleting(false);
    }
  };

  const copyForNaver = () => {
    if (!selected) return;
    const source = selected.naverContent || selected.content;
    let imgCount = 0;
    const text = source
      // frontmatter 제거
      .replace(/^---[\s\S]*?---\s*/m, "")
      // HTML 주석 제거
      .replace(/<!--[\s\S]*?-->/g, "")
      // 첫 번째 이미지(썸네일)는 "사진" 번호에서 제외 — 본문 이미지(사진1.png, 사진2.png...)와 번호를 맞추기 위함
      .replace(/\[IMAGE:\s*([^\]]*)\]/, (_, desc) => `\n\n[🖼 썸네일 — ${desc.trim() || "대표 이미지"}]\n\n`)
      .replace(/!\[([^\]]*)\]\([^)]*\)/, (_, alt) => `\n\n[🖼 썸네일 — ${alt && alt.trim() ? alt.trim() : "대표 이미지"}]\n\n`)
      // [IMAGE: 설명] 마커 → 📷 사진 안내
      .replace(/\[IMAGE:\s*([^\]]*)\]/g, (_, desc) => {
        imgCount++;
        const label = desc.trim() || `이미지 ${imgCount}`;
        return `\n\n[📷 사진 ${imgCount}번 — ${label}]\n\n`;
      })
      // 마크다운 이미지 ![alt](url) → 📷 사진 안내
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, (_, alt) => {
        imgCount++;
        const label = alt && alt.trim() ? alt.trim() : `이미지 ${imgCount}`;
        return `\n\n[📷 사진 ${imgCount}번 — ${label}]\n\n`;
      })
      // HTML 이미지·figure
      .replace(/<figure[\s\S]*?<\/figure>/gi, () => { imgCount++; return `\n\n[📷 사진 ${imgCount}번]\n\n`; })
      .replace(/<img[^>]*alt="([^"]*)"[^>]*>/gi, (_, alt) => { imgCount++; const label = alt && alt.trim() ? alt.trim() : `이미지 ${imgCount}`; return `\n\n[📷 사진 ${imgCount}번 — ${label}]\n\n`; })
      // 제목 기호 제거 (# ## ###) — 텍스트만 남김
      .replace(/^#{1,6}\s+/gm, "")
      // 굵게·기울임 기호 제거
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      // 구분선 제거
      .replace(/^---+$/gm, "")
      // 3줄 이상 빈 줄 → 2줄로
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    const label = selected.naverContent ? "네이버 전용 버전" : "홈페이지 버전 (naver.md 없음)";
    navigator.clipboard.writeText(text).then(() => showToast(`네이버용 텍스트 복사 완료 — ${label} (사진 ${imgCount}장)`, true));
  };

  const filtered = posts;
  const counts = {
    ALL: posts.length,
    DRAFT: posts.filter((p) => p.status === "DRAFT").length,
    PUBLISHED: posts.filter((p) => p.status === "PUBLISHED").length,
    ARCHIVED: posts.filter((p) => p.status === "ARCHIVED").length,
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
      {/* 헤더 */}
      <div className="flex items-baseline gap-4 mb-6">
        <h1 className="display text-[28px] md:text-[32px] tracking-[-0.03em]">블로그</h1>
        <span className="mono text-[10px] tracking-[0.18em] dim uppercase">Content</span>
      </div>

      {/* 통계 */}
      <StatsBar />

      {/* 필터 탭 */}
      <div className="flex items-center gap-1 mb-6 border-b hair">
        {(["ALL", "DRAFT", "PUBLISHED", "ARCHIVED"] as const).map((tab) => {
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
      ) : filtered.length === 0 ? (
        <div className="mono text-[11px] dim tracking-[0.12em] uppercase py-16 text-center">— 글 없음</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((post) => {
            const s = STATUS_LABELS[post.status] ?? { label: post.status, color: "bg-ink/10 text-dim" };
            return (
              <button
                key={post.id}
                onClick={() => openDetail(post.id)}
                className="w-full text-left border hair px-5 py-4 hover:border-ink/30 hover:bg-ink/[0.02] transition-colors group"
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <span className={`shrink-0 mt-0.5 mono text-[9px] font-bold tracking-[0.1em] px-2 py-0.5 rounded ${s.color}`}>
                    {s.label}
                  </span>
                  <span className="shrink-0 mt-0.5 mono text-[9px] tracking-[0.06em] bg-ink/10 text-dim px-2 py-0.5 rounded">
                    {post.category}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium tracking-tight truncate group-hover:text-edred transition-colors">
                      {post.title}
                    </div>
                    {post.sourceFile && (
                      <div className="mono text-[9px] dim mt-0.5 truncate">AI 생성</div>
                    )}
                  </div>
                  <span className="shrink-0 mono text-[10px] dim mt-0.5">{formatDate(post.createdAt)}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 상세 패널 */}
      {(selected || detailLoading) && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-end bg-ink/20"
          onClick={() => { if (!detailLoading) { setSelected(null); setEditMode(false); } }}
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
              <div className="px-6 py-8 space-y-5">
                {/* 헤더 */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`mono text-[9px] font-bold tracking-[0.1em] px-2 py-0.5 rounded ${STATUS_LABELS[selected.status]?.color ?? "bg-ink/10 text-dim"}`}>
                        {STATUS_LABELS[selected.status]?.label ?? selected.status}
                      </span>
                      <span className="mono text-[9px] tracking-[0.06em] bg-ink/10 text-dim px-2 py-0.5 rounded">{selected.category}</span>
                      <span className="mono text-[10px] dim">{formatDate(selected.createdAt)}</span>
                    </div>
                    {!editMode ? (
                      <h2 className="text-[18px] font-semibold tracking-tight leading-snug">{selected.title}</h2>
                    ) : (
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full text-[15px] font-semibold border hair px-3 py-2 bg-transparent focus:outline-none focus:border-ink"
                      />
                    )}
                  </div>
                  <button onClick={() => { setSelected(null); setEditMode(false); }} className="shrink-0 p-1 text-dim hover:text-ink">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* 발행 상태 버튼들 */}
                <div className="flex gap-2 flex-wrap">
                  {selected.status !== "PUBLISHED" && (
                    <button
                      onClick={() => handleStatus("PUBLISHED")}
                      disabled={saving}
                      className="mono text-[10px] tracking-[0.1em] uppercase bg-edred text-white px-4 py-2 hover:brightness-110 transition-all disabled:opacity-50"
                    >
                      발행
                    </button>
                  )}
                  {selected.status === "PUBLISHED" && (
                    <button
                      onClick={() => handleStatus("DRAFT")}
                      disabled={saving}
                      className="mono text-[10px] tracking-[0.1em] uppercase border hair text-dim px-4 py-2 hover:border-ink hover:text-ink transition-colors disabled:opacity-50"
                    >
                      발행 취소
                    </button>
                  )}
                  {selected.status !== "ARCHIVED" && (
                    <button
                      onClick={() => handleStatus("ARCHIVED")}
                      disabled={saving}
                      className="mono text-[10px] tracking-[0.1em] uppercase border hair text-dim px-4 py-2 hover:border-ink hover:text-ink transition-colors disabled:opacity-50"
                    >
                      보관
                    </button>
                  )}
                  <button
                    onClick={() => setEditMode((v) => !v)}
                    className="mono text-[10px] tracking-[0.1em] uppercase border hair text-dim px-4 py-2 hover:border-ink hover:text-ink transition-colors"
                  >
                    {editMode ? "취소" : "편집"}
                  </button>
                  <button
                    onClick={copyForNaver}
                    className="mono text-[10px] tracking-[0.1em] uppercase border hair text-dim px-4 py-2 hover:border-green-600 hover:text-green-700 transition-colors"
                  >
                    네이버 복사
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="ml-auto mono text-[10px] tracking-[0.1em] uppercase border border-red-200 text-red-500 px-4 py-2 hover:border-red-500 transition-colors disabled:opacity-50"
                  >
                    삭제
                  </button>
                </div>

                {/* SEO */}
                <div className="border hair p-4 space-y-3 bg-ink/[0.015]">
                  <div className="mono text-[9px] tracking-[0.18em] dim uppercase">SEO 정보</div>
                  <div className="space-y-2">
                    <div>
                      <div className="mono text-[9px] dim mb-1">카테고리</div>
                      {editMode ? (
                        <input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full text-[13px] border hair px-2 py-1.5 bg-transparent focus:outline-none focus:border-ink" />
                      ) : (
                        <div className="text-[13px]">{selected.category}</div>
                      )}
                    </div>
                    <div>
                      <div className="mono text-[9px] dim mb-1">메타설명</div>
                      {editMode ? (
                        <textarea value={editMeta} onChange={(e) => setEditMeta(e.target.value)} rows={2} className="w-full text-[13px] border hair px-2 py-1.5 bg-transparent focus:outline-none focus:border-ink resize-none" />
                      ) : (
                        <div className="text-[13px]">{selected.metaDesc || "—"}</div>
                      )}
                    </div>
                    <div>
                      <div className="mono text-[9px] dim mb-1">태그</div>
                      {editMode ? (
                        <input value={editTags} onChange={(e) => setEditTags(e.target.value)} className="w-full text-[13px] border hair px-2 py-1.5 bg-transparent focus:outline-none focus:border-ink" />
                      ) : (
                        <div className="text-[13px]">{selected.tags || "—"}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 본문 */}
                <div>
                  <div className="mono text-[9px] tracking-[0.18em] dim uppercase mb-2">본문</div>
                  {editMode ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={20}
                      className="w-full text-[12px] font-mono border hair px-3 py-2.5 bg-transparent focus:outline-none focus:border-ink resize-y"
                    />
                  ) : (
                    <div className="text-[13px] leading-relaxed whitespace-pre-wrap border hair p-4 bg-ink/[0.015] font-mono">
                      {selected.content}
                    </div>
                  )}
                </div>

                {/* 저장 버튼 */}
                {editMode && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-3 bg-edred text-white text-[13px] font-semibold tracking-tight hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    {saving ? "저장 중..." : "저장"}
                  </button>
                )}

                {selected.sourceFile && (
                  <div className="mono text-[9px] dim pt-1">원본: {selected.sourceFile}</div>
                )}

              </div>
            ) : null}
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
