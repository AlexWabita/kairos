-- ─────────────────────────────────────────
-- 005_auth_users_sync.sql
-- Sync auth.users → public.users table
-- ─────────────────────────────────────────

-- 1. Ensure the public.users table has the required columns
-- (adjust column list if your users table has more/less fields)

-- Optional: Add any missing columns safely
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS auth_id uuid UNIQUE,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- 2. Create or replace the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.created_at, now())
  )
  ON CONFLICT (auth_id) DO NOTHING;   -- prevent duplicate errors

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger (if it doesn't already exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();