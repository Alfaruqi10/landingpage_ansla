import { KeyRound, ShoppingBag, UserRound } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBanner } from "@/components/shared/status-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteCustomerAccountAction,
  updateCustomerAccountAction
} from "@/lib/actions/admin-actions";
import { getAdminCustomersPageData } from "@/lib/data/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

type AdminCustomersPageProps = {
  searchParams?: {
    status?: string;
    message?: string;
  };
};

export default async function AdminCustomersPage({
  searchParams
}: AdminCustomersPageProps) {
  const customers = await getAdminCustomersPageData();
  const customersWithOrders = customers.filter((customer) => customer._count.orders > 0).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Akun Pelanggan"
        title="Kelola akun pelanggan yang sudah terdaftar"
        description="Lihat data dasar customer, cek ringkasan order terakhir, dan bantu update akun saat pelanggan mengalami kendala."
      />

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Total akun</p>
              <p className="mt-1 text-3xl font-semibold text-foreground">{customers.length}</p>
            </div>
            <UserRound className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Pernah order</p>
              <p className="mt-1 text-3xl font-semibold text-foreground">{customersWithOrders}</p>
            </div>
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Butuh bantuan password</p>
              <p className="mt-1 text-3xl font-semibold text-foreground">Manual</p>
            </div>
            <KeyRound className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <StatusBanner status={searchParams?.status} message={searchParams?.message} />

      <div className="space-y-4">
        {customers.length > 0 ? (
          customers.map((customer) => {
            const latestOrder = customer.orders[0];

            return (
              <details
                key={customer.id}
                className="group overflow-hidden rounded-[1.5rem] border border-border bg-[hsl(var(--card)/0.9)] shadow-soft"
              >
                <summary className="flex cursor-pointer list-none flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-lg font-semibold text-foreground">
                        {customer.name}
                      </p>
                      <Badge variant="secondary">{customer._count.orders} pesanan</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{customer.email}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {customer.phone || "Nomor WhatsApp belum diisi"}
                    </p>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p>Bergabung {formatDate(customer.createdAt)}</p>
                    {latestOrder ? (
                      <p className="mt-1">
                        Order terakhir {latestOrder.orderNumber} - {formatCurrency(latestOrder.total)}
                      </p>
                    ) : (
                      <p className="mt-1">Belum ada order</p>
                    )}
                  </div>
                </summary>

                <div className="border-t border-border/70 px-5 py-5">
                  {latestOrder ? (
                    <div className="mb-4 rounded-[1.25rem] border border-border/70 bg-background/55 p-4 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">Ringkasan order terakhir</p>
                      <p className="mt-2">Nomor order: {latestOrder.orderNumber}</p>
                      <p className="mt-1">Status: {latestOrder.status}</p>
                      <p className="mt-1">Tanggal: {formatDate(latestOrder.createdAt)}</p>
                      <p className="mt-1">Total: {formatCurrency(latestOrder.total)}</p>
                    </div>
                  ) : null}

                  <form action={updateCustomerAccountAction} className="space-y-4">
                    <input type="hidden" name="redirectTo" value="/admin/customers" />
                    <input type="hidden" name="id" value={customer.id} />

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor={`customer-name-${customer.id}`}>Nama</Label>
                        <Input
                          id={`customer-name-${customer.id}`}
                          name="name"
                          defaultValue={customer.name}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`customer-email-${customer.id}`}>Email</Label>
                        <Input
                          id={`customer-email-${customer.id}`}
                          name="email"
                          type="email"
                          defaultValue={customer.email}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`customer-phone-${customer.id}`}>WhatsApp</Label>
                        <Input
                          id={`customer-phone-${customer.id}`}
                          name="phone"
                          defaultValue={customer.phone ?? ""}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`customer-password-${customer.id}`}>
                          Password baru
                        </Label>
                        <Input
                          id={`customer-password-${customer.id}`}
                          name="newPassword"
                          type="password"
                          placeholder="Kosongkan jika tidak diubah"
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                      <Button type="submit">Simpan Perubahan</Button>
                    </div>
                  </form>

                  <form action={deleteCustomerAccountAction} className="mt-3">
                    <input type="hidden" name="redirectTo" value="/admin/customers" />
                    <input type="hidden" name="id" value={customer.id} />
                    <Button type="submit" variant="destructive">
                      Hapus Akun
                    </Button>
                  </form>
                </div>
              </details>
            );
          })
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">
                Belum ada akun pelanggan yang terdaftar.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
