-- Drop existing tables and their policies
DROP TABLE IF EXISTS public.site_settings CASCADE;
DROP TABLE IF EXISTS public.app_settings CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- Create admin_users table if it doesn't exist
CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS to admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Allow anyone to check if an email is an admin
DROP POLICY IF EXISTS "Allow anyone to check if email is admin" ON public.admin_users;
CREATE POLICY "Allow anyone to check if email is admin" ON public.admin_users
    FOR SELECT
    TO PUBLIC
    USING (true);

-- Create app_settings table
CREATE TABLE public.app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name TEXT NOT NULL DEFAULT 'Face Yoga App',
    tagline TEXT,
    home_title TEXT,
    logo_url TEXT,
    description TEXT NOT NULL DEFAULT 'Transform your face naturally with our guided face yoga exercises',
    about_text TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    primary_color TEXT NOT NULL DEFAULT '#4FD1C5',
    secondary_color TEXT NOT NULL DEFAULT '#38B2AC',
    social_links JSONB DEFAULT '{"facebook": "", "instagram": "", "twitter": "", "youtube": ""}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view settings
DROP POLICY IF EXISTS "Allow anyone to view settings" ON public.app_settings;
CREATE POLICY "Allow anyone to view settings" ON public.app_settings
    FOR SELECT
    TO PUBLIC
    USING (true);

-- Allow admin users to insert settings
DROP POLICY IF EXISTS "Allow admin users to insert settings" ON public.app_settings;
CREATE POLICY "Allow admin users to insert settings" ON public.app_settings
    FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email'));

-- Allow admin users to update settings
DROP POLICY IF EXISTS "Allow admin users to update settings" ON public.app_settings;
CREATE POLICY "Allow admin users to update settings" ON public.app_settings
    FOR UPDATE
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email'));

-- Allow admin users to delete settings
DROP POLICY IF EXISTS "Allow admin users to delete settings" ON public.app_settings;
CREATE POLICY "Allow admin users to delete settings" ON public.app_settings
    FOR DELETE
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email'));

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at timestamp
DROP TRIGGER IF EXISTS set_updated_at ON public.app_settings;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.app_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Clear existing data
TRUNCATE TABLE public.admin_users CASCADE;
TRUNCATE TABLE public.app_settings CASCADE;

-- Insert admin user
INSERT INTO public.admin_users (email)
VALUES ('admin@faceyoga.com');

-- Insert default settings
INSERT INTO public.app_settings (
    id,
    business_name,
    description,
    primary_color,
    secondary_color,
    tagline,
    home_title,
    social_links,
    contact_email,
    contact_phone,
    about_text
) VALUES (
    '2a7fcef4-2fc1-43d9-9231-ab071173f452',
    'Face Yoga App',
    'Transform your face naturally with our guided face yoga exercises',
    '#4FD1C5',
    '#38B2AC',
    'Your Natural Face Transformation Journey',
    'Welcome to Face Yoga',
    '{"facebook": "", "instagram": "", "twitter": "", "youtube": ""}',
    NULL,
    NULL,
    NULL
);
