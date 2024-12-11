-- Create app_settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    business_name text NOT NULL,
    tagline text NOT NULL,
    home_title text NOT NULL,
    logo_url text,
    description text NOT NULL,
    contact_email text,
    contact_phone text,
    social_links jsonb DEFAULT '{}'::jsonb NOT NULL,
    about_text text,
    primary_color text NOT NULL,
    secondary_color text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'app_settings' 
        AND policyname = 'Enable read access for all users'
    ) THEN
        CREATE POLICY "Enable read access for all users" ON public.app_settings
            FOR SELECT
            USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'app_settings' 
        AND policyname = 'Enable insert for admin users'
    ) THEN
        CREATE POLICY "Enable insert for admin users" ON public.app_settings
            FOR INSERT TO authenticated
            WITH CHECK (auth.uid() IN (SELECT auth.uid() FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'app_settings' 
        AND policyname = 'Enable update for admin users'
    ) THEN
        CREATE POLICY "Enable update for admin users" ON public.app_settings
            FOR UPDATE TO authenticated
            USING (auth.uid() IN (SELECT auth.uid() FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'))
            WITH CHECK (auth.uid() IN (SELECT auth.uid() FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'app_settings' 
        AND policyname = 'Enable delete for admin users'
    ) THEN
        CREATE POLICY "Enable delete for admin users" ON public.app_settings
            FOR DELETE TO authenticated
            USING (auth.uid() IN (SELECT auth.uid() FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));
    END IF;
END $$;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_triggers 
        WHERE tgname = 'handle_updated_at_app_settings'
    ) THEN
        CREATE TRIGGER handle_updated_at_app_settings
            BEFORE UPDATE ON public.app_settings
            FOR EACH ROW
            EXECUTE PROCEDURE handle_updated_at();
    END IF;
END $$;

-- Insert default settings if not exists
INSERT INTO public.app_settings (
    id,
    business_name,
    tagline,
    home_title,
    description,
    primary_color,
    secondary_color
)
SELECT
    '2a7fcef4-2fc1-43d9-9231-ab071173f452',
    'Face Yoga App',
    'Your Natural Face Transformation Journey',
    'Welcome to Face Yoga',
    'Transform your face naturally with our guided face yoga exercises',
    '#4FD1C5',
    '#38B2AC'
WHERE NOT EXISTS (
    SELECT 1 FROM public.app_settings 
    WHERE id = '2a7fcef4-2fc1-43d9-9231-ab071173f452'
);
