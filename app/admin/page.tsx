"use client";

import { useEffect, useRef, useState } from "react";
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
  phone: string | null;
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
  monthVisitors: VisitorItem[];
};

// ─── GA 방문자 분석 섹션 ─────────────────────────────────────
function GaSection() {
  const [open, setOpen] = useState(false);
  return (
    <div className="border hair bg-paper">
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="mono text-[10px] tracking-[0.15em] uppercase dim">
          GA · 방문자 분석
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://analytics.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mono text-[10px] tracking-[0.1em] dim hover:text-edred transition-colors"
          >
            GA4 열기 →
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            className="mono text-[10px] tracking-[0.1em] dim hover:text-edred transition-colors"
          >
            {open ? "닫기 ▲" : "열기 ▼"}
          </button>
        </div>
      </div>
      {open && (
        <div className="w-full overflow-hidden border-t hair">
          <iframe
            width="100%"
            height="450"
            src="https://datastudio.google.com/embed/reporting/6b12df3e-99c8-4d13-a85c-19b925484c44/page/z6W0F"
            frameBorder="0"
            style={{ border: 0 }}
            allowFullScreen
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      )}
    </div>
  );
}

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

// ─── 방문 업체 섹션 (탭 + 연락완료 체크) ─────────────────

const TIER_COLOR: Record<string, string> = {
  DEALER: "bg-blue-50 text-blue-700 border border-blue-200",
  KEY_DEALER: "bg-blue-50 text-blue-700 border border-blue-200",
  VIP_DEALER: "bg-blue-50 text-blue-700 border border-blue-200",
  OEM: "bg-purple-50 text-purple-700 border border-purple-200",
};

type VisitorTab = "today" | "week" | "month";

function VisitorSection({ stats }: { stats: DashboardStats }) {
  const [tab, setTab] = useState<VisitorTab>("today");
  // 연락완료: localStorage에 userId set으로 저장
  const [contacted, setContacted] = useState<Set<number>>(new Set());
  const storageKey = "visitor_contacted";

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
      setContacted(new Set(saved));
    } catch { /* ignore */ }
  }, []);

  function toggleContact(id: number) {
    setContacted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem(storageKey, JSON.stringify([...next]));
      return next;
    });
  }

  const TAB_LIST: { key: VisitorTab; label: string; visitors: VisitorItem[] }[] = [
    { key: "today", label: `오늘 ${stats.todayVisitors.length}`, visitors: stats.todayVisitors },
    { key: "week",  label: `이번 주 ${stats.weekVisitors.length}`, visitors: stats.weekVisitors },
    { key: "month", label: `이번 달 ${stats.monthVisitors.length}`, visitors: stats.monthVisitors },
  ];

  const current = TAB_LIST.find((t) => t.key === tab)!;
  const pending = current.visitors.filter((v) => !contacted.has(v.id));
  const done    = current.visitors.filter((v) => contacted.has(v.id));

  function formatTime(iso: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (tab === "today") return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="border hair bg-paper">
      {/* 헤더 + 탭 */}
      <div className="flex items-center justify-between px-5 pt-4 pb-0 border-b hair">
        <div className="mono text-[10px] tracking-[0.15em] uppercase dim pb-3">
          VISITORS · 방문 업체
        </div>
        <div className="flex text-[11px] mono">
          {TAB_LIST.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 border-b-2 transition-colors ${
                tab === t.key ? "border-edred text-edred font-semibold" : "border-transparent dim hover:text-ink"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 목록 */}
      <div className="divide-y hair max-h-[400px] overflow-auto">
        {current.visitors.length === 0 ? (
          <div className="py-10 text-center text-[13px] dim">방문 기록이 없습니다</div>
        ) : (
          <>
            {/* 미처리 */}
            {pending.map((v) => (
              <div key={v.id} className="flex items-center gap-3 px-5 py-3 hover:bg-ink/[0.02]">
                {/* 연락완료 체크 */}
                <button onClick={() => toggleContact(v.id)}
                  className="shrink-0 w-5 h-5 border-2 border-ink/30 rounded hover:border-edred transition-colors flex items-center justify-center">
                </button>
                {/* 업체 정보 */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-ink truncate">{v.company}</span>
                    <span className={`mono text-[9px] px-1.5 py-[1px] rounded shrink-0 ${TIER_COLOR[v.tier] ?? "bg-gray-100 text-gray-600"}`}>
                      {v.tierLabel}
                    </span>
                  </div>
                  <div className="text-[11px] dim">{v.name}{v.phone ? ` · ${v.phone}` : ""}</div>
                </div>
                {/* 시간 */}
                <div className="mono text-[11px] dim shrink-0">{formatTime(v.lastLoginAt)}</div>
                {/* 빠른 액션 */}
                <div className="flex gap-1.5 shrink-0">
                  {v.phone && (
                    <a href={`tel:${v.phone}`}
                      className="mono text-[10px] border hair rounded px-2 py-1 dim hover:text-edred hover:border-edred transition-colors">
                      전화
                    </a>
                  )}
                  <Link href={`/admin/proxy-quotes?company=${encodeURIComponent(v.company)}`}
                    className="mono text-[10px] border hair rounded px-2 py-1 dim hover:text-edred hover:border-edred transition-colors">
                    견적
                  </Link>
                </div>
              </div>
            ))}

            {/* 연락완료 */}
            {done.length > 0 && (
              <>
                <div className="px-5 py-2 bg-ink/[0.02]">
                  <span className="mono text-[10px] tracking-[0.1em] dim uppercase">✓ 연락완료 {done.length}건</span>
                </div>
                {done.map((v) => (
                  <div key={v.id} className="flex items-center gap-3 px-5 py-2.5 opacity-40">
                    <button onClick={() => toggleContact(v.id)}
                      className="shrink-0 w-5 h-5 border-2 border-edred rounded bg-edred/10 flex items-center justify-center text-edred text-[10px]">
                      ✓
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium text-ink line-through truncate">{v.company}</div>
                      <div className="text-[11px] dim">{v.name}</div>
                    </div>
                    <div className="mono text-[11px] dim shrink-0">{formatTime(v.lastLoginAt)}</div>
                  </div>
                ))}
              </>
            )}
          </>
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

        <div className="flex items-center justify-between px-4 py-2.5 border hair bg-paper mb-6">
          <div className="flex items-center gap-2">
            <span className="mono text-[10px] tracking-[0.12em] text-green-600">● ALL CLEAR</span>
            <span className="text-[13px] dim">승인 대기 회원 없음</span>
          </div>
          <Link href="/admin/users"
            className="mono text-[10px] tracking-[0.1em] uppercase dim hover:text-edred transition-colors">
            전체 회원 →
          </Link>
        </div>

        {/* 오늘 / 이번 주 방문 업체 */}
        <VisitorSection stats={stats} />

        {/* GA 방문자 분석 */}
        <GaSection />
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

      {/* GA 방문자 분석 */}
      <GaSection />
    </div>
  );
}
