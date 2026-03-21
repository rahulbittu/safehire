# Verify Me -- Product Requirements Document

**Version:** 1.0
**Last Updated:** 2026-03-21
**Status:** Draft

---

## 1. Problem Statement

India's urban households employ tens of millions of informal workers -- domestic helpers, cooks, drivers, nannies, cleaners, electricians, plumbers, and security guards. The hiring process for these roles is almost entirely trust-based, yet no standardized, fair, or portable trust mechanism exists.

Workers cannot carry their reputation across employers. A cook who has served a family reliably for five years starts from zero when she moves to a new city or a new apartment complex. The only formal verification available -- police verification -- checks for criminal history, costs money, takes weeks, and says nothing about professional conduct.

Hirers compensate by relying on apartment WhatsApp groups, agency references of questionable quality, and gut feeling. When something goes wrong, the response is often a community-wide blacklist message -- an unregulated, unappealable, and frequently unfair system that can destroy a worker's livelihood.

Verify Me solves this by creating a privacy-first, worker-owned digital trust identity that workers can build over time and share on their own terms.

## 2. User Stories

### 2.1 Worker Stories

| ID | Story | Priority |
|---|---|---|
| W-01 | As a domestic worker, I want to register with my basic details and verify my identity through Aadhaar so that I have a trusted digital profile. | P0 |
| W-02 | As a worker, I want to see my Trust Card on my phone so that I can show it to potential employers. | P0 |
| W-03 | As a worker, I want to control who can see my Trust Card so that my information is shared only with my consent. | P0 |
| W-04 | As a worker, I want to be notified if an incident is reported against me so that I can respond and provide my side. | P0 |
| W-05 | As a worker, I want to appeal an incident report I believe is unfair so that my Trust Card is not damaged by false claims. | P0 |
| W-06 | As a worker, I want the app to work in Hindi so that I can understand everything without help. | P0 |
| W-07 | As a worker, I want to see the history of who has viewed my Trust Card so that I know who has accessed my information. | P1 |
| W-08 | As a worker, I want to add my skills and experience to my profile so that hirers know what I can do. | P1 |
| W-09 | As a worker, I want to revoke a hirer's access to my Trust Card at any time. | P1 |
| W-10 | As a worker, I want the registration process to take less than 5 minutes and require minimal typing. | P0 |

### 2.2 Hirer Stories

| ID | Story | Priority |
|---|---|---|
| H-01 | As a hirer, I want to search for workers by type of service (cook, cleaner, driver, etc.) and location so that I can find help near me. | P0 |
| H-02 | As a hirer, I want to view a worker's Trust Card (with their consent) so that I can make an informed hiring decision. | P0 |
| H-03 | As a hirer, I want to see whether a worker's identity has been verified so that I have a baseline safety signal. | P0 |
| H-04 | As a hirer, I want to report an incident involving a worker so that the community is informed through proper channels. | P0 |
| H-05 | As a hirer, I want to know how long a worker has been on the platform without incidents so that I can gauge reliability. | P1 |
| H-06 | As a hirer, I want to see the outcome of reviewed incident reports (without private details) so that I can make informed decisions. | P1 |
| H-07 | As a hirer, I want to register my apartment community so that all residents can use the platform. | P1 |
| H-08 | As a hirer, I want the verification process to be faster and cheaper than police verification. | P0 |

### 2.3 Admin Stories

| ID | Story | Priority |
|---|---|---|
| A-01 | As an admin, I want to review incident reports with both the hirer's report and the worker's response so that I can make fair decisions. | P0 |
| A-02 | As an admin, I want to see audit logs of all data access events so that we can demonstrate compliance. | P0 |
| A-03 | As an admin, I want to manage worker appeals and update incident status so that disputes are resolved. | P0 |
| A-04 | As an admin, I want to see platform-wide metrics (registrations, verifications, incidents, appeals) so that I can monitor health. | P1 |

## 3. Core Features

### 3.1 Worker Registration and Profile

**Description:** Workers create an account using their mobile number (OTP-based authentication). They provide basic information: name, primary service type, location (area/pin code), and preferred language.

**Requirements:**
- Mobile number + OTP authentication (no password required).
- Profile fields: name, service type(s), location (pin code or area), preferred language, profile photo (optional).
- Profile completion should take under 5 minutes.
- Interface must work on low-end Android devices (Android 8+, 2GB RAM).
- All text must be available in Hindi and English.
- Minimal text input -- use dropdowns, selectors, and voice input where possible.

### 3.2 Aadhaar-Based Identity Verification

**Description:** Workers verify their identity by linking their Aadhaar through DigiLocker, the Government of India's digital document wallet. This confirms that the person is who they claim to be without Verify Me storing or displaying the Aadhaar number.

**Requirements:**
- Integration with DigiLocker API for Aadhaar-based eKYC.
- Verify Me receives: name confirmation, date of birth, gender, and photograph -- no Aadhaar number stored.
- Verification status shown on Trust Card as "Identity Verified" badge.
- Workers who do not verify can still use the platform but their Trust Card shows "Identity Not Verified."
- Compliance with Aadhaar Act Section 8 (consent) and UIDAI regulations on Aadhaar data handling.
- DigiLocker consent flow must be explained in simple language before initiation.

### 3.3 Trust Card

**Description:** The Trust Card is the core product. It is a mobile-first digital card that summarizes a worker's trust profile. It is designed to be shown to potential employers -- either on the worker's phone or via a shareable link.

**Requirements:**
- Displays: worker's name, profile photo, service type(s), identity verification status, time on platform, trust summary.
- Trust summary includes: number of months/years on platform, number of verified employments (future feature), incident status (clean / under review / resolved).
- Does NOT display: Aadhaar number, date of birth, home address, phone number (unless worker opts in).
- Shareable via: QR code, short link, WhatsApp share.
- Viewable without app installation (mobile web).
- Viewing requires consent: worker must approve each viewer, or set card to "open" mode.
- Trust Card must load in under 3 seconds on 3G connections.

### 3.4 Hirer Search and Trust Card Viewing

**Description:** Hirers can search for workers by service type and location, and request to view their Trust Card.

**Requirements:**
- Search by: service type, location (pin code or area), verification status.
- Search results show: name, service type, verification badge, time on platform. No personal details in search results.
- To view full Trust Card, hirer must: (a) be registered, and (b) receive worker consent (or worker has set card to "open").
- Consent request sent to worker as push notification and SMS.
- Hirer viewing is logged with timestamp and hirer identity.
- Rate limiting: hirers cannot bulk-view Trust Cards (max 20 per day for individual hirers).

### 3.5 Incident Reporting

**Description:** Hirers can report incidents involving workers. Reports are structured (not free-text only) to ensure consistency and reduce abuse.

**Requirements:**
- Incident categories: theft, property damage, misconduct, no-show/abandonment, safety concern, other.
- Structured form: category, date of incident, description (free text, 500 char max), supporting evidence (photo upload, optional).
- Hirer must have previously viewed the worker's Trust Card (prevents drive-by reporting).
- Worker is notified immediately via push notification and SMS upon report submission.
- Report status lifecycle: submitted -> worker notified -> worker response window (7 days) -> admin review -> resolved (substantiated / unsubstantiated / inconclusive).
- Unsubstantiated reports are not visible on the Trust Card.
- Substantiated reports show on the Trust Card as "1 reviewed incident" -- not the details.
- Reports cannot be anonymous. Hirer identity is recorded (but not shown to worker until admin review).

### 3.6 Worker Appeals Process

**Description:** Workers can appeal any incident report. Appeals are reviewed by trained human moderators.

**Requirements:**
- Workers can submit an appeal within 30 days of report resolution.
- Appeal form: worker's account of events (free text or voice note), supporting evidence (photos, messages, optional).
- Voice note option for workers with limited literacy.
- Appeal status: submitted -> under review -> decision (upheld / overturned / modified).
- Appeal review SLA: 7 business days.
- If appeal is successful, the incident is removed from the Trust Card.
- Workers can escalate unresolved appeals to an external ombudsman (future feature).

### 3.7 Admin Review Panel

**Description:** Internal web-based panel for moderators to review incident reports, appeals, and manage platform integrity.

**Requirements:**
- Dashboard showing: pending reports, pending appeals, recent decisions, platform metrics.
- Report review view: hirer's report, worker's response, evidence, hirer history (have they filed many reports?), worker history.
- Decision actions: substantiate, unsubstantiate, mark inconclusive, request more information.
- All decisions require written justification (internal, not shown to parties).
- Audit log for all admin actions.
- Role-based access: reviewer, senior reviewer, admin.

## 4. Non-Functional Requirements

### 4.1 Privacy and Data Protection

- All personal data encrypted at rest (AES-256) and in transit (TLS 1.3).
- Aadhaar numbers are never stored. Only verification status and DigiLocker token.
- Data retention: personal data deleted 2 years after account deactivation.
- Consent logs maintained for all data sharing events.
- Data access requests (DPDP Act Section 11) must be fulfillable within 72 hours.
- Data erasure requests (DPDP Act Section 12) must be fulfillable within 30 days.
- Privacy impact assessment to be conducted before launch.
- No selling or sharing of personal data with third parties.

### 4.2 Performance

- Trust Card page load: < 3 seconds on 3G connection.
- Search results: < 2 seconds.
- App size: < 25 MB (Android APK).
- Offline capability: workers can view their own Trust Card offline.
- API response times: p95 < 500ms for read operations, p95 < 1s for write operations.

### 4.3 Accessibility

- Minimum touch target size: 48x48 dp.
- Font sizes: minimum 16sp for body text, 20sp for headings.
- High contrast mode support.
- Screen reader compatibility (TalkBack for Android).
- Voice input support for text fields.
- Support for low-end devices: Android 8.0+, 2GB RAM, 720p screens.

### 4.4 Localization

- MVP: Hindi and English.
- All UI strings externalized for translation.
- Right-to-left layout support architecture (for future Urdu support).
- Date, time, and number formatting per Indian conventions.
- SMS and push notification content in user's preferred language.
- Transliteration support for name entry (workers may type in Roman script for Hindi names).

### 4.5 Security

- OTP-based authentication via SMS (no passwords).
- Rate limiting on all public endpoints.
- OWASP Top 10 compliance.
- Penetration testing before launch.
- Admin panel behind VPN or IP-restricted access.
- Incident report evidence stored in isolated, access-controlled storage.

### 4.6 Compliance

- DPDP Act 2023 (Digital Personal Data Protection Act) compliance.
- Aadhaar Act compliance for identity verification.
- IT Act 2000 intermediary guidelines (if applicable at scale).
- Consent mechanism compliant with DPDP Act Section 6.

## 5. Success Metrics

### 5.1 Adoption Metrics

| Metric | MVP Target (6 months) |
|---|---|
| Worker registrations | 10,000 |
| Workers with verified identity | 5,000 |
| Hirer registrations | 3,000 |
| Trust Card views | 15,000 |
| Apartment communities onboarded | 50 |

### 5.2 Trust and Safety Metrics

| Metric | Target |
|---|---|
| Incident reports with worker response | > 70% |
| Incident reports reviewed within 7 days | > 80% |
| Appeals reviewed within 7 days | > 80% |
| False/malicious reports identified | Track and report |

### 5.3 Product Quality Metrics

| Metric | Target |
|---|---|
| Trust Card load time (3G) | < 3 seconds |
| Worker registration completion rate | > 70% |
| App crash rate | < 1% |
| Worker NPS | > 40 |
| Hirer NPS | > 30 |

### 5.4 Privacy Metrics

| Metric | Target |
|---|---|
| Data access requests fulfilled within 72 hours | 100% |
| Consent logs completeness | 100% of sharing events logged |
| Data breach incidents | 0 |

## 6. Out of Scope for MVP

The following are explicitly out of scope for the initial release and are deferred to subsequent phases:

| Feature | Rationale | Planned Phase |
|---|---|---|
| In-app payments | Adds regulatory complexity (PCI-DSS, RBI guidelines). Workers and hirers handle payment independently. | Phase 2 |
| AI-based matching | Requires sufficient data volume to be useful. Manual search is adequate for MVP. | Phase 2 |
| Languages beyond Hindi/English | Localization for Kannada, Tamil, Telugu, Marathi, Bengali planned for Phase 2 with city expansion. | Phase 2 |
| Third-party background checks | Integration with police verification or criminal record databases requires partnerships and legal review. | Phase 2 |
| Insurance products | Requires IRDAI-regulated partnerships. Explored for Phase 3. | Phase 3 |
| In-app chat/messaging | Workers and hirers communicate via phone/WhatsApp. In-app messaging adds complexity without clear MVP value. | Phase 2 |
| Employer-verified service history | Requires employer adoption and verification flow. Planned after initial traction. | Phase 2 |
| Worker skill certifications | Requires NSDC or similar partnerships. | Phase 3 |
| Web app for workers | Workers use mobile app. Web app is hirer and admin only for MVP. | Phase 2 |
| Staffing agency portal | Agencies are a future distribution channel, not MVP users. | Phase 2 |

## 7. Technical Constraints

- Mobile app must function on Android 8.0+ with 2GB RAM (covers ~90% of target worker devices).
- iOS app is hirer-focused; worker app is Android-first.
- Backend must handle intermittent connectivity -- support for retry, offline reads, and idempotent writes.
- DigiLocker integration requires MEITY (Ministry of Electronics and IT) partnership registration.
- SMS OTP delivery must achieve > 95% delivery rate across all Indian telecom operators.
- Supabase Row Level Security (RLS) policies must enforce consent-based data access at the database level.

## 8. Dependencies

| Dependency | Owner | Risk |
|---|---|---|
| DigiLocker API access | MEITY/DigiLocker team | Medium -- requires government partnership registration, 4-8 week approval process |
| SMS OTP provider | Third party (MSG91, Twilio India, or similar) | Low -- multiple providers available |
| Supabase hosting | Supabase | Low -- managed service, Mumbai region available |
| Moderation team | Internal hiring | Medium -- need trained moderators before launch |
| Legal review (DPDP Act compliance) | External counsel | High -- must be completed before launch |

## 9. Open Questions

1. Should workers be able to set their Trust Card to "open" (viewable by any registered hirer without per-request consent)? Trade-off: convenience vs. privacy.
2. What is the right threshold for flagging hirers who file many incident reports? Need to balance fraud detection with legitimate reporting.
3. Should incident reports expire after a certain period (e.g., 2 years)?
4. How do we handle workers who share a phone (common in lower-income households)?
5. What happens when a worker loses their phone and needs to recover their account?
