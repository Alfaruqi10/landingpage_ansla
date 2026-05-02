import { createHash } from "node:crypto";

import { db } from "@/lib/db";
import { isQrisEnabled } from "@/lib/features";
import {
  PAYMENT_STATUS,
  type PaymentStatus
} from "@/lib/payment-status";

const DEFAULT_QRIS_EXPIRY_MINUTES = 15;

type MidtransChargeResponse = {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time?: string;
  transaction_status: string;
  fraud_status?: string;
  qr_string?: string;
  expiry_time?: string;
  acquirer?: string;
  actions?: Array<{
    name?: string;
    method?: string;
    url?: string;
  }>;
};

type MidtransStatusResponse = MidtransChargeResponse & {
  signature_key?: string;
  settlement_time?: string;
};

type MidtransNotificationPayload = {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
  transaction_status?: string;
  fraud_status?: string;
  transaction_id?: string;
  settlement_time?: string;
  payment_type?: string;
  status_message?: string;
};

type EnsureQrisPaymentSessionResult =
  | {
      ok: true;
      orderId: string;
      orderNumber: string;
      token: string;
      qrUrl: string;
      paymentStatus: PaymentStatus;
    }
  | {
      ok: false;
      orderId: string;
      orderNumber: string;
      token: string;
      message: string;
    };

function getMidtransConfig() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY?.trim() || "";
  const notificationUrl = process.env.MIDTRANS_NOTIFICATION_URL?.trim() || "";
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

  return {
    serverKey,
    notificationUrl,
    isProduction
  };
}

function getMidtransApiBaseUrl(isProduction: boolean) {
  return isProduction
    ? "https://api.midtrans.com"
    : "https://api.sandbox.midtrans.com";
}

function parseMidtransTimestamp(value?: string | null) {
  if (!value) {
    return null;
  }

  const normalizedValue = value.includes("T")
    ? value
    : value.replace(" ", "T") + "+07:00";
  const parsedDate = new Date(normalizedValue);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function addMinutes(date: Date, minutes: number) {
  const nextDate = new Date(date);
  nextDate.setMinutes(nextDate.getMinutes() + minutes);
  return nextDate;
}

function buildMidtransGatewayOrderId(orderNumber: string, attemptCount: number) {
  return `${orderNumber}-QR${String(attemptCount).padStart(2, "0")}`;
}

function buildBasicAuthHeader(serverKey: string) {
  return `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`;
}

async function requestMidtrans<T>(path: string, init: RequestInit) {
  const config = getMidtransConfig();

  if (!config.serverKey) {
    throw new Error("MIDTRANS_SERVER_KEY belum diatur.");
  }

  const response = await fetch(`${getMidtransApiBaseUrl(config.isProduction)}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: buildBasicAuthHeader(config.serverKey),
      ...(config.notificationUrl && init.method === "POST"
        ? {
            "X-Override-Notification": config.notificationUrl
          }
        : {}),
      ...(init.headers || {})
    },
    cache: "no-store"
  });

  const payload = (await response.json().catch(() => null)) as
    | T
    | {
        status_message?: string;
        error_messages?: string[];
      }
    | null;

  if (!response.ok) {
    const errorMessage =
      (payload &&
        typeof payload === "object" &&
        "status_message" in payload &&
        payload.status_message) ||
      (payload &&
        typeof payload === "object" &&
        "error_messages" in payload &&
        Array.isArray(payload.error_messages) &&
        payload.error_messages[0]) ||
      "Permintaan ke Midtrans gagal.";

    throw new Error(errorMessage);
  }

  return payload as T;
}

function mapMidtransTransactionStatus(
  transactionStatus?: string,
  fraudStatus?: string | null
): PaymentStatus {
  const normalizedStatus = transactionStatus?.toLowerCase() || "";
  const normalizedFraudStatus = fraudStatus?.toLowerCase() || "";

  if (
    (normalizedStatus === "settlement" || normalizedStatus === "capture") &&
    (!normalizedFraudStatus || normalizedFraudStatus === "accept")
  ) {
    return PAYMENT_STATUS.PAID;
  }

  if (normalizedStatus === "pending") {
    return PAYMENT_STATUS.PENDING;
  }

  if (normalizedStatus === "expire") {
    return PAYMENT_STATUS.EXPIRED;
  }

  if (normalizedStatus === "cancel") {
    return PAYMENT_STATUS.CANCELLED;
  }

  if (normalizedStatus === "refund" || normalizedStatus === "partial_refund") {
    return PAYMENT_STATUS.REFUNDED;
  }

  return PAYMENT_STATUS.FAILED;
}

function verifyMidtransSignature(payload: MidtransNotificationPayload) {
  const config = getMidtransConfig();

  if (!config.serverKey) {
    return false;
  }

  const orderId = payload.order_id || "";
  const statusCode = payload.status_code || "";
  const grossAmount = payload.gross_amount || "";
  const expectedSignature = createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${config.serverKey}`)
    .digest("hex");

  return expectedSignature === (payload.signature_key || "");
}

function getGenerateQrActionUrl(actions?: MidtransChargeResponse["actions"]) {
  return actions?.find((action) => action.name === "generate-qr-code")?.url || "";
}

async function createMidtransQrisCharge(params: {
  gatewayOrderId: string;
  grossAmount: number;
  customerName: string;
  email?: string | null;
  phone: string;
}) {
  const payload = await requestMidtrans<MidtransChargeResponse>("/v2/charge", {
    method: "POST",
    body: JSON.stringify({
      payment_type: "qris",
      transaction_details: {
        order_id: params.gatewayOrderId,
        gross_amount: params.grossAmount
      },
      customer_details: {
        first_name: params.customerName,
        email: params.email || undefined,
        phone: params.phone
      },
      qris: {},
      custom_expiry: {
        duration: DEFAULT_QRIS_EXPIRY_MINUTES,
        unit: "minute"
      }
    })
  });

  const transactionTime = parseMidtransTimestamp(payload.transaction_time) || new Date();
  const expiryTime =
    parseMidtransTimestamp(payload.expiry_time) ||
    addMinutes(transactionTime, DEFAULT_QRIS_EXPIRY_MINUTES);

  return {
    gatewayOrderId: payload.order_id,
    transactionId: payload.transaction_id,
    qrString: payload.qr_string || "",
    qrUrl: getGenerateQrActionUrl(payload.actions),
    status: mapMidtransTransactionStatus(payload.transaction_status, payload.fraud_status),
    expiryTime,
    payload
  };
}

async function getMidtransTransactionStatus(gatewayOrderId: string) {
  const payload = await requestMidtrans<MidtransStatusResponse>(
    `/v2/${encodeURIComponent(gatewayOrderId)}/status`,
    {
      method: "GET"
    }
  );

  return payload;
}

function getOrderStatusUpdateFromPayment(currentOrderStatus: string, paymentStatus: PaymentStatus) {
  if (
    paymentStatus === PAYMENT_STATUS.PAID &&
    (currentOrderStatus === "Menunggu Pembayaran" ||
      currentOrderStatus === "Menunggu Verifikasi Pembayaran")
  ) {
    return "Lunas";
  }

  return currentOrderStatus;
}

async function applyPaymentUpdateToOrder(params: {
  orderId: string;
  currentOrderStatus: string;
  paymentStatus: PaymentStatus;
  paymentReference?: string | null;
  paymentProvider?: string | null;
  paymentExpiresAt?: Date | null;
  paymentQrString?: string | null;
  paymentQrUrl?: string | null;
  paymentGatewayOrderId?: string | null;
  paymentPayload?: unknown;
  paidAt?: Date | null;
}) {
  const nextOrderStatus = getOrderStatusUpdateFromPayment(
    params.currentOrderStatus,
    params.paymentStatus
  );

  await db.order.update({
    where: { id: params.orderId },
    data: {
      status: nextOrderStatus,
      paymentStatus: params.paymentStatus,
      paymentProvider: params.paymentProvider || undefined,
      paymentReference: params.paymentReference || undefined,
      paymentGatewayOrderId: params.paymentGatewayOrderId || undefined,
      paymentQrString:
        typeof params.paymentQrString === "string" ? params.paymentQrString : undefined,
      paymentQrUrl: typeof params.paymentQrUrl === "string" ? params.paymentQrUrl : undefined,
      paymentPayload: params.paymentPayload as never,
      paymentExpiresAt:
        params.paymentExpiresAt === null ? null : params.paymentExpiresAt || undefined,
      paidAt: params.paidAt === null ? null : params.paidAt || undefined
    }
  });
}

export function isMidtransConfigured() {
  return Boolean(getMidtransConfig().serverKey);
}

export async function ensureQrisPaymentSession(
  orderId: string,
  options?: { forceNew?: boolean }
): Promise<EnsureQrisPaymentSessionResult> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      email: true,
      phone: true,
      total: true,
      paymentMethod: true,
      paymentStatus: true,
      paymentGatewayOrderId: true,
      paymentQrUrl: true,
      paymentExpiresAt: true,
      paymentAttemptCount: true
    }
  });

  if (!order) {
    return {
      ok: false,
      orderId,
      orderNumber: "",
      token: orderId,
      message: "Pesanan tidak ditemukan."
    };
  }

  if (order.paymentMethod !== "QRIS") {
    return {
      ok: false,
      orderId: order.id,
      orderNumber: order.orderNumber,
      token: order.id,
      message: "Pesanan ini bukan pembayaran QRIS."
    };
  }

  if (!isQrisEnabled()) {
    return {
      ok: false,
      orderId: order.id,
      orderNumber: order.orderNumber,
      token: order.id,
      message: "Pembayaran QRIS sedang dinonaktifkan sementara."
    };
  }

  if (!isMidtransConfigured()) {
    return {
      ok: false,
      orderId: order.id,
      orderNumber: order.orderNumber,
      token: order.id,
      message:
        "QRIS otomatis belum aktif karena konfigurasi Midtrans belum diisi."
    };
  }

  const hasActivePendingSession =
    !options?.forceNew &&
    order.paymentStatus === PAYMENT_STATUS.PENDING &&
    Boolean(order.paymentQrUrl) &&
    Boolean(order.paymentGatewayOrderId) &&
    (!order.paymentExpiresAt || order.paymentExpiresAt.getTime() > Date.now());

  if (hasActivePendingSession) {
    return {
      ok: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      token: order.id,
      qrUrl: order.paymentQrUrl || "",
      paymentStatus: PAYMENT_STATUS.PENDING
    };
  }

  const nextAttemptCount = Math.max(order.paymentAttemptCount + 1, 1);
  const gatewayOrderId = buildMidtransGatewayOrderId(order.orderNumber, nextAttemptCount);

  try {
    const paymentSession = await createMidtransQrisCharge({
      gatewayOrderId,
      grossAmount: order.total,
      customerName: order.customerName,
      email: order.email,
      phone: order.phone
    });

    await db.order.update({
      where: { id: order.id },
      data: {
        paymentProvider: "midtrans",
        paymentStatus: paymentSession.status,
        paymentReference: paymentSession.transactionId,
        paymentGatewayOrderId: paymentSession.gatewayOrderId,
        paymentAttemptCount: nextAttemptCount,
        paymentQrString: paymentSession.qrString || null,
        paymentQrUrl: paymentSession.qrUrl || null,
        paymentPayload: paymentSession.payload as never,
        paymentExpiresAt: paymentSession.expiryTime
      }
    });

    return {
      ok: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      token: order.id,
      qrUrl: paymentSession.qrUrl,
      paymentStatus: paymentSession.status
    };
  } catch (error) {
    await db.order.update({
      where: { id: order.id },
      data: {
        paymentProvider: "midtrans",
        paymentStatus: PAYMENT_STATUS.FAILED,
        paymentAttemptCount: nextAttemptCount,
        paymentGatewayOrderId: gatewayOrderId,
        paymentPayload: {
          failedAt: new Date().toISOString(),
          message: error instanceof Error ? error.message : "Gagal membuat QRIS otomatis."
        } as never
      }
    });

    return {
      ok: false,
      orderId: order.id,
      orderNumber: order.orderNumber,
      token: order.id,
      message:
        error instanceof Error
          ? error.message
          : "QRIS otomatis gagal dibuat."
    };
  }
}

export async function syncOrderPaymentStatus(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true,
      paymentMethod: true,
      paymentStatus: true,
      paymentProvider: true,
      paymentGatewayOrderId: true,
      paymentQrUrl: true,
      paymentExpiresAt: true,
      paidAt: true
    }
  });

  if (
    !order ||
    order.paymentMethod !== "QRIS" ||
    order.paymentProvider !== "midtrans" ||
    !order.paymentGatewayOrderId ||
    order.paymentStatus === PAYMENT_STATUS.PAID
  ) {
    return order;
  }

  try {
    const transaction = await getMidtransTransactionStatus(order.paymentGatewayOrderId);
    const nextPaymentStatus = mapMidtransTransactionStatus(
      transaction.transaction_status,
      transaction.fraud_status
    );

    await applyPaymentUpdateToOrder({
      orderId: order.id,
      currentOrderStatus: order.status,
      paymentStatus: nextPaymentStatus,
      paymentReference: transaction.transaction_id,
      paymentProvider: "midtrans",
      paymentExpiresAt: parseMidtransTimestamp(transaction.expiry_time),
      paymentGatewayOrderId: transaction.order_id,
      paymentQrString: transaction.qr_string || null,
      paymentQrUrl: getGenerateQrActionUrl(transaction.actions) || null,
      paymentPayload: transaction,
      paidAt:
        nextPaymentStatus === PAYMENT_STATUS.PAID
          ? parseMidtransTimestamp(transaction.settlement_time) || new Date()
          : undefined
    });
  } catch {
    return order;
  }

  return db.order.findUnique({
    where: { id: order.id }
  });
}

export async function handleMidtransNotification(payload: MidtransNotificationPayload) {
  if (!verifyMidtransSignature(payload)) {
    throw new Error("Signature Midtrans tidak valid.");
  }

  const gatewayOrderId = payload.order_id || "";

  if (!gatewayOrderId) {
    throw new Error("order_id dari Midtrans tidak ditemukan.");
  }

  const order = await db.order.findFirst({
    where: { paymentGatewayOrderId: gatewayOrderId },
    select: {
      id: true,
      status: true
    }
  });

  if (!order) {
    throw new Error("Pesanan lokal untuk notifikasi Midtrans tidak ditemukan.");
  }

  const paymentStatus = mapMidtransTransactionStatus(
    payload.transaction_status,
    payload.fraud_status || ""
  );

  await applyPaymentUpdateToOrder({
    orderId: order.id,
    currentOrderStatus: order.status,
    paymentStatus,
    paymentReference: payload.transaction_id || null,
    paymentProvider: "midtrans",
    paymentGatewayOrderId: gatewayOrderId,
    paymentPayload: payload,
    paidAt: paymentStatus === PAYMENT_STATUS.PAID ? new Date() : undefined
  });
}

export function buildPaymentPageHref(orderNumber: string, token: string, params?: Record<string, string>) {
  const searchParams = new URLSearchParams({
    token
  });

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  return `/checkout/payment/${encodeURIComponent(orderNumber)}?${searchParams.toString()}`;
}
