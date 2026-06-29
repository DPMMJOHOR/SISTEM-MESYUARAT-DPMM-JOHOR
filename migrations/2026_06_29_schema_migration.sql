-- Schema Migration — Sistem Hebahan DPMM Johor
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/lzoloupwtqmjyupvofhh
-- Safe to re-run: all statements use IF NOT EXISTS / OR REPLACE

-- ── DPMM_EVENTS (replaces DPMM_MESYUARAT) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS DPMM_EVENTS (
  event_id          TEXT PRIMARY KEY,
  nama              TEXT NOT NULL,
  tarikh            DATE,
  tempat            TEXT,
  event_type        TEXT CHECK (event_type IN ('meeting','seminar','workshop','networking','training','other')),
  bureau            TEXT CHECK (bureau IN ('Biro Professional','Biro Kontraktor','Biro International Trade')),
  gdrive_folder_id  TEXT,
  gdrive_folder_url TEXT,
  aktif             BOOLEAN DEFAULT false,
  blast_channel     TEXT CHECK (blast_channel IN ('WhatsApp','Email','Both')),
  rsvp_deadline     TIMESTAMPTZ,
  dibuat_oleh       TEXT,
  dibuat_pada       TIMESTAMPTZ DEFAULT NOW(),
  dikemaskini_pada  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE DPMM_EVENTS ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon all events" ON DPMM_EVENTS FOR ALL USING (true);

-- ── DPMM_RSVP (unified RSVP tracking) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS DPMM_RSVP (
  id                  BIGSERIAL PRIMARY KEY,
  event_id            TEXT REFERENCES DPMM_EVENTS(event_id) ON DELETE CASCADE,
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
CREATE POLICY "anon all rsvp" ON DPMM_RSVP FOR ALL USING (true);

-- ── DPMM_NON_MEMBER_CONTACTS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS DPMM_NON_MEMBER_CONTACTS (
  id            BIGSERIAL PRIMARY KEY,
  nama          TEXT NOT NULL,
  email         TEXT UNIQUE,
  phone         TEXT UNIQUE,
  organization  TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  created_by    TEXT
);
ALTER TABLE DPMM_NON_MEMBER_CONTACTS ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon all non_member_contacts" ON DPMM_NON_MEMBER_CONTACTS FOR ALL USING (true);

-- ── Add bureau column to DPMM_USERS ───────────────────────────────────────────────
ALTER TABLE DPMM_USERS ADD COLUMN IF NOT EXISTS bureau TEXT CHECK (bureau IN ('Biro Professional','Biro Kontraktor','Biro International Trade'));

-- ── Add image_url column to DPMM_TEMPLATES ───────────────────────────────────────
ALTER TABLE DPMM_TEMPLATES ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ── DPMM_REMINDERS (automated reminder scheduling) ───────────────────────────────
CREATE TABLE IF NOT EXISTS DPMM_REMINDERS (
  id               BIGSERIAL PRIMARY KEY,
  event_id         TEXT REFERENCES DPMM_EVENTS(event_id) ON DELETE CASCADE,
  scheduled_time   TIMESTAMPTZ NOT NULL,
  recipient_filter TEXT CHECK (recipient_filter IN ('all','non-responders','custom')),
  template_id      BIGINT REFERENCES DPMM_TEMPLATES(id),
  status           TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','sent','failed')),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  sent_at          TIMESTAMPTZ
);
ALTER TABLE DPMM_REMINDERS ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon all reminders" ON DPMM_REMINDERS FOR ALL USING (true);
