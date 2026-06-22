"use client";

import { Suspense } from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/lib/toast";

// ── 타입 ────────────────────────────────────────────────────────────────────

type CustomerResult = {
  source: "user" | "known";
  id: number;
  company: string;
  name: string;
  phone: string;
  email: string;
  tier: string;
  paymentTerm: string | null;
  contacts: { name: string; title: string | null; mobile: string | null; email: string | null }[];
};

type ProductHit = {
  id: number;
  partNo: string;
  description: string;
  category: string | null;
  stock: number;
  unitPrice: number;
};

type LineItem = {
  key: string;
  productId: number | null;
  partNo: string;
  description: string;
  quantity: number;
  unitPrice: number;
  defaultUnitPrice: number;
  leadTime: string;
};

type GuestForm = {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  tier: string;
};

type KnownContact = {
  id: number;
  name: string;
  title: string | null;
  tel: string | null;
  mobile: string | null;
  email: string | null;
};

type KnownCompanyHit = {
  id: number;
  companyName: string;
  phone: string | null;
  email: string | null;
  tier: string;
  contacts: KnownContact[];
};

type HistoryItem = {
  id: number;
  quoteNo: string;
  createdAt: string;
  company: string;
  contactName: string;
  contactTitle: string | null;
  email: string | null;
  phone: string | null;
  tier: string;
  isGuest: boolean;
  subtotal: number;
  itemCount: number;
  previewItems: { partNo: string; description: string; quantity: number; unitPrice: number; leadTime?: string }[];
};

// ── 상수 ────────────────────────────────────────────────────────────────────

const TIER_LABEL: Record<string, string> = {
  ENDUSER: "엔드유저",
  OEM: "OEM",
  DEALER: "딜러",
  KEY_DEALER: "키딜러",
  VIP_DEALER: "VIP 딜러",
};

const TIER_OPTIONS = ["ENDUSER", "OEM", "DEALER", "KEY_DEALER", "VIP_DEALER"];

const PAY_OPTIONS = [
  { value: "a", label: "납품 전 현금" },
  { value: "b", label: "계약30%/납품전70%" },
  { value: "d", label: "계약30%/익월말일70%" },
  { value: "e", label: "정기결제(익월말일)" },
  { value: "c", label: "직접 입력" },
];

function fmt(n: number) {
  return new Intl.NumberFormat("ko-KR").format(Math.round(n)) + "원";
}

function useDebounce<T>(value: T, delay = 250): T {
  const [dv, setDv] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return dv;
}

// ── 컴포넌트 ─────────────────────────────────────────────────────────────────

export default function AdminProxyQuotesPage() {
  return (
    <Suspense>
      <AdminProxyQuotesInner />
    </Suspense>
  );
}

function AdminProxyQuotesInner() {
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // 통합 고객 검색
  const [customerQ, setCustomerQ] = useState("");
  const debouncedQ = useDebounce(customerQ);
  const [customerHits, setCustomerHits] = useState<CustomerResult[]>([]);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [customerLoading, setCustomerLoading] = useState(false);
  const customerBoxRef = useRef<HTMLDivElement>(null);

  // 선택된 고객 (회원 or 거래처)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerResult | null>(null);

  // 직접 입력 (수동)
  const [showDirect, setShowDirect] = useState(false);
  const [guest, setGuest] = useState<GuestForm>({
    name: "", title: "", company: "", email: "", phone: "", tier: "ENDUSER",
  });
  const [selectedContacts, setSelectedContacts] = useState<KnownContact[]>([]);

  // 이력 불러오기 모달
  const [showHistory, setShowHistory] = useState(false);
  const [historyQ, setHistoryQ] = useState("");
  const debouncedHistoryQ = useDebounce(historyQ);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedCompanyName, setSelectedCompanyName] = useState<string | null>(null);

  // 상품 검색
  const [productQ, setProductQ] = useState("");
  const debouncedProductQ = useDebounce(productQ);
  const [productHits, setProductHits] = useState<ProductHit[]>([]);
  const [productOpen, setProductOpen] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const productBoxRef = useRef<HTMLDivElement>(null);

  // 붙여넣기 입력
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteLoading, setPasteLoading] = useState(false);
  const [pasteErrors, setPasteErrors] = useState<string[]>([]);

  // 견적 품목
  const [lines, setLines] = useState<LineItem[]>([]);

  // 발행 결과 — URL ?done=N 으로도 복원 가능
  const [submitting, setSubmitting] = useState(false);
  const doneParam = searchParams.get("done");
  const [doneQuoteId, setDoneQuoteId] = useState<number | null>(
    doneParam ? parseInt(doneParam) : null
  );
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [attachFiles, setAttachFiles] = useState<{ name: string; base64: string; contentType: string }[]>([]);
  const [sentAttachCount, setSentAttachCount] = useState(0);

  // 저장된 회사 서류 (사업자등록증·통장사본)
  type DocInfo = { url: string | null; name: string | null };
  const [savedDocs, setSavedDocs] = useState<{ biz: DocInfo; bank: DocInfo }>({
    biz: { url: null, name: null }, bank: { url: null, name: null },
  });
  const [attachBiz, setAttachBiz]   = useState(false);
  const [attachBank, setAttachBank] = useState(false);

  // 결제조건
  const [paymentTerm, setPaymentTerm] = useState<string | null>(null);

  // 비고
  const [note, setNote] = useState("");

  // 거래처 저장 옵션
  const [saveToCompany, setSaveToCompany] = useState(true);

  // 미리보기 모달
  const [showPreview, setShowPreview] = useState(false);

  // 현재 활성 tier / 고객 확정 여부
  const activeTier = selectedCustomer?.tier ?? guest.tier ?? "ENDUSER";
  const hasCustomer = !!selectedCustomer || (showDirect && !!guest.company.trim());

  // ── 저장된 회사 서류 로드 ────────────────────────────────
  useEffect(() => {
    fetch("/api/admin/company-docs")
      .then((r) => r.json())
      .then((d) => setSavedDocs(d))
      .catch(() => null);
  }, []);

  // ── 외부 클릭 닫기 ──────────────────────────────────────

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (customerBoxRef.current && !customerBoxRef.current.contains(e.target as Node))
        setCustomerOpen(false);
      if (productBoxRef.current && !productBoxRef.current.contains(e.target as Node))
        setProductOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // ── 통합 고객 검색 ────────────────────────────────────────

  useEffect(() => {
    const q = debouncedQ.trim();
    if (!q) { setCustomerHits([]); return; }
    let abort = false;
    setCustomerLoading(true);
    fetch(`/api/admin/customers/unified-search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => { if (!abort) setCustomerHits(d.items ?? []); })
      .catch(() => { if (!abort) setCustomerHits([]); })
      .finally(() => { if (!abort) setCustomerLoading(false); });
    return () => { abort = true; };
  }, [debouncedQ]);

  // ── 이력 불러오기 ─────────────────────────────────────────

  useEffect(() => {
    if (!showHistory) return;
    let abort = false;
    setHistoryLoading(true);
    fetch(`/api/admin/proxy-quotes/history?q=${encodeURIComponent(debouncedHistoryQ)}`)
      .then((r) => r.json())
      .then((d) => { if (!abort) setHistoryItems(d.items ?? []); })
      .catch(() => { if (!abort) setHistoryItems([]); })
      .finally(() => { if (!abort) setHistoryLoading(false); });
    return () => { abort = true; };
  }, [showHistory, debouncedHistoryQ]);

  // ── 상품 검색 ────────────────────────────────────────────

  const canSearchProduct = hasCustomer;

  useEffect(() => {
    const q = debouncedProductQ.trim();
    if (!q || !canSearchProduct) { setProductHits([]); return; }
    let abort = false;
    setProductLoading(true);
    fetch(`/api/admin/products/search?q=${encodeURIComponent(q)}&tier=${encodeURIComponent(activeTier)}`)
      .then((r) => r.json())
      .then((d) => { if (!abort) setProductHits(d.items ?? []); })
      .catch(() => { if (!abort) setProductHits([]); })
      .finally(() => { if (!abort) setProductLoading(false); });
    return () => { abort = true; };
  }, [debouncedProductQ, canSearchProduct, activeTier]);

  // ── 고객 조작 ────────────────────────────────────────────

  function selectCustomer(c: CustomerResult) {
    setSelectedCustomer(c);
    setCustomerQ("");
    setCustomerOpen(false);
    setShowDirect(false);
    setSelectedContacts(c.contacts as KnownContact[]);
    setSelectedCompanyName(c.source === "known" ? c.company : null);
    setGuest({ company: c.company, name: c.name, title: "", phone: c.phone, email: c.email, tier: c.tier });
    setPaymentTerm(c.paymentTerm ?? null);
  }

  function clearCustomer() {
    setSelectedCustomer(null);
    setCustomerQ("");
    setLines([]);
    setSelectedContacts([]);
    setSelectedCompanyName(null);
    setShowDirect(false);
    setGuest({ name: "", title: "", company: "", email: "", phone: "", tier: "ENDUSER" });
    setPaymentTerm(null);
    setAttachFiles([]);
  }

  function selectContact(ct: KnownContact) {
    setGuest((g) => ({
      ...g,
      name: ct.name,
      title: ct.title ?? g.title,
      phone: ct.mobile ?? ct.tel ?? g.phone,
      email: ct.email ?? g.email,
    }));
    if (selectedCustomer) {
      setSelectedCustomer({
        ...selectedCustomer,
        name: ct.name,
        phone: ct.mobile ?? ct.tel ?? selectedCustomer.phone,
        email: ct.email ?? selectedCustomer.email,
      });
    }
  }

  function openHistoryForCompany(companyName: string) {
    setHistoryQ(companyName);
    setShowHistory(true);
  }

  function openHistoryAll() {
    setHistoryQ("");
    setShowHistory(true);
  }

  function loadFromHistory(h: HistoryItem) {
    // 고객 정보 복원
    setShowDirect(false);
    setGuest({ company: h.company, name: h.contactName, title: h.contactTitle ?? "", email: h.email ?? "", phone: h.phone ?? "", tier: h.tier });
    setSelectedCustomer({ source: "known", id: 0, company: h.company, name: h.contactName, phone: h.phone ?? "", email: h.email ?? "", tier: h.tier, paymentTerm: null, contacts: [] });
    setSelectedCompanyName(h.company);
    // 품목 복원
    const restoredLines: LineItem[] = h.previewItems.map((item, idx) => ({
      key: `hist_${h.id}_${idx}`,
      productId: null,
      partNo: item.partNo,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      defaultUnitPrice: item.unitPrice,
      leadTime: item.leadTime ?? "",
    }));
    setLines(restoredLines);
    setShowHistory(false);
    toast.info(`"${h.company}" 견적을 불러왔습니다. 필요한 부분만 수정 후 발행하세요.`);
  }

  // ── 상품 조작 ────────────────────────────────────────────

  function addProduct(p: ProductHit) {
    setLines((prev) => {
      const ex = prev.find((l) => l.productId === p.id);
      if (ex) return prev.map((l) => l.productId === p.id ? { ...l, quantity: l.quantity + 1 } : l);
      return [...prev, {
        key: String(p.id), productId: p.id, partNo: p.partNo, description: p.description,
        quantity: 1, unitPrice: p.unitPrice, defaultUnitPrice: p.unitPrice, leadTime: "",
      }];
    });
    setProductQ("");
    setProductOpen(false);
  }

  function addCustomLine() {
    const key = `custom_${Date.now()}`;
    setLines((prev) => [...prev, {
      key, productId: null, partNo: "", description: "",
      quantity: 1, unitPrice: 0, defaultUnitPrice: 0, leadTime: "",
    }]);
  }

  function updateQty(key: string, qty: number) {
    if (!Number.isFinite(qty) || qty < 1) qty = 1;
    setLines((prev) => prev.map((l) => l.key === key ? { ...l, quantity: qty } : l));
  }

  function updatePrice(key: string, price: number) {
    if (!Number.isFinite(price) || price < 0) price = 0;
    setLines((prev) => prev.map((l) => l.key === key ? { ...l, unitPrice: price } : l));
  }

  function updateDescription(key: string, desc: string) {
    setLines((prev) => prev.map((l) => l.key === key ? { ...l, description: desc } : l));
  }

  function updatePartNo(key: string, partNo: string) {
    setLines((prev) => prev.map((l) => l.key === key ? { ...l, partNo } : l));
  }

  function updateLeadTime(key: string, leadTime: string) {
    setLines((prev) => prev.map((l) => l.key === key ? { ...l, leadTime } : l));
  }

  function removeLine(key: string) {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }

  // ── 붙여넣기 입력 파서 ────────────────────────────────────
  // 형식: 한 줄에 "파트번호 수량" 또는 "파트번호, 수량" 또는 파트번호만

  async function parsePaste() {
    const raw = pasteText.trim();
    if (!raw) return;
    setPasteLoading(true);
    setPasteErrors([]);

    const parsed: { partNo: string; qty: number }[] = [];
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      // 탭, 콤마, 공백으로 분리
      const parts = trimmed.split(/[\t,]+/).map((s) => s.trim()).filter(Boolean);
      const partNo = parts[0].toUpperCase();
      // 마지막 숫자 토큰을 수량으로
      const qtyStr = parts.slice(1).reverse().find((p) => /^\d+$/.test(p));
      const qty = qtyStr ? parseInt(qtyStr) : 1;
      parsed.push({ partNo, qty });
    }

    if (!parsed.length) { setPasteLoading(false); return; }

    try {
      const res = await fetch("/api/admin/products/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partNos: parsed.map((p) => p.partNo), tier: activeTier }),
      });
      const data = await res.json();
      const found: ProductHit[] = data.found ?? [];
      const notFound: string[] = data.notFound ?? [];

      // 찾은 품목 추가
      setLines((prev) => {
        let next = [...prev];
        for (const p of found) {
          const qtyRow = parsed.find((r) => r.partNo === p.partNo);
          const qty = qtyRow?.qty ?? 1;
          const ex = next.find((l) => l.productId === p.id);
          if (ex) {
            next = next.map((l) => l.productId === p.id ? { ...l, quantity: l.quantity + qty } : l);
          } else {
            next.push({
              key: String(p.id), productId: p.id, partNo: p.partNo, description: p.description,
              quantity: qty, unitPrice: p.unitPrice, defaultUnitPrice: p.unitPrice, leadTime: "",
            });
          }
        }
        return next;
      });

      if (notFound.length > 0) {
        setPasteErrors(notFound);
        toast.info(`${found.length}건 추가됨. ${notFound.length}건 미조회: ${notFound.join(", ")}`);
      } else {
        toast.success(`${found.length}건 추가됐습니다.`);
        setPasteText("");
        setShowPaste(false);
      }
    } catch {
      toast.error("조회 중 오류가 발생했습니다.");
    } finally {
      setPasteLoading(false);
    }
  }

  // ── 견적 발행 ────────────────────────────────────────────

  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const vat = Math.round(subtotal * 0.1);
  const total = subtotal + vat;

  async function submitQuote() {
    if (lines.length === 0) { toast.error("상품을 1개 이상 추가해주세요."); return; }
    if (!hasCustomer) { toast.error("고객을 먼저 선택해주세요."); return; }
    if (!guest.company.trim()) { toast.error("상호를 입력해주세요."); return; }

    setSubmitting(true);
    try {
      const itemsPayload = lines.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        leadTime: l.leadTime || undefined,
        customPartNo: l.partNo || undefined,
        customDescription: l.description || undefined,
      }));
      // 홈페이지 등록 회원이면 customerId, 거래처/직접입력이면 guest
      const body =
        selectedCustomer?.source === "user"
          ? { customerId: selectedCustomer.id, items: itemsPayload, paymentTerm: paymentTerm ?? undefined, note: note || undefined }
          : { guest, items: itemsPayload, paymentTerm: paymentTerm ?? undefined, note: note || undefined, saveToCompany: showDirect ? saveToCompany : false };

      const res = await fetch("/api/admin/proxy-quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { toast.error(data.error ?? "견적서 발행에 실패했습니다."); return; }
      setDoneQuoteId(data.quoteId);
      router.replace(`/admin/proxy-quotes?done=${data.quoteId}`);
    } catch {
      toast.error("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── 메일 발송 ────────────────────────────────────────────

  async function handleAttachFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const oversized = files.filter((f) => f.size > 2 * 1024 * 1024);
    if (oversized.length > 0) {
      toast.error(`파일 크기는 2MB 이하만 가능합니다: ${oversized.map((f) => f.name).join(", ")}`);
      e.target.value = "";
      return;
    }
    try {
      const results = await Promise.all(
        files.map(
          (f) =>
            new Promise<{ name: string; base64: string; contentType: string }>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result as string;
                resolve({ name: f.name, base64: result.split(",")[1], contentType: f.type });
              };
              reader.onerror = () => reject(new Error(`"${f.name}" 파일을 읽을 수 없습니다.`));
              reader.readAsDataURL(f);
            })
        )
      );
      setAttachFiles((prev) => [...prev, ...results]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "파일 읽기 오류가 발생했습니다.");
    } finally {
      e.target.value = "";
    }
  }

  async function sendMail() {
    if (!doneQuoteId) return;
    setSending(true);
    try {
      const blobAttachments = [
        ...(attachBiz && savedDocs.biz.url
          ? [{ url: savedDocs.biz.url, filename: savedDocs.biz.name ?? "사업자등록증.pdf", contentType: "application/pdf" }]
          : []),
        ...(attachBank && savedDocs.bank.url
          ? [{ url: savedDocs.bank.url, filename: savedDocs.bank.name ?? "통장사본.pdf", contentType: "application/pdf" }]
          : []),
      ];
      const res = await fetch(`/api/admin/quotes/${doneQuoteId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attachments: attachFiles.map((f) => ({
            filename: f.name,
            base64: f.base64,
            contentType: f.contentType,
          })),
          blobAttachments,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { toast.error(data.error ?? "메일 발송에 실패했습니다."); return; }
      setSentAttachCount(attachFiles.length + blobAttachments.length);
      setSent(true);
      setAttachFiles([]);
      setAttachBiz(false);
      setAttachBank(false);
      toast.success(`견적서를 ${data.sentTo}로 발송했습니다.`);
    } catch {
      toast.error("네트워크 오류가 발생했습니다.");
    } finally {
      setSending(false);
    }
  }

  // ── 발행 완료 화면 ────────────────────────────────────────

  if (doneQuoteId) {
    const recipientEmail = selectedCustomer?.email ?? guest.email;
    const recipientName = selectedCustomer?.company ?? guest.company;

    return (
      <div className="px-4 sm:px-6 py-10 max-w-[700px] mx-auto">
        <div className="border hair rounded-md p-8 text-center space-y-6">
          <div className="mono text-[11px] tracking-[0.15em] text-edred uppercase">
            ● 견적서 발행 완료
          </div>
          <div>
            <div className="text-[28px] font-bold text-ink">
              SMT-{new Date().getFullYear()}-Q-{String(doneQuoteId).padStart(6, "0")}
            </div>
            <div className="text-[13px] dim mt-1">
              {recipientName}
              {lines.length > 0 && (
                <span className="ml-2 text-[12px]">
                  · {lines[0].description || lines[0].partNo || "품목"} x {lines[0].quantity}ea{lines.length > 1 ? " 외" : ""}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 max-w-[320px] mx-auto">
            {/* 첨부 서류 (사업자등록증·통장사본) */}
            {!sent && recipientEmail && (
              <div className="border hair rounded-md px-4 py-3 space-y-2">
                <div className="mono text-[10px] tracking-[0.12em] dim uppercase">첨부 서류 (선택)</div>

                {/* 저장된 서류 체크박스 */}
                {(savedDocs.biz.url || savedDocs.bank.url) && (
                  <div className="space-y-1.5">
                    {savedDocs.biz.url && (
                      <label className="flex items-center gap-2 cursor-pointer text-[12px] text-ink">
                        <input type="checkbox" checked={attachBiz} onChange={(e) => setAttachBiz(e.target.checked)} className="accent-smblue" />
                        <span>사업자등록증</span>
                        <span className="dim text-[11px] truncate max-w-[140px]">({savedDocs.biz.name})</span>
                      </label>
                    )}
                    {savedDocs.bank.url && (
                      <label className="flex items-center gap-2 cursor-pointer text-[12px] text-ink">
                        <input type="checkbox" checked={attachBank} onChange={(e) => setAttachBank(e.target.checked)} className="accent-smblue" />
                        <span>통장사본</span>
                        <span className="dim text-[11px] truncate max-w-[140px]">({savedDocs.bank.name})</span>
                      </label>
                    )}
                    <div className="border-t hair pt-1.5" />
                  </div>
                )}

                {/* 임시 파일 선택 */}
                <label className="flex items-center gap-2 cursor-pointer text-[12px] dim hover:text-ink transition-colors">
                  <span>📎 추가 파일 선택</span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleAttachFiles}
                    className="hidden"
                  />
                </label>
                {attachFiles.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <span className="truncate dim">{f.name}</span>
                    <button
                      onClick={() => setAttachFiles((prev) => prev.filter((_, j) => j !== i))}
                      className="text-[10px] dim hover:text-edred ml-2 shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {!savedDocs.biz.url && !savedDocs.bank.url && (
                  <p className="text-[11px] dim">
                    사업자등록증·통장사본을 미리 등록하려면{" "}
                    <a href="/admin/settings" className="text-smblue hover:underline">설정 페이지</a>에서 업로드하세요.
                  </p>
                )}
              </div>
            )}

            {/* 메일 발송 */}
            {recipientEmail ? (
              sent ? (
                <div className="border border-green-500/40 rounded-md px-4 py-3 text-[13px] text-green-600">
                  ✓ {recipientEmail} 발송 완료{sentAttachCount > 0 ? ` (+첨부 ${sentAttachCount}건)` : ""}
                </div>
              ) : (
                <button
                  onClick={sendMail}
                  disabled={sending}
                  className="bg-edred text-white px-4 py-3 rounded-md text-[14px] font-semibold hover:brightness-110 disabled:opacity-40 transition-all"
                >
                  {sending ? "발송 중…" : `📧 메일 발송 → ${recipientEmail}`}
                  {(attachFiles.length + (attachBiz && savedDocs.biz.url ? 1 : 0) + (attachBank && savedDocs.bank.url ? 1 : 0)) > 0 && !sending && (
                    <span className="block text-[11px] font-normal opacity-80 mt-0.5">첨부 {attachFiles.length + (attachBiz && savedDocs.biz.url ? 1 : 0) + (attachBank && savedDocs.bank.url ? 1 : 0)}건 포함</span>
                  )}
                </button>
              )
            ) : (
              <div className="border hair rounded-md px-4 py-3 text-[12px] dim text-center">
                이메일 미입력 — 메일 발송 불가
              </div>
            )}

            {/* 견적서 보기 + PDF 저장 */}
            <a
              href={`/quote/${doneQuoteId}`}
              target="_blank"
              rel="noreferrer"
              className="border hair rounded-md px-4 py-3 text-[13px] text-center text-ink hover:border-edred transition-colors"
            >
              📄 견적서 보기 · PDF 저장 →
            </a>

            {/* 새 견적 작성 */}
            <button
              onClick={() => {
                setDoneQuoteId(null); setSent(false); setSentAttachCount(0);
                setLines([]); clearCustomer();
                router.replace("/admin/proxy-quotes");
              }}
              className="text-[12px] dim hover:text-ink transition-colors"
            >
              + 새 견적서 작성
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 메인 폼 ──────────────────────────────────────────────

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10 max-w-[1400px] mx-auto">

      {/* 헤더 */}
      <div className="mb-8 sm:mb-10 flex items-start justify-between gap-4">
        <div>
          <div className="mono text-[11px] dim tracking-[0.15em] uppercase mb-3">
            — 06 · PROXY QUOTES
          </div>
          <h1 className="display text-[28px] sm:text-[40px] leading-none text-ink">
            대행 <span className="italic text-edred">견적서</span>
          </h1>
          <p className="dim text-[13px] mt-3">
            고객을 선택하거나 직접 입력 후 상품을 추가하면 등급별 단가로 자동 계산됩니다.
          </p>
        </div>
        <button
          type="button"
          onClick={openHistoryAll}
          className="shrink-0 mt-2 border hair rounded-md px-4 py-2.5 text-[13px] dim hover:text-ink hover:border-edred transition-colors"
        >
          📋 이력 불러오기
        </button>
      </div>

      {/* 이력 불러오기 모달 */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-16 px-4">
          <div className="w-full max-w-2xl bg-paper border hair rounded-lg shadow-2xl flex flex-col max-h-[75vh]">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-5 py-4 border-b hair">
              <div>
                <div className="mono text-[10px] tracking-[0.15em] uppercase dim mb-1">QUOTE HISTORY</div>
                <h2 className="text-[18px] font-bold text-ink">
                  견적 이력 불러오기
                  {historyQ && (
                    <span className="ml-2 text-[13px] font-normal text-edred">— {historyQ}</span>
                  )}
                </h2>
              </div>
              <button onClick={() => setShowHistory(false)} className="dim hover:text-edred text-[20px]">✕</button>
            </div>
            {/* 검색 */}
            <div className="px-5 py-3 border-b hair flex gap-2">
              <input
                type="text"
                value={historyQ}
                onChange={(e) => setHistoryQ(e.target.value)}
                placeholder="업체명 또는 담당자로 검색"
                className="flex-1 border hair rounded-md px-3 py-2 text-[14px] focus:outline-none focus:border-edred"
                autoFocus
              />
              {historyQ && (
                <button
                  type="button"
                  onClick={() => setHistoryQ("")}
                  className="shrink-0 border hair rounded-md px-3 py-2 text-[12px] dim hover:text-ink transition-colors"
                >
                  전체 보기
                </button>
              )}
            </div>
            {/* 목록 */}
            <div className="overflow-auto flex-1">
              {historyLoading ? (
                <div className="px-5 py-8 text-center text-[13px] dim">불러오는 중…</div>
              ) : historyItems.length === 0 ? (
                <div className="px-5 py-8 text-center text-[13px] dim">견적 이력이 없습니다.</div>
              ) : historyItems.map((h) => (
                <div key={h.id} className="flex items-stretch border-b hair last:border-b-0 group">
                  <button
                    type="button"
                    onClick={() => loadFromHistory(h)}
                    className="flex-1 text-left px-5 py-4 hover:bg-edred/5 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-[15px] font-semibold text-ink truncate">{h.company}</span>
                          <span className="mono text-[9px] tracking-[0.12em] text-edred shrink-0">
                            {TIER_LABEL[h.tier] ?? h.tier}
                          </span>
                        </div>
                        <div className="text-[12px] dim mb-1.5">
                          {h.contactName}{h.contactTitle ? ` (${h.contactTitle})` : ""} · {h.quoteNo} · {new Date(h.createdAt).toLocaleDateString("ko-KR")}
                        </div>
                        <div className="text-[11px] dim truncate">
                          {h.previewItems.slice(0, 3).map((i) => i.description || i.partNo).join(" / ")}
                          {h.itemCount > 3 && ` 외 ${h.itemCount - 3}건`}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[14px] font-bold text-edred">{fmt(h.subtotal)}</div>
                        <div className="mono text-[10px] dim">{h.itemCount}개 품목</div>
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm(`"${h.company}" 견적 이력을 삭제할까요?`)) return;
                      await fetch(`/api/admin/proxy-quotes/history?id=${h.id}`, { method: "DELETE" });
                      setHistoryItems((prev) => prev.filter((x) => x.id !== h.id));
                    }}
                    className="px-3 text-[11px] text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all border-l hair"
                    title="이력 삭제"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 01 / 고객 */}
      <div className="mb-8">
        <label className="mono text-[10px] tracking-[0.18em] uppercase dim mb-3 block">
          01 / 고객
        </label>

        {/* 선택된 고객 카드 */}
        {selectedCustomer ? (
          <div className="border-2 border-edred rounded-md p-4 bg-edred/5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[16px] font-semibold text-ink truncate">{selectedCustomer.company}</span>
                  <span className={`mono text-[9px] tracking-[0.12em] px-1.5 py-[2px] rounded shrink-0 ${
                    selectedCustomer.source === "user" ? "bg-blue-600 text-white" : "bg-edred text-white"
                  }`}>
                    {selectedCustomer.source === "user" ? "회원" : "거래처"}
                  </span>
                  <span className="mono text-[9px] tracking-[0.12em] border hair px-1.5 py-[2px] rounded shrink-0">
                    {TIER_LABEL[selectedCustomer.tier] ?? selectedCustomer.tier}
                  </span>
                </div>
                <div className="text-[13px] dim">
                  {selectedCustomer.name}
                  {selectedCustomer.phone && ` · ${selectedCustomer.phone}`}
                  {selectedCustomer.email && ` · ${selectedCustomer.email}`}
                </div>
              </div>
              <button onClick={clearCustomer} className="text-[12px] dim hover:text-edred shrink-0">변경</button>
            </div>

            {/* 담당자 여러 명 선택 */}
            {selectedContacts.length > 1 && (
              <div>
                <div className="mono text-[9px] tracking-[0.12em] dim uppercase mb-1.5">담당자 선택</div>
                <div className="flex flex-wrap gap-2">
                  {selectedContacts.map((ct, idx) => (
                    <button key={idx} type="button" onClick={() => selectContact(ct)}
                      className={`text-[12px] border rounded px-3 py-1 transition-colors ${
                        selectedCustomer.name === ct.name ? "bg-edred text-white border-edred" : "hair dim hover:text-ink"
                      }`}>
                      {ct.name}{ct.title ? ` (${ct.title})` : ""}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 이전 견적 보기 */}
            {selectedCompanyName && (
              <div className="flex justify-end">
                <button type="button" onClick={() => openHistoryForCompany(selectedCompanyName)}
                  className="mono text-[10px] tracking-[0.1em] border hair rounded px-3 py-1.5 hover:text-edred hover:border-edred transition-colors">
                  📋 이전 견적 보기
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* 통합 검색 */}
            <div ref={customerBoxRef} className="relative">
              <input
                type="text"
                value={customerQ}
                onChange={(e) => { setCustomerQ(e.target.value); setCustomerOpen(true); }}
                onFocus={() => setCustomerOpen(true)}
                placeholder="회원·거래처 통합 검색 — 상호·담당자·연락처·초성"
                className="w-full border hair rounded-md px-4 py-3 text-[14px] focus:outline-none focus:border-edred"
              />
              {customerOpen && customerQ.trim() && (
                <div className="absolute top-full left-0 right-0 mt-1 border hair rounded-md bg-paper shadow-lg z-20 max-h-[360px] overflow-auto">
                  {customerLoading ? (
                    <div className="px-4 py-3 text-[12px] dim">검색 중…</div>
                  ) : customerHits.length === 0 ? (
                    <div className="px-4 py-3 text-[12px] dim">검색 결과 없음 — 아래 직접 입력 사용</div>
                  ) : customerHits.map((c, idx) => (
                    <button key={`${c.source}-${c.id}-${idx}`} type="button" onClick={() => selectCustomer(c)}
                      className="w-full text-left px-4 py-3 hover:bg-edred/5 border-b hair last:border-b-0 transition-colors">
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="text-[14px] font-medium text-ink truncate">{c.company}</span>
                        <span className={`mono text-[8px] tracking-[0.12em] px-1.5 py-[1px] rounded shrink-0 ${
                          c.source === "user" ? "bg-blue-100 text-blue-700" : "bg-red-50 text-edred border border-edred/30"
                        }`}>
                          {c.source === "user" ? "회원" : "거래처"}
                        </span>
                        <span className="mono text-[9px] text-dim shrink-0">{TIER_LABEL[c.tier] ?? c.tier}</span>
                      </div>
                      <div className="text-[12px] dim truncate">
                        {c.name}{c.phone ? ` · ${c.phone}` : ""}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 직접 입력 토글 */}
            <button type="button" onClick={() => setShowDirect((v) => !v)}
              className="text-[12px] dim hover:text-edred transition-colors">
              {showDirect ? "▲ 직접 입력 닫기" : "▼ 목록에 없으면 직접 입력"}
            </button>

            {/* 직접 입력 폼 */}
            {showDirect && (
              <div className="border hair rounded-md p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "상호 *", key: "company", type: "text", placeholder: "회사명" },
                    { label: "담당자", key: "name", type: "text", placeholder: "담당자 이름" },
                    { label: "직급", key: "title", type: "text", placeholder: "부장, 대표 등" },
                    { label: "연락처", key: "phone", type: "tel", placeholder: "010-0000-0000" },
                    { label: "이메일", key: "email", type: "email", placeholder: "example@company.com" },
                  ].map(({ label, key, type, placeholder }) => (
                    <div key={key}>
                      <label className="mono text-[10px] tracking-[0.15em] uppercase dim mb-1 block">{label}</label>
                      <input type={type} value={guest[key as keyof GuestForm]}
                        onChange={(e) => setGuest((g) => ({ ...g, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full border hair rounded-md px-3 py-2.5 text-[14px] focus:outline-none focus:border-edred" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="mono text-[10px] tracking-[0.15em] uppercase dim mb-1.5 block">고객 유형</label>
                  <div className="flex flex-wrap gap-2">
                    {TIER_OPTIONS.map((t) => (
                      <button key={t} type="button" onClick={() => setGuest((g) => ({ ...g, tier: t }))}
                        className={`mono text-[10px] tracking-[0.12em] px-3 py-1.5 rounded border transition-colors ${
                          guest.tier === t ? "bg-edred text-white border-edred" : "hair dim hover:text-ink"
                        }`}>
                        {TIER_LABEL[t]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 거래처 저장 옵션 */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={saveToCompany}
                    onChange={(e) => setSaveToCompany(e.target.checked)}
                    className="w-4 h-4 accent-edred cursor-pointer"
                  />
                  <span className="text-[13px] text-ink group-hover:text-edred transition-colors">
                    거래처에 저장 <span className="dim text-[11px]">— 다음 견적부터 검색 가능</span>
                  </span>
                </label>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 02 / 상품 추가 */}
      <div className="mb-8">
        <label className="mono text-[10px] tracking-[0.18em] uppercase dim mb-3 block">
          02 / 상품 추가
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 검색 */}
          <div ref={productBoxRef} className="relative">
            <input
              type="text"
              value={productQ}
              onChange={(e) => { setProductQ(e.target.value); setProductOpen(true); }}
              onFocus={() => setProductOpen(true)}
              disabled={!canSearchProduct}
              placeholder={canSearchProduct ? "파트번호 · 제품명 검색" : "고객 정보를 먼저 입력해주세요"}
              className="w-full border hair rounded-md px-4 py-3 text-[14px] focus:outline-none focus:border-edred disabled:bg-ink/5 disabled:cursor-not-allowed"
            />
            {productOpen && productQ.trim() && canSearchProduct && (
              <div className="absolute top-full left-0 right-0 mt-1 border hair rounded-md bg-paper shadow-lg z-20 max-h-[320px] overflow-auto">
                {productLoading ? (
                  <div className="px-4 py-3 text-[12px] dim">검색 중…</div>
                ) : productHits.length === 0 ? (
                  <div className="px-4 py-3 text-[12px] dim">검색 결과 없음</div>
                ) : productHits.map((p) => (
                  <button key={p.id} type="button" onClick={() => addProduct(p)}
                    className="w-full text-left px-4 py-3 hover:bg-edred/5 border-b hair last:border-b-0 transition-colors">
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-[14px] font-medium text-ink truncate">{p.description}</div>
                        <div className="mono text-[11px] dim">{p.partNo} · 재고 {p.stock}</div>
                      </div>
                      <div className="text-[14px] font-semibold text-edred shrink-0">{fmt(p.unitPrice)}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 붙여넣기 입력 버튼 */}
          <button
            type="button"
            onClick={() => setShowPaste((v) => !v)}
            disabled={!canSearchProduct}
            className="border hair rounded-md px-4 py-3 text-[13px] dim hover:text-ink hover:border-edred transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed"
          >
            📋 붙여넣기 입력 {showPaste ? "닫기" : "열기"}
            <span className="block mono text-[10px] mt-0.5">파트번호 수량 형식으로 여러 품목 한 번에 추가</span>
          </button>
        </div>

        {/* 붙여넣기 패널 */}
        {showPaste && (
          <div className="mt-3 border hair rounded-md p-4 space-y-3 bg-ink/[0.02]">
            <div className="mono text-[10px] tracking-[0.12em] dim uppercase">
              붙여넣기 입력 — 한 줄에 하나씩 (파트번호, 수량)
            </div>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={"A532-01-880  2\nH034-01-480, 1\nA532-00-264"}
              rows={5}
              className="w-full border hair rounded-md px-3 py-2 text-[13px] font-mono focus:outline-none focus:border-edred resize-none"
            />
            {pasteErrors.length > 0 && (
              <div className="text-[12px] text-amber-600">
                미조회 파트번호: {pasteErrors.join(", ")}
              </div>
            )}
            <button
              type="button"
              onClick={parsePaste}
              disabled={pasteLoading || !pasteText.trim()}
              className="bg-ink text-paper px-4 py-2 rounded-md text-[13px] font-semibold hover:brightness-110 disabled:opacity-40 transition-all"
            >
              {pasteLoading ? "조회 중…" : "품목 추가"}
            </button>
          </div>
        )}
      </div>

      {/* 03 / 견적 품목 */}
      <div className="mb-8">
        <label className="mono text-[10px] tracking-[0.18em] uppercase dim mb-3 block">
          03 / 견적 품목 ({lines.length}건)
        </label>
        <div className="border hair rounded-md overflow-hidden">
          {/* 헤더 */}
          <div className="grid grid-cols-[100px_1fr_90px_80px_120px_120px_36px] gap-2 px-3 py-2.5 border-b hair bg-ink/5 mono text-[9px] tracking-[0.15em] uppercase dim">
            <div>파트번호</div>
            <div>제품명</div>
            <div className="text-center">납기(주)</div>
            <div className="text-right">수량(Q&apos;ty)</div>
            <div className="text-right">단가</div>
            <div className="text-right">소계</div>
            <div />
          </div>

          {/* 품목 행 */}
          {lines.length === 0 ? (
            <div className="px-4 py-10 text-center text-[13px] dim">
              상품을 검색하거나 아래 버튼으로 추가해주세요.
            </div>
          ) : lines.map((l) => {
            const lineTotal = l.unitPrice * l.quantity;
            const priceOverridden = l.unitPrice !== l.defaultUnitPrice;
            return (
              <div key={l.key}
                className="grid grid-cols-[100px_1fr_90px_80px_120px_120px_36px] gap-2 px-3 py-2 border-b hair last:border-b-0 items-center">
                {/* 파트번호 — 항상 수정 가능 */}
                <input type="text" value={l.partNo} placeholder="파트번호"
                  onChange={(e) => updatePartNo(l.key, e.target.value)}
                  className="w-full border hair rounded px-2 py-1 text-[11px] font-mono focus:outline-none focus:border-edred bg-transparent" />
                {/* 제품명 */}
                <input type="text" value={l.description} placeholder="제품명"
                  onChange={(e) => updateDescription(l.key, e.target.value)}
                  className="w-full border hair rounded px-2 py-1 text-[13px] focus:outline-none focus:border-edred bg-transparent" />
                {/* 납기 */}
                <div className="relative">
                  <input type="text" value={l.leadTime} placeholder="납기"
                    onChange={(e) => updateLeadTime(l.key, e.target.value)}
                    className="w-full border hair rounded px-2 py-1 text-[12px] text-center focus:outline-none focus:border-edred bg-transparent" />
                  {/* 빠른 선택 드롭다운 */}
                  <div className="absolute top-full left-0 right-0 z-10 hidden group-focus-within:flex flex-col">
                  </div>
                </div>
                {/* 수량 */}
                <input type="number" min={1} value={l.quantity}
                  inputMode="numeric"
                  onKeyDown={(e) => { if ([".", "-", "+", "e"].includes(e.key)) e.preventDefault(); }}
                  onChange={(e) => updateQty(l.key, parseInt(e.target.value) || 1)}
                  className="w-full text-right border hair rounded px-2 py-1 text-[13px] focus:outline-none focus:border-edred" />
                {/* 단가 */}
                <div className="relative">
                  <input type="number" min={0} value={l.unitPrice}
                    onChange={(e) => updatePrice(l.key, parseInt(e.target.value) || 0)}
                    className={`w-full text-right border rounded px-2 py-1 text-[13px] focus:outline-none focus:border-edred ${priceOverridden ? "border-edred" : "hair"}`} />
                  {priceOverridden && (
                    <span className="absolute -top-2 right-1 mono text-[8px] bg-edred text-white px-1 rounded tracking-wider">수정</span>
                  )}
                </div>
                {/* 소계 */}
                <div className="text-right text-[13px] font-medium text-ink">{fmt(lineTotal)}</div>
                <button onClick={() => removeLine(l.key)} className="dim hover:text-edred text-[14px] text-center">✕</button>
              </div>
            );
          })}

          {/* 납기 빠른 선택 행 */}
          {lines.length > 0 && (
            <div className="px-3 py-2 border-t hair bg-ink/[0.02]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="mono text-[9px] dim tracking-[0.12em] uppercase">납기 빠른 입력:</span>
                {["즉시", "1주", "2주", "4주", "협의"].map((v) => (
                  <button key={v} type="button"
                    onClick={() => {
                      // 납기가 비어있는 항목에만 일괄 적용
                      setLines((prev) => prev.map((l) => l.leadTime ? l : { ...l, leadTime: v }));
                    }}
                    className="mono text-[10px] border hair rounded px-2 py-0.5 dim hover:text-edred hover:border-edred transition-colors">
                    {v}
                  </button>
                ))}
                <span className="text-[10px] dim">← 빈 칸에 일괄 적용</span>
              </div>
            </div>
          )}

          {/* 하단 품목 추가 버튼 */}
          <button
            type="button"
            onClick={addCustomLine}
            className="w-full px-4 py-3 text-[13px] dim hover:text-edred hover:bg-edred/5 transition-colors border-t hair text-left"
          >
            + 품목 추가
          </button>
        </div>

        {/* 합계 */}
        {lines.length > 0 && (
          <div className="mt-4 flex justify-end">
            <div className="w-full max-w-[360px] border hair rounded-md p-4 bg-ink/[0.02]">
              <div className="text-[13px] space-y-1.5">
                <div className="flex justify-between">
                  <span className="dim">공급가액</span><span className="text-ink">{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="dim">부가세 (10%)</span><span className="text-ink">{fmt(vat)}</span>
                </div>
                <div className="flex justify-between pt-2 mt-2 border-t hair text-[16px]">
                  <span className="font-semibold text-ink">합계</span>
                  <span className="font-bold text-edred">{fmt(total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 04 / 결제조건 */}
      <div className="mb-8">
        <label className="mono text-[10px] tracking-[0.18em] uppercase dim mb-3 block">
          04 / 결제조건 <span className="normal-case text-[10px]">(선택)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {PAY_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setPaymentTerm(paymentTerm === o.value ? null : o.value)}
              className={`mono text-[11px] tracking-[0.06em] border px-3 py-2 rounded-md transition-colors ${
                paymentTerm === o.value
                  ? "bg-smblue text-white border-smblue"
                  : "hair dim hover:text-ink"
              }`}
            >
              {o.label}
            </button>
          ))}
          {paymentTerm && (
            <button
              type="button"
              onClick={() => setPaymentTerm(null)}
              className="mono text-[10px] dim hover:text-edred transition-colors px-2"
            >
              초기화
            </button>
          )}
        </div>
      </div>

      {/* 05 / 비고 */}
      <div className="mb-8">
        <label className="mono text-[10px] tracking-[0.18em] uppercase dim mb-3 block">
          05 / 비고 <span className="normal-case text-[10px]">(선택) — 납기·특이사항 메모</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="예) D397·D161 품목은 8주 납기 가능 / 나머지 16주"
          className="w-full border hair px-3 py-2.5 text-[13px] focus:outline-none focus:border-ink resize-y bg-transparent placeholder:text-dim"
        />
        {note && (
          <button
            type="button"
            onClick={() => setNote("")}
            className="mt-1 mono text-[10px] dim hover:text-edred transition-colors"
          >
            초기화
          </button>
        )}
      </div>

      {/* 발행 버튼 */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          disabled={lines.length === 0 || !hasCustomer}
          className="border hair px-6 py-3 rounded-md text-[14px] text-ink hover:border-edred hover:text-edred disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          미리보기
        </button>
        <button
          type="button"
          onClick={submitQuote}
          disabled={submitting || lines.length === 0 || !hasCustomer}
          className="bg-edred text-white px-6 py-3 rounded-md text-[14px] font-semibold tracking-tight hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          {submitting ? "발행 중…" : "견적서 발행 →"}
        </button>
      </div>

      {/* 미리보기 모달 */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-paper border hair rounded-lg shadow-2xl flex flex-col max-h-[90vh]">
            {/* 헤더 */}
            <div className="px-6 py-4 border-b hair flex items-center justify-between shrink-0">
              <div>
                <div className="mono text-[10px] tracking-[0.15em] uppercase dim mb-1">QUOTE PREVIEW</div>
                <div className="text-[16px] font-semibold text-ink">발행 전 최종 확인</div>
              </div>
              <button onClick={() => setShowPreview(false)} className="dim hover:text-edred text-[20px]">✕</button>
            </div>

            {/* 내용 */}
            <div className="overflow-auto flex-1 px-6 py-5 space-y-5">
              {/* 수신처 */}
              <div className="border hair rounded-md p-4 bg-ink/[0.02]">
                <div className="mono text-[9px] tracking-[0.15em] uppercase dim mb-2">수신처</div>
                <div className="text-[16px] font-semibold text-ink">
                  {guest.company || selectedCustomer?.company || "—"}
                </div>
                <div className="text-[13px] dim mt-1">
                  {(() => {
                    const name = guest.name || selectedCustomer?.name || "";
                    if (!name) return "";
                    return guest.title ? `${name} (${guest.title}님)` : `${name}님`;
                  })()}
                  {(guest.phone || selectedCustomer?.phone) && ` · ${guest.phone || selectedCustomer?.phone}`}
                </div>
                {(guest.email || selectedCustomer?.email) && (
                  <div className="text-[12px] dim mt-0.5">
                    {guest.email || selectedCustomer?.email}
                  </div>
                )}
              </div>

              {/* 품목 목록 */}
              <div>
                <div className="mono text-[9px] tracking-[0.15em] uppercase dim mb-2">
                  견적 품목 ({lines.length}건)
                </div>
                <div className="border hair rounded-md overflow-hidden">
                  <div className="grid grid-cols-[1fr_50px_90px_90px] gap-2 px-3 py-2 border-b hair bg-ink/5 mono text-[9px] tracking-[0.12em] uppercase dim">
                    <div>제품명</div>
                    <div className="text-center">수량</div>
                    <div className="text-right">단가</div>
                    <div className="text-right">소계</div>
                  </div>
                  {lines.map((l) => (
                    <div key={l.key} className="grid grid-cols-[1fr_50px_90px_90px] gap-2 px-3 py-3 border-b hair last:border-b-0 items-center">
                      <div>
                        <div className="text-[13px] font-medium text-ink">{l.description || "—"}</div>
                        {l.partNo && <div className="mono text-[10px] dim">{l.partNo}</div>}
                        {l.leadTime && <div className="mono text-[10px] dim">납기 {l.leadTime}</div>}
                      </div>
                      <div className="text-center text-[13px] text-ink">{l.quantity}</div>
                      <div className="text-right text-[13px] text-ink">{fmt(l.unitPrice)}</div>
                      <div className="text-right text-[13px] font-semibold text-ink">{fmt(l.unitPrice * l.quantity)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 합계 */}
              <div className="border hair rounded-md p-4">
                <div className="space-y-2 text-[13px]">
                  <div className="flex justify-between">
                    <span className="dim">공급가액</span>
                    <span className="text-ink">{fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="dim">부가세 (10%)</span>
                    <span className="text-ink">{fmt(vat)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t hair text-[15px]">
                    <span className="font-semibold text-ink">합계</span>
                    <span className="font-bold text-edred">{fmt(total)}</span>
                  </div>
                </div>
              </div>

              {/* 결제조건 */}
              {paymentTerm && (
                <div className="border hair rounded-md p-4">
                  <div className="mono text-[9px] tracking-[0.15em] uppercase dim mb-1">결제조건</div>
                  <div className="text-[14px] font-medium text-ink">
                    {PAY_OPTIONS.find((o) => o.value === paymentTerm)?.label ?? paymentTerm}
                  </div>
                </div>
              )}

              {/* 비고 */}
              {note && (
                <div className="border-l-4 border-edred pl-4 py-2 bg-edred/5">
                  <div className="mono text-[9px] tracking-[0.15em] uppercase text-edred mb-1">REMARKS</div>
                  <div className="text-[13px] italic text-ink">{note}</div>
                </div>
              )}
            </div>

            {/* 하단 버튼 */}
            <div className="px-6 py-4 border-t hair flex gap-3 shrink-0">
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 border hair px-4 py-3 rounded-md text-[14px] text-ink hover:border-edred hover:text-edred transition-colors"
              >
                ← 수정하기
              </button>
              <button
                onClick={() => { setShowPreview(false); submitQuote(); }}
                disabled={submitting}
                className="flex-1 bg-edred text-white px-4 py-3 rounded-md text-[14px] font-semibold hover:brightness-110 disabled:opacity-40 transition-all"
              >
                {submitting ? "발행 중…" : "견적서 발행 →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
