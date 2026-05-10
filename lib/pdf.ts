import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  type DocumentProps,
} from "@react-pdf/renderer";

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
    fontFamily: "Helvetica",
    fontSize: 9,
    paddingTop: 36,
    paddingBottom: 50,
    paddingHorizontal: 44,
    backgroundColor: "#ffffff",
    color: "#111111",
  },

  // ── 최상단 헤더 바
  topBar: {
    backgroundColor: "#111111",
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topBarLeft: {
    color: "#ffffff",
    fontSize: 7,
    fontFamily: "Helvetica",
    letterSpacing: 1,
  },
  topBarRight: {
    color: "#aaaaaa",
    fontSize: 7,
    letterSpacing: 0.5,
  },

  // ── 타이틀 영역
  titleArea: {
    borderBottom: "2 solid #111111",
    paddingBottom: 10,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 16,
  },
  titleLeft: {},
  quoteTitle: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
    letterSpacing: 6,
  },
  quoteSubtitle: {
    fontSize: 8,
    color: "#555555",
    marginTop: 2,
    letterSpacing: 2,
  },
  titleRight: {
    textAlign: "right",
  },
  quoteNo: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
    letterSpacing: 1,
  },
  quoteStatus: {
    fontSize: 7,
    color: "#555555",
    marginTop: 2,
    letterSpacing: 1,
  },

  // ── 섹션 구분선
  sectionDivider: {
    borderTop: "1 solid #dddddd",
    marginTop: 12,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#888888",
    letterSpacing: 2,
    marginBottom: 8,
  },

  // ── Section 01: TO / FROM
  toFromRow: {
    flexDirection: "row",
    marginBottom: 14,
  },
  toBox: {
    flex: 1,
    paddingRight: 20,
    borderRight: "1 solid #eeeeee",
  },
  fromBox: {
    flex: 1,
    paddingLeft: 20,
  },
  toFromLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#888888",
    letterSpacing: 2,
    marginBottom: 6,
  },
  toFromCompany: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
    marginBottom: 3,
  },
  toFromLine: {
    fontSize: 8,
    color: "#444444",
    marginBottom: 2,
    lineHeight: 1.4,
  },
  toFromLineGray: {
    fontSize: 7,
    color: "#888888",
    marginBottom: 1,
  },

  // ── Section 02: 금액 요약
  amountArea: {
    backgroundColor: "#f7f7f7",
    padding: 12,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  grandTotalLabel: {
    fontSize: 8,
    color: "#555555",
    marginBottom: 3,
    letterSpacing: 1,
  },
  grandTotalAmount: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
  },
  grandTotalSub: {
    fontSize: 7,
    color: "#888888",
    marginTop: 2,
  },
  amountBreakdown: {
    textAlign: "right",
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  breakdownLabel: {
    fontSize: 8,
    color: "#555555",
    marginRight: 20,
  },
  breakdownValue: {
    fontSize: 8,
    color: "#111111",
    fontFamily: "Helvetica-Bold",
  },
  taxBadge: {
    backgroundColor: "#111111",
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  taxBadgeText: {
    fontSize: 6,
    color: "#ffffff",
    letterSpacing: 1,
  },

  // ── Section 03: 품목 테이블
  table: {
    width: "100%",
    marginBottom: 14,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#111111",
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  thCell: {
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #eeeeee",
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottom: "1 solid #eeeeee",
    paddingVertical: 6,
    paddingHorizontal: 6,
    backgroundColor: "#fafafa",
  },
  colNo:     { width: "6%", textAlign: "center" },
  colCode:   { width: "18%", paddingRight: 4 },
  colDesc:   { width: "38%", paddingRight: 4 },
  colQty:    { width: "8%", textAlign: "center" },
  colPrice:  { width: "15%", textAlign: "right" },
  colAmount: { width: "15%", textAlign: "right" },

  tdNormal: { fontSize: 8, color: "#222222" },
  tdCode:   { fontSize: 7, color: "#333333", fontFamily: "Helvetica-Bold" },
  tdAmount: { fontSize: 8, color: "#111111", fontFamily: "Helvetica-Bold" },

  // ── Section 04: 합계
  summaryArea: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 14,
  },
  summaryBox: {
    width: 220,
    borderTop: "2 solid #111111",
    paddingTop: 8,
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
    marginTop: 2,
  },
  sumLabel:  { fontSize: 8, color: "#555555" },
  sumValue:  { fontSize: 8, color: "#111111" },
  sumTLabel: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#111111" },
  sumTValue: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#111111" },

  // ── Section 05: 신뢰 배지
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    borderTop: "1 solid #eeeeee",
    paddingTop: 10,
  },
  badge: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
    marginBottom: 2,
    textAlign: "center",
  },
  badgeSub: {
    fontSize: 6,
    color: "#888888",
    textAlign: "center",
  },
  badgeDivider: {
    borderRight: "1 solid #eeeeee",
  },

  // ── Section 06: 거래 조건
  termsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 14,
    backgroundColor: "#f7f7f7",
    padding: 10,
  },
  termItem: {
    width: "50%",
    marginBottom: 5,
  },
  termLabel: {
    fontSize: 6,
    color: "#888888",
    letterSpacing: 1,
    marginBottom: 1,
  },
  termValue: {
    fontSize: 8,
    color: "#111111",
  },

  // ── Section 07: 서명
  sigRow: {
    flexDirection: "row",
    marginBottom: 14,
    borderTop: "1 solid #dddddd",
    paddingTop: 10,
  },
  sigBox: {
    flex: 1,
    paddingRight: 16,
  },
  sigBoxRight: {
    flex: 1,
    paddingLeft: 16,
    borderLeft: "1 solid #eeeeee",
  },
  sigLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#888888",
    letterSpacing: 1,
    marginBottom: 4,
  },
  sigName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
    marginBottom: 2,
  },
  sigLine: {
    borderTop: "1 solid #aaaaaa",
    marginTop: 24,
    paddingTop: 3,
  },
  sigLineText: {
    fontSize: 7,
    color: "#aaaaaa",
  },

  // ── 푸터
  footer: {
    position: "absolute",
    bottom: 24,
    left: 44,
    right: 44,
    borderTop: "1 solid #dddddd",
    paddingTop: 6,
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
  const expires = quote.expiresAt ? new Date(quote.expiresAt) : null;
  const year = issued.getFullYear();
  const seq = String(quote.id).padStart(6, "0");
  const quoteNo = `SMT-${year}-Q-${seq}`;

  const subtotal = quote.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const vat = Math.round(subtotal * 0.1);
  const grand = subtotal + vat;
  const totalQty = quote.items.reduce((s, i) => s + i.quantity, 0);

  const el = React.createElement;

  return el(
    Document,
    { title: `견적서 ${quoteNo}` },
    el(Page, { size: "A4", style: S.page },

      // ── 최상단 검은 바
      el(View, { style: S.topBar },
        el(Text, { style: S.topBarLeft }, `${quoteNo}  ·  SMARTECH QUOTATION`),
        el(Text, { style: S.topBarRight }, `STATUS · ACTIVE  |  ${fmtDate(issued)}`)
      ),

      // ── 타이틀
      el(View, { style: S.titleArea },
        el(View, { style: S.titleLeft },
          el(Text, { style: S.quoteTitle }, "견  적  서"),
          el(Text, { style: S.quoteSubtitle }, "SMARTECH  ·  Edwards Vacuum Korea Authorized Distributor")
        ),
        el(View, { style: S.titleRight },
          el(Text, { style: S.quoteNo }, quoteNo),
          el(Text, { style: S.quoteStatus },
            `발행일 ${fmtDate(issued)}  |  유효기간 ${expires ? fmtDate(expires) : "14일"}`
          )
        )
      ),

      // ── Section 01: TO / FROM
      el(Text, { style: S.sectionLabel }, "— 01  거래처 정보"),
      el(View, { style: S.toFromRow },
        el(View, { style: S.toBox },
          el(Text, { style: S.toFromLabel }, "TO  ·  수  신"),
          el(Text, { style: S.toFromCompany }, quote.user.company + " 귀중"),
          el(Text, { style: S.toFromLine }, `담당자: ${quote.user.name}`),
          el(Text, { style: S.toFromLine }, `E-mail: ${quote.user.email}`),
          quote.user.phone
            ? el(Text, { style: S.toFromLine }, `Tel: ${quote.user.phone}`)
            : null
        ),
        el(View, { style: S.fromBox },
          el(Text, { style: S.toFromLabel }, "FROM  ·  발  신"),
          el(Text, { style: S.toFromCompany }, "(주)스마텍"),
          el(Text, { style: S.toFromLine }, "Edwards Vacuum Korea Authorized Distributor"),
          el(Text, { style: S.toFromLineGray }, "E-mail: info@smartech.co.kr"),
          el(Text, { style: S.toFromLineGray }, "TEL: 02-0000-0000")
        )
      ),

      // ── Section 02: 금액 요약
      el(Text, { style: S.sectionLabel }, "— 02  금액 요약"),
      el(View, { style: S.amountArea },
        el(View, null,
          el(Text, { style: S.grandTotalLabel }, "GRAND TOTAL  ·  총액 (VAT 포함)"),
          el(Text, { style: S.grandTotalAmount }, fmt(grand)),
          el(Text, { style: S.grandTotalSub }, `ITEMS: ${quote.items.length}종  ·  ${totalQty} EA`),
          quote.taxInvoiceRequested
            ? el(View, { style: S.taxBadge },
                el(Text, { style: S.taxBadgeText }, "세금계산서 발행 신청")
              )
            : null
        ),
        el(View, { style: S.amountBreakdown },
          el(View, { style: S.breakdownRow },
            el(Text, { style: S.breakdownLabel }, "공급가액 (Supply)"),
            el(Text, { style: S.breakdownValue }, fmt(subtotal))
          ),
          el(View, { style: S.breakdownRow },
            el(Text, { style: S.breakdownLabel }, "부가세 10% (VAT)"),
            el(Text, { style: S.breakdownValue }, fmt(vat))
          ),
          el(View, { style: { ...S.breakdownRow, borderTop: "1 solid #cccccc", paddingTop: 4, marginTop: 2 } },
            el(Text, { style: { ...S.breakdownLabel, fontFamily: "Helvetica-Bold" } }, "합계 (Total)"),
            el(Text, { style: { ...S.breakdownValue, fontSize: 10 } }, fmt(grand))
          )
        )
      ),

      // ── Section 03: 품목 테이블
      el(Text, { style: S.sectionLabel }, `— 03  품목 명세  (${quote.items.length} LINES · ${totalQty} EA)`),
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
            el(Text, { style: [S.tdNormal, S.colPrice] }, fmt(item.unitPrice)),
            el(Text, { style: [S.tdAmount, S.colAmount] }, fmt(item.unitPrice * item.quantity))
          )
        )
      ),

      // ── Section 04: 합계
      el(View, { style: S.summaryArea },
        el(View, { style: S.summaryBox },
          el(View, { style: S.summaryRow },
            el(Text, { style: S.sumLabel }, "공급가액"),
            el(Text, { style: S.sumValue }, fmt(subtotal))
          ),
          el(View, { style: S.summaryRow },
            el(Text, { style: S.sumLabel }, "부가세 (10%)"),
            el(Text, { style: S.sumValue }, fmt(vat))
          ),
          el(View, { style: S.summaryTotalRow },
            el(Text, { style: S.sumTLabel }, "최종 합계"),
            el(Text, { style: S.sumTValue }, fmt(grand))
          )
        )
      ),

      // ── Section 05: 신뢰 배지
      el(View, { style: S.badgeRow },
        el(View, { style: [S.badge, S.badgeDivider] },
          el(Text, { style: S.badgeTitle }, "Edwards 공식 대리점"),
          el(Text, { style: S.badgeSub }, "Authorized Distributor")
        ),
        el(View, { style: [S.badge, S.badgeDivider] },
          el(Text, { style: S.badgeTitle }, "정품 공식 유통"),
          el(Text, { style: S.badgeSub }, "Serial No. 추적 보증")
        ),
        el(View, { style: [S.badge, S.badgeDivider] },
          el(Text, { style: S.badgeTitle }, "24/7 응급 대응"),
          el(Text, { style: S.badgeSub }, "긴급 기술 지원")
        ),
        el(View, { style: S.badge },
          el(Text, { style: S.badgeTitle }, "30년 수리 경력"),
          el(Text, { style: S.badgeSub }, "전문 엔지니어팀")
        )
      ),

      // ── Section 06: 거래 조건
      el(Text, { style: S.sectionLabel }, "— 06  거래 조건"),
      el(View, { style: S.termsRow },
        el(View, { style: S.termItem },
          el(Text, { style: S.termLabel }, "PAYMENT"),
          el(Text, { style: S.termValue }, "세금계산서 발행 · 익월 말 결제")
        ),
        el(View, { style: S.termItem },
          el(Text, { style: S.termLabel }, "DELIVERY"),
          el(Text, { style: S.termValue }, "국내 재고 D+1 / 해외 주문 D+14")
        ),
        el(View, { style: S.termItem },
          el(Text, { style: S.termLabel }, "SHIPPING"),
          el(Text, { style: S.termValue }, "수도권 무료 · 지방 별도")
        ),
        el(View, { style: S.termItem },
          el(Text, { style: S.termLabel }, "WARRANTY"),
          el(Text, { style: S.termValue }, "12개월 제품 보증")
        ),
        quote.note
          ? el(View, { style: { ...S.termItem, width: "100%", marginTop: 4 } },
              el(Text, { style: S.termLabel }, "REMARK · 비고"),
              el(Text, { style: S.termValue }, quote.note)
            )
          : null
      ),

      // ── Section 07: 서명
      el(Text, { style: S.sectionLabel }, "— 07  확인 서명"),
      el(View, { style: S.sigRow },
        el(View, { style: S.sigBox },
          el(Text, { style: S.sigLabel }, "ISSUED BY  ·  발행인"),
          el(Text, { style: S.sigName }, "(주)스마텍 영업팀"),
          el(View, { style: S.sigLine },
            el(Text, { style: S.sigLineText }, "SMARTECH  /  SEAL & SIGNATURE")
          )
        ),
        el(View, { style: S.sigBoxRight },
          el(Text, { style: S.sigLabel }, "ACKNOWLEDGED BY  ·  수신 확인"),
          el(Text, { style: S.sigName }, quote.user.company),
          el(View, { style: S.sigLine },
            el(Text, { style: S.sigLineText }, `${quote.user.name}  /  DATE: ____.__.__`)
          )
        )
      ),

      // ── 푸터
      el(View, { style: S.footer },
        el(Text, { style: S.footerText },
          `본 견적서는 발행일로부터 14일간 유효합니다.  |  ${quoteNo}`
        ),
        el(Text, { style: S.footerText }, "스마텍  ·  (주)SMARTECH")
      )
    )
  );
}

export async function generateQuotePdf(quote: QuoteForPdf): Promise<Buffer> {
  const doc = React.createElement(QuoteDocument, { quote });
  const arrayBuffer = await renderToBuffer(doc as React.ReactElement<DocumentProps>);
  return Buffer.from(arrayBuffer);
}
