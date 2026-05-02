import { CartProvider } from "@/components/cart/cart-provider";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { buildCollectionItems } from "@/lib/collections";
import { getCustomerSession } from "@/lib/customer-auth";
import { db } from "@/lib/db";

export default async function MarketingLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      name: true,
      slug: true,
      imageUrl: true
    }
  });
  const collectionItems = buildCollectionItems(categories);
  const customerSession = await getCustomerSession();

  return (
    <CartProvider>
      <SiteHeader collectionItems={collectionItems} customerSession={customerSession} />
      <main className="pt-24 md:pt-28">{children}</main>
      <SiteFooter />
      <WhatsAppFloat />
    </CartProvider>
  );
}
