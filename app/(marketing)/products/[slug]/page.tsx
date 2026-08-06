import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MoveRight } from "lucide-react";

import { LeadCaptureForm } from "@/components/shared/lead-capture-form";
import { ProductCard } from "@/components/shared/product-card";
import { ProductDetailExperience } from "@/components/shared/product-detail-experience";
import { Reveal } from "@/components/shared/reveal";
import { StatusBanner } from "@/components/shared/status-banner";
import { Button } from "@/components/ui/button";
import { getProductCollection } from "@/lib/collections";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/public";
import { siteConfig } from "@/lib/site";

type ProductDetailPageProps = {
  params: {
    slug: string;
  };
  searchParams?: {
    form?: string;
    status?: string;
    message?: string;
  };
};

export async function generateMetadata({
  params
}: ProductDetailPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);

  if (!product || !product.isActive) {
    return {
      title: "Produk tidak ditemukan"
    };
  }

  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} | ${siteConfig.shortName}`,
      description: product.shortDescription,
      images: [
        {
          url: product.imageUrl,
          alt: product.name
        }
      ]
    }
  };
}

export default async function ProductDetailPage({
  params,
  searchParams
}: ProductDetailPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product || !product.isActive) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id);
  const productCollection = getProductCollection(product);
  const leadFeedback =
    searchParams?.form === "lead"
      ? {
          status: searchParams.status,
          message: searchParams.message
        }
      : undefined;
  return (
    <>
      <section className="pb-20">
        <div className="container">
          <Reveal className="mb-6">
            <div className="surface-panel px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground">
                  Beranda
                </Link>
                <span>/</span>
                <Link href="/products" className="hover:text-foreground">
                  Koleksi
                </Link>
                <span>/</span>
                <Link
                  href={`/products?collection=${productCollection.slug}`}
                  className="text-foreground hover:text-foreground/80"
                >
                  {productCollection.label}
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <ProductDetailExperience product={product} whatsappNumber={siteConfig.whatsappNumber}>
              <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4 sm:p-5">
                <StatusBanner
                  className="mb-4"
                  status={leadFeedback?.status}
                  message={leadFeedback?.message}
                />
                <LeadCaptureForm
                  source="product-detail"
                  redirectTo={`/products/${product.slug}`}
                  title="Masih ingin tanya dulu?"
                  description="Tinggalkan email atau nomor WhatsApp untuk mendapat katalog dan rekomendasi ukuran."
                  compact
                />
              </div>
            </ProductDetailExperience>
          </Reveal>

          {relatedProducts.length > 0 ? (
            <div className="mt-12 sm:mt-16">
              <Reveal>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="section-eyebrow">Pilihan serupa</p>
                    <h2 className="mt-2 text-3xl leading-[1.08] sm:text-4xl">
                      Kalau model ini cocok, Anda mungkin juga suka yang ini
                    </h2>
                  </div>
                  <Button asChild variant="outline" className="w-full sm:w-auto">
                    <Link href="/products">
                      Lihat Semua
                      <MoveRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Reveal>
              <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {relatedProducts.map((relatedProduct, index) => (
                  <Reveal key={relatedProduct.id} delay={index * 0.05}>
                    <ProductCard product={relatedProduct} />
                  </Reveal>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
