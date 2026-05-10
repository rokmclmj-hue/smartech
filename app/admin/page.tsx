"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type DashboardData = {
  todayQuotes: number;
  monthOrders: number;
  monthRevenue: number;
  pendingUsers: number;
  recentOrders: {
    id: number;
    company: string;
    contactName: string | null;
    amount: number;
    status: string;
    createdAt: string;
  }[];
  lowStockProducts: {
    id: number;
    partNo: string;
    description: string;
    stock: number;
  }[];
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "대기",
  CONFIRMED: "확정",
  CANCELLED: "취소",
  DELIVERY_INQUIRY: "납기문의",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "border-ink/40 text-ink",
  CONFIRMED: "border-edred text-edred",
  CANCELLED: "border-line text-dim",
  DELIVERY_INQUIRY: "border-ink text-ink bg-ink text-paper",
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => {
        if (!r.ok) throw new Error("데이터를 불러오지 못했습니다");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="px-6 py-10 max-w-[1400px] mx-auto">
        <div className="border border-edred/30 bg-edred/5 px-5 py-4 text-edred text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="px-6 py-10 max-w-[1400px] mx-auto space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="kpi-panel p-5 animate-pulse h-[110px]"
            />
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    {
      eyebrow: "TODAY · 견적",
      value: data.todayQuotes.toLocaleString("ko-KR"),
      meta: "오늘 들어온 요청",
      urgent: false,
    },
    {
      eyebrow: "MTD · 주문확정",
      value: data.monthOrders.toLocaleString("ko-KR"),
      meta: "이번 달 누적",
      urgent: false,
    },
    {
      eyebrow: "MTD · 매출",
      value: "₩" + data.monthRevenue.toLocaleString("ko-KR"),
      meta: "이번 달 누적 (VAT 별도)",
      urgent: false,
    },
    {
      eyebrow: "PENDING · 회원",
      value: data.pendingUsers.toLocaleString("ko-KR"),
      meta: "승인 대기 중",
      urgent: data.pendingUsers > 0,
    },
  ];

  return (
    <div className="px-6 py-10 max-w-[1400px] mx-auto space-y-10">
      {/* 헤더 */}
      <div>
        <div className="mono text-[11px] dim tracking-[0.15em] uppercase mb-3">
          — 01 · DASHBOARD
        </div>
        <h1 className="display text-[40px] leading-none text-ink">
          관리자 <span className="italic text-edred">대시보드</span>
        </h1>
        <p className="dim text-[13px] mt-3">
          오늘의 운영 현황과 주요 지표
        </p>
      </div>

      {/* KPI 패널 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.eyebrow}
            className={`kpi-panel kpi-cell px-5 py-5 relative ${
              kpi.urgent ? "ring-1 ring-edred/40" : ""
            }`}
          >
            <div className="kpi-eyebrow mb-3">{kpi.eyebrow}</div>
            <div className="kpi-num text-[32px] leading-none">{kpi.value}</div>
            <div className="kpi-meta mt-3">{kpi.meta}</div>
            <span className="kpi-accent" />
          </div>
        ))}
      </div>

      {/* 하단 2단 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* 최근 주문 */}
        <section className="border hair bg-paper">
          <div className="flex items-baseline justify-between px-5 py-4 border-b hair">
            <div>
              <div className="mono text-[10px] dim tracking-[0.15em] uppercase mb-1">
                — Recent Orders
              </div>
              <h2 className="text-[15px] font-semibold tracking-tight text-ink">
                최근 주문
              </h2>
            </div>
            <Link
              href="/admin/orders"
              className="mono text-[10px] tracking-[0.12em] uppercase text-edred hover:underline"
            >
              View All →
            </Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <div className="px-5 py-12 text-center dim text-[13px]">
              주문이 없습니다
            </div>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b hair">
                  {["고객사", "금액", "상태", "날짜"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left mono text-[10px] dim tracking-[0.12em] uppercase font-normal"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b hair hover:bg-ink/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-ink truncate max-w-[140px]">
                      {o.company}
                    </td>
                    <td className="px-4 py-3 mono text-[12px] tabular text-ink">
                      {o.amount > 0 ? `₩${o.amount.toLocaleString("ko-KR")}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`mono text-[10px] tracking-[0.08em] uppercase border px-2 py-0.5 ${
                          STATUS_COLOR[o.status] ?? "border-line text-dim"
                        }`}
                      >
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 mono text-[11px] dim">
                      {new Date(o.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* 재고 부족 */}
        <section className="border hair bg-paper">
          <div className="flex items-baseline justify-between px-5 py-4 border-b hair">
            <div>
              <div className="mono text-[10px] dim tracking-[0.15em] uppercase mb-1">
                — Low Stock
              </div>
              <h2 className="text-[15px] font-semibold tracking-tight text-ink">
                재고 부족 제품
                {data.lowStockProducts.length > 0 && (
                  <span className="ml-2 mono text-[10px] text-edred tracking-[0.1em]">
                    {data.lowStockProducts.length}건
                  </span>
                )}
              </h2>
            </div>
            <Link
              href="/admin/products"
              className="mono text-[10px] tracking-[0.12em] uppercase text-edred hover:underline"
            >
              Manage →
            </Link>
          </div>
          {data.lowStockProducts.length === 0 ? (
            <div className="px-5 py-12 text-center dim text-[13px]">
              재고 부족 제품이 없습니다
            </div>
          ) : (
            <ul>
              {data.lowStockProducts.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 px-5 py-3 border-b hair last:border-b-0"
                >
                  <span className="text-edred shrink-0">→</span>
                  <div className="flex-1 min-w-0">
                    <div className="mono text-[11px] dim">{p.partNo}</div>
                    <div className="text-[13px] text-ink truncate">
                      {p.description}
                    </div>
                  </div>
                  <div
                    className={`mono text-[11px] tabular tracking-[0.1em] uppercase ${
                      p.stock === 0 ? "text-edred" : "text-ink"
                    }`}
                  >
                    {p.stock === 0 ? "품절" : `재고 ${p.stock}`}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
