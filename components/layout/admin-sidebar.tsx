"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgePercent,
  CreditCard,
  LayoutDashboard,
  Layers3,
  Mail,
  MessageSquareQuote,
  Package,
  PanelsTopLeft,
  ShoppingBag,
  Users
} from "lucide-react";

import { SiteLogo } from "@/components/layout/site-logo";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { href: "/admin", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produk", icon: Package },
  { href: "/admin/orders", label: "Pesanan", icon: ShoppingBag },
  { href: "/admin/customers", label: "Akun Pelanggan", icon: Users },
  { href: "/admin/categories", label: "Collections", icon: PanelsTopLeft },
  { href: "/admin/vouchers", label: "Voucher", icon: BadgePercent },
  { href: "/admin/checkout-settings", label: "Checkout", icon: CreditCard },
  { href: "/admin/testimonials", label: "Testimoni", icon: MessageSquareQuote },
  { href: "/admin/faqs", label: "FAQs", icon: Layers3 },
  { href: "/admin/banners", label: "Banner", icon: PanelsTopLeft },
  { href: "/admin/leads", label: "Leads & Pesan", icon: Mail }
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="surface-panel h-fit p-4">
      <div className="px-3 py-2">
        <SiteLogo admin className="w-fit" />
        <p className="mt-3 text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          CMS Dashboard
        </p>
        <p className="mt-2 text-sm">Simple admin area untuk landing page dan katalog.</p>
      </div>
      <nav className="mt-4 grid gap-2">
        {adminNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-muted-foreground transition hover:bg-stone-100 hover:text-foreground",
              pathname === item.href && "bg-stone-900 text-white hover:bg-stone-900 hover:text-white"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
