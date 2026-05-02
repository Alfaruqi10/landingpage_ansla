import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category, Product } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProductCollection } from "@/lib/collections";
import { siteConfig } from "@/lib/site";
import { buildWhatsAppLink, formatCurrency } from "@/lib/utils";

type ProductCardProps = {
  product: Product & {
    category: Category;
  };
  mobileCompact?: boolean;
};

export function ProductCard({ product, mobileCompact = false }: ProductCardProps) {
  const productCollection = getProductCollection(product);
  const whatsappLink = buildWhatsAppLink(
    siteConfig.whatsappNumber,
    `Assalamu'alaikum, saya tertarik dengan ${product.name} dan ingin tanya detailnya.`
  );

  return (
    <article className="surface-panel flex h-full flex-col overflow-hidden p-3">
      <div className="relative overflow-hidden rounded-[1.25rem] bg-stone-100">
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={640}
          height={800}
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="aspect-[4/5] h-full w-full object-cover transition duration-500 hover:scale-105"
        />
      </div>
      <div className={`flex flex-1 flex-col ${mobileCompact ? "p-3 sm:p-4" : "p-4"}`}>
        <div
          className={
            mobileCompact
              ? "hidden flex-wrap items-center gap-2 sm:flex"
              : "flex flex-wrap items-center gap-2"
          }
        >
          <Badge variant="secondary">{productCollection.label}</Badge>
          {product.featured ? <Badge>Pilihan favorit</Badge> : null}
        </div>
        <div className={mobileCompact ? "mt-3 sm:mt-4 sm:min-h-[8.5rem]" : "mt-4 min-h-[8.5rem]"}>
          <h3
            className={
              mobileCompact
                ? "line-clamp-2 min-h-[2.8rem] text-lg leading-tight sm:min-h-[3.75rem] sm:text-2xl"
                : "min-h-[3.75rem] text-2xl"
            }
          >
            {product.name}
          </h3>
          <p
            className={
              mobileCompact
                ? "mt-2 hidden min-h-[4.75rem] sm:block"
                : "mt-2 min-h-[4.75rem]"
            }
          >
            {product.shortDescription}
          </p>
        </div>
        <div className="mt-auto">
          <div className={`flex min-h-[3rem] items-end gap-2 sm:gap-3`}>
            <p className={mobileCompact ? "text-xl font-semibold text-stone-900 sm:text-2xl" : "text-2xl font-semibold text-stone-900"}>
              {formatCurrency(product.price)}
            </p>
            {product.compareAtPrice ? (
              <p className={mobileCompact ? "hidden pb-1 text-sm text-stone-400 line-through sm:block" : "pb-1 text-sm text-stone-400 line-through"}>
                {formatCurrency(product.compareAtPrice)}
              </p>
            ) : null}
          </div>
        </div>
        <div
          className={
            mobileCompact
              ? "mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3"
              : "mt-4 grid gap-3 sm:grid-cols-2"
          }
        >
          <Button
            asChild
            className={
              mobileCompact
                ? "h-9 w-full min-w-0 px-3 text-xs whitespace-nowrap"
                : "w-full min-w-0 px-4 text-xs sm:text-sm"
            }
          >
            <Link href={whatsappLink} target="_blank">
              <span className="sm:hidden">Tanya WA</span>
              <span className="hidden sm:inline">Tanya via WA</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className={
              mobileCompact
                ? "h-9 w-full min-w-0 px-3 text-xs whitespace-nowrap"
                : "w-full min-w-0 px-4 text-xs sm:text-sm"
            }
          >
            <Link href={`/products/${product.slug}`}>
              <span className="sm:hidden">Detail</span>
              <span className="hidden sm:inline">Detail Produk</span>
              <ArrowRight className={mobileCompact ? "ml-1 h-3.5 w-3.5 sm:ml-2 sm:h-4 sm:w-4" : "ml-2 h-4 w-4"} />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
