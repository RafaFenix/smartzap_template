-- =============================================================================
-- MIGRATION: 2026-01-28 - Add instance_id to Templates
-- =============================================================================

-- 1. Add instance_id to Templates
ALTER TABLE templates ADD COLUMN IF NOT EXISTS instance_id TEXT REFERENCES instances(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_templates_instance_id ON templates(instance_id);

-- 2. Backfill existing templates with the first available instance
DO $$
DECLARE
  v_default_instance_id TEXT;
BEGIN
  SELECT id INTO v_default_instance_id FROM instances LIMIT 1;

  IF v_default_instance_id IS NOT NULL THEN
    UPDATE templates SET instance_id = v_default_instance_id WHERE instance_id IS NULL;
  END IF;
END $$;
