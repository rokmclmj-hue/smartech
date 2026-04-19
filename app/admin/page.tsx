"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type User = { id: number; email: string; name: string; company: string; tier: string; createdAt: string };
type PriceRule = { tier: string; multiplier: number };
type Quote = { id: number; userId: number; status: string; createdAt: string; user: { name: string; company: string }; items: any[] };

const TIER_OPTIONS = ["PENDING", "CONSUMER", "OEM", "DEALER", "ADMIN"];
const TIER_LABELS: Record<string, string> = { PENDING: "승인대기", CONSUMER: "최종소비자", OEM: "OEM", DEALER: "딜러", ADMIN: "관리자" };

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<"users" | "prices" | "quotes">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [rules, setRules] = useState<PriceRule[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);

  const tier = (session?.user as any)?.tier;

  useEffect(() => {
    if (status === "loading") return;
    if (tier !== "ADMIN") router.push("/");
  }, [tier, status, router]);

  useEffect(() => {
    if (tier !== "ADMIN") return;
    fetch("/api/admin/users").then((r) => r.json()).then(setUsers);
    fetch("/api/admin/price-rules").then((r) => r.json()).then(setRules);
    fetch("/api/quote").then((r) => r.json()).then(setQuotes);
  }, [tier]);

  async function changeTier(userId: number, newTier: string) {
    await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, tier: newTier }) });
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, tier: newTier } : u));
  }

  async function updateMultiplier(ruleTier: string, multiplier: number) {
    await fetch("/api/admin/price-rules", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tier: ruleTier, multiplier }) });
    setRules((prev) => prev.map((r) => r.tier === ruleTier ? { ...r, multiplier } : r));
  }

  if (tier !== "ADMIN") return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">관리자 대시보드</h1>

      <div className="flex gap-3 mb-8 border-b">
        {(["users", "prices", "quotes"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
            {t === "users" ? `회원 관리 (${users.length})` : t === "prices" ? "가격 배율" : `견적 목록 (${quotes.length})`}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["회사명", "담당자", "이메일", "현재 등급", "등급 변경", "가입일"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.company}</td>
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      u.tier === "PENDING" ? "bg-amber-100 text-amber-700" :
                      u.tier === "DEALER" ? "bg-green-100 text-green-700" :
                      u.tier === "OEM" ? "bg-purple-100 text-purple-700" :
                      u.tier === "ADMIN" ? "bg-red-100 text-red-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>{TIER_LABELS[u.tier]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.tier}
                      onChange={(e) => changeTier(u.id, e.target.value)}
                      className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {TIER_OPTIONS.map((t) => <option key={t} value={t}>{TIER_LABELS[t]}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString("ko-KR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "prices" && (
        <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
          {rules.map((r) => (
            <div key={r.tier} className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="font-semibold text-sm text-slate-700 mb-3">{TIER_LABELS[r.tier]}</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={r.multiplier}
                  onChange={(e) => setRules((prev) => prev.map((x) => x.tier === r.tier ? { ...x, multiplier: parseFloat(e.target.value) || 1 } : x))}
                  className="w-24 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500">배 (원가 ×)</span>
                <button onClick={() => updateMultiplier(r.tier, r.multiplier)}
                  className="ml-auto text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-500 transition-colors">
                  저장
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "quotes" && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["견적번호", "회사", "담당자", "품목수", "상태", "접수일"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {quotes.map((q: any) => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-blue-600">#{q.id}</td>
                  <td className="px-4 py-3 font-medium">{q.user?.company}</td>
                  <td className="px-4 py-3">{q.user?.name}</td>
                  <td className="px-4 py-3">{q.items?.length}개</td>
                  <td className="px-4 py-3"><span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{q.status}</span></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(q.createdAt).toLocaleDateString("ko-KR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
