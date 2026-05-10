"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// ─── 타입 ──────────────────────────────────────────────────────────────────

interface QuoteItem {
  id: number;
  quantity: number;
  unitPrice: number;
  product: { partNo: string; description: string };
}

interface QuoteDetail {
  id: number;
  status: string;
  createdAt: string;
  expiresAt: string | null;
  taxInvoiceRequested: boolean;
  totalAmount: number | null;
  note: string | null;
  user: { name: string; company: string; email: string };
  items: QuoteItem[];
  order: { id: number; status: string } | null;
}

// ─── 납기 모달 컴포넌트 ────────────────────────────────────────────────────

function DeliveryModal({
  onClose,
  onConfirm,
  onInquiry,
}: {
  onClose: () => void;
  onConfirm: () => void;
  onInquiry: (name: string, phone: string) => void;
}) {
  const [mode, setMode] = useState<"choose" | "inquiry">("choose");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleInquiry() {
    if (!contactName.trim() || !contactPhone.trim()) {
      alert("이름과 전화번호를 입력해 주세요.");
      return;
    }
    setSubmitting(true);
    await onInquiry(contactName, contactPhone);
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        {mode === "choose" ? (
          <>
            <h2 className="text-xl font-bold text-slate-800 mb-2">납기 확인</h2>
            <p className="text-sm text-gray-500 mb-6">
              주문 확정 전에 납기 일정을 확인해 주세요.
            </p>
            <div className="space-y-3">
              <button
                onClick={onConfirm}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                납기 문제 없음 — 주문 확정
              </button>
              <button
                onClick={() => setMode("inquiry")}
                className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-semibold py-3 rounded-xl transition-colors"
              >
                납기 문의 필요
              </button>
              <button
                onClick={onClose}
                className="w-full text-gray-400 hover:text-gray-600 text-sm py-2 transition-colors"
              >
                취소
              </button>
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => setMode("choose")}
              className="text-gray-400 hover:text-gray-600 text-sm mb-4 flex items-center gap-1"
            >
              ← 뒤로
            </button>
            <h2 className="text-xl font-bold text-slate-800 mb-2">납기 문의 접수</h2>
            <p className="text-sm text-gray-500 mb-6">
              담당자가 확인 후 연락드리겠습니다.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  담당자 이름
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="홍길동"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  전화번호
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <button
                onClick={handleInquiry}
                disabled={submitting}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {submitting ? "접수 중..." : "문의 접수"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── 메인 페이지 ───────────────────────────────────────────────────────────

export default function QuoteDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const quoteId = params.id as string;

  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [orderInquiryDone, setOrderInquiryDone] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status !== "authenticated") return;

    fetch(`/api/quote/${quoteId}/detail`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setQuote(null);
        } else {
          setQuote(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status, quoteId, router]);

  async function handleConfirm() {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quoteId: parseInt(quoteId), deliveryIssue: false }),
    });
    setShowModal(false);
    if (res.ok) {
      setOrderDone(true);
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? "주문 확정 중 오류가 발생했습니다.");
    }
  }

  async function handleInquiry(contactName: string, contactPhone: string) {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteId: parseInt(quoteId),
        deliveryIssue: true,
        contactName,
        contactPhone,
      }),
    });
    setShowModal(false);
    if (res.ok) {
      setOrderInquiryDone(true);
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? "문의 접수 중 오류가 발생했습니다.");
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center text-gray-400">
        로딩 중...
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-gray-500 mb-4">견적을 찾을 수 없습니다.</p>
        <Link href="/quote" className="text-blue-600 hover:underline text-sm">
          견적 카트로 돌아가기
        </Link>
      </div>
    );
  }

  if (orderDone) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">주문이 확정되었습니다</h2>
        <p className="text-gray-500 mb-8">담당자가 확인 후 연락드리겠습니다.</p>
        <Link
          href="/products"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-500 transition-colors"
        >
          제품 계속 보기
        </Link>
      </div>
    );
  }

  if (orderInquiryDone) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="text-5xl mb-4">📞</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">납기 문의가 접수되었습니다</h2>
        <p className="text-gray-500 mb-8">담당자가 납기를 확인 후 연락드리겠습니다.</p>
        <Link
          href="/products"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-500 transition-colors"
        >
          제품 계속 보기
        </Link>
      </div>
    );
  }

  const issuedDate = new Date(quote.createdAt);
  const expiresDate = quote.expiresAt ? new Date(quote.expiresAt) : null;
  const subtotal = quote.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const vat = Math.round(subtotal * 0.1);
  const grandTotal = subtotal + vat;
  const alreadyOrdered = !!quote.order;
  const quoteNo = `Q-${quote.id}-${issuedDate.getFullYear()}${String(issuedDate.getMonth() + 1).padStart(2, "0")}${String(issuedDate.getDate()).padStart(2, "0")}`;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* 견적 헤더 */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-sm text-gray-400 mb-1">견적번호</p>
          <h1 className="text-2xl font-bold text-slate-800">{quoteNo}</h1>
          <div className="flex gap-4 mt-2 text-sm text-gray-500">
            <span>발행일: {issuedDate.toLocaleDateString("ko-KR")}</span>
            {expiresDate && (
              <span>유효기간: {expiresDate.toLocaleDateString("ko-KR")}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/quote/${quote.id}/pdf`}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            download
          >
            PDF 다운로드
          </a>
        </div>
      </div>

      {/* 수신 정보 */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6">
        <p className="text-xs text-blue-400 mb-1">수신</p>
        <p className="font-semibold text-blue-800">{quote.user.company}</p>
        <p className="text-sm text-blue-600">{quote.user.name} · {quote.user.email}</p>
      </div>

      {/* 세금계산서 */}
      {quote.taxInvoiceRequested && (
        <div className="mb-4 text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 inline-block">
          세금계산서 발행 신청 포함
        </div>
      )}

      {/* 품목 테이블 */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6">
        <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500">
          <div className="col-span-1 text-center">No</div>
          <div className="col-span-3">코드번호</div>
          <div className="col-span-4">품목명</div>
          <div className="col-span-1 text-center">수량</div>
          <div className="col-span-1 text-right">단가</div>
          <div className="col-span-2 text-right">금액</div>
        </div>
        {quote.items.map((item, idx) => (
          <div
            key={item.id}
            className="grid grid-cols-12 gap-2 items-center px-4 py-3 border-b border-gray-100 last:border-0 text-sm"
          >
            <div className="col-span-1 text-center text-gray-400">{idx + 1}</div>
            <div className="col-span-3 text-blue-600 font-mono text-xs">{item.product.partNo}</div>
            <div className="col-span-4 text-gray-800">{item.product.description}</div>
            <div className="col-span-1 text-center text-gray-700">{item.quantity}</div>
            <div className="col-span-1 text-right text-gray-700">
              {item.unitPrice.toLocaleString("ko-KR")}
            </div>
            <div className="col-span-2 text-right font-medium text-gray-800">
              {(item.unitPrice * item.quantity).toLocaleString("ko-KR")}원
            </div>
          </div>
        ))}
      </div>

      {/* 합계 */}
      <div className="flex justify-end mb-6">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>공급가액</span>
            <span>{subtotal.toLocaleString("ko-KR")}원</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>부가세 (10%)</span>
            <span>{vat.toLocaleString("ko-KR")}원</span>
          </div>
          <div className="flex justify-between text-base font-bold text-blue-700 border-t border-gray-200 pt-2">
            <span>합계</span>
            <span>{grandTotal.toLocaleString("ko-KR")}원</span>
          </div>
        </div>
      </div>

      {/* 비고 */}
      {quote.note && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6">
          <p className="text-xs text-gray-400 mb-1">비고</p>
          <p className="text-sm text-gray-700">{quote.note}</p>
        </div>
      )}

      {/* 주문 확정 버튼 */}
      {alreadyOrdered ? (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center text-green-700 text-sm font-medium">
          이미 주문이 접수되었습니다. (주문번호: #{quote.order?.id})
        </div>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          주문 확정하기
        </button>
      )}

      {/* 납기 확인 모달 */}
      {showModal && (
        <DeliveryModal
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirm}
          onInquiry={handleInquiry}
        />
      )}
    </div>
  );
}
