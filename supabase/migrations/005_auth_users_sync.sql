-- Trigger to sync Supabase auth.users inserts to custom users table
-- Runs AFTER INSERT on auth.users

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (auth
