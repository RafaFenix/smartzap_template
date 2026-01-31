-- =============================================================================
-- MIGRATION: 2026-01-31 - Agency Mode Metadata
-- =============================================================================

-- Add metadata columns to instances table for better client management
ALTER TABLE instances 
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'zinc'; -- zinc, red, orange, amber, green, emerald, teal, cyan, blue, indigo, violet, purple, fuchsia, pink, rose

-- Update existing instances to have a default color
UPDATE instances SET color = 'zinc' WHERE color IS NULL;
