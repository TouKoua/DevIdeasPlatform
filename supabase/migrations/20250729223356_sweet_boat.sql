/*
  # Fix contribution request status constraint

  1. Changes
    - Update the status check constraint to include 'removed' status
    - This allows contribution requests to have a 'removed' status when teammates are removed from projects

  2. Security
    - No changes to RLS policies needed
    - Existing policies will continue to work with the new status
*/

-- Drop the existing constraint
ALTER TABLE contribution_requests DROP CONSTRAINT IF EXISTS contribution_requests_status_check;

-- Add the updated constraint that includes 'removed'
ALTER TABLE contribution_requests ADD CONSTRAINT contribution_requests_status_check 
  CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text, 'removed'::text]));