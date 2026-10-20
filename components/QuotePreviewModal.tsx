"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { SMARTECH_COMPANY } from "@/lib/company";
import { getProductIconUrl } from "@/lib/product-icons";
import { trackEvent } from "@/lib/analytics";
import { leadTimeLabel } from "@/lib/lead-time";

const SM = SMARTECH_COMPANY;

type CartItem = { productId: number; partNo: string; description: string; quantity: number };
type PricedItem = CartItem & { unitPrice: number | null; listPrice: number | null; stock: number; category: string | null };
type Props = { open: boolean; onClose: () => void; fullscreen?: boolean };

function fmt(n: number) { return n.toLocaleString("ko-KR"); }
// 검색 결과와 같은 기준(재고 있으면 재고 수, 없으면 lib/lead-time 통상 납기) — 2026-10-20
function stockOrLead(item: PricedItem): string {
  return item.stock > 0 ? `재고 ${item.stock}` : leadTimeLabel(item.category, item.description);
}
function ymd(d: Date) {
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
}

export default function QuotePreviewModal({ open, onClose, fullscreen = false }: Props) {
  const { data: session } = useSession();
  const [items, setItems] = useState<PricedItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchPrices() {
    const cart: CartItem[] = JSON.parse(localStorage.getItem("quoteCart") ?? "[]");
    if (!Array.isArray(cart) || cart.length === 0) { setItems([]); return; }
    const ids = cart.map((i) => i.productId).join(",");
    setLoading(true);
    try {
      const data = await fetch(`/api/products?ids=${ids}&limit=200`).then((r) => r.json());
      const productMap = new Map<number, { displayPrice: number | null; listPrice?: number; stock: number | null; category: string | null }>(
        (data.products ?? []).map((p: any) => [p.id, p])
      );
      setItems(cart.map((item) => {
        const p = productMap.get(item.productId);
        return { ...item, unitPrice: p?.displayPrice ?? null, listPrice: p?.listPrice ?? null, stock: p?.stock ?? 0, category: p?.category ?? null };
      }));
    } finally { setLoading(false); }
  }

  useEffect(() => { if (open) { fetchPrices(); } }, [open]);
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
  const userPhone = (session?.user as any)?.phone ?? null;
  const showSavings = isLoggedIn && tierLabel !== "ENDUSER" && tierLabel !== "PENDING" && tierLabel !== "ADMIN";

  // 일반 공급가는 서버가 DB 배율로 계산한 listPrice(딜러에게만 옴)로 — 옛 고정 배율 1.40 삭제(코드 리뷰 10/20)
  const listSubtotal = items.every((i) => i.listPrice != null)
    ? items.reduce((s, i) => s + (i.listPrice ?? 0) * i.quantity, 0)
    : 0;
  const showSavingsBlock = ["DEALER", "KEY_DEALER", "VIP_DEALER"].includes(tierLabel) && listSubtotal > subtotal;
  const savingsAmount = showSavingsBlock ? listSubtotal - subtotal : 0;
  const savingsPct = listSubtotal > 0 ? Math.round((savingsAmount / listSubtotal) * 100) : 0;
  const userName = (session?.user as any)?.name ?? "";
  const userCompany = (session?.user as any)?.company ?? "";
  const userEmail = (session?.user as any)?.email ?? "";

  return (
    <>
    {/* 인쇄 전용 CSS — quote-styles.css는 /quote/[id]에서만 로드되므로 모달에 직접 포함 */}
    <style>{`
      @media print {
        body.printing-quote .quote-page { background: #fff !important; color: #111 !important; }
        body.printing-quote .quote-page .full-version { display: none !important; }
        body.printing-quote .quote-page .pdf-only { display: block !important; padding: 15mm !important; min-height: 0 !important; }
        body.printing-quote .quote-page .util,
        body.printing-quote .quote-page .btn-export { display: none !important; }
      }
    `}</style>
    {/* 왼쪽 패널 — fullscreen 시 전체, 일반 시 데스크톱만 QuotePanel(480px) 제외 */}
    <div className={`fixed top-0 bottom-0 left-0 z-50 overflow-y-auto print-modal-wrapper ${fullscreen ? "right-0" : "right-0 md:right-[480px]"}`}>

      {/* quote-page: 인쇄 규칙용 이름. 화면은 밝은 종이색(2026-10-20 대표님 승인 — 남색·영어 화면이 보기 어렵다는 의견) */}
      <div className="quote-page" style={{ minHeight: "100%", background: "#F6F4EF", color: "#0B0B0C" }}>

        {/* ══════════════════════════════════
            FULL VERSION — 화면용 (밝은 배경·한글·합계 먼저)
            ══════════════════════════════════ */}
        <div className="full-version">
          {/* 맨 위 고정 줄 — 제목 · 저장 · 닫기 */}
          <div className="sticky top-0 z-10 bg-paper/95 backdrop-blur border-b border-line">
            <div className="max-w-[980px] mx-auto px-5 md:px-8 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[18px] md:text-[20px] font-bold tracking-tight">견적서 미리보기</div>
                <div className="text-[13px] text-dim">{items.length}종 · {totalQty}개 · {ymd(today)}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  className="bg-edred hover:bg-edred3 text-paper text-[15px] font-semibold px-5 py-3 transition-colors"
                  onClick={() => {
                    // 2026-10-19 로그인 없이도 공개가 기준으로 저장 (가격은 이미 공개, 로그인하면 우대가)
                    trackEvent("quote_pdf_save");
                    const header = document.querySelector("header") as HTMLElement | null;
                    const main = document.querySelector("main") as HTMLElement | null;
                    const hidden: HTMLElement[] = [];
                    [header, main].forEach((el) => {
                      if (el) { el.style.display = "none"; hidden.push(el); }
                    });
                    document.body.classList.add("printing-quote");
                    // 모바일에서 window.print()는 비동기(즉시 반환)이므로
                    // 복원 코드를 afterprint 안으로 이동 — 인쇄 전 복원 방지
                    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
                    const restore = () => {
                      if (fallbackTimer) clearTimeout(fallbackTimer);
                      hidden.forEach((el) => (el.style.display = ""));
                      document.body.classList.remove("printing-quote");
                      // PDF 저장 뒤에도 카트는 그대로 — 저장한 다음 "주문 요청하기"를 누를 수 있게(코드 리뷰 10/20, 카트 패널 PDF와 같게)
                      onClose();
                      window.removeEventListener("afterprint", restore);
                    };
                    window.addEventListener("afterprint", restore);
                    // 모바일에서는 header/main을 숨긴 스타일이 화면에 반영(페인트)되기 전에
                    // 인쇄 스냅샷이 찍혀 원래 페이지 내용이 함께 인쇄되는 경우가 있어
                    // 다음 프레임까지 한 번 기다린 후 인쇄를 호출한다.
                    requestAnimationFrame(() => {
                      requestAnimationFrame(() => {
                        window.print();
                        // iOS/Android: afterprint 미발생 대비 — 2초 후 강제 복원
                        fallbackTimer = setTimeout(restore, 2000);
                      });
                    });
                  }}
                >
                  PDF 저장
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="border border-ink/40 hover:bg-ink hover:text-paper text-[15px] px-4 py-3 transition-colors"
                >
                  닫기 ✕
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-[980px] mx-auto px-5 md:px-8 pt-6 pb-16">
            {/* 1. 합계 — 가장 먼저 */}
            <section className="bg-white border border-line">
              <div className="flex flex-wrap items-end justify-between gap-4 p-5 md:p-7">
                <div>
                  <div className="text-[14px] text-dim font-medium">합계 금액 (부가세 포함)</div>
                  <div className="mt-1 text-[34px] md:text-[44px] font-bold tracking-tight tabular-nums leading-none">
                    {fmt(grandTotal)}<span className="text-[22px] md:text-[26px] ml-1">원</span>
                  </div>
                </div>
                <div className="text-[15px] tabular-nums space-y-1 min-w-[220px]">
                  <div className="flex justify-between gap-6"><span className="text-dim">공급가액</span><span>{fmt(subtotal)}원</span></div>
                  <div className="flex justify-between gap-6"><span className="text-dim">부가세 (10%)</span><span>{fmt(vat)}원</span></div>
                </div>
              </div>
              {showSavingsBlock && (
                <div className="border-t border-line px-5 md:px-7 py-3 text-[14px] tabular-nums flex flex-wrap gap-x-6 gap-y-1">
                  <span className="text-dim">일반 공급가 <span className="line-through">{fmt(listSubtotal)}원</span></span>
                  <span className="text-edred font-semibold">우대 가격 적용 −{fmt(savingsAmount)}원 ({savingsPct}%)</span>
                </div>
              )}
              <div className="border-t border-line bg-paper/60 px-5 md:px-7 py-3 text-[14px]">
                {isLoggedIn
                  ? <span>우대 가격이 적용된 미리보기입니다. <b>PDF 저장</b>으로 견적서를 받으세요.</span>
                  : <span>공개가 기준입니다. <a href="/auth/login" className="text-edred font-semibold underline underline-offset-2">로그인</a>하면 우대 가격이 적용됩니다.</span>}
              </div>
            </section>

            {/* 2. 품목 */}
            <h2 className="mt-8 mb-3 text-[17px] font-bold">품목 {items.length}종</h2>
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => <div key={i} className="h-20 bg-white border border-line animate-pulse" />)}
              </div>
            ) : items.length === 0 ? (
              <div className="py-10 text-center text-dim text-[15px] bg-white border border-line">담긴 제품이 없습니다.</div>
            ) : (
              <div className="bg-white border border-line divide-y divide-line">
                {/* PC 머리줄 */}
                <div className="hidden md:grid grid-cols-[1fr_110px_70px_130px_140px] gap-3 px-5 py-2.5 text-[13px] text-dim font-medium bg-paper/60">
                  <span>제품</span><span>재고 · 납기</span><span className="text-right">수량</span><span className="text-right">단가</span><span className="text-right">금액</span>
                </div>
                {items.map((item) => {
                  const iconUrl = getProductIconUrl(item.partNo, item.description);
                  const line = (item.unitPrice ?? 0) * item.quantity;
                  const inStock = item.stock > 0;
                  return (
                    <div key={item.productId} className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_110px_70px_130px_140px] gap-x-3 gap-y-1 px-5 py-4 items-center">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={iconUrl} alt="" className="hidden sm:block w-11 h-11 object-contain shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[16px] font-semibold leading-snug break-words">{item.description}</div>
                          <div className="text-[13px] text-dim tabular-nums">{item.partNo}</div>
                        </div>
                      </div>
                      {/* 휴대폰: 금액을 오른쪽, 재고·수량·단가를 아래 줄에 */}
                      <div className="md:hidden text-right text-[16px] font-bold tabular-nums">
                        {item.unitPrice ? `${fmt(line)}원` : "가격 문의"}
                      </div>
                      <div className="md:hidden col-span-2 text-[13px] text-dim tabular-nums">
                        <span className={inStock ? "text-edred font-semibold" : ""}>{stockOrLead(item)}</span>
                        {" · "}{item.quantity}개 × {item.unitPrice ? `${fmt(item.unitPrice)}원` : "—"}
                      </div>
                      <span className={`hidden md:block text-[14px] ${inStock ? "text-edred font-semibold" : "text-dim"}`}>{stockOrLead(item)}</span>
                      <span className="hidden md:block text-right text-[15px] tabular-nums">{item.quantity}개</span>
                      <span className="hidden md:block text-right text-[15px] tabular-nums">{item.unitPrice ? `${fmt(item.unitPrice)}원` : "—"}</span>
                      <span className="hidden md:block text-right text-[16px] font-bold tabular-nums">{item.unitPrice ? `${fmt(line)}원` : "가격 문의"}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 3. 거래 조건 — PDF(아래 pdf-only)와 같은 내용 */}
            <h2 className="mt-8 mb-3 text-[17px] font-bold">거래 조건</h2>
            <dl className="bg-white border border-line divide-y divide-line text-[15px]">
              {[
                ["결제", "납품 전 현금결제"],
                ["납기", "재고품 출고일 별도 안내 · 그 외 통상 납기(해외 발주)"],
                ["보증", "12개월 · Edwards 정품 보증(소모품 제외)"],
                ["A/S", "현장 서비스 · 기술 지원"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[72px_1fr] gap-3 px-5 py-3">
                  <dt className="text-dim">{k}</dt><dd>{v}</dd>
                </div>
              ))}
            </dl>

            {/* 4. 받는 곳 · 보내는 곳 */}
            <div className="mt-8 grid md:grid-cols-2 gap-3">
              <section className="bg-white border border-line p-5">
                <h2 className="text-[17px] font-bold mb-3">받는 곳</h2>
                {isLoggedIn ? (
                  <dl className="text-[15px] space-y-1.5">
                    <div className="grid grid-cols-[72px_1fr] gap-3"><dt className="text-dim">회사</dt><dd>{userCompany || "—"}</dd></div>
                    <div className="grid grid-cols-[72px_1fr] gap-3"><dt className="text-dim">담당자</dt><dd>{userName ? `${userName}님` : "—"}</dd></div>
                    {userPhone && <div className="grid grid-cols-[72px_1fr] gap-3"><dt className="text-dim">전화</dt><dd className="tabular-nums">{userPhone}</dd></div>}
                    <div className="grid grid-cols-[72px_1fr] gap-3"><dt className="text-dim">이메일</dt><dd className="break-all">{userEmail}</dd></div>
                  </dl>
                ) : (
                  <p className="text-[15px] text-dim">로그인하면 회사명과 담당자가 들어갑니다.</p>
                )}
              </section>
              <section className="bg-white border border-line p-5">
                <h2 className="text-[17px] font-bold mb-3">보내는 곳</h2>
                <dl className="text-[15px] space-y-1.5">
                  <div className="grid grid-cols-[72px_1fr] gap-3"><dt className="text-dim">회사</dt><dd>{SM.name} · Edwards 코리아 공식 대리점</dd></div>
                  <div className="grid grid-cols-[72px_1fr] gap-3"><dt className="text-dim">대표</dt><dd>{SM.ceo}</dd></div>
                  <div className="grid grid-cols-[72px_1fr] gap-3"><dt className="text-dim">전화</dt><dd className="tabular-nums">{SM.officeTel} · {SM.mobileTel}</dd></div>
                  <div className="grid grid-cols-[72px_1fr] gap-3"><dt className="text-dim">이메일</dt><dd className="break-all">{SM.email}</dd></div>
                  <div className="grid grid-cols-[72px_1fr] gap-3"><dt className="text-dim">주소</dt><dd>{SM.headOfficeKo}</dd></div>
                </dl>
              </section>
            </div>

            <p className="mt-6 text-[13px] text-dim">미리보기 화면입니다. 정식 견적서는 PDF 저장으로 받으실 수 있습니다.</p>
          </div>
        </div>

        {/* ══════════════════════════════════
            PDF ONLY — 인쇄용 화이트 A4
            ══════════════════════════════════ */}
        <div className="pdf-only">
          <div className="p-top">
            <div className="wm">SMARTECH · QUOTATION</div>
            <div className="meta">
              <span>DATE · {ymd(today)}</span>
              <span>ITEMS · {items.length} LINES</span>
            </div>
          </div>
          <div className="p-parties">
            <div>
              <h5>TO · 수신처</h5>
              {isLoggedIn ? (
                <>
                  <div className="row"><div className="k">Company</div><div className="v">{userCompany || "—"}</div></div>
                  <div className="row"><div className="k">Attn</div><div className="v">{userName ? `${userName}님` : "—"}</div></div>
                  {userPhone && (
                    <div className="row"><div className="k">Tel</div><div className="v pmono">{userPhone}</div></div>
                  )}
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
          <div className="p-terms">
            <div className="row"><span className="k">Payment</span><span className="v">납품 전 현금결제</span></div>
            <div className="row"><span className="k">Delivery</span><span className="v">재고품 출고일 별도 안내 · 그 외 통상 납기(해외 발주)</span></div>
            <div className="row"><span className="k">Warranty</span><span className="v">12개월 · Edwards 정품 보증(소모품제외)</span></div>
            <div className="row"><span className="k">A / S</span><span className="v">현장 서비스 · 기술지원</span></div>
          </div>
          <div className="p-footer">
            <span>© {today.getFullYear()} SMARTECH CO., LTD. · Edwards Vacuum Korea Authorized Distributor</span>
            <span>PREVIEW · PAGE 1 / 1</span>
          </div>
        </div>

      </div>
    </div>
    </>
  );
}
