-- Additive migration: capacity + familyKey on products.
-- Each capacity stays a separate Product row; familyKey groups variants
-- of the same model family (derived from brand + model, not admin-entered).

-- AlterTable
ALTER TABLE "products" ADD COLUMN "capacity" TEXT,
ADD COLUMN "family_key" TEXT;

-- CreateIndex
CREATE INDEX "products_family_key_idx" ON "products"("family_key");
