export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  REVIEW: "REVIEW",
  PAID: "PAID",
  EXPIRED: "EXPIRED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED"
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export function getPaymentStatusLabel(status?: string | null) {
  switch (status) {
    case PAYMENT_STATUS.PAID:
      return "Sudah Dibayar";
    case PAYMENT_STATUS.REVIEW:
      return "Menunggu Review";
    case PAYMENT_STATUS.EXPIRED:
      return "QR Kedaluwarsa";
    case PAYMENT_STATUS.FAILED:
      return "Pembayaran Gagal";
    case PAYMENT_STATUS.CANCELLED:
      return "Pembayaran Dibatalkan";
    case PAYMENT_STATUS.REFUNDED:
      return "Dana Dikembalikan";
    default:
      return "Menunggu Pembayaran";
  }
}

export function getPaymentStatusTone(status?: string | null) {
  switch (status) {
    case PAYMENT_STATUS.PAID:
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case PAYMENT_STATUS.REVIEW:
      return "border-sky-200 bg-sky-50 text-sky-700";
    case PAYMENT_STATUS.EXPIRED:
    case PAYMENT_STATUS.FAILED:
    case PAYMENT_STATUS.CANCELLED:
      return "border-rose-200 bg-rose-50 text-rose-700";
    case PAYMENT_STATUS.REFUNDED:
      return "border-stone-200 bg-stone-100 text-stone-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}
