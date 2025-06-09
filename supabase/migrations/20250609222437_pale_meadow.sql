/*
  # Add updated_at column to projects table

  1. Changes
    - Add `updated_at` column to `projects` table with default value of now()
    - Create trigger to automatically update the timestamp when a row is modified
    - Set existing projects to have updated_at equal to created_at

  2. Security
    - No changes to RLS policies needed
*/

-- Add updated_at column to projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE projects ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Update existing projects to set updated_at to created_at
UPDATE projects SET updated_at = created_at WHERE updated_at IS NULL;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
DROP TRIGGER IF EXISTS projects_updated_at ON projects;
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_projects_updated_at();