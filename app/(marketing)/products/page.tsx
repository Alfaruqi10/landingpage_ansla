import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { ProductCard } from "@/components/shared/product-card";
import { ProductsSortSelect } from "@/components/shared/products-sort-select";
import { Reveal } from "@/components/shared/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type ProductSortOption, getProductsPageData } from "@/lib/data/public";
import { siteConfig } from "@/lib/site";
import { buildWhatsAppLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Koleksi",
  description:
    "Pilih koleksi abaya dan modestwear yang paling sesuai dengan gaya, kebutuhan, dan momen Anda."
};

function ProductsSortSelectFallback({
  value,
  className
}: {
  value: ProductSortOption;
  className?: string;
}) {
  return (
    <select
      value={value}
      className={className}
      aria-label="Urutkan koleksi"
      disabled
    >
      <option value="latest">Terbaru</option>
      <option value="featured">Unggulan</option>
      <option value="price-asc">Harga Terendah</option>
      <option value="price-desc">Harga Tertinggi</option>
    </select>
  );
}

type ProductsPageProps = {
  searchParams?: {
    collection?: string;
    sort?: ProductSortOption;
  };
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const activeCollection = searchParams?.collection;
  const activeSort = searchParams?.sort || "latest";
  const { products, collectionItems, selectedCollection, selectedSort } = await getProductsPageData(
    activeCollection,
    activeSort
  );

  return (
    <>
      <div className="hidden sm:block">
        <PageHero
          eyebrow="Koleksi"
          title="Pilih koleksi yang paling sesuai dengan gaya dan kebutuhan Anda"
          description="Mulai dari model yang paling Anda sukai, lalu lanjut ke detail produk atau konsultasi jika masih ragu memilih."
        />
      </div>

      <section className="pb-20 sm:pt-8 lg:pt-10">
        <div className="container">
          <Reveal className="surface-panel p-5 sm:hidden">
            <p className="section-eyebrow">Koleksi</p>
            <h1 className="mt-3 max-w-[11ch] text-4xl leading-none">
              Pilih koleksi yang paling sesuai
            </h1>
            <p className="mt-3 max-w-[30ch] text-sm">
              Langsung pilih kategori dan mulai lihat produk tanpa harus melewati section yang terlalu panjang.
            </p>
          </Reveal>

          <Reveal className="surface-panel mt-4 p-4 sm:mt-0 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4 sm:hidden">
                  <div>
                    <p className="text-base font-medium text-foreground">Kategori</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedCollection ? selectedCollection.label : "Semua Produk"}
                    </p>
                  </div>
                  <Suspense
                    fallback={
                      <ProductsSortSelectFallback
                        value={selectedSort}
                        className="h-11 min-w-[144px] rounded-2xl border border-border/70 bg-[hsl(var(--background)/0.7)] px-4 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    }
                  >
                    <ProductsSortSelect
                      value={selectedSort}
                      className="h-11 min-w-[144px] rounded-2xl border border-border/70 bg-[hsl(var(--background)/0.7)] px-4 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </Suspense>
                </div>

                <div className="hidden items-center justify-between gap-4 sm:flex">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="rounded-full px-4 py-2 text-stone-700">
                      {products.length} produk tersedia
                    </Badge>
                    {selectedCollection ? (
                      <Badge variant="outline" className="rounded-full px-4 py-2">
                        {selectedCollection.label}
                      </Badge>
                    ) : null}
                  </div>
                  <Suspense
                    fallback={
                      <ProductsSortSelectFallback
                        value={selectedSort}
                        className="h-11 min-w-[180px] rounded-full border border-border/70 bg-[hsl(var(--background)/0.7)] px-4 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    }
                  >
                    <ProductsSortSelect
                      value={selectedSort}
                      className="h-11 min-w-[180px] rounded-full border border-border/70 bg-[hsl(var(--background)/0.7)] px-4 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </Suspense>
                </div>

                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
                  <Button
                    asChild
                    variant={!activeCollection ? "default" : "outline"}
                    className="h-10 shrink-0 rounded-full px-4 text-sm"
                  >
                    <Link href={selectedSort === "latest" ? "/products" : `/products?sort=${selectedSort}`}>
                      Semua
                    </Link>
                  </Button>
                  {collectionItems.map((collection) => (
                    <Button
                      key={collection.slug}
                      asChild
                      variant={activeCollection === collection.slug ? "default" : "outline"}
                      className="h-10 shrink-0 rounded-full px-4 text-sm"
                    >
                      <Link
                        href={
                          selectedSort === "latest"
                            ? `/products?collection=${collection.slug}`
                            : `/products?collection=${collection.slug}&sort=${selectedSort}`
                        }
                      >
                        {collection.label}
                      </Link>
                    </Button>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-3 sm:hidden">
                  <Badge variant="secondary" className="rounded-full px-4 py-2 text-stone-700">
                    {products.length} produk tersedia
                  </Badge>
                  <Button
                    asChild
                    variant="outline"
                    className="h-10 rounded-full px-4 text-sm"
                  >
                    <Link
                      href={buildWhatsAppLink(
                        siteConfig.whatsappNumber,
                        "Assalamu'alaikum, saya ingin dibantu pilih produk ANSLA yang cocok untuk saya."
                      )}
                      target="_blank"
                    >
                      Minta Rekomendasi
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="hidden items-center gap-3 lg:flex">
                <Button asChild variant="outline">
                  <Link
                    href={buildWhatsAppLink(
                      siteConfig.whatsappNumber,
                      "Assalamu'alaikum, saya ingin dibantu pilih produk ANSLA yang cocok untuk saya."
                    )}
                    target="_blank"
                  >
                    Minta Rekomendasi
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>

          {products.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product, index) => (
                <Reveal key={product.id} delay={index * 0.05}>
                  <ProductCard product={product} mobileCompact />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <EmptyState
                title={
                  selectedCollection
                    ? `Belum ada produk untuk koleksi ${selectedCollection.label}`
                    : "Belum ada produk pada koleksi ini"
                }
                description="Coba pilih koleksi lain atau minta rekomendasi yang paling sesuai."
                action={
                  <Button asChild>
                    <Link href="/products">Lihat Semua Koleksi</Link>
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
