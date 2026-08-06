// 국세청 사업자등록 상태조회 API 연동

export type BizStatus = "active" | "closed" | "suspended" | "invalid";

export interface BizVerifyResult {
  status: BizStatus;
  companyName?: string;
  message: string;
}

// 사업자등록번호 체크섬 검증 (국세청 알고리즘)
export function isValidBizNoChecksum(digits: string): boolean {
  if (digits.length !== 10) return false;
  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * weights[i];
  }
  sum += Math.floor((parseInt(digits[8]) * 5) / 10);
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(digits[9]);
}

export async function verifyBusinessNo(rawNo: string): Promise<BizVerifyResult> {
  const digits = rawNo.replace(/[^0-9]/g, "");
  if (digits.length !== 10) {
    return { status: "invalid", message: "사업자등록번호는 10자리 숫자여야 합니다." };
  }

  // 체크섬 검증 — 형식 자체가 잘못된 번호는 즉시 거부
  if (!isValidBizNoChecksum(digits)) {
    return { status: "invalid", message: "유효하지 않은 사업자등록번호 형식입니다." };
  }

  const apiKey = process.env.DATA_GO_KR_BIZ_KEY;

  // API 키가 없거나 승인 안 된 경우 → 체크섬 통과 시 active로 허용 (임시)
  if (!apiKey) {
    console.warn("[verify-biz] DATA_GO_KR_BIZ_KEY 없음 — 체크섬 검증만 사용");
    return { status: "active", message: "정상 사업자번호 형식입니다." };
  }

  try {
    const res = await fetch(
      `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${encodeURIComponent(apiKey)}&returnType=JSON`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ b_no: [digits] }),
      }
    );

    // API 키 미승인 등 오류 시 → 체크섬 통과로 fallback
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn("[verify-biz] API 오류 (fallback to checksum):", res.status, errText);
      return { status: "active", message: "정상 사업자번호 형식입니다." };
    }

    const data = await res.json();
    const item = data?.data?.[0];

    if (!item) {
      return { status: "active", message: "정상 사업자번호 형식입니다." };
    }

    // b_stt_cd: 01=계속사업자, 02=휴업자, 03=폐업자
    const cd = item.b_stt_cd;
    if (cd === "01") {
      return { status: "active", message: "정상 사업자입니다." };
    } else if (cd === "02") {
      return { status: "suspended", message: "휴업 중인 사업자입니다." };
    } else if (cd === "03") {
      return { status: "closed", message: "폐업된 사업자번호입니다." };
    } else {
      return { status: "active", message: "정상 사업자번호 형식입니다." };
    }
  } catch (err) {
    console.error("[verify-biz] fetch 오류 (fallback to checksum):", err);
    // 네트워크 오류 시에도 체크섬 통과면 진행 허용
    return { status: "active", message: "정상 사업자번호 형식입니다." };
  }
}
