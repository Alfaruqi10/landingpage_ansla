/* eslint-disable @next/next/no-img-element */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Expand,
  ShieldCheck,
  Truck,
  CheckCircle2,
  ShoppingBag
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { QuantityPicker } from "@/components/shared/quantity-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProductCollection } from "@/lib/collections";
import { buildWhatsAppLink, cn, formatCurrency } from "@/lib/utils";

type ProductDetailExperienceProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    shortDescription: string;
    imageUrl: string;
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
};

type PointerPosition = {
  x: number;
  y: number;
};

type ProductVariant = {
  name: string;
  imageUrl?: string;
  galleryIndexes?: number[];
  sizes?: string[];
  stockBySize?: Record<string, number>;
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

function normalizeGalleryImages(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string" && item.length > 0 && isBrowserImageSource(item)
  );
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
      imageUrl?: unknown;
      galleryIndexes?: unknown;
      sizes?: unknown;
      stockBySize?: unknown;
      totalStock?: unknown;
      isActive?: unknown;
      price?: unknown;
    };

    if (typeof variant.name !== "string") {
      return;
    }

    variants.push({
      name: variant.name,
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
          : undefined,
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

export function ProductDetailExperience({
  product,
  whatsappNumber,
  images
}: ProductDetailExperienceProps) {
  const zoomScale = 2.6;
  const lensSizePercent = 100 / zoomScale;
  const lensHalfPercent = lensSizePercent / 2;
  const router = useRouter();
  const { addItem, startBuyNow } = useCart();
  const variants = useMemo(
    () => normalizeVariantOptions(product.variantOptions).filter((variant) => variant.isActive !== false),
    [product.variantOptions]
  );
  const galleryFromProduct = useMemo(
    () => normalizeGalleryImages(product.galleryImages),
    [product.galleryImages]
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
  const [pointer, setPointer] = useState<PointerPosition>({ x: 50, y: 50 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [cartFeedback, setCartFeedback] = useState<"idle" | "added">("idle");
  const lensLeftPercent = pointer.x - lensHalfPercent;
  const lensTopPercent = pointer.y - lensHalfPercent;
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

    const merged = [
      ...byIndexes,
      ...(selectedVariant.imageUrl ? [selectedVariant.imageUrl] : [])
    ];

    const uniqueImages = Array.from(new Set(merged.filter(Boolean)));

    return uniqueImages.length > 0 ? uniqueImages : galleryImages;
  }, [galleryImages, selectedVariant]);
  const visibleGalleryImages = selectedVariantGallery.filter((image) => !brokenImages.includes(image));
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
  const currentPrice = product.price;
  const currentCompareAtPrice = product.compareAtPrice;
  const productCollection = getProductCollection(product);
  const checkoutItem = {
    productId: product.id,
    productName: product.name,
    productSlug: product.slug,
    imageUrl: activeImage,
    variantName: selectedVariant?.name,
    size: selectedSize,
    quantity,
    unitPrice: currentPrice
  };
  const whatsappLink = buildWhatsAppLink(
    whatsappNumber,
    [
      "Assalamu'alaikum, saya tertarik dengan produk ANSLA ini dan ingin dibantu order.",
      `Produk: ${product.name}`,
      selectedVariant?.name ? `Varian: ${selectedVariant.name}` : null,
      selectedSize ? `Ukuran: ${selectedSize}` : null,
      `Jumlah: ${quantity}`,
      `Harga: ${formatCurrency(currentPrice)}`,
      `Subtotal: ${formatCurrency(currentPrice * quantity)}`,
      `Link produk: ${typeof window !== "undefined" ? window.location.href : ""}`
    ]
      .filter(Boolean)
      .join("\n")
  );

  function handlePointerMove(event: React.MouseEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    setPointer({
      x: Math.min(100 - lensHalfPercent, Math.max(lensHalfPercent, x)),
      y: Math.min(100 - lensHalfPercent, Math.max(lensHalfPercent, y))
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

  function handleAddToCart() {
    if (isPurchaseDisabled) {
      return;
    }

    addItem(checkoutItem);
    setCartFeedback("added");
    window.setTimeout(() => setCartFeedback("idle"), 1800);
  }

  function handleBuyNow() {
    if (isPurchaseDisabled) {
      return;
    }

    startBuyNow(checkoutItem);
    router.push("/checkout?mode=buy-now");
  }

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
    if (maxSelectableQuantity && quantity > maxSelectableQuantity) {
      setQuantity(maxSelectableQuantity);
    }
  }, [maxSelectableQuantity, quantity]);

  return (
    <>
      <div className="mx-auto grid max-w-[1320px] items-start gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="overflow-hidden">
          <div
            className="relative overflow-hidden rounded-[1.4rem] bg-stone-100"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onMouseMove={handlePointerMove}
          >
            <img
              src={activeImage}
              alt={product.name}
              className="aspect-[4/5] h-full w-full cursor-zoom-in object-cover"
              onClick={() => setIsFullscreen(true)}
              onError={() => handleImageError(activeImage)}
            />

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
                width: `${lensSizePercent}%`,
                height: `${lensSizePercent}%`
              }}
            />
          </div>
        </div>

        <div className="hidden xl:block">
          {isHovering ? (
            <div className="overflow-hidden border border-border/70 bg-stone-100 p-3">
              <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
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
                    onError={() => handleImageError(activeImage)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="xl:sticky xl:top-28 xl:pl-6">
              <div className="max-w-[440px]">
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
                    Ukuran ini sedang habis dan tidak bisa dipilih untuk checkout.
                  </p>
                ) : null}
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  Jumlah
                </p>
                <div className="mt-3">
                  <QuantityPicker
                    value={quantity}
                    onChange={setQuantity}
                    max={maxSelectableQuantity}
                  />
                </div>
                {maxSelectableQuantity ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Stok tersedia untuk ukuran ini: {maxSelectableQuantity}
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
                  type="button"
                  size="lg"
                  className="h-12 w-full px-7"
                  onClick={handleBuyNow}
                  disabled={isPurchaseDisabled}
                >
                  Checkout Web
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-12 w-full px-7"
                  onClick={handleAddToCart}
                  disabled={isPurchaseDisabled}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  {cartFeedback === "added" ? "Masuk ke Keranjang" : "Tambah ke Keranjang"}
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 w-full border-emerald-500/50 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                >
                  <Link href={whatsappLink} target="_blank">
                    Tanya via WhatsApp
                  </Link>
                </Button>
              </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 xl:hidden sm:mt-6">
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
          <div className="mt-5 sm:mt-6">
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
                Ukuran ini sedang habis dan tidak bisa dipilih untuk checkout.
              </p>
            ) : null}
          </div>
          <div className="mt-5 sm:mt-6">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Jumlah
            </p>
            <div className="mt-3">
              <QuantityPicker
                value={quantity}
                onChange={setQuantity}
                max={maxSelectableQuantity}
              />
            </div>
            {maxSelectableQuantity ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Stok tersedia untuk ukuran ini: {maxSelectableQuantity}
              </p>
            ) : null}
          </div>
          <div className="mt-6 grid gap-3 sm:mt-7">
            <Button
              type="button"
              size="lg"
              className="h-11 w-full px-6 sm:h-12 sm:px-7"
              onClick={handleBuyNow}
              disabled={isPurchaseDisabled}
            >
              Checkout Web
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-11 w-full px-6 sm:h-12 sm:px-7"
              onClick={handleAddToCart}
              disabled={isPurchaseDisabled}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              {cartFeedback === "added" ? "Masuk ke Keranjang" : "Tambah ke Keranjang"}
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 w-full border-emerald-500/50 px-6 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40 sm:h-12 sm:px-7"
            >
              <Link href={whatsappLink} target="_blank">
                Tanya via WhatsApp
              </Link>
            </Button>
          </div>
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
