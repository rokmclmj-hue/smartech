import React from "react";
import path from "path";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  renderToBuffer,
  Font,
  type DocumentProps,
} from "@react-pdf/renderer";
import { VAT_RATE } from "./constants";
import { SMARTECH_COMPANY } from "./company";

Font.register({
  family: "Pretendard",
  fonts: [
    { src: path.join(process.cwd(), "public", "fonts", "Pretendard-Regular.ttf"), fontWeight: 400 },
    { src: path.join(process.cwd(), "public", "fonts", "Pretendard-Bold.ttf"),    fontWeight: 700 },
  ],
});

export interface QuoteForPdf {
  id: number;
  createdAt: Date;
  expiresAt: Date | null;
  taxInvoiceRequested: boolean;
  totalAmount: number | null;
  note?: string | null;
  priceBasis?: string | null;
  paymentTerm?: string | null;
  user: {
    name: string;
    company: string;
    email: string;
    phone?: string | null;
    title?: string | null;
  };
  items: {
    quantity: number;
    unitPrice: number;
    leadTime?: string | null;
    product: {
      partNo: string;
      description: string;
      category?: string | null;
    };
  }[];
}

const S = StyleSheet.create({
  page: {
    fontFamily: "Pretendard",
    fontSize: 9,
    paddingTop: 32,
    paddingBottom: 48,
    paddingHorizontal: 40,
    backgroundColor: "#ffffff",
    color: "#111111",
  },

  // ── 헤더
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottom: "2 solid #111111",
    paddingBottom: 8,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Pretendard", fontWeight: 700,
    color: "#c00020",
    letterSpacing: 1,
  },
  headerMeta: {
    textAlign: "right",
  },
  headerMetaLine: {
    fontSize: 7,
    color: "#888888",
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  // ── TO / FROM
  partiesBox: {
    flexDirection: "row",
    border: "1 solid #e0e0e0",
    marginBottom: 12,
  },
  toBox: {
    flex: 1,
    padding: 10,
    borderRight: "1 solid #e0e0e0",
  },
  fromBox: {
    flex: 1,
    padding: 10,
  },
  partyLabel: {
    fontSize: 6,
    fontFamily: "Pretendard", fontWeight: 700,
    color: "#888888",
    letterSpacing: 2,
    marginBottom: 6,
  },
  partyRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  partyKey: {
    fontSize: 7,
    color: "#888888",
    width: 42,
  },
  partyVal: {
    fontSize: 7,
    color: "#111111",
    flex: 1,
  },

  // ── 품목 테이블
  table: {
    width: "100%",
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1.5 solid #111111",
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  thCell: {
    color: "#111111",
    fontFamily: "Pretendard", fontWeight: 700,
    fontSize: 7,
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #eeeeee",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottom: "1 solid #eeeeee",
    paddingVertical: 6,
    paddingHorizontal: 4,
    backgroundColor: "#fafafa",
  },
  colNo:     { width: "5%",  textAlign: "center" },
  colCode:   { width: "16%", paddingRight: 4 },
  colDesc:   { width: "35%", paddingRight: 4 },
  colLead:   { width: "9%",  textAlign: "center" },
  colQty:    { width: "7%",  textAlign: "center" },
  colPrice:  { width: "14%", textAlign: "right" },
  colAmount: { width: "14%", textAlign: "right" },

  tdNormal: { fontSize: 8, color: "#222222" },
  tdCode:   { fontSize: 7, color: "#333333", fontFamily: "Pretendard", fontWeight: 700 },
  tdAmount: { fontSize: 8, color: "#111111", fontFamily: "Pretendard", fontWeight: 700 },

  // ── 합계
  summaryArea: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 12,
  },
  summaryBox: {
    width: 200,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottom: "1 solid #eeeeee",
  },
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderTop: "1.5 solid #111111",
    marginTop: 2,
  },
  sumLabel:  { fontSize: 8, color: "#555555" },
  sumValue:  { fontSize: 8, color: "#111111" },
  sumTLabel: { fontSize: 10, fontFamily: "Pretendard", fontWeight: 700, color: "#111111" },
  sumTValue: { fontSize: 10, fontFamily: "Pretendard", fontWeight: 700, color: "#c00020" },

  // ── 거래 조건
  termsBox: {
    border: "1 solid #e0e0e0",
    padding: 10,
    marginBottom: 12,
  },
  termRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  termLabel: {
    fontSize: 7,
    fontFamily: "Pretendard", fontWeight: 700,
    color: "#888888",
    letterSpacing: 1,
    width: 52,
  },
  termValue: {
    fontSize: 8,
    color: "#111111",
    flex: 1,
  },

  // ── 푸터
  footer: {
    position: "absolute",
    bottom: 22,
    left: 40,
    right: 40,
    borderTop: "1 solid #dddddd",
    paddingTop: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7,
    color: "#aaaaaa",
  },
});

// ── 견적서 전용 파란색 디자인 (HTML 인쇄 포맷과 통일)
const QS = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottom: "1.5 solid #1F4E79",
    paddingBottom: 8,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: "Pretendard",
    fontWeight: 700,
    color: "#1F4E79",
    letterSpacing: 0.5,
  },
  partiesBox: {
    flexDirection: "row",
    border: "0.5 solid #BFBFBF",
    marginBottom: 12,
  },
  toBox:   { flex: 1, padding: 10, borderRight: "0.5 solid #BFBFBF" },
  fromBox: { flex: 1, padding: 10 },
  partyLabel: {
    fontSize: 6.5,
    fontFamily: "Pretendard",
    fontWeight: 700,
    color: "#1F4E79",
    letterSpacing: 2,
    marginBottom: 6,
  },
  partyKey: { fontSize: 7, color: "#555555", width: 42 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F4F6F8",
    borderTop: "0.5 solid #111111",
    borderBottom: "0.5 solid #111111",
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  thCell: { color: "#111111", fontFamily: "Pretendard", fontWeight: 700, fontSize: 7, letterSpacing: 0.5 },
  tableRow: { flexDirection: "row", borderBottom: "0.5 solid #BFBFBF", paddingVertical: 6, paddingHorizontal: 4 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottom: "0.5 solid #BFBFBF",
  },
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderTop: "1 solid #1F4E79",
    borderBottom: "1 solid #1F4E79",
    marginTop: 1,
  },
  sumTLabel: { fontSize: 10, fontFamily: "Pretendard", fontWeight: 700, color: "#1F4E79" },
  sumTValue: { fontSize: 10, fontFamily: "Pretendard", fontWeight: 700, color: "#1F4E79" },
  termsBox: { border: "0.5 solid #BFBFBF", padding: 10, marginBottom: 12 },
  remarkBox: {
    borderLeft: "4 solid #c00020",
    paddingLeft: 10,
    paddingTop: 8,
    paddingBottom: 8,
    marginBottom: 10,
    backgroundColor: "#FEF2F2",
  },
  remarkLabel: { fontSize: 6.5, letterSpacing: 2, color: "#c00020", marginBottom: 3 },
  remarkText:  { fontSize: 9, color: "#0B0B0C" },
});

const PAY_LABELS: Record<string, string> = {
  d: "납품 전 현금결제",
  e: "정기결제 (익월 말일)",
  c: "담당자 협의",
};

function pdfPaymentLabel(term: string | null | undefined, taxInvoice: boolean): string {
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

function fmt(n: number): string {
  return "₩" + n.toLocaleString("en-US");
}

function fmtDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function QuoteDocument({ quote }: { quote: QuoteForPdf }) {
  const issued = new Date(quote.createdAt);
  const year = issued.getFullYear();
  const seq = String(quote.id).padStart(6, "0");
  const quoteNo = `SMT-${year}-Q-${seq}`;
  const validStr = quote.expiresAt ? fmtDate(new Date(quote.expiresAt)) : "발행일+14일";

  const subtotal = quote.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const vat = Math.round(subtotal * VAT_RATE);
  const grand = subtotal + vat;

  const el = React.createElement;

  return el(
    Document,
    { title: `SMARTECH QUOTATION ${quoteNo}` },
    el(Page, { size: "A4", style: { ...S.page, paddingTop: 0, paddingHorizontal: 0 } },

      // ── Red Tape (진공 게이지 바)
      el(View, { style: {
        backgroundColor: "#c00020",
        paddingVertical: 7,
        paddingHorizontal: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      } },
        el(Text, { style: { color: "rgba(255,255,255,0.85)", fontSize: 7, letterSpacing: 1 } }, "ATM · 10³ mbar"),
        el(Text, { style: { color: "rgba(255,255,255,0.85)", fontSize: 7, letterSpacing: 1 } }, "UHV · 10⁻¹⁰ mbar"),
      ),

      // ── 본문 래퍼
      el(View, { style: { paddingHorizontal: 40, paddingTop: 16 } },

      // ── 헤더
      el(View, { style: QS.header },
        el(Text, { style: QS.headerTitle }, "SMARTECH · QUOTATION"),
        el(View, { style: S.headerMeta },
          el(Text, { style: S.headerMetaLine }, `Q-REF · ${quoteNo}`),
          el(Text, { style: S.headerMetaLine }, `ISSUED · ${fmtDate(issued)}   VALID · ${validStr}`)
        )
      ),

      // ── TO / FROM
      el(View, { style: QS.partiesBox },
        el(View, { style: QS.toBox },
          el(Text, { style: QS.partyLabel }, "TO · 수신처"),
          el(View, { style: S.partyRow },
            el(Text, { style: QS.partyKey }, "COMPANY"),
            el(Text, { style: S.partyVal }, quote.user.company)
          ),
          el(View, { style: S.partyRow },
            el(Text, { style: QS.partyKey }, "ATTN"),
            el(Text, { style: S.partyVal }, quote.user.title ? `${quote.user.name} ${quote.user.title}님` : `${quote.user.name}님`)
          ),
          quote.user.phone
            ? el(View, { style: S.partyRow },
                el(Text, { style: QS.partyKey }, "TEL"),
                el(Text, { style: S.partyVal }, fmtPhone(quote.user.phone))
              )
            : null,
          quote.user.email
            ? el(View, { style: S.partyRow },
                el(Text, { style: QS.partyKey }, "EMAIL"),
                el(Text, { style: S.partyVal }, quote.user.email)
              )
            : null
        ),
        el(View, { style: QS.fromBox },
          el(Text, { style: QS.partyLabel }, "FROM · 발신처"),
          el(View, { style: S.partyRow },
            el(Text, { style: QS.partyKey }, "COMPANY"),
            el(Text, { style: S.partyVal }, `${SMARTECH_COMPANY.name} · ${SMARTECH_COMPANY.english}`)
          ),
          el(View, { style: S.partyRow },
            el(Text, { style: QS.partyKey }, "CEO"),
            el(Text, { style: S.partyVal }, SMARTECH_COMPANY.ceo)
          ),
          el(View, { style: S.partyRow },
            el(Text, { style: QS.partyKey }, "BIZ NO"),
            el(Text, { style: S.partyVal }, SMARTECH_COMPANY.bizNo)
          ),
          el(View, { style: S.partyRow },
            el(Text, { style: QS.partyKey }, "TEL"),
            el(Text, { style: S.partyVal }, `${SMARTECH_COMPANY.officeTel} / M ${SMARTECH_COMPANY.mobileTel}`)
          ),
          el(View, { style: S.partyRow },
            el(Text, { style: QS.partyKey }, "EMAIL"),
            el(Text, { style: S.partyVal }, SMARTECH_COMPANY.email)
          ),
          el(View, { style: S.partyRow },
            el(Text, { style: QS.partyKey }, "OFFICE"),
            el(Text, { style: S.partyVal }, SMARTECH_COMPANY.headOfficeKo)
          ),
          el(View, { style: S.partyRow },
            el(Text, { style: QS.partyKey }, "A/S CTR"),
            el(Text, { style: S.partyVal }, SMARTECH_COMPANY.cheonanCenterKo)
          )
        )
      ),

      // ── 품목 테이블
      el(View, { style: S.table },
        el(View, { style: QS.tableHeader },
          el(Text, { style: [QS.thCell, S.colNo] }, "NO"),
          el(Text, { style: [QS.thCell, S.colCode] }, "PART NO"),
          el(Text, { style: [QS.thCell, S.colDesc] }, "DESCRIPTION"),
          el(Text, { style: [QS.thCell, S.colLead] }, "납기"),
          el(Text, { style: [QS.thCell, S.colQty] }, "QTY"),
          el(Text, { style: [QS.thCell, S.colPrice] }, "UNIT PRICE"),
          el(Text, { style: [QS.thCell, S.colAmount] }, "SUBTOTAL")
        ),
        ...quote.items.map((item, idx) =>
          el(View, { key: String(idx), style: QS.tableRow },
            el(Text, { style: [S.tdNormal, S.colNo] }, String(idx + 1).padStart(2, "0")),
            el(Text, { style: [S.tdCode, S.colCode] }, item.product.partNo),
            el(Text, { style: [S.tdNormal, S.colDesc] }, item.product.description),
            el(Text, { style: [S.tdNormal, S.colLead] }, item.leadTime || "협의"),
            el(Text, { style: [S.tdNormal, S.colQty] }, `${item.quantity} EA`),
            el(Text, { style: [S.tdNormal, S.colPrice] }, `₩ ${item.unitPrice.toLocaleString("en-US")}`),
            el(Text, { style: [S.tdAmount, S.colAmount] }, `₩ ${(item.unitPrice * item.quantity).toLocaleString("en-US")}`)
          )
        )
      ),

      // ── 합계
      el(View, { style: S.summaryArea },
        el(View, { style: S.summaryBox },
          quote.priceBasis
            ? el(View, { style: QS.summaryRow },
                el(Text, { style: S.sumLabel }, "PRICE BASIS"),
                el(Text, { style: { fontSize: 8, color: "#c00020", fontFamily: "Pretendard", fontWeight: 700 } }, quote.priceBasis)
              )
            : null,
          el(View, { style: QS.summaryRow },
            el(Text, { style: S.sumLabel }, "SUB-TOTAL"),
            el(Text, { style: S.sumValue }, `₩ ${subtotal.toLocaleString("en-US")}`)
          ),
          el(View, { style: QS.summaryRow },
            el(Text, { style: S.sumLabel }, "VAT (10%)"),
            el(Text, { style: S.sumValue }, `₩ ${vat.toLocaleString("en-US")}`)
          ),
          el(View, { style: QS.summaryTotalRow },
            el(Text, { style: QS.sumTLabel }, "GRAND TOTAL"),
            el(Text, { style: QS.sumTValue }, `₩ ${grand.toLocaleString("en-US")}`)
          )
        )
      ),

      // ── 특이사항
      quote.note
        ? el(View, { style: QS.remarkBox },
            el(Text, { style: QS.remarkLabel }, "REMARKS"),
            el(Text, { style: QS.remarkText }, quote.note)
          )
        : null,

      // ── 거래 조건
      el(View, { style: QS.termsBox },
        el(View, { style: S.termRow },
          el(Text, { style: S.termLabel }, "PAYMENT"),
          el(Text, { style: S.termValue }, pdfPaymentLabel(quote.paymentTerm, quote.taxInvoiceRequested))
        ),
        el(View, { style: S.termRow },
          el(Text, { style: S.termLabel }, "DELIVERY"),
          el(Text, { style: S.termValue }, "국내 재고분 D+1 / 해외 발주분 D+14 (협의)")
        ),
        el(View, { style: S.termRow },
          el(Text, { style: S.termLabel }, "WARRANTY"),
          el(Text, { style: S.termValue }, "12개월 · Edwards 정품 보증")
        ),
        el(View, { style: { ...S.termRow, marginBottom: 0 } },
          el(Text, { style: S.termLabel }, "A / S"),
          el(Text, { style: S.termValue }, "현장 서비스 · 기술지원")
        )
      ),

      ), // ── 본문 래퍼 닫기

      // ── 푸터
      el(View, { style: S.footer },
        el(Text, { style: S.footerText },
          `© ${year} SMARTECH CO., LTD. · Edwards Vacuum Korea Authorized Distributor`
        ),
        el(Text, { style: S.footerText }, "PAGE 1 / 1")
      )
    )
  );
}

export async function generateQuotePdf(quote: QuoteForPdf): Promise<Buffer> {
  const doc = React.createElement(QuoteDocument, { quote });
  const arrayBuffer = await renderToBuffer(doc as React.ReactElement<DocumentProps>);
  return Buffer.from(arrayBuffer);
}

// ============================================================
// 거래명세표 (Delivery Note) PDF
// ============================================================

export interface DeliveryNoteForPdf {
  order: {
    id: number;
    createdAt: Date;
    confirmedAt: Date | null;
    status: string;
  };
  quote: {
    id: number;
    taxInvoiceRequested: boolean;
  };
  user: {
    name: string;
    company: string;
    email: string;
    phone?: string | null;
    businessNo?: string | null;
  };
  items: {
    quantity: number;
    unitPrice: number;
    product: {
      partNo: string;
      description: string;
      category?: string | null;
    };
  }[];
}

const DN = StyleSheet.create({
  // 거래명세표 전용 컬럼 너비 (No 5% / Code 14% / Desc 27% / Spec 11% / Qty 7% / Price 12% / Supply 12% / Vat 12%)
  colNoD:     { width: "5%",  textAlign: "center" },
  colCodeD:   { width: "14%", paddingRight: 3 },
  colDescD:   { width: "38%", paddingRight: 3 },
  colQtyD:    { width: "7%",  textAlign: "center" },
  colPriceD:  { width: "12%", textAlign: "right" },
  colSupplyD: { width: "12%", textAlign: "right" },
  colVatD:    { width: "12%", textAlign: "right" },

  noteSubtitle: {
    fontSize: 8,
    color: "#555555",
    marginTop: 2,
    letterSpacing: 2,
  },
});

// 거래명세표 전용 레이아웃 스타일 (견적서 화이트 스타일과 별개로 유지)
const DS = StyleSheet.create({
  topBar: { backgroundColor: "#c00020", paddingVertical: 10, paddingHorizontal: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  topBarLeft: { color: "#ffffff", fontSize: 7, fontFamily: "Pretendard", letterSpacing: 1 },
  topBarRight: { color: "#ffbbbb", fontSize: 7, letterSpacing: 0.5 },
  titleArea: { borderBottom: "2 solid #111111", paddingBottom: 8, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 10 },
  titleLeft: {},
  noteTitle: { fontSize: 26, fontFamily: "Pretendard", fontWeight: 700, color: "#111111", letterSpacing: 6 },
  titleRight: { textAlign: "right" },
  noteNo: { fontSize: 11, fontFamily: "Pretendard", fontWeight: 700, color: "#111111", letterSpacing: 1 },
  noteStatus: { fontSize: 7, color: "#555555", marginTop: 2, letterSpacing: 1 },
  sectionLabel: { fontSize: 7, fontFamily: "Pretendard", fontWeight: 700, color: "#888888", letterSpacing: 2, marginBottom: 4 },
  toFromRow: { flexDirection: "row", marginBottom: 10 },
  toBox: { flex: 1, paddingRight: 20, borderRight: "1 solid #eeeeee" },
  fromBox: { flex: 1, paddingLeft: 20 },
  toFromLabel: { fontSize: 7, fontFamily: "Pretendard", fontWeight: 700, color: "#888888", letterSpacing: 2, marginBottom: 6 },
  toFromCompany: { fontSize: 11, fontFamily: "Pretendard", fontWeight: 700, color: "#111111", marginBottom: 3 },
  toFromLine: { fontSize: 8, color: "#444444", marginBottom: 2, lineHeight: 1.4 },
  toFromLineGray: { fontSize: 7, color: "#888888", marginBottom: 1 },
  amountArea: { backgroundColor: "#f7f7f7", padding: 10, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  grandTotalLabel: { fontSize: 8, color: "#555555", marginBottom: 3, letterSpacing: 1 },
  grandTotalAmount: { fontSize: 22, fontFamily: "Pretendard", fontWeight: 700, color: "#111111" },
  grandTotalSub: { fontSize: 7, color: "#888888", marginTop: 2 },
  amountBreakdown: { textAlign: "right" },
  breakdownRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  breakdownLabel: { fontSize: 8, color: "#555555", marginRight: 20 },
  breakdownValue: { fontSize: 8, color: "#111111", fontFamily: "Pretendard", fontWeight: 700 },
  taxBadge: { backgroundColor: "#111111", paddingHorizontal: 6, paddingVertical: 2, marginTop: 4, alignSelf: "flex-start" },
  taxBadgeText: { fontSize: 6, color: "#ffffff", letterSpacing: 1 },
  tableHeader: { flexDirection: "row", backgroundColor: "#c00020", paddingVertical: 6, paddingHorizontal: 6 },
  thCell: { color: "#ffffff", fontFamily: "Pretendard", fontWeight: 700, fontSize: 7, letterSpacing: 1 },
  tableRow: { flexDirection: "row", borderBottom: "1 solid #eeeeee", paddingVertical: 6, paddingHorizontal: 6 },
  tableRowAlt: { flexDirection: "row", borderBottom: "1 solid #eeeeee", paddingVertical: 6, paddingHorizontal: 6, backgroundColor: "#fafafa" },
  tdNormal: { fontSize: 8, color: "#222222" },
  tdCode: { fontSize: 7, color: "#333333", fontFamily: "Pretendard", fontWeight: 700 },
  tdAmount: { fontSize: 8, color: "#111111", fontFamily: "Pretendard", fontWeight: 700 },
  summaryArea: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 10 },
  summaryBox: { width: 220, borderTop: "2 solid #111111", paddingTop: 8 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3, borderBottom: "1 solid #eeeeee" },
  summaryTotalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, marginTop: 2 },
  sumLabel: { fontSize: 8, color: "#555555" },
  sumValue: { fontSize: 8, color: "#111111" },
  sumTLabel: { fontSize: 10, fontFamily: "Pretendard", fontWeight: 700, color: "#111111" },
  sumTValue: { fontSize: 10, fontFamily: "Pretendard", fontWeight: 700, color: "#111111" },
  sigRow: { flexDirection: "row", marginBottom: 8, borderTop: "1 solid #dddddd", paddingTop: 6 },
  sigBox: { flex: 1, paddingRight: 16 },
  sigBoxRight: { flex: 1, paddingLeft: 16, borderLeft: "1 solid #eeeeee" },
  sigLabel: { fontSize: 7, fontFamily: "Pretendard", fontWeight: 700, color: "#888888", letterSpacing: 1, marginBottom: 4 },
  sigName: { fontSize: 9, fontFamily: "Pretendard", fontWeight: 700, color: "#111111", marginBottom: 2 },
  sigLine: { borderTop: "1 solid #aaaaaa", marginTop: 16, paddingTop: 3 },
  sigLineText: { fontSize: 7, color: "#aaaaaa" },
  footer: { position: "absolute", bottom: 24, left: 44, right: 44, borderTop: "1 solid #dddddd", paddingTop: 6, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#aaaaaa" },
});

function DeliveryNoteDocument({ data }: { data: DeliveryNoteForPdf }) {
  const issued = new Date();
  const delivered = data.order.confirmedAt
    ? new Date(data.order.confirmedAt)
    : issued;
  const year = data.order.createdAt.getFullYear();
  const seq = String(data.order.id).padStart(6, "0");
  const noteNo = `SMT-${year}-D-${seq}`;

  const totalSupply = data.items.reduce(
    (s, i) => s + i.unitPrice * i.quantity,
    0
  );
  const totalVat = Math.round(totalSupply * VAT_RATE);
  const grand = totalSupply + totalVat;
  const totalQty = data.items.reduce((s, i) => s + i.quantity, 0);

  const el = React.createElement;

  return el(
    Document,
    { title: `거래명세표 ${noteNo}` },
    el(Page, { size: "A4", style: S.page },

      // 상단 검은 바
      el(View, { style: DS.topBar },
        el(Text, { style: DS.topBarLeft }, `${noteNo}  ·  SMARTECH DELIVERY NOTE`),
        el(Text, { style: DS.topBarRight }, `DELIVERED · ${fmtDate(delivered)}`)
      ),

      // 타이틀
      el(View, { style: DS.titleArea },
        el(View, { style: DS.titleLeft },
          el(Text, { style: DS.noteTitle }, "거 래 명 세 표"),
          el(Text, { style: DN.noteSubtitle }, "DELIVERY NOTE  ·  공급자 보관용 / 공급받는자 인수용")
        ),
        el(View, { style: DS.titleRight },
          el(Text, { style: DS.noteNo }, noteNo),
          el(Text, { style: DS.noteStatus },
            `발행일 ${fmtDate(issued)}  |  납품일 ${fmtDate(delivered)}`
          )
        )
      ),

      // Section 01: 공급자 / 공급받는자
      el(Text, { style: DS.sectionLabel }, "— 01  거래처 정보"),
      el(View, { style: DS.toFromRow },
        el(View, { style: DS.toBox },
          el(Text, { style: DS.toFromLabel }, "공급받는자  ·  TO"),
          el(Text, { style: DS.toFromCompany }, data.user.company + " 귀중"),
          data.user.businessNo
            ? el(Text, { style: DS.toFromLine }, `사업자번호: ${data.user.businessNo}`)
            : null,
          el(Text, { style: DS.toFromLine }, `담당자: ${data.user.name}`),
          data.user.email
            ? el(Text, { style: DS.toFromLine }, `E-mail: ${data.user.email}`)
            : null,
          data.user.phone
            ? el(Text, { style: DS.toFromLine }, `Tel: ${data.user.phone}`)
            : null
        ),
        el(View, { style: DS.fromBox },
          el(Text, { style: DS.toFromLabel }, "공급자  ·  FROM"),
          el(Text, { style: DS.toFromCompany }, SMARTECH_COMPANY.name),
          el(Text, { style: DS.toFromLine }, SMARTECH_COMPANY.role),
          el(Text, { style: DS.toFromLineGray }, `사업자번호: ${SMARTECH_COMPANY.bizNo}  /  법인번호: ${SMARTECH_COMPANY.corpNo}`),
          el(Text, { style: DS.toFromLineGray }, `대표자: ${SMARTECH_COMPANY.ceo}`),
          el(Text, { style: DS.toFromLineGray }, `본점: ${SMARTECH_COMPANY.registeredAddressKo}`),
          el(Text, { style: DS.toFromLineGray }, `영업본사: ${SMARTECH_COMPANY.headOfficeKo}`),
          el(Text, { style: DS.toFromLineGray }, `TEL: ${SMARTECH_COMPANY.officeTel}  /  FAX: ${SMARTECH_COMPANY.fax}  /  M: ${SMARTECH_COMPANY.mobileTel}`),
          el(Text, { style: DS.toFromLineGray }, `E-mail: ${SMARTECH_COMPANY.email}  /  Web: ${SMARTECH_COMPANY.website}`)
        )
      ),

      // Section 02: 금액 요약
      el(Text, { style: DS.sectionLabel }, "— 02  금액 요약"),
      el(View, { style: DS.amountArea },
        el(View, null,
          el(Text, { style: DS.grandTotalLabel }, "GRAND TOTAL  ·  총액 (VAT 포함)"),
          el(Text, { style: DS.grandTotalAmount }, fmt(grand)),
          el(Text, { style: DS.grandTotalSub }, `ITEMS: ${data.items.length}종  ·  ${totalQty} EA`),
          data.quote.taxInvoiceRequested
            ? el(View, { style: DS.taxBadge },
                el(Text, { style: DS.taxBadgeText }, "세금계산서 발행 신청")
              )
            : null
        ),
        el(View, { style: DS.amountBreakdown },
          el(View, { style: DS.breakdownRow },
            el(Text, { style: DS.breakdownLabel }, "공급가액 (Supply)"),
            el(Text, { style: DS.breakdownValue }, fmt(totalSupply))
          ),
          el(View, { style: DS.breakdownRow },
            el(Text, { style: DS.breakdownLabel }, "부가세 10% (VAT)"),
            el(Text, { style: DS.breakdownValue }, fmt(totalVat))
          ),
          el(View, { style: { ...DS.breakdownRow, borderTop: "1 solid #cccccc", paddingTop: 4, marginTop: 2 } },
            el(Text, { style: { ...DS.breakdownLabel, fontFamily: "Pretendard", fontWeight: 700 } }, "합계 (Total)"),
            el(Text, { style: { ...DS.breakdownValue, fontSize: 10 } }, fmt(grand))
          )
        )
      ),

      // Section 03: 품목 테이블 (공급가액·세액 분리)
      el(Text, { style: DS.sectionLabel }, `— 03  납품 품목 (${data.items.length} LINES · ${totalQty} EA)`),
      el(View, { style: S.table },
        el(View, { style: DS.tableHeader },
          el(Text, { style: [DS.thCell, DN.colNoD] }, "No"),
          el(Text, { style: [DS.thCell, DN.colCodeD] }, "PART NO"),
          el(Text, { style: [DS.thCell, DN.colDescD] }, "DESCRIPTION"),
          el(Text, { style: [DS.thCell, DN.colQtyD] }, "QTY"),
          el(Text, { style: [DS.thCell, DN.colPriceD] }, "UNIT"),
          el(Text, { style: [DS.thCell, DN.colSupplyD] }, "공급가액"),
          el(Text, { style: [DS.thCell, DN.colVatD] }, "세액")
        ),
        ...data.items.map((item, idx) => {
          const lineSupply = item.unitPrice * item.quantity;
          const lineVat = Math.round(lineSupply * VAT_RATE);
          return el(View, { key: String(idx), style: idx % 2 === 0 ? DS.tableRow : DS.tableRowAlt },
            el(Text, { style: [DS.tdNormal, DN.colNoD] }, String(idx + 1).padStart(2, "0")),
            el(Text, { style: [DS.tdCode, DN.colCodeD] }, item.product.partNo),
            el(Text, { style: [DS.tdNormal, DN.colDescD] }, item.product.description),
            el(Text, { style: [DS.tdNormal, DN.colQtyD] }, `${item.quantity}`),
            el(Text, { style: [DS.tdNormal, DN.colPriceD] }, fmt(item.unitPrice)),
            el(Text, { style: [DS.tdAmount, DN.colSupplyD] }, fmt(lineSupply)),
            el(Text, { style: [DS.tdNormal, DN.colVatD] }, fmt(lineVat))
          );
        })
      ),

      // Section 04: 합계 (공급가액 / 세액 / 총액 3줄)
      el(View, { style: DS.summaryArea },
        el(View, { style: DS.summaryBox },
          el(View, { style: DS.summaryRow },
            el(Text, { style: DS.sumLabel }, "공급가액 합계"),
            el(Text, { style: DS.sumValue }, fmt(totalSupply))
          ),
          el(View, { style: DS.summaryRow },
            el(Text, { style: DS.sumLabel }, "세액 합계 (VAT 10%)"),
            el(Text, { style: DS.sumValue }, fmt(totalVat))
          ),
          el(View, { style: DS.summaryTotalRow },
            el(Text, { style: DS.sumTLabel }, "총 합계"),
            el(Text, { style: DS.sumTValue }, fmt(grand))
          )
        )
      ),

      // Section 05: 인수자 / 공급자 서명
      el(Text, { style: DS.sectionLabel }, "— 05  인수 확인"),
      el(View, { style: DS.sigRow },
        el(View, { style: DS.sigBox },
          el(Text, { style: DS.sigLabel }, "공급자  ·  ISSUED BY"),
          el(Text, { style: DS.sigName }, "(주)스마텍 영업팀"),
          el(View, { style: DS.sigLine },
            el(Text, { style: DS.sigLineText }, "SMARTECH  /  SEAL & SIGNATURE")
          )
        ),
        el(View, { style: DS.sigBoxRight },
          el(Text, { style: DS.sigLabel }, "인수자  ·  ACKNOWLEDGED BY"),
          el(Text, { style: DS.sigName }, data.user.company),
          el(View, { style: DS.sigLine },
            el(Text, { style: DS.sigLineText }, `${data.user.name}  /  인수일자: ____.__.__`)
          )
        )
      ),

      // 푸터
      el(View, { style: DS.footer },
        el(Text, { style: DS.footerText },
          `본 거래명세표는 발행일 기준 정식 납품 증빙입니다.  |  ${noteNo}`
        ),
        el(Text, { style: DS.footerText }, "스마텍  ·  (주)SMARTECH")
      )
    )
  );
}

export async function generateDeliveryNotePdf(
  data: DeliveryNoteForPdf
): Promise<Buffer> {
  const doc = React.createElement(DeliveryNoteDocument, { data });
  const arrayBuffer = await renderToBuffer(doc as React.ReactElement<DocumentProps>);
  return Buffer.from(arrayBuffer);
}

// ─────────────────────────────────────────────────
// 수동 거래명세표 PDF
// ─────────────────────────────────────────────────
export interface ManualDeliveryNoteItemForPdf {
  partNo: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface ManualDeliveryNoteForPdf {
  noteNo: string;
  createdAt: Date;
  toCompany: string;
  toName?: string | null;
  toTitle?: string | null;
  toEmail?: string | null;
  toPhone?: string | null;
  toBizNo?: string | null;
  includeBankInfo: boolean;
  items: ManualDeliveryNoteItemForPdf[];
}

function ManualDeliveryNoteDocument({ data }: { data: ManualDeliveryNoteForPdf }) {
  const el = React.createElement;
  const issued = new Date(data.createdAt);

  const totalSupply = data.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const totalVat = Math.round(totalSupply * VAT_RATE);
  const grand = totalSupply + totalVat;
  const totalQty = data.items.reduce((s, i) => s + i.quantity, 0);

  const bankImgPath = path.join(process.cwd(), "public", "bank-account.png");

  const pages = [
    // ── 1페이지: 거래명세표 본문 ──
    el(Page, { key: "main", size: "A4", style: S.page },
      el(View, { style: DS.topBar },
        el(Text, { style: DS.topBarLeft }, `${data.noteNo}  ·  SMARTECH DELIVERY NOTE`),
        el(Text, { style: DS.topBarRight }, `ISSUED · ${fmtDate(issued)}`)
      ),
      el(View, { style: DS.titleArea },
        el(View, { style: DS.titleLeft },
          el(Text, { style: DS.noteTitle }, "거 래 명 세 표"),
          el(Text, { style: DN.noteSubtitle }, "DELIVERY NOTE  ·  공급자 보관용 / 공급받는자 인수용")
        ),
        el(View, { style: DS.titleRight },
          el(Text, { style: DS.noteNo }, data.noteNo),
          el(Text, { style: DS.noteStatus }, `발행일 ${fmtDate(issued)}`)
        )
      ),

      // Section 01: 거래처 정보
      el(Text, { style: DS.sectionLabel }, "— 01  거래처 정보"),
      el(View, { style: DS.toFromRow },
        el(View, { style: DS.toBox },
          el(Text, { style: DS.toFromLabel }, "공급받는자  ·  TO"),
          el(Text, { style: DS.toFromCompany }, `${data.toCompany} 귀중`),
          data.toBizNo ? el(Text, { style: DS.toFromLine }, `사업자번호: ${data.toBizNo}`) : null,
          data.toName  ? el(Text, { style: DS.toFromLine }, `담당자: ${data.toName}${data.toTitle ? ` ${data.toTitle}님` : ""}`) : null,
          data.toEmail ? el(Text, { style: DS.toFromLine }, `E-mail: ${data.toEmail}`) : null,
          data.toPhone ? el(Text, { style: DS.toFromLine }, `Tel: ${data.toPhone}`) : null,
        ),
        el(View, { style: DS.fromBox },
          el(Text, { style: DS.toFromLabel }, "공급자  ·  FROM"),
          el(Text, { style: DS.toFromCompany }, SMARTECH_COMPANY.name),
          el(Text, { style: DS.toFromLine }, SMARTECH_COMPANY.role),
          el(Text, { style: DS.toFromLineGray }, `사업자번호: ${SMARTECH_COMPANY.bizNo}  /  법인번호: ${SMARTECH_COMPANY.corpNo}`),
          el(Text, { style: DS.toFromLineGray }, `대표자: ${SMARTECH_COMPANY.ceo}`),
          el(Text, { style: DS.toFromLineGray }, `영업본사: ${SMARTECH_COMPANY.headOfficeKo}`),
          el(Text, { style: DS.toFromLineGray }, `TEL: ${SMARTECH_COMPANY.officeTel}  /  M: ${SMARTECH_COMPANY.mobileTel}`),
          el(Text, { style: DS.toFromLineGray }, `E-mail: ${SMARTECH_COMPANY.email}  /  Web: ${SMARTECH_COMPANY.website}`)
        )
      ),

      // Section 02: 금액 요약
      el(Text, { style: DS.sectionLabel }, "— 02  금액 요약"),
      el(View, { style: DS.amountArea },
        el(View, null,
          el(Text, { style: DS.grandTotalLabel }, "GRAND TOTAL  ·  총액 (VAT 포함)"),
          el(Text, { style: DS.grandTotalAmount }, fmt(grand)),
          el(Text, { style: DS.grandTotalSub }, `ITEMS: ${data.items.length}종  ·  ${totalQty} EA`)
        ),
        el(View, { style: DS.amountBreakdown },
          el(View, { style: DS.breakdownRow },
            el(Text, { style: DS.breakdownLabel }, "공급가액 (Supply)"),
            el(Text, { style: DS.breakdownValue }, fmt(totalSupply))
          ),
          el(View, { style: DS.breakdownRow },
            el(Text, { style: DS.breakdownLabel }, "부가세 10% (VAT)"),
            el(Text, { style: DS.breakdownValue }, fmt(totalVat))
          ),
          el(View, { style: { ...DS.breakdownRow, borderTop: "1 solid #cccccc", paddingTop: 4, marginTop: 2 } },
            el(Text, { style: { ...DS.breakdownLabel, fontFamily: "Pretendard", fontWeight: 700 } }, "합계 (Total)"),
            el(Text, { style: { ...DS.breakdownValue, fontSize: 10 } }, fmt(grand))
          )
        )
      ),

      // Section 03: 품목 테이블
      el(Text, { style: DS.sectionLabel }, `— 03  납품 품목 (${data.items.length} LINES · ${totalQty} EA)`),
      el(View, { style: S.table },
        el(View, { style: DS.tableHeader },
          el(Text, { style: [DS.thCell, DN.colNoD] }, "No"),
          el(Text, { style: [DS.thCell, DN.colCodeD] }, "PART NO"),
          el(Text, { style: [DS.thCell, DN.colDescD] }, "DESCRIPTION"),
          el(Text, { style: [DS.thCell, DN.colQtyD] }, "QTY"),
          el(Text, { style: [DS.thCell, DN.colPriceD] }, "UNIT"),
          el(Text, { style: [DS.thCell, DN.colSupplyD] }, "공급가액"),
          el(Text, { style: [DS.thCell, DN.colVatD] }, "세액")
        ),
        ...data.items.map((item, idx) => {
          const lineSupply = item.unitPrice * item.quantity;
          const lineVat = Math.round(lineSupply * VAT_RATE);
          return el(View, { key: String(idx), style: idx % 2 === 0 ? DS.tableRow : DS.tableRowAlt },
            el(Text, { style: [DS.tdNormal, DN.colNoD] }, String(idx + 1).padStart(2, "0")),
            el(Text, { style: [DS.tdCode, DN.colCodeD] }, item.partNo),
            el(Text, { style: [DS.tdNormal, DN.colDescD] }, item.description),
            el(Text, { style: [DS.tdNormal, DN.colQtyD] }, `${item.quantity}`),
            el(Text, { style: [DS.tdNormal, DN.colPriceD] }, fmt(item.unitPrice)),
            el(Text, { style: [DS.tdAmount, DN.colSupplyD] }, fmt(lineSupply)),
            el(Text, { style: [DS.tdNormal, DN.colVatD] }, fmt(lineVat))
          );
        })
      ),

      // Section 04: 합계
      el(View, { style: DS.summaryArea },
        el(View, { style: DS.summaryBox },
          el(View, { style: DS.summaryRow },
            el(Text, { style: DS.sumLabel }, "공급가액 합계"),
            el(Text, { style: DS.sumValue }, fmt(totalSupply))
          ),
          el(View, { style: DS.summaryRow },
            el(Text, { style: DS.sumLabel }, "세액 합계 (VAT 10%)"),
            el(Text, { style: DS.sumValue }, fmt(totalVat))
          ),
          el(View, { style: DS.summaryTotalRow },
            el(Text, { style: DS.sumTLabel }, "총 합계"),
            el(Text, { style: DS.sumTValue }, fmt(grand))
          )
        )
      ),

      // Section 05: 서명
      el(Text, { style: DS.sectionLabel }, "— 05  인수 확인"),
      el(View, { style: DS.sigRow },
        el(View, { style: DS.sigBox },
          el(Text, { style: DS.sigLabel }, "공급자  ·  ISSUED BY"),
          el(Text, { style: DS.sigName }, "(주)스마텍 영업팀"),
          el(View, { style: DS.sigLine },
            el(Text, { style: DS.sigLineText }, "SMARTECH  /  SEAL & SIGNATURE")
          )
        ),
        el(View, { style: DS.sigBoxRight },
          el(Text, { style: DS.sigLabel }, "인수자  ·  ACKNOWLEDGED BY"),
          el(Text, { style: DS.sigName }, data.toCompany),
          el(View, { style: DS.sigLine },
            el(Text, { style: DS.sigLineText }, `${data.toName ?? "담당자"}  /  인수일자: ____.__.__`)
          )
        )
      ),

      // 푸터
      el(View, { style: DS.footer },
        el(Text, { style: DS.footerText },
          `본 거래명세표는 발행일 기준 정식 납품 증빙입니다.  |  ${data.noteNo}`
        ),
        el(Text, { style: DS.footerText }, "스마텍  ·  (주)SMARTECH")
      )
    ) as React.ReactElement,
  ];

  // ── 2페이지: 통장사본 (선택) ──
  if (data.includeBankInfo) {
    pages.push(
      el(Page, { key: "bank", size: "A4", style: { ...S.page, padding: 30, alignItems: "center", justifyContent: "center" } },
        el(Text, { style: { fontSize: 13, fontFamily: "Pretendard", fontWeight: 700, marginBottom: 20, letterSpacing: 2, color: "#111111" } },
          "입금 계좌 안내  ·  BANK ACCOUNT"
        ),
        el(Image, { src: bankImgPath, style: { width: "100%", maxHeight: 600, objectFit: "contain" } } as React.ComponentProps<typeof Image>)
      ) as React.ReactElement
    );
  }

  return el(Document, { title: `거래명세표 ${data.noteNo}` }, ...pages);
}

export async function generateManualDeliveryNotePdf(
  data: ManualDeliveryNoteForPdf
): Promise<Buffer> {
  const doc = React.createElement(ManualDeliveryNoteDocument, { data });
  const arrayBuffer = await renderToBuffer(doc as React.ReactElement<DocumentProps>);
  return Buffer.from(arrayBuffer);
}

// ─────────────────────────────────────────────────
// 수동 발주서 PDF
// ─────────────────────────────────────────────────
export interface ManualPurchaseOrderItemForPdf {
  partNo: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface ManualPurchaseOrderForPdf {
  orderNo: string;
  department: string;
  orderDate: Date;
  requestedDate?: Date | null;
  toCompany: string;
  toName?: string | null;
  message?: string | null;
  items: ManualPurchaseOrderItemForPdf[];
}

const PO = StyleSheet.create({
  topBar: { backgroundColor: "#0d3a8a", paddingVertical: 10, paddingHorizontal: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  topBarLeft: { color: "#ffffff", fontSize: 7, fontFamily: "Pretendard", letterSpacing: 1 },
  topBarRight: { color: "#aad4ff", fontSize: 7, letterSpacing: 0.5 },
  titleArea: { borderBottom: "2 solid #0d3a8a", paddingBottom: 8, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 10 },
  docTitle: { fontSize: 26, fontFamily: "Pretendard", fontWeight: 700, color: "#0d3a8a", letterSpacing: 6 },
  docSubtitle: { fontSize: 8, color: "#555555", marginTop: 2, letterSpacing: 2 },
  orderNo: { fontSize: 11, fontFamily: "Pretendard", fontWeight: 700, color: "#0d3a8a", letterSpacing: 1 },
  orderMeta: { fontSize: 7, color: "#555555", marginTop: 2, letterSpacing: 1 },
  sectionLabel: { fontSize: 8, fontFamily: "Pretendard", fontWeight: 700, color: "#333333", letterSpacing: 2, marginTop: 12, marginBottom: 4, textTransform: "uppercase" },
  toFromRow: { flexDirection: "row", gap: 12, marginBottom: 10 },
  toBox: { flex: 1, borderLeft: "3 solid #0d3a8a", paddingLeft: 8 },
  fromBox: { flex: 1, borderLeft: "1 solid #cccccc", paddingLeft: 8 },
  label: { fontSize: 7, color: "#888888", letterSpacing: 1, marginBottom: 2 },
  company: { fontSize: 12, fontFamily: "Pretendard", fontWeight: 700, color: "#111111", marginBottom: 2 },
  line: { fontSize: 8, color: "#333333", marginBottom: 1 },
  lineGray: { fontSize: 7, color: "#777777", marginBottom: 1 },
  messageBox: { backgroundColor: "#f8f8f8", border: "1 solid #e0e0e0", padding: 8, marginBottom: 10 },
  messageLabel: { fontSize: 7, color: "#888888", letterSpacing: 1, marginBottom: 4 },
  messageText: { fontSize: 8, color: "#333333", lineHeight: 1.6 },
  tableHeader: { flexDirection: "row", backgroundColor: "#0d3a8a", paddingVertical: 5 },
  tableRow: { flexDirection: "row", borderBottom: "1 solid #eeeeee", paddingVertical: 4 },
  tableRowAlt: { flexDirection: "row", borderBottom: "1 solid #eeeeee", paddingVertical: 4, backgroundColor: "#f9f9f9" },
  th: { fontSize: 7, color: "#ffffff", fontFamily: "Pretendard", fontWeight: 700, paddingHorizontal: 4, letterSpacing: 0.5 },
  td: { fontSize: 8, color: "#333333", paddingHorizontal: 4 },
  tdMono: { fontSize: 8, color: "#333333", paddingHorizontal: 4, fontFamily: "Pretendard" },
  colNo:   { width: "5%",  textAlign: "center" },
  colCode: { width: "18%", paddingRight: 3 },
  colDesc: { width: "40%", paddingRight: 3 },
  colQty:  { width: "10%", textAlign: "center" },
  colUnit: { width: "15%", textAlign: "right" },
  colAmt:  { width: "12%", textAlign: "right" },
  summaryBox: { marginTop: 8, alignSelf: "flex-end", width: 200 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3, borderBottom: "1 solid #eeeeee" },
  sumLabel: { fontSize: 8, color: "#555555" },
  sumValue: { fontSize: 8, color: "#333333", fontFamily: "Pretendard" },
  sumTotalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderTop: "2 solid #0d3a8a", marginTop: 2 },
  sumTLabel: { fontSize: 9, fontFamily: "Pretendard", fontWeight: 700, color: "#0d3a8a" },
  sumTValue: { fontSize: 9, fontFamily: "Pretendard", fontWeight: 700, color: "#0d3a8a" },
  footer: { position: "absolute", bottom: 20, left: 28, right: 28, borderTop: "1 solid #cccccc", paddingTop: 4 },
  footerText: { fontSize: 7, color: "#888888", textAlign: "center", letterSpacing: 0.5 },
});

function ManualPurchaseOrderDocument({ data }: { data: ManualPurchaseOrderForPdf }) {
  const el = React.createElement;
  const orderDate = new Date(data.orderDate);
  const totalSupply = data.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const totalVat = Math.round(totalSupply * VAT_RATE);
  const grand = totalSupply + totalVat;
  const totalQty = data.items.reduce((s, i) => s + i.quantity, 0);

  return el(
    Document,
    { title: `발주서 ${data.orderNo}` },
    el(Page, { size: "A4", style: S.page },
      el(View, { style: PO.topBar },
        el(Text, { style: PO.topBarLeft }, `${data.orderNo}  ·  SMARTECH PURCHASE ORDER  ·  ${data.department}`),
        el(Text, { style: PO.topBarRight }, `ORDER DATE · ${fmtDate(orderDate)}`)
      ),
      el(View, { style: PO.titleArea },
        el(View, null,
          el(Text, { style: PO.docTitle }, "발  주  서"),
          el(Text, { style: PO.docSubtitle }, "PURCHASE ORDER  ·  (주)스마텍")
        ),
        el(View, { style: { textAlign: "right" } },
          el(Text, { style: PO.orderNo }, data.orderNo),
          el(Text, { style: PO.orderMeta },
            `발주일: ${fmtDate(orderDate)}` +
            (data.requestedDate ? `  |  납기요청일: ${fmtDate(new Date(data.requestedDate))}` : "")
          )
        )
      ),

      // Section 01: 거래처
      el(Text, { style: PO.sectionLabel }, "— 01  거래처 정보"),
      el(View, { style: PO.toFromRow },
        el(View, { style: PO.toBox },
          el(Text, { style: PO.label }, "공급업체  ·  TO"),
          el(Text, { style: PO.company }, data.toCompany),
          data.toName ? el(Text, { style: PO.line }, `담당자: ${data.toName}`) : null
        ),
        el(View, { style: PO.fromBox },
          el(Text, { style: PO.label }, "발주처  ·  FROM"),
          el(Text, { style: PO.company }, SMARTECH_COMPANY.name),
          el(Text, { style: PO.lineGray }, `사업자번호: ${SMARTECH_COMPANY.bizNo}`),
          el(Text, { style: PO.lineGray }, `대표자: ${SMARTECH_COMPANY.ceo}`),
          el(Text, { style: PO.lineGray }, `TEL: ${SMARTECH_COMPANY.officeTel}  /  M: ${SMARTECH_COMPANY.mobileTel}`),
          el(Text, { style: PO.lineGray }, `영업본사: ${SMARTECH_COMPANY.headOfficeKo}`)
        )
      ),

      // Section 02: 품목 테이블
      el(Text, { style: PO.sectionLabel }, `— 02  발주 품목 (${data.items.length} LINES · ${totalQty} EA)`),
      el(View, { style: S.table },
        el(View, { style: PO.tableHeader },
          el(Text, { style: [PO.th, PO.colNo] }, "No"),
          el(Text, { style: [PO.th, PO.colCode] }, "PART NO"),
          el(Text, { style: [PO.th, PO.colDesc] }, "DESCRIPTION"),
          el(Text, { style: [PO.th, PO.colQty] }, "QTY"),
          el(Text, { style: [PO.th, PO.colUnit] }, "UNIT PRICE"),
          el(Text, { style: [PO.th, PO.colAmt] }, "AMOUNT")
        ),
        ...data.items.map((item, idx) => {
          const amt = item.unitPrice * item.quantity;
          return el(View, { key: String(idx), style: idx % 2 === 0 ? PO.tableRow : PO.tableRowAlt },
            el(Text, { style: [PO.td, PO.colNo] }, String(idx + 1).padStart(2, "0")),
            el(Text, { style: [PO.tdMono, PO.colCode] }, item.partNo),
            el(Text, { style: [PO.td, PO.colDesc] }, item.description),
            el(Text, { style: [PO.td, PO.colQty] }, `${item.quantity}`),
            el(Text, { style: [PO.tdMono, PO.colUnit] }, fmt(item.unitPrice)),
            el(Text, { style: [PO.tdMono, PO.colAmt] }, fmt(amt))
          );
        })
      ),

      // 합계
      el(View, { style: PO.summaryBox },
        el(View, { style: PO.summaryRow },
          el(Text, { style: PO.sumLabel }, "공급가액"),
          el(Text, { style: PO.sumValue }, fmt(totalSupply))
        ),
        el(View, { style: PO.summaryRow },
          el(Text, { style: PO.sumLabel }, "부가세 (VAT 10%)"),
          el(Text, { style: PO.sumValue }, fmt(totalVat))
        ),
        el(View, { style: PO.sumTotalRow },
          el(Text, { style: PO.sumTLabel }, "합계 (Total)"),
          el(Text, { style: PO.sumTValue }, fmt(grand))
        )
      ),

      // 푸터
      el(View, { style: PO.footer },
        el(Text, { style: PO.footerText },
          `본 발주서는 (주)스마텍이 정식 발행한 문서입니다.  |  ${data.orderNo}`
        )
      )
    )
  );
}

export async function generateManualPurchaseOrderPdf(
  data: ManualPurchaseOrderForPdf
): Promise<Buffer> {
  const doc = React.createElement(ManualPurchaseOrderDocument, { data });
  const arrayBuffer = await renderToBuffer(doc as React.ReactElement<DocumentProps>);
  return Buffer.from(arrayBuffer);
}

// ─────────────────────────────────────────────────
// 수리 검사성적서 PDF
// ─────────────────────────────────────────────────
export interface RepairInspectionItem {
  itemLabel: string;
  unit: string | null;
  spec: string | null;
  value: string | null;
  isNA: boolean;
  pass: boolean | null;
}

export interface RepairPhotoFile {
  fileName: string;
  fileUrl: string;
}

export interface RepairInspectionForPdf {
  jobNo: string;
  pumpMaker: string;
  pumpModel: string;
  serialNo: string | null;
  voltage: string | null;
  receivedDate: Date;
  companyName: string | null;
  contactName: string | null;
  inspectorName: string | null;
  inspectionItems: RepairInspectionItem[];
  selectedPhotos: RepairPhotoFile[];
}

const IR = StyleSheet.create({
  topBar: { backgroundColor: "#c00020", paddingVertical: 8, paddingHorizontal: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  topLeft: { color: "#ffffff", fontSize: 7, fontFamily: "Pretendard", fontWeight: 700, letterSpacing: 1 },
  topRight: { color: "#ffbbbb", fontSize: 7 },
  titleArea: { borderBottom: "2 solid #c00020", paddingBottom: 6, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 8 },
  docTitle: { fontSize: 22, fontFamily: "Pretendard", fontWeight: 700, color: "#c00020", letterSpacing: 4 },
  docSub: { fontSize: 7, color: "#666666", marginTop: 2, letterSpacing: 2 },
  jobNo: { fontSize: 10, fontFamily: "Pretendard", fontWeight: 700, color: "#c00020" },
  jobMeta: { fontSize: 7, color: "#666666", marginTop: 2 },
  secLabel: { fontSize: 7, fontFamily: "Pretendard", fontWeight: 700, color: "#444444", letterSpacing: 2, marginTop: 10, marginBottom: 3, textTransform: "uppercase" },
  infoRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  infoBox: { flex: 1, borderLeft: "3 solid #c00020", paddingLeft: 6 },
  infoLabel: { fontSize: 6, color: "#999999", letterSpacing: 1, marginBottom: 1 },
  infoVal: { fontSize: 10, fontFamily: "Pretendard", fontWeight: 700, color: "#111111" },
  infoSub: { fontSize: 7, color: "#555555", marginTop: 1 },
  tHead: { flexDirection: "row", backgroundColor: "#c00020", paddingVertical: 4, paddingHorizontal: 3 },
  tRow: { flexDirection: "row", borderBottom: "1 solid #eeeeee", paddingVertical: 2.5, paddingHorizontal: 3 },
  tRowAlt: { flexDirection: "row", borderBottom: "1 solid #eeeeee", paddingVertical: 2.5, paddingHorizontal: 3, backgroundColor: "#fafafa" },
  th: { fontSize: 6, color: "#ffffff", fontFamily: "Pretendard", fontWeight: 700, letterSpacing: 0.5 },
  td: { fontSize: 7, color: "#333333" },
  tdBold: { fontSize: 7, fontFamily: "Pretendard", fontWeight: 700 },
  cItem: { width: "28%" },
  cUnit: { width: "11%" },
  cSpec: { width: "18%" },
  cVal:  { width: "22%" },
  cNA:   { width: "8%", textAlign: "center" },
  cPass: { width: "13%", textAlign: "center" },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  photoWrap: { width: "48%" },
  photoImg: { width: "100%", height: 150 },
  photoName: { fontSize: 6, color: "#999999", marginTop: 1, textAlign: "center" },
  sigRow: { flexDirection: "row", gap: 16, marginTop: 12 },
  sigBox: { flex: 1, borderTop: "1 solid #cccccc", paddingTop: 6 },
  sigLabel: { fontSize: 6, color: "#999999", letterSpacing: 1, marginBottom: 10 },
  sigName: { fontSize: 8, color: "#111111" },
  footer: { position: "absolute", bottom: 20, left: 32, right: 32, borderTop: "1 solid #dddddd", paddingTop: 3 },
  footerTxt: { fontSize: 6, color: "#aaaaaa", textAlign: "center" },
});

function InspectionReportDocument({ data }: { data: RepairInspectionForPdf }) {
  const el = React.createElement;
  const photosOnly = data.selectedPhotos.filter(f => /\.(jpe?g|png|gif|webp)$/i.test(f.fileName));

  function passLabel(pass: boolean | null, isNA: boolean) {
    if (isNA) return "-";
    if (pass === true) return "PASS";
    if (pass === false) return "FAIL";
    return "";
  }
  function passColor(pass: boolean | null, isNA: boolean) {
    if (isNA || pass === null) return "#888888";
    return pass ? "#007700" : "#cc0000";
  }

  const pages: React.ReactElement[] = [
    el(Page, { key: "p1", size: "A4", style: S.page },
      el(View, { style: IR.topBar },
        el(Text, { style: IR.topLeft }, `${data.jobNo}  ·  SMARTECH — INSPECTION REPORT`),
        el(Text, { style: IR.topRight }, fmtDate(data.receivedDate))
      ),
      el(View, { style: IR.titleArea },
        el(View, null,
          el(Text, { style: IR.docTitle }, "검 사 성 적 서"),
          el(Text, { style: IR.docSub }, "FINAL INSPECTION REPORT  ·  (주)스마텍")
        ),
        el(View, { style: { textAlign: "right" } },
          el(Text, { style: IR.jobNo }, data.jobNo),
          el(Text, { style: IR.jobMeta }, `발행일: ${fmtDate(new Date())}`)
        )
      ),

      el(Text, { style: IR.secLabel }, "— 01  장비 정보"),
      el(View, { style: IR.infoRow },
        el(View, { style: IR.infoBox },
          el(Text, { style: IR.infoLabel }, "고객사  ·  CUSTOMER"),
          el(Text, { style: IR.infoVal }, data.companyName ?? "—"),
          data.contactName ? el(Text, { style: IR.infoSub }, `담당자: ${data.contactName}`) : null
        ),
        el(View, { style: IR.infoBox },
          el(Text, { style: IR.infoLabel }, "장비  ·  EQUIPMENT"),
          el(Text, { style: IR.infoVal }, `${data.pumpMaker} ${data.pumpModel}`),
          data.serialNo ? el(Text, { style: IR.infoSub }, `S/N: ${data.serialNo}`) : null,
          data.voltage ? el(Text, { style: IR.infoSub }, `전압: ${data.voltage}`) : null
        )
      ),

      el(Text, { style: IR.secLabel }, "— 02  검사 결과"),
      el(View, null,
        el(View, { style: IR.tHead },
          el(Text, { style: [IR.th, IR.cItem] }, "검사 항목"),
          el(Text, { style: [IR.th, IR.cUnit] }, "단위"),
          el(Text, { style: [IR.th, IR.cSpec] }, "기준값"),
          el(Text, { style: [IR.th, IR.cVal] }, "측정값"),
          el(Text, { style: [IR.th, IR.cNA] }, "N/A"),
          el(Text, { style: [IR.th, IR.cPass] }, "판정")
        ),
        ...data.inspectionItems.filter(item => !item.isNA).map((item, idx) =>
          el(View, { key: String(idx), style: idx % 2 === 0 ? IR.tRow : IR.tRowAlt },
            el(Text, { style: [IR.td, IR.cItem] }, item.itemLabel),
            el(Text, { style: [IR.td, IR.cUnit] }, item.unit ?? ""),
            el(Text, { style: [IR.td, IR.cSpec] }, item.spec ?? ""),
            el(Text, { style: [IR.td, IR.cVal] }, item.isNA ? "—" : (item.value ?? "")),
            el(Text, { style: [IR.td, IR.cNA] }, item.isNA ? "✓" : ""),
            el(Text, { style: [IR.tdBold, IR.cPass, { color: passColor(item.pass, item.isNA) }] },
              passLabel(item.pass, item.isNA)
            )
          )
        )
      ),

      el(Text, { style: IR.secLabel }, "— 03  검사자 확인"),
      el(View, { style: IR.sigRow },
        el(View, { style: IR.sigBox },
          el(Text, { style: IR.sigLabel }, "검사자  ·  INSPECTOR"),
          el(Text, { style: IR.sigName }, data.inspectorName ?? "(주)스마텍 서비스팀"),
          el(View, { style: { borderBottom: "1 solid #999999", marginTop: 16 } })
        ),
        el(View, { style: IR.sigBox },
          el(Text, { style: IR.sigLabel }, "확인일  ·  DATE"),
          el(Text, { style: IR.sigName }, fmtDate(new Date())),
          el(View, { style: { borderBottom: "1 solid #999999", marginTop: 16 } })
        )
      ),

      el(View, { style: IR.footer },
        el(Text, { style: IR.footerTxt },
          `본 검사성적서는 (주)스마텍이 검사 완료 후 발행한 공식 문서입니다.  |  ${data.jobNo}`
        )
      )
    ) as React.ReactElement,
  ];

  if (photosOnly.length > 0) {
    const chunks: RepairPhotoFile[][] = [];
    for (let i = 0; i < photosOnly.length; i += 4) chunks.push(photosOnly.slice(i, i + 4));
    chunks.forEach((chunk, ci) => {
      pages.push(
        el(Page, { key: `photos-${ci}`, size: "A4", style: S.page },
          el(View, { style: IR.topBar },
            el(Text, { style: IR.topLeft }, `${data.jobNo}  ·  분해사진 — DISASSEMBLY PHOTOS`),
            el(Text, { style: IR.topRight }, `${ci + 1}/${chunks.length}`)
          ),
          el(View, { style: { marginTop: 12 } },
            el(View, { style: IR.photoGrid },
              ...chunk.map((photo, pi) =>
                el(View, { key: String(pi), style: IR.photoWrap },
                  el(Image, { src: photo.fileUrl, style: IR.photoImg } as React.ComponentProps<typeof Image>),
                  el(Text, { style: IR.photoName }, photo.fileName)
                )
              )
            )
          ),
          el(View, { style: IR.footer },
            el(Text, { style: IR.footerTxt }, `분해사진  |  ${data.jobNo}`)
          )
        ) as React.ReactElement
      );
    });
  }

  return el(Document, { title: `검사성적서_${data.jobNo}` }, ...pages);
}

export async function generateRepairInspectionPdf(data: RepairInspectionForPdf): Promise<Buffer> {
  const doc = React.createElement(InspectionReportDocument, { data });
  const arrayBuffer = await renderToBuffer(doc as React.ReactElement<DocumentProps>);
  return Buffer.from(arrayBuffer);
}

// ─────────────────────────────────────────────────
// 수리견적서 PDF
// ─────────────────────────────────────────────────
export interface RepairQuoteForPdf {
  jobNo: string;
  pumpMaker: string;
  pumpModel: string;
  serialNo: string | null;
  voltage: string | null;
  repairReason: string | null;
  receivedDate: Date;
  requestedDate: Date | null;
  companyName: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  repairCost: number | null;
  repairPartsText: string | null;
  inspectorName: string | null;
}

function RepairQuoteDocument({ data }: { data: RepairQuoteForPdf }) {
  const el = React.createElement;
  const issued = new Date();
  const year = issued.getFullYear();
  const vat = data.repairCost != null ? Math.round(data.repairCost * VAT_RATE) : 0;
  const total = (data.repairCost ?? 0) + vat;

  const partsOneLine = data.repairPartsText
    ?.split("\n")
    .map(l => l.trim())
    .filter(Boolean)
    .join("  ·  ") ?? "";

  return el(
    Document,
    { title: `수리견적서_${data.jobNo}` },
    el(Page, { size: "A4", style: S.page },

      // ── 헤더
      el(View, { style: S.header },
        el(View, { style: { flexDirection: "row", alignItems: "baseline", gap: 8 } },
          el(Text, { style: S.headerTitle }, "SMARTECH · REPAIR ESTIMATE"),
          el(Text, { style: { fontSize: 11, fontFamily: "Pretendard", fontWeight: 700, color: "#111111" } }, "수리 견적서")
        ),
        el(View, { style: S.headerMeta },
          el(Text, { style: S.headerMetaLine }, `NO · ${data.jobNo}`),
          el(Text, { style: S.headerMetaLine }, `DATE · ${fmtDate(issued)}`),
          el(Text, { style: S.headerMetaLine }, `EQUIPMENT · ${data.pumpMaker} ${data.pumpModel}`)
        )
      ),

      // ── TO / FROM
      el(View, { style: { flexDirection: "row", gap: 8, marginBottom: 12 } },
        el(View, { style: { flex: 1, padding: 10, borderTop: "3 solid #c00020", backgroundColor: "#fafafa" } },
          el(Text, { style: S.partyLabel }, "TO · 수신처"),
          el(View, { style: S.partyRow },
            el(Text, { style: S.partyKey }, "COMPANY"),
            el(Text, { style: S.partyVal }, data.companyName ?? "—")
          ),
          el(View, { style: S.partyRow },
            el(Text, { style: S.partyKey }, "ATTN"),
            el(Text, { style: S.partyVal }, data.contactName ?? "—")
          ),
          el(View, { style: S.partyRow },
            el(Text, { style: S.partyKey }, "TEL"),
            el(Text, { style: S.partyVal }, data.contactPhone ?? "—")
          ),
          el(View, { style: S.partyRow },
            el(Text, { style: S.partyKey }, "EMAIL"),
            el(Text, { style: S.partyVal }, data.contactEmail ?? "—")
          )
        ),
        el(View, { style: { flex: 1, padding: 10, borderTop: "3 solid #0B0B0C", backgroundColor: "#fafafa" } },
          el(Text, { style: S.partyLabel }, "FROM · 발신처"),
          el(View, { style: S.partyRow },
            el(Text, { style: S.partyKey }, "COMPANY"),
            el(Text, { style: S.partyVal }, `${SMARTECH_COMPANY.name} · ${SMARTECH_COMPANY.english}`)
          ),
          el(View, { style: S.partyRow },
            el(Text, { style: S.partyKey }, "CEO"),
            el(Text, { style: S.partyVal }, SMARTECH_COMPANY.ceo)
          ),
          el(View, { style: S.partyRow },
            el(Text, { style: S.partyKey }, "BIZ NO"),
            el(Text, { style: S.partyVal }, SMARTECH_COMPANY.bizNo)
          ),
          el(View, { style: S.partyRow },
            el(Text, { style: S.partyKey }, "TEL"),
            el(Text, { style: S.partyVal }, SMARTECH_COMPANY.officeTel)
          ),
          el(View, { style: S.partyRow },
            el(Text, { style: S.partyKey }, "EMAIL"),
            el(Text, { style: S.partyVal }, SMARTECH_COMPANY.email)
          ),
          el(View, { style: S.partyRow },
            el(Text, { style: S.partyKey }, "OFFICE"),
            el(Text, { style: S.partyVal }, SMARTECH_COMPANY.headOfficeKo)
          ),
          el(View, { style: S.partyRow },
            el(Text, { style: S.partyKey }, "A/S CTR"),
            el(Text, { style: S.partyVal }, SMARTECH_COMPANY.cheonanCenterKo)
          )
        )
      ),

      // ── 품목 테이블
      el(View, { style: S.table },
        el(View, { style: { ...S.tableHeader, backgroundColor: "#f0f0f0" } },
          el(Text, { style: [S.thCell, { width: "6%", textAlign: "center" }] }, "NO"),
          el(Text, { style: [S.thCell, { width: "62%", paddingRight: 4 }] }, "수리 항목  /  교체 파트"),
          el(Text, { style: [S.thCell, { width: "10%", textAlign: "center" }] }, "수량"),
          el(Text, { style: [S.thCell, { width: "22%", textAlign: "right" }] }, "공급가  (VAT 별도)")
        ),
        el(View, { style: S.tableRow },
          el(Text, { style: [S.tdNormal, { width: "6%", textAlign: "center" }] }, "01"),
          el(View, { style: { width: "62%", paddingRight: 8 } },
            el(Text, { style: { fontSize: 9, fontFamily: "Pretendard", fontWeight: 700, color: "#111111", marginBottom: 4 } },
              `기본수리 — ${data.pumpModel}`
            ),
            partsOneLine
              ? el(Text, { style: { fontSize: 7, color: "#555555", lineHeight: 1.6 } }, partsOneLine)
              : null
          ),
          el(Text, { style: [S.tdNormal, { width: "10%", textAlign: "center" }] }, "1식"),
          el(Text, { style: [S.tdAmount, { width: "22%", textAlign: "right" }] },
            data.repairCost != null ? fmt(data.repairCost) : "협의"
          )
        )
      ),

      // ── 합계
      el(View, { style: S.summaryArea },
        el(View, { style: S.summaryBox },
          el(View, { style: S.summaryRow },
            el(Text, { style: S.sumLabel }, "SUB-TOTAL"),
            el(Text, { style: S.sumValue }, data.repairCost != null ? fmt(data.repairCost) : "—")
          ),
          el(View, { style: S.summaryRow },
            el(Text, { style: S.sumLabel }, "VAT (10%)"),
            el(Text, { style: S.sumValue }, data.repairCost != null ? fmt(vat) : "—")
          ),
          el(View, { style: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 7, paddingHorizontal: 8, backgroundColor: "#0B0B0C", marginTop: 2 } },
            el(Text, { style: { fontSize: 10, fontFamily: "Pretendard", fontWeight: 700, color: "#ffffff" } }, "GRAND TOTAL"),
            el(Text, { style: { fontSize: 10, fontFamily: "Pretendard", fontWeight: 700, color: "#c00020" } }, data.repairCost != null ? fmt(total) : "협의")
          )
        )
      ),

      // ── 거래 조건
      el(View, { style: S.termsBox },
        el(View, { style: S.termRow },
          el(Text, { style: S.termLabel }, "PAYMENT"),
          el(Text, { style: S.termValue }, "수리 완료 후 세금계산서 발행 · 협의")
        ),
        el(View, { style: S.termRow },
          el(Text, { style: S.termLabel }, "WARRANTY"),
          el(Text, { style: S.termValue }, "수리 후 3개월 보증")
        ),
        el(View, { style: S.termRow },
          el(Text, { style: S.termLabel }, "A / S"),
          el(Text, { style: S.termValue }, `${SMARTECH_COMPANY.officeTel} · 스마텍 서비스센터 직접 응대`)
        ),
        el(View, { style: { ...S.termRow, marginBottom: 0 } },
          el(Text, { style: S.termLabel }, "NOTE"),
          el(Text, { style: S.termValue }, "본 견적은 참고용이며 분해 검사 후 정확한 금액이 확정됩니다.")
        )
      ),

      // ── 푸터
      el(View, { style: S.footer },
        el(Text, { style: S.footerText },
          `© ${year} SMARTECH CO., LTD.  ·  EDWARDS VACUUM KOREA AUTHORIZED SERVICE PARTNER`
        ),
        el(Text, { style: S.footerText }, "PAGE 1 / 1")
      )
    )
  );
}

export async function generateRepairQuotePdf(data: RepairQuoteForPdf): Promise<Buffer> {
  const doc = React.createElement(RepairQuoteDocument, { data });
  const arrayBuffer = await renderToBuffer(doc as React.ReactElement<DocumentProps>);
  return Buffer.from(arrayBuffer);
}
