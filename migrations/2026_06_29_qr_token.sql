-- Add qr_token column to DPMM_MESYUARAT for QR code tracking
ALTER TABLE DPMM_MESYUARAT
ADD COLUMN IF NOT EXISTS qr_token TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_dpmm_mesyuarat_qr_token 
ON DPMM_MESYUARAT(qr_token);
