import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  MoveRight,
  ShieldCheck,
  Sparkles,
  Star
} from "lucide-react";

import { LeadCaptureForm } from "@/components/shared/lead-capture-form";
import { ProductCard } from "@/components/shared/product-card";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { StatusBanner } from "@/components/shared/status-banner";
import { TestimonialCard } from "@/components/shared/testimonial-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getHomePageData } from "@/lib/data/public";
import { siteConfig } from "@/lib/site";
import { buildWhatsAppLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Abaya dan Modestwear Premium",
  description:
    "Temukan abaya dan modestwear premium yang nyaman dipakai, mudah dipilih, dan siap dipesan lewat Shopee atau WhatsApp.",
  openGraph: {
    title: "ANSLA | Abaya dan Modestwear Premium",
    description:
      "Temukan koleksi yang membantu Anda tampil rapi, anggun, dan nyaman di momen sehari-hari maupun acara spesial."
  }
};

type HomePageProps = {
  searchParams?: {
    form?: string;
    status?: string;
    message?: string;
  };
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { banners, featuredProducts, categories, collectionItems, testimonials, faqs } =
    await getHomePageData();

  const heroBanner = banners[0];
  const leadFeedback =
    searchParams?.form === "lead"
      ? {
          status: searchParams.status,
          message: searchParams.message
        }
      : undefined;
  const collectionCards = collectionItems.map((collection) => {
    const matchedCategories = categories.filter((category) =>
      (collection.mappedCategorySlugs as readonly string[]).includes(category.slug)
    );

    return {
      slug: collection.slug,
      label: collection.label,
      imageUrl:
        collection.imageUrl ||
        matchedCategories.find((category) => category.imageUrl)?.imageUrl ||
        featuredProducts[0]?.imageUrl ||
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80"
    };
  });
  const avatarTestimonials = testimonials.filter((testimonial) => testimonial.imageUrl).slice(0, 4);
  const heroProduct = featuredProducts[0];
  const heroImageUrl =
    heroBanner?.imageUrl ||
    heroProduct?.imageUrl ||
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1400&q=80";
  const rawHeroSlideImages = Array.from(
    new Set(banners.map((banner) => banner.imageUrl).filter((imageUrl): imageUrl is string => Boolean(imageUrl)))
  ).slice(0, 4);
  const heroSlideImages =
    rawHeroSlideImages.length > 1
      ? Array.from({ length: 4 }, (_, index) => rawHeroSlideImages[index % rawHeroSlideImages.length])
      : rawHeroSlideImages.length === 1
        ? rawHeroSlideImages
        : [heroImageUrl];
  const heroTitle = heroBanner?.title || "Elegansi Modest Wear untuk Gaya Premium Anda.";
  const heroSubtitle =
    heroBanner?.subtitle ||
    "Temukan koleksi yang bahannya nyaman, jatuhnya rapi, dan mudah dipilih untuk banyak momen.";
  const heroCtaText = heroBanner?.ctaText || "Lihat Koleksi";
  const heroCtaLink = heroBanner?.ctaLink || "/products";
  const heroStats = [
    {
      label: "Rating",
      value: siteConfig.socialProof.rating,
      note: "Dari pelanggan setia"
    },
    {
      label: "Ulasan",
      value: siteConfig.socialProof.reviews,
      note: "Review positif"
    },
    {
      label: "Pelanggan",
      value: siteConfig.socialProof.customers,
      note: "Telah percaya ANSLA"
    }
  ];

  return (
    <>
      <section className="relative -mt-24 overflow-hidden text-stone-900 dark:text-white md:-mt-28">
        <div className="absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(circle_at_top,_rgba(186,160,123,0.28),_transparent_48%)] dark:bg-[radial-gradient(circle_at_top,_rgba(190,160,113,0.1),_transparent_42%)]" />
        <div className="absolute right-[-8rem] top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(212,191,161,0.24),_transparent_66%)] blur-3xl dark:bg-[radial-gradient(circle,_rgba(212,191,161,0.08),_transparent_66%)]" />
        <div className="container relative pb-12 pt-48 sm:pb-14 sm:pt-52 lg:pb-16 lg:pt-52">
          <div className="grid gap-8 lg:grid-cols-[0.98fr_1.02fr] lg:items-center">
            <Reveal className="space-y-5 text-center sm:text-left">
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="rounded-full border border-stone-200/80 bg-white/92 px-4 py-2 text-xs font-semibold text-stone-700 shadow-[0_10px_24px_rgba(59,42,28,0.08)] dark:border-white/14 dark:bg-white/8 dark:text-white/88 dark:shadow-[0_14px_34px_rgba(0,0,0,0.16)]">
                  Untuk Anda yang ingin tampil anggun tanpa ribet
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-white/80 px-4 py-2 text-sm text-stone-600 shadow-[0_10px_24px_rgba(59,42,28,0.06)] dark:border-white/12 dark:bg-white/8 dark:text-white/82 dark:shadow-[0_14px_34px_rgba(0,0,0,0.16)]">
                  <Star className="h-4 w-4 fill-current text-amber-500" />
                  {siteConfig.socialProof.rating} Rating - {siteConfig.socialProof.reviews} Reviews
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
                <div className="flex -space-x-3">
                  {avatarTestimonials.map((testimonial, index) => (
                    <div
                      key={testimonial.id}
                      className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-[hsl(var(--background))] bg-stone-200 shadow-md"
                    >
                      <Image
                        src={testimonial.imageUrl!}
                        alt={testimonial.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                        priority={index < 2}
                      />
                    </div>
                  ))}
                </div>
                <p className="max-w-xs text-sm leading-6 text-stone-700 dark:text-white/68">
                  Dipilih ribuan pelanggan yang mencari modestwear rapi, nyaman, dan mudah diorder.
                </p>
              </div>

              <div className="mx-auto max-w-[720px] space-y-5 sm:mx-0">
                <p className="section-eyebrow">
                  Koleksi pilihan untuk dipakai di momen nyata
                </p>
                <h1 className="text-balance text-[2.65rem] leading-[0.98] text-stone-900 dark:text-white sm:text-6xl lg:text-[4.35rem]">
                  Cari model yang bahannya enak, jatuhnya rapi, dan tetap aman dipakai di banyak momen.
                </h1>
                <p className="mx-auto max-w-xl text-base leading-7 text-stone-700 dark:text-white/70 sm:mx-0 md:text-lg">
                  Lihat modelnya, cek detail pentingnya, lalu order via Shopee
                  atau tanya ukuran lewat WhatsApp — tanpa ribet.
                </p>
              </div>

              <div className="grid gap-3 sm:flex sm:flex-wrap">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full px-8 shadow-[0_16px_30px_rgba(36,26,18,0.18)]"
                >
                  <Link href="/products">
                    Lihat Koleksi
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-full border-stone-300/90 bg-white/85 px-8 text-stone-900 shadow-[0_12px_28px_rgba(52,37,23,0.08)] hover:bg-white/95 dark:border-white/18 dark:bg-white/8 dark:text-white dark:hover:bg-white/12"
                >
                  <Link
                    href={buildWhatsAppLink(
                      siteConfig.whatsappNumber,
                      "Assalamu'alaikum, saya ingin dibantu pilih koleksi ANSLA yang cocok untuk saya."
                    )}
                    target="_blank"
                  >
                    Konsultasi WhatsApp
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {heroStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="insight-card p-3 text-center sm:p-4 sm:text-left"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500 sm:text-xs">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-stone-900 dark:text-white sm:text-3xl">{stat.value}</p>
                    <p className="mt-1 hidden text-xs leading-5 sm:block">{stat.note}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="relative mx-auto max-w-[500px]">
                <div className="relative rounded-[2rem] border border-stone-200/80 bg-white/84 p-3 shadow-[0_22px_70px_rgba(74,53,33,0.08),0_6px_20px_rgba(45,32,20,0.06)] backdrop-blur dark:border-white/14 dark:bg-white/[0.055] dark:shadow-[0_34px_90px_rgba(0,0,0,0.36)]">
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.55rem] bg-[#dedbd0]">
                    {heroSlideImages.map((imageUrl, index) => {
                      const shouldAnimate = heroSlideImages.length > 1;

                      return (
                        <Image
                          key={`${imageUrl}-${index}`}
                          src={imageUrl}
                          alt={index === 0 ? heroTitle : `Koleksi ANSLA ${index + 1}`}
                          fill
                          sizes="(max-width: 1024px) 100vw, 45vw"
                          className={
                            shouldAnimate
                              ? "hero-photo-slide absolute inset-0 object-cover object-center"
                              : "absolute inset-0 object-cover object-center"
                          }
                          style={
                            shouldAnimate
                              ? {
                                  animationDelay: `${index * 4}s`,
                                  animationDuration: "16s"
                                }
                              : undefined
                          }
                          priority={index === 0}
                        />
                      );
                    })}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/14 via-transparent to-white/10 dark:from-stone-950/38 dark:to-transparent" />
                  </div>

                  <div className="absolute -bottom-5 left-7 z-20 rounded-[0.55rem] border border-stone-200/90 bg-white px-6 py-5 text-stone-900 shadow-[0_18px_44px_rgba(90,59,24,0.14)] dark:border-white/12 dark:bg-[#211915] dark:text-white">
                    <p className="font-display text-3xl leading-none">Hand-picked</p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-stone-500 dark:text-[#e6c77a]">
                      Premium materials
                    </p>
                  </div>
                </div>

                <div className="mt-10 rounded-[1.5rem] border border-stone-200/80 bg-white/72 p-5 text-stone-900 shadow-[0_12px_34px_rgba(59,42,28,0.08)] backdrop-blur dark:border-white/12 dark:bg-white/[0.045] dark:text-white/82">
                  <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-stone-500 dark:text-[#f0d183]/76">
                        Curated highlight
                      </p>
                      <h2 className="mt-3 text-2xl leading-[1.08] text-stone-950 dark:text-white sm:text-3xl">
                        {heroTitle}
                      </h2>
                      <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600 dark:text-white/70">
                        {heroSubtitle}
                      </p>
                    </div>
                    <Button
                      asChild
                      variant="secondary"
                      className="rounded-full"
                    >
                      <Link href={heroCtaLink}>{heroCtaText}</Link>
                    </Button>
                  </div>
                </div>

              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15} className="mt-10">
            <div className="trust-strip overflow-hidden px-4 py-4 sm:px-6">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 text-sm text-white/88 sm:justify-between">
                {siteConfig.trustBadges.map((badge) => (
                  <div
                    key={badge}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                  >
                    <BadgeCheck className="h-4 w-4 text-[#f5e9d5]" />
                    <span className="text-white/90">{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-space">
        <div className="container">
          <Reveal>
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="surface-panel p-5 sm:p-6">
                <p className="section-eyebrow">Langkah 1</p>
                <h2 className="mt-3 text-2xl">Pilih model yang paling dekat dengan kebutuhan Anda</h2>
                <p className="mt-3 text-stone-600">
                  Mulai dari koleksi yang paling Anda cari, lalu cek produk dengan potongan, warna,
                  dan kesan pakai yang paling cocok.
                </p>
              </div>
              <div className="surface-panel p-5 sm:p-6">
                <p className="section-eyebrow">Langkah 2</p>
                <h2 className="mt-3 text-2xl">Bandingkan cepat bahan, look, dan rasa amannya</h2>
                <p className="mt-3 text-stone-600">
                  Fokus ke hal yang paling penting buat pembeli: nyaman dipakai, tidak terlalu ribet,
                  dan tetap terlihat rapi saat dipakai ulang.
                </p>
              </div>
              <div className="surface-panel p-5 sm:p-6">
                <p className="section-eyebrow">Langkah 3</p>
                <h2 className="mt-3 text-2xl">Order via Shopee atau konsultasi lewat WhatsApp</h2>
                <p className="mt-3 text-stone-600">
                  Kalau sudah cocok, langsung order aman via Shopee. Masih ragu soal ukuran
                  atau warna? Tinggal tanya lewat WhatsApp, kami bantu pilihkan.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="Produk unggulan"
              title="Pilihan yang paling sering bikin pembeli cepat yakin"
              description="Koleksi ini paling sering dipilih karena warnanya aman, siluetnya mudah dipakai, dan detailnya cukup jelas untuk langsung order via Shopee."
              action={
                <Button asChild variant="outline">
                  <Link href="https://shopee.co.id/ansla.annisalabel" target="_blank">
                    Beli di Shopee
                    <MoveRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              }
            />
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featuredProducts.map((product, index) => (
              <Reveal key={product.id} delay={index * 0.06}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space bg-white/60">
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="Koleksi"
              title="Masuk dari kebutuhan Anda, bukan dari katalog yang membingungkan"
              description="Pilih jalur yang paling relevan dulu supaya Anda tidak perlu buka terlalu banyak produk sebelum menemukan yang terasa pas."
            />
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {collectionCards.map((collection, index) => (
              <Reveal key={collection.slug} delay={index * 0.06}>
                <Link
                  href={`/products?collection=${collection.slug}`}
                  className="group surface-panel block overflow-hidden p-3"
                >
                  <div className="relative h-56 overflow-hidden rounded-[1.25rem] bg-stone-100 sm:h-72">
                    {collection.imageUrl ? (
                      <Image
                        src={collection.imageUrl}
                        alt={collection.label}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/82 via-stone-950/18 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <span className="block font-display text-2xl tracking-tight text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.35)]">
                        {collection.label}
                      </span>
                      <span className="mt-1 block text-sm text-white/80">Lihat collection</span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal className="space-y-4">
              <p className="section-eyebrow">Kenapa banyak pelanggan memilih ANSLA</p>
              <h2 className="text-4xl md:text-5xl">
                Bukan cuma cantik dilihat, tapi juga enak dipakai dan mudah dipilih.
              </h2>
              <p className="max-w-xl">
                Pilihan model, warna, dan detail order tersaji jelas supaya Anda bisa
                memilih dengan lebih tenang sebelum checkout.
              </p>
            </Reveal>
            <div className="grid gap-4 md:grid-cols-3">
              {siteConfig.uspItems.map((item, index) => (
                <Reveal key={item.title} delay={index * 0.06}>
                  <Card className="h-full border-white/70 bg-white/80 shadow-soft">
                    <CardContent className="space-y-4 p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-700">
                        {index === 0 ? (
                          <Sparkles className="h-5 w-5" />
                        ) : index === 1 ? (
                          <ShieldCheck className="h-5 w-5" />
                        ) : (
                          <Check className="h-5 w-5" />
                        )}
                      </div>
                      <h3 className="text-2xl">{item.title}</h3>
                      <p>{item.description}</p>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-space bg-white/60">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <Reveal>
              <SectionHeading
                eyebrow="Testimoni pelanggan"
                title="Pengalaman pembeli lain membantu Anda menilai sebelum checkout"
                description="Perhatikan komentar soal bahan, rasa nyaman saat dipakai, dan kesan tampilannya supaya keputusan belanja terasa lebih aman."
              />
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {testimonials.map((testimonial, index) => (
                  <Reveal key={testimonial.id} delay={index * 0.05}>
                    <TestimonialCard testimonial={testimonial} />
                  </Reveal>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="surface-panel h-full p-6 sm:p-8">
                <p className="section-eyebrow">Ringkasan kepercayaan pelanggan</p>
                <div className="mt-4 grid gap-5">
                  <div className="rounded-3xl bg-stone-900 p-6 text-white">
                    <div className="flex items-center gap-2 text-white/80">
                      <Star className="h-4 w-4 fill-current" />
                      <span>Kepuasan pelanggan</span>
                    </div>
                    <p className="mt-3 text-5xl">4.9</p>
                    <p className="mt-2 text-white/70">
                      Banyak pelanggan menyukai koleksi ANSLA karena jatuh bahannya rapi, warnanya
                      aman dipakai, dan tetap nyaman dipakai seharian.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-stone-50 p-5">
                      <p className="text-3xl font-semibold text-stone-900">1,250+</p>
                      <p>Review produk dan pelanggan yang kembali order.</p>
                    </div>
                    <div className="rounded-3xl bg-stone-50 p-5">
                      <p className="text-3xl font-semibold text-stone-900">98%</p>
                      <p>Pelanggan menyebut bahan dan cutting sebagai alasan utama memilih.</p>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-stone-200 bg-white p-5">
                    <p className="font-medium text-stone-900">Hal yang paling sering dicari pelanggan</p>
                    <div className="mt-3 grid gap-3">
                      {siteConfig.trustBadges.map((badge) => (
                        <div key={badge} className="flex items-center gap-3 text-sm text-stone-700">
                          <Check className="h-4 w-4 text-stone-700" />
                          <span>{badge}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section-space bg-white/60">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
            <Reveal>
              <SectionHeading
                eyebrow="Pertanyaan yang sering ditanyakan"
                title="Jawaban singkat untuk hal yang biasanya bikin calon pembeli menahan checkout"
                description="Temukan jawaban cepat soal bahan, ukuran, dan pemesanan sebelum Anda lanjut bertanya atau checkout."
              />
              <div className="mt-8 space-y-4">
                {faqs.map((faq, index) => (
                  <Reveal key={faq.id} delay={index * 0.04}>
                    <details className="group rounded-[1.5rem] border border-stone-200/80 bg-white px-5 py-4 shadow-soft">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-lg font-medium text-stone-900">
                        {faq.question}
                        <span className="text-stone-500 transition group-open:rotate-45">+</span>
                      </summary>
                      <p className="pt-4 text-stone-600">{faq.answer}</p>
                    </details>
                  </Reveal>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="surface-panel p-6 sm:p-8" id="lead-form">
                <p className="section-eyebrow">Butuh bantuan sebelum order</p>
                <h2 className="mt-3 text-4xl">Minta katalog terbaru atau tanya ukuran yang paling pas</h2>
                <p className="mt-3">
                  Isi kontak Anda jika ingin dibantu pilih model, warna, atau ukuran tanpa harus
                  chat saat ini juga.
                </p>
                <StatusBanner
                  className="mt-5"
                  status={leadFeedback?.status}
                  message={leadFeedback?.message}
                />
                <div className="mt-5">
                  <LeadCaptureForm
                    source="hero-form"
                    redirectTo="/"
                    title="Tinggalkan kontak Anda"
                    description="Dapatkan rekomendasi koleksi yang lebih sesuai dengan kebutuhan Anda."
                    compact={false}
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="pb-20 pt-6">
        <div className="container">
          <Reveal>
            <div className="surface-panel overflow-hidden bg-stone-900 p-5 text-white sm:p-10">
              <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <p className="section-eyebrow text-white/60">Siap pilih koleksi Anda</p>
                  <h2 className="mt-3 text-3xl leading-[1.06] text-white md:text-5xl">
                    Kalau Anda mencari koleksi yang rapi, nyaman, dan mudah dipakai, mulai dari sini.
                  </h2>
                  <p className="mt-3 max-w-2xl text-white/70">
                    Jelajahi koleksi unggulan atau langsung konsultasi lewat WhatsApp untuk
                    menemukan model yang paling cocok.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild variant="secondary" className="bg-white text-stone-900">
                    <Link href="/products">Lihat Koleksi</Link>
                  </Button>
                  <Button
                    asChild
                    className="border-white/30 bg-[#EE4D2D] text-white hover:bg-[#D94227]"
                  >
                    <Link href="https://shopee.co.id/ansla.annisalabel" target="_blank">
                      Beli di Shopee
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-white/30 bg-transparent text-white hover:bg-white/10"
                  >
                    <Link
                      href={buildWhatsAppLink(
                        siteConfig.whatsappNumber,
                        "Assalamu'alaikum, saya ingin dibantu pilih koleksi ANSLA yang cocok untuk saya."
                      )}
                      target="_blank"
                    >
                      Konsultasi WhatsApp
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
