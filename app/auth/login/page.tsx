"use client";
import { signIn, useSession } from "next-auth/react";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function LoginContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  const [magicEmail, setMagicEmail] = useState("");
  const [magicSending, setMagicSending] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [magicError, setMagicError] = useState("");

  // 사업자번호 로그인 상태
  const [bizNo, setBizNo] = useState("");
  const [bizLoading, setBizLoading] = useState(false);
  const [bizError, setBizError] = useState("");

  async function handleBizVerify(e: React.FormEvent) {
    e.preventDefault();
    setBizError("");
    setBizLoading(true);
    try {
      // 1단계: 국세청 유효성 검증
      const res = await fetch("/api/auth/verify-biz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessNo: bizNo.replace(/[^0-9]/g, "") }),
      });
      const data = await res.json();
      if (data.status !== "active") {
        setBizError(data.message ?? "유효하지 않은 사업자번호입니다.");
        return;
      }
      // 2단계: 바로 로그인
      const result = await signIn("credentials", {
        businessNo: bizNo.replace(/[^0-9]/g, ""),
        redirect: false,
      });
      if (result?.ok) {
        router.replace("/");
      } else {
        setBizError("로그인에 실패했습니다. 다시 시도해 주세요.");
      }
    } catch {
      setBizError("네트워크 오류가 발생했습니다.");
    } finally {
      setBizLoading(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setMagicError("");
    setMagicSending(true);
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: magicEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMagicError(data.error ?? "오류가 발생했습니다.");
      } else {
        setMagicSent(true);
      }
    } catch {
      setMagicError("네트워크 오류가 발생했습니다.");
    } finally {
      setMagicSending(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-paper">
      <div className="w-full max-w-sm">

        {/* 헤드라인 */}
        <div className="text-center mb-10">
          <div className="display text-[36px] tracking-[-0.045em] text-ink leading-none">
            Partner Portal
          </div>
          <p className="text-[13px] text-gray-500 mt-2">
            검증된 파트너사 전용 채널
          </p>
        </div>

        {registered === "approved" && (
          <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 text-sm text-green-700 rounded-lg text-center">
            ✓ 가입 완료! 아래 방법으로 로그인해주세요.
          </div>
        )}

        {/* 소셜 로그인 */}
        <div className="space-y-3">
          <button
            onClick={() => signIn("kakao", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 bg-[#FEE500] hover:bg-[#f5dc00] text-[#3C1E1E] font-semibold py-3.5 rounded-xl transition-colors text-[15px]"
          >
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M9 0C4.029 0 0 3.13 0 6.992c0 2.49 1.612 4.677 4.049 5.918L3.07 16.67a.287.287 0 0 0 .43.32l4.517-3.005A11.2 11.2 0 0 0 9 13.984c4.971 0 9-3.13 9-6.992S13.971 0 9 0z" fill="#3C1E1E"/>
            </svg>
            카카오로 시작하기
          </button>

          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3.5 rounded-xl transition-colors text-[15px] shadow-sm"
          >
            <svg width="20" height="20" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            구글로 시작하기
          </button>
        </div>

        {/* 이메일 매직 링크 카드 */}
        <div className="mt-4 border border-gray-200 rounded-2xl p-4 bg-white">
          <div className="flex items-center justify-center gap-2 mb-3">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-gray-900">
              <rect x="2" y="4" width="16" height="13" rx="2"/>
              <path d="M2 7l8 5 8-5"/>
            </svg>
            <p className="text-sm font-semibold text-gray-900 tracking-tight">이메일로 링크 받기</p>
          </div>
          {magicSent ? (
            <div className="py-3 text-center">
              <p className="text-sm font-semibold text-green-700">이메일을 확인해 주세요</p>
              <p className="text-xs text-green-600 mt-1">{magicEmail}으로 링크를 보냈습니다.</p>
              <p className="text-xs text-green-500 mt-0.5">링크를 클릭한 기기에서 로그인됩니다. 이 화면은 닫으셔도 됩니다.</p>
              <button
                onClick={() => { setMagicSent(false); setMagicEmail(""); }}
                className="mt-3 text-xs text-green-700 underline"
              >
                다른 이메일로 보내기
              </button>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-2">
              <input
                type="email"
                value={magicEmail}
                onChange={(e) => setMagicEmail(e.target.value)}
                required
                placeholder="이메일 주소 입력"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-gray-50"
              />
              {magicError && <p className="text-red-500 text-xs">{magicError}</p>}
              <button
                type="submit"
                disabled={magicSending}
                className="w-full bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                {magicSending ? "발송 중..." : "로그인 링크 받기"}
              </button>
            </form>
          )}
        </div>

        {/* 사업자번호 간편 로그인 */}
        <div className="mt-4 border border-smblue/30 rounded-2xl p-4 bg-white">
          <div className="flex items-center justify-center gap-2 mb-3">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-smblue">
              <rect x="2" y="3" width="16" height="14" rx="2"/>
              <path d="M6 7h8M6 10h5"/>
            </svg>
            <p className="text-sm font-semibold text-smblue tracking-tight">사업자번호로 로그인</p>
          </div>
          <p className="text-[11px] text-gray-400 text-center mb-3">사업자번호 입력 후 바로 로그인 · 우대 금액 확인</p>

          <form onSubmit={handleBizVerify} className="space-y-2">
            <input
              type="text"
              value={bizNo}
              onChange={(e) => setBizNo(e.target.value)}
              required
              placeholder="사업자등록번호 10자리 (예: 1234567890)"
              maxLength={12}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-smblue/30 bg-gray-50"
            />
            {bizError && <p className="text-red-500 text-xs">{bizError}</p>}
            <button
              type="submit"
              disabled={bizLoading}
              className="w-full bg-smblue hover:bg-smblue/90 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {bizLoading ? "확인 중..." : "로그인하기"}
            </button>
          </form>
        </div>

        {/* 관리자 링크 — 매우 작게 */}
        <div className="mt-12 text-center">
          <Link href="/auth/admin" className="text-[11px] text-gray-300 hover:text-gray-400 transition-colors">
            관리자
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
