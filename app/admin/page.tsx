"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { matchPartner } from "@/lib/partners";

type UserItem = {
  id: number;
  email: string;
  name: string;
  company: string;
  tier: string;
  createdAt: string;
  phone: string | null;
  businessNo: string | null;
  businessFileUrl: string | null;
  cardImageUrl: string | null;
};

type VisitorItem = {
  id: number;
  name: string;
  company: string;
  tier: string;
  tierLabel: string;
  lastLoginAt: string | null;
  loginCount?: number;
};

type DashboardStats = {
  todayQuotes: number;
  monthQuotes: number;
  monthOrders: number;
  monthRevenue: number;
  pendingUsers: number;
  staleQuotes: number;
  todayVisitors: VisitorItem[];
  weekVisitors: VisitorItem[];
};

// ─── 미처리 견적 알림 띠 (3일 이상 미응답 PENDING) ──────────
function StaleQuotesAlert({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <Link
      href="/admin/quotes"
      className="block border border-edred bg-edred/5 px-4 sm:px-5 py-3 sm:py-4 hover:bg-edred/10 transition-colors"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="mono text-[10px] tracking-[0.18em] uppercase border border-edred text-edred px-2 py-0.5">
            ⚠ ALERT
          </span>
          <div className="text-[14px] text-ink">
            <span className="font-semibold text-edred">미처리 견적 {count}건</span>
            <span className="dim text-[12px] ml-2">3일 이상 응답 없는 견적 — 즉시 영업팀 응답 필요</span>
          </div>
        </div>
        <span className="mono text-[11px] tracking-[0.12em] uppercase text-edred">
          [ 견적 처리 → ]
        </span>
      </div>
    </Link>
  );
}

// ─── 방문 업체 섹션 ───────────────────────────────────────
const TIER_COLOR: Record<string, string> = {
  DEALER: "bg-blue-100 text-blue-700",
  KEY_DEALER: "bg-blue-100 text-blue-700",
  VIP_DEALER: "bg-blue-100 text-blue-700",
  OEM: "bg-purple-100 text-purple-700",
};

function VisitorSection({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {/* 오늘 방문 */}
      <div className="border hair bg-paper p-5">
        <div className="mono text-[10px] tracking-[0.15em] uppercase dim mb-1">TODAY · 오늘 방문</div>
        <div className="text-[20px] font-bold text-ink mb-4">
          {stats.todayVisitors.length > 0
            ? <><span className="text-edred">{stats.todayVisitors.length}개사</span> 방문</>
            : <span className="text-[16px] dim font-normal">오늘 방문 없음</span>}
        </div>
        {stats.todayVisitors.length > 0 ? (
          <div className="space-y-2">
            {stats.todayVisitors.map((v) => (
              <div key={v.id} className="flex items-center justify-between py-2 border-b hair last:border-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-ink truncate">{v.company}</span>
                    <span className={`mono text-[9px] tracking-[0.1em] px-1.5 py-[1px] rounded shrink-0 ${TIER_COLOR[v.tier] ?? "bg-gray-100 text-gray-600"}`}>
                      {v.tierLabel}
                    </span>
                  </div>
                  <div className="text-[11px] dim">{v.name}</div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <div className="mono text-[11px] text-ink">
                    {v.lastLoginAt ? new Date(v.lastLoginAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }) : "—"}
                  </div>
                  {v.loginCount && v.loginCount > 1 && (
                    <div className="mono text-[10px] dim">{v.loginCount}회 누적</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-[12px] dim">오늘 로그인한 업체가 없습니다</div>
        )}
      </div>

      {/* 이번 주 방문 */}
      <div className="border hair bg-paper p-5">
        <div className="mono text-[10px] tracking-[0.15em] uppercase dim mb-1">THIS WEEK · 이번 주 방문</div>
        <div className="text-[20px] font-bold text-ink mb-4">
          {stats.weekVisitors.length > 0
            ? <><span className="text-edred">{stats.weekVisitors.length}개사</span> 방문</>
            : <span className="text-[16px] dim font-normal">이번 주 방문 없음</span>}
        </div>
        {stats.weekVisitors.length > 0 ? (
          <div className="space-y-2 max-h-[280px] overflow-auto">
            {stats.weekVisitors.map((v) => (
              <div key={v.id} className="flex items-center justify-between py-2 border-b hair last:border-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-ink truncate">{v.company}</span>
                    <span className={`mono text-[9px] tracking-[0.1em] px-1.5 py-[1px] rounded shrink-0 ${TIER_COLOR[v.tier] ?? "bg-gray-100 text-gray-600"}`}>
                      {v.tierLabel}
                    </span>
                  </div>
                  <div className="text-[11px] dim">{v.name}</div>
                </div>
                <div className="mono text-[11px] dim shrink-0 ml-3">
                  {v.lastLoginAt ? new Date(v.lastLoginAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" }) : "—"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-[12px] dim">이번 주 방문한 업체가 없습니다</div>
        )}
      </div>
    </div>
  );
}

// ─── KPI 4 패널 (회원승인·발주·견적·매출) ─────────────────
function KpiPanels({
  stats,
  pendingCount,
}: {
  stats: DashboardStats;
  pendingCount: number;
}) {
  const kpis: Array<{
    eyebrow: string;
    value: string;
    meta: string;
    urgent?: boolean;
    href?: string;
  }> = [
    {
      eyebrow: "PENDING · 회원 승인",
      value: `${pendingCount.toLocaleString("ko-KR")}명`,
      meta: pendingCount > 0 ? "승인 대기 — 우선 작업" : "모두 처리 완료",
      urgent: pendingCount > 0,
      href: "/admin/users",
    },
    {
      eyebrow: "MTD · 발주 건수",
      value: `${stats.monthOrders.toLocaleString("ko-KR")}건`,
      meta: "이번 달 확정 주문",
      href: "/admin/orders",
    },
    {
      eyebrow: "MTD · 견적 건수",
      value: `${stats.monthQuotes.toLocaleString("ko-KR")}건`,
      meta: `이번 달 누적 · 오늘 ${stats.todayQuotes}건`,
      href: "/admin/quotes",
    },
    {
      eyebrow: "MTD · 매출",
      value: `₩${stats.monthRevenue.toLocaleString("ko-KR")}`,
      meta: "이번 달 누적 (VAT 별도)",
      href: "/admin/orders",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {kpis.map((k) => {
        const inner = (
          <div
            className={`kpi-panel kpi-cell px-4 sm:px-5 py-4 sm:py-5 relative h-full ${
              k.urgent ? "ring-1 ring-edred/40" : ""
            }`}
          >
            <div className="kpi-eyebrow mb-2 sm:mb-3">{k.eyebrow}</div>
            <div className="kpi-num text-[22px] sm:text-[28px] lg:text-[30px] leading-none break-all">
              {k.value}
            </div>
            <div className="kpi-meta mt-2 sm:mt-3">{k.meta}</div>
            <span className="kpi-accent" />
          </div>
        );
        return k.href ? (
          <Link
            key={k.eyebrow}
            href={k.href}
            className="block hover:opacity-80 transition-opacity"
          >
            {inner}
          </Link>
        ) : (
          <div key={k.eyebrow}>{inner}</div>
        );
      })}
    </div>
  );
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserItem[] | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/users?tier=PENDING&limit=200").then((r) => {
        if (!r.ok) throw new Error("회원 데이터 로드 실패");
        return r.json();
      }),
      fetch("/api/admin/dashboard").then((r) => {
        if (!r.ok) throw new Error("통계 데이터 로드 실패");
        return r.json();
      }),
    ])
      .then(([userData, statsData]: [{ items: UserItem[] }, DashboardStats]) => {
        setUsers(userData.items);
        setStats(statsData);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  // ─── 에러 ────────────────────────────────────────────────
  if (error) {
    return (
      <div className="px-4 sm:px-6 py-6 sm:py-10 max-w-[1400px] mx-auto">
        <div className="border border-edred/30 bg-edred/5 px-5 py-4 text-edred text-sm">
          {error}
        </div>
      </div>
    );
  }

  // ─── 로딩 ────────────────────────────────────────────────
  if (!users || !stats) {
    return (
      <div className="px-4 sm:px-6 py-6 sm:py-10 max-w-[1400px] mx-auto space-y-6 sm:space-y-8">
        <div className="h-[70px] bg-ink/[0.04] animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="kpi-panel p-5 animate-pulse h-[110px]" />
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border hair bg-paper p-5 h-[160px] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // ─── 0건 ─ 모두 처리 완료 ───────────────────────────────
  if (users.length === 0) {
    return (
      <div className="px-4 sm:px-6 py-6 sm:py-10 max-w-[1400px] mx-auto">
        <div className="mono text-[11px] dim tracking-[0.15em] uppercase mb-3">
          — 01 · DASHBOARD
        </div>
        <h1 className="display text-[28px] sm:text-[40px] leading-none text-ink mb-6 sm:mb-10">
          관리자 <span className="italic text-edred">대시보드</span>
        </h1>

        {/* 미처리 견적 알림 (3일+) */}
        {stats.staleQuotes > 0 && (
          <div className="mb-4 sm:mb-6">
            <StaleQuotesAlert count={stats.staleQuotes} />
          </div>
        )}

        {/* KPI 4 패널 */}
        <div className="mb-6 sm:mb-10">
          <KpiPanels stats={stats} pendingCount={users.length} />
        </div>

        <div className="border hair bg-paper px-4 sm:px-6 py-10 sm:py-16 text-center mb-6">
          <div className="mono text-[10px] tracking-[0.18em] uppercase text-edred mb-4">
            ● ALL CLEAR
          </div>
          <div className="display text-[48px] sm:text-[64px] leading-none text-ink mb-4 tabular">0</div>
          <h2 className="text-[18px] sm:text-[20px] font-semibold text-ink mb-3">
            승인 대기 회원이 없습니다
          </h2>
          <p className="dim text-[13px] leading-[1.6] max-w-md mx-auto">
            모든 가입 신청이 처리되었습니다.<br />
            새 가입 신청이 들어오면 자동으로 이곳에 표시됩니다.
          </p>
          <div className="mt-8 flex gap-3 justify-center flex-wrap">
            <Link href="/admin/users"
              className="mono text-[11px] tracking-[0.12em] uppercase border border-ink text-ink px-5 py-2.5 hover:bg-ink hover:text-paper transition-colors">
              [ 전체 회원 보기 → ]
            </Link>
            <Link href="/admin/orders"
              className="mono text-[11px] tracking-[0.12em] uppercase border border-line text-dim px-5 py-2.5 hover:border-ink hover:text-ink transition-colors">
              [ 주문 관리 → ]
            </Link>
          </div>
        </div>

        {/* 오늘 / 이번 주 방문 업체 */}
        <VisitorSection stats={stats} />
      </div>
    );
  }

  // ─── N건 ─ 승인 대기 목록 ───────────────────────────────
  const PREVIEW_LIMIT = 6;
  const previewUsers = users.slice(0, PREVIEW_LIMIT);
  const remaining = users.length - PREVIEW_LIMIT;

  // 신규 거래처 후보 카운트
  const unregisteredCount = users.filter((u) => matchPartner(u.company) === null).length;

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10 max-w-[1400px] mx-auto space-y-6 sm:space-y-8">
      {/* 헤더 */}
      <div>
        <div className="mono text-[11px] dim tracking-[0.15em] uppercase mb-3">
          — 01 · DASHBOARD · 승인 대기
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="display text-[28px] sm:text-[40px] leading-tight sm:leading-none text-ink">
              <span className="text-edred">{users.length}명</span>{" "}
              <span className="italic text-edred">승인 대기</span>
            </h1>
            <p className="dim text-[13px] mt-3 leading-[1.6]">
              가입 신청한 회원을 검토하고 등급을 부여해주세요. 승인이 우선 작업입니다.
              {unregisteredCount > 0 && (
                <>
                  <br />
                  그중 <span className="text-edred font-semibold">{unregisteredCount}명</span>은 기존 거래처 리스트(81개사)에 없는 신규 후보입니다.
                </>
              )}
            </p>
          </div>
          <Link
            href="/admin/users"
            className="block w-full sm:w-auto text-center bg-edred text-paper hover:bg-edred2 px-6 py-3 mono text-[12px] tracking-[0.12em] uppercase font-semibold transition-colors"
          >
            [ 승인 처리 페이지 → ]
          </Link>
        </div>
      </div>

      {/* 미처리 견적 알림 (3일+) */}
      <StaleQuotesAlert count={stats.staleQuotes} />

      {/* KPI 4 패널 */}
      <KpiPanels stats={stats} pendingCount={users.length} />

      {/* 오늘 / 이번 주 방문 업체 */}
      <VisitorSection stats={stats} />

      {/* 미리보기 카드 */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {previewUsers.map((u) => {
          const m = matchPartner(u.company);
          return (
            <Link
              key={u.id}
              href="/admin/users"
              className="border hair bg-paper p-5 space-y-3 hover:border-edred/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-ink">{u.name}</span>
                <span className="mono text-[10px] tracking-[0.08em] uppercase border border-edred text-edred px-2 py-0.5">
                  대기
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-[14px] font-medium text-ink">{u.company}</div>
                {m ? (
                  <span
                    className="mono text-[9px] tracking-[0.08em] uppercase border border-ink/30 text-ink/70 bg-ink/5 px-1.5 py-0.5"
                    title={`기존 거래처 (${m.matchType === "partial" ? "부분매칭" : "정확매칭"})`}
                  >
                    기존 {m.type}
                  </span>
                ) : (
                  <span
                    className="mono text-[9px] tracking-[0.08em] uppercase border border-edred bg-edred/5 text-edred px-1.5 py-0.5 font-semibold"
                    title="기존 거래처 리스트(81개사)에 없음"
                  >
                    ✦ 신규 후보
                  </span>
                )}
              </div>
              <div className="space-y-0.5">
                <div className="mono text-[11px] dim">{u.email}</div>
                {u.phone && <div className="mono text-[11px] dim">{u.phone}</div>}
                {u.businessNo && (
                  <div className="mono text-[11px] dim">사업자 · {u.businessNo}</div>
                )}
              </div>
              <div className="flex items-center justify-between pt-2 border-t hair">
                <div className="mono text-[10px] dim tracking-[0.1em]">
                  가입 · {new Date(u.createdAt).toLocaleDateString("ko-KR")}
                </div>
                <div className="flex gap-1.5">
                  {u.cardImageUrl && (
                    <span className="mono text-[9px] tracking-[0.1em] uppercase border border-line text-dim px-1.5 py-0.5">
                      명함
                    </span>
                  )}
                  {u.businessFileUrl && (
                    <span className="mono text-[9px] tracking-[0.1em] uppercase border border-line text-dim px-1.5 py-0.5">
                      등록증
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 더 보기 */}
      {remaining > 0 && (
        <div className="text-center pt-2">
          <Link
            href="/admin/users"
            className="mono text-[11px] tracking-[0.12em] uppercase text-edred hover:underline"
          >
            … + {remaining}명 더 보기 →
          </Link>
        </div>
      )}
    </div>
  );
}
