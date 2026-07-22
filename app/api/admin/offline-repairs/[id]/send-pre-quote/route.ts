import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { formatSalutation } from "@/lib/salutation";
import nodemailer from "nodemailer";

type Params = { params: Promise<{ id: string }> };

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(req: NextRequest, { params }: Params) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const job = await prisma.offlineRepairJob.findUnique({
    where: { id: Number(id) },
    include: { company: { select: { companyName: true } } },
  });
  if (!job) return NextResponse.json({ error: "찾을 수 없음" }, { status: 404 });

  const toEmail: string | null = (body.email as string | undefined) || job.contactEmail;
  if (!toEmail) return NextResponse.json({ error: "수신 이메일이 없습니다." }, { status: 400 });

  const estimatedCost: number | null = body.estimatedCost ? Number(body.estimatedCost) : null;
  const note: string = body.note ?? "";
  const companyName = job.company?.companyName ?? "고객사";
  const contact = formatSalutation(job.contactName);

  const costLine = estimatedCost != null
    ? `예상 수리 비용: ${estimatedCost.toLocaleString("ko-KR")}원 (부가세 별도)`
    : "예상 수리 비용: 추후 정밀 점검 후 안내 드리겠습니다.";

  const bodyText = [
    `[스마텍 수리 사전 견적 안내]`,
    ``,
    `${companyName} ${contact}, 안녕하십니까.`,
    `스마텍에서 접수하신 장비의 사전 견적을 안내해 드립니다.`,
    ``,
    `■ 접수 정보`,
    `  접수번호: ${job.jobNo}`,
    `  장비: ${job.pumpMaker} ${job.pumpModel}${job.serialNo ? ` (S/N ${job.serialNo})` : ""}`,
    `  접수일: ${new Date(job.receivedDate).toLocaleDateString("ko-KR")}`,
    ``,
    `■ 사전 견적`,
    `  ${costLine}`,
    ...(note ? [``, `■ 안내 사항`, `  ${note.replace(/\n/g, "\n  ")}`] : []),
    ``,
    `※ 본 견적은 사전 예상 금액이며, 정밀 점검 후 최종 견적서를 별도 발송해 드립니다.`,
    `※ 문의사항은 아래 연락처로 연락 주십시오.`,
    ``,
    `스마텍 | 031-204-7170 | info@smartechvacuum.com`,
  ].join("\n");

  await transporter.sendMail({
    from: `"스마텍" <info@smartechvacuum.com>`,
    to: toEmail,
    subject: `[스마텍] ${job.pumpMaker} ${job.pumpModel} 수리 사전 견적 안내 (${job.jobNo})`,
    text: bodyText,
  });

  return NextResponse.json({ ok: true });
}
