/*
  # Add avatar storage support to profiles table

  1. Changes
    - Add `avatar_url_uploaded` column to profiles table to track Supabase Storage URLs
    - This allows differentiation between external URLs and uploaded avatars
    - Existing `avatar_url` column remains for backward compatibility with external URLs

  2. New Columns
    - `avatar_url_uploaded` (text, nullable): URL of avatar uploaded to Supabase Storage
    
  3. Notes
    - When a user uploads an avatar, it's stored here
    - External avatar URLs continue to use the existing `avatar_url` column
    - Display logic prioritizes uploaded avatar over external URL
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'avatar_url_uploaded'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url_uploaded text;
  END IF;
END $$;
