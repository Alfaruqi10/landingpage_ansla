CREATE TABLE "ShippingMethod" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingMethod_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'BANK_TRANSFER',
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountHolder" TEXT NOT NULL,
    "paymentMethodId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ShippingMethod_name_key" ON "ShippingMethod"("name");
CREATE UNIQUE INDEX "PaymentMethod_name_key" ON "PaymentMethod"("name");
CREATE UNIQUE INDEX "BankAccount_bankName_key" ON "BankAccount"("bankName");

ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "ShippingMethod" ("id", "name", "label", "price", "description", "sortOrder", "isActive", "updatedAt")
VALUES
  ('ship_kurir_reguler', 'Kurir Reguler', 'Kurir Reguler', 18000, 'Estimasi pengiriman standar untuk pesanan ANSLA.', 10, true, CURRENT_TIMESTAMP),
  ('ship_kurir_express', 'Kurir Express', 'Kurir Express', 35000, 'Pengiriman lebih cepat untuk area yang mendukung.', 20, true, CURRENT_TIMESTAMP),
  ('ship_same_day', 'Same Day', 'Same Day', 50000, 'Pengiriman di hari yang sama untuk area tertentu.', 30, true, CURRENT_TIMESTAMP);

INSERT INTO "PaymentMethod" ("id", "name", "label", "type", "description", "sortOrder", "isActive", "updatedAt")
VALUES
  ('pay_transfer_bank', 'Transfer Bank', 'Transfer ke Rekening', 'BANK_TRANSFER', 'Pembayaran manual lewat transfer bank.', 10, true, CURRENT_TIMESTAMP),
  ('pay_qris', 'QRIS', 'QRIS', 'QRIS', 'Pembayaran QRIS otomatis jika fitur QRIS aktif.', 20, true, CURRENT_TIMESTAMP),
  ('pay_cod', 'COD', 'Bayar di Tempat', 'COD', 'Metode COD opsional untuk kebutuhan tertentu.', 30, false, CURRENT_TIMESTAMP);

INSERT INTO "BankAccount" ("id", "bankName", "accountNumber", "accountHolder", "paymentMethodId", "sortOrder", "isActive", "updatedAt")
VALUES
  ('bank_seabank_primary', 'SeaBank', '901353568694', 'Muhammad Al Faruqi', 'pay_transfer_bank', 10, true, CURRENT_TIMESTAMP);
