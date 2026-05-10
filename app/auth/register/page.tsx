"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── 이미지 리사이즈 (OCR 호출 전 비용·속도 최적화) ─────────────────────────
// EXIF 회전 정보 자동 보정 + 긴 변 1568px로 축소. 이미 작은 이미지는 원본 유지.
async function resizeForOcr(file: File, maxDim = 1568): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const ratio = Math.min(maxDim / bitmap.width, maxDim / bitmap.height, 1);
    if (ratio === 1) {
      bitmap.close();
      return file;
    }
    const w = Math.round(bitmap.width * ratio);
    const h = Math.round(bitmap.height * ratio);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92)
    );
    return blob ?? file;
  } catch {
    return file;
  }
}

// ─── 타입 정의 ───────────────────────────────────────────────────────────────
type CustomerType = "ENDUSER" | "DEALER" | "OEM";
type EstimatedType = CustomerType | "";

interface CardInfo {
  name: string;
  company: string;
  phone: string;
  email: string;
  position: string;
  homepage: string;
  estimatedType: EstimatedType;
  typeReason: string;
  estimatedSize: string;
  estimatedIndustry: string;
}

interface FormData {
  name: string;
  company: string;
  phone: string;
  email: string;
  position: string;
  homepage: string;
  customerType: CustomerType;
  password: string;
  passwordConfirm: string;
  businessNo: string;
}

interface AiEstimate {
  type: EstimatedType;
  reason: string;
  size: string;
  industry: string;
}

const TYPE_LABEL: Record<CustomerType, string> = {
  ENDUSER: "일반 고객",
  DEALER: "딜러",
  OEM: "OEM",
};

// ─── 스텝 표시 컴포넌트 ──────────────────────────────────────────────────────
function StepBar({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { num: 1, label: "명함 업로드" },
    { num: 2, label: "정보 확인" },
    { num: 3, label: "계정 설정" },
  ];
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, idx) => (
        <div key={step.num} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                current === step.num
                  ? "bg-blue-600 text-white"
                  : current > step.num
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {current > step.num ? "✓" : step.num}
            </div>
            <span
              className={`text-xs mt-1 font-medium ${
                current === step.num ? "text-blue-600" : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`h-0.5 flex-1 mx-1 mb-5 transition-colors ${
                current > step.num + 1 || (current > step.num)
                  ? "bg-green-400"
                  : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();

  // 단계 상태
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // 명함 OCR 상태
  const [ocrLoading, setOcrLoading] = useState(false);
  const [cardImageFile, setCardImageFile] = useState<File | null>(null);
  const [cardImagePreview, setCardImagePreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 폼 데이터
  const [form, setForm] = useState<FormData>({
    name: "",
    company: "",
    phone: "",
    email: "",
    position: "",
    homepage: "",
    customerType: "ENDUSER",
    password: "",
    passwordConfirm: "",
    businessNo: "",
  });

  // AI 추정 결과 (Step 2에서 안내문으로 표시)
  const [aiEstimate, setAiEstimate] = useState<AiEstimate | null>(null);

  // 사업자등록증 파일
  const [businessFile, setBusinessFile] = useState<File | null>(null);

  // 오류 및 제출 상태
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateForm(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // ─── 명함 이미지 처리 ──────────────────────────────────────────────────────
  async function processCardImage(file: File) {
    setCardImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setCardImagePreview(previewUrl);
    setOcrLoading(true);
    setError("");

    try {
      // OCR 전 이미지 축소 (원본은 cardImageFile에 이미 보관됨 → 가입시 원본 업로드)
      const resized = await resizeForOcr(file);
      const fd = new FormData();
      fd.append("image", resized, "card.jpg");
      const res = await fetch("/api/ocr/card", { method: "POST", body: fd });
      if (res.ok) {
        const data = (await res.json()) as Partial<CardInfo>;
        const estType = (data.estimatedType ?? "") as EstimatedType;
        setForm((f) => ({
          ...f,
          name: data.name || f.name,
          company: data.company || f.company,
          phone: data.phone || f.phone,
          email: data.email || f.email,
          position: data.position || f.position,
          homepage: data.homepage || f.homepage,
          customerType:
            estType === "OEM" || estType === "DEALER" || estType === "ENDUSER"
              ? estType
              : f.customerType,
        }));
        if (estType || data.estimatedSize || data.estimatedIndustry) {
          setAiEstimate({
            type: estType,
            reason: data.typeReason ?? "",
            size: data.estimatedSize ?? "",
            industry: data.estimatedIndustry ?? "",
          });
        } else {
          setAiEstimate(null);
        }
      }
    } catch {
      // OCR 실패해도 Step 2로 이동
    } finally {
      setOcrLoading(false);
      setStep(2);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processCardImage(file);
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processCardImage(file);
    }
  }, []);

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  // ─── 최종 가입 제출 ────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다");
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다");
      return;
    }

    setSubmitting(true);

    try {
      // 사업자등록증 업로드 (있을 경우)
      let businessFileUrl = "";
      if (businessFile) {
        const uploadFd = new FormData();
        uploadFd.append("file", businessFile);
        uploadFd.append("userId", form.email);
        const uploadRes = await fetch("/api/upload/business", {
          method: "POST",
          body: uploadFd,
        });
        if (uploadRes.ok) {
          const uploadData = (await uploadRes.json()) as { url?: string };
          businessFileUrl = uploadData.url ?? "";
        }
      }

      // 명함 이미지 업로드 (있을 경우)
      let cardImageUrl = "";
      if (cardImageFile) {
        const cardFd = new FormData();
        cardFd.append("file", cardImageFile);
        cardFd.append("userId", `card_${form.email}`);
        const cardRes = await fetch("/api/upload/business", {
          method: "POST",
          body: cardFd,
        });
        if (cardRes.ok) {
          const cardData = (await cardRes.json()) as { url?: string };
          cardImageUrl = cardData.url ?? "";
        }
      }

      // 회원가입 요청
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.name,
          company: form.company,
          phone: form.phone,
          position: form.position,
          homepage: form.homepage,
          customerType: form.customerType,
          businessNo: form.businessNo,
          businessFileUrl,
          cardImageUrl,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "오류가 발생했습니다");
        return;
      }

      router.push("/auth/login?registered=1");
    } catch {
      setError("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요");
    } finally {
      setSubmitting(false);
    }
  }

  // ─── 렌더링 ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen md:min-h-[80vh] flex items-start md:items-center justify-center px-0 md:px-6 py-0 md:py-12 bg-white md:bg-transparent">
      <div className="w-full max-w-md md:bg-white md:border md:border-gray-200 md:rounded-2xl md:shadow-sm p-6 md:p-8 min-h-screen md:min-h-0">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">회원가입</h1>
        <p className="text-sm text-gray-500 mb-6">
          가입 후 관리자 승인을 받으면 등급별 가격을 확인하고 견적을 요청하실 수 있습니다.
        </p>

        <StepBar current={step} />

        {/* ── STEP 1: 명함 업로드 ────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700 mb-6">
              명함 사진을 업로드하면 AI가 정보를 자동으로 입력해드립니다.
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
              aria-label="명함 이미지 업로드"
              className={`border-2 border-dashed rounded-xl p-8 md:p-10 text-center cursor-pointer transition-colors min-h-[140px] flex flex-col items-center justify-center ${
                dragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400 hover:bg-gray-50 active:bg-blue-50"
              }`}
            >
              {ocrLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-blue-600 font-medium">AI가 명함을 인식 중입니다...</p>
                </div>
              ) : cardImagePreview ? (
                <div className="flex flex-col items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cardImagePreview}
                    alt="명함 미리보기"
                    className="max-h-40 rounded-lg object-contain"
                  />
                  <p className="text-xs text-gray-400">다른 이미지를 클릭하여 변경</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-gray-400">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      명함 사진을 여기에 끌어다 놓거나
                    </p>
                    <p className="text-sm text-blue-600 font-medium">클릭하여 파일 선택</p>
                  </div>
                  <p className="text-xs text-gray-400">JPG, PNG, WEBP 지원</p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* ── STEP 2: 정보 확인 및 수정 ──────────────────────────────────── */}
        {step === 2 && (
          <div>
            {aiEstimate && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4 text-sm">
                <p className="font-medium text-blue-800 mb-1">AI 추정 결과</p>
                <ul className="text-blue-700 space-y-0.5">
                  {aiEstimate.type && (
                    <li>
                      • 고객 유형: <strong>{TYPE_LABEL[aiEstimate.type as CustomerType]}</strong>
                      {aiEstimate.reason && <span className="text-blue-600"> — {aiEstimate.reason}</span>}
                    </li>
                  )}
                  {aiEstimate.size && <li>• 회사 규모: {aiEstimate.size}</li>}
                  {aiEstimate.industry && <li>• 업종: {aiEstimate.industry}</li>}
                </ul>
                <p className="text-xs text-blue-500 mt-2">※ 추정값입니다. 아래에서 직접 수정하실 수 있습니다.</p>
              </div>
            )}

            <div className="space-y-4">
              {[
                { field: "name" as const, label: "이름", type: "text", placeholder: "홍길동", required: true },
                { field: "company" as const, label: "회사명", type: "text", placeholder: "(주)예시회사", required: true },
                { field: "position" as const, label: "직함", type: "text", placeholder: "영업팀장", required: false },
                { field: "phone" as const, label: "전화번호", type: "tel", placeholder: "010-1234-5678", required: true },
                { field: "email" as const, label: "이메일", type: "email", placeholder: "your@company.com", required: true },
                { field: "homepage" as const, label: "홈페이지", type: "url", placeholder: "https://www.example.com", required: false },
              ].map(({ field, label, type, placeholder, required }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  <input
                    type={type}
                    value={form[field]}
                    onChange={(e) => updateForm(field, e.target.value)}
                    required={required}
                    placeholder={placeholder}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  />
                </div>
              ))}

              {/* 고객 유형 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  고객 유형 <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    {
                      value: "ENDUSER" as CustomerType,
                      label: "일반 고객 (Enduser)",
                      desc: "가입 즉시 이용 가능",
                    },
                    {
                      value: "DEALER" as CustomerType,
                      label: "딜러 등록",
                      desc: "관리자 승인 후 딜러 가격 적용",
                    },
                    {
                      value: "OEM" as CustomerType,
                      label: "OEM 등록",
                      desc: "관리자 승인 후 OEM 가격 적용",
                    },
                  ].map(({ value, label, desc }) => (
                    <label
                      key={value}
                      className={`flex items-start gap-3 border rounded-lg px-4 py-3 cursor-pointer transition-colors ${
                        form.customerType === value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="customerType"
                        value={value}
                        checked={form.customerType === value}
                        onChange={() => updateForm("customerType", value)}
                        className="mt-0.5 accent-blue-600"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{label}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition-colors hover:bg-gray-50 min-h-[44px] text-[14px]"
              >
                이전
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!form.name || !form.company || !form.phone || !form.email) {
                    setError("필수 항목(*)을 모두 입력해주세요");
                    return;
                  }
                  setError("");
                  setStep(3);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-colors min-h-[44px] text-[14px]"
              >
                다음
              </button>
            </div>

            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          </div>
        )}

        {/* ── STEP 3: 계정 설정 ────────────────────────────────────────────── */}
        {step === 3 && (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => updateForm("password", e.target.value)}
                  required
                  placeholder="8자 이상"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호 확인 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={form.passwordConfirm}
                  onChange={(e) => updateForm("passwordConfirm", e.target.value)}
                  required
                  placeholder="비밀번호를 다시 입력해주세요"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사업자등록번호{" "}
                  <span className="text-gray-400 text-xs">(선택)</span>
                </label>
                <input
                  type="text"
                  value={form.businessNo}
                  onChange={(e) => updateForm("businessNo", e.target.value)}
                  placeholder="000-00-00000"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사업자등록증{" "}
                  <span className="text-gray-400 text-xs">(선택, PDF/JPG)</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setBusinessFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {businessFile && (
                  <p className="text-xs text-green-600 mt-1">선택됨: {businessFile.name}</p>
                )}
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 accent-blue-600"
                />
                <span className="text-sm text-gray-600">
                  <span className="font-medium">이용약관</span>에 동의합니다{" "}
                  <span className="text-red-500">*</span>
                </span>
              </label>
            </div>

            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep(2);
                }}
                className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition-colors hover:bg-gray-50 min-h-[44px] text-[14px]"
              >
                이전
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors min-h-[44px] text-[14px]"
              >
                {submitting ? "가입 중..." : "가입 완료"}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          이미 계정이 있으신가요?{" "}
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
