"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { CartItem, useCart } from "@/components/cart/cart-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createOrderAction } from "@/lib/actions/checkout-actions";
import {
  resolveTransferDestinationAccount,
  transferBankOptions
} from "@/lib/site";
import { buildWhatsAppLink, formatCurrency } from "@/lib/utils";
import {
  evaluateVoucherForSubtotal,
  normalizeVoucherCode,
  type SerializableVoucher
} from "@/lib/vouchers";

const shippingOptions = [
  { value: "Kurir Reguler", label: "Kurir Reguler", price: 18000 },
  { value: "Kurir Express", label: "Kurir Express", price: 35000 },
  { value: "Same Day", label: "Same Day", price: 50000 }
];

const basePaymentOptions = [
  { value: "Transfer Bank", label: "Transfer ke Rekening" },
  { value: "QRIS", label: "QRIS" }
] as const;

const selectClassName =
  "mt-2 flex h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400";

const draftStorageKeyPrefix = "ansla-checkout-draft";

type RegionOption = {
  code: string;
  name: string;
};

type CheckoutDraft = {
  email: string;
  customerName: string;
  address: string;
  postalCode: string;
  phone: string;
  notes: string;
  shippingMethod: string;
  paymentMethod: string;
  transferBank: string;
  voucherCode: string;
  selectedProvinceCode: string;
  selectedCityCode: string;
  selectedDistrictCode: string;
};

type InitialCustomerProfile = Pick<CheckoutDraft, "customerName" | "email" | "phone">;

function createDefaultDraft(initialCustomerProfile?: InitialCustomerProfile): CheckoutDraft {
  return {
    email: initialCustomerProfile?.email || "",
    customerName: initialCustomerProfile?.customerName || "",
    address: "",
    postalCode: "",
    phone: initialCustomerProfile?.phone || "",
    notes: "",
    shippingMethod: shippingOptions[0].value,
    paymentMethod: basePaymentOptions[0].value,
    transferBank: transferBankOptions[0],
    voucherCode: "",
    selectedProvinceCode: "",
    selectedCityCode: "",
    selectedDistrictCode: ""
  };
}

function buildCheckoutWhatsappMessage(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return [
    "Assalamu'alaikum, saya ingin dibantu checkout via WhatsApp.",
    "",
    ...items.flatMap((item, index) => [
      `${index + 1}. ${item.productName}`,
      item.variantName ? `   Varian: ${item.variantName}` : null,
      item.size ? `   Ukuran: ${item.size}` : null,
      `   Jumlah: ${item.quantity}`,
      `   Harga: ${formatCurrency(item.unitPrice)}`,
      `   Subtotal: ${formatCurrency(item.lineTotal)}`,
      ""
    ]),
    `Subtotal: ${formatCurrency(subtotal)}`
  ]
    .filter(Boolean)
    .join("\n");
}

export function CheckoutPageClient({
  mode,
  whatsappNumber,
  status,
  message,
  initialCustomerProfile,
  initialVouchers,
  isQrisEnabled
}: {
  mode: "cart" | "buy-now";
  whatsappNumber: string;
  status?: string;
  message?: string;
  initialCustomerProfile?: InitialCustomerProfile;
  initialVouchers: SerializableVoucher[];
  isQrisEnabled: boolean;
}) {
  const paymentOptions = useMemo(
    () =>
      basePaymentOptions.filter((option) =>
        option.value === "QRIS" ? isQrisEnabled : true
      ),
    [isQrisEnabled]
  );
  const { isReady, items, buyNowItem } = useCart();
  const draftStorageKey = `${draftStorageKeyPrefix}-${mode}`;
  const [draft, setDraft] = useState<CheckoutDraft>(() =>
    createDefaultDraft(initialCustomerProfile)
  );
  const [shippingMethod, setShippingMethod] = useState(shippingOptions[0].value);
  const [paymentMethod, setPaymentMethod] = useState<string>(basePaymentOptions[0].value);
  const [transferBank, setTransferBank] = useState<string>(transferBankOptions[0]);
  const [provinces, setProvinces] = useState<RegionOption[]>([]);
  const [cities, setCities] = useState<RegionOption[]>([]);
  const [districts, setDistricts] = useState<RegionOption[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedCityCode, setSelectedCityCode] = useState("");
  const [selectedDistrictCode, setSelectedDistrictCode] = useState("");
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);
  const [regionError, setRegionError] = useState("");
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [hasInitializedVoucherFromDraft, setHasInitializedVoucherFromDraft] = useState(false);
  const [appliedVoucherCode, setAppliedVoucherCode] = useState("");
  const [voucherFeedback, setVoucherFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  const checkoutItems = useMemo(
    () => (mode === "buy-now" ? (buyNowItem ? [buyNowItem] : []) : items),
    [buyNowItem, items, mode]
  );

  const selectedProvinceName = useMemo(
    () => provinces.find((province) => province.code === selectedProvinceCode)?.name ?? "",
    [provinces, selectedProvinceCode]
  );
  const selectedCityName = useMemo(
    () => cities.find((city) => city.code === selectedCityCode)?.name ?? "",
    [cities, selectedCityCode]
  );
  const selectedDistrictName = useMemo(
    () => districts.find((district) => district.code === selectedDistrictCode)?.name ?? "",
    [districts, selectedDistrictCode]
  );

  const shippingCost =
    shippingOptions.find((option) => option.value === shippingMethod)?.price ?? 0;
  const subtotal = checkoutItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const appliedVoucher = useMemo(
    () => initialVouchers.find((voucher) => voucher.code === appliedVoucherCode) || null,
    [appliedVoucherCode, initialVouchers]
  );
  const appliedVoucherResult = useMemo(
    () =>
      appliedVoucher ? evaluateVoucherForSubtotal(appliedVoucher, subtotal) : null,
    [appliedVoucher, subtotal]
  );
  const discountAmount = appliedVoucherResult?.isValid ? appliedVoucherResult.discountAmount : 0;
  const total = subtotal - discountAmount + shippingCost;
  const isBankTransfer = paymentMethod === "Transfer Bank";
  const storedPaymentMethod = isBankTransfer
    ? `Transfer Bank - ${transferBank}`
    : paymentMethod;
  const transferDestination = resolveTransferDestinationAccount(transferBank);
  const requiresPaymentAfterOrder =
    paymentMethod === "Transfer Bank" || paymentMethod === "QRIS";
  const submitLabel = requiresPaymentAfterOrder
    ? "Buat Pesanan & Lanjut Pembayaran"
    : "Buat Pesanan Sekarang";
  const shouldRestoreDraft = Boolean(status && message);

  useEffect(() => {
    if (paymentOptions.some((option) => option.value === paymentMethod)) {
      return;
    }

    const fallbackPaymentMethod = paymentOptions[0]?.value || basePaymentOptions[0].value;
    setPaymentMethod(fallbackPaymentMethod);
    setDraft((current) => ({
      ...current,
      paymentMethod: fallbackPaymentMethod
    }));
  }, [paymentMethod, paymentOptions]);

  useEffect(() => {
    const defaultDraft = createDefaultDraft(initialCustomerProfile);

    try {
      if (!shouldRestoreDraft) {
        window.sessionStorage.removeItem(draftStorageKey);
        setDraft(defaultDraft);
        setShippingMethod(defaultDraft.shippingMethod);
        setPaymentMethod(defaultDraft.paymentMethod);
        setTransferBank(defaultDraft.transferBank);
        setSelectedProvinceCode(defaultDraft.selectedProvinceCode);
        setSelectedCityCode(defaultDraft.selectedCityCode);
        setSelectedDistrictCode(defaultDraft.selectedDistrictCode);
        return;
      }

      const savedDraft = window.sessionStorage.getItem(draftStorageKey);
      if (!savedDraft) {
        return;
      }

      const parsedDraft = JSON.parse(savedDraft) as Partial<CheckoutDraft>;
      const restoredPaymentMethod = paymentOptions.some(
        (option) => option.value === parsedDraft.paymentMethod
      )
        ? parsedDraft.paymentMethod || defaultDraft.paymentMethod
        : defaultDraft.paymentMethod;
      const restoredTransferBank = transferBankOptions.includes(
        (parsedDraft.transferBank || "") as (typeof transferBankOptions)[number]
      )
        ? parsedDraft.transferBank || defaultDraft.transferBank
        : defaultDraft.transferBank;
      const mergedDraft = {
        ...defaultDraft,
        ...parsedDraft,
        paymentMethod: restoredPaymentMethod,
        transferBank: restoredTransferBank
      };

      setDraft(mergedDraft);
      setShippingMethod(mergedDraft.shippingMethod);
      setPaymentMethod(mergedDraft.paymentMethod);
      setTransferBank(mergedDraft.transferBank);
      setSelectedProvinceCode(mergedDraft.selectedProvinceCode);
      setSelectedCityCode(mergedDraft.selectedCityCode);
      setSelectedDistrictCode(mergedDraft.selectedDistrictCode);
    } catch {
      window.sessionStorage.removeItem(draftStorageKey);
    } finally {
      setHasRestoredDraft(true);
    }
  }, [draftStorageKey, initialCustomerProfile, paymentOptions, shouldRestoreDraft]);

  useEffect(() => {
    if (!hasRestoredDraft || hasInitializedVoucherFromDraft) {
      return;
    }

    const normalizedCode = normalizeVoucherCode(draft.voucherCode);

    if (!normalizedCode) {
      setAppliedVoucherCode("");
      setHasInitializedVoucherFromDraft(true);
      return;
    }

    const matchedVoucher = initialVouchers.find((voucher) => voucher.code === normalizedCode);

    if (!matchedVoucher) {
      setAppliedVoucherCode("");
      setHasInitializedVoucherFromDraft(true);
      return;
    }

    const evaluation = evaluateVoucherForSubtotal(matchedVoucher, subtotal);

    if (evaluation.isValid) {
      setAppliedVoucherCode(normalizedCode);
    } else {
      setAppliedVoucherCode("");
    }
    setHasInitializedVoucherFromDraft(true);
  }, [
    draft.voucherCode,
    hasInitializedVoucherFromDraft,
    hasRestoredDraft,
    initialVouchers,
    subtotal
  ]);

  useEffect(() => {
    if (!appliedVoucherCode || !appliedVoucherResult || appliedVoucherResult.isValid) {
      return;
    }

    setAppliedVoucherCode("");
    setVoucherFeedback({
      tone: "error",
      message: appliedVoucherResult.message
    });
  }, [appliedVoucherCode, appliedVoucherResult]);

  useEffect(() => {
    if (!hasRestoredDraft) {
      return;
    }

    const nextDraft: CheckoutDraft = {
      ...draft,
      shippingMethod,
      paymentMethod,
      transferBank,
      selectedProvinceCode,
      selectedCityCode,
      selectedDistrictCode
    };

    window.sessionStorage.setItem(draftStorageKey, JSON.stringify(nextDraft));
  }, [
    draft,
    draftStorageKey,
    hasRestoredDraft,
    paymentMethod,
    selectedCityCode,
    selectedDistrictCode,
    selectedProvinceCode,
    shippingMethod,
    transferBank
  ]);

  useEffect(() => {
    let isMounted = true;

    async function loadProvinces() {
      try {
        setIsLoadingRegions(true);
        setRegionError("");

        const response = await fetch("/api/regions/provinces", {
          cache: "no-store"
        });
        const payload = (await response.json()) as { data?: RegionOption[]; error?: string };

        if (!response.ok) {
          throw new Error(payload.error || "Gagal memuat daftar provinsi.");
        }

        if (isMounted) {
          setProvinces(payload.data ?? []);
        }
      } catch (error) {
        if (isMounted) {
          setRegionError(
            error instanceof Error ? error.message : "Gagal memuat daftar provinsi."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingRegions(false);
        }
      }
    }

    loadProvinces();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadCities() {
      if (!selectedProvinceCode) {
        setCities([]);
        setDistricts([]);
        return;
      }

      try {
        setIsLoadingRegions(true);
        setRegionError("");

        const response = await fetch(`/api/regions/regencies/${selectedProvinceCode}`, {
          cache: "no-store"
        });
        const payload = (await response.json()) as { data?: RegionOption[]; error?: string };

        if (!response.ok) {
          throw new Error(payload.error || "Gagal memuat daftar kota/kabupaten.");
        }

        if (isMounted) {
          setCities(payload.data ?? []);
        }
      } catch (error) {
        if (isMounted) {
          setRegionError(
            error instanceof Error
              ? error.message
              : "Gagal memuat daftar kota/kabupaten."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingRegions(false);
        }
      }
    }

    loadCities();

    return () => {
      isMounted = false;
    };
  }, [selectedProvinceCode]);

  useEffect(() => {
    let isMounted = true;

    async function loadDistricts() {
      if (!selectedCityCode) {
        setDistricts([]);
        return;
      }

      try {
        setIsLoadingRegions(true);
        setRegionError("");

        const response = await fetch(`/api/regions/districts/${selectedCityCode}`, {
          cache: "no-store"
        });
        const payload = (await response.json()) as { data?: RegionOption[]; error?: string };

        if (!response.ok) {
          throw new Error(payload.error || "Gagal memuat daftar kecamatan.");
        }

        if (isMounted) {
          setDistricts(payload.data ?? []);
        }
      } catch (error) {
        if (isMounted) {
          setRegionError(
            error instanceof Error ? error.message : "Gagal memuat daftar kecamatan."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingRegions(false);
        }
      }
    }

    loadDistricts();

    return () => {
      isMounted = false;
    };
  }, [selectedCityCode]);

  if (!isReady) {
    return <div className="surface-panel p-8">Menyiapkan halaman checkout Anda...</div>;
  }

  if (checkoutItems.length === 0) {
    return (
      <EmptyState
        title="Belum ada item untuk checkout"
        description="Tambahkan produk dulu ke keranjang atau pilih checkout dari halaman detail produk."
        action={
          <Button asChild>
            <Link href="/products">Kembali ke Koleksi</Link>
          </Button>
        }
      />
    );
  }

  const whatsappLink = buildWhatsAppLink(
    whatsappNumber,
    buildCheckoutWhatsappMessage(checkoutItems)
  );

  function applyVoucher() {
    const normalizedCode = normalizeVoucherCode(draft.voucherCode);

    if (!normalizedCode) {
      setAppliedVoucherCode("");
      setVoucherFeedback({
        tone: "error",
        message: "Masukkan kode voucher terlebih dulu."
      });
      return;
    }

    const matchedVoucher = initialVouchers.find((voucher) => voucher.code === normalizedCode);

    if (!matchedVoucher) {
      setAppliedVoucherCode("");
      setVoucherFeedback({
        tone: "error",
        message: "Kode voucher tidak ditemukan atau belum aktif."
      });
      return;
    }

    const evaluation = evaluateVoucherForSubtotal(matchedVoucher, subtotal);

    if (!evaluation.isValid) {
      setAppliedVoucherCode("");
      setVoucherFeedback({
        tone: "error",
        message: evaluation.message
      });
      return;
    }

    setDraft((current) => ({
      ...current,
      voucherCode: normalizedCode
    }));
    setAppliedVoucherCode(normalizedCode);
    setVoucherFeedback({
      tone: "success",
      message: evaluation.message
    });
  }

  function removeVoucher() {
    setDraft((current) => ({
      ...current,
      voucherCode: ""
    }));
    setAppliedVoucherCode("");
    setVoucherFeedback(null);
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
      <div className="surface-panel p-6 sm:p-8">
        <p className="section-eyebrow">Ringkasan pesanan</p>
        <div className="mt-5 space-y-5">
          {checkoutItems.map((item, index) => (
            <div
              key={`${item.productSlug}-${item.variantName || "default"}-${index}`}
              className="flex items-start gap-4 border-b border-border/70 pb-5 last:border-b-0 last:pb-0"
            >
              <Image
                src={item.imageUrl}
                alt={item.productName}
                width={80}
                height={96}
                className="h-24 w-20 rounded-[1rem] object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xl text-foreground">{item.productName}</p>
                {item.variantName || item.size ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {item.variantName ? (
                      <Badge variant="secondary" className="rounded-full">
                        {item.variantName}
                      </Badge>
                    ) : null}
                    {item.size ? (
                      <Badge variant="outline" className="rounded-full">
                        {item.size}
                      </Badge>
                    ) : null}
                  </div>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                  <span>{item.quantity}x</span>
                  <span>{formatCurrency(item.unitPrice)}</span>
                </div>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {formatCurrency(item.lineTotal)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-3 rounded-[1.4rem] border border-border/70 bg-[hsl(var(--background)/0.45)] p-5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
          </div>
          {discountAmount > 0 ? (
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">
                Diskon voucher {appliedVoucherCode}
              </span>
              <span className="font-medium text-emerald-700 dark:text-emerald-300">
                -{formatCurrency(discountAmount)}
              </span>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Ongkir</span>
            <span className="font-medium text-foreground">{formatCurrency(shippingCost)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-border/70 pt-3">
            <span className="text-lg text-foreground">Total</span>
            <span className="text-2xl font-semibold text-foreground">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <div className="surface-panel p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="text-foreground">Data Pengiriman</span>
          <span>&gt;</span>
          <span>Pengiriman</span>
          <span>&gt;</span>
          <span>Pembayaran</span>
        </div>

        <form action={createOrderAction} className="mt-6 space-y-5">
          {initialCustomerProfile ? (
            <div className="rounded-[1.2rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
              Data utama checkout sudah diisi dari akun Anda. Tetap bisa diubah jika alamat
              penerima atau kontaknya berbeda.
            </div>
          ) : null}

          <input type="hidden" name="items" value={JSON.stringify(checkoutItems)} />
          <input type="hidden" name="subtotal" value={String(subtotal)} />
          <input type="hidden" name="shippingCost" value={String(shippingCost)} />
          <input type="hidden" name="total" value={String(total)} />
          <input type="hidden" name="checkoutMethod" value="web" />
          <input type="hidden" name="redirectMode" value={mode} />
          <input type="hidden" name="paymentMethod" value={storedPaymentMethod} />
          <input type="hidden" name="voucherCode" value={appliedVoucherCode} />
          <input type="hidden" name="province" value={selectedProvinceName} />
          <input type="hidden" name="city" value={selectedCityName} />
          <input type="hidden" name="district" value={selectedDistrictName} />

          <div className="rounded-[1.2rem] border border-border/70 bg-[hsl(var(--background)/0.35)] p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Label htmlFor="voucher-code">Kode Voucher</Label>
                <Input
                  id="voucher-code"
                  className="mt-2 uppercase"
                  placeholder="Masukkan kode promo"
                  value={draft.voucherCode}
                  onChange={(event) => {
                    const nextValue = event.target.value.toUpperCase();
                    setDraft((current) => ({
                      ...current,
                      voucherCode: nextValue
                    }));

                    if (normalizeVoucherCode(nextValue) !== appliedVoucherCode) {
                      setAppliedVoucherCode("");
                    }

                    if (voucherFeedback) {
                      setVoucherFeedback(null);
                    }
                  }}
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={applyVoucher}>
                  Terapkan
                </Button>
                {appliedVoucherCode ? (
                  <Button type="button" variant="ghost" onClick={removeVoucher}>
                    Hapus
                  </Button>
                ) : null}
              </div>
            </div>

            {voucherFeedback ? (
              <p
                className={`mt-3 text-sm ${
                  voucherFeedback.tone === "success"
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-rose-700 dark:text-rose-300"
                }`}
              >
                {voucherFeedback.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="checkout-email">Email (Opsional)</Label>
              <Input
                id="checkout-email"
                name="email"
                className="mt-2"
                value={draft.email}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, email: event.target.value }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="checkout-name">Nama Lengkap</Label>
              <Input
                id="checkout-name"
                name="customerName"
                className="mt-2"
                placeholder="Nama penerima pesanan"
                value={draft.customerName}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, customerName: event.target.value }))
                }
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="checkout-province">Provinsi</Label>
              <select
                id="checkout-province"
                name="provinceCode"
                value={selectedProvinceCode}
                onChange={(event) => {
                  setSelectedProvinceCode(event.target.value);
                  setSelectedCityCode("");
                  setSelectedDistrictCode("");
                  setCities([]);
                  setDistricts([]);
                }}
                className={selectClassName}
                required
              >
                <option value="">Pilih provinsi</option>
                {provinces.map((province) => (
                  <option key={province.code} value={province.code}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="checkout-city">Kota / Kabupaten</Label>
              <select
                id="checkout-city"
                name="cityCode"
                value={selectedCityCode}
                onChange={(event) => {
                  setSelectedCityCode(event.target.value);
                  setSelectedDistrictCode("");
                  setDistricts([]);
                }}
                className={selectClassName}
                disabled={!selectedProvinceCode || isLoadingRegions}
                required
              >
                <option value="">Pilih kota / kabupaten</option>
                {cities.map((city) => (
                  <option key={city.code} value={city.code}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="checkout-district">Kecamatan</Label>
              <select
                id="checkout-district"
                name="districtCode"
                value={selectedDistrictCode}
                onChange={(event) => setSelectedDistrictCode(event.target.value)}
                className={selectClassName}
                disabled={!selectedCityCode || isLoadingRegions}
                required
              >
                <option value="">Pilih kecamatan</option>
                {districts.map((district) => (
                  <option key={district.code} value={district.code}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="checkout-address">Detail Alamat</Label>
              <Textarea
                id="checkout-address"
                name="address"
                className="mt-2 min-h-[110px]"
                placeholder="Masukkan alamat lengkap Anda"
                value={draft.address}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, address: event.target.value }))
                }
                required
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Pilih provinsi, kota/kabupaten, lalu kecamatan agar detail alamat lebih
                rapi dan mudah diproses.
              </p>
              {regionError ? (
                <p className="mt-1 text-xs text-rose-600">{regionError}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="checkout-postal">Kode Pos</Label>
              <Input
                id="checkout-postal"
                name="postalCode"
                className="mt-2"
                value={draft.postalCode}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, postalCode: event.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="checkout-phone">Nomor HP / WhatsApp</Label>
              <Input
                id="checkout-phone"
                name="phone"
                className="mt-2"
                placeholder="Nomor yang aktif dihubungi"
                value={draft.phone}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, phone: event.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="shipping-method">Metode Pengiriman</Label>
              <select
                id="shipping-method"
                name="shippingMethod"
                value={shippingMethod}
                onChange={(event) => setShippingMethod(event.target.value)}
                className={selectClassName}
              >
                {shippingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({formatCurrency(option.price)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="payment-method">Metode Pembayaran</Label>
              <select
                id="payment-method"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                className={selectClassName}
              >
                {paymentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {!isQrisEnabled ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  QRIS sedang kami nonaktifkan sementara sampai integrasi publiknya siap sepenuhnya.
                </p>
              ) : null}
            </div>
            <div className="md:col-span-2">
              <div className="rounded-[1.2rem] border border-border/70 bg-[hsl(var(--background)/0.45)] p-4">
                {isBankTransfer ? (
                  <>
                    <div>
                      <Label htmlFor="transfer-bank">Pilih bank Anda</Label>
                      <select
                        id="transfer-bank"
                        value={transferBank}
                        onChange={(event) => setTransferBank(event.target.value)}
                        className={selectClassName}
                      >
                        {transferBankOptions.map((bank) => (
                          <option key={bank} value={bank}>
                            {bank}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-4">
                      <Label htmlFor="payment-proof-file">Upload bukti pembayaran</Label>
                      <Input
                        id="payment-proof-file"
                        name="paymentProofFile"
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="mt-2"
                      />
                      <p className="mt-2 text-xs text-muted-foreground">
                        Unggah screenshot atau foto bukti transfer Anda jika pembayaran sudah
                        dilakukan.
                      </p>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      <span className="mt-4 block">Transfer ke rekening ANSLA</span>
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Anda bisa transfer dari rekening {transferBank} ke rekening tujuan berikut
                      sesuai total belanja. Status pesanan akan menunggu pembayaran sampai
                      transfer Anda dikonfirmasi.
                    </p>
                    <div className="mt-4 rounded-[1rem] border border-border/70 bg-background/70 p-4">
                      <p className="text-sm text-muted-foreground">Rekening tujuan</p>
                      <p className="mt-2 text-lg font-semibold text-foreground">
                        {transferDestination.account.bankName}
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-foreground">
                        {transferDestination.account.accountNumber}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        a.n. {transferDestination.account.accountHolder}
                      </p>
                      {transferDestination.usesFallback ? (
                        <p className="mt-3 text-sm text-muted-foreground">
                          Saat ini rekening tujuan khusus untuk {transferBank} belum tersedia,
                          jadi pembayaran diarahkan ke rekening utama ANSLA via transfer antar
                          bank.
                        </p>
                      ) : null}
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                      <p>1. Buat pesanan dari halaman ini.</p>
                      <p>2. Transfer sesuai total yang muncul di ringkasan pesanan.</p>
                      <p>3. Simpan bukti transfer, lalu tunggu konfirmasi dari tim kami.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-foreground">Pembayaran via QRIS</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Setelah pesanan dibuat, Anda akan langsung masuk ke halaman QRIS otomatis
                      dengan QR dinamis khusus untuk order ini. Status pesanan akan berubah sendiri
                      begitu pembayaran berhasil diterima.
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="checkout-notes">Catatan Order (Opsional)</Label>
              <Textarea
                id="checkout-notes"
                name="notes"
                className="mt-2 min-h-[90px]"
                placeholder="Misalnya catatan warna, patokan alamat, atau kebutuhan khusus lainnya."
                value={draft.notes}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, notes: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid gap-3 pt-2 sm:grid-cols-2">
            <Button type="submit" size="lg" className="h-12">
              {submitLabel}
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 border-emerald-500/50 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
            >
              <Link href={whatsappLink} target="_blank">
                Lanjut via WhatsApp
              </Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
