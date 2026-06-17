// 국세청 사업자등록 상태조회 API 연동

export type BizStatus = "active" | "closed" | "suspended" | "invalid";

export interface BizVerifyResult {
  status: BizStatus;
  companyName?: string; // 국세청에서 반환하는 상호명 (있을 경우)
  message: string;
}

export async function verifyBusinessNo(rawNo: string): Promise<BizVerifyResult> {
  const digits = rawNo.replace(/[^0-9]/g, "");
  if (digits.length !== 10) {
    return { status: "invalid", message: "사업자등록번호는 10자리 숫자여야 합니다." };
  }

  const apiKey = process.env.BIZ_API_KEY;
  if (!apiKey) {
    console.error("[verify-biz] BIZ_API_KEY 환경변수 없음");
    return { status: "invalid", message: "서버 설정 오류입니다. 관리자에게 문의하세요." };
  }

  try {
    const res = await fetch(
      `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${encodeURIComponent(apiKey)}&returnType=JSON`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ b_no: [digits] }),
      }
    );

    if (!res.ok) {
      console.error("[verify-biz] API 응답 오류:", res.status);
      return { status: "invalid", message: "사업자 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." };
    }

    const data = await res.json();
    const item = data?.data?.[0];

    if (!item) {
      return { status: "invalid", message: "사업자 정보를 찾을 수 없습니다." };
    }

    // b_stt_cd: 01=계속사업자, 02=휴업자, 03=폐업자
    const cd = item.b_stt_cd;
    if (cd === "01") {
      return { status: "active", companyName: item.tax_type, message: "정상 사업자입니다." };
    } else if (cd === "02") {
      return { status: "suspended", message: "휴업 중인 사업자입니다." };
    } else if (cd === "03") {
      return { status: "closed", message: "폐업된 사업자번호입니다." };
    } else {
      return { status: "invalid", message: "확인되지 않는 사업자번호입니다." };
    }
  } catch (err) {
    console.error("[verify-biz] fetch 오류:", err);
    return { status: "invalid", message: "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." };
  }
}
