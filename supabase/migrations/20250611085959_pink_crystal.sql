/*
  # Add contributor count fields to projects

  1. Changes
    - Add `max_contributors` column to projects table (nullable integer)
    - Add `current_contributors` column to projects table (integer, default 0)
    - Update existing projects to have current_contributors = 0

  2. Security
    - No changes to RLS policies needed
    - Project creators can set and update these fields
*/

-- Add max_contributors column to projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'max_contributors'
  ) THEN
    ALTER TABLE projects ADD COLUMN max_contributors integer;
  END IF;
END $$;

-- Add current_contributors column to projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'current_contributors'
  ) THEN
    ALTER TABLE projects ADD COLUMN current_contributors integer DEFAULT 0;
  END IF;
END $$;

-- Update existing projects to have current_contributors = 0 if null
UPDATE projects SET current_contributors = 0 WHERE current_contributors IS NULL;

-- Create function to update current contributors count based on accepted contribution requests
CREATE OR REPLACE FUNCTION update_current_contributors_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
    UPDATE projects 
    SET current_contributors = current_contributors + 1 
    WHERE id = NEW.project_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If status changed from accepted to something else
    IF OLD.status = 'accepted' AND NEW.status != 'accepted' THEN
      UPDATE projects 
      SET current_contributors = GREATEST(current_contributors - 1, 0) 
      WHERE id = NEW.project_id;
    -- If status changed to accepted from something else
    ELSIF OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
      UPDATE projects 
      SET current_contributors = current_contributors + 1 
      WHERE id = NEW.project_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'accepted' THEN
    UPDATE projects 
    SET current_contributors = GREATEST(current_contributors - 1, 0) 
    WHERE id = OLD.project_id;
    RETURN OLD;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update current contributors count
DROP TRIGGER IF EXISTS contribution_requests_contributors_count_trigger ON contribution_requests;
CREATE TRIGGER contribution_requests_contributors_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON contribution_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_current_contributors_count();

-- Initialize current_contributors for existing projects based on accepted contribution requests
UPDATE projects 
SET current_contributors = (
  SELECT COUNT(*) 
  FROM contribution_requests 
  WHERE contribution_requests.project_id = projects.id 
  AND contribution_requests.status = 'accepted'
)
WHERE current_contributors = 0;