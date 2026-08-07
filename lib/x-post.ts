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

// X가 성공 응답(2xx)을 줬는데 트윗 ID를 못 읽은 경우 — 실제로는 게시됐을 가능성이 높으므로
// 호출부에서 이 에러는 "APPROVED로 되돌려 재시도 허용" 대신 별도 처리해야 함(중복 게시 방지)
export class PostedButUnconfirmedError extends Error {}

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

  let data: { detail?: string; title?: string; data?: { id?: string } } | undefined;
  try {
    data = await res.json();
  } catch {
    if (res.ok) {
      throw new PostedButUnconfirmedError(
        "X가 성공 응답을 보냈지만 트윗 ID를 확인하지 못했습니다. X 계정에서 직접 게시 여부를 확인해주세요."
      );
    }
    throw new Error(`X 게시 실패 (${res.status}): 응답을 읽을 수 없습니다`);
  }

  if (!res.ok) {
    const detail = data?.detail || data?.title || JSON.stringify(data);
    throw new Error(`X 게시 실패 (${res.status}): ${detail}`);
  }
  if (!data?.data?.id) {
    throw new PostedButUnconfirmedError(
      "X가 성공 응답을 보냈지만 트윗 ID가 없습니다. X 계정에서 직접 게시 여부를 확인해주세요."
    );
  }
  return { id: data.data.id };
}
