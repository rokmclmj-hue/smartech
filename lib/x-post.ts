import crypto from "crypto";

// RFC 3986 percent-encoding — encodeURIComponent이 인코딩하지 않는 !*'() 까지 인코딩해야 X(트위터) OAuth 서명이 일치함
function percentEncode(str: string): string {
  return encodeURIComponent(str).replace(
    /[!*'()]/g,
    (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase()
  );
}

// POST /2/tweets는 쿼리·폼 파라미터가 없으므로 서명 대상은 oauth_* 파라미터뿐 (JSON 본문은 서명에 포함하지 않음)
function buildOAuthHeader(method: string, url: string): string {
  const apiKey = process.env.X_API_KEY;
  const apiSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET;
  if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
    throw new Error("X API 키가 설정되지 않았습니다 (Vercel 환경변수 확인 필요)");
  }

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: apiKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

  const paramString = Object.keys(oauthParams)
    .sort()
    .map((k) => `${percentEncode(k)}=${percentEncode(oauthParams[k])}`)
    .join("&");

  const baseString = [method.toUpperCase(), percentEncode(url), percentEncode(paramString)].join("&");
  const signingKey = `${percentEncode(apiSecret)}&${percentEncode(accessTokenSecret)}`;
  const signature = crypto.createHmac("sha1", signingKey).update(baseString).digest("base64");

  const headerParams: Record<string, string> = { ...oauthParams, oauth_signature: signature };
  return (
    "OAuth " +
    Object.keys(headerParams)
      .sort()
      .map((k) => `${percentEncode(k)}="${percentEncode(headerParams[k])}"`)
      .join(", ")
  );
}

// 승인된 글을 실제 X(트위터)에 게시 — 관리자가 "게시" 버튼을 눌렀을 때만 호출됨
export async function postToX(content: string): Promise<{ id: string }> {
  const url = "https://api.x.com/2/tweets";
  const authHeader = buildOAuthHeader("POST", url);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: content }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data?.detail || data?.title || JSON.stringify(data);
    throw new Error(`X 게시 실패 (${res.status}): ${detail}`);
  }
  return { id: data.data.id };
}
