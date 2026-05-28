"use client";

import { useEffect, useRef, useState } from "react";
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
  tier2Price: number;
  tier3Price: number;
  description: string | null;
  parts: { id: number; name: string; quantity: string | null }[];
  extraParts: { id: number; name: string; price: number }[];
};

type PhotoFile = { file: File; preview: string; label: string };

type AiResult = {
  modelName: string | null;
  pumpFamily: string;
  maker: string;
  confidence: "high" | "medium" | "low";
  serialNo: string | null;
  notes: string;
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
  selectedTier: 1 | 2 | 3 | null;
};

// ── 상수 ──────────────────────────────────────────────────
const SYMPTOMS = [
  { id: "vibration",     label: "진동 / 소음",       sub: "이상 금속음, 불규칙 진동" },
  { id: "vacuum",        label: "진공 불량",           sub: "도달 압력 미달, 진공 속도 저하" },
  { id: "overload",      label: "과부하",               sub: "모터 전류 상승, 기동 불가" },
  { id: "temperature",   label: "온도 이상",           sub: "High Temp 알람, 과열" },
  { id: "oil_leak",      label: "오일 누유 / 오염",   sub: "오일 오염, 역류" },
  { id: "contamination", label: "공정 부산물 오염",   sub: "분말 퇴적, 배기 막힘" },
  { id: "electrical",    label: "전기 / 제어 오류",   sub: "인버터 오류, 통신 에러" },
  { id: "other",         label: "기타 증상",           sub: "위 항목에 해당 없는 경우" },
];

const STEPS = ["사진 업로드", "증상 입력", "견적 확인", "접수 완료"];

const PHOTO_SLOTS = [
  { key: "nameplate", label: "명판 사진",       required: true,  hint: "제품에 붙어있는 모델명 스티커" },
  { key: "side",      label: "옆면 전체 사진",  required: true,  hint: "펌프 측면 전체가 보이도록" },
  { key: "front",     label: "정면 사진",       required: false, hint: "선택 사항" },
  { key: "back",      label: "뒷면 사진",       required: false, hint: "선택 사항" },
  { key: "top",       label: "윗면 사진",       required: false, hint: "선택 사항" },
];

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

  const [step, setStep] = useState(0);
  const [kits, setKits] = useState<RepairKit[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [repairNo, setRepairNo] = useState("");

  // 사진 상태
  const [photos, setPhotos] = useState<Record<string, PhotoFile | null>>({
    nameplate: null, side: null, front: null, back: null, top: null,
  });
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [form, setForm] = useState<FormData>({
    pumpFamily: "",
    pumpMaker: "EDWARDS",
    pumpModel: "",
    pumpSerial: "",
    selectedKitId: null,
    symptoms: [],
    symptomNote: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    company: "",
    selectedTier: null,
  });

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

  useEffect(() => {
    fetch("/api/repair/kits")
      .then((r) => r.json())
      .then((d) => setKits(d.kits ?? []));
  }, []);

  const selectedKit = kits.find((k) => k.id === form.selectedKitId) ?? null;

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

  // 사진 선택
  function handlePhotoSelect(key: string, file: File) {
    const preview = URL.createObjectURL(file);
    setPhotos((p) => ({ ...p, [key]: { file, preview, label: key } }));
    setAiDone(false);
    setAiResult(null);
  }

  // AI 모델 인식
  async function runAiIdentify() {
    const photoFiles = Object.values(photos).filter(Boolean) as PhotoFile[];
    if (photoFiles.length === 0) return;

    setAiLoading(true);
    try {
      const fd = new FormData();
      photoFiles.forEach((p) => fd.append("photos", p.file));

      const res = await fetch("/api/repair/identify", { method: "POST", body: fd });
      const data: AiResult = await res.json();
      setAiResult(data);
      setAiDone(true);

      // 인식 성공 시 자동으로 모델 정보 채우기
      if (data.modelName && data.confidence !== "low") {
        const matched = kits.find(
          (k) => k.pumpModel.toLowerCase() === data.modelName!.toLowerCase()
        );
        setForm((f) => ({
          ...f,
          pumpModel: data.modelName!,
          pumpMaker: data.maker === "EDWARDS" ? "EDWARDS" : data.maker,
          pumpFamily: data.pumpFamily ?? f.pumpFamily,
          pumpSerial: data.serialNo ?? f.pumpSerial,
          selectedKitId: matched?.id ?? null,
        }));
      }
    } catch {
      setAiResult({
        confidence: "low", modelName: null, pumpFamily: "other",
        maker: "EDWARDS", serialNo: null, notes: "인식 중 오류가 발생했습니다.",
      });
      setAiDone(true);
    } finally {
      setAiLoading(false);
    }
  }

  const requiredPhotos = ["nameplate", "side"];
  const hasRequired = requiredPhotos.every((k) => photos[k] !== null);
  const photoCount = Object.values(photos).filter(Boolean).length;

  // 접수 제출
  async function submit() {
    setLoading(true);
    try {
      const baseAmount =
        form.selectedTier === 1 ? (selectedKit?.basePrice ?? 0) :
        form.selectedTier === 2 ? (selectedKit?.tier2Price ?? 0) :
        form.selectedTier === 3 ? (selectedKit?.tier3Price ?? 0) : 0;

      const res = await fetch("/api/repair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pumpFamily: form.pumpFamily || "other",
          pumpMaker: form.pumpMaker,
          pumpModel: form.pumpModel,
          pumpSerial: form.pumpSerial || null,
          kitId: form.selectedKitId,
          symptoms: form.symptoms,
          symptomNote: form.symptomNote || null,
          baseAmount,
          selectedTier: form.selectedTier,
          contactName: form.contactName,
          contactPhone: form.contactPhone,
          contactEmail: form.contactEmail || null,
          company: form.company || null,
          aiConfidence: aiResult?.confidence ?? null,
          aiModelRaw: aiResult?.modelName ?? null,
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
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[12px] font-bold transition-all ${
                    i < step ? "bg-ink border-ink text-paper"
                    : i === step ? "border-edred text-edred bg-paper"
                    : "border-line text-dim bg-paper"
                  }`}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span className={`text-[13px] mt-1.5 tracking-wide whitespace-nowrap font-bold ${
                    i === step ? "text-[#000000]" : "text-[#1a1a1a]"
                  }`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-[1px] mx-2 mb-5 transition-all ${i < step ? "bg-ink" : "bg-line"}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 0: 사진 업로드 + AI 인식 ── */}
        {step === 0 && (
          <div className="max-w-3xl">
            <h2 className="text-[22px] font-bold tracking-tight mb-2">제품 사진을 올려주세요</h2>
            <p className="text-[13px] text-dim mb-8">
              명판과 옆면 사진은 필수입니다. 사진에서 모델명을 자동으로 인식합니다.
            </p>

            {/* 사진 업로드 슬롯 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {PHOTO_SLOTS.map((slot) => {
                const photo = photos[slot.key];
                return (
                  <div key={slot.key} className="flex flex-col gap-1.5">
                    <div
                      onClick={() => fileRefs.current[slot.key]?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(slot.key); }}
                      onDragEnter={(e) => { e.preventDefault(); setDragOver(slot.key); }}
                      onDragLeave={() => setDragOver(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(null);
                        const file = e.dataTransfer.files[0];
                        if (file && file.type.startsWith("image/")) handlePhotoSelect(slot.key, file);
                      }}
                      className={`relative aspect-square border-2 cursor-pointer flex flex-col items-center justify-center transition-all overflow-hidden group ${
                        dragOver === slot.key
                          ? "border-edred bg-edred/5 scale-[1.03]"
                          : photo
                          ? "border-ink"
                          : slot.required
                          ? "border-dashed border-edred/60 hover:border-edred"
                          : "border-dashed border-line hover:border-ink"
                      }`}
                    >
                      {photo ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo.preview}
                            alt={slot.label}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-paper text-[12px] font-medium">변경</span>
                          </div>
                          <div className="absolute top-1.5 right-1.5 bg-ink text-paper text-[10px] px-1.5 py-0.5 rounded">
                            ✓
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-3 pointer-events-none">
                          <div className={`text-[24px] mb-1 ${dragOver === slot.key ? "text-edred" : slot.required ? "text-edred/40" : "text-dim/40"}`}>
                            {dragOver === slot.key ? "↓" : "+"}
                          </div>
                          <div className={`text-[11px] font-medium ${dragOver === slot.key ? "text-edred" : slot.required ? "text-edred/80" : "text-dim"}`}>
                            {dragOver === slot.key ? "놓으면 업로드" : slot.required ? "필수" : "선택"}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-[11px] font-medium text-ink">{slot.label}</div>
                    <div className="text-[10px] text-dim leading-tight">{slot.hint}</div>
                    <input
                      ref={(el) => { fileRefs.current[slot.key] = el; }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoSelect(slot.key, file);
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* AI 인식 버튼 / 결과 */}
            {hasRequired && !aiDone && (
              <div className="mb-8">
                <button
                  onClick={runAiIdentify}
                  disabled={aiLoading}
                  className="w-full py-4 bg-ink text-paper text-[14px] font-semibold hover:bg-edred transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {aiLoading ? (
                    <>
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-paper/30 border-t-paper rounded-full" />
                      모델명 인식 중...
                    </>
                  ) : (
                    <>사진 {photoCount}장으로 모델 자동 인식</>
                  )}
                </button>
                <p className="text-[11px] text-dim text-center mt-2">
                  명판이 선명하게 찍힐수록 정확합니다
                </p>
              </div>
            )}

            {/* AI 결과 표시 */}
            {aiDone && aiResult && (
              <div className={`border p-5 mb-8 ${
                aiResult.confidence === "high"
                  ? "border-ink bg-ink/5"
                  : aiResult.confidence === "medium"
                  ? "border-amber-400 bg-amber-50"
                  : "border-edred/40 bg-edred/5"
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`text-[28px] shrink-0 ${
                    aiResult.confidence === "high" ? "text-ink"
                    : aiResult.confidence === "medium" ? "text-amber-500"
                    : "text-edred"
                  }`}>
                    {aiResult.confidence === "high" ? "✓" : aiResult.confidence === "medium" ? "△" : "!"}
                  </div>
                  <div className="flex-1">
                    {aiResult.modelName ? (
                      <>
                        <div className="mono text-[10px] tracking-widest text-dim mb-1">인식된 모델</div>
                        <div className="text-[22px] font-bold tracking-tight mb-1">
                          {aiResult.maker} {aiResult.modelName}
                        </div>
                        {aiResult.serialNo && (
                          <div className="text-[12px] text-dim mb-2">S/N: {aiResult.serialNo}</div>
                        )}
                        <div className="text-[12px] text-dim leading-relaxed">{aiResult.notes}</div>
                        {aiResult.confidence === "medium" && (
                          <p className="text-[11px] text-amber-700 mt-2">
                            모델명을 직접 확인하거나 수정해 주세요.
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="text-[15px] font-semibold mb-1 text-edred">
                          모델을 자동으로 인식하지 못했습니다
                        </div>
                        <div className="text-[12px] text-dim leading-relaxed mb-3">{aiResult.notes}</div>
                        <p className="text-[12px] leading-relaxed">
                          접수 후 담당자가 사진을 확인하고 직접 연락드립니다.
                          아래에서 모델명을 직접 입력하거나, 그대로 접수하셔도 됩니다.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* 모델명 수정 입력 */}
                <div className="mt-4 pt-4 border-t border-current/20 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] mono text-dim block mb-1">
                      모델명 {aiResult.modelName ? "(수정 가능)" : "(직접 입력)"}
                    </label>
                    <input
                      type="text"
                      value={form.pumpModel}
                      onChange={(e) => {
                        const v = e.target.value;
                        setField("pumpModel", v);
                        const matched = kits.find(
                          (k) => k.pumpModel.toLowerCase() === v.toLowerCase()
                        );
                        setField("selectedKitId", matched?.id ?? null);
                        if (matched) setField("pumpFamily", matched.pumpFamily);
                      }}
                      placeholder="예: XDS35iE, nXDS10i, RV8"
                      className="w-full border border-current/30 bg-paper px-3 py-2 text-[14px] focus:outline-none focus:border-ink"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] mono text-dim block mb-1">시리얼 번호 (선택)</label>
                    <input
                      type="text"
                      value={form.pumpSerial}
                      onChange={(e) => setField("pumpSerial", e.target.value)}
                      placeholder="S/N"
                      className="w-full border border-current/30 bg-paper px-3 py-2 text-[14px] focus:outline-none focus:border-ink"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {!hasRequired && (
                <p className="text-[12px] text-edred self-center">
                  명판 사진과 옆면 사진은 필수입니다.
                </p>
              )}
              {aiDone && (
                <button
                  onClick={() => setStep(1)}
                  className="ml-auto px-8 py-4 bg-edred text-paper text-[14px] font-semibold hover:bg-ink transition-all"
                >
                  다음 단계 →
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 1: 증상 입력 ── */}
        {step === 1 && (
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="mono text-[11px] text-dim">
                {form.pumpMaker} {form.pumpModel || "모델 미확인"}
              </span>
              {!form.pumpModel && (
                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5">
                  담당자 확인 예정
                </span>
              )}
            </div>
            <h2 className="text-[22px] font-bold tracking-tight mb-2">증상을 선택하세요</h2>
            <p className="text-[13px] text-dim mb-8">복수 선택 가능합니다.</p>

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
                    <div className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      form.symptoms.includes(s.id) ? "bg-paper border-paper" : "border-dim"
                    }`}>
                      {form.symptoms.includes(s.id) && (
                        <span className="text-ink text-[11px] font-bold leading-none">✓</span>
                      )}
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold">{s.label}</div>
                      <div className={`text-[11px] mt-0.5 ${
                        form.symptoms.includes(s.id) ? "text-paper/60" : "text-dim"
                      }`}>{s.sub}</div>
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

        {/* ── STEP 2: 3단계 견적 + 연락처 ── */}
        {step === 2 && (
          <div className="max-w-3xl">
            <h2 className="text-[22px] font-bold tracking-tight mb-2">수리 단계를 선택하세요</h2>
            <p className="text-[13px] text-dim mb-8">
              분해 검사 후 정확한 금액이 확정됩니다. 선택하신 단계는 참고 견적입니다.
            </p>

            {/* 3단계 견적 카드 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              {/* Tier 1 */}
              {[
                {
                  tier: 1 as const,
                  title: "기본 수리",
                  sub: "소모품 교체 + 기본 점검",
                  price: selectedKit?.basePrice ?? 0,
                  parts: selectedKit?.parts ?? [],
                  tag: "기본",
                },
                {
                  tier: 2 as const,
                  title: "기본 수리 + 파트 교체",
                  sub: "주요 파트 교체 포함",
                  price: selectedKit?.tier2Price ?? 0,
                  parts: [],
                  tag: "표준",
                },
                {
                  tier: 3 as const,
                  title: "전체 수리",
                  sub: "전체 분해 · 완전 오버홀",
                  price: selectedKit?.tier3Price ?? 0,
                  parts: [],
                  tag: "완전",
                },
              ].map(({ tier, title, sub, price, parts, tag }) => {
                const selected = form.selectedTier === tier;
                const noPrice = price === 0;
                return (
                  <button
                    key={tier}
                    onClick={() => setField("selectedTier", tier)}
                    className={`text-left border p-5 transition-all flex flex-col h-full ${
                      selected
                        ? "border-ink bg-ink text-paper"
                        : "border-line hover:border-ink"
                    }`}
                  >
                    <div className={`mono text-[9px] tracking-widest mb-2 ${selected ? "text-paper/50" : "text-dim"}`}>
                      TIER {tier} · {tag}
                    </div>
                    <div className="text-[15px] font-bold mb-1">{title}</div>
                    <div className={`text-[11px] mb-4 ${selected ? "text-paper/60" : "text-dim"}`}>{sub}</div>
                    <div className="mt-auto">
                      {noPrice ? (
                        <div className={`text-[18px] font-bold ${selected ? "text-paper" : "text-edred"}`}>
                          상담 후 확정
                        </div>
                      ) : (
                        <>
                          <div className="text-[22px] font-bold tabular">{formatPrice(price)}</div>
                          <div className={`text-[10px] mt-0.5 ${selected ? "text-paper/50" : "text-dim"}`}>
                            VAT 별도 · 파트비 포함
                          </div>
                        </>
                      )}
                    </div>
                    {parts.length > 0 && (
                      <div className={`mt-4 pt-3 border-t ${selected ? "border-paper/20" : "border-line"} space-y-1`}>
                        {parts.slice(0, 4).map((p) => (
                          <div key={p.id} className={`text-[11px] flex gap-1.5 ${selected ? "text-paper/70" : "text-dim"}`}>
                            <span className="text-edred text-[8px] mt-0.5 shrink-0">●</span>
                            {p.name} {p.quantity}
                          </div>
                        ))}
                        {parts.length > 4 && (
                          <div className={`text-[10px] ${selected ? "text-paper/50" : "text-dim"}`}>
                            외 {parts.length - 4}종 포함
                          </div>
                        )}
                      </div>
                    )}
                    {selected && (
                      <div className="mt-3 text-paper text-[13px] font-semibold">✓ 선택됨</div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 모델 미인식 안내 */}
            {!form.pumpModel && (
              <div className="border border-amber-300 bg-amber-50 p-4 mb-6 text-[13px]">
                <span className="font-semibold text-amber-800">모델 미확인 접수:</span>
                <span className="text-amber-700 ml-2">
                  담당자가 사진을 확인 후 직접 연락드려 정확한 견적을 안내해 드립니다.
                </span>
              </div>
            )}

            {/* 연락처 */}
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
                disabled={!form.contactName || !form.contactPhone || !form.selectedTier || loading}
                onClick={submit}
                className="px-10 py-4 bg-edred text-paper text-[14px] font-semibold hover:bg-ink transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
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
            {!form.selectedTier && (
              <p className="text-[11px] text-edred mt-2">수리 단계를 선택해 주세요.</p>
            )}
          </div>
        )}

        {/* ── STEP 3: 접수 완료 ── */}
        {step === 3 && submitted && (
          <div className="max-w-2xl">
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
                {[
                  { n: 1, title: "접수 완료", desc: "문자(SMS)로 접수 확인 알림을 발송했습니다." },
                  { n: 2, title: "입고 확인", desc: "장비 입고 후 담당자가 확인합니다." },
                  { n: 3, title: "분해 검사 → 수리 진행", desc: "분해 검사 후 최종 견적을 안내드립니다." },
                  { n: 4, title: "검수 완료 → 납품", desc: "검사 성적서·거래명세표와 함께 납품됩니다." },
                ].map(({ n, title, desc }, i) => (
                  <div key={n} className={`flex items-start gap-3 ${i > 0 ? "text-dim" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${
                      i === 0 ? "bg-ink text-paper" : "border border-line"
                    }`}>
                      {i === 0 ? "✓" : n}
                    </div>
                    <div>
                      <div className={`text-[14px] font-semibold ${i === 0 ? "" : "text-ink"}`}>{title}</div>
                      <div className="text-[12px]">{desc}</div>
                    </div>
                  </div>
                ))}
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
