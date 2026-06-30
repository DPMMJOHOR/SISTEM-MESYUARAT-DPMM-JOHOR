-- PII Encryption Setup — Sistem Hebahan DPMM Johor
-- Run in Supabase SQL Editor AFTER schema migration
-- Sets up encryption key for non-member contact PII (email, phone)

-- ── Create encryption key (stored in environment variable, not in source code) ─────
-- Note: The actual encryption key should be set as an environment variable
-- in Supabase: Settings → Environment Variables → Add ENCRYPTION_KEY
-- This migration creates a placeholder key for development only
-- DO NOT use this placeholder in production

-- ── Verify pgcrypto extension is enabled ───────────────────────────────────────
SELECT extname FROM pg_extension WHERE extname = 'pgcrypto';

-- ── Test encryption/decryption functions ───────────────────────────────────────
-- This is a test to verify the functions work correctly
-- Remove this section after verification in production

-- Test encryption
SELECT encrypt_pii('test@example.com', 'dev_key_placeholder') AS encrypted_email;

-- Test decryption
SELECT decrypt_pii(encrypt_pii('test@example.com', 'dev_key_placeholder'), 'dev_key_placeholder') AS decrypted_email;

-- ── Create indexes for hash columns (for uniqueness checks) ─────────────────────
CREATE INDEX IF NOT EXISTS idx_dpmm_non_member_contacts_email_hash 
ON DPMM_NON_MEMBER_CONTACTS(email_hash);

CREATE INDEX IF NOT EXISTS idx_dpmm_non_member_contacts_phone_hash 
ON DPMM_NON_MEMBER_CONTACTS(phone_hash);

-- ── Create index for bureau queries on non-member contacts ───────────────────────
CREATE INDEX IF NOT EXISTS idx_dpmm_non_member_contacts_bureau 
ON DPMM_NON_MEMBER_CONTACTS(bureau);

-- ── Instructions for Production ─────────────────────────────────────────────────
-- 1. Set ENCRYPTION_KEY as a Supabase environment variable
-- 2. Use a strong, randomly generated key (32+ characters recommended)
-- 3. Store the key securely (e.g., AWS Secrets Manager, HashiCorp Vault)
-- 4. Rotate the key periodically (every 90 days recommended)
-- 5. Key rotation requires:
--    a. Decrypt all existing data with old key
--    b. Re-encrypt with new key
--    c. Update environment variable
--    d. Remove old key from secrets manager
