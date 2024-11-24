-- Add welcome_video column to courses table
ALTER TABLE courses ADD COLUMN welcome_video TEXT;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.courses;
DROP POLICY IF EXISTS "Enable insert for admin users only" ON public.courses;
DROP POLICY IF EXISTS "Enable update for admin users only" ON public.courses;
DROP POLICY IF EXISTS "Enable delete for admin users only" ON public.courses;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users" 
ON public.courses FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Enable insert for admin users only" 
ON public.courses FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Enable update for admin users only" 
ON public.courses FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Enable delete for admin users only" 
ON public.courses FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);
