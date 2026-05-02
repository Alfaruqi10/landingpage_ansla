"use client";

import { ImageIcon, Palette, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type ProductVariantEditorItem = {
  name: string;
  hex?: string;
  imageUrl?: string;
  galleryIndexes?: number[];
  stockBySize?: Record<string, number>;
  isDefault?: boolean;
  isActive?: boolean;
};

const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL", "All Size"];

function createEmptyVariant(): ProductVariantEditorItem {
  return {
    name: "",
    hex: "#2f2a25",
    imageUrl: "",
    galleryIndexes: [],
    stockBySize: Object.fromEntries(SIZE_OPTIONS.map((size) => [size, 0])),
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
  const stockBySize = Object.fromEntries(
    SIZE_OPTIONS.map((size) => [size, Number(variant.stockBySize?.[size] ?? 0)])
  );

  return {
    ...createEmptyVariant(),
    ...variant,
    hex: variant.hex || "#2f2a25",
    stockBySize,
    isDefault: Boolean(variant.isDefault) || index === 0,
    isActive: variant.isActive ?? true
  };
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

  const serializedVariants = useMemo(
    () => {
      const defaultIndex = Math.max(
        0,
        variants.findIndex((variant) => variant.isDefault)
      );

      return JSON.stringify(
        variants
          .map((variant, index) => ({
            name: variant.name.trim(),
            hex: variant.hex || "",
            imageUrl: variant.imageUrl?.trim() || "",
            galleryIndexes: variant.galleryIndexes || [],
            stockBySize: Object.fromEntries(
              SIZE_OPTIONS.map((size) => [
                size,
                Math.max(0, Math.floor(Number(variant.stockBySize?.[size] || 0)))
              ])
            ),
            isDefault: index === defaultIndex,
            isActive: variant.isActive ?? true
          }))
          .filter((variant) => variant.name.length > 0)
      );
    },
    [variants]
  );

  function updateVariant(index: number, nextValue: Partial<ProductVariantEditorItem>) {
    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...nextValue } : variant
      )
    );
  }

  function updateStock(index: number, size: string, value: string) {
    const stock = Math.max(0, Math.floor(Number(value || 0)));

    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index
          ? {
              ...variant,
              stockBySize: {
                ...variant.stockBySize,
                [size]: Number.isFinite(stock) ? stock : 0
              }
            }
          : variant
      )
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
          <p className="text-sm font-medium text-foreground">Warna dan stok size</p>
          <p className="text-xs text-muted-foreground">
            Setiap warna punya stok sendiri untuk S, M, L, XL, XXL, dan All Size.
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
          const totalStock = SIZE_OPTIONS.reduce(
            (total, size) => total + Number(variant.stockBySize?.[size] || 0),
            0
          );

          return (
            <div
              key={index}
              className="rounded-[1.15rem] border border-border/80 bg-background/55 p-4"
            >
              <div className="grid gap-3 xl:grid-cols-[minmax(160px,0.9fr)_92px_minmax(180px,1.2fr)_130px]">
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
                  <Label htmlFor={`variant-${index}-image`}>Gambar warna</Label>
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
                  <Label htmlFor={`variant-${index}-gallery`}>No. galeri</Label>
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
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {SIZE_OPTIONS.map((size) => (
                  <div key={size} className="min-w-0">
                    <Label
                      htmlFor={`variant-${index}-${size}`}
                      className="block truncate text-xs text-muted-foreground"
                    >
                      {size}
                    </Label>
                    <Input
                      id={`variant-${index}-${size}`}
                      type="number"
                      min={0}
                      value={variant.stockBySize?.[size] ?? 0}
                      onChange={(event) => updateStock(index, size, event.target.value)}
                      className="mt-1 text-center"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-3 border-t border-border/70 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Total stok: {totalStock}
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
