import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type EstimatedType = "OEM" | "DEALER" | "ENDUSER" | "";

export interface CardOcrResult {
  name: string;
  company: string;
  phone: string;
  email: string;
  position: string;
  homepage: string;
  estimatedType: EstimatedType;
  confidence: number;
  typeReason: string;
  estimatedSize: string;
  estimatedIndustry: string;
}

// 이 임계값 미만이면 estimatedType을 빈 값으로 처리하고 관리자에게 표시 안 함
const CONFIDENCE_THRESHOLD = 70;

const EMPTY: CardOcrResult = {
  name: "",
  company: "",
  phone: "",
  email: "",
  position: "",
  homepage: "",
  estimatedType: "",
  confidence: 0,
  typeReason: "",
  estimatedSize: "",
  estimatedIndustry: "",
};

const SYSTEM_PROMPT = `당신은 한국 명함 OCR 전문 AI입니다. 명함 이미지에서 정보를 정확히 추출해 submit_card_info 도구로만 응답하세요.

[이미지 회전 처리]
- 명함은 세로/가로/뒤집힌 상태(0°, 90°, 180°, 270°) 어느 방향이든 가능
- 텍스트 방향을 자동으로 인식하여 가장 자연스럽게 읽히는 글자를 채택
- 회전된 사진이라고 해서 인식률이 떨어져선 안 됨

[★★★ 이름 추출 절대 규칙 — 환각(hallucination) 방지 — 가장 중요]
이름은 가장 흔한 오류 원천입니다. 다음을 반드시 지키세요:
- 이름은 명함 이미지에 **글자로 직접 보이는 것만** 추출. 화소가 명확히 사람 이름임을 읽을 수 있을 때만 채울 것.
- **이메일 앞부분(local part)에서 이름을 만들어내지 말 것** (예: chulsoo.kim@example.com 으로부터 "김철수" 또는 "Chulsoo Kim" 추출 절대 금지)
- **회사명·로고·도메인·이미지 분위기로 이름을 추측하지 말 것**
- 일반적인 한국 이름(김철수·홍길동·이영희·박민수 등)을 임의로 채우지 말 것
- 이름 글자가 흐림·잘림·가려짐이 있다면 → name: "" (빈 문자열). 빈 값이 잘못된 이름보다 100배 낫다.
- 한글·영문 이름이 둘 다 보이면 한글 우선. 둘 다 잘 안 보이면 ""
- 이름 자리에 직책/회사명만 있고 사람 이름이 없는 명함도 있음 → 그런 경우 ""
- 인쇄 안 된 빈 명함, 디자인만 있는 명함, 사람 이름이 없는 안내 카드 → name: ""

[한국 명함 특성 — 반드시 적용]
- 회사명: "(주)", "㈜", "주식회사" 같은 표기는 그대로 보존
- 한국식 직책 사전: 회장/부회장/대표이사/사장/부사장/전무/상무/이사/실장/팀장/본부장/소장/원장/부장/차장/과장/대리/주임/사원/연구원/책임/수석/선임/주임연구원
- 영문 직책: CEO/COO/CTO/CFO/Director/General Manager/Manager/Senior Engineer/Researcher 등 그대로 사용
- 한글·영문 혼용 명함이면 한글 우선 (한글이 없으면 영문)
- 이름과 직책이 같은 줄/인접 위치에 있어도 반드시 분리 (예: "홍길동 부장" → name:"홍길동", position:"부장")
- 직책은 보통 이름보다 글자 크기가 작거나 위/아래 별도 줄에 위치

[전화번호 우선순위]
1순위: 핸드폰 (M / Mobile / HP / 휴대폰 / 010-xxxx-xxxx)
2순위: 직통 (D / Direct / 사무실 직통)
3순위: 대표 전화 (T / Tel)
- 여러 번호가 있어도 1개만 추출. 핸드폰 우선
- 형식 예: "010-1234-5678" (하이픈 포함)

[이메일]
- @ 기호가 포함된 텍스트만 채택
- 소문자 권장
- 불확실하면 빈 문자열

[추출 항목]
- name: 위 [★★★ 이름 추출 절대 규칙] 적용. 보이지 않으면 ""
- company: 회사명 ((주) 등 표기 보존)
- phone: 핸드폰 우선, 한국 표준 하이픈 형식
- email: 이메일 주소
- position: 직책/직함 (이름과 분리)
- homepage: 홈페이지 URL (있으면, 없으면 빈 문자열). "www." 또는 "http(s)://" 시작 텍스트.

[고객 유형 추정 — 진공펌프 회사(스마텍) 기준]
다음 단서로 판단. 자신 없으면 반드시 빈 문자열 "".
* OEM: 자기 제품에 진공펌프를 부품으로 넣는 제조사
  단서: 회사명에 "전자/반도체/디스플레이/장비/시스템/Semiconductor",
        부서가 "구매팀·자재팀·조달팀·Purchasing·SCM",
        대기업 자체도메인(@samsung·@skhynix·@lge 등)
* DEALER: 진공장비를 재판매하는 유통/딜러
  단서: 회사명에 "상사·엔지니어링·테크·트레이딩·코퍼레이션·Engineering·Trading",
        부서가 "영업팀·기술영업·Sales", 대표/이사/영업팀장 직함
* ENDUSER: 진공펌프를 직접 사용하는 연구소·대학·병원
  단서: 회사명에 "연구소·대학교·병원·센터·Lab·Research·Hospital",
        도메인이 .ac.kr / .re.kr / .go.kr,
        직함이 "연구원·박사·교수·대학원생·Researcher·Professor"

[규모/업종 추정 — 자신 없으면 반드시 빈 문자열]
- estimatedSize: "대기업"/"중견기업"/"중소기업"/"소기업" 중 하나, 모르면 ""
- estimatedIndustry: 업종(예: "반도체 장비 제조", "분석연구", "의료기기"), 모르면 ""
- typeReason: 추정 근거 한 줄 (예: "회사명에 '엔지니어링' 포함")

[★ 확신 점수 (confidence) — 0~100 정수]
estimatedType 추정에 대한 자체 확신도를 정수로 평가:
- 90~100: 결정적 단서 2개 이상 (예: 도메인 + 직책 + 회사명 모두 일치)
- 70~89: 결정적 단서 1개 (예: @samsung.com 도메인만 일치)
- 50~69: 약한 단서 하나만 (예: 회사명 일부만 추측 가능)
- 1~49: 거의 추측 → estimatedType은 빈 문자열 ""로 두세요
- 0: estimatedType이 빈 문자열일 때
※ 후처리 코드가 70 미만은 빈 값으로 만들 수 있으므로, 솔직하게 평가하세요.

[인식 불가 시]
해당 필드만 빈 문자열 ""로 둘 것. 절대 추측하거나 임의로 채우지 말 것. 잘못된 정보보다 빈 값이 낫다.
특히 추정 항목(estimatedType/Size/Industry)은 확신이 없으면 무조건 빈 문자열.
**이름은 더더욱 추측 절대 금지** — 빈 문자열이 항상 정답.`;

const USER_TEXT =
  "위 명함을 정확히 인식해서 submit_card_info 도구로 제출하세요. 이미지가 회전되어 있더라도 텍스트 방향을 자동 판단하세요. 이름과 직책은 반드시 분리하세요. 명함에 사람 이름이 글자로 명확히 보이지 않으면 절대 추측하지 말고 name을 빈 문자열로 두세요. 이메일에서 이름을 만들어내는 것은 가장 흔한 오류이며 절대 금지입니다.";

function normalizePhone(s: string): string {
  if (!s) return "";
  const digits = s.replace(/[^\d]/g, "");
  if (/^01[016-9]\d{7,8}$/.test(digits)) {
    return digits.length === 11
      ? digits.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3")
      : digits.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  }
  if (/^02\d{7,8}$/.test(digits)) {
    return digits.length === 10
      ? digits.replace(/(\d{2})(\d{4})(\d{4})/, "$1-$2-$3")
      : digits.replace(/(\d{2})(\d{3})(\d{4})/, "$1-$2-$3");
  }
  if (/^0\d{8,10}$/.test(digits)) {
    if (digits.length === 10) return digits.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    if (digits.length === 11) return digits.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  }
  return s.trim();
}

function normalizeEmail(s: string): string {
  return (s || "").trim().toLowerCase().replace(/\s+/g, "");
}

// 이름 환각 후처리: 영문 이름이 이메일 local part와 동일하면 빈 값 처리
// (한글 이름은 프롬프트로만 통제 — 한글-영문 음역 비교는 위양성 위험)
function sanitizeName(name: string, email: string): string {
  const n = (name || "").trim();
  if (!n) return "";
  if (!email) return n;
  // 한글이 포함된 이름은 그대로 둠
  if (/[가-힣]/.test(n)) return n;
  const local = email.split("@")[0]?.toLowerCase() ?? "";
  if (!local) return n;
  const stripped = n.replace(/[\s.\-_]/g, "").toLowerCase();
  if (stripped === local.replace(/[\s.\-_]/g, "")) return "";
  return n;
}

async function callModel(
  model: string,
  base64: string,
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp"
): Promise<CardOcrResult> {
  const message = await client.messages.create({
    model,
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    tools: [
      {
        name: "submit_card_info",
        description: "명함 이미지에서 추출한 정보를 제출합니다.",
        input_schema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description:
                "명함에 사람 이름이 글자로 명확히 보일 때만. 이메일·회사명·도메인에서 추출 금지. 안 보이면 빈 문자열.",
            },
            company: { type: "string", description: "회사명 ((주) 등 표기 보존)" },
            phone: { type: "string", description: "핸드폰 우선, 010-1234-5678 형식" },
            email: { type: "string", description: "이메일 주소 (@ 포함, 소문자 권장)" },
            position: { type: "string", description: "직책/직함 (이름과 반드시 분리)" },
            homepage: { type: "string", description: "홈페이지 URL (없으면 빈 문자열)" },
            estimatedType: {
              type: "string",
              enum: ["OEM", "DEALER", "ENDUSER", ""],
              description: "고객 유형 추정. 자신 없으면 빈 문자열.",
            },
            confidence: {
              type: "integer",
              minimum: 0,
              maximum: 100,
              description: "estimatedType에 대한 자체 확신도(0~100). 시스템 프롬프트의 [확신 점수] 기준 적용.",
            },
            typeReason: { type: "string", description: "추정 근거 한 줄. 추정 안 했으면 빈 문자열." },
            estimatedSize: { type: "string", description: "회사 규모 추정. 모르면 빈 문자열." },
            estimatedIndustry: { type: "string", description: "업종 추정. 모르면 빈 문자열." },
          },
          required: [
            "name",
            "company",
            "phone",
            "email",
            "position",
            "homepage",
            "estimatedType",
            "confidence",
            "typeReason",
            "estimatedSize",
            "estimatedIndustry",
          ],
        },
      },
    ],
    tool_choice: { type: "tool", name: "submit_card_info" },
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
          { type: "text", text: USER_TEXT },
        ],
      },
    ],
  });

  const toolUseBlock = message.content.find((b) => b.type === "tool_use");
  if (!toolUseBlock || toolUseBlock.type !== "tool_use") return EMPTY;

  const parsed = toolUseBlock.input as Partial<CardOcrResult>;
  const rawType = (parsed.estimatedType ?? "").toString();
  let validType: EstimatedType =
    rawType === "OEM" || rawType === "DEALER" || rawType === "ENDUSER" ? rawType : "";

  // 확신 점수 정규화 (0~100 정수). 잘못된 값은 0으로.
  const rawConfidence = Number(parsed.confidence);
  let confidence = Number.isFinite(rawConfidence)
    ? Math.max(0, Math.min(100, Math.round(rawConfidence)))
    : 0;

  // 임계값 미만이면 추정 결과를 비움 (관리자에게 표시 안 함)
  if (validType && confidence < CONFIDENCE_THRESHOLD) {
    validType = "";
  }
  // 추정 비었으면 confidence도 0
  if (!validType) {
    confidence = 0;
  }

  const email = normalizeEmail(parsed.email ?? "");
  const name = sanitizeName((parsed.name ?? "").trim(), email);

  return {
    name,
    company: (parsed.company ?? "").trim(),
    phone: normalizePhone(parsed.phone ?? ""),
    email,
    position: (parsed.position ?? "").trim(),
    homepage: (parsed.homepage ?? "").trim(),
    estimatedType: validType,
    confidence,
    typeReason: validType ? (parsed.typeReason ?? "").trim() : "",
    estimatedSize: (parsed.estimatedSize ?? "").trim(),
    estimatedIndustry: (parsed.estimatedIndustry ?? "").trim(),
  };
}

// ★ 이름 환각 2차 검증: 같은 이미지로 별도 호출하여 후보 이름이 실제로 인쇄되어 있는지 Yes/No 확인
async function verifyName(
  candidateName: string,
  base64: string,
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp"
): Promise<boolean> {
  if (!candidateName) return true;
  try {
    const v = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 10,
      system:
        "당신은 명함 이미지 검증자입니다. 주어진 이름이 명함에 사람 이름으로 직접 인쇄되어 있는지 확인하고 Yes 또는 No로만 답하세요. 다른 텍스트 절대 금지.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            {
              type: "text",
              text: `이 명함에 "${candidateName}" 이라는 사람 이름이 글자로 직접 인쇄되어 있습니까? 이메일·도메인·회사명·로고에서 추정한 것은 No. 명함의 이름 자리에 그 글자가 명확히 보일 때만 Yes. 단어 하나(Yes/No)로만 답하세요.`,
            },
          ],
        },
      ],
    });

    const block = v.content[0];
    if (!block || block.type !== "text") return false;
    return block.text.trim().toLowerCase().startsWith("yes");
  } catch {
    // 검증 호출 자체가 실패하면 보수적으로 거부 (false) — 환각보다 빈 값이 낫다
    return false;
  }
}

// 핵심 5필드(name/company/phone/email/position) 중 비어있는 개수
function countCoreEmpty(r: CardOcrResult): number {
  return [r.name, r.company, r.phone, r.email, r.position].filter((v) => !v).length;
}

// primary 우선, 빈 곳만 secondary로 보충
function mergeResults(primary: CardOcrResult, secondary: CardOcrResult): CardOcrResult {
  const estimatedType = primary.estimatedType || secondary.estimatedType;
  // estimatedType을 채택한 쪽의 confidence·typeReason을 함께 가져감
  const sourceForType = primary.estimatedType ? primary : secondary;
  return {
    name: primary.name || secondary.name,
    company: primary.company || secondary.company,
    phone: primary.phone || secondary.phone,
    email: primary.email || secondary.email,
    position: primary.position || secondary.position,
    homepage: primary.homepage || secondary.homepage,
    estimatedType,
    confidence: estimatedType ? sourceForType.confidence : 0,
    typeReason: estimatedType ? sourceForType.typeReason : "",
    estimatedSize: primary.estimatedSize || secondary.estimatedSize,
    estimatedIndustry: primary.estimatedIndustry || secondary.estimatedIndustry,
  };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File | null;

    if (!image) {
      return NextResponse.json({ error: "이미지 파일이 없습니다" }, { status: 400 });
    }

    const arrayBuffer = await image.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mediaType = (image.type || "image/jpeg") as
      | "image/jpeg"
      | "image/png"
      | "image/gif"
      | "image/webp";

    // 1차: Sonnet (대부분의 명함은 여기서 충분)
    const sonnetResult = await callModel("claude-sonnet-4-6", base64, mediaType);

    // ★ 이름 환각 2차 검증
    if (sonnetResult.name) {
      const ok = await verifyName(sonnetResult.name, base64, mediaType);
      if (!ok) sonnetResult.name = "";
    }

    // 핵심 5필드 중 3개 이상 비어있으면 어려운 명함 → Opus 4.7 Fallback
    if (countCoreEmpty(sonnetResult) < 3) {
      return NextResponse.json(sonnetResult);
    }

    try {
      const opusResult = await callModel("claude-opus-4-8", base64, mediaType);
      // Opus 결과도 동일하게 이름 2차 검증
      if (opusResult.name) {
        const ok = await verifyName(opusResult.name, base64, mediaType);
        if (!ok) opusResult.name = "";
      }
      // Opus 결과 우선, 빈 곳만 Sonnet으로 보충
      const merged = mergeResults(opusResult, sonnetResult);
      return NextResponse.json(merged);
    } catch {
      return NextResponse.json(sonnetResult);
    }
  } catch {
    return NextResponse.json<CardOcrResult>(EMPTY);
  }
}
