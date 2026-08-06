import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Sparkles, UserPlus } from "lucide-react";

import { SiteLogo } from "@/components/layout/site-logo";
import { StatusBanner } from "@/components/shared/status-banner";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { customerRegisterAction } from "@/lib/actions/customer-auth-actions";
import { getCustomerSession } from "@/lib/customer-auth";

export const metadata: Metadata = {
  title: "Daftar Akun",
  description:
    "Buat akun ANSLA untuk melanjutkan dan memudahkan pesanan berikutnya."
};

type RegisterPageProps = {
  searchParams?: {
    status?: string;
    message?: string;
  };
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const session = await getCustomerSession();

  if (session) {
    redirect("/account");
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-xl">
        <div className="surface-panel p-8 sm:p-10">
          <div className="flex items-start justify-between gap-4">
            <SiteLogo className="w-fit" />
            <ThemeToggle />
          </div>

          <h1 className="mt-3 text-4xl">Daftar</h1>
          <p className="mt-3 max-w-2xl">
            Buat akun atau masuk untuk melanjutkan.
          </p>

          <StatusBanner
            className="mt-5"
            status={searchParams?.status}
            message={searchParams?.message}
          />

          <form action={customerRegisterAction} className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Nama lengkap"
                className="mt-2"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                className="mt-2"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="phone">WhatsApp (Opsional)</Label>
              <Input
                id="phone"
                name="phone"
                type="text"
                placeholder="08xxxxxxxxxx"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Minimal 6 karakter"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Ulangi password"
                className="mt-2"
              />
            </div>

            <div className="sm:col-span-2">
              <Button type="submit" className="w-full">
                <UserPlus className="mr-2 h-4 w-4" />
                Buat Akun
              </Button>
            </div>
          </form>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button asChild variant="outline">
              <Link href="/login">
                Sudah Punya Akun
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
              Jika ada kendala saat daftar akun, kamu tetap bisa lanjut checkout atau hubungi tim ANSLA.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
