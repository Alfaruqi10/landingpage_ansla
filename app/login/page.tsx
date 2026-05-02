import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CheckCircle2, LogIn, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";

import { SiteLogo } from "@/components/layout/site-logo";
import { StatusBanner } from "@/components/shared/status-banner";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { customerLoginAction } from "@/lib/actions/customer-auth-actions";
import { getCustomerSession } from "@/lib/customer-auth";
import { siteConfig } from "@/lib/site";
import { buildWhatsAppLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Login Pelanggan",
  description:
    "Masuk ke akun ANSLA untuk mempercepat repeat order, menyimpan data Anda, dan melihat riwayat pesanan."
};

type LoginPageProps = {
  searchParams?: {
    status?: string;
    message?: string;
  };
};

const benefitItems = [
  "Checkout berikutnya jadi lebih cepat karena data utama sudah tersimpan.",
  "Riwayat pesanan lebih mudah dilihat saat Anda ingin repeat order.",
  "Tetap fleksibel karena belanja tanpa login juga masih bisa."
];

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getCustomerSession();

  if (session) {
    redirect("/account");
  }

  const whatsappLink = buildWhatsAppLink(
    siteConfig.whatsappNumber,
    "Assalamu'alaikum, saya butuh bantuan login atau pendaftaran akun ANSLA."
  );

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="surface-panel overflow-hidden bg-stone-900 p-8 text-white sm:p-10">
          <div className="flex items-start justify-between gap-4">
            <SiteLogo forceLight className="w-fit" />
            <ThemeToggle />
          </div>

          <p className="section-eyebrow mt-8 text-white/60">Akun pelanggan opsional</p>
          <h1 className="mt-4 max-w-[11ch] text-5xl leading-[0.98] text-white sm:text-6xl">
            Login yang ringan untuk pelanggan yang ingin belanja lebih cepat.
          </h1>
          <p className="mt-4 max-w-xl text-white/70">
            Untuk project ANSLA, konsep login terbaik adalah akun pelanggan yang tidak memaksa.
            Pengunjung tetap bisa checkout sebagai tamu, sementara pelanggan setia bisa masuk untuk
            repeat order yang lebih rapi.
          </p>

          <div className="mt-8 grid gap-4">
            <div className="rounded-[1.5rem] border border-white/15 bg-white/8 p-5">
              <div className="flex items-center gap-3 text-white">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg">Kenapa model ini cocok</p>
                  <p className="text-sm text-white/60">Fokus conversion tetap terjaga</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                {benefitItems.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-white/72">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#f4dcc0]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/15 bg-white/5 p-5">
              <div className="flex items-center gap-3 text-white">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg">Tetap bisa checkout tanpa akun</p>
                  <p className="text-sm text-white/60">
                    Jadi login tidak menjadi hambatan untuk first purchase.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="surface-panel p-8 sm:p-10">
          <p className="section-eyebrow">Masuk ke akun ANSLA</p>
          <h2 className="mt-3 text-4xl">Selamat datang kembali</h2>
          <p className="mt-3 max-w-2xl">
            Masukkan email dan password Anda untuk melihat akun dan riwayat order yang memakai
            email yang sama.
          </p>

          <StatusBanner
            className="mt-5"
            status={searchParams?.status}
            message={searchParams?.message}
          />

          <form action={customerLoginAction} className="mt-6 space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={siteConfig.email}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Masukkan password Anda"
                className="mt-2"
              />
            </div>

            <Button type="submit" className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              Masuk ke Akun
            </Button>
          </form>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button asChild variant="outline">
              <Link href="/register">
                Buat Akun Baru
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/checkout">Lanjut Checkout Tanpa Login</Link>
            </Button>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-stone-200/80 bg-stone-50 p-5">
            <div className="flex items-center gap-3 text-stone-900">
              <Sparkles className="h-4 w-4" />
              <p className="font-medium">Butuh bantuan masuk atau daftar?</p>
            </div>
            <p className="mt-2 text-sm text-stone-600">
              Kalau Anda ingin dibantu lebih cepat, tim ANSLA bisa arahkan lewat WhatsApp.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href={whatsappLink} target="_blank">
                Tanya via WhatsApp
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
