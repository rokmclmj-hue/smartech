/**
 * 알림 발송 유틸리티 — Solapi SMS fallback + Gmail email
 * 카카오 알림톡은 템플릿 승인 후 KAKAO_ALIMTALK_TEMPLATE_ID 환경변수로 활성화
 */

async function sendSms(to: string, text: string): Promise<void> {
  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;
  const sender = process.env.SOLAPI_SENDER ?? process.env.ADMIN_PHONE;
  if (!apiKey || !apiSecret || !sender) {
    console.log(`[notifier] SMS 미설정 — to:${to} text:${text}`);
    return;
  }
  const { SolapiMessageService } = await import("solapi");
  const service = new SolapiMessageService(apiKey, apiSecret);
  await service.send({ to, from: sender, text } as any);
}

/** 신규 가입자 PENDING 발생 시 관리자에게 SMS 알림 */
export async function notifyAdminNewPending(userName: string, company: string): Promise<void> {
  const adminPhone = process.env.ADMIN_PHONE;
  if (!adminPhone) return;
  await sendSms(
    adminPhone,
    `[스마텍] 신규 가입 승인 요청\n고객: ${userName} (${company || "미입력"})\n관리자 페이지에서 확인해주세요.`
  );
}

/** 관리자가 고객 등급 승인 시 고객에게 SMS + 이메일 알림 */
export async function notifyUserApproved(
  phone: string | null | undefined,
  email: string | null | undefined,
  customerName: string
): Promise<void> {
  const message = `[스마텍] 안녕하세요, ${customerName}님.\n스마텍 계정이 승인되어 전용 가격으로 이용하실 수 있습니다.\nhttps://smartech-opal.vercel.app/auth/login`;

  const tasks: Promise<void>[] = [];

  if (phone) {
    tasks.push(sendSms(phone, message).catch((e) => console.error("[notifier] SMS 실패:", e)));
  }

  if (email) {
    const { sendApprovalNotice } = await import("./mailer");
    tasks.push(
      sendApprovalNotice(email, customerName, "").catch((e) =>
        console.error("[notifier] 이메일 실패:", e)
      )
    );
  }

  await Promise.allSettled(tasks);
}
