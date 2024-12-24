-- Add home_subtitle column to app_settings table
ALTER TABLE app_settings ADD COLUMN home_subtitle text;

-- Update existing records with a default value
UPDATE app_settings SET home_subtitle = 'Transform your face naturally with guided exercises' WHERE home_subtitle IS NULL;
