ALTER TABLE "Order"
ADD COLUMN "customerUserId" TEXT;

UPDATE "Order" AS o
SET "customerUserId" = cu."id"
FROM "CustomerUser" AS cu
WHERE o."customerUserId" IS NULL
  AND o."email" IS NOT NULL
  AND LOWER(o."email") = LOWER(cu."email");

ALTER TABLE "Order"
ADD CONSTRAINT "Order_customerUserId_fkey"
FOREIGN KEY ("customerUserId") REFERENCES "CustomerUser"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

CREATE INDEX "Order_customerUserId_idx" ON "Order"("customerUserId");
