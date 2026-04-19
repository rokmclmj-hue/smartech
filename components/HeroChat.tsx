"use client";
import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };

const QUICK_CHIPS = [
  { label: "반도체 CVD · 200 m³/h", q: "반도체 CVD 공정, 오일프리 드라이펌프 200 m³/h 필요" },
  { label: "MS 분석 · 10⁻⁷ mbar",  q: "질량분석기용 터보펌프 백킹, 10⁻⁷ mbar 도달" },
  { label: "동결건조 · 수증기",      q: "식품 동결건조 라인, 수증기 처리 많음" },
  { label: "OLED 증착",             q: "OLED 증착 라인, 청정 진공 유지" },
];

export default function HeroChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "안녕하세요. 스마텍 AI 상담원입니다. 어떤 공정에 쓰실 진공펌프가 필요하신가요?\n예시: 10⁻³ mbar · 오일프리 · 분석기용 터보 백킹",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages]);

  async function send(q?: string) {
    const text = (q ?? input).trim();
    if (!text || loading) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const apiMessages = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
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
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: "연결 오류가 발생했습니다. 잠시 후 다시 시도해주세요." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border hair bg-white overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b hair flex items-center justify-between text-[11px] mono">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-edred rounded-full inline-block animate-pulse" />
          AI VACUUM CONSULT · v2.6
        </div>
        <div className="dim">stream ● edwards-corpus</div>
      </div>

      {/* Chat log */}
      <div ref={logRef} className="p-5 space-y-3 min-h-[320px] max-h-[420px] overflow-y-auto text-[13.5px]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-4 py-3 leading-[1.65] whitespace-pre-wrap ${
                m.role === "user" ? "bg-ink text-paper" : "bg-[#F1EDE4]"
              }`}
            >
              {m.content || <span className="animate-pulse">●</span>}
            </div>
          </div>
        ))}
        {loading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="px-4 py-3 bg-[#F1EDE4] mono text-[12px]">● ● ●</div>
          </div>
        )}
      </div>

      {/* Quick chips */}
      <div className="px-5 py-3 border-t hair flex flex-wrap gap-2">
        {QUICK_CHIPS.map((c) => (
          <button
            key={c.label}
            className="chip !rounded-none text-[11px]"
            onClick={() => send(c.q)}
            disabled={loading}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t hair flex gap-2">
        <input
          className="flex-1 bg-transparent px-3 py-3 text-[13.5px] outline-none placeholder:text-[#9a958d]"
          placeholder="예: 10⁻³ mbar, 오일프리, 분석기용 터보 백킹 펌프 필요"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          disabled={loading}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="bg-ink text-paper px-5 text-[13px] disabled:opacity-40 hover:bg-edred transition-colors"
        >
          전송 →
        </button>
      </div>
    </div>
  );
}
