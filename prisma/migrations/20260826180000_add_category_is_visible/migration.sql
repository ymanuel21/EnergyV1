-- Add isVisible field to categories for visibility/hide feature.
-- Defaults to true so all existing categories remain visible.
ALTER TABLE "categories"
  ADD COLUMN "is_visible" BOOLEAN NOT NULL DEFAULT true;
