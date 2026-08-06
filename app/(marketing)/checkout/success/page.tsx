import type { Metadata } from "next";

import { CheckoutSuccessClient } from "@/components/checkout/checkout-success-client";
import { getCheckoutSettings } from "@/lib/checkout-settings";

export const metadata: Metadata = {
  title: "Status Checkout",
  description:
    "Lihat status pesanan Anda, lanjutkan pembayaran bila diperlukan, lalu kirim konfirmasi agar order bisa diproses."
};

type CheckoutSuccessPageProps = {
  searchParams?: {
    mode?: string;
    order?: string;
    payment?: string;
    proof?: string;
    settled?: string;
  };
};

export default async function CheckoutSuccessPage({
  searchParams
}: CheckoutSuccessPageProps) {
  const checkoutSettings = await getCheckoutSettings();

  return (
    <section className="container flex min-h-[70vh] items-center py-24">
      <CheckoutSuccessClient
        mode={searchParams?.mode}
        orderNumber={searchParams?.order}
        paymentMethod={searchParams?.payment}
        paymentProofState={searchParams?.proof}
        hasSettledPayment={searchParams?.settled === "1"}
        bankAccounts={checkoutSettings.bankAccounts}
      />
    </section>
  );
}
