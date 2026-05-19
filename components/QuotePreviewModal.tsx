"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { SMARTECH_COMPANY } from "@/lib/company";

const SMARTECH = SMARTECH_COMPANY;

type CartItem = {
  productId: number;
  partNo: string;
  description: string;
  quantity: number;
};

type PricedItem = CartItem & { unitPrice: number | null };

type Props = {
  open: boolean;
  onClose: () => void;
};

function fmt(n: number) {
  return n.toLocaleString("ko-KR");
}

function yyyymmdd(d: Date) {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function QuotePreviewModal({ open, onClose }: Props) {
  const { data: session } = useSession();
  const [items, setItems] = useState<PricedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLoginGate, setShowLoginGate] = useState(false);

  async function fetchPrices() {
    const cartRaw: CartItem[] = JSON.parse(localStorage.getItem("quoteCart") ?? "[]");
    if (!Array.isArray(cartRaw) || cartRaw.length === 0) {
      setItems([]);
      return;
    }
    const ids = cartRaw.map((i) => i.productId).join(",");
    setLoading(true);
    try {
      const data = await fetch(`/api/products?ids=${ids}&limit=200`).then((r) => r.json());
      const priceMap = new Map<number, number | null>(
        (data.products ?? []).map((p: any) => [p.id, p.displayPrice])
      );
      setItems(
        cartRaw.map((item) => ({
          ...item,
          unitPrice: priceMap.get(item.productId) ?? null,
        }))
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    setShowLoginGate(false);
    fetchPrices();
  }, [open]);

  useEffect(() => {
    window.addEventListener("quoteCartUpdated", fetchPrices);
    return () => window.removeEventListener("quoteCartUpdated", fetchPrices);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!open) return null;

  const subtotal = items.reduce((s, i) => s + (i.unitPrice ?? 0) * i.quantity, 0);
  const vat = Math.round(subtotal * 0.1);
  const grandTotal = subtotal + vat;
  const today = new Date();
  const isLoggedIn = !!session;
  const tierLabel = (session?.user as any)?.tier ?? null;

  return (
    <>
      {/* 인쇄 시 미리보기만 표시 */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .qpm-printable, .qpm-printable * { visibility: visible; }
          .qpm-printable {
            position: fixed !important;
            top: 0 !important; left: 0 !important;
            width: 100% !important; height: auto !important;
            overflow: visible !important;
            background: white !important;
            z-index: 9999 !important;
          }
        }
      `}</style>

      {/* 왼쪽 화이트 미리보기 — QuotePanel(480px) 제외한 영역 */}
      <div className="fixed top-0 bottom-0 left-0 right-[480px] z-50 bg-white overflow-y-auto qpm-printable">

        {/* 고정 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between z-10 print:hidden">
          <div>
            <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.16em", color: "#9ca3af", textTransform: "uppercase" }}>
              QUOTATION PREVIEW · 견적서 미리보기
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>Smartech · 견적서</div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition-colors text-[18px] leading-none text-gray-500"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* 본문 */}
        <div className="px-8 py-6 max-w-3xl mx-auto">

          {/* 발행 정보 */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}>SMARTECH</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                Edwards Vacuum Korea · 공식 대리점
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: 11, color: "#6b7280", fontFamily: "monospace" }}>
              <div>발행일 · {yyyymmdd(today)}</div>
              <div style={{ marginTop: 2 }}>
                {isLoggedIn
                  ? `${(session?.user as any)?.name ?? ""} · ${tierLabel ?? "ENDUSER"} 가`
                  : "비로그인 · 공개가 기준"}
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: "#111", marginBottom: 24 }} />

          {/* 품목 테이블 */}
          {loading ? (
            <div className="space-y-2 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">담긴 제품이 없습니다.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24, fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #111" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px 6px 0", fontFamily: "monospace", fontSize: 10, letterSpacing: "0.1em", color: "#6b7280", fontWeight: 600, width: 28 }}>No</th>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontFamily: "monospace", fontSize: 10, letterSpacing: "0.1em", color: "#6b7280", fontWeight: 600, width: 110 }}>Part No</th>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontFamily: "monospace", fontSize: 10, letterSpacing: "0.1em", color: "#6b7280", fontWeight: 600 }}>Description</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontFamily: "monospace", fontSize: 10, letterSpacing: "0.1em", color: "#6b7280", fontWeight: 600, width: 50 }}>Qty</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontFamily: "monospace", fontSize: 10, letterSpacing: "0.1em", color: "#6b7280", fontWeight: 600, width: 110 }}>Unit Price</th>
                  <th style={{ textAlign: "right", padding: "6px 0 6px 8px", fontFamily: "monospace", fontSize: 10, letterSpacing: "0.1em", color: "#6b7280", fontWeight: 600, width: 120 }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.productId} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "10px 8px 10px 0", fontFamily: "monospace", color: "#9ca3af", fontSize: 11 }}>
                      {String(idx + 1).padStart(2, "0")}
                    </td>
                    <td style={{ padding: "10px 8px", fontFamily: "monospace", fontSize: 11, color: "#374151" }}>
                      {item.partNo}
                    </td>
                    <td style={{ padding: "10px 8px", fontSize: 12, lineHeight: 1.4 }}>
                      {item.description}
                    </td>
                    <td style={{ padding: "10px 8px", textAlign: "right", fontFamily: "monospace" }}>
                      {item.quantity} EA
                    </td>
                    <td style={{ padding: "10px 8px", textAlign: "right", fontFamily: "monospace" }}>
                      {item.unitPrice != null ? `₩ ${fmt(item.unitPrice)}` : "—"}
                    </td>
                    <td style={{ padding: "10px 0 10px 8px", textAlign: "right", fontFamily: "monospace", fontWeight: 600 }}>
                      {item.unitPrice != null ? `₩ ${fmt(item.unitPrice * item.quantity)}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 합계 */}
          <div style={{ marginLeft: "auto", maxWidth: 280, marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "6px 0", color: "#6b7280" }}>
              <span>소계 (Supply)</span>
              <span style={{ fontFamily: "monospace" }}>₩ {fmt(subtotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "6px 0", color: "#6b7280" }}>
              <span>VAT (10%)</span>
              <span style={{ fontFamily: "monospace" }}>₩ {fmt(vat)}</span>
            </div>
            <div style={{ height: 2, background: "#111", margin: "6px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "8px 0", fontWeight: 700 }}>
              <span>합계 (Total)</span>
              <span style={{ fontFamily: "monospace" }}>₩ {fmt(grandTotal)}</span>
            </div>
          </div>

          {/* 안내 */}
          <div style={{ fontSize: 10, color: "#9ca3af", fontFamily: "monospace", lineHeight: 1.8 }}>
            <div>※ 가격은 VAT 포함 기준 (소계는 VAT 별도)</div>
            {!isLoggedIn && <div>※ 현재 공개가 기준 · 로그인 시 등급별 확정가 적용</div>}
            <div>※ Edwards 정품 · 12개월 보증 · {SMARTECH.officeTel}</div>
          </div>
        </div>

        {/* 로그인 게이트 (PDF 저장 클릭 시 표시) */}
        {showLoginGate && (
          <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8">
            <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.16em", color: "#9ca3af", textTransform: "uppercase", marginBottom: 16 }}>
              로그인 필요
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 700, textAlign: "center", marginBottom: 8 }}>
              견적서 저장을<br />위해 로그인하세요
            </h3>
            <p style={{ fontSize: 12, color: "#6b7280", textAlign: "center", marginBottom: 24, lineHeight: 1.8 }}>
              로그인 후 등급별 확정가가 적용되며<br />PDF로 저장할 수 있습니다.
            </p>
            <Link
              href="/auth/login"
              style={{
                display: "inline-block", padding: "12px 24px",
                background: "#111", color: "#fff",
                fontSize: 13, fontFamily: "monospace", letterSpacing: "0.1em",
                textDecoration: "none", marginBottom: 12,
              }}
            >
              로그인하기 →
            </Link>
            <button
              onClick={() => setShowLoginGate(false)}
              style={{ fontSize: 12, color: "#9ca3af", background: "none", border: "none", cursor: "pointer" }}
            >
              계속 둘러보기
            </button>
          </div>
        )}
      </div>
    </>
  );
}
