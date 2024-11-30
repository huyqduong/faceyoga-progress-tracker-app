-- Add new fields to courses table
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS access_type TEXT DEFAULT 'lifetime' CHECK (access_type IN ('lifetime', 'subscription', 'trial')),
ADD COLUMN IF NOT EXISTS trial_duration_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS subscription_duration_months INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5.0);

-- Update existing courses to have default values
UPDATE courses 
SET 
  is_published = true,
  access_type = 'lifetime',
  trial_duration_days = 0,
  subscription_duration_months = 0,
  rating = 0.0
WHERE is_published IS NULL;
