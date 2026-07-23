# feat: WhatsApp interactive responses, scheduled reminders, Resend email, and secure Buku Mesyuarat sharing

**Date:** 2026-06-29  
**Type:** feat  
**Origin:** docs/brainstorms/2026-06-29-meeting-system-enhancements-requirements.md  
**Status:** Ready for Implementation

---

## Summary

Implement a hybrid multi-channel response system and secure document sharing for the DPMM Meeting System. This includes WhatsApp interactive response buttons for meeting invites and reminders, scheduled automated WhatsApp reminders that execute without user intervention, Resend email delivery replacing EmailJS, and secure Buku Mesyuarat sharing with QR codes, member ID authentication, and an in-house flipping book viewer hosted on Google Drive.

---

## Problem Frame

The DPMM Meeting System currently requires significant manual effort for collecting member responses, following up with non-responders, managing email delivery (EmailJS free tier templates maxed out), and sharing Buku Mesyuarat securely while maintaining access logs. Members sometimes don't respond at all or type free-text responses requiring manual processing. The organization wants to eliminate full-time staff monitoring by training "Aiman" to automate these tasks. (see origin: Problem Statement)

---

## Requirements

### WhatsApp Interactive Response System
- Initial invites include response options: "Maklum, Terima", "Hadir", "Tidak Hadir", "Tidak Pasti"
- Reminders include response options: "HADIR", "TIDAK HADIR", "TIDAK PASTI"
- Responses automatically update the `DPMM_KEHADIRAN` table
- Members can respond via WhatsApp without typing free text
- System tracks which channel (WhatsApp/Email) member used to respond

### Scheduled WhatsApp Reminders
- Users can create and manage reminder templates
- Users can schedule reminders with specific date and time
- Users can select recipients from member response data (e.g., non-responders)
- System executes scheduled reminders automatically at specified time
- No user intervention required during execution
- System logs all scheduled and executed reminders
- Users can view scheduled reminder history and status

### Email Delivery System
- Every meeting invite is delivered via both WhatsApp and Email
- Email includes meeting notice as a simple attachment (no flipping effect)
- Email includes interactive response buttons for members to reply
- Email delivery uses Resend (replacing EmailJS)
- System tracks email delivery status

### Secure Buku Mesyuarat Sharing
- Buku Mesyuarat shared via QR codes
- Members must input their member ID to access documents
- All access is logged with member ID and timestamp
- Files hosted within DPMM environment using Google Drive
- Viewer has flipping book effect (like a real book)
- Viewer supports single and double page view
- Viewer includes table of contents
- Viewer supports zoom in and zoom out
- Viewer handles both PDF and image formats
- Download option not available initially

---

## Key Technical Decisions

### Use WAHA for WhatsApp Integration
WAHA is already in use for WhatsApp blast via `scripts/blast-runner.js`. Extend this to support interactive response buttons and webhook callbacks for member responses. (see origin: Technical Constraints)

### Use Resend for Email Delivery
Replace EmailJS with Resend based on research in `docs/email-providers-research.md`. Resend offers 3,000 emails/month free, modern developer experience, and good deliverability (97% Gmail, 93% Outlook). Implement backend endpoint for email sending via Supabase Edge Function. (see origin: Technical Constraints, Dependencies)

### Use Existing DPMM_KEHADIRAN Table
Do not create per-meeting tables. Use the existing `DPMM_KEHADIRAN` table for all responses to maintain better reporting and data consistency. Add columns for response channel tracking and timestamp. (see origin: Technical Constraints, Constraints)

### Use Google Drive for File Hosting
Leverage existing Google Drive integration for Buku Mesyuarat hosting. Files remain within DPMM environment for security and compliance. (see origin: Technical Constraints, Security Constraints)

### Scheduled Reminder Queue System
Create a new table `DPMM_SCHEDULED_REMINDERS` to manage scheduled WhatsApp reminders. Implement a cron job or Supabase Edge Function to execute reminders at scheduled times without user intervention.

### Open-Source Flipping Book Library
Select and integrate an open-source flipping book library (e.g., turn.js, PageFlip, or similar) for the Buku Mesyuarat viewer. Evaluate libraries for PDF/image support, single/double page view, zoom, and table of contents capabilities. (see origin: Technical Constraints)

---

## Implementation Units

### U1. Database Schema Updates

**Goal:** Add tables and columns to support scheduled reminders, response channel tracking, and access logging.

**Requirements:** Scheduled WhatsApp Reminders, WhatsApp Interactive Response System, Secure Buku Mesyuarat Sharing

**Dependencies:** None

**Files:**
- `migrations/2026_06_29_add_scheduled_reminders.sql`
- `migrations/2026_06_29_add_response_channel_tracking.sql`
- `migrations/2026_06_29_add_buku_mesyuarat_access_log.sql`

**Approach:**
- Create `DPMM_SCHEDULED_REMINDERS` table with columns: id, mesyuarat_id, template_id, scheduled_time, status, created_by, created_at, executed_at, execution_log
- Add columns to `DPMM_KEHADIRAN`: response_channel (TEXT), response_timestamp (TIMESTAMPTZ)
- Create `DPMM_BUKU_MESYUARAT_ACCESS_LOG` table with columns: id, mesyuarat_id, no_ahli, access_timestamp, access_type (view/qr), ip_address
- Add column to `DPMM_MESYUARAT`: buku_mesyuarat_file_id (TEXT), buku_mesyuarat_file_type (TEXT)

**Patterns to follow:** Existing migration pattern in `migrations/2026_04_22_full_schema.sql` with IF NOT EXISTS and RLS policies

**Test scenarios:**
- Happy path: Create scheduled reminder record successfully
- Edge case: Scheduled reminder with past date should handle gracefully
- Error path: Invalid status values should be rejected by CHECK constraint
- Integration: Foreign key to DPMM_MESYUARAT should cascade on delete

**Verification:** Run migrations in Supabase SQL Editor, verify tables created with correct columns and RLS policies

---

### U2. WAHA Interactive Response Integration

**Goal:** Extend WAHA integration to support interactive response buttons and webhook callbacks.

**Requirements:** WhatsApp Interactive Response System

**Dependencies:** U1

**Files:**
- `scripts/waha-interactive-handler.js`
- `supabase/functions/whatsapp-webhook/index.ts`

**Approach:**
- Modify existing WAHA integration to send messages with interactive response buttons using WhatsApp Business API
- Implement webhook endpoint in Supabase Edge Function to receive member responses
- Parse webhook payload to extract member phone number and selected response option
- Update `DPMM_KEHADIRAN` table with response status, channel (WhatsApp), and timestamp
- Handle rate limits and retry logic for failed deliveries

**Patterns to follow:** Existing WAHA integration in `scripts/blast-runner.js`

**Test scenarios:**
- Happy path: Member clicks "Hadir" button, status updates correctly
- Edge case: Member responds multiple times, latest response wins
- Error path: Webhook receives invalid payload, logs error without crashing
- Integration: Response update triggers database constraint validation

**Verification:** Test interactive messages with test WhatsApp number, verify webhook receives callbacks and updates database

---

### U3. Scheduled Reminder System

**Goal:** Implement template management and automated execution of scheduled WhatsApp reminders.

**Requirements:** Scheduled WhatsApp Reminders

**Dependencies:** U1, U2

**Files:**
- `migrations/2026_06_29_add_reminder_templates.sql`
- `supabase/functions/scheduled-reminder-executor/index.ts`
- `index.html` (add reminder scheduling UI)

**Approach:**
- Create `DPMM_REMINDER_TEMPLATES` table for reusable reminder templates
- Implement Supabase Edge Function cron job to query `DPMM_SCHEDULED_REMINDERS` for due reminders
- For each due reminder, fetch recipient list based on filter criteria (e.g., non-responders)
- Send WhatsApp messages using WAHA integration from U2
- Update reminder status to "Executed" with execution log
- Add UI in existing admin panel to create templates and schedule reminders
- Display reminder history and status in UI

**Patterns to follow:** Existing template system in `DPMM_TEMPLATES`, existing queue pattern in `DPMM_BLAST_QUEUE`

**Test scenarios:**
- Happy path: Reminder scheduled for future time executes automatically
- Edge case: Reminder with no matching recipients logs appropriately
- Error path: WAHA API failure during execution, retries with exponential backoff
- Integration: Scheduled reminder updates `DPMM_KEHADIRAN` when members respond

**Verification:** Schedule test reminder, verify automatic execution at scheduled time, check database status updates

---

### U4. Resend Email Integration

**Goal:** Replace EmailJS with Resend for transactional email delivery.

**Requirements:** Email Delivery System

**Dependencies:** U1

**Files:**
- `supabase/functions/send-email/index.ts`
- `index.html` (remove EmailJS, add Resend integration)
- `.github/workflows/deploy.yml` (add RESEND_API_KEY secret)

**Approach:**
- Create Supabase Edge Function for email sending using Resend SDK
- Configure Resend domain verification and DKIM/SPF records
- Create email templates for meeting invites with interactive response buttons
- Replace EmailJS calls in frontend with calls to Supabase Edge Function
- Track email delivery status in `DPMM_SEND_LOG` or new email-specific log table
- Handle bounce and complaint callbacks from Resend webhooks

**Patterns to follow:** Existing email pattern using Nodemailer, migrate to Resend SDK

**Test scenarios:**
- Happy path: Email sent successfully with attachment and response buttons
- Edge case: Invalid email address, handle bounce appropriately
- Error path: Resend API rate limit, queue and retry
- Integration: Email response button click updates `DPMM_KEHADIRAN`

**Verification:** Send test email to test address, verify delivery, check delivery status tracking

---

### U5. Google Drive Integration for Buku Mesyuarat

**Goal:** Integrate Google Drive API for secure Buku Mesyuarat file hosting and management.

**Requirements:** Secure Buku Mesyuarat Sharing

**Dependencies:** U1

**Files:**
- `supabase/functions/google-drive-upload/index.ts`
- `supabase/functions/google-drive-access/index.ts`
- `index.html` (add file upload UI)

**Approach:**
- Extend existing Google Drive integration to support Buku Mesyuarat file upload
- Implement file upload function that accepts PDF/image files and uploads to meeting-specific folder
- Store file ID and type in `DPMM_MESYUARAT` table
- Implement access control function that validates member ID before granting file access
- Generate shareable links with expiration for QR code generation
- Handle file format validation (PDF and image formats only)

**Patterns to follow:** Existing Google Drive integration in README

**Test scenarios:**
- Happy path: Upload PDF file successfully, file ID stored in database
- Edge case: Upload invalid file format, reject with error message
- Error path: Google Drive API quota exceeded, handle gracefully
- Integration: File upload triggers database update with file metadata

**Verification:** Upload test file, verify Google Drive folder contains file, check database record

---

### U6. In-House Flipping Book Viewer

**Goal:** Implement flipping book viewer for Buku Mesyuarat with single/double page view, zoom, and table of contents.

**Requirements:** Secure Buku Mesyuarat Sharing

**Dependencies:** U5

**Files:**
- `src/viewer/flipping-book-viewer.js`
- `src/viewer/flipping-book-viewer.css`
- `index.html` (add viewer UI)

**Approach:**
- Select open-source flipping book library (evaluate turn.js, PageFlip, or similar)
- Implement viewer component that loads files from Google Drive via authenticated access
- Add single/double page view toggle
- Implement zoom in/out functionality
- Generate table of contents from PDF structure or manual input
- Ensure responsive design for mobile and desktop
- Disable download functionality as per requirements

**Patterns to follow:** Existing Tailwind CSS styling pattern

**Test scenarios:**
- Happy path: Load PDF file, display as flipping book with animations
- Edge case: Large PDF file, handle loading state and pagination
- Error path: Corrupted file, display error message to user
- Integration: Viewer logs access to `DPMM_BUKU_MESYUARAT_ACCESS_LOG`

**Verification:** Load test PDF, verify flipping animations work, test zoom and page view modes

---

### U7. QR Code Generation and Member ID Authentication

**Goal:** Generate QR codes for Buku Mesyuarat access and implement member ID authentication.

**Requirements:** Secure Buku Mesyuarat Sharing

**Dependencies:** U5, U6

**Files:**
- `supabase/functions/generate-qr-code/index.ts`
- `src/auth/member-id-auth.js`
- `index.html` (add QR code display and login UI)

**Approach:**
- Implement QR code generation function using open-source library (qrcode.js or similar)
- Generate QR codes containing unique access tokens linked to meeting and member ID
- Create authentication page where members input their member ID
- Validate member ID against `DPMM_KEHADIRAN` table
- On successful authentication, redirect to flipping book viewer with access token
- Log authentication attempt to `DPMM_BUKU_MESYUARAT_ACCESS_LOG`

**Patterns to follow:** Existing authentication pattern in `DPMM_USERS`

**Test scenarios:**
- Happy path: Valid member ID grants access to Buku Mesyuarat
- Edge case: Invalid member ID, deny access with error message
- Error path: QR code generation fails, display error to admin
- Integration: Successful authentication logs access with timestamp

**Verification:** Generate test QR code, scan with phone, verify authentication flow

---

### U8. Access Logging System

**Goal:** Implement comprehensive access logging for Buku Mesyuarat viewing and authentication attempts.

**Requirements:** Secure Buku Mesyuarat Sharing

**Dependencies:** U1, U7

**Files:**
- `supabase/functions/log-access/index.ts`
- `src/logging/access-logger.js`

**Approach:**
- Implement logging function called on every Buku Mesyuarat access event
- Log member ID, timestamp, access type (view/qr), IP address
- Store logs in `DPMM_BUKU_MESYUARAT_ACCESS_LOG` table
- Create admin UI to view access logs filtered by meeting or member
- Implement log retention policy (e.g., retain for 1 year)
- Ensure logging does not impact viewer performance

**Patterns to follow:** Existing logging pattern in `DPMM_SEND_LOG`

**Test scenarios:**
- Happy path: Access event logged successfully with all required fields
- Edge case: High concurrent access, logging handles without blocking
- Error path: Database write failure, log to fallback without crashing viewer
- Integration: Admin UI displays logs correctly with filters

**Verification:** Access Buku Mesyuarat, verify log entry created, check admin UI displays log

---

### U9. Frontend UI Updates

**Goal:** Update existing UI to support all new features while maintaining consistency.

**Requirements:** All user stories

**Dependencies:** U2, U3, U4, U6, U7, U8

**Files:**
- `index.html`

**Approach:**
- Add "Scheduled Reminders" tab to admin panel for template management and scheduling
- Add "Buku Mesyuarat" section to meeting details for file upload and QR code generation
- Update meeting invite form to include both WhatsApp and Email delivery options
- Add response tracking dashboard showing response rates by channel
- Update member list view to show response status and channel
- Add access log viewer for Buku Mesyuarat monitoring
- Maintain existing Tailwind CSS styling patterns
- Ensure responsive design for mobile access

**Patterns to follow:** Existing UI structure in `index.html` with sidebar navigation

**Test scenarios:**
- Happy path: Navigate to new tabs, UI renders correctly
- Edge case: Large number of scheduled reminders, pagination works
- Error path: API failure, display error message to user
- Integration: UI updates reflect real-time database changes

**Verification:** Manual testing of all new UI components, verify responsive design on mobile

---

## Scope Boundaries

### In Scope
- WhatsApp interactive response system for meeting invites and reminders
- Scheduled WhatsApp reminders with template management and automated execution
- Email delivery system for meeting invites with Resend
- Secure Buku Mesyuarat sharing with QR codes and member ID authentication
- In-house flipping book viewer for Buku Mesyuarat
- Google Drive integration for file hosting
- Access logging for Buku Mesyuarat

### Out of Scope
- Flipping book effect for email meeting notices (email invites are simple attachments only)
- WhatsApp calling feature (deferred for future)
- Download functionality for Buku Mesyuarat (deferred for future)
- Per-meeting database tables (use existing `DPMM_KEHADIRAN` table)
- External document hosting services (e.g., heyzine.com)

### Deferred to Follow-Up Work
- WhatsApp calling feature for "Aiman" to proactively contact members
- Download option for Buku Mesyuarat
- Advanced analytics on member response patterns

---

## Open Questions

None at this time.

---

## Risks & Dependencies

### Risks
- **WhatsApp rate limits affect delivery timing** - Implement queue system with retry logic, monitor rate limits (see origin: Risks and Mitigations)
- **Email deliverability issues** - Use Resend with proper domain verification, monitor bounce rates (see origin: Risks and Mitigations)
- **Members without WhatsApp disadvantaged** - Email serves as backup channel, track delivery status (see origin: Risks and Mitigations)
- **Google Drive API changes** - Use stable API version, monitor for deprecations (see origin: Risks and Mitigations)
- **Flipping book library limitations** - Evaluate multiple libraries, have fallback options (see origin: Risks and Mitigations)
- **Member ID authentication bypass** - Implement secure authentication, log all access attempts (see origin: Risks and Mitigations)

### Dependencies
- WAHA server setup and configuration (see origin: Prerequisites)
- Resend account creation and domain verification (see origin: Prerequisites)
- Google Drive API credentials (see origin: Prerequisites)
- Open-source flipping book library selection and integration (see origin: Prerequisites)

---

## System-Wide Impact

### Affected Parties
- **DPMM Members:** Can respond to meeting invites more conveniently via WhatsApp or Email, access Buku Mesyuarat securely with member ID
- **Administrators:** Can schedule automated reminders, monitor response rates, track Buku Mesyuarat access
- **Operations:** Reduced manual follow-up effort, automated reminder execution eliminates need for full-time staff monitoring

### Operational Changes
- WAHA server must remain running for WhatsApp message delivery
- Resend account must be maintained and monitored for deliverability
- Google Drive storage must be monitored for Buku Mesyuarat file capacity
- Access logs must be reviewed periodically for security compliance

---

## Sources & Research

- Origin requirements document: `docs/brainstorms/2026-06-29-meeting-system-enhancements-requirements.md`
- Email provider research: `docs/email-providers-research.md` (recommends Resend)
- Existing schema: `migrations/2026_04_22_full_schema.sql`
- Existing WAHA integration: `scripts/blast-runner.js`
- README: Technology stack and deployment patterns
