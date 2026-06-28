-- ============================================================
-- MIGRATION: Enable Supabase Auth
-- Run this in Supabase SQL Editor
-- ============================================================

-- Step 1: Enable Supabase Auth (if not already enabled)
-- This is done in Supabase Dashboard, but we verify here

-- Step 2: Migrate existing DPMM_USERS to Supabase Auth
-- Create a temporary table to hold migration data
CREATE TEMPORARY TABLE temp_user_migration AS
SELECT 
  user_id as email,
  nama as full_name,
  kata_laluan as password,
  peranan as role,
  aktif as active
FROM DPMM_USERS;

-- Step 3: Insert users into Supabase Auth using the auth.users table
-- Note: This requires service role key and should be done via Edge Function
-- The actual migration will be done via a script

-- Step 4: Update existing tables to reference auth.uid() instead of user_id
-- This will be done after users are migrated

-- Step 5: Set up user metadata for role-based access
-- This will be set during user creation

-- ============================================================
-- POST-MIGRATION: After users are migrated to Supabase Auth
-- ============================================================

-- Add role column to auth.users metadata (done during user creation)
-- No SQL needed - roles stored in raw_user_meta_data

-- Update DPMM_MESYUARAT to use auth.uid()
ALTER TABLE DPMM_MESYUARAT 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

-- Migrate created_by to auth_user_id
UPDATE DPMM_MESYUARAT m
SET auth_user_id = u.id
FROM auth.users u
WHERE m.created_by = u.email;

-- Update DPMM_KEHADIRAN to use auth.uid()
ALTER TABLE DPMM_KEHADIRAN 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

UPDATE DPMM_KEHADIRAN k
SET auth_user_id = u.id
FROM auth.users u
WHERE k.dikemaskini_oleh = u.email;

-- Update DPMM_BLAST_QUEUE to use auth.uid()
ALTER TABLE DPMM_BLAST_QUEUE 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

UPDATE DPMM_BLAST_QUEUE b
SET auth_user_id = u.id
FROM auth.users u
WHERE b.dibuat_oleh = u.email;

-- Update DPMM_AUDIT_LOG to use auth.uid()
ALTER TABLE DPMM_AUDIT_LOG 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

UPDATE DPMM_AUDIT_LOG a
SET auth_user_id = u.id
FROM auth.users u
WHERE a.user_id = u.email;

-- ============================================================
-- CLEANUP: After successful migration
-- ============================================================

-- Drop old DPMM_USERS table (after verification)
-- DROP TABLE DPMM_USERS;

-- Drop old text columns (after verification)
-- ALTER TABLE DPMM_MESYUARAT DROP COLUMN created_by;
-- ALTER TABLE DPMM_KEHADIRAN DROP COLUMN dikemaskini_oleh;
-- ALTER TABLE DPMM_BLAST_QUEUE DROP COLUMN dibuat_oleh;
-- ALTER TABLE DPMM_AUDIT_LOG DROP COLUMN user_id;
