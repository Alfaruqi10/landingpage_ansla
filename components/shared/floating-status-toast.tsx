"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export function FloatingStatusToast({
  status,
  message,
  onDismiss
}: {
  status?: string;
  message?: string;
  onDismiss?: () => void;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!status || !message) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    const timeoutId = window.setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 4500);

    return () => window.clearTimeout(timeoutId);
  }, [message, onDismiss, status]);

  if (!status || !message || !isVisible) {
    return null;
  }

  const isSuccess = status === "success";

  return (
    <div className="pointer-events-none fixed inset-x-4 top-4 z-[80] flex justify-center sm:top-5">
      <div
        className={cn(
          "pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur",
          isSuccess
            ? "border-emerald-200 bg-emerald-50/95 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/95 dark:text-emerald-100"
            : "border-rose-200 bg-rose-50/95 text-rose-900 dark:border-rose-900 dark:bg-rose-950/95 dark:text-rose-100"
        )}
      >
        <div className="mt-0.5 shrink-0">
          {isSuccess ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
        </div>
        <p className="flex-1 text-sm leading-6">{message}</p>
        <button
          type="button"
          onClick={() => {
            setIsVisible(false);
            onDismiss?.();
          }}
          className="shrink-0 rounded-full p-1 opacity-70 transition hover:opacity-100"
          aria-label="Tutup notifikasi"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
