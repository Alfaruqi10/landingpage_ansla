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
    "Masuk ke akun ANSLA untuk melihat akun dan riwayat pesanan Anda."
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

          <h2 className="mt-3 text-4xl">Masuk</h2>
          <p className="mt-3 max-w-2xl">
            Masuk atau buat akun untuk melanjutkan.
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
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-stone-600 transition hover:text-stone-900"
                >
                  Lupa kata sandi?
                </Link>
              </div>
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
              Masuk
            </Button>
          </form>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button asChild variant="outline">
              <Link href="/register">
                Buat Akun
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/checkout">Lanjut Tanpa Login</Link>
            </Button>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-stone-200/80 bg-stone-50 p-5">
            <div className="flex items-center gap-3 text-stone-900">
              <Sparkles className="h-4 w-4" />
              <p className="font-medium">Butuh bantuan?</p>
            </div>
            <p className="mt-2 text-sm text-stone-600">
              Jika ada kendala login atau pendaftaran, tim ANSLA siap bantu lewat WhatsApp.
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
