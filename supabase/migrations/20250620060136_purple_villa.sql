/*
  # Create notifications system

  1. New Tables
    - `user_notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles.id)
      - `title` (text)
      - `message` (text)
      - `read_status` (boolean, default false)
      - `notification_type` (text)
      - `related_project_id` (uuid, optional foreign key to projects.id)
      - `related_user_id` (uuid, optional foreign key to profiles.id)
      - `link_url` (text, optional)
      - `created_at` (timestamp with time zone, default now())

  2. Security
    - Enable RLS on `user_notifications` table
    - Add policies for users to read/update their own notifications

  3. Functions
    - Create function to automatically create notifications for various events
    - Create trigger for contribution requests

  4. Indexes
    - Add indexes for efficient querying
*/

-- Create the user_notifications table
CREATE TABLE IF NOT EXISTS user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  read_status boolean DEFAULT false,
  notification_type text NOT NULL,
  related_project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  related_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  link_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own notifications"
  ON user_notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON user_notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read_status ON user_notifications(read_status);
CREATE INDEX IF NOT EXISTS idx_user_notifications_type ON user_notifications(notification_type);

-- Function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_notification_type text,
  p_related_project_id uuid DEFAULT NULL,
  p_related_user_id uuid DEFAULT NULL,
  p_link_url text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO user_notifications (
    user_id,
    title,
    message,
    notification_type,
    related_project_id,
    related_user_id,
    link_url
  ) VALUES (
    p_user_id,
    p_title,
    p_message,
    p_notification_type,
    p_related_project_id,
    p_related_user_id,
    p_link_url
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle contribution request notifications
CREATE OR REPLACE FUNCTION handle_contribution_request_notification()
RETURNS TRIGGER AS $$
DECLARE
  project_title text;
  project_creator_id uuid;
  requester_name text;
BEGIN
  -- Get project details
  SELECT title, created_by INTO project_title, project_creator_id
  FROM projects WHERE id = NEW.project_id;
  
  -- Get requester name
  SELECT name INTO requester_name
  FROM profiles WHERE id = NEW.requester_id;
  
  -- Create notification for project creator
  IF NEW.status = 'pending' THEN
    PERFORM create_notification(
      project_creator_id,
      'New Contribution Request',
      requester_name || ' wants to contribute to "' || project_title || '"',
      'contribution_request',
      NEW.project_id,
      NEW.requester_id,
      '/project/' || NEW.project_id || '/contributions'
    );
  ELSIF NEW.status = 'accepted' THEN
    PERFORM create_notification(
      NEW.requester_id,
      'Contribution Request Accepted',
      'Your request to contribute to "' || project_title || '" has been accepted!',
      'contribution_accepted',
      NEW.project_id,
      project_creator_id,
      '/project/' || NEW.project_id
    );
  ELSIF NEW.status = 'declined' THEN
    PERFORM create_notification(
      NEW.requester_id,
      'Contribution Request Declined',
      'Your request to contribute to "' || project_title || '" has been declined.',
      'contribution_declined',
      NEW.project_id,
      project_creator_id,
      '/project/' || NEW.project_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for contribution request notifications
DROP TRIGGER IF EXISTS contribution_request_notification_trigger ON contribution_requests;
CREATE TRIGGER contribution_request_notification_trigger
  AFTER INSERT OR UPDATE OF status ON contribution_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_contribution_request_notification();

-- Function to handle project view notifications (milestone-based)
CREATE OR REPLACE FUNCTION handle_project_view_milestone()
RETURNS TRIGGER AS $$
DECLARE
  project_creator_id uuid;
  project_title text;
  view_count integer;
BEGIN
  -- Get project details
  SELECT created_by, title, views_count INTO project_creator_id, project_title, view_count
  FROM projects WHERE id = NEW.project_id;
  
  -- Create milestone notifications for view counts
  IF view_count IN (10, 25, 50, 100, 250, 500, 1000) THEN
    PERFORM create_notification(
      project_creator_id,
      'Project Milestone Reached!',
      '"' || project_title || '" has reached ' || view_count || ' views!',
      'view_milestone',
      NEW.project_id,
      NULL,
      '/project/' || NEW.project_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for project view milestones
DROP TRIGGER IF EXISTS project_view_milestone_trigger ON project_views;
CREATE TRIGGER project_view_milestone_trigger
  AFTER INSERT ON project_views
  FOR EACH ROW
  EXECUTE FUNCTION handle_project_view_milestone();

-- Function to create welcome notification for new users
CREATE OR REPLACE FUNCTION handle_new_user_welcome()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_notification(
    NEW.id,
    'Welcome to CodeIdeas!',
    'Start exploring project ideas or share your own creative concepts with the community.',
    'welcome',
    NULL,
    NULL,
    '/'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for welcome notifications
DROP TRIGGER IF EXISTS new_user_welcome_trigger ON profiles;
CREATE TRIGGER new_user_welcome_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_welcome();