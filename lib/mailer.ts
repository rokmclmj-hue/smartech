import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * 견적서 PDF를 첨부하여 이메일로 발송합니다.
 */
export async function sendQuotePdf(
  to: string,
  pdfBuffer: Buffer,
  quoteNo: string,
  opts?: {
    html?: string;
    text?: string;
    extraAttachments?: { filename: string; content: Buffer; contentType: string }[];
  }
): Promise<void> {
  await transporter.sendMail({
    from: `"스마텍" <${process.env.GMAIL_USER}>`,
    to,
    subject: `[스마텍] 견적서 #${quoteNo} 입니다.`,
    text:
      opts?.text ??
      `안녕하세요, 스마텍입니다.\n\n요청하신 견적서(#${quoteNo})를 첨부하여 드립니다.\n궁금한 사항이 있으시면 언제든 연락 주세요.\n\n감사합니다.`,
    html: opts?.html,
    attachments: [
      {
        filename: `견적서_${quoteNo}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
      ...(opts?.extraAttachments ?? []),
    ],
  });
}

/**
 * 사업자등록증 등 서류 제출 요청 이메일을 발송합니다.
 */
export async function sendBusinessDocRequest(
  to: string,
  customerName: string
): Promise<void> {
  await transporter.sendMail({
    from: `"스마텍" <${process.env.GMAIL_USER}>`,
    to,
    subject: "[스마텍] 사업자등록증 제출 요청",
    text: `${customerName} 고객님, 안녕하세요.\n\n스마텍 딜러/OEM 등록을 위해 사업자등록증 사본을 제출해 주시기 바랍니다.\n이메일 회신 또는 홈페이지 마이페이지를 통해 업로드해 주세요.\n\n감사합니다.`,
  });
}

/**
 * 매직 링크 이메일 발송 (비밀번호 없이 로그인)
 */
export async function sendMagicLink(to: string, magicUrl: string): Promise<void> {
  await transporter.sendMail({
    from: `"스마텍" <${process.env.GMAIL_USER}>`,
    to,
    subject: "[스마텍] 로그인 링크가 도착했습니다",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border:1px solid #e5e7eb;">
        <div style="font-size:22px;font-weight:700;letter-spacing:-0.03em;margin-bottom:4px;">
          Smartech<span style="color:#c00020;">.</span>
        </div>
        <div style="font-size:11px;color:#9ca3af;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:32px;">
          Edwards Vacuum · Korea Official
        </div>
        <p style="font-size:15px;color:#111;margin-bottom:8px;">안녕하세요.</p>
        <p style="font-size:14px;color:#374151;line-height:1.7;margin-bottom:32px;">
          아래 버튼을 클릭하시면 비밀번호 없이 바로 로그인됩니다.<br>
          <span style="color:#9ca3af;font-size:12px;">링크는 15분간 유효하며 1회만 사용 가능합니다.</span>
        </p>
        <a href="${magicUrl}" style="display:inline-block;background:#c00020;color:#fff;padding:14px 32px;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:-0.01em;">
          로그인하기 →
        </a>
        <p style="margin-top:32px;font-size:12px;color:#9ca3af;line-height:1.6;">
          본인이 요청하지 않은 경우 이 메일을 무시하셔도 됩니다.<br>
          문의: 031-204-7170
        </p>
      </div>
    `,
    text: `스마텍 로그인 링크\n\n아래 링크를 클릭하여 로그인하세요 (15분 유효):\n${magicUrl}\n\n본인이 요청하지 않은 경우 무시하세요.`,
  });
}

/**
 * 거래명세표 PDF를 첨부하여 이메일로 발송합니다.
 */
export async function sendDeliveryNotePdf(
  to: string,
  pdfBuffer: Buffer,
  noteNo: string,
  opts: { company: string; contactName: string; grandTotal: number }
): Promise<void> {
  const fmt = (n: number) => "₩" + n.toLocaleString("ko-KR");
  await transporter.sendMail({
    from: `"스마텍" <${process.env.GMAIL_USER}>`,
    to,
    subject: `[스마텍] 거래명세표 #${noteNo} 입니다.`,
    html: `<div style="font-family:'Malgun Gothic','Apple SD Gothic Neo',Arial,sans-serif;color:#222;line-height:1.7;font-size:14px">
  <p>${opts.company} ${opts.contactName} 님, 안녕하세요. <strong>(주)스마텍</strong>입니다.</p>
  <p>출고가 완료되어 거래명세표를 첨부하여 드립니다.</p>
  <table style="border-collapse:collapse;margin:18px 0;font-size:13px">
    <tr><td style="padding:6px 12px;color:#666;border:1px solid #ddd">명세표 번호</td>
        <td style="padding:6px 12px;border:1px solid #ddd"><strong>${noteNo}</strong></td></tr>
    <tr><td style="padding:6px 12px;color:#666;border:1px solid #ddd">공급가액 (VAT 포함)</td>
        <td style="padding:6px 12px;border:1px solid #ddd"><strong>${fmt(opts.grandTotal)}</strong></td></tr>
  </table>
  <p style="color:#555;font-size:13px">세금계산서는 별도 안내드리겠습니다.</p>
  <p style="margin-top:20px">감사합니다.<br><strong>(주)스마텍 영업팀</strong><br>
  <span style="font-size:12px;color:#888">031-204-7170 · info@smartechvacuum.com</span></p>
</div>`,
    attachments: [
      {
        filename: `거래명세표_${noteNo}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}

/**
 * 등급 승인 완료 이메일을 발송합니다.
 */
export async function sendApprovalNotice(
  to: string,
  customerName: string,
  tier: string
): Promise<void> {
  await transporter.sendMail({
    from: `"스마텍" <${process.env.GMAIL_USER}>`,
    to,
    subject: "[스마텍] 등급 승인 완료 안내",
    text: `${customerName} 고객님, 안녕하세요.\n\n고객님의 스마텍 계정이 ${tier} 등급으로 승인되었습니다.\n이제 해당 등급의 가격 정책이 적용됩니다.\n\n감사합니다.`,
  });
}

export async function sendManualDeliveryNote(opts: {
  to: string;
  pdfBuffer: Buffer;
  noteNo: string;
  toCompany: string;
  bodyText?: string;
}): Promise<void> {
  await transporter.sendMail({
    from: `"스마텍" <${process.env.GMAIL_USER}>`,
    to: opts.to,
    subject: `[스마텍] 거래명세표 ${opts.noteNo} 발송드립니다.`,
    text:
      opts.bodyText ??
      `${opts.toCompany} 담당자님, 안녕하세요.\n\n스마텍입니다.\n거래명세표(${opts.noteNo})를 첨부하여 드립니다.\n궁금하신 사항이 있으시면 언제든 연락 주세요.\n\n감사합니다.\n(주)스마텍`,
    attachments: [
      {
        filename: `거래명세표_${opts.noteNo}.pdf`,
        content: opts.pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}

export async function sendManualPurchaseOrder(opts: {
  to: string;
  cc?: string[];
  pdfBuffer: Buffer;
  orderNo: string;
  toCompany: string;
  bodyText?: string;
}): Promise<void> {
  await transporter.sendMail({
    from: `"스마텍" <${process.env.GMAIL_USER}>`,
    to: opts.to,
    cc: opts.cc?.length ? opts.cc : undefined,
    subject: `[스마텍] 발주서 ${opts.orderNo} 발송드립니다.`,
    text:
      opts.bodyText ??
      `${opts.toCompany} 담당자님, 안녕하세요.\n\n스마텍입니다.\n발주서(${opts.orderNo})를 첨부하여 드립니다.\n납기 확인 후 회신 부탁드립니다.\n\n감사합니다.\n(주)스마텍`,
    attachments: [
      {
        filename: `발주서_${opts.orderNo}.pdf`,
        content: opts.pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}

export async function sendRepairQuote(opts: {
  to: string;
  jobNo: string;
  companyName: string;
  contactName: string | null;
  quotePdfBuffer: Buffer;
  inspectionPdfBuffer: Buffer;
  bodyText?: string;
}): Promise<void> {
  await transporter.sendMail({
    from: `"스마텍" <${process.env.GMAIL_USER}>`,
    to: opts.to,
    subject: `[스마텍] 수리견적서 ${opts.jobNo} 발송드립니다.`,
    text:
      opts.bodyText ??
      `${opts.companyName} ${opts.contactName ?? "담당자"}님, 안녕하세요.\n\n스마텍입니다.\n수리견적서와 검사성적서(${opts.jobNo})를 첨부하여 드립니다.\n검토 후 수리 진행 여부를 회신해 주시면 감사하겠습니다.\n\n감사합니다.\n(주)스마텍 서비스팀\n031-204-7170 · info@smartechvacuum.com`,
    attachments: [
      {
        filename: `수리견적서_${opts.jobNo}.pdf`,
        content: opts.quotePdfBuffer,
        contentType: "application/pdf",
      },
      {
        filename: `검사성적서_${opts.jobNo}.pdf`,
        content: opts.inspectionPdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}
