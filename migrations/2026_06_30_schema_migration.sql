-- Schema Migration — Sistem Hebahan DPMM Johor (Unified Plan)
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/lzoloupwtqmjyupvofhh
-- Safe to re-run: all statements use IF NOT EXISTS / OR REPLACE
-- This migration extends DPMM_MESYUARAT (does NOT create DPMM_EVENTS)

-- ── Add new columns to DPMM_MESYUARAT for event type support ─────────────────────
ALTER TABLE DPMM_MESYUARAT
ADD COLUMN IF NOT EXISTS event_type TEXT CHECK (event_type IN ('meeting','seminar','workshop','networking','training','other'));

ALTER TABLE DPMM_MESYUARAT
ADD COLUMN IF NOT EXISTS bureau TEXT CHECK (bureau IN ('Biro Professional','Biro Kontraktor','Biro International Trade'));

ALTER TABLE DPMM_MESYUARAT
ADD COLUMN IF NOT EXISTS blast_channel TEXT CHECK (blast_channel IN ('WhatsApp','Email','Both'));

ALTER TABLE DPMM_MESYUARAT
ADD COLUMN IF NOT EXISTS rsvp_deadline TIMESTAMPTZ;

-- ── Add Buku Mesyuarat columns to DPMM_MESYUARAT ───────────────────────────────
ALTER TABLE DPMM_MESYUARAT
ADD COLUMN IF NOT EXISTS buku_mesyuarat_file_id TEXT;

ALTER TABLE DPMM_MESYUARAT
ADD COLUMN IF NOT EXISTS buku_mesyuarat_file_type TEXT CHECK (buku_mesyuarat_file_type IN ('pdf','image'));

-- ── DPMM_RSVP (unified RSVP tracking) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS DPMM_RSVP (
  id                  BIGSERIAL PRIMARY KEY,
  event_id            TEXT REFERENCES DPMM_MESYUARAT(mesyuarat_id) ON DELETE CASCADE,
  attendee_type       TEXT CHECK (attendee_type IN ('member','non-member')),
  attendee_identifier TEXT NOT NULL,
  status              TEXT CHECK (status IN ('Saya Hadir','Saya Tidak Hadir','Tidak Pasti','Belum Dihubungi')),
  channel             TEXT CHECK (channel IN ('WhatsApp','Email')),
  response_timestamp  TIMESTAMPTZ,
  checked_in          BOOLEAN DEFAULT false,
  check_in_timestamp  TIMESTAMPTZ,
  check_in_method     TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, attendee_identifier)
);
ALTER TABLE DPMM_RSVP ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated rsvp" ON DPMM_RSVP FOR ALL USING (auth.uid() IS NOT NULL);

-- ── DPMM_NON_MEMBER_CONTACTS (with PII encryption support) ───────────────────────
CREATE TABLE IF NOT EXISTS DPMM_NON_MEMBER_CONTACTS (
  id            BIGSERIAL PRIMARY KEY,
  nama          TEXT NOT NULL,
  email_encrypted TEXT, -- Encrypted email using pgcrypto
  phone_encrypted TEXT, -- Encrypted phone using pgcrypto
  email_hash TEXT, -- Hash for uniqueness check (not PII)
  phone_hash TEXT, -- Hash for uniqueness check (not PII)
  organization  TEXT,
  bureau        TEXT CHECK (bureau IN ('Biro Professional','Biro Kontraktor','Biro International Trade')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  created_by    TEXT
);
ALTER TABLE DPMM_NON_MEMBER_CONTACTS ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated non_member_contacts" ON DPMM_NON_MEMBER_CONTACTS FOR ALL USING (auth.uid() IS NOT NULL);

-- ── Add bureau column to DPMM_USERS ───────────────────────────────────────────────
ALTER TABLE DPMM_USERS ADD COLUMN IF NOT EXISTS bureau TEXT CHECK (bureau IN ('Biro Professional','Biro Kontraktor','Biro International Trade'));

-- ── Add image_url column to DPMM_TEMPLATES ───────────────────────────────────────
ALTER TABLE DPMM_TEMPLATES ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ── DPMM_REMINDERS (automated reminder scheduling) ───────────────────────────────
CREATE TABLE IF NOT EXISTS DPMM_REMINDERS (
  id               BIGSERIAL PRIMARY KEY,
  event_id         TEXT REFERENCES DPMM_MESYUARAT(mesyuarat_id) ON DELETE CASCADE,
  scheduled_time   TIMESTAMPTZ NOT NULL,
  recipient_filter TEXT CHECK (recipient_filter IN ('all','non-responders','custom')),
  template_id      BIGINT REFERENCES DPMM_TEMPLATES(id),
  status           TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','sent','failed')),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  sent_at          TIMESTAMPTZ
);
ALTER TABLE DPMM_REMINDERS ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated reminders" ON DPMM_REMINDERS FOR ALL USING (auth.uid() IS NOT NULL);

-- ── DPMM_BUKU_MESYUARAT_ACCESS_LOG (access logging for Buku Mesyuarat) ─────────────
CREATE TABLE IF NOT EXISTS DPMM_BUKU_MESYUARAT_ACCESS_LOG (
  id               BIGSERIAL PRIMARY KEY,
  mesyuarat_id     TEXT REFERENCES DPMM_MESYUARAT(mesyuarat_id) ON DELETE CASCADE,
  no_ahli          TEXT,
  access_timestamp TIMESTAMPTZ DEFAULT NOW(),
  access_type      TEXT CHECK (access_type IN ('view','qr')),
  ip_address       TEXT
);
ALTER TABLE DPMM_BUKU_MESYUARAT_ACCESS_LOG ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated access_log" ON DPMM_BUKU_MESYUARAT_ACCESS_LOG FOR ALL USING (auth.uid() IS NOT NULL);

-- ── Add response tracking columns to DPMM_KEHADIRAN ───────────────────────────────
ALTER TABLE DPMM_KEHADIRAN
ADD COLUMN IF NOT EXISTS response_channel TEXT CHECK (response_channel IN ('WhatsApp','Email'));

ALTER TABLE DPMM_KEHADIRAN
ADD COLUMN IF NOT EXISTS response_timestamp TIMESTAMPTZ;

-- ── Enable pgcrypto extension for PII encryption ───────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Create encryption/decryption functions for non-member contacts ─────────────
CREATE OR REPLACE FUNCTION encrypt_pii(plain_text TEXT, key TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(pgp_sym_encrypt(plain_text, key), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrypt_pii(encrypted_text TEXT, key TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN pgp_sym_decrypt(decode(encrypted_text, 'base64'), key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
