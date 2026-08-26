-- Add visual group + gradient divider config to categories.
ALTER TABLE "categories"
  ADD COLUMN "color" TEXT,
  ADD COLUMN "show_gradient" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "gradient_color" TEXT,
  ADD COLUMN "gradient_height" INTEGER;
