/**
 * react-pdf (@react-pdf/renderer) 를 사용하여 견적서 PDF를 생성합니다.
 * Next.js Edge/서버 환경에서 renderToBuffer로 Buffer를 반환합니다.
 */
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

// ─── 타입 정의 ───────────────────────────────────────────────────────────────

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
  };
  items: {
    quantity: number;
    unitPrice: number;
    product: {
      partNo: string;
      description: string;
    };
  }[];
}

// ─── 스타일 ───────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 50,
    color: "#1a1a2e",
  },
  // 헤더
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    borderBottom: "2 solid #1e3a5f",
    paddingBottom: 12,
  },
  docTitle: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a5f",
    letterSpacing: 4,
  },
  companyInfo: {
    textAlign: "right",
    fontSize: 9,
    color: "#555",
    lineHeight: 1.5,
  },
  companyName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a5f",
    marginBottom: 2,
  },
  // 견적 메타
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  metaBox: {
    backgroundColor: "#f4f7fb",
    borderRadius: 4,
    padding: 10,
    flex: 1,
    marginRight: 8,
  },
  metaBoxRight: {
    backgroundColor: "#f4f7fb",
    borderRadius: 4,
    padding: 10,
    flex: 1,
    marginLeft: 8,
  },
  metaLabel: {
    fontSize: 8,
    color: "#888",
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a2e",
  },
  // 수신 정보
  recipientBox: {
    borderLeft: "3 solid #1e3a5f",
    paddingLeft: 10,
    marginBottom: 20,
  },
  recipientLabel: {
    fontSize: 8,
    color: "#888",
    marginBottom: 3,
  },
  recipientName: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a2e",
  },
  recipientSub: {
    fontSize: 9,
    color: "#555",
    marginTop: 2,
  },
  // 테이블
  table: {
    width: "100%",
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1e3a5f",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableHeaderCell: {
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #e5e7eb",
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottom: "1 solid #e5e7eb",
    paddingVertical: 5,
    paddingHorizontal: 4,
    backgroundColor: "#f9fafb",
  },
  cellNo: { width: "6%", textAlign: "center" },
  cellCode: { width: "18%", textAlign: "center", fontFamily: "Helvetica" },
  cellDesc: { width: "34%", paddingLeft: 4 },
  cellQty: { width: "10%", textAlign: "center" },
  cellPrice: { width: "16%", textAlign: "right" },
  cellAmount: { width: "16%", textAlign: "right" },
  // 합계
  summaryBox: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  summaryTable: {
    width: 240,
    borderTop: "2 solid #1e3a5f",
    paddingTop: 6,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  summaryLabel: {
    fontSize: 10,
    color: "#555",
  },
  summaryValue: {
    fontSize: 10,
    color: "#1a1a2e",
  },
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderTop: "1 solid #1e3a5f",
    marginTop: 4,
  },
  summaryTotalLabel: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a5f",
  },
  summaryTotalValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a5f",
  },
  // 하단
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
  },
  footerNote: {
    fontSize: 8,
    color: "#888",
    textAlign: "center",
    borderTop: "1 solid #e5e7eb",
    paddingTop: 8,
  },
  taxBadge: {
    backgroundColor: "#eff6ff",
    border: "1 solid #bfdbfe",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  taxBadgeText: {
    fontSize: 8,
    color: "#1d4ed8",
  },
});

// ─── 헬퍼 ─────────────────────────────────────────────────────────────────────

function formatKRW(n: number): string {
  return n.toLocaleString("en-US") + " 원";
}

function formatDateKR(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}년 ${m}월 ${dd}일`;
}

// ─── PDF 컴포넌트 ────────────────────────────────────────────────────────────

function QuoteDocument({ quote }: { quote: QuoteForPdf }) {
  const issuedDate = new Date(quote.createdAt);
  const expiresDate = quote.expiresAt ? new Date(quote.expiresAt) : null;
  const quoteNo = `Q-${quote.id}-${issuedDate.getFullYear()}${String(issuedDate.getMonth() + 1).padStart(2, "0")}${String(issuedDate.getDate()).padStart(2, "0")}`;

  const subtotal = quote.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const vat = Math.round(subtotal * 0.1);
  const grandTotal = subtotal + vat;

  return React.createElement(
    Document,
    { title: `견적서 ${quoteNo}` },
    React.createElement(
      Page,
      { size: "A4", style: S.page },

      // ── 헤더
      React.createElement(
        View,
        { style: S.headerRow },
        React.createElement(Text, { style: S.docTitle }, "견  적  서"),
        React.createElement(
          View,
          { style: S.companyInfo },
          React.createElement(Text, { style: S.companyName }, "스마텍"),
          React.createElement(Text, null, "대표: 홍길동"),
          React.createElement(Text, null, "사업자등록번호: 000-00-00000"),
          React.createElement(Text, null, "TEL: 02-0000-0000"),
          React.createElement(Text, null, "E-mail: info@smartech.co.kr"),
          React.createElement(Text, null, "주소: 서울특별시 OO구 OO로 000")
        )
      ),

      // ── 견적 메타 정보
      React.createElement(
        View,
        { style: S.metaRow },
        React.createElement(
          View,
          { style: S.metaBox },
          React.createElement(Text, { style: S.metaLabel }, "견적번호"),
          React.createElement(Text, { style: S.metaValue }, quoteNo)
        ),
        React.createElement(
          View,
          { style: S.metaBox },
          React.createElement(Text, { style: S.metaLabel }, "발행일"),
          React.createElement(Text, { style: S.metaValue }, formatDateKR(issuedDate))
        ),
        React.createElement(
          View,
          { style: S.metaBoxRight },
          React.createElement(Text, { style: S.metaLabel }, "유효기간"),
          React.createElement(
            Text,
            { style: S.metaValue },
            expiresDate ? formatDateKR(expiresDate) : "-"
          )
        )
      ),

      // ── 수신 정보
      React.createElement(
        View,
        { style: S.recipientBox },
        React.createElement(Text, { style: S.recipientLabel }, "수신"),
        React.createElement(Text, { style: S.recipientName }, quote.user.company + " 귀중"),
        React.createElement(
          Text,
          { style: S.recipientSub },
          "담당자: " + quote.user.name + "  |  " + quote.user.email
        )
      ),

      // ── 세금계산서 신청 배지
      quote.taxInvoiceRequested
        ? React.createElement(
            View,
            { style: S.taxBadge },
            React.createElement(Text, { style: S.taxBadgeText }, "세금계산서 발행 신청 포함")
          )
        : null,

      // ── 품목 테이블
      React.createElement(
        View,
        { style: S.table },

        // 테이블 헤더
        React.createElement(
          View,
          { style: S.tableHeader },
          React.createElement(Text, { style: [S.tableHeaderCell, S.cellNo] }, "No"),
          React.createElement(Text, { style: [S.tableHeaderCell, S.cellCode] }, "코드번호"),
          React.createElement(Text, { style: [S.tableHeaderCell, S.cellDesc] }, "품목명"),
          React.createElement(Text, { style: [S.tableHeaderCell, S.cellQty] }, "수량"),
          React.createElement(Text, { style: [S.tableHeaderCell, S.cellPrice] }, "단가"),
          React.createElement(Text, { style: [S.tableHeaderCell, S.cellAmount] }, "금액")
        ),

        // 테이블 행
        ...quote.items.map((item, idx) =>
          React.createElement(
            View,
            { key: idx, style: idx % 2 === 0 ? S.tableRow : S.tableRowAlt },
            React.createElement(Text, { style: [{ fontSize: 9, color: "#555" }, S.cellNo] }, String(idx + 1)),
            React.createElement(Text, { style: [{ fontSize: 8, color: "#2563eb" }, S.cellCode] }, item.product.partNo),
            React.createElement(Text, { style: [{ fontSize: 9 }, S.cellDesc] }, item.product.description),
            React.createElement(Text, { style: [{ fontSize: 9 }, S.cellQty] }, String(item.quantity)),
            React.createElement(Text, { style: [{ fontSize: 9 }, S.cellPrice] }, item.unitPrice.toLocaleString("en-US")),
            React.createElement(Text, { style: [{ fontSize: 9, fontFamily: "Helvetica-Bold" }, S.cellAmount] }, (item.unitPrice * item.quantity).toLocaleString("en-US"))
          )
        )
      ),

      // ── 합계
      React.createElement(
        View,
        { style: S.summaryBox },
        React.createElement(
          View,
          { style: S.summaryTable },
          React.createElement(
            View,
            { style: S.summaryRow },
            React.createElement(Text, { style: S.summaryLabel }, "공급가액"),
            React.createElement(Text, { style: S.summaryValue }, formatKRW(subtotal))
          ),
          React.createElement(
            View,
            { style: S.summaryRow },
            React.createElement(Text, { style: S.summaryLabel }, "부가세 (10%)"),
            React.createElement(Text, { style: S.summaryValue }, formatKRW(vat))
          ),
          React.createElement(
            View,
            { style: S.summaryTotalRow },
            React.createElement(Text, { style: S.summaryTotalLabel }, "합  계"),
            React.createElement(Text, { style: S.summaryTotalValue }, formatKRW(grandTotal))
          )
        )
      ),

      // ── 비고
      quote.note
        ? React.createElement(
            View,
            { style: { marginBottom: 16, backgroundColor: "#f9fafb", borderRadius: 4, padding: 10 } },
            React.createElement(Text, { style: { fontSize: 8, color: "#888", marginBottom: 3 } }, "비고"),
            React.createElement(Text, { style: { fontSize: 9 } }, quote.note)
          )
        : null,

      // ── 하단 푸터
      React.createElement(
        View,
        { style: S.footer },
        React.createElement(
          Text,
          { style: S.footerNote },
          "본 견적서는 발행일로부터 14일간 유효합니다. | 위 금액으로 견적합니다. | 스마텍"
        )
      )
    )
  );
}

// ─── 공개 함수 ───────────────────────────────────────────────────────────────

export async function generateQuotePdf(quote: QuoteForPdf): Promise<Buffer> {
  const doc = React.createElement(QuoteDocument, { quote });
  const arrayBuffer = await renderToBuffer(
    doc as React.ReactElement<DocumentProps>
  );
  return Buffer.from(arrayBuffer);
}
