-- Add thumbnail_url column to lessons table
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Update existing lessons to use image_url as thumbnail_url
UPDATE lessons SET thumbnail_url = image_url WHERE thumbnail_url IS NULL;
