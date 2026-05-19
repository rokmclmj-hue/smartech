"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { SMARTECH_COMPANY } from "@/lib/company";
import { getProductIconUrl } from "@/lib/product-icons";

const SM = SMARTECH_COMPANY;

type CartItem = {
  productId: number;
  partNo: string;
  description: string;
  quantity: number;
};
type PricedItem = CartItem & { unitPrice: number | null };
type Props = { open: boolean; onClose: () => void };

const NAV = "#1F4E79";
const NAV_LIGHT = "#EBF2FA";
const BORDER = "#BFCFDF";
const MUTED = "#6B7F93";
const MONO = "'JetBrains Mono', ui-monospace, monospace";

function fmt(n: number) { return n.toLocaleString("ko-KR"); }
function ymd(d: Date) {
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
}

export default function QuotePreviewModal({ open, onClose }: Props) {
  const { data: session } = useSession();
  const [items, setItems] = useState<PricedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLoginGate, setShowLoginGate] = useState(false);

  async function fetchPrices() {
    const cart: CartItem[] = JSON.parse(localStorage.getItem("quoteCart") ?? "[]");
    if (!Array.isArray(cart) || cart.length === 0) { setItems([]); return; }
    const ids = cart.map((i) => i.productId).join(",");
    setLoading(true);
    try {
      const data = await fetch(`/api/products?ids=${ids}&limit=200`).then((r) => r.json());
      const priceMap = new Map<number, number | null>(
        (data.products ?? []).map((p: any) => [p.id, p.displayPrice])
      );
      setItems(cart.map((item) => ({ ...item, unitPrice: priceMap.get(item.productId) ?? null })));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (open) { setShowLoginGate(false); fetchPrices(); } }, [open]);
  useEffect(() => {
    window.addEventListener("quoteCartUpdated", fetchPrices);
    return () => window.removeEventListener("quoteCartUpdated", fetchPrices);
  }, []);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  if (!open) return null;

  const subtotal = items.reduce((s, i) => s + (i.unitPrice ?? 0) * i.quantity, 0);
  const vat = Math.round(subtotal * 0.1);
  const grandTotal = subtotal + vat;
  const today = new Date();
  const isLoggedIn = !!session;
  const tierLabel = (session?.user as any)?.tier ?? "PUBLIC";
  const userName = (session?.user as any)?.name ?? "";
  const userCompany = (session?.user as any)?.company ?? "";

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .qpm-printable, .qpm-printable * { visibility: visible; }
          .qpm-printable {
            position: fixed !important; top: 0 !important; left: 0 !important;
            width: 100% !important; height: auto !important;
            overflow: visible !important; background: #fff !important;
            z-index: 9999 !important;
          }
          .qpm-screen-only { display: none !important; }
        }
      `}</style>

      {/* 왼쪽 미리보기 패널 */}
      <div className="fixed top-0 bottom-0 left-0 right-[480px] z-50 bg-white overflow-y-auto qpm-printable">

        {/* ── 상단 고정 바 (화면 전용) ── */}
        <div className="qpm-screen-only" style={{
          position: "sticky", top: 0, background: "#fff", borderBottom: `1px solid ${BORDER}`,
          padding: "12px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10,
        }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: MUTED, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            QUOTATION PREVIEW · 견적서 미리보기
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, border: `1px solid ${BORDER}`, background: "none",
            cursor: "pointer", fontSize: 18, color: MUTED, display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>

        {/* ── 본문 (A4 스타일) ── */}
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 40px 60px" }}>

          {/* 헤더 */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: `2pt solid ${NAV}`, paddingBottom: 16, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 30, fontWeight: 700, color: NAV, letterSpacing: "-0.02em", lineHeight: 1 }}>SMARTECH</div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: MUTED, marginTop: 8, letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1.7 }}>
                Edwards Vacuum Korea · Authorized Distributor · Since 2011
              </div>
            </div>
            <div style={{ textAlign: "right", fontFamily: MONO, fontSize: 10, color: MUTED }}>
              <div style={{ color: NAV, fontWeight: 700, fontSize: 12, letterSpacing: "0.12em", marginBottom: 6 }}>QUOTATION PREVIEW</div>
              <div>발행일 · {ymd(today)}</div>
              <div style={{ marginTop: 2 }}>
                {isLoggedIn ? `${tierLabel} 등급 확정가 적용` : "공개가 기준 · 로그인 시 확정가"}
              </div>
            </div>
          </div>

          {/* 수신처 / 발신처 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: `0.5pt solid ${BORDER}`, marginBottom: 24, fontSize: 11 }}>
            <div style={{ padding: "16px 20px" }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: NAV, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 10 }}>TO · 수신처</div>
              {isLoggedIn ? (
                <>
                  <Row label="Company" value={userCompany || "—"} />
                  <Row label="Attn" value={userName || "—"} />
                  <Row label="Grade" value={tierLabel} mono />
                </>
              ) : (
                <div style={{ color: MUTED, fontFamily: MONO, fontSize: 10, paddingTop: 4 }}>로그인 후 확인 가능</div>
              )}
            </div>
            <div style={{ padding: "16px 20px", borderLeft: `0.5pt solid ${BORDER}` }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: NAV, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 10 }}>FROM · 발신처</div>
              <Row label="Company" value={`${SM.name} · ${SM.english}`} />
              <Row label="CEO" value={SM.ceo} />
              <Row label="Tel" value={SM.officeTel} mono />
              <Row label="Email" value={SM.email} mono />
            </div>
          </div>

          {/* 섹션 라벨 */}
          <SectionLabel text={`ITEMS · ${String(items.length).padStart(2,"0")} LINES`} />

          {/* 품목 카드 */}
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {[1,2,3].map((i) => <div key={i} style={{ height: 100, background: "#f1f5f9", borderRadius: 2 }} />)}
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: MUTED, fontSize: 13 }}>담긴 제품이 없습니다.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {items.map((item, idx) => {
                const iconUrl = getProductIconUrl(item.partNo, item.description);
                const lineTotal = (item.unitPrice ?? 0) * item.quantity;
                return (
                  <div key={item.productId} style={{ display: "grid", gridTemplateColumns: "96px 1fr", border: `0.5pt solid ${BORDER}`, overflow: "hidden" }}>
                    {/* 이미지 */}
                    <div style={{ background: NAV_LIGHT, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 12, gap: 6 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={iconUrl} alt="" style={{ width: 60, height: 60, objectFit: "contain" }} />
                      <div style={{ fontFamily: MONO, fontSize: 8, color: NAV, letterSpacing: "0.1em", textAlign: "center" }}>
                        {String(idx+1).padStart(2,"0")}/{String(items.length).padStart(2,"0")}
                      </div>
                    </div>
                    {/* 데이터 */}
                    <div style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontFamily: MONO, fontSize: 10, color: MUTED, letterSpacing: "0.1em" }}>{item.partNo}</div>
                          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 3, letterSpacing: "-0.01em" }}>{item.description}</div>
                        </div>
                        <div style={{ fontFamily: MONO, fontSize: 8, border: `0.5pt solid ${NAV}`, color: NAV, padding: "3px 7px", letterSpacing: "0.14em", whiteSpace: "nowrap" }}>
                          ● Edwards Genuine
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, marginTop: 12, background: BORDER }}>
                        <PriceCell label="Qty" value={`${item.quantity} EA`} />
                        <PriceCell label="Unit Price" value={item.unitPrice ? `₩ ${fmt(item.unitPrice)}` : "—"} />
                        <PriceCell label="Subtotal" value={item.unitPrice ? `₩ ${fmt(lineTotal)}` : "—"} accent />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 섹션 라벨 */}
          <SectionLabel text="SUMMARY · 합계" />

          {/* 합계 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", border: `0.5pt solid ${BORDER}`, marginBottom: 28 }}>
            <div style={{ padding: "16px 20px", borderRight: `0.5pt solid ${BORDER}` }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: MUTED, letterSpacing: "0.12em", textTransform: "uppercase", lineHeight: 2 }}>
                <div>Items · {items.length} Lines · {items.reduce((s,i)=>s+i.quantity,0)} EA</div>
                <div>Currency · KRW (₩)</div>
                <div>VAT · 10% 포함</div>
                {!isLoggedIn && <div style={{ color: "#D4A537", marginTop: 4 }}>※ 공개가 기준 · 로그인 시 확정가 적용</div>}
              </div>
            </div>
            <div style={{ padding: "16px 20px" }}>
              <TotalRow label="소계 (Supply)" value={`₩ ${fmt(subtotal)}`} />
              <TotalRow label="VAT (10%)" value={`₩ ${fmt(vat)}`} />
              <div style={{ height: 1, background: NAV, margin: "10px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: MONO, fontSize: 10, color: NAV, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Grand Total</span>
                <span style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700, color: NAV }}>₩ {fmt(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* 섹션 라벨 */}
          <SectionLabel text="TERMS · 거래 조건" />

          {/* 거래조건 */}
          <div style={{ border: `0.5pt solid ${BORDER}`, fontFamily: MONO, fontSize: 10, marginBottom: 28 }}>
            <TermRow label="PAYMENT" value="세금계산서 발행 · 익월 말 결제 (협의)" />
            <TermRow label="DELIVERY" value="국내 재고분 D+1 / 해외 발주분 D+14 (협의)" />
            <TermRow label="WARRANTY" value="12개월 · Edwards 정품 보증" />
            <TermRow label="A / S" value={`24/7 콜 응대 · 현장 엔지니어 출동 · ${SM.officeTel}`} last />
          </div>

          {/* 푸터 */}
          <div style={{ borderTop: `0.5pt solid ${BORDER}`, paddingTop: 12, fontFamily: MONO, fontSize: 9, color: MUTED, letterSpacing: "0.06em", textTransform: "uppercase", display: "flex", justifyContent: "space-between" }}>
            <span>© {today.getFullYear()} SMARTECH CO., LTD. · Edwards Vacuum Korea Authorized Distributor</span>
            <span>PREVIEW · NOT AN OFFICIAL QUOTATION</span>
          </div>
        </div>

        {/* ── 로그인 게이트 ── */}
        {showLoginGate && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 10,
            background: "rgba(255,255,255,0.96)", backdropFilter: "blur(4px)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32,
          }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: MUTED, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 16 }}>로그인 필요</div>
            <h3 style={{ fontSize: 24, fontWeight: 700, textAlign: "center", marginBottom: 8, color: "#111" }}>
              견적서 저장을<br />위해 로그인하세요
            </h3>
            <p style={{ fontSize: 12, color: MUTED, textAlign: "center", marginBottom: 24, lineHeight: 1.8 }}>
              로그인 후 등급별 확정가가 적용되며<br />PDF로 저장할 수 있습니다.
            </p>
            <Link href="/auth/login" style={{
              display: "inline-block", padding: "12px 28px", background: NAV, color: "#fff",
              fontSize: 13, fontFamily: MONO, letterSpacing: "0.1em", textDecoration: "none", marginBottom: 12,
            }}>
              로그인하기 →
            </Link>
            <button onClick={() => setShowLoginGate(false)} style={{ fontSize: 12, color: MUTED, background: "none", border: "none", cursor: "pointer" }}>
              계속 둘러보기
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ── 작은 유틸 컴포넌트 ───────────────────────────────────────
function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "70px 1fr", gap: 8, padding: "4px 0", borderTop: "0.5pt dashed #E2E8F0", fontSize: 11 }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#6B7F93", letterSpacing: "0.08em", textTransform: "uppercase", paddingTop: 1 }}>{label}</span>
      <span style={{ fontFamily: mono ? "'JetBrains Mono', monospace" : undefined }}>{value}</span>
    </div>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#6B7F93", letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 14px", paddingLeft: 12, position: "relative" }}>
      <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 5, height: 5, background: "#1F4E79", display: "inline-block" }} />
      — {text}
    </div>
  );
}

function PriceCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ background: accent ? "#EBF2FA" : "#f8fafc", padding: "8px 12px" }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "#6B7F93", letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, marginTop: 3, fontWeight: accent ? 700 : 500, color: accent ? "#1F4E79" : "#111" }}>{value}</div>
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 11 }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#6B7F93", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
    </div>
  );
}

function TermRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", padding: "9px 16px", borderBottom: last ? "none" : "0.5pt solid #E2E8F0" }}>
      <span style={{ color: "#6B7F93", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 9 }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
