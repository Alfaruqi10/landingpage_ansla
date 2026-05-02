import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CheckCircle2, Sparkles, UserPlus } from "lucide-react";

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
    "Buat akun pelanggan ANSLA untuk belanja lebih cepat, menyimpan identitas, dan memudahkan repeat order."
};

type RegisterPageProps = {
  searchParams?: {
    status?: string;
    message?: string;
  };
};

const accountPerks = [
  "Satu akun untuk repeat order berikutnya.",
  "Bisa cek ringkasan akun dan riwayat pesanan.",
  "Tidak mengubah alur checkout cepat untuk first-time buyer."
];

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const session = await getCustomerSession();

  if (session) {
    redirect("/account");
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="surface-panel p-8 sm:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="section-eyebrow">Buat akun pelanggan</p>
              <h1 className="mt-3 max-w-[12ch] text-4xl leading-[1.02] sm:text-5xl">
                Daftar cepat untuk pelanggan yang ingin belanja lebih praktis.
              </h1>
              <p className="mt-4 max-w-2xl">
                Akun ini dibuat untuk memudahkan repeat order, bukan untuk mempersulit checkout.
                Karena itu, form-nya sengaja singkat dan tetap terasa ringan.
              </p>
            </div>
            <ThemeToggle />
          </div>

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
                placeholder="Tulis nama Anda"
                className="mt-2"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@contoh.com"
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

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline">
              <Link href="/login">
                Sudah Punya Akun
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/checkout">Checkout Tanpa Akun</Link>
            </Button>
          </div>
        </div>

        <div className="surface-panel overflow-hidden bg-[linear-gradient(145deg,rgba(56,42,30,0.98),rgba(40,29,21,0.95))] p-8 text-white sm:p-10">
          <SiteLogo forceLight className="w-fit" />
          <p className="section-eyebrow mt-8 text-white/60">Konsep yang pas untuk ANSLA</p>
          <h2 className="mt-4 max-w-[12ch] text-5xl leading-[0.98] text-white">
            Akun hadir untuk membantu, bukan menghalangi.
          </h2>
          <p className="mt-4 max-w-xl text-white/70">
            Untuk brand modestwear yang bertumpu pada visual, trust, dan kenyamanan order, konsep
            akun terbaik adalah akun opsional yang sederhana. Pelanggan baru tetap bisa langsung
            checkout, sedangkan pelanggan lama bisa kembali dengan lebih cepat.
          </p>

          <div className="mt-8 grid gap-4">
            {accountPerks.map((perk) => (
              <div
                key={perk}
                className="rounded-[1.4rem] border border-white/12 bg-white/8 p-5 text-white/78"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#f4dcc0]" />
                  <span>{perk}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-white/12 bg-white/6 p-5">
            <div className="flex items-center gap-3 text-white">
              <Sparkles className="h-4 w-4" />
              <p className="font-medium">Catatan pengalaman pengguna</p>
            </div>
            <p className="mt-3 text-sm text-white/70">
              Login/register ini saya desain sebagai jalur sekunder. Jalur utama website tetap
              koleksi, detail produk, checkout cepat, dan konsultasi WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
