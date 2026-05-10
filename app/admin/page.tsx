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
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  DELIVERY_INQUIRY: "bg-blue-100 text-blue-700",
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
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          오류: {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: "오늘 견적 요청",
      value: data.todayQuotes,
      unit: "건",
      icon: "📝",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "이번 달 주문 확정",
      value: data.monthOrders,
      unit: "건",
      icon: "🛒",
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "이번 달 매출",
      value: data.monthRevenue.toLocaleString("ko-KR"),
      unit: "원",
      icon: "💰",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "승인 대기 회원",
      value: data.pendingUsers,
      unit: "명",
      icon: "👥",
      color: "text-amber-600",
      bg: "bg-amber-50",
      urgent: data.pendingUsers > 0,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`bg-white rounded-xl border ${kpi.urgent ? "border-amber-300 ring-1 ring-amber-300" : "border-gray-200"} p-5`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{kpi.label}</span>
              <span className={`text-xl ${kpi.bg} rounded-lg p-1.5`}>{kpi.icon}</span>
            </div>
            <div className={`text-2xl font-bold ${kpi.color}`}>
              {kpi.value}
              <span className="text-sm font-normal text-gray-400 ml-1">{kpi.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 최근 주문 5건 */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">최근 주문</h2>
            <Link href="/admin/orders" className="text-xs text-blue-600 hover:underline">
              전체 보기
            </Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <div className="px-5 py-8 text-center text-gray-400 text-sm">주문이 없습니다</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["고객사", "금액", "상태", "날짜"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800 truncate max-w-[120px]">
                      {o.company}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-mono text-xs">
                      {o.amount > 0 ? `₩${o.amount.toLocaleString("ko-KR")}` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[o.status] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(o.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 재고 부족 경고 */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">
              재고 부족 제품
              {data.lowStockProducts.length > 0 && (
                <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-semibold">
                  {data.lowStockProducts.length}
                </span>
              )}
            </h2>
            <Link href="/admin/products" className="text-xs text-blue-600 hover:underline">
              재고 관리
            </Link>
          </div>
          {data.lowStockProducts.length === 0 ? (
            <div className="px-5 py-8 text-center text-gray-400 text-sm">
              재고 부족 제품이 없습니다
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-xs text-gray-500">{p.partNo}</div>
                    <div className="text-sm text-gray-800 truncate">{p.description}</div>
                  </div>
                  <div
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      p.stock === 0
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {p.stock === 0 ? "품절" : `재고 ${p.stock}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
