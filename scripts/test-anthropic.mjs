import Anthropic from "@anthropic-ai/sdk";

const key = process.env.ANTHROPIC_API_KEY;
console.log("─────────────────────────────────────");
console.log("ANTHROPIC_API_KEY 존재 여부:", key ? "있음" : "없음");
console.log("키 길이:", key ? key.length : 0);
console.log("키 앞 10글자:", key ? key.slice(0, 10) : "(없음)");
console.log("─────────────────────────────────────");

if (!key) {
  console.error("❌ 키가 환경변수에 안 들어왔습니다.");
  process.exit(1);
}

const client = new Anthropic({ apiKey: key });

try {
  console.log("Anthropic API 호출 중...");
  const r = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 30,
    messages: [{ role: "user", content: "한 단어로 인사해줘" }],
  });
  console.log("✅ 성공! 응답:", r.content[0].text);
  console.log("입력 토큰:", r.usage.input_tokens, "/ 출력 토큰:", r.usage.output_tokens);
} catch (e) {
  console.error("❌ API 호출 실패");
  console.error("에러 종류:", e.constructor.name);
  console.error("상태 코드:", e.status);
  console.error("메시지:", e.message);
  if (e.error) console.error("상세:", JSON.stringify(e.error, null, 2));
  process.exit(1);
}
