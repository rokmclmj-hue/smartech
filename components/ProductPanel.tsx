"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";

type Product = {
  id: number;
  partNo: string;
  description: string;
  displayPrice: number | null;
  priceStatus: "login" | "pending" | "visible";
  category: string;
  isImportant: boolean;
};

export type PanelItem = {
  category: string;
  code: string;
  title: string;
  image: string;
};

type Props = {
  item: PanelItem | null;
  onClose: () => void;
  catalogUrl?: string;
};

type SpecData = {
  models: string[];
  rows: { label: string; unit: string; values: string[] }[];
};

const SPEC_DATA: Record<string, SpecData> = {
  "오일펌프(소형 RV)": {
    models: ["RV3", "RV5", "RV8", "RV12"],
    rows: [
      { label: "배기속도 (60 Hz)", unit: "m³/h", values: ["3.9", "6.1", "10.0", "14.3"] },
      { label: "도달압력 (Total)", unit: "mbar", values: ["2.0×10⁻³", "2.0×10⁻³", "2.0×10⁻³", "2.0×10⁻³"] },
      { label: "모터 출력 (60 Hz)", unit: "W", values: ["550", "550", "550", "550"] },
      { label: "회전수 (60 Hz)", unit: "rpm", values: ["1,800", "1,800", "1,800", "1,800"] },
      { label: "소음", unit: "dB(A)", values: ["48", "48", "48", "48"] },
      { label: "무게", unit: "kg", values: ["25", "25", "28", "29"] },
      { label: "오일 용량", unit: "L", values: ["0.7", "0.7", "0.75", "1.0"] },
      { label: "인렛 플랜지", unit: "", values: ["NW25", "NW25", "NW25", "NW25"] },
      { label: "배기 플랜지", unit: "", values: ["NW25", "NW25", "NW25", "NW25"] },
      { label: "작동 온도", unit: "°C", values: ["12~40", "12~40", "12~40", "12~40"] },
      { label: "외형 치수 (L×W×H)", unit: "mm", values: ["430×158×225", "430×158×225", "470×158×225", "490×158×225"] },
    ],
  },
  "오일펌프(소형 E2M)": {
    models: ["E2M0.7", "E2M1.5", "E2M18", "E2M28"],
    rows: [
      { label: "배기속도 (60 Hz)", unit: "m³/h", values: ["0.85", "2.0", "20.6", "33.1"] },
      { label: "도달압력 (Total)", unit: "mbar", values: ["3×10⁻³", "3×10⁻³", "1×10⁻³", "1×10⁻³"] },
      { label: "모터 출력 (60 Hz)", unit: "W", values: ["90", "160", "750", "900"] },
      { label: "회전수 (60 Hz)", unit: "rpm", values: ["1,700", "1,700", "1,720", "1,720"] },
      { label: "소음", unit: "dB(A)", values: ["43", "54", "57", "57"] },
      { label: "무게", unit: "kg", values: ["10", "10", "39", "44"] },
      { label: "오일 용량", unit: "L", values: ["0.2~0.28", "0.2~0.28", "0.75~1.05", "1.2~1.5"] },
      { label: "인렛 플랜지", unit: "", values: ["NW10", "NW10", "NW25", "NW25"] },
      { label: "작동 온도", unit: "°C", values: ["12~40", "12~40", "13~40", "13~40"] },
    ],
  },
  "오일펌프(중대형 E2S)": {
    models: ["E2S45", "E2S65", "E2S85"],
    rows: [
      { label: "배기속도 (60 Hz)", unit: "m³/h", values: ["50", "69", "94"] },
      { label: "도달압력 (Total)", unit: "mbar", values: ["3.0×10⁻³", "3.0×10⁻³", "3.0×10⁻³"] },
      { label: "모터 출력 (60 Hz)", unit: "kW", values: ["1.3", "1.8", "2.6"] },
      { label: "소음 (60 Hz)", unit: "dB(A)", values: ["60", "62", "62"] },
      { label: "무게", unit: "kg", values: ["80", "90", "100"] },
      { label: "오일 용량", unit: "L", values: ["4.3", "4.8", "5.5"] },
      { label: "인렛 플랜지", unit: "", values: ["NW40", "NW40", "NW40"] },
      { label: "배기 플랜지", unit: "", values: ["NW25", "NW25", "NW25"] },
      { label: "외형 치수 (L×W×H)", unit: "mm", values: ["740×244×405", "770×244×405", "857×244×405"] },
    ],
  },
  "오일펌프(중대형 E2M)": {
    models: ["E2M40", "E2M80", "E2M175", "E2M275"],
    rows: [
      { label: "배기속도 (60 Hz)", unit: "m³/h", values: ["44", "90", "196", "306"] },
      { label: "도달압력 (Total)", unit: "mbar", values: ["3.0×10⁻³", "3.0×10⁻³", "3.0×10⁻³", "3.0×10⁻³"] },
      { label: "모터 출력 (60 Hz)", unit: "kW", values: ["1.5", "3.0", "6.5", "8.5"] },
      { label: "소음", unit: "dB(A)", values: ["65", "65", "75", "75"] },
      { label: "무게", unit: "kg", values: ["75", "104", "198", "216"] },
      { label: "오일 용량", unit: "L", values: ["2.2~4", "4~6.3", "16~25", "18~28"] },
      { label: "인렛 플랜지", unit: "", values: ["NW40", "NW40", "NW63", "NW63"] },
      { label: "배기 플랜지", unit: "", values: ["NW25", "NW25", "NW40", "NW40"] },
      { label: "외형 치수 (L×W×H)", unit: "mm", values: ["780×240×395", "889×266×429", "1055×388×533", "1165×388×533"] },
    ],
  },
  "오일펌프(nES)": {
    models: ["nES40", "nES65", "nES100", "nES200"],
    rows: [
      { label: "배기속도 (60 Hz)", unit: "m³/h", values: ["47", "64", "105", "200"] },
      { label: "도달압력 (Total)", unit: "mbar", values: ["0.5", "0.5", "0.5", "0.08"] },
      { label: "모터 출력 (60 Hz)", unit: "kW", values: ["1.3", "1.8", "3.6", "5.5"] },
      { label: "소음 (60 Hz)", unit: "dB(A)", values: ["60", "64", "64", "73"] },
      { label: "무게", unit: "kg", values: ["67", "86", "104", "142"] },
      { label: "오일 용량", unit: "L", values: ["1", "2", "2", "5~9"] },
      { label: "인렛 플랜지", unit: "", values: ["NW40", "NW40", "NW40", "NW63"] },
      { label: "배기 플랜지", unit: "", values: ["NW40", "NW40", "NW40", "NW63"] },
      { label: "외형 치수 (L×W×H)", unit: "mm", values: ["540×284×303", "586×320×314", "721×400×319", "1002×535×415"] },
    ],
  },
  "스크롤펌프(소형 nXDS)": {
    models: ["nXDS6i", "nXDS10i", "nXDS15i", "nXDS20i"],
    rows: [
      { label: "배기속도 (Peak)", unit: "m³/h", values: ["6.2", "12.7", "17.1", "22.0"] },
      { label: "도달압력", unit: "mbar", values: ["2.0×10⁻²", "7.0×10⁻³", "7.0×10⁻³", "3.0×10⁻²"] },
      { label: "모터 출력", unit: "W", values: ["260", "280", "300", "260"] },
      { label: "회전수", unit: "rpm", values: ["1,800", "1,800", "1,800", "1,800"] },
      { label: "소음", unit: "dB(A)", values: ["<52", "<52", "<52", "<52"] },
      { label: "무게", unit: "kg", values: ["26.2", "25.8", "25.2", "25.6"] },
      { label: "인렛 플랜지", unit: "", values: ["NW25", "NW25", "NW25", "NW25"] },
      { label: "배기 플랜지", unit: "", values: ["NW25", "NW25", "NW25", "NW25"] },
      { label: "작동 온도", unit: "°C", values: ["10~40", "10~40", "10~40", "10~40"] },
      { label: "외형 치수 (L×W×H)", unit: "mm", values: ["432×282×302", "432×282×302", "432×282×302", "432×282×302"] },
    ],
  },
  "스크롤펌프(중형 XDS)": {
    models: ["XDS35i", "XDS46i"],
    rows: [
      { label: "배기속도 (Peak)", unit: "m³/h", values: ["35", "40"] },
      { label: "도달압력", unit: "mbar", values: ["0.01", "0.05"] },
      { label: "모터 출력", unit: "W", values: ["520", "520"] },
      { label: "회전수", unit: "rpm", values: ["1,750", "1,750"] },
      { label: "소음", unit: "dB(A)", values: ["57", "55.4"] },
      { label: "무게", unit: "kg", values: ["48", "48"] },
      { label: "인렛 플랜지", unit: "", values: ["NW40", "NW40"] },
      { label: "배기 플랜지", unit: "", values: ["NW25", "NW25"] },
      { label: "작동 온도", unit: "°C", values: ["5~40", "5~40"] },
    ],
  },
  "산업용드라이펌프(GXS)": {
    models: ["GXS160", "GXS250", "GXS450", "GXS750"],
    rows: [
      { label: "배기속도 (Peak)", unit: "m³/h", values: ["160", "250", "450", "740"] },
      { label: "도달압력", unit: "mbar", values: ["7×10⁻³", "4×10⁻³", "5×10⁻³", "3×10⁻³"] },
      { label: "모터 출력", unit: "kW", values: ["3.8", "4.0", "7.2", "10.0"] },
      { label: "소음", unit: "dB(A)", values: ["<64", "<64", "<64", "<70"] },
      { label: "무게", unit: "kg", values: ["305", "305", "640", "640"] },
      { label: "인렛 플랜지", unit: "", values: ["ISO63", "ISO63", "ISO100", "ISO100"] },
      { label: "배기 플랜지", unit: "", values: ["NW40", "NW40", "NW50", "NW50"] },
      { label: "작동 온도", unit: "°C", values: ["5~40", "5~40", "5~40", "5~40"] },
      { label: "외형 치수 (L×W×H)", unit: "mm", values: ["880×347×1092", "880×347×1092", "872×300×1186", "1134×413×1622"] },
    ],
  },
  "산업용드라이펌프(EXS)": {
    models: ["EXS160", "EXS250", "EXS450", "EXS750"],
    rows: [
      { label: "배기속도 (Peak)", unit: "m³/h", values: ["160", "250", "450", "740"] },
      { label: "도달압력", unit: "mbar", values: ["1×10⁻²", "1×10⁻²", "1×10⁻²", "1×10⁻²"] },
      { label: "모터 출력", unit: "kW", values: ["3.8", "4.0", "7.2", "10.5"] },
      { label: "소음", unit: "dB(A)", values: ["<64", "<64", "<64", "<70"] },
      { label: "무게", unit: "kg", values: ["305", "315", "570", "650"] },
      { label: "인렛 플랜지", unit: "", values: ["ISO63", "ISO63", "ISO100", "ISO100"] },
      { label: "배기 플랜지", unit: "", values: ["NW40", "NW40", "ISO63", "NW50"] },
      { label: "작동 온도", unit: "°C", values: ["5~40", "5~40", "5~40", "5~40"] },
      { label: "외형 치수 (L×W×H)", unit: "mm", values: ["1265×520×539", "1265×520×539", "1445×567×763", "1650×567×642"] },
    ],
  },
  "반도체드라이펌프(iXH)": {
    models: ["iXH100", "iXH610", "iXH1210", "iXH1820", "iXH3030"],
    rows: [
      { label: "최대 배기속도", unit: "m³/h", values: ["100", "665", "1,025", "1,820", "2,900"] },
      { label: "도달압력", unit: "mbar", values: ["2×10⁻²", "5×10⁻³", "5×10⁻³", "5×10⁻³", "5×10⁻³"] },
      { label: "소비전력 (도달압력 시)", unit: "kW", values: ["2.1", "2.6", "3.2", "3.9", "5.7"] },
      { label: "인렛 플랜지", unit: "", values: ["ISO63", "ISO100", "ISO100", "ISO160", "ISO160"] },
      { label: "배기 플랜지", unit: "", values: ["NW40", "NW40", "NW40", "NW40", "NW40"] },
      { label: "무게", unit: "kg", values: ["260", "355", "430", "487", "619"] },
      { label: "외형 치수 (L×W×H)", unit: "mm", values: ["784×390×526", "784×390×780", "784×390×780", "901×390×780", "915×517×966"] },
    ],
  },
  "반도체드라이펌프(nXRi)": {
    models: ["nXR30i", "nXR40i", "nXR60i", "nXR90i", "nXR120i"],
    rows: [
      { label: "배기속도 (Peak)", unit: "m³/h", values: ["30", "40", "60", "90", "120"] },
      { label: "도달압력", unit: "mbar", values: ["0.03", "0.03", "0.03", "0.03", "0.03"] },
      { label: "소음", unit: "dB(A)", values: ["55", "55", "55", "55", "55"] },
      { label: "무게", unit: "kg", values: ["27", "27", "29", "29", "29"] },
      { label: "인렛 플랜지", unit: "", values: ["NW25", "NW25", "NW40", "NW40", "NW40"] },
      { label: "배기 플랜지", unit: "", values: ["NW25", "NW25", "NW25", "NW25", "NW25"] },
      { label: "작동 온도", unit: "°C", values: ["5~40", "5~40", "5~40", "5~40", "5~40"] },
    ],
  },
  "터보펌프(nEXT)": {
    models: ["nEXT85D", "nEXT240D", "nEXT300D", "nEXT400D", "nEXT730D"],
    rows: [
      { label: "배기속도 N₂ (Peak)", unit: "m³/h", values: ["302", "864", "1,080", "1,440", "2,628"] },
      { label: "소비전력", unit: "W", values: ["80", "160", "160", "160", "—"] },
      { label: "인렛 플랜지", unit: "", values: ["ISO63", "ISO100", "ISO100", "ISO160", "ISO160"] },
      { label: "배기 포트", unit: "", values: ["NW16", "NW25", "NW25", "NW25", "NW40"] },
      { label: "무게", unit: "kg", values: ["2.9", "5.7", "5.7", "6.5", "14.6"] },
    ],
  },
  "반도체드라이펌프(iXL)": {
    models: ["iXL250Q", "iXL500Q", "iXL500R", "iXL750Q"],
    rows: [
      { label: "배기속도 (드라이 펌프)", unit: "m³/h", values: ["250", "500", "500", "750"] },
      { label: "도달압력", unit: "mbar", values: ["<5×10⁻³", "<5×10⁻³", "<5×10⁻³", "<5×10⁻³"] },
      { label: "소비전력 (도달압력 시)", unit: "kW", values: ["5.3", "7.0", "7.0", "9.8"] },
      { label: "인렛 플랜지", unit: "", values: ["ISO160", "ISO160", "ISO160", "ISO160"] },
      { label: "배기 플랜지", unit: "", values: ["NW40", "NW50", "NW50", "NW50"] },
      { label: "무게", unit: "kg", values: ["515", "740", "874", "918"] },
      { label: "외형 치수 (L×W×H)", unit: "mm", values: ["1092×390×830", "1186×517×966", "1186×517×966", "1622×517×1031"] },
    ],
  },
  "부스터펌프(EH)": {
    models: ["EH250", "EH500", "EH1200", "EH2600", "EH4200"],
    rows: [
      { label: "배기속도 (60 Hz)", unit: "m³/h", values: ["375", "605", "1,435", "3,110", "4,985"] },
      { label: "모터 출력", unit: "kW", values: ["2.2", "2.2", "3.0", "11.0", "11.0"] },
      { label: "냉각 방식", unit: "", values: ["공냉", "공냉", "수냉", "수냉", "수냉"] },
      { label: "무게", unit: "kg", values: ["69", "106", "149", "401", "481"] },
      { label: "인렛 플랜지", unit: "", values: ["ISO63", "ISO100", "ISO160", "ISO160", "ISO250"] },
      { label: "외형 치수 (L×W×H)", unit: "mm", values: ["705×305×272", "791×305×265", "953×380×334", "1156×522×479", "1336×522×479"] },
    ],
  },
};

function formatKRW(v: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(v);
}

export default function ProductPanel({ item, onClose, catalogUrl }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [added, setAdded] = useState<Set<number>>(new Set());
  const [showSpec, setShowSpec] = useState(false);
  const [bizModalOpen, setBizModalOpen] = useState(false);
  const [bizNo, setBizNo] = useState("");
  const [bizLoading, setBizLoading] = useState(false);
  const [bizError, setBizError] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpContact, setOtpContact] = useState("");

  async function handleBizVerify(e: React.FormEvent) {
    e.preventDefault();
    setBizError("");
    setBizLoading(true);
    try {
      const res = await fetch("/api/auth/biz-login-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessNo: bizNo.replace(/[^0-9]/g, "") }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBizError(data.error ?? "유효하지 않은 사업자번호입니다.");
        return;
      }
      if (data.mode === "otp_sent") {
        setOtpContact(data.maskedPhone ?? data.maskedEmail ?? "등록된 연락처");
        setOtpStep(true);
        return;
      }
      const result = await signIn("credentials", {
        businessNo: bizNo.replace(/[^0-9]/g, ""),
        redirect: false,
      });
      if (result?.ok) { setBizModalOpen(false); window.location.reload(); }
      else { setBizError("로그인에 실패했습니다. 다시 시도해 주세요."); }
    } catch { setBizError("네트워크 오류가 발생했습니다."); }
    finally { setBizLoading(false); }
  }

  async function handleOtpVerify(e: React.FormEvent) {
    e.preventDefault();
    setBizError("");
    setBizLoading(true);
    try {
      const result = await signIn("credentials", { magicToken: otpCode.trim(), redirect: false });
      if (result?.ok) { setBizModalOpen(false); window.location.reload(); }
      else { setBizError("인증번호가 올바르지 않거나 만료됐습니다."); }
    } catch { setBizError("네트워크 오류가 발생했습니다."); }
    finally { setBizLoading(false); }
  }

  const specData = item ? SPEC_DATA[item.category] : undefined;

  // ESC: 스펙 패널 먼저 닫고, 없으면 메인 패널 닫기
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showSpec) setShowSpec(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, showSpec]);

  // 카테고리 바뀌면 제품 목록 새로 가져오기 + 스펙 패널 초기화
  useEffect(() => {
    if (!item) {
      setProducts([]);
      setShowSpec(false);
      return;
    }
    setLoading(true);
    setQuantities({});
    setAdded(new Set());
    setShowSpec(false);
    const params = new URLSearchParams({ category: item.category, limit: "200" });
    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [item?.category]);

  // 패널 열릴 때 배경 스크롤 막기
  useEffect(() => {
    if (item) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [item]);

  function addToQuote(product: Product, qty: number) {
    const stored: { productId: number; partNo: string; description: string; quantity: number }[] =
      JSON.parse(localStorage.getItem("quoteCart") ?? "[]");
    const existing = stored.find((i) => i.productId === product.id);
    if (existing) {
      existing.quantity += qty;
    } else {
      stored.push({
        productId: product.id,
        partNo: product.partNo,
        description: product.description,
        quantity: qty,
      });
    }
    localStorage.setItem("quoteCart", JSON.stringify(stored));
    window.dispatchEvent(new Event("quoteCartUpdated"));

    setAdded((prev) => new Set([...prev, product.id]));
    setTimeout(() => {
      setAdded((prev) => {
        const s = new Set(prev);
        s.delete(product.id);
        return s;
      });
    }, 2000);
  }

  if (!item) return null;

  return (
    <>
      {/* ── 우대가 확인 모달 ── */}
      {bizModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 px-4" onClick={() => setBizModalOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold text-smblue text-base">우대가 확인</p>
                <p className="text-[11px] text-gray-400 mt-0.5">사업자등록번호로 로그인 후 우대 금액 확인</p>
              </div>
              <button onClick={() => setBizModalOpen(false)} className="text-gray-300 hover:text-gray-500 text-xl leading-none">✕</button>
            </div>
            {!otpStep ? (
              <form onSubmit={handleBizVerify} className="space-y-3">
                <input type="text" value={bizNo} onChange={(e) => setBizNo(e.target.value)} required autoFocus
                  placeholder="사업자등록번호 10자리" maxLength={12}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-smblue/30 bg-gray-50" />
                {bizError && <p className="text-red-500 text-xs">{bizError}</p>}
                <button type="submit" disabled={bizLoading}
                  className="w-full bg-smblue hover:bg-smblue/90 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                  {bizLoading ? "확인 중..." : "로그인하기"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpVerify} className="space-y-3">
                <p className="text-[11px] text-gray-400">{otpContact}로 보낸 인증번호 6자리를 입력해주세요</p>
                <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))} required autoFocus
                  placeholder="인증번호 6자리" maxLength={6}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-center tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-smblue/30 bg-gray-50" />
                {bizError && <p className="text-red-500 text-xs">{bizError}</p>}
                <button type="submit" disabled={bizLoading}
                  className="w-full bg-smblue hover:bg-smblue/90 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                  {bizLoading ? "확인 중..." : "인증하고 로그인"}
                </button>
                <button type="button" onClick={() => { setOtpStep(false); setOtpCode(""); setBizError(""); }}
                  className="w-full text-[12px] text-gray-400 hover:text-gray-600 py-1">
                  ← 다시 입력하기
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── 스펙 비교 패널 ── */}
      {showSpec && specData && (
        <div className="fixed inset-0 md:inset-auto md:top-0 md:bottom-0 md:right-[480px] md:left-0 z-[60] bg-paper border-r hair flex flex-col shadow-2xl">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-5 py-4 border-b hair shrink-0">
            <div className="display text-[17px]">스펙 비교</div>
            <button
              onClick={() => setShowSpec(false)}
              className="text-[12px] mono text-dim hover:text-ink transition-colors"
            >
              닫기 →
            </button>
          </div>

          {/* 스펙 표 */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[14px]">
                <thead>
                  <tr className="bg-ink text-paper">
                    <th className="text-left px-4 py-3 mono text-[12px] tracking-wider w-[42%]">스펙 항목</th>
                    {specData.models.map((m) => (
                      <th key={m} className="px-3 py-3 text-center display text-[18px]">{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {specData.rows.map((row, i) => (
                    <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-paper"}>
                      <td className="px-4 py-3 text-[13px] text-[#2a2823] leading-snug">
                        {row.label}
                        {row.unit && <span className="block text-[11px] dim">{row.unit}</span>}
                      </td>
                      {row.values.map((v, j) => (
                        <td key={j} className="px-3 py-3 text-center mono text-[13px] tabular-nums">{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[10px] dim mono">※ 60 Hz 기준 (국내 전원). 카탈로그 원본 기준.</p>

            {/* 연락처 */}
            <div className="mt-6 border-t hair pt-5">
              <div className="mono text-[10px] tracking-widest text-dim mb-3">수량 · 납기 · 커스텀 사양 문의</div>
              <div className="flex flex-col gap-2">
                <a href="tel:031-204-7170" className="flex items-center gap-2 group">
                  <span className="bg-edred text-paper mono text-[11px] px-2.5 py-1 tracking-wider">CALL</span>
                  <span className="display text-[18px] group-hover:text-edred transition-colors">031-204-7170</span>
                </a>
                <a href="mailto:info@smartechvacuum.com" className="flex items-center gap-2 group">
                  <span className="bg-ink text-paper mono text-[11px] px-2.5 py-1 tracking-wider">MAIL</span>
                  <span className="mono text-[13px] text-dim group-hover:text-ink transition-colors">info@smartechvacuum.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 메인 패널 ── */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[480px] bg-paper border-l hair flex flex-col shadow-2xl">

        {/* 헤더 */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b hair shrink-0">
          <div>
            <div className="mono text-[10px] tracking-[0.16em] uppercase text-dim">{item.code}</div>
            <h2 className="display text-[22px] leading-tight mt-1">{item.title}</h2>
            <div className="mono text-[11px] text-dim mt-1">{item.category}</div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 ml-4 w-8 h-8 flex items-center justify-center border hair hover:bg-ink hover:text-paper transition-colors text-[18px] leading-none"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* 이미지 + 버튼 */}
        <div className="px-6 py-5 border-b hair bg-white shrink-0">
          <div className="aspect-[3/2] relative">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-contain"
              sizes="480px"
              priority={false}
            />
          </div>
          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {specData && (
                <button
                  onClick={() => setShowSpec(!showSpec)}
                  className="text-[11px] mono text-ink hover:text-edred transition-colors"
                >
                  ← 스펙 비교
                </button>
              )}
              {catalogUrl && (
                <a
                  href={catalogUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] mono text-edred hover:underline font-medium tracking-[0.06em]"
                >
                  카탈로그 PDF →
                </a>
              )}
            </div>
            {products.some(p => p.priceStatus === "login") && (
              <button
                onClick={() => setBizModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-edred text-paper text-[11px] font-semibold rounded-full hover:bg-edred3 transition-colors whitespace-nowrap"
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-paper shrink-0" />
                우대가 확인
              </button>
            )}
          </div>
        </div>

        {/* 제품 목록 — 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-14 bg-line/50 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-6 text-center text-dim text-sm">
              제품 정보를 불러올 수 없습니다.
            </div>
          ) : (
            <div className="divide-y hair">
              {products.map((product) => {
                const qty = quantities[product.id] ?? 1;
                const isAdded = added.has(product.id);
                return (
                  <div
                    key={product.id}
                    className={`px-4 py-3 transition-colors ${
                      isAdded ? "bg-ink/[0.03]" : "hover:bg-edred/[0.03]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* 제품 정보 */}
                      <div className="flex-1 min-w-0">
                        {product.isImportant && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-edred mr-1.5 mb-0.5 align-middle" />
                        )}
                        <span className="mono text-[11px] text-dim">{product.partNo}</span>
                        <div className="text-[13px] leading-snug mt-0.5">{product.description}</div>
                        <div className="mt-1">
                          {product.priceStatus === "visible" && product.displayPrice ? (
                            <span className="mono text-[12px] font-semibold">
                              {formatKRW(product.displayPrice)}
                            </span>
                          ) : product.priceStatus === "pending" ? (
                            <span className="mono text-[11px] text-dim">승인 대기</span>
                          ) : (
                            <button
                              onClick={() => setBizModalOpen(true)}
                              className="flex items-center gap-1 text-[11px] text-edred font-medium hover:opacity-75 transition-opacity"
                            >
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-edred shrink-0" />
                              우대가 확인
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 수량 + 담기 */}
                      <div className="flex flex-col items-end gap-1 shrink-0 mt-0.5">
                      {product.priceStatus === "login" && (
                        <button
                          onClick={() => setBizModalOpen(true)}
                          className="flex items-center gap-1 text-[10px] text-edred font-semibold hover:opacity-75 transition-opacity whitespace-nowrap"
                        >
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-edred shrink-0" />
                          우대가 확인
                        </button>
                      )}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={1}
                          value={qty}
                          onChange={(e) =>
                            setQuantities((prev) => ({
                              ...prev,
                              [product.id]: Math.max(1, parseInt(e.target.value) || 1),
                            }))
                          }
                          className="w-12 border hair px-1 py-1.5 text-[12px] text-center focus:outline-none focus:border-ink bg-transparent"
                          aria-label="수량"
                        />
                        <button
                          onClick={() => addToQuote(product, qty)}
                          className={`px-2.5 py-1.5 text-[11px] mono tracking-wider border transition-colors whitespace-nowrap ${
                            isAdded
                              ? "bg-ink text-paper border-ink"
                              : "border-ink/40 hover:bg-ink hover:text-paper hover:border-ink"
                          }`}
                        >
                          {isAdded ? "✓" : "담기"}
                        </button>
                      </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="px-6 py-3 border-t hair shrink-0">
          <div className="mono text-[10px] text-dim">
            ※ 로그인 시 우대 가격 적용 · 가격은 VAT 별도
          </div>
        </div>
      </div>
    </>
  );
}
