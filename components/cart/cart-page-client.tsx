"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";

import { CartItem, getCartItemKey, useCart } from "@/components/cart/cart-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { QuantityPicker } from "@/components/shared/quantity-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildWhatsAppLink, formatCurrency } from "@/lib/utils";

function buildCartWhatsappMessage(items: CartItem[]) {
  const lines = [
    "Assalamu'alaikum, saya ingin dibantu order produk ANSLA berikut.",
    "",
    ...items.flatMap((item, index) => [
      `${index + 1}. ${item.productName}`,
      item.variantName ? `   Varian: ${item.variantName}` : null,
      item.size ? `   Ukuran: ${item.size}` : null,
      `   Jumlah: ${item.quantity}`,
      `   Harga: ${formatCurrency(item.unitPrice)}`,
      `   Subtotal: ${formatCurrency(item.lineTotal)}`,
      ""
    ]),
    `Total sementara: ${formatCurrency(items.reduce((sum, item) => sum + item.lineTotal, 0))}`
  ];

  return lines.filter(Boolean).join("\n");
}

export function CartPageClient({ whatsappNumber }: { whatsappNumber: string }) {
  const { isReady, items, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  if (!isReady) {
    return <div className="surface-panel p-8">Menyiapkan keranjang...</div>;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Keranjang masih kosong"
        description="Tambahkan produk dulu dari halaman detail agar bisa lanjut checkout web atau order via WhatsApp."
        action={
          <Button asChild>
            <Link href="/products">Lihat Koleksi</Link>
          </Button>
        }
      />
    );
  }

  const whatsappLink = buildWhatsAppLink(whatsappNumber, buildCartWhatsappMessage(items));

  return (
    <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-4">
        {items.map((item) => {
          const itemKey = getCartItemKey(item);

          return (
            <div
              key={itemKey}
              className="surface-panel flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-4">
                <Image
                  src={item.imageUrl}
                  alt={item.productName}
                  width={80}
                  height={96}
                  className="h-24 w-20 rounded-[1rem] object-cover"
                />
                <div className="min-w-0">
                  <p className="text-xl text-foreground">{item.productName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.productSlug}</p>
                  {item.variantName || item.size ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {item.variantName ? (
                        <Badge variant="secondary" className="rounded-full">
                          {item.variantName}
                        </Badge>
                      ) : null}
                      {item.size ? (
                        <Badge variant="outline" className="rounded-full">
                          {item.size}
                        </Badge>
                      ) : null}
                    </div>
                  ) : null}
                  <p className="mt-3 font-medium text-foreground">
                    {formatCurrency(item.unitPrice)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-start gap-4 sm:items-end">
                <QuantityPicker
                  value={item.quantity}
                  onChange={(quantity) => updateQuantity(itemKey, quantity)}
                />
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(item.lineTotal)}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  className="px-0 text-rose-500 hover:bg-transparent hover:text-rose-600"
                  onClick={() => removeItem(itemKey)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="xl:sticky xl:top-28">
        <div className="surface-panel space-y-5 p-6 sm:p-8">
          <p className="section-eyebrow">Ringkasan checkout</p>
          <h2 className="text-3xl">Siap lanjut ke checkout</h2>
          <div className="rounded-[1.4rem] border border-border/70 bg-[hsl(var(--background)/0.45)] p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Total item</span>
              <span className="font-medium text-foreground">{items.length} produk</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-xl font-semibold text-foreground">
                {formatCurrency(subtotal)}
              </span>
            </div>
          </div>

          <div className="grid gap-3">
            <Button asChild size="lg" className="h-12">
              <Link href="/checkout?mode=cart">Checkout via Website</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 border-emerald-500/50 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
            >
              <Link href={whatsappLink} target="_blank">
                Tanya via WhatsApp
              </Link>
            </Button>
            <Button type="button" variant="ghost" onClick={clearCart}>
              Kosongkan Keranjang
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
