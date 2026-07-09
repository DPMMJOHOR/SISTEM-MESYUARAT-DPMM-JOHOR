-- Enable and verify RLS policies for all Supabase tables
-- This script enables RLS and creates proper policies for security

-- DPMM_MESYUARAT
ALTER TABLE DPMM_MESYUARAT ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "anon all mesyuarat" ON DPMM_MESYUARAT;

-- Create proper RLS policies for DPMM_MESYUARAT
CREATE POLICY "Admin full access on DPMM_MESYUARAT" ON DPMM_MESYUARAT
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- DPMM_KEHADIRAN
ALTER TABLE DPMM_KEHADIRAN ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "anon all kehadiran" ON DPMM_KEHADIRAN;

-- Create proper RLS policies for DPMM_KEHADIRAN
CREATE POLICY "Admin full access on DPMM_KEHADIRAN" ON DPMM_KEHADIRAN
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- DPMM_USERS
ALTER TABLE DPMM_USERS ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "anon read users" ON DPMM_USERS;
DROP POLICY IF EXISTS "admin write users" ON DPMM_USERS;

-- Create proper RLS policies for DPMM_USERS
CREATE POLICY "Admin full access on DPMM_USERS" ON DPMM_USERS
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- DPMM_TEMPLATES
ALTER TABLE DPMM_TEMPLATES ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "anon all templates" ON DPMM_TEMPLATES;

-- Create proper RLS policies for DPMM_TEMPLATES
CREATE POLICY "Admin full access on DPMM_TEMPLATES" ON DPMM_TEMPLATES
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- DPMM_SEND_LOG
ALTER TABLE DPMM_SEND_LOG ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "anon all sendlog" ON DPMM_SEND_LOG;

-- Create proper RLS policies for DPMM_SEND_LOG
CREATE POLICY "Admin full access on DPMM_SEND_LOG" ON DPMM_SEND_LOG
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- DPMM_BLAST_QUEUE
ALTER TABLE DPMM_BLAST_QUEUE ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "anon all blast_queue" ON DPMM_BLAST_QUEUE;

-- Create proper RLS policies for DPMM_BLAST_QUEUE
CREATE POLICY "Admin full access on DPMM_BLAST_QUEUE" ON DPMM_BLAST_QUEUE
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Verification query to check RLS status
SELECT 
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN 'ENABLED'
    ELSE 'DISABLED'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('DPMM_MESYUARAT', 'DPMM_KEHADIRAN', 'DPMM_USERS', 'DPMM_TEMPLATES', 'DPMM_SEND_LOG', 'DPMM_BLAST_QUEUE')
ORDER BY tablename;

-- Verification query to check policy count per table
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('DPMM_MESYUARAT', 'DPMM_KEHADIRAN', 'DPMM_USERS', 'DPMM_TEMPLATES', 'DPMM_SEND_LOG', 'DPMM_BLAST_QUEUE')
GROUP BY schemaname, tablename
ORDER BY tablename;
