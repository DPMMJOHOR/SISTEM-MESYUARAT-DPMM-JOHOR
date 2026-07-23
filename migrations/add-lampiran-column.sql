-- Add lampiran column to DPMM_BLAST_QUEUE for WhatsApp attachments
-- Run in Supabase SQL Editor

ALTER TABLE DPMM_BLAST_QUEUE 
ADD COLUMN IF NOT EXISTS lampiran TEXT;

-- Add comment for documentation
COMMENT ON COLUMN DPMM_BLAST_QUEUE.lampiran IS 'Attachment type for WhatsApp message (e.g., notis_mesyuarat, buku_mesyuarat, agenda)';
