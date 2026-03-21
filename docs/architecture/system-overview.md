# System Architecture Overview

## 1. High-Level Architecture

```
+---------------------+       +---------------------+       +----------------------+
|   Mobile App        |       |   Web App            |       |   Admin Panel        |
|   (React Native/    |       |   (Next.js)          |       |   (Next.js)          |
|    Expo)            |       |                      |       |                      |
|   - Worker flows    |       |   - Hirer flows      |       |   - Incident review  |
|   - Trust card      |       |   - Worker search    |       |   - User management  |
|   - Consent mgmt   |       |   - Incident report  |       |   - Audit logs       |
+--------+------------+       +--------+-------------+       +--------+-------------+
         |                             |                              |
         |          HTTPS/TLS 1.3      |                              |
         +-----------------------------+------------------------------+
                                       |
                          +------------+-------------+
                          |   API Layer (tRPC)       |
                          |                          |
                          |   Routers:               |
                          |   - auth.*               |
                          |   - worker.*             |
                          |   - hirer.*              |
                          |   - trust.*              |
                          |   - incident.*           |
                          |   - admin.*              |
                          |   - consent.*            |
                          |   - disclosure.*         |
                          +------------+-------------+
                                       |
                          +------------+-------------+
                          |   Supabase Platform      |
                          |                          |
                          |   +------------------+   |
                          |   | Postgres (RLS)   |   |
                          |   +------------------+   |
                          |   | Auth (GoTrue)    |   |
                          |   +------------------+   |
                          |   | Storage (S3)     |   |
                          |   +------------------+   |
                          |   | Edge Functions   |   |
                          |   +------------------+   |
                          |   | Realtime         |   |
                          |   +------------------+   |
                          +--------------------------+
                                       |
                          +------------+-------------+
                          |   External Services      |
                          |                          |
                          |   - Aadhaar e-KYC        |
                          |   - SMS gateway (MSG91)  |
                          |   - Push (FCM/APNs)      |
                          |   - CDN (Cloudflare)     |
                          |   - Error tracking       |
                          +--------------------------+
```

## 2. Component Breakdown

### 2.1 Mobile App (React Native / Expo)

The primary interface for workers. Built with Expo for cross-platform deployment and OTA update capability, critical for a user base that may not regularly update apps through app stores.

**Key modules:**

- **Onboarding** -- Phone-based OTP registration, language selection (Hindi, English, Kannada, Tamil, Telugu, Malayalam, Bengali, Marathi), profile creation.
- **Trust Card** -- Read-only view of the worker's own trust card. Shareable via QR code or deep link with time-limited consent token.
- **Consent Manager** -- Granular controls for what data is shared with which hirer, with expiration timers.
- **Incident Viewer** -- Notification of incidents filed against the worker, appeal submission interface.
- **Work History** -- Self-declared work history entries, endorsement requests to past hirers.
- **Document Vault** -- Encrypted storage for identity documents (Aadhaar, PAN, address proof). Documents never leave the vault without explicit consent.

**Technical details:**

- Expo SDK with EAS Build for app store submissions.
- Expo Router for file-based navigation.
- Offline-first with local SQLite via `expo-sqlite` for trust card caching.
- Biometric lock (fingerprint/face) for vault access using `expo-local-authentication`.
- Minimum Android API 24 (Android 7.0), iOS 15.

### 2.2 Web App (Next.js)

The primary interface for hirers -- individual households and apartment communities.

**Key modules:**

- **Worker Search** -- Search by phone number or scan QR code. Returns trust card if worker has granted consent or has a public profile.
- **Incident Reporting** -- Multi-step form with evidence upload, severity selection, description.
- **Endorsement** -- Hirers can endorse workers they have employed.
- **Community Dashboard** -- For apartment community admins: shared worker roster, aggregate trust views.
- **Consent Requests** -- Request additional disclosure from a worker (e.g., detailed verification status).

**Technical details:**

- Next.js App Router with server components for initial page loads.
- Client-side tRPC hooks via `@trpc/react-query`.
- Responsive design targeting mobile browsers (many hirers will access via phone browser).
- Progressive Web App (PWA) with service worker for offline trust card viewing.

### 2.3 Admin Panel (Next.js)

Internal tool for Verify Me operations team.

**Key modules:**

- **Incident Review Queue** -- Prioritized list of pending incidents, review tools, resolution workflow.
- **User Management** -- Worker and hirer account management, suspension, ban.
- **Audit Log Viewer** -- Searchable log of all data access events.
- **Disclosure Request Handler** -- Interface for processing lawful disclosure requests from authorities.
- **Analytics Dashboard** -- Platform health metrics, incident volume, resolution times, geographic distribution.
- **Content Moderation** -- Review flagged evidence, endorsement text.

**Technical details:**

- Deployed as a separate Next.js app within the monorepo.
- Role-based access: `admin`, `reviewer`, `compliance_officer`, `super_admin`.
- All actions logged to `audit_log` table with admin user ID.
- IP allowlisting and mandatory 2FA via TOTP.

### 2.4 API Layer (tRPC)

Type-safe API layer shared across all clients. Deployed as Next.js API routes (web app) and consumed by mobile via HTTP.

**Router structure:**

```
appRouter
  |-- auth
  |     |-- sendOtp
  |     |-- verifyOtp
  |     |-- refreshSession
  |     |-- logout
  |
  |-- worker
  |     |-- getProfile
  |     |-- updateProfile
  |     |-- getWorkHistory
  |     |-- addWorkHistory
  |     |-- requestEndorsement
  |     |-- getDocuments
  |     |-- uploadDocument
  |
  |-- hirer
  |     |-- getProfile
  |     |-- updateProfile
  |     |-- searchWorker
  |     |-- getCommunityRoster
  |
  |-- trust
  |     |-- getTrustCard (public, respects consent)
  |     |-- getTrustCardByToken (time-limited link)
  |     |-- refreshTrustCard (admin/system)
  |
  |-- incident
  |     |-- create
  |     |-- getByWorker (worker's own)
  |     |-- getByHirer (hirer's own reports)
  |     |-- submitEvidence
  |     |-- submitAppeal
  |
  |-- consent
  |     |-- grantConsent
  |     |-- revokeConsent
  |     |-- listActiveGrants
  |     |-- generateShareToken
  |
  |-- disclosure
  |     |-- submitRequest (law enforcement)
  |     |-- getRequestStatus
  |
  |-- admin
  |     |-- reviewIncident
  |     |-- resolveIncident
  |     |-- suspendUser
  |     |-- getAuditLog
  |     |-- processDisclosure
  |     |-- getAnalytics
```

**Middleware stack:**

1. Rate limiting (per IP and per user).
2. Authentication (Supabase JWT verification).
3. Authorization (role check against procedure requirements).
4. Input validation (Zod schemas).
5. Audit logging (all mutations and sensitive queries).
6. Error sanitization (strip internal details before client response).

### 2.5 Supabase Backend

**Postgres** -- Primary data store. Row-Level Security (RLS) policies enforce data access at the database level, providing defense-in-depth beyond application-level checks.

**Auth (GoTrue)** -- Phone/OTP authentication. JWT tokens with custom claims for role and user type. Session management with refresh tokens.

**Storage** -- S3-compatible object storage for evidence uploads, profile photos, identity documents. Bucket-level policies restrict access. Evidence bucket has no public access; profile photos have consent-gated public URLs.

**Edge Functions** -- Deno-based serverless functions for sensitive operations:

- `compute-trust-card` -- Recomputes trust signals. Runs on a schedule and on-demand after incident resolution.
- `encrypt-pii` -- Field-level encryption before database write.
- `verify-aadhaar` -- Proxies Aadhaar e-KYC API, never exposes API keys to client.
- `generate-share-token` -- Creates time-limited, scoped consent tokens.
- `process-disclosure` -- Handles lawful disclosure with audit trail.

**Realtime** -- WebSocket subscriptions for:

- Worker notification when an incident is filed.
- Admin notification for new incidents in review queue.
- Consent grant/revoke events.

## 3. Data Flow: Key Scenarios

### 3.1 Worker Registration

```
1. Worker opens mobile app, selects language.
2. Enters phone number -> auth.sendOtp -> Supabase Auth sends SMS via MSG91.
3. Enters OTP -> auth.verifyOtp -> Supabase Auth creates user, returns JWT.
4. App prompts for name, photo, preferred work categories.
5. worker.updateProfile -> tRPC validates with Zod -> encrypts PII fields
   via Edge Function -> inserts into worker_profiles.
6. Optional: worker uploads Aadhaar for verification.
   -> worker.uploadDocument -> file stored in encrypted Storage bucket
   -> Edge Function triggers Aadhaar e-KYC API
   -> verification result stored in verifications table.
7. Trust card auto-generated with "unverified" or "basic-verified" tier.
```

### 3.2 Trust Card Viewing (Hirer Scans QR)

```
1. Worker shows QR code on mobile app (contains share token).
2. Hirer scans QR -> opens web app with token in URL.
3. Web app calls trust.getTrustCardByToken(token).
4. tRPC middleware validates token:
   - Not expired?
   - Scope matches requested data?
   - Consent grant still active?
5. If valid: returns trust card data (aggregated signals only).
   - Verification tier (basic/enhanced)
   - Tenure indicator (e.g., "2+ years on platform")
   - Endorsement count
   - Incident flag (clean / flag with severity, no details)
6. If invalid/expired: returns error, prompts hirer to request consent.
7. All access logged to audit_log with hirer ID, worker ID, fields viewed.
```

### 3.3 Incident Reporting

```
1. Hirer opens web app -> incident.create.
2. Fills form: worker phone/ID, incident type, date, description, severity.
3. Uploads evidence (photos, documents) -> stored in encrypted Storage bucket.
4. tRPC creates incident record (status: "pending_review").
5. Worker receives push notification: "An incident has been reported.
   You will be notified of the review outcome."
   (No details shared at this stage to prevent retaliation.)
6. Admin receives queue notification.
7. Admin reviews: checks evidence, may request additional info from hirer.
8. Admin resolves: substantiated / unsubstantiated / inconclusive.
9. Worker notified of outcome with appeal window (7 days).
10. If substantiated: trust card updated via compute-trust-card Edge Function.
11. If worker appeals: incident.submitAppeal -> re-enters review queue
    with "appeal" priority.
```

## 4. Infrastructure

### 4.1 Hosting

- **Supabase Cloud** (Mumbai region, `ap-south-1`) -- Database, auth, storage, edge functions, realtime.
- **Vercel** (Mumbai edge) -- Next.js web app and admin panel. Edge runtime for API routes where latency matters.
- **Expo EAS** -- Mobile app builds and OTA updates. Update channels: `production`, `staging`, `preview`.
- **Cloudflare CDN** -- Static assets, profile photo delivery (consent-gated), trust card QR code images.

### 4.2 Environments

| Environment | Purpose                | Database          | URL pattern                  |
|-------------|------------------------|-------------------|------------------------------|
| Local       | Development            | Local Supabase    | localhost:3000               |
| Preview     | PR previews            | Branched Supabase | pr-{n}.preview.verifyme.in   |
| Staging     | Pre-production testing | Staging Supabase  | staging.verifyme.in          |
| Production  | Live                   | Production        | verifyme.in / app.verifyme.in|

### 4.3 Monitoring and Observability

- **Error tracking** -- Sentry (web + mobile), with PII scrubbing configured.
- **Uptime monitoring** -- BetterUptime with SMS/call escalation.
- **Logs** -- Supabase built-in logging + custom structured logs to a logging service.
- **Metrics** -- Vercel Analytics for web vitals, custom dashboards for business metrics (registrations, incidents, resolution times).
- **Alerting** -- PagerDuty integration for P0/P1 incidents (database down, auth service failure, data breach indicators).

## 5. Deployment Architecture

### 5.1 Monorepo Structure

```
safehire/
  apps/
    web/           -- Next.js hirer-facing web app
    admin/         -- Next.js admin panel
    mobile/        -- Expo React Native app
  packages/
    api/           -- tRPC router definitions
    db/            -- Supabase client, types, migrations
    ui/            -- Shared UI components
    shared/        -- Shared types, utils, constants
    config/        -- Shared ESLint, TypeScript configs
  supabase/
    migrations/    -- SQL migrations
    functions/     -- Edge Functions (Deno)
    seed.sql       -- Development seed data
  docs/            -- This documentation
  turbo.json       -- Turborepo pipeline config
  pnpm-workspace.yaml
```

### 5.2 CI/CD Pipeline

```
Push to branch
  -> GitHub Actions triggered
  -> Turborepo determines affected packages
  -> Parallel: lint + typecheck + test
  -> Security scan (npm audit, Snyk)
  -> Privacy review gate (manual for changes touching PII fields)
  -> Build affected apps
  -> Deploy:
       PR: Preview deployment (Vercel) + branched Supabase
       main: Staging deployment
       release/*: Production deployment (manual approval gate)
```

### 5.3 Database Migrations

Supabase migrations managed via `supabase db diff` and applied through the Supabase CLI. Migration order:

1. Schema changes applied to staging.
2. RLS policies tested against integration test suite.
3. Manual review of any migration touching encrypted columns or audit tables.
4. Applied to production during maintenance window (if breaking) or live (if additive).

## 6. Scalability Considerations

### 6.1 Current Design Point

The initial architecture targets 100K workers and 50K hirers in the first 12 months, concentrated in Tier 1 Indian cities (Bangalore, Mumbai, Delhi NCR, Chennai, Hyderabad).

### 6.2 Database Scaling

- **Connection pooling** -- Supabase provides PgBouncer. tRPC API routes use pooled connections.
- **Read replicas** -- Supabase supports read replicas for analytics queries and trust card reads, keeping write path performant.
- **Partitioning** -- `audit_log` table partitioned by month (high write volume). `incidents` partitioned by year.
- **Indexing** -- Composite indexes on frequently queried columns (worker phone, incident status + created_at, consent grant scope + expiry).

### 6.3 Caching Strategy

- **Trust cards** -- Cached in Redis (Upstash, serverless) with 15-minute TTL. Invalidated on incident resolution or verification status change.
- **User sessions** -- JWT-based, stateless. No session store needed.
- **Static assets** -- CDN-cached with immutable hashes.
- **Search results** -- Not cached (privacy concern: stale consent data could leak information).

### 6.4 Edge Computing

- Trust card reads served from Vercel Edge Runtime (Mumbai PoP) for sub-100ms response in India.
- Edge Functions for encryption operations run in Supabase's ap-south-1 region.
- QR code generation done client-side to avoid server round-trip.

### 6.5 Future Scaling Path

- **Multi-region** -- If expanding beyond India, Supabase supports multi-region. Data residency laws (DPDP Act) require Indian user data to remain in India.
- **Microservices extraction** -- If trust card computation becomes a bottleneck, extract to a dedicated service with its own scaling characteristics.
- **Event-driven architecture** -- Replace synchronous incident processing with an event queue (e.g., Supabase Realtime + Edge Functions) for better decoupling.

## 7. Security Architecture

### 7.1 Authentication

- Phone + OTP as primary factor (no passwords -- reduces credential theft risk for target demographic).
- Admin panel requires TOTP 2FA.
- JWT tokens with 1-hour access token, 30-day refresh token.
- Device binding for mobile app (optional, recommended).

### 7.2 Authorization

- Row-Level Security (RLS) at database level -- every query filtered by user context.
- Application-level role checks in tRPC middleware.
- Principle of least privilege: hirers cannot access raw incident data, workers cannot see who reported incidents (until resolution).

### 7.3 Data Protection

- TLS 1.3 for all data in transit.
- AES-256 encryption at rest (Supabase managed).
- Field-level encryption for PII (Aadhaar number, phone, address) using application-managed keys.
- Encryption keys rotated quarterly, managed via Supabase Vault.
- Evidence files encrypted in Storage with per-file keys.

### 7.4 Network Security

- Supabase project API keys scoped by role (`anon`, `service_role`).
- Admin panel IP-allowlisted.
- Rate limiting: 100 requests/minute for anonymous, 300 for authenticated, 1000 for admin.
- DDoS protection via Cloudflare.

## 8. Disaster Recovery

- **RPO (Recovery Point Objective)** -- 1 hour (Supabase point-in-time recovery).
- **RTO (Recovery Time Objective)** -- 4 hours.
- **Backups** -- Daily automated backups retained for 30 days. Weekly backups retained for 1 year.
- **Failover** -- Supabase manages primary/standby failover for Postgres.
- **Incident response** -- Documented runbook for data breach, service outage, and security incident scenarios.
