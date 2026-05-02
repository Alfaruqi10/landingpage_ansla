ALTER TABLE "Order"
ADD COLUMN "paidAt" TIMESTAMP(3),
ADD COLUMN "paymentAttemptCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "paymentExpiresAt" TIMESTAMP(3),
ADD COLUMN "paymentGatewayOrderId" TEXT,
ADD COLUMN "paymentPayload" JSONB,
ADD COLUMN "paymentProvider" TEXT,
ADD COLUMN "paymentQrString" TEXT,
ADD COLUMN "paymentQrUrl" TEXT,
ADD COLUMN "paymentReference" TEXT,
ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING';

UPDATE "Order"
SET "paymentStatus" = CASE
  WHEN "status" IN ('Lunas', 'Selesai') THEN 'PAID'
  WHEN "status" = 'Menunggu Verifikasi Pembayaran' THEN 'REVIEW'
  WHEN "status" = 'Dibatalkan' THEN 'CANCELLED'
  ELSE 'PENDING'
END;

CREATE UNIQUE INDEX "Order_paymentReference_key" ON "Order"("paymentReference");
CREATE UNIQUE INDEX "Order_paymentGatewayOrderId_key" ON "Order"("paymentGatewayOrderId");
CREATE INDEX "Order_paymentStatus_idx" ON "Order"("paymentStatus");
