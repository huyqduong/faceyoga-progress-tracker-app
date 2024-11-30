-- Create course_purchases table
CREATE TABLE IF NOT EXISTS course_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_intent_id TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    receipt_url TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(payment_intent_id)
);

-- Create course_access table
CREATE TABLE IF NOT EXISTS course_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
    purchase_id UUID NOT NULL REFERENCES course_purchases(id) ON DELETE CASCADE,
    access_type TEXT NOT NULL CHECK (access_type IN ('lifetime', 'subscription', 'trial')),
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- Add price and currency columns to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_course_purchases_user_id ON course_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_course_purchases_course_id ON course_purchases(course_id);
CREATE INDEX IF NOT EXISTS idx_course_purchases_status ON course_purchases(status);
CREATE INDEX IF NOT EXISTS idx_course_access_user_id ON course_access(user_id);
CREATE INDEX IF NOT EXISTS idx_course_access_course_id ON course_access(course_id);
CREATE INDEX IF NOT EXISTS idx_course_access_purchase_id ON course_access(purchase_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_course_purchases_updated_at
    BEFORE UPDATE ON course_purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_access_updated_at
    BEFORE UPDATE ON course_access
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create triggers for automatic course access

-- Create function to handle completed purchases
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

-- Create trigger for completed purchases
DROP TRIGGER IF EXISTS on_purchase_completed ON course_purchases;
CREATE TRIGGER on_purchase_completed
    AFTER INSERT OR UPDATE OF status
    ON course_purchases
    FOR EACH ROW
    EXECUTE FUNCTION handle_completed_purchase();

-- RLS Policies

-- Enable RLS on tables
ALTER TABLE course_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_access ENABLE ROW LEVEL SECURITY;

-- Course Purchases Policies

-- Users can view their own purchases
CREATE POLICY "Users can view their own purchases"
ON course_purchases FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create their own purchases
CREATE POLICY "Users can create their own purchases"
ON course_purchases FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Only admins can update purchases
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

-- Course Access Policies

-- Users can view their own course access
CREATE POLICY "Users can view their own course access"
ON course_access FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only admins can insert course access
CREATE POLICY "Only admins can insert course access"
ON course_access FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);

-- Only admins can update course access
CREATE POLICY "Only admins can update course access"
ON course_access FOR UPDATE
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
