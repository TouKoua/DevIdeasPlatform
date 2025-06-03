/*
  # Initial Schema Setup

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `avatar_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `projects`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `difficulty` (text)
      - `estimated_time` (text)
      - `created_at` (timestamp)
      - `created_by` (uuid, references profiles)
    
    - `project_tags`
      - `project_id` (uuid, references projects)
      - `tag` (text)
      - Primary key (project_id, tag)
    
    - `project_upvotes`
      - `project_id` (uuid, references projects)
      - `user_id` (uuid, references profiles)
      - `created_at` (timestamp)
      - Primary key (project_id, user_id)
    
    - `saved_projects`
      - `project_id` (uuid, references projects)
      - `user_id` (uuid, references profiles)
      - `created_at` (timestamp)
      - Primary key (project_id, user_id)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_time text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL
);

-- Create project_tags table
CREATE TABLE project_tags (
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  tag text NOT NULL,
  PRIMARY KEY (project_id, tag)
);

-- Create project_upvotes table
CREATE TABLE project_upvotes (
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);

-- Create saved_projects table
CREATE TABLE saved_projects (
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_projects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Projects are viewable by everyone" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Project tags are viewable by everyone" ON project_tags
  FOR SELECT USING (true);

CREATE POLICY "Project creators can manage tags" ON project_tags
  USING (auth.uid() IN (SELECT created_by FROM projects WHERE id = project_id))
  WITH CHECK (auth.uid() IN (SELECT created_by FROM projects WHERE id = project_id));

CREATE POLICY "Upvotes are viewable by everyone" ON project_upvotes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upvote" ON project_upvotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their upvotes" ON project_upvotes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Saved projects are viewable by the owner" ON saved_projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can save projects" ON saved_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave projects" ON saved_projects
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();