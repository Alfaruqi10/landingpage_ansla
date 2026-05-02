import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function SiteLogo({
  compact = false,
  forceLight = false,
  admin = false,
  className
}: {
  compact?: boolean;
  forceLight?: boolean;
  admin?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label="ANSLA Home"
      className={cn("inline-flex items-center", className)}
    >
      <Image
        src="/ansla-logo-user-cropped.png"
        alt="ANSLA logo"
        width={compact ? 90 : admin ? 170 : 132}
        height={compact ? 108 : admin ? 202 : 158}
        className={cn(
          "h-auto w-auto object-contain transition",
          forceLight ? "brightness-0 invert" : "brightness-0 dark:invert",
          compact
            ? "max-h-12 sm:max-h-14"
            : admin
              ? "max-h-24 sm:max-h-28"
              : "max-h-20 sm:max-h-24"
        )}
        priority
      />
    </Link>
  );
}
