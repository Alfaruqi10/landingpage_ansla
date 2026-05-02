-- AlterTable
ALTER TABLE "Category" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- Backfill existing categories with a stable order
WITH ordered_categories AS (
    SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, "name" ASC) - 1 AS next_sort_order
    FROM "Category"
)
UPDATE "Category"
SET "sortOrder" = ordered_categories.next_sort_order
FROM ordered_categories
WHERE ordered_categories."id" = "Category"."id";
