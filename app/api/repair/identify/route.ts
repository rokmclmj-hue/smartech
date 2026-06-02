import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("photos") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "사진이 없습니다." }, { status: 400 });
    }

    // 파일을 base64로 변환
    const imageContents = await Promise.all(
      files.map(async (file) => {
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const mediaType = (
          file.type === "image/png" ? "image/png" :
          file.type === "image/webp" ? "image/webp" :
          file.type === "image/gif" ? "image/gif" :
          "image/jpeg"
        ) as "image/jpeg" | "image/png" | "image/webp" | "image/gif";
        return {
          type: "image" as const,
          source: { type: "base64" as const, media_type: mediaType, data: base64 },
        };
      })
    );

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: [
            ...imageContents,
            {
              type: "text",
              text: `이 이미지들은 진공 펌프 명판(nameplate) 사진입니다.
명판에서 모든 텍스트를 꼼꼼히 읽어 다음 JSON 형식으로만 응답해 주세요 (설명 텍스트 없이 JSON만):

{
  "modelName": "정확한 모델명 (예: XDS35iE, nXDS10i, RV8, E2M40, EH500, iH600 등) 또는 null",
  "partNo": "명판에 표시된 파트번호/제품코드 (예: A65501903, A73701940 등 영문+숫자 조합) 또는 null",
  "pumpFamily": "scroll | rotary_vane | booster | dry | other",
  "maker": "EDWARDS | Leybold | Pfeiffer | 기타브랜드명",
  "confidence": "high | medium | low",
  "serialNo": "시리얼 번호 문자열 또는 null",
  "notes": "분석 근거 또는 불확실한 이유 (한국어, 1-2문장)"
}

파트번호 추출 기준:
- 명판에서 'CODE No.', 'Part No.', 'Model No.' 또는 영문자+숫자 조합(예: A65501903)을 찾아 partNo에 기록
- 시리얼 번호(Serial No.)는 partNo가 아닌 serialNo에 기록
- 파트번호는 보통 알파벳 1~2자 + 숫자 7~9자리 형태

confidence 기준:
- high: 명판 텍스트가 선명하게 보여 모델명 또는 파트번호 확인 가능
- medium: 외관 형태로 계열은 알 수 있지만 정확한 모델번호 불확실
- low: 사진이 흐리거나 명판이 없어 판단 불가

Edwards 진공 펌프 주요 모델 계열: nXDS(scroll), XDS(scroll), RV(rotary vane), E2M(rotary vane), EH(booster), iH(dry), iGX(dry), T-Station(turbo)`,
            },
          ],
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text.trim() : "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({
        confidence: "low",
        modelName: null,
        pumpFamily: "other",
        maker: "EDWARDS",
        serialNo: null,
        notes: "이미지에서 모델 정보를 인식하지 못했습니다.",
      });
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[repair/identify] error:", err);
    return NextResponse.json({
      confidence: "low",
      modelName: null,
      pumpFamily: "other",
      maker: "EDWARDS",
      serialNo: null,
      notes: "처리 중 오류가 발생했습니다.",
    });
  }
}
