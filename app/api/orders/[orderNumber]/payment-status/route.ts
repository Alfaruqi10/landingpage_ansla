import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getPaymentStatusLabel, getPaymentStatusTone } from "@/lib/payment-status";
import { syncOrderPaymentStatus } from "@/lib/payments";

export async function GET(
  request: Request,
  { params }: { params: { orderNumber: string } }
) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") || "";

  if (!token) {
    return NextResponse.json(
      {
        error: "Token pembayaran tidak ditemukan."
      },
      { status: 400 }
    );
  }

  const order = await db.order.findFirst({
    where: {
      id: token,
      orderNumber: decodeURIComponent(params.orderNumber)
    }
  });

  if (!order) {
    return NextResponse.json(
      {
        error: "Pesanan tidak ditemukan."
      },
      { status: 404 }
    );
  }

  const refreshedOrder = (await syncOrderPaymentStatus(order.id)) || order;

  return NextResponse.json({
    order: {
      orderStatus: refreshedOrder.status,
      paymentStatus: refreshedOrder.paymentStatus,
      paymentStatusLabel: getPaymentStatusLabel(refreshedOrder.paymentStatus),
      paymentStatusTone: getPaymentStatusTone(refreshedOrder.paymentStatus),
      paymentQrUrl: refreshedOrder.paymentQrUrl,
      paymentExpiresAt: refreshedOrder.paymentExpiresAt?.toISOString() || null,
      paidAt: refreshedOrder.paidAt?.toISOString() || null
    }
  });
}
