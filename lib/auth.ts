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
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) return null;
        const phone = normalizePhone(credentials.phone as string);
        if (!phone) return null;
        const user = await prisma.user.findFirst({
          where: { phone },
        });
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
