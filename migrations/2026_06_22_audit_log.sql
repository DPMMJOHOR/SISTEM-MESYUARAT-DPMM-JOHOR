-- Migration: 2026-06-22 — DPMM_AUDIT_LOG
-- Run once in Supabase SQL Editor (both apps share the same project).
-- Safe to re-run: uses IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS DPMM_AUDIT_LOG (
  id          BIGSERIAL PRIMARY KEY,
  tindakan    TEXT          NOT NULL,            -- e.g. 'LOGIN', 'CIPTA_MESYUARAT'
  jadual      TEXT          NOT NULL,            -- target table name
  rekod_id    TEXT,                              -- affected record id (nullable)
  pengguna    TEXT,                              -- user_id / currentUser.id
  butiran     JSONB,                             -- optional extra payload
  dicipta_pada TIMESTAMPTZ  DEFAULT NOW()
);

-- Open RLS policy (same pattern as other DPMM tables — tighten later with RLS)
ALTER TABLE DPMM_AUDIT_LOG ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_anon_insert" ON DPMM_AUDIT_LOG;
CREATE POLICY "audit_anon_insert"
  ON DPMM_AUDIT_LOG FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "audit_anon_select" ON DPMM_AUDIT_LOG;
CREATE POLICY "audit_anon_select"
  ON DPMM_AUDIT_LOG FOR SELECT
  USING (true);
