import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Scissors,
  ShieldCheck,
  Sparkles,
  Stars,
  MessageCircleMore
} from "lucide-react";

import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";

const principles = [
  {
    icon: Sparkles,
    title: "Lembut saat dilihat",
    text: "Palet warna netral, tekstur halus, dan detail yang tenang membantu Anda terlihat anggun sejak first impression."
  },
  {
    icon: ShieldCheck,
    title: "Nyaman saat dipakai",
    text: "Material dipilih agar breathable, jatuh rapi, dan tetap nyaman dipakai lebih lama tanpa terasa berat."
  },
  {
    icon: Scissors,
    title: "Potongan yang rapi",
    text: "Siluet modest modern membantu Anda tampil sopan, dewasa, dan tetap mudah distyling."
  }
];

const highlights = [
  "Cocok untuk Anda yang ingin tampil rapi tanpa terasa terlalu ramai.",
  "Palet warna lembut yang mudah dipadukan dengan isi lemari yang sudah Anda punya.",
  "Nyaman dipakai untuk aktivitas harian, meeting, sampai acara keluarga.",
  "Tampil premium tanpa membuat Anda merasa berlebihan saat memakainya."
];

const values = [
  {
    title: "Elegan tanpa ramai",
    text: "Anda tidak perlu banyak detail berlebihan untuk terlihat anggun. Proporsi, tekstur, dan warna yang tepat sudah cukup memberi kesan rapi."
  },
  {
    title: "Mudah dipakai di momen nyata",
    text: "Setiap pilihan tetap terasa masuk untuk aktivitas harian, acara keluarga, undangan, sampai momen spesial Anda."
  },
  {
    title: "Detail yang terasa refined",
    text: "Mulai dari potongan, jatuh bahan, hingga styling visual, semuanya diarahkan agar Anda merasa lebih rapi, lembut, dan percaya diri."
  }
];

export const metadata: Metadata = {
  title: "Tentang",
  description:
    "Kenali pendekatan ANSLA dalam membuat koleksi yang nyaman dipakai, mudah dipadukan, dan terasa premium untuk momen nyata."
};

export default function AboutPage() {
  return (
    <>
      <section>
        <div className="container">
          <Reveal className="surface-panel overflow-hidden p-5 sm:p-8 lg:p-10">
            <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                <p className="section-eyebrow">Tentang ANSLA</p>
                <h1 className="mt-3 max-w-[12ch] text-balance text-3xl leading-[1.04] sm:mt-4 sm:max-w-4xl sm:text-5xl lg:text-6xl">
                  Pilihan koleksi untuk tampil anggun di momen yang benar-benar Anda jalani.
                </h1>
                <p className="mt-3 max-w-xl text-sm sm:mt-5 sm:max-w-2xl sm:text-lg">
                  Temukan modestwear dengan warna lembut, detail rapi, dan rasa nyaman saat
                  dipakai berulang kali.
                </p>
              </div>

              <div className="grid gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-[1.4rem] border border-white/60 bg-[hsl(var(--background)/0.55)] p-4 sm:p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
                    Untuk Anda
                  </p>
                  <p className="mt-2 text-lg text-foreground sm:mt-3 sm:text-xl">
                    Yang ingin terlihat rapi, anggun, dan tetap nyaman
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-white/60 bg-[hsl(var(--background)/0.55)] p-4 sm:p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
                    Nuansa koleksi
                  </p>
                  <p className="mt-2 text-lg text-foreground sm:mt-3 sm:text-xl">
                    Lembut, tenang, dan mudah dipadukan
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-white/60 bg-[hsl(var(--background)/0.55)] p-4 sm:p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
                    Fokus utama
                  </p>
                  <p className="mt-2 text-lg text-foreground sm:mt-3 sm:text-xl">
                    Tetap terasa premium saat dipakai di momen nyata
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-6 lg:py-10">
        <div className="container grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <div className="surface-panel h-full overflow-hidden p-5 sm:p-8">
              <p className="section-eyebrow">Untuk Anda</p>
              <h2 className="mt-3 max-w-2xl text-balance text-2xl leading-[1.08] sm:mt-4 sm:text-4xl">
                Anda bisa tampil modern tanpa kehilangan rasa lembut dan nyaman.
              </h2>
              <div className="mt-4 space-y-4 sm:mt-5">
                <p>
                  Koleksi ANSLA cocok untuk Anda yang ingin terlihat rapi di kegiatan harian,
                  tetapi tetap pantas dipakai ke acara yang lebih spesial.
                </p>
                <p>
                  Siluet yang flowy, bahan yang nyaman, dan warna yang mudah dipadukan membantu
                  gaya harian terasa lebih tenang.
                </p>
                <p>
                  Anda bisa merasa rapi, tenang, dan percaya diri tanpa harus memakai sesuatu
                  yang terasa terlalu ramai.
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2">
                {highlights.map((item) => (
                  <div
                    key={item}
                    className="flex gap-3 rounded-[1.2rem] border border-border/70 bg-[hsl(var(--background)/0.45)] px-4 py-4"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-stone-700" />
                    <p className="leading-6">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="grid h-full gap-6">
              <div className="surface-panel overflow-hidden p-5 sm:p-8">
                <div className="rounded-[1.5rem] border border-white/60 bg-gradient-to-br from-[hsl(var(--secondary)/0.8)] via-[hsl(var(--card)/0.7)] to-[hsl(var(--accent)/0.65)] p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="section-eyebrow">Yang Anda rasakan</p>
                      <h3 className="mt-2 text-2xl sm:mt-3 sm:text-3xl">Tenang dan percaya diri</h3>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--card)/0.8)] text-stone-700">
                      <Stars className="h-6 w-6" />
                    </div>
                  </div>
                  <p className="mt-4 max-w-md">
                    Setiap koleksi diarahkan agar Anda terlihat lembut, dewasa, dan polished
                    tanpa kehilangan rasa nyaman saat memakainya.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {principles.map((item, index) => (
                  <Reveal key={item.title} delay={0.08 + index * 0.05}>
                    <div className="surface-panel h-full p-5 sm:p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-700">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-xl sm:mt-5 sm:text-2xl">{item.title}</h3>
                      <p className="mt-3">{item.text}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="pb-10">
        <div className="container">
          <div className="grid gap-6 lg:grid-cols-3">
            {values.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.05}>
                <div className="surface-panel h-full p-5 sm:p-7">
                  <p className="section-eyebrow">Yang Anda rasakan saat memakainya</p>
                  <h3 className="mt-3 text-2xl leading-[1.08] sm:mt-4 sm:text-3xl">{item.title}</h3>
                  <p className="mt-4">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container">
          <Reveal className="surface-panel overflow-hidden p-5 sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="section-eyebrow">Siap lihat koleksinya</p>
                <h2 className="mt-3 max-w-3xl text-balance text-3xl leading-[1.06] sm:mt-4 sm:text-5xl">
                  Jika Anda mencari koleksi yang rapi, lembut, dan terasa premium, Anda bisa mulai dari sini.
                </h2>
                <p className="mt-3 max-w-xl text-sm sm:mt-5 sm:max-w-2xl sm:text-lg">
                  Jelajahi koleksi ANSLA atau konsultasi jika Anda ingin memilih model yang paling sesuai.
                </p>
              </div>

              <div className="grid gap-3 sm:max-w-md lg:ml-auto lg:w-full">
                <Button asChild size="lg" className="h-11 sm:h-12">
                  <Link href="/products">
                    Lihat Koleksi
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-11 sm:h-12">
                  <Link href="/contact">
                    Tanya ANSLA
                    <MessageCircleMore className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
