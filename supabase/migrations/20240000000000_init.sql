-- Drop all existing policies first
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.exercises;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.exercises;
DROP POLICY IF EXISTS "Enable insert for authenticated admin users only" ON public.exercises;
DROP POLICY IF EXISTS "Enable update for authenticated admin users only" ON public.exercises;
DROP POLICY IF EXISTS "Enable delete for authenticated admin users only" ON public.exercises;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Enable read access for authenticated users"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable update for authenticated users"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Exercises policies
CREATE POLICY "Enable all access for authenticated users"
ON public.exercises
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.exercises TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
