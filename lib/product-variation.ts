export const DEFAULT_PRODUCT_SIZES = ["S", "M", "L", "XL", "XXL", "All Size"] as const;

export type ProductSizeLabel = (typeof DEFAULT_PRODUCT_SIZES)[number];

export type ProductColorInput = {
  id?: string;
  name: string;
  hex?: string;
  imageUrl?: string;
  galleryIndexes?: number[];
  isDefault?: boolean;
  isActive?: boolean;
  sortOrder?: number;
};

export type ProductSizeInput = {
  name: string;
  isActive?: boolean;
};

export type ProductVariantCombination = {
  id: string;
  productId?: string;
  colorId: string;
  colorName: string;
  size: string;
  stock: number;
  sku?: string;
  price?: number | null;
  isActive: boolean;
};

export type ProductVariationValidationInput = {
  name?: string;
  price?: number;
  imageUrl?: string;
  isActive?: boolean;
  colors?: ProductColorInput[];
  variants?: ProductVariantCombination[];
};

function slugifyVariantPart(value: string, fallback: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

export function buildColorId(color: Pick<ProductColorInput, "id" | "name">, index: number) {
  return color.id?.trim() || `color-${slugifyVariantPart(color.name, String(index + 1))}`;
}

export function buildVariantId(colorId: string, size: string) {
  return `${colorId}__${slugifyVariantPart(size, "all-size")}`;
}

export function normalizeSizeLabel(value: string) {
  const normalized = value.trim().toUpperCase().replace(/[\s_-]+/g, " ");

  if (normalized === "ALLSIZE" || normalized === "ALL SIZE") {
    return "All Size";
  }

  return (
    DEFAULT_PRODUCT_SIZES.find((size) => size.toUpperCase() === normalized) ||
    value.trim()
  );
}

function normalizeStock(value: unknown) {
  const stock = Number(value);
  return Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : 0;
}

function normalizeOptionalPrice(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? Math.floor(price) : null;
}

function makeVariantKey(colorId: string, size: string) {
  return `${colorId}::${normalizeSizeLabel(size).toLowerCase()}`;
}

export function generateVariantCombinations(
  colors: ProductColorInput[],
  sizes: ProductSizeInput[],
  existingVariants: ProductVariantCombination[] = []
) {
  const activeSizes = sizes
    .map((size) => ({
      ...size,
      name: normalizeSizeLabel(size.name)
    }))
    .filter((size) => size.name.length > 0 && size.isActive !== false);
  const normalizedSizes = activeSizes.length > 0 ? activeSizes : [{ name: "All Size", isActive: true }];
  const existingById = new Map(existingVariants.map((variant) => [variant.id, variant]));
  const existingByKey = new Map(
    existingVariants.map((variant) => [makeVariantKey(variant.colorId, variant.size), variant])
  );
  const existingByNameKey = new Map(
    existingVariants.map((variant) => [
      makeVariantKey(slugifyVariantPart(variant.colorName, variant.colorId), variant.size),
      variant
    ])
  );

  return colors.flatMap((color, colorIndex) => {
    const colorId = buildColorId(color, colorIndex);
    const colorName = color.name.trim();

    if (!colorName || color.isActive === false) {
      return [];
    }

    return normalizedSizes.map<ProductVariantCombination>((size) => {
      const variantId = buildVariantId(colorId, size.name);
      const preserved =
        existingById.get(variantId) ||
        existingByKey.get(makeVariantKey(colorId, size.name)) ||
        existingByNameKey.get(makeVariantKey(slugifyVariantPart(colorName, colorId), size.name));

      return {
        id: preserved?.id || variantId,
        productId: preserved?.productId,
        colorId,
        colorName,
        size: size.name,
        stock: normalizeStock(preserved?.stock),
        sku: preserved?.sku || "",
        price: normalizeOptionalPrice(preserved?.price),
        isActive: preserved?.isActive ?? true
      };
    });
  });
}

export function calculateTotalStock(variants: ProductVariantCombination[]) {
  return variants.reduce(
    (total, variant) => total + (variant.isActive ? normalizeStock(variant.stock) : 0),
    0
  );
}

export function getAvailableSizesByColor(
  colorId: string,
  variants: ProductVariantCombination[]
) {
  return variants
    .filter((variant) => variant.colorId === colorId && variant.isActive && variant.stock > 0)
    .map((variant) => variant.size);
}

export function getProductVariantByColorAndSize(
  colorId: string,
  size: string,
  variants: ProductVariantCombination[]
) {
  const normalizedSize = normalizeSizeLabel(size);

  return variants.find(
    (variant) => variant.colorId === colorId && normalizeSizeLabel(variant.size) === normalizedSize
  );
}

export function updateVariantStock(
  variantId: string,
  stock: number,
  variants: ProductVariantCombination[]
) {
  return variants.map((variant) =>
    variant.id === variantId ? { ...variant, stock: normalizeStock(stock) } : variant
  );
}

export function toggleVariantActive(
  variantId: string,
  variants: ProductVariantCombination[]
) {
  return variants.map((variant) =>
    variant.id === variantId ? { ...variant, isActive: !variant.isActive } : variant
  );
}

export function validateProductBeforePublish(product: ProductVariationValidationInput) {
  const errors: string[] = [];
  const activeColors = (product.colors || []).filter((color) => color.isActive !== false);
  const activeVariants = (product.variants || []).filter((variant) => variant.isActive);

  if (!product.name?.trim()) {
    errors.push("Nama produk wajib diisi.");
  }

  if (!Number.isFinite(product.price) || Number(product.price) <= 0) {
    errors.push("Harga produk wajib diisi.");
  }

  if (!product.imageUrl?.trim()) {
    errors.push("Gambar utama produk wajib diisi.");
  }

  if (activeColors.length === 0 || activeVariants.length === 0) {
    errors.push("Tambahkan minimal satu warna atau variasi aktif.");
  }

  if (activeColors.some((color) => !color.name.trim())) {
    errors.push("Nama warna aktif tidak boleh kosong.");
  }

  if (activeVariants.some((variant) => !variant.size.trim() || !Number.isFinite(Number(variant.stock)))) {
    errors.push("Size aktif harus punya stok valid.");
  }

  if (calculateTotalStock(activeVariants) <= 0) {
    errors.push("Produk aktif harus memiliki stok lebih dari 0.");
  }

  return {
    ok: errors.length === 0,
    errors
  };
}
