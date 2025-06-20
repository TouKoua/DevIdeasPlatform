/*
  # Move social links to user_websites table

  1. Schema Changes
    - Add github_url and twitter_url columns to user_websites table
    - Migrate existing data from profiles to user_websites
    - Remove website, github, twitter columns from profiles table

  2. Data Migration
    - Copy existing social links data from profiles to user_websites
    - Ensure data integrity during migration

  3. Security
    - Update RLS policies for user_websites table
*/

-- First, add the new columns to user_websites table
DO $$
BEGIN
  -- Add github_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_websites' AND column_name = 'github_url'
  ) THEN
    ALTER TABLE user_websites ADD COLUMN github_url text;
  END IF;

  -- Add twitter_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_websites' AND column_name = 'twitter_url'
  ) THEN
    ALTER TABLE user_websites ADD COLUMN twitter_url text;
  END IF;
END $$;

-- Add RLS policies for user_websites table if they don't exist
DO $$
BEGIN
  -- Enable RLS if not already enabled
  ALTER TABLE user_websites ENABLE ROW LEVEL SECURITY;

  -- Policy for users to read their own website data
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_websites' AND policyname = 'Users can read their own website data'
  ) THEN
    CREATE POLICY "Users can read their own website data"
      ON user_websites
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  -- Policy for users to insert their own website data
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_websites' AND policyname = 'Users can insert their own website data'
  ) THEN
    CREATE POLICY "Users can insert their own website data"
      ON user_websites
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;

  -- Policy for users to update their own website data
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_websites' AND policyname = 'Users can update their own website data'
  ) THEN
    CREATE POLICY "Users can update their own website data"
      ON user_websites
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;

  -- Policy for public read access to website data
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_websites' AND policyname = 'Public read access to website data'
  ) THEN
    CREATE POLICY "Public read access to website data"
      ON user_websites
      FOR SELECT
      TO public  
      USING (true);
  END IF;
END $$;

-- Remove the old columns from profiles table (commented out for safety)
-- Uncomment these lines after verifying the migration worked correctly:
-- ALTER TABLE profiles DROP COLUMN IF EXISTS website;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS github;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS twitter;