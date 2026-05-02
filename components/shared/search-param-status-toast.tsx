"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { FloatingStatusToast } from "@/components/shared/floating-status-toast";

export function SearchParamStatusToast() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || undefined;
  const message = searchParams.get("message") || undefined;
  const [toastState, setToastState] = useState<{ status?: string; message?: string }>({});

  useEffect(() => {
    if (!status || !message) {
      return;
    }

    setToastState({ status, message });

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("status");
    nextParams.delete("message");

    const nextQuery = nextParams.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    window.history.replaceState({}, "", nextUrl);
  }, [message, pathname, searchParams, status]);

  return (
    <FloatingStatusToast
      status={toastState.status}
      message={toastState.message}
      onDismiss={() => setToastState({})}
    />
  );
}
