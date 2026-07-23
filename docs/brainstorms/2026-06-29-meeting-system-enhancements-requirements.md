# Meeting System Enhancements Requirements

**Date:** 2026-06-29  
**Status:** Ready for Planning  
**Scope:** Standard Feature Development

---

## Problem Statement

The DPMM Meeting System currently requires significant manual effort for:
- Collecting member responses to meeting invites and reminders
- Following up with non-responding members
- Managing email delivery (EmailJS free tier templates maxed out)
- Sharing Buku Mesyuarat securely while maintaining access logs

Members sometimes don't respond at all, or type free-text responses that require manual processing. The current process is time-consuming and requires full-time staff monitoring, which the organization wants to eliminate by training "Aiman" to automate these tasks.

---

## Proposed Solution

Implement a hybrid multi-channel response system and secure document sharing:

1. **WhatsApp Interactive Response System** - Members respond to invites/reminders with predefined options via WhatsApp
2. **Scheduled WhatsApp Reminders** - Users can schedule automated WhatsApp reminders that execute without manual intervention
3. **Email Delivery System** - Meeting invites delivered via email with simple attachments (no flipping effect)
4. **Secure Buku Mesyuarat Sharing** - QR code-based sharing with member ID authentication and in-house flipping book viewer

---

## User Stories

### WhatsApp Interactive Response System

**As a** DPMM member  
**I want to** receive meeting invites and reminders via WhatsApp with interactive response buttons  
**So that** I can respond quickly without typing and the system automatically records my attendance

**Acceptance Criteria:**
- Initial invites include response options: "Maklum, Terima", "Hadir", "Tidak Hadir", "Tidak Pasti"
- Reminders include response options: "HADIR", "TIDAK HADIR", "TIDAK PASTI"
- Responses automatically update the `DPMM_KEHADIRAN` table
- Members can respond via WhatsApp without typing free text
- System tracks which channel (WhatsApp/Email) member used to respond

### Scheduled WhatsApp Reminders

**As a** DPMM administrator  
**I want to** schedule WhatsApp reminders with templates, date, time, and recipient lists  
**So that** "Aiman" can execute the reminder process automatically without my involvement

**Acceptance Criteria:**
- Users can create and manage reminder templates
- Users can schedule reminders with specific date and time
- Users can select recipients from member response data (e.g., non-responders)
- System executes scheduled reminders automatically at specified time
- No user intervention required during execution
- System logs all scheduled and executed reminders
- Users can view scheduled reminder history and status

### Email Delivery System

**As a** DPMM member  
**I want to** receive meeting invites via email with a simple attachment  
**So that** I have a backup channel if WhatsApp is unavailable

**Acceptance Criteria:**
- Every meeting invite is delivered via both WhatsApp and Email
- Email includes meeting notice as a simple attachment (no flipping effect)
- Email includes interactive response buttons for members to reply
- Email delivery uses Resend (replacing EmailJS)
- System tracks email delivery status

### Secure Buku Mesyuarat Sharing

**As a** DPMM member  
**I want to** access Buku Mesyuarat via QR code with my member ID  
**So that** I can view meeting notes securely during the meeting while the system logs my access

**Acceptance Criteria:**
- Buku Mesyuarat shared via QR codes
- Members must input their member ID to access documents
- All access is logged with member ID and timestamp
- Files hosted within DPMM environment using Google Drive
- Viewer has flipping book effect (like a real book)
- Viewer supports single and double page view
- Viewer includes table of contents
- Viewer supports zoom in and zoom out
- Viewer handles both PDF and image formats
- Download option not available initially (deferred for future)

---

## Success Criteria

- Members can respond via WhatsApp or Email without typing
- All meeting invites delivered via both channels
- Response rates increase due to convenience
- Scheduled WhatsApp reminders execute automatically without user intervention
- Users can schedule reminders with templates, date, time, and recipient lists
- Recipients can be selected from member response data (e.g., non-responders)
- Buku Mesyuarat accessible only with valid member ID
- All access to Buku Mesyuarat logged
- Files remain within DPMM environment (Google Drive)
- Manual follow-up effort reduced significantly
- System ready for future WhatsApp calling feature

---

## Constraints

### Technical Constraints
- Use existing `DPMM_KEHADIRAN` table for responses (not per-meeting tables)
- Use WAHA for WhatsApp integration
- Use Resend for email delivery (replacing EmailJS)
- Use Google Drive for file hosting
- Use open-source flipping book library for document viewer

### Business Constraints
- Buku Mesyuarat viewer must support single/double page view, zoom, table of contents
- No download option for Buku Mesyuarat initially
- Support both PDF and image formats
- Must maintain access logs for compliance

### Security Constraints
- Member ID authentication required for Buku Mesyuarat access
- All access must be logged
- Files must remain within DPMM environment (no external hosting)

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

### Deferred for Later
- WhatsApp calling feature for "Aiman" to proactively contact members
- Download option for Buku Mesyuarat
- Advanced analytics on member response patterns

---

## Dependencies

### External Services
- WAHA (WhatsApp HTTP API) for WhatsApp integration
- Resend account setup and domain verification for email delivery
- Google Drive API for file hosting

### Internal Systems
- Existing `DPMM_KEHADIRAN` table for response storage
- Existing `DPMM_MESYUARAT` table for meeting data
- Existing `DPMM_BLAST_QUEUE` table for message queue
- Member ID authentication system
- Scheduled reminder queue system for automated execution

### Prerequisites
- WAHA server setup and configuration
- Resend account creation and domain verification
- Google Drive API credentials
- Open-source flipping book library selection and integration

---

## Assumptions

- Members have WhatsApp accounts (or email as fallback)
- Members know their member ID for Buku Mesyuarat access
- Google Drive has sufficient storage for Buku Mesyuarat files
- WAHA rate limits will not significantly impact blast delivery timing
- Email deliverability will be acceptable with proper domain setup
- Existing member database has accurate WhatsApp numbers and email addresses

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| WhatsApp rate limits affect delivery timing | High | Implement queue system with retry logic, monitor rate limits |
| Email deliverability issues | Medium | Use Resend with proper domain verification, monitor bounce rates |
| Members without WhatsApp disadvantaged | Medium | Email serves as backup channel, track delivery status |
| Google Drive API changes | Low | Use stable API version, monitor for deprecations |
| Flipping book library limitations | Medium | Evaluate multiple libraries, have fallback options |
| Member ID authentication bypass | High | Implement secure authentication, log all access attempts |

---

## Open Questions

None at this time.

---

## Related Documents

- [Email Service Providers Research](../email-providers-research.md)
- [SISTEM-MESYUARAT-DPMM-JOHOR Repository](../../README.md)
