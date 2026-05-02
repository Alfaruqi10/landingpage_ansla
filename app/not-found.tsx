import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-screen items-center justify-center py-24">
      <div className="surface-panel max-w-lg p-10 text-center">
        <p className="section-eyebrow">404</p>
        <h1 className="mt-3 text-4xl">Halaman tidak ditemukan</h1>
        <p className="mt-3">
          Produk atau halaman yang Anda cari mungkin sudah dipindahkan atau belum tersedia.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
      </div>
    </div>
  );
}
