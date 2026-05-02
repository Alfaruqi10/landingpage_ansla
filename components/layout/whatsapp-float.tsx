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
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-stone-900 px-4 py-3 text-xs font-medium text-white shadow-soft transition hover:bg-stone-800 sm:bottom-5 sm:right-5 sm:gap-3 sm:px-5 sm:text-sm"
    >
      <MessageCircle className="h-4 w-4" />
      <span className="hidden sm:inline">Butuh Bantuan?</span>
    </Link>
  );
}
