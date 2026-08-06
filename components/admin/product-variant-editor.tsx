"use client";

import { ImageIcon, Palette, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  buildColorId,
  calculateTotalStock,
  DEFAULT_PRODUCT_SIZES,
  generateVariantCombinations,
  type ProductVariantCombination
} from "@/lib/product-variation";
import { cn } from "@/lib/utils";

export type ProductVariantSizeRow = {
  size: string;
  stock: number;
  sku?: string;
  price?: number | null;
  isActive?: boolean;
};

export type ProductVariantEditorItem = {
  id?: string;
  name: string;
  hex?: string;
  imageUrl?: string;
  galleryIndexes?: number[];
  sizes?: string[];
  stockBySize?: Record<string, number>;
  skuBySize?: Record<string, string>;
  priceBySize?: Record<string, number | null>;
  sizeRows?: ProductVariantSizeRow[];
  combinations?: ProductVariantCombination[];
  variants?: ProductVariantCombination[];
  isDefault?: boolean;
  isActive?: boolean;
};

const SIZE_OPTIONS = [...DEFAULT_PRODUCT_SIZES];

function createRowsFromStock(variant?: ProductVariantEditorItem): ProductVariantSizeRow[] {
  const activeSizes = new Set(
    (variant?.sizes?.length ? variant.sizes : SIZE_OPTIONS).map((size) => size.trim())
  );
  const rowsFromCombinations = variant?.combinations || variant?.variants;

  if (rowsFromCombinations?.length) {
    return SIZE_OPTIONS.map((size) => {
      const existing = rowsFromCombinations.find((row) => row.size === size);

      return {
        size,
        stock: Math.max(0, Math.floor(Number(existing?.stock ?? 0))),
        sku: existing?.sku || "",
        price: existing?.price ?? null,
        isActive: existing?.isActive ?? activeSizes.has(size)
      };
    });
  }

  if (variant?.sizeRows?.length) {
    return SIZE_OPTIONS.map((size) => {
      const existing = variant.sizeRows?.find((row) => row.size === size);

      return {
        size,
        stock: Math.max(0, Math.floor(Number(existing?.stock ?? variant.stockBySize?.[size] ?? 0))),
        sku: existing?.sku || variant.skuBySize?.[size] || "",
        price: existing?.price ?? variant.priceBySize?.[size] ?? null,
        isActive: existing?.isActive ?? activeSizes.has(size)
      };
    });
  }

  return SIZE_OPTIONS.map((size) => ({
    size,
    stock: Math.max(0, Math.floor(Number(variant?.stockBySize?.[size] ?? 0))),
    sku: variant?.skuBySize?.[size] || "",
    price: variant?.priceBySize?.[size] ?? null,
    isActive: activeSizes.has(size)
  }));
}

function createEmptyVariant(): ProductVariantEditorItem {
  return {
    id: "",
    name: "",
    hex: "#2f2a25",
    imageUrl: "",
    galleryIndexes: [],
    sizeRows: createRowsFromStock(),
    isDefault: false,
    isActive: true
  };
}

function parseGalleryIndexes(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((item) => Number.isInteger(item) && item > 0)
    )
  );
}

function normalizeInitialVariant(variant: ProductVariantEditorItem, index: number) {
  return {
    ...createEmptyVariant(),
    ...variant,
    id: variant.id || "",
    hex: variant.hex || "#2f2a25",
    sizeRows: createRowsFromStock(variant),
    isDefault: Boolean(variant.isDefault) || index === 0,
    isActive: variant.isActive ?? true
  };
}

function normalizeStock(value: string | number) {
  const stock = Number(value);
  return Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : 0;
}

function normalizeOptionalPrice(value: string | number | null | undefined) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? Math.floor(price) : null;
}

export function ProductVariantEditor({
  fieldName = "variantsJson",
  initialVariants = []
}: {
  fieldName?: string;
  initialVariants?: ProductVariantEditorItem[];
}) {
  const [variants, setVariants] = useState<ProductVariantEditorItem[]>(() => {
    const normalizedVariants =
      initialVariants.length > 0
        ? initialVariants.map(normalizeInitialVariant)
        : [createEmptyVariant()];
    const defaultIndex = Math.max(
      0,
      normalizedVariants.findIndex((variant) => variant.isDefault)
    );

    return normalizedVariants.map((variant, index) => ({
      ...variant,
      isDefault: index === defaultIndex
    }));
  });

  const serializedVariants = useMemo(() => {
    const defaultIndex = Math.max(
      0,
      variants.findIndex((variant) => variant.isDefault)
    );

    return JSON.stringify(
      variants
        .map((variant, index) => {
          const colorId = buildColorId(
            { id: variant.id, name: variant.name },
            index
          );
          const activeRows = (variant.sizeRows || []).filter((row) => row.isActive !== false);
          const sizes = activeRows.map((row) => row.size);
          const stockBySize = Object.fromEntries(
            (variant.sizeRows || []).map((row) => [row.size, normalizeStock(row.stock)])
          );
          const skuBySize = Object.fromEntries(
            (variant.sizeRows || [])
              .filter((row) => row.sku?.trim())
              .map((row) => [row.size, row.sku?.trim() || ""])
          );
          const priceBySize = Object.fromEntries(
            (variant.sizeRows || [])
              .filter((row) => row.price !== null && row.price !== undefined)
              .map((row) => [row.size, normalizeOptionalPrice(row.price)])
          );
          const combinations = generateVariantCombinations(
            [
              {
                id: colorId,
                name: variant.name,
                hex: variant.hex,
                imageUrl: variant.imageUrl,
                galleryIndexes: variant.galleryIndexes,
                isActive: variant.isActive
              }
            ],
            activeRows.map((row) => ({ name: row.size, isActive: row.isActive })),
            (variant.sizeRows || []).map((row) => ({
              id: `${colorId}__${row.size.toLowerCase().replace(/\s+/g, "-")}`,
              colorId,
              colorName: variant.name.trim(),
              size: row.size,
              stock: normalizeStock(row.stock),
              sku: row.sku?.trim() || "",
              price: normalizeOptionalPrice(row.price),
              isActive: row.isActive !== false
            }))
          );

          return {
            id: colorId,
            name: variant.name.trim(),
            hex: variant.hex || "",
            imageUrl: variant.imageUrl?.trim() || "",
            galleryIndexes: variant.galleryIndexes || [],
            sizes,
            stockBySize,
            skuBySize,
            priceBySize,
            combinations,
            totalStock: calculateTotalStock(combinations),
            stockStatus: calculateTotalStock(combinations) > 0 ? "Tersedia" : "Habis",
            isDefault: index === defaultIndex,
            isActive: variant.isActive ?? true
          };
        })
        .filter((variant) => variant.name.length > 0)
    );
  }, [variants]);

  const grandTotalStock = useMemo(() => {
    return variants.reduce((total, variant, index) => {
      const colorId = buildColorId({ id: variant.id, name: variant.name }, index);
      const combinations = generateVariantCombinations(
        [{ id: colorId, name: variant.name, isActive: variant.isActive }],
        (variant.sizeRows || [])
          .filter((row) => row.isActive !== false)
          .map((row) => ({ name: row.size, isActive: row.isActive })),
        (variant.sizeRows || []).map((row) => ({
          id: `${colorId}__${row.size.toLowerCase().replace(/\s+/g, "-")}`,
          colorId,
          colorName: variant.name.trim(),
          size: row.size,
          stock: normalizeStock(row.stock),
          sku: row.sku?.trim() || "",
          price: normalizeOptionalPrice(row.price),
          isActive: row.isActive !== false
        }))
      );

      return total + calculateTotalStock(combinations);
    }, 0);
  }, [variants]);

  function updateVariant(index: number, nextValue: Partial<ProductVariantEditorItem>) {
    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...nextValue } : variant
      )
    );
  }

  function updateSizeRow(
    index: number,
    size: string,
    nextValue: Partial<ProductVariantSizeRow>
  ) {
    setVariants((current) =>
      current.map((variant, variantIndex) => {
        if (variantIndex !== index) {
          return variant;
        }

        return {
          ...variant,
          sizeRows: (variant.sizeRows || createRowsFromStock()).map((row) =>
            row.size === size ? { ...row, ...nextValue } : row
          )
        };
      })
    );
  }

  function setDefaultVariant(index: number) {
    setVariants((current) =>
      current.map((variant, variantIndex) => ({
        ...variant,
        isDefault: variantIndex === index
      }))
    );
  }

  function removeVariant(index: number) {
    setVariants((current) => {
      const nextVariants = current.filter((_, variantIndex) => variantIndex !== index);
      return nextVariants.length > 0 ? nextVariants : [createEmptyVariant()];
    });
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name={fieldName} value={serializedVariants} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Warna dan kombinasi size</p>
          <p className="text-xs text-muted-foreground">
            Sistem otomatis membuat kombinasi warna + size. Stok lama tetap aman saat warna atau
            size diaktifkan.
          </p>
          <p
            className={cn(
              "mt-2 text-xs",
              grandTotalStock > 0 ? "text-muted-foreground" : "text-amber-600"
            )}
          >
            Total stok aktif: {grandTotalStock}
            {grandTotalStock <= 0 ? " - isi stok sebelum produk dipublish." : ""}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setVariants((current) => [...current, createEmptyVariant()])}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Warna
        </Button>
      </div>

      <div className="space-y-3">
        {variants.map((variant, index) => {
          const totalStock = (variant.sizeRows || []).reduce(
            (total, row) => total + (row.isActive !== false ? normalizeStock(row.stock) : 0),
            0
          );

          return (
            <div
              key={index}
              className="rounded-[1.15rem] border border-border/80 bg-background/55 p-4"
            >
              <div className="grid gap-3">
                <div>
                  <Label htmlFor={`variant-${index}-name`}>Nama warna</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className="h-9 w-9 shrink-0 rounded-full border border-border"
                      style={{ backgroundColor: variant.hex || "#2f2a25" }}
                    />
                    <Input
                      id={`variant-${index}-name`}
                      value={variant.name}
                      onChange={(event) => updateVariant(index, { name: event.target.value })}
                      placeholder="Maroon"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`variant-${index}-hex`}>Swatch</Label>
                  <Input
                    id={`variant-${index}-hex`}
                    type="color"
                    value={variant.hex || "#2f2a25"}
                    onChange={(event) => updateVariant(index, { hex: event.target.value })}
                    className="mt-2 h-11 p-1"
                    aria-label="Pilih warna swatch"
                  />
                </div>

                <div>
                  <Label htmlFor={`variant-${index}-image`}>Gambar utama warna</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <Input
                      id={`variant-${index}-image`}
                      value={variant.imageUrl || ""}
                      onChange={(event) => updateVariant(index, { imageUrl: event.target.value })}
                      placeholder="/uploads/products/maroon.jpg"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`variant-${index}-gallery`}>Foto tambahan warna</Label>
                  <Input
                    id={`variant-${index}-gallery`}
                    value={(variant.galleryIndexes || []).join(",")}
                    onChange={(event) =>
                      updateVariant(index, {
                        galleryIndexes: parseGalleryIndexes(event.target.value)
                      })
                    }
                    className="mt-2"
                    placeholder="1,2"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Nomor foto dari Galeri produk.
                  </p>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto rounded-[1rem] border border-border/70">
                <div className="min-w-[600px]">
                  <div className="grid grid-cols-[86px_84px_minmax(120px,1fr)_minmax(136px,1fr)] gap-2 bg-[hsl(var(--accent)/0.35)] px-3 py-2 text-xs font-medium text-muted-foreground">
                    <span>Size</span>
                    <span>Stok</span>
                    <span>SKU opsional</span>
                    <span>Harga opsional</span>
                  </div>
                  <div className="divide-y divide-border/70">
                    {(variant.sizeRows || []).map((row) => (
                      <div
                        key={row.size}
                        className={cn(
                          "grid grid-cols-[86px_84px_minmax(120px,1fr)_minmax(136px,1fr)] gap-2 px-3 py-2",
                          row.isActive === false && "opacity-55"
                        )}
                      >
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={row.isActive !== false}
                            onChange={(event) =>
                              updateSizeRow(index, row.size, { isActive: event.target.checked })
                            }
                            className="h-4 w-4 shrink-0"
                          />
                          <span className="truncate">{row.size}</span>
                        </label>
                        <Input
                          type="number"
                          min={0}
                          value={row.stock}
                          onChange={(event) =>
                            updateSizeRow(index, row.size, {
                              stock: normalizeStock(event.target.value)
                            })
                          }
                          className="h-9 text-center"
                          disabled={row.isActive === false}
                        />
                        <Input
                          value={row.sku || ""}
                          onChange={(event) =>
                            updateSizeRow(index, row.size, { sku: event.target.value })
                          }
                          className="h-9"
                          placeholder="SKU"
                          disabled={row.isActive === false}
                        />
                        <Input
                          type="number"
                          min={0}
                          value={row.price ?? ""}
                          onChange={(event) =>
                            updateSizeRow(index, row.size, {
                              price: normalizeOptionalPrice(event.target.value)
                            })
                          }
                          className="h-9"
                          placeholder="Kosong = harga utama"
                          disabled={row.isActive === false}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 border-t border-border/70 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Total stok warna: {totalStock}
                  </span>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      checked={Boolean(variant.isDefault)}
                      onChange={() => setDefaultVariant(index)}
                      className="h-4 w-4"
                    />
                    Default
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={variant.isActive ?? true}
                      onChange={(event) =>
                        updateVariant(index, { isActive: event.target.checked })
                      }
                      className="h-4 w-4"
                    />
                    Aktif
                  </label>
                  {totalStock <= 0 && variant.isActive !== false ? (
                    <span className="text-amber-600">Stok warna ini masih 0</span>
                  ) : null}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn("text-destructive", variants.length === 1 && "opacity-60")}
                  onClick={() => removeVariant(index)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
