CREATE TYPE "VoucherDiscountType" AS ENUM ('PERCENT', 'FIXED');

CREATE TABLE "Voucher" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "discountType" "VoucherDiscountType" NOT NULL,
    "discountValue" INTEGER NOT NULL,
    "minPurchase" INTEGER NOT NULL DEFAULT 0,
    "usageLimit" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Voucher_code_key" ON "Voucher"("code");

ALTER TABLE "Order"
ADD COLUMN "voucherId" TEXT,
ADD COLUMN "voucherCode" TEXT,
ADD COLUMN "voucherDiscount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Order"
ADD CONSTRAINT "Order_voucherId_fkey"
FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

CREATE INDEX "Order_voucherId_idx" ON "Order"("voucherId");
