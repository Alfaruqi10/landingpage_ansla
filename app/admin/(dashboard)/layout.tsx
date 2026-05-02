import { AdminShell } from "@/components/layout/admin-shell";
import { requireAdminSession } from "@/lib/auth";

export default async function AdminDashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();

  return <AdminShell session={session}>{children}</AdminShell>;
}
