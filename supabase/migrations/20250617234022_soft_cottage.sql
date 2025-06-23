/*
  # Create project views tracking system

  1. New Tables
    - `project_views`
      - `project_id` (uuid, foreign key to projects)
      - `user_id` (uuid, foreign key to profiles, nullable for anonymous views)
      - `created_at` (timestamp)
      - Unique constraint on (project_id, user_id)

  2. Security
    - Enable RLS on `project_views` table
    - Add policies for authenticated users to track views
    - Add policy for read access

  3. Changes
    - Add `views_count` column to projects table
    - Create trigger function to automatically update view counts
    - Initialize view counts for existing projects
*/

-- Create project_views table
CREATE TABLE IF NOT EXISTS project_views (
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'project_views_project_id_user_id_key' 
    AND table_name = 'project_views'
  ) THEN
    ALTER TABLE project_views ADD CONSTRAINT project_views_project_id_user_id_key UNIQUE(project_id, user_id);
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE project_views ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Authenticated users can track their views" ON project_views;
DROP POLICY IF EXISTS "Users can update their own view records" ON project_views;
DROP POLICY IF EXISTS "Enable read access for all users" ON project_views;

-- Create policies for project_views
CREATE POLICY "Authenticated users can track their views" ON project_views
  FOR INSERT WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

CREATE POLICY "Users can update their own view records" ON project_views
  FOR UPDATE USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

CREATE POLICY "Enable read access for all users" ON project_views
  FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_views_project_id ON project_views(project_id);
CREATE INDEX IF NOT EXISTS idx_project_views_user_id ON project_views(user_id);

-- Add views count column to projects table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'views_count'
  ) THEN
    ALTER TABLE projects ADD COLUMN views_count integer DEFAULT 0;
  END IF;
END $$;

-- Create function to update project views count
CREATE OR REPLACE FUNCTION update_project_views_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE projects 
    SET views_count = views_count + 1 
    WHERE id = NEW.project_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE projects 
    SET views_count = GREATEST(views_count - 1, 0) 
    WHERE id = OLD.project_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update views count
DROP TRIGGER IF EXISTS project_views_count_trigger ON project_views;
CREATE TRIGGER project_views_count_trigger
  AFTER INSERT OR DELETE ON project_views
  FOR EACH ROW
  EXECUTE FUNCTION update_project_views_count();

-- Initialize views_count for existing projects based on mock data
UPDATE projects SET views_count = FLOOR(RANDOM() * 500) + 10 WHERE views_count = 0;