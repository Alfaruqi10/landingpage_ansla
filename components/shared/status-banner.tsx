import { AlertCircle, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

export function StatusBanner({
  status,
  message,
  className
}: {
  status?: string;
  message?: string;
  className?: string;
}) {
  if (!status || !message) {
    return null;
  }

  const isSuccess = status === "success";

  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm",
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200"
          : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {isSuccess ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
        <span>{message}</span>
      </div>
    </div>
  );
}
