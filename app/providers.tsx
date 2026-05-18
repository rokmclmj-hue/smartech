"use client";
import { SessionProvider as NextAuthSessionProvider, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

function SetupGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (
      status === "authenticated" &&
      (session?.user as any)?.company === "" &&
      !pathname.startsWith("/auth/") &&
      !pathname.startsWith("/api/")
    ) {
      router.push("/auth/setup");
    }
  }, [session, status, pathname, router]);

  return <>{children}</>;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <SetupGuard>{children}</SetupGuard>
    </NextAuthSessionProvider>
  );
}
