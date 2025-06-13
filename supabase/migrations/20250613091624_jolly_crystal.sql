/*
  # Add project status field

  1. Changes
    - Add `status` column to projects table with enum values
    - Add `show_status` column to control visibility
    - Default status to 'recruiting' and show_status to true

  2. Security
    - No changes to RLS policies needed
    - Project creators can set and update these fields through existing policies
*/

-- Add status column to projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'status'
  ) THEN
    ALTER TABLE projects ADD COLUMN status text DEFAULT 'recruiting' CHECK (status IN ('recruiting', 'working', 'completed'));
  END IF;
END $$;

-- Add show_status column to projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'show_status'
  ) THEN
    ALTER TABLE projects ADD COLUMN show_status boolean DEFAULT true;
  END IF;
END $$;

-- Set default values for existing projects
UPDATE projects SET status = 'recruiting' WHERE status IS NULL;
UPDATE projects SET show_status = true WHERE show_status IS NULL;