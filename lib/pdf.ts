import React from "react";
import path from "path";
import {
  Document,
  Page,
  Text,
  View,
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
  user: {
    name: string;
    company: string;
    email: string;
    phone?: string | null;
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
  colNo:     { width: "6%", textAlign: "center" },
  colCode:   { width: "18%", paddingRight: 4 },
  colDesc:   { width: "42%", paddingRight: 4 },
  colQty:    { width: "8%", textAlign: "center" },
  colPrice:  { width: "13%", textAlign: "right" },
  colAmount: { width: "13%", textAlign: "right" },

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

function fmt(n: number): string {
  return "₩" + n.toLocaleString("en-US");
}

function fmtDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function QuoteDocument({ quote }: { quote: QuoteForPdf }) {
  const issued = new Date(quote.createdAt);
  const year = issued.getFullYear();

  const subtotal = quote.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const vat = Math.round(subtotal * VAT_RATE);
  const grand = subtotal + vat;

  const el = React.createElement;

  return el(
    Document,
    { title: `SMARTECH QUOTATION ${fmtDate(issued)}` },
    el(Page, { size: "A4", style: S.page },

      // ── 헤더
      el(View, { style: S.header },
        el(Text, { style: S.headerTitle }, "SMARTECH · QUOTATION"),
        el(View, { style: S.headerMeta },
          el(Text, { style: S.headerMetaLine }, `DATE · ${fmtDate(issued)}`),
          el(Text, { style: S.headerMetaLine }, `ITEMS · ${quote.items.length} LINES`)
        )
      ),

      // ── TO / FROM
      el(View, { style: S.partiesBox },
        el(View, { style: S.toBox },
          el(Text, { style: S.partyLabel }, "TO · 수신처"),
          el(View, { style: S.partyRow },
            el(Text, { style: S.partyKey }, "Company"),
            el(Text, { style: S.partyVal }, quote.user.company)
          ),
          el(View, { style: S.partyRow },
            el(Text, { style: S.partyKey }, "Attn"),
            el(Text, { style: S.partyVal }, quote.user.name)
          ),
          quote.user.phone
            ? el(View, { style: S.partyRow },
                el(Text, { style: S.partyKey }, "Tel"),
                el(Text, { style: S.partyVal }, quote.user.phone)
              )
            : null,
          quote.user.email
            ? el(View, { style: S.partyRow },
                el(Text, { style: S.partyKey }, "Email"),
                el(Text, { style: S.partyVal }, quote.user.email)
              )
            : null
        ),
        el(View, { style: S.fromBox },
          el(Text, { style: S.partyLabel }, "FROM · 발신처"),
          el(View, { style: S.partyRow },
            el(Text, { style: S.partyKey }, "Company"),
            el(Text, { style: S.partyVal }, `${SMARTECH_COMPANY.name} · ${SMARTECH_COMPANY.english}`)
          ),
          el(View, { style: S.partyRow },
            el(Text, { style: S.partyKey }, "CEO"),
            el(Text, { style: S.partyVal }, SMARTECH_COMPANY.ceo)
          ),
          el(View, { style: S.partyRow },
            el(Text, { style: S.partyKey }, "Biz No"),
            el(Text, { style: S.partyVal }, SMARTECH_COMPANY.bizNo)
          ),
          el(View, { style: S.partyRow },
            el(Text, { style: S.partyKey }, "Tel"),
            el(Text, { style: S.partyVal }, `${SMARTECH_COMPANY.officeTel} / M ${SMARTECH_COMPANY.mobileTel}`)
          ),
          el(View, { style: S.partyRow },
            el(Text, { style: S.partyKey }, "Email"),
            el(Text, { style: S.partyVal }, SMARTECH_COMPANY.email)
          ),
          el(View, { style: S.partyRow },
            el(Text, { style: S.partyKey }, "Office"),
            el(Text, { style: S.partyVal }, SMARTECH_COMPANY.headOfficeKo)
          )
        )
      ),

      // ── 품목 테이블
      el(View, { style: S.table },
        el(View, { style: S.tableHeader },
          el(Text, { style: [S.thCell, S.colNo] }, "No"),
          el(Text, { style: [S.thCell, S.colCode] }, "PART NO"),
          el(Text, { style: [S.thCell, S.colDesc] }, "DESCRIPTION"),
          el(Text, { style: [S.thCell, S.colQty] }, "QTY"),
          el(Text, { style: [S.thCell, S.colPrice] }, "UNIT PRICE"),
          el(Text, { style: [S.thCell, S.colAmount] }, "SUBTOTAL")
        ),
        ...quote.items.map((item, idx) =>
          el(View, { key: String(idx), style: idx % 2 === 0 ? S.tableRow : S.tableRowAlt },
            el(Text, { style: [S.tdNormal, S.colNo] }, String(idx + 1).padStart(2, "0")),
            el(Text, { style: [S.tdCode, S.colCode] }, item.product.partNo),
            el(Text, { style: [S.tdNormal, S.colDesc] }, item.product.description),
            el(Text, { style: [S.tdNormal, S.colQty] }, `${item.quantity} EA`),
            el(Text, { style: [S.tdNormal, S.colPrice] }, `₩ ${item.unitPrice.toLocaleString("en-US")}`),
            el(Text, { style: [S.tdAmount, S.colAmount] }, `₩ ${(item.unitPrice * item.quantity).toLocaleString("en-US")}`)
          )
        )
      ),

      // ── 합계
      el(View, { style: S.summaryArea },
        el(View, { style: S.summaryBox },
          el(View, { style: S.summaryRow },
            el(Text, { style: S.sumLabel }, "Sub-Total"),
            el(Text, { style: S.sumValue }, `₩ ${subtotal.toLocaleString("en-US")}`)
          ),
          el(View, { style: S.summaryRow },
            el(Text, { style: S.sumLabel }, "VAT (10%)"),
            el(Text, { style: S.sumValue }, `₩ ${vat.toLocaleString("en-US")}`)
          ),
          el(View, { style: S.summaryTotalRow },
            el(Text, { style: S.sumTLabel }, "GRAND TOTAL"),
            el(Text, { style: S.sumTValue }, `₩ ${grand.toLocaleString("en-US")}`)
          )
        )
      ),

      // ── 거래 조건
      el(View, { style: S.termsBox },
        el(View, { style: S.termRow },
          el(Text, { style: S.termLabel }, "PAYMENT"),
          el(Text, { style: S.termValue }, "납품 전 현금결제")
        ),
        el(View, { style: S.termRow },
          el(Text, { style: S.termLabel }, "DELIVERY"),
          el(Text, { style: S.termValue }, "국내 재고분 D+1 / 해외 발주분 D+14 (협의)")
        ),
        el(View, { style: S.termRow },
          el(Text, { style: S.termLabel }, "WARRANTY"),
          el(Text, { style: S.termValue }, "12개월 · Edwards 정품 보증")
        ),
        el(View, { style: S.termRow },
          el(Text, { style: S.termLabel }, "A / S"),
          el(Text, { style: S.termValue }, "현장 서비스 · 기술지원")
        ),
        quote.note
          ? el(View, { style: { ...S.termRow, marginTop: 2 } },
              el(Text, { style: S.termLabel }, "REMARK"),
              el(Text, { style: S.termValue }, quote.note)
            )
          : null
      ),

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
  colDescD:   { width: "27%", paddingRight: 3 },
  colSpecD:   { width: "11%", paddingRight: 3 },
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
  topBar: { backgroundColor: "#111111", paddingVertical: 10, paddingHorizontal: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  topBarLeft: { color: "#ffffff", fontSize: 7, fontFamily: "Pretendard", letterSpacing: 1 },
  topBarRight: { color: "#aaaaaa", fontSize: 7, letterSpacing: 0.5 },
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
  tableHeader: { flexDirection: "row", backgroundColor: "#111111", paddingVertical: 6, paddingHorizontal: 6 },
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
          el(Text, { style: [DS.thCell, DN.colSpecD] }, "SPEC"),
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
            el(Text, { style: [DS.tdNormal, DN.colSpecD] }, item.product.category ?? "-"),
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
