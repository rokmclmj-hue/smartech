"use client";

import { useState, useEffect, useCallback } from "react";

interface EmailTask {
  id: number;
  fromEmail: string;
  fromName: string | null;
  subject: string;
  bodyText: string;
  receivedAt: string;
  emailType: string;
  aiConfidence: number | null;
  parsedData: Record<string, unknown> | null;
  aiDraft: string | null;
  status: string;
  adminNote: string | null;
  approvedAt: string | null;
}

const TYPE_LABEL: Record<string, string> = {
  QUOTE_INQUIRY: "견적문의",
  ECOUNT_ORDER: "발주서",
  ECOUNT_PRICE_REQUEST: "단가요청",
  OTHER: "기타",
};

const TYPE_COLOR: Record<string, string> = {
  QUOTE_INQUIRY: "bg-smblue/10 text-smblue",
  ECOUNT_ORDER: "bg-edred/10 text-edred",
  ECOUNT_PRICE_REQUEST: "bg-amber-100 text-amber-700",
  OTHER: "bg-line text-dim",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "대기중",
  APPROVED: "발송완료",
  DONE: "처리완료",
  REJECTED: "반려",
  IGNORED: "무시",
};

export default function EmailInboxPage() {
  const [tasks, setTasks] = useState<EmailTask[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [selected, setSelected] = useState<EmailTask | null>(null);
  const [draft, setDraft] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [acting, setActing] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/email-inbox?status=${statusFilter}`);
    const data = await res.json();
    setTasks(data.tasks ?? []);
    setTotal(data.total ?? 0);
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  // 페이지 열릴 때 자동 동기화 (1회)
  useEffect(() => {
    fetch("/api/admin/email-inbox/sync", { method: "POST" })
      .then(r => r.json())
      .then(d => {
        if (d.created > 0) {
          setSyncMsg(`자동 동기화 — 새 이메일 ${d.created}건`);
          load();
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function selectTask(task: EmailTask) {
    setSelected(task);
    setDraft(task.aiDraft ?? "");
    setAdminNote(task.adminNote ?? "");

    // AI 분류 안 된 이메일이면 클릭 시 분류 요청
    if (!task.aiDraft && task.status === "PENDING") {
      setClassifying(true);
      try {
        const res = await fetch("/api/admin/email-inbox/classify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: task.id }),
        });
        const data = await res.json();
        if (data.task) {
          setSelected(data.task);
          setDraft(data.task.aiDraft ?? "");
          // 목록도 갱신
          setTasks((prev) =>
            prev.map((t) => (t.id === data.task.id ? data.task : t))
          );
        }
      } catch {
        // 분류 실패해도 이메일은 볼 수 있음
      } finally {
        setClassifying(false);
      }
    }
  }

  async function handleSync() {
    setSyncing(true);
    setSyncMsg("");
    try {
      const res = await fetch("/api/admin/email-inbox/sync", { method: "POST" });
      const data = await res.json();
      if (data.error) {
        setSyncMsg(`오류: ${data.error}`);
      } else {
        setSyncMsg(`완료 — 새 이메일 ${data.created}건, 건너뜀 ${data.skipped}건`);
        load();
      }
    } catch {
      setSyncMsg("네트워크 오류");
    } finally {
      setSyncing(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    if (!confirm("이 이메일을 삭제할까요? Gmail 휴지통으로 이동되며 30일 후 자동 삭제됩니다.")) return;
    setActing(true);
    try {
      const res = await fetch("/api/admin/email-inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, action: "delete" }),
      });
      const data = await res.json();
      if (data.ok) {
        setSelected(null);
        load();
      } else {
        alert(data.error ?? "삭제 실패");
      }
    } finally {
      setActing(false);
    }
  }

  async function handleAction(action: "approve" | "done" | "reject" | "ignore") {
    if (!selected) return;
    setActing(true);
    try {
      const res = await fetch("/api/admin/email-inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          action,
          finalDraft: draft,
          adminNote,
          replyTo: selected.fromEmail,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setSelected(null);
        load();
      } else {
        alert(data.error ?? "처리 실패");
      }
    } finally {
      setActing(false);
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
      {/* 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-ink">이메일 수신함</h1>
          <p className="text-[12px] text-dim mt-0.5">Gmail에서 수신된 견적문의 · 발주서를 AI가 분류합니다</p>
        </div>
        <div className="flex items-center gap-3">
          {syncMsg && (
            <span className="text-[12px] text-dim">{syncMsg}</span>
          )}
          <button
            onClick={async () => {
              setCleaning(true);
              const res = await fetch("/api/admin/email-inbox", { method: "DELETE" });
              const data = await res.json();
              setSyncMsg(`불필요한 메일 ${data.deleted}건 삭제됨`);
              setCleaning(false);
              load();
            }}
            disabled={cleaning}
            className="flex items-center gap-2 px-4 py-2 border border-line text-dim text-[13px] font-medium rounded-lg hover:border-ink/30 hover:text-ink disabled:opacity-50 transition-colors"
          >
            {cleaning ? "정리 중..." : "불필요 메일 정리"}
          </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-ink text-white text-[13px] font-medium rounded-lg hover:bg-ink/80 disabled:opacity-50 transition-colors"
          >
            <svg className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {syncing ? "동기화 중..." : "Gmail 동기화"}
          </button>
        </div>
      </div>

      {/* 상태 필터 */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {["PENDING", "APPROVED", "DONE", "REJECTED", "IGNORED", "ALL"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
              statusFilter === s
                ? "bg-ink text-white"
                : "bg-line text-dim hover:bg-ink/10"
            }`}
          >
            {s === "ALL" ? "전체" : STATUS_LABEL[s]}
            {s === statusFilter && total > 0 && (
              <span className="ml-1.5 bg-white/20 text-white rounded-full px-1.5 text-[10px]">{total}</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-5 min-h-[600px]">
        {/* 이메일 목록 */}
        <div className="w-full lg:w-[420px] shrink-0 space-y-2">
          {tasks.length === 0 && (
            <div className="py-16 text-center text-dim text-[13px]">
              {statusFilter === "PENDING" ? "대기 중인 이메일이 없습니다." : "이메일이 없습니다."}
            </div>
          )}
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => selectTask(task)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selected?.id === task.id
                  ? "border-ink bg-ink/5"
                  : "border-line hover:border-ink/30 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium tracking-wide ${TYPE_COLOR[task.emailType] ?? TYPE_COLOR.OTHER}`}>
                  {TYPE_LABEL[task.emailType] ?? "기타"}
                </span>
                <span className="text-[11px] text-dim shrink-0">
                  {new Date(task.receivedAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="text-[13px] font-medium text-ink truncate">{task.subject}</div>
              <div className="text-[11px] text-dim mt-0.5 truncate">
                {task.fromName ? `${task.fromName} <${task.fromEmail}>` : task.fromEmail}
              </div>
              {task.aiConfidence !== null && (
                <div className="text-[10px] text-dim mt-1">
                  AI 신뢰도 {task.aiConfidence}%
                </div>
              )}
            </button>
          ))}
        </div>

        {/* 상세 / 승인 패널 */}
        {selected ? (
          <div className="flex-1 min-w-0 bg-white rounded-2xl border border-line p-6 space-y-5">
            {/* 발신자 정보 */}
            <div>
              <div className="text-[11px] text-dim mb-1 uppercase tracking-widest">발신자</div>
              <div className="text-[14px] font-medium">{selected.fromName && `${selected.fromName} · `}{selected.fromEmail}</div>
              <div className="text-[12px] text-dim">{new Date(selected.receivedAt).toLocaleString("ko-KR")}</div>
            </div>

            {/* 제목 */}
            <div>
              <div className="text-[11px] text-dim mb-1 uppercase tracking-widest">제목</div>
              <div className="text-[15px] font-semibold text-ink">{selected.subject}</div>
            </div>

            {/* AI 파싱 결과 */}
            {selected.parsedData && Object.keys(selected.parsedData).length > 0 && (
              <div className="bg-paper rounded-xl p-4">
                <div className="text-[11px] text-dim mb-2 uppercase tracking-widest">AI 분석 결과</div>
                <div className="space-y-1 text-[12px]">
                  {selected.parsedData.company != null && (
                    <div><span className="text-dim">회사</span> {String(selected.parsedData.company)}</div>
                  )}
                  {selected.parsedData.contactName != null && (
                    <div><span className="text-dim">담당자</span> {String(selected.parsedData.contactName)}</div>
                  )}
                  {selected.parsedData.memo != null && (
                    <div><span className="text-dim">메모</span> {String(selected.parsedData.memo)}</div>
                  )}
                  {Array.isArray(selected.parsedData.items) && selected.parsedData.items.length > 0 && (
                    <div className="mt-2">
                      <div className="text-dim mb-1">품목</div>
                      {(selected.parsedData.items as Array<Record<string, unknown>>).map((item, i) => (
                        <div key={i} className="flex gap-2 text-[11px] py-0.5">
                          <span className="font-mono text-smblue">{String(item.partNo ?? "")}</span>
                          <span>{String(item.description ?? "")}</span>
                          <span className="text-dim">×{String(item.quantity ?? 1)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ECOUNT 발주서 안내 */}
            {selected.emailType === "ECOUNT_ORDER" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-[13px] text-amber-800">
                ECOUNT 발주서입니다. 아래 발주 내용은 수신 링크에서 직접 확인해 주세요.<br />
                확인 후 발주를 등록하려면 <a href="/admin/orders" className="underline">주문 관리</a>에서 진행해 주세요.
              </div>
            )}

            {/* AI 분류 중 */}
            {classifying && (
              <div className="flex items-center gap-2 py-3 px-4 bg-smblue/5 rounded-xl text-[13px] text-smblue">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                AI가 이메일을 분석하고 초안을 작성 중입니다...
              </div>
            )}

            {/* AI 초안 편집 */}
            {selected.status === "PENDING" && (selected.emailType === "QUOTE_INQUIRY" || selected.emailType === "ECOUNT_PRICE_REQUEST" || selected.emailType === "ECOUNT_ORDER") && (
              <div>
                <div className="text-[11px] text-dim mb-2 uppercase tracking-widest">
                  AI 초안 답변 <span className="normal-case text-smblue">(수정 후 승인)</span>
                </div>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={10}
                  className="w-full border border-line rounded-xl px-4 py-3 text-[13px] font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-ink/20 resize-y"
                  placeholder="답변 내용을 입력하세요..."
                />
              </div>
            )}

            {/* 관리자 메모 */}
            {selected.status === "PENDING" && (
              <div>
                <div className="text-[11px] text-dim mb-2 uppercase tracking-widest">관리자 메모 (선택)</div>
                <input
                  type="text"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full border border-line rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ink/20"
                  placeholder="내부 메모..."
                />
              </div>
            )}

            {/* 액션 버튼 */}
            {selected.status === "PENDING" && (
              <div className="flex gap-3 pt-2 flex-wrap">
                <button
                  onClick={() => handleAction("approve")}
                  disabled={acting}
                  className="flex-1 py-3 bg-ink text-white text-[14px] font-semibold rounded-xl hover:bg-ink/80 disabled:opacity-50 transition-colors"
                >
                  {acting ? "처리 중..." : "승인 · 발송"}
                </button>
                <button
                  onClick={() => handleAction("done")}
                  disabled={acting}
                  className="px-5 py-3 bg-green-600 text-white text-[13px] font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
                  title="시스템 밖에서 이미 처리된 경우"
                >
                  처리완료
                </button>
                <button
                  onClick={() => handleAction("ignore")}
                  disabled={acting}
                  className="px-5 py-3 border border-line text-dim text-[13px] rounded-xl hover:border-ink/30 hover:text-ink transition-colors"
                >
                  무시
                </button>
                <button
                  onClick={() => handleAction("reject")}
                  disabled={acting}
                  className="px-5 py-3 border border-edred/30 text-edred text-[13px] rounded-xl hover:bg-edred/5 transition-colors"
                >
                  반려
                </button>
                <button
                  onClick={handleDelete}
                  disabled={acting}
                  className="px-5 py-3 bg-edred text-white text-[13px] rounded-xl hover:bg-edred3 disabled:opacity-50 transition-colors"
                  title="Gmail 휴지통으로 이동"
                >
                  삭제
                </button>
              </div>
            )}

            {/* 처리 완료 표시 + 삭제 버튼 */}
            {selected.status !== "PENDING" && (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 py-3 px-4 bg-paper rounded-xl text-[13px] text-dim flex-1">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  {STATUS_LABEL[selected.status]} {selected.approvedAt && `· ${new Date(selected.approvedAt).toLocaleString("ko-KR")}`}
                </div>
                <button
                  onClick={handleDelete}
                  disabled={acting}
                  className="px-4 py-3 bg-edred text-white text-[13px] rounded-xl hover:bg-edred3 disabled:opacity-50 transition-colors shrink-0"
                  title="Gmail 휴지통으로 이동"
                >
                  삭제
                </button>
              </div>
            )}

            {/* 원본 이메일 본문 */}
            <details className="group">
              <summary className="text-[11px] text-dim uppercase tracking-widest cursor-pointer hover:text-ink">
                원본 이메일 보기
              </summary>
              <pre className="mt-3 text-[11px] text-dim bg-paper rounded-xl p-4 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {selected.bodyText}
              </pre>
            </details>
          </div>
        ) : (
          <div className="flex-1 hidden lg:flex items-center justify-center text-dim text-[13px]">
            왼쪽에서 이메일을 선택하세요
          </div>
        )}
      </div>
    </div>
  );
}
