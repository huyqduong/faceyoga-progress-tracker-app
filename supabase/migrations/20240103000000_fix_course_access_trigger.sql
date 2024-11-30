-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_purchase_completed ON course_purchases;
DROP FUNCTION IF EXISTS handle_completed_purchase();

-- Recreate function with security definer to bypass RLS
CREATE OR REPLACE FUNCTION handle_completed_purchase()
RETURNS TRIGGER
SECURITY DEFINER -- This makes the function run with the privileges of the owner
SET search_path = public -- This is important for security
AS $$
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

-- Recreate trigger
CREATE TRIGGER on_purchase_completed
    AFTER INSERT OR UPDATE OF status
    ON course_purchases
    FOR EACH ROW
    EXECUTE FUNCTION handle_completed_purchase();

-- Drop existing course access policies
DROP POLICY IF EXISTS "Users can view their own course access" ON course_access;
DROP POLICY IF EXISTS "Only admins can insert course access" ON course_access;
DROP POLICY IF EXISTS "Only admins can update course access" ON course_access;

-- Recreate course access policies
CREATE POLICY "Users can view their own course access"
ON course_access FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can manage course access"
ON course_access FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT INSERT ON course_access TO authenticated;
