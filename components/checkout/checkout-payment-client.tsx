"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, RefreshCw, ShieldCheck } from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
import { StatusBanner } from "@/components/shared/status-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PAYMENT_STATUS } from "@/lib/payment-status";
import { regenerateQrisPaymentAction } from "@/lib/actions/checkout-actions";
import { formatCurrency, formatDate } from "@/lib/utils";

type CheckoutPaymentClientProps = {
  orderId: string;
  orderNumber: string;
  token: string;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  paymentStatusLabel: string;
  paymentStatusTone: string;
  paymentQrUrl?: string | null;
  paymentExpiresAt?: string | null;
  status?: string;
  message?: string;
};

type LivePaymentState = {
  orderStatus: string;
  paymentStatus: string;
  paymentStatusLabel: string;
  paymentStatusTone: string;
  paymentQrUrl?: string | null;
  paymentExpiresAt?: string | null;
  paidAt?: string | null;
};

function formatRemainingTime(expiresAt?: string | null) {
  if (!expiresAt) {
    return "";
  }

  const diffMs = new Date(expiresAt).getTime() - Date.now();

  if (diffMs <= 0) {
    return "00:00";
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function CheckoutPaymentClient({
  orderId,
  orderNumber,
  token,
  total,
  orderStatus,
  paymentStatus,
  paymentStatusLabel,
  paymentStatusTone,
  paymentQrUrl,
  paymentExpiresAt,
  status,
  message
}: CheckoutPaymentClientProps) {
  const router = useRouter();
  const { clearCart, clearBuyNow } = useCart();
  const [liveState, setLiveState] = useState<LivePaymentState>({
    orderStatus,
    paymentStatus,
    paymentStatusLabel,
    paymentStatusTone,
    paymentQrUrl,
    paymentExpiresAt
  });
  const [countdownTick, setCountdownTick] = useState(() => Date.now());
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [checkError, setCheckError] = useState("");
  const countdown = countdownTick ? formatRemainingTime(liveState.paymentExpiresAt) : "";

  useEffect(() => {
    clearCart();
    clearBuyNow();

    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("ansla-checkout-draft-cart");
      window.sessionStorage.removeItem("ansla-checkout-draft-buy-now");
    }
  }, [clearBuyNow, clearCart]);

  useEffect(() => {
    if (liveState.paymentStatus === PAYMENT_STATUS.PAID) {
      router.replace(`/checkout/success?order=${encodeURIComponent(orderNumber)}&payment=QRIS&settled=1`);
    }
  }, [liveState.paymentStatus, orderNumber, router]);

  useEffect(() => {
    if (
      liveState.paymentStatus !== PAYMENT_STATUS.PENDING &&
      liveState.paymentStatus !== PAYMENT_STATUS.REVIEW
    ) {
      return;
    }

    const intervalId = window.setInterval(async () => {
      try {
        const response = await fetch(
          `/api/orders/${encodeURIComponent(orderNumber)}/payment-status?token=${encodeURIComponent(token)}`,
          {
            cache: "no-store"
          }
        );
        const payload = (await response.json()) as
          | {
              order?: LivePaymentState;
              error?: string;
            }
          | undefined;

        if (response.ok && payload?.order) {
          setLiveState(payload.order);
        }
      } catch {
        return;
      }
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [liveState.paymentStatus, orderNumber, token]);

  useEffect(() => {
    if (!liveState.paymentExpiresAt || liveState.paymentStatus !== PAYMENT_STATUS.PENDING) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCountdownTick(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [liveState.paymentExpiresAt, liveState.paymentStatus]);

  async function handleCheckStatus() {
    try {
      setIsCheckingStatus(true);
      setCheckError("");

      const response = await fetch(
        `/api/orders/${encodeURIComponent(orderNumber)}/payment-status?token=${encodeURIComponent(token)}`,
        {
          cache: "no-store"
        }
      );
      const payload = (await response.json()) as
        | {
            order?: LivePaymentState;
            error?: string;
          }
        | undefined;

      if (!response.ok || !payload?.order) {
        throw new Error(payload?.error || "Status pembayaran belum bisa diperiksa.");
      }

      setLiveState(payload.order);
    } catch (error) {
      setCheckError(
        error instanceof Error ? error.message : "Status pembayaran belum bisa diperiksa."
      );
    } finally {
      setIsCheckingStatus(false);
    }
  }

  const isPending =
    liveState.paymentStatus === PAYMENT_STATUS.PENDING ||
    liveState.paymentStatus === PAYMENT_STATUS.REVIEW;
  const isRetryable =
    liveState.paymentStatus === PAYMENT_STATUS.EXPIRED ||
    liveState.paymentStatus === PAYMENT_STATUS.FAILED ||
    liveState.paymentStatus === PAYMENT_STATUS.CANCELLED;

  return (
    <div className="surface-panel mx-auto max-w-5xl p-6 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="section-eyebrow">Pembayaran QRIS</p>
              <h1 className="mt-1 text-3xl">Selesaikan pembayaran pesanan Anda</h1>
            </div>
          </div>

          <StatusBanner className="mt-5" status={status} message={message} />

          {checkError ? (
            <StatusBanner className="mt-4" status="error" message={checkError} />
          ) : null}

          <div className="mt-6 space-y-4">
            <div className="rounded-[1.3rem] border border-border/70 bg-[hsl(var(--background)/0.45)] p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={liveState.paymentStatusTone} variant="outline">
                  {liveState.paymentStatusLabel}
                </Badge>
                <Badge variant="secondary">{liveState.orderStatus}</Badge>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Nomor pesanan</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{orderNumber}</p>
              <div className="mt-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total pembayaran</p>
                  <p className="mt-1 text-3xl font-semibold text-foreground">
                    {formatCurrency(total)}
                  </p>
                </div>
                {liveState.paymentExpiresAt ? (
                  <div className="rounded-full border border-border/70 px-4 py-2 text-right">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5" />
                      Countdown
                    </div>
                    <p className="mt-1 text-lg font-semibold text-foreground">{countdown}</p>
                  </div>
                ) : null}
              </div>
              {liveState.paymentExpiresAt ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Berlaku sampai {formatDate(liveState.paymentExpiresAt)}.
                </p>
              ) : null}
            </div>

            <div className="rounded-[1.3rem] border border-border/70 bg-[hsl(var(--background)/0.45)] p-5">
              <p className="text-sm font-medium text-foreground">Cara bayar</p>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <p>1. Buka aplikasi m-banking atau e-wallet yang mendukung QRIS.</p>
                <p>2. Scan QR yang tampil di halaman ini.</p>
                <p>3. Pastikan nominal dan nama merchant benar, lalu selesaikan pembayaran.</p>
                <p>4. Halaman ini akan mengecek status pembayaran Anda secara otomatis.</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                size="lg"
                className="h-12"
                onClick={handleCheckStatus}
                disabled={isCheckingStatus}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isCheckingStatus ? "animate-spin" : ""}`} />
                Cek Status Sekarang
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12">
                <Link href="/">Kembali ke Beranda</Link>
              </Button>
            </div>

            {isRetryable ? (
              <form action={regenerateQrisPaymentAction}>
                <input type="hidden" name="orderId" value={orderId} />
                <input type="hidden" name="orderNumber" value={orderNumber} />
                <input type="hidden" name="token" value={token} />
                <Button type="submit" variant="secondary" size="lg" className="h-12 w-full sm:w-auto">
                  Buat QRIS Baru
                </Button>
              </form>
            ) : null}
          </div>
        </div>

        <div className="surface-panel flex min-h-[420px] flex-col items-center justify-center p-6 text-center">
          {liveState.paymentQrUrl && isPending ? (
            <>
              <div className="rounded-[2rem] border border-border/70 bg-white p-5 shadow-sm">
                <Image
                  src={liveState.paymentQrUrl}
                  alt={`QRIS ${orderNumber}`}
                  width={320}
                  height={320}
                  className="h-auto w-full max-w-[320px] rounded-[1.4rem]"
                  unoptimized
                />
              </div>
              <p className="mt-5 text-lg text-foreground">Scan QRIS untuk membayar pesanan ini</p>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Jika pembayaran sudah selesai, status akan berubah otomatis. Anda juga bisa tekan
                tombol cek status kapan saja.
              </p>
            </>
          ) : liveState.paymentStatus === PAYMENT_STATUS.PAID ? (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <p className="mt-5 text-2xl text-foreground">Pembayaran berhasil diterima</p>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Anda sedang diarahkan ke halaman sukses pembayaran.
              </p>
            </>
          ) : (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-stone-700">
                <Clock3 className="h-8 w-8" />
              </div>
              <p className="mt-5 text-2xl text-foreground">QRIS belum siap ditampilkan</p>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Biasanya ini terjadi karena sesi pembayaran belum terbentuk, sudah kedaluwarsa,
                atau perlu dibuka ulang.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
