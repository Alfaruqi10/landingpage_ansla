import Link from "next/link";
import { Facebook, Instagram, Music2, Store } from "lucide-react";

import { SiteLogo } from "@/components/layout/site-logo";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  const socialItems = [
    {
      label: "Instagram",
      href: siteConfig.socialLinks.instagram,
      icon: Instagram
    },
    {
      label: "TikTok",
      href: siteConfig.socialLinks.tiktok,
      icon: Music2
    },
    {
      label: "Facebook",
      href: siteConfig.socialLinks.facebook,
      icon: Facebook
    },
    {
      label: "Shopee",
      href: siteConfig.marketplaceLinks.shopee,
      icon: Store
    }
  ];

  return (
    <footer className="border-t border-border/70 bg-[hsl(var(--card)/0.72)]">
      <div className="container grid gap-8 py-8 sm:gap-10 sm:py-10 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <SiteLogo className="w-fit" />
          <p className="mt-3 max-w-xl text-sm leading-6 sm:text-base text-muted-foreground">
            Koleksi abaya dan modestwear yang membantu Anda tampil rapi, lembut, dan nyaman
            dipakai untuk aktivitas harian maupun acara spesial.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5 sm:mt-5">
            {socialItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                target="_blank"
                aria-label={item.label}
                title={item.label}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border/80 text-muted-foreground transition-all duration-180 hover:border-foreground/40 hover:text-foreground hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <item.icon className="h-4.5 w-4.5" />
              </Link>
            ))}
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Navigasi
            </p>
            <div className="mt-3 grid gap-2.5 sm:mt-4">
              {siteConfig.navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground transition-colors duration-180 hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Kontak
            </p>
            <div className="mt-3 grid gap-2.5 text-sm text-muted-foreground sm:mt-4">
              <p>{siteConfig.email}</p>
              <p>Bisa konsultasi produk dan ukuran setiap hari lewat WhatsApp.</p>
              <Link href={siteConfig.marketplaceLinks.shopee} target="_blank" className="font-medium text-foreground underline-offset-4 hover:underline">
                Kunjungi Shopee
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
