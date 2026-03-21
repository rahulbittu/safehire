# Release Checklist

## 1. Pre-Release Checks

All items must be completed before any staging deployment. A single failure blocks the release.

### 1.1 Code Quality

- [ ] **Code review.** All PRs merged to the release branch have at least one approved review. PRs touching PII handling, encryption, or RLS policies require two reviews, with at least one from a senior engineer.
- [ ] **TypeScript type checking.** `pnpm turbo typecheck` passes with zero errors across all packages (`apps/web`, `apps/admin`, `apps/mobile`, `packages/*`).
- [ ] **Linting.** `pnpm turbo lint` passes with zero errors. Warnings reviewed and acknowledged.
- [ ] **Formatting.** `pnpm turbo format:check` passes. No unformatted files.

### 1.2 Testing

- [ ] **Unit tests.** `pnpm turbo test` passes. Coverage thresholds met:
  - `packages/api`: 80% statement coverage.
  - `packages/db`: 70% statement coverage.
  - `apps/web`: 60% statement coverage.
  - `apps/admin`: 60% statement coverage.
  - `apps/mobile`: 50% statement coverage.
- [ ] **Integration tests.** tRPC router integration tests pass against a test Supabase instance. Tests cover:
  - Authentication flows (OTP send, verify, refresh, logout).
  - Consent grant and revocation.
  - Trust card computation.
  - Incident creation and resolution workflow.
  - RLS policy enforcement (verify that unauthorized access returns 403/empty results).
- [ ] **End-to-end tests.** Playwright tests for web app and admin panel pass.
  - Happy path: worker registration, consent sharing, trust card viewing.
  - Happy path: incident report, admin review, resolution.
  - Error paths: expired consent, invalid share token, rate limiting.
- [ ] **Mobile tests.** Detox or Maestro tests for critical mobile flows pass.
  - Onboarding and OTP verification.
  - Consent grant via QR code.
  - Trust card display.

### 1.3 Security

- [ ] **Dependency audit.** `pnpm audit` shows zero critical or high vulnerabilities. Medium vulnerabilities reviewed and either patched or documented with accepted risk.
- [ ] **Static analysis.** Semgrep or similar SAST tool run against codebase. Zero high-severity findings.
- [ ] **Secret scanning.** No API keys, tokens, or credentials in the codebase. Checked via `gitleaks` or similar tool.
- [ ] **RLS policy review.** If any database migration in this release modifies RLS policies, a dedicated security review has been completed and documented.
- [ ] **Encryption verification.** If any migration adds or modifies encrypted fields, verify that encryption is applied correctly in the Edge Function layer.

### 1.4 Privacy Review

- [ ] **Data flow review.** If the release introduces new data collection or changes how PII flows through the system, the privacy model document has been updated and a privacy review has been conducted.
- [ ] **Consent scope review.** If new data fields are exposed to hirers, the consent scope model has been updated and the data classification matrix reflects the new fields.
- [ ] **Audit logging.** If new tRPC procedures access PII, audit logging middleware is applied.
- [ ] **Retention compliance.** No changes introduce data storage without a defined retention period.

### 1.5 Accessibility

- [ ] **WCAG 2.1 AA compliance.** Web app and admin panel tested with axe-core. Zero critical violations.
- [ ] **Screen reader testing.** Key flows (registration, trust card viewing, incident reporting) tested with VoiceOver (iOS/macOS) or TalkBack (Android).
- [ ] **Multilingual UI.** All new UI strings have translations for supported languages (Hindi, English, Kannada, Tamil, Telugu, Malayalam, Bengali, Marathi).
- [ ] **Low-bandwidth testing.** Web app tested on throttled connection (3G simulation). Core flows complete within 10 seconds.

### 1.6 Documentation

- [ ] **API changes documented.** If tRPC router signatures changed, the API documentation is updated.
- [ ] **Migration notes.** If database migrations require manual steps (e.g., backfill scripts), they are documented in the migration file comments.
- [ ] **Changelog updated.** `CHANGELOG.md` reflects all user-facing changes.

## 2. Staging Deployment

### 2.1 Database Migration

- [ ] **Backup staging database.** Supabase point-in-time snapshot created before migration.
- [ ] **Run migrations.** `supabase db push --project-ref <staging-ref>` completes without errors.
- [ ] **Verify migration.** Spot-check key tables to confirm schema changes applied correctly.
- [ ] **Run seed data.** If migration introduces new tables, seed data applied for testing.

### 2.2 Edge Function Deployment

- [ ] **Deploy Edge Functions.** `supabase functions deploy --project-ref <staging-ref>` for all modified functions.
- [ ] **Verify function health.** Each deployed function responds to a health check request.
- [ ] **Environment variables.** Staging secrets (API keys, encryption keys) are set in Supabase dashboard. Verified that production keys are NOT used in staging.

### 2.3 Web App Deployment

- [ ] **Deploy to Vercel staging.** `vercel deploy --env staging` or Git push to staging branch triggers deploy.
- [ ] **Verify deployment URL.** `staging.verifyme.in` loads correctly.
- [ ] **Smoke test.** Manual walkthrough of key flows:
  - Home page loads.
  - Login/registration flow works.
  - Trust card viewing works.
  - Incident reporting form loads and submits.
  - Admin panel loads and displays review queue.

### 2.4 Admin Panel Deployment

- [ ] **Deploy admin to Vercel staging.** Separate deployment for admin app.
- [ ] **Verify admin URL.** `admin-staging.verifyme.in` loads.
- [ ] **Access control verified.** Non-admin accounts cannot access admin panel.
- [ ] **Smoke test.** Admin can log in, view incident queue, and access audit logs.

### 2.5 Mobile App (Staging Build)

- [ ] **Build with EAS.** `eas build --profile staging --platform all`.
- [ ] **Distribute.** Upload to TestFlight (iOS) and Firebase App Distribution (Android).
- [ ] **Internal testing.** Team members install and test on physical devices.
- [ ] **OTA update test.** If this is an OTA-eligible update, verify that the update is received by an existing staging installation.

### 2.6 Staging Validation

- [ ] **Full integration test suite.** Run against staging environment (not local test instance).
- [ ] **Performance check.** Key API endpoints respond within acceptable latency:
  - `trust.getTrustCard`: < 200ms (p95).
  - `incident.create`: < 500ms (p95).
  - `auth.verifyOtp`: < 300ms (p95).
- [ ] **Error monitoring.** Sentry connected to staging. No new unhandled errors during testing.
- [ ] **Staging sign-off.** At least one engineer and one product team member sign off on staging.

## 3. Production Deployment

### 3.1 Pre-Production

- [ ] **Staging sign-off obtained.** Documented in the release ticket.
- [ ] **Deployment window confirmed.** Deployments scheduled during low-traffic hours (02:00-06:00 IST) for breaking changes. Non-breaking changes can be deployed during business hours.
- [ ] **On-call engineer identified.** An engineer is on-call for the 4 hours following production deployment.
- [ ] **Rollback plan documented.** For each component (database, edge functions, web app, admin, mobile), the rollback procedure is documented and the previous version identified.
- [ ] **Communication.** If the release includes user-facing changes, support team has been briefed.

### 3.2 Database Migration (Production)

- [ ] **Production backup.** Supabase point-in-time snapshot created immediately before migration.
- [ ] **Maintenance mode.** If migration requires downtime (schema change on large tables), enable maintenance mode on the web app and return 503 with a maintenance message.
- [ ] **Run migration.** `supabase db push --project-ref <production-ref>`.
- [ ] **Verify migration.** Schema check, spot-check data integrity.
- [ ] **Disable maintenance mode.** If applicable.

### 3.3 Edge Function Deployment (Production)

- [ ] **Deploy.** `supabase functions deploy --project-ref <production-ref>`.
- [ ] **Verify.** Health check for each function.
- [ ] **Environment variables.** Production secrets confirmed correct and distinct from staging.

### 3.4 Web App Deployment (Production)

- [ ] **Deploy.** Vercel production deployment triggered by merge to `main` or manual promote from staging.
- [ ] **Verify.** `verifyme.in` loads correctly.
- [ ] **DNS/CDN.** Cloudflare cache purged for updated assets.
- [ ] **SSL.** TLS certificate valid and not near expiry.

### 3.5 Admin Panel Deployment (Production)

- [ ] **Deploy.** Vercel production deployment for admin app.
- [ ] **Verify.** `admin.verifyme.in` loads. Access control works.

### 3.6 Mobile App Deployment (Production)

- [ ] **OTA update (if eligible).** `eas update --branch production`. Updates pushed to all users.
- [ ] **Native build (if required).** `eas build --profile production --platform all`.
- [ ] **App store submission.** See Section 5 below for detailed checklist.

## 4. Post-Deploy Verification

Completed within 1 hour of production deployment.

- [ ] **Health checks.** All API endpoints responding. Supabase status page green.
- [ ] **Smoke test (production).** Manual walkthrough of critical paths:
  - New user registration via OTP.
  - Existing user login.
  - Trust card generation and viewing.
  - Incident report submission.
  - Admin panel login and queue view.
- [ ] **Error monitoring.** Sentry checked for new errors in production. Error rate compared to pre-deployment baseline.
- [ ] **Performance monitoring.** Vercel Analytics checked for regressions in web vitals. API latency checked against baselines.
- [ ] **Database monitoring.** Connection pool utilization normal. No long-running queries introduced.
- [ ] **Edge Function monitoring.** Function execution times and error rates within normal range.
- [ ] **Alert check.** Monitoring alerts are firing correctly (test alert if possible without disrupting production).

## 5. App Store Submission Checklist

### 5.1 iOS (App Store Connect)

- [ ] **Build uploaded.** Via EAS Build or Xcode.
- [ ] **App metadata updated.** Description, keywords, screenshots, what's new text -- in all supported languages.
- [ ] **Privacy nutrition labels updated.** Reflects current data collection practices. Categories:
  - Data Used to Track You: None.
  - Data Linked to You: Phone number, name (encrypted).
  - Data Not Linked to You: Usage data (anonymized crash reports).
- [ ] **App Privacy Policy URL.** Points to current privacy policy on `verifyme.in/privacy`.
- [ ] **Age rating.** 17+ (due to incident reporting content). Confirmed with Apple's rating questionnaire.
- [ ] **Review notes.** Demo account credentials provided for Apple review team. Notes explain OTP verification flow.
- [ ] **Export compliance.** Encryption questionnaire completed (uses AES-256, no proprietary encryption).
- [ ] **Submit for review.** Manual release selected (not automatic, to control rollout timing).

### 5.2 Android (Google Play Console)

- [ ] **AAB uploaded.** Via EAS Build.
- [ ] **Store listing updated.** Description, screenshots, what's new -- in all supported languages.
- [ ] **Data safety form updated.** Reflects current data collection, sharing, and security practices.
- [ ] **Content rating questionnaire.** Updated if content has changed.
- [ ] **Target audience.** Set to 18+ (not targeting children).
- [ ] **Staged rollout.** Set to 10% initially, expanding to 50% after 24 hours if no issues, then 100% after 72 hours.
- [ ] **Review notes.** Demo credentials and testing instructions provided.
- [ ] **Submit for review.**

### 5.3 Post-Submission

- [ ] **Monitor review status.** Respond promptly to any reviewer questions.
- [ ] **Monitor crash reports.** Firebase Crashlytics (Android) and Xcode Organizer (iOS) checked for new crash patterns.
- [ ] **User reviews.** Monitor app store reviews for reports of new issues.
- [ ] **Staged rollout monitoring.** For Android, check crash rate and ANR rate at each rollout stage before expanding.

## 6. Rollback Procedure

### 6.1 Web App / Admin Panel Rollback

```
1. Identify the previous deployment in Vercel dashboard.
2. Click "Promote to Production" on the previous deployment.
3. Verify the rollback: site loads correctly with previous version.
4. Purge Cloudflare cache.
5. Time to rollback: ~2 minutes.
```

### 6.2 Edge Function Rollback

```
1. Edge Functions are versioned in Git.
2. Check out the previous release tag.
3. Deploy: supabase functions deploy --project-ref <production-ref>
4. Verify: health check each function.
5. Time to rollback: ~5 minutes.
```

### 6.3 Database Rollback

```
1. If the migration was additive (new tables, new columns):
   - Generally no rollback needed. The old application code
     ignores new columns/tables.
   - If rollback is needed: write and apply a reverse migration.

2. If the migration was destructive (dropped columns, changed types):
   - Restore from the pre-migration snapshot.
   - WARNING: this loses all data written after the migration.
   - Time to rollback: ~30 minutes (Supabase PITR restore).

3. If the migration was a data migration (backfill, transformation):
   - Apply a reverse data migration if one was prepared.
   - If not: restore from snapshot.
```

### 6.4 Mobile App Rollback

```
1. OTA update: publish a new OTA update that reverts to previous JS bundle.
   Time to rollback: ~5 minutes to publish, ~1 hour for most users to receive.

2. Native build: cannot be rolled back from app stores once published.
   Mitigation: submit a new build with the fix. Use staged rollout to
   limit exposure. Enable a server-side feature flag to disable new
   functionality while the rollback build is in review.
```

## 7. Monitoring Checks (Ongoing)

After every production deployment, the following are monitored for 48 hours:

| Metric                          | Tool              | Alert Threshold                |
|---------------------------------|--------------------|---------------------------------|
| API error rate (5xx)            | Sentry, Vercel    | > 1% of requests               |
| API latency (p95)              | Vercel Analytics   | > 500ms for trust card reads   |
| Auth success rate               | Supabase dashboard | < 95% OTP verification success |
| Database connection pool        | Supabase dashboard | > 80% utilization              |
| Edge Function error rate        | Supabase dashboard | > 2% execution failures        |
| Mobile crash rate               | Sentry             | > 0.5% session crash rate      |
| Audit log write rate            | Custom dashboard   | Sudden drop (may indicate logging failure) |
| Trust card computation time     | Custom dashboard   | > 2 seconds per computation    |
| Storage bucket size             | Supabase dashboard | Unexpected growth (may indicate abuse) |

## 8. Hotfix Process

For critical production issues that cannot wait for the next release cycle.

### 8.1 Criteria for Hotfix

- Security vulnerability actively being exploited.
- Data breach or PII exposure.
- Core functionality completely broken (login, trust card, incident reporting).
- Legal compliance issue.

### 8.2 Hotfix Procedure

```
1. Create branch from production tag: hotfix/<issue-description>.
2. Implement fix with minimal changes. Do not bundle unrelated changes.
3. Code review: at least one reviewer, prioritized.
4. Run critical tests only (unit tests for affected module, integration
   tests for affected flow).
5. Deploy to staging. Quick smoke test.
6. Deploy to production. Follow production deployment steps (abbreviated).
7. Post-deploy verification (abbreviated: focus on the fixed issue).
8. Merge hotfix branch back to main/develop.
9. Post-incident review within 48 hours:
   - Root cause analysis.
   - How the issue slipped through the release process.
   - Process improvements to prevent recurrence.
```

### 8.3 Hotfix Communication

- Internal: Slack alert to engineering team, product team, and support team.
- External (if user-facing): In-app notification or status page update.
- If data breach: follow the privacy incident response plan (CERT-In notification within 6 hours, user notification within 72 hours).
