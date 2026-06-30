# Unified Sistem Hebahan Implementation Plan

**Date:** 2026-06-30
**Type:** feat
**Origin:** Compiled from Plan 001 (Meeting System Enhancements) and Plan 002 (Sistem Hebahan)
**Status:** Ready for Implementation

---

## Summary

Evolve the existing Sistem Mesyuarat into Sistem Hebahan - a unified announcement and event management system for all DPMM bureaus. This comprehensive plan combines meeting system enhancements with broader event management capabilities, including WhatsApp interactive responses, scheduled reminders, Resend email delivery, secure Buku Mesyuarat sharing, multi-bureau support, non-member contact management, and native mobile check-in app.

---

## Problem Frame

DPMM Johor currently has Sistem Mesyuarat for meeting management, but multiple bureaus need to host various events for both members and non-members. The current system is meeting-focused and cannot handle broader event types or non-member attendees. Additionally, the organization needs secure Buku Mesyuarat sharing with access logging, automated reminder execution without manual intervention, and efficient check-in processes. Bureaus currently use WhatsApp groups, email blasts, and manual phone calls, requiring significant manual effort.

---

## Requirements

### Core Requirements (from Plan 002)
- All bureaus can create any event type in one unified system
- Event creation includes blast channel selection (WhatsApp, Email, or both)
- Non-member contacts can be managed via CSV/Excel upload
- RSVP collection automated via WhatsApp and Email
- WhatsApp templates with images can be created and scheduled for automated blasts
- Reminders execute automatically without user intervention
- QR codes generated for RSVP and event details
- QR codes generated for all confirmed attendees for check-in
- Check-in process efficient with QR code scanning via native mobile app
- Multi-bureau access control enforced

### Additional Requirements (from Plan 001)
- WhatsApp interactive response buttons for meeting invites and reminders
- Email delivery includes meeting notice as attachment
- Secure Buku Mesyuarat sharing with QR codes and member ID authentication
- In-house flipping book viewer for Buku Mesyuarat with single/double page view, zoom, and table of contents
- Access logging for Buku Mesyuarat viewing
- Files hosted within DPMM environment using Google Drive

---

## Key Technical Decisions

### Database Schema Approach
- Use ALTER TABLE on existing `DPMM_MESYUARAT` table instead of creating new `DPMM_EVENTS` table
- Add columns: event_type, bureau, blast_channel, rsvp_deadline, buku_mesyuarat_file_id, buku_mesyuarat_file_type
- Create new `DPMM_RSVP` table for RSVP tracking (separate from attendance tracking)
- Create new `DPMM_NON_MEMBER_CONTACTS` table for external contacts
- Add bureau column to `DPMM_USERS` table
- Data migration: preserve existing meeting data, extend with new capabilities

### RSVP Tracking
- New `DPMM_RSVP` table for cleaner separation from attendance tracking
- Supports both members (via member ID) and non-members (via email)
- Tracks RSVP channel (WhatsApp/Email), response options, and timestamps
- Separate from `DPMM_KEHADIRAN` which remains for actual attendance tracking

### Check-in App Architecture
- Native mobile app (React Native or Flutter) for check-in functionality
- Offline-first design with sync when connection restored
- QR code scanning with attendee verification
- Real-time attendance dashboard integration

### WhatsApp Integration
- Extend existing WAHA integration to support interactive response buttons
- WAHA webhook for member responses
- Template system with image support stored in Supabase Storage
- Scheduled blast queue with automated execution via Edge Functions

### Email Delivery
- Replace EmailJS with Resend for transactional email delivery
- Supabase Edge Function for email sending
- Email templates for meeting invites with interactive response buttons
- Email delivery tracking and bounce handling

### Buku Mesyuarat System
- Google Drive integration for file hosting
- QR code generation for secure access
- Member ID authentication before document access
- Access logging with member ID and timestamp
- Open-source flipping book library (turn.js, PageFlip, or similar)
- Single/double page view, zoom, table of contents
- PDF and image format support

### Scheduled Execution
- Supabase Edge Functions with cron triggers for automated reminder execution
- Scheduled blast queue in `DPMM_BLAST_QUEUE` with execution timestamp
- No user intervention required during execution

---

## Implementation Units

### U1. Database Schema Migration

**Goal:** Extend existing DPMM_MESYUARAT table and create new tables for event management, RSVP tracking, and non-member contacts.

**Dependencies:** None

**Files:**
- `migrations/2026_06_30_schema_migration.sql` (new)
- `migrations/2026_06_30_data_migration.sql` (new)

**Approach:**
- Add columns to DPMM_MESYUARAT: event_type, bureau, blast_channel, rsvp_deadline, buku_mesyuarat_file_id, buku_mesyuarat_file_type
- Create DPMM_RSVP table with columns: id, event_id, attendee_type, attendee_identifier, status, channel, response_timestamp, UNIQUE(event_id, attendee_identifier)
- Create DPMM_NON_MEMBER_CONTACTS table with columns: id, nama, email, phone, organization, bureau, created_at, created_by, UNIQUE(email), UNIQUE(phone)
- Add bureau column to DPMM_USERS table
- Create DPMM_SCHEDULED_REMINDERS table with columns: id, mesyuarat_id, template_id, scheduled_time, status, created_by, created_at, executed_at, execution_log
- Create DPMM_BUKU_MESYUARAT_ACCESS_LOG table with columns: id, mesyuarat_id, no_ahli, access_timestamp, access_type, ip_address
- Add columns to DPMM_KEHADIRAN: response_channel, response_timestamp
- Create RLS policies for new tables with bureau-based access control
- Data migration: preserve existing DPMM_MESYUARAT data, set event_type='meeting' for existing records

**Test scenarios:**
- Migration runs successfully without errors
- Existing data in DPMM_MESYUARAT preserved
- New columns added with correct constraints
- RLS policies enforce bureau-based access
- Foreign key relationships work correctly

**Verification:** Run migration in staging, verify data integrity, test RLS policies with different user roles.

---

### U2. Non-Member Contact Management

**Goal:** Enable non-member contact management with CSV/Excel upload functionality.

**Dependencies:** U1

**Files:**
- `index.html` (modify - add non-member contacts tab and upload UI)
- `js/non-member-contacts.js` (new)
- `js/csv-excel-parser.js` (new)

**Approach:**
- Add "Non-Member Contacts" tab to main UI
- Implement CSV upload with PapaParse validation
- Implement Excel upload with SheetJS validation
- Validate required fields (name, email, phone), email format, phone format
- Duplicate detection based on email and phone
- Bulk import with progress indicator and error reporting
- Manual single contact addition form
- Contact list view with search and filter
- Contact edit and delete functionality
- Bureau assignment for contacts

**Test scenarios:**
- CSV upload with valid data stores successfully
- Excel upload with valid data stores successfully
- Invalid email format rejected with error
- Missing required fields rejected
- Duplicate contacts detected and prevented
- Bureau assignment works correctly

**Verification:** Test CSV/Excel upload with various formats, verify validation rules, test duplicate detection, test bureau assignment.

---

### U3. RSVP Tracking System

**Goal:** Implement unified RSVP system for members (WhatsApp) and non-members (Email).

**Dependencies:** U1, U2

**Files:**
- `index.html` (modify - add RSVP tracking UI)
- `js/rsvp-tracker.js` (new)
- `supabase/functions/rsvp-webhook` (new Edge Function)

**Approach:**
- Create RSVP tracking UI showing event RSVP status
- Implement WhatsApp interactive response buttons for members: "Saya Hadir", "Saya Tidak Hadir", "Tidak Pasti"
- Implement Email RSVP buttons for non-members with email capture
- RSVP options customizable per event type
- Responses automatically update DPMM_RSVP table
- Track RSVP channel (WhatsApp/Email)
- RSVP deadline enforcement with automatic reminder for non-responders
- RSVP confirmation sent to attendee via original channel
- Edge Function webhook for WhatsApp button responses

**Test scenarios:**
- Member RSVPs via WhatsApp button, status updated correctly
- Non-member RSVPs via Email, status updated correctly
- RSVP deadline passed, reminder sent to non-responders
- Multiple RSVP attempts from same attendee handled correctly
- RSVP tracking visible in event dashboard

**Verification:** Test WhatsApp interactive buttons, test Email RSVP flow, verify RSVP tracking updates, test deadline enforcement.

---

### U4. WhatsApp Template with Image Support

**Goal:** Add image support to WhatsApp templates and enable scheduled blast execution.

**Dependencies:** U1

**Files:**
- `index.html` (modify - add image upload to template creation)
- `js/template-manager.js` (modify - add image handling)
- `supabase/functions/scheduled-blast` (new Edge Function)
- `migrations/2026_06_30_template_images.sql` (new - add image_url to DPMM_TEMPLATES)

**Approach:**
- Add image upload field to template creation UI
- Store template images in Supabase Storage bucket `template-images`
- Add image_url column to DPMM_TEMPLATES table
- Image upload validation: format (JPG, PNG, GIF), size limit (5MB)
- Template blast scheduling with specific date and time
- Recipient selection: all invitees, non-responders only, custom list
- Scheduled blast queue in DPMM_BLAST_QUEUE with execution timestamp
- Edge Function cron trigger to execute scheduled blasts automatically
- No user intervention required during execution
- Template blast history and status tracking

**Test scenarios:**
- Template with image created successfully
- Scheduled blast executes at specified time
- Image attachment included in WhatsApp message
- Blast history visible with status
- Recipient filtering works correctly

**Verification:** Test image upload with various formats, test scheduled blast execution, verify image attachment, test recipient filtering.

---

### U5. QR Code for RSVP and Event Details

**Goal:** Generate QR codes for RSVP and event details access.

**Dependencies:** U1

**Files:**
- `index.html` (modify - add QR code generation UI)
- `js/qr-generator.js` (new)
- `js/event-details-page.js` (new)

**Approach:**
- Use qrcode.js library for QR code generation
- Generate QR code containing event details URL (event ID + token)
- QR code downloadable as PNG image
- QR code shareable via WhatsApp, Email, or printed materials
- Create event details page accessible via QR code scan
- Event details page shows: title, date/time, location, description, RSVP deadline
- RSVP options available on event details page
- QR code regeneration when event details change
- QR code analytics tracking (scan count, sources)

**Test scenarios:**
- QR code generated successfully
- Scanning QR code opens event details page
- RSVP options work on event details page
- QR code regeneration works when details change
- Analytics tracked correctly

**Verification:** Test QR code generation, test scanning with mobile device, verify event details page functionality, test analytics.

---

### U6. QR Code for Attendee Check-In

**Goal:** Generate unique QR codes for each confirmed attendee for check-in.

**Dependencies:** U1, U3

**Files:**
- `index.html` (modify - add QR code generation for attendees)
- `js/attendee-qr-generator.js` (new)
- `migrations/2026_06_30_attendee_checkin.sql` (new - add check-in columns to DPMM_RSVP)

**Approach:**
- Generate unique QR code for each confirmed attendee
- QR code contains event ID + attendee token (minimal identifiable information)
- QR codes downloadable as batch PDF or individual images
- Add check-in columns to DPMM_RSVP: checked_in, check_in_timestamp, check_in_method
- Token-based identification (member ID or email hashed)
- QR code generation triggered when RSVP status = "Saya Hadir"

**Test scenarios:**
- QR codes generated for confirmed attendees
- Batch PDF download works
- QR codes contain correct attendee tokens
- PDF includes all confirmed attendees

**Verification:** Test QR code generation for single attendee, test batch PDF download, verify token uniqueness.

---

### U7. Native Mobile Check-In App - Scaffolding

**Goal:** Set up React Native project structure and authentication.

**Dependencies:** U6

**Files:**
- `mobile-app/` (new directory - React Native project)
- `mobile-app/App.tsx` (new)
- `mobile-app/screens/LoginScreen.tsx` (new)
- `mobile-app/services/auth.ts` (new)
- `mobile-app/services/api.ts` (new)

**Approach:**
- Use React Native with Expo for cross-platform development
- Implement authentication: check-in staff login with email/password via Supabase Auth
- Store auth token securely (encrypted local storage)
- Set up Supabase client integration with auth context
- Create app navigation structure
- Add missing dependencies: @react-native-async-storage/async-storage, @react-native-community/netinfo, @expo/vector-icons
- Fix TypeScript configuration (standalone config instead of expo/tsconfig.base)

**Test scenarios:**
- User logs in successfully, auth token stored
- Invalid credentials handled correctly
- Network failure during login handled
- Auth token refresh works
- TypeScript compilation succeeds

**Verification:** Test login flow, verify auth token storage, test token refresh, verify TypeScript compilation.

---

### U8. QR Code Scanning Feature

**Goal:** Implement QR code scanning with camera integration.

**Dependencies:** U7, U6

**Files:**
- `mobile-app/screens/CheckInScreen.tsx` (new)
- `mobile-app/services/qr-scanner.ts` (new)

**Approach:**
- Use react-native-camera or expo-camera for QR code scanning
- Implement camera permission handling
- Parse QR code content (event ID + attendee token)
- Validate token against Supabase RSVP table
- Show attendee name and photo (if available) for verification
- Handle poor lighting with camera flash option
- Support manual token entry as fallback

**Test scenarios:**
- QR code scanned, attendee verified, check-in recorded
- Poor lighting handled with flash
- Damaged QR code handled with manual entry
- Camera permission denied handled
- Invalid QR code handled
- Network failure during validation handled

**Verification:** Test QR code scanning, test manual token entry, verify check-in recording, test error handling.

---

### U9. Offline Sync Service

**Goal:** Implement offline-first data sync for check-in operations.

**Dependencies:** U7, U8

**Files:**
- `mobile-app/services/offline-sync.ts` (new)
- `mobile-app/services/local-storage.ts` (new)

**Approach:**
- Cache attendee data locally before event (SQLite or AsyncStorage)
- Store check-in operations locally when offline
- Implement sync service to batch updates when connection restored
- Conflict resolution: last-write-wins for check-in timestamps
- Show sync status indicator in UI
- Implement retry logic for failed sync operations

**Test scenarios:**
- Offline check-ins cached successfully
- Sync works when connection restored
- Large attendee lists handled
- Partial sync failures handled
- Conflict resolution works correctly
- Real-time dashboard reflects synced data

**Verification:** Test offline mode, test sync on connection restore, test conflict resolution, verify dashboard updates.

---

### U10. Attendance Dashboard

**Goal:** Build real-time attendance dashboard for event organizers.

**Dependencies:** U7, U9

**Files:**
- `mobile-app/screens/DashboardScreen.tsx` (new)
- `mobile-app/services/realtime.ts` (new)

**Approach:**
- Use Supabase realtime subscriptions for live attendance updates
- Dashboard shows: expected, checked-in, pending counts
- Manual check-in override for QR code issues or forgotten QR codes
- Bulk check-in support for groups/delegations
- Check-in timestamp recorded with timezone
- Export attendance report as CSV

**Test scenarios:**
- Dashboard updates in real-time
- Counts accurate
- Manual check-in override works
- Bulk check-in works
- CSV export works
- Realtime subscription failure handled

**Verification:** Test realtime updates, test manual check-in override, test bulk check-in, test CSV export.

---

### U11. Multi-Bureau Access Control

**Goal:** Implement bureau-based access control for users and events.

**Dependencies:** U1

**Files:**
- `index.html` (modify - add bureau assignment to user management)
- `js/access-control.js` (new)
- `migrations/2026_06_30_bureau_access.sql` (new - update RLS policies)

**Approach:**
- Bureau options: Biro Professional, Biro Kontraktor, Biro International Trade
- Update RLS policies for DPMM_MESYUARAT: bureau admins can only create/edit events for their assigned bureau
- Update RLS policies for DPMM_RSVP: bureau admins can only view RSVP data for their events
- Update RLS policies for DPMM_NON_MEMBER_CONTACTS: bureau admins can only access contacts for their bureau
- Super admin role can view all bureaus' events
- Bureau assignment configurable in user management UI
- Add bureau filter to event list view

**Test scenarios:**
- Bureau admin creates event for their bureau
- Bureau admin cannot access other bureaus' events
- Super admin can access all bureaus' data
- User with no bureau assignment handled
- Bureau filter works correctly
- RLS policies enforced correctly

**Verification:** Test bureau admin access control, test super admin access, test RLS policies, test bureau filter.

---

### U12. Frontend UI Updates for Event Creation

**Goal:** Update frontend UI for event creation with blast channel selection and event type support.

**Dependencies:** U1, U11

**Files:**
- `index.html` (modify - update event creation form)
- `js/event-manager.js` (modify - add event type and bureau selection)

**Approach:**
- Add event type dropdown to event creation form (meeting, seminar, workshop, networking, training, other)
- Add bureau assignment dropdown to event creation form
- Add blast channel selection (WhatsApp, Email, or both)
- Add reminder scheduling options
- Update event list view to show event type and bureau
- Update RSVP tracking UI to support new event types
- Maintain backward compatibility with existing meeting events

**Test scenarios:**
- Event created with all new fields
- Event saved correctly
- Event type "other" with custom description handled
- Multiple blast channels handled
- Event list shows new fields
- RSVP tracking works for all event types
- Backward compatibility maintained

**Verification:** Test event creation with all new fields, test event list view, test RSVP tracking, verify backward compatibility.

---

### U13. Automated Reminder Scheduling and Execution

**Goal:** Implement automated reminder scheduling and execution via Edge Functions.

**Dependencies:** U1, U3, U4

**Files:**
- `index.html` (modify - add reminder scheduling UI)
- `js/reminder-scheduler.js` (new)
- `supabase/functions/reminder-executor` (new Edge Function)
- `migrations/2026_06_30_reminders.sql` (new - create DPMM_REMINDERS table)

**Approach:**
- Create DPMM_REMINDERS table with columns: id, event_id, scheduled_time, recipient_filter, template_id, status, created_at, sent_at
- Add reminder scheduling UI to event management
- Users can schedule reminders with specific date and time
- Recipient selection: all invitees, non-responders only, custom list
- Reminder templates customizable per event type
- Reminder templates can include images
- Edge Function cron trigger to execute reminders automatically at scheduled time
- No user intervention required during execution
- Reminder history and status tracking

**Test scenarios:**
- Reminder scheduled successfully
- Executes at specified time
- Sent to correct recipients
- Non-responders filter works
- Template with image works
- Reminder history visible
- Reminders sent via correct channels

**Verification:** Test reminder scheduling, test automated execution, verify recipient filtering, test template with image.

---

### U14. Resend Email Integration

**Goal:** Implement email delivery system using Resend to replace EmailJS.

**Dependencies:** U1

**Files:**
- `js/email-integration.js` (new)
- `js/email-templates.js` (new)
- `supabase/functions/send-email` (new Edge Function)
- `index.html` (modify - remove EmailJS, add Resend integration)

**Approach:**
- Set up Resend account and domain verification (external infrastructure)
- Create Resend API client integration via Supabase Edge Function
- Implement email template system
- Implement email blast execution
- Implement RSVP email handling
- Add email delivery tracking
- Replace EmailJS integration with Resend
- Handle bounce and complaint callbacks from Resend webhooks

**Test scenarios:**
- Email sent successfully with Resend
- Email template renders correctly
- Email blast execution works
- RSVP email handling works
- Email delivery tracking works
- Bounce handling works
- EmailJS completely removed

**Verification:** Send test emails, verify templates render correctly, test email blasts and RSVP handling, verify EmailJS removal.

---

### U15. Google Drive Integration for Buku Mesyuarat

**Goal:** Integrate Google Drive API for secure Buku Mesyuarat file hosting and management.

**Dependencies:** U1

**Files:**
- `supabase/functions/google-drive-upload` (new Edge Function)
- `supabase/functions/google-drive-access` (new Edge Function)
- `index.html` (modify - add file upload UI)

**Approach:**
- Extend existing Google Drive integration to support Buku Mesyuarat file upload
- Implement file upload function that accepts PDF/image files and uploads to meeting-specific folder
- Store file ID and type in DPMM_MESYUARAT table
- Implement access control function that validates member ID before granting file access
- Generate shareable links with expiration for QR code generation
- Handle file format validation (PDF and image formats only)

**Test scenarios:**
- PDF file uploaded successfully
- File ID stored in database
- Image file uploaded successfully
- Invalid file format rejected
- Access control validates member ID
- Shareable link generation works
- File format validation works

**Verification:** Upload test files, verify Google Drive folder contains files, check database records, test access control.

---

### U16. In-House Flipping Book Viewer

**Goal:** Implement flipping book viewer for Buku Mesyuarat with single/double page view, zoom, and table of contents.

**Dependencies:** U15

**Files:**
- `src/viewer/flipping-book-viewer.js` (new)
- `src/viewer/flipping-book-viewer.css` (new)
- `index.html` (modify - add viewer UI)
- `package.json` (modify - add PageFlip dependency)

**Approach:**
- **Selected Library: PageFlip (npm: page-flip)** - Modern, actively maintained, supports single/double page, zoom, responsive design, PDF and image formats
- Install PageFlip via npm: `npm install page-flip`
- Implement viewer component that loads files from Google Drive via authenticated access
- Add single/double page view toggle
- Implement zoom in/out functionality
- Generate table of contents from PDF structure or manual input
- Ensure responsive design for mobile and desktop
- Disable download functionality as per requirements
- Support PDF and image formats
- Add keyboard navigation (arrow keys for page turning)
- Add touch gestures for mobile (swipe to turn pages)

**Test scenarios:**
- PDF file loads as flipping book
- Animations work correctly
- Single/double page view toggle works
- Zoom functionality works
- Table of contents generated correctly
- Responsive design works on mobile
- Download disabled
- Image formats supported

**Verification:** Load test PDF, verify flipping animations, test zoom and page view modes, test responsive design.

---

### U17. QR Code Generation and Member ID Authentication for Buku Mesyuarat

**Goal:** Generate QR codes for Buku Mesyuarat access and implement member ID authentication.

**Dependencies:** U15, U16

**Files:**
- `supabase/functions/generate-qr-code` (new Edge Function)
- `src/auth/member-id-auth.js` (new)
- `index.html` (modify - add QR code display and login UI)

**Approach:**
- Implement QR code generation function using open-source library (qrcode.js or similar)
- Generate QR codes containing unique access tokens linked to meeting and member ID
- Create authentication page where members input their member ID
- Validate member ID against DPMM_KEHADIRAN table
- On successful authentication, redirect to flipping book viewer with access token
- Log authentication attempt to DPMM_BUKU_MESYUARAT_ACCESS_LOG

**Test scenarios:**
- Valid member ID grants access to Buku Mesyuarat
- Invalid member ID denied access with error message
- QR code generation works
- Authentication logged correctly
- Access token works with viewer
- Error handling for failed authentication

**Verification:** Generate test QR code, test authentication flow, verify access logging, test viewer integration.

---

### U18. Access Logging System for Buku Mesyuarat

**Goal:** Implement comprehensive access logging for Buku Mesyuarat viewing and authentication attempts.

**Dependencies:** U1, U17

**Files:**
- `supabase/functions/log-access` (new Edge Function)
- `src/logging/access-logger.js` (new)

**Approach:**
- Implement logging function called on every Buku Mesyuarat access event
- Log member ID, timestamp, access type (view/qr), IP address
- Store logs in DPMM_BUKU_MESYUARAT_ACCESS_LOG table
- Create admin UI to view access logs filtered by meeting or member
- Implement log retention policy (e.g., retain for 1 year)
- Ensure logging does not impact viewer performance

**Test scenarios:**
- Access event logged successfully with all required fields
- High concurrent access handled without blocking
- Database write failure logged to fallback without crashing viewer
- Admin UI displays logs correctly with filters
- Log retention policy enforced

**Verification:** Access Buku Mesyuarat, verify log entry created, check admin UI displays log, test retention policy.

---

### U19. WAHA Interactive Response Integration

**Goal:** Extend WAHA integration to support interactive response buttons and webhook callbacks.

**Dependencies:** U1, U3

**Files:**
- `scripts/waha-interactive-handler.js` (new)
- `supabase/functions/whatsapp-webhook` (new Edge Function)

**Approach:**
- Modify existing WAHA integration to send messages with interactive response buttons using WhatsApp Business API
- Implement webhook endpoint in Supabase Edge Function to receive member responses
- Parse webhook payload to extract member phone number and selected response option
- Update DPMM_RSVP table with response status, channel (WhatsApp), and timestamp
- Handle rate limits and retry logic for failed deliveries

**Test scenarios:**
- Member clicks "Hadir" button, status updates correctly
- Member responds multiple times, latest response wins
- Webhook receives invalid payload, logs error without crashing
- Response update triggers database constraint validation
- Rate limits handled correctly

**Verification:** Test interactive messages with test WhatsApp number, verify webhook receives callbacks and updates database.

---

### U20. Frontend UI Updates for All Features

**Goal:** Update existing UI to support all new features while maintaining consistency.

**Dependencies:** U2, U3, U4, U5, U6, U11, U12, U13, U16, U17, U18

**Files:**
- `index.html`

**Approach:**
- Add "Non-Member Contacts" tab to admin panel
- Add "Scheduled Reminders" tab to admin panel
- Add "Buku Mesyuarat" section to meeting details for file upload and QR code generation
- Update meeting invite form to include both WhatsApp and Email delivery options
- Add response tracking dashboard showing response rates by channel
- Update member list view to show response status and channel
- Add access log viewer for Buku Mesyuarat monitoring
- Add event type and bureau filters to event list
- Maintain existing Tailwind CSS styling patterns
- Ensure responsive design for mobile access

**Test scenarios:**
- Navigate to new tabs, UI renders correctly
- Large number of scheduled reminders, pagination works
- API failure displays error message
- UI updates reflect real-time database changes
- Responsive design works on mobile
- All new features accessible from UI

**Verification:** Manual testing of all new UI components, verify responsive design on mobile, test real-time updates.

---

## Scope Boundaries

### In Scope
- All features from Plan 001 (Meeting System Enhancements)
- All features from Plan 002 (Sistem Hebahan)
- WhatsApp interactive response system
- Scheduled WhatsApp reminders with template management
- Email delivery system with Resend
- Secure Buku Mesyuarat sharing with QR codes and member ID authentication
- In-house flipping book viewer for Buku Mesyuarat
- Google Drive integration for file hosting
- Access logging for Buku Mesyuarat
- Non-member contact management with CSV/Excel upload
- Unified RSVP system for members and non-members
- QR code generation for RSVP, event details, and attendee check-in
- Native mobile check-in app with offline support
- Multi-bureau access control
- Event type taxonomy and bureau assignment
- Blast channel selection for event invites

### Out of Scope
- WhatsApp calling feature (deferred for future)
- Payment processing for paid events (deferred for future)
- Event materials sharing (deferred for future)
- Advanced analytics on event performance (deferred for future)
- Flipping book effect for email meeting notices (email invites are simple attachments only)
- Download functionality for Buku Mesyuarat (deferred for future)

### Deferred to Follow-Up Work
- WhatsApp calling feature for proactive member contact
- Event registration fees and payment processing
- Event materials and document sharing
- Advanced analytics and reporting dashboards
- Download option for Buku Mesyuarat
- Performance optimization for large events (>500 attendees)
- Advanced security features (certificate pinning, biometric auth)
- Comprehensive unit and integration test suite
- CI/CD pipeline setup
- Mobile app deployment to app stores

---

## Open Questions

- WAHA server setup and configuration - who will handle external infrastructure setup?
- Resend account and domain verification - who will handle external service setup?
- Google Drive API credentials and setup - who will handle external service setup?

## Security Enhancements (Added During Review)

### PII Encryption at Rest
- Encrypt email and phone fields in DPMM_NON_MEMBER_CONTACTS table using Supabase's pgcrypto extension
- Use AES-256 encryption with application-managed encryption keys
- Encryption keys stored in environment variables, never in source code
- Decrypt only when needed for sending messages (WhatsApp/Email)

### Accessibility Requirements
- All UI components must meet WCAG 2.1 AA compliance
- Keyboard navigation support for all interactive elements
- Screen reader announcements for dynamic content changes
- Minimum touch target size of 44x44px for mobile
- Text contrast minimum 4.5:1 for normal text, 3:1 for large text
- Focus indicators visible at all times
- Alt text for all images and icons

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| External service setup (WAHA, Resend, Google Drive) may delay implementation | High | Plan external service setup in advance, document setup requirements |
| Database migration may require downtime for production deployment | Medium | Create migration script with minimal downtime, test in staging first |
| RLS policy changes may break existing access patterns | Medium | Test RLS policies thoroughly in staging, have rollback plan ready |
| Native mobile app development complexity | High | Use cross-platform framework (React Native/Flutter), leverage existing Supabase mobile SDK |
| QR code scanning failures at events | Medium | Provide manual check-in override, test QR code generation thoroughly |
| Multi-bureau access control complexity | Medium | Clear role definitions, thorough testing of RLS policies |
| Performance issues with large events (>500 attendees) | Medium | Implement pagination, optimize database queries, test with large datasets |
| Check-in app connectivity issues at venue | Medium | Offline-first design with sync when connection restored |
| WhatsApp rate limits for large events | Medium | Implement queue system with retry logic, monitor rate limits, stagger blast delivery |
| Flipping book library limitations | Low | Evaluate multiple libraries, have fallback options |

---

## System-Wide Impact

### Data Migration
- Existing meeting data must be preserved during schema migration
- Migration script must handle existing DPMM_MESYUARAT and DPMM_KEHADIRAN data
- Set event_type='meeting' for existing records to maintain backward compatibility

### Access Control Changes
- Multi-bureau access control affects all event and RSVP data access
- RLS policies must be carefully implemented to prevent data leakage between bureaus
- Super admin role must be able to access all bureaus' data

### Mobile App Deployment
- Native mobile app requires app store deployment and version management
- Consider distribution strategy (internal testing, public app store)

### Performance Considerations
- Large events (>500 attendees) may impact mobile app performance and database queries
- Implement pagination and query optimization

### User Training
- Bureau administrators need training on new event types, blast channel selection, and reminder scheduling
- Check-in staff need training on mobile app usage

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
- Run npm install successfully
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
- Test RSVP tracking for members and non-members
- Test scheduled reminder execution
- Test flipping book viewer functionality

---

## Documentation Plan

### Update README
- Add environment variable setup instructions
- Add database migration instructions
- Add mobile app setup instructions
- Add external service setup instructions (WAHA, Resend, Google Drive)
- Document new event types and bureau system
- Document Buku Mesyuarat sharing system

### Update Migration Documentation
- Document migration execution order
- Document rollback procedures
- Add migration testing checklist

### Update Security Documentation
- Document security best practices
- Add input validation guidelines
- Document RLS policy structure
- Document access logging system

---

## Operational Notes

### Migration Execution
1. Create full database backup before migration
2. Execute migrations in recommended order (U1 first, then other units as needed)
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
- RSVP tracking works for members and non-members
- Non-member contact management functional
- QR code generation and scanning works
- Mobile check-in app functional with offline support
- Multi-bureau access control enforced
- Scheduled reminders execute automatically
- Flipping book viewer functional
- Access logging system operational
- Security audit passes with no CRITICAL issues
- Requirements verification shows >80% success rate
