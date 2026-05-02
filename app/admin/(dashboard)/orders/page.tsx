import Image from "next/image";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBanner } from "@/components/shared/status-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateOrderStatusAction } from "@/lib/actions/admin-actions";
import { getAdminOrdersPageData } from "@/lib/data/admin";
import { getPaymentStatusLabel, getPaymentStatusTone } from "@/lib/payment-status";
import { appendQueryString, formatCurrency, formatDate } from "@/lib/utils";

const orderStatusOptions = [
  "Pesanan Baru",
  "Menunggu Pembayaran",
  "Menunggu Verifikasi Pembayaran",
  "Lunas",
  "Diproses",
  "Dikirim",
  "Selesai",
  "Dibatalkan"
] as const;

const orderStatusSelectClassName =
  "h-10 rounded-full border border-border/70 bg-background px-4 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

type OrderItemWithSizeLabel = {
  id: string;
  imageUrl: string;
  productName: string;
  variantName?: string | null;
  sizeLabel?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

function parseOrderItemLabels(item: OrderItemWithSizeLabel) {
  if (item.sizeLabel) {
    return {
      variantName: item.variantName || "",
      sizeLabel: item.sizeLabel
    };
  }

  const rawVariantName = item.variantName?.trim() || "";

  if (!rawVariantName.includes("|||")) {
    return {
      variantName: rawVariantName,
      sizeLabel: ""
    };
  }

  const [variantPart = "", sizePart = ""] = rawVariantName.split("|||").map((part) => part.trim());

  return {
    variantName: variantPart === "SIZE_ONLY" ? "" : variantPart,
    sizeLabel: sizePart
  };
}

function parseOrderNotes(notes?: string | null) {
  const rawNotes = notes?.trim() || "";

  if (!rawNotes) {
    return {
      customerNote: "",
      paymentProofUrl: ""
    };
  }

  const proofMatch = rawNotes.match(/\[\[payment_proof:(.+?)\]\]/);
  const paymentProofUrl = proofMatch?.[1]?.trim() || "";
  const customerNote = rawNotes.replace(/\[\[payment_proof:(.+?)\]\]/g, "").trim();

  return {
    customerNote,
    paymentProofUrl
  };
}

function buildOrderFilterHref(filterStatus?: string) {
  return appendQueryString("/admin/orders", {
    filterStatus: filterStatus || undefined
  });
}

function getStatusBadgeTone(status: string) {
  if (status === "Lunas" || status === "Selesai") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "Menunggu Pembayaran" || status === "Menunggu Verifikasi Pembayaran") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (status === "Diproses" || status === "Dikirim") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  if (status === "Dibatalkan") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-stone-200 bg-stone-100 text-stone-700";
}

function getQuickActionStatuses(status: string) {
  switch (status) {
    case "Menunggu Pembayaran":
      return ["Menunggu Verifikasi Pembayaran", "Lunas", "Dibatalkan"];
    case "Menunggu Verifikasi Pembayaran":
      return ["Lunas", "Dibatalkan"];
    case "Pesanan Baru":
      return ["Diproses", "Dibatalkan"];
    case "Lunas":
      return ["Diproses", "Dibatalkan"];
    case "Diproses":
      return ["Dikirim", "Dibatalkan"];
    case "Dikirim":
      return ["Selesai"];
    default:
      return [];
  }
}

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams?: {
    status?: string;
    message?: string;
    filterStatus?: string;
  };
}) {
  const orders = await getAdminOrdersPageData();
  const activeFilterStatus =
    orderStatusOptions.find((status) => status === searchParams?.filterStatus) || "";
  const filteredOrders = activeFilterStatus
    ? orders.filter((order) => order.status === activeFilterStatus)
    : orders;
  const statusCounts = orderStatusOptions.reduce<Record<string, number>>((accumulator, status) => {
    accumulator[status] = orders.filter((order) => order.status === status).length;
    return accumulator;
  }, {});

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Pesanan"
        title="Pantau checkout web yang masuk"
        description="Semua order dari checkout website tampil di sini beserta item, alamat, metode pengiriman, pembayaran, voucher, dan status prosesnya."
      />

      <StatusBanner status={searchParams?.status} message={searchParams?.message} />

      <div className="surface-panel p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Filter status pesanan</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Fokuskan daftar order yang sedang perlu dicek atau diproses.
            </p>
          </div>
          <Badge variant="secondary">
            {filteredOrders.length} order
            {activeFilterStatus ? ` | ${activeFilterStatus}` : ""}
          </Badge>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild size="sm" variant={activeFilterStatus ? "outline" : "default"}>
            <Link href={buildOrderFilterHref()}>Semua ({orders.length})</Link>
          </Button>
          {orderStatusOptions.map((status) => (
            <Button
              key={status}
              asChild
              size="sm"
              variant={activeFilterStatus === status ? "default" : "outline"}
            >
              <Link href={buildOrderFilterHref(status)}>
                {status} ({statusCounts[status] || 0})
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <div className="space-y-5">
          {filteredOrders.map((order) => {
            const parsedNotes = parseOrderNotes(order.notes);
            const redirectTarget = buildOrderFilterHref(activeFilterStatus);

            return (
              <Card key={order.id}>
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>{order.orderNumber}</CardTitle>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {order.customerName} | {order.phone}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {order.city}, {order.province}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={getStatusBadgeTone(order.status)} variant="outline">
                      {order.status}
                    </Badge>
                    <Badge className={getPaymentStatusTone(order.paymentStatus)} variant="outline">
                      {getPaymentStatusLabel(order.paymentStatus)}
                    </Badge>
                    <Badge variant="secondary">{order.shippingMethod}</Badge>
                    <Badge variant="secondary">{order.paymentMethod}</Badge>
                    {order.voucherCode ? (
                      <Badge variant="secondary">Voucher {order.voucherCode}</Badge>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="rounded-2xl border border-border/70 bg-[hsl(var(--background)/0.45)] p-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Status pesanan</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Ubah status setelah cek pembayaran atau progres pengiriman.
                        </p>
                        {getQuickActionStatuses(order.status).length > 0 ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {getQuickActionStatuses(order.status).map((nextStatus) => (
                              <form key={nextStatus} action={updateOrderStatusAction}>
                                <input type="hidden" name="id" value={order.id} />
                                <input type="hidden" name="redirectTo" value={redirectTarget} />
                                <input type="hidden" name="nextStatus" value={nextStatus} />
                                <Button
                                  type="submit"
                                  size="sm"
                                  variant={
                                    nextStatus === "Dibatalkan" ? "destructive" : "outline"
                                  }
                                >
                                  {nextStatus}
                                </Button>
                              </form>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <form
                        action={updateOrderStatusAction}
                        className="flex flex-col gap-3 sm:flex-row sm:items-center"
                      >
                        <input type="hidden" name="id" value={order.id} />
                        <input type="hidden" name="redirectTo" value={redirectTarget} />
                        <select
                          name="nextStatus"
                          defaultValue={order.status}
                          className={orderStatusSelectClassName}
                        >
                          {orderStatusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <Button type="submit" size="sm">
                          Simpan Status
                        </Button>
                      </form>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {order.items.map((item) => {
                      const orderItem = item as OrderItemWithSizeLabel;
                      const labels = parseOrderItemLabels(orderItem);

                      return (
                        <div
                          key={orderItem.id}
                          className="flex items-center gap-4 rounded-2xl border border-border/70 bg-[hsl(var(--background)/0.45)] p-4"
                        >
                          <Image
                            src={orderItem.imageUrl}
                            alt={orderItem.productName}
                            width={64}
                            height={80}
                            className="h-20 w-16 rounded-[0.9rem] object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground">{orderItem.productName}</p>
                            {labels.variantName || labels.sizeLabel ? (
                              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                                {labels.variantName ? <span>Varian: {labels.variantName}</span> : null}
                                {labels.sizeLabel ? <span>Ukuran: {labels.sizeLabel}</span> : null}
                              </div>
                            ) : null}
                            <p className="mt-1 text-sm text-muted-foreground">
                              {orderItem.quantity}x | {formatCurrency(orderItem.unitPrice)}
                            </p>
                          </div>
                          <p className="font-semibold text-foreground">
                            {formatCurrency(orderItem.lineTotal)}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-2xl border border-border/70 bg-[hsl(var(--background)/0.45)] p-4">
                      <p className="text-sm font-medium text-foreground">Alamat pengiriman</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {order.address}
                        {order.district ? `, ${order.district}` : ""}
                        {order.city ? `, ${order.city}` : ""}
                        {order.province ? `, ${order.province}` : ""}
                        {order.postalCode ? `, ${order.postalCode}` : ""}
                      </p>

                      {parsedNotes.customerNote ? (
                        <p className="mt-3 text-sm text-muted-foreground">
                          Catatan: {parsedNotes.customerNote}
                        </p>
                      ) : null}

                      <div className="mt-4 rounded-[1rem] border border-border/70 bg-background/70 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-foreground">Bukti pembayaran</p>
                          {parsedNotes.paymentProofUrl ? (
                            <Button asChild size="sm" variant="outline">
                              <Link
                                href={parsedNotes.paymentProofUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Buka Gambar
                              </Link>
                            </Button>
                          ) : (
                            <Badge variant="outline">Belum ada bukti</Badge>
                          )}
                        </div>

                        {parsedNotes.paymentProofUrl ? (
                          <>
                            <a
                              href={parsedNotes.paymentProofUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 block"
                            >
                              <div className="relative h-56 w-full overflow-hidden rounded-[0.9rem]">
                                <Image
                                  src={parsedNotes.paymentProofUrl}
                                  alt={`Bukti pembayaran ${order.orderNumber}`}
                                  fill
                                  sizes="(max-width: 1024px) 100vw, 40vw"
                                  className="object-cover"
                                />
                              </div>
                            </a>
                            <p className="mt-2 text-xs text-muted-foreground">
                              Klik gambar untuk membuka bukti pembayaran ukuran penuh.
                            </p>
                          </>
                        ) : (
                          <p className="mt-3 text-sm text-muted-foreground">
                            Buyer belum mengunggah bukti pembayaran dari form checkout.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-[hsl(var(--background)/0.45)] p-4">
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <Badge className={getPaymentStatusTone(order.paymentStatus)} variant="outline">
                          {getPaymentStatusLabel(order.paymentStatus)}
                        </Badge>
                        {order.paymentProvider ? (
                          <Badge variant="secondary">{order.paymentProvider}</Badge>
                        ) : null}
                      </div>
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCurrency(order.subtotal)}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-4 text-sm">
                        <span className="text-muted-foreground">Ongkir</span>
                        <span>{formatCurrency(order.shippingCost)}</span>
                      </div>
                      {order.voucherDiscount > 0 ? (
                        <div className="mt-2 flex items-center justify-between gap-4 text-sm">
                          <span className="text-muted-foreground">
                            Diskon voucher{order.voucherCode ? ` ${order.voucherCode}` : ""}
                          </span>
                          <span className="text-emerald-700">
                            -{formatCurrency(order.voucherDiscount)}
                          </span>
                        </div>
                      ) : null}
                      <div className="mt-3 flex items-center justify-between gap-4 border-t border-border/70 pt-3">
                        <span className="font-medium text-foreground">Total</span>
                        <span className="text-xl font-semibold text-foreground">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        Dibuat pada {formatDate(order.createdAt)}
                      </p>
                      {order.paymentExpiresAt ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Batas pembayaran: {formatDate(order.paymentExpiresAt)}
                        </p>
                      ) : null}
                      {order.paidAt ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Dibayar pada {formatDate(order.paidAt)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : orders.length > 0 ? (
        <Card>
          <CardContent className="p-8 text-muted-foreground">
            Tidak ada pesanan yang cocok dengan filter status
            {activeFilterStatus ? ` "${activeFilterStatus}".` : "."}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-muted-foreground">
            Belum ada pesanan web yang masuk.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
