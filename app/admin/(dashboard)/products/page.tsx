import Image from "next/image";
import { ChevronDown, PencilLine, Plus, Tag, Package2, PanelsTopLeft } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { FilePickerField } from "@/components/admin/file-picker-field";
import { ImageSourceFields } from "@/components/admin/image-source-fields";
import { ProductMediaGalleryEditor } from "@/components/admin/product-media-gallery-editor";
import {
  ProductVariantEditor,
  type ProductVariantEditorItem
} from "@/components/admin/product-variant-editor";
import { StatusBanner } from "@/components/shared/status-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { deleteProductAction, upsertProductAction } from "@/lib/actions/admin-actions";
import { getAdminProductsPageData } from "@/lib/data/admin";
import {
  normalizeProductMediaImages,
  type ProductMediaImage
} from "@/lib/product-media";
import { calculateTotalStock, type ProductVariantCombination } from "@/lib/product-variation";
import { formatCurrency } from "@/lib/utils";

const PRODUCT_SIZE_LABELS = ["S", "M", "L", "XL", "XXL", "All Size"];

function formatGalleryImages(images: unknown) {
  return normalizeProductMediaImages(images)
    .map((image) => `${image.url}${image.alt ? `|${image.alt}` : ""}`)
    .join("\n");
}

function getGalleryPreviewUrls(images: unknown) {
  return normalizeProductMediaImages(images)
    .map((image) => image.url)
    .filter(Boolean);
}

type AdminProductsPageData = Awaited<ReturnType<typeof getAdminProductsPageData>>;
type AdminProduct = AdminProductsPageData["products"][number];
type AdminCategory = AdminProductsPageData["categories"][number];

function normalizeSizeLabel(value: string) {
  const normalized = value.trim().toUpperCase().replace(/\s+/g, " ");

  if (normalized === "ALLSIZE" || normalized === "ALL_SIZE" || normalized === "ALL SIZE") {
    return "All Size";
  }

  return PRODUCT_SIZE_LABELS.find((size) => size.toUpperCase() === normalized) || "";
}

function normalizeStockBySize(stockBySize: unknown, sizes: unknown) {
  const fromStock =
    stockBySize && typeof stockBySize === "object"
      ? Object.fromEntries(
          Object.entries(stockBySize as Record<string, unknown>)
            .map(([size, stock]) => [normalizeSizeLabel(size), Number(stock)] as const)
            .filter(([size, stock]) => Boolean(size) && Number.isFinite(stock) && stock >= 0)
        )
      : {};

  if (Object.keys(fromStock).length > 0) {
    return fromStock;
  }

  if (Array.isArray(sizes)) {
    const normalizedSizes = sizes
      .filter((size): size is string => typeof size === "string")
      .map(normalizeSizeLabel)
      .filter(Boolean);

    if (normalizedSizes.length > 0) {
      return Object.fromEntries(Array.from(new Set(normalizedSizes)).map((size) => [size, 0]));
    }
  }

  return Object.fromEntries(PRODUCT_SIZE_LABELS.map((size) => [size, 0]));
}

function normalizeProductVariants(variants: unknown): ProductVariantEditorItem[] {
  if (!Array.isArray(variants)) {
    return [];
  }

  const normalizedVariants: ProductVariantEditorItem[] = [];

  variants.forEach((variant, index) => {
    if (!variant || typeof variant !== "object") {
      return;
    }

    const entry = variant as {
      id?: unknown;
      name?: unknown;
      hex?: unknown;
      imageUrl?: unknown;
      galleryIndexes?: unknown;
      sizes?: unknown;
      stockBySize?: unknown;
      skuBySize?: unknown;
      priceBySize?: unknown;
      combinations?: unknown;
      isDefault?: unknown;
      isActive?: unknown;
    };

    if (typeof entry.name !== "string") {
      return;
    }

    const variantName = entry.name;
    const combinations: ProductVariantCombination[] = Array.isArray(entry.combinations)
      ? entry.combinations
          .map<ProductVariantCombination | null>((combination) => {
            if (!combination || typeof combination !== "object") {
              return null;
            }

            const row = combination as {
              id?: unknown;
              colorId?: unknown;
              colorName?: unknown;
              size?: unknown;
              stock?: unknown;
              sku?: unknown;
              price?: unknown;
              isActive?: unknown;
            };

            if (
              typeof row.id !== "string" ||
              typeof row.colorId !== "string" ||
              typeof row.size !== "string" ||
              typeof row.stock !== "number" ||
              !Number.isFinite(row.stock)
            ) {
              return null;
            }

            return {
              id: row.id,
              colorId: row.colorId,
              colorName: typeof row.colorName === "string" ? row.colorName : variantName,
              size: row.size,
              stock: Math.max(0, Math.floor(row.stock)),
              sku: typeof row.sku === "string" ? row.sku : "",
              price:
                typeof row.price === "number" && Number.isFinite(row.price) && row.price >= 0
                  ? Math.floor(row.price)
                  : null,
              isActive: row.isActive !== false
            };
          })
          .filter((combination): combination is ProductVariantCombination => Boolean(combination))
      : [];

    normalizedVariants.push({
      id: typeof entry.id === "string" ? entry.id : undefined,
      name: variantName,
      hex: typeof entry.hex === "string" ? entry.hex : undefined,
      imageUrl: typeof entry.imageUrl === "string" ? entry.imageUrl : "",
      galleryIndexes: Array.isArray(entry.galleryIndexes)
        ? entry.galleryIndexes
            .map((item) => Number(item))
            .filter((item) => Number.isInteger(item) && item > 0)
        : [],
      stockBySize: normalizeStockBySize(entry.stockBySize, entry.sizes),
      skuBySize:
        entry.skuBySize && typeof entry.skuBySize === "object"
          ? (entry.skuBySize as Record<string, string>)
          : {},
      priceBySize:
        entry.priceBySize && typeof entry.priceBySize === "object"
          ? (entry.priceBySize as Record<string, number | null>)
          : {},
      combinations,
      isDefault: Boolean(entry.isDefault) || index === 0,
      isActive: entry.isActive !== false
    });
  });

  return normalizedVariants;
}

function parseDraftVariants(value?: string) {
  if (!value) {
    return [];
  }

  try {
    return normalizeProductVariants(JSON.parse(value));
  } catch {
    return [];
  }
}

function parseDraftGalleryImages(value?: string, fallbackAlt = "Foto produk ANSLA") {
  if (!value) {
    return [];
  }

  try {
    return normalizeProductMediaImages(JSON.parse(value), fallbackAlt);
  } catch {
    return [];
  }
}

function getVariantSummary(variants: unknown) {
  const normalizedVariants = normalizeProductVariants(variants);
  const totalStock = normalizedVariants.reduce(
    (total, variant) =>
      total +
      (variant.combinations?.length
        ? calculateTotalStock(variant.combinations)
        : Object.values(variant.stockBySize || {}).reduce(
            (stockTotal, stock) => stockTotal + Number(stock || 0),
            0
          )),
    0
  );

  return {
    colorCount: normalizedVariants.length,
    totalStock
  };
}

function buildProductGroups(products: AdminProduct[], categories: AdminCategory[]) {
  const productsByCategoryId = new Map<string, AdminProduct[]>();
  const categoryIds = new Set(categories.map((category) => category.id));

  products.forEach((product) => {
    const currentProducts = productsByCategoryId.get(product.categoryId) || [];
    currentProducts.push(product);
    productsByCategoryId.set(product.categoryId, currentProducts);
  });

  const groups = categories
    .map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      products: productsByCategoryId.get(category.id) || []
    }))
    .filter((group) => group.products.length > 0);

  const uncategorizedProducts = products.filter((product) => !categoryIds.has(product.categoryId));

  if (uncategorizedProducts.length > 0) {
    groups.push({
      id: "uncategorized",
      name: "Tanpa Collection",
      slug: "belum-dikelompokkan",
      products: uncategorizedProducts
    });
  }

  return groups;
}

function getProductGroupSummary(products: AdminProduct[]) {
  return products.reduce(
    (summary, product) => {
      const variantSummary = getVariantSummary(product.variantOptions);

      summary.activeCount += product.isActive ? 1 : 0;
      summary.featuredCount += product.featured ? 1 : 0;
      summary.colorCount += variantSummary.colorCount;
      summary.totalStock += variantSummary.totalStock;

      return summary;
    },
    {
      activeCount: 0,
      featuredCount: 0,
      colorCount: 0,
      totalStock: 0
    }
  );
}

type AdminProductsPageProps = {
  searchParams?: {
    status?: string;
    message?: string;
    draft?: string;
    draftMode?: string;
    draftId?: string;
  };
};

type ProductFormDraft = {
  id?: string;
  name?: string;
  slug?: string;
  price?: string;
  compareAtPrice?: string;
  shortDescription?: string;
  description?: string;
  imageUrl?: string;
  galleryImages?: string;
  galleryImagesJson?: string;
  variantNames?: string;
  variantOptions?: string;
  variantsJson?: string;
  categoryId?: string;
  featured?: boolean;
  isActive?: boolean;
};

function parseDraft(value?: string): ProductFormDraft | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as ProductFormDraft;
  } catch {
    return null;
  }
}

function ProductFormFields({
  mode,
  productId,
  categories,
  values,
  currentImageUrl,
  galleryPreviewUrls = [],
  galleryImages = [],
  initialVariants = []
}: {
  mode: "new" | "edit";
  productId?: string;
  categories: Array<{ id: string; name: string }>;
  values: ProductFormDraft;
  currentImageUrl?: string | null;
  galleryPreviewUrls?: string[];
  galleryImages?: ProductMediaImage[];
  initialVariants?: ProductVariantEditorItem[];
}) {
  const fieldPrefix = mode === "new" ? "new-product" : `product-${productId}`;

  return (
    <div className="space-y-4">
      <input type="hidden" name="sizes" value="" />
      <input type="hidden" name="variantNames" value="" />
      <input type="hidden" name="variantOptions" value="" />

      <div className="rounded-[1.25rem] border border-border/80 bg-background/55 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">Informasi Produk</p>
            <p className="text-xs text-muted-foreground">Data inti produk dan status katalog.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="xl:col-span-2">
            <Label htmlFor={`${fieldPrefix}-name`}>Nama Produk</Label>
            <Input
              id={`${fieldPrefix}-name`}
              name="name"
              className="mt-2"
              defaultValue={values.name ?? ""}
            />
          </div>
          <div className="xl:col-span-2">
            <Label htmlFor={`${fieldPrefix}-slug`}>Slug</Label>
            <Input
              id={`${fieldPrefix}-slug`}
              name="slug"
              className="mt-2"
              defaultValue={values.slug ?? ""}
            />
          </div>
          <div>
            <Label htmlFor={`${fieldPrefix}-price`}>Harga</Label>
            <Input
              id={`${fieldPrefix}-price`}
              name="price"
              type="number"
              className="mt-2"
              defaultValue={values.price ?? ""}
            />
          </div>
          <div>
            <Label htmlFor={`${fieldPrefix}-compare-price`}>Harga Coret</Label>
            <Input
              id={`${fieldPrefix}-compare-price`}
              name="compareAtPrice"
              type="number"
              className="mt-2"
              defaultValue={values.compareAtPrice ?? ""}
            />
          </div>
          <div className="xl:col-span-2">
            <Label htmlFor={`${fieldPrefix}-category`}>Collection</Label>
            <select
              id={`${fieldPrefix}-category`}
              name="categoryId"
              defaultValue={values.categoryId || ""}
              className="mt-2 flex h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="" disabled>
                Pilih collection
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-3 rounded-[1rem] border border-dashed border-border/80 p-3 sm:grid-cols-2">
          <label className="flex items-center gap-3 text-sm text-stone-700">
            <input
              type="checkbox"
              name="featured"
              className="h-4 w-4"
              defaultChecked={Boolean(values.featured)}
            />
            Tampilkan sebagai produk unggulan
          </label>
          <label className="flex items-center gap-3 text-sm text-stone-700">
            <input
              type="checkbox"
              name="isActive"
              className="h-4 w-4"
              defaultChecked={values.isActive ?? true}
            />
            Produk aktif dan tampil di website
          </label>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="space-y-4 rounded-[1.25rem] border border-border/80 bg-background/55 p-4">
          <div>
            <p className="text-sm font-medium text-foreground">Gambar</p>
            <p className="text-xs text-muted-foreground">
              Foto utama dan galeri sudut/model produk. Galeri tetap bisa dipakai walau produk hanya
              punya satu warna.
            </p>
          </div>

          <ImageSourceFields
            baseId={fieldPrefix}
            currentImageUrl={currentImageUrl}
            imageUrlValue={values.imageUrl ?? currentImageUrl ?? ""}
            required
          />

          <div className="rounded-[1rem] border border-border/70 p-4">
            <Label>Galeri foto produk</Label>
            <div className="mt-2 inline-flex rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
              Maksimal 9 gambar
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Upload beberapa foto tampak depan, samping, belakang, atau detail bahan. Di bagian
              warna, isi nomor galeri untuk mengaitkan foto ke warna tersebut.
            </p>
            {galleryPreviewUrls.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-3">
                {galleryPreviewUrls.map((imageUrl, index) => (
                  <Image
                    key={`${imageUrl}-${index}`}
                    src={imageUrl}
                    alt={`Galeri produk ${index + 1}`}
                    width={56}
                    height={64}
                    className="h-16 w-14 rounded-xl border border-border/70 object-cover"
                  />
                ))}
              </div>
            ) : null}
            <ProductMediaGalleryEditor
              initialImages={galleryImages}
              coverUrl={currentImageUrl || values.imageUrl || ""}
              fallbackAlt={values.name || "Foto produk ANSLA"}
            />
            <div className="mt-3">
              <FilePickerField
                name="galleryImageFiles"
                accept="image/png,image/jpeg,image/webp,image/gif"
                multiple
              />
            </div>
            <details className="mt-3 rounded-2xl border border-dashed border-border/70 px-3 py-3">
              <summary className="cursor-pointer text-sm font-medium text-foreground">
                Input link galeri lama
              </summary>
              <Textarea
                id={`${fieldPrefix}-gallery-images`}
                name="galleryImages"
                className="mt-3 min-h-[90px]"
                defaultValue={values.galleryImages ?? ""}
                placeholder={"Satu link/path per baris, boleh pakai format:\n/uploads/products/look-2.jpg|Alt text foto"}
              />
            </details>
          </div>
        </div>

        <div className="space-y-4 rounded-[1.25rem] border border-border/80 bg-background/55 p-4">
          <div>
            <p className="text-sm font-medium text-foreground">Warna</p>
            <p className="text-xs text-muted-foreground">
              Warna, gambar warna, size, dan stok dibuat dalam satu editor.
            </p>
          </div>
          <ProductVariantEditor initialVariants={initialVariants} />
        </div>
      </div>

      <div className="rounded-[1.25rem] border border-border/80 bg-background/55 p-4">
        <p className="text-sm font-medium text-foreground">Deskripsi</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <Label htmlFor={`${fieldPrefix}-short-description`}>Deskripsi Singkat</Label>
            <Textarea
              id={`${fieldPrefix}-short-description`}
              name="shortDescription"
              className="mt-2 min-h-[96px]"
              defaultValue={values.shortDescription ?? ""}
            />
          </div>

          <div>
            <Label htmlFor={`${fieldPrefix}-description`}>Deskripsi Lengkap</Label>
            <Textarea
              id={`${fieldPrefix}-description`}
              name="description"
              className="mt-2 min-h-[96px]"
              defaultValue={values.description ?? ""}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const { products, categories } = await getAdminProductsPageData();
  const draft = parseDraft(searchParams?.draft);
  const newProductDraft = searchParams?.draftMode === "new" ? draft : null;
  const editDraftId = searchParams?.draftMode === "edit" ? searchParams?.draftId : undefined;

  const featuredCount = products.filter((product) => product.featured).length;
  const activeCount = products.filter((product) => product.isActive).length;
  const productGroups = buildProductGroups(products, categories);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Produk"
        title="Kelola produk katalog"
        description="Produk sekarang dikelompokkan per collection agar proses upload, edit, dan cek stok lebih mudah dibaca."
      />

      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Total produk</p>
              <p className="mt-1 text-3xl font-semibold text-foreground">{products.length}</p>
            </div>
            <Package2 className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Produk aktif</p>
              <p className="mt-1 text-3xl font-semibold text-foreground">{activeCount}</p>
            </div>
            <Badge>Aktif</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Produk unggulan</p>
              <p className="mt-1 text-3xl font-semibold text-foreground">{featuredCount}</p>
            </div>
            <Tag className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Collection terisi</p>
              <p className="mt-1 text-3xl font-semibold text-foreground">{productGroups.length}</p>
            </div>
            <PanelsTopLeft className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <StatusBanner status={searchParams?.status} message={searchParams?.message} />

      <details
        className="group overflow-hidden rounded-[1.5rem] border border-border bg-[hsl(var(--card)/0.88)] shadow-soft"
        open={Boolean(newProductDraft)}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--accent)/0.8)] text-foreground">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">Tambah Produk Baru</p>
              <p className="text-sm text-muted-foreground">
                Buka hanya saat perlu membuat produk baru.
              </p>
            </div>
          </div>
          <ChevronDown className="h-5 w-5 text-muted-foreground transition group-open:rotate-180" />
        </summary>
        <div className="border-t border-border/70 px-5 py-5">
          <form action={upsertProductAction} className="space-y-4" encType="multipart/form-data">
            <input type="hidden" name="redirectTo" value="/admin/products" />
            <ProductFormFields
              mode="new"
              categories={categories}
              values={{
                name: newProductDraft?.name ?? "",
                slug: newProductDraft?.slug ?? "",
                price: newProductDraft?.price ?? "",
                compareAtPrice: newProductDraft?.compareAtPrice ?? "",
                shortDescription: newProductDraft?.shortDescription ?? "",
                description: newProductDraft?.description ?? "",
                imageUrl: newProductDraft?.imageUrl ?? "",
                galleryImages: newProductDraft?.galleryImages ?? "",
                galleryImagesJson: newProductDraft?.galleryImagesJson ?? "",
                variantNames: newProductDraft?.variantNames ?? "",
                variantOptions: newProductDraft?.variantOptions ?? "",
                variantsJson: newProductDraft?.variantsJson ?? "",
                categoryId: newProductDraft?.categoryId ?? "",
                featured: Boolean(newProductDraft?.featured),
                isActive: newProductDraft?.isActive ?? true
              }}
              galleryPreviewUrls={parseDraftGalleryImages(
                newProductDraft?.galleryImagesJson,
                newProductDraft?.name || "Foto produk ANSLA"
              ).map((image) => image.url)}
              galleryImages={parseDraftGalleryImages(
                newProductDraft?.galleryImagesJson,
                newProductDraft?.name || "Foto produk ANSLA"
              )}
                            initialVariants={parseDraftVariants(newProductDraft?.variantsJson)}
                          />
            <div className="flex justify-end">
              <Button type="submit" className="min-w-[180px]">
                Simpan Produk Baru
              </Button>
            </div>
          </form>
        </div>
      </details>

      <div className="space-y-5">
        {productGroups.map((group, groupIndex) => {
          const groupSummary = getProductGroupSummary(group.products);
          const hasActiveDraft = group.products.some((product) => product.id === editDraftId);

          return (
            <details
              key={group.id}
              className="group/collection overflow-hidden rounded-[1.75rem] border border-border bg-[hsl(var(--card)/0.78)] shadow-soft"
              open={hasActiveDraft || groupIndex === 0}
            >
              <summary className="flex cursor-pointer list-none flex-col gap-4 border-b border-border/70 bg-[hsl(var(--accent)/0.28)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                      Collection
                    </p>
                    <Badge variant="secondary">{group.products.length} produk</Badge>
                    <Badge variant="outline">{groupSummary.totalStock} stok</Badge>
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold text-foreground">{group.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {group.slug} - {groupSummary.activeCount} aktif,{" "}
                    {groupSummary.featuredCount} unggulan, {groupSummary.colorCount} warna
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>Lihat produk</span>
                  <ChevronDown className="h-5 w-5 transition group-open/collection:rotate-180" />
                </div>
              </summary>

              <div className="space-y-4 p-4">
                {group.products.map((product) => {
                  const productDraft = editDraftId === product.id ? draft : null;
                  const variantSummary = getVariantSummary(product.variantOptions);
                  const initialVariants =
                    productDraft?.variantsJson && productDraft.variantsJson.length > 0
                      ? parseDraftVariants(productDraft.variantsJson)
                      : normalizeProductVariants(product.variantOptions);

                  return (
                    <details
                      key={product.id}
                      className="group overflow-hidden rounded-[1.5rem] border border-border bg-[hsl(var(--card)/0.9)] shadow-soft"
                      open={Boolean(productDraft)}
                    >
                      <summary className="flex cursor-pointer list-none flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-4">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            width={56}
                            height={56}
                            className="h-14 w-14 rounded-2xl border border-border/70 object-cover"
                          />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-lg font-semibold text-foreground">
                                {product.name}
                              </p>
                              {product.featured ? <Badge>Unggulan</Badge> : null}
                              <Badge variant={product.isActive ? "default" : "outline"}>
                                {product.isActive ? "Aktif" : "Nonaktif"}
                              </Badge>
                              {variantSummary.colorCount > 0 ? (
                                <Badge variant="outline">
                                  {variantSummary.colorCount} warna
                                </Badge>
                              ) : null}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {product.slug}
                              {variantSummary.totalStock > 0
                                ? ` - stok ${variantSummary.totalStock}`
                                : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-semibold text-foreground">
                              {formatCurrency(product.price)}
                            </p>
                            {product.compareAtPrice ? (
                              <p className="text-sm text-muted-foreground line-through">
                                {formatCurrency(product.compareAtPrice)}
                              </p>
                            ) : null}
                          </div>
                          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-2 text-sm text-muted-foreground">
                            <PencilLine className="h-4 w-4" />
                            Edit
                          </div>
                        </div>
                      </summary>

                      <div className="border-t border-border/70 px-5 py-5">
                        <form
                          action={upsertProductAction}
                          className="space-y-4"
                          encType="multipart/form-data"
                        >
                          <input type="hidden" name="redirectTo" value="/admin/products" />
                          <input type="hidden" name="id" value={product.id} />

                          <ProductFormFields
                            mode="edit"
                            productId={product.id}
                            categories={categories}
                            currentImageUrl={product.imageUrl}
                            values={{
                              id: product.id,
                              name: productDraft?.name ?? product.name,
                              slug: productDraft?.slug ?? product.slug,
                              price: productDraft?.price ?? String(product.price),
                              compareAtPrice:
                                productDraft?.compareAtPrice ??
                                String(product.compareAtPrice ?? ""),
                              shortDescription:
                                productDraft?.shortDescription ?? product.shortDescription,
                              description: productDraft?.description ?? product.description,
                              imageUrl: productDraft?.imageUrl ?? product.imageUrl,
                              galleryImages:
                                productDraft?.galleryImages ??
                                formatGalleryImages(product.galleryImages),
                              galleryImagesJson: productDraft?.galleryImagesJson ?? "",
                              variantNames: productDraft?.variantNames ?? "",
                              variantOptions: productDraft?.variantOptions ?? "",
                              variantsJson: productDraft?.variantsJson ?? "",
                              categoryId: productDraft?.categoryId ?? product.categoryId,
                              featured: productDraft?.featured ?? product.featured,
                              isActive: productDraft?.isActive ?? product.isActive
                            }}
                            galleryPreviewUrls={
                              productDraft?.galleryImagesJson
                                ? parseDraftGalleryImages(
                                    productDraft.galleryImagesJson,
                                    product.name
                                  ).map((image) => image.url)
                                : getGalleryPreviewUrls(product.galleryImages)
                            }
                            galleryImages={
                              productDraft?.galleryImagesJson
                                ? parseDraftGalleryImages(productDraft.galleryImagesJson, product.name)
                                : normalizeProductMediaImages(product.galleryImages, product.name)
                            }
                            initialVariants={initialVariants}
                          />

                          <div className="flex justify-end border-t border-border/70 pt-4">
                            <Button type="submit" className="min-w-[180px]">
                              Simpan Perubahan
                            </Button>
                          </div>
                        </form>

                        <form action={deleteProductAction} className="mt-3">
                          <input type="hidden" name="redirectTo" value="/admin/products" />
                          <input type="hidden" name="id" value={product.id} />
                          <Button type="submit" variant="destructive">
                            Hapus Produk
                          </Button>
                        </form>
                      </div>
                    </details>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
