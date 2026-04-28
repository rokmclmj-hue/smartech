import { handlers } from "@/lib/auth";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const res = await handlers.GET(req);
  if (req.nextUrl.pathname === "/api/auth/session") {
    const text = await res.text();
    if (!text || !text.trim()) {
      return new Response("{}", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(text, {
      status: res.status,
      headers: res.headers,
    });
  }
  return res;
}

export const POST = handlers.POST;
