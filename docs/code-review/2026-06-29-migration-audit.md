# Database Migration Audit: Sistem Hebahan DPMM Johor
**Date**: 2026-06-29
**Auditor**: Database Review
**Migration Status**: READY FOR TESTING
**Critical Issues**: 1

## Migration Files Reviewed

### 1. 2026_06_29_schema_migration.sql
**Status**: NEEDS REVISION
**Issues Found:**

#### Issue 1: Table Name Inconsistency
**Severity**: HIGH
**Description**: Migration creates `DPMM_EVENTS` table but application code references `DPMM_MESYUARAT`

**Problem:**
```sql
-- Migration creates:
CREATE TABLE IF NOT EXISTS DPMM_EVENTS (...)
```

**Application expects:**
- `index.html` uses `DPMM_MESYUARAT` table
- Existing data is in `DPMM_MESYUARAT` table
- No data migration strategy provided

**Fix Required:**
Either:
1. Use existing `DPMM_MESYUARAT` table and add columns via ALTER TABLE
2. Provide data migration from `DPMM_MESYUARAT` to `DPMM_EVENTS`
3. Update all application code to use `DPMM_EVENTS`

**Recommendation:** Use ALTER TABLE approach to maintain backward compatibility.

#### Issue 2: Overly Permissive RLS Policies
**Severity**: MEDIUM
**Description:** RLS policies allow anonymous access to all tables

**Problem:**
```sql
CREATE POLICY "anon all events" ON DPMM_EVENTS FOR ALL USING (true);
CREATE POLICY "anon all rsvp" ON DPMM_RSVP FOR ALL USING (true);
CREATE POLICY "anon all non_member_contacts" ON DPMM_NON_MEMBER_CONTACTS FOR ALL USING (true);
```

**Risk:** Anyone with API access can read/write all data without authentication.

**Fix Required:** Replace with proper authenticated policies using `auth.uid()`.

### 2. 2026_06_29_bureau_access.sql
**Status**: GOOD
**Issues Found:**

#### Issue 1: Missing Bureau Column in Non-Member Contacts
**Severity**: MEDIUM
**Description:** RLS policies reference `bureau` column in `DPMM_NON_MEMBER_CONTACTS` but column not added

**Problem:**
```sql
-- Policy references:
AND bureau = DPMM_NON_MEMBER_CONTACTS.bureau

-- But column not added:
ALTER TABLE DPMM_NON_MEMBER_CONTACTS ADD COLUMN IF NOT EXISTS bureau TEXT;
```

**Fix Required:** Add bureau column to `DPMM_NON_MEMBER_CONTACTS` table.

#### Issue 2: Role Column Inconsistency
**Severity**: MEDIUM
**Description:** RLS policies reference `role` column but `DPMM_USERS` uses `peranan` column

**Problem:**
```sql
-- Policy references:
WHERE role = 'super_admin'

-- But table uses:
peranan column (admin, user, ajk)
```

**Fix Required:** Update RLS policies to use correct column name `peranan` or add `role` column.

### 3. 2026_06_29_qr_token.sql
**Status**: GOOD
**Issues Found:** None

**Notes:** Simple ALTER TABLE operation, safe to re-run.

### 4. 2026_06_29_attendee_checkin.sql
**Status**: NEEDS REVIEW
**Issues Found:**

#### Issue 1: Missing Attendee Token Column
**Severity:** HIGH
**Description:** Check-in columns added but `attendee_token` column not added to RSVP table

**Problem:** QR code scanning requires `attendee_token` column for validation.

**Fix Required:** Add `attendee_token TEXT UNIQUE` column to `DPMM_RSVP` table.

### 5. 2026_06_29_event_type_bureau.sql
**Status**: GOOD
**Issues Found:** None

**Notes:** Adds columns to existing table, safe to re-run.

### 6. 2026_06_29_reminders.sql
**Status:** NEEDS REVISION
**Issues Found:**

#### Issue 1: Overly Permissive RLS Policy
**Severity:** MEDIUM
**Description:** Allows anonymous access to reminders

**Problem:**
```sql
CREATE POLICY "anon all reminders" ON DPMM_REMINDERS FOR ALL USING (true);
```

**Fix Required:** Implement proper authenticated RLS policies.

## Schema Integrity Issues

### 1. Missing Foreign Key Constraints
**Severity:** MEDIUM
**Description:** Some foreign key relationships may be missing or inconsistent

**Issues:**
- `DPMM_RSVP.event_id` references `DPMM_EVENTS` but app uses `DPMM_MESYUARAT`
- `DPMM_REMINDERS.event_id` references `DPMM_EVENTS` but app uses `DPMM_MESYUARAT`

### 2. Missing Indexes
**Severity:** LOW
**Description:** Performance-critical queries may be missing indexes

**Recommendations:**
- Add index on `DPMM_RSVP(event_id, status)` for dashboard queries
- Add index on `DPMM_REMINDERS(scheduled_time, status)` for reminder execution
- Add index on `DPMM_NON_MEMBER_CONTACTS(email)` for lookups

## Data Migration Strategy

### Current State:
- Existing data in `DPMM_MESYUARAT` table
- New schema expects `DPMM_EVENTS` table
- No migration path provided

### Recommended Approach:
1. Keep `DPMM_MESYUARAT` as primary table
2. Add new columns via ALTER TABLE statements
3. Maintain backward compatibility
4. Gradually migrate to new table structure if needed

## Migration Execution Order

### Recommended Order:
1. **2026_06_29_qr_token.sql** - Safe, adds column to existing table
2. **2026_06_29_attendee_checkin.sql** - Add missing attendee_token column first
3. **2026_06_29_event_type_bureau.sql** - Adds columns to existing table
4. **2026_06_29_schema_migration.sql** - REVISE to use ALTER TABLE instead of CREATE TABLE
5. **2026_06_29_bureau_access.sql** - After bureau column added
6. **2026_06_29_reminders.sql** - After events table structure finalized

## Testing Checklist

- [ ] Fix table name inconsistency (DPMM_EVENTS vs DPMM_MESYUARAT)
- [ ] Add missing bureau column to DPMM_NON_MEMBER_CONTACTS
- [ ] Fix role column reference (role vs peranan)
- [ ] Add missing attendee_token column to DPMM_RSVP
- [ ] Replace permissive RLS policies with authenticated policies
- [ ] Add missing foreign key constraints
- [ ] Add performance indexes
- [ ] Test migration in staging environment
- [ ] Verify data integrity after migration
- [ ] Test RLS policies with different user roles
- [ ] Backup production database before migration

## Rollback Plan

### If Migration Fails:
1. Have database backup ready
2. Document exact SQL statements executed
3. Prepare rollback SQL statements:
   - DROP added columns
   - REVOKE added policies
   - DROP added indexes
4. Test rollback in staging environment

## Recommendations

### Immediate Actions (Before Migration):
1. **Fix table name inconsistency** - CRITICAL
2. Add missing `attendee_token` column to RSVP table
3. Add missing `bureau` column to non-member contacts
4. Fix role column references in RLS policies
5. Replace permissive RLS policies

### Pre-Migration Testing:
1. Test all migrations in staging environment
2. Verify data integrity after each migration
3. Test application functionality with new schema
4. Performance test with new indexes
5. Security test RLS policies

### Migration Day:
1. Create full database backup
2. Execute migrations in recommended order
3. Verify each migration success
4. Test critical application functions
5. Monitor for errors
6. Have rollback plan ready

## Conclusion

The migration files have **CRITICAL issues** that must be addressed before execution. The table name inconsistency between `DPMM_EVENTS` and `DPMM_MESYUARAT` is the most critical issue that could cause application failure. Additionally, missing columns and overly permissive RLS policies pose security and functionality risks.

**Status**: NOT READY FOR PRODUCTION MIGRATION
