-- Create DPMM_REMINDERS table for automated reminder scheduling
CREATE TABLE IF NOT EXISTS DPMM_REMINDERS (
  id BIGSERIAL PRIMARY KEY,
  event_id TEXT NOT NULL,
  scheduled_time TIMESTAMPTZ NOT NULL,
  recipient_filter TEXT NOT NULL DEFAULT 'all', -- 'all', 'non_responders', 'confirmed', 'custom'
  template_id BIGINT REFERENCES DPMM_TEMPLATES(id) ON DELETE SET NULL,
  blast_channels TEXT[] DEFAULT ARRAY['whatsapp']::TEXT[],
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'failed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  sent_count INTEGER DEFAULT 0,
  FOREIGN KEY (event_id) REFERENCES DPMM_MESYUARAT(mesyuarat_id) ON DELETE CASCADE
);

-- Add index for scheduled time queries
CREATE INDEX IF NOT EXISTS idx_dpmm_reminders_scheduled_time 
ON DPMM_REMINDERS(scheduled_time);

-- Add index for event_id queries
CREATE INDEX IF NOT EXISTS idx_dpmm_reminders_event_id 
ON DPMM_REMINDERS(event_id);

-- Add index for status queries
CREATE INDEX IF NOT EXISTS idx_dpmm_reminders_status 
ON DPMM_REMINDERS(status);

-- Add index for pending reminders
CREATE INDEX IF NOT EXISTS idx_dpmm_reminders_pending 
ON DPMM_REMINDERS(scheduled_time) 
WHERE status = 'scheduled';
