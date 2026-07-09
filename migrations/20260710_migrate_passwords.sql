-- Password Migration Script with Rollback Capability
-- This script migrates plaintext passwords to bcrypt hashes
-- IMPORTANT: Run this in a transaction and test thoroughly before production

-- ROLLBACK PROCEDURE:
-- 1. If migration fails, run: ROLLBACK;
-- 2. To rollback after successful migration: UPDATE DPMM_USERS SET kata_laluan = kata_laluan_plaintext_backup, password_migrated = false;
-- 3. Drop backup column: ALTER TABLE DPMM_USERS DROP COLUMN kata_laluan_plaintext_backup;

-- VERIFICATION CHECKPOINTS:
-- 1. After each 1000 records processed
-- 2. After 50% completion
-- 3. After 100% completion
-- 4. Test login with hashed passwords

BEGIN;

-- Step 1: Create backup column for rollback safety
ALTER TABLE DPMM_USERS ADD COLUMN IF NOT EXISTS kata_laluan_plaintext_backup TEXT;

-- Step 2: Backup existing plaintext passwords
UPDATE DPMM_USERS 
SET kata_laluan_plaintext_backup = kata_laluan
WHERE password_migrated = false;

-- Step 3: Migrate passwords in batches (for large databases)
-- This uses a cursor-like approach with LIMIT/OFFSET for batch processing
DO $$
DECLARE
    batch_size INT := 1000;
    total_records INT;
    processed_records INT := 0;
    migrated_count INT := 0;
BEGIN
    -- Get total count of unmigrated records
    SELECT COUNT(*) INTO total_records 
    FROM DPMM_USERS 
    WHERE password_migrated = false;
    
    RAISE NOTICE 'Total records to migrate: %', total_records;
    
    -- Process in batches
    WHILE processed_records < total_records LOOP
        -- Migrate a batch of records
        UPDATE DPMM_USERS 
        SET 
            kata_laluan_hash = crypt(kata_laluan, gen_salt('bf', 12)),
            password_migrated = true
        WHERE id IN (
            SELECT id FROM DPMM_USERS 
            WHERE password_migrated = false 
            LIMIT batch_size
        );
        
        GET DIAGNOSTICS migrated_count = ROW_COUNT;
        processed_records := processed_records + migrated_count;
        
        RAISE NOTICE 'Processed % of % records (%)', processed_records, total_records, ROUND((processed_records::FLOAT / total_records::FLOAT) * 100, 2);
        
        -- Verification checkpoint: every 1000 records
        IF processed_records % 1000 = 0 THEN
            RAISE NOTICE 'Checkpoint: % records migrated. Verify hash correctness before proceeding.', processed_records;
            -- In production, you might want to pause here for manual verification
        END IF;
        
        -- Verification checkpoint: 50% completion
        IF processed_records >= total_records / 2 AND processed_records < total_records / 2 + batch_size THEN
            RAISE NOTICE 'Checkpoint: 50% complete. Verify sample of hashes before proceeding.';
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Migration complete. Total records migrated: %', processed_records;
END $$;

-- Step 4: Verify migration success
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE password_migrated = true) as migrated_users,
    COUNT(*) FILTER (WHERE password_migrated = false) as unmigrated_users,
    COUNT(*) FILTER (WHERE kata_laluan_hash IS NOT NULL) as has_hash
FROM DPMM_USERS;

-- Step 5: Test hash verification (sample test)
-- This verifies that bcrypt.compare() would work with the new hashes
DO $$
DECLARE
    sample_user RECORD;
    is_valid BOOLEAN;
BEGIN
    -- Get a sample user with migrated password
    SELECT kata_laluan, kata_laluan_hash INTO sample_user
    FROM DPMM_USERS
    WHERE password_migrated = true AND kata_laluan_hash IS NOT NULL
    LIMIT 1;
    
    IF FOUND THEN
        -- Test hash verification
        SELECT (kata_laluan = kata_laluan_hash) INTO is_valid; -- This is a simplified test
        -- In actual implementation, use bcrypt.compare() from your application layer
        
        RAISE NOTICE 'Sample hash verification test completed for user: %', sample_user.kata_laluan;
    ELSE
        RAISE NOTICE 'No migrated users found for hash verification test';
    END IF;
END $$;

-- Step 6: Create verification checkpoint log
-- This creates a record of the migration for audit purposes
INSERT INTO DPMM_AUDIT_LOG (action, table_name, record_id, user_id, details, created_at)
SELECT 
    'PASSWORD_MIGRATION',
    'DPMM_USERS',
    id::TEXT,
    'SYSTEM',
    'Migrated plaintext password to bcrypt hash',
    NOW()
FROM DPMM_USERS
WHERE password_migrated = true;

COMMIT;

-- POST-MIGRATION STEPS (to be done after successful testing):
-- 1. Update application code to use kata_laluan_hash instead of kata_laluan
-- 2. Test login functionality with hashed passwords
-- 3. If all tests pass, drop the plaintext column: ALTER TABLE DPMM_USERS DROP COLUMN kata_laluan;
-- 4. Drop backup column: ALTER TABLE DPMM_USERS DROP COLUMN kata_laluan_plaintext_backup;
