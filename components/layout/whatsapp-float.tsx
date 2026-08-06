import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { siteConfig } from "@/lib/site";
import { buildWhatsAppLink } from "@/lib/utils";

export function WhatsAppFloat() {
  return (
    <Link
      href={buildWhatsAppLink(
        siteConfig.whatsappNumber,
        "Assalamu'alaikum, saya ingin dibantu pilih koleksi ANSLA yang cocok untuk saya."
      )}
      target="_blank"
      aria-label="Konsultasi via WhatsApp"
      className="fixed bottom-6 right-4 z-45 flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full bg-stone-900 px-4 py-3 text-xs font-semibold text-white shadow-lg backdrop-blur transition-all duration-200 hover:scale-105 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white sm:bottom-8 sm:right-6 sm:gap-2.5 sm:px-5 sm:text-sm"
    >
      <MessageCircle className="h-4 w-4 shrink-0" />
      <span>Butuh Bantuan?</span>
    </Link>
  );
}
