-- =============================================================================
-- MIGRATION: 2026-01-26 - Add Instances (Multi-Tenancy)
-- =============================================================================

-- 1. Create Instances Table
CREATE TABLE IF NOT EXISTS instances (
  id TEXT PRIMARY KEY DEFAULT concat('inst_', replace(uuid_generate_v4()::text, '-', '')::text),
  name TEXT NOT NULL,
  phone_number_id TEXT NOT NULL,
  business_account_id TEXT,
  access_token TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- active, disconnected, error
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Index for phone_number_id to avoid duplicates if needed, or quick lookups
CREATE INDEX IF NOT EXISTS idx_instances_phone_number_id ON instances(phone_number_id);

-- 2. Migrate existing "Settings" to a Default Instance
-- We attempt to read from the settings table and insert into instances if they exist.
-- Note: This assumes keys 'phoneNumberId', 'businessAccountId', 'accessToken' exist in settings.
DO $$
DECLARE
  v_phone_id TEXT;
  v_business_id TEXT;
  v_token TEXT;
  v_display_phone TEXT;
BEGIN
  -- Extract values from settings table
  SELECT value INTO v_phone_id FROM settings WHERE key = 'phoneNumberId';
  SELECT value INTO v_business_id FROM settings WHERE key = 'businessAccountId';
  SELECT value INTO v_token FROM settings WHERE key = 'accessToken';
  SELECT value INTO v_display_phone FROM settings WHERE key = 'displayPhoneNumber';

  -- Only insert if we have the minimum required credentials
  IF v_phone_id IS NOT NULL AND v_token IS NOT NULL THEN
    INSERT INTO instances (name, phone_number_id, business_account_id, access_token)
    VALUES (
      COALESCE(v_display_phone, 'Default Instance'), -- Use display phone or default name
      v_phone_id,
      v_business_id,
      v_token
    );
  END IF;
END $$;

-- 3. Add instance_id to Campaigns
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS instance_id TEXT REFERENCES instances(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_campaigns_instance_id ON campaigns(instance_id);

-- 4. Add instance_id to Contacts
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS instance_id TEXT REFERENCES instances(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_contacts_instance_id ON contacts(instance_id);

-- 5. Add instance_id to Bots
ALTER TABLE bots ADD COLUMN IF NOT EXISTS instance_id TEXT REFERENCES instances(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_bots_instance_id ON bots(instance_id);

-- 6. Add instance_id to AI Agents (Optional, but good for scoping)
ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS instance_id TEXT REFERENCES instances(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_ai_agents_instance_id ON ai_agents(instance_id);

-- 7. Backfill existing data to the Default Instance (if any)
-- We pick the first instance created (the migrated one) and assign it to existing rows.
DO $$
DECLARE
  v_default_instance_id TEXT;
BEGIN
  SELECT id INTO v_default_instance_id FROM instances LIMIT 1;

  IF v_default_instance_id IS NOT NULL THEN
    -- Update Campaigns
    UPDATE campaigns SET instance_id = v_default_instance_id WHERE instance_id IS NULL;
    
    -- Update Contacts
    UPDATE contacts SET instance_id = v_default_instance_id WHERE instance_id IS NULL;
    
    -- Update Bots
    UPDATE bots SET instance_id = v_default_instance_id WHERE instance_id IS NULL;

    -- Update AI Agents
    UPDATE ai_agents SET instance_id = v_default_instance_id WHERE instance_id IS NULL;
  END IF;
END $$;

-- 8. Enable Realtime for Instances
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'instances') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE instances;
  END IF;
END $$;

-- 9. Cleanup Settings?
-- We decide NOT to delete settings yet, to allow rollback safety.
-- DELETE FROM settings WHERE key IN ('phoneNumberId', 'businessAccountId', 'accessToken');
