"use client";
import { SessionProvider as NextAuthSessionProvider, useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import FloatingChat from "@/components/FloatingChat";

function SetupGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 관리자가 거절 처리한 계정은 즉시 로그아웃
    if (status === "authenticated" && (session?.user as any)?.tier === "REJECTED") {
      signOut({ callbackUrl: "/auth/login" });
      return;
    }

    const needsCompany =
      pathname.startsWith("/quote") ||
      pathname.startsWith("/mypage");

    if (
      status === "authenticated" &&
      (session?.user as any)?.company === "" &&
      needsCompany
    ) {
      router.push("/auth/setup");
    }
  }, [session, status, pathname, router]);

  return <>{children}</>;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider refetchInterval={60}>
      <SetupGuard>{children}</SetupGuard>
      <FloatingChat />
    </NextAuthSessionProvider>
  );
}
