"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProductMediaImage } from "@/lib/product-media";
import { cn } from "@/lib/utils";

type ProductMediaGalleryEditorProps = {
  initialImages?: ProductMediaImage[];
  coverUrl?: string | null;
  fallbackAlt: string;
};

function createEmptyImage(sortOrder: number, fallbackAlt: string): ProductMediaImage {
  return {
    url: "",
    alt: fallbackAlt,
    sortOrder,
    isPrimary: false
  };
}

export function ProductMediaGalleryEditor({
  initialImages = [],
  coverUrl,
  fallbackAlt
}: ProductMediaGalleryEditorProps) {
  const initialRows =
    initialImages.length > 0
      ? initialImages
      : coverUrl
        ? [
            {
              url: coverUrl,
              alt: fallbackAlt,
              sortOrder: 0,
              isPrimary: true
            }
          ]
        : [];
  const [images, setImages] = useState<ProductMediaImage[]>(() =>
    initialRows.map((image, index) => ({
      ...image,
      alt: image.alt || fallbackAlt,
      sortOrder: index,
      isPrimary: image.isPrimary || image.url === coverUrl
    }))
  );
  const coverImageIndex = Math.max(
    0,
    images.findIndex((image) => image.isPrimary || image.url === coverUrl)
  );
  const serializedImages = useMemo(
    () =>
      JSON.stringify(
        images
          .map((image, index) => ({
            url: image.url.trim(),
            alt: image.alt.trim() || fallbackAlt,
            sortOrder: index,
            isPrimary: index === coverImageIndex
          }))
          .filter((image) => image.url.length > 0)
      ),
    [coverImageIndex, fallbackAlt, images]
  );

  function updateImage(index: number, nextValue: Partial<ProductMediaImage>) {
    setImages((current) =>
      current.map((image, imageIndex) =>
        imageIndex === index ? { ...image, ...nextValue } : image
      )
    );
  }

  function setPrimaryImage(index: number) {
    setImages((current) =>
      current.map((image, imageIndex) => ({
        ...image,
        isPrimary: imageIndex === index
      }))
    );
  }

  function moveImage(index: number, direction: "up" | "down") {
    setImages((current) => {
      const nextIndex = direction === "up" ? index - 1 : index + 1;

      if (nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const currentImage = next[index];
      const targetImage = next[nextIndex];

      if (!currentImage || !targetImage) {
        return current;
      }

      next[index] = targetImage;
      next[nextIndex] = currentImage;

      return next.map((image, imageIndex) => ({
        ...image,
        sortOrder: imageIndex
      }));
    });
  }

  function removeImage(index: number) {
    setImages((current) => {
      const next = current.filter((_, imageIndex) => imageIndex !== index);

      if (next.length === 0) {
        return [];
      }

      const hasPrimary = next.some((image) => image.isPrimary);

      return next.map((image, imageIndex) => ({
        ...image,
        sortOrder: imageIndex,
        isPrimary: hasPrimary ? image.isPrimary : imageIndex === 0
      }));
    });
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="galleryImagesJson" value={serializedImages} />
      <input type="hidden" name="coverImageIndex" value={coverImageIndex} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Label>Galeri gambar produk</Label>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Pilih satu sebagai cover utama. Urutan di sini akan dipakai untuk galeri produk.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setImages((current) => [
              ...current,
              createEmptyImage(current.length, fallbackAlt)
            ])
          }
        >
          <ImagePlus className="mr-2 h-4 w-4" />
          Tambah Link
        </Button>
      </div>

      <div className="space-y-3">
        {images.map((image, index) => (
          <div
            key={`${image.url || "empty"}-${index}`}
            className="rounded-[1rem] border border-border/70 p-3"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-border/70 bg-stone-100">
                {image.url ? (
                  <Image
                    src={image.url}
                    alt={image.alt || fallbackAlt}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <Label htmlFor={`gallery-${index}-url`}>URL gambar</Label>
                  <Input
                    id={`gallery-${index}-url`}
                    className="mt-2"
                    value={image.url}
                    onChange={(event) => updateImage(index, { url: event.target.value })}
                    placeholder="/uploads/products/foto-detail.jpg"
                  />
                </div>

                <div>
                  <Label htmlFor={`gallery-${index}-alt`}>Alt text SEO</Label>
                  <Input
                    id={`gallery-${index}-alt`}
                    className="mt-2"
                    value={image.alt}
                    onChange={(event) => updateImage(index, { alt: event.target.value })}
                    placeholder={`${fallbackAlt} tampak depan`}
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
              <label
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm",
                  image.isPrimary
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-border/80 bg-background"
                )}
              >
                <input
                  type="radio"
                  checked={image.isPrimary}
                  onChange={() => setPrimaryImage(index)}
                  className="sr-only"
                />
                Cover
              </label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={() => moveImage(index, "up")}
                  disabled={index === 0}
                  aria-label="Naikkan urutan gambar"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={() => moveImage(index, "down")}
                  disabled={index === images.length - 1}
                  aria-label="Turunkan urutan gambar"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 text-destructive"
                  onClick={() => removeImage(index)}
                  aria-label="Hapus gambar"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
