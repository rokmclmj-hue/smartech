import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Kakao from "next-auth/providers/kakao";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { prisma } from "./db";
import { normalizePhone } from "./phone";

const NOTIFY_TIERS = ["DEALER", "KEY_DEALER", "VIP_DEALER", "OEM"];

// KnownContact에서 직함 조회 (phone 또는 email 매칭)
async function lookupTitle(phone?: string | null, email?: string | null): Promise<string | null> {
  try {
    if (phone) {
      const contact = await prisma.knownContact.findFirst({
        where: { OR: [{ mobile: phone }, { tel: phone }] },
        select: { title: true },
      });
      if (contact?.title) return contact.title;
    }
    if (email) {
      const contact = await prisma.knownContact.findFirst({
        where: { email: email.toLowerCase() },
        select: { title: true },
      });
      if (contact?.title) return contact.title;
    }
  } catch { /* 조회 실패 시 무시 */ }
  return null;
}

async function recordLogin(userId: number, company: string, name: string, tier: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date(), loginCount: { increment: 1 } },
    });
    // 딜러/OEM 로그인 시 관리자 SMS
    if (NOTIFY_TIERS.includes(tier)) {
      const { notifyDealerLogin } = await import("./solapi");
      notifyDealerLogin(company, name, tier).catch(() => {});
    }
  } catch (e) {
    console.error("[auth] recordLogin failed:", e);
  }
}

async function findOrCreateOAuthUser(email: string, name: string, phone?: string | null) {
  const normalizedPhone = phone ? (normalizePhone(phone) || null) : null;
  let user = await prisma.user.findFirst({ where: { email: email.toLowerCase() } });
  if (!user) {
    const { classifyCompany } = await import("./classify-company");
    const cls = await classifyCompany({ email });
    const tier = cls.source === "whitelist" ? cls.tier : "PENDING";
    user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name || email.split("@")[0],
        company: "",
        passwordHash: "",
        phone: normalizedPhone,
        tier,
        aiEstimatedTier: cls.tier,
        aiTypeReason: cls.source,
      },
    });
    if (tier === "PENDING") {
      const { notifyNewMember } = await import("./solapi");
      notifyNewMember(user.name, email, "PENDING — 신규 (소셜 로그인)").catch(() => {});
    }
  } else if (normalizedPhone && !user.phone) {
    // 기존 유저지만 전화번호가 없으면 업데이트
    user = await prisma.user.update({
      where: { id: user.id },
      data: { phone: normalizedPhone },
    });
  }
  return user;
}

const providers: any[] = [
  Credentials({
    credentials: {
      magicToken: { label: "매직 링크 토큰", type: "text" },
      // 관리자 전용 (UI에서 노출 안 함)
      phone: { label: "전화번호", type: "tel" },
      password: { label: "비밀번호", type: "password" },
    },
    async authorize(credentials) {
      if (credentials?.magicToken) {
        const token = await prisma.magicLinkToken.findUnique({
          where: { token: credentials.magicToken as string },
        });
        if (!token) return null;
        if (token.usedAt) return null;
        if (token.expiresAt < new Date()) return null;

        await prisma.magicLinkToken.update({
          where: { id: token.id },
          data: { usedAt: new Date() },
        });

        if (token.email) {
          let user = await prisma.user.findFirst({
            where: { email: token.email.toLowerCase() },
          });
          if (!user) {
            const { classifyCompany } = await import("./classify-company");
            const cls = await classifyCompany({ email: token.email });
            const tier = cls.source === "whitelist" ? cls.tier : "PENDING";
            user = await prisma.user.create({
              data: {
                email: token.email.toLowerCase(),
                name: token.email.split("@")[0],
                company: "",
                passwordHash: "",
                tier,
                aiEstimatedTier: cls.tier,
                aiTypeReason: cls.source,
              },
            });
            if (tier === "PENDING") {
              const { notifyNewMember } = await import("./solapi");
              notifyNewMember(user.name, token.email, "PENDING — 신규 (매직링크)").catch(() => {});
            }
          }
          return { id: String(user.id), email: user.email, name: user.name, tier: user.tier, company: user.company };
        }

        if (token.phone) {
          const user = await prisma.user.findFirst({ where: { phone: token.phone } });
          if (!user) return null;
          return { id: String(user.id), email: user.email, name: user.name, tier: user.tier, company: user.company, phone: user.phone };
        }
        return null;
      }

      // 관리자 전용 전화번호+비밀번호
      if (!credentials?.phone || !credentials?.password) return null;
      const phone = normalizePhone(credentials.phone as string);
      if (!phone) return null;
      const user = await prisma.user.findFirst({ where: { phone } });
      if (!user || user.tier !== "ADMIN") return null;
      const valid = await compare(credentials.password as string, user.passwordHash);
      if (!valid) return null;
      return { id: String(user.id), email: user.email, name: user.name, tier: user.tier, company: user.company, phone: user.phone };
    },
  }),
];

if (process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET) {
  providers.push(
    Kakao({ clientId: process.env.KAKAO_CLIENT_ID, clientSecret: process.env.KAKAO_CLIENT_SECRET })
  );
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  callbacks: {
    async jwt({ token, user, account, profile, trigger, session }) {
      // 세션 업데이트 (회사명 설정 후 갱신)
      if (trigger === "update" && session?.company !== undefined) {
        token.company = session.company;
        return token;
      }

      // OAuth 로그인
      if (account && (account.provider === "kakao" || account.provider === "google")) {
        // 카카오: 이메일 동의 없이도 로그인 가능 — providerAccountId로 식별
        // 카카오 프로필에서 실제 이메일/전화번호 추출
        const kakaoProfile = account.provider === "kakao" ? (profile as any) : null;
        const kakaoPhone = kakaoProfile?.kakao_account?.phone_number ?? null;
        const email =
          token.email ??
          (account.provider === "kakao" && account.providerAccountId
            ? `kakao_${account.providerAccountId}@kakao.smartech`
            : null);
        const name = token.name ?? "";
        if (email) {
          try {
            const dbUser = await findOrCreateOAuthUser(email, name, kakaoPhone);
            token.tier = dbUser.tier;
            token.company = dbUser.company;
            token.id = String(dbUser.id);
            token.phone = dbUser.phone ?? null;
            token.title = (dbUser as any).title ?? await lookupTitle(dbUser.phone, dbUser.email) ?? null;
            // 로그인 기록 (비동기)
            recordLogin(dbUser.id, dbUser.company, dbUser.name, dbUser.tier);
          } catch (err) {
            console.error("[auth] OAuth user lookup failed:", err);
          }
        }
        return token;
      }

      // Credentials 로그인 (매직 링크 / 관리자)
      if (user) {
        token.tier = (user as any).tier;
        token.company = (user as any).company;
        token.id = user.id;
        token.phone = (user as any).phone ?? null;
        token.title = (user as any).title ?? await lookupTitle((user as any).phone, user.email as string | null) ?? null;
        token.tierCheckedAt = Date.now();
        // 로그인 기록 (관리자 제외, 비동기)
        const tier = (user as any).tier;
        if (tier !== "ADMIN" && user.id) {
          recordLogin(
            parseInt(user.id),
            (user as any).company ?? "",
            user.name ?? "",
            tier
          );
        }
      }

      // 1분마다 DB에서 tier 재확인 (관리자 승인 즉시 반영)
      if (!account && !user && token.id) {
        const now = Date.now();
        const lastChecked = (token.tierCheckedAt as number) ?? 0;
        if (now - lastChecked > 60 * 1000) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: parseInt(token.id as string) },
              select: { tier: true },
            });
            if (dbUser) token.tier = dbUser.tier;
          } catch { /* DB 조회 실패 시 기존 tier 유지 */ }
          token.tierCheckedAt = now;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).tier = token.tier;
        (session.user as any).company = token.company;
        (session.user as any).id = token.id;
        (session.user as any).phone = token.phone ?? null;
        (session.user as any).title = token.title ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30일
});
