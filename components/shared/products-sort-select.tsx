"use client";

import { useRouter, useSearchParams } from "next/navigation";

import type { ProductSortOption } from "@/lib/data/public";

const sortOptions: Array<{ value: ProductSortOption; label: string }> = [
  { value: "latest", label: "Terbaru" },
  { value: "featured", label: "Unggulan" },
  { value: "price-asc", label: "Harga Terendah" },
  { value: "price-desc", label: "Harga Tertinggi" }
];

export function ProductsSortSelect({
  value,
  className
}: {
  value: ProductSortOption;
  className?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(nextValue: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextValue === "latest") {
      params.delete("sort");
    } else {
      params.set("sort", nextValue);
    }

    const queryString = params.toString();
    router.push(queryString ? `/products?${queryString}` : "/products");
  }

  return (
    <select
      value={value}
      onChange={(event) => handleChange(event.target.value)}
      className={className}
      aria-label="Urutkan koleksi"
    >
      {sortOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
