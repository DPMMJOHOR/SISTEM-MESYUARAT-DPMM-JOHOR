---
goal: Fix Critical Security and Deployment Issues for SISTEM-MESYUARAT-DPMM-JOHOR Live Site
version: 1.0
date_created: 2026-07-23
last_updated: 2026-07-23
owner: DPMM Security Team
status: 'Planned'
tags: ['security', 'deployment', 'bug', 'infrastructure']
origin: ../docs/audit/2026-07-23-live-audit-report.md
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This implementation plan addresses critical security and deployment issues identified in the July 23, 2026 security audit of SISTEM-MESYUARAT-DPMM-JOHOR. The live site is currently non-functional due to missing configuration files and CDN resource failures. This plan provides a structured approach to restore system functionality and implement security hardening measures.

## 1. Requirements & Constraints

- **REQ-001**: Restore live site functionality by fixing configuration and CDN issues
- **REQ-002**: Implement XSS protection through DOMPurify sanitization
- **REQ-003**: Fix Google API initialization race condition
- **REQ-004**: Migrate localStorage to sessionStorage for sensitive data
- **REQ-005**: Add favicon.ico to prevent 404 errors
- **REQ-006**: Implement account lockout data cleanup
- **SEC-001**: Maintain existing RLS policies and security controls
- **SEC-002**: No exposure of API keys or secrets in client code
- **SEC-003**: Preserve 30-minute session timeout functionality
- **CON-001**: Must remain compatible with GitHub Pages static hosting
- **CON-002**: Cannot use server-side security controls (CSP headers, HSTS)
- **CON-003**: Must maintain backward compatibility with existing user sessions
- **GUD-001**: Follow existing code patterns and conventions
- **GUD-002**: Use deterministic, machine-parseable task descriptions
- **PAT-001**: All changes must be tested on live deployment

## 2. Implementation Steps

### Implementation Phase 1: Restore Live Site Functionality

- GOAL-001: Fix critical deployment issues preventing site from loading

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Create config-local.js from config-local.example.js with actual production values (not placeholders) for GitHub Actions secret injection | | |
| TASK-002 | Add config-local.js to .gitignore (verify it's already there) | | |
| TASK-003 | Update GitHub Actions deploy.yml to create config-local.js if missing | | |
| TASK-004 | Verify SUPABASE_KEY secret is set in GitHub repository settings | | |
| TASK-005 | Update Tailwind CSS CDN to version 3.4.0 with SRI hash sha384-[calculate actual hash] | | |
| TASK-006 | Update Supabase JS CDN to version 2.39.7 with SRI hash sha384-[calculate actual hash] | | |
| TASK-007 | Test live site loads without console errors | | |

### Implementation Phase 2: Fix Google API Initialization

- GOAL-002: Resolve race condition in Google API loading

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-008 | Add initialization check before accessing gapiReady variable in index.html line 2617 | | |
| TASK-009 | Implement Promise-based Google API loading function | | |
| TASK-010 | Add error handling for Google API load failures | | |
| TASK-011 | Add retry logic for Google API initialization (max 3 attempts) | | |
| TASK-012 | Test Google Drive integration after fixes | | |

### Implementation Phase 3: Implement XSS Protection

- GOAL-003: Sanitize all innerHTML usage to prevent XSS attacks

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-013 | Install DOMPurify package: npm install dompurify | | |
| TASK-014 | Add DOMPurify CDN link to index.html with SRI hash | | |
| TASK-015 | Create utility function sanitizeHTML() using DOMPurify | | |
| TASK-016 | Replace innerHTML in index.html with sanitized version (30+ instances) | | |
| TASK-017 | Replace innerHTML in js/non-member-contacts.js (5 instances) | | |
| TASK-018 | Replace innerHTML in js/reminder-scheduler.js (4 instances) | | |
| TASK-019 | Replace innerHTML in js/attendee-qr-generator.js (4 instances) | | |
| TASK-020 | Replace innerHTML in js/qr-generator.js (1 instance) | | |
| TASK-021 | Replace innerHTML in js/access-control.js (2 instances) | | |
| TASK-022 | Replace innerHTML in js/rsvp-tracker.js (2 instances) | | |
| TASK-023 | Test XSS protection with malicious input payloads | | |

### Implementation Phase 4: Secure Session Data Storage

- GOAL-004: Migrate sensitive data from localStorage to sessionStorage

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-024 | Replace localStorage.getItem('dpmm_supabase_key') with sessionStorage in index.html line 2419 | | |
| TASK-025 | Replace localStorage.getItem('session_last_activity') with sessionStorage in index.html line 1502 | | |
| TASK-026 | Replace localStorage.getItem('session_timeout') with sessionStorage in index.html line 1503 | | |
| TASK-027 | Update account lockout to use sessionStorage for temporary data (index.html lines 1411, 1478) | | |
| TASK-028 | Add sessionStorage cleanup on logout function | | |
| TASK-029 | Test session persistence across page reloads | | |

### Implementation Phase 5: Add Favicon and Minor Fixes

- GOAL-005: Resolve 404 errors and improve user experience

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-030 | Create favicon.ico (16x16 and 32x32 sizes) | | |
| TASK-031 | Add favicon link to index.html head section | | |
| TASK-032 | Add account lockout expiration cleanup in index.html lines 1410-1419 | | |
| TASK-033 | Remove or update CSP report-uri endpoint in index.html line 17 | | |
| TASK-034 | Test favicon loads correctly in browser | | |

### Implementation Phase 6: Update Documentation

- GOAL-006: Document changes and security improvements

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-035 | Update docs/SECURITY.md with XSS protection section | | |
| TASK-036 | Update docs/SECURITY.md with session storage changes | | |
| TASK-037 | Update README.md with DOMPurify dependency | | |
| TASK-038 | Add deployment troubleshooting section to docs/DEPLOYMENT.md | | |
| TASK-039 | Update package.json with DOMPurify dependency | | |

### Implementation Phase 7: Testing and Validation

- GOAL-007: Verify all fixes work correctly on live site

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-040 | Run local development server and verify no console errors | | |
| TASK-041 | Test login functionality with valid credentials | | |
| TASK-042 | Test Google Drive integration end-to-end | | |
| TASK-043 | Test XSS protection with malicious payloads | | |
| TASK-044 | Test session timeout and auto-logout | | |
| TASK-045 | Test account lockout functionality | | |
| TASK-046 | Deploy to GitHub Pages and verify live site functionality | | |
| TASK-047 | Run security audit again to verify fixes | | |
| TASK-048 | Add input validation to all form fields (email format, phone format, length limits) to address Low Issue #11 | | |

## 3. Alternatives

- **ALT-001**: Migrate from GitHub Pages to Vercel/Netlify for server-side security controls
  - Not chosen: Requires significant infrastructure changes, current static hosting meets requirements
- **ALT-002**: Replace innerHTML with React/Vue framework
  - Not chosen: Too large a refactor, current vanilla JS approach is maintainable with sanitization
- **ALT-003**: Use npm packages instead of CDNs for all dependencies
  - Not chosen: Would require build process changes, current CDN approach works with proper SRI
- **ALT-004**: Implement server-side session management with cookies
  - Not chosen: Requires backend API, not compatible with current static hosting architecture

## 4. Dependencies

- **DEP-001**: GitHub repository secrets (SUPABASE_KEY, GOOGLE_CID) must be configured
- **DEP-002**: DOMPurify library (npm package or CDN)
- **DEP-003**: Valid SRI hashes for Tailwind CSS and Supabase JS
- **DEP-004**: favicon.ico image file
- **DEP-005**: GitHub Actions deployment workflow
- **DEP-006**: Supabase project (lzoloupwtqmjyupvofhh) must be accessible

## 5. Files

- **FILE-001**: config-local.js - Configuration file with production secrets
- **FILE-002**: index.html - Main application file (2965 lines)
- **FILE-003**: js/non-member-contacts.js - Non-member contacts management
- **FILE-004**: js/reminder-scheduler.js - Reminder scheduling functionality
- **FILE-005**: js/attendee-qr-generator.js - QR code generation for attendees
- **FILE-006**: js/qr-generator.js - General QR code generation
- **FILE-007**: js/access-control.js - Access control logic
- **FILE-008**: js/rsvp-tracker.js - RSVP tracking functionality
- **FILE-009**: .github/workflows/deploy.yml - GitHub Actions deployment workflow
- **FILE-010**: package.json - Node.js dependencies
- **FILE-011**: docs/SECURITY.md - Security documentation
- **FILE-012**: README.md - Project documentation
- **FILE-013**: docs/DEPLOYMENT.md - Deployment documentation
- **FILE-014**: favicon.ico - Site favicon

## 6. Testing

- **TEST-001**: Verify config-local.js loads without errors
- **TEST-002**: Verify Tailwind CSS loads and styles apply correctly
- **TEST-003**: Verify Supabase JS library loads and initializes
- **TEST-004**: Verify Google API loads without race condition errors
- **TEST-005**: Verify XSS payloads are sanitized and not executed
- **TEST-006**: Verify session data persists correctly with sessionStorage
- **TEST-007**: Verify account lockout expires after 15 minutes
- **TEST-008**: Verify favicon loads in browser tab
- **TEST-009**: Verify login functionality works end-to-end
- **TEST-010**: Verify session timeout triggers auto-logout after 30 minutes

## 7. Risks & Assumptions

- **RISK-001**: GitHub Actions secret injection may fail if secrets not properly configured
  - Mitigation: Verify secrets exist in repository settings before deployment
- **RISK-002**: SRI hash updates may break if CDN versions change
  - Mitigation: Pin to specific versions and monitor for deprecation
- **RISK-003**: DOMPurify sanitization may break existing functionality
  - Mitigation: Test thoroughly in development before production deployment
- **RISK-004**: sessionStorage migration may break session persistence
  - Mitigation: Test session behavior across page reloads and browser sessions
- **RISK-005**: Google API changes may break integration
  - Mitigation: Monitor Google API deprecation notices and update accordingly
- **ASSUMPTION-001**: GitHub repository secrets are already configured
- **ASSUMPTION-002**: Supabase project is accessible and functional
- **ASSUMPTION-003**: User has access to GitHub repository settings
- **ASSUMPTION-004**: Current user sessions will need to re-login after changes

## 8. Related Specifications / Further Reading

- [Security Audit Report](../docs/audit/2026-07-23-live-audit-report.md)
- [Security Architecture Documentation](../docs/SECURITY.md)
- [Deployment Documentation](../docs/DEPLOYMENT.md)
- [README](../README.md)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [Subresource Integrity (MDN)](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)
- [Content Security Policy (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
