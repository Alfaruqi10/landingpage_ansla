import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock3, LogOut, Package, Phone, ShoppingBag, UserRound } from "lucide-react";

import { StatusBanner } from "@/components/shared/status-banner";
import { Button } from "@/components/ui/button";
import { customerLogoutAction } from "@/lib/actions/customer-auth-actions";
import { requireCustomerSession } from "@/lib/customer-auth";
import { db } from "@/lib/db";
import { getPaymentStatusLabel, getPaymentStatusTone } from "@/lib/payment-status";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Akun Saya",
  description:
    "Lihat data akun pelanggan ANSLA dan riwayat order yang sudah terhubung langsung ke akun Anda."
};

type AccountPageProps = {
  searchParams?: {
    status?: string;
    message?: string;
  };
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const session = await requireCustomerSession();
  const [customer, orders] = await Promise.all([
    db.customerUser.findUnique({
      where: { id: session.sub }
    }),
    db.order.findMany({
      where: { customerUserId: session.sub },
      orderBy: { createdAt: "desc" },
      take: 8
    })
  ]);

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="surface-panel p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-eyebrow">Akun pelanggan</p>
              <h1 className="mt-3 text-4xl">Halo, {session.name}</h1>
              <p className="mt-3 max-w-2xl">
                Akun ini dibuat untuk memudahkan repeat order dan merapikan identitas belanja Anda,
                tanpa mengubah alur checkout cepat yang sudah ada di ANSLA.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="outline">
                <Link href="/products">
                  Lihat Koleksi
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <form action={customerLogoutAction}>
                <Button type="submit" variant="ghost" className="w-full sm:w-auto">
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </Button>
              </form>
            </div>
          </div>

          <StatusBanner
            className="mt-5"
            status={searchParams?.status}
            message={searchParams?.message}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-6">
            <div className="surface-panel p-6 sm:p-8">
              <div className="flex items-center gap-3 text-stone-900">
                <UserRound className="h-5 w-5" />
                <h2 className="text-2xl">Profil Singkat</h2>
              </div>
              <div className="mt-5 grid gap-4">
                <div className="rounded-[1.25rem] border border-stone-200/80 bg-white/80 p-4">
                  <p className="text-sm uppercase tracking-[0.22em] text-stone-500">Nama</p>
                  <p className="mt-2 text-lg text-stone-900">{customer?.name || session.name}</p>
                </div>
                <div className="rounded-[1.25rem] border border-stone-200/80 bg-white/80 p-4">
                  <p className="text-sm uppercase tracking-[0.22em] text-stone-500">Email</p>
                  <p className="mt-2 text-lg text-stone-900">{session.email}</p>
                </div>
                <div className="rounded-[1.25rem] border border-stone-200/80 bg-white/80 p-4">
                  <p className="text-sm uppercase tracking-[0.22em] text-stone-500">WhatsApp</p>
                  <p className="mt-2 text-lg text-stone-900">{customer?.phone || "-"}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="insight-card p-5">
                <div className="flex items-center gap-3 text-stone-900">
                  <ShoppingBag className="h-4 w-4" />
                  <p className="text-sm uppercase tracking-[0.24em] text-stone-500">
                    Total order
                  </p>
                </div>
                <p className="mt-3 text-4xl text-stone-900">{orders.length}</p>
                <p className="mt-1 text-sm">Order yang sudah terhubung ke akun ini.</p>
              </div>
              <div className="insight-card p-5">
                <div className="flex items-center gap-3 text-stone-900">
                  <Package className="h-4 w-4" />
                  <p className="text-sm uppercase tracking-[0.24em] text-stone-500">
                    Total belanja
                  </p>
                </div>
                <p className="mt-3 text-2xl text-stone-900">{formatCurrency(totalSpent)}</p>
                <p className="mt-1 text-sm">Akumulasi dari order yang tersimpan.</p>
              </div>
            </div>
          </div>

          <div className="surface-panel p-6 sm:p-8">
            <div className="flex items-center gap-3 text-stone-900">
              <Clock3 className="h-5 w-5" />
              <h2 className="text-2xl">Riwayat Order</h2>
            </div>
            <p className="mt-3 max-w-2xl">
              Riwayat ini sekarang membaca order yang tersambung langsung ke akun pelanggan Anda,
              jadi repeat order dan pelacakan ke depan akan lebih akurat.
            </p>

            {orders.length === 0 ? (
              <div className="mt-6 rounded-[1.5rem] border border-dashed border-stone-300 bg-white/70 p-6">
                <p className="text-lg text-stone-900">Belum ada order yang tercatat.</p>
                <p className="mt-2 text-stone-600">
                  Setelah Anda checkout saat login ke akun ini, riwayatnya akan muncul di sini.
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Button asChild>
                    <Link href="/products">Mulai Belanja</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/contact">
                      <Phone className="mr-2 h-4 w-4" />
                      Tanya Tim ANSLA
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-[1.5rem] border border-stone-200/80 bg-white/80 p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-lg text-stone-900">{order.orderNumber}</p>
                        <p className="text-sm text-stone-500">
                          {formatDate(order.createdAt)} | {order.customerName}
                        </p>
                      </div>
                      <div className="flex flex-col items-start gap-2 sm:items-end">
                        <span className="rounded-full border border-stone-200 bg-stone-100 px-3 py-1 text-xs uppercase tracking-[0.18em] text-stone-600">
                          {order.status}
                        </span>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] ${getPaymentStatusTone(
                            order.paymentStatus
                          )}`}
                        >
                          {getPaymentStatusLabel(order.paymentStatus)}
                        </span>
                        <p className="text-lg text-stone-900">{formatCurrency(order.total)}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-stone-600">
                      {order.city}, {order.province} | {order.paymentMethod}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
