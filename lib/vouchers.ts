export type SerializableVoucher = {
  id: string;
  code: string;
  label: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minPurchase: number;
  usageLimit: number | null;
  usedCount: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
};

export type VoucherEvaluation =
  | {
      isValid: true;
      discountAmount: number;
      message: string;
    }
  | {
      isValid: false;
      discountAmount: 0;
      message: string;
    };

export function normalizeVoucherCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

function parseVoucherDate(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function evaluateVoucherForSubtotal(
  voucher: SerializableVoucher,
  subtotal: number,
  now = new Date()
): VoucherEvaluation {
  if (!voucher.isActive) {
    return {
      isValid: false,
      discountAmount: 0,
      message: "Voucher ini sedang tidak aktif."
    };
  }

  const startsAt = parseVoucherDate(voucher.startsAt);
  const endsAt = parseVoucherDate(voucher.endsAt);

  if (startsAt && now < startsAt) {
    return {
      isValid: false,
      discountAmount: 0,
      message: "Voucher ini belum bisa digunakan."
    };
  }

  if (endsAt && now > endsAt) {
    return {
      isValid: false,
      discountAmount: 0,
      message: "Voucher ini sudah berakhir."
    };
  }

  if (voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit) {
    return {
      isValid: false,
      discountAmount: 0,
      message: "Kuota voucher ini sudah habis."
    };
  }

  if (subtotal < voucher.minPurchase) {
    return {
      isValid: false,
      discountAmount: 0,
      message: `Voucher ini berlaku mulai belanja Rp ${voucher.minPurchase.toLocaleString("id-ID")}.`
    };
  }

  const discountAmount =
    voucher.discountType === "PERCENT"
      ? Math.floor((subtotal * voucher.discountValue) / 100)
      : voucher.discountValue;

  const finalDiscount = Math.min(subtotal, Math.max(0, discountAmount));

  if (finalDiscount <= 0) {
    return {
      isValid: false,
      discountAmount: 0,
      message: "Voucher ini tidak memberi potongan untuk total belanja saat ini."
    };
  }

  const message =
    voucher.discountType === "PERCENT"
      ? `Voucher ${voucher.code} memberi potongan ${voucher.discountValue}%.`
      : `Voucher ${voucher.code} memberi potongan Rp ${voucher.discountValue.toLocaleString("id-ID")}.`;

  return {
    isValid: true,
    discountAmount: finalDiscount,
    message
  };
}
