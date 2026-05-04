"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="surface-panel max-w-lg p-8 text-center">
          <p className="section-eyebrow">Terjadi kendala</p>
          <h1 className="mt-3 text-4xl">Aplikasi belum bisa dimuat</h1>
          <p className="mt-3">{error.message || "Silakan coba lagi beberapa saat lagi."}</p>
          <Button className="mt-6" onClick={reset}>
            Coba Lagi
          </Button>
        </div>
      </body>
    </html>
  );
}
