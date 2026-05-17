"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ContactQuoteCta() {
  const { data: session } = useSession();

  if (session) {
    return (
      <Link
        href="/quote"
        className="bg-edred text-paper px-6 py-4 text-sm hover:bg-edred2 transition-colors"
      >
        견적 카트 →
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Link
        href="/auth/login?callbackUrl=/quote"
        className="bg-edred text-paper px-6 py-4 text-sm hover:bg-edred2 transition-colors text-center"
      >
        견적 요청하기 →
      </Link>
      <span className="text-[11px] text-paper/50">B2B 회원 로그인 후 이용 가능합니다</span>
    </div>
  );
}
