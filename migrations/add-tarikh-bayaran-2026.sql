-- ============================================================
-- MIGRATION: Add TARIKH_BAYARAN_2026 Column
-- Run this in Supabase SQL Editor for SISTEM-MESYUARAT-DPMM-JOHOR
-- ============================================================

-- Add the new column to AHLI DPMM JOHOR table (if referenced)
-- Note: Meeting system may reference member data
-- This migration is primarily for the member system

-- ============================================================
-- VERIFICATION
-- ============================================================

-- Check if AHLI DPMM JOHOR table exists in this database
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'AHLI DPMM JOHOR';
