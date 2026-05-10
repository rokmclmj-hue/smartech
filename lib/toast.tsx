"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ConfirmRequest {
  message: string;
  detail?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  resolve: (value: boolean) => void;
}

interface ToastApi {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  confirm: (opts: {
    message: string;
    detail?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
  }) => Promise<boolean>;
}

const ToastCtx = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmReq, setConfirmReq] = useState<ConfirmRequest | null>(null);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => removeToast(id), 4000);
    },
    [removeToast]
  );

  const success = useCallback((message: string) => toast(message, "success"), [toast]);
  const error = useCallback((message: string) => toast(message, "error"), [toast]);
  const info = useCallback((message: string) => toast(message, "info"), [toast]);

  const confirm = useCallback<ToastApi["confirm"]>(
    (opts) =>
      new Promise<boolean>((resolve) => {
        setConfirmReq({ ...opts, resolve });
      }),
    []
  );

  function handleConfirm(value: boolean) {
    if (confirmReq) {
      confirmReq.resolve(value);
      setConfirmReq(null);
    }
  }

  return (
    <ToastCtx.Provider value={{ toast, success, error, info, confirm }}>
      {children}

      {/* Toasts */}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => removeToast(t.id)}
            className={`pointer-events-auto cursor-pointer max-w-sm border px-4 py-3 shadow-lg backdrop-blur transition-all ${
              t.type === "success"
                ? "bg-ink/95 text-paper border-ink"
                : t.type === "error"
                ? "bg-edred text-paper border-edred"
                : "bg-paper/95 text-ink border-line"
            }`}
            role="status"
          >
            <div className="flex items-start gap-2">
              <span className="mono text-[10px] tracking-[0.15em] uppercase opacity-70">
                {t.type === "success"
                  ? "OK"
                  : t.type === "error"
                  ? "ERR"
                  : "INFO"}
              </span>
              <span className="text-[13px] leading-snug">{t.message}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Confirm dialog */}
      {confirmReq && (
        <div
          className="fixed inset-0 z-[101] bg-ink/40 flex items-center justify-center p-4"
          onClick={() => handleConfirm(false)}
        >
          <div
            className="bg-paper border hair max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="mono text-[10px] dim tracking-[0.15em] uppercase mb-3">
              {confirmReq.destructive ? "— Destructive" : "— Confirm"}
            </div>
            <p className="text-[15px] text-ink mb-2">{confirmReq.message}</p>
            {confirmReq.detail && (
              <p className="text-[12px] dim mb-4">{confirmReq.detail}</p>
            )}
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => handleConfirm(false)}
                className="mono text-[11px] tracking-[0.1em] uppercase border border-line text-dim px-4 py-2 hover:border-ink hover:text-ink transition-colors"
              >
                {confirmReq.cancelLabel ?? "취소"}
              </button>
              <button
                onClick={() => handleConfirm(true)}
                className={`mono text-[11px] tracking-[0.1em] uppercase px-4 py-2 transition-colors ${
                  confirmReq.destructive
                    ? "bg-edred text-paper hover:bg-edred2"
                    : "bg-ink text-paper hover:bg-edred"
                }`}
              >
                {confirmReq.confirmLabel ?? "확인"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastCtx.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
