-- Add password hash column to DPMM_USERS table
-- This migration adds a new column for bcrypt-hashed passwords
-- Run before executing the password migration script

-- Add new column for hashed passwords
ALTER TABLE DPMM_USERS ADD COLUMN IF NOT EXISTS kata_laluan_hash TEXT;

-- Add column to track migration status
ALTER TABLE DPMM_USERS ADD COLUMN IF NOT EXISTS password_migrated BOOLEAN DEFAULT false;

-- Create index on hash column for faster lookups
CREATE INDEX IF NOT EXISTS idx_dpmm_users_password_hash ON DPMM_USERS(kata_laluan_hash);

-- Add comment to document the migration
COMMENT ON COLUMN DPMM_USERS.kata_laluan_hash IS 'Bcrypt-hashed password (12 rounds), replaces plaintext kata_laluan after migration';
COMMENT ON COLUMN DPMM_USERS.password_migrated IS 'Flag indicating if password has been migrated from plaintext to hash';
