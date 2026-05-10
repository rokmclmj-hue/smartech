"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/admin", label: "대시보드", icon: "📊", exact: true },
  { href: "/admin/orders", label: "주문 관리", icon: "🛒" },
  { href: "/admin/products", label: "제품/재고 관리", icon: "📦" },
  { href: "/admin/quotes", label: "견적 내역", icon: "📝" },
  { href: "/admin/users", label: "고객 관리", icon: "👥" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tier = (session?.user as any)?.tier;

  useEffect(() => {
    if (status === "loading") return;
    if (!session || tier !== "ADMIN") {
      router.replace("/auth/login");
    }
  }, [session, status, tier, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 text-sm">로딩 중...</div>
      </div>
    );
  }

  if (!session || tier !== "ADMIN") return null;

  function isActive(item: { href: string; exact?: boolean }) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* 모바일 오버레이 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-60 bg-gray-900 text-white z-30 flex flex-col
          transform transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0 lg:flex
        `}
      >
        {/* 로고 */}
        <div className="px-6 py-5 border-b border-gray-700">
          <span className="text-lg font-bold tracking-tight text-white">Smartech</span>
          <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded font-medium">
            Admin
          </span>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors
                ${
                  isActive(item)
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }
              `}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* 하단 사용자 정보 */}
        <div className="px-6 py-4 border-t border-gray-700">
          <div className="text-xs text-gray-400">
            {(session.user as any)?.name ?? session.user?.email}
          </div>
          <div className="text-xs text-red-400 font-semibold mt-0.5">ADMIN</div>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 모바일 상단 헤더 */}
        <header className="lg:hidden flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="메뉴 열기"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-gray-900">Smartech Admin</span>
        </header>

        {/* 페이지 콘텐츠 */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
