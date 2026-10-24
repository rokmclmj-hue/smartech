"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { sendChatEmail } from "@/lib/chatEmailAction";
import { trackEvent } from "@/lib/analytics";

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

// 답변 속 스마텍 홈페이지 주소만 누를 수 있는 링크로 바꾼다(모델 화면 안내, 2026-10-24).
// 같은 사이트 안 이동이라 대화 내용은 그대로 남는다. 다른 사이트 주소는 글자 그대로 둔다.
// 주소 글자는 영문·숫자·기호만 — "…/edwards-rv5에서"처럼 한글이 붙어도 주소에 섞이지 않게(코드리뷰 10/24)
const SITE_URL = /https:\/\/(?:www\.)?smartechvacuum\.com(?:\/[A-Za-z0-9\-._~/?#=&%+]*)?/g;

function renderWithLinks(text: string, onNavigate: () => void) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(SITE_URL)) {
    const start = m.index ?? 0;
    if (start > last) parts.push(text.slice(last, start));
    const full = m[0].replace(/[.,]+$/, ""); // 문장 끝 마침표는 주소에서 뺀다
    const path = full.replace(/^https:\/\/(?:www\.)?smartechvacuum\.com/, "") || "/";
    parts.push(
      <Link key={start} href={path} onClick={onNavigate} className="text-edred underline underline-offset-2 break-all">
        smartechvacuum.com{path === "/" ? "" : path}
      </Link>,
    );
    last = start + full.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

const TEASER_KEY = "smtChatTeaserHiddenUntil";
const TEASER_DELAY_MS = 5000;

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

  // PC(1024px 이상)에서 몇 초 뒤 버튼 위에 작은 상담 카드(인사말 + 입력칸)를 띄운다(2026-10-24 대표님 요청).
  // 큰 창 자동 열림은 내용을 가려서 쓰지 않는다. 닫으면 7일간 다시 안 띄운다(브라우저 저장, 실패해도 무시).
  const [showTeaser, setShowTeaser] = useState(false);
  const [teaserInput, setTeaserInput] = useState("");
  useEffect(() => {
    if (isOpen) return; // 카드는 !isOpen일 때만 그려지고, 열 때 dismissTeaser로 꺼진다
    let hiddenUntil = 0;
    try { hiddenUntil = Number(localStorage.getItem(TEASER_KEY) ?? 0); } catch {}
    if (Date.now() < hiddenUntil || !window.matchMedia("(min-width: 1024px)").matches) return;
    const timer = setTimeout(() => setShowTeaser(true), TEASER_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const dismissTeaser = useCallback(() => {
    setShowTeaser(false);
    try { localStorage.setItem(TEASER_KEY, String(Date.now() + 7 * 24 * 60 * 60 * 1000)); } catch {}
  }, []);

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
    if (!messages.some((m) => m.role === "user")) trackEvent("chat_start");
    const userMsg: Message = { role: "user", content: text };
    // 작은 카드에서 바로 보낸 경우 인사말이 아직 없으니 함께 넣는다
    const base: Message[] = messages.length === 0 ? [{ role: "assistant", content: buildGreeting(user ?? undefined) }] : messages;
    const nextMessages = [...base, userMsg];
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

  function submitTeaser() {
    const text = teaserInput.trim();
    if (!text) return;
    setTeaserInput("");
    dismissTeaser();
    setIsOpen(true);
    send(text);
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
      {showTooltip && !isOpen && !showTeaser && (
        <div className="fixed bottom-24 right-6 z-50 pointer-events-none">
          <div className="bg-ink text-paper text-[12px] px-3 py-2 shadow-lg whitespace-nowrap rounded-sm animate-fade-in">
            모델명만 치면 가격·납기 바로 →
          </div>
          <div className="absolute bottom-[-4px] right-5 w-2 h-2 bg-ink rotate-45" />
        </div>
      )}

      {/* ── PC 작은 상담 카드 ── */}
      {showTeaser && !isOpen && (
        <div className="hidden lg:block fixed bottom-24 right-6 z-50 w-[320px] bg-white border hair shadow-2xl animate-fade-in">
          <div className="flex items-start justify-between px-4 pt-4">
            <div>
              <div className="flex items-center gap-2 mono text-[11px] text-dim">
                <span className="w-2 h-2 bg-green-400 rounded-full inline-block" />
                AI 상담 · 스마텍
              </div>
              <p className="mt-2 text-[15px] font-semibold text-ink">무엇을 도와드릴까요?</p>
              <p className="mt-1 text-[12px] text-dim leading-relaxed">모델명을 입력하면 가격·재고·납기를 바로 알려드려요.</p>
            </div>
            <button onClick={dismissTeaser} className="text-dim hover:text-ink text-[18px] leading-none px-1" aria-label="상담 카드 닫기">×</button>
          </div>
          <form
            className="flex gap-2 p-4"
            onSubmit={(e) => { e.preventDefault(); submitTeaser(); }}
          >
            <input
              value={teaserInput}
              onChange={(e) => setTeaserInput(e.target.value)}
              placeholder="예: RV5"
              aria-label="상담 메시지 입력"
              className="flex-1 min-w-0 bg-[#F8F6F2] px-3 py-2 text-[13px] outline-none focus:ring-1 focus:ring-ink"
            />
            <button type="submit" className="bg-edred text-white text-[13px] px-4 hover:bg-edred3 transition-colors">전송</button>
          </form>
        </div>
      )}

      {/* ── 플로팅 버튼 — 휴대폰은 아이콘 아래 "AI상담" 글자(제품 화면 하단 바를 가리지 않게 크기는 그대로) ── */}
      {!isOpen && (
        <button
          onClick={() => { dismissTeaser(); open(); }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-edred text-white rounded-full shadow-lg flex flex-col items-center justify-center hover:bg-edred3 transition-colors"
          aria-label="AI 상담 열기"
        >
          <svg className="w-5 h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="lg:hidden text-[10px] font-semibold leading-none mt-0.5">AI상담</span>
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
                  {m.content
                    ? m.role === "assistant" ? renderWithLinks(m.content, close) : m.content
                    : <span className="animate-pulse">●</span>}
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
