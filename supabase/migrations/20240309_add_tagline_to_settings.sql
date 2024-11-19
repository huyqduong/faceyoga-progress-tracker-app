-- Add tagline column to app_settings
ALTER TABLE app_settings
ADD COLUMN IF NOT EXISTS tagline TEXT DEFAULT 'Transform Your Face Naturally';