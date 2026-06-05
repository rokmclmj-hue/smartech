"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { sendChatEmail } from "@/lib/chatEmailAction";

type Message = { role: "user" | "assistant"; content: string };

function buildGreeting(user: any): string {
  const name = user.name || "";
  const title = user.title || "";
  // "홍길동 차장님" 또는 "홍길동님"
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

export default function FloatingChat() {
  const { data: session, status } = useSession();
  const user = session?.user as any;

  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // 구석 버튼 표시 여부
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [pendingEmail, setPendingEmail] = useState(false); // [[SEND_EMAIL]] 감지
  const logRef = useRef<HTMLDivElement>(null);

  // 로그인 시 자동 팝업 (세션당 1회)
  useEffect(() => {
    if (status !== "authenticated" || !user?.id) return;
    const tier = user.tier ?? "";
    if (tier === "PENDING" || tier === "ADMIN") return;

    const key = `chat_opened_${user.id}`;
    const alreadyOpened = sessionStorage.getItem(key);
    if (!alreadyOpened) {
      const greeting = buildGreeting(user);
      setMessages([
        {
          role: "assistant",
          content: greeting,
        },
      ]);
      setIsOpen(true);
      setIsVisible(true);
      sessionStorage.setItem(key, "1");
    } else {
      // 이미 열었던 세션 → 구석 버튼만 표시
      setIsVisible(true);
    }
  }, [status, user?.id]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const open = useCallback(() => {
    if (messages.length === 0 && user) {
      setMessages([{ role: "assistant", content: buildGreeting(user) }]);
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

      // 이메일 발송 마커 감지
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

  // 로그인 안 했거나 PENDING/ADMIN이면 렌더 안 함
  if (status !== "authenticated" || !user?.id) return null;
  const tier = user.tier ?? "";
  if (tier === "ADMIN" || !isVisible) return null;

  return (
    <>
      {/* ── 구석 버튼 (팝업 닫혀 있을 때) ── */}
      {!isOpen && (
        <button
          onClick={open}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-edred text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#a00018] transition-colors"
          aria-label="AI 상담 열기"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
        </button>
      )}

      {/* ── 팝업 챗봇 ── */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-24px)] bg-white border hair shadow-2xl flex flex-col"
          style={{ maxHeight: "calc(100vh - 48px)" }}>

          {/* 헤더 */}
          <div className="px-4 py-3 border-b hair flex items-center justify-between bg-ink text-paper text-[12px] mono shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full inline-block" />
              <span>AI 상담 · {user.company || user.name}</span>
            </div>
            <button
              onClick={close}
              className="opacity-60 hover:opacity-100 transition-opacity text-[16px] leading-none"
              aria-label="닫기"
            >
              ×
            </button>
          </div>

          {/* 대화 로그 */}
          <div
            ref={logRef}
            className="flex-1 p-4 space-y-3 overflow-y-auto text-[13px]"
            style={{ minHeight: 240, maxHeight: 400 }}
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
                className="bg-edred text-white px-3 py-1.5 text-[12px] hover:bg-[#a00018] transition-colors disabled:opacity-50 shrink-0"
              >
                {sendingEmail ? "발송 중..." : "이메일 발송 →"}
              </button>
            </div>
          )}

          {/* 이메일 없는 경우 경고 */}
          {pendingEmail && !user?.email && (
            <div className="px-4 py-2 border-t hair bg-[#FFF8F0] text-[12px] text-[#c00020] shrink-0">
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
