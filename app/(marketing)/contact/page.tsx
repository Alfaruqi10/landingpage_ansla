import type { Metadata } from "next";
import Link from "next/link";
import {
  Mail,
  MapPin,
  MessageCircle,
  ArrowRight,
  Clock3,
  ShieldCheck,
  Instagram,
  Facebook,
  Store,
  Music2
} from "lucide-react";

import { ContactForm } from "@/components/shared/contact-form";
import { Reveal } from "@/components/shared/reveal";
import { StatusBanner } from "@/components/shared/status-banner";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";
import { buildWhatsAppLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Kontak",
  description:
    "Tanya ANSLA untuk koleksi, ukuran, bahan, atau bantuan order yang paling sesuai dengan kebutuhan Anda."
};

type ContactPageProps = {
  searchParams?: {
    form?: string;
    status?: string;
    message?: string;
  };
};

const contactCards = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    description: "Fast response untuk konsultasi produk, bantuan order, dan rekomendasi koleksi.",
    action: true
  },
  {
    icon: Mail,
    title: "Email",
    description: siteConfig.email,
    action: false
  },
  {
    icon: MapPin,
    title: "Coverage",
    description: "Melayani pengiriman ke seluruh Indonesia.",
    action: false
  }
];

const assurances = [
  {
    icon: Clock3,
    title: "Respons cepat",
    text: "Anda bisa mendapat jawaban lebih cepat pada jam operasional."
  },
  {
    icon: ShieldCheck,
    title: "Percakapan nyaman",
    text: "Cocok untuk tanya ukuran, detail bahan, katalog, atau kebutuhan kerja sama sederhana."
  }
];

const socialCards = [
  {
    icon: Instagram,
    title: "Instagram",
    href: siteConfig.socialLinks.instagram
  },
  {
    icon: Music2,
    title: "TikTok",
    href: siteConfig.socialLinks.tiktok
  },
  {
    icon: Facebook,
    title: "Facebook",
    href: siteConfig.socialLinks.facebook
  },
  {
    icon: Store,
    title: "Shopee",
    href: siteConfig.marketplaceLinks.shopee
  }
];

export default function ContactPage({ searchParams }: ContactPageProps) {
  const feedback =
    searchParams?.form === "contact"
      ? {
          status: searchParams.status,
          message: searchParams.message
        }
      : undefined;

  const whatsappLink = buildWhatsAppLink(
    siteConfig.whatsappNumber,
    "Assalamu'alaikum, saya ingin dibantu pilih koleksi ANSLA yang cocok untuk saya."
  );

  return (
    <>
      <section>
        <div className="container">
          <Reveal className="surface-panel overflow-hidden p-5 sm:p-8 lg:p-10">
            <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                <p className="section-eyebrow">Tanya ANSLA</p>
                <h1 className="mt-2.5 max-w-[12ch] text-balance fluid-hero-title font-semibold">
                  Ceritakan kebutuhan Anda untuk menemukan pilihan yang lebih pas.
                </h1>
                <p className="mt-3 max-w-xl text-sm sm:mt-4 sm:max-w-2xl sm:text-base text-muted-foreground">
                  Anda bisa tanya soal model, ukuran, bahan, warna, atau cara order yang paling nyaman.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {assurances.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[1.4rem] border border-white/60 bg-[hsl(var(--background)/0.55)] p-4 sm:p-5"
                  >
                    <div className="flex items-center gap-3 text-foreground">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--card)/0.78)] text-stone-700">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <p className="text-base sm:text-lg">{item.title}</p>
                    </div>
                    <p className="mt-3">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-6 pb-20 sm:py-8">
        <div className="container grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
          <Reveal>
            <div className="grid gap-6">
              <div className="surface-panel p-5 sm:p-8">
                <p className="section-eyebrow">Pilihan Kontak</p>
                <h2 className="mt-3 max-w-md text-balance text-2xl leading-[1.08] sm:mt-4 sm:text-4xl">
                  Pilih cara yang paling nyaman untuk menghubungi ANSLA.
                </h2>
                <p className="mt-3 max-w-lg sm:mt-4">
                  Kalau Anda ingin jawaban paling cepat, WhatsApp biasanya jadi pilihan yang paling praktis.
                </p>
              </div>

              <div className="grid gap-4">
                {contactCards.map((item, index) => (
                  <Reveal key={item.title} delay={index * 0.05}>
                    <div className="surface-panel p-4 sm:p-6">
                      <div className="flex items-center gap-3 text-foreground">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 text-stone-700">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-lg sm:text-xl">{item.title}</p>
                          <p className="mt-1 text-sm uppercase tracking-[0.22em] text-muted-foreground">
                            Tim ANSLA
                          </p>
                        </div>
                      </div>
                      <p className="mt-4 max-w-md">{item.description}</p>
                      {item.action ? (
                        <Button asChild variant="outline" className="mt-5">
                          <Link href={whatsappLink} target="_blank">
                            Mulai Chat
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </Reveal>
                ))}
              </div>

              <div className="surface-panel p-4 sm:p-6">
                <p className="section-eyebrow">Media Sosial & Marketplace</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {socialCards.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      target="_blank"
                      className="flex items-center gap-4 rounded-[1rem] border border-border/70 bg-[hsl(var(--background)/0.45)] px-4 py-3 text-sm text-muted-foreground transition hover:border-foreground/20 hover:text-foreground"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-[hsl(var(--card)/0.75)] text-foreground">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          Lihat selengkapnya
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="surface-panel p-5 sm:p-8 lg:p-9">
              <div className="max-w-2xl">
                <p className="section-eyebrow">Kirim Pesan</p>
                <h2 className="mt-3 text-2xl leading-[1.08] sm:mt-4 sm:text-4xl">
                  Tulis kebutuhan Anda di sini.
                </h2>
                <p className="mt-3 sm:mt-4">
                  Tanyakan produk, ukuran, bahan, atau alur pemesanan yang paling pas untuk Anda.
                </p>
              </div>

              <StatusBanner className="mt-6" status={feedback?.status} message={feedback?.message} />
              <ContactForm redirectTo="/contact" />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
