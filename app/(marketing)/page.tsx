import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  BadgeCheck,
  CalendarRange,
  Check,
  ChevronRight,
  Crown,
  HeartHandshake,
  MoveRight,
  PackageCheck,
  PlayCircle,
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
import { VideoPlaceholder } from "@/components/shared/video-placeholder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getHomePageData } from "@/lib/data/public";
import { siteConfig } from "@/lib/site";
import { buildWhatsAppLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Abaya dan Modestwear Premium",
  description:
    "Temukan abaya dan modestwear premium yang nyaman dipakai, mudah dipilih, dan siap dipesan lewat checkout web atau WhatsApp.",
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
  const heroCollectionPreview = collectionCards.slice(0, 3);
  const spotlightProducts = featuredProducts.slice(0, 3);
  const avatarTestimonials = testimonials.filter((testimonial) => testimonial.imageUrl).slice(0, 4);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 -z-10 h-[620px] bg-[radial-gradient(circle_at_top,_rgba(186,160,123,0.28),_transparent_48%)]" />
        <div className="absolute right-[-8rem] top-24 -z-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(212,191,161,0.24),_transparent_66%)] blur-3xl" />
        <div className="container section-space">
          <div className="grid gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
            <Reveal className="space-y-7">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-white/92 px-4 py-2 text-stone-700 shadow-[0_10px_24px_rgba(59,42,28,0.08)]">
                  Untuk Anda yang ingin tampil anggun tanpa ribet
                </Badge>
                <div className="inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-white/80 px-4 py-2 text-sm text-stone-600 shadow-[0_10px_24px_rgba(59,42,28,0.06)]">
                  <Star className="h-4 w-4 fill-current text-amber-500" />
                  {siteConfig.socialProof.rating} dari pelanggan kami
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {avatarTestimonials.map((testimonial, index) => (
                    <div
                      key={testimonial.id}
                      className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-[hsl(var(--background))] bg-stone-200 shadow-md"
                    >
                      <Image
                        src={testimonial.imageUrl!}
                        alt={testimonial.name}
                        fill
                        sizes="44px"
                        className="object-cover"
                        priority={index < 2}
                      />
                    </div>
                  ))}
                </div>
                <p className="max-w-xs text-sm leading-6 text-stone-600">
                  Dipilih ribuan pelanggan yang mencari modestwear rapi, nyaman, dan mudah diorder.
                </p>
              </div>

              <div className="space-y-5">
                <p className="section-eyebrow">Koleksi pilihan untuk dipakai di momen nyata</p>
                <h1 className="max-w-[11ch] text-balance text-5xl leading-[0.98] sm:max-w-3xl md:text-7xl">
                  Cari model yang bahannya enak, jatuhnya rapi, dan tetap aman dipakai di banyak momen.
                </h1>
                <p className="max-w-xl text-base text-stone-600 sm:max-w-2xl md:text-xl">
                  Kami rapikan pilihan koleksi, foto, dan alur order supaya Anda lebih cepat yakin:
                  lihat modelnya, cek detail pentingnya, lalu checkout atau tanya ukuran tanpa ribet.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-12 px-7 shadow-[0_16px_30px_rgba(36,26,18,0.18)]"
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
                  className="h-12 border-stone-300/90 bg-white/85 px-7 shadow-[0_12px_28px_rgba(52,37,23,0.08)]"
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

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="insight-card p-4 sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
                    Rating
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-stone-900">
                    {siteConfig.socialProof.rating}
                  </p>
                  <p className="mt-1 text-sm">Kepuasan pelanggan yang kembali order.</p>
                </div>
                <div className="insight-card p-4 sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
                    Review
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-stone-900">
                    {siteConfig.socialProof.reviews}
                  </p>
                  <p className="mt-1 text-sm">Testimoni dan social proof dari pelanggan.</p>
                </div>
                <div className="insight-card p-4 sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
                    Pelanggan
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-stone-900">
                    {siteConfig.socialProof.customers}
                  </p>
                  <p className="mt-1 text-sm">Pelanggan dari berbagai kota di Indonesia.</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="relative min-h-[560px]">
                <div className="absolute left-[10%] top-[8%] -z-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(196,166,132,0.24),_transparent_64%)] blur-3xl" />

                <div className="insight-card absolute left-0 top-6 z-20 hidden w-56 -rotate-[7deg] p-5 lg:block">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-stone-500">Best seller</p>
                    <Crown className="h-4 w-4 text-stone-500" />
                  </div>
                  <p className="mt-3 text-4xl font-semibold text-stone-900">
                    {featuredProducts.length}
                  </p>
                  <p className="mt-2 text-sm">
                    Koleksi unggulan yang paling cepat mengarahkan pelanggan ke detail produk.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-stone-900 px-3 py-1.5 text-xs text-white">
                    Lihat favorit
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="surface-panel relative ml-auto overflow-hidden p-3 sm:p-5 lg:w-[82%]">
                  <div className="relative min-h-[380px] overflow-hidden rounded-[1.35rem] bg-stone-200 sm:min-h-[560px] sm:rounded-[1.6rem]">
                    <div className="absolute left-4 top-4 z-20 flex flex-wrap items-center gap-2 sm:left-6 sm:top-6">
                      <div className="rounded-full border border-white/20 bg-white/12 px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-white/90 backdrop-blur sm:px-4 sm:py-2 sm:text-xs">
                        Siap dipilih tanpa banyak bingung
                      </div>
                      <div className="hidden rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-xs text-white/85 backdrop-blur sm:inline-flex">
                        Checkout web atau konsultasi WhatsApp
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4 z-20 max-w-[320px] rounded-[1.35rem] border border-white/18 bg-black/28 p-4 text-white backdrop-blur sm:bottom-6 sm:left-6 sm:p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/65">
                        Curated highlight
                      </p>
                      <h2 className="mt-3 text-3xl leading-[1.02] text-white">
                        {heroBanner?.title || "Curated essentials for refined modest dressing"}
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-white/78">
                        {heroBanner?.subtitle ||
                          "Lihat koleksi yang terasa rapi, nyaman, dan siap dipakai dari aktivitas harian sampai acara spesial."}
                      </p>
                    <Button asChild variant="secondary" className="mt-4 bg-white text-stone-900">
                      <Link href={heroBanner?.ctaLink || "/products"}>
                        {heroBanner?.ctaText || "Lihat Koleksi"}
                      </Link>
                    </Button>
                  </div>

                    <Image
                      src={
                        heroBanner?.imageUrl ||
                        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1400&q=80"
                      }
                      alt={heroBanner?.title || "Premium ANSLA collection"}
                      fill
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      className="absolute inset-0 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/76 via-stone-900/14 to-transparent" />
                  </div>
                </div>

                <div className="insight-card absolute bottom-0 left-6 z-20 hidden w-72 rotate-[-4deg] p-5 lg:block">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-stone-500">Paling sering dicari</p>
                    <CalendarRange className="h-4 w-4 text-stone-500" />
                  </div>
                  <div className="mt-4 space-y-3">
                    {spotlightProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between gap-3 rounded-[1rem] border border-stone-200/70 bg-white/70 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-stone-900">
                            {product.name}
                          </p>
                          <p className="text-xs text-stone-500">{product.category.name}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-stone-500" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="insight-card absolute bottom-10 right-0 z-20 hidden w-56 rotate-[4deg] p-5 lg:block">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-stone-500">Kategori populer</p>
                    <PackageCheck className="h-4 w-4 text-stone-500" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {heroCollectionPreview.map((collection) => (
                      <span
                        key={collection.slug}
                        className="rounded-full border border-stone-200 bg-white/78 px-3 py-1.5 text-xs font-medium text-stone-700"
                      >
                        {collection.label}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-sm">
                    Jalur cepat untuk menemukan jenis koleksi yang paling sesuai kebutuhan Anda.
                  </p>
                </div>

                <div className="mt-5 grid gap-3 lg:hidden">
                  <div className="insight-card p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-stone-500">Kategori populer</p>
                      <HeartHandshake className="h-4 w-4 text-stone-500" />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {heroCollectionPreview.map((collection) => (
                        <span
                          key={collection.slug}
                          className="rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-stone-700"
                        >
                          {collection.label}
                        </span>
                      ))}
                    </div>
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
                <h2 className="mt-3 text-2xl">Lanjut checkout atau tanya size lewat WhatsApp</h2>
                <p className="mt-3 text-stone-600">
                  Kalau sudah cocok langsung order, kalau masih ragu tinggal minta bantuan warna,
                  size, atau rekomendasi model yang paling pas.
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
              description="Koleksi ini paling sering dipilih karena warnanya aman, siluetnya mudah dipakai, dan detailnya cukup jelas untuk lanjut order lebih cepat."
              action={
                <Button asChild variant="outline">
                  <Link href="/products">
                    Lihat Semua Koleksi
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
                Kami merapikan setiap bagian halaman agar Anda lebih mudah memahami model,
                warna, dan cara order tanpa harus bertanya dari nol.
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
                          <PlayCircle className="h-5 w-5" />
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
                      Banyak pelanggan menyukai koleksi kami karena jatuh bahannya rapi, warnanya
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

      <section className="section-space">
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="Lihat produk lebih dekat"
              title="Area video bisa dipakai untuk bantu Anda melihat jatuh bahan dan detail model"
              description="Bagian ini disiapkan untuk video produk, try-on, atau penjelasan singkat supaya Anda lebih yakin sebelum order."
            />
          </Reveal>
          <div className="mt-10">
            <Reveal delay={0.08}>
              <VideoPlaceholder />
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
                description="Kami rangkum pertanyaan paling umum soal bahan, ukuran, dan pemesanan supaya Anda tidak perlu mulai bertanya dari nol."
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
                    description="Tim kami akan menghubungi Anda dengan rekomendasi koleksi yang lebih sesuai."
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
                    Jelajahi koleksi unggulan kami atau langsung konsultasi lewat WhatsApp untuk
                    dibantu pilih model yang paling cocok.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild variant="secondary" className="bg-white text-stone-900">
                    <Link href="/products">Lihat Koleksi</Link>
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
