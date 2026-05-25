import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Kakao from "next-auth/providers/kakao";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { prisma } from "./db";
import { normalizePhone } from "./phone";

async function findOrCreateOAuthUser(email: string, name: string) {
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
        tier,
        aiEstimatedTier: cls.tier,
        aiTypeReason: cls.source,
      },
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
    async jwt({ token, user, account, trigger, session }) {
      // 세션 업데이트 (회사명 설정 후 갱신)
      if (trigger === "update" && session?.company !== undefined) {
        token.company = session.company;
        return token;
      }

      // OAuth 로그인
      if (account && (account.provider === "kakao" || account.provider === "google")) {
        // 카카오는 이메일 동의 없이도 로그인 가능 — Kakao ID로 식별
        const email =
          token.email ??
          (account.provider === "kakao" && account.providerAccountId
            ? `kakao_${account.providerAccountId}@kakao.smartech`
            : null);
        const name = token.name ?? "";
        if (email) {
          try {
            const dbUser = await findOrCreateOAuthUser(email, name);
            token.tier = dbUser.tier;
            token.company = dbUser.company;
            token.id = String(dbUser.id);
            token.phone = dbUser.phone ?? null;
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
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).tier = token.tier;
        (session.user as any).company = token.company;
        (session.user as any).id = token.id;
        (session.user as any).phone = token.phone ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30일
});
