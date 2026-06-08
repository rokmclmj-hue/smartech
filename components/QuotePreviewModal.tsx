"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { SMARTECH_COMPANY } from "@/lib/company";
import { getProductIconUrl } from "@/lib/product-icons";

const SM = SMARTECH_COMPANY;

type CartItem = { productId: number; partNo: string; description: string; quantity: number };
type PricedItem = CartItem & { unitPrice: number | null };
type Props = { open: boolean; onClose: () => void; fullscreen?: boolean };

function fmt(n: number) { return n.toLocaleString("ko-KR"); }
function getDelivery(desc: string): string {
  if (["RV", "nXDS", "E2M0.7", "E2M1.5", "EMF10", "EMF20"].some(k => desc.includes(k))) return "1 week";
  if (["E2M40", "E2M80", "E2M175", "E2M275", "EH250", "EH500", "EH1200", "EH2600", "EH4200"].some(k => desc.includes(k))) return "8 ~ 10 weeks";
  if (["GXS", "EXS", "EDS"].some(k => desc.includes(k))) return "12 ~ 14 weeks";
  return "TBC";
}
function ymd(d: Date) {
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
}

export default function QuotePreviewModal({ open, onClose, fullscreen = false }: Props) {
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
    } finally { setLoading(false); }
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
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const today = new Date();
  const isLoggedIn = !!session;
  const tierLabel = ((session?.user as any)?.tier ?? "PUBLIC").toUpperCase();

  const DEALER_TIER_MULT: Record<string, number> = { DEALER: 1.20, KEY_DEALER: 1.15, VIP_DEALER: 1.10 };
  const showSavingsBlock = ["DEALER", "KEY_DEALER", "VIP_DEALER"].includes(tierLabel);
  const userTierMult = DEALER_TIER_MULT[tierLabel] ?? 1.40;
  const listSubtotal = showSavingsBlock ? Math.round(subtotal * (1.40 / userTierMult)) : 0;
  const savingsAmount = showSavingsBlock ? listSubtotal - subtotal : 0;
  const savingsPct = listSubtotal > 0 ? Math.round((savingsAmount / listSubtotal) * 100) : 0;
  const userName = (session?.user as any)?.name ?? "";
  const userCompany = (session?.user as any)?.company ?? "";
  const userEmail = (session?.user as any)?.email ?? "";

  return (
    /* 왼쪽 패널 — fullscreen 시 전체, 일반 시 QuotePanel(480px) 제외 */
    <div className={`fixed top-0 bottom-0 left-0 z-50 overflow-y-auto print-modal-wrapper ${fullscreen ? "right-0" : "right-[480px]"}`}>

      {/* ── quote-page 다크 테마 래퍼 ── */}
      <div className="quote-page" style={{ minHeight: "100%" }}>

        {/* ══════════════════════════════════
            FULL VERSION — 화면용 다크 터미널
            ══════════════════════════════════ */}
        <div className="full-version">
          <div className="stage">

            {/* 유틸 바 */}
            <div className="util">
              <div className="left">
                <span>FILE — quote-preview.tsx</span>
                <span>·</span>
                <span>PREVIEW MODE</span>
                <span>·</span>
                <span>{items.length} LINES · {totalQty} EA</span>
              </div>
              <div className="right">
                <span>
                  <span className="pulse-dot" />
                  {isLoggedIn ? "우대적용 · 확정가" : "PUBLIC · 공개가"}
                </span>
                <button
                  type="button"
                  className="btn-export"
                  onClick={() => {
                    if (!isLoggedIn) {
                      setShowLoginGate(true);
                    } else {
                      const header = document.querySelector("header") as HTMLElement | null;
                      const main = document.querySelector("main") as HTMLElement | null;
                      const hidden: HTMLElement[] = [];
                      [header, main].forEach((el) => {
                        if (el) { el.style.display = "none"; hidden.push(el); }
                      });
                      document.body.classList.add("printing-quote");
                      // 인쇄 완료 후에만 카트 초기화 (취소 시 유지)
                      const clearCart = () => {
                        localStorage.removeItem("quoteCart");
                        window.dispatchEvent(new Event("quoteCartUpdated"));
                        onClose();
                        window.removeEventListener("afterprint", clearCart);
                      };
                      window.addEventListener("afterprint", clearCart);
                      window.print();
                      hidden.forEach((el) => (el.style.display = ""));
                      document.body.classList.remove("printing-quote");
                    }
                  }}
                >
                  [ EXPORT → PDF ]
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    fontFamily: "var(--q-mono)", fontSize: 11, letterSpacing: "0.1em",
                    color: "var(--q-muted)", background: "transparent",
                    border: "1px solid var(--q-line)", padding: "9px 14px",
                    cursor: "pointer", textTransform: "uppercase",
                  }}
                >
                  [ CLOSE ✕ ]
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
                  PREVIEW MODE
                </div>
              </div>
              <div className="meta-grid">
                <div className="cell"><div className="k">Q-REF</div><div className="v">PREVIEW</div></div>
                <div className="cell"><div className="k">DATE</div><div className="v">{ymd(today)}</div></div>
                <div className="cell"><div className="k">ITEMS</div><div className="v">{items.length} LINES</div></div>
                <div className="cell"><div className="k">CURRENCY</div><div className="v">KRW (₩)</div></div>
                <div className="cell"><div className="k">PRICE BASIS</div><div className="v">{isLoggedIn ? "우대적용" : "PUBLIC"}</div></div>
                <div className="cell"><div className="k">STATUS</div><div className="v">PREVIEW</div></div>
              </div>
            </div>

            {/* SECTION 01 · PARTIES */}
            <div className="section-label">— SECTION 01 · PARTIES</div>
            <div className="parties">
              <div className="party">
                <h4><span>TO · 수신처</span><span className="tag">[ CLIENT ]</span></h4>
                {isLoggedIn ? (
                  <>
                    <div className="party-row"><div className="lbl">Company</div><div className="val">{userCompany || "—"}</div></div>
                    <div className="party-row"><div className="lbl">Attn</div><div className="val">{userName || "—"}</div></div>
                    <div className="party-row"><div className="lbl">Email</div><div className="val qmono">{userEmail}</div></div>
                  </>
                ) : (
                  <div className="party-row">
                    <div className="lbl">Notice</div>
                    <div className="val" style={{ color: "var(--q-gold)" }}>로그인 후 우대 가격 적용</div>
                  </div>
                )}
              </div>
              <div className="party">
                <h4><span>FROM · 발신처</span><span className="tag">[ ISSUER ]</span></h4>
                <div className="party-row"><div className="lbl">Company</div><div className="val">{SM.name} · {SM.english}</div></div>
                <div className="party-row"><div className="lbl">Role</div><div className="val">{SM.role}</div></div>
                <div className="party-row"><div className="lbl">CEO</div><div className="val">{SM.ceo}</div></div>
                <div className="party-row"><div className="lbl">Tel</div><div className="val qmono">{SM.officeTel} · M {SM.mobileTel}</div></div>
                <div className="party-row"><div className="lbl">Email</div><div className="val qmono">{SM.email}</div></div>
                <div className="party-row"><div className="lbl">Office</div><div className="val">{SM.headOfficeKo}</div></div>
              </div>
            </div>

            {/* SECTION 02 · ITEMS */}
            <div className="section-label">
              — SECTION 02 · ITEMS · {String(items.length).padStart(2,"0")} LINES
            </div>

            {loading ? (
              <div className="items">
                {[1,2,3].map((i) => (
                  <div key={i} style={{ height: 240, background: "var(--q-surface)", border: "1px solid var(--q-line)", animation: "pulse 1.5s infinite" }} />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign:"center", color:"var(--q-muted)", fontFamily:"var(--q-mono)", fontSize:12 }}>
                담긴 제품이 없습니다.
              </div>
            ) : (
              <div className="items">
                {items.map((item, idx) => {
                  const iconUrl = getProductIconUrl(item.partNo, item.description);
                  const lineSubtotal = (item.unitPrice ?? 0) * item.quantity;
                  return (
                    <article key={item.productId} className="card">
                      <div className="ill">
                        <div className="ill-label">
                          {String(idx+1).padStart(2,"0")} / {String(items.length).padStart(2,"0")} · {item.partNo}
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={iconUrl} alt="" className="icon-img" />
                        <div className="stamp">
                          <div className="l1">GENUINE</div>
                          <div className="l2">EDWARDS</div>
                          <div className="l2">PREVIEW</div>
                        </div>
                      </div>
                      <div className="card-data">
                        <div className="card-head">
                          <div>
                            <div className="partno">PART NO · {item.partNo}</div>
                            <div className="model">{item.description}</div>
                          </div>
                          <span className="badge-genuine">● Edwards Genuine</span>
                        </div>
                        <div className="meta-line">
                          <div><div className="k">Quantity</div><div className="v">{item.quantity} EA</div></div>
                          <div><div className="k">DELIVERY</div><div className="v">{getDelivery(item.description)}</div></div>
                          <div><div className="k">Warranty</div><div className="v">12 Months</div></div>
                        </div>
                        <div className="price-block">
                          <div className="pcell">
                            <div className="k">Unit Price</div>
                            <div className="v">{item.unitPrice ? `₩ ${fmt(item.unitPrice)}` : "—"}</div>
                          </div>
                          <div className="pcell">
                            <div className="k">Quantity</div>
                            <div className="v">{item.quantity} EA</div>
                          </div>
                          <div className="pcell">
                            <div className="k">Subtotal</div>
                            <div className="v">{item.unitPrice ? `₩ ${fmt(lineSubtotal)}` : "—"}</div>
                          </div>
                        </div>
                        <div className="status-line">
                          <span className="ok">● Edwards 정품</span>
                          <span>출고 · 협의</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* SECTION 03 · TOTAL */}
            <div className="section-label">— SECTION 03 · TOTAL</div>
            <div className="hero">
              <div className="hero-total">
                <div className="hero-eyebrow">
                  <span>SUPPLY · 공급가액</span>
                  <span className="ref">PREVIEW</span>
                </div>
                <div className="hero-bignum"><span className="won">₩</span>{fmt(subtotal)}</div>
                <div className="hero-breakdown">
                  <div className="b"><div className="k">SUPPLY (공급가액)</div><div className="v">₩ {fmt(subtotal)}</div></div>
                  <div className="b"><div className="k">VAT (10%)</div><div className="v">₩ {fmt(vat)}</div></div>
                  <div className="b total"><div className="k">GRAND TOTAL</div><div className="v">₩ {fmt(grandTotal)}</div></div>
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
                <div className="eyebrow">PREVIEW · QUOTE</div>
                <p style={{ fontSize: 14, color: "var(--q-text)", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                  {isLoggedIn
                    ? "우대 가격이 적용된 미리보기입니다.\nPDF 저장으로 공식 견적서를 발행하세요."
                    : "현재 공개가 기준입니다.\n로그인 시 우대 가격이 적용됩니다."}
                </p>
                <div className="meta-row" style={{ display:"flex", justifyContent:"space-between", paddingTop:8, borderTop:"1px dashed var(--q-line-soft)", fontFamily:"var(--q-mono)", fontSize:11, color:"var(--q-muted)" }}>
                  <span>DATE</span><span>{ymd(today)}</span>
                </div>
              </div>
            </div>

            {/* SECTION 04 · SUMMARY */}
            <div className="section-label">— SECTION 04 · SUMMARY</div>
            <div className="summary">
              <div className="summary-left">
                <div className="row"><span>ITEMS</span><span className="v">{items.length} LINES · {totalQty} EA</span></div>
                <div className="row"><span>CURRENCY</span><span className="v">KRW (₩)</span></div>
                <div className="row"><span>PRICE BASIS</span><span className="v">{isLoggedIn ? "우대적용" : "PUBLIC"}</span></div>
                <div className="row"><span>STATUS</span><span className="v" style={{ color: "var(--q-gold)" }}>PREVIEW</span></div>
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

            {/* 푸터 */}
            <div className="qfooter">
              <span>© {today.getFullYear()} SMARTECH CO., LTD. · ALL RIGHTS RESERVED</span>
              <span>PREVIEW MODE · NOT AN OFFICIAL QUOTATION</span>
              <span>Edwards Vacuum Korea Official Distributor · Since 2011</span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════
            PDF ONLY — 인쇄용 화이트 A4
            ══════════════════════════════════ */}
        <div className="pdf-only">
          <div className="p-top">
            <div className="wm">SMARTECH · QUOTATION<small>견적서</small></div>
            <div className="meta">
              <span>DATE · {ymd(today)}</span>
              <span>ITEMS · {items.length} LINES</span>
              <span>BASIS · {isLoggedIn ? "우대적용" : "PUBLIC"}</span>
            </div>
          </div>
          <div className="p-parties">
            <div>
              <h5>TO · 수신처</h5>
              {isLoggedIn ? (
                <>
                  <div className="row"><div className="k">Company</div><div className="v">{userCompany || "—"}</div></div>
                  <div className="row"><div className="k">Attn</div><div className="v">{userName || "—"}</div></div>
                  <div className="row"><div className="k">Email</div><div className="v pmono">{userEmail}</div></div>
                </>
              ) : (
                <div className="row"><div className="k">Notice</div><div className="v">공개가(PUBLIC) 기준</div></div>
              )}
            </div>
            <div>
              <h5>FROM · 발신처</h5>
              <div className="row"><div className="k">Company</div><div className="v">{SM.name} · {SM.english}</div></div>
              <div className="row"><div className="k">CEO</div><div className="v">{SM.ceo}</div></div>
              <div className="row"><div className="k">Biz No</div><div className="v pmono">{SM.bizNo}</div></div>
              <div className="row"><div className="k">Tel</div><div className="v pmono">{SM.officeTel} / M {SM.mobileTel}</div></div>
              <div className="row"><div className="k">Email</div><div className="v pmono">{SM.email}</div></div>
              <div className="row"><div className="k">Office</div><div className="v">{SM.headOfficeKo}</div></div>
            </div>
          </div>
          <table className="p-table">
            <thead>
              <tr>
                <th style={{ width:"8mm" }}>No</th>
                <th style={{ width:"26mm" }}>Part NO</th>
                <th>Description</th>
                <th style={{ width:"14mm", textAlign:"right" }}>Qty</th>
                <th style={{ width:"26mm", textAlign:"right" }}>Unit Price</th>
                <th style={{ width:"28mm", textAlign:"right" }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.productId}>
                  <td className="pmono">{String(idx+1).padStart(2,"0")}</td>
                  <td className="partno">{item.partNo}</td>
                  <td>{item.description}</td>
                  <td className="num-col">{item.quantity} EA</td>
                  <td className="num-col">{item.unitPrice ? `₩ ${fmt(item.unitPrice)}` : "—"}</td>
                  <td className="num-col">{item.unitPrice ? `₩ ${fmt((item.unitPrice) * item.quantity)}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-totals">
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
          <div className="p-terms">
            <div className="row"><span className="k">Payment</span><span className="v">납품 전 현금결제</span></div>
            <div className="row"><span className="k">Delivery</span><span className="v">국내 재고분 D+1 / 해외 발주분 D+14 (협의)</span></div>
            <div className="row"><span className="k">Warranty</span><span className="v">12개월 · Edwards 정품 보증</span></div>
            <div className="row"><span className="k">A / S</span><span className="v">현장 서비스 · 기술지원</span></div>
          </div>
          <div className="p-footer">
            <span>© {today.getFullYear()} SMARTECH CO., LTD. · Edwards Vacuum Korea Authorized Distributor</span>
            <span>PREVIEW · PAGE 1 / 1</span>
          </div>
        </div>

        {/* ── 로그인 게이트 ── */}
        {showLoginGate && (
          <div style={{
            position:"fixed", inset:0, zIndex:60,
            background:"rgba(10,14,20,0.92)", backdropFilter:"blur(4px)",
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32,
          }}>
            <div style={{ fontFamily:"var(--q-mono)", fontSize:10, color:"var(--q-muted)", letterSpacing:"0.16em", textTransform:"uppercase", marginBottom:16 }}>
              LOGIN REQUIRED
            </div>
            <h3 style={{ fontSize:24, fontWeight:700, textAlign:"center", marginBottom:8, color:"var(--q-text)" }}>
              견적서 저장을<br />위해 로그인하세요
            </h3>
            <p style={{ fontSize:12, color:"var(--q-muted)", textAlign:"center", marginBottom:24, lineHeight:1.8 }}>
              로그인 후 우대가격이 적용되며<br />PDF로 저장할 수 있습니다.
            </p>
            <Link href="/auth/login" onClick={onClose} style={{
              display:"inline-block", padding:"12px 28px",
              background:"var(--q-accent)", color:"var(--q-bg)",
              fontSize:13, fontFamily:"var(--q-mono)", letterSpacing:"0.1em",
              textDecoration:"none", marginBottom:12,
            }}>
              [ 로그인하기 → ]
            </Link>
            <button onClick={() => setShowLoginGate(false)} style={{
              fontSize:12, color:"var(--q-muted)", background:"none", border:"none", cursor:"pointer", fontFamily:"var(--q-mono)",
            }}>
              계속 둘러보기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
