# Fix Critical Audit Issues

**Date:** 2026-06-29
**Type:** fix
**Origin:** docs/code-review/2026-06-29-security-audit.md, 2026-06-29-migration-audit.md, 2026-06-29-mobile-app-audit.md, 2026-06-29-requirements-verification.md
**Status:** Ready for Implementation

---

## Summary

Fix all CRITICAL and HIGH priority issues identified in the comprehensive code audit and security review. This remediation plan addresses hardcoded API keys, database migration inconsistencies, mobile app build blockers, and missing core features to bring the Sistem Hebahan system to production-ready state.

---

## Problem Frame

The Sistem Hebahan implementation has critical security vulnerabilities and build blockers that prevent production deployment:

1. **Security vulnerabilities**: Hardcoded Supabase API keys exposed in source code, missing input validation across the application
2. **Database migration issues**: Table name inconsistency (DPMM_EVENTS vs DPMM_MESYUARAT), missing columns (bureau, attendee_token), overly permissive RLS policies
3. **Mobile app build failures**: Missing dependencies (async-storage, netinfo, vector-icons), TypeScript configuration errors, hardcoded API keys
4. **Missing core features**: WhatsApp integration, email delivery, Buku Mesyuarat sharing system not implemented (18% requirements success rate)

These issues must be resolved before the system can be safely deployed to production.

---

## Requirements

### Security Requirements
- **R1**: Remove all hardcoded API keys from source code
- **R2**: Implement environment variable configuration for sensitive data
- **R3**: Add input validation on all user-facing forms and API endpoints
- **R4**: Replace permissive RLS policies with authenticated policies

### Database Requirements
- **R5**: Fix table name inconsistency (use DPMM_MESYUARAT instead of DPMM_EVENTS)
- **R6**: Add missing bureau column to DPMM_NON_MEMBER_CONTACTS
- **R7**: Add missing attendee_token column to DPMM_RSVP
- **R8**: Fix role column references (peranan vs role) in RLS policies

### Mobile App Requirements
- **R9**: Install missing dependencies (async-storage, netinfo, vector-icons)
- **R10**: Fix TypeScript configuration errors
- **R11**: Remove hardcoded API keys from mobile app
- **R12**: Create required app assets (icons, splash screen)

### Feature Requirements
- **R13**: Implement WhatsApp integration with WAHA server
- **R14**: Implement email delivery with Resend
- **R15**: Implement Buku Mesyuarat sharing system

---

## Key Technical Decisions

### KTD1: Environment Variable Strategy
**Decision**: Use `.env` files for local development and environment variables for production. Add `.env` to `.gitignore` and provide `.env.example` template.

**Rationale**: Industry standard for managing sensitive configuration. Allows different configs per environment while keeping secrets out of version control.

### KTD2: Database Migration Approach
**Decision**: Use ALTER TABLE approach on existing DPMM_MESYUARAT table instead of creating new DPMM_EVENTS table. Maintain backward compatibility.

**Rationale**: Existing application code references DPMM_MESYUARAT. Creating new table would require updating all application code and data migration. ALTER TABLE is safer and maintains existing data.

### KTD3: RLS Policy Strategy
**Decision**: Replace permissive `anon all` policies with authenticated policies using `auth.uid()`. Implement bureau-based access control with proper role checks.

**Rationale**: Current policies allow anonymous access to all data, which is a security vulnerability. Authenticated policies ensure only authorized users can access data.

### KTD4: Mobile App Dependency Resolution
**Decision**: Add missing dependencies to package.json and run `npm install`. Fix TypeScript configuration to use standalone config instead of non-existent expo/tsconfig.base.

**Rationale**: Current configuration references non-existent file causing build failures. Standalone config is more reliable and doesn't depend on Expo CLI installation.

### KTD5: Feature Implementation Prioritization
**Decision**: Phase 1 fixes critical security and build issues. Phase 2 implements missing core features (WhatsApp, email, Buku Mesyuarat).

**Rationale**: Security and build issues must be resolved before any feature work. Core features are complex and require external service setup (WAHA, Resend, Google Drive).

---

## Implementation Units

### U1. Remove Hardcoded API Keys and Implement Environment Configuration

**Goal**: Eliminate security vulnerability by removing hardcoded API keys and implementing secure environment variable configuration.

**Requirements**: R1, R2

**Dependencies**: None

**Files**:
- `index.html` (modify)
- `mobile-app/services/api.ts` (modify)
- `.env` (create)
- `.env.example` (create)
- `.gitignore` (modify)

**Approach**:
1. Create `.env.example` template with placeholder values for SUPABASE_URL, SUPABASE_KEY, GOOGLE_CID, GROQ_KEY
2. Create local `.env` file with actual values (add to .gitignore)
3. Update `index.html` to load environment variables from CONFIG object or process.env
4. Update `mobile-app/services/api.ts` to use environment variables
5. Add `.env` to `.gitignore` to prevent committing secrets
6. Document environment variable setup in README

**Test scenarios**:
- Verify application loads with environment variables
- Verify hardcoded keys are completely removed from source code
- Verify .env file is not committed to git
- Verify application fails gracefully with missing environment variables

**Verification**: Search codebase for hardcoded keys, confirm all sensitive values loaded from environment variables.

---

### U2. Fix Database Migration Table Name Inconsistency

**Goal**: Resolve critical migration issue by using existing DPMM_MESYUARAT table instead of creating new DPMM_EVENTS table.

**Requirements**: R5

**Dependencies**: None

**Files**:
- `migrations/2026_06_29_schema_migration.sql` (modify)
- `migrations/2026_06_29_bureau_access.sql` (modify)
- `migrations/2026_06_29_qr_token.sql` (modify)

**Approach**:
1. Revise `2026_06_29_schema_migration.sql` to use ALTER TABLE on DPMM_MESYUARAT instead of CREATE TABLE DPMM_EVENTS
2. Add new columns to DPMM_MESYUARAT: event_type, bureau, blast_channel, rsvp_deadline
3. Update RLS policies to reference DPMM_MESYUARAT instead of DPMM_EVENTS
4. Update foreign key references in DPMM_RSVP and DPMM_REMINDERS
5. Test migration in staging environment

**Test scenarios**:
- Verify migration runs without errors
- Verify existing data in DPMM_MESYUARAT is preserved
- Verify new columns are added correctly
- Verify RLS policies work with updated table name

**Verification**: Run migration script in staging, verify data integrity, test application functionality with updated schema.

---

### U3. Add Missing Database Columns and Fix RLS Policies

**Goal**: Add missing bureau and attendee_token columns, fix role column references, and implement proper authenticated RLS policies.

**Requirements**: R6, R7, R8, R4

**Dependencies**: U2

**Files**:
- `migrations/2026_06_29_bureau_access.sql` (modify)
- `migrations/2026_06_29_attendee_checkin.sql` (modify)
- `migrations/2026_06_29_schema_migration.sql` (modify)

**Approach**:
1. Add bureau column to DPMM_NON_MEMBER_CONTACTS table
2. Add attendee_token column to DPMM_RSVP table with UNIQUE constraint
3. Fix role column references to use peranan (existing column name)
4. Replace permissive RLS policies with authenticated policies using auth.uid()
5. Implement bureau-based access control in RLS policies
6. Add indexes for performance on new columns

**Test scenarios**:
- Verify columns are added with correct constraints
- Verify RLS policies enforce proper access control
- Test bureau admin can only access their bureau's data
- Test super admin can access all data
- Verify role checks use correct column name (peranan)

**Verification**: Test RLS policies with different user roles, verify access control enforcement, check database constraints.

---

### U4. Add Input Validation Across Application

**Goal**: Implement input validation on all user-facing forms and API endpoints to prevent injection attacks and data integrity issues.

**Requirements**: R3

**Dependencies**: None

**Files**:
- `index.html` (modify - add validation functions)
- `js/non-member-contacts.js` (modify)
- `js/csv-excel-parser.js` (modify)
- `js/validation.js` (create)

**Approach**:
1. Create centralized validation module with functions for email, phone, text validation
2. Add validation to user creation form
3. Add validation to non-member contact upload
4. Add validation to CSV/Excel parser
5. Sanitize HTML content before database insertion
6. Add length limits on text fields
7. Implement server-side validation for all API endpoints

**Test scenarios**:
- Test email format validation with valid and invalid emails
- Test phone number format validation
- Test SQL injection attempts are blocked
- Test XSS attempts are sanitized
- Test length limits are enforced
- Test required field validation

**Verification**: Run validation tests with malicious inputs, verify all invalid inputs are rejected or sanitized.

---

### U5. Fix Mobile App Dependencies and TypeScript Configuration

**Goal**: Resolve mobile app build failures by installing missing dependencies and fixing TypeScript configuration.

**Requirements**: R9, R10

**Dependencies**: None

**Files**:
- `mobile-app/package.json` (modify)
- `mobile-app/tsconfig.json` (modify)

**Approach**:
1. Add missing dependencies to package.json:
   - @react-native-async-storage/async-storage
   - @react-native-community/netinfo
   - @expo/vector-icons
2. Fix tsconfig.json to use standalone configuration instead of expo/tsconfig.base
3. Configure TypeScript with proper compiler options for React Native
4. Run `npm install` to install dependencies
5. Verify TypeScript compilation succeeds

**Test scenarios**:
- Verify npm install completes without errors
- Verify TypeScript compilation succeeds
- Verify no lint errors related to missing dependencies
- Verify app can be built for development

**Verification**: Run `npm install`, check TypeScript compilation, attempt development build.

---

### U6. Create Mobile App Assets and Configuration

**Goal**: Create required app assets (icons, splash screen) and environment configuration for mobile app.

**Requirements**: R11, R12

**Dependencies**: U5

**Files**:
- `mobile-app/assets/icon.png` (create)
- `mobile-app/assets/splash.png` (create)
- `mobile-app/assets/adaptive-icon.png` (create)
- `mobile-app/assets/favicon.png` (create)
- `mobile-app/.env` (create)
- `mobile-app/.env.example` (create)

**Approach**:
1. Create or generate app icon (1024x1024 PNG)
2. Create splash screen image
3. Create adaptive icon for Android
4. Create favicon for web
5. Create mobile app .env file with Supabase configuration
6. Create .env.example template
7. Update app.json to reference new assets

**Test scenarios**:
- Verify app displays icon correctly
- Verify splash screen displays on app launch
- Verify adaptive icon works on Android
- Verify environment variables load correctly

**Verification**: Test app on device/simulator, verify assets display correctly, verify environment configuration works.

---

### U7. Implement WhatsApp Integration with WAHA

**Goal**: Implement WhatsApp integration to enable interactive response system and automated blasts.

**Requirements**: R13

**Dependencies**: U1, U2, U3

**Files**:
- `js/whatsapp-integration.js` (create)
- `js/whatsapp-templates.js` (modify)
- `js/reminder-scheduler.js` (modify)

**Approach**:
1. Set up WAHA server (external infrastructure)
2. Create WhatsApp integration module with WAHA API client
3. Implement interactive response button handling
4. Implement template blast execution
5. Implement automated reminder execution
6. Add error handling and retry logic
7. Add rate limiting compliance

**Test scenarios**:
- Test WhatsApp message sending
- Test interactive response button handling
- Test template blast execution
- Test automated reminder execution
- Test error handling and retry logic
- Test rate limiting

**Verification**: Send test WhatsApp messages, verify interactive responses work, test automated blasts and reminders.

---

### U8. Implement Email Delivery with Resend

**Goal**: Implement email delivery system using Resend to replace EmailJS and enable email-based RSVP for non-members.

**Requirements**: R14

**Dependencies**: U1

**Files**:
- `js/email-integration.js` (create)
- `js/email-templates.js` (create)
- `index.html` (modify)

**Approach**:
1. Set up Resend account and domain verification (external infrastructure)
2. Create Resend API client integration
3. Implement email template system
4. Implement email blast execution
5. Implement RSVP email handling
6. Add email delivery tracking
7. Replace EmailJS integration with Resend

**Test scenarios**:
- Test email sending with Resend
- Test email template rendering
- Test email blast execution
- Test RSVP email handling
- Test email delivery tracking
- Test bounce handling

**Verification**: Send test emails, verify templates render correctly, test email blasts and RSVP handling.

---

### U9. Implement Buku Mesyuarat Sharing System

**Goal**: Implement secure Buku Mesyuarat sharing with QR codes, member ID authentication, and flipping book viewer.

**Requirements**: R15

**Dependencies**: U1, U2, U3

**Files**:
- `js/buku-mesyuarat.js` (create)
- `js/flipping-book-viewer.js` (create)
- `js/qr-generator.js` (modify)
- `index.html` (modify)

**Approach**:
1. Set up Google Drive API integration (external infrastructure)
2. Implement QR code generation for document sharing
3. Implement member ID authentication
4. Implement access logging
5. Integrate open-source flipping book library
6. Implement viewer features (single/double page, zoom, table of contents)
7. Support PDF and image formats

**Test scenarios**:
- Test QR code generation for documents
- Test member ID authentication
- Test access logging
- Test flipping book viewer functionality
- Test single/double page view
- Test zoom functionality
- Test PDF and image format support

**Verification**: Test document sharing flow, verify authentication works, test viewer features, verify access logging.

---

## Scope Boundaries

### In Scope
- Remove all hardcoded API keys and implement environment configuration
- Fix database migration table name inconsistency
- Add missing database columns and fix RLS policies
- Add input validation across application
- Fix mobile app dependencies and TypeScript configuration
- Create mobile app assets and configuration
- Implement WhatsApp integration with WAHA
- Implement email delivery with Resend
- Implement Buku Mesyuarat sharing system

### Out of Scope
- WhatsApp calling feature (deferred per original requirements)
- Payment processing for paid events (deferred per original requirements)
- Advanced analytics on event performance (deferred per original requirements)
- Event materials sharing (deferred per original requirements)

### Deferred to Follow-Up Work
- Performance optimization for large events (>500 attendees)
- Advanced security features (certificate pinning, biometric auth)
- Comprehensive unit and integration test suite
- CI/CD pipeline setup
- Mobile app deployment to app stores

---

## Open Questions

**OQ1**: WAHA server setup and configuration - who will handle external infrastructure setup?
**OQ2**: Resend account and domain verification - who will handle external service setup?
**OQ3**: Google Drive API credentials and setup - who will handle external service setup?
**OQ4**: Flipping book library selection - which open-source library to use?

---

## Risks & Dependencies

### Risks
- **High**: External service setup (WAHA, Resend, Google Drive) may delay implementation
- **Medium**: Database migration may require downtime for production deployment
- **Medium**: RLS policy changes may break existing access patterns
- **Low**: Mobile app asset creation may require design resources

### Dependencies
- **External**: WAHA server setup and configuration
- **External**: Resend account creation and domain verification
- **External**: Google Drive API credentials
- **Internal**: Existing DPMM_MESYUARAT table data integrity
- **Internal**: Existing user roles and bureau assignments

---

## System-Wide Impact

### Security Impact
- Eliminates hardcoded API keys vulnerability
- Implements proper input validation to prevent injection attacks
- Enforces authenticated access with proper RLS policies
- Protects non-member contact data with bureau-based access control

### Database Impact
- Schema changes to DPMM_MESYUARAT table (column additions)
- Schema changes to DPMM_NON_MEMBER_CONTACTS (bureau column)
- Schema changes to DPMM_RSVP (attendee_token column)
- RLS policy changes across all tables
- Requires database backup before migration

### Application Impact
- Web application requires environment variable configuration
- Mobile app requires dependency installation and asset creation
- WhatsApp integration requires WAHA server setup
- Email integration requires Resend account setup
- Buku Mesyuarat system requires Google Drive integration

### User Impact
- Bureau admins will have proper access control to their bureau's data only
- Members will receive WhatsApp invites with interactive responses
- Non-members will receive email invites with RSVP options
- Event organizers will have QR code check-in system
- All users will benefit from improved security

---

## Verification Strategy

### Security Verification
- Scan codebase for hardcoded keys (should find none)
- Test input validation with malicious inputs
- Test RLS policies with different user roles
- Verify environment variables are not committed to git

### Database Verification
- Run migration in staging environment
- Verify data integrity after migration
- Test RLS policies with different user roles
- Verify foreign key constraints work correctly

### Mobile App Verification
- Run `npm install` successfully
- Verify TypeScript compilation succeeds
- Test app builds for development
- Verify assets display correctly
- Test environment configuration

### Feature Verification
- Test WhatsApp integration end-to-end
- Test email delivery end-to-end
- Test Buku Mesyuarat sharing flow
- Test QR code generation and scanning
- Test multi-bureau access control

---

## Documentation Plan

### Update README
- Add environment variable setup instructions
- Add database migration instructions
- Add mobile app setup instructions
- Add external service setup instructions (WAHA, Resend, Google Drive)

### Update Migration Documentation
- Document migration execution order
- Document rollback procedures
- Add migration testing checklist

### Update Security Documentation
- Document security best practices
- Add input validation guidelines
- Document RLS policy structure

---

## Operational Notes

### Migration Execution
1. Create full database backup before migration
2. Execute migrations in recommended order (U2, U3)
3. Verify each migration success
4. Test critical application functions
5. Monitor for errors
6. Have rollback plan ready

### Environment Setup
1. Create .env files for each environment (dev, staging, prod)
2. Never commit .env files to version control
3. Rotate API keys after removing from source code
4. Document environment variable requirements

### External Service Setup
1. WAHA server requires separate infrastructure setup
2. Resend requires domain verification (may take 24-48 hours)
3. Google Drive API requires OAuth setup
4. Plan external service setup in advance of implementation

---

## Success Metrics

- All hardcoded API keys removed from source code
- Environment variable configuration implemented
- Database migration executes successfully in staging
- Mobile app builds without errors
- Input validation prevents injection attacks
- RLS policies enforce proper access control
- WhatsApp integration sends messages successfully
- Email delivery works with Resend
- Buku Mesyuarat sharing system functional
- Security audit passes with no CRITICAL issues
- Requirements verification shows >80% success rate
