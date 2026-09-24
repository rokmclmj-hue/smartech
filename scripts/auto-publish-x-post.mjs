// 승인(APPROVED)된 X 글 중 가장 오래된 1건을 골라 하루 1개씩 자동으로 X(트위터)에 게시한다.
// Windows 작업 스케줄러가 매일 1회 이 스크립트를 실행한다 (setup-x-auto-publish-scheduler.ps1로 등록).
// 사용법: node --env-file=.env scripts/auto-publish-x-post.mjs
//
// app/api/admin/x-posts/route.ts의 publish 로직(원자적 APPROVED→PUBLISHING 선점, 글자수 검사,
// 게시 확인 실패 시 PUBLISHING 잠금 유지)과 lib/x-post.ts의 OAuth 서명 로직을 그대로 따른다.
// .mjs에서 프로젝트의 .ts 파일을 직접 import할 수 없어 동일 로직을 인라인 복제한다
// (scripts/generate-x-posts-from-blog.mjs와 같은 기존 패턴).
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.join(__dirname, "..", "x-auto-publish.log");

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + "\n", "utf-8");
}

// lib/x-text-length.ts와 동일 로직
const WIDE_RANGES = [
  [0x1100, 0x115f], [0x11a3, 0x11a7], [0x11fa, 0x11ff], [0x2e80, 0x303e],
  [0x3041, 0x33ff], [0x3400, 0x4db5], [0x4e00, 0x9fff], [0xa000, 0xa4c6],
  [0xac00, 0xd7a3], [0xf900, 0xfaff], [0xfe30, 0xfe6b], [0xff01, 0xff60], [0xffe0, 0xffe6],
];
function getXWeightedLength(text) {
  let weighted = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    weighted += WIDE_RANGES.some(([s, e]) => cp >= s && cp <= e) ? 2 : 1;
  }
  return weighted;
}

// lib/x-post.ts와 동일 로직 (OAuth 1.0a 서명)
function percentEncode(str) {
  return encodeURIComponent(str).replace(/[!*'()]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}
function buildOAuthHeader(method, url) {
  const apiKey = process.env.X_API_KEY?.trim();
  const apiSecret = process.env.X_API_SECRET?.trim();
  const accessToken = process.env.X_ACCESS_TOKEN?.trim();
  const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET?.trim();
  if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
    throw new Error("X API 키가 설정되지 않았습니다 (.env 확인 필요)");
  }
  const oauthParams = {
    oauth_consumer_key: apiKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: "1.0",
  };
  const paramString = Object.keys(oauthParams).sort()
    .map((k) => `${percentEncode(k)}=${percentEncode(oauthParams[k])}`).join("&");
  const baseString = [method.toUpperCase(), percentEncode(url), percentEncode(paramString)].join("&");
  const signingKey = `${percentEncode(apiSecret)}&${percentEncode(accessTokenSecret)}`;
  const signature = crypto.createHmac("sha1", signingKey).update(baseString).digest("base64");
  const headerParams = { ...oauthParams, oauth_signature: signature };
  return "OAuth " + Object.keys(headerParams).sort()
    .map((k) => `${percentEncode(k)}="${percentEncode(headerParams[k])}"`).join(", ");
}

class PostedButUnconfirmedError extends Error {}
class XApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function postToX(content) {
  const url = "https://api.x.com/2/tweets";
  const authHeader = buildOAuthHeader("POST", url);
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: authHeader, "Content-Type": "application/json" },
    body: JSON.stringify({ text: content }),
  });
  let data;
  try {
    data = await res.json();
  } catch {
    if (res.ok) throw new PostedButUnconfirmedError("X가 성공 응답을 보냈지만 트윗 ID를 확인하지 못했습니다.");
    throw new Error(`X 게시 실패 (${res.status}): 응답을 읽을 수 없습니다`);
  }
  if (!res.ok) {
    const wwwAuth = res.headers.get("www-authenticate");
    const detail = data?.detail || data?.title || JSON.stringify(data?.errors?.length ? data.errors : data);
    throw new XApiError(res.status, `X 게시 실패 (${res.status}): ${detail}${wwwAuth ? ` | ${wwwAuth}` : ""}`);
  }
  if (!data?.data?.id) {
    throw new PostedButUnconfirmedError("X가 성공 응답을 보냈지만 트윗 ID가 없습니다.");
  }
  return { id: data.data.id };
}

const DRY_RUN = process.argv.includes("--dry-run");

// 400·403은 "이 글 내용"을 X가 거절한 것(중복 글·글자 수 등)으로 보고 그 글만 대기(PENDING)로 돌려보낸 뒤
// 다음 승인 글을 시도한다. 그 외(키 없음·401 인증·429 한도·5xx·네트워크)는 모든 글에 똑같이 실패하므로
// 글 상태를 건드리지 않고 멈춘 뒤 종료코드 1로 끝낸다 → 작업 스케줄러 "마지막 실행 결과"에 실패로 보인다.
const CONTENT_REJECT_STATUSES = new Set([400, 403]);
const MAX_CONTENT_FAILURES_PER_RUN = 2; // 연속 거절이 이 이상이면 글 문제가 아니라 계정·앱 문제일 수 있어 멈춤

async function sendBackToReview(post, note) {
  await prisma.xPost.update({ where: { id: post.id }, data: { status: "PENDING", adminNote: note } });
}

async function main() {
  const hasKeys = ["X_API_KEY", "X_API_SECRET", "X_ACCESS_TOKEN", "X_ACCESS_TOKEN_SECRET"].every((k) => process.env[k]?.trim());
  if (!hasKeys && !DRY_RUN) {
    log("[ERROR] X API 키가 이 컴퓨터 설정에 없어 게시하지 않음 — 글 상태 변경 없음");
    return 1;
  }

  const candidates = await prisma.xPost.findMany({
    where: { status: "APPROVED" },
    orderBy: { approvedAt: "asc" },
  });
  if (candidates.length === 0) {
    log("게시할 승인된 글 없음 — 건너뜀");
    return 0;
  }

  let contentFailures = 0;
  for (const candidate of candidates) {
    const weighted = getXWeightedLength(candidate.content);
    if (weighted > 280) {
      if (DRY_RUN) {
        log(`[DRY-RUN] id=${candidate.id} — 글자 수 초과(${weighted}/280자)라 대기로 돌려보낼 예정, 다음 글 확인`);
        continue;
      }
      await sendBackToReview(candidate, `[자동게시 보류] X 기준 글자 수 초과(${weighted}/280자, 한글 2자 계산). 줄인 뒤 다시 승인해주세요.`);
      log(`[보류] id=${candidate.id} — 글자 수 초과(${weighted}/280자) → 대기(PENDING)로 돌려보냄, 다음 글 시도`);
      continue;
    }

    if (DRY_RUN) {
      log(`[DRY-RUN] id=${candidate.id} 게시 대상 — ${weighted}/280자 — "${candidate.content.slice(0, 60)}..." (실제 게시·DB변경 없음)`);
      return 0;
    }

    // 원자적 선점: 동시 실행(수동 게시와 겹침 등)을 대비해 APPROVED일 때만 PUBLISHING으로 전환
    const claim = await prisma.xPost.updateMany({
      where: { id: candidate.id, status: "APPROVED" },
      data: { status: "PUBLISHING" },
    });
    if (claim.count === 0) {
      log(`[건너뜀] id=${candidate.id} — 이미 다른 프로세스가 처리 중, 다음 글 시도`);
      continue;
    }

    try {
      const result = await postToX(candidate.content);
      await prisma.xPost.update({
        where: { id: candidate.id },
        data: { status: "POSTED", postedAt: new Date(), tweetId: result.id },
      });
      log(`[SUCCESS] id=${candidate.id} 게시 완료 — tweetId=${result.id} — "${candidate.content.slice(0, 40)}..."`);
      return 0;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (e instanceof PostedButUnconfirmedError) {
        await prisma.xPost.update({ where: { id: candidate.id }, data: { adminNote: `[확인 필요] ${msg}` } });
        log(`[확인 필요] id=${candidate.id} — ${msg} — PUBLISHING 상태로 잠김, 관리자가 X 계정에서 직접 확인 필요`);
        return 1;
      }
      if (e instanceof XApiError && CONTENT_REJECT_STATUSES.has(e.status)) {
        await sendBackToReview(candidate, `[자동게시 실패] ${msg.slice(0, 300)} — 내용 확인 후 다시 승인해주세요.`);
        log(`[거절] id=${candidate.id} — ${msg} → 대기(PENDING)로 돌려보냄`);
        contentFailures++;
        if (contentFailures >= MAX_CONTENT_FAILURES_PER_RUN) {
          log(`[ERROR] 연속 ${contentFailures}건 거절 — 글 문제가 아니라 X 계정·앱 설정 문제일 수 있어 오늘은 중단`);
          return 1;
        }
        continue;
      }
      await prisma.xPost.update({ where: { id: candidate.id }, data: { status: "APPROVED" } });
      log(`[ERROR] id=${candidate.id} 게시 실패 — ${msg} — APPROVED로 되돌림, 내일 재시도 (모든 글 공통 문제로 판단해 중단)`);
      return 1;
    }
  }

  log("[ERROR] 게시 가능한 승인 글이 없음(모두 보류·거절됨)");
  return 1;
}

main()
  .then(async (code) => {
    await prisma.$disconnect();
    process.exit(code);
  })
  .catch(async (e) => {
    log(`[FATAL] ${e instanceof Error ? e.stack ?? e.message : String(e)}`);
    await prisma.$disconnect();
    process.exit(1);
  });
