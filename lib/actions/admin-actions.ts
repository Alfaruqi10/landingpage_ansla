"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PAYMENT_STATUS } from "@/lib/payment-status";
import { saveUploadedImage, saveUploadedImages } from "@/lib/uploads";
import {
  appendQueryString,
  toBoolean,
  toOptionalString,
  toRequiredString
} from "@/lib/utils";
import {
  bannerSchema,
  categorySchema,
  faqSchema,
  productSchema,
  testimonialSchema,
  voucherSchema
} from "@/lib/validations";

function parseMultilineImages(value: FormDataEntryValue | null) {
  const raw = toOptionalString(value) || "";

  return raw
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseVariantLines(value: FormDataEntryValue | null) {
  const raw = toOptionalString(value) || "";

  const parseGalleryIndexes = (input: string) => {
    const items = input
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (items.length === 0) {
      return [];
    }

    const numbers = items.map((item) => Number(item));

    if (numbers.some((item) => Number.isNaN(item) || item <= 0 || !Number.isInteger(item))) {
      return [];
    }

    return Array.from(new Set(numbers));
  };

  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((item) => item.trim());
      const [name = "", secondValue = "", thirdValue = ""] = parts;
      const secondNumber = Number(secondValue);
      const thirdNumber = Number(thirdValue);
      const secondGalleryIndexes = parseGalleryIndexes(secondValue);

      let imageUrl = "";
      let galleryIndexes: number[] = [];
      let price: number | undefined;

      if (parts.length === 1) {
        price = undefined;
      } else if (parts.length === 2) {
        if (secondValue && !Number.isNaN(secondNumber)) {
          price = secondNumber;
        } else if (secondGalleryIndexes.length > 0) {
          galleryIndexes = secondGalleryIndexes;
        } else {
          imageUrl = secondValue;
        }
      } else {
        if (secondGalleryIndexes.length > 0) {
          galleryIndexes = secondGalleryIndexes;
        } else {
          imageUrl = secondValue;
        }

        price = thirdValue && !Number.isNaN(thirdNumber) ? thirdNumber : undefined;
      }

      return {
        name,
        imageUrl,
        galleryIndexes,
        price
      };
    });
}

const PRODUCT_SIZE_LABELS = ["S", "M", "L", "XL", "XXL", "All Size"];

function normalizeSizeLabel(value: string) {
  const normalized = value.trim().toUpperCase().replace(/\s+/g, " ");

  if (normalized === "ALLSIZE" || normalized === "ALL_SIZE" || normalized === "ALL SIZE") {
    return "All Size";
  }

  return PRODUCT_SIZE_LABELS.find((size) => size.toUpperCase() === normalized) || "";
}

function parseSizeList(value: FormDataEntryValue | null) {
  const raw = (toOptionalString(value) || "").trim();

  if (!raw) {
    return ["All Size"];
  }

  const normalized = raw
    .split(",")
    .map((item) => normalizeSizeLabel(item))
    .filter(Boolean);

  return Array.from(new Set(normalized));
}

function parseVariantMappings(value: FormDataEntryValue | null) {
  const raw = toOptionalString(value) || "";

  const parseGalleryIndexes = (input: string) =>
    Array.from(
      new Set(
        input
          .split(",")
          .map((item) => Number(item.trim()))
          .filter((item) => Number.isInteger(item) && item > 0)
      )
    );

  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = "", galleryValue = ""] = line.split("|").map((item) => item.trim());

      return {
        name,
        imageUrl: "",
        galleryIndexes: parseGalleryIndexes(galleryValue),
        price: undefined
      };
    });
}

function parseVariantsJson(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item, index) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const variant = item as {
          name?: unknown;
          hex?: unknown;
          imageUrl?: unknown;
          galleryIndexes?: unknown;
          stockBySize?: unknown;
          isDefault?: unknown;
          isActive?: unknown;
        };

        const stockEntries =
          variant.stockBySize && typeof variant.stockBySize === "object"
            ? Object.entries(variant.stockBySize as Record<string, unknown>)
                .map(([size, stock]) => [normalizeSizeLabel(size), Number(stock)] as const)
                .filter(
                  ([size, stock]) =>
                    Boolean(size) && Number.isFinite(stock) && Number.isInteger(stock) && stock >= 0
                )
            : [];

        const stockBySize =
          stockEntries.length > 0
            ? Object.fromEntries(stockEntries)
            : Object.fromEntries(PRODUCT_SIZE_LABELS.map((size) => [size, 0]));
        const totalStock = Object.values(stockBySize).reduce(
          (total, stock) => total + Number(stock || 0),
          0
        );
        const sizes = Object.keys(stockBySize);

        return {
          name: typeof variant.name === "string" ? variant.name.trim() : "",
          hex: typeof variant.hex === "string" ? variant.hex.trim() : "",
          imageUrl: typeof variant.imageUrl === "string" ? variant.imageUrl.trim() : "",
          galleryIndexes: Array.isArray(variant.galleryIndexes)
            ? Array.from(
                new Set(
                  variant.galleryIndexes
                    .map((galleryIndex) => Number(galleryIndex))
                    .filter((galleryIndex) => Number.isInteger(galleryIndex) && galleryIndex > 0)
                )
              )
            : [],
          sizes,
          stockBySize,
          totalStock,
          isDefault: Boolean(variant.isDefault) || index === 0,
          isActive: variant.isActive !== false
        };
      })
      .filter((variant): variant is NonNullable<typeof variant> =>
        Boolean(variant && variant.name.length > 0)
      )
      .map((variant, index) => ({
        ...variant,
        isDefault:
          index ===
          Math.max(
            0,
            parsed.findIndex(
              (item) => item && typeof item === "object" && Boolean((item as { isDefault?: unknown }).isDefault)
            )
          )
      }));
  } catch {
    return [];
  }
}

function buildAdminRedirect(formData: FormData, overrides: Record<string, string>) {
  const redirectTo = toRequiredString(formData.get("redirectTo")) || "/admin";
  return appendQueryString(redirectTo, overrides);
}

function redirectWithError(formData: FormData, message: string): never {
  redirect(
    buildAdminRedirect(formData, {
      status: "error",
      message
    })
  );
}

type ProductDraftRedirectMode = "new" | "edit";

function buildProductDraft(formData: FormData) {
  return JSON.stringify({
    id: toOptionalString(formData.get("id")) || "",
    name: toRequiredString(formData.get("name")),
    slug: toRequiredString(formData.get("slug")),
    price: toRequiredString(formData.get("price")),
    compareAtPrice: toRequiredString(formData.get("compareAtPrice")),
    shortDescription: toRequiredString(formData.get("shortDescription")),
    description: toRequiredString(formData.get("description")),
    imageUrl: toRequiredString(formData.get("imageUrl")),
    galleryImages: typeof formData.get("galleryImages") === "string" ? formData.get("galleryImages") : "",
    variantNames: typeof formData.get("variantNames") === "string" ? formData.get("variantNames") : "",
    variantOptions: typeof formData.get("variantOptions") === "string" ? formData.get("variantOptions") : "",
    variantsJson: typeof formData.get("variantsJson") === "string" ? formData.get("variantsJson") : "",
    categoryId: toRequiredString(formData.get("categoryId")),
    featured: toBoolean(formData.get("featured")),
    isActive: toBoolean(formData.get("isActive"))
  });
}

function redirectProductWithError(
  formData: FormData,
  message: string,
  mode: ProductDraftRedirectMode
): never {
  redirect(
    buildAdminRedirect(formData, {
      status: "error",
      message,
      draftMode: mode,
      draftId: toOptionalString(formData.get("id")) || "",
      draft: buildProductDraft(formData)
    })
  );
}

function redirectWithSuccess(formData: FormData, message: string): never {
  redirect(
    buildAdminRedirect(formData, {
      status: "success",
      message
    })
  );
}

const ORDER_STATUS_OPTIONS = [
  "Pesanan Baru",
  "Menunggu Pembayaran",
  "Menunggu Verifikasi Pembayaran",
  "Lunas",
  "Diproses",
  "Dikirim",
  "Selesai",
  "Dibatalkan"
] as const;

function revalidateStorefrontPaths() {
  revalidateTag("storefront");
  revalidatePath("/");
  revalidatePath("/products");
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdminSession();

  const id = toRequiredString(formData.get("id"));
  const nextStatus = toRequiredString(formData.get("nextStatus"));

  if (!id) {
    redirectWithError(formData, "ID pesanan tidak ditemukan.");
  }

  if (!ORDER_STATUS_OPTIONS.includes(nextStatus as (typeof ORDER_STATUS_OPTIONS)[number])) {
    redirectWithError(formData, "Status pesanan tidak valid.");
  }

  try {
    const currentOrder = await db.order.findUnique({
      where: { id },
      select: {
        paidAt: true,
        paymentStatus: true
      }
    });

    if (!currentOrder) {
      redirectWithError(formData, "Pesanan tidak ditemukan.");
    }

    const paymentData =
      nextStatus === "Lunas" || nextStatus === "Selesai"
        ? {
            paymentStatus: PAYMENT_STATUS.PAID,
            paidAt: currentOrder.paidAt || new Date()
          }
        : nextStatus === "Menunggu Verifikasi Pembayaran"
          ? {
              paymentStatus: PAYMENT_STATUS.REVIEW
            }
          : nextStatus === "Menunggu Pembayaran"
            ? {
                paymentStatus: PAYMENT_STATUS.PENDING
              }
            : nextStatus === "Dibatalkan" && currentOrder.paymentStatus !== PAYMENT_STATUS.PAID
              ? {
                  paymentStatus: PAYMENT_STATUS.CANCELLED
                }
              : {};

    await db.order.update({
      where: { id },
      data: {
        status: nextStatus,
        ...paymentData
      }
    });
  } catch {
    redirectWithError(formData, "Status pesanan gagal diperbarui.");
  }

  revalidatePath("/admin/orders");
  redirectWithSuccess(formData, "Status pesanan berhasil diperbarui.");
}

export async function upsertCategoryAction(formData: FormData) {
  await requireAdminSession();

  let uploadedImageUrl: string | null = null;

  try {
    uploadedImageUrl = await saveUploadedImage(formData.get("imageFile"), "categories");
  } catch (error) {
    redirectWithError(
      formData,
      error instanceof Error ? error.message : "File gambar kategori gagal diproses."
    );
  }

  const payload = {
    id: toOptionalString(formData.get("id")),
    name: toRequiredString(formData.get("name")),
    slug: toRequiredString(formData.get("slug")),
    imageUrl: uploadedImageUrl || toOptionalString(formData.get("imageUrl")) || "",
    sortOrder: toRequiredString(formData.get("sortOrder"))
  };

  const parsed = categorySchema.safeParse(payload);

  if (!parsed.success) {
    redirectWithError(formData, parsed.error.issues[0]?.message || "Collection tidak valid.");
  }

  try {
    if (parsed.data.id) {
      await db.category.update({
        where: { id: parsed.data.id },
        data: {
          name: parsed.data.name,
          slug: parsed.data.slug,
          imageUrl: parsed.data.imageUrl || null,
          sortOrder: parsed.data.sortOrder
        }
      });
    } else {
      await db.category.create({
        data: {
          name: parsed.data.name,
          slug: parsed.data.slug,
          imageUrl: parsed.data.imageUrl || null,
          sortOrder: parsed.data.sortOrder
        }
      });
    }
  } catch {
    redirectWithError(formData, "Collection gagal disimpan. Pastikan slug unik.");
  }

  revalidateStorefrontPaths();
  revalidatePath("/admin/categories");
  redirectWithSuccess(formData, "Collection berhasil disimpan.");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdminSession();

  const id = toRequiredString(formData.get("id"));

  try {
    await db.category.delete({ where: { id } });
  } catch {
    redirectWithError(
      formData,
      "Collection tidak bisa dihapus karena masih digunakan produk atau data tidak ditemukan."
    );
  }

  revalidateStorefrontPaths();
  revalidatePath("/admin/categories");
  redirectWithSuccess(formData, "Collection berhasil dihapus.");
}

export async function upsertProductAction(formData: FormData) {
  await requireAdminSession();
  const redirectMode: ProductDraftRedirectMode = toOptionalString(formData.get("id"))
    ? "edit"
    : "new";

  let uploadedImageUrl: string | null = null;
  let uploadedGalleryImages: string[] = [];

  try {
    uploadedImageUrl = await saveUploadedImage(formData.get("imageFile"), "products");
    uploadedGalleryImages = await saveUploadedImages(formData.getAll("galleryImageFiles"), "products");
  } catch (error) {
    redirectProductWithError(
      formData,
      error instanceof Error ? error.message : "File gambar produk gagal diproses.",
      redirectMode
    );
  }

  const productId = toOptionalString(formData.get("id"));
  const existingProduct = productId
    ? await db.product.findUnique({
        where: { id: productId },
        select: { slug: true }
      })
    : null;

  const availableSizes = parseSizeList(formData.get("sizes"));
  const simpleVariantMappings = parseVariantMappings(formData.get("variantNames")).map((variant) => ({
    ...variant,
    sizes: availableSizes
  }));
  const advancedVariantOptions = parseVariantLines(formData.get("variantOptions")).map((variant) => ({
    ...variant,
    sizes: availableSizes
  }));
  const structuredVariantOptions = parseVariantsJson(formData.get("variantsJson"));

  const payload = {
    id: productId,
    name: toRequiredString(formData.get("name")),
    slug: toRequiredString(formData.get("slug")),
    featured: toBoolean(formData.get("featured")),
    price: toRequiredString(formData.get("price")),
    compareAtPrice: toOptionalString(formData.get("compareAtPrice")) || Number.NaN,
    shortDescription: toRequiredString(formData.get("shortDescription")),
    description: toRequiredString(formData.get("description")),
    imageUrl: uploadedImageUrl || toRequiredString(formData.get("imageUrl")),
    galleryImages: [
      ...parseMultilineImages(formData.get("galleryImages")),
      ...uploadedGalleryImages
    ].slice(0, 9),
    variantOptions:
      structuredVariantOptions.length > 0
        ? structuredVariantOptions
        : simpleVariantMappings.length > 0
          ? simpleVariantMappings
          : advancedVariantOptions,
    categoryId: toRequiredString(formData.get("categoryId")),
    isActive: toBoolean(formData.get("isActive"))
  };

  const parsed = productSchema.safeParse(payload);

  if (!parsed.success) {
    redirectProductWithError(
      formData,
      parsed.error.issues[0]?.message || "Produk tidak valid.",
      redirectMode
    );
  }

  try {
    if (parsed.data.id) {
      await db.product.update({
        where: { id: parsed.data.id },
        data: {
          name: parsed.data.name,
          slug: parsed.data.slug,
          featured: parsed.data.featured,
          price: parsed.data.price,
          compareAtPrice:
            typeof parsed.data.compareAtPrice === "number" &&
            !Number.isNaN(parsed.data.compareAtPrice)
              ? parsed.data.compareAtPrice
              : null,
          shortDescription: parsed.data.shortDescription,
          description: parsed.data.description,
          imageUrl: parsed.data.imageUrl,
          galleryImages: parsed.data.galleryImages,
          variantOptions: parsed.data.variantOptions,
          categoryId: parsed.data.categoryId,
          isActive: parsed.data.isActive
        }
      });
    } else {
      await db.product.create({
        data: {
          name: parsed.data.name,
          slug: parsed.data.slug,
          featured: parsed.data.featured,
          price: parsed.data.price,
          compareAtPrice:
            typeof parsed.data.compareAtPrice === "number" &&
            !Number.isNaN(parsed.data.compareAtPrice)
              ? parsed.data.compareAtPrice
              : null,
          shortDescription: parsed.data.shortDescription,
          description: parsed.data.description,
          imageUrl: parsed.data.imageUrl,
          galleryImages: parsed.data.galleryImages,
          variantOptions: parsed.data.variantOptions,
          categoryId: parsed.data.categoryId,
          isActive: parsed.data.isActive
        }
      });
    }
  } catch {
    redirectProductWithError(
      formData,
      "Produk gagal disimpan. Pastikan slug unik dan collection valid.",
      redirectMode
    );
  }

  revalidateStorefrontPaths();
  revalidatePath("/admin/products");
  revalidateTag(`product:${parsed.data.slug}`);
  revalidatePath(`/products/${parsed.data.slug}`);

  if (existingProduct?.slug && existingProduct.slug !== parsed.data.slug) {
    revalidateTag(`product:${existingProduct.slug}`);
    revalidatePath(`/products/${existingProduct.slug}`);
  }

  redirectWithSuccess(formData, "Produk berhasil disimpan.");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdminSession();

  const id = toRequiredString(formData.get("id"));
  const product = await db.product.findUnique({
    where: { id },
    select: { slug: true }
  });

  try {
    await db.product.delete({ where: { id } });
  } catch {
    redirectWithError(formData, "Produk gagal dihapus.");
  }

  revalidateStorefrontPaths();
  revalidatePath("/admin/products");

  if (product?.slug) {
    revalidateTag(`product:${product.slug}`);
    revalidatePath(`/products/${product.slug}`);
  }

  redirectWithSuccess(formData, "Produk berhasil dihapus.");
}

export async function upsertTestimonialAction(formData: FormData) {
  await requireAdminSession();

  let uploadedImageUrl: string | null = null;

  try {
    uploadedImageUrl = await saveUploadedImage(formData.get("imageFile"), "testimonials");
  } catch (error) {
    redirectWithError(
      formData,
      error instanceof Error ? error.message : "File gambar testimonial gagal diproses."
    );
  }

  const payload = {
    id: toOptionalString(formData.get("id")),
    name: toRequiredString(formData.get("name")),
    city: toOptionalString(formData.get("city")) || "",
    rating: toRequiredString(formData.get("rating")),
    content: toRequiredString(formData.get("content")),
    imageUrl: uploadedImageUrl || toOptionalString(formData.get("imageUrl")) || "",
    isActive: toBoolean(formData.get("isActive"))
  };

  const parsed = testimonialSchema.safeParse(payload);

  if (!parsed.success) {
    redirectWithError(
      formData,
      parsed.error.issues[0]?.message || "Testimonial tidak valid."
    );
  }

  try {
    if (parsed.data.id) {
      await db.testimonial.update({
        where: { id: parsed.data.id },
        data: {
          name: parsed.data.name,
          city: parsed.data.city || null,
          rating: parsed.data.rating,
          content: parsed.data.content,
          imageUrl: parsed.data.imageUrl || null,
          isActive: parsed.data.isActive
        }
      });
    } else {
      await db.testimonial.create({
        data: {
          name: parsed.data.name,
          city: parsed.data.city || null,
          rating: parsed.data.rating,
          content: parsed.data.content,
          imageUrl: parsed.data.imageUrl || null,
          isActive: parsed.data.isActive
        }
      });
    }
  } catch {
    redirectWithError(formData, "Testimonial gagal disimpan.");
  }

  revalidateStorefrontPaths();
  revalidatePath("/admin/testimonials");
  redirectWithSuccess(formData, "Testimonial berhasil disimpan.");
}

export async function deleteTestimonialAction(formData: FormData) {
  await requireAdminSession();

  const id = toRequiredString(formData.get("id"));

  try {
    await db.testimonial.delete({ where: { id } });
  } catch {
    redirectWithError(formData, "Testimonial gagal dihapus.");
  }

  revalidateStorefrontPaths();
  revalidatePath("/admin/testimonials");
  redirectWithSuccess(formData, "Testimonial berhasil dihapus.");
}

export async function upsertFaqAction(formData: FormData) {
  await requireAdminSession();

  const payload = {
    id: toOptionalString(formData.get("id")),
    question: toRequiredString(formData.get("question")),
    answer: toRequiredString(formData.get("answer")),
    sortOrder: toRequiredString(formData.get("sortOrder")),
    isActive: toBoolean(formData.get("isActive"))
  };

  const parsed = faqSchema.safeParse(payload);

  if (!parsed.success) {
    redirectWithError(formData, parsed.error.issues[0]?.message || "FAQ tidak valid.");
  }

  try {
    if (parsed.data.id) {
      await db.fAQ.update({
        where: { id: parsed.data.id },
        data: parsed.data
      });
    } else {
      await db.fAQ.create({
        data: parsed.data
      });
    }
  } catch {
    redirectWithError(formData, "FAQ gagal disimpan.");
  }

  revalidateStorefrontPaths();
  revalidatePath("/admin/faqs");
  redirectWithSuccess(formData, "FAQ berhasil disimpan.");
}

export async function deleteFaqAction(formData: FormData) {
  await requireAdminSession();

  const id = toRequiredString(formData.get("id"));

  try {
    await db.fAQ.delete({ where: { id } });
  } catch {
    redirectWithError(formData, "FAQ gagal dihapus.");
  }

  revalidateStorefrontPaths();
  revalidatePath("/admin/faqs");
  redirectWithSuccess(formData, "FAQ berhasil dihapus.");
}

export async function upsertBannerAction(formData: FormData) {
  await requireAdminSession();

  let uploadedImageUrl: string | null = null;

  try {
    uploadedImageUrl = await saveUploadedImage(formData.get("imageFile"), "banners");
  } catch (error) {
    redirectWithError(
      formData,
      error instanceof Error ? error.message : "File gambar banner gagal diproses."
    );
  }

  const payload = {
    id: toOptionalString(formData.get("id")),
    title: toRequiredString(formData.get("title")),
    subtitle: toRequiredString(formData.get("subtitle")),
    imageUrl: uploadedImageUrl || toRequiredString(formData.get("imageUrl")),
    ctaText: toRequiredString(formData.get("ctaText")),
    ctaLink: toRequiredString(formData.get("ctaLink")),
    sortOrder: toRequiredString(formData.get("sortOrder")),
    isActive: toBoolean(formData.get("isActive"))
  };

  const parsed = bannerSchema.safeParse(payload);

  if (!parsed.success) {
    redirectWithError(formData, parsed.error.issues[0]?.message || "Banner tidak valid.");
  }

  try {
    if (parsed.data.id) {
      await db.banner.update({
        where: { id: parsed.data.id },
        data: parsed.data
      });
    } else {
      await db.banner.create({
        data: parsed.data
      });
    }
  } catch {
    redirectWithError(formData, "Banner gagal disimpan.");
  }

  revalidateStorefrontPaths();
  revalidatePath("/admin/banners");
  redirectWithSuccess(formData, "Banner berhasil disimpan.");
}

export async function deleteBannerAction(formData: FormData) {
  await requireAdminSession();

  const id = toRequiredString(formData.get("id"));

  try {
    await db.banner.delete({ where: { id } });
  } catch {
    redirectWithError(formData, "Banner gagal dihapus.");
  }

  revalidateStorefrontPaths();
  revalidatePath("/admin/banners");
  redirectWithSuccess(formData, "Banner berhasil dihapus.");
}

export async function upsertVoucherAction(formData: FormData) {
  await requireAdminSession();

  const payload = {
    id: toOptionalString(formData.get("id")),
    code: toRequiredString(formData.get("code")),
    label: toRequiredString(formData.get("label")),
    discountType: toRequiredString(formData.get("discountType")),
    discountValue: toRequiredString(formData.get("discountValue")),
    minPurchase: toRequiredString(formData.get("minPurchase")) || "0",
    usageLimit: toOptionalString(formData.get("usageLimit")) || Number.NaN,
    startsAt: toOptionalString(formData.get("startsAt")) || "",
    endsAt: toOptionalString(formData.get("endsAt")) || "",
    isActive: toBoolean(formData.get("isActive"))
  };

  const parsed = voucherSchema.safeParse(payload);

  if (!parsed.success) {
    redirectWithError(formData, parsed.error.issues[0]?.message || "Voucher tidak valid.");
  }

  const voucherData = {
    code: parsed.data.code,
    label: parsed.data.label,
    discountType: parsed.data.discountType,
    discountValue: parsed.data.discountValue,
    minPurchase: parsed.data.minPurchase,
    usageLimit:
      typeof parsed.data.usageLimit === "number" && !Number.isNaN(parsed.data.usageLimit)
        ? parsed.data.usageLimit
        : null,
    startsAt: parsed.data.startsAt || null,
    endsAt: parsed.data.endsAt || null,
    isActive: parsed.data.isActive
  };

  try {
    if (parsed.data.id) {
      await db.voucher.update({
        where: { id: parsed.data.id },
        data: voucherData
      });
    } else {
      await db.voucher.create({
        data: voucherData
      });
    }
  } catch {
    redirectWithError(formData, "Voucher gagal disimpan. Pastikan kode voucher unik.");
  }

  revalidatePath("/checkout");
  revalidatePath("/admin/vouchers");
  revalidatePath("/admin/orders");
  redirectWithSuccess(formData, "Voucher berhasil disimpan.");
}

export async function deleteVoucherAction(formData: FormData) {
  await requireAdminSession();

  const id = toRequiredString(formData.get("id"));

  try {
    await db.voucher.delete({
      where: { id }
    });
  } catch {
    redirectWithError(formData, "Voucher gagal dihapus.");
  }

  revalidatePath("/checkout");
  revalidatePath("/admin/vouchers");
  revalidatePath("/admin/orders");
  redirectWithSuccess(formData, "Voucher berhasil dihapus.");
}
