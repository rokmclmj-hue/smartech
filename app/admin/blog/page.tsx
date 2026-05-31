"use client";

import { useEffect, useState, useCallback } from "react";

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
  // 사진 관련
  const [postPhotos, setPostPhotos] = useState<string[]>([]); // 현재 글에 선택된 사진 (최대 3장)
  const [usedPhotos, setUsedPhotos] = useState<string[]>([]);  // 다른 글에서 이미 사용된 사진
  const [folderFiles, setFolderFiles] = useState<string[]>([]);
  const [photoPickSlot, setPhotoPickSlot] = useState<number | null>(null);
  const [savingPhotos, setSavingPhotos] = useState(false);
  const [savingToDesktop, setSavingToDesktop] = useState(false);

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
      // 사진 초기화
      try { setPostPhotos(data.photos ? JSON.parse(data.photos) : []); } catch { setPostPhotos([]); }
      setPhotoPickSlot(null);
      setFolderFiles([]);
      // 다른 글에서 사용된 사진 로드
      fetch("/api/admin/photos?used=1").then(r => r.json()).then(d => setUsedPhotos(d.used || []));
    } finally {
      setDetailLoading(false);
    }
  };

  // 사진 저장
  const savePhotos = async () => {
    if (!selected) return;
    setSavingPhotos(true);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, photos: JSON.stringify(postPhotos) }),
      });
      if (res.ok) showToast("사진 저장 완료", true);
      else showToast("사진 저장 실패", false);
    } finally { setSavingPhotos(false); }
  };

  const saveToDesktop = async (photoPath: string) => {
    setSavingToDesktop(true);
    try {
      const res = await fetch("/api/admin/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoPath }),
      });
      const data = await res.json();
      if (res.ok) showToast(`바탕화면 네이버_사진 폴더에 저장됨 (${data.fileName})`, true);
      else showToast("저장 실패", false);
    } finally { setSavingToDesktop(false); }
  };

  const loadFolderPhotos = async (folder: string) => {
    const res = await fetch(`/api/admin/photos?folder=${encodeURIComponent(folder)}`);
    const data = await res.json();
    setFolderFiles(data.files || []);
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
    const text = selected.content
      .replace(/!\[.*?\]\(.*?\)/g, "\n[📷 사진 삽입 위치]\n")
      .replace(/<figure[\s\S]*?<\/figure>/gi, "\n[📷 사진 삽입 위치]\n")
      .replace(/<img[^>]*>/gi, "\n[📷 사진 삽입 위치]\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    navigator.clipboard.writeText(text).then(() => showToast("네이버용 텍스트 복사 완료 (사진 위치 표시됨)", true));
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

                {/* ── 사진 관리 패널 ── */}
                <div className="border hair p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="mono text-[9px] tracking-[0.18em] dim uppercase">현장 사진 (네이버 배치: 상단·중간·하단)</span>
                    <button
                      onClick={savePhotos}
                      disabled={savingPhotos}
                      className="mono text-[9px] tracking-[0.1em] uppercase border hair text-dim px-3 py-1 hover:border-edred hover:text-edred transition-colors disabled:opacity-40"
                    >
                      {savingPhotos ? "저장 중..." : "사진 저장"}
                    </button>
                  </div>

                  {/* 네이버용 사진 바탕화면 저장 */}
                  {postPhotos.filter(Boolean).length > 0 && (
                    <div className="bg-[#F6F4EF] border hair px-3 py-2 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-medium">네이버 업로드용 사진 저장</div>
                        <div className="text-[10px] dim">바탕화면 &gt; 네이버_사진 폴더에 저장됩니다</div>
                      </div>
                      <div className="flex gap-1.5">
                        {postPhotos.filter(Boolean).map((rel, i) => (
                          <button key={i} onClick={() => saveToDesktop(rel)}
                            disabled={savingToDesktop}
                            className="text-[10px] border hair px-2.5 py-1.5 hover:border-ink hover:bg-ink hover:text-paper transition-all disabled:opacity-40">
                            {i === 0 ? "상단" : i === 1 ? "중간" : "하단"} 저장
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3장 슬롯 */}
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((slot) => {
                      const label = slot === 0 ? "상단" : slot === 1 ? "중간" : "하단";
                      const rel = postPhotos[slot];
                      return (
                        <div key={slot} className="space-y-1">
                          <div className="mono text-[8px] dim uppercase">{label}</div>
                          {rel ? (
                            <div className="relative group">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={`/api/admin/photos?serve=${encodeURIComponent(rel)}`} alt={label}
                                className="w-full aspect-video object-cover border hair" />
                              <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                <button onClick={() => { setPhotoPickSlot(slot); loadFolderPhotos("01_장비외관"); }}
                                  className="text-[9px] bg-paper text-ink px-1.5 py-0.5">변경</button>
                                <button onClick={() => setPostPhotos(p => { const n = [...p]; n[slot] = ""; return n.filter(Boolean); })}
                                  className="text-[9px] bg-red-600 text-paper px-1.5 py-0.5">삭제</button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setPhotoPickSlot(slot); loadFolderPhotos("01_장비외관"); }}
                              className="w-full aspect-video border border-dashed hair flex items-center justify-center text-[10px] dim hover:border-ink transition-colors"
                            >+ 선택</button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* 폴더 브라우저 */}
                  {photoPickSlot !== null && (
                    <div className="border hair p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="mono text-[9px] dim">{photoPickSlot === 0 ? "상단" : photoPickSlot === 1 ? "중간" : "하단"} 사진 선택</span>
                        <button onClick={() => setPhotoPickSlot(null)} className="text-[10px] dim hover:text-ink">✕</button>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {["01_장비외관","02_납품출고","03_현장설치","04_수리정비","05_알람고장","06_비교도식","07_기타"].map(f => (
                          <button key={f} onClick={() => loadFolderPhotos(f)}
                            className="text-[9px] border hair px-1.5 py-0.5 dim hover:border-ink hover:text-ink transition-colors">
                            {f}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-5 gap-1 max-h-40 overflow-y-auto">
                        {folderFiles.map(rel => {
                          const alreadyUsed = usedPhotos.includes(rel);
                          return (
                            <button key={rel}
                              onClick={() => {
                                if (alreadyUsed) return;
                                setPostPhotos(p => { const n = [...p]; n[photoPickSlot] = rel; return n; });
                                setPhotoPickSlot(null);
                              }}
                              className={`relative group border hair overflow-hidden transition-colors ${alreadyUsed ? "opacity-30 cursor-not-allowed" : "hover:border-ink"}`}
                              title={alreadyUsed ? "다른 글에서 이미 사용된 사진" : rel}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={`/api/admin/photos?serve=${encodeURIComponent(rel)}`} alt=""
                                className="w-full aspect-square object-cover" />
                              {alreadyUsed && (
                                <div className="absolute inset-0 bg-ink/60 flex items-center justify-center">
                                  <span className="text-paper text-[7px]">사용됨</span>
                                </div>
                              )}
                              {!alreadyUsed && (
                                <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="text-paper text-[9px]">선택</span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

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
