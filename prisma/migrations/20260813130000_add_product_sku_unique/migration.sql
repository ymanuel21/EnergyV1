-- Additive migration: enforce SKU uniqueness (nullable — multiple NULLs allowed).
-- Verified on dev before apply: 0 duplicate non-empty SKUs, 0 empty-string SKUs.

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
