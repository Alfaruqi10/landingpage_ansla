import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, KeyRound, Send, Sparkles } from "lucide-react";

import { SiteLogo } from "@/components/layout/site-logo";
import { StatusBanner } from "@/components/shared/status-banner";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestCustomerPasswordResetAction } from "@/lib/actions/customer-auth-actions";
import { siteConfig } from "@/lib/site";
import { buildWhatsAppLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Lupa Kata Sandi",
  description: "Ajukan bantuan reset kata sandi akun ANSLA."
};

type ForgotPasswordPageProps = {
  searchParams?: {
    status?: string;
    message?: string;
  };
};

export default function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const whatsappLink = buildWhatsAppLink(
    siteConfig.whatsappNumber,
    "Assalamu'alaikum, saya butuh bantuan reset kata sandi akun ANSLA."
  );

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-xl">
        <div className="surface-panel p-8 sm:p-10">
          <div className="flex items-start justify-between gap-4">
            <SiteLogo className="w-fit" />
            <ThemeToggle />
          </div>

          <h1 className="mt-3 text-4xl">Lupa kata sandi?</h1>
          <p className="mt-3 max-w-2xl">
            Masukkan email akun Anda untuk mengajukan bantuan pemulihan akses.
          </p>

          <StatusBanner
            className="mt-5"
            status={searchParams?.status}
            message={searchParams?.message}
          />

          <form action={requestCustomerPasswordResetAction} className="mt-6 space-y-5">
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
              <Label htmlFor="phone">WhatsApp (Opsional)</Label>
              <Input
                id="phone"
                name="phone"
                type="text"
                placeholder="08xxxxxxxxxx"
                className="mt-2"
              />
            </div>

            <Button type="submit" className="w-full">
              <Send className="mr-2 h-4 w-4" />
              Kirim Permintaan
            </Button>
          </form>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button asChild variant="outline">
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Login
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href={whatsappLink} target="_blank">
                Bantuan via WhatsApp
              </Link>
            </Button>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-stone-200/80 bg-stone-50 p-5">
            <div className="flex items-center gap-3 text-stone-900">
              <KeyRound className="h-4 w-4" />
              <p className="font-medium">Cara kerja reset</p>
            </div>
            <p className="mt-2 text-sm text-stone-600">
              Permintaan Anda akan masuk sebagai bantuan akun agar proses pemulihan tetap aman.
            </p>
            <div className="mt-4 flex items-center gap-3 text-stone-900">
              <Sparkles className="h-4 w-4" />
              <p className="text-sm text-stone-600">
                Jika butuh lebih cepat, lanjutkan langsung lewat WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
