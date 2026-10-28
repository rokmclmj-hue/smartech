"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { leadTimeLabel } from "@/lib/lead-time";

type ProductInfo = { price: number | null; stock: number; category: string | null };

type CartItem = {
  productId: number;
  partNo: string;
  description: string;
  quantity: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function QuotePanel({ open, onClose }: Props) {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [infoMap, setInfoMap] = useState<Map<number, ProductInfo>>(new Map());

  // 주문 요청(2026-10-20): cart → form → done
  const [step, setStep] = useState<"cart" | "form" | "done">("cart");
  const [form, setForm] = useState({ company: "", name: "", phone: "", email: "", note: "", website: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [doneNo, setDoneNo] = useState("");
  const sessionUser = session?.user as { name?: string; company?: string; phone?: string; email?: string; tier?: string } | undefined;
  // 승인된 회원은 기존 회원 발주 요청(/api/quote/request → 주문 관리 등록), 그 외(비회원·승인 대기)는 비회원 요청
  // 등급이 비어 있는 로그인 정보는 회원으로 보지 않는다(코드 리뷰 10/20)
  const isApprovedMember = !!sessionUser?.tier && sessionUser.tier !== "PENDING" && sessionUser.tier !== "REJECTED";

  function openForm() {
    setForm((f) => ({
      ...f,
      company: f.company || sessionUser?.company || "",
      name: f.name || sessionUser?.name || "",
      phone: f.phone || sessionUser?.phone || "",
      email: f.email || sessionUser?.email || "",
    }));
    setFormError("");
    setStep("form");
  }

  async function submitOrder() {
    setFormError("");
    if (!isApprovedMember) {
      if (!form.company.trim() || !form.name.trim()) { setFormError("회사명과 담당자를 입력해 주세요."); return; }
      const digits = form.phone.replace(/\D/g, "");
      if (digits.length < 9 || digits.length > 11) { setFormError("연락처를 정확히 입력해 주세요."); return; }
    }
    setSubmitting(true);
    try {
      const payloadItems = items.map((i) => ({ productId: i.productId, quantity: i.quantity }));
      const res = isApprovedMember
        ? await fetch("/api/quote/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: payloadItems, note: form.note.trim() || null }),
          })
        : await fetch("/api/quote/guest-request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, items: payloadItems }),
          });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setFormError(data.error ?? "접수하지 못했습니다. 잠시 후 다시 시도해 주세요."); return; }
      trackEvent("quote_request");
      setDoneNo(
        data.quoteNo ??
        (data.quoteId ? `SMT-${new Date().getFullYear()}-Q-${String(data.quoteId).padStart(6, "0")}` : "")
      );
      localStorage.removeItem("quoteCart");
      window.dispatchEvent(new Event("quoteCartUpdated"));
      setStep("done");
    } catch {
      setFormError("네트워크 오류로 접수하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  function closePanel() {
    if (step === "done") setStep("cart");
    onClose();
  }

  function loadItems() {
    try {
      const stored = JSON.parse(localStorage.getItem("quoteCart") ?? "[]");
      setItems(Array.isArray(stored) ? stored : []);
    } catch {
      setItems([]);
    }
  }

  async function fetchPrices(cartItems: CartItem[]) {
    if (cartItems.length === 0) return;
    const ids = cartItems.map((i) => i.productId).join(",");
    try {
      const data = await fetch(`/api/products?ids=${ids}&limit=200`).then((r) => r.json());
      const map = new Map<number, ProductInfo>(
        (data.products ?? []).map((p: any) => [p.id, { price: p.displayPrice ?? null, stock: p.stock ?? 0, category: p.category ?? null }])
      );
      setInfoMap(map);
    } catch {
      setInfoMap(new Map());
    }
  }

  useEffect(() => {
    if (open) loadItems();
  }, [open]);

  useEffect(() => {
    if (open && items.length > 0) {
      fetchPrices(items);
    }
  }, [open, items.length]);

  useEffect(() => {
    window.addEventListener("quoteCartUpdated", loadItems);
    return () => window.removeEventListener("quoteCartUpdated", loadItems);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setStep((s) => (s === "done" ? "cart" : s));
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function updateQty(productId: number, qty: number) {
    const updated = items.map((item) =>
      item.productId === productId ? { ...item, quantity: Math.max(1, qty) } : item
    );
    setItems(updated);
    localStorage.setItem("quoteCart", JSON.stringify(updated));
    window.dispatchEvent(new Event("quoteCartUpdated"));
  }

  function removeItem(productId: number) {
    const updated = items.filter((item) => item.productId !== productId);
    setItems(updated);
    localStorage.setItem("quoteCart", JSON.stringify(updated));
    window.dispatchEvent(new Event("quoteCartUpdated"));
  }

  function clearAll() {
    setItems([]);
    localStorage.removeItem("quoteCart");
    window.dispatchEvent(new Event("quoteCartUpdated"));
    onClose();
  }

  // 2026-10-19 로그인 없이도 공개가 기준으로 저장 (가격은 이미 공개, 로그인하면 우대가)
  function handleSavePdf() {
    trackEvent("quote_pdf_save");
    const header = document.querySelector("header") as HTMLElement | null;
    const main = document.querySelector("main") as HTMLElement | null;
    const hidden: HTMLElement[] = [];
    [header, main].forEach((el) => {
      if (el) { el.style.display = "none"; hidden.push(el); }
    });
    document.body.classList.add("printing-quote");
    window.print();
    hidden.forEach((el) => (el.style.display = ""));
    document.body.classList.remove("printing-quote");
  }

  if (!open) return null;

  return (
    <>

      <div data-print-skip className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[480px] bg-paper border-l hair flex flex-col shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b hair shrink-0">
          <div>
            {/* 영어 머리글·코드 글꼴 삭제(2026-10-20, 견적서 미리보기와 같은 방향) */}
            <h2 className="display text-[26px] leading-tight">
              {step === "form" ? "주문 요청" : step === "done" ? "접수 완료" : "견적서"}
            </h2>
            {step === "cart" && <div className="text-[15px] text-dim mt-1">{items.length}종 담김</div>}
            {step === "form" && (
              <button type="button" onClick={() => setStep("cart")} className="text-[15px] text-dim hover:text-ink mt-1">
                ← 견적서로 돌아가기
              </button>
            )}
          </div>
          <button
            onClick={closePanel}
            className="shrink-0 ml-4 w-11 h-11 flex items-center justify-center border hair hover:bg-ink hover:text-paper transition-colors text-[18px] leading-none"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* 접수 완료 */}
        {step === "done" && (
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="text-[40px] leading-none text-edred">✓</div>
            <p className="mt-4 text-[20px] font-bold">주문 요청이 접수되었습니다.</p>
            {doneNo && <p className="mt-2 text-[16px] tabular-nums">접수번호 <b>{doneNo}</b></p>}
            <p className="mt-3 text-[15px] text-dim leading-relaxed">
              담당자가 재고·납기를 확인한 뒤 연락드립니다.<br />
              급하시면 <a href="tel:031-204-7170" className="text-ink underline underline-offset-2">031-204-7170</a>으로 전화 주세요.
            </p>
            {isApprovedMember && (
              <Link href="/mypage" onClick={closePanel} className="inline-block mt-5 text-[15px] text-edred font-semibold underline underline-offset-2">
                마이페이지에서 진행 상황 보기 →
              </Link>
            )}
          </div>
        )}

        {/* 주문 요청 입력 */}
        {step === "form" && (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
            {isApprovedMember ? (
              <p className="text-[15px] leading-relaxed">
                <b>{sessionUser?.company || sessionUser?.name}</b> 회원 정보로 접수됩니다. 우대 가격으로 견적서가 메일로 함께 발송됩니다.
              </p>
            ) : (
              <>
                {([
                  ["company", "회사명", true, "organization"],
                  ["name", "담당자", true, "name"],
                  ["phone", "연락처", true, "tel"],
                  ["email", "이메일 (선택)", false, "email"],
                ] as const).map(([key, label, required, auto]) => (
                  <label key={key} className="block">
                    <span className="text-[14px] font-semibold">
                      {label}{required && <span className="text-edred"> *</span>}
                    </span>
                    <input
                      type={key === "phone" ? "tel" : key === "email" ? "email" : "text"}
                      autoComplete={auto}
                      value={form[key]}
                      onChange={(e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setFormError(""); }}
                      className="mt-1 w-full min-h-[48px] border border-ink/30 bg-white px-3 text-[16px] focus:outline-none focus:border-ink"
                    />
                  </label>
                ))}
                {/* 사람에게 보이지 않는 칸(자동 입력 스팸 거르기) */}
                <input
                  type="text" tabIndex={-1} autoComplete="off" aria-hidden="true"
                  value={form.website}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                  className="hidden"
                />
              </>
            )}
            <label className="block">
              <span className="text-[14px] font-semibold">요청사항 (선택)</span>
              <textarea
                rows={3}
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="희망 납기, 세금계산서, 배송지 등"
                className="mt-1 w-full border border-ink/30 bg-white px-3 py-2 text-[16px] focus:outline-none focus:border-ink"
              />
            </label>
            {!isApprovedMember && (
              <p className="text-[13px] text-dim leading-relaxed">
                입력하신 정보는 주문 확인·연락 목적으로만 사용합니다.{" "}
                <Link href="/privacy" target="_blank" className="underline underline-offset-2">개인정보처리방침</Link>
              </p>
            )}
            {formError && <p className="text-[15px] text-edred font-semibold" role="alert">{formError}</p>}
          </div>
        )}

        {/* 제품 목록 */}
        {step === "cart" && (
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-6 text-center text-dim text-sm">담긴 제품이 없습니다.</div>
          ) : (
            <div className="divide-y hair">
              {items.map((item) => {
                const info = infoMap.get(item.productId);
                const unitPrice = info?.price ?? null;
                const lineSubtotal = unitPrice != null ? unitPrice * item.quantity : null;
                const inStock = (info?.stock ?? 0) > 0;
                return (
                  <div key={item.productId} className="px-6 py-4 hover:bg-edred/[0.03] transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-[17px] font-semibold leading-snug">{item.description}</div>
                        <div className="text-[14px] text-dim mt-0.5 tabular-nums">
                          {item.partNo}
                          {info && (
                            <span className={inStock ? "text-edred font-semibold" : ""}>
                              {" · "}{inStock ? `재고 ${info.stock}` : leadTimeLabel(info.category, item.description)}
                            </span>
                          )}
                        </div>
                        {lineSubtotal != null && (
                          <div className="text-[14px] text-dim mt-1.5 tabular-nums">
                            {unitPrice!.toLocaleString("ko-KR")}원 × {item.quantity} ={" "}
                            <span className="text-ink font-bold text-[16px]">{lineSubtotal.toLocaleString("ko-KR")}원</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            updateQty(item.productId, parseInt(e.target.value) || 1)
                          }
                          className="w-16 min-h-[44px] border hair px-1 py-2 text-[15px] text-center focus:outline-none focus:border-ink bg-transparent"
                          aria-label="수량"
                        />
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="min-h-[44px] min-w-[44px] px-3 py-2 text-[18px] border hair border-ink/20 hover:bg-edred hover:text-paper hover:border-edred transition-colors leading-none"
                          aria-label="삭제"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        )}

        {/* 푸터 — 주문 요청 입력 중 */}
        {step === "form" && (
          <div className="pl-6 pr-24 py-4 border-t hair shrink-0 space-y-2">
            <button
              onClick={submitOrder}
              disabled={submitting || items.length === 0}
              className="w-full py-4 bg-edred text-paper text-[17px] font-semibold hover:bg-ink disabled:opacity-50 transition-colors"
            >
              {submitting ? "접수 중…" : "주문 요청 보내기"}
            </button>
          </div>
        )}

        {/* 푸터 — 접수 완료 */}
        {step === "done" && (
          <div className="pl-6 pr-24 py-4 border-t hair shrink-0">
            <button onClick={closePanel} className="w-full py-4 bg-ink text-paper text-[17px] font-semibold hover:bg-edred transition-colors">
              닫기
            </button>
          </div>
        )}

        {/* 푸터 — 견적서 */}
        {step === "cart" && items.length > 0 && (
          <div className="pl-6 pr-24 py-4 border-t hair shrink-0 space-y-2">
            {/* 소계 합계 */}
            {(() => {
              const total = items.reduce((sum, item) => {
                const up = infoMap.get(item.productId)?.price ?? null;
                return up != null ? sum + up * item.quantity : sum;
              }, 0);
              const hasPrices = items.some((item) => infoMap.get(item.productId)?.price != null);
              if (!hasPrices) return null;
              // 미리보기 화면과 같은 계산(부가세 10% 반올림)
              const vat = Math.round(total * 0.1);
              return (
                <div className="py-2 border-b hair mb-1 tabular-nums">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[15px] font-semibold">합계 (부가세 포함)</span>
                    <span className="text-[22px] font-bold">{(total + vat).toLocaleString("ko-KR")}원</span>
                  </div>
                  <div className="flex justify-between text-[14px] text-dim mt-0.5">
                    <span>공급가 {total.toLocaleString("ko-KR")}원</span>
                    <span>부가세 {vat.toLocaleString("ko-KR")}원</span>
                  </div>
                </div>
              );
            })()}
            <button
              onClick={openForm}
              className="w-full py-4 bg-edred text-paper text-[17px] font-semibold hover:bg-ink transition-colors"
            >
              주문 요청하기 →
            </button>
            <button
              onClick={handleSavePdf}
              className="w-full py-3.5 border border-ink/40 bg-white text-[16px] font-semibold hover:bg-ink hover:text-paper transition-colors"
            >
              견적서 PDF 저장
            </button>
            <button
              onClick={clearAll}
              className="w-full py-1.5 text-[14px] text-dim underline underline-offset-2 hover:text-ink transition-colors"
            >
              전체 비우기
            </button>
            <div className="text-[14px] text-ink/80 pt-1">
              {/* 로그인 상태별 안내 — 관리자는 배율 1.00이라 원가가 보이므로 고객 화면과 헷갈리지 않게(10/21) */}
              {/* 로그인 확인 중엔 비워 둔다 — 회원에게 비회원 문구가 잠깐 보이지 않게(코드 리뷰 10/21) */}
              {status === "loading"
                ? null
                : !session
                ? "※ 로그인 없이 공개가로 요청·저장됩니다."
                : sessionUser?.tier === "ADMIN"
                  ? "※ 관리자 계정이라 원가로 표시됩니다. 고객에게는 공개가로 보입니다."
                  : isApprovedMember
                    ? "※ 귀사 적용가로 계산됩니다."
                    : "※ 지금은 공개가 기준입니다. 회원 승인이 끝나면 회원가로 다시 안내해 드립니다."}
              {status === "unauthenticated" && (
                <>
                  {" "}회원은{" "}
                  <Link href="/auth/login" onClick={onClose} className="underline underline-offset-2 text-ink hover:text-edred">
                    로그인
                  </Link>
                  하면 우대 가격이 적용됩니다.
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
