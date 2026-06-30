-- Data Migration — Sistem Hebahan DPMM Johor (Unified Plan)
-- Run in Supabase SQL Editor AFTER schema migration
-- Migrates existing DPMM_MESYUARAT data to set event_type='meeting'
-- Migrates DPMM_KEHADIRAN to DPMM_RSVP

-- ── Set event_type='meeting' for existing DPMM_MESYUARAT records ───────────────────
UPDATE DPMM_MESYUARAT
SET event_type = 'meeting'
WHERE event_type IS NULL;

-- ── Migrate DPMM_KEHADIRAN to DPMM_RSVP ─────────────────────────────────────────────
INSERT INTO DPMM_RSVP (
  event_id,
  attendee_type,
  attendee_identifier,
  status,
  channel,
  response_timestamp,
  checked_in,
  check_in_timestamp,
  check_in_method,
  created_at
)
SELECT
  mesyuarat_id AS event_id,
  'member' AS attendee_type,
  no_ahli AS attendee_identifier,
  CASE
    WHEN status = 'Hadir' THEN 'Saya Hadir'
    WHEN status = 'Tidak Hadir' THEN 'Saya Tidak Hadir'
    WHEN status = 'Tidak Pasti' THEN 'Tidak Pasti'
    ELSE 'Belum Dihubungi'
  END AS status,
  'WhatsApp' AS channel,
  dikemaskini_pada AS response_timestamp,
  false AS checked_in,
  NULL AS check_in_timestamp,
  NULL AS check_in_method,
  created_at
FROM DPMM_KEHADIRAN
ON CONFLICT (event_id, attendee_identifier) DO NOTHING;

-- ── Verification Queries ───────────────────────────────────────────────────────
-- Verify migration counts
SELECT 'DPMM_MESYUARAT count' AS table_name, COUNT(*) AS count FROM DPMM_MESYUARAT;
SELECT 'DPMM_RSVP count' AS table_name, COUNT(*) AS count FROM DPMM_RSVP;
SELECT 'DPMM_KEHADIRAN count' AS table_name, COUNT(*) AS count FROM DPMM_KEHADIRAN;

-- Verify event_type set correctly
SELECT event_type, COUNT(*) AS count 
FROM DPMM_MESYUARAT 
GROUP BY event_type;

-- Verify foreign key relationships
SELECT e.event_id, e.nama, COUNT(r.id) AS rsvp_count 
FROM DPMM_MESYUARAT e 
LEFT JOIN DPMM_RSVP r ON e.event_id = r.event_id 
GROUP BY e.event_id, e.nama;
