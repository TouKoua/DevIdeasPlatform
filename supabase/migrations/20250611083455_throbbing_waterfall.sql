/*
  # Add project views tracking system

  1. New Tables
    - `project_views`
      - `project_id` (uuid, references projects)
      - `user_id` (uuid, references profiles, nullable for anonymous users)
      - `ip_address` (text, for tracking anonymous views)
      - `created_at` (timestamp)
      - Primary key (project_id, user_id) or (project_id, ip_address) for anonymous

  2. Security
    - Enable RLS on project_views table
    - Add policies for authenticated users to track their views
    - Add policies for anonymous users based on IP
*/

-- Create project_views table
CREATE TABLE IF NOT EXISTS project_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  ip_address text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id),
  UNIQUE(project_id, ip_address)
);

-- Enable Row Level Security
ALTER TABLE project_views ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view project views" ON project_views
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can track their views" ON project_views
  FOR INSERT WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (auth.uid() IS NULL AND ip_address IS NOT NULL)
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_views_project_id ON project_views(project_id);
CREATE INDEX IF NOT EXISTS idx_project_views_user_id ON project_views(user_id);
CREATE INDEX IF NOT EXISTS idx_project_views_ip_address ON project_views(ip_address);

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