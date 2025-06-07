/*
  # Update handle_new_user function
  
  1. Changes
    - Update handle_new_user function to properly create user profiles
    - Add trigger to automatically create profiles for new users
    
  2. Security
    - Function is security definer to ensure it has necessary permissions
    - Only triggered on new user creation
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();