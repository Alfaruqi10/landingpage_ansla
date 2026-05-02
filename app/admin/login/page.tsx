import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteLogo } from "@/components/layout/site-logo";
import { StatusBanner } from "@/components/shared/status-banner";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminSession } from "@/lib/auth";
import { loginAction } from "@/lib/actions/auth-actions";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Halaman login admin sederhana untuk mengelola katalog dan content landing page."
};

type AdminLoginPageProps = {
  searchParams?: {
    status?: string;
    message?: string;
  };
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="surface-panel bg-stone-900 p-8 text-white sm:p-10">
          <SiteLogo forceLight className="w-fit" />
          <p className="section-eyebrow text-white/60">Admin access</p>
          <h1 className="mt-4 text-5xl text-white">Manage ANSLA with a clean and simple flow.</h1>
          <p className="mt-4 text-white/70">
            Gunakan halaman ini untuk login ke panel admin, mengelola katalog produk, banner,
            testimonial, FAQ, dan leads dari landing page.
          </p>
          <div className="mt-8 rounded-[1.5rem] border border-white/15 bg-white/5 p-5 text-sm text-white/70">
            <p className="font-medium text-white">Seed admin default</p>
            <p className="mt-2">Email: {siteConfig.email}</p>
            <p>Password: Admin123!</p>
          </div>
        </div>

        <div className="surface-panel p-8 sm:p-10">
          <div className="flex items-center justify-between gap-4">
            <p className="section-eyebrow">Masuk aman</p>
            <ThemeToggle />
          </div>
          <h2 className="mt-3 text-4xl">Login Admin</h2>
          <p className="mt-3">
            Masukkan kredensial admin untuk mengakses dashboard dan CMS sederhana.
          </p>
          <StatusBanner
            className="mt-5"
            status={searchParams?.status}
            message={searchParams?.message}
          />
          <form action={loginAction} className="mt-6 space-y-5">
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
                placeholder="Masukkan password"
                className="mt-2"
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
          <Button asChild variant="ghost" className="mt-5 px-0 text-stone-600">
            <Link href="/">Kembali ke website</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
