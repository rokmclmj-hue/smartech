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
  quoteNo: string
): Promise<void> {
  await transporter.sendMail({
    from: `"스마텍" <${process.env.GMAIL_USER}>`,
    to,
    subject: `[스마텍] 견적서 #${quoteNo} 입니다.`,
    text: `안녕하세요, 스마텍입니다.\n\n요청하신 견적서(#${quoteNo})를 첨부하여 드립니다.\n궁금한 사항이 있으시면 언제든 연락 주세요.\n\n감사합니다.`,
    attachments: [
      {
        filename: `견적서_${quoteNo}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
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
