-- Full Schema — Sistem Pengurusan Mesyuarat DPMM Johor
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/lzoloupwtqmjyupvofhh
-- Safe to re-run: all statements use IF NOT EXISTS / OR REPLACE

-- ── DPMM_MESYUARAT ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS DPMM_MESYUARAT (
  mesyuarat_id      TEXT PRIMARY KEY,
  nama              TEXT NOT NULL,
  tarikh            DATE,
  tempat            TEXT,
  gdrive_folder_id  TEXT,
  gdrive_folder_url TEXT,
  aktif             BOOLEAN DEFAULT false,
  dibuat_oleh       TEXT,
  dibuat_pada       TIMESTAMPTZ DEFAULT NOW(),
  dikemaskini_pada  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE DPMM_MESYUARAT ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon all mesyuarat" ON DPMM_MESYUARAT FOR ALL USING (true);

-- ── DPMM_KEHADIRAN ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS DPMM_KEHADIRAN (
  id               BIGSERIAL PRIMARY KEY,
  mesyuarat_id     TEXT REFERENCES DPMM_MESYUARAT(mesyuarat_id) ON DELETE CASCADE,
  no_ahli          TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'Belum Dihubungi',
  catatan          TEXT,
  dikemaskini_oleh TEXT,
  dikemaskini_pada TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mesyuarat_id, no_ahli)
);
ALTER TABLE DPMM_KEHADIRAN ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon all kehadiran" ON DPMM_KEHADIRAN FOR ALL USING (true);

-- ── DPMM_USERS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS DPMM_USERS (
  id           BIGSERIAL PRIMARY KEY,
  user_id      TEXT UNIQUE NOT NULL,
  nama         TEXT NOT NULL,
  kata_laluan  TEXT NOT NULL,
  peranan      TEXT NOT NULL DEFAULT 'ajk' CHECK (peranan IN ('admin','user','ajk')),
  aktif        BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE DPMM_USERS ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon read users"  ON DPMM_USERS FOR SELECT USING (true);
CREATE POLICY "admin write users" ON DPMM_USERS FOR ALL USING (true);

-- ── DPMM_TEMPLATES (existing WA templates, single-send) ─────────────────────
CREATE TABLE IF NOT EXISTS DPMM_TEMPLATES (
  id           BIGSERIAL PRIMARY KEY,
  template_key BIGINT,
  nama         TEXT NOT NULL,
  kandungan    TEXT NOT NULL,
  created_by   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE DPMM_TEMPLATES ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon all templates" ON DPMM_TEMPLATES FOR ALL USING (true);

-- ── DPMM_SEND_LOG ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS DPMM_SEND_LOG (
  id            BIGSERIAL PRIMARY KEY,
  jenis         TEXT,
  bilangan      INTEGER,
  filter_nama   TEXT,
  dihantar_oleh TEXT,
  dihantar_pada TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE DPMM_SEND_LOG ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon all sendlog" ON DPMM_SEND_LOG FOR ALL USING (true);

-- ── DPMM_BLAST_QUEUE ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS DPMM_BLAST_QUEUE (
  id           BIGSERIAL PRIMARY KEY,
  mesyuarat_id TEXT REFERENCES DPMM_MESYUARAT(mesyuarat_id) ON DELETE CASCADE,
  no_ahli      TEXT,
  nama_ahli    TEXT,
  no_hp        TEXT,
  teks_mesej   TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'Pending'
                 CHECK (status IN ('Pending','Sent','Failed','Skipped')),
  dibuat_oleh  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  sent_at      TIMESTAMPTZ,
  catatan      TEXT
);
ALTER TABLE DPMM_BLAST_QUEUE ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon all blast_queue" ON DPMM_BLAST_QUEUE FOR ALL USING (true);
