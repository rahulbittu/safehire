# Verify Me -- MVP Scope Definition

**Version:** 1.0
**Last Updated:** 2026-03-21
**Target Launch:** Q3 2026
**Target Market:** Bangalore (3-5 apartment communities for closed beta, 50-100 for public launch)

---

## MVP Objective

Launch a functional, privacy-compliant worker trust identity system that demonstrates the core value proposition to both workers and hirers in a single city. The MVP must answer two questions:

1. **For workers:** "Does having a verified Trust Card help me get and keep jobs?"
2. **For hirers:** "Does seeing a Trust Card give me more confidence than word of mouth alone?"

---

## In Scope

### 1. Worker Registration and Basic Profile

**What:** Workers create an account and build a basic profile.

**Details:**
- Mobile number + OTP authentication (no password).
- Profile fields: name, service type (select from list: cook, cleaner, driver, nanny, electrician, plumber, guard, other), service area (pin code or locality selector), preferred language (Hindi or English), profile photo (optional but encouraged).
- Service type list is predefined -- no free-text entry for MVP.
- Profile photo captured via in-app camera or gallery upload.
- Profile completion progress indicator to encourage full setup.

**Technical implementation:**
- React Native/Expo mobile app (Android-first, iOS secondary).
- Supabase Auth for OTP-based authentication.
- Profile data stored in Supabase (Postgres) with Row Level Security.
- Profile photo stored in Supabase Storage with access control.

**Acceptance criteria:**
- Worker can register and complete profile in under 5 minutes.
- Registration works on Android 8.0+ with 2GB RAM.
- OTP delivery success rate > 95%.
- All UI text available in Hindi and English.

---

### 2. Aadhaar-Based Identity Verification (via DigiLocker)

**What:** Workers verify their identity by pulling their Aadhaar data through DigiLocker.

**Details:**
- Integration with DigiLocker's API (Aadhaar eKYC).
- Consent flow: worker is shown a plain-language explanation of what data will be accessed (name, date of birth, gender, photo) and what will NOT be stored (Aadhaar number).
- Upon successful verification, worker receives "Identity Verified" badge on Trust Card.
- Verification status stored as a boolean + timestamp. Raw Aadhaar data is not persisted beyond the verification check.
- Workers can use the platform without verification, but their Trust Card shows "Identity Not Verified."

**Technical implementation:**
- DigiLocker API integration via backend (tRPC server).
- Verification token/status stored in Supabase.
- No Aadhaar number stored at any point.

**Acceptance criteria:**
- DigiLocker flow completes in under 2 minutes for workers with existing DigiLocker accounts.
- Consent explanation is shown before any data is accessed.
- Verification status accurately reflected on Trust Card within 30 seconds of completion.
- Failed verification shows clear error message with retry option.

**Dependency:** DigiLocker API partnership registration (4-8 week lead time).

**Fallback:** If DigiLocker API access is delayed, MVP can launch with manual Aadhaar verification (upload photo of Aadhaar, human review) as a temporary measure. This fallback requires a moderation workflow and does store a temporary image -- the image must be deleted after verification.

---

### 3. Trust Card Generation

**What:** A mobile-first digital card summarizing a worker's trust profile.

**Details:**
- Displays: name, profile photo, service type(s), identity verification badge, months on platform, incident summary (clean / under review / has reviewed incidents).
- Does NOT display: Aadhaar number, date of birth, home address, phone number.
- Visual design: clean, professional card layout that conveys dignity. Worker's photo prominent. Green/blue trust indicators.
- Shareable via: QR code (displayed on worker's screen), short URL (shareable via WhatsApp or SMS).
- QR code and short URL link to a web-based Trust Card view (no app installation required for viewer).
- Workers can view their own Trust Card offline (cached locally).

**Technical implementation:**
- Trust Card component built in React (shared between mobile and web).
- QR code generated client-side.
- Short URL service backed by Supabase Edge Functions.
- Web-based Trust Card view: Next.js page with server-side rendering for fast load.
- Offline cache using React Native's AsyncStorage.

**Acceptance criteria:**
- Trust Card loads in under 3 seconds on 3G connection (web view).
- QR code scan leads to Trust Card within 2 seconds.
- Trust Card accurately reflects current verification and incident status.
- Trust Card renders correctly on screens from 720p to 1440p.

---

### 4. Hirer Search and Trust Card Viewing

**What:** Hirers search for workers and view their Trust Cards with consent.

**Details:**
- Search by: service type, location (pin code or locality), verification status (verified / all).
- Search results show: name, service type, verification badge, months on platform. No personal details in results.
- To view full Trust Card, hirer must be registered (mobile number + OTP) and either:
  - (a) Worker has set Trust Card to "open" (viewable by all registered hirers), or
  - (b) Hirer sends consent request, worker approves.
- Consent request sent to worker via push notification and SMS.
- Consent can be one-time or ongoing (worker chooses).
- All Trust Card views are logged (hirer identity, timestamp).
- Workers can see a log of who has viewed their Trust Card.

**Technical implementation:**
- Hirer app: Next.js web app (not mobile app for MVP -- hirers use web).
- Search powered by Supabase full-text search with PostGIS for location.
- Consent system: Supabase table with RLS policies enforcing consent checks.
- View logging: append-only audit table.
- Push notifications: Expo Push Notifications (mobile), SMS via MSG91 or similar.

**Acceptance criteria:**
- Search returns results in under 2 seconds.
- Consent request reaches worker within 60 seconds (push notification).
- Consent request includes SMS fallback if push fails.
- Trust Card view is blocked without valid consent (enforced at database level via RLS).
- View log is accurate and complete.

---

### 5. Incident Reporting (by Hirers)

**What:** Hirers can file structured incident reports about workers.

**Details:**
- Incident categories: theft, property damage, misconduct, no-show/abandonment, safety concern, other.
- Report form: category (required), date of incident (required), description (free text, 50-500 characters, required), evidence (photo upload, optional, max 3 images).
- Reporting eligibility: hirer must have previously viewed the worker's Trust Card (prevents reports against workers the hirer has no relationship with).
- Upon submission, worker is notified via push notification and SMS.
- Worker has 7 calendar days to respond.
- Worker response options: text response (500 chars max) or voice note (max 2 minutes).
- Report status: submitted -> worker notified -> response window -> admin review -> resolved.
- Resolved states: substantiated, unsubstantiated, inconclusive.

**Technical implementation:**
- Report form: React components (web for hirers).
- Evidence storage: Supabase Storage, access-restricted to admin reviewers.
- Notification triggers: Supabase Edge Functions or database triggers.
- Voice note: recorded in-app, stored as audio file in Supabase Storage.
- Status machine: enforced in backend tRPC procedures.

**Acceptance criteria:**
- Report submission takes under 3 minutes.
- Worker notification sent within 5 minutes of submission.
- Worker can respond via text or voice note.
- Incomplete reports (missing required fields) cannot be submitted.
- Evidence files are access-restricted (not publicly accessible).

---

### 6. Worker Appeals Process

**What:** Workers can appeal incident report decisions.

**Details:**
- Workers can submit an appeal within 30 days of an incident being marked "substantiated."
- Appeal form: worker's account (free text or voice note), supporting evidence (photos, screenshots, optional).
- Appeal is reviewed by a senior admin (different from the original reviewer if possible).
- Appeal outcomes: upheld (original decision stands), overturned (incident removed from Trust Card), modified (severity changed).
- Workers notified of outcome via push notification and SMS.
- Appeal review SLA: 7 business days.
- For MVP, a single level of appeal. External ombudsman deferred to Phase 2.

**Technical implementation:**
- Appeal form: React Native component (worker mobile app).
- Appeal linked to original incident report.
- Admin panel displays appeal alongside original report and review.
- Appeal decision logged with justification (internal).

**Acceptance criteria:**
- Appeal submission is accessible from the incident detail screen.
- Voice note option is available and functional.
- Admin panel shows appeal context alongside original report.
- Appeal decisions are reflected on Trust Card within 1 hour of decision.

---

### 7. Basic Admin Review Panel

**What:** Web-based internal tool for moderators to review incidents and appeals.

**Details:**
- Accessible only to authorized Verify Me staff (not hirers or workers).
- Dashboard: pending incident reviews, pending appeals, recent decisions, basic stats (total reports this week, average review time).
- Incident review view: hirer's report (with evidence), worker's response (with evidence), hirer's reporting history (how many reports have they filed?), worker's history (prior incidents?).
- Decision actions: substantiate, unsubstantiate, mark inconclusive, request more information from hirer or worker.
- All admin actions require written justification (internal notes, not visible to parties).
- Audit log: every action, view, and decision is logged with admin identity and timestamp.
- Role-based access: reviewer (can review and decide), senior reviewer (can review appeals), admin (full access including user management).

**Technical implementation:**
- Next.js web app (the admin app in the existing monorepo).
- Supabase Auth for admin authentication (email + password + MFA).
- Admin-specific Supabase tables with strict RLS policies.
- Audit log: append-only table, no delete or update permissions.

**Acceptance criteria:**
- Admin panel is not accessible to non-admin users (enforced at API and database level).
- Incident queue is sortable by date submitted and days pending.
- Admin can view all relevant context for a decision on a single screen.
- All admin actions are logged in the audit trail.
- MFA is required for admin access.

---

## Out of Scope for MVP

The following features are explicitly excluded from the MVP release. They are documented here to prevent scope creep and to set expectations with stakeholders.

### Payments

**What's excluded:** Any in-app payment processing, salary management, or financial transactions between hirers and workers.

**Why:** Payment processing introduces PCI-DSS compliance requirements, RBI digital payment regulations, and significant technical complexity. Workers and hirers handle compensation independently -- this is standard practice and does not block the core trust value proposition.

**Planned for:** Phase 2 (if validated by user demand).

### AI-Based Matching

**What's excluded:** Algorithmic matching of workers to hirers based on preferences, ratings, location optimization, or predictive models.

**Why:** Requires significant data volume to be useful. Manual search by service type and location is adequate for MVP scale. Premature AI matching risks unfair bias and undermines the "explainable trust" principle.

**Planned for:** Phase 2.

### Multi-Language Beyond Hindi/English

**What's excluded:** Localization into Kannada, Tamil, Telugu, Marathi, Bengali, or any language other than Hindi and English.

**Why:** Bangalore MVP will serve workers who speak Kannada natively, and this is a known limitation. Hindi is the most widely understood second language. Full Kannada support is the highest priority for Phase 2.

**Planned for:** Phase 2 (Kannada first, then Tamil and Telugu with Mumbai/Hyderabad expansion).

### Background Check Integrations

**What's excluded:** Integration with police verification systems, criminal record databases, court record searches, or third-party background check providers.

**Why:** These integrations require government partnerships, legal agreements, and handling of sensitive criminal justice data. DigiLocker-based identity verification provides the MVP trust signal.

**Planned for:** Phase 2.

### Insurance Products

**What's excluded:** Any insurance offerings -- worker accident insurance, employer liability insurance, theft insurance.

**Why:** Insurance requires IRDAI-regulated partnerships, actuarial analysis, and significant legal work. Not a core trust feature.

**Planned for:** Phase 3.

### Chat/Messaging

**What's excluded:** In-app messaging between hirers and workers.

**Why:** Workers and hirers universally use WhatsApp and phone calls. Building a messaging system adds complexity without clear value. The Trust Card shareable link already works via WhatsApp.

**Planned for:** Phase 2 (if validated by user feedback).

### Employer-Verified Service History

**What's excluded:** Mechanism for employers to confirm that a worker worked for them, adding verified employment history to the Trust Card.

**Why:** Requires employer adoption, a confirmation flow, and handling of disputes about employment claims. Valuable but not essential for MVP trust signal.

**Planned for:** Phase 2.

### Staffing Agency Portal

**What's excluded:** A dedicated interface for staffing agencies to manage their worker rosters, track placements, or bulk-verify workers.

**Why:** Agencies (like Meera in our personas) are a future distribution channel. MVP focuses on direct worker-hirer interaction. Agencies can use the standard hirer interface for MVP.

**Planned for:** Phase 2.

### Web App for Workers

**What's excluded:** A full web application for workers. Workers use the React Native mobile app only.

**Why:** Target worker demographics are mobile-first. Web adds a maintenance surface with limited user benefit. Workers can view their Trust Card via the mobile app or the web-based Trust Card link.

**Planned for:** Phase 2.

---

## MVP Technical Architecture

```
apps/
  web/          -- Next.js web app (hirer-facing: search, view, report)
  mobile/       -- React Native/Expo app (worker-facing: register, verify, Trust Card)
  admin/        -- Next.js admin panel (moderation, review, audit)

packages/
  api/          -- tRPC router (shared API layer)
  db/           -- Supabase schema, migrations, RLS policies
  types/        -- Shared TypeScript types
  ui/           -- Shared UI components
  auth/         -- Authentication utilities
  config/       -- Shared configuration

supabase/       -- Supabase project config, seed data, Edge Functions
```

### Key Technical Decisions for MVP

1. **Monorepo (Turborepo + pnpm):** Single repo for all apps and packages. Enables shared types and components.
2. **tRPC for API:** End-to-end type safety between client and server. No REST API design overhead.
3. **Supabase for backend:** Postgres database, Auth, Storage, Edge Functions, and Row Level Security. Reduces infrastructure management.
4. **React Native/Expo for worker app:** Cross-platform but Android-first. Expo simplifies build/deploy for the small team.
5. **Next.js for web and admin:** Server-side rendering for Trust Card pages (SEO and fast load), React for hirer and admin interfaces.

---

## MVP Timeline

| Phase | Duration | Deliverables |
|---|---|---|
| Design and architecture | 4 weeks | Figma designs, database schema, API contracts, DigiLocker integration spike |
| Core development | 8 weeks | Worker app (registration, verification, Trust Card), hirer web (search, view), admin panel (basic review) |
| Incident and appeals flow | 4 weeks | Incident reporting, worker response, admin review, appeals |
| Testing and compliance | 3 weeks | QA, accessibility audit, DPDP compliance review, penetration testing |
| Closed beta | 3 weeks | 3-5 apartment communities in Bangalore, iterate on feedback |
| Public launch | 1 week | Launch to 50+ communities, onboarding drives |
| **Total** | **23 weeks** | |

---

## MVP Success Criteria

The MVP is considered successful if, within 3 months of public launch:

1. **1,000+ workers** registered, with **500+** identity-verified.
2. **500+ hirers** registered across **20+ apartment communities**.
3. **Worker registration completion rate** > 70% (of those who start registration).
4. **Trust Card view satisfaction** -- 60%+ of hirers surveyed report the Trust Card was "useful" or "very useful" in their hiring decision.
5. **Incident response rate** -- 70%+ of incident reports receive a worker response within the 7-day window.
6. **Zero data breaches** or privacy compliance failures.
7. **App crash rate** < 1% on target devices.
