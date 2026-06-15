"use client";

import { useState } from "react";

type EmailTaskForQuote = {
  fromEmail: string;
  parsedData: Record<string, unknown> | null;
};

type LineItem = {
  key: string;
  partNo: string;
  description: string;
  quantity: number;
  unitPrice: number;
  leadTime: string;
};

interface Props {
  emailTask: EmailTaskForQuote;
  onClose: () => void;
  onCreated: (quoteId: number) => void;
}

export default function QuoteAttachPanel({ emailTask, onClose, onCreated }: Props) {
  const parsed = emailTask.parsedData ?? {};

  const [guest, setGuest] = useState({
    name: String(parsed.contactName ?? ""),
    title: "",
    company: String(parsed.company ?? ""),
    email: emailTask.fromEmail,
    phone: "",
    tier: "DIRECT",
  });

  const [items, setItems] = useState<LineItem[]>(() => {
    const raw = Array.isArray(parsed.items) ? (parsed.items as Array<Record<string, unknown>>) : [];
    if (raw.length > 0) {
      return raw.map((item, i) => ({
        key: String(i),
        partNo: String(item.partNo ?? ""),
        description: String(item.description ?? ""),
        quantity: Number(item.quantity ?? 1),
        unitPrice: 0,
        leadTime: "",
      }));
    }
    return [{ key: "0", partNo: "", description: "", quantity: 1, unitPrice: 0, leadTime: "" }];
  });

  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  function addItem() {
    setItems((prev) => [
      ...prev,
      { key: String(Date.now()), partNo: "", description: "", quantity: 1, unitPrice: 0, leadTime: "" },
    ]);
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  function updateItem(key: string, field: keyof LineItem, value: string | number) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, [field]: value } : i)));
  }

  async function handleSubmit() {
    setError("");
    if (!guest.company.trim() || !guest.name.trim()) {
      setError("상호와 담당자 이름을 입력해주세요.");
      return;
    }
    if (items.length === 0) {
      setError("품목을 1개 이상 추가해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/proxy-quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest,
          items: items.map((i) => ({
            productId: null,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            leadTime: i.leadTime,
            customPartNo: i.partNo,
            customDescription: i.description,
          })),
          note,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "견적서 생성 실패");
        return;
      }
      onCreated(data.quoteId);
    } catch {
      setError("네트워크 오류");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl h-full bg-white shadow-2xl overflow-y-auto">
        {/* 헤더 */}
        <div className="px-6 py-5 border-b border-line flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-[16px] font-semibold text-ink">견적서 작성</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-paper text-dim hover:text-ink transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 고객 정보 */}
          <section>
            <div className="text-[11px] text-dim uppercase tracking-widest mb-3">고객 정보</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-dim block mb-1">상호 *</label>
                <input
                  value={guest.company}
                  onChange={(e) => setGuest((g) => ({ ...g, company: e.target.value }))}
                  className="w-full border border-line rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ink/20"
                />
              </div>
              <div>
                <label className="text-[11px] text-dim block mb-1">담당자 *</label>
                <input
                  value={guest.name}
                  onChange={(e) => setGuest((g) => ({ ...g, name: e.target.value }))}
                  className="w-full border border-line rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ink/20"
                />
              </div>
              <div>
                <label className="text-[11px] text-dim block mb-1">이메일</label>
                <input
                  value={guest.email}
                  onChange={(e) => setGuest((g) => ({ ...g, email: e.target.value }))}
                  className="w-full border border-line rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ink/20"
                />
              </div>
              <div>
                <label className="text-[11px] text-dim block mb-1">직함</label>
                <input
                  value={guest.title}
                  onChange={(e) => setGuest((g) => ({ ...g, title: e.target.value }))}
                  className="w-full border border-line rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ink/20"
                />
              </div>
              <div>
                <label className="text-[11px] text-dim block mb-1">전화번호</label>
                <input
                  value={guest.phone}
                  onChange={(e) => setGuest((g) => ({ ...g, phone: e.target.value }))}
                  className="w-full border border-line rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ink/20"
                />
              </div>
              <div>
                <label className="text-[11px] text-dim block mb-1">고객 구분</label>
                <select
                  value={guest.tier}
                  onChange={(e) => setGuest((g) => ({ ...g, tier: e.target.value }))}
                  className="w-full border border-line rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ink/20"
                >
                  <option value="DIRECT">직납</option>
                  <option value="DEALER">딜러</option>
                  <option value="ENDUSER">최종사용자</option>
                </select>
              </div>
            </div>
          </section>

          {/* 품목 */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] text-dim uppercase tracking-widest">품목</div>
              <button onClick={addItem} className="text-[12px] text-smblue hover:text-smblue/70 font-medium transition-colors">
                + 행 추가
              </button>
            </div>
            <div className="border border-line rounded-xl overflow-hidden">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-paper text-dim">
                    <th className="px-3 py-2 text-left font-medium w-24">Part No.</th>
                    <th className="px-3 py-2 text-left font-medium">품명</th>
                    <th className="px-3 py-2 text-right font-medium w-14">수량</th>
                    <th className="px-3 py-2 text-right font-medium w-32">단가 (원)</th>
                    <th className="px-3 py-2 text-left font-medium w-20">납기</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.key} className="border-t border-line">
                      <td className="px-2 py-1.5">
                        <input
                          value={item.partNo}
                          onChange={(e) => updateItem(item.key, "partNo", e.target.value)}
                          className="w-full border border-line rounded px-2 py-1 text-[12px] focus:outline-none focus:ring-1 focus:ring-ink/20"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          value={item.description}
                          onChange={(e) => updateItem(item.key, "description", e.target.value)}
                          className="w-full border border-line rounded px-2 py-1 text-[12px] focus:outline-none focus:ring-1 focus:ring-ink/20"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateItem(item.key, "quantity", Number(e.target.value))}
                          className="w-full border border-line rounded px-2 py-1 text-[12px] text-right focus:outline-none focus:ring-1 focus:ring-ink/20"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          min={0}
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.key, "unitPrice", Number(e.target.value))}
                          className="w-full border border-line rounded px-2 py-1 text-[12px] text-right focus:outline-none focus:ring-1 focus:ring-ink/20"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          value={item.leadTime}
                          onChange={(e) => updateItem(item.key, "leadTime", e.target.value)}
                          placeholder="예: 8주"
                          className="w-full border border-line rounded px-2 py-1 text-[12px] focus:outline-none focus:ring-1 focus:ring-ink/20"
                        />
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        {items.length > 1 && (
                          <button
                            onClick={() => removeItem(item.key)}
                            className="text-dim hover:text-edred text-[18px] leading-none transition-colors"
                          >
                            ×
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-right text-[12px] text-dim">
              소계(VAT 제외):{" "}
              <span className="font-semibold text-ink">{subtotal.toLocaleString("ko-KR")}원</span>
            </div>
          </section>

          {/* 메모 */}
          <section>
            <label className="text-[11px] text-dim uppercase tracking-widest block mb-2">메모 (선택)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full border border-line rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ink/20 resize-none"
              placeholder="납기 안내, 특이사항 등..."
            />
          </section>

          {error && (
            <div className="px-4 py-3 bg-edred/10 text-edred text-[13px] rounded-xl">{error}</div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3.5 bg-ink text-white text-[14px] font-semibold rounded-xl hover:bg-ink/80 disabled:opacity-50 transition-colors"
          >
            {submitting ? "저장 중..." : "견적서 저장 · 이메일에 첨부"}
          </button>
        </div>
      </div>
    </div>
  );
}
