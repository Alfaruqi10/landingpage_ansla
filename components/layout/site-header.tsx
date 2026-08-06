"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, UserRound, X } from "lucide-react";
import { useState } from "react";

import { SiteLogo } from "@/components/layout/site-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import type { CollectionItem } from "@/lib/collections";
import { siteConfig } from "@/lib/site";
import type { SessionPayload } from "@/lib/session";
import { buildWhatsAppLink, cn } from "@/lib/utils";

export function SiteHeader({
  collectionItems,
  customerSession
}: {
  collectionItems: CollectionItem[];
  customerSession: SessionPayload | null;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const accountHref = customerSession ? "/account" : "/login";
  const accountLabel = customerSession ? "Akun Saya" : "Masuk";

  const whatsappLink = buildWhatsAppLink(
    siteConfig.whatsappNumber,
    "Assalamu'alaikum, saya ingin dibantu pilih koleksi ANSLA yang cocok untuk saya."
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="container pt-2.5 sm:pt-3.5">
        <div className="floating-shell mx-auto flex max-w-[1160px] items-center justify-between px-3.5 py-2 sm:px-5 sm:py-2.5">
          <div className="flex min-w-[5.5rem] items-center">
            <SiteLogo compact />
          </div>

          <nav className="hidden items-center gap-7 lg:flex">
            {siteConfig.navItems.map((item) =>
              item.href === "/products" ? (
                <div key={item.href} className="group relative -mb-4 pb-4">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors duration-180 hover:text-foreground",
                      pathname === item.href && "text-foreground font-semibold"
                    )}
                  >
                    {item.label}
                    <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                  </Link>

                  <div className="pointer-events-none absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 rounded-[1.25rem] border border-border/80 bg-[hsl(var(--card)/0.98)] p-3 opacity-0 shadow-soft backdrop-blur transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                    <div className="grid gap-1">
                      {collectionItems.map((collection) => (
                        <Link
                          key={collection.slug}
                          href={`/products?collection=${collection.slug}`}
                          className="rounded-xl px-3.5 py-2.5 text-sm text-muted-foreground transition-colors duration-180 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-foreground"
                        >
                          {collection.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href={item.href}
                  key={item.href}
                  className={cn(
                    "text-sm font-medium text-muted-foreground transition-colors duration-180 hover:text-foreground",
                    pathname === item.href && "text-foreground font-semibold"
                  )}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <ThemeToggle />
            <Button asChild variant="ghost" className="gap-2 px-3.5 h-10 rounded-full">
              <Link href={accountHref}>
                <UserRound className="h-4 w-4" />
                {accountLabel}
              </Link>
            </Button>
            <Button asChild className="px-5 h-10 rounded-full shadow-[0_10px_24px_rgba(32,24,17,0.14)]">
              <Link href={whatsappLink} target="_blank">
                Konsultasi WhatsApp
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle compact />
            <button
              type="button"
              onClick={() => setIsOpen((value) => !value)}
              aria-expanded={isOpen}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200/80 bg-white/80 text-stone-700 dark:border-white/15 dark:bg-stone-900/60 dark:text-stone-200 shadow-sm"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="container lg:hidden"
          >
            <div className="floating-shell mx-auto mt-3 max-w-[1160px] p-4">
              <div className="grid gap-2">
                {siteConfig.navItems.map((item) => (
                  item.href === "/products" ? (
                    <details
                      key={item.href}
                      className="rounded-2xl border border-border/70 bg-[hsl(var(--background)/0.55)]"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-stone-700">
                        <span>{item.label}</span>
                        <ChevronDown className="h-4 w-4" />
                      </summary>
                      <div className="grid gap-1 border-t border-border/70 px-3 py-3">
                        <Link
                          href="/products"
                          className="rounded-2xl px-4 py-3 text-sm text-stone-700 hover:bg-stone-100"
                          onClick={() => setIsOpen(false)}
                        >
                          Semua Koleksi
                        </Link>
                        {collectionItems.map((collection) => (
                          <Link
                            key={collection.slug}
                            href={`/products?collection=${collection.slug}`}
                            className="rounded-2xl px-4 py-3 text-sm text-stone-700 hover:bg-stone-100"
                            onClick={() => setIsOpen(false)}
                          >
                            {collection.label}
                          </Link>
                        ))}
                      </div>
                    </details>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-2xl px-4 py-3 text-stone-700 hover:bg-stone-100"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )
                ))}
              </div>
              <div className="mt-4 grid gap-3">
                <div className="flex justify-center">
                  <ThemeToggle />
                </div>
                <Button asChild className="w-full">
                  <Link href={accountHref} onClick={() => setIsOpen(false)}>
                    {accountLabel}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href={whatsappLink} target="_blank" onClick={() => setIsOpen(false)}>
                    Konsultasi WhatsApp
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
