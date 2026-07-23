-- Data Migration — Sistem Hebahan DPMM Johor
-- Run in Supabase SQL Editor AFTER schema migration
-- Migrates existing DPMM_MESYUARAT to DPMM_EVENTS and DPMM_KEHADIRAN to DPMM_RSVP

-- ── Migrate DPMM_MESYUARAT to DPMM_EVENTS ───────────────────────────────────────
INSERT INTO DPMM_EVENTS (
  event_id,
  nama,
  tarikh,
  tempat,
  event_type,
  bureau,
  gdrive_folder_id,
  gdrive_folder_url,
  aktif,
  blast_channel,
  rsvp_deadline,
  dibuat_oleh,
  dibuat_pada,
  dikemaskini_pada
)
SELECT 
  mesyuarat_id AS event_id,
  nama,
  tarikh,
  tempat,
  'meeting' AS event_type,
  NULL AS bureau,
  gdrive_folder_id,
  gdrive_folder_url,
  aktif,
  'WhatsApp' AS blast_channel,
  NULL AS rsvp_deadline,
  dibuat_oleh,
  dibuat_pada,
  dikemaskini_pada
FROM DPMM_MESYUARAT
ON CONFLICT (event_id) DO NOTHING;

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
SELECT 'DPMM_EVENTS count' AS table_name, COUNT(*) AS count FROM DPMM_EVENTS;
SELECT 'DPMM_RSVP count' AS table_name, COUNT(*) AS count FROM DPMM_RSVP;
SELECT 'DPMM_MESYUARAT count' AS table_name, COUNT(*) AS count FROM DPMM_MESYUARAT;
SELECT 'DPMM_KEHADIRAN count' AS table_name, COUNT(*) AS count FROM DPMM_KEHADIRAN;

-- Verify foreign key relationships
SELECT e.event_id, e.nama, COUNT(r.id) AS rsvp_count 
FROM DPMM_EVENTS e 
LEFT JOIN DPMM_RSVP r ON e.event_id = r.event_id 
GROUP BY e.event_id, e.nama;
