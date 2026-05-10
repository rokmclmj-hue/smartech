"use client";

import { useEffect, useState, useCallback } from "react";

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

const TIER_OPTIONS = ["ENDUSER", "CONSUMER", "OEM", "DEALER", "KEY_DEALER"];

const TIER_LABELS: Record<string, string> = {
  PENDING: "승인대기",
  ENDUSER: "Enduser",
  CONSUMER: "일반소비자",
  OEM: "OEM",
  DEALER: "딜러",
  KEY_DEALER: "Key딜러",
  ADMIN: "관리자",
};

const TIER_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  ENDUSER: "bg-gray-100 text-gray-600",
  CONSUMER: "bg-gray-100 text-gray-600",
  OEM: "bg-green-100 text-green-700",
  DEALER: "bg-blue-100 text-blue-700",
  KEY_DEALER: "bg-purple-100 text-purple-700",
  ADMIN: "bg-red-100 text-red-700",
};

export default function AdminUsersPage() {
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const [pending, setPending] = useState<UserItem[]>([]);
  const [allUsers, setAllUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approveTarget, setApproveTarget] = useState<Record<number, string>>({});
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchPending = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/users?tier=PENDING")
      .then((r) => r.json())
      .then((data) => {
        setPending(data);
        setError(null);
      })
      .catch(() => setError("데이터를 불러오지 못했습니다"))
      .finally(() => setLoading(false));
  }, []);

  const fetchAll = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        setAllUsers(data);
        setError(null);
      })
      .catch(() => setError("데이터를 불러오지 못했습니다"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === "pending") fetchPending();
    else fetchAll();
  }, [tab, fetchPending, fetchAll]);

  async function approveUser(userId: number) {
    const tier = approveTarget[userId];
    if (!tier) {
      alert("등급을 선택해주세요");
      return;
    }
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tier }),
      });
      if (!res.ok) throw new Error("처리 실패");
      fetchPending();
    } catch (e) {
      alert(e instanceof Error ? e.message : "오류");
    } finally {
      setActionLoading(null);
    }
  }

  async function rejectUser(userId: number, name: string) {
    if (!confirm(`${name} 회원을 거절(계정 삭제)하시겠습니까?`)) return;
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "delete" }),
      });
      if (!res.ok) throw new Error("처리 실패");
      fetchPending();
    } catch (e) {
      alert(e instanceof Error ? e.message : "오류");
    } finally {
      setActionLoading(null);
    }
  }

  async function changeTier(userId: number, tier: string) {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tier }),
      });
      if (!res.ok) throw new Error("처리 실패");
      setAllUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, tier } : u)));
    } catch (e) {
      alert(e instanceof Error ? e.message : "오류");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">고객 관리</h1>

      {/* 탭 */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setTab("pending")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            tab === "pending"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          승인 대기
          {pending.length > 0 && (
            <span className="ml-1.5 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
              {pending.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("all")}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            tab === "all"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          전체 회원
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">불러오는 중...</div>
      ) : (
        <>
          {/* 승인 대기 탭 - 카드형 */}
          {tab === "pending" && (
            <>
              {pending.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-sm">
                  승인 대기 중인 회원이 없습니다
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pending.map((u) => (
                    <div
                      key={u.id}
                      className="bg-white border border-gray-200 rounded-xl p-5 space-y-4"
                    >
                      {/* 사용자 정보 */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{u.name}</span>
                          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                            승인대기
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 font-medium">{u.company}</div>
                        <div className="text-xs text-gray-400 mt-1">{u.email}</div>
                        {u.phone && <div className="text-xs text-gray-400">{u.phone}</div>}
                        {u.businessNo && (
                          <div className="text-xs text-gray-400">사업자: {u.businessNo}</div>
                        )}
                        <div className="text-xs text-gray-300 mt-1">
                          가입: {new Date(u.createdAt).toLocaleDateString("ko-KR")}
                        </div>
                      </div>

                      {/* 파일 버튼 */}
                      <div className="flex gap-2 flex-wrap">
                        {u.cardImageUrl && (
                          <a
                            href={u.cardImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            명함 보기
                          </a>
                        )}
                        {u.businessFileUrl && (
                          <a
                            href={u.businessFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            사업자등록증
                          </a>
                        )}
                      </div>

                      {/* 등급 선택 + 승인/거절 */}
                      <div className="space-y-2">
                        <select
                          value={approveTarget[u.id] ?? ""}
                          onChange={(e) =>
                            setApproveTarget((prev) => ({ ...prev, [u.id]: e.target.value }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">등급 선택</option>
                          {TIER_OPTIONS.map((t) => (
                            <option key={t} value={t}>
                              {TIER_LABELS[t]}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveUser(u.id)}
                            disabled={actionLoading === u.id || !approveTarget[u.id]}
                            className="flex-1 text-sm bg-blue-600 text-white py-1.5 rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                          >
                            {actionLoading === u.id ? "처리 중..." : "승인"}
                          </button>
                          <button
                            onClick={() => rejectUser(u.id, u.name)}
                            disabled={actionLoading === u.id}
                            className="flex-1 text-sm bg-red-50 text-red-600 border border-red-200 py-1.5 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors font-medium"
                          >
                            거절
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* 전체 회원 탭 - 테이블 */}
          {tab === "all" && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {["이름", "회사", "이메일", "등급", "가입일", "액션"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                          회원이 없습니다
                        </td>
                      </tr>
                    ) : (
                      allUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                          <td className="px-4 py-3 text-gray-600">{u.company}</td>
                          <td className="px-4 py-3 text-gray-400 text-xs">{u.email}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                TIER_COLOR[u.tier] ?? "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {TIER_LABELS[u.tier] ?? u.tier}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            {new Date(u.createdAt).toLocaleDateString("ko-KR")}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={u.tier}
                              onChange={(e) => changeTier(u.id, e.target.value)}
                              disabled={actionLoading === u.id || u.tier === "ADMIN"}
                              className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {["PENDING", ...TIER_OPTIONS, "ADMIN"].map((t) => (
                                <option key={t} value={t}>
                                  {TIER_LABELS[t] ?? t}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
