import { db } from "@/lib/db";
import { isQrisEnabled } from "@/lib/features";
import { siteConfig } from "@/lib/site";

export type CheckoutShippingOption = {
  id?: string;
  value: string;
  label: string;
  price: number;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type CheckoutPaymentOption = {
  id?: string;
  value: string;
  label: string;
  type: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type CheckoutBankAccount = {
  id?: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  sortOrder: number;
  isActive: boolean;
};

export const defaultShippingMethods: CheckoutShippingOption[] = [
  {
    value: "Kurir Reguler",
    label: "Kurir Reguler",
    price: 18000,
    description: "Estimasi pengiriman standar untuk pesanan ANSLA.",
    sortOrder: 10,
    isActive: true
  },
  {
    value: "Kurir Express",
    label: "Kurir Express",
    price: 35000,
    description: "Pengiriman lebih cepat untuk area yang mendukung.",
    sortOrder: 20,
    isActive: true
  },
  {
    value: "Same Day",
    label: "Same Day",
    price: 50000,
    description: "Pengiriman di hari yang sama untuk area tertentu.",
    sortOrder: 30,
    isActive: true
  }
];

export const defaultPaymentMethods: CheckoutPaymentOption[] = [
  {
    value: "Transfer Bank",
    label: "Transfer ke Rekening",
    type: "BANK_TRANSFER",
    description: "Pembayaran manual lewat transfer bank.",
    sortOrder: 10,
    isActive: true
  },
  {
    value: "QRIS",
    label: "QRIS",
    type: "QRIS",
    description: "Pembayaran QRIS otomatis jika fitur QRIS aktif.",
    sortOrder: 20,
    isActive: true
  }
];

export const defaultBankAccounts: CheckoutBankAccount[] = [
  {
    bankName: siteConfig.paymentAccount.bankName,
    accountNumber: siteConfig.paymentAccount.accountNumber,
    accountHolder: siteConfig.paymentAccount.accountHolder,
    sortOrder: 10,
    isActive: true
  }
];

function sortByOrderAndName<T extends { sortOrder: number }>(
  items: T[],
  getLabel: (item: T) => string
) {
  return [...items].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return getLabel(left).localeCompare(getLabel(right), "id-ID");
  });
}

function normalizePaymentMethod(paymentMethod: string) {
  return paymentMethod.startsWith("Transfer Bank") ? "Transfer Bank" : paymentMethod;
}

function normalizeBankName(paymentMethod: string) {
  if (!paymentMethod.startsWith("Transfer Bank")) {
    return "";
  }

  const [, bankName = ""] = paymentMethod.split(" - ");
  return bankName.trim();
}

async function findTransferPaymentMethodId() {
  const paymentMethod = await db.paymentMethod.findUnique({
    where: { name: "Transfer Bank" },
    select: { id: true }
  });

  return paymentMethod?.id || null;
}

export async function ensureCheckoutSettingsDefaults() {
  const [shippingCount, paymentCount, bankCount] = await Promise.all([
    db.shippingMethod.count(),
    db.paymentMethod.count(),
    db.bankAccount.count()
  ]);

  if (shippingCount === 0) {
    await db.shippingMethod.createMany({
      data: defaultShippingMethods.map((method) => ({
        name: method.value,
        label: method.label,
        price: method.price,
        description: method.description || null,
        sortOrder: method.sortOrder,
        isActive: method.isActive
      })),
      skipDuplicates: true
    });
  }

  if (paymentCount === 0) {
    await db.paymentMethod.createMany({
      data: defaultPaymentMethods.map((method) => ({
        name: method.value,
        label: method.label,
        type: method.type,
        description: method.description || null,
        sortOrder: method.sortOrder,
        isActive: method.isActive
      })),
      skipDuplicates: true
    });
  }

  if (bankCount === 0) {
    const transferPaymentMethodId = await findTransferPaymentMethodId();

    await db.bankAccount.createMany({
      data: defaultBankAccounts.map((account) => ({
        bankName: account.bankName,
        accountNumber: account.accountNumber,
        accountHolder: account.accountHolder,
        paymentMethodId: transferPaymentMethodId,
        sortOrder: account.sortOrder,
        isActive: account.isActive
      })),
      skipDuplicates: true
    });
  }
}

export async function getCheckoutSettings() {
  try {
    const [shippingMethods, paymentMethods, bankAccounts] = await Promise.all([
      db.shippingMethod.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { label: "asc" }]
      }),
      db.paymentMethod.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { label: "asc" }]
      }),
      db.bankAccount.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { bankName: "asc" }]
      })
    ]);

    return {
      shippingMethods:
        shippingMethods.length > 0
          ? shippingMethods.map((method) => ({
              id: method.id,
              value: method.name,
              label: method.label,
              price: method.price,
              description: method.description,
              sortOrder: method.sortOrder,
              isActive: method.isActive
            }))
          : defaultShippingMethods,
      paymentMethods:
        paymentMethods.length > 0
          ? paymentMethods.map((method) => ({
              id: method.id,
              value: method.name,
              label: method.label,
              type: method.type,
              description: method.description,
              sortOrder: method.sortOrder,
              isActive: method.isActive
            }))
          : defaultPaymentMethods,
      bankAccounts:
        bankAccounts.length > 0
          ? bankAccounts.map((account) => ({
              id: account.id,
              bankName: account.bankName,
              accountNumber: account.accountNumber,
              accountHolder: account.accountHolder,
              sortOrder: account.sortOrder,
              isActive: account.isActive
            }))
          : defaultBankAccounts
    };
  } catch {
    return {
      shippingMethods: defaultShippingMethods,
      paymentMethods: defaultPaymentMethods,
      bankAccounts: defaultBankAccounts
    };
  }
}

export async function getAdminCheckoutSettings() {
  try {
    await ensureCheckoutSettingsDefaults();

    const [shippingMethods, paymentMethods, bankAccounts] = await Promise.all([
      db.shippingMethod.findMany({
        orderBy: [{ sortOrder: "asc" }, { label: "asc" }]
      }),
      db.paymentMethod.findMany({
        orderBy: [{ sortOrder: "asc" }, { label: "asc" }]
      }),
      db.bankAccount.findMany({
        orderBy: [{ sortOrder: "asc" }, { bankName: "asc" }]
      })
    ]);

    return {
      hasDatabaseSettings: true,
      shippingMethods: shippingMethods.map((method) => ({
        id: method.id,
        value: method.name,
        label: method.label,
        price: method.price,
        description: method.description,
        sortOrder: method.sortOrder,
        isActive: method.isActive
      })),
      paymentMethods: paymentMethods.map((method) => ({
        id: method.id,
        value: method.name,
        label: method.label,
        type: method.type,
        description: method.description,
        sortOrder: method.sortOrder,
        isActive: method.isActive
      })),
      bankAccounts: bankAccounts.map((account) => ({
        id: account.id,
        bankName: account.bankName,
        accountNumber: account.accountNumber,
        accountHolder: account.accountHolder,
        sortOrder: account.sortOrder,
        isActive: account.isActive
      }))
    };
  } catch {
    return {
      hasDatabaseSettings: false,
      shippingMethods: sortByOrderAndName(defaultShippingMethods, (item) => item.label),
      paymentMethods: sortByOrderAndName(defaultPaymentMethods, (item) => item.label),
      bankAccounts: sortByOrderAndName(defaultBankAccounts, (item) => item.bankName)
    };
  }
}

export async function getShippingCostByMethod(shippingMethod: string) {
  const { shippingMethods } = await getCheckoutSettings();
  const matchedMethod = shippingMethods.find((method) => method.value === shippingMethod);

  return matchedMethod?.price ?? null;
}

export async function isCheckoutPaymentMethodAvailable(paymentMethod: string) {
  const normalizedMethod = normalizePaymentMethod(paymentMethod);

  if (normalizedMethod === "QRIS" && !isQrisEnabled()) {
    return false;
  }

  const { paymentMethods, bankAccounts } = await getCheckoutSettings();
  const matchedMethod = paymentMethods.find((method) => method.value === normalizedMethod);

  if (!matchedMethod) {
    return false;
  }

  if (normalizedMethod !== "Transfer Bank") {
    return true;
  }

  const selectedBank = normalizeBankName(paymentMethod);

  if (!selectedBank || bankAccounts.length === 0) {
    return true;
  }

  return bankAccounts.some((account) => account.bankName === selectedBank);
}
