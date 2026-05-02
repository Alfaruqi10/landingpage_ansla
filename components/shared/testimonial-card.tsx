import Image from "next/image";
import { Star } from "lucide-react";
import type { Testimonial } from "@prisma/client";

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article className="surface-panel h-full p-5">
      <div className="flex items-center gap-1 text-amber-500">
        {Array.from({ length: testimonial.rating }).map((_, index) => (
          <Star key={index} className="h-4 w-4 fill-current" />
        ))}
      </div>
      <p className="mt-4 text-base text-stone-700">&quot;{testimonial.content}&quot;</p>
      <div className="mt-5 flex items-center gap-3">
        {testimonial.imageUrl ? (
          <Image
            src={testimonial.imageUrl}
            alt={testimonial.name}
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-200 text-sm font-medium text-stone-700">
            {testimonial.name.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-medium text-stone-900">{testimonial.name}</p>
          <p className="text-sm">{testimonial.city || "Indonesia"}</p>
        </div>
      </div>
    </article>
  );
}
