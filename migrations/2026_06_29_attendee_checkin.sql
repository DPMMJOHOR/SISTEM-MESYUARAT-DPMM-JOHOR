-- Add check-in columns to DPMM_RSVP table
ALTER TABLE DPMM_RSVP
ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS check_in_timestamp TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS check_in_method TEXT, -- 'qr_code', 'manual', 'override'
ADD COLUMN IF NOT EXISTS attendee_token TEXT UNIQUE;

-- Add index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_dpmm_rsvp_attendee_token 
ON DPMM_RSVP(attendee_token);

-- Add index for check-in queries
CREATE INDEX IF NOT EXISTS idx_dpmm_rsvp_checked_in 
ON DPMM_RSVP(checked_in);
