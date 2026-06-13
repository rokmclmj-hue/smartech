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
      const since = sinceDate.toDateString(); // "Mon Jan 01 2026"
      const searchResult = await client.search({ since: new Date(since) });
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

          // 본문 텍스트 추출
          let bodyText = "";
          if (msg.source) {
            const raw = msg.source.toString("utf-8");
            bodyText = extractTextFromRaw(raw);
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
 * 이메일 원문(raw)에서 텍스트 본문을 추출한다.
 * HTML 태그 제거, base64 디코딩 시도.
 */
function extractTextFromRaw(raw: string): string {
  // base64 인코딩된 파트 디코딩 시도
  const base64Match = raw.match(/Content-Transfer-Encoding: base64[\r\n]+([A-Za-z0-9+/=\r\n]+)/i);
  if (base64Match) {
    try {
      const decoded = Buffer.from(base64Match[1].replace(/\r\n/g, ""), "base64").toString("utf-8");
      return stripHtml(decoded);
    } catch {
      // 디코딩 실패 시 원문 사용
    }
  }

  // quoted-printable 처리
  const qpMatch = raw.match(/Content-Transfer-Encoding: quoted-printable[\r\n]+([\s\S]*?)(?:--|\z)/i);
  if (qpMatch) {
    return stripHtml(qpMatch[1]);
  }

  // 헤더 이후 본문 추출
  const bodyStart = raw.indexOf("\r\n\r\n");
  if (bodyStart !== -1) {
    return stripHtml(raw.slice(bodyStart + 4));
  }

  return stripHtml(raw);
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
