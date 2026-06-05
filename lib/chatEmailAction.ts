"use server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendChatEmail({
  to,
  company,
  chatText,
}: {
  to: string;
  company: string;
  chatText: string;
}) {
  const now = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });

  await transporter.sendMail({
    from: `"스마텍" <${process.env.GMAIL_USER}>`,
    to,
    bcc: process.env.GMAIL_USER, // 스마텍 내부 수신
    subject: `[스마텍] AI 상담 내용 — ${company}`,
    html: `
<div style="font-family:'Malgun Gothic','Apple SD Gothic Neo',Arial,sans-serif;color:#222;font-size:14px;line-height:1.7;max-width:600px">
  <div style="font-size:20px;font-weight:700;letter-spacing:-0.03em;margin-bottom:2px">
    Smartech<span style="color:#c00020;">.</span>
  </div>
  <div style="font-size:11px;color:#9ca3af;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:24px">
    Edwards Vacuum · Korea Official
  </div>

  <p>${company} 담당자님, 안녕하세요. <strong>(주)스마텍</strong>입니다.</p>
  <p>AI 상담원과 나누신 상담 내용을 아래와 같이 정리해 드립니다.</p>
  <p style="font-size:12px;color:#9ca3af">상담 일시: ${now}</p>

  <div style="background:#f8f6f2;border-left:3px solid #c00020;padding:16px 20px;margin:20px 0;white-space:pre-wrap;font-size:13px;line-height:1.8">
${chatText}
  </div>

  <p style="color:#555;font-size:13px">
    추가 문의 또는 공식 견적이 필요하신 경우 아래로 연락 주세요.<br>
    담당 영업팀이 신속히 회신드리겠습니다.
  </p>
  <p style="margin-top:20px;font-size:13px">
    감사합니다.<br>
    <strong>(주)스마텍 영업팀</strong><br>
    <span style="font-size:12px;color:#888">031-204-7170 · info@smartechvacuum.com</span>
  </p>
</div>`,
    text: `[스마텍 AI 상담 내용]\n상담 일시: ${now}\n업체: ${company}\n\n${chatText}\n\n---\n(주)스마텍 031-204-7170`,
  });
}
