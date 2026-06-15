-- 1. Create or replace the function to handle new user signups
-- This ensures email and phone are synchronized from auth.users to public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, photo_url, is_admin)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'No Name'),
    new.email,
    COALESCE(new.phone, new.raw_user_meta_data->>'phone_number', new.raw_user_meta_data->>'phone'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'photo_url', new.raw_user_meta_data->>'picture', null),
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = COALESCE(public.profiles.phone, EXCLUDED.phone),
    photo_url = COALESCE(public.profiles.photo_url, EXCLUDED.photo_url);
  RETURN NEW;
END;
$$;

-- 2. Recreate the trigger on auth.users (if it doesn't exist or to ensure it points to the updated function)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Backfill query: Synchronize any existing profiles with missing emails and phones
UPDATE public.profiles p
SET 
  email = u.email,
  phone = COALESCE(p.phone, u.phone, u.raw_user_meta_data->>'phone_number', u.raw_user_meta_data->>'phone')
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.phone IS NULL);
