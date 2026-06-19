"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { sendChatEmail } from "@/lib/chatEmailAction";

type Message = { role: "user" | "assistant"; content: string };

const QUICK_SELECTS = [
  { label: "펌프에 문제가 생겼어요", sub: "수리 접수 · 고장 진단 · A/S" },
  { label: "펌프·부품을 구매하고 싶어요", sub: "모델 추천 · 견적 · OEM 부품" },
  { label: "기술 자료가 필요해요", sub: "스펙 · 매뉴얼 · 압력 범위" },
  { label: "기타 문의", sub: "직접 입력하기" },
];

function buildGreeting(user?: { name?: string; title?: string }): string {
  if (!user?.name) {
    return `안녕하세요, 스마텍입니다.\nEdwards Vacuum 공식 기술지원\n\n무엇을 도와드릴까요?`;
  }
  const name = user.name || "";
  const title = user.title || "";
  const salutation = title ? `${name} ${title}님` : `${name}님`;
  return `${salutation}, 안녕하세요!\n스마텍 AI 상담원입니다.\n가격·납기·기술 상담까지 무엇이든 편하게 물어보세요.`;
}

const TIER_LABEL: Record<string, string> = {
  DEALER: "딜러",
  KEY_DEALER: "키딜러",
  VIP_DEALER: "VIP딜러",
  OEM: "OEM",
  ENDUSER: "고객",
  ADMIN: "관리자",
  PENDING: "회원",
};
void TIER_LABEL;

export default function FloatingChat() {
  const { data: session, status } = useSession();
  const user = session?.user as { id?: string; name?: string; title?: string; tier?: string; company?: string; email?: string } | undefined;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [pendingEmail, setPendingEmail] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipShownRef = useRef(false);
  const logRef = useRef<HTMLDivElement>(null);

  // 스크롤 30% 이상 → 툴팁 1회 표시 (로그인 여부 무관)
  useEffect(() => {
    const onScroll = () => {
      if (tooltipShownRef.current || isOpen) return;
      const total = document.body.scrollHeight - window.innerHeight;
      if (total > 0 && window.scrollY / total > 0.3) {
        tooltipShownRef.current = true;
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 3000);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isOpen]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages]);

  const close = useCallback(() => setIsOpen(false), []);

  const open = useCallback(() => {
    setShowTooltip(false);
    if (messages.length === 0) {
      setMessages([{ role: "assistant", content: buildGreeting(user ?? undefined) }]);
    }
    setIsOpen(true);
  }, [messages.length, user]);

  async function send(q?: string) {
    const text = (q ?? input).trim();
    if (!text || loading) return;
    const userMsg: Message = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setPendingEmail(false);
    setEmailSent(false);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          userId: user?.id,
          tier: user?.tier,
          company: user?.company,
          userName: user?.name,
          userEmail: user?.email,
        }),
      });

      if (!res.body) { setLoading(false); return; }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value);
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: acc };
          return next;
        });
      }

      if (acc.includes("[[SEND_EMAIL]]")) {
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: "assistant",
            content: acc.replace("[[SEND_EMAIL]]", "").trim(),
          };
          return next;
        });
        setPendingEmail(true);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "연결 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendEmail() {
    if (!user?.email || sendingEmail) return;
    setSendingEmail(true);
    try {
      const chatText = messages
        .map((m) => `[${m.role === "user" ? "고객" : "AI"}] ${m.content}`)
        .join("\n\n");
      await sendChatEmail({
        to: user.email,
        company: user.company || user.name || "",
        chatText,
      });
      setEmailSent(true);
      setPendingEmail(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `${user.email}로 상담 내용을 전송했습니다. 추가 문의 사항이 있으시면 언제든 연락 주세요.`,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "이메일 발송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      ]);
    } finally {
      setSendingEmail(false);
    }
  }

  // ADMIN만 숨김 (비로그인 포함 모든 방문자에게 표시)
  const tier = user?.tier ?? "";
  if (status === "authenticated" && tier === "ADMIN") return null;

  return (
    <>
      {/* ── 툴팁 ── */}
      {showTooltip && !isOpen && (
        <div className="fixed bottom-24 right-6 z-50 pointer-events-none">
          <div className="bg-ink text-paper text-[12px] px-3 py-2 shadow-lg whitespace-nowrap rounded-sm animate-fade-in">
            견적 문의하기 →
          </div>
          <div className="absolute bottom-[-4px] right-5 w-2 h-2 bg-ink rotate-45" />
        </div>
      )}

      {/* ── 플로팅 버튼 ── */}
      {!isOpen && (
        <button
          onClick={open}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-edred text-white rounded-full shadow-lg flex items-center justify-center hover:bg-edred3 transition-colors"
          aria-label="AI 상담 열기"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
        </button>
      )}

      {/* ── 챗봇 패널 ── */}
      {isOpen && (
        <div
          className="fixed z-50 bg-white border hair shadow-2xl flex flex-col
            bottom-0 right-0 w-full h-svh
            sm:bottom-6 sm:right-6 sm:w-[380px] sm:max-w-[calc(100vw-24px)] sm:h-auto sm:max-h-[calc(100vh-80px)]"
        >
          {/* 헤더 */}
          <div className="px-4 py-3 border-b hair flex items-center justify-between bg-ink text-paper text-[12px] mono shrink-0"
            style={{ maxHeight: "calc(100vh - 0px)" }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full inline-block" />
              <span>AI 상담 · {user?.company || user?.name || "스마텍"}</span>
            </div>
            <button
              onClick={close}
              className="opacity-60 hover:opacity-100 transition-opacity text-[20px] leading-none px-1"
              aria-label="닫기"
            >
              ×
            </button>
          </div>

          {/* 대화 로그 */}
          <div
            ref={logRef}
            className="flex-1 p-4 space-y-3 overflow-y-auto text-[13px]"
          >
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 leading-[1.65] whitespace-pre-wrap text-[13px] ${
                    m.role === "user" ? "bg-ink text-paper" : "bg-[#F1EDE4] text-ink"
                  }`}
                >
                  {m.content || <span className="animate-pulse">●</span>}
                </div>
              </div>
            ))}

            {/* 빠른 선택 버튼 — 인사말 직후 표시 */}
            {messages.length === 1 && messages[0].role === "assistant" && !loading && (
              <div className="space-y-1.5 mt-1">
                {QUICK_SELECTS.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => send(q.label)}
                    className="w-full text-left px-3 py-2.5 border border-line hover:border-ink hover:bg-[#F8F6F2] transition-colors"
                  >
                    <div className="text-[13px] text-ink font-medium">{q.label}</div>
                    <div className="text-[11px] text-dim mt-0.5">{q.sub}</div>
                  </button>
                ))}
              </div>
            )}

            {loading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div className="px-3 py-2 bg-[#F1EDE4] mono text-[11px]">● ● ●</div>
              </div>
            )}
          </div>

          {/* 이메일 발송 확인 배너 */}
          {pendingEmail && user?.email && (
            <div className="px-4 py-3 border-t hair bg-[#FFF8F0] flex items-center justify-between gap-2 shrink-0">
              <span className="text-[12px] text-[#6A6660]">
                {user.email}로 견적 내용을 보낼까요?
              </span>
              <button
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="bg-edred text-white px-3 py-1.5 text-[12px] hover:bg-edred3 transition-colors disabled:opacity-50 shrink-0"
              >
                {sendingEmail ? "발송 중..." : "이메일 발송 →"}
              </button>
            </div>
          )}

          {pendingEmail && !user?.email && (
            <div className="px-4 py-2 border-t hair bg-[#FFF8F0] text-[12px] text-edred shrink-0">
              등록된 이메일이 없습니다. 마이페이지에서 이메일을 등록해 주세요.
            </div>
          )}

          {/* 입력창 */}
          <div className="p-2 border-t hair flex gap-2 shrink-0">
            <input
              className="flex-1 bg-[#F8F6F2] px-3 py-2 text-[13px] outline-none placeholder:text-[#9a958d]"
              placeholder="메시지를 입력하세요..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              disabled={loading}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="bg-ink text-paper px-4 text-[12px] disabled:opacity-40 hover:bg-edred transition-colors"
            >
              전송
            </button>
          </div>
        </div>
      )}
    </>
  );
}
