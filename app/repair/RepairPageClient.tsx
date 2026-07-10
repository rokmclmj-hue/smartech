"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { SMARTECH_COMPANY } from "@/lib/company";
import "@/app/quote/[id]/quote-styles.css";

// ── 타입 ──────────────────────────────────────────────────
type RepairKit = {
  id: number;
  pumpFamily: string;
  pumpMaker: string;
  pumpModel: string;
  modelGroup: string | null;
  basePrice: number;   // 원가 (고객가 = × 1.4)
  description: string | null;
  parts: { id: number; name: string; quantity: string | null }[];
  extraParts: { id: number; category: string; name: string; price: number }[]; // price = 원가 (× 1.2)
};

type SelectedExtra = { id: number; category: string; name: string; costPrice: number };

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
  isConsultRequest: boolean;
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

const STEPS = ["사진 업로드", "증상 입력", "수리 견적", "접수 완료"];

type RepairCase = {
  model: string;
  client: string;
  symptom: string;
  work: string[];
  photo: string;
  partPhoto?: string;
  extraPhoto?: string;
};

const REPAIR_CASES: RepairCase[] = [
  {
    model: "Edwards E2M0.7",
    client: "A사",
    symptom: "엔드실 가공 · 모터 베어링 교체 · 모듈 스크래치 발생",
    work: ["엔드실 가공", "모터 베어링 교체", "모듈 스크래치 부위 수정"],
    photo: "/images/repair/e2m07-b-exterior.jpg",
    partPhoto: "/images/repair/e2m07-b-bearing.jpg",
    extraPhoto: "/images/repair/e2m07-b-endshield.jpg",
  },
  {
    model: "Edwards iQDP40",
    client: "D사",
    symptom: "기본수리",
    work: ["Power PCA 교체", "Cooling coil 교체"],
    photo: "/images/repair/iqdp40-exterior.jpg",
    partPhoto: "/images/repair/iqdp40-cooling-coil.jpg",
    extraPhoto: "/images/repair/iqdp40-internal.jpg",
  },
  {
    model: "Edwards XDS35i",
    client: "N사",
    symptom: "팁씰·베어링 마모 · 가스 발라스트 파손",
    work: ["팁씰 교체", "베어링 교체", "가스 발라스트 교체"],
    photo: "/images/repair/xds35i-b-exterior.jpg",
    partPhoto: "/images/repair/xds35i-b-internal.jpg",
    extraPhoto: "/images/repair/xds35i-b-gasballast.jpg",
  },
  {
    model: "우성진공 W2V40",
    client: "자체",
    symptom: "내부 오염 · 모터슬리브 손상",
    work: ["내부 세척", "씰·가스켓 교체", "모터슬리브 교체"],
    photo: "/images/repair/w2v40-exterior.jpg",
    partPhoto: "/images/repair/w2v40-internal.jpg",
    extraPhoto: "/images/repair/w2v40-internal2.jpg",
  },
  {
    model: "Edwards RV5",
    client: "S사",
    symptom: "오일 오염 · 진공도 불량",
    work: ["씰·가스켓 교체", "베어링 교체", "배기밸브 교체", "오일 교환"],
    photo: "/images/repair/rv5-exterior.jpg",
    partPhoto: "/images/repair/rv5-oil.jpg",
    extraPhoto: "/images/repair/rv5-rotor.jpg",
  },
  {
    model: "Edwards E2M1.5",
    client: "S사",
    symptom: "기본 수리 · 파트 교환",
    work: ["씰·가스켓 교체", "베어링 교체", "배기밸브 교체", "오일 교환"],
    photo: "/images/repair/e2m15-exterior.jpg",
    partPhoto: "/images/repair/e2m15-internal.jpg",
    extraPhoto: "/images/repair/e2m15-rotor.jpg",
  },
  {
    model: "Edwards E2M0.7",
    client: "S사",
    symptom: "기본 수리 · 파트 교환",
    work: ["씰·가스켓 교체", "베어링 교체", "배기밸브 교체", "오일 교환"],
    photo: "/images/repair/e2m07-exterior.jpg",
    partPhoto: "/images/repair/e2m07-seal.jpg",
    extraPhoto: "/images/repair/e2m07-valve.jpg",
  },
  {
    model: "Edwards EH2600",
    client: "J사",
    symptom: "타이밍 기어 손상",
    work: ["기어 교체 (×2)", "베어링 교체", "내부 세정", "기능 점검"],
    photo: "/images/repair/eh2600-gears.jpg",
    partPhoto: "/images/repair/eh2600-damage1.jpg",
    extraPhoto: "/images/repair/eh2600-damage2.jpg",
  },
  {
    model: "Edwards nXDS10i",
    client: "K사",
    symptom: "팁씰 마모 · 베어링 손상",
    work: ["팁씰 교체", "베어링 교체", "스크롤 세정", "기능 점검"],
    photo: "/images/repair/nxds10i-exterior.jpg",
    partPhoto: "/images/repair/nxds10i-scroll.jpg",
    extraPhoto: "/images/repair/nxds10i-tipseal.jpg",
  },
  {
    model: "Edwards E2M80",
    client: "C사",
    symptom: "내부 오염 · Exhaust Baffle 파손",
    work: ["풀 오버홀", "Exhaust Valve 교체", "Baffle 교체", "내부 세정"],
    photo: "/images/repair/e2m80b-exterior.jpg",
    partPhoto: "/images/repair/e2m80b-internal.jpg",
    extraPhoto: "/images/repair/e2m80b-baffle.jpg",
  },
  {
    model: "Pfeiffer Vacuum DUO2.5",
    client: "자체",
    symptom: "내부 오염 · 진공도 불량",
    work: ["풀 오버홀", "내부 세척·클리닝", "씰·가스켓 교체"],
    photo: "/images/repair/duo25-exterior.jpg",
    partPhoto: "/images/repair/duo25-internal1.jpg",
    extraPhoto: "/images/repair/duo25-internal2.jpg",
  },
  {
    model: "Edwards iH1800MK5",
    client: "T사",
    symptom: "N2 Flow 센서 불량 · WARNING 알람",
    work: ["N2 Flow 센서 교체", "내부 세정", "기능 점검"],
    photo: "/images/repair/ih1800mk5-alarm.jpg",
    partPhoto: "/images/repair/ih1800mk5-parts.jpg",
    extraPhoto: "/images/repair/ih1800mk5-sensor.jpg",
  },
  {
    model: "Edwards GV80",
    client: "B사",
    symptom: "내부 오염 · 진공도 불량",
    work: ["풀 오버홀", "베어링 교체", "씰·개스킷 교체", "내부 세정"],
    photo: "/images/repair/gv80-exterior.jpg",
    partPhoto: "/images/repair/gv80-internal.jpg",
  },
  {
    model: "Edwards iH1800HTX",
    client: "G사",
    symptom: "공정 부산물 오염 · 배기 불량",
    work: ["풀 오버홀", "오염물 완전 제거", "씰·베어링 교체"],
    photo: "/images/repair/ih1800-contamination.jpg",
    partPhoto: "/images/repair/ih1800-rotors.jpg",
  },
  {
    model: "Edwards XDS35iE",
    client: "A사",
    symptom: "스크롤 팁 마모 · 베어링 손상",
    work: ["스크롤 팁 씰 교체", "베어링 교체", "내부 세정"],
    photo: "/images/repair/xds35i-wear.jpg",
    partPhoto: "/images/repair/xds35i-bearing.jpg",
  },
  {
    model: "Edwards RV3",
    client: "S사",
    symptom: "오일 오염 · 진공 불량",
    work: ["풀 오버홀", "베인 교체", "오일 세정"],
    photo: "/images/repair/rv3-disassembly.jpg",
  },
  {
    model: "Edwards E2M28",
    client: "E사",
    symptom: "오일 오염 · 진공 불량",
    work: ["풀 오버홀", "베인 교체", "씰 교체", "오일 세정"],
    photo: "/images/repair/e2m28-exterior.jpg",
    partPhoto: "/images/repair/e2m28-internal.jpg",
  },
  {
    model: "Edwards EH500",
    client: "H사",
    symptom: "베어링 파손 · 심각한 내부 오염",
    work: ["베어링 교체 (×2)", "씰·개스킷 교체", "로터 세정"],
    photo: "/images/repair/eh500-casing.jpg",
    partPhoto: "/images/repair/eh500-bearings.jpg",
  },
  {
    model: "Edwards E2M80",
    client: "A사",
    symptom: "오일 오염 · 축 마모 · 진공 불량",
    work: ["풀 오버홀", "베어링 교체", "씰 교체", "오일 세정"],
    photo: "/images/repair/e2m80-exterior.jpg",
    partPhoto: "/images/repair/e2m80-shaft.jpg",
  },
];
const EXTRA_MARGIN = 1.2; // 추가항목 마진

// 모델별 기본수리 마진 (nXDS·XDS35 계열 1.5, 그 외 1.8)
function getBaseMargin(pumpModel: string): number {
  const m = pumpModel.toLowerCase();
  if (m.startsWith("nxds") || m.startsWith("xds35")) return 1.5;
  return 1.8;
}

const PHOTO_SLOTS = [
  { key: "nameplate", label: "명판 사진",       required: true,  hint: "모델명 스티커 — AI 인식 필수" },
  { key: "side",      label: "옆면 전체 사진",  required: false, hint: "있으면 인식 정확도 높아짐" },
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
export default function RepairPageClient() {
  const { data: session } = useSession();
  const user = session?.user as { name?: string; email?: string; phone?: string; company?: string; tier?: string } | undefined;
  const isLoggedIn = !!user;

  const [step, setStep] = useState(0);
  const [kits, setKits] = useState<RepairKit[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [repairNo, setRepairNo] = useState("");
  const [selectedExtras, setSelectedExtras] = useState<SelectedExtra[]>([]);
  const [showPartsDetail, setShowPartsDetail] = useState(false);
  const [modelSearch, setModelSearch] = useState("");
  const [modelSearchFocus, setModelSearchFocus] = useState(false);

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
    isConsultRequest: false,
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

  function toggleExtra(extra: SelectedExtra) {
    setSelectedExtras((prev) =>
      prev.find((e) => e.id === extra.id)
        ? prev.filter((e) => e.id !== extra.id)
        : [...prev, extra]
    );
  }

  const baseMargin = getBaseMargin(form.pumpModel);
  const baseCustomerPrice = selectedKit ? Math.round(selectedKit.basePrice * baseMargin) : 0;
  const extraCustomerTotal = selectedExtras.reduce(
    (sum, e) => sum + Math.round(e.costPrice * EXTRA_MARGIN), 0
  );
  const totalCustomerPrice = baseCustomerPrice + extraCustomerTotal;

  // 사진 선택
  function handlePhotoSelect(key: string, file: File) {
    setPhotos((p) => {
      if (p[key]?.preview.startsWith("blob:")) URL.revokeObjectURL(p[key]!.preview);
      return { ...p, [key]: { file, preview: URL.createObjectURL(file), label: key } };
    });
    setAiDone(false);
    setAiResult(null);
  }

  // 사진 삭제
  function handlePhotoRemove(key: string) {
    setPhotos((p) => {
      if (p[key]?.preview.startsWith("blob:")) URL.revokeObjectURL(p[key]!.preview);
      return { ...p, [key]: null };
    });
    setAiDone(false);
    setAiResult(null);
    if (fileRefs.current[key]) fileRefs.current[key]!.value = "";
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

  const requiredPhotos = ["nameplate"];
  const hasRequired = requiredPhotos.every((k) => photos[k] !== null);
  const photoCount = Object.values(photos).filter(Boolean).length;

  // 접수 제출
  async function submit() {
    setLoading(true);
    try {
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
          baseAmount: baseCustomerPrice,
          extraAmount: extraCustomerTotal,
          totalAmount: totalCustomerPrice,
          selectedExtrasJson: JSON.stringify(selectedExtras),
          isConsultRequest: form.isConsultRequest,
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
      <main className="max-w-5xl mx-auto px-6 py-12 repair-no-print">
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
          <div className="flex items-center gap-0 mb-12 w-full max-w-2xl">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center min-w-0">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[12px] font-bold transition-all shrink-0 ${
                    i < step ? "bg-ink border-ink text-paper"
                    : i === step ? "border-edred text-edred bg-paper"
                    : "border-line text-dim bg-paper"
                  }`}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span className={`text-[11px] sm:text-[13px] mt-1.5 tracking-wide font-bold text-center leading-tight ${
                    i === step ? "text-[#000000]" : "text-[#1a1a1a]"
                  }`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-[1px] mx-1 sm:mx-2 mb-5 transition-all shrink ${i < step ? "bg-ink" : "bg-line"}`} />
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
                        if (file && (file.type.startsWith("image/") || file.type === "application/pdf")) handlePhotoSelect(slot.key, file);
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
                          {photo.file.type === "application/pdf" ? (
                            <iframe
                              src={photo.preview}
                              className="absolute inset-0 w-full h-full border-0"
                              title="PDF 미리보기"
                            />
                          ) : (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={photo.preview}
                              alt={slot.label}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-paper text-[12px] font-medium">변경</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handlePhotoRemove(slot.key); }}
                            className="absolute top-1.5 left-1.5 w-6 h-6 bg-red-600 text-white text-[12px] font-bold rounded-full flex items-center justify-center hover:bg-red-700 transition-colors z-10"
                          >
                            ✕
                          </button>
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
                      accept="image/*,application/pdf"
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

            {/* 모델명 직접 검색 (사진 없는 경우) */}
            <div className="mb-6 relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-px bg-line" />
                <span className="text-[11px] text-dim">또는 모델명으로 직접 검색</span>
                <div className="flex-1 h-px bg-line" />
              </div>
              <input
                type="text"
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                onFocus={() => setModelSearchFocus(true)}
                onBlur={() => setTimeout(() => setModelSearchFocus(false), 150)}
                placeholder="예: nXDS10i, RV8, E2M18, EH500..."
                className="w-full border border-line px-4 py-3 text-[14px] focus:outline-none focus:border-ink bg-paper"
              />
              {/* 검색 결과 드롭다운 */}
              {modelSearchFocus && modelSearch.length >= 2 && (() => {
                const matched = kits.filter(k =>
                  k.pumpModel.toLowerCase().includes(modelSearch.toLowerCase())
                ).slice(0, 6);
                if (matched.length === 0) return null;
                return (
                  <div className="absolute left-0 right-0 z-20 border border-ink bg-paper shadow-lg">
                    {matched.map(k => (
                      <button
                        key={k.id}
                        onMouseDown={() => {
                          setField("pumpModel", k.pumpModel);
                          setField("selectedKitId", k.id);
                          setField("pumpFamily", k.pumpFamily);
                          setModelSearch(k.pumpModel);
                          setAiDone(true);
                          setAiResult(null);
                        }}
                        className="w-full text-left px-4 py-3 text-[13px] hover:bg-ink hover:text-paper border-b border-line last:border-0 flex items-center justify-between"
                      >
                        <span className="font-medium">{k.pumpModel}</span>
                        <span className="text-[11px] text-dim">{k.pumpFamily}</span>
                      </button>
                    ))}
                  </div>
                );
              })()}
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

        {/* ── STEP 2: 수리 견적 (B안 — 체크박스 선택) ── */}
        {step === 2 && (
          <div className="max-w-3xl">
            <h2 className="text-[22px] font-bold tracking-tight mb-1">수리 견적</h2>
            <p className="text-[13px] text-dim mb-8">
              기본수리는 필수 포함입니다. 추가 항목을 선택하시면 총 견적이 업데이트됩니다.
            </p>

            {/* 모델 미인식 안내 */}
            {!form.pumpModel && (
              <div className="border border-amber-300 bg-amber-50 p-4 mb-6 text-[13px]">
                <span className="font-semibold text-amber-800">모델 미확인 접수:</span>
                <span className="text-amber-700 ml-2">
                  담당자가 사진을 확인 후 직접 연락드려 정확한 견적을 안내해 드립니다.
                </span>
              </div>
            )}

            {/* ── 기본수리 블록 ── */}
            <div className="border border-ink mb-3">
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] bg-ink text-paper px-1.5 py-0.5 font-medium tracking-wide">필수</span>
                    <span className="text-[15px] font-bold">기본수리</span>
                  </div>
                  <div className="text-[11px] text-dim">소모품 교체 · 기본 분해점검 포함</div>
                </div>
                <div className="text-right">
                  {selectedKit ? (
                    <>
                      <div className="text-[22px] font-bold tabular">{formatPrice(baseCustomerPrice)}</div>
                      <div className="text-[10px] text-dim">VAT 별도</div>
                    </>
                  ) : (
                    <div className="text-[16px] font-bold text-edred">상담 후 확정</div>
                  )}
                </div>
              </div>

              {/* 파트 전체보기 토글 */}
              {selectedKit && selectedKit.parts.length > 0 && (
                <>
                  <button
                    onClick={() => setShowPartsDetail((v) => !v)}
                    className="w-full flex items-center justify-between px-5 py-2.5 border-t border-line text-[12px] text-dim hover:text-ink hover:bg-[#F6F4EF] transition-all"
                  >
                    <span>교체 파트 전체 보기 ({selectedKit.parts.length}종)</span>
                    <span>{showPartsDetail ? "▲" : "▼"}</span>
                  </button>

                  {/* 다크모드 파트 목록 */}
                  {showPartsDetail && (
                    <div className="bg-ink text-paper">
                      <div className="px-5 py-3 border-b border-paper/10 flex items-center justify-between">
                        <div>
                          <div className="mono text-[9px] tracking-widest text-paper/40 mb-0.5">REPLACEMENT PARTS</div>
                          <div className="text-[14px] font-bold">
                            {form.pumpMaker} {form.pumpModel || "—"} · 기본수리
                          </div>
                        </div>
                        <button
                          onClick={() => window.print()}
                          className="text-[11px] border border-paper/30 px-3 py-1.5 hover:bg-paper/10 transition"
                        >
                          PDF 저장
                        </button>
                      </div>
                      <div className="px-5 py-4 space-y-2">
                        {selectedKit.parts.map((p, i) => (
                          <div key={p.id} className="flex items-center gap-3 py-1 border-b border-paper/5">
                            <span className="text-[10px] text-paper/30 w-5 text-right shrink-0">{i + 1}</span>
                            <span className="text-[13px] flex-1">{p.name}</span>
                            {p.quantity && (
                              <span className="text-[11px] text-paper/50 shrink-0">{p.quantity}</span>
                            )}
                          </div>
                        ))}
                        {selectedExtras.length > 0 && (
                          <>
                            <div className="pt-3 pb-1 text-[10px] text-paper/40 tracking-widest">추가 선택 항목</div>
                            {selectedExtras.map((e) => (
                              <div key={e.id} className="flex items-center gap-3 py-1 border-b border-paper/5">
                                <span className="text-[10px] text-paper/30 w-5 shrink-0">+</span>
                                <span className="text-[13px] flex-1">{e.name}</span>
                                <span className="text-[11px] text-paper/50 shrink-0">{e.category}</span>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                      <div className="px-5 py-4 border-t border-paper/10 flex justify-between items-center">
                        <div className="text-[11px] text-paper/40">참고 견적 · 분해검사 후 확정</div>
                        <div className="text-right">
                          <div className="text-[11px] text-paper/40">합계 (VAT 별도)</div>
                          <div className="text-[20px] font-bold tabular">{formatPrice(totalCustomerPrice)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── 추가 선택 항목 ── */}
            {selectedKit && selectedKit.extraParts.length > 0 && (
              <div className="mb-6">
                <div className="text-[11px] mono text-dim tracking-widest mb-3">추가 선택 항목 (선택 시 견적 합산)</div>
                <div className="space-y-2">
                  {selectedKit.extraParts.map((extra) => {
                    const isSelected = selectedExtras.some((e) => e.id === extra.id);
                    const customerPrice = Math.round(extra.price * EXTRA_MARGIN);
                    return (
                      <label
                        key={extra.id}
                        className={`flex items-center gap-4 border p-4 cursor-pointer transition-all ${
                          isSelected ? "border-ink bg-ink/5" : "border-line hover:border-ink"
                        }`}
                      >
                        <div className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center shrink-0 transition-all ${
                          isSelected ? "bg-ink border-ink" : "border-dim"
                        }`}>
                          {isSelected && <span className="text-paper text-[11px] font-bold">✓</span>}
                        </div>
                        <div className="flex-1">
                          <div className="text-[13px] font-medium">{extra.category}</div>
                          <div className="text-[11px] text-dim">{extra.name}</div>
                        </div>
                        <div className="text-right shrink-0">
                          {extra.price > 0 ? (
                            <>
                              <div className="text-[15px] font-bold tabular">{formatPrice(customerPrice)}</div>
                              <div className="text-[10px] text-dim">VAT 별도</div>
                            </>
                          ) : (
                            <div className="text-[13px] text-dim">상담 후 확정</div>
                          )}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={isSelected}
                          onChange={() => toggleExtra({ id: extra.id, category: extra.category, name: extra.name, costPrice: extra.price })}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── 총 견적 + 액션 버튼 ── */}
            <div className="border border-ink p-5 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[11px] text-dim mb-0.5">참고 견적 합계 (VAT 별도)</div>
                  <div className="text-[28px] font-bold tabular">
                    {selectedKit ? formatPrice(totalCustomerPrice) : "상담 후 확정"}
                  </div>
                  {selectedKit && (
                    <div className="text-[11px] text-dim mt-0.5">
                      기본수리 {formatPrice(baseCustomerPrice)}
                      {selectedExtras.length > 0 && ` + 추가 ${formatPrice(extraCustomerTotal)}`}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {selectedKit && (
                    isLoggedIn ? (
                      <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2.5 border border-ink text-[12px] font-medium hover:bg-ink hover:text-paper transition-all"
                      >
                        견적서 PDF
                      </button>
                    ) : (
                      <Link
                        href="/auth/login"
                        className="flex items-center gap-2 px-4 py-2.5 border border-line text-[11px] text-dim hover:border-ink transition-all"
                      >
                        로그인 후 PDF 저장
                      </Link>
                    )
                  )}
                  <button
                    onClick={() => { setField("isConsultRequest", true); setStep(3); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-edred text-paper text-[12px] font-semibold hover:bg-ink transition-all"
                  >
                    <span>상담 요청</span>
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-dim leading-relaxed">
                ※ 분해 검사 후 정확한 금액이 확정됩니다. 본 견적은 참고용이며 실제 금액과 다를 수 있습니다.
              </p>
            </div>

            {/* ── 이전 버튼 + 접수 버튼 ── */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-4 border border-line text-[14px] font-medium hover:border-ink transition"
              >
                ← 이전
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-8 py-4 bg-ink text-paper text-[14px] font-semibold hover:bg-edred transition-all"
              >
                연락처 입력 →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: 연락처 + 접수 ── */}
        {step === 3 && !submitted && (
          <div className="max-w-3xl">
            <h2 className="text-[22px] font-bold tracking-tight mb-2">연락처 입력</h2>
            {form.isConsultRequest && (
              <div className="border border-edred/30 bg-edred/5 px-4 py-3 mb-6 text-[13px] text-edred">
                상담 요청으로 접수됩니다 — 담당자가 직접 연락드립니다.
                <span className="ml-2 text-[11px]">
                  {form.pumpModel && `(${form.pumpModel}`}
                  {selectedExtras.length > 0 && ` · 추가항목 ${selectedExtras.length}건`}
                  {form.pumpModel && ")"}
                </span>
              </div>
            )}
            <div className="border border-line p-6 mb-8">
              <div className="mono text-[10px] tracking-widest text-dim mb-5">연락처 정보</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-medium block mb-1.5">
                    담당자 이름 <span className="text-edred">*</span>
                  </label>
                  <input type="text" value={form.contactName}
                    onChange={(e) => setField("contactName", e.target.value)}
                    placeholder="홍길동"
                    className="w-full border border-line px-3 py-2.5 text-[14px] focus:outline-none focus:border-ink bg-paper" />
                </div>
                <div>
                  <label className="text-[12px] font-medium block mb-1.5">
                    연락처 <span className="text-edred">*</span>
                  </label>
                  <input type="tel" value={form.contactPhone}
                    onChange={(e) => setField("contactPhone", phoneAutoFormat(e.target.value))}
                    placeholder="010-0000-0000"
                    className="w-full border border-line px-3 py-2.5 text-[14px] focus:outline-none focus:border-ink bg-paper tabular" />
                </div>
                <div>
                  <label className="text-[12px] font-medium block mb-1.5">회사명</label>
                  <input type="text" value={form.company}
                    onChange={(e) => setField("company", e.target.value)}
                    placeholder="(주)스마텍"
                    className="w-full border border-line px-3 py-2.5 text-[14px] focus:outline-none focus:border-ink bg-paper" />
                </div>
                <div>
                  <label className="text-[12px] font-medium block mb-1.5">이메일</label>
                  <input type="email" value={form.contactEmail}
                    onChange={(e) => setField("contactEmail", e.target.value)}
                    placeholder="example@company.com"
                    className="w-full border border-line px-3 py-2.5 text-[14px] focus:outline-none focus:border-ink bg-paper" />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)}
                className="px-6 py-4 border border-line text-[14px] font-medium hover:border-ink transition">
                ← 이전
              </button>
              <button
                disabled={!form.contactName || !form.contactPhone || loading}
                onClick={submit}
                className="px-10 py-4 bg-edred text-paper text-[14px] font-semibold hover:bg-ink transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <><span className="animate-spin inline-block w-4 h-4 border-2 border-paper/30 border-t-paper rounded-full" />접수 중...</>
                ) : (
                  form.isConsultRequest ? "상담 접수 완료 →" : "수리 접수 완료 →"
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: 접수 완료 ── */}
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

      <footer className="border-t border-line mt-20 py-8 repair-no-print">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-[11px] text-dim mono">
          <span>SMARTECH VACUUM · SINCE 2011</span>
          <span>031-204-7170 · 경기 수원시 영통구</span>
          <span>EDWARDS KOREA OFFICIAL</span>
        </div>
      </footer>

      {/* ── PDF 인쇄 전용 영역 (화이트 · 판매견적서 동일 스타일) ── */}
      <div className="repair-pdf-only quote-page">
        <div className="pdf-only" style={{ display: "block" }}>
          {/* 헤더 */}
          <div className="p-top">
            <div className="wm">
              SMARTECH · REPAIR ESTIMATE
              <small>수리 견적서</small>
            </div>
            <div className="meta pmono">
              <span>DATE · {new Date().toLocaleDateString("ko-KR")}</span>
              <span>EQUIPMENT · {form.pumpMaker} {form.pumpModel || "미확인"}</span>
              {form.pumpSerial && <span>S/N · {form.pumpSerial}</span>}
            </div>
          </div>

          {/* 수신/발신 */}
          <div className="p-parties">
            <div>
              <h5>TO · 수신처</h5>
              <div className="row"><div className="k">Company</div><div className="v">{user?.company || form.company || "—"}</div></div>
              <div className="row"><div className="k">Attn</div><div className="v">{user?.name || form.contactName || "—"}</div></div>
              <div className="row"><div className="k">Tel</div><div className="v pmono">{user?.phone || form.contactPhone || "—"}</div></div>
              <div className="row"><div className="k">Email</div><div className="v pmono">{user?.email || form.contactEmail || "—"}</div></div>
            </div>
            <div>
              <h5>FROM · 발신처</h5>
              <div className="row"><div className="k">Company</div><div className="v">{SMARTECH_COMPANY.name} · {SMARTECH_COMPANY.english}</div></div>
              <div className="row"><div className="k">CEO</div><div className="v">{SMARTECH_COMPANY.ceo}</div></div>
              <div className="row"><div className="k">Biz No</div><div className="v pmono">{SMARTECH_COMPANY.bizNo}</div></div>
              <div className="row"><div className="k">Tel</div><div className="v pmono">{SMARTECH_COMPANY.officeTel}</div></div>
              <div className="row"><div className="k">Email</div><div className="v pmono">{SMARTECH_COMPANY.email}</div></div>
              <div className="row"><div className="k">Office</div><div className="v">{SMARTECH_COMPANY.headOfficeKo}</div></div>
              <div className="row"><div className="k">A/S Ctr</div><div className="v">{SMARTECH_COMPANY.cheonanCenterKo}</div></div>
            </div>
          </div>

          {/* 수리 항목 테이블 */}
          <table className="p-table">
            <thead>
              <tr>
                <th style={{ width: "8mm" }}>No</th>
                <th>수리 항목 / 교체 파트</th>
                <th style={{ width: "12mm", textAlign: "right" }}>수량</th>
                <th style={{ width: "30mm", textAlign: "right" }}>공급가 (VAT 별도)</th>
              </tr>
            </thead>
            <tbody>
              {/* 기본수리 */}
              {selectedKit && (
                <tr>
                  <td className="pmono">01</td>
                  <td>
                    <strong>기본수리 — {form.pumpModel}</strong>
                    <span className="desc-ko">
                      {selectedKit.parts.map(p => p.name).join(" · ")}
                    </span>
                  </td>
                  <td className="num-col">1식</td>
                  <td className="num-col">₩ {baseCustomerPrice.toLocaleString("ko-KR")}</td>
                </tr>
              )}
              {/* 추가 선택 항목 */}
              {selectedExtras.map((e, i) => (
                <tr key={e.id}>
                  <td className="pmono">{String(i + 2).padStart(2, "0")}</td>
                  <td>
                    <strong>{e.category}</strong>
                    <span className="desc-ko">{e.name}</span>
                  </td>
                  <td className="num-col">1식</td>
                  <td className="num-col">₩ {Math.round(e.costPrice * EXTRA_MARGIN).toLocaleString("ko-KR")}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 합계 */}
          <div className="p-totals">
            <div className="row">
              <span className="k">Sub-Total</span>
              <span className="v">₩ {totalCustomerPrice.toLocaleString("ko-KR")}</span>
            </div>
            <div className="row">
              <span className="k">VAT (10%)</span>
              <span className="v">₩ {Math.round(totalCustomerPrice * 0.1).toLocaleString("ko-KR")}</span>
            </div>
            <div className="row grand">
              <span className="k">GRAND TOTAL</span>
              <span className="v">₩ {Math.round(totalCustomerPrice * 1.1).toLocaleString("ko-KR")}</span>
            </div>
          </div>

          {/* 거래 조건 */}
          <div className="p-terms">
            <div className="row"><span className="k">Payment</span><span className="v">수리 완료 후 세금계산서 발행 · 협의</span></div>
            <div className="row"><span className="k">Warranty</span><span className="v">수리 후 3개월 보증</span></div>
            <div className="row"><span className="k">A / S</span><span className="v">031-204-7170 · 스마텍 서비스센터 직접 응대</span></div>
            <div className="row"><span className="k">Note</span><span className="v">본 견적은 참고용이며 분해 검사 후 정확한 금액이 확정됩니다.</span></div>
          </div>

          {/* 푸터 */}
          <div className="p-footer">
            <span>© {new Date().getFullYear()} SMARTECH CO., LTD. · Edwards Vacuum Korea Authorized Service Partner</span>
            <span>PAGE 1 / 1</span>
          </div>
        </div>
      </div>

      {/* ── 수리 사례 ── */}
      <section className="mt-24 border-t hair pt-14 pb-20 bg-paper">
        <div className="max-w-5xl mx-auto px-6">
          {/* 헤더 */}
          <div className="mono text-[11px] text-dim mb-3 tracking-widest">REPAIR CASES</div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <h2 className="display text-[32px] leading-tight">수리 사례</h2>
              <p className="mt-2 text-[14px] text-dim leading-relaxed">
                실제 수리·오버홀 전후 사진과 작업 내용을 순차적으로 공개합니다.
              </p>
            </div>
            <div className="shrink-0 text-[12px] mono text-dim border hair px-4 py-2 self-start md:self-auto">
              {REPAIR_CASES.length}건 공개 — 순차 업데이트 중
            </div>
          </div>

          {/* 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {REPAIR_CASES.length > 0 ? REPAIR_CASES.map((c, i) => (
              <div key={i} className="border hair bg-white flex flex-col overflow-hidden">
                {/* 핵심 손상 사진 */}
                <div className="aspect-[4/3] relative bg-[#111] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.photo} alt={c.symptom} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3">
                    <div className="text-paper text-[13px] font-semibold leading-tight">{c.model}</div>
                    <div className="text-paper/50 text-[10px] mono">{c.client}</div>
                  </div>
                </div>
                {/* 내용 */}
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <div>
                    <div className="mono text-[9px] text-edred tracking-widest mb-1">SYMPTOM</div>
                    <div className="text-[13px] font-semibold leading-snug">{c.symptom}</div>
                  </div>
                  <div>
                    <div className="mono text-[9px] text-dim tracking-widest mb-1.5">WORK DONE</div>
                    <div className="flex flex-wrap gap-1">
                      {c.work.map((w, j) => (
                        <span key={j} className="text-[11px] border hair px-2 py-0.5 text-dim">{w}</span>
                      ))}
                    </div>
                  </div>
                  {c.partPhoto && (
                    <div className="mt-auto pt-3 border-t hair">
                      <div className="mono text-[9px] text-dim tracking-widest mb-1.5">PARTS</div>
                      {c.extraPhoto ? (
                        <div className="flex gap-1">
                          {[c.partPhoto, c.extraPhoto].map((p, j) => (
                            <div key={j} className="flex-1 aspect-[4/3] relative overflow-hidden border hair">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={p} alt={`수리 부품 ${j + 1}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="aspect-[16/9] relative overflow-hidden border hair">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={c.partPhoto} alt="수리 부품" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )) : (
              /* 플레이스홀더 — 데이터 없을 때 */
              [0, 1, 2].map((i) => (
                <div key={i} className="border hair bg-white flex flex-col overflow-hidden opacity-40">
                  <div className="aspect-[4/3] bg-[#ECEAE5] flex items-center justify-center">
                    <span className="mono text-[10px] text-dim">DAMAGE PHOTO</span>
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    <div className="h-2 bg-[#E3DFD6] rounded w-20" />
                    <div className="h-3 bg-[#E3DFD6] rounded w-full" />
                    <div className="h-3 bg-[#E3DFD6] rounded w-2/3" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 하단 안내 */}
          <div className="mt-10 pt-8 border-t hair flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-[12px] text-dim">
            <div className="leading-relaxed">
              수리 완료 후 고객 동의 하에 사례를 게시합니다.<br className="hidden md:block" />
              장비명·증상·작업 내용·전후 사진이 포함됩니다.
            </div>
            <a
              href="tel:031-204-7170"
              className="shrink-0 inline-flex items-center gap-2 border hair px-5 py-2.5 text-ink hover:bg-ink hover:text-paper transition-colors mono text-[11px] tracking-wider"
            >
              ☏ 031-204-7170 수리 문의
            </a>
          </div>
        </div>
      </section>

      <style>{`
        .repair-pdf-only { display: none; }
        .repair-pdf-only .pdf-only { display: block !important; }
        @media print {
          @page { margin: 0; size: A4 portrait; }
          html, body {
            height: 297mm !important;
            overflow: hidden !important;
            background: #fff !important;
          }
          body * { visibility: hidden !important; }
          .repair-pdf-only {
            visibility: visible !important;
            display: block !important;
            position: absolute !important;
            top: 0 !important; left: 0 !important; right: 0 !important;
            z-index: 9999 !important;
            background: #fff !important;
          }
          .repair-pdf-only * { visibility: visible !important; }
        }
      `}</style>
    </div>
  );
}
