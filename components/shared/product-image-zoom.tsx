/* eslint-disable @next/next/no-img-element */

"use client";

import { ChevronDown, ChevronUp, Expand } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type PointerPosition = {
  x: number;
  y: number;
};

export function ProductImageZoom({
  imageUrl,
  alt,
  images
}: {
  imageUrl: string;
  alt: string;
  images?: string[];
}) {
  const galleryImages = useMemo(() => {
    const merged = [imageUrl, ...(images || [])].filter(Boolean);
    return Array.from(new Set(merged));
  }, [imageUrl, images]);

  const [activeImage, setActiveImage] = useState(galleryImages[0] || imageUrl);
  const [isHovering, setIsHovering] = useState(false);
  const [pointer, setPointer] = useState<PointerPosition>({ x: 50, y: 50 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const backgroundPosition = `${pointer.x}% ${pointer.y}%`;

  function handlePointerMove(event: React.MouseEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    setPointer({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y))
    });
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-[76px_minmax(0,1fr)]">
        <div className="order-2 flex gap-3 md:order-1 md:flex-col md:items-center">
          <div className="hidden rounded-full border border-border/80 p-2 text-muted-foreground md:block">
            <ChevronUp className="h-4 w-4" />
          </div>
          <div className="flex w-full gap-3 overflow-x-auto md:flex-col md:overflow-visible">
            {galleryImages.map((thumbnail, index) => (
              <button
                key={`${thumbnail}-${index}`}
                type="button"
                onClick={() => setActiveImage(thumbnail)}
                className={cn(
                  "shrink-0 overflow-hidden rounded-[1rem] border bg-[hsl(var(--card)/0.9)] transition",
                  activeImage === thumbnail
                    ? "border-stone-900 shadow-soft dark:border-stone-100"
                    : "border-border/80 hover:border-stone-400"
                )}
              >
                <img
                  src={thumbnail}
                  alt={`${alt} thumbnail ${index + 1}`}
                  className="h-20 w-16 object-cover md:h-[88px] md:w-[70px]"
                />
              </button>
            ))}
          </div>
          <div className="hidden rounded-full border border-border/80 p-2 text-muted-foreground md:block">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        <div
          className="order-1 group relative overflow-hidden rounded-[1.6rem] bg-stone-100 md:order-2"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={handlePointerMove}
        >
          <img
            src={activeImage}
            alt={alt}
            className={cn(
              "aspect-[4/5] h-full w-full cursor-zoom-in object-cover transition duration-200",
              isHovering && "scale-[1.04]"
            )}
            onClick={() => setIsFullscreen(true)}
          />

          <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/25 bg-black/30 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
            Klik atau arahkan kursor untuk melihat detail
          </div>

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
              "pointer-events-none absolute h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-[1.25rem] border border-white/80 bg-white/10 shadow-2xl backdrop-blur-sm transition-opacity duration-150",
              isHovering ? "opacity-100" : "opacity-0"
            )}
            style={{
              left: `${pointer.x}%`,
              top: `${pointer.y}%`
            }}
          />
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
            <div
              className="hidden h-[80vh] w-[80vw] bg-contain bg-center bg-no-repeat md:block"
              style={{
                backgroundImage: `url(${activeImage})`,
                backgroundPosition,
                backgroundSize: isHovering ? "180%" : "100%"
              }}
            />
            <img
              src={activeImage}
              alt={alt}
              className="block max-h-[92vh] w-full object-contain md:hidden"
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
