import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface CardOcrResult {
  name: string;
  company: string;
  phone: string;
  email: string;
  position: string;
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

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      system: `당신은 명함 OCR 전문 AI입니다.
주어진 명함 이미지에서 다음 정보를 추출하여 반드시 JSON 형식으로만 응답하세요.
한국어 명함과 영어 명함 모두 처리 가능합니다.

추출할 항목:
- name: 이름 (인식 불가 시 빈 문자열)
- company: 회사명 (인식 불가 시 빈 문자열)
- phone: 전화번호 (핸드폰 우선, 인식 불가 시 빈 문자열)
- email: 이메일 주소 (인식 불가 시 빈 문자열)
- position: 직함/직위 (인식 불가 시 빈 문자열)

응답 형식 (JSON만, 다른 텍스트 없음):
{"name":"","company":"","phone":"","email":"","position":""}`,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: "text",
              text: "위 명함에서 정보를 추출하여 JSON으로만 응답해주세요.",
            },
          ],
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json<CardOcrResult>({
        name: "",
        company: "",
        phone: "",
        email: "",
        position: "",
      });
    }

    // JSON 파싱 시도
    const text = content.text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json<CardOcrResult>({
        name: "",
        company: "",
        phone: "",
        email: "",
        position: "",
      });
    }

    const parsed = JSON.parse(jsonMatch[0]) as Partial<CardOcrResult>;
    const result: CardOcrResult = {
      name: parsed.name ?? "",
      company: parsed.company ?? "",
      phone: parsed.phone ?? "",
      email: parsed.email ?? "",
      position: parsed.position ?? "",
    };

    return NextResponse.json(result);
  } catch {
    // 인식 실패 시 빈 값 반환 (에러 아님)
    return NextResponse.json<CardOcrResult>({
      name: "",
      company: "",
      phone: "",
      email: "",
      position: "",
    });
  }
}
