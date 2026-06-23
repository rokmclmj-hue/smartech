import { SolapiMessageService } from "solapi";

function getService(): SolapiMessageService {
  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error("SOLAPI_API_KEY 또는 SOLAPI_API_SECRET 환경변수가 없습니다.");
  }
  return new SolapiMessageService(apiKey, apiSecret);
}

function getAdminPhone(): string {
  const phone = process.env.ADMIN_PHONE;
  if (!phone) {
    throw new Error("ADMIN_PHONE 환경변수가 없습니다.");
  }
  return phone;
}

/**
 * 새 견적 생성 시 관리자에게 SMS 알림을 발송합니다.
 */
export async function notifyNewQuote(
  quoteId: number,
  customerName: string,
  totalAmount: number,
  orderRequested = false
): Promise<void> {
  const service = getService();
  const adminPhone = getAdminPhone();
  const prefix = orderRequested ? "[스마텍] 🔴 발주 요청" : "[스마텍] 새 견적";
  await service.send({
    to: adminPhone,
    from: adminPhone,
    text: `${prefix} #${quoteId}\n고객: ${customerName}\n금액: ${totalAmount.toLocaleString("ko-KR")}원${orderRequested ? "\n▶ 발주서 진행 요청 포함" : ""}`,
  });
}

/**
 * 주문 확정 시 관리자에게 SMS 알림을 발송합니다.
 */
export async function notifyOrderConfirmed(
  orderId: number,
  customerName: string
): Promise<void> {
  const service = getService();
  const adminPhone = getAdminPhone();
  await service.send({
    to: adminPhone,
    from: adminPhone,
    text: `[스마텍] 주문 확정 #${orderId}\n고객: ${customerName}\n주문이 확정되었습니다.`,
  });
}

/**
 * 대량 주문 발생 시 관리자에게 3회 연속 SMS 알림을 발송합니다.
 * 0ms, 1000ms, 2000ms 간격으로 발송합니다.
 */
export async function notifyBulkOrder(
  quoteId: number,
  customerName: string,
  qty: number,
  totalAmount: number
): Promise<void> {
  const service = getService();
  const adminPhone = getAdminPhone();
  const message = `[스마텍] 대량주문 견적 #${quoteId}\n고객: ${customerName}\n수량: ${qty}개\n금액: ${totalAmount.toLocaleString("ko-KR")}원`;

  const send = () =>
    service.send({
      to: adminPhone,
      from: adminPhone,
      text: message,
    });

  // 0ms
  await send();
  // 1000ms
  await new Promise<void>((resolve) =>
    setTimeout(() => { send().finally(resolve); }, 1000)
  );
  // 2000ms
  await new Promise<void>((resolve) =>
    setTimeout(() => { send().finally(resolve); }, 2000)
  );
}

/**
 * 신규 회원 가입 시 관리자에게 SMS 알림을 발송합니다.
 */
export async function notifyNewMember(
  userName: string,
  company: string,
  tier: string
): Promise<void> {
  const service = getService();
  const adminPhone = getAdminPhone();
  await service.send({
    to: adminPhone,
    from: adminPhone,
    text: `[스마텍] 신규 회원 가입\n이름: ${userName}\n회사: ${company}\n등급: ${tier}`,
  });
}

/**
 * 딜러/OEM 고객 로그인 시 관리자에게 SMS 알림.
 */
export async function notifyDealerLogin(
  company: string,
  name: string,
  tier: string
): Promise<void> {
  const service = getService();
  const adminPhone = getAdminPhone();
  const tierLabel: Record<string, string> = {
    DEALER: "딜러", KEY_DEALER: "키딜러", VIP_DEALER: "VIP딜러", OEM: "OEM",
  };
  await service.send({
    to: adminPhone,
    from: adminPhone,
    text: `[스마텍] ${tierLabel[tier] ?? tier} 로그인\n${company} ${name}\n지금 홈페이지 방문 중입니다.`,
  });
}

/**
 * 새 수리 접수 시 관리자에게 SMS 알림.
 */
export async function notifyNewRepair(
  repairNo: string,
  pumpModel: string,
  contactName: string,
  company: string | null | undefined,
  totalAmount: number
): Promise<void> {
  const service = getService();
  const adminPhone = getAdminPhone();
  const amtText = totalAmount > 0
    ? `${totalAmount.toLocaleString("ko-KR")}원`
    : "상담 필요";
  await service.send({
    to: adminPhone,
    from: adminPhone,
    text: `[스마텍] 수리 접수 ${repairNo}\n모델: ${pumpModel}\n접수자: ${contactName}${company ? ` (${company})` : ""}\n기본 견적: ${amtText}`,
  });
}

/**
 * 외주업체가 파일 업로드 완료 시 관리자에게 SMS 알림.
 */
export async function notifyPartnerUpload(
  repairNo: string,
  fileCount: number
): Promise<void> {
  const service = getService();
  const adminPhone = getAdminPhone();
  await service.send({
    to: adminPhone,
    from: adminPhone,
    text: `[스마텍] 외주 업로드 완료\n접수번호: ${repairNo}\n파일 ${fileCount}개 업로드됨\n검토 후 최종 견적을 확정해 주세요.`,
  });
}

/**
 * 수리 상태 변경 시 고객에게 SMS 알림.
 */
export async function notifyRepairStatus(
  customerPhone: string,
  repairNo: string,
  status: string
): Promise<void> {
  const statusLabel: Record<string, string> = {
    IN_PROGRESS: "수리가 시작되었습니다",
    DELIVERED: "납품이 완료되었습니다. 감사합니다",
  };
  const msg = statusLabel[status];
  if (!msg) return;

  const service = getService();
  const adminPhone = getAdminPhone();
  await service.send({
    to: customerPhone,
    from: adminPhone,
    text: `[스마텍] 수리 현황 안내\n접수번호: ${repairNo}\n${msg}`,
  });
}
