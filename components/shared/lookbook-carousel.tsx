"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type LookbookSlide = {
  src: string;
  alt: string;
  label: string;
};

type LookbookCarouselProps = {
  slides: LookbookSlide[];
  className?: string;
};

export function LookbookCarousel({ slides, className }: LookbookCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const safeSlides = useMemo(() => slides.filter((slide) => Boolean(slide.src)), [slides]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting && entry.intersectionRatio >= 0.45);
      },
      {
        threshold: [0.2, 0.45, 0.75],
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView || safeSlides.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % safeSlides.length);
    }, 3200);

    return () => window.clearInterval(interval);
  }, [isInView, safeSlides.length]);

  if (safeSlides.length === 0) {
    return null;
  }

  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  const showPrevious = () => {
    setActiveIndex((currentIndex) => (currentIndex - 1 + safeSlides.length) % safeSlides.length);
  };

  const showNext = () => {
    setActiveIndex((currentIndex) => (currentIndex + 1) % safeSlides.length);
  };

  return (
    <div ref={containerRef} className={cn("relative h-full w-full", className)}>
      <div className="relative h-full w-full overflow-hidden rounded-[1.35rem]">
        {safeSlides.map((slide, index) => (
          <div
            key={slide.src}
            className={cn(
              "absolute inset-0 transition-all duration-700 ease-out",
              index === activeIndex
                ? "scale-100 opacity-100"
                : "pointer-events-none scale-[1.03] opacity-0",
            )}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="(max-width: 768px) 72vw, 360px"
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
              <p className="text-xs uppercase tracking-[0.24em] text-white/70">{slide.label}</p>
            </div>
          </div>
        ))}
      </div>

      {safeSlides.length > 1 ? (
        <>
          <button
            type="button"
            onClick={showPrevious}
            className="absolute left-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur transition hover:bg-black/40"
            aria-label="Foto sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={showNext}
            className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur transition hover:bg-black/40"
            aria-label="Foto berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2">
            {safeSlides.map((slide, index) => (
              <button
                key={`${slide.src}-dot`}
                type="button"
                onClick={() => goToSlide(index)}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  index === activeIndex ? "w-7 bg-white" : "w-2.5 bg-white/45",
                )}
                aria-label={`Tampilkan foto ${index + 1}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
