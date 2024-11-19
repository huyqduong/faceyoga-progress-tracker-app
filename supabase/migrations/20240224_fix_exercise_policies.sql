-- First, drop all existing policies
DROP POLICY IF EXISTS "Allow select for everyone" ON exercises;
DROP POLICY IF EXISTS "Allow all operations for admin users" ON exercises;

-- Ensure RLS is enabled
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Create separate policies for each operation
CREATE POLICY "Allow select for everyone"
    ON exercises FOR SELECT
    USING (true);

CREATE POLICY "Allow insert for admin users"
    ON exercises FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Allow update for admin users"
    ON exercises FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Allow delete for admin users"
    ON exercises FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );