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
      <div className="container grid gap-8 py-10 sm:gap-10 sm:py-12 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <SiteLogo className="w-fit" />
          <p className="mt-3 max-w-xl text-sm leading-7 sm:text-base">
            Koleksi abaya dan modestwear yang membantu Anda tampil rapi, lembut, dan nyaman
            dipakai untuk aktivitas harian maupun acara spesial.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 sm:mt-6">
            {socialItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                target="_blank"
                aria-label={item.label}
                title={item.label}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border/80 text-muted-foreground transition hover:border-foreground/30 hover:text-foreground"
              >
                <item.icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Navigasi
            </p>
            <div className="mt-3 grid gap-3 sm:mt-4">
              {siteConfig.navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-foreground sm:text-base"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Kontak
            </p>
            <div className="mt-3 grid gap-3 text-sm text-muted-foreground sm:mt-4 sm:text-base">
              <p>{siteConfig.email}</p>
              <p>Bisa konsultasi produk dan ukuran setiap hari lewat WhatsApp.</p>
              <Link href={siteConfig.marketplaceLinks.shopee} target="_blank" className="hover:text-foreground">
                Kunjungi Shopee
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
