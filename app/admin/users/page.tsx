"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useToast } from "@/lib/toast";
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
  rejectedAt: string | null;
};

type ApiResponse = {
  items: UserItem[];
  total: number;
  page: number;
  limit: number;
};

const TIER_OPTIONS = ["ENDUSER", "OEM", "DEALER", "KEY_DEALER"] as const;
type TierOption = (typeof TIER_OPTIONS)[number];

const TIER_LABELS: Record<string, string> = {
  PENDING: "승인대기",
  REJECTED: "거절됨",
  ENDUSER: "Enduser",
  OEM: "OEM",
  DEALER: "딜러",
  KEY_DEALER: "Key딜러",
  ADMIN: "관리자",
};

const TIER_COLOR: Record<string, string> = {
  PENDING: "border-edred text-edred",
  REJECTED: "border-edred/40 text-edred/60",
  ENDUSER: "border-line text-dim",
  OEM: "border-ink/40 text-ink",
  DEALER: "border-ink text-ink",
  KEY_DEALER: "border-ink bg-ink text-paper",
  ADMIN: "border-edred bg-edred text-paper",
};

const HIGH_TIERS = new Set(["KEY_DEALER", "DEALER", "ADMIN"]);

function isDowngrade(from: string, to: string): boolean {
  const order = ["PENDING", "REJECTED", "ENDUSER", "OEM", "DEALER", "KEY_DEALER", "ADMIN"];
  return HIGH_TIERS.has(from) && order.indexOf(to) < order.indexOf(from);
}

const PAGE_LIMIT = 50;

type Tab = "pending" | "all" | "rejected";

export default function AdminUsersPage() {
  const { success, error: toastError, info, confirm } = useToast();

  const [tab, setTab] = useState<Tab>("pending");

  // pending tab
  const [pending, setPending] = useState<UserItem[]>([]);
  const [pendingTotal, setPendingTotal] = useState(0);

  // all tab
  const [allUsers, setAllUsers] = useState<UserItem[]>([]);
  const [allTotal, setAllTotal] = useState(0);
  const [allPage, setAllPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // rejected tab
  const [rejected, setRejected] = useState<UserItem[]>([]);
  const [rejectedTotal, setRejectedTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [approveTarget, setApproveTarget] = useState<Record<number, string>>({});
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // pending tab — select for re-approving rejected users
  const [rejectedApproveTarget, setRejectedApproveTarget] = useState<Record<number, string>>({});

  // all tab — pending select value before confirmation
  const [pendingTierChange, setPendingTierChange] = useState<Record<number, string>>({});

  // ── Fetch helpers ─────────────────────────────────────────────────────────

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users?tier=PENDING&limit=200");
      if (!res.ok) throw new Error("불러오기 실패");
      const data: ApiResponse = await res.json();
      setPending(data.items);
      setPendingTotal(data.total);
      setFetchError(null);
    } catch {
      setFetchError("데이터를 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAll = useCallback(async (page: number, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_LIMIT),
      });
      if (q) params.set("search", q);
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error("불러오기 실패");
      const data: ApiResponse = await res.json();
      setAllUsers(data.items);
      setAllTotal(data.total);
      setFetchError(null);
    } catch {
      setFetchError("데이터를 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRejected = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users?tier=REJECTED&limit=200");
      if (!res.ok) throw new Error("불러오기 실패");
      const data: ApiResponse = await res.json();
      setRejected(data.items);
      setRejectedTotal(data.total);
      setFetchError(null);
    } catch {
      setFetchError("데이터를 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (tab === "pending") fetchPending();
    else if (tab === "all") fetchAll(allPage, search);
    else fetchRejected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    if (tab === "all") fetchAll(allPage, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPage, search]);

  // debounce search input → search state
  function handleSearchInput(value: string) {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value);
      setAllPage(1);
    }, 300);
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async function approveUser(userId: number, userName: string) {
    const tier = approveTarget[userId];
    if (!tier) {
      info("등급을 선택해주세요");
      return;
    }
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tier }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error ?? "처리 실패");
      }
      success(`${userName}님을 ${TIER_LABELS[tier]} 등급으로 승인했습니다`);
      fetchPending();
    } catch (e) {
      toastError(e instanceof Error ? e.message : "오류가 발생했습니다");
    } finally {
      setActionLoading(null);
    }
  }

  async function rejectUser(userId: number, userName: string) {
    const ok = await confirm({
      message: `${userName}님을 거절하시겠습니까?`,
      detail: "회원 데이터는 보존되며 REJECTED 상태로 변경됩니다",
      confirmLabel: "거절",
      destructive: true,
    });
    if (!ok) return;
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "delete" }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error ?? "처리 실패");
      }
      success(`${userName}님을 거절(보관)했습니다`);
      fetchPending();
    } catch (e) {
      toastError(e instanceof Error ? e.message : "오류가 발생했습니다");
    } finally {
      setActionLoading(null);
    }
  }

  async function changeTier(user: UserItem, newTier: string) {
    const destructive = isDowngrade(user.tier, newTier);
    const ok = await confirm({
      message: `${user.name}의 등급을 ${TIER_LABELS[newTier] ?? newTier}로 변경하시겠습니까?`,
      confirmLabel: "변경",
      destructive,
    });
    if (!ok) {
      // reset pending select back to current tier
      setPendingTierChange((prev) => ({ ...prev, [user.id]: user.tier }));
      return;
    }
    setActionLoading(user.id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, tier: newTier }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error ?? "처리 실패");
      }
      success("등급이 변경되었습니다");
      // optimistic update
      setAllUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, tier: newTier } : u))
      );
      setPendingTierChange((prev) => ({ ...prev, [user.id]: newTier }));
    } catch (e) {
      toastError(e instanceof Error ? e.message : "오류가 발생했습니다");
      setPendingTierChange((prev) => ({ ...prev, [user.id]: user.tier }));
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteUser(user: UserItem) {
    const ok = await confirm({
      message: `${user.name}(${user.company}) 회원을 완전히 삭제하시겠습니까?`,
      detail: "삭제된 데이터는 복구할 수 없습니다. 견적·주문 기록이 있으면 삭제할 수 없습니다.",
      confirmLabel: "삭제",
      destructive: true,
    });
    if (!ok) return;
    setActionLoading(user.id);
    try {
      const res = await fetch(`/api/admin/users?userId=${user.id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error ?? "처리 실패");
      }
      success(`${user.name}님 계정이 삭제되었습니다`);
      fetchAll(allPage, search);
    } catch (e) {
      toastError(e instanceof Error ? e.message : "오류가 발생했습니다");
    } finally {
      setActionLoading(null);
    }
  }

  async function reApproveUser(userId: number, userName: string) {
    const tier = rejectedApproveTarget[userId];
    if (!tier) {
      info("등급을 선택해주세요");
      return;
    }
    const ok = await confirm({
      message: `${userName}님을 ${TIER_LABELS[tier]} 등급으로 재승인하시겠습니까?`,
      confirmLabel: "승인",
    });
    if (!ok) return;
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tier }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error ?? "처리 실패");
      }
      success(`${userName}님을 ${TIER_LABELS[tier]} 등급으로 승인했습니다`);
      fetchRejected();
    } catch (e) {
      toastError(e instanceof Error ? e.message : "오류가 발생했습니다");
    } finally {
      setActionLoading(null);
    }
  }

  // ── Pagination helpers ────────────────────────────────────────────────────

  const allTotalPages = Math.max(1, Math.ceil(allTotal / PAGE_LIMIT));

  // ── 거래처 매칭 — 승인 대기 중 신규(미등록 거래처) 후보 카운트 ──────────────
  const unregisteredCount = useMemo(
    () => pending.filter((u) => matchPartner(u.company) === null).length,
    [pending]
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10 max-w-[1400px] mx-auto space-y-6 sm:space-y-8">
      {/* 헤더 */}
      <div>
        <div className="mono text-[11px] dim tracking-[0.15em] uppercase mb-3">
          — 05 · CUSTOMERS
        </div>
        <h1 className="display text-[28px] sm:text-[40px] leading-tight sm:leading-none text-ink">
          고객 <span className="italic text-edred">관리</span>
        </h1>
      </div>

      {/* 탭 (chip) */}
      <div className="flex gap-2 items-center flex-wrap">
        <button
          onClick={() => setTab("pending")}
          className={`chip ${tab === "pending" ? "active" : ""}`}
        >
          승인 대기
          {pendingTotal > 0 && (
            <span className="ml-1.5 mono text-[9px] tracking-[0.1em] text-edred">
              {pendingTotal}
            </span>
          )}
        </button>
        {unregisteredCount > 0 && (
          <span
            className="mono text-[10px] tracking-[0.12em] uppercase border border-edred bg-edred/5 text-edred px-2.5 py-1"
            title="기존 거래처 분류 리스트(81개사)에 없는 신규 회사명으로 가입한 사용자 수"
          >
            ✦ 신규 거래처 후보 {unregisteredCount}건
          </span>
        )}
        <button
          onClick={() => setTab("all")}
          className={`chip ${tab === "all" ? "active" : ""}`}
        >
          전체 회원
          {tab === "all" && allTotal > 0 && (
            <span className="ml-1.5 mono text-[9px] tracking-[0.1em] dim">
              {allTotal}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("rejected")}
          className={`chip ${tab === "rejected" ? "active" : ""}`}
        >
          거절됨
          {rejectedTotal > 0 && (
            <span className="ml-1.5 mono text-[9px] tracking-[0.1em] text-edred/70">
              {rejectedTotal}
            </span>
          )}
        </button>
      </div>

      {/* 검색 (전체 회원 탭) */}
      {tab === "all" && (
        <div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="회사·담당자·이메일·사업자번호 검색"
            className="w-full sm:max-w-sm border hair bg-paper px-4 py-2 text-[13px] focus:outline-none focus:border-ink placeholder:text-dim"
          />
        </div>
      )}

      {fetchError && (
        <div className="border border-edred/30 bg-edred/5 px-5 py-4 text-edred text-sm">
          {fetchError}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 mono text-[11px] dim tracking-[0.12em] uppercase">
          — Loading
        </div>
      ) : (
        <>
          {/* ── 승인 대기 — 카드형 ── */}
          {tab === "pending" && (
            <>
              {pending.length === 0 ? (
                <div className="text-center py-20 dim text-[13px]">
                  승인 대기 중인 회원이 없습니다
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pending.map((u) => (
                    <div
                      key={u.id}
                      className="border hair bg-paper p-5 space-y-4 hover:border-edred/40 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-ink">{u.name}</span>
                          <span className="mono text-[10px] tracking-[0.08em] uppercase border border-edred text-edred px-2 py-0.5">
                            대기
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-[14px] text-ink font-medium">{u.company}</div>
                          {(() => {
                            const m = matchPartner(u.company);
                            if (m) {
                              return (
                                <span
                                  className="mono text-[9px] tracking-[0.08em] uppercase border border-ink/30 text-ink/70 bg-ink/5 px-1.5 py-0.5"
                                  title={`기존 거래처(${TIER_LABELS[m.type]})${
                                    m.matchType === "partial" ? " · 부분매칭" : ""
                                  }`}
                                >
                                  기존 {TIER_LABELS[m.type]}
                                </span>
                              );
                            }
                            return (
                              <span
                                className="mono text-[9px] tracking-[0.08em] uppercase border border-edred bg-edred/5 text-edred px-1.5 py-0.5 font-semibold"
                                title="기존 거래처 분류 리스트(81개사)에 없는 신규 회사"
                              >
                                ✦ 신규 후보
                              </span>
                            );
                          })()}
                        </div>
                        <div className="mono text-[11px] dim mt-1">{u.email}</div>
                        {u.phone && (
                          <div className="mono text-[11px] dim">{u.phone}</div>
                        )}
                        {u.businessNo && (
                          <div className="mono text-[11px] dim">사업자: {u.businessNo}</div>
                        )}
                        <div className="mono text-[10px] dim tracking-[0.1em] mt-2">
                          가입 · {new Date(u.createdAt).toLocaleDateString("ko-KR")}
                        </div>
                      </div>

                      {/* 파일 링크 */}
                      <div className="flex gap-2 flex-wrap">
                        {u.cardImageUrl && (
                          <a
                            href={u.cardImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mono text-[10px] tracking-[0.1em] uppercase border border-line text-dim px-2.5 py-1 hover:border-ink hover:text-ink transition-colors"
                          >
                            명함
                          </a>
                        )}
                        {u.businessFileUrl && (
                          <a
                            href={u.businessFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mono text-[10px] tracking-[0.1em] uppercase border border-line text-dim px-2.5 py-1 hover:border-ink hover:text-ink transition-colors"
                          >
                            사업자등록증
                          </a>
                        )}
                      </div>

                      {/* 등급 + 승인/거절 */}
                      <div className="space-y-2 pt-2 border-t hair">
                        <select
                          value={approveTarget[u.id] ?? ""}
                          onChange={(e) =>
                            setApproveTarget((prev) => ({
                              ...prev,
                              [u.id]: e.target.value,
                            }))
                          }
                          className="w-full border hair bg-paper px-3 py-1.5 text-[13px] focus:outline-none focus:border-ink"
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
                            onClick={() => approveUser(u.id, u.name)}
                            disabled={actionLoading === u.id || !approveTarget[u.id]}
                            className="flex-1 mono text-[11px] tracking-[0.1em] uppercase bg-edred text-paper py-1.5 hover:bg-edred2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            {actionLoading === u.id ? "..." : "승인"}
                          </button>
                          <button
                            onClick={() => rejectUser(u.id, u.name)}
                            disabled={actionLoading === u.id}
                            className="flex-1 mono text-[11px] tracking-[0.1em] uppercase border border-line text-dim py-1.5 hover:border-ink hover:text-ink disabled:opacity-40 transition-colors"
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

          {/* ── 전체 회원 — 데스크톱: 테이블 / 모바일: 카드 ── */}
          {tab === "all" && (
            <div className="space-y-4">
              {/* 모바일 카드 리스트 */}
              <div className="md:hidden space-y-3">
                {allUsers.length === 0 ? (
                  <div className="border hair bg-paper px-4 py-12 text-center dim text-[13px]">
                    회원이 없습니다
                  </div>
                ) : (
                  allUsers.map((u) => {
                    const selectVal = pendingTierChange[u.id] ?? u.tier;
                    return (
                      <div
                        key={u.id}
                        className="border hair bg-paper p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-semibold text-ink truncate">{u.name}</div>
                            <div className="text-[13px] dim truncate">{u.company}</div>
                            <div className="mono text-[11px] dim truncate mt-0.5">{u.email}</div>
                          </div>
                          <span
                            className={`shrink-0 mono text-[10px] tracking-[0.08em] uppercase border px-2 py-0.5 ${
                              TIER_COLOR[u.tier] ?? "border-line text-dim"
                            }`}
                          >
                            {TIER_LABELS[u.tier] ?? u.tier}
                          </span>
                        </div>
                        <div className="mono text-[10px] dim tracking-[0.1em]">
                          가입 · {new Date(u.createdAt).toLocaleDateString("ko-KR")}
                        </div>
                        <div className="flex gap-2 pt-2 border-t hair">
                          <select
                            value={selectVal}
                            onChange={(e) =>
                              setPendingTierChange((prev) => ({
                                ...prev,
                                [u.id]: e.target.value,
                              }))
                            }
                            disabled={actionLoading === u.id || u.tier === "ADMIN"}
                            className="flex-1 min-w-0 border hair bg-paper px-2 py-2 text-[13px] focus:outline-none focus:border-ink disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {["PENDING", ...TIER_OPTIONS, "ADMIN"].map((t) => (
                              <option key={t} value={t}>
                                {TIER_LABELS[t] ?? t}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => changeTier(u, selectVal)}
                            disabled={
                              actionLoading === u.id ||
                              u.tier === "ADMIN" ||
                              selectVal === u.tier
                            }
                            className="shrink-0 mono text-[11px] tracking-[0.1em] uppercase border border-line text-dim px-4 py-2 hover:border-ink hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            {actionLoading === u.id ? "..." : "적용"}
                          </button>
                          <button
                            onClick={() => deleteUser(u)}
                            disabled={actionLoading === u.id || u.tier === "ADMIN"}
                            className="shrink-0 mono text-[11px] tracking-[0.1em] uppercase border border-edred/40 text-edred/60 px-3 py-2 hover:border-edred hover:text-edred disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* 데스크톱 테이블 */}
              <div className="hidden md:block border hair bg-paper overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px] min-w-[760px]">
                    <thead>
                      <tr className="border-b hair">
                        {["이름", "회사", "이메일", "현재 등급", "가입일", "등급 변경"].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left mono text-[10px] dim tracking-[0.12em] uppercase font-normal"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-16 text-center dim text-[13px]">
                            회원이 없습니다
                          </td>
                        </tr>
                      ) : (
                        allUsers.map((u) => {
                          const selectVal = pendingTierChange[u.id] ?? u.tier;
                          return (
                            <tr
                              key={u.id}
                              className="border-b hair last:border-b-0 hover:bg-ink/[0.02] transition-colors"
                            >
                              <td className="px-4 py-3 text-ink">{u.name}</td>
                              <td className="px-4 py-3 dim">{u.company}</td>
                              <td className="px-4 py-3 mono text-[11px] dim">{u.email}</td>
                              <td className="px-4 py-3">
                                <span
                                  className={`mono text-[10px] tracking-[0.08em] uppercase border px-2 py-0.5 ${
                                    TIER_COLOR[u.tier] ?? "border-line text-dim"
                                  }`}
                                >
                                  {TIER_LABELS[u.tier] ?? u.tier}
                                </span>
                              </td>
                              <td className="px-4 py-3 mono text-[11px] dim">
                                {new Date(u.createdAt).toLocaleDateString("ko-KR")}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <select
                                    value={selectVal}
                                    onChange={(e) =>
                                      setPendingTierChange((prev) => ({
                                        ...prev,
                                        [u.id]: e.target.value,
                                      }))
                                    }
                                    disabled={actionLoading === u.id || u.tier === "ADMIN"}
                                    className="border hair bg-paper px-2 py-1 text-[12px] focus:outline-none focus:border-ink disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    {["PENDING", ...TIER_OPTIONS, "ADMIN"].map((t) => (
                                      <option key={t} value={t}>
                                        {TIER_LABELS[t] ?? t}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => changeTier(u, selectVal)}
                                    disabled={
                                      actionLoading === u.id ||
                                      u.tier === "ADMIN" ||
                                      selectVal === u.tier
                                    }
                                    className="mono text-[10px] tracking-[0.1em] uppercase border border-line text-dim px-2.5 py-1 hover:border-ink hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                  >
                                    {actionLoading === u.id ? "..." : "적용"}
                                  </button>
                                  <button
                                    onClick={() => deleteUser(u)}
                                    disabled={actionLoading === u.id || u.tier === "ADMIN"}
                                    className="mono text-[10px] tracking-[0.1em] uppercase border border-edred/40 text-edred/60 px-2.5 py-1 hover:border-edred hover:text-edred disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                  >
                                    삭제
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 페이지네이션 */}
              {allTotalPages > 1 && (
                <div className="flex items-center gap-3 justify-center sm:justify-end">
                  <button
                    onClick={() => setAllPage((p) => Math.max(1, p - 1))}
                    disabled={allPage <= 1}
                    className="mono text-[10px] tracking-[0.1em] uppercase border hair text-dim px-3 py-1.5 hover:border-ink hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Prev
                  </button>
                  <span className="mono text-[11px] dim">
                    {allPage} / {allTotalPages}
                  </span>
                  <button
                    onClick={() => setAllPage((p) => Math.min(allTotalPages, p + 1))}
                    disabled={allPage >= allTotalPages}
                    className="mono text-[10px] tracking-[0.1em] uppercase border hair text-dim px-3 py-1.5 hover:border-ink hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── 거절됨 — 카드형 ── */}
          {tab === "rejected" && (
            <>
              {rejected.length === 0 ? (
                <div className="text-center py-20 dim text-[13px]">
                  거절된 회원이 없습니다
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rejected.map((u) => (
                    <div
                      key={u.id}
                      className="border hair bg-paper p-5 space-y-4 opacity-75 hover:opacity-100 transition-opacity"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-ink">{u.name}</span>
                          <span className="mono text-[10px] tracking-[0.08em] uppercase border border-edred/40 text-edred/60 px-2 py-0.5">
                            거절
                          </span>
                        </div>
                        <div className="text-[14px] text-ink font-medium">{u.company}</div>
                        <div className="mono text-[11px] dim mt-1">{u.email}</div>
                        {u.phone && (
                          <div className="mono text-[11px] dim">{u.phone}</div>
                        )}
                        {u.businessNo && (
                          <div className="mono text-[11px] dim">사업자: {u.businessNo}</div>
                        )}
                        <div className="mono text-[10px] dim tracking-[0.1em] mt-2">
                          가입 · {new Date(u.createdAt).toLocaleDateString("ko-KR")}
                        </div>
                        {u.rejectedAt && (
                          <div className="mono text-[10px] text-edred/60 tracking-[0.1em]">
                            거절 · {new Date(u.rejectedAt).toLocaleDateString("ko-KR")}
                          </div>
                        )}
                      </div>

                      {/* 재승인 */}
                      <div className="space-y-2 pt-2 border-t hair">
                        <select
                          value={rejectedApproveTarget[u.id] ?? ""}
                          onChange={(e) =>
                            setRejectedApproveTarget((prev) => ({
                              ...prev,
                              [u.id]: e.target.value,
                            }))
                          }
                          className="w-full border hair bg-paper px-3 py-1.5 text-[13px] focus:outline-none focus:border-ink"
                        >
                          <option value="">등급 선택 (재승인)</option>
                          {TIER_OPTIONS.map((t) => (
                            <option key={t} value={t}>
                              {TIER_LABELS[t]}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => reApproveUser(u.id, u.name)}
                          disabled={actionLoading === u.id || !rejectedApproveTarget[u.id]}
                          className="w-full mono text-[11px] tracking-[0.1em] uppercase border border-line text-dim py-1.5 hover:border-ink hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          {actionLoading === u.id ? "..." : "재승인"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
