import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  // Load featured products as context
  const products = await prisma.product.findMany({
    where: { isImportant: true },
    select: { partNo: true, description: true, category: true },
    take: 100,
  });

  const productContext = products
    .map((p) => `[${p.partNo}] ${p.description} (카테고리: ${p.category})`)
    .join("\n");

  const systemPrompt = `당신은 스마텍(Smartech)의 진공펌프 전문 상담 AI입니다.
Edwards Vacuum의 한국 대리점으로서 다양한 진공펌프, 터보펌프, 게이지, 컨트롤러를 취급합니다.

취급 제품 목록 (일부):
${productContext}

고객의 용도, 진공 범위, 처리 가스 등을 파악하여 최적의 제품을 추천하세요.
제품 추천 시 파트 번호(Part No)를 함께 안내하세요.
가격은 "견적 문의를 통해 안내 드리겠습니다"라고 답하세요.
항상 친절하고 전문적으로 한국어로 답변하세요.`;

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
