"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function MagicPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("유효하지 않은 링크입니다.");
      return;
    }

    signIn("credentials", { magicToken: token, redirect: false })
      .then((res) => {
        if (res?.error) {
          setStatus("error");
          setMessage("링크가 만료되었거나 이미 사용된 링크입니다.");
        } else {
          setStatus("success");
          setMessage("로그인 완료! 잠시 후 이동합니다...");
          router.push("/");
          router.refresh();
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("오류가 발생했습니다. 다시 시도해주세요.");
      });
  }, [token, router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        {status === "loading" && (
          <>
            <div className="w-10 h-10 border-4 border-edred border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-[15px] text-ink">로그인 중입니다...</p>
            <p className="mono text-[11px] dim mt-2">잠시만 기다려주세요</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-[40px] mb-4">✓</div>
            <p className="text-[15px] font-semibold text-ink">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-[40px] mb-4">✗</div>
            <p className="text-[15px] text-ink mb-2">{message}</p>
            <Link
              href="/auth/login"
              className="inline-block mt-4 bg-edred text-paper px-6 py-3 text-[14px] font-medium hover:bg-edred/90 transition-colors"
            >
              다시 로그인하기
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
