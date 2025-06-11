/*
  # Add contributor count visibility toggle

  1. Changes
    - Add `show_contributor_count` column to projects table
    - Default to true (show by default)
    - Allow project creators to toggle visibility

  2. Security
    - No changes to RLS policies needed
    - Column is accessible through existing project policies
*/

-- Add show_contributor_count column to projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'show_contributor_count'
  ) THEN
    ALTER TABLE projects ADD COLUMN show_contributor_count boolean DEFAULT true;
  END IF;
END $$;

-- Set existing projects to show contributor count by default
UPDATE projects SET show_contributor_count = true WHERE show_contributor_count IS NULL;