import Image from "next/image";
import { ChevronDown, PencilLine, Plus, Tag, Package2 } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { FilePickerField } from "@/components/admin/file-picker-field";
import { ImageSourceFields } from "@/components/admin/image-source-fields";
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
import { formatCurrency } from "@/lib/utils";

function formatGalleryImages(images: unknown) {
  if (!Array.isArray(images)) {
    return "";
  }

  return images.filter((item): item is string => typeof item === "string").join("\n");
}

function getGalleryPreviewUrls(images: unknown) {
  if (!Array.isArray(images)) {
    return [];
  }

  return images.filter((item): item is string => typeof item === "string" && item.length > 0);
}

const PRODUCT_SIZE_LABELS = ["S", "M", "L", "XL", "XXL", "All Size"];

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
      name?: unknown;
      hex?: unknown;
      imageUrl?: unknown;
      galleryIndexes?: unknown;
      sizes?: unknown;
      stockBySize?: unknown;
      isDefault?: unknown;
      isActive?: unknown;
    };

    if (typeof entry.name !== "string") {
      return;
    }

    normalizedVariants.push({
      name: entry.name,
      hex: typeof entry.hex === "string" ? entry.hex : undefined,
      imageUrl: typeof entry.imageUrl === "string" ? entry.imageUrl : "",
      galleryIndexes: Array.isArray(entry.galleryIndexes)
        ? entry.galleryIndexes
            .map((item) => Number(item))
            .filter((item) => Number.isInteger(item) && item > 0)
        : [],
      stockBySize: normalizeStockBySize(entry.stockBySize, entry.sizes),
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

function getVariantSummary(variants: unknown) {
  const normalizedVariants = normalizeProductVariants(variants);
  const totalStock = normalizedVariants.reduce(
    (total, variant) =>
      total +
      Object.values(variant.stockBySize || {}).reduce(
        (stockTotal, stock) => stockTotal + Number(stock || 0),
        0
      ),
    0
  );

  return {
    colorCount: normalizedVariants.length,
    totalStock
  };
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
  initialVariants = []
}: {
  mode: "new" | "edit";
  productId?: string;
  categories: Array<{ id: string; name: string }>;
  values: ProductFormDraft;
  currentImageUrl?: string | null;
  galleryPreviewUrls?: string[];
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

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-4 rounded-[1.25rem] border border-border/80 bg-background/55 p-4">
          <div>
            <p className="text-sm font-medium text-foreground">Gambar</p>
            <p className="text-xs text-muted-foreground">Foto utama dan galeri pendukung.</p>
          </div>

          <ImageSourceFields
            baseId={fieldPrefix}
            currentImageUrl={currentImageUrl}
            imageUrlValue={values.imageUrl ?? currentImageUrl ?? ""}
            required
          />

          <div className="rounded-[1rem] border border-border/70 p-4">
            <Label>Galeri produk</Label>
            <div className="mt-2 inline-flex rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
              Maksimal 9 gambar
            </div>
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
            <div className="mt-3">
              <FilePickerField
                name="galleryImageFiles"
                accept="image/png,image/jpeg,image/webp,image/gif"
                multiple
              />
            </div>
            <details className="mt-3 rounded-2xl border border-dashed border-border/70 px-3 py-3">
              <summary className="cursor-pointer text-sm font-medium text-foreground">
                Input link galeri manual
              </summary>
              <Textarea
                id={`${fieldPrefix}-gallery-images`}
                name="galleryImages"
                className="mt-3 min-h-[90px]"
                defaultValue={values.galleryImages ?? ""}
                placeholder={"Satu link/path per baris\n/uploads/products/look-2.jpg\nhttps://..."}
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

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Produk"
        title="Kelola produk katalog"
        description="Tampilan dirapikan supaya tambah, edit, dan cek status produk lebih cepat tanpa banyak scroll."
      />

      <div className="grid gap-3 md:grid-cols-3">
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
                variantNames: newProductDraft?.variantNames ?? "",
                variantOptions: newProductDraft?.variantOptions ?? "",
                variantsJson: newProductDraft?.variantsJson ?? "",
                categoryId: newProductDraft?.categoryId ?? "",
                featured: Boolean(newProductDraft?.featured),
                isActive: newProductDraft?.isActive ?? true
              }}
              galleryPreviewUrls={[]}
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

      <div className="space-y-4">
        {products.map((product) => {
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
                      <Badge variant="secondary">{product.category.name}</Badge>
                      {product.featured ? <Badge>Unggulan</Badge> : null}
                      <Badge variant={product.isActive ? "default" : "outline"}>
                        {product.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                      {variantSummary.colorCount > 0 ? (
                        <Badge variant="outline">{variantSummary.colorCount} warna</Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {product.slug}
                      {variantSummary.totalStock > 0 ? ` - stok ${variantSummary.totalStock}` : ""}
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
                <form action={upsertProductAction} className="space-y-4" encType="multipart/form-data">
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
                        productDraft?.compareAtPrice ?? String(product.compareAtPrice ?? ""),
                      shortDescription:
                        productDraft?.shortDescription ?? product.shortDescription,
                      description: productDraft?.description ?? product.description,
                      imageUrl: productDraft?.imageUrl ?? product.imageUrl,
                      galleryImages:
                        productDraft?.galleryImages ?? formatGalleryImages(product.galleryImages),
                      variantNames: productDraft?.variantNames ?? "",
                      variantOptions: productDraft?.variantOptions ?? "",
                      variantsJson: productDraft?.variantsJson ?? "",
                      categoryId: productDraft?.categoryId ?? product.categoryId,
                      featured: productDraft?.featured ?? product.featured,
                      isActive: productDraft?.isActive ?? product.isActive
                    }}
                    galleryPreviewUrls={getGalleryPreviewUrls(product.galleryImages)}
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
    </div>
  );
}
