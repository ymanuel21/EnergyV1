-- Migrate deactivated categories from isActive=false to the new visibility system.
-- Sets isActive=true and isVisible=false for all categories that were
-- previously deactivated (isActive=false). This moves the "hidden" state
-- from isActive to isVisible, making isVisible the single mechanism for
-- controlling public category visibility.
--
-- Categories affected: Abc, Brand, Packaging Kertas, QA-TEST-CATEGORY,
-- Sedotan Plastik, Single Phase, Three Phase (all had 0 products).
UPDATE "categories"
SET "is_active" = true, "is_visible" = false
WHERE "is_active" = false;
