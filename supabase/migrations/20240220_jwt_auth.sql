-- Create a function to verify Firebase JWT
CREATE OR REPLACE FUNCTION verify_firebase_jwt() RETURNS void AS $$
DECLARE
  _role text;
BEGIN
  -- Get role from profiles table
  SELECT role INTO _role
  FROM profiles
  WHERE user_id = auth.uid()::uuid;

  -- Set role for the current session
  IF _role = 'admin' THEN
    SET LOCAL ROLE authenticated_admin;
  ELSE
    SET LOCAL ROLE authenticated_user;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create roles
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated_user') THEN
    CREATE ROLE authenticated_user;
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated_admin') THEN
    CREATE ROLE authenticated_admin;
  END IF;
END $$;

-- Grant necessary permissions to roles
GRANT USAGE ON SCHEMA public TO authenticated_user, authenticated_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated_admin;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated_user;

-- Enable JWT authentication with Firebase
CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb AS $$
  BEGIN
    RETURN current_setting('request.jwt.claims', true)::jsonb;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN '{}'::jsonb;
  END;
$$ LANGUAGE plpgsql;

-- Function to get Firebase UID
CREATE OR REPLACE FUNCTION auth.uid() RETURNS text AS $$
  BEGIN
    RETURN (auth.jwt()->>'sub')::text;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN NULL;
  END;
$$ LANGUAGE plpgsql;