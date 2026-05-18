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
      phone: { label: "전화번호", type: "tel" },
      password: { label: "비밀번호", type: "password" },
      magicToken: { label: "매직 링크 토큰", type: "text" },
    },
    async authorize(credentials) {
      // ── 매직 링크 토큰 검증 ──────────────────────────────────
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
          return { id: String(user.id), email: user.email, name: user.name, tier: user.tier, company: user.company };
        }
        return null;
      }

      // ── 기존 전화번호+비밀번호 로그인 ────────────────────────
      if (!credentials?.phone || !credentials?.password) return null;
      const phone = normalizePhone(credentials.phone as string);
      if (!phone) return null;
      const user = await prisma.user.findFirst({ where: { phone } });
      if (!user) return null;
      const valid = await compare(credentials.password as string, user.passwordHash);
      if (!valid) return null;
      return { id: String(user.id), email: user.email, name: user.name, tier: user.tier, company: user.company };
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
    async jwt({ token, user, account }) {
      // OAuth 로그인 (카카오/구글) — DB에서 사용자 조회 or 생성
      if (account && (account.provider === "kakao" || account.provider === "google")) {
        const email = token.email;
        const name = token.name ?? "";
        if (email) {
          try {
            const dbUser = await findOrCreateOAuthUser(email, name);
            token.tier = dbUser.tier;
            token.company = dbUser.company;
            token.id = String(dbUser.id);
          } catch (err) {
            console.error("[auth] OAuth user lookup failed:", err);
          }
        }
        return token;
      }

      // Credentials 로그인
      if (user) {
        token.tier = (user as any).tier;
        token.company = (user as any).company;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).tier = token.tier;
        (session.user as any).company = token.company;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: { strategy: "jwt" },
});
