import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import type { Category, Product } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProductCollection } from "@/lib/collections";
import { siteConfig } from "@/lib/site";
import { buildWhatsAppLink, formatCurrency } from "@/lib/utils";

const SHOPEE_STORE_URL = "https://shopee.co.id/ansla.annisalabel";

type ProductCardProps = {
  product: Product & {
    category: Category;
  };
  mobileCompact?: boolean;
};

export function ProductCard({ product, mobileCompact = false }: ProductCardProps) {
  const productCollection = getProductCollection(product);
  const shopeeUrl = SHOPEE_STORE_URL;
  const savingsPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  return (
    <article className="surface-panel flex h-full flex-col overflow-hidden p-2.5 sm:p-3.5">
      <div className="relative overflow-hidden rounded-[1rem] sm:rounded-[1.25rem] bg-stone-100">
        {savingsPercent > 0 ? (
          <div className="absolute left-2 top-2 z-10 rounded-full bg-stone-950/90 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-md backdrop-blur">
            Hemat {savingsPercent}%
          </div>
        ) : null}
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={640}
          height={800}
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
          quality={80}
          className="aspect-[4/5] h-full w-full object-cover transition duration-300 hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col pt-2.5 sm:pt-3.5 px-0.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary" className="px-2 py-0.5 text-[10px] sm:text-xs">
            {productCollection.label}
          </Badge>
          {product.featured ? (
            <Badge className="px-2 py-0.5 text-[10px] sm:text-xs">Favorit</Badge>
          ) : null}
        </div>

        <div className="mt-2 flex-1">
          <h3 className="line-clamp-2 text-sm sm:text-base font-semibold leading-tight text-foreground min-h-[2.4rem] sm:min-h-[2.75rem]">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground hidden sm:block">
            {product.shortDescription}
          </p>
        </div>

        <div className="mt-2.5 pt-1 border-t border-border/50">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <p className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
              {formatCurrency(product.price)}
            </p>
            {product.compareAtPrice ? (
              <p className="text-[11px] sm:text-xs text-stone-400 line-through">
                {formatCurrency(product.compareAtPrice)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-1.5">
          <Button
            asChild
            size="sm"
            className="h-10 w-full min-w-0 px-1.5 text-xs rounded-xl shadow-none"
          >
            <Link href={shopeeUrl} target="_blank" aria-label={`Beli ${product.name} di Shopee`}>
              <ExternalLink className="mr-1 h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Shopee</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-10 w-full min-w-0 px-1.5 text-xs rounded-xl"
          >
            <Link href={`/products/${product.slug}`} aria-label={`Lihat detail ${product.name}`}>
              <span className="truncate">Detail</span>
              <ArrowRight className="ml-1 h-3.5 w-3.5 shrink-0" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
