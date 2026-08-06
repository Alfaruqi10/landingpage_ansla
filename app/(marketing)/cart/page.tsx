import type { Metadata } from "next";

import { CartPageClient } from "@/components/cart/cart-page-client";
import { PageHero } from "@/components/shared/page-hero";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Keranjang",
  description: "Periksa produk pilihan Anda sebelum lanjut checkout atau order lewat WhatsApp."
};

export default function CartPage() {
  return (
    <>
      <PageHero
        eyebrow="Keranjang"
        title="Review pilihan belanja Anda"
        description="Periksa produk, jumlah, dan subtotal sebelum lanjut ke checkout web atau order via WhatsApp."
      />
      <section className="pb-20">
        <div className="container">
          <CartPageClient whatsappNumber={siteConfig.whatsappNumber} />
        </div>
      </section>
    </>
  );
}
