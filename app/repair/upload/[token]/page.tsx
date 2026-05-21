"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

type TokenInfo = {
  repairNo: string;
  pumpMaker: string;
  pumpModel: string;
  expiresAt: string;
};

type UploadedFile = { fileName: string; fileUrl: string };

const FILE_TYPES = [
  {
    id: "disassembly_photo",
    label: "분해 사진",
    sub: "분해 전·후 사진 (JPG, PNG)",
    accept: "image/*",
    multiple: true,
  },
  {
    id: "inspection_cert",
    label: "검사 성적서",
    sub: "Final Test Inspection Sheet (PDF, JPG, PNG)",
    accept: ".pdf,image/*",
    multiple: true,
  },
];

export default function PartnerUploadPage() {
  const { token } = useParams<{ token: string }>();
  const [info, setInfo] = useState<TokenInfo | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploaded, setUploaded] = useState<Record<string, UploadedFile[]>>({});
  const [done, setDone] = useState(false);

  const verify = useCallback(async () => {
    try {
      const res = await fetch(`/api/repair/upload/${token}`);
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "오류가 발생했습니다.");
      } else {
        setInfo(await res.json());
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { verify(); }, [verify]);

  async function upload(fileType: string, files: FileList) {
    if (!files.length) return;
    setUploading((u) => ({ ...u, [fileType]: true }));

    const formData = new FormData();
    formData.append("fileType", fileType);
    Array.from(files).forEach((f) => formData.append("files", f));

    try {
      const res = await fetch(`/api/repair/upload/${token}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUploaded((u) => ({
        ...u,
        [fileType]: [...(u[fileType] ?? []), ...data.saved],
      }));
    } catch (e) {
      alert((e as Error).message ?? "업로드 실패");
    } finally {
      setUploading((u) => ({ ...u, [fileType]: false }));
    }
  }

  const totalUploaded = Object.values(uploaded).flat().length;

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="mono text-[12px] text-dim tracking-widest animate-pulse">LOADING...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <div className="text-[48px] mb-4">⚠</div>
          <div className="text-[18px] font-bold mb-2">링크 오류</div>
          <p className="text-dim text-[14px] leading-relaxed">{error}</p>
          <p className="text-dim text-[12px] mt-4">문의: 031-204-7170</p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <div className="text-[48px] mb-4">✓</div>
          <div className="text-[22px] font-bold mb-2">업로드 완료</div>
          <p className="text-dim text-[14px] leading-relaxed mb-4">
            총 {totalUploaded}개 파일이 업로드되었습니다.<br />
            담당자에게 자동으로 알림이 전송되었습니다.
          </p>
          <div className="border border-line p-4 text-left text-[13px] space-y-1.5">
            <div className="flex justify-between">
              <span className="text-dim">접수번호</span>
              <span className="font-mono font-semibold">{info?.repairNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dim">장비</span>
              <span className="font-semibold">{info?.pumpMaker} {info?.pumpModel}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* 헤더 */}
      <div className="border-b border-line bg-ink text-paper">
        <div className="max-w-2xl mx-auto px-6 py-5">
          <div className="mono text-[10px] tracking-widest text-paper/50 mb-1">SMARTECH · PARTNER UPLOAD</div>
          <div className="text-[20px] font-bold tracking-tight">파일 업로드</div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* 접수 정보 */}
        <div className="border border-line p-5 mb-8 flex items-center justify-between">
          <div>
            <div className="mono text-[10px] text-dim tracking-widest mb-1">접수번호</div>
            <div className="text-[18px] font-bold mono">{info?.repairNo}</div>
          </div>
          <div className="text-right">
            <div className="text-[14px] font-semibold">{info?.pumpMaker} {info?.pumpModel}</div>
            <div className="text-[11px] text-dim mono mt-0.5">
              만료: {info?.expiresAt ? new Date(info.expiresAt).toLocaleDateString("ko-KR") : ""}
            </div>
          </div>
        </div>

        {/* 안내 */}
        <div className="bg-ink/5 border border-line p-4 mb-8 text-[13px] leading-relaxed text-dim">
          분해 사진과 검사 성적서를 업로드해 주세요.<br />
          업로드 완료 시 담당자에게 자동으로 알림이 발송됩니다.
        </div>

        {/* 업로드 섹션 */}
        <div className="space-y-6">
          {FILE_TYPES.map((ft) => {
            const isUploading = uploading[ft.id];
            const files = uploaded[ft.id] ?? [];

            return (
              <div key={ft.id} className="border border-line">
                {/* 섹션 헤더 */}
                <div className="px-5 py-4 border-b border-line flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-[14px]">{ft.label}</div>
                    <div className="text-[11px] text-dim mt-0.5">{ft.sub}</div>
                  </div>
                  {files.length > 0 && (
                    <span className="text-[11px] bg-green-50 text-green-700 px-2 py-1 font-semibold">
                      {files.length}개 완료
                    </span>
                  )}
                </div>

                <div className="p-5">
                  {/* 드래그앤드롭 영역 */}
                  <label
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-none cursor-pointer transition py-10 ${
                      isUploading
                        ? "border-ink/30 bg-ink/5 cursor-wait"
                        : "border-line hover:border-ink hover:bg-ink/5"
                    }`}
                  >
                    <input
                      type="file"
                      className="hidden"
                      accept={ft.accept}
                      multiple={ft.multiple}
                      disabled={isUploading}
                      onChange={(e) => e.target.files && upload(ft.id, e.target.files)}
                    />
                    {isUploading ? (
                      <div className="flex items-center gap-2 text-[13px] text-dim">
                        <span className="animate-spin w-4 h-4 border-2 border-dim/30 border-t-ink rounded-full inline-block" />
                        업로드 중...
                      </div>
                    ) : (
                      <>
                        <div className="text-[32px] mb-2 text-dim">↑</div>
                        <div className="text-[14px] font-medium">클릭하여 파일 선택</div>
                        <div className="text-[12px] text-dim mt-1">또는 파일을 여기로 드래그</div>
                      </>
                    )}
                  </label>

                  {/* 업로드된 파일 목록 */}
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {files.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-[12px] border border-line px-3 py-2">
                          <span className="text-green-600">✓</span>
                          <span className="flex-1 truncate">{f.fileName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 완료 버튼 */}
        <div className="mt-8">
          <button
            disabled={totalUploaded === 0}
            onClick={() => setDone(true)}
            className="w-full py-4 bg-ink text-paper font-semibold text-[14px] hover:bg-edred transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            업로드 완료 →
          </button>
          <p className="text-[11px] text-dim text-center mt-3">
            완료 버튼을 누르면 담당자에게 알림이 전송됩니다.
          </p>
        </div>
      </main>
    </div>
  );
}
