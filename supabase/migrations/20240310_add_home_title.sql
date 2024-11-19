-- Add home_title column to app_settings
ALTER TABLE app_settings
ADD COLUMN IF NOT EXISTS home_title TEXT DEFAULT 'Face Yoga';