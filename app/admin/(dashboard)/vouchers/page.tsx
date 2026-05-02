import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBanner } from "@/components/shared/status-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteVoucherAction, upsertVoucherAction } from "@/lib/actions/admin-actions";
import { getAdminVouchersPageData } from "@/lib/data/admin";

type AdminVouchersPageProps = {
  searchParams?: {
    status?: string;
    message?: string;
  };
};

function toDateTimeLocalValue(value?: Date | null) {
  if (!value) {
    return "";
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDiscountLabel(voucher: {
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
}) {
  return voucher.discountType === "PERCENT"
    ? `${voucher.discountValue}%`
    : `Rp ${voucher.discountValue.toLocaleString("id-ID")}`;
}

export default async function AdminVouchersPage({
  searchParams
}: AdminVouchersPageProps) {
  const vouchers = await getAdminVouchersPageData();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Voucher"
        title="Kelola kode promo untuk checkout"
        description="Gunakan voucher untuk first purchase, campaign musiman, atau promo iklan tanpa membuat checkout jadi terlalu rumit."
      />
      <StatusBanner status={searchParams?.status} message={searchParams?.message} />

      <Card>
        <CardHeader>
          <CardTitle>Tambah Voucher Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={upsertVoucherAction} className="grid gap-4">
            <input type="hidden" name="redirectTo" value="/admin/vouchers" />
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <Label htmlFor="new-voucher-code">Kode Voucher</Label>
                <Input
                  id="new-voucher-code"
                  name="code"
                  className="mt-2 uppercase"
                  placeholder="WELCOME10"
                />
              </div>
              <div>
                <Label htmlFor="new-voucher-label">Nama Voucher</Label>
                <Input
                  id="new-voucher-label"
                  name="label"
                  className="mt-2"
                  placeholder="Welcome Offer"
                />
              </div>
              <div>
                <Label htmlFor="new-voucher-type">Tipe Diskon</Label>
                <select
                  id="new-voucher-type"
                  name="discountType"
                  defaultValue="PERCENT"
                  className="mt-2 flex h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-900 shadow-sm"
                >
                  <option value="PERCENT">Persen</option>
                  <option value="FIXED">Nominal</option>
                </select>
              </div>
              <div>
                <Label htmlFor="new-voucher-value">Nilai Diskon</Label>
                <Input
                  id="new-voucher-value"
                  name="discountValue"
                  type="number"
                  min="1"
                  className="mt-2"
                  defaultValue={10}
                />
              </div>
              <div>
                <Label htmlFor="new-voucher-min-purchase">Minimum Belanja</Label>
                <Input
                  id="new-voucher-min-purchase"
                  name="minPurchase"
                  type="number"
                  min="0"
                  className="mt-2"
                  defaultValue={0}
                />
              </div>
              <div>
                <Label htmlFor="new-voucher-usage-limit">Kuota Pakai Total</Label>
                <Input
                  id="new-voucher-usage-limit"
                  name="usageLimit"
                  type="number"
                  min="1"
                  className="mt-2"
                  placeholder="Kosongkan jika tidak dibatasi"
                />
              </div>
              <div>
                <Label htmlFor="new-voucher-starts-at">Mulai Berlaku</Label>
                <Input
                  id="new-voucher-starts-at"
                  name="startsAt"
                  type="datetime-local"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="new-voucher-ends-at">Berakhir Pada</Label>
                <Input
                  id="new-voucher-ends-at"
                  name="endsAt"
                  type="datetime-local"
                  className="mt-2"
                />
              </div>
              <label className="flex items-center gap-3 rounded-2xl border border-dashed border-stone-300 p-4 text-sm text-stone-700 lg:col-span-2">
                <input type="checkbox" name="isActive" className="h-4 w-4" defaultChecked />
                Voucher aktif dan bisa dipakai di checkout
              </label>
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              Simpan Voucher
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-5">
        {vouchers.map((voucher) => (
          <Card key={voucher.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>{voucher.code}</CardTitle>
                <p className="mt-2 text-sm text-stone-500">{voucher.label}</p>
                <p className="mt-1 text-sm text-stone-500">
                  Diskon {formatDiscountLabel(voucher)} · Minimum belanja Rp{" "}
                  {voucher.minPurchase.toLocaleString("id-ID")}
                </p>
                <p className="mt-1 text-sm text-stone-500">
                  Terpakai {voucher.usedCount}
                  {voucher.usageLimit ? ` dari ${voucher.usageLimit}` : " kali"}
                </p>
              </div>
              <Badge variant={voucher.isActive ? "default" : "outline"}>
                {voucher.isActive ? "Aktif" : "Nonaktif"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <form action={upsertVoucherAction} className="grid gap-4">
                <input type="hidden" name="redirectTo" value="/admin/vouchers" />
                <input type="hidden" name="id" value={voucher.id} />
                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <Label htmlFor={`voucher-code-${voucher.id}`}>Kode Voucher</Label>
                    <Input
                      id={`voucher-code-${voucher.id}`}
                      name="code"
                      defaultValue={voucher.code}
                      className="mt-2 uppercase"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`voucher-label-${voucher.id}`}>Nama Voucher</Label>
                    <Input
                      id={`voucher-label-${voucher.id}`}
                      name="label"
                      defaultValue={voucher.label}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`voucher-type-${voucher.id}`}>Tipe Diskon</Label>
                    <select
                      id={`voucher-type-${voucher.id}`}
                      name="discountType"
                      defaultValue={voucher.discountType}
                      className="mt-2 flex h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-900 shadow-sm"
                    >
                      <option value="PERCENT">Persen</option>
                      <option value="FIXED">Nominal</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor={`voucher-value-${voucher.id}`}>Nilai Diskon</Label>
                    <Input
                      id={`voucher-value-${voucher.id}`}
                      name="discountValue"
                      type="number"
                      min="1"
                      defaultValue={voucher.discountValue}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`voucher-min-purchase-${voucher.id}`}>Minimum Belanja</Label>
                    <Input
                      id={`voucher-min-purchase-${voucher.id}`}
                      name="minPurchase"
                      type="number"
                      min="0"
                      defaultValue={voucher.minPurchase}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`voucher-usage-limit-${voucher.id}`}>Kuota Pakai Total</Label>
                    <Input
                      id={`voucher-usage-limit-${voucher.id}`}
                      name="usageLimit"
                      type="number"
                      min="1"
                      defaultValue={voucher.usageLimit || ""}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`voucher-starts-at-${voucher.id}`}>Mulai Berlaku</Label>
                    <Input
                      id={`voucher-starts-at-${voucher.id}`}
                      name="startsAt"
                      type="datetime-local"
                      defaultValue={toDateTimeLocalValue(voucher.startsAt)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`voucher-ends-at-${voucher.id}`}>Berakhir Pada</Label>
                    <Input
                      id={`voucher-ends-at-${voucher.id}`}
                      name="endsAt"
                      type="datetime-local"
                      defaultValue={toDateTimeLocalValue(voucher.endsAt)}
                      className="mt-2"
                    />
                  </div>
                  <label className="flex items-center gap-3 rounded-2xl border border-dashed border-stone-300 p-4 text-sm text-stone-700 lg:col-span-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      className="h-4 w-4"
                      defaultChecked={voucher.isActive}
                    />
                    Voucher aktif dan bisa dipakai di checkout
                  </label>
                </div>
                <Button type="submit" className="w-full sm:w-auto">
                  Update Voucher
                </Button>
              </form>

              <form action={deleteVoucherAction}>
                <input type="hidden" name="redirectTo" value="/admin/vouchers" />
                <input type="hidden" name="id" value={voucher.id} />
                <Button type="submit" variant="destructive">
                  Hapus Voucher
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
