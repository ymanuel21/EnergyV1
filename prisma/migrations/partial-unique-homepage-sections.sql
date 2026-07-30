-- Migration: replace @@unique([sectionId, status]) with partial unique indexes
-- Prisma-generated constraint name may vary — detect and drop dynamically
DO $$
DECLARE
  constraint_name text;
BEGIN
  -- Find and drop the existing unique constraint on homepage_section_versions
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'homepage_section_versions'::regclass
    AND contype = 'u'
    AND array_length(conkey, 1) = 2;

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE homepage_section_versions DROP CONSTRAINT %I', constraint_name);
    RAISE NOTICE 'Dropped constraint: %', constraint_name;
  END IF;
END $$;

-- Partial unique index: exactly one draft per section
CREATE UNIQUE INDEX IF NOT EXISTS idx_homepage_section_versions_draft_unique
  ON homepage_section_versions ("sectionId")
  WHERE status = 'draft';

-- Partial unique index: exactly one published per section
CREATE UNIQUE INDEX IF NOT EXISTS idx_homepage_section_versions_published_unique
  ON homepage_section_versions ("sectionId")
  WHERE status = 'published';

-- No constraint on 'archived' — unlimited history
