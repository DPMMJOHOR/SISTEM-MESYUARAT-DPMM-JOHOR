# Sistem Hebahan DPMM Johor Requirements

**Date:** 2026-06-29  
**Status:** Ready for Planning  
**Scope:** Standard Feature Development

---

## Problem Statement

DPMM Johor currently has Sistem Mesyuarat for meeting management, but multiple bureaus (Biro Professional, Biro Kontraktor, Biro International Trade) will need to host various events for both members and non-members - seminars, workshops, networking sessions, training programs. The current system is meeting-focused and cannot handle broader event types or non-member attendees. Bureaus currently use WhatsApp groups, email blasts, and manual phone calls to send announcements and collect RSVPs, which requires significant manual effort and human interaction. The organization wants to build a unified "Sistem Hebahan" (Announcement System) that automates event announcements, RSVP collection, and reminders across all event types with minimal human workload.

---

## Proposed Solution

Evolve the existing Sistem Mesyuarat into Sistem Hebahan - a unified announcement and event management system that handles any event type across all DPMM bureaus. The system will generalize the existing meeting infrastructure to support seminars, workshops, networking sessions, training programs, and other events while adding support for non-member contacts and email-based RSVP for external attendees.

---

## User Stories

### Bureau Event Creation

**As a** DPMM bureau administrator  
**I want to** create events of any type (seminar, workshop, networking, training) with invites, RSVP options, reminders, and location details  
**So that** I can manage all bureau events in one system without manual coordination

**Acceptance Criteria:**
- Users can select event type from dropdown (meeting, seminar, workshop, networking, training, other)
- Users can assign event to a bureau (Biro Professional, Biro Kontraktor, Biro International Trade)
- Event creation includes: title, date/time, location, description, RSVP deadline
- Event creation includes blast channel selection: WhatsApp, Email, or both
- Event creation includes reminder scheduling options
- System generates unique event ID and QR code for attendee check-in
- System generates QR code for RSVP and event details

### Non-Member Contact Management

**As a** DPMM bureau administrator  
**I want to** add non-member contacts to a separate contact database via CSV/Excel upload  
**So that** I can invite external attendees to bureau events

**Acceptance Criteria:**
- Separate table `DPMM_NON_MEMBER_CONTACTS` for external contacts
- Fields: name, email, phone, organization, created_at, created_by
- CSV upload with columns: name, email, phone, organization
- Excel upload support (.xlsx, .xls)
- Upload validation: required fields, email format, phone format
- Duplicate detection based on email and phone
- Bulk import with progress indicator and error reporting
- Manual single contact addition option
- Contact list view with search and filter
- Contact edit and delete capabilities

### Unified RSVP System

**As a** DPMM member or non-member attendee  
**I want to** RSVP to events via WhatsApp interactive buttons or email  
**So that** I can confirm attendance without typing free text

**Acceptance Criteria:**
- Members receive WhatsApp invites with interactive response buttons: "Saya Hadir", "Saya Tidak Hadir", "Tidak Pasti"
- Non-members receive email invites with RSVP buttons and must provide email address
- RSVP options customizable per event type
- Responses automatically update RSVP tracking table
- System tracks RSVP channel (WhatsApp/Email)
- Members can RSVP via member ID, non-members via email
- RSVP deadline enforcement with automatic reminder for non-responders
- RSVP confirmation sent to attendee

### WhatsApp Template with Image Support

**As a** DPMM bureau administrator  
**I want to** create WhatsApp templates with images and schedule blasts  
**So that** Aiman can execute the blast with everything prepared when the time comes

**Acceptance Criteria:**
- Users can create WhatsApp templates with text and image attachments
- Image upload supports common formats (JPG, PNG, GIF)
- Image size limits enforced (e.g., max 5MB)
- Templates can be saved and reused for different events
- Users can schedule template blasts with specific date and time
- Users can select recipients: all invitees, non-responders only, or custom list
- System executes scheduled blasts automatically at specified time
- No user intervention required during execution
- System logs all scheduled and executed template blasts
- Users can view template blast history and status
- Template images stored in Google Drive or Supabase Storage

### Automated Reminders

**As a** DPMM bureau administrator  
**I want to** schedule automated reminders for events  
**So that** Aiman executes reminder process without my involvement

**Acceptance Criteria:**
- Users can schedule reminders with specific date and time
- Users can select recipients: all invitees, non-responders only, or custom list
- Reminder templates customizable per event type
- Reminder templates can include images
- System executes reminders automatically at scheduled time
- No user intervention required during execution
- System logs all scheduled and executed reminders
- Users can view reminder history and status
- Reminders sent via WhatsApp (members) and Email (non-members)

### QR Code for RSVP and Event Details

**As a** DPMM event organizer  
**I want to** generate QR codes for RSVP and event details  
**So that** attendees can quickly access event information and respond

**Acceptance Criteria:**
- System generates QR code containing event details URL
- QR code can be shared via WhatsApp, Email, or printed materials
- Scanning QR code opens event details page with RSVP options
- Event details page shows: title, date/time, location, description, RSVP deadline
- RSVP options available on event details page
- QR code can be regenerated if event details change
- QR code analytics track scan count and sources

### QR Code Check-In

**As a** DPMM event organizer  
**I want to** generate QR codes for all attendees and use them for event check-in  
**So that** I can track attendance efficiently at the event venue

**Acceptance Criteria:**
- System generates unique QR code for each confirmed attendee
- QR code contains event ID and attendee identifier (member ID or email)
- QR codes downloadable as batch PDF or individual images
- Check-in app (mobile-responsive web) scans QR codes and marks attendance
- Check-in app shows attendee name and photo (if available) for verification
- Check-in timestamp recorded with timezone
- Real-time attendance dashboard for organizers shows: expected, checked-in, pending counts
- Support for manual check-in override (QR code issues, attendee forgot QR code)
- Check-in app works offline with sync when connection restored
- Check-in app supports bulk check-in for groups (e.g., company delegations)

### Multi-Bureau Access Control

**As a** DPMM bureau administrator  
**I want to** access and manage only my bureau's events  
**So that** bureaus can operate independently without interference

**Acceptance Criteria:**
- User roles extended with bureau assignment
- Bureau admins can only create/edit events for their assigned bureau
- Bureau admins can only view RSVP data for their events
- Super admins can view all bureaus' events
- Bureau assignment configurable in user management

---

## Success Criteria

- All bureaus can create any event type in one unified system
- Event creation includes blast channel selection (WhatsApp, Email, or both)
- Non-member contacts can be managed via CSV/Excel upload
- RSVP collection automated via WhatsApp and Email
- WhatsApp templates with images can be created and scheduled for automated blasts
- Reminders execute automatically without user intervention
- QR codes generated for RSVP and event details
- QR codes generated for all confirmed attendees for check-in
- Check-in process efficient with QR code scanning
- Manual workload reduced significantly
- System ready for future WhatsApp calling feature
- Multi-bureau access control enforced

---

## Constraints

### Technical Constraints
- Use existing Supabase backend and WAHA integration
- Use existing WhatsApp blast queue infrastructure
- Use Resend for email delivery (from previous plan)
- Extend existing `DPMM_KEHADIRAN` table or create new RSVP table
- Use open-source QR code generation library
- Support CSV and Excel file formats for contact upload

### Business Constraints
- Support both members and non-members
- Non-members must provide email for RSVP
- Members RSVP via WhatsApp, non-members via Email
- QR codes required for all confirmed attendees
- Multi-bureau access control required
- Event types: meeting, seminar, workshop, networking, training, other

### Security Constraints
- Non-member contact data protected with RLS policies per bureau
- RSVP data protected per bureau access rules
- Email addresses for non-members not exposed to other attendees
- QR codes contain minimal identifiable information (event ID + token, not personal data)
- Non-member contact data encrypted at rest in database
- Access logs for all non-member data access
- GDPR-like consent for non-member contact storage
- Data export capability for non-members to request their data deletion

---

## Scope Boundaries

### In Scope
- Generalize Sistem Mesyuarat to Sistem Hebahan for all event types
- Non-member contact management with CSV/Excel upload
- Unified RSVP system for members (WhatsApp) and non-members (Email)
- WhatsApp template creation with image support and scheduled blasts
- Automated reminder scheduling and execution
- QR code generation for RSVP and event details
- QR code generation for attendee check-in
- Multi-bureau access control
- Event type taxonomy and bureau assignment
- Blast channel selection (WhatsApp, Email, or both) for event invites

### Out of Scope
- WhatsApp calling feature (deferred for future)
- Payment processing for paid events (deferred for future)
- Event materials sharing (deferred for future)
- Advanced analytics on event performance (deferred for future)
- Mobile app (web-only initially)

### Deferred for Later
- WhatsApp calling feature for proactive member contact
- Event registration fees and payment processing
- Event materials and document sharing
- Advanced analytics and reporting dashboards
- Mobile native applications

---

## Dependencies

### External Services
- WAHA for WhatsApp integration
- Resend for email delivery
- Google Drive for file storage (if needed for materials)

### Internal Systems
- Existing `DPMM_MESYUARAT` table (to be generalized to `DPMM_EVENTS`)
- Existing `DPMM_KEHADIRAN` table (to be extended for RSVP tracking)
- Existing `DPMM_BLAST_QUEUE` table for WhatsApp message queue
- Existing `DPMM_USERS` table for user and bureau management
- Existing member database for member contacts

### Prerequisites
- Non-member contact table schema design
- CSV/Excel parsing library selection
- QR code generation library selection
- Event type taxonomy finalization
- Bureau assignment in user management

---

## Assumptions

- Bureaus will actively use the system for event management
- Non-members have valid email addresses for RSVP
- Members have WhatsApp accounts (or email as fallback)
- Event organizers have devices capable of scanning QR codes
- CSV/Excel upload file sizes are reasonable (<10MB per upload)
- WAHA rate limits will not significantly impact delivery timing
- Email deliverability will be acceptable with proper domain setup
- Event attendance typically under 500 attendees per event
- Non-member contacts consent to data storage for event communication

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Non-member contact data quality issues | Medium | Implement validation during upload, allow manual correction |
| CSV/Excel upload parsing errors | Medium | Use robust parsing library, provide detailed error reporting |
| QR code scanning failures at events | High | Provide manual check-in override, test QR code generation thoroughly |
| Multi-bureau access control complexity | Medium | Clear role definitions, thorough testing of permission boundaries |
| Event type taxonomy becomes unwieldy | Low | Start with core types, allow "other" with custom description |
| Non-member RSVP spam | Medium | Implement email verification, CAPTCHA if needed |
| WhatsApp rate limits for large events | High | Implement queue system with retry logic, monitor rate limits |
| Performance issues with large events (>500 attendees) | Medium | Implement pagination for attendee lists, optimize database queries |
| Check-in app connectivity issues at venue | Medium | Offline-first design with sync when connection restored |

---

## Open Questions

None at this time.

---

## Related Documents

- [Meeting System Enhancements Plan](../plans/2026-06-29-001-feat-meeting-system-enhancements-plan.md)
- [Email Service Providers Research](../email-providers-research.md)
- [SISTEM-MESYUARAT-DPMM-JOHOR Repository](../../README.md)
