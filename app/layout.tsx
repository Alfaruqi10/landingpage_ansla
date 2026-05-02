import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Suspense } from "react";

import "@/app/globals.css";
import { SearchParamStatusToast } from "@/components/shared/search-param-status-toast";
import { ThemeScript } from "@/components/theme/theme-script";
import { siteConfig } from "@/lib/site";

const fontSans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const fontDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Abaya dan Modestwear Premium`,
    template: `%s | ${siteConfig.shortName}`
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | Abaya dan Modestwear Premium`,
    description: siteConfig.description
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Abaya dan Modestwear Premium`,
    description: siteConfig.description
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${fontSans.variable} ${fontDisplay.variable} min-h-screen bg-background font-sans text-foreground antialiased transition-colors duration-300`}
      >
        <Suspense fallback={null}>
          <SearchParamStatusToast />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
