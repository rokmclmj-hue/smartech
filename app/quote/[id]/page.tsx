"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProductIconUrl } from "@/lib/product-icons";
import { SMARTECH_COMPANY } from "@/lib/company";
import "./quote-styles.css";

// ─── 타입 ──────────────────────────────────────────────────────────────────
interface QuoteItem {
  id: number;
  quantity: number;
  unitPrice: number;
  leadTime: string | null;
  customPartNo: string | null;
  customDescription: string | null;
  product: { partNo: string; description: string } | null;
}
interface QuoteDetail {
  id: number;
  status: string;
  createdAt: string;
  expiresAt: string | null;
  taxInvoiceRequested: boolean;
  paymentTerm: string | null;
  totalAmount: number | null;
  note: string | null;
  user: { name: string; company: string; email: string; phone: string | null; title?: string | null };
  items: QuoteItem[];
  order: { id: number; status: string } | null;
}

// 발신자(스마텍) 정보는 lib/company.ts 단일 출처에서 가져옴
const SMARTECH = SMARTECH_COMPANY;

const PAY_LABELS: Record<string, string> = {
  a: "납품 전 현금결제",
  b: "계약금 30% · 납품 전 70%",
  d: "계약금 30% · 익월 말일 70%",
  e: "정기결제 (익월 말일)",
  c: "담당자 협의",
};
function paymentLabel(term: string | null, taxInvoice: boolean): string {
  if (term && PAY_LABELS[term]) return PAY_LABELS[term];
  return taxInvoice ? "세금계산서 발행 · 익월 말 결제" : "납품 전 현금결제";
}

function fmtPhone(p: string): string {
  const d = p.replace(/\D/g, "");
  if (d.startsWith("02")) {
    if (d.length === 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`;
  }
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  return p;
}

// ─── 납기 모달 ─────────────────────────────────────────────────────────────
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
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div
        className="w-full max-w-md p-6"
        style={{
          background: "#0F1620",
          border: "1px solid #2A3441",
          color: "#E6EEF6",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {mode === "choose" ? (
          <>
            <h2 style={{ fontSize: 16, letterSpacing: "0.14em", color: "#3A8DD0", textTransform: "uppercase", marginBottom: 8 }}>
              — DELIVERY · 납기 확인
            </h2>
            <p style={{ fontSize: 12, color: "#7A8B9D", marginBottom: 24 }}>
              주문 확정 전에 납기 일정을 확인해 주세요.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={onConfirm}
                style={{
                  background: "#27AE60", color: "#0A0E14", border: "1px solid #27AE60",
                  padding: "12px", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase",
                  fontFamily: "inherit", cursor: "pointer",
                }}
              >
                [ 납기 문제 없음 — 주문 확정 ]
              </button>
              <button
                onClick={() => setMode("inquiry")}
                style={{
                  background: "transparent", color: "#D4A537", border: "1px solid #D4A537",
                  padding: "12px", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase",
                  fontFamily: "inherit", cursor: "pointer",
                }}
              >
                [ 납기 문의 필요 ]
              </button>
              <button
                onClick={onClose}
                style={{
                  background: "transparent", color: "#7A8B9D", border: "1px solid #2A3441",
                  padding: "10px", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
                  fontFamily: "inherit", cursor: "pointer",
                }}
              >
                취소
              </button>
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => setMode("choose")}
              style={{
                background: "none", border: "none", color: "#7A8B9D",
                fontSize: 11, marginBottom: 16, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              ← BACK
            </button>
            <h2 style={{ fontSize: 16, letterSpacing: "0.14em", color: "#3A8DD0", textTransform: "uppercase", marginBottom: 8 }}>
              — INQUIRY · 납기 문의 접수
            </h2>
            <p style={{ fontSize: 12, color: "#7A8B9D", marginBottom: 20 }}>
              담당자가 확인 후 연락드립니다.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 10, color: "#7A8B9D", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  Name · 담당자
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="홍길동"
                  style={{
                    width: "100%", marginTop: 6, padding: "10px 12px",
                    background: "#0A0E14", border: "1px solid #2A3441", color: "#E6EEF6",
                    fontFamily: "inherit", fontSize: 13, outline: "none",
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, color: "#7A8B9D", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  Tel · 전화번호
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  style={{
                    width: "100%", marginTop: 6, padding: "10px 12px",
                    background: "#0A0E14", border: "1px solid #2A3441", color: "#E6EEF6",
                    fontFamily: "inherit", fontSize: 13, outline: "none",
                  }}
                />
              </div>
              <button
                onClick={handleInquiry}
                disabled={submitting}
                style={{
                  background: "#D4A537", color: "#0A0E14", border: "1px solid #D4A537",
                  padding: "12px", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase",
                  fontFamily: "inherit", cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.5 : 1,
                }}
              >
                {submitting ? "[ 접수 중... ]" : "[ 문의 접수 ]"}
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
      .then((data: QuoteDetail & { error?: string }) => {
        if (data.error) { setQuote(null); }
        else {
          setQuote(data);
          // 브라우저 인쇄 저장 시 파일명으로 쓰임
          const issued = new Date(data.createdAt);
          const yyyymmdd = `${issued.getFullYear()}${String(issued.getMonth() + 1).padStart(2, "0")}${String(issued.getDate()).padStart(2, "0")}`;
          const co = data.user.company
            .replace(/^(주식회사|유한회사|합자회사|합명회사)\s*/u, "")
            .replace(/^\(주\)\s*/u, "")
            .replace(/^㈜\s*/u, "")
            .trim() || data.user.company;
          const first = data.items[0];
          if (first) {
            const desc = first.customDescription ?? first.product?.description ?? "품목";
            const label = data.items.length === 1
              ? `${desc} x ${first.quantity}ea`
              : `${desc} x ${first.quantity}ea 외`;
            document.title = `견적서_${yyyymmdd}_${co}(${label})`;
          } else {
            document.title = `견적서_${yyyymmdd}_${co}`;
          }
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
    if (res.ok) setOrderDone(true);
    else {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? "주문 확정 중 오류가 발생했습니다.");
    }
  }

  async function handleInquiry(contactName: string, contactPhone: string) {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteId: parseInt(quoteId), deliveryIssue: true, contactName, contactPhone,
      }),
    });
    setShowModal(false);
    if (res.ok) setOrderInquiryDone(true);
    else {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? "문의 접수 중 오류가 발생했습니다.");
    }
  }

  function handleExportPdf() {
    window.print();
  }

  // ── 로딩 / 에러 / 완료 화면 ──────────────────────────────────
  if (status === "loading" || loading) {
    return (
      <div className="quote-page" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="qmono" style={{ fontSize: 11, letterSpacing: "0.14em", color: "#7A8B9D", textTransform: "uppercase" }}>
          — Loading ... · 견적 데이터 불러오는 중
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="quote-page" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <p style={{ color: "#7A8B9D" }}>견적을 찾을 수 없습니다.</p>
        <Link href="/quote" className="qmono" style={{ fontSize: 11, letterSpacing: "0.1em", color: "#3A8DD0", textTransform: "uppercase" }}>
          [ ← 견적 카트로 돌아가기 ]
        </Link>
      </div>
    );
  }

  if (orderDone || orderInquiryDone) {
    return (
      <div className="quote-page" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 18 }}>
        <div className="qmono" style={{ fontSize: 11, letterSpacing: "0.14em", color: "#27AE60", textTransform: "uppercase" }}>
          {orderDone ? "● ORDER CONFIRMED · 주문 확정 완료" : "◐ INQUIRY RECEIVED · 납기 문의 접수"}
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 600 }}>
          {orderDone ? "주문이 확정되었습니다" : "납기 문의가 접수되었습니다"}
        </h2>
        <p style={{ color: "#7A8B9D", fontSize: 13 }}>담당자가 확인 후 연락드립니다.</p>
        <Link href="/products" className="btn-export" style={{ textDecoration: "none" }}>
          [ 제품 계속 보기 → ]
        </Link>
      </div>
    );
  }

  // ── 데이터 가공 ──────────────────────────────────────────────
  const issuedDate = new Date(quote.createdAt);
  const expiresDate = quote.expiresAt ? new Date(quote.expiresAt) : null;
  const subtotal = quote.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const vat = Math.round(subtotal * 0.1);
  const grandTotal = subtotal + vat;
  const totalQty = quote.items.reduce((s, i) => s + i.quantity, 0);
  const alreadyOrdered = !!quote.order;

  const fmt = (n: number) => n.toLocaleString("ko-KR");
  const yyyymmdd = (d: Date) =>
    `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  const quoteRef = `SMT-${issuedDate.getFullYear()}-Q-${String(quote.id).padStart(6, "0")}`;
  const userTier = ((session?.user as { tier?: string } | undefined)?.tier ?? "ENDUSER").toUpperCase();
  const showSavings = userTier !== "ENDUSER" && userTier !== "PENDING";

  const DEALER_TIER_MULT: Record<string, number> = { DEALER: 1.20, KEY_DEALER: 1.15, VIP_DEALER: 1.10 };
  const showSavingsBlock = ["DEALER", "KEY_DEALER", "VIP_DEALER"].includes(userTier);
  const userTierMult = DEALER_TIER_MULT[userTier] ?? 1.40;
  const listSubtotal = showSavingsBlock ? Math.round(subtotal * (1.40 / userTierMult)) : 0;
  const savingsAmount = showSavingsBlock ? listSubtotal - subtotal : 0;
  const savingsPct = listSubtotal > 0 ? Math.round((savingsAmount / listSubtotal) * 100) : 0;

  return (
    <div className="quote-page">
      {/* ─── 풀 버전 (화면용 다크) ────────────────────────────── */}
      <div className="full-version">
        <div className="stage">

          {/* 상단 유틸리티 바 */}
          <div className="util">
            <div className="left">
              <span>FILE — quote.tsx</span><span>·</span>
              <span>{quoteRef}</span><span>·</span><span>REV 01</span>
            </div>
            <div className="right">
              <span><span className="pulse-dot" />STATUS · {alreadyOrdered ? "ORDERED" : "ACTIVE"}</span>
              <button type="button" className="btn-export" onClick={handleExportPdf}>
                [ EXPORT → PDF ]
              </button>
            </div>
          </div>

          {/* 헤더 */}
          <div className="header">
            <div>
              <div className="wordmark">Smartech<span className="dot">.</span></div>
              <div className="wordmark-sub">
                Edwards Vacuum Korea<span className="sep">·</span>
                Authorized Distributor<span className="sep">·</span>
                SINCE 2011<span className="sep">·</span>
                OPS SYSTEM v2.6
              </div>
            </div>
            <div className="meta-grid">
              <div className="cell"><div className="k">Q-REF</div><div className="v">{quoteRef}</div></div>
              <div className="cell"><div className="k">ISSUED</div><div className="v">{yyyymmdd(issuedDate)}</div></div>
              <div className="cell"><div className="k">VALID UNTIL</div><div className="v">{expiresDate ? yyyymmdd(expiresDate) : "—"}</div></div>
              <div className="cell"><div className="k">REVISION</div><div className="v">REV 01</div></div>
              <div className="cell"><div className="k">CURRENCY</div><div className="v">KRW (₩)</div></div>
              <div className="cell"><div className="k">LOC</div><div className="v">{SMARTECH.headOfficeShort}</div></div>
            </div>
          </div>

          {/* SECTION 01 · PARTIES */}
          <div className="section-label">— SECTION 01 · PARTIES</div>
          <div className="parties">
            <div className="party">
              <h4><span>TO · 수신처</span><span className="tag">[ CLIENT ]</span></h4>
              <div className="party-row"><div className="lbl">Company</div><div className="val">{quote.user.company}</div></div>
              <div className="party-row"><div className="lbl">Attn</div><div className="val">{quote.user.title ? `${quote.user.name} (${quote.user.title}님)` : `${quote.user.name}님`}</div></div>
              {quote.user.phone && (
                <div className="party-row"><div className="lbl">Tel</div><div className="val qmono">{fmtPhone(quote.user.phone)}</div></div>
              )}
              <div className="party-row"><div className="lbl">Email</div><div className="val qmono">{quote.user.email}</div></div>
            </div>
            <div className="party">
              <h4><span>FROM · 발신처</span><span className="tag">[ ISSUER ]</span></h4>
              <div className="party-row"><div className="lbl">Company</div><div className="val">{SMARTECH.name} · {SMARTECH.english}</div></div>
              <div className="party-row"><div className="lbl">Role</div><div className="val">{SMARTECH.role}</div></div>
              <div className="party-row"><div className="lbl">CEO</div><div className="val">{SMARTECH.ceo}</div></div>
              <div className="party-row"><div className="lbl">Biz No</div><div className="val qmono">{SMARTECH.bizNo}</div></div>
              <div className="party-row"><div className="lbl">Corp No</div><div className="val qmono">{SMARTECH.corpNo}</div></div>
              <div className="party-row"><div className="lbl">Tel</div><div className="val qmono">{SMARTECH.officeTel} · M {SMARTECH.mobileTel}</div></div>
              <div className="party-row"><div className="lbl">Fax</div><div className="val qmono">{SMARTECH.fax}</div></div>
              <div className="party-row"><div className="lbl">Email</div><div className="val qmono">{SMARTECH.email}</div></div>
              <div className="party-row"><div className="lbl">Office</div><div className="val">{SMARTECH.headOfficeKo}</div></div>
              <div className="party-row"><div className="lbl">A/S Ctr</div><div className="val">{SMARTECH.cheonanCenterKo}</div></div>
              <div className="party-row"><div className="lbl">Web</div><div className="val qmono">{SMARTECH.website}</div></div>
            </div>
          </div>

          {/* SECTION 02 · TOTAL */}
          <div className="section-label">— SECTION 02 · TOTAL</div>
          <div className="hero">
            <div className="hero-total">
              <div className="hero-eyebrow">
                <span>SUPPLY · 공급가액</span>
                <span className="ref">Q-REF {quoteRef}</span>
              </div>
              <div className="hero-bignum"><span className="won">₩</span>{fmt(subtotal)}</div>
              <div className="hero-breakdown">
                <div className="b">
                  <div className="k">SUPPLY (공급가액)</div>
                  <div className="v">₩ {fmt(subtotal)}</div>
                </div>
                <div className="b">
                  <div className="k">VAT (10%)</div>
                  <div className="v">₩ {fmt(vat)}</div>
                </div>
                <div className="b total">
                  <div className="k">GRAND TOTAL</div>
                  <div className="v">₩ {fmt(grandTotal)}</div>
                </div>
              </div>
              {showSavingsBlock && (
                <div className="savings-block">
                  <div className="s-label">— PREFERRED PRICING · 우대 가격 적용</div>
                  <div className="s-row">
                    <span className="s-k">일반 공급가 (ENDUSER 기준)</span>
                    <span className="s-v">₩ {fmt(listSubtotal)}</span>
                  </div>
                  <div className="s-row s-discount">
                    <span className="s-k">우대 가격 적용</span>
                    <span className="s-v">- ₩ {fmt(savingsAmount)}</span>
                  </div>
                  <div className="s-row s-final">
                    <span className="s-k">귀사 적용가</span>
                    <span className="s-v">₩ {fmt(subtotal)}</span>
                  </div>
                  <div className="savings-badge">
                    절감 {savingsPct}% &nbsp;·&nbsp; ₩ {fmt(savingsAmount)} 우대 적용
                  </div>
                </div>
              )}
            </div>
            <div className="hero-side">
              <div className="eyebrow">QUOTE · ACTIVE</div>
              {showSavings ? (
                <>
                  <span className="grade">SPECIAL PRICE</span>
                  <p style={{ fontSize: 13, color: "#B9C5D2", lineHeight: 1.6 }}>
                    우대 가격이 적용된 견적서입니다.
                  </p>
                  <div className="meta-row">
                    <span>VALID</span>
                    <span>{expiresDate ? yyyymmdd(expiresDate) : "—"}</span>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 13, color: "#B9C5D2", lineHeight: 1.6 }}>
                    {quote.taxInvoiceRequested
                      ? "세금계산서 발행 신청 포함"
                      : "세금계산서 미신청 (필요 시 협의)"}
                  </p>
                  <div className="meta-row">
                    <span>VALID</span>
                    <span>{expiresDate ? yyyymmdd(expiresDate) : "—"}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* SECTION 03 · ITEMS */}
          <div className="section-label">
            — SECTION 03 · ITEMS · {String(quote.items.length).padStart(2, "0")} LINES
          </div>
          <div className="items">
            {quote.items.map((item, idx) => {
              const partNo = item.customPartNo ?? item.product?.partNo ?? "";
              const description = item.customDescription ?? item.product?.description ?? "";
              const iconUrl = getProductIconUrl(partNo, description);
              const lineSubtotal = item.unitPrice * item.quantity;
              return (
                <article key={item.id} className="card">
                  <div className="ill">
                    <div className="ill-label">
                      {String(idx + 1).padStart(2, "0")} / {String(quote.items.length).padStart(2, "0")} · {partNo || "CUSTOM"}
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={iconUrl} alt="" className="icon-img" />
                    <div className="stamp">
                      <div className="l1">GENUINE</div>
                      <div className="l2">EDWARDS</div>
                      <div className="l2">SN ████</div>
                    </div>
                  </div>
                  <div className="card-data">
                    <div className="card-head">
                      <div>
                        <div className="partno">PART NO · {partNo || "—"}</div>
                        <div className="model">{description}</div>
                      </div>
                      <span className="badge-genuine">● Edwards Genuine</span>
                    </div>
                    <div className="meta-line">
                      <div>
                        <div className="k">Quantity</div>
                        <div className="v">{item.quantity} EA</div>
                      </div>
                      <div>
                        <div className="k">납기 · Delivery</div>
                        <div className="v">{item.leadTime ?? "협의"}</div>
                      </div>
                    </div>
                    <div className="price-block">
                      <div className="pcell">
                        <div className="k">Unit Price</div>
                        <div className="v">₩ {fmt(item.unitPrice)}</div>
                      </div>
                      <div className="pcell">
                        <div className="k">Quantity</div>
                        <div className="v">{item.quantity} EA</div>
                      </div>
                      <div className="pcell">
                        <div className="k">Subtotal</div>
                        <div className="v">₩ {fmt(lineSubtotal)}</div>
                      </div>
                    </div>
                    <div className="status-line">
                      <span className="ok">● Edwards 정품</span>
                      <span>출고 · {item.leadTime ?? "협의"}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* SECTION 04 · SUMMARY */}
          <div className="section-label">— SECTION 04 · SUMMARY</div>
          <div className="summary">
            <div className="summary-left">
              <div className="row"><span>ITEMS</span><span className="v">{quote.items.length} LINES · {totalQty} EA</span></div>
              <div className="row"><span>CURRENCY</span><span className="v">KRW (₩)</span></div>
              <div className="row"><span>VALID</span><span className="v">{expiresDate ? yyyymmdd(expiresDate) : "—"}</span></div>
              <div className="row"><span>TAX INVOICE</span><span className="v">{quote.taxInvoiceRequested ? "REQUESTED" : "NOT REQ."}</span></div>
            </div>
            <div className="summary-right">
              {showSavingsBlock && (
                <>
                  <div className="row">
                    <span className="k">일반 공급가 (LIST)</span>
                    <span className="v" style={{ color: "var(--q-muted)", textDecoration: "line-through" }}>₩ {fmt(listSubtotal)}</span>
                  </div>
                  <div className="row">
                    <span className="k" style={{ color: "var(--q-success)" }}>우대 가격 적용</span>
                    <span className="v" style={{ color: "var(--q-success)" }}>- ₩ {fmt(savingsAmount)} ({savingsPct}%)</span>
                  </div>
                </>
              )}
              <div className="row"><span className="k">SUB-TOTAL</span><span className="v">₩ {fmt(subtotal)}</span></div>
              <div className="row"><span className="k">VAT (10%)</span><span className="v">₩ {fmt(vat)}</span></div>
              <div className="row grand"><span className="k">GRAND TOTAL · INCL. VAT</span><span className="v">₩ {fmt(grandTotal)}</span></div>
            </div>
          </div>

          {/* SECTION 05 · TRUST */}
          <div className="section-label">— SECTION 05 · TRUST SIGNALS</div>
          <div className="trust">
            <div className="cell">
              <div className="num-tag">[ 01 ]</div>
              <div className="ttl">Edwards Authorized</div>
              <div className="desc">한국 공식 대리점 인증<br />Korea Official Distributor.</div>
            </div>
            <div className="cell">
              <div className="num-tag">[ 02 ]</div>
              <div className="ttl">정품 공식 유통</div>
              <div className="desc">모든 제품 정품<br />시리얼 추적 가능.</div>
            </div>
            <div className="cell">
              <div className="num-tag">[ 03 ]</div>
              <div className="ttl">24/7 응급 대응</div>
              <div className="desc">펌프 다운 시 분 단위 출동<br />HOTLINE · {SMARTECH.officeTel}.</div>
            </div>
            <div className="cell">
              <div className="num-tag">[ 04 ]</div>
              <div className="ttl">현장 엔지니어 상시</div>
              <div className="desc">분해·점검·조립<br />A/S 상시 대응.</div>
            </div>
          </div>

          {/* SECTION 06 · TERMS */}
          <div className="section-label">— SECTION 06 · TERMS</div>
          <div className="terms">
            <div className="row"><span className="k">PAYMENT</span><span className="v">{paymentLabel(quote.paymentTerm, quote.taxInvoiceRequested)}</span></div>
            <div className="row"><span className="k">DELIVERY</span><span className="v">국내 재고분 D+1 / 해외 발주분 D+14 (협의)</span></div>
            <div className="row"><span className="k">WARRANTY</span><span className="v">12개월 · Edwards 정품 보증</span></div>
            <div className="row"><span className="k">A / S</span><span className="v">현장 서비스 · 기술지원</span></div>
          </div>

          {/* NOTE — TERMS 아래 별도 강조 블록 */}
          {quote.note && (
            <div style={{ borderLeft: "4px solid #c00020", paddingLeft: "16px", paddingTop: "10px", paddingBottom: "10px", marginBottom: "24px", background: "rgba(192,0,32,0.04)" }}>
              <div style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#c00020", marginBottom: "4px" }}>REMARKS</div>
              <div style={{ fontSize: "13px", fontStyle: "italic", color: "#0B0B0C" }}>{quote.note}</div>
            </div>
          )}

          {/* SECTION 07 · SIGNATURES + 주문 확정 */}
          <div className="section-label">— SECTION 07 · SIGNATURES</div>
          <div className="signature">
            <div className="box">
              <div className="lbl">— ISSUED BY · 발행인</div>
              <div className="area">[ STAMP · {SMARTECH.name} 운영팀 ]</div>
              <div className="who">SMARTECH OPS · SEAL</div>
            </div>
            <div className="box">
              <div className="lbl">— ACKNOWLEDGED BY · 수신 확인</div>
              <div className="area">
                {alreadyOrdered ? `[ ORDER #${quote.order?.id} CONFIRMED ]` : "[ SIGNATURE · 수령자 서명 ]"}
              </div>
              <div className="who">{quote.user.company} · {quote.user.name}</div>
            </div>
          </div>

          {/* 주문 확정 / 이미 주문됨 */}
          <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button type="button" className="btn-export" onClick={handleExportPdf}>
              [ EXPORT → PDF ]
            </button>
            {alreadyOrdered ? (
              <span className="qmono" style={{
                fontSize: 11, letterSpacing: "0.12em", color: "#27AE60",
                border: "1px solid #27AE60", padding: "9px 14px", textTransform: "uppercase",
              }}>
                ● ORDER #{quote.order?.id} CONFIRMED
              </span>
            ) : (
              <button type="button" className="btn-confirm" onClick={() => setShowModal(true)}>
                [ 주문 확정 · CONFIRM ORDER → ]
              </button>
            )}
          </div>

          {/* 푸터 */}
          <div className="qfooter">
            <span>© {issuedDate.getFullYear()} SMARTECH CO., LTD. · ALL RIGHTS RESERVED</span>
            <span>{quoteRef} · GENERATED BY OPS SYSTEM v2.6</span>
            <span>Edwards Vacuum Korea Official Distributor · Since 2011</span>
          </div>
        </div>
      </div>

      {/* ─── PDF 출력 전용 영역 (window.print() 시 표시) ──────── */}
      <div className="pdf-only">
        <div className="p-top">
          <div className="wm">SMARTECH · QUOTATION</div>
          <div className="meta">
            <span>Q-REF · {quoteRef}</span>
            <span>ISSUED · {yyyymmdd(issuedDate)}</span>
            <span>VALID · {expiresDate ? yyyymmdd(expiresDate) : "—"}</span>
          </div>
        </div>
        <div className="p-parties">
          <div>
            <h5>TO · 수신처</h5>
            <div className="row"><div className="k">Company</div><div className="v">{quote.user.company}</div></div>
            <div className="row"><div className="k">Attn</div><div className="v">{quote.user.title ? `${quote.user.name} ${quote.user.title}님` : `${quote.user.name}님`}</div></div>
            {quote.user.phone && (
              <div className="row"><div className="k">Tel</div><div className="v pmono">{fmtPhone(quote.user.phone)}</div></div>
            )}
            <div className="row"><div className="k">Email</div><div className="v pmono">{quote.user.email}</div></div>
          </div>
          <div>
            <h5>FROM · 발신처</h5>
            <div className="row"><div className="k">Company</div><div className="v">{SMARTECH.name} · {SMARTECH.english}</div></div>
            <div className="row"><div className="k">CEO</div><div className="v">{SMARTECH.ceo}</div></div>
            <div className="row"><div className="k">Biz No</div><div className="v pmono">{SMARTECH.bizNo}</div></div>
            <div className="row"><div className="k">Tel</div><div className="v pmono">{SMARTECH.officeTel} / M {SMARTECH.mobileTel}</div></div>
            <div className="row"><div className="k">Email</div><div className="v pmono">{SMARTECH.email}</div></div>
            <div className="row"><div className="k">Office</div><div className="v">{SMARTECH.headOfficeKo}</div></div>
            <div className="row"><div className="k">A/S Ctr</div><div className="v">{SMARTECH.cheonanCenterKo}</div></div>
          </div>
        </div>
        <table className="p-table">
          <thead>
            <tr>
              <th style={{ width: "8mm" }}>No</th>
              <th style={{ width: "26mm" }}>Part NO</th>
              <th>Description</th>
              <th style={{ width: "14mm", textAlign: "center" }}>납기</th>
              <th style={{ width: "12mm", textAlign: "right" }}>Qty</th>
              <th style={{ width: "28mm", textAlign: "right" }}>Unit Price</th>
              <th style={{ width: "28mm", textAlign: "right" }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((item, idx) => (
              <tr key={item.id}>
                <td className="pmono">{String(idx + 1).padStart(2, "0")}</td>
                <td className="partno">{item.customPartNo ?? item.product?.partNo ?? "—"}</td>
                <td>{item.customDescription ?? item.product?.description ?? ""}</td>
                <td style={{ textAlign: "center" }}>{item.leadTime ?? "협의"}</td>
                <td className="num-col">{item.quantity} EA</td>
                <td className="num-col">₩ {fmt(item.unitPrice)}</td>
                <td className="num-col">₩ {fmt(item.unitPrice * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-totals">
          {showSavings && (
            <div className="row"><span className="k">Price Basis</span><span className="v">우대적용</span></div>
          )}
          {showSavingsBlock && (
            <>
              <div className="row s-list"><span className="k">일반 공급가 (LIST)</span><span className="v">₩ {fmt(listSubtotal)}</span></div>
              <div className="row s-discount"><span className="k">우대 할인 ({savingsPct}%)</span><span className="v">- ₩ {fmt(savingsAmount)}</span></div>
            </>
          )}
          <div className="row"><span className="k">Sub-Total</span><span className="v">₩ {fmt(subtotal)}</span></div>
          <div className="row"><span className="k">VAT (10%)</span><span className="v">₩ {fmt(vat)}</span></div>
          <div className="row grand"><span className="k">GRAND TOTAL</span><span className="v">₩ {fmt(grandTotal)}</span></div>
        </div>
        {quote.note && (
          <div style={{ borderLeft: "4px solid #c00020", paddingLeft: "12px", paddingTop: "8px", paddingBottom: "8px", margin: "10px 0", background: "rgba(192,0,32,0.04)" }}>
            <div style={{ fontFamily: "monospace", fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#c00020", marginBottom: "3px" }}>REMARKS</div>
            <div style={{ fontSize: "11px", fontStyle: "italic", color: "#0B0B0C" }}>{quote.note}</div>
          </div>
        )}
        <div className="p-terms">
          <div className="row"><span className="k">Payment</span><span className="v">{paymentLabel(quote.paymentTerm, quote.taxInvoiceRequested)}</span></div>
          <div className="row"><span className="k">Delivery</span><span className="v">국내 재고분 D+1 / 해외 발주분 D+14 (협의)</span></div>
          <div className="row"><span className="k">Warranty</span><span className="v">12개월 · Edwards 정품 보증</span></div>
          <div className="row"><span className="k">A / S</span><span className="v">현장 서비스 · 기술지원</span></div>
        </div>
        <div className="p-footer">
          <span>© {issuedDate.getFullYear()} SMARTECH CO., LTD. · Edwards Vacuum Korea Authorized Distributor</span>
          <span>PAGE 1 / 1</span>
        </div>
      </div>

      {/* 납기 모달 */}
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
