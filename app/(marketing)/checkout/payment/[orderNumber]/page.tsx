import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { CheckoutPaymentClient } from "@/components/checkout/checkout-payment-client";
import { db } from "@/lib/db";
import { isQrisEnabled } from "@/lib/features";
import { getPaymentStatusLabel, getPaymentStatusTone, PAYMENT_STATUS } from "@/lib/payment-status";
import { syncOrderPaymentStatus } from "@/lib/payments";
import { appendQueryString } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pembayaran QRIS",
  description:
    "Scan QRIS untuk menyelesaikan pesanan ANSLA dan pantau status pembayarannya secara otomatis."
};

type CheckoutPaymentPageProps = {
  params: {
    orderNumber: string;
  };
  searchParams?: {
    token?: string;
    status?: string;
    message?: string;
  };
};

export default async function CheckoutPaymentPage({
  params,
  searchParams
}: CheckoutPaymentPageProps) {
  const token = searchParams?.token || "";

  if (!token) {
    notFound();
  }

  const order = await db.order.findFirst({
    where: {
      id: token,
      orderNumber: decodeURIComponent(params.orderNumber)
    }
  });

  if (!order) {
    notFound();
  }

  if (order.paymentMethod !== "QRIS") {
    redirect(
      appendQueryString("/checkout/success", {
        order: order.orderNumber,
        payment: order.paymentMethod
      })
    );
  }

  if (!isQrisEnabled()) {
    redirect(
      appendQueryString("/checkout/success", {
        order: order.orderNumber,
        payment: order.paymentMethod,
        status: "error",
        message: "Pembayaran QRIS sedang dinonaktifkan sementara."
      })
    );
  }

  const syncedOrder =
    order.paymentStatus === PAYMENT_STATUS.PAID ? order : await syncOrderPaymentStatus(order.id);
  const activeOrder = syncedOrder || order;

  if (activeOrder.paymentStatus === PAYMENT_STATUS.PAID) {
    redirect(
      appendQueryString("/checkout/success", {
        order: activeOrder.orderNumber,
        payment: "QRIS",
        settled: "1"
      })
    );
  }

  return (
    <section className="container py-16">
      <CheckoutPaymentClient
        orderId={activeOrder.id}
        orderNumber={activeOrder.orderNumber}
        token={token}
        total={activeOrder.total}
        orderStatus={activeOrder.status}
        paymentStatus={activeOrder.paymentStatus}
        paymentStatusLabel={getPaymentStatusLabel(activeOrder.paymentStatus)}
        paymentStatusTone={getPaymentStatusTone(activeOrder.paymentStatus)}
        paymentQrUrl={activeOrder.paymentQrUrl}
        paymentExpiresAt={activeOrder.paymentExpiresAt?.toISOString() || null}
        status={searchParams?.status}
        message={searchParams?.message}
      />
    </section>
  );
}
