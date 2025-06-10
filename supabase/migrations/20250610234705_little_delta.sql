/*
  # Add additional profile fields

  1. New Columns
    - Add `bio` (text, optional) - User's biography
    - Add `location` (text, optional) - User's location
    - Add `website` (text, optional) - User's website URL
    - Add `github` (text, optional) - User's GitHub username
    - Add `twitter` (text, optional) - User's Twitter username

  2. Updates
    - These fields are all optional and can be null
    - No breaking changes to existing data
*/

-- Add new profile fields
DO $$
BEGIN
  -- Add bio column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio text;
  END IF;

  -- Add location column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'location'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location text;
  END IF;

  -- Add website column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'website'
  ) THEN
    ALTER TABLE profiles ADD COLUMN website text;
  END IF;

  -- Add github column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'github'
  ) THEN
    ALTER TABLE profiles ADD COLUMN github text;
  END IF;

  -- Add twitter column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'twitter'
  ) THEN
    ALTER TABLE profiles ADD COLUMN twitter text;
  END IF;
END $$;