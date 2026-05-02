import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const voucherCodeRegex = /^[A-Z0-9-]+$/;
const localUploadPathRegex = /^\/uploads\/[a-z0-9/_-]+\.(jpg|jpeg|png|webp|gif)$/i;
const isValidImageSource = (value: string) =>
  z.string().url().safeParse(value).success || localUploadPathRegex.test(value);

const imageSourceOptionalSchema = z
  .string()
  .trim()
  .refine(
    (value) => value.length === 0 || isValidImageSource(value),
    "Image URL tidak valid."
  );

const imageSourceRequiredSchema = z
  .string()
  .trim()
  .min(1, "Isi Image URL atau upload file gambar.")
  .refine((value) => isValidImageSource(value), "Image URL tidak valid.");

const productVariantSchema = z.object({
  name: z.string().trim().min(1, "Nama varian wajib diisi."),
  hex: z.string().trim().optional().default(""),
  imageUrl: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || "")
    .refine(
      (value) => value.length === 0 || isValidImageSource(value),
      "Gambar varian tidak valid."
    ),
  galleryIndexes: z.array(z.number().int().positive()).optional().default([]),
  sizes: z.array(z.string().trim().min(1)).optional().default([]),
  stockBySize: z.record(z.coerce.number().int().nonnegative()).optional().default({}),
  totalStock: z.coerce.number().int().nonnegative().optional().default(0),
  price: z.number().int().nonnegative().optional(),
  isDefault: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true)
});

export const loginSchema = z.object({
  email: z.string().email("Email admin tidak valid."),
  password: z.string().min(6, "Password minimal 6 karakter.")
});

export const customerLoginSchema = z.object({
  email: z.string().trim().email("Email tidak valid."),
  password: z.string().min(6, "Password minimal 6 karakter.")
});

export const customerRegisterSchema = z
  .object({
    name: z.string().trim().min(2, "Nama minimal 2 karakter."),
    email: z.string().trim().email("Email tidak valid."),
    phone: z.string().trim().max(30).optional().or(z.literal("")),
    password: z.string().min(6, "Password minimal 6 karakter."),
    confirmPassword: z.string().min(6, "Konfirmasi password minimal 6 karakter.")
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Konfirmasi password belum sama."
      });
    }
  });

export const leadSchema = z
  .object({
    name: z.string().trim().max(100).optional(),
    email: z
      .string()
      .trim()
      .email("Email tidak valid.")
      .optional()
      .or(z.literal("")),
    phone: z.string().trim().max(30).optional(),
    source: z.string().trim().min(2, "Source wajib diisi.")
  })
  .superRefine((data, ctx) => {
    const email = data.email?.trim();
    const phone = data.phone?.trim();

    if (!email && !phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "Isi minimal email atau nomor WhatsApp."
      });
    }
  });

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter."),
  email: z.string().trim().email("Email tidak valid."),
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().min(10, "Pesan minimal 10 karakter.")
});

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Nama collection minimal 2 karakter."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug minimal 2 karakter.")
    .regex(slugRegex, "Slug hanya boleh huruf kecil, angka, dan tanda hubung."),
  imageUrl: imageSourceOptionalSchema.optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().nonnegative("Urutan collection harus angka 0 atau lebih.")
});

export const productSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().trim().min(3, "Nama produk minimal 3 karakter."),
    slug: z
      .string()
      .trim()
      .min(3, "Slug minimal 3 karakter.")
      .regex(slugRegex, "Slug hanya boleh huruf kecil, angka, dan tanda hubung."),
    featured: z.boolean(),
    price: z.coerce.number().int().nonnegative("Harga harus angka valid."),
    compareAtPrice: z
      .union([z.coerce.number().int().nonnegative(), z.nan()])
      .optional(),
    shortDescription: z.string().trim().min(10, "Short description minimal 10 karakter."),
    description: z.string().trim().min(20, "Description minimal 20 karakter."),
    imageUrl: imageSourceRequiredSchema,
    galleryImages: z
      .array(imageSourceOptionalSchema)
      .max(9, "Galeri model maksimal 9 gambar.")
      .optional()
      .default([]),
    variantOptions: z.array(productVariantSchema).optional().default([]),
    categoryId: z.string().trim().min(1, "Collection wajib dipilih."),
    isActive: z.boolean()
  })
  .superRefine((data, ctx) => {
    if (
      typeof data.compareAtPrice === "number" &&
      !Number.isNaN(data.compareAtPrice) &&
      data.compareAtPrice < data.price
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["compareAtPrice"],
        message: "Compare price harus lebih besar atau sama dengan harga jual."
      });
    }
  });

export const testimonialSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Nama minimal 2 karakter."),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  rating: z.coerce.number().int().min(1).max(5),
  content: z.string().trim().min(10, "Isi testimonial minimal 10 karakter."),
  imageUrl: imageSourceOptionalSchema.optional().or(z.literal("")),
  isActive: z.boolean()
});

export const faqSchema = z.object({
  id: z.string().optional(),
  question: z.string().trim().min(8, "Pertanyaan minimal 8 karakter."),
  answer: z.string().trim().min(12, "Jawaban minimal 12 karakter."),
  sortOrder: z.coerce.number().int().nonnegative(),
  isActive: z.boolean()
});

export const bannerSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3, "Judul minimal 3 karakter."),
  subtitle: z.string().trim().min(10, "Subtitle minimal 10 karakter."),
  imageUrl: imageSourceRequiredSchema,
  ctaText: z.string().trim().min(2, "CTA text minimal 2 karakter."),
  ctaLink: z.string().trim().min(1, "CTA link wajib diisi."),
  sortOrder: z.coerce.number().int().nonnegative(),
  isActive: z.boolean()
});

const optionalDateTimeSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim().length === 0 ? undefined : value),
  z.coerce.date().optional()
);

export const voucherSchema = z
  .object({
    id: z.string().optional(),
    code: z
      .string()
      .trim()
      .min(3, "Kode voucher minimal 3 karakter.")
      .transform((value) => value.toUpperCase())
      .refine(
        (value) => voucherCodeRegex.test(value),
        "Kode voucher hanya boleh huruf besar, angka, dan tanda hubung."
      ),
    label: z.string().trim().min(3, "Nama voucher minimal 3 karakter."),
    discountType: z.enum(["PERCENT", "FIXED"]),
    discountValue: z.coerce.number().int().positive("Nilai diskon harus lebih dari 0."),
    minPurchase: z.coerce.number().int().nonnegative("Minimum belanja tidak valid."),
    usageLimit: z
      .union([z.coerce.number().int().positive(), z.nan()])
      .optional(),
    startsAt: optionalDateTimeSchema,
    endsAt: optionalDateTimeSchema,
    isActive: z.boolean()
  })
  .superRefine((data, ctx) => {
    if (data.discountType === "PERCENT" && data.discountValue > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discountValue"],
        message: "Diskon persen maksimal 100%."
      });
    }

    if (data.endsAt && data.startsAt && data.endsAt <= data.startsAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endsAt"],
        message: "Waktu akhir harus setelah waktu mulai."
      });
    }
  });

export const checkoutItemSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().trim().min(1, "Nama produk wajib ada."),
  productSlug: z.string().trim().min(1, "Slug produk wajib ada."),
  imageUrl: z.string().trim().min(1, "Gambar produk wajib ada."),
  variantName: z.string().trim().optional().or(z.literal("")),
  size: z.string().trim().optional().or(z.literal("")),
  quantity: z.coerce.number().int().min(1, "Jumlah minimal 1."),
  unitPrice: z.coerce.number().int().nonnegative(),
  lineTotal: z.coerce.number().int().nonnegative()
});

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(3, "Nama lengkap minimal 3 karakter."),
  email: z.string().trim().email("Email tidak valid.").optional().or(z.literal("")),
  phone: z.string().trim().min(8, "Nomor HP / WhatsApp minimal 8 digit."),
  province: z.string().trim().min(2, "Provinsi wajib diisi."),
  city: z.string().trim().min(2, "Kota / Kabupaten wajib diisi."),
  district: z.string().trim().min(2, "Kecamatan wajib diisi."),
  address: z.string().trim().min(10, "Alamat lengkap minimal 10 karakter."),
  postalCode: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
  shippingMethod: z.string().trim().min(2, "Metode pengiriman wajib dipilih."),
  paymentMethod: z.string().trim().min(2, "Metode pembayaran wajib dipilih."),
  checkoutMethod: z.enum(["web", "whatsapp"]),
  subtotal: z.coerce.number().int().nonnegative(),
  shippingCost: z.coerce.number().int().nonnegative(),
  total: z.coerce.number().int().nonnegative(),
  items: z.array(checkoutItemSchema).min(1, "Keranjang checkout masih kosong.")
});
