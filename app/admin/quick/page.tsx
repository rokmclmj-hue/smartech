"use client";

import { useState } from "react";

// 전화번호 하이픈 자동 포맷
function formatPhone(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function AdminQuickPage() {
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<"ok" | "error" | null>(null);
  const [message, setMessage] = useState("");

  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "";

  // 견적 페이지 링크 (Step 9에서 SMS 발송으로 연결)
  const quoteLink = `${baseUrl}/products`;

  async function handleSend() {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setMessage("전화번호를 정확히 입력해주세요");
      setResult("error");
      return;
    }

    setSending(true);
    setResult(null);
    setMessage("");

    try {
      const res = await fetch("/api/admin/quick-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: digits, link: quoteLink }),
      });

      if (res.ok) {
        setResult("ok");
        setMessage(`${phone} 으로 링크를 발송했습니다.`);
        setPhone("");
      } else {
        const data = (await res.json()) as { error?: string };
        setResult("error");
        setMessage(data.error ?? "발송에 실패했습니다. 다시 시도해주세요.");
      }
    } catch {
      setResult("error");
      setMessage("서버 오류가 발생했습니다.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-5 py-10">
      {/* 스마텍 로고 */}
      <div className="mb-8 text-center">
        <div className="display text-[36px] tracking-[-0.045em] text-ink leading-none">
          Smartech<span style={{ color: "#c00020" }}>.</span>
        </div>
        <div className="mono text-[11px] dim tracking-[0.2em] uppercase mt-1">
          빠른 견적 링크 발송
        </div>
      </div>

      {/* 카드 */}
      <div className="w-full max-w-sm bg-white border hair shadow-sm p-6 space-y-5">
        {/* 안내 */}
        <div className="text-[13px] text-ink/70 leading-[1.6]">
          고객 전화번호를 입력하면 제품 페이지 링크를 문자로 발송합니다.
        </div>

        {/* 전화번호 입력 */}
        <div>
          <label className="block mono text-[11px] dim tracking-[0.12em] uppercase mb-2">
            고객 전화번호
          </label>
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="010-0000-0000"
            className="w-full border hair px-4 py-3.5 text-[18px] mono tracking-widest focus:outline-none focus:border-ink text-center"
          />
        </div>

        {/* 발송 버튼 */}
        <button
          onClick={handleSend}
          disabled={sending || phone.replace(/\D/g, "").length < 10}
          className="w-full bg-edred text-paper py-4 text-[15px] font-semibold tracking-tight disabled:opacity-40 hover:bg-edred/90 transition-colors active:scale-[0.98]"
        >
          {sending ? "발송 중..." : "📨 링크 문자 보내기"}
        </button>

        {/* 결과 메시지 */}
        {result && (
          <div
            className={`px-4 py-3 text-[13px] font-medium ${
              result === "ok"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-600"
            }`}
          >
            {result === "ok" ? "✓ " : "✗ "}{message}
          </div>
        )}

        {/* 링크 직접 복사 */}
        <div className="border-t hair pt-4">
          <div className="mono text-[10px] dim tracking-[0.1em] uppercase mb-2">링크 직접 복사</div>
          <div className="flex gap-2">
            <div className="flex-1 bg-ink/[0.03] border hair px-3 py-2 text-[11px] mono dim truncate">
              {quoteLink}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(quoteLink)}
              className="border hair px-3 py-2 text-[11px] mono hover:bg-ink/5 transition-colors shrink-0"
            >
              복사
            </button>
          </div>
        </div>
      </div>

      {/* 하단 안내 */}
      <div className="mt-6 mono text-[10px] dim tracking-[0.1em] text-center">
        SMS 발송은 솔라피 연동 완료 후 활성화됩니다.
      </div>
    </div>
  );
}
