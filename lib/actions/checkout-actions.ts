"use server";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import {
  getShippingCostByMethod,
  isCheckoutPaymentMethodAvailable
} from "@/lib/checkout-settings";
import { getCustomerSession } from "@/lib/customer-auth";
import { isQrisEnabled } from "@/lib/features";
import { PAYMENT_STATUS } from "@/lib/payment-status";
import {
  buildPaymentPageHref,
  ensureQrisPaymentSession
} from "@/lib/payments";
import { saveUploadedImage } from "@/lib/uploads";
import { appendQueryString, toOptionalString, toRequiredString } from "@/lib/utils";
import { checkoutSchema } from "@/lib/validations";
import {
  evaluateVoucherForSubtotal,
  normalizeVoucherCode,
  type SerializableVoucher
} from "@/lib/vouchers";

const paymentProofMarker = "[[payment_proof:";

type CheckoutVariantOption = {
  name: string;
  stockBySize?: Record<string, number>;
};

function buildStoredVariantName(variantName?: string | null, size?: string | null) {
  const cleanVariantName = variantName?.trim() || "";
  const cleanSize = size?.trim() || "";

  if (cleanVariantName && cleanSize) {
    return `${cleanVariantName} ||| ${cleanSize}`;
  }

  if (cleanVariantName) {
    return cleanVariantName;
  }

  if (cleanSize) {
    return `SIZE_ONLY ||| ${cleanSize}`;
  }

  return null;
}

function buildOrderNumber() {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("");
  const randomPart = Math.floor(1000 + Math.random() * 9000);

  return `ANSLA-${datePart}-${randomPart}`;
}

function appendPaymentProofToNotes(notes: string, paymentProofUrl?: string | null) {
  if (!paymentProofUrl) {
    return notes;
  }

  const markerValue = `${paymentProofMarker}${paymentProofUrl}]]`;
  return notes ? `${notes}\n${markerValue}` : markerValue;
}

function buildInitialOrderStatus(paymentMethod: string, hasPaymentProof: boolean) {
  if (paymentMethod === "COD") {
    return "Pesanan Baru";
  }

  if (hasPaymentProof) {
    return "Menunggu Verifikasi Pembayaran";
  }

  return "Menunggu Pembayaran";
}

function buildInitialPaymentStatus(paymentMethod: string, hasPaymentProof: boolean) {
  if (paymentMethod === "COD") {
    return PAYMENT_STATUS.PAID;
  }

  if (paymentMethod.startsWith("Transfer Bank") && hasPaymentProof) {
    return PAYMENT_STATUS.REVIEW;
  }

  return PAYMENT_STATUS.PENDING;
}

function normalizeCheckoutVariantOptions(value: unknown): CheckoutVariantOption[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const variants = value.map<CheckoutVariantOption | null>((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const variant = item as {
        name?: unknown;
        stockBySize?: unknown;
        combinations?: unknown;
        isActive?: unknown;
      };

      if (typeof variant.name !== "string" || variant.name.trim().length === 0) {
        return null;
      }

      if (variant.isActive === false) {
        return null;
      }

      const stockBySizeFromCombinations =
        Array.isArray(variant.combinations)
          ? Object.fromEntries(
              variant.combinations
                .map((combination) => {
                  if (!combination || typeof combination !== "object") {
                    return null;
                  }

                  const row = combination as {
                    size?: unknown;
                    stock?: unknown;
                    isActive?: unknown;
                  };

                  if (
                    typeof row.size !== "string" ||
                    typeof row.stock !== "number" ||
                    !Number.isFinite(row.stock) ||
                    row.isActive === false
                  ) {
                    return null;
                  }

                  return [row.size.trim(), Math.max(0, Math.floor(row.stock))] as const;
                })
                .filter((entry): entry is readonly [string, number] => Boolean(entry))
            )
          : undefined;
      const stockBySize =
        variant.stockBySize && typeof variant.stockBySize === "object"
          ? Object.fromEntries(
              Object.entries(variant.stockBySize as Record<string, unknown>)
                .filter(
                  ([size, stock]) =>
                    typeof size === "string" &&
                    size.trim().length > 0 &&
                    typeof stock === "number" &&
                    Number.isFinite(stock) &&
                    stock >= 0
                )
                .map(([size, stock]) => [size.trim(), Math.floor(stock as number)])
            )
          : stockBySizeFromCombinations;

      return {
        name: variant.name.trim(),
        stockBySize
      };
    });

  return variants.filter((variant): variant is CheckoutVariantOption => variant !== null);
}

async function validateCheckoutStock(
  items: Array<{
    productId?: string;
    productName: string;
    variantName?: string | null;
    size?: string | null;
    quantity: number;
  }>
) {
  const productIds = Array.from(
    new Set(items.map((item) => item.productId).filter((productId): productId is string => Boolean(productId)))
  );

  if (productIds.length === 0) {
    return null;
  }

  const products = await db.product.findMany({
    where: {
      id: {
        in: productIds
      }
    },
    select: {
      id: true,
      name: true,
      variantOptions: true
    }
  });

  const productMap = new Map(products.map((product) => [product.id, product]));

  for (const item of items) {
    if (!item.productId) {
      continue;
    }

    const product = productMap.get(item.productId);

    if (!product) {
      return `Produk ${item.productName} tidak ditemukan atau sudah tidak tersedia.`;
    }

    const variants = normalizeCheckoutVariantOptions(product.variantOptions);

    if (variants.length === 0 || !item.variantName || !item.size) {
      continue;
    }

    const selectedVariant = variants.find((variant) => variant.name === item.variantName);

    if (!selectedVariant || !selectedVariant.stockBySize) {
      continue;
    }

    const availableStock = selectedVariant.stockBySize[item.size] ?? 0;

    if (availableStock <= 0) {
      return `Ukuran ${item.size} untuk ${item.productName} sedang habis. Silakan pilih ukuran lain.`;
    }

    if (item.quantity > availableStock) {
      return `Stok ${item.productName} ukuran ${item.size} tinggal ${availableStock}.`;
    }
  }

  return null;
}

export async function createOrderAction(formData: FormData) {
  const rawItems = toRequiredString(formData.get("items"));
  const redirectMode = toRequiredString(formData.get("redirectMode")) || "cart";
  const customerSession = await getCustomerSession();
  const requestedVoucherCode = normalizeVoucherCode(
    toOptionalString(formData.get("voucherCode")) || ""
  );
  let uploadedPaymentProofUrl: string | null = null;

  try {
    uploadedPaymentProofUrl = await saveUploadedImage(
      formData.get("paymentProofFile"),
      "payments"
    );
  } catch (error) {
    redirect(
      appendQueryString("/checkout", {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Bukti pembayaran gagal diunggah.",
        mode: redirectMode
      })
    );
  }

  let parsedItems: unknown[] = [];

  try {
    parsedItems = JSON.parse(rawItems);
  } catch {
    redirect(
      appendQueryString("/checkout", {
        status: "error",
        message: "Data item checkout tidak valid.",
        mode: redirectMode
      })
    );
  }

  const payload = {
    customerName: toRequiredString(formData.get("customerName")),
    email: toOptionalString(formData.get("email")) || "",
    phone: toRequiredString(formData.get("phone")),
    province: toRequiredString(formData.get("province")),
    city: toRequiredString(formData.get("city")),
    district: toRequiredString(formData.get("district")),
    address: toRequiredString(formData.get("address")),
    postalCode: toOptionalString(formData.get("postalCode")) || "",
    notes: appendPaymentProofToNotes(
      toOptionalString(formData.get("notes")) || "",
      uploadedPaymentProofUrl
    ),
    shippingMethod: toRequiredString(formData.get("shippingMethod")),
    paymentMethod: toRequiredString(formData.get("paymentMethod")),
    checkoutMethod: "web" as const,
    subtotal: toRequiredString(formData.get("subtotal")),
    shippingCost: toRequiredString(formData.get("shippingCost")),
    total: toRequiredString(formData.get("total")),
    items: parsedItems
  };

  const parsed = checkoutSchema.safeParse(payload);

  if (!parsed.success) {
    redirect(
      appendQueryString("/checkout", {
        status: "error",
        message: parsed.error.issues[0]?.message || "Data checkout belum lengkap.",
        mode: redirectMode
      })
    );
  }

  const orderNumber = buildOrderNumber();
  const stockValidationMessage = await validateCheckoutStock(parsed.data.items);

  if (stockValidationMessage) {
    redirect(
      appendQueryString("/checkout", {
        status: "error",
        message: stockValidationMessage,
        mode: redirectMode
      })
    );
  }

  const calculatedSubtotal = parsed.data.items.reduce((sum, item) => sum + item.lineTotal, 0);
  const calculatedShippingCost = await getShippingCostByMethod(parsed.data.shippingMethod);

  if (calculatedShippingCost === null) {
    redirect(
      appendQueryString("/checkout", {
        status: "error",
        message: "Metode pengiriman yang dipilih sedang tidak tersedia.",
        mode: redirectMode
      })
    );
  }
  const matchedVoucher = requestedVoucherCode
    ? await db.voucher.findUnique({
        where: { code: requestedVoucherCode }
      })
    : null;
  const serializableVoucher: SerializableVoucher | null = matchedVoucher
    ? {
        id: matchedVoucher.id,
        code: matchedVoucher.code,
        label: matchedVoucher.label,
        discountType: matchedVoucher.discountType,
        discountValue: matchedVoucher.discountValue,
        minPurchase: matchedVoucher.minPurchase,
        usageLimit: matchedVoucher.usageLimit,
        usedCount: matchedVoucher.usedCount,
        startsAt: matchedVoucher.startsAt ? matchedVoucher.startsAt.toISOString() : null,
        endsAt: matchedVoucher.endsAt ? matchedVoucher.endsAt.toISOString() : null,
        isActive: matchedVoucher.isActive
      }
    : null;
  const voucherEvaluation =
    requestedVoucherCode && serializableVoucher
      ? evaluateVoucherForSubtotal(serializableVoucher, calculatedSubtotal)
      : null;

  if (requestedVoucherCode && !serializableVoucher) {
    redirect(
      appendQueryString("/checkout", {
        status: "error",
        message: "Voucher yang Anda pakai tidak ditemukan.",
        mode: redirectMode
      })
    );
  }

  if (voucherEvaluation && !voucherEvaluation.isValid) {
    redirect(
      appendQueryString("/checkout", {
        status: "error",
        message: voucherEvaluation.message,
        mode: redirectMode
      })
    );
  }

  const calculatedVoucherDiscount =
    voucherEvaluation && voucherEvaluation.isValid ? voucherEvaluation.discountAmount : 0;
  const calculatedTotal = calculatedSubtotal - calculatedVoucherDiscount + calculatedShippingCost;
  const isPaymentAvailable = await isCheckoutPaymentMethodAvailable(parsed.data.paymentMethod);

  if (!isPaymentAvailable) {
    redirect(
      appendQueryString("/checkout", {
        status: "error",
        message: "Metode pembayaran yang dipilih sedang tidak tersedia.",
        mode: redirectMode
      })
    );
  }

  if (parsed.data.paymentMethod === "QRIS" && !isQrisEnabled()) {
    redirect(
      appendQueryString("/checkout", {
        status: "error",
        message: "Pembayaran QRIS sedang dinonaktifkan sementara. Silakan gunakan transfer bank dulu.",
        mode: redirectMode
      })
    );
  }

  const order = await db.$transaction(async (transaction) => {
    const createdOrder = await transaction.order.create({
      data: {
        orderNumber,
        customerUser: customerSession
          ? {
              connect: {
                id: customerSession.sub
              }
            }
          : undefined,
        voucher: matchedVoucher
          ? {
              connect: {
                id: matchedVoucher.id
              }
            }
          : undefined,
        voucherCode: matchedVoucher?.code || null,
        voucherDiscount: calculatedVoucherDiscount,
        customerName: parsed.data.customerName,
        email: parsed.data.email || null,
        phone: parsed.data.phone,
        province: parsed.data.province,
        city: parsed.data.city,
        district: parsed.data.district,
        address: parsed.data.address,
        postalCode: parsed.data.postalCode || null,
        notes: parsed.data.notes || null,
        shippingMethod: parsed.data.shippingMethod,
        paymentMethod: parsed.data.paymentMethod,
        paymentStatus: buildInitialPaymentStatus(
          parsed.data.paymentMethod,
          Boolean(uploadedPaymentProofUrl)
        ),
        checkoutMethod: parsed.data.checkoutMethod,
        status: buildInitialOrderStatus(
          parsed.data.paymentMethod,
          Boolean(uploadedPaymentProofUrl)
        ),
        subtotal: calculatedSubtotal,
        shippingCost: calculatedShippingCost,
        total: calculatedTotal,
        items: {
          create: parsed.data.items.map((item) => ({
            productName: item.productName,
            productSlug: item.productSlug,
            imageUrl: item.imageUrl,
            variantName: buildStoredVariantName(item.variantName, item.size),
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
            product: item.productId
              ? {
                  connect: {
                    id: item.productId
                  }
                }
              : undefined
          }))
        }
      },
      select: {
        id: true,
        orderNumber: true
      }
    });

    if (matchedVoucher) {
      await transaction.voucher.update({
        where: { id: matchedVoucher.id },
        data: {
          usedCount: {
            increment: 1
          }
        }
      });
    }

    return createdOrder;
  });

  if (parsed.data.paymentMethod === "QRIS") {
    const paymentSession = await ensureQrisPaymentSession(order.id);

    if (!paymentSession.ok) {
      redirect(
        buildPaymentPageHref(order.orderNumber, order.id, {
          status: "error",
          message: paymentSession.message
        })
      );
    }

    redirect(buildPaymentPageHref(order.orderNumber, order.id));
  }

  redirect(
    appendQueryString("/checkout/success", {
      order: order.orderNumber,
      mode: redirectMode,
      payment: parsed.data.paymentMethod,
      proof: uploadedPaymentProofUrl ? "uploaded" : undefined
    })
  );
}

export async function regenerateQrisPaymentAction(formData: FormData) {
  if (!isQrisEnabled()) {
    redirect(
      appendQueryString("/checkout", {
        status: "error",
        message: "Pembayaran QRIS sedang dinonaktifkan sementara."
      })
    );
  }

  const orderId = toRequiredString(formData.get("orderId"));
  const orderNumber = toRequiredString(formData.get("orderNumber"));
  const token = toRequiredString(formData.get("token"));

  if (!orderId || !orderNumber || !token || orderId !== token) {
    redirect(
      appendQueryString("/checkout", {
        status: "error",
        message: "Data sesi pembayaran tidak valid."
      })
    );
  }

  const paymentSession = await ensureQrisPaymentSession(orderId, {
    forceNew: true
  });

  if (!paymentSession.ok) {
    redirect(
      buildPaymentPageHref(orderNumber, token, {
        status: "error",
        message: paymentSession.message
      })
    );
  }

  redirect(
    buildPaymentPageHref(orderNumber, token, {
      status: "success",
      message: "QRIS baru siap digunakan."
    })
  );
}
