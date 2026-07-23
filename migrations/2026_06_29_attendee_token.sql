-- Add attendee_token column to DPMM_RSVP for QR code check-in
ALTER TABLE DPMM_RSVP
ADD COLUMN IF NOT EXISTS attendee_token TEXT UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_dpmm_rsvp_attendee_token 
ON DPMM_RSVP(attendee_token);
