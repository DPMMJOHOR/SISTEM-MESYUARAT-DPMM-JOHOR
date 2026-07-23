-- Add event type and bureau columns to DPMM_MESYUARAT table
ALTER TABLE DPMM_MESYUARAT
ADD COLUMN IF NOT EXISTS event_type TEXT,
ADD CONSTRAINT IF NOT EXISTS check_event_type 
  CHECK (event_type IN ('meeting', 'seminar', 'workshop', 'networking', 'training', 'other', NULL)),
ADD COLUMN IF NOT EXISTS bureau TEXT,
ADD CONSTRAINT IF NOT EXISTS check_bureau_value_events 
  CHECK (bureau IN ('Biro Professional', 'Biro Kontraktor', 'Biro International Trade', NULL)),
ADD COLUMN IF NOT EXISTS blast_channels TEXT[] DEFAULT ARRAY['whatsapp']::TEXT[],
ADD COLUMN IF NOT EXISTS reminder_schedule TIMESTAMPTZ;

-- Add index for event type queries
CREATE INDEX IF NOT EXISTS idx_dpmm_mesyuarat_event_type 
ON DPMM_MESYUARAT(event_type);

-- Add index for bureau queries
CREATE INDEX IF NOT EXISTS idx_dpmm_mesyuarat_bureau 
ON DPMM_MESYUARAT(bureau);
