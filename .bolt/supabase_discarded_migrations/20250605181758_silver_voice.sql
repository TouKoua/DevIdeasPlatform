/*
  # Fix profiles table structure and policies

  1. Changes
    - Remove password column (handled by Supabase Auth)
    - Add proper RLS policies for profile creation
  
  2. Security
    - Enable RLS
    - Add policy for profile creation
    - Add policy for profile updates
*/

-- Remove password column if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'password'
  ) THEN
    ALTER TABLE profiles DROP COLUMN password;
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Add policy for creating profiles (only during signup)
CREATE POLICY "Users can create their own profile" 
  ON profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Add policy for updating profiles
CREATE POLICY "Users can update their own profile" 
  ON profiles 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);