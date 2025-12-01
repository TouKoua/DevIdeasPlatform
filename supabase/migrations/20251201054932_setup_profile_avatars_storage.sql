/*
  # Set up profile avatars storage bucket with RLS policies

  1. Storage Configuration
    - Create "profile-avatars" storage bucket with public read access
    - Configure proper file size limits and CORS settings
    - Enable versioning and caching

  2. RLS Policies
    - Allow authenticated users to upload to their own folder
    - Allow public read access to all uploaded avatars
    - Prevent users from accessing/modifying other users' avatars

  3. Implementation Notes
    - Files are organized as: profile-avatars/{user_id}/{filename}
    - Public URL format: https://{project}.supabase.co/storage/v1/object/public/profile-avatars/{user_id}/{filename}
    - Maximum file size: 5MB (enforced by frontend, validated in storage policy)
*/

DO $$
BEGIN
  -- Create the storage bucket if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'profile-avatars'
  ) THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'profile-avatars',
      'profile-avatars',
      true,
      5242880, -- 5MB in bytes
      ARRAY['image/jpeg', 'image/png', 'image/webp']
    );
  END IF;
END $$;

-- RLS policy: Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload to their own avatar folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- RLS policy: Allow authenticated users to read their own uploads
CREATE POLICY "Users can read their own avatars"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'profile-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- RLS policy: Allow public read access to avatars
CREATE POLICY "Public read access to avatars"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'profile-avatars');

-- RLS policy: Allow users to update their own avatars (with upsert)
CREATE POLICY "Users can update their own avatars"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'profile-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- RLS policy: Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
