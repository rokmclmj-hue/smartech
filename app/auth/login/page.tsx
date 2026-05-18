"use client";
import { signIn } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginContent() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicEmail, setMagicEmail] = useState("");
  const [magicSending, setMagicSending] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [magicError, setMagicError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const isAutoApproved = registered === "approved";

  useEffect(() => {
    const saved = localStorage.getItem("smartech_login");
    if (saved) {
      try {
        const { phone: p, password: pw } = JSON.parse(saved);
        setPhone(p ?? "");
        setPassword(pw ?? "");
        setRemember(true);
      } catch {}
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { phone, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("전화번호 또는 비밀번호가 올바르지 않습니다.");
    } else {
      if (remember) {
        localStorage.setItem("smartech_login", JSON.stringify({ phone, password }));
      } else {
        localStorage.removeItem("smartech_login");
      }
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">로그인</h1>
        {isAutoApproved ? (
          <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 text-sm text-green-700 rounded-lg">
            ✓ 가입이 완료되었습니다. 바로 로그인하여 전용 가격을 확인하세요.
          </div>
        ) : registered ? (
          <div className="mb-6 px-4 py-3 bg-blue-50 border border-blue-200 text-sm text-blue-700 rounded-lg">
            가입 신청이 완료되었습니다. 담당자 확인 후 이용 가능합니다.
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-8">스마텍 회원 전용 서비스입니다</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="tel"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="010-1234-5678"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
            />
            <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
              전화번호·비밀번호 저장
            </label>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs text-gray-400">
            <span className="bg-white px-3">또는 이메일로 로그인</span>
          </div>
        </div>

        {magicSent ? (
          <div className="px-4 py-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-sm font-medium text-green-700">이메일을 확인해 주세요</p>
            <p className="text-xs text-green-600 mt-1">{magicEmail} 으로 링크를 보냈습니다. (15분 유효)</p>
            <button
              onClick={() => { setMagicSent(false); setMagicEmail(""); }}
              className="mt-3 text-xs text-green-700 underline"
            >
              다른 이메일로 보내기
            </button>
          </div>
        ) : (
          <form
            onSubmit={async (e) => {
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
            }}
            className="space-y-3"
          >
            <input
              type="email"
              value={magicEmail}
              onChange={(e) => setMagicEmail(e.target.value)}
              required
              placeholder="이메일 주소"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {magicError && <p className="text-red-500 text-xs">{magicError}</p>}
            <button
              type="submit"
              disabled={magicSending}
              className="w-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              {magicSending ? "발송 중..." : "로그인 링크 받기"}
            </button>
          </form>
        )}

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs text-gray-400">
            <span className="bg-white px-3">소셜 로그인</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => signIn("kakao", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 bg-[#FEE500] hover:bg-[#f5dc00] text-[#3C1E1E] font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M9 0C4.029 0 0 3.13 0 6.992c0 2.49 1.612 4.677 4.049 5.918L3.07 16.67a.287.287 0 0 0 .43.32l4.517-3.005A11.2 11.2 0 0 0 9 13.984c4.971 0 9-3.13 9-6.992S13.971 0 9 0z" fill="#3C1E1E"/>
            </svg>
            카카오로 시작하기
          </button>
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            구글로 시작하기
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          계정이 없으신가요?{" "}
          <Link href="/auth/register" className="text-blue-600 hover:underline">회원가입</Link>
        </p>
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
