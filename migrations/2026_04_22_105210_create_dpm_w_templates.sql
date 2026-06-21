-- PostgreSQL migration: DPMM_WA_TEMPLATES
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/lzoloupwtqmjyupvofhh

CREATE TABLE IF NOT EXISTS DPMM_WA_TEMPLATES (
  id            BIGSERIAL PRIMARY KEY,
  template_name TEXT NOT NULL,
  subject       TEXT NOT NULL DEFAULT '',
  body          TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_wa_templates_updated_at
BEFORE UPDATE ON DPMM_WA_TEMPLATES
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE DPMM_WA_TEMPLATES ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read" ON DPMM_WA_TEMPLATES FOR SELECT USING (true);
CREATE POLICY "anon all" ON DPMM_WA_TEMPLATES FOR ALL USING (true);
-- NOTE: System uses Supabase anon key — auth.role() check would block all writes