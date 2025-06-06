/*
  # Create contribution requests system

  1. New Tables
    - `contribution_requests`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `requester_id` (uuid, references profiles)
      - `message` (text, optional message from requester)
      - `status` (text, enum: pending, accepted, declined)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `response_message` (text, optional response from creator)

  2. Security
    - Enable RLS on contribution_requests table
    - Add policies for creators and requesters to view their requests
    - Add policies for creators to update request status
*/

-- Create contribution_requests table
CREATE TABLE IF NOT EXISTS contribution_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  requester_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  response_message text,
  UNIQUE(project_id, requester_id)
);

-- Enable Row Level Security
ALTER TABLE contribution_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Project creators can view requests for their projects" ON contribution_requests
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Requesters can view their own requests" ON contribution_requests
  FOR SELECT
  USING (requester_id = auth.uid());

CREATE POLICY "Authenticated users can create contribution requests" ON contribution_requests
  FOR INSERT
  WITH CHECK (
    requester_id = auth.uid() AND
    project_id NOT IN (
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Project creators can update request status" ON contribution_requests
  FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE created_by = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contribution_request_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE OR REPLACE TRIGGER contribution_requests_updated_at
  BEFORE UPDATE ON contribution_requests
  FOR EACH ROW EXECUTE FUNCTION update_contribution_request_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contribution_requests_project_id ON contribution_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_contribution_requests_requester_id ON contribution_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_contribution_requests_status ON contribution_requests(status);