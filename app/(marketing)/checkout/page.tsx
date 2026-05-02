import type { Metadata } from "next";

import { CheckoutPageClient } from "@/components/checkout/checkout-page-client";
import { PageHero } from "@/components/shared/page-hero";
import { getCustomerSession } from "@/lib/customer-auth";
import { db } from "@/lib/db";
import { isQrisEnabled } from "@/lib/features";
import { siteConfig } from "@/lib/site";
import type { SerializableVoucher } from "@/lib/vouchers";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Lengkapi data pengiriman, pilih metode bayar, lalu selesaikan pesanan Anda dengan lebih jelas dan nyaman."
};

type CheckoutPageProps = {
  searchParams?: {
    mode?: string;
    status?: string;
    message?: string;
  };
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const mode = searchParams?.mode === "buy-now" ? "buy-now" : "cart";
  const customerSession = await getCustomerSession();
  const [customer, vouchers] = await Promise.all([
    customerSession
      ? db.customerUser.findUnique({
          where: { id: customerSession.sub },
          select: {
            name: true,
            email: true,
            phone: true
          }
        })
      : Promise.resolve(null),
    db.voucher.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" }
    })
  ]);
  const serializableVouchers: SerializableVoucher[] = vouchers.map((voucher) => ({
    id: voucher.id,
    code: voucher.code,
    label: voucher.label,
    discountType: voucher.discountType,
    discountValue: voucher.discountValue,
    minPurchase: voucher.minPurchase,
    usageLimit: voucher.usageLimit,
    usedCount: voucher.usedCount,
    startsAt: voucher.startsAt ? voucher.startsAt.toISOString() : null,
    endsAt: voucher.endsAt ? voucher.endsAt.toISOString() : null,
    isActive: voucher.isActive
  }));

  return (
    <>
      <PageHero
        eyebrow="Checkout"
        title="Selesaikan pesanan Anda dengan cara yang paling nyaman"
        description="Isi alamat pengiriman, pilih metode bayar, lalu lanjutkan order di website atau lewat WhatsApp sesuai kebutuhan Anda."
      />
      <section className="pb-20">
        <div className="container">
          <CheckoutPageClient
            mode={mode}
            whatsappNumber={siteConfig.whatsappNumber}
            status={searchParams?.status}
            message={searchParams?.message}
            isQrisEnabled={isQrisEnabled()}
            initialVouchers={serializableVouchers}
            initialCustomerProfile={
              customer
                ? {
                    customerName: customer.name,
                    email: customer.email,
                    phone: customer.phone || ""
                  }
                : undefined
            }
          />
        </div>
      </section>
    </>
  );
}
