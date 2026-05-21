"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type RepairFile = { fileType: string; fileName: string; fileUrl: string };
type StatusLog = { toStatus: string; createdAt: string };
type Repair = {
  id: number;
  repairNo: string;
  pumpMaker: string;
  pumpModel: string;
  status: string;
  baseAmount: number;
  totalAmount: number;
  symptoms: string[];
  symptomNote: string | null;
  contactName: string;
  createdAt: string;
  files: RepairFile[];
  statusLogs: StatusLog[];
};

const STATUS_STEPS = [
  { key: "RECEIVED",    label: "접수완료" },
  { key: "IN_PROGRESS", label: "수리진행" },
  { key: "INSPECTION",  label: "검사중" },
  { key: "COMPLETED",   label: "수리완료" },
  { key: "DELIVERED",   label: "납품완료" },
];

const STATUS_BADGE: Record<string, string> = {
  RECEIVED:    "bg-blue-50 text-blue-700",
  IN_PROGRESS: "bg-yellow-50 text-yellow-700",
  INSPECTION:  "bg-purple-50 text-purple-700",
  COMPLETED:   "bg-green-50 text-green-700",
  DELIVERED:   "bg-ink/10 text-dim",
  CANCELLED:   "bg-red-50 text-red-700",
};

const STATUS_LABEL: Record<string, string> = {
  RECEIVED:    "접수완료",
  IN_PROGRESS: "수리진행 중",
  INSPECTION:  "검사 중",
  COMPLETED:   "수리완료",
  DELIVERED:   "납품완료",
  CANCELLED:   "취소",
};

const FILE_LABELS: Record<string, string> = {
  disassembly_photo: "분해 사진",
  inspection_cert:   "검사 성적서",
  quote_pdf:         "견적서",
  delivery_note:     "거래명세표",
};

function formatPrice(n: number) {
  return n > 0 ? n.toLocaleString("ko-KR") + "원" : "상담 후 확정";
}
function formatDate(s: string) {
  const d = new Date(s);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function MypagePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/login");
      return;
    }
    fetch("/api/repair")
      .then((r) => r.json())
      .then((d) => setRepairs(d.repairs ?? []))
      .finally(() => setLoading(false));
  }, [session, status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="mono text-[12px] text-dim tracking-widest animate-pulse">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* 페이지 헤더 */}
      <div className="border-b border-line">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="mono text-[10px] text-dim tracking-widest mb-1">MY PAGE</div>
          <h1 className="text-[26px] font-bold tracking-tight">수리 접수 현황</h1>
          {session?.user?.name && (
            <p className="text-[14px] text-dim mt-1">{session.user.name}님의 수리 이력</p>
          )}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {repairs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-[48px] mb-4 text-dim">○</div>
            <p className="text-[15px] font-medium mb-1">수리 접수 내역이 없습니다.</p>
            <p className="text-[13px] text-dim mb-6">수리가 필요한 장비가 있으신가요?</p>
            <button
              onClick={() => router.push("/repair")}
              className="px-6 py-2.5 bg-ink text-paper text-[13px] font-semibold hover:bg-edred transition"
            >
              수리 접수 신청 →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {repairs.map((r) => {
              const isOpen = openId === r.id;
              const completedKeys = new Set(r.statusLogs.map((l) => l.toStatus));
              const isCancelled = r.status === "CANCELLED";

              // 파일을 종류별로 그룹화
              const fileGroups: Record<string, RepairFile[]> = {};
              for (const f of r.files) {
                if (!fileGroups[f.fileType]) fileGroups[f.fileType] = [];
                fileGroups[f.fileType].push(f);
              }
              const hasFiles = r.files.length > 0;

              return (
                <div key={r.id} className="border border-line">
                  {/* 카드 헤더 — 클릭으로 열고 닫기 */}
                  <button
                    onClick={() => setOpenId(isOpen ? null : r.id)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-ink/5 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="mono text-[11px] text-dim mb-0.5">{r.repairNo}</div>
                        <div className="font-semibold text-[15px]">
                          {r.pumpMaker} {r.pumpModel}
                        </div>
                        <div className="text-[12px] text-dim mt-0.5">{formatDate(r.createdAt)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {hasFiles && (
                        <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 font-medium">
                          파일 {r.files.length}개
                        </span>
                      )}
                      <span className={`text-[11px] px-2.5 py-1 font-semibold ${STATUS_BADGE[r.status] ?? ""}`}>
                        {STATUS_LABEL[r.status] ?? r.status}
                      </span>
                      <span className="text-dim text-[16px] leading-none">{isOpen ? "∧" : "∨"}</span>
                    </div>
                  </button>

                  {/* 아코디언 상세 */}
                  {isOpen && (
                    <div className="border-t border-line px-5 py-5 space-y-6">

                      {/* 상태 타임라인 */}
                      {!isCancelled && (
                        <div>
                          <div className="mono text-[10px] text-dim tracking-widest mb-4">진행 현황</div>
                          <div className="flex items-center">
                            {STATUS_STEPS.map((step, i) => {
                              const done = completedKeys.has(step.key);
                              const isCurrent = r.status === step.key;
                              return (
                                <div key={step.key} className="flex items-center flex-1 last:flex-none">
                                  <div className="flex flex-col items-center">
                                    <div
                                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] font-bold transition ${
                                        isCurrent
                                          ? "border-edred bg-edred text-paper"
                                          : done
                                          ? "border-ink bg-ink text-paper"
                                          : "border-line bg-paper text-dim"
                                      }`}
                                    >
                                      {done && !isCurrent ? "✓" : i + 1}
                                    </div>
                                    <div
                                      className={`text-[10px] mt-1.5 text-center leading-tight ${
                                        isCurrent ? "text-edred font-semibold" : done ? "text-ink" : "text-dim"
                                      }`}
                                    >
                                      {step.label}
                                    </div>
                                  </div>
                                  {i < STATUS_STEPS.length - 1 && (
                                    <div
                                      className={`flex-1 h-0.5 mb-5 mx-1 ${
                                        completedKeys.has(STATUS_STEPS[i + 1].key) ? "bg-ink" : "bg-line"
                                      }`}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {isCancelled && (
                        <div className="bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-700">
                          이 접수는 취소되었습니다. 문의: 031-204-7170
                        </div>
                      )}

                      {/* 접수 정보 */}
                      <div className="border border-line p-4 space-y-2 text-[13px]">
                        <div className="mono text-[10px] text-dim tracking-widest mb-2">접수 정보</div>
                        <InfoRow label="장비" value={`${r.pumpMaker} ${r.pumpModel}`} />
                        {r.symptoms.length > 0 && (
                          <InfoRow label="증상" value={r.symptoms.join(", ")} />
                        )}
                        {r.symptomNote && (
                          <InfoRow label="메모" value={r.symptomNote} />
                        )}
                        <InfoRow label="견적" value={formatPrice(r.totalAmount)} />
                      </div>

                      {/* 파일 다운로드 */}
                      {hasFiles && (
                        <div className="border border-line p-4 text-[13px]">
                          <div className="mono text-[10px] text-dim tracking-widest mb-3">문서 다운로드</div>
                          <div className="space-y-2">
                            {Object.entries(fileGroups).map(([type, files]) => (
                              <div key={type}>
                                <div className="text-[11px] text-dim mb-1.5">
                                  {FILE_LABELS[type] ?? type}
                                </div>
                                {files.map((f, i) => (
                                  <div key={i} className="flex items-center gap-2 border border-line px-3 py-2 mb-1">
                                    <span className="text-green-600 text-[11px]">✓</span>
                                    <span className="flex-1 truncate text-[12px]">{f.fileName}</span>
                                    {f.fileUrl.startsWith("http") ? (
                                      <a
                                        href={f.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[11px] text-edred font-medium hover:underline shrink-0"
                                      >
                                        다운로드
                                      </a>
                                    ) : (
                                      <span className="text-[11px] text-dim shrink-0">준비 중</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 문의 */}
                      <p className="text-[12px] text-dim text-center">
                        수리 관련 문의:{" "}
                        <a href="tel:031-204-7170" className="text-edred hover:underline">
                          031-204-7170
                        </a>
                      </p>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-dim w-12 shrink-0 text-[12px]">{label}</span>
      <span className="flex-1 font-medium">{value}</span>
    </div>
  );
}
