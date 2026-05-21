"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

// ── 타입 ──────────────────────────────────────────────────
type RepairKit = {
  id: number;
  pumpFamily: string;
  pumpMaker: string;
  pumpModel: string;
  modelGroup: string | null;
  basePrice: number;
  description: string | null;
  parts: { id: number; name: string; quantity: string | null }[];
  extraParts: { id: number; name: string; price: number }[];
};

type FormData = {
  pumpFamily: string;
  pumpMaker: string;
  pumpModel: string;
  pumpSerial: string;
  selectedKitId: number | null;
  symptoms: string[];
  symptomNote: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  company: string;
};

// ── 상수 ──────────────────────────────────────────────────
const PUMP_FAMILIES = [
  {
    id: "scroll",
    label: "Scroll Dry Pump",
    sub: "nXDS · XDS 시리즈",
    icon: "○",
  },
  {
    id: "rotary_vane",
    label: "Oil Rotary Vane",
    sub: "RV · E2M 시리즈",
    icon: "◎",
  },
  {
    id: "booster",
    label: "Roots Booster",
    sub: "EH 시리즈",
    icon: "◈",
  },
  {
    id: "dry",
    label: "Dry Pump",
    sub: "iH · iGX 시리즈",
    icon: "◆",
  },
  {
    id: "other",
    label: "기타 브랜드",
    sub: "Pfeiffer · Leybold 등",
    icon: "◇",
  },
];

const SYMPTOMS = [
  { id: "vibration", label: "진동 / 소음", sub: "이상 금속음, 불규칙 진동" },
  { id: "vacuum", label: "진공 불량", sub: "도달 압력 미달, 진공 속도 저하" },
  { id: "overload", label: "과부하", sub: "모터 전류 상승, 기동 불가" },
  { id: "temperature", label: "온도 이상", sub: "High Temp 알람, 과열" },
  { id: "oil_leak", label: "오일 누유 / 오염", sub: "오일 오염, 역류" },
  { id: "contamination", label: "공정 부산물 오염", sub: "분말 퇴적, 배기 막힘" },
  { id: "electrical", label: "전기 / 제어 오류", sub: "인버터 오류, 통신 에러" },
  { id: "other", label: "기타 증상", sub: "위 항목에 해당 없는 경우" },
];

const STEPS = ["장비 선택", "증상 입력", "견적 확인", "접수 완료"];

// ── 유틸 ──────────────────────────────────────────────────
function formatPrice(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

function phoneAutoFormat(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

// ── 컴포넌트 ──────────────────────────────────────────────
export default function RepairPage() {
  const { data: session } = useSession();
  const user = session?.user as { name?: string; email?: string; phone?: string } | undefined;

  const [step, setStep] = useState(0); // 0~3
  const [kits, setKits] = useState<RepairKit[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [repairNo, setRepairNo] = useState("");
  const [noKitMode, setNoKitMode] = useState(false); // 키트 없는 타브랜드/미등록

  const [form, setForm] = useState<FormData>({
    pumpFamily: "",
    pumpMaker: "EDWARDS",
    pumpModel: "",
    pumpSerial: "",
    selectedKitId: null,
    symptoms: [],
    symptomNote: "",
    contactName: user?.name ?? "",
    contactPhone: user?.phone ?? "",
    contactEmail: user?.email ?? "",
    company: "",
  });

  // 로그인 정보로 연락처 자동 채우기
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        contactName: f.contactName || user.name || "",
        contactPhone: f.contactPhone || user.phone || "",
        contactEmail: f.contactEmail || user.email || "",
      }));
    }
  }, [user]);

  // 키트 목록 로드
  useEffect(() => {
    fetch("/api/repair/kits")
      .then((r) => r.json())
      .then((d) => setKits(d.kits ?? []));
  }, []);

  const selectedKit = kits.find((k) => k.id === form.selectedKitId) ?? null;
  const familyKits = kits.filter((k) => k.pumpFamily === form.pumpFamily);
  const baseAmount = selectedKit?.basePrice ?? 0;
  const needsConsult = baseAmount === 0 && form.selectedKitId !== null;

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleSymptom(id: string) {
    setForm((f) => ({
      ...f,
      symptoms: f.symptoms.includes(id)
        ? f.symptoms.filter((s) => s !== id)
        : [...f.symptoms, id],
    }));
  }

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch("/api/repair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpFamily: form.pumpFamily,
          pumpMaker: form.pumpMaker,
          pumpModel: form.pumpModel,
          pumpSerial: form.pumpSerial || null,
          kitId: form.selectedKitId,
          symptoms: form.symptoms,
          symptomNote: form.symptomNote || null,
          baseAmount,
          contactName: form.contactName,
          contactPhone: form.contactPhone,
          contactEmail: form.contactEmail || null,
          company: form.company || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRepairNo(data.repairNo);
      setSubmitted(true);
      setStep(3);
    } catch (e) {
      alert((e as Error).message ?? "접수 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  // ── 렌더링 ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* 상단 바 */}
      <header className="border-b border-line sticky top-0 bg-paper/95 backdrop-blur-sm z-40">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[13px] mono text-dim hover:text-ink transition flex items-center gap-2">
            <span>←</span>
            <span>SMARTECH</span>
          </Link>
          <span className="text-[11px] mono tracking-widest text-dim uppercase">
            Repair Service
          </span>
          {session ? (
            <span className="text-[12px] text-dim">{user?.name}</span>
          ) : (
            <Link href="/auth/login?callbackUrl=/repair" className="text-[12px] text-edred hover:underline">
              로그인
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* 타이틀 */}
        <div className="mb-12">
          <p className="mono text-[11px] tracking-widest text-dim mb-3">REPAIR · A/S · OVERHAUL</p>
          <h1 className="display text-[clamp(32px,5vw,64px)] leading-none tracking-tight mb-4">
            수리 접수
          </h1>
          <p className="text-[15px] text-dim max-w-xl leading-relaxed">
            Edwards 및 타브랜드 진공 펌프 수리를 접수해 드립니다.<br />
            30년 경력 전문가가 직접 분해·점검·조립합니다.
          </p>
        </div>

        {/* 스텝 바 */}
        {!submitted && (
          <div className="flex items-center gap-0 mb-12 max-w-2xl">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[12px] font-bold transition-all ${
                      i < step
                        ? "bg-ink border-ink text-paper"
                        : i === step
                        ? "border-edred text-edred bg-paper"
                        : "border-line text-dim bg-paper"
                    }`}
                  >
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span
                    className={`text-[10px] mt-1.5 mono tracking-wide whitespace-nowrap ${
                      i === step ? "text-ink font-semibold" : "text-dim"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-[1px] mx-2 mb-5 transition-all ${
                      i < step ? "bg-ink" : "bg-line"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 0: 장비 선택 ── */}
        {step === 0 && (
          <div className="max-w-3xl">
            <h2 className="text-[22px] font-bold tracking-tight mb-2">펌프 종류를 선택하세요</h2>
            <p className="text-[13px] text-dim mb-8">Edwards 외 타브랜드도 접수 가능합니다.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
              {PUMP_FAMILIES.map((fam) => (
                <button
                  key={fam.id}
                  onClick={() => {
                    setField("pumpFamily", fam.id);
                    setField("pumpMaker", fam.id === "other" ? "" : "EDWARDS");
                    setField("pumpModel", "");
                    setField("selectedKitId", null);
                    setNoKitMode(false);
                  }}
                  className={`text-left border p-5 transition-all group ${
                    form.pumpFamily === fam.id
                      ? "border-ink bg-ink text-paper"
                      : "border-line hover:border-ink"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div
                        className={`mono text-[10px] tracking-widest mb-2 ${
                          form.pumpFamily === fam.id ? "text-paper/50" : "text-dim"
                        }`}
                      >
                        {fam.icon} {fam.id.toUpperCase()}
                      </div>
                      <div className="text-[18px] font-bold tracking-tight leading-tight">
                        {fam.label}
                      </div>
                      <div
                        className={`text-[12px] mt-1 ${
                          form.pumpFamily === fam.id ? "text-paper/60" : "text-dim"
                        }`}
                      >
                        {fam.sub}
                      </div>
                    </div>
                    {form.pumpFamily === fam.id && (
                      <span className="text-paper text-[18px] mt-1">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* 모델 선택 (선택된 계열의 키트 목록) */}
            {form.pumpFamily && (
              <div className="border border-line p-6 mb-8">
                <h3 className="text-[14px] font-semibold mb-1">모델을 선택하세요</h3>
                <p className="text-[12px] text-dim mb-5">
                  목록에 없는 모델은 "기타 / 목록 없음"을 선택해 주세요.
                </p>

                {form.pumpFamily === "other" && (
                  <div className="mb-5 grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] mono text-dim block mb-1.5">브랜드명</label>
                      <input
                        type="text"
                        placeholder="예: Pfeiffer, Leybold"
                        value={form.pumpMaker}
                        onChange={(e) => setField("pumpMaker", e.target.value)}
                        className="w-full border border-line px-3 py-2.5 text-[14px] focus:outline-none focus:border-ink bg-paper"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] mono text-dim block mb-1.5">모델명</label>
                      <input
                        type="text"
                        placeholder="예: DUO3, W2V100"
                        value={form.pumpModel}
                        onChange={(e) => setField("pumpModel", e.target.value)}
                        className="w-full border border-line px-3 py-2.5 text-[14px] focus:outline-none focus:border-ink bg-paper"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                  {familyKits.map((kit) => (
                    <button
                      key={kit.id}
                      onClick={() => {
                        setField("selectedKitId", kit.id);
                        setField("pumpModel", kit.pumpModel);
                        setField("pumpMaker", kit.pumpMaker);
                        setNoKitMode(false);
                      }}
                      className={`text-left border px-4 py-3 text-[13px] font-medium transition-all ${
                        form.selectedKitId === kit.id
                          ? "border-ink bg-ink text-paper"
                          : "border-line hover:border-ink"
                      }`}
                    >
                      <div className="font-bold">{kit.pumpModel}</div>
                      {kit.modelGroup && kit.modelGroup !== kit.pumpModel && (
                        <div className={`text-[10px] mt-0.5 ${form.selectedKitId === kit.id ? "text-paper/50" : "text-dim"}`}>
                          {kit.modelGroup} 계열
                        </div>
                      )}
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      setNoKitMode(true);
                      setField("selectedKitId", null);
                      if (form.pumpFamily !== "other") setField("pumpModel", "");
                    }}
                    className={`text-left border px-4 py-3 text-[13px] font-medium transition-all ${
                      noKitMode
                        ? "border-edred bg-edred/5 text-edred"
                        : "border-line hover:border-ink border-dashed"
                    }`}
                  >
                    <div className="font-bold">기타 / 목록 없음</div>
                    <div className={`text-[10px] mt-0.5 ${noKitMode ? "text-edred/70" : "text-dim"}`}>
                      담당자 상담 진행
                    </div>
                  </button>
                </div>

                {/* 기타 모델 직접 입력 */}
                {noKitMode && form.pumpFamily !== "other" && (
                  <div className="mt-4">
                    <label className="text-[11px] mono text-dim block mb-1.5">모델명 직접 입력</label>
                    <input
                      type="text"
                      placeholder="모델명을 입력해 주세요"
                      value={form.pumpModel}
                      onChange={(e) => setField("pumpModel", e.target.value)}
                      className="w-full border border-line px-3 py-2.5 text-[14px] focus:outline-none focus:border-ink bg-paper"
                    />
                  </div>
                )}

                {/* 시리얼 번호 */}
                {(form.selectedKitId || (noKitMode && form.pumpModel)) && (
                  <div className="mt-4">
                    <label className="text-[11px] mono text-dim block mb-1.5">
                      시리얼 번호 <span className="text-dim/60">(선택)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="펌프 라벨의 S/N"
                      value={form.pumpSerial}
                      onChange={(e) => setField("pumpSerial", e.target.value)}
                      className="w-full border border-line px-3 py-2.5 text-[14px] focus:outline-none focus:border-ink bg-paper"
                    />
                  </div>
                )}
              </div>
            )}

            <button
              disabled={!form.pumpFamily || (!form.selectedKitId && !noKitMode) || !form.pumpModel}
              onClick={() => setStep(1)}
              className="px-8 py-4 bg-ink text-paper text-[14px] font-semibold hover:bg-edred transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              다음 단계 →
            </button>
          </div>
        )}

        {/* ── STEP 1: 증상 입력 ── */}
        {step === 1 && (
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="mono text-[11px] text-dim">{form.pumpMaker} {form.pumpModel}</span>
            </div>
            <h2 className="text-[22px] font-bold tracking-tight mb-2">증상을 선택하세요</h2>
            <p className="text-[13px] text-dim mb-8">복수 선택 가능합니다. 해당하는 증상을 모두 선택해 주세요.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {SYMPTOMS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => toggleSymptom(s.id)}
                  className={`text-left border p-4 transition-all ${
                    form.symptoms.includes(s.id)
                      ? "border-ink bg-ink text-paper"
                      : "border-line hover:border-ink"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        form.symptoms.includes(s.id)
                          ? "bg-paper border-paper"
                          : "border-dim"
                      }`}
                    >
                      {form.symptoms.includes(s.id) && (
                        <span className="text-ink text-[11px] font-bold leading-none">✓</span>
                      )}
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold">{s.label}</div>
                      <div
                        className={`text-[11px] mt-0.5 ${
                          form.symptoms.includes(s.id) ? "text-paper/60" : "text-dim"
                        }`}
                      >
                        {s.sub}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mb-8">
              <label className="text-[13px] font-medium block mb-2">
                추가 설명 <span className="text-dim font-normal">(선택)</span>
              </label>
              <textarea
                rows={4}
                placeholder="언제부터 증상이 발생했는지, 어떤 상황에서 발생하는지 등 자세히 적어주시면 더 정확한 견적이 가능합니다."
                value={form.symptomNote}
                onChange={(e) => setField("symptomNote", e.target.value)}
                className="w-full border border-line px-4 py-3 text-[14px] focus:outline-none focus:border-ink bg-paper resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="px-6 py-4 border border-line text-[14px] font-medium hover:border-ink transition"
              >
                ← 이전
              </button>
              <button
                disabled={form.symptoms.length === 0}
                onClick={() => setStep(2)}
                className="px-8 py-4 bg-ink text-paper text-[14px] font-semibold hover:bg-edred transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                다음 단계 →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: 견적 확인 + 연락처 ── */}
        {step === 2 && (
          <div className="max-w-3xl">
            <h2 className="text-[22px] font-bold tracking-tight mb-2">견적 확인 및 접수</h2>
            <p className="text-[13px] text-dim mb-8">기본 수리 견적을 확인하고 접수를 완료하세요.</p>

            {/* 견적 카드 */}
            <div className="border border-line mb-8">
              {/* 헤더 */}
              <div className="bg-ink text-paper px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="mono text-[10px] tracking-widest text-paper/50 mb-1">REPAIR ESTIMATE</div>
                  <div className="text-[18px] font-bold tracking-tight">
                    {form.pumpMaker} {form.pumpModel}
                  </div>
                </div>
                <div className="text-right">
                  {needsConsult || noKitMode ? (
                    <div>
                      <div className="mono text-[10px] text-paper/50 mb-1">견적</div>
                      <div className="text-[20px] font-bold text-edred2">상담 필요</div>
                    </div>
                  ) : (
                    <div>
                      <div className="mono text-[10px] text-paper/50 mb-1">기본 수리비</div>
                      <div className="text-[26px] font-bold tabular">{formatPrice(baseAmount)}</div>
                      <div className="text-[10px] text-paper/50 mt-0.5">VAT 별도 · 추가 파트비 별도</div>
                    </div>
                  )}
                </div>
              </div>

              {/* 포함 파트 */}
              {selectedKit && selectedKit.parts.length > 0 && (
                <div className="px-6 py-4 border-b border-line">
                  <div className="mono text-[10px] tracking-widest text-dim mb-3">기본 교체 파트</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5">
                    {selectedKit.parts.map((p) => (
                      <div key={p.id} className="flex items-center gap-1.5 text-[12px]">
                        <span className="text-edred text-[8px]">●</span>
                        <span>{p.name}</span>
                        {p.quantity && <span className="text-dim">{p.quantity}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 추가 파트 안내 */}
              {selectedKit && selectedKit.extraParts.length > 0 && (
                <div className="px-6 py-4 bg-paper/50">
                  <div className="mono text-[10px] tracking-widest text-dim mb-3">추가 교체 시 발생 가능한 비용</div>
                  <div className="space-y-1.5">
                    {selectedKit.extraParts.map((ep) => (
                      <div key={ep.id} className="flex items-center justify-between text-[13px]">
                        <span className="text-dim">{ep.name}</span>
                        <span className="font-semibold tabular">{formatPrice(ep.price)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-dim mt-3 leading-relaxed">
                    * 분해 검사 후 추가 파트 필요 시 고객 협의 후 진행합니다.
                  </p>
                </div>
              )}

              {/* 상담 필요 안내 */}
              {(needsConsult || noKitMode) && (
                <div className="px-6 py-5 bg-edred/5 border-t border-line">
                  <div className="flex items-start gap-3">
                    <span className="text-edred text-[18px] mt-0.5">!</span>
                    <div>
                      <div className="text-[14px] font-semibold mb-1">담당자 상담 후 견적 안내</div>
                      <p className="text-[12px] text-dim leading-relaxed">
                        해당 모델은 접수 후 담당자가 직접 연락드려 상세 견적을 안내해 드립니다.
                        접수 즉시 문자(SMS)로 알림을 보내드립니다.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 선택 증상 */}
              <div className="px-6 py-4 border-t border-line">
                <div className="mono text-[10px] tracking-widest text-dim mb-2">접수 증상</div>
                <div className="flex flex-wrap gap-2">
                  {form.symptoms.map((s) => {
                    const sym = SYMPTOMS.find((x) => x.id === s);
                    return (
                      <span key={s} className="text-[11px] border border-line px-2.5 py-1">
                        {sym?.label}
                      </span>
                    );
                  })}
                </div>
                {form.symptomNote && (
                  <p className="text-[12px] text-dim mt-2 leading-relaxed">{form.symptomNote}</p>
                )}
              </div>
            </div>

            {/* 연락처 입력 */}
            <div className="border border-line p-6 mb-8">
              <div className="mono text-[10px] tracking-widest text-dim mb-5">연락처 정보</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-medium block mb-1.5">
                    담당자 이름 <span className="text-edred">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.contactName}
                    onChange={(e) => setField("contactName", e.target.value)}
                    placeholder="홍길동"
                    className="w-full border border-line px-3 py-2.5 text-[14px] focus:outline-none focus:border-ink bg-paper"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-medium block mb-1.5">
                    연락처 <span className="text-edred">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.contactPhone}
                    onChange={(e) => setField("contactPhone", phoneAutoFormat(e.target.value))}
                    placeholder="010-0000-0000"
                    className="w-full border border-line px-3 py-2.5 text-[14px] focus:outline-none focus:border-ink bg-paper tabular"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-medium block mb-1.5">회사명</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setField("company", e.target.value)}
                    placeholder="(주)스마텍"
                    className="w-full border border-line px-3 py-2.5 text-[14px] focus:outline-none focus:border-ink bg-paper"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-medium block mb-1.5">이메일</label>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => setField("contactEmail", e.target.value)}
                    placeholder="example@company.com"
                    className="w-full border border-line px-3 py-2.5 text-[14px] focus:outline-none focus:border-ink bg-paper"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-4 border border-line text-[14px] font-medium hover:border-ink transition"
              >
                ← 이전
              </button>
              <button
                disabled={!form.contactName || !form.contactPhone || loading}
                onClick={submit}
                className="px-10 py-4 bg-edred text-paper text-[14px] font-semibold hover:bg-edred3 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-paper/30 border-t-paper rounded-full" />
                    접수 중...
                  </>
                ) : (
                  "수리 접수 완료 →"
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: 접수 완료 ── */}
        {step === 3 && submitted && (
          <div className="max-w-2xl">
            {/* 완료 카드 */}
            <div className="border border-ink mb-10">
              <div className="bg-ink text-paper px-8 py-8">
                <div className="mono text-[10px] tracking-widest text-paper/40 mb-4">
                  REPAIR REQUEST CONFIRMED
                </div>
                <div className="text-[42px] font-bold tracking-tight leading-none mb-2 tabular">
                  {repairNo}
                </div>
                <div className="text-[14px] text-paper/60">접수번호</div>
              </div>

              <div className="px-8 py-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-ink text-paper flex items-center justify-center text-[12px] font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold">접수 완료 — 담당자 확인 중</div>
                    <div className="text-[12px] text-dim">문자(SMS)로 접수 확인 알림을 발송했습니다.</div>
                  </div>
                </div>
                <div className="ml-4 border-l border-line pl-6 space-y-4">
                  <div className="flex items-start gap-3 text-dim">
                    <div className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-[12px] shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <div className="text-[13px] font-medium text-ink">수리 진행</div>
                      <div className="text-[12px]">장비 입고 후 분해·점검·수리가 진행됩니다.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-dim">
                    <div className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-[12px] shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <div className="text-[13px] font-medium text-ink">최종 견적 확정</div>
                      <div className="text-[12px]">분해 검사 후 최종 견적서를 이메일로 발송합니다.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-dim">
                    <div className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-[12px] shrink-0 mt-0.5">
                      4
                    </div>
                    <div>
                      <div className="text-[13px] font-medium text-ink">납품 완료</div>
                      <div className="text-[12px]">검사 성적서·거래명세표와 함께 납품됩니다.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 py-5 border-t border-line bg-paper">
                <div className="flex items-center justify-between text-[13px]">
                  <div className="text-dim">문의 연락처</div>
                  <div className="font-semibold">031-204-7170</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/"
                className="px-6 py-4 border border-line text-[14px] font-medium hover:border-ink transition text-center"
              >
                홈으로
              </Link>
              {session && (
                <Link
                  href="/mypage"
                  className="px-6 py-4 bg-ink text-paper text-[14px] font-semibold hover:bg-edred transition-all text-center"
                >
                  수리 현황 확인 →
                </Link>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 하단 정보 */}
      <footer className="border-t border-line mt-20 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-[11px] text-dim mono">
          <span>SMARTECH VACUUM · SINCE 2011</span>
          <span>031-204-7170 · 경기도 화성시</span>
          <span>EDWARDS KOREA OFFICIAL</span>
        </div>
      </footer>
    </div>
  );
}
