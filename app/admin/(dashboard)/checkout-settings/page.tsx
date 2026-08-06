import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBanner } from "@/components/shared/status-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteBankAccountAction,
  deletePaymentMethodAction,
  deleteShippingMethodAction,
  upsertBankAccountAction,
  upsertPaymentMethodAction,
  upsertShippingMethodAction
} from "@/lib/actions/admin-actions";
import { getAdminCheckoutSettingsPageData } from "@/lib/data/admin";
import { formatCurrency } from "@/lib/utils";

type AdminCheckoutSettingsPageProps = {
  searchParams?: {
    status?: string;
    message?: string;
  };
};

const inputClassName = "mt-2";
const selectClassName =
  "mt-2 flex h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-900 shadow-sm";

function activeBadge(isActive: boolean) {
  return (
    <Badge variant={isActive ? "default" : "outline"}>
      {isActive ? "Aktif" : "Nonaktif"}
    </Badge>
  );
}

function FormStatusToggle({
  name,
  defaultChecked,
  label
}: {
  name: string;
  defaultChecked?: boolean;
  label: string;
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-dashed border-stone-300 p-4 text-sm text-stone-700">
      <input type="checkbox" name={name} className="h-4 w-4" defaultChecked={defaultChecked} />
      {label}
    </label>
  );
}

export default async function AdminCheckoutSettingsPage({
  searchParams
}: AdminCheckoutSettingsPageProps) {
  const { hasDatabaseSettings, shippingMethods, paymentMethods, bankAccounts } =
    await getAdminCheckoutSettingsPageData();
  const transferPaymentMethods = paymentMethods.filter(
    (method) => method.type === "BANK_TRANSFER" || method.value === "Transfer Bank"
  );

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Checkout"
        title="Pengaturan Checkout"
        description="Kelola metode pengiriman, metode pembayaran, dan rekening tujuan supaya pilihan di checkout bisa diedit dari admin."
      />
      <StatusBanner status={searchParams?.status} message={searchParams?.message} />

      {!hasDatabaseSettings ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Tabel pengaturan checkout belum tersedia di database. Data default tetap dipakai di
          storefront, tetapi simpan perubahan baru akan aktif setelah migrasi database dijalankan.
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Tambah Metode Pengiriman</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={upsertShippingMethodAction} className="grid gap-4 lg:grid-cols-2">
            <input type="hidden" name="redirectTo" value="/admin/checkout-settings" />
            <div>
              <Label htmlFor="new-shipping-name">Nama Sistem</Label>
              <Input
                id="new-shipping-name"
                name="name"
                className={inputClassName}
                placeholder="Kurir Reguler"
              />
            </div>
            <div>
              <Label htmlFor="new-shipping-label">Label Checkout</Label>
              <Input
                id="new-shipping-label"
                name="label"
                className={inputClassName}
                placeholder="Kurir Reguler"
              />
            </div>
            <div>
              <Label htmlFor="new-shipping-price">Biaya Ongkir</Label>
              <Input
                id="new-shipping-price"
                name="price"
                type="number"
                min="0"
                className={inputClassName}
                defaultValue={0}
              />
            </div>
            <div>
              <Label htmlFor="new-shipping-order">Urutan</Label>
              <Input
                id="new-shipping-order"
                name="sortOrder"
                type="number"
                min="0"
                className={inputClassName}
                defaultValue={10}
              />
            </div>
            <div className="lg:col-span-2">
              <Label htmlFor="new-shipping-description">Catatan Internal</Label>
              <Input
                id="new-shipping-description"
                name="description"
                className={inputClassName}
                placeholder="Estimasi pengiriman standar untuk pesanan ANSLA."
              />
            </div>
            <div className="lg:col-span-2">
              <FormStatusToggle name="isActive" defaultChecked label="Tampilkan di checkout" />
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              Simpan Pengiriman
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {shippingMethods.map((method) => (
          <Card key={method.id || method.value}>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>{method.label}</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  {method.value} - {formatCurrency(method.price)}
                </p>
              </div>
              {activeBadge(method.isActive)}
            </CardHeader>
            <CardContent className="space-y-4">
              <form action={upsertShippingMethodAction} className="grid gap-4 lg:grid-cols-2">
                <input type="hidden" name="redirectTo" value="/admin/checkout-settings" />
                {method.id ? <input type="hidden" name="id" value={method.id} /> : null}
                <div>
                  <Label htmlFor={`shipping-name-${method.id || method.value}`}>
                    Nama Sistem
                  </Label>
                  <Input
                    id={`shipping-name-${method.id || method.value}`}
                    name="name"
                    defaultValue={method.value}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <Label htmlFor={`shipping-label-${method.id || method.value}`}>
                    Label Checkout
                  </Label>
                  <Input
                    id={`shipping-label-${method.id || method.value}`}
                    name="label"
                    defaultValue={method.label}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <Label htmlFor={`shipping-price-${method.id || method.value}`}>
                    Biaya Ongkir
                  </Label>
                  <Input
                    id={`shipping-price-${method.id || method.value}`}
                    name="price"
                    type="number"
                    min="0"
                    defaultValue={method.price}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <Label htmlFor={`shipping-order-${method.id || method.value}`}>Urutan</Label>
                  <Input
                    id={`shipping-order-${method.id || method.value}`}
                    name="sortOrder"
                    type="number"
                    min="0"
                    defaultValue={method.sortOrder}
                    className={inputClassName}
                  />
                </div>
                <div className="lg:col-span-2">
                  <Label htmlFor={`shipping-description-${method.id || method.value}`}>
                    Catatan Internal
                  </Label>
                  <Input
                    id={`shipping-description-${method.id || method.value}`}
                    name="description"
                    defaultValue={method.description || ""}
                    className={inputClassName}
                  />
                </div>
                <div className="lg:col-span-2">
                  <FormStatusToggle
                    name="isActive"
                    defaultChecked={method.isActive}
                    label="Tampilkan di checkout"
                  />
                </div>
                <Button type="submit" className="w-full sm:w-auto">
                  Update Pengiriman
                </Button>
              </form>
              <form action={deleteShippingMethodAction}>
                <input type="hidden" name="redirectTo" value="/admin/checkout-settings" />
                <input type="hidden" name="id" value={method.id || ""} />
                <Button type="submit" variant="destructive" disabled={!method.id}>
                  Hapus Pengiriman
                </Button>
                {!method.id ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Data default belum bisa dihapus sampai migrasi checkout aktif di database.
                  </p>
                ) : null}
              </form>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Metode Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={upsertPaymentMethodAction} className="grid gap-4 lg:grid-cols-2">
            <input type="hidden" name="redirectTo" value="/admin/checkout-settings" />
            <div>
              <Label htmlFor="new-payment-name">Nama Sistem</Label>
              <Input
                id="new-payment-name"
                name="name"
                className={inputClassName}
                placeholder="Transfer Bank"
              />
            </div>
            <div>
              <Label htmlFor="new-payment-label">Label Checkout</Label>
              <Input
                id="new-payment-label"
                name="label"
                className={inputClassName}
                placeholder="Transfer ke Rekening"
              />
            </div>
            <div>
              <Label htmlFor="new-payment-type">Tipe</Label>
              <select id="new-payment-type" name="type" defaultValue="BANK_TRANSFER" className={selectClassName}>
                <option value="BANK_TRANSFER">Transfer Bank</option>
                <option value="QRIS">QRIS</option>
                <option value="COD">COD</option>
                <option value="MANUAL">Manual Lainnya</option>
              </select>
            </div>
            <div>
              <Label htmlFor="new-payment-order">Urutan</Label>
              <Input
                id="new-payment-order"
                name="sortOrder"
                type="number"
                min="0"
                className={inputClassName}
                defaultValue={10}
              />
            </div>
            <div className="lg:col-span-2">
              <Label htmlFor="new-payment-description">Catatan Internal</Label>
              <Input
                id="new-payment-description"
                name="description"
                className={inputClassName}
                placeholder="Pembayaran manual lewat transfer bank."
              />
            </div>
            <div className="lg:col-span-2">
              <FormStatusToggle name="isActive" defaultChecked label="Tampilkan di checkout" />
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              Simpan Pembayaran
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {paymentMethods.map((method) => (
          <Card key={method.id || method.value}>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>{method.label}</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  {method.value} - {method.type}
                </p>
              </div>
              {activeBadge(method.isActive)}
            </CardHeader>
            <CardContent className="space-y-4">
              <form action={upsertPaymentMethodAction} className="grid gap-4 lg:grid-cols-2">
                <input type="hidden" name="redirectTo" value="/admin/checkout-settings" />
                {method.id ? <input type="hidden" name="id" value={method.id} /> : null}
                <div>
                  <Label htmlFor={`payment-name-${method.id || method.value}`}>Nama Sistem</Label>
                  <Input
                    id={`payment-name-${method.id || method.value}`}
                    name="name"
                    defaultValue={method.value}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <Label htmlFor={`payment-label-${method.id || method.value}`}>
                    Label Checkout
                  </Label>
                  <Input
                    id={`payment-label-${method.id || method.value}`}
                    name="label"
                    defaultValue={method.label}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <Label htmlFor={`payment-type-${method.id || method.value}`}>Tipe</Label>
                  <select
                    id={`payment-type-${method.id || method.value}`}
                    name="type"
                    defaultValue={method.type}
                    className={selectClassName}
                  >
                    <option value="BANK_TRANSFER">Transfer Bank</option>
                    <option value="QRIS">QRIS</option>
                    <option value="COD">COD</option>
                    <option value="MANUAL">Manual Lainnya</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor={`payment-order-${method.id || method.value}`}>Urutan</Label>
                  <Input
                    id={`payment-order-${method.id || method.value}`}
                    name="sortOrder"
                    type="number"
                    min="0"
                    defaultValue={method.sortOrder}
                    className={inputClassName}
                  />
                </div>
                <div className="lg:col-span-2">
                  <Label htmlFor={`payment-description-${method.id || method.value}`}>
                    Catatan Internal
                  </Label>
                  <Input
                    id={`payment-description-${method.id || method.value}`}
                    name="description"
                    defaultValue={method.description || ""}
                    className={inputClassName}
                  />
                </div>
                <div className="lg:col-span-2">
                  <FormStatusToggle
                    name="isActive"
                    defaultChecked={method.isActive}
                    label="Tampilkan di checkout"
                  />
                </div>
                <Button type="submit" className="w-full sm:w-auto">
                  Update Pembayaran
                </Button>
              </form>
              <form action={deletePaymentMethodAction}>
                <input type="hidden" name="redirectTo" value="/admin/checkout-settings" />
                <input type="hidden" name="id" value={method.id || ""} />
                <Button type="submit" variant="destructive" disabled={!method.id}>
                  Hapus Pembayaran
                </Button>
                {!method.id ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Data default belum bisa dihapus sampai migrasi checkout aktif di database.
                  </p>
                ) : null}
              </form>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rekening Transfer Bank</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={upsertBankAccountAction} className="grid gap-4 lg:grid-cols-2">
            <input type="hidden" name="redirectTo" value="/admin/checkout-settings" />
            <div>
              <Label htmlFor="new-bank-name">Nama Bank</Label>
              <Input id="new-bank-name" name="bankName" className={inputClassName} placeholder="BCA" />
            </div>
            <div>
              <Label htmlFor="new-bank-method">Metode Pembayaran</Label>
              <select id="new-bank-method" name="paymentMethodId" className={selectClassName}>
                <option value="">Transfer Bank</option>
                {transferPaymentMethods.map((method) =>
                  method.id ? (
                    <option key={method.id} value={method.id}>
                      {method.label}
                    </option>
                  ) : null
                )}
              </select>
            </div>
            <div>
              <Label htmlFor="new-bank-number">Nomor Rekening</Label>
              <Input
                id="new-bank-number"
                name="accountNumber"
                className={inputClassName}
                placeholder="1234567890"
              />
            </div>
            <div>
              <Label htmlFor="new-bank-holder">Atas Nama</Label>
              <Input
                id="new-bank-holder"
                name="accountHolder"
                className={inputClassName}
                placeholder="ANSLA"
              />
            </div>
            <div>
              <Label htmlFor="new-bank-order">Urutan</Label>
              <Input
                id="new-bank-order"
                name="sortOrder"
                type="number"
                min="0"
                defaultValue={10}
                className={inputClassName}
              />
            </div>
            <div>
              <FormStatusToggle name="isActive" defaultChecked label="Rekening aktif" />
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              Simpan Rekening
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {bankAccounts.map((account) => (
          <Card key={account.id || account.bankName}>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>{account.bankName}</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  {account.accountNumber} - a.n. {account.accountHolder}
                </p>
              </div>
              {activeBadge(account.isActive)}
            </CardHeader>
            <CardContent className="space-y-4">
              <form action={upsertBankAccountAction} className="grid gap-4 lg:grid-cols-2">
                <input type="hidden" name="redirectTo" value="/admin/checkout-settings" />
                {account.id ? <input type="hidden" name="id" value={account.id} /> : null}
                <div>
                  <Label htmlFor={`bank-name-${account.id || account.bankName}`}>Nama Bank</Label>
                  <Input
                    id={`bank-name-${account.id || account.bankName}`}
                    name="bankName"
                    defaultValue={account.bankName}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <Label htmlFor={`bank-method-${account.id || account.bankName}`}>
                    Metode Pembayaran
                  </Label>
                  <select
                    id={`bank-method-${account.id || account.bankName}`}
                    name="paymentMethodId"
                    className={selectClassName}
                  >
                    <option value="">Transfer Bank</option>
                    {transferPaymentMethods.map((method) =>
                      method.id ? (
                        <option key={method.id} value={method.id}>
                          {method.label}
                        </option>
                      ) : null
                    )}
                  </select>
                </div>
                <div>
                  <Label htmlFor={`bank-number-${account.id || account.bankName}`}>
                    Nomor Rekening
                  </Label>
                  <Input
                    id={`bank-number-${account.id || account.bankName}`}
                    name="accountNumber"
                    defaultValue={account.accountNumber}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <Label htmlFor={`bank-holder-${account.id || account.bankName}`}>Atas Nama</Label>
                  <Input
                    id={`bank-holder-${account.id || account.bankName}`}
                    name="accountHolder"
                    defaultValue={account.accountHolder}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <Label htmlFor={`bank-order-${account.id || account.bankName}`}>Urutan</Label>
                  <Input
                    id={`bank-order-${account.id || account.bankName}`}
                    name="sortOrder"
                    type="number"
                    min="0"
                    defaultValue={account.sortOrder}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <FormStatusToggle
                    name="isActive"
                    defaultChecked={account.isActive}
                    label="Rekening aktif"
                  />
                </div>
                <Button type="submit" className="w-full sm:w-auto">
                  Update Rekening
                </Button>
              </form>
              <form action={deleteBankAccountAction}>
                <input type="hidden" name="redirectTo" value="/admin/checkout-settings" />
                <input type="hidden" name="id" value={account.id || ""} />
                <Button type="submit" variant="destructive" disabled={!account.id}>
                  Hapus Rekening
                </Button>
                {!account.id ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Data default belum bisa dihapus sampai migrasi checkout aktif di database.
                  </p>
                ) : null}
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
