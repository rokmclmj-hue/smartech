"use client";

import { useEffect, useState } from "react";
import { SMARTECH_COMPANY } from "@/lib/company";
import MarginSettings from "@/components/MarginSettings";

function formatPhone(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function QuickSmsSection() {
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<"ok" | "error" | null>(null);
  const [message, setMessage] = useState("");
  const baseUrl = typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : "";
  const quoteLink = `${baseUrl}/products`;

  async function handleSend() {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) { setMessage("전화번호를 정확히 입력해주세요"); setResult("error"); return; }
    setSending(true); setResult(null); setMessage("");
    try {
      const res = await fetch("/api/admin/quick-sms", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: digits }),
      });
      if (res.ok) {
        setResult("ok"); setMessage(`${phone} 으로 링크를 발송했습니다.`); setPhone("");
      } else {
        const data = (await res.json()) as { error?: string };
        setResult("error"); setMessage(data.error ?? "발송에 실패했습니다.");
      }
    } catch { setResult("error"); setMessage("서버 오류가 발생했습니다."); }
    finally { setSending(false); }
  }

  return (
    <div className="px-5 py-5 space-y-4">
      <p className="text-[13px] text-dim leading-[1.6]">
        고객 전화번호를 입력하면 로그인 링크를 문자로 발송합니다. (60분 유효)
      </p>
      <div className="flex gap-2 max-w-md">
        <input
          type="tel" inputMode="numeric" value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="010-0000-0000"
          className="flex-1 border hair px-3 py-2 text-[14px] mono tracking-widest focus:outline-none focus:border-ink"
        />
        <button
          onClick={handleSend}
          disabled={sending || phone.replace(/\D/g, "").length < 10}
          className="bg-edred text-paper px-4 py-2 text-[13px] font-semibold hover:bg-edred/90 transition-colors disabled:opacity-40"
        >
          {sending ? "발송 중..." : "문자 보내기"}
        </button>
      </div>
      {result && (
        <div className={`px-4 py-2.5 text-[13px] max-w-md ${result === "ok" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
          {result === "ok" ? "✓ " : "✗ "}{message}
        </div>
      )}
      <div className="border-t hair pt-4 max-w-md">
        <div className="mono text-[10px] dim tracking-[0.1em] uppercase mb-2">링크 직접 복사</div>
        <div className="flex gap-2">
          <div className="flex-1 bg-ink/[0.03] border hair px-3 py-2 text-[11px] mono dim truncate">{quoteLink}</div>
          <button onClick={() => navigator.clipboard.writeText(quoteLink)} className="border hair px-3 py-2 text-[11px] mono hover:bg-ink/5 transition-colors shrink-0">복사</button>
        </div>
      </div>
    </div>
  );
}

// ─── 표시용 그룹 정의 ────────────────────────────────────────
type Row = { label: string; value: string; mono?: boolean; highlight?: boolean };
type Section = { title: string; rows: Row[] };

const C = SMARTECH_COMPANY;

const SECTIONS: Section[] = [
  {
    title: "기본 정보",
    rows: [
      { label: "한글 회사명", value: C.name },
      { label: "법인명", value: C.legalName },
      { label: "영문 회사명 (단축)", value: C.english },
      { label: "영문 회사명 (정식)", value: C.englishLong },
      { label: "슬로건", value: C.slogan },
      { label: "역할 (영문)", value: C.role },
      { label: "역할 (한글)", value: C.roleKo },
      { label: "설립연도", value: String(C.since) },
    ],
  },
  {
    title: "등록 정보 (사업자등록증)",
    rows: [
      { label: "사업자등록번호", value: C.bizNo, mono: true, highlight: true },
      { label: "법인등록번호", value: C.corpNo, mono: true },
      { label: "대표자", value: C.ceo },
      { label: "개업연월일", value: C.establishedDate, mono: true },
      { label: "업태", value: C.businessType },
      { label: "종목", value: C.businessItem },
    ],
  },
  {
    title: "연락처",
    rows: [
      { label: "Office TEL", value: C.officeTel, mono: true },
      { label: "Mobile (대표)", value: C.mobileTel, mono: true },
      { label: "FAX", value: C.fax, mono: true },
      { label: "E-mail", value: C.email, mono: true },
      { label: "24시간 핫라인", value: C.hotline24h ? "운영" : "미운영" },
    ],
  },
  {
    title: "영업 본사 (수원)",
    rows: [
      { label: "주소 (한글)", value: C.headOfficeKo },
      { label: "주소 (영문)", value: C.headOfficeEn, mono: true },
      { label: "단축 표기", value: C.headOfficeShort, mono: true },
    ],
  },
  {
    title: "등록 본점 / 천안 A/S 센터",
    rows: [
      { label: "주소 (한글)", value: C.cheonanCenterKo },
      { label: "주소 (영문)", value: C.cheonanCenterEn, mono: true },
      { label: "단축 표기", value: C.cheonanCenterShort, mono: true },
      { label: "사업자등록상 본점", value: C.registeredAddressKo },
    ],
  },
  {
    title: "웹",
    rows: [
      { label: "공식 웹사이트", value: C.website, mono: true },
    ],
  },
];

// ─── 편집 가능한 연락처 설정 ─────────────────────────────────
const EDITABLE_FIELDS = [
  { key: "contact_phone",   label: "대표전화",    placeholder: "031-000-0000" },
  { key: "contact_mobile",  label: "대표 휴대폰", placeholder: "010-0000-0000" },
  { key: "contact_fax",     label: "팩스",        placeholder: "031-000-0000" },
  { key: "contact_email",   label: "이메일",       placeholder: "info@example.com" },
  { key: "contact_website", label: "웹사이트",     placeholder: "https://www.smartech.co.kr" },
  { key: "notice_text",     label: "공지 문구",    placeholder: "홈페이지에 표시할 공지 사항" },
];

function ContactSettings() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings-edit")
      .then((r) => r.json())
      .then((data) => {
        setValues(data);
        setSaved(data);
        setLoaded(true);
      });
  }, []);

  const isDirty = JSON.stringify(values) !== JSON.stringify(saved);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        setSaved({ ...values });
        setToast({ msg: "저장되었습니다", ok: true });
      } else {
        setToast({ msg: "저장 실패", ok: false });
      }
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  if (!loaded) {
    return (
      <div className="mono text-[11px] dim tracking-[0.12em] uppercase py-8 text-center">
        — Loading
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="divide-y hair">
        {EDITABLE_FIELDS.map((f) => (
          <div key={f.key} className="px-5 py-3 grid grid-cols-[140px_1fr] gap-4 items-center">
            <div className="mono text-[11px] dim tracking-[0.06em] uppercase">{f.label}</div>
            <input
              value={values[f.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className="text-[13px] mono border hair px-3 py-1.5 bg-transparent focus:outline-none focus:border-ink w-full max-w-md"
            />
          </div>
        ))}
      </div>
      <div className="px-5 py-4 border-t hair flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="mono text-[10px] tracking-[0.1em] uppercase bg-edred text-white px-5 py-2.5 hover:brightness-110 transition-all disabled:opacity-40"
        >
          {saving ? "저장 중..." : "저장"}
        </button>
        {isDirty && (
          <span className="mono text-[10px] text-yellow-600 tracking-[0.06em]">저장되지 않은 변경사항이 있습니다</span>
        )}
        {toast && (
          <span className={`mono text-[10px] tracking-[0.06em] ${toast.ok ? "text-green-600" : "text-red-600"}`}>
            {toast.msg}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── 메인 ────────────────────────────────────────────────────
export default function AdminSettingsPage() {
  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10 max-w-[1400px] mx-auto space-y-6 sm:space-y-8">
      {/* 헤더 */}
      <div>
        <div className="mono text-[11px] dim tracking-[0.15em] uppercase mb-3">
          — 09 · SETTINGS
        </div>
        <h1 className="display text-[28px] sm:text-[40px] leading-none text-ink">
          회사 <span className="italic text-edred">설정</span>
        </h1>
        <p className="mt-4 text-[14px] dim leading-[1.6] max-w-2xl">
          견적서·거래명세표·메일 등 모든 문서에 표시되는 회사 정보입니다.
          모든 발행 문서가 이 데이터를 참조하므로, 변경 시 모든 곳에 자동 반영됩니다.
        </p>
      </div>

      {/* 안내 박스 */}
      <div className="border hair bg-ink/[0.02] px-5 py-4 flex items-start gap-3">
        <span className="mono text-[10px] tracking-[0.12em] uppercase border hair text-dim px-2 py-0.5 mt-0.5">
          INFO
        </span>
        <div className="flex-1 text-[13px] leading-[1.6] text-ink">
          <p>
            아래 <span className="font-semibold">기본 정보·등록 정보</span>는 소스 파일(<span className="mono text-[12px] text-edred">lib/company.ts</span>)에서 관리됩니다.
            연락처·공지 문구 등 <span className="font-semibold">자주 바뀌는 항목</span>은 아래 "연락처 설정"에서 직접 수정·저장할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 섹션 카드들 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {SECTIONS.map((section) => (
          <div
            key={section.title}
            className="border hair bg-paper"
          >
            <div className="px-5 py-3 border-b hair flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-ink tracking-tight">
                {section.title}
              </h2>
              <span className="mono text-[10px] dim tracking-[0.12em] uppercase">
                {section.rows.length} 항목
              </span>
            </div>
            <div className="divide-y hair">
              {section.rows.map((row) => (
                <div
                  key={row.label}
                  className="px-5 py-3 grid grid-cols-[140px_1fr] gap-4 items-start"
                >
                  <div className="mono text-[11px] dim tracking-[0.06em] uppercase pt-0.5">
                    {row.label}
                  </div>
                  <div
                    className={`text-[13px] break-all ${
                      row.mono ? "mono" : ""
                    } ${
                      row.highlight ? "text-edred font-semibold" : "text-ink"
                    } ${
                      !row.value ? "dim italic" : ""
                    }`}
                  >
                    {row.value || "(미입력)"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 편집 가능한 연락처 설정 */}
      <div className="border hair bg-paper">
        <div className="px-5 py-3 border-b hair flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-ink tracking-tight">연락처 설정 (편집 가능)</h2>
          <span className="mono text-[10px] text-edred tracking-[0.12em] uppercase">DB 저장</span>
        </div>
        <ContactSettings />
      </div>

      {/* 마진율 설정 */}
      <div className="border hair bg-paper">
        <div className="px-5 py-3 border-b hair flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-ink tracking-tight">등급별 마진율 설정</h2>
          <span className="mono text-[10px] text-edred tracking-[0.12em] uppercase">관리자 전용</span>
        </div>
        <div className="px-5 py-5">
          <MarginSettings />
        </div>
      </div>

      {/* 빠른 링크 발송 */}
      <div className="border hair bg-paper">
        <div className="px-5 py-3 border-b hair flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-ink tracking-tight">빠른 링크 발송 (SMS)</h2>
          <span className="mono text-[10px] dim tracking-[0.12em] uppercase">SOLAPI</span>
        </div>
        <QuickSmsSection />
      </div>

      {/* 사용처 안내 */}
      <div className="border hair bg-ink/[0.02] px-6 py-5">
        <h3 className="mono text-[11px] dim tracking-[0.12em] uppercase mb-3">
          — 이 정보가 표시되는 곳
        </h3>
        <ul className="space-y-2 text-[13px] text-ink">
          <li className="flex items-start gap-2">
            <span className="text-edred shrink-0">→</span>
            <span>
              <span className="font-medium">사용자 견적서 화면</span>{" "}
              <span className="mono text-[11px] dim">/quote/[id]</span> · SECTION 01 발신처 박스 (11개 행) + SECTION 07 서명란 + 푸터
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-edred shrink-0">→</span>
            <span>
              <span className="font-medium">견적서 PDF 다운로드</span> · 브라우저 인쇄 출력 + 메일 첨부
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-edred shrink-0">→</span>
            <span>
              <span className="font-medium">거래명세표 PDF</span>{" "}
              <span className="mono text-[11px] dim">/api/admin/orders/[id]/delivery-pdf</span> · 공급자 박스
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-edred shrink-0">→</span>
            <span>
              <span className="font-medium">관리자 견적 발송 메일</span> · 발신자 정보
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
