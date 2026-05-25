"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function SetupPage() {
  const { update } = useSession();
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!company.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: company.trim(), phone: phone.trim() }),
      });
      await update({ company: company.trim() });
      window.location.href = "/";
    } finally {
      setSaving(false);
    }
  }

  async function handleSkip() {
    await fetch("/api/auth/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company: "미입력" }),
    });
    await update({ company: "미입력" });
    window.location.href = "/";
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="display text-[32px] tracking-[-0.045em] text-ink leading-none mb-1">
            Smartech<span style={{ color: "#c00020" }}>.</span>
          </div>
          <p className="text-[14px] text-gray-500 mt-3">마지막으로 회사 정보를 알려주세요.</p>
          <p className="text-[12px] text-gray-400 mt-1">견적서 발행 및 승인 알림에 사용됩니다.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="회사명 입력 (예: 삼성전자, 서울대학교)"
            autoFocus
            className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="휴대폰 번호 입력 (예: 010-1234-5678)"
            className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <p className="text-[11px] text-gray-400 px-1">
            ※ 관리자 승인 시 SMS 알림을 받을 번호입니다.
          </p>
          <button
            type="submit"
            disabled={saving || !company.trim()}
            className="w-full bg-gray-900 hover:bg-gray-700 disabled:opacity-40 text-white font-semibold py-3.5 rounded-xl transition-colors text-[15px]"
          >
            {saving ? "저장 중..." : "완료"}
          </button>
        </form>

        <button
          onClick={handleSkip}
          className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-4 transition-colors"
        >
          나중에 입력하기 →
        </button>
      </div>
    </div>
  );
}
