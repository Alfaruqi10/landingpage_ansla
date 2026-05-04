import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, LogIn, Sparkles } from "lucide-react";

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
      <div className="mx-auto w-full max-w-xl">
        <div className="surface-panel p-8 sm:p-10">
          <div className="flex items-start justify-between gap-4">
            <SiteLogo className="w-fit" />
            <ThemeToggle />
          </div>

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
