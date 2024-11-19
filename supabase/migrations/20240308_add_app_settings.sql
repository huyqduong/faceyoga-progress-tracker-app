-- Create app_settings table
CREATE TABLE app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name TEXT NOT NULL DEFAULT 'Renew and Glow Face Yoga',
    logo_url TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    social_links JSONB DEFAULT '{}',
    about_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "App settings are viewable by everyone"
    ON app_settings FOR SELECT
    USING (true);

CREATE POLICY "Only admins can update app settings"
    ON app_settings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create storage bucket for logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'logos',
    'logos',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

-- Create storage policies for logos
CREATE POLICY "Logo images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'logos');

CREATE POLICY "Only admins can manage logos"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'logos' AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_app_settings_updated_at
    BEFORE UPDATE ON app_settings
    FOR EACH ROW
    EXECUTE PROCEDURE handle_updated_at();

-- Insert default settings
INSERT INTO app_settings (business_name)
VALUES ('Renew and Glow Face Yoga')
ON CONFLICT DO NOTHING;