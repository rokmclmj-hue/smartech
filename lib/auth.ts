import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./db";
import { normalizePhone } from "./phone";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
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
          if (token.usedAt) return null; // 이미 사용됨
          if (token.expiresAt < new Date()) return null; // 만료

          // 토큰 소진 처리
          await prisma.magicLinkToken.update({
            where: { id: token.id },
            data: { usedAt: new Date() },
          });

          // 이메일로 사용자 조회 or 생성
          if (token.email) {
            let user = await prisma.user.findFirst({
              where: { email: token.email.toLowerCase() },
            });
            if (!user) {
              // 신규: 화이트리스트 분류 후 자동 생성
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

          // 전화번호 기반 (Step 9 SMS 매직 링크)
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
        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          tier: user.tier,
          company: user.company,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
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
