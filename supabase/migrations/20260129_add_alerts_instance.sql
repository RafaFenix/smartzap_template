-- =============================================================================
-- MIGRATION: 2026-01-29 - Add instance_id to Account Alerts
-- =============================================================================

-- 1. Add instance_id to Account Alerts
ALTER TABLE account_alerts ADD COLUMN IF NOT EXISTS instance_id TEXT REFERENCES instances(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_account_alerts_instance_id ON account_alerts(instance_id);

-- 2. Backfill existing alerts with the first available instance
DO $$
DECLARE
  v_default_instance_id TEXT;
BEGIN
  SELECT id INTO v_default_instance_id FROM instances LIMIT 1;

  IF v_default_instance_id IS NOT NULL THEN
    UPDATE account_alerts SET instance_id = v_default_instance_id WHERE instance_id IS NULL;
  END IF;
END $$;
