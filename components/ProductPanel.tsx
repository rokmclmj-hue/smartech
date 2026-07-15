"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { SPEC_DATA } from "@/lib/product-specs";

type Product = {
  id: number;
  partNo: string;
  description: string;
  displayPrice: number | null;
  priceStatus: "login" | "pending" | "visible";
  category: string;
  isImportant: boolean;
};

export type PanelItem = {
  category: string;
  code: string;
  title: string;
  image: string;
};

type Props = {
  item: PanelItem | null;
  onClose: () => void;
  catalogUrl?: string;
};

function formatKRW(v: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(v);
}

export default function ProductPanel({ item, onClose, catalogUrl }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [added, setAdded] = useState<Set<number>>(new Set());
  const [showSpec, setShowSpec] = useState(false);
  const [bizModalOpen, setBizModalOpen] = useState(false);
  const [bizNo, setBizNo] = useState("");
  const [bizLoading, setBizLoading] = useState(false);
  const [bizError, setBizError] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpContact, setOtpContact] = useState("");

  async function handleBizVerify(e: React.FormEvent) {
    e.preventDefault();
    setBizError("");
    setBizLoading(true);
    try {
      const res = await fetch("/api/auth/biz-login-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessNo: bizNo.replace(/[^0-9]/g, "") }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBizError(data.error ?? "유효하지 않은 사업자번호입니다.");
        return;
      }
      if (data.mode === "otp_sent") {
        setOtpContact(data.maskedPhone ?? data.maskedEmail ?? "등록된 연락처");
        setOtpStep(true);
        return;
      }
      const result = await signIn("credentials", {
        businessNo: bizNo.replace(/[^0-9]/g, ""),
        redirect: false,
      });
      if (result?.ok) { setBizModalOpen(false); window.location.reload(); }
      else { setBizError("로그인에 실패했습니다. 다시 시도해 주세요."); }
    } catch { setBizError("네트워크 오류가 발생했습니다."); }
    finally { setBizLoading(false); }
  }

  async function handleOtpVerify(e: React.FormEvent) {
    e.preventDefault();
    setBizError("");
    setBizLoading(true);
    try {
      const result = await signIn("credentials", { magicToken: otpCode.trim(), redirect: false });
      if (result?.ok) { setBizModalOpen(false); window.location.reload(); }
      else { setBizError("인증번호가 올바르지 않거나 만료됐습니다."); }
    } catch { setBizError("네트워크 오류가 발생했습니다."); }
    finally { setBizLoading(false); }
  }

  const specData = item ? SPEC_DATA[item.category] : undefined;

  // ESC: 스펙 패널 먼저 닫고, 없으면 메인 패널 닫기
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showSpec) setShowSpec(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, showSpec]);

  // 카테고리 바뀌면 제품 목록 새로 가져오기 + 스펙 패널 초기화
  useEffect(() => {
    if (!item) {
      setProducts([]);
      setShowSpec(false);
      return;
    }
    setLoading(true);
    setQuantities({});
    setAdded(new Set());
    setShowSpec(false);
    const params = new URLSearchParams({ category: item.category, limit: "200" });
    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [item?.category]);

  // 패널 열릴 때 배경 스크롤 막기
  useEffect(() => {
    if (item) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [item]);

  function addToQuote(product: Product, qty: number) {
    const stored: { productId: number; partNo: string; description: string; quantity: number }[] =
      JSON.parse(localStorage.getItem("quoteCart") ?? "[]");
    const existing = stored.find((i) => i.productId === product.id);
    if (existing) {
      existing.quantity += qty;
    } else {
      stored.push({
        productId: product.id,
        partNo: product.partNo,
        description: product.description,
        quantity: qty,
      });
    }
    localStorage.setItem("quoteCart", JSON.stringify(stored));
    window.dispatchEvent(new Event("quoteCartUpdated"));

    setAdded((prev) => new Set([...prev, product.id]));
    setTimeout(() => {
      setAdded((prev) => {
        const s = new Set(prev);
        s.delete(product.id);
        return s;
      });
    }, 2000);
  }

  if (!item) return null;

  return (
    <>
      {/* ── 우대가 확인 모달 ── */}
      {bizModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 px-4" onClick={() => setBizModalOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold text-smblue text-base">우대가 확인</p>
                <p className="text-[11px] text-gray-400 mt-0.5">사업자등록번호로 로그인 후 우대 금액 확인</p>
              </div>
              <button onClick={() => setBizModalOpen(false)} className="text-gray-300 hover:text-gray-500 text-xl leading-none">✕</button>
            </div>
            {!otpStep ? (
              <form onSubmit={handleBizVerify} className="space-y-3">
                <input type="text" value={bizNo} onChange={(e) => setBizNo(e.target.value)} required autoFocus
                  placeholder="사업자등록번호 10자리" maxLength={12}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-smblue/30 bg-gray-50" />
                {bizError && <p className="text-red-500 text-xs">{bizError}</p>}
                <button type="submit" disabled={bizLoading}
                  className="w-full bg-smblue hover:bg-smblue/90 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                  {bizLoading ? "확인 중..." : "로그인하기"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpVerify} className="space-y-3">
                <p className="text-[11px] text-gray-400">{otpContact}로 보낸 인증번호 6자리를 입력해주세요</p>
                <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))} required autoFocus
                  placeholder="인증번호 6자리" maxLength={6}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-center tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-smblue/30 bg-gray-50" />
                {bizError && <p className="text-red-500 text-xs">{bizError}</p>}
                <button type="submit" disabled={bizLoading}
                  className="w-full bg-smblue hover:bg-smblue/90 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                  {bizLoading ? "확인 중..." : "인증하고 로그인"}
                </button>
                <button type="button" onClick={() => { setOtpStep(false); setOtpCode(""); setBizError(""); }}
                  className="w-full text-[12px] text-gray-400 hover:text-gray-600 py-1">
                  ← 다시 입력하기
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── 스펙 비교 패널 ── */}
      {showSpec && specData && (
        <div className="fixed inset-0 md:inset-auto md:top-0 md:bottom-0 md:right-[480px] md:left-0 z-[60] bg-paper border-r hair flex flex-col shadow-2xl">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-5 py-4 border-b hair shrink-0">
            <div className="display text-[17px]">스펙 비교</div>
            <button
              onClick={() => setShowSpec(false)}
              className="text-[12px] mono text-dim hover:text-ink transition-colors"
            >
              닫기 →
            </button>
          </div>

          {/* 스펙 표 */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[14px]">
                <thead>
                  <tr className="bg-ink text-paper">
                    <th className="text-left px-4 py-3 mono text-[12px] tracking-wider w-[42%]">스펙 항목</th>
                    {specData.models.map((m) => (
                      <th key={m} className="px-3 py-3 text-center display text-[18px]">{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {specData.rows.map((row, i) => (
                    <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-paper"}>
                      <td className="px-4 py-3 text-[13px] text-[#2a2823] leading-snug">
                        {row.label}
                        {row.unit && <span className="block text-[11px] dim">{row.unit}</span>}
                      </td>
                      {row.values.map((v, j) => (
                        <td key={j} className="px-3 py-3 text-center mono text-[13px] tabular-nums">{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[10px] dim mono">※ 60 Hz 기준 (국내 전원). 카탈로그 원본 기준.</p>

            {/* 연락처 */}
            <div className="mt-6 border-t hair pt-5">
              <div className="mono text-[10px] tracking-widest text-dim mb-3">수량 · 납기 · 커스텀 사양 문의</div>
              <div className="flex flex-col gap-2">
                <a href="tel:031-204-7170" className="flex items-center gap-2 group">
                  <span className="bg-edred text-paper mono text-[11px] px-2.5 py-1 tracking-wider">CALL</span>
                  <span className="display text-[18px] group-hover:text-edred transition-colors">031-204-7170</span>
                </a>
                <a href="mailto:info@smartechvacuum.com" className="flex items-center gap-2 group">
                  <span className="bg-ink text-paper mono text-[11px] px-2.5 py-1 tracking-wider">MAIL</span>
                  <span className="mono text-[13px] text-dim group-hover:text-ink transition-colors">info@smartechvacuum.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 메인 패널 ── */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[480px] bg-paper border-l hair flex flex-col shadow-2xl">

        {/* 헤더 */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b hair shrink-0">
          <div>
            <div className="mono text-[10px] tracking-[0.16em] uppercase text-dim">{item.code}</div>
            <h2 className="display text-[22px] leading-tight mt-1">{item.title}</h2>
            <div className="mono text-[11px] text-dim mt-1">{item.category}</div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 ml-4 w-8 h-8 flex items-center justify-center border hair hover:bg-ink hover:text-paper transition-colors text-[18px] leading-none"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* 이미지 + 버튼 */}
        <div className="px-6 py-5 border-b hair bg-white shrink-0">
          <div className="aspect-[3/2] relative">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-contain"
              sizes="480px"
              priority={false}
            />
          </div>
          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {specData && (
                <button
                  onClick={() => setShowSpec(!showSpec)}
                  className="text-[11px] mono text-ink hover:text-edred transition-colors"
                >
                  ← 스펙 비교
                </button>
              )}
              {catalogUrl && (
                <a
                  href={catalogUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] mono text-edred hover:underline font-medium tracking-[0.06em]"
                >
                  카탈로그 PDF →
                </a>
              )}
            </div>
            {products.some(p => p.priceStatus === "login") && (
              <button
                onClick={() => setBizModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-edred text-paper text-[11px] font-semibold rounded-full hover:bg-edred3 transition-colors whitespace-nowrap"
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-paper shrink-0" />
                우대가 확인
              </button>
            )}
          </div>
        </div>

        {/* 제품 목록 — 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-14 bg-line/50 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-6 text-center text-dim text-sm">
              제품 정보를 불러올 수 없습니다.
            </div>
          ) : (
            <div className="divide-y hair">
              {products.map((product) => {
                const qty = quantities[product.id] ?? 1;
                const isAdded = added.has(product.id);
                return (
                  <div
                    key={product.id}
                    className={`px-4 py-3 transition-colors ${
                      isAdded ? "bg-ink/[0.03]" : "hover:bg-edred/[0.03]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* 제품 정보 */}
                      <div className="flex-1 min-w-0">
                        {product.isImportant && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-edred mr-1.5 mb-0.5 align-middle" />
                        )}
                        <span className="mono text-[11px] text-dim">{product.partNo}</span>
                        <div className="text-[13px] leading-snug mt-0.5">{product.description}</div>
                        <div className="mt-1">
                          {product.priceStatus === "visible" && product.displayPrice ? (
                            <span className="mono text-[12px] font-semibold">
                              {formatKRW(product.displayPrice)}
                            </span>
                          ) : product.priceStatus === "pending" ? (
                            <span className="mono text-[11px] text-dim">승인 대기</span>
                          ) : (
                            <button
                              onClick={() => setBizModalOpen(true)}
                              className="flex items-center gap-1 text-[11px] text-edred font-medium hover:opacity-75 transition-opacity"
                            >
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-edred shrink-0" />
                              우대가 확인
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 수량 + 담기 */}
                      <div className="flex flex-col items-end gap-1 shrink-0 mt-0.5">
                      {product.priceStatus === "login" && (
                        <button
                          onClick={() => setBizModalOpen(true)}
                          className="flex items-center gap-1 text-[10px] text-edred font-semibold hover:opacity-75 transition-opacity whitespace-nowrap"
                        >
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-edred shrink-0" />
                          우대가 확인
                        </button>
                      )}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={1}
                          value={qty}
                          onChange={(e) =>
                            setQuantities((prev) => ({
                              ...prev,
                              [product.id]: Math.max(1, parseInt(e.target.value) || 1),
                            }))
                          }
                          className="w-12 border hair px-1 py-1.5 text-[12px] text-center focus:outline-none focus:border-ink bg-transparent"
                          aria-label="수량"
                        />
                        <button
                          onClick={() => addToQuote(product, qty)}
                          className={`px-2.5 py-1.5 text-[11px] mono tracking-wider border transition-colors whitespace-nowrap ${
                            isAdded
                              ? "bg-ink text-paper border-ink"
                              : "border-ink/40 hover:bg-ink hover:text-paper hover:border-ink"
                          }`}
                        >
                          {isAdded ? "✓" : "담기"}
                        </button>
                      </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="px-6 py-3 border-t hair shrink-0">
          <div className="mono text-[10px] text-dim">
            ※ 로그인 시 우대 가격 적용 · 가격은 VAT 별도
          </div>
        </div>
      </div>
    </>
  );
}
