"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { parseSelectedTransferBank, siteConfig } from "@/lib/site";
import { buildWhatsAppLink } from "@/lib/utils";

type CheckoutBankAccount = {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
};

export function CheckoutSuccessClient({
  mode,
  orderNumber,
  paymentMethod,
  paymentProofState,
  hasSettledPayment,
  bankAccounts
}: {
  mode?: string;
  orderNumber?: string;
  paymentMethod?: string;
  paymentProofState?: string;
  hasSettledPayment?: boolean;
  bankAccounts: CheckoutBankAccount[];
}) {
  const { clearCart, clearBuyNow } = useCart();
  const isBankTransfer = paymentMethod?.startsWith("Transfer Bank") ?? false;
  const isQrisPayment = paymentMethod === "QRIS";
  const requiresPaymentConfirmation = (isBankTransfer || isQrisPayment) && !hasSettledPayment;
  const hasUploadedPaymentProof = paymentProofState === "uploaded";
  const selectedTransferBank = parseSelectedTransferBank(paymentMethod);
  const fallbackAccount = bankAccounts[0] || siteConfig.paymentAccount;
  const matchedAccount = bankAccounts.find(
    (account) => account.bankName.toLowerCase() === selectedTransferBank.toLowerCase()
  );
  const transferDestination = {
    account: matchedAccount || fallbackAccount,
    usesFallback: Boolean(selectedTransferBank && !matchedAccount)
  };
  const paymentConfirmationLink = buildWhatsAppLink(
    siteConfig.whatsappNumber,
    [
      "Assalamu'alaikum, saya ingin konfirmasi pembayaran pesanan ANSLA.",
      orderNumber ? `Nomor order: ${orderNumber}` : null,
      paymentMethod ? `Metode pembayaran: ${paymentMethod}` : null,
      "Saya sudah melakukan pembayaran dan siap mengirim bukti transfer."
    ]
      .filter(Boolean)
      .join("\n")
  );

  useEffect(() => {
    if (mode === "buy-now") {
      clearBuyNow();
      return;
    }

    clearCart();
    clearBuyNow();
  }, [clearBuyNow, clearCart, mode]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (mode === "buy-now") {
      window.sessionStorage.removeItem("ansla-checkout-draft-buy-now");
      return;
    }

    window.sessionStorage.removeItem("ansla-checkout-draft-cart");
    window.sessionStorage.removeItem("ansla-checkout-draft-buy-now");
  }, [mode]);

  return (
    <div className="surface-panel mx-auto max-w-3xl p-8 text-center sm:p-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <p className="section-eyebrow mt-6">
        {hasSettledPayment
          ? "Pembayaran berhasil diterima"
          : hasUploadedPaymentProof
          ? "Menunggu verifikasi pembayaran"
          : requiresPaymentConfirmation
            ? "Menunggu pembayaran"
            : "Pesanan berhasil masuk"}
      </p>
      <h1 className="mt-3 text-4xl">
        {hasSettledPayment
          ? "Pembayaran QRIS Anda sudah masuk"
          : hasUploadedPaymentProof
          ? "Bukti pembayaran Anda sudah masuk"
          : requiresPaymentConfirmation
          ? "Pesanan Anda sudah masuk, tinggal selesaikan pembayaran"
          : "Pesanan Anda sudah masuk"}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        {hasSettledPayment
          ? "Pembayaran sudah masuk otomatis. Pesanan Anda siap lanjut ke proses admin dan pengemasan."
          : hasUploadedPaymentProof
          ? "Bukti pembayaran Anda akan dicek terlebih dulu. Setelah pembayaran terverifikasi, pesanan akan lanjut diproses."
          : isBankTransfer
          ? "Pesanan belum selesai sampai pembayaran diterima. Silakan transfer sesuai total belanja, lalu kirim bukti transfer agar order bisa segera diproses."
          : isQrisPayment
            ? "Pesanan belum selesai sampai pembayaran QRIS diterima. Lanjutkan pembayaran lebih dulu, lalu kirim konfirmasi agar order bisa segera diproses."
            : "Pesanan Anda akan ditinjau dan Anda akan dihubungi bila ada konfirmasi lanjutan."}
      </p>
      {orderNumber ? (
        <div className="mt-6 rounded-[1.3rem] border border-border/70 bg-[hsl(var(--background)/0.45)] px-5 py-4">
          <p className="text-sm text-muted-foreground">
            {requiresPaymentConfirmation ? "Nomor pesanan" : "Nomor order"}
          </p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{orderNumber}</p>
        </div>
      ) : null}
      {isBankTransfer ? (
        <div className="mt-4 rounded-[1.3rem] border border-border/70 bg-[hsl(var(--background)/0.45)] px-5 py-5 text-left">
          <p className="text-sm text-muted-foreground">Transfer ke rekening berikut</p>
          <p className="mt-3 text-lg font-semibold text-foreground">
            {transferDestination.account.bankName}
          </p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {transferDestination.account.accountNumber}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            a.n. {transferDestination.account.accountHolder}
          </p>
          {transferDestination.usesFallback ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Rekening khusus untuk {selectedTransferBank || "bank yang dipilih"} belum tersedia,
              jadi pembayaran diarahkan ke rekening utama ANSLA via transfer antar bank.
            </p>
          ) : null}
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <p>1. Transfer sesuai total belanja Anda.</p>
            <p>2. Simpan bukti transfer Anda.</p>
            <p>3. Kirim konfirmasi pembayaran agar pesanan bisa lanjut diproses.</p>
          </div>
        </div>
      ) : null}
      {isQrisPayment && !hasSettledPayment ? (
        <div className="mt-4 rounded-[1.3rem] border border-border/70 bg-[hsl(var(--background)/0.45)] px-5 py-5 text-left">
          <p className="text-sm font-medium text-foreground">Lanjutkan pembayaran QRIS</p>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <p>1. Buka halaman QRIS pembayaran dari alur checkout Anda.</p>
            <p>2. Selesaikan pembayaran sesuai total belanja Anda.</p>
            <p>3. Status pesanan akan berubah otomatis setelah pembayaran diterima.</p>
          </div>
        </div>
      ) : null}
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        {requiresPaymentConfirmation && !hasUploadedPaymentProof ? (
          <Button asChild>
            <Link href={paymentConfirmationLink} target="_blank">
              Konfirmasi Pembayaran
            </Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/products">Lanjut Belanja</Link>
          </Button>
        )}
        <Button asChild variant="outline">
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
      </div>
    </div>
  );
}
