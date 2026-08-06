/* eslint-disable @next/next/no-img-element */

"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  ShieldCheck,
  Truck,
  CheckCircle2,
  ExternalLink,
  MessageCircle
} from "lucide-react";
import { type ReactNode, type SyntheticEvent, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProductCollection } from "@/lib/collections";
import { getProductGalleryUrls } from "@/lib/product-media";
import { getProductVariantByColorAndSize, type ProductVariantCombination } from "@/lib/product-variation";
import { buildWhatsAppLink, cn, formatCurrency } from "@/lib/utils";

const SHOPEE_STORE_URL = "https://shopee.co.id/ansla.annisalabel";

type ProductDetailExperienceProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    shortDescription: string;
    imageUrl: string;
    description: string;
    galleryImages?: unknown;
    variantOptions?: unknown;
    featured: boolean;
    price: number;
    compareAtPrice: number | null;
    category: {
      name: string;
      slug?: string;
    };
  };
  whatsappNumber: string;
  images?: string[];
  children?: ReactNode;
};

type PointerPosition = {
  x: number;
  y: number;
};

type ProductVariant = {
  id?: string;
  name: string;
  imageUrl?: string;
  galleryIndexes?: number[];
  sizes?: string[];
  stockBySize?: Record<string, number>;
  priceBySize?: Record<string, number | null>;
  combinations?: ProductVariantCombination[];
  totalStock?: number;
  isActive?: boolean;
  legacyGalleryIndex?: number;
};

type SizeOption = {
  label: string;
  stock: number | null;
  isAvailable: boolean;
};

const FALLBACK_SIZES = ["All Size"];

function isBrowserImageSource(value: string) {
  return /^https?:\/\//i.test(value) || value.startsWith("/uploads/");
}

function normalizeVariantOptions(value: unknown): ProductVariant[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const variants: ProductVariant[] = [];

  value.forEach((item) => {
    if (!item || typeof item !== "object") {
      return;
    }

    const variant = item as {
      name?: unknown;
      id?: unknown;
      imageUrl?: unknown;
      galleryIndexes?: unknown;
      sizes?: unknown;
      stockBySize?: unknown;
      priceBySize?: unknown;
      combinations?: unknown;
      totalStock?: unknown;
      isActive?: unknown;
      price?: unknown;
    };

    if (typeof variant.name !== "string") {
      return;
    }

    const variantName = variant.name;
    const combinations: ProductVariantCombination[] = Array.isArray(variant.combinations)
      ? variant.combinations
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
    const stockBySizeFromCombinations = Object.fromEntries(
      combinations
        .filter((combination) => combination.isActive)
        .map((combination) => [combination.size, combination.stock])
    );
    const priceBySizeFromCombinations = Object.fromEntries(
      combinations
        .filter(
          (combination): combination is ProductVariantCombination & { price: number } =>
            typeof combination.price === "number"
        )
        .map((combination) => [combination.size, combination.price])
    );

    variants.push({
      id: typeof variant.id === "string" ? variant.id : variantName,
      name: variantName,
      imageUrl:
        typeof variant.imageUrl === "string" && isBrowserImageSource(variant.imageUrl)
          ? variant.imageUrl
          : undefined,
      galleryIndexes: Array.isArray(variant.galleryIndexes)
        ? variant.galleryIndexes.filter(
            (item): item is number => typeof item === "number" && Number.isInteger(item) && item > 0
          )
        : [],
      sizes: Array.isArray(variant.sizes)
        ? variant.sizes.filter(
            (item): item is string => typeof item === "string" && item.trim().length > 0
          )
        : combinations.length > 0
          ? combinations
              .filter((combination) => combination.isActive)
              .map((combination) => combination.size)
        : undefined,
      stockBySize:
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
          : combinations.length > 0
            ? stockBySizeFromCombinations
          : undefined,
      priceBySize:
        variant.priceBySize && typeof variant.priceBySize === "object"
          ? Object.fromEntries(
              Object.entries(variant.priceBySize as Record<string, unknown>)
                .filter(
                  ([size, price]) =>
                    typeof size === "string" &&
                    size.trim().length > 0 &&
                    typeof price === "number" &&
                    Number.isFinite(price) &&
                    price >= 0
                )
                .map(([size, price]) => [size.trim(), Math.floor(price as number)])
            )
          : combinations.length > 0
            ? priceBySizeFromCombinations
            : undefined,
      combinations,
      totalStock:
        typeof variant.totalStock === "number" &&
        Number.isFinite(variant.totalStock) &&
        variant.totalStock >= 0
          ? Math.floor(variant.totalStock)
          : undefined,
      isActive: typeof variant.isActive === "boolean" ? variant.isActive : true,
      legacyGalleryIndex:
        typeof variant.price === "number" && Number.isInteger(variant.price) && variant.price > 0
          ? variant.price
          : undefined
    });
  });

  return variants;
}

function uniqueImagesByPath(images: string[]) {
  const seenImages = new Set<string>();

  return images.filter((image) => {
    const normalizedImage = image.trim().split("?")[0].toLowerCase();

    if (!normalizedImage || seenImages.has(normalizedImage)) {
      return false;
    }

    seenImages.add(normalizedImage);
    return true;
  });
}

export function ProductDetailExperience({
  product,
  whatsappNumber,
  images,
  children
}: ProductDetailExperienceProps) {
  const zoomScale = 2.6;
  const variants = useMemo(
    () => normalizeVariantOptions(product.variantOptions).filter((variant) => variant.isActive !== false),
    [product.variantOptions]
  );
  const galleryFromProduct = useMemo(
    () =>
      getProductGalleryUrls(product.galleryImages, product.imageUrl, product.name).filter(
        (item) => item.length > 0 && isBrowserImageSource(item)
      ),
    [product.galleryImages, product.imageUrl, product.name]
  );
  const galleryImages = useMemo(() => {
    const merged = [product.imageUrl, ...galleryFromProduct, ...(images || [])].filter(Boolean);
    return Array.from(new Set(merged)).slice(0, 9);
  }, [galleryFromProduct, images, product.imageUrl]);

  const [activeImage, setActiveImage] = useState(galleryImages[0] || product.imageUrl);
  const [selectedVariantName, setSelectedVariantName] = useState<string | null>(
    variants[0]?.name ?? null
  );
  const [selectedSize, setSelectedSize] = useState(FALLBACK_SIZES[0]);
  const [brokenImages, setBrokenImages] = useState<string[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const [isActiveImageLoaded, setIsActiveImageLoaded] = useState(false);
  const [pointer, setPointer] = useState<PointerPosition>({ x: 50, y: 50 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState(4 / 5);
  const imageMaxWidth = Math.round(imageAspectRatio * 660);
  const imageFrameStyle = {
    aspectRatio: imageAspectRatio,
    maxWidth: `${imageMaxWidth}px`
  };
  const lensWidthPercent = 100 / zoomScale;
  const lensHeightPercent = 100 / zoomScale;
  const lensHalfWidthPercent = lensWidthPercent / 2;
  const lensHalfHeightPercent = lensHeightPercent / 2;
  const lensLeftPercent = pointer.x - lensHalfWidthPercent;
  const lensTopPercent = pointer.y - lensHalfHeightPercent;
  const selectedVariant =
    variants.find((variant) => variant.name === selectedVariantName) ?? variants[0] ?? null;
  const selectedVariantGallery = useMemo(() => {
    if (!selectedVariant) {
      return galleryImages;
    }

    const byIndexes =
      (selectedVariant.galleryIndexes?.length
        ? selectedVariant.galleryIndexes
        : selectedVariant.legacyGalleryIndex
          ? [selectedVariant.legacyGalleryIndex]
          : [])
        ?.map((index) => galleryImages[index - 1])
        .filter((image): image is string => Boolean(image)) ?? [];

    const merged =
      byIndexes.length > 0
        ? [
            ...(selectedVariant.imageUrl ? [selectedVariant.imageUrl] : []),
            ...byIndexes
          ]
        : variants.length <= 1
          ? [
              ...(selectedVariant.imageUrl ? [selectedVariant.imageUrl] : []),
              ...galleryImages
            ]
          : selectedVariant.imageUrl
            ? [selectedVariant.imageUrl]
            : galleryImages;

    const uniqueImages = uniqueImagesByPath(merged.filter(Boolean));

    return uniqueImages.length > 0 ? uniqueImages : galleryImages;
  }, [galleryImages, selectedVariant, variants.length]);
  const visibleGalleryImages = useMemo(
    () => selectedVariantGallery.filter((image) => !brokenImages.includes(image)),
    [brokenImages, selectedVariantGallery]
  );
  const activeGalleryIndex = Math.max(0, visibleGalleryImages.indexOf(activeImage));
  const sizeOptions = useMemo<SizeOption[]>(() => {
    if (!selectedVariant) {
      return FALLBACK_SIZES.map((size) => ({
        label: size,
        stock: null,
        isAvailable: true
      }));
    }

    const sizeLabels = selectedVariant.sizes?.length
      ? selectedVariant.sizes
      : Object.keys(selectedVariant.stockBySize || {});
    const normalizedSizeLabels = sizeLabels.length > 0 ? sizeLabels : FALLBACK_SIZES;

    return normalizedSizeLabels.map((size) => {
      const stockValue = selectedVariant.stockBySize?.[size];
      const normalizedStock =
        typeof stockValue === "number" && Number.isFinite(stockValue) ? Math.max(0, stockValue) : null;

      return {
        label: size,
        stock: normalizedStock,
        isAvailable: normalizedStock === null ? true : normalizedStock > 0
      };
    });
  }, [selectedVariant]);
  const availableSizes = sizeOptions.map((size) => size.label);
  const selectedSizeOption =
    sizeOptions.find((sizeOption) => sizeOption.label === selectedSize) ?? sizeOptions[0] ?? null;
  const maxSelectableQuantity =
    selectedSizeOption?.stock && selectedSizeOption.stock > 0 ? selectedSizeOption.stock : undefined;
  const isSelectedSizeOutOfStock = selectedSizeOption ? !selectedSizeOption.isAvailable : false;
  const isPurchaseDisabled = sizeOptions.length === 0 || isSelectedSizeOutOfStock;
  const selectedCombination =
    selectedVariant?.id && selectedVariant.combinations?.length
      ? getProductVariantByColorAndSize(
          selectedVariant.id,
          selectedSize,
          selectedVariant.combinations
        )
      : null;
  const currentPrice = selectedCombination?.price ?? selectedVariant?.priceBySize?.[selectedSize] ?? product.price;
  const currentCompareAtPrice = product.compareAtPrice;
  const productCollection = getProductCollection(product);
  const whatsappLink = buildWhatsAppLink(
    whatsappNumber,
    [
      "Assalamu'alaikum, saya tertarik dengan produk ANSLA ini dan ingin tanya lebih lanjut.",
      `Produk: ${product.name}`,
      selectedVariant?.name ? `Varian: ${selectedVariant.name}` : null,
      selectedSize ? `Ukuran: ${selectedSize}` : null,
      `Harga: ${formatCurrency(currentPrice)}`,
      `Link produk: ${typeof window !== "undefined" ? window.location.href : ""}`
    ]
      .filter(Boolean)
      .join("\n")
  );
  const shopeeProductUrl = SHOPEE_STORE_URL;

  function handlePointerMove(event: React.MouseEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    setPointer({
      x: Math.min(100 - lensHalfWidthPercent, Math.max(lensHalfWidthPercent, x)),
      y: Math.min(100 - lensHalfHeightPercent, Math.max(lensHalfHeightPercent, y))
    });
  }

  function handleVariantSelect(variant: ProductVariant) {
    setSelectedVariantName(variant.name);
    const indexedImages =
      (variant.galleryIndexes?.length
        ? variant.galleryIndexes
        : variant.legacyGalleryIndex
          ? [variant.legacyGalleryIndex]
          : [])
        ?.map((index) => galleryImages[index - 1])
        .filter((image): image is string => Boolean(image)) ?? [];
    const nextImage = indexedImages[0] || variant.imageUrl || galleryImages[0] || product.imageUrl;

    setActiveImage(nextImage);
    const nextSizeOptions = (variant.sizes?.length ? variant.sizes : Object.keys(variant.stockBySize || {}))
      .map((size) => {
        const stockValue = variant.stockBySize?.[size];
        const normalizedStock =
          typeof stockValue === "number" && Number.isFinite(stockValue) ? Math.max(0, stockValue) : null;

        return {
          label: size,
          isAvailable: normalizedStock === null ? true : normalizedStock > 0
        };
      });
    const firstAvailableSize =
      nextSizeOptions.find((sizeOption) => sizeOption.isAvailable)?.label ||
      nextSizeOptions[0]?.label ||
      FALLBACK_SIZES[0];

    setSelectedSize(firstAvailableSize);
  }

  function handleImageError(imageUrl: string) {
    setBrokenImages((current) => (current.includes(imageUrl) ? current : [...current, imageUrl]));

    if (activeImage === imageUrl) {
      const fallbackImage = visibleGalleryImages.find((image) => image !== imageUrl) || product.imageUrl;

      if (fallbackImage !== imageUrl) {
        setActiveImage(fallbackImage);
      }
    }
  }

  function showGalleryImage(direction: "previous" | "next") {
    if (visibleGalleryImages.length <= 1) {
      return;
    }

    const currentIndex = activeGalleryIndex >= 0 ? activeGalleryIndex : 0;
    const nextIndex =
      direction === "next"
        ? (currentIndex + 1) % visibleGalleryImages.length
        : (currentIndex - 1 + visibleGalleryImages.length) % visibleGalleryImages.length;

    setActiveImage(visibleGalleryImages[nextIndex]);
  }

  function handleActiveImageLoad(event: SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth, naturalHeight } = event.currentTarget;

    setIsActiveImageLoaded(true);

    if (naturalWidth <= 0 || naturalHeight <= 0) {
      return;
    }

    const nextRatio = naturalWidth / naturalHeight;
    const clampedRatio = Math.min(1.2, Math.max(0.55, nextRatio));

    setImageAspectRatio(clampedRatio);
  }

  useEffect(() => {
    if (visibleGalleryImages.length > 0 && !visibleGalleryImages.includes(activeImage)) {
      setActiveImage(visibleGalleryImages[0]);
    }
  }, [activeImage, visibleGalleryImages]);

  useEffect(() => {
    if (sizeOptions.length === 0) {
      return;
    }

    const stillExists = sizeOptions.some((sizeOption) => sizeOption.label === selectedSize);
    const nextAvailableSize =
      sizeOptions.find((sizeOption) => sizeOption.isAvailable)?.label || sizeOptions[0]?.label;

    if (!stillExists && nextAvailableSize) {
      setSelectedSize(nextAvailableSize);
      return;
    }

    if (selectedSizeOption && !selectedSizeOption.isAvailable && nextAvailableSize && nextAvailableSize !== selectedSize) {
      setSelectedSize(nextAvailableSize);
    }
  }, [selectedSize, selectedSizeOption, sizeOptions]);

  useEffect(() => {
    setIsActiveImageLoaded(false);
  }, [activeImage]);

  return (
    <>
      <div className="mx-auto grid max-w-[1160px] items-start gap-6 lg:grid-cols-2 xl:gap-8">
        <div className="overflow-hidden">
          <div
            className="relative mx-auto w-full overflow-hidden rounded-[1.4rem] bg-stone-100"
            style={imageFrameStyle}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onMouseMove={handlePointerMove}
          >
            <img
              src={activeImage}
              alt={product.name}
              className="h-full w-full cursor-zoom-in object-cover"
              loading="lazy"
              decoding="async"
              onClick={() => setIsFullscreen(true)}
              onLoad={handleActiveImageLoad}
              onError={() => handleImageError(activeImage)}
            />
            {!isActiveImageLoaded ? (
              <div className="pointer-events-none absolute inset-0 animate-pulse bg-stone-200/70" />
            ) : null}

            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur transition hover:bg-black/45"
              aria-label="Perbesar gambar"
            >
              <Expand className="h-4 w-4" />
            </button>

            <div
              className={cn(
                "pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 border border-sky-300 bg-sky-300/24 shadow-2xl transition-opacity duration-150",
                isHovering ? "opacity-100" : "opacity-0"
              )}
              style={{
                left: `${pointer.x}%`,
                top: `${pointer.y}%`,
                width: `${lensWidthPercent}%`,
                height: `${lensHeightPercent}%`
              }}
            />
          </div>

          {visibleGalleryImages.length > 1 ? (
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => showGalleryImage("previous")}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border/80 bg-[hsl(var(--card)/0.9)] text-foreground shadow-soft transition hover:border-stone-400 hover:bg-[hsl(var(--accent)/0.8)]"
                aria-label="Foto sebelumnya"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex min-w-0 flex-1 gap-3 overflow-x-auto pb-1">
                {visibleGalleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(image)}
                    className={cn(
                      "relative h-20 w-16 shrink-0 overflow-hidden rounded-[1rem] border bg-stone-100 transition",
                      activeImage === image
                        ? "border-stone-900 shadow-soft dark:border-stone-100"
                        : "border-border/80 hover:border-stone-400"
                    )}
                    aria-label={`Lihat foto produk ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} foto ${index + 1}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={() => handleImageError(image)}
                    />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => showGalleryImage("next")}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border/80 bg-[hsl(var(--card)/0.9)] text-foreground shadow-soft transition hover:border-stone-400 hover:bg-[hsl(var(--accent)/0.8)]"
                aria-label="Foto berikutnya"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          ) : null}

          <div className="surface-panel mt-6 rounded-[1.5rem] border border-border/80 bg-[hsl(var(--secondary)/0.45)] p-5 sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Deskripsi Produk
            </p>
            <p className="mt-4">{product.description}</p>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div
            className={cn(
              "pointer-events-none absolute -left-3 top-0 z-20 w-full overflow-hidden rounded-[1.4rem] bg-stone-100 shadow-soft transition-opacity duration-150",
              isHovering ? "opacity-100" : "opacity-0"
            )}
            style={imageFrameStyle}
            aria-hidden={!isHovering}
          >
            <div className="relative h-full w-full overflow-hidden bg-stone-100">
              <div
                className="absolute"
                style={{
                  width: `${zoomScale * 100}%`,
                  height: `${zoomScale * 100}%`,
                  left: `-${lensLeftPercent * zoomScale}%`,
                  top: `-${lensTopPercent * zoomScale}%`
                }}
              >
                <img
                  src={activeImage}
                  alt={`${product.name} zoom preview`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                  onError={() => handleImageError(activeImage)}
                />
              </div>
            </div>
          </div>
          <div className="h-full">
            <div className="flex h-full flex-col">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="rounded-full bg-stone-900 text-white">
                  {product.featured ? "Produk unggulan" : "Koleksi premium"}
                </Badge>
                <Badge variant="secondary" className="rounded-full">
                  {productCollection.label}
                </Badge>
              </div>
              <p className="mt-4 text-sm uppercase tracking-[0.25em] text-muted-foreground">
                {product.slug.toUpperCase()}
              </p>
              <h1 className="mt-2 text-4xl">{product.name}</h1>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <p className="text-3xl font-semibold text-foreground">
                  {formatCurrency(currentPrice)}
                </p>
                {currentCompareAtPrice ? (
                  <p className="text-lg text-stone-400 line-through">
                    {formatCurrency(currentCompareAtPrice)}
                  </p>
                ) : null}
              </div>
              <p className="mt-5">{product.shortDescription}</p>

              <div className="mt-6 grid gap-3 xl:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-[hsl(var(--card)/0.72)] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Buyer note
                  </p>
                  <p className="mt-2 text-sm">Tampilan rapi untuk dipakai ulang, bukan sekali foto saja.</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-[hsl(var(--card)/0.72)] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Jika ragu size
                  </p>
                  <p className="mt-2 text-sm">Tanya size dan warna lewat WhatsApp sebelum order.</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-[hsl(var(--card)/0.72)] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Cara order
                  </p>
                  <p className="mt-2 text-sm">Order aman via Shopee atau konsultasi dulu lewat WhatsApp.</p>
                </div>
              </div>

              {variants.length > 0 ? (
                <div className="mt-6">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
                    Pilihan warna
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {variants.map((variant) => {
                      const isSelected = selectedVariant?.name === variant.name;

                      return (
                        <button
                          key={variant.name}
                          type="button"
                          onClick={() => handleVariantSelect(variant)}
                          className={cn(
                            "inline-flex items-center rounded-xl border px-3 py-2 text-sm transition",
                            isSelected
                              ? "border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900"
                              : "border-border/80 bg-[hsl(var(--card)/0.85)] hover:border-stone-400"
                          )}
                        >
                          <span>{variant.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="mt-6">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  Size
                </p>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {sizeOptions.map((sizeOption) => {
                    const isSelected = selectedSize === sizeOption.label;

                    return (
                      <button
                        key={sizeOption.label}
                        type="button"
                        onClick={() => setSelectedSize(sizeOption.label)}
                        disabled={!sizeOption.isAvailable}
                        className={cn(
                          "inline-flex min-w-[56px] items-center justify-center rounded-xl border px-3 py-2 text-sm transition",
                          isSelected
                            ? "border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900"
                            : "border-border/80 bg-[hsl(var(--card)/0.85)] hover:border-stone-400",
                          !sizeOption.isAvailable &&
                            "cursor-not-allowed border-border/60 bg-[hsl(var(--card)/0.45)] text-muted-foreground opacity-45 hover:border-border/60"
                        )}
                      >
                        {sizeOption.label}
                      </button>
                    );
                  })}
                </div>
                {isSelectedSizeOutOfStock ? (
                  <p className="mt-2 text-sm text-rose-500">
                    Ukuran ini sedang habis, pilih ukuran lain atau tanya via WhatsApp.
                  </p>
                ) : null}
              </div>

              <div className="mt-6 grid gap-3">
                <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-[hsl(var(--card)/0.7)] px-4 py-3">
                  <ShieldCheck className="h-5 w-5 text-stone-700" />
                  <span>Material premium dengan detail rapi dan feel yang elegan.</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-[hsl(var(--card)/0.7)] px-4 py-3">
                  <Truck className="h-5 w-5 text-stone-700" />
                  <span>Bisa langsung tanya ukuran, warna, dan cara order lewat WhatsApp.</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-[hsl(var(--card)/0.7)] px-4 py-3">
                  <CheckCircle2 className="h-5 w-5 text-stone-700" />
                  <span>Cocok dipakai untuk harian, acara keluarga, sampai momen spesial.</span>
                </div>
              </div>

              <div className="mt-7 grid gap-3">
                <Button
                  asChild
                  size="lg"
                  className="h-12 w-full px-7"
                >
                  <Link href={shopeeProductUrl} target="_blank">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Beli via Shopee
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 w-full border-emerald-500/50 px-7 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                >
                  <Link href={whatsappLink} target="_blank">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Tanya via WhatsApp
                  </Link>
                </Button>
              </div>

              {children ? <div className="mt-6">{children}</div> : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 lg:hidden sm:mt-6">
        <div className="surface-panel p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="rounded-full bg-stone-900 text-white">
              {product.featured ? "Produk unggulan" : "Koleksi premium"}
            </Badge>
            <Badge variant="secondary" className="rounded-full">
              {productCollection.label}
            </Badge>
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground sm:mt-4 sm:text-sm sm:tracking-[0.25em]">
            {product.slug.toUpperCase()}
          </p>
          <h1 className="mt-2 text-3xl leading-[1.06] sm:text-4xl">{product.name}</h1>
          <div className="mt-3 flex flex-wrap items-end gap-2 sm:mt-4 sm:gap-3">
            <p className="text-2xl font-semibold text-stone-900 sm:text-3xl">
              {formatCurrency(currentPrice)}
            </p>
            {currentCompareAtPrice ? (
              <p className="text-base text-stone-400 line-through sm:text-lg">
                {formatCurrency(currentCompareAtPrice)}
              </p>
            ) : null}
          </div>
          <p className="mt-4 text-sm leading-7 sm:mt-5 sm:text-base">{product.shortDescription}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-[hsl(var(--card)/0.72)] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Buyer note
              </p>
              <p className="mt-2 text-sm">Look rapi dan aman untuk dipakai ke banyak momen.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-[hsl(var(--card)/0.72)] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Jika ragu size
              </p>
              <p className="mt-2 text-sm">Tanya size dan warna lewat WhatsApp sebelum order.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-[hsl(var(--card)/0.72)] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Cara order
              </p>
              <p className="mt-2 text-sm">Order aman via Shopee atau konsultasi dulu lewat WhatsApp.</p>
            </div>
          </div>
          {variants.length > 0 ? (
            <div className="mt-5 sm:mt-6">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
                Pilihan warna
              </p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {variants.map((variant) => {
                  const isSelected = selectedVariant?.name === variant.name;

                  return (
                    <button
                      key={variant.name}
                      type="button"
                      onClick={() => handleVariantSelect(variant)}
                      className={cn(
                        "inline-flex min-h-[44px] touch-target items-center rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all duration-180",
                        isSelected
                          ? "border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-sm"
                          : "border-border/80 bg-[hsl(var(--card)/0.85)] hover:border-stone-400"
                      )}
                    >
                      <span>{variant.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
          <div className="mt-5 sm:mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Size
            </p>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {sizeOptions.map((sizeOption) => {
                const isSelected = selectedSize === sizeOption.label;

                return (
                  <button
                    key={sizeOption.label}
                    type="button"
                    onClick={() => setSelectedSize(sizeOption.label)}
                    disabled={!sizeOption.isAvailable}
                    className={cn(
                      "inline-flex min-w-[56px] min-h-[44px] touch-target items-center justify-center rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all duration-180",
                      isSelected
                        ? "border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-sm"
                        : "border-border/80 bg-[hsl(var(--card)/0.85)] hover:border-stone-400",
                      !sizeOption.isAvailable &&
                        "cursor-not-allowed border-border/60 bg-[hsl(var(--card)/0.45)] text-muted-foreground opacity-45 hover:border-border/60"
                    )}
                  >
                    {sizeOption.label}
                  </button>
                );
              })}
            </div>
            {isSelectedSizeOutOfStock ? (
              <p className="mt-2 text-sm text-rose-500">
                Ukuran ini sedang habis, pilih ukuran lain atau tanya via WhatsApp.
              </p>
            ) : null}
          </div>
          <div className="mt-6 grid gap-3 sm:mt-7">
            <Button
              asChild
              size="lg"
              className="h-11 w-full px-6 sm:h-12 sm:px-7"
            >
              <Link href={shopeeProductUrl} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Beli via Shopee
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 w-full border-emerald-500/50 px-6 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40 sm:h-12 sm:px-7"
            >
              <Link href={whatsappLink} target="_blank">
                <MessageCircle className="mr-2 h-4 w-4" />
                Tanya via WhatsApp
              </Link>
            </Button>
          </div>

          {children ? <div className="mt-6">{children}</div> : null}
        </div>
      </div>

      {isFullscreen ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setIsFullscreen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-h-[92vh] max-w-6xl overflow-hidden rounded-[1.5rem] border border-white/10 bg-black">
            <img
              src={activeImage}
              alt={product.name}
              className="max-h-[92vh] w-full object-contain"
              loading="lazy"
              decoding="async"
              onError={() => handleImageError(activeImage)}
            />
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/35 px-4 py-2 text-sm text-white backdrop-blur"
            >
              Tutup
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
