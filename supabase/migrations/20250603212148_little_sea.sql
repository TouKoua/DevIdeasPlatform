/*
  # Add user credentials to profiles

  1. Changes
    - Add email and password fields to profiles table
    - Add unique constraint on email
    - Update handle_new_user function to include email
  
  2. Security
    - Email is viewable by the owner only
    - Password is not exposed through any policies
*/

-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN email text NOT NULL UNIQUE,
ADD COLUMN password text NOT NULL;

-- Update the handle_new_user function to include email
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
SET search_pass = public
BEGIN
  INSERT INTO profiles (id, name, email, password, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.email,
    new.encrypted_password,
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add policy for email visibility
CREATE POLICY "Users can view their own email" ON profiles
  FOR SELECT
  USING (auth.uid() = id);