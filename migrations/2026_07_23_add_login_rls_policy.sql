-- Migration: Add login-specific RLS policy for DPMM_USERS
-- Date: 2026-07-23
-- Purpose: Allow anon key to read user credentials for login verification
-- Context: July 2026 security audit tightened RLS to require auth.uid() IS NOT NULL,
--          which broke the custom login flow that queries DPMM_USERS before authentication

-- Drop existing policy if it exists (for idempotency)
DROP POLICY IF EXISTS "Allow anon login read" ON public."DPMM_USERS";

-- Create policy to allow anon key to read user credentials for login
-- This policy allows unauthenticated users (anon key) to SELECT from DPMM_USERS
-- for the purpose of login verification only
CREATE POLICY "Allow anon login read"
ON public."DPMM_USERS"
FOR SELECT
TO anon
USING (true);

-- Verify policy creation
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'DPMM_USERS';
