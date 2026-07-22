-- ============================================================
-- RLS MIGRATION VERIFICATION SCRIPT
-- Run this in Supabase SQL Editor to verify RLS policies are applied
-- ============================================================

-- Check RLS status on all main tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'DPMM_MESYUARAT', 
    'DPMM_KEHADIRAN', 
    'DPMM_USERS', 
    'DPMM_TEMPLATES', 
    'DPMM_SEND_LOG', 
    'DPMM_BLAST_QUEUE'
  )
ORDER BY tablename;

-- Check policy count per table
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN (
    'DPMM_MESYUARAT', 
    'DPMM_KEHADIRAN', 
    'DPMM_USERS', 
    'DPMM_TEMPLATES', 
    'DPMM_SEND_LOG', 
    'DPMM_BLAST_QUEUE'
  )
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Check for open policies (USING (true)) - these should NOT exist after migration
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_expression
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN (
    'DPMM_MESYUARAT', 
    'DPMM_KEHADIRAN', 
    'DPMM_USERS', 
    'DPMM_TEMPLATES', 
    'DPMM_SEND_LOG', 
    'DPMM_BLAST_QUEUE'
  )
  AND qual = 'true'::text
ORDER BY tablename;

-- Check for secure policies (USING (auth.uid() IS NOT NULL)) - these SHOULD exist after migration
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_expression
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN (
    'DPMM_MESYUARAT', 
    'DPMM_KEHADIRAN', 
    'DPMM_USERS', 
    'DPMM_TEMPLATES', 
    'DPMM_SEND_LOG', 
    'DPMM_BLAST_QUEUE'
  )
  AND qual LIKE '%auth.uid() IS NOT NULL%'
ORDER BY tablename;

-- Expected results after successful migration:
-- 1. All tables should have rls_enabled = true
-- 2. Each table should have at least 1 policy
-- 3. No policies should have USING (true) - these are insecure
-- 4. Policies should have USING (auth.uid() IS NOT NULL) - these are secure
