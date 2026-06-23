import { ImapFlow } from "imapflow";

export interface RawEmail {
  messageId: string;   // Gmail 고유 ID
  fromEmail: string;
  fromName: string;
  subject: string;
  bodyText: string;
  receivedAt: Date;
}

/**
 * Gmail 받은편지함에서 미처리 이메일을 가져온다.
 * sinceDate 이후에 수신된 이메일만 조회.
 */
export async function fetchNewEmails(sinceDate: Date): Promise<RawEmail[]> {
  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER!,
      pass: process.env.GMAIL_APP_PASSWORD!,
    },
    logger: false,
  });

  const results: RawEmail[] = [];

  await client.connect();

  try {
    const lock = await client.getMailboxLock("INBOX");
    try {
      // 날짜 이후 수신된 이메일 검색
      const searchResult = await client.search({ since: sinceDate });
      const uids = Array.isArray(searchResult) ? searchResult : [];

      if (uids.length === 0) {
        return results;
      }

      for await (const msg of client.fetch(uids, {
        uid: true,
        envelope: true,
        bodyStructure: true,
        source: true,
      })) {
        try {
          const envelope = msg.envelope;
          if (!envelope) continue;

          const from = envelope.from?.[0];
          const fromEmail = from?.address ?? "";
          const fromName = from?.name ?? "";
          const subject = envelope.subject ?? "(제목 없음)";
          const receivedAt = envelope.date ?? new Date();

          // Gmail 고유 메시지 ID (헤더의 Message-ID)
          const messageIdHeader = envelope.messageId ?? `uid-${msg.uid}`;

          // Buffer 그대로 전달 — 인코딩은 내부에서 감지
          let bodyText = "";
          if (msg.source) {
            bodyText = extractTextFromRaw(msg.source);
          }

          results.push({
            messageId: messageIdHeader,
            fromEmail,
            fromName,
            subject,
            bodyText: bodyText.slice(0, 8000), // 최대 8000자
            receivedAt: new Date(receivedAt),
          });
        } catch {
          // 개별 메일 파싱 실패는 건너뜀
        }
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }

  return results;
}

/**
 * Gmail 받은편지함에서 특정 메시지를 휴지통으로 이동한다.
 * 복구는 Gmail에서 30일 이내 가능.
 */
export async function trashEmail(messageId: string): Promise<boolean> {
  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER!,
      pass: process.env.GMAIL_APP_PASSWORD!,
    },
    logger: false,
  });

  await client.connect();
  try {
    const lock = await client.getMailboxLock("INBOX");
    try {
      const uids = await client.search({ header: { "Message-ID": messageId } });
      if (!uids || uids.length === 0) return false;
      await client.messageMove(uids, "[Gmail]/Trash");
      return true;
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
}

/**
 * 이메일 원문 Buffer에서 텍스트 본문을 추출한다.
 * - charset 자동 감지 (EUC-KR, UTF-8 등)
 * - Content-Transfer-Encoding: base64 / quoted-printable 모두 처리
 * - multipart 이메일에서 text/plain 파트 우선 추출
 */
function extractTextFromRaw(source: Buffer): string {
  // latin1로 파싱하면 바이트 손실 없이 헤더를 읽을 수 있음
  const raw = source.toString("latin1");

  // multipart 이메일: text/plain 파트를 찾아 재귀 처리
  const boundaryMatch = raw.match(/Content-Type:[^\r\n]*multipart\/[^\r\n]*boundary=["']?([^"';\r\n\s]+)/i);
  if (boundaryMatch) {
    const boundary = boundaryMatch[1].replace(/["']/g, "");
    const parts = raw.split(`--${boundary}`);
    for (const part of parts) {
      if (/Content-Type:[^\r\n]*text\/plain/i.test(part)) {
        const partStart = part.indexOf("\r\n\r\n");
        if (partStart !== -1) {
          const partHeaders = part.slice(0, partStart);
          const partBody = part.slice(partStart + 4);
          const charset = detectCharset(partHeaders);
          const cte = detectCTE(partHeaders);
          return decodeBody(partBody, cte, charset);
        }
      }
    }
  }

  // 단일 파트 이메일
  const headerEnd = raw.indexOf("\r\n\r\n");
  const headers = headerEnd !== -1 ? raw.slice(0, headerEnd) : "";
  const body = headerEnd !== -1 ? raw.slice(headerEnd + 4) : raw;

  const charset = detectCharset(headers);
  const cte = detectCTE(headers);
  return decodeBody(body, cte, charset);
}

function detectCharset(headers: string): string {
  const m = headers.match(/charset=["']?([^"';\s\r\n]+)/i);
  return m ? m[1].replace(/["']/g, "") : "utf-8";
}

function detectCTE(headers: string): string {
  const m = headers.match(/Content-Transfer-Encoding:\s*(\S+)/i);
  return m ? m[1].trim().toLowerCase() : "7bit";
}

function decodeBody(body: string, cte: string, charset: string): string {
  if (cte === "base64") {
    try {
      const cleaned = body.replace(/[\r\n\s]/g, "");
      const buf = Buffer.from(cleaned, "base64");
      return stripHtml(decodeWithCharset(buf, charset));
    } catch {
      return stripHtml(body);
    }
  }

  if (cte === "quoted-printable") {
    const buf = decodeQuotedPrintable(body);
    return stripHtml(decodeWithCharset(buf, charset));
  }

  // 7bit / 8bit: latin1로 읽힌 바이트를 올바른 charset으로 재해석
  const buf = Buffer.from(body, "latin1");
  return stripHtml(decodeWithCharset(buf, charset));
}

// Node.js 내장 TextDecoder로 charset 변환 (외부 패키지 불필요)
function decodeWithCharset(buf: Buffer, charset: string): string {
  try {
    const decoder = new TextDecoder(charset, { fatal: false });
    return decoder.decode(buf);
  } catch {
    return buf.toString("utf-8");
  }
}

// Quoted-Printable: =XX 시퀀스를 바이트로 변환
function decodeQuotedPrintable(input: string): Buffer {
  const joined = input.replace(/=\r?\n/g, ""); // soft line break 제거
  const bytes: number[] = [];
  for (let i = 0; i < joined.length; ) {
    if (joined[i] === "=" && i + 2 < joined.length) {
      const val = parseInt(joined.slice(i + 1, i + 3), 16);
      if (!isNaN(val)) {
        bytes.push(val);
        i += 3;
        continue;
      }
    }
    bytes.push(joined.charCodeAt(i) & 0xff);
    i++;
  }
  return Buffer.from(bytes);
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s{3,}/g, "\n")
    .trim();
}
