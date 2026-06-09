import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { formatKRW, getMultiplier } from "@/lib/pricing";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type EmailType =
  | "QUOTE_INQUIRY"       // 견적 문의
  | "ECOUNT_ORDER"        // ECOUNT 발주서
  | "ECOUNT_PRICE_REQUEST" // ECOUNT 단가요청서
  | "OTHER";              // 기타

export interface ClassifyResult {
  emailType: EmailType;
  confidence: number;        // 0~100
  parsedData: Record<string, unknown>;  // 추출된 구조화 데이터
  aiDraft: string;           // AI 초안 답변
}

/**
 * 이메일을 분류하고 AI 초안을 작성한다.
 */
export async function classifyEmail(
  subject: string,
  bodyText: string,
  fromEmail: string,
): Promise<ClassifyResult> {

  // ECOUNT 이메일은 발신자로 즉시 판별
  if (fromEmail === "ecount@ecount.com" || fromEmail.endsWith("@ecount.com")) {
    return classifyEcountEmail(subject, bodyText);
  }

  // 주요 제품 목록 조회 (AI 초안 작성에 활용)
  const products = await prisma.product.findMany({
    where: { isImportant: true },
    select: { partNo: true, description: true, costPrice: true, category: true },
    take: 80,
  });

  const productList = products
    .map((p) => {
      const price = p.costPrice > 0
        ? formatKRW(Math.round(p.costPrice * 1.3 / 1000) * 1000) // 기본 공급가 (약 1.3배)
        : "문의";
      return `[${p.partNo}] ${p.description} — ${price}`;
    })
    .join("\n");

  const prompt = `당신은 한국 진공펌프 전문회사 스마텍의 영업 담당자입니다.
아래 이메일을 분석하고 JSON으로 응답해 주세요.

=== 이메일 정보 ===
발신: ${fromEmail}
제목: ${subject}
본문:
${bodyText.slice(0, 3000)}

=== 취급 제품 목록 (파트번호 | 설명 | 공급가) ===
${productList}

=== 응답 형식 (JSON만 출력, 다른 텍스트 없음) ===
{
  "emailType": "QUOTE_INQUIRY 또는 OTHER",
  "confidence": 0~100,
  "parsedData": {
    "company": "회사명 (없으면 null)",
    "contactName": "담당자명 (없으면 null)",
    "contactPhone": "연락처 (없으면 null)",
    "items": [
      { "partNo": "파트번호 또는 모델명", "description": "제품명", "quantity": 수량, "unitPrice": 단가(없으면 0) }
    ],
    "memo": "기타 요청사항"
  },
  "aiDraft": "고객에게 보낼 답변 이메일 본문 (HTML 없이 텍스트만, 견적서 내용 포함)"
}

aiDraft 작성 지침:
- 인사로 시작 (예: "안녕하세요, 스마텍 이명재입니다.")
- 요청 제품의 파트번호, 단가, 납기를 포함
- 납기는 "표준 8~16주 (재고 보유 모델은 즉시 출고 가능)"로 안내
- 단가를 모르는 제품은 "별도 문의 필요"로 표기
- 마무리 인사 포함 (스마텍 연락처: 031-204-7170)
- 줄바꿈은 \\n 사용`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    return {
      emailType: parsed.emailType ?? "OTHER",
      confidence: parsed.confidence ?? 50,
      parsedData: parsed.parsedData ?? {},
      aiDraft: parsed.aiDraft ?? "",
    };
  } catch {
    return {
      emailType: "OTHER",
      confidence: 30,
      parsedData: {},
      aiDraft: "",
    };
  }
}

/**
 * ECOUNT 이메일 전용 분류 (본문에 품목 없음 — 알림만)
 */
function classifyEcountEmail(subject: string, bodyText: string): ClassifyResult {
  const isOrder = subject.includes("발주서") || bodyText.includes("발주서");
  const isPriceRequest = subject.includes("단가요청") || bodyText.includes("단가요청서");

  // 발신 회사명 추출
  const companyMatch = subject.match(/\[(.+?)\](으)?로부터/);
  const company = companyMatch?.[1] ?? "거래처";

  // 담당자명 추출
  const contactMatch = bodyText.match(/\[(.+?)\]님이.*보낸/);
  const contactName = contactMatch?.[1] ?? null;

  // 이메일 추출
  const emailMatch = bodyText.match(/Email[\s\S]+?([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/);
  const senderEmail = emailMatch?.[1] ?? null;

  // 연락처 추출
  const phoneMatch = bodyText.match(/연락처[\s\S]+?(\d{3,4}-?\d{3,4}-?\d{4}|\d{10,11})/);
  const phone = phoneMatch?.[1] ?? null;

  const emailType: EmailType = isOrder
    ? "ECOUNT_ORDER"
    : isPriceRequest
    ? "ECOUNT_PRICE_REQUEST"
    : "OTHER";

  const draft = isPriceRequest
    ? `안녕하세요, ${company} ${contactName ?? "담당자"}님.\n스마텍 이명재입니다.\n\n단가요청서 잘 받았습니다.\n요청하신 품목의 견적서를 별도로 준비하여 보내드리겠습니다.\n\n문의사항은 031-204-7170으로 연락 주세요.\n감사합니다.`
    : `안녕하세요, ${company} ${contactName ?? "담당자"}님.\n스마텍 이명재입니다.\n\n발주서 잘 받았습니다.\n내용 검토 후 납기 및 진행 사항을 별도로 안내드리겠습니다.\n\n문의사항은 031-204-7170으로 연락 주세요.\n감사합니다.`;

  return {
    emailType,
    confidence: 95,
    parsedData: {
      company,
      contactName,
      contactEmail: senderEmail,
      contactPhone: phone,
      items: [],
      memo: "ECOUNT 수신문서 링크에서 품목 확인 필요",
    },
    aiDraft: draft,
  };
}
