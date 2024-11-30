-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own purchases" ON course_purchases;
DROP POLICY IF EXISTS "Only admins can insert purchases" ON course_purchases;
DROP POLICY IF EXISTS "Only admins can update purchases" ON course_purchases;
DROP POLICY IF EXISTS "Users can create their own purchases" ON course_purchases;

-- Recreate policies for course purchases
CREATE POLICY "Users can view their own purchases"
ON course_purchases FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchases"
ON course_purchases FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
        SELECT 1 FROM courses 
        WHERE id = course_id
    )
);

CREATE POLICY "Only admins can update purchases"
ON course_purchases FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);

-- Create trigger for automatic course access if it doesn't exist
CREATE OR REPLACE FUNCTION handle_completed_purchase()
RETURNS TRIGGER AS $$
BEGIN
    -- If the purchase status is completed and it's a new completion (not previously completed)
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Insert course access record
        INSERT INTO course_access (
            user_id,
            course_id,
            purchase_id,
            access_type,
            starts_at,
            expires_at
        ) VALUES (
            NEW.user_id,
            NEW.course_id,
            NEW.id,
            'lifetime',
            NOW(),
            NULL
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_purchase_completed ON course_purchases;
CREATE TRIGGER on_purchase_completed
    AFTER INSERT OR UPDATE OF status
    ON course_purchases
    FOR EACH ROW
    EXECUTE FUNCTION handle_completed_purchase();
