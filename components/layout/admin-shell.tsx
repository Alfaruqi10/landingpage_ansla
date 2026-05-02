import { logoutAction } from "@/lib/actions/auth-actions";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { type SessionPayload } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export function AdminShell({
  session,
  children
}: {
  session: SessionPayload;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background/90">
      <div className="container py-6">
        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <AdminSidebar />
          <div className="space-y-6">
            <header className="surface-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="section-eyebrow">Sesi admin</p>
                <h1 className="mt-2 text-3xl">Selamat datang, {session.name}</h1>
                <p className="mt-1 text-sm">{session.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <form action={logoutAction}>
                  <Button type="submit" variant="outline">
                    Keluar
                  </Button>
                </form>
              </div>
            </header>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
