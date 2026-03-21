# Privacy Architecture

## 1. Guiding Principles

Verify Me operates in a context where privacy failures cause direct harm to vulnerable people. A leaked incident report can cost a worker their livelihood. An exposed Aadhaar number enables identity theft. The privacy architecture is not a compliance checkbox; it is a core product requirement.

**Principles applied:**

1. **Privacy by default.** New accounts share nothing. Every disclosure requires an affirmative action by the worker.
2. **Data minimization.** We collect only what is necessary for the trust card to function. We do not collect location history, browsing patterns, or social graphs.
3. **Purpose limitation.** Data collected for identity verification is used only for identity verification, not for marketing or analytics.
4. **Worker sovereignty.** Workers control their data. They can see who accessed it, revoke access, and request erasure.
5. **Defense in depth.** Privacy is enforced at multiple layers: application logic, API middleware, database RLS, and field-level encryption.

## 2. Data Classification Tiers

All data in the system is classified into one of four tiers. Classification determines encryption requirements, access controls, retention periods, and erasure behavior.

### Tier 1: Public

Data that is visible without authentication or consent.

- Worker display name (if profile is set to public).
- Profile photo (if profile is set to public).
- Verification tier label.
- Platform tenure (approximate).

### Tier 2: Restricted

Data visible only to authenticated users with a valid consent grant or legitimate relationship.

- Trust card details (endorsement count, incident flag).
- Work categories.
- City and state.

### Tier 3: Sensitive

Data that requires explicit consent for each access, encrypted at rest, and logged on every read.

- Full name.
- Work history details.
- Endorsement text.
- Incident type and severity (worker's own view).
- Verification status details.

### Tier 4: Highly Sensitive

Data that is field-level encrypted, accessible only through explicit consent or lawful disclosure, with mandatory audit logging.

- Phone number.
- Aadhaar number.
- Date of birth.
- Full address.
- Incident descriptions and evidence.
- Background check report details.
- Appeal text.

## 3. Consent Model

### 3.1 Consent Architecture

Consent in Verify Me is:

- **Opt-in.** Nothing is shared by default. Workers must actively grant consent.
- **Granular.** Consent is granted per data field or field group, not as an all-or-nothing toggle.
- **Time-limited.** Every consent grant has an expiration timestamp. There is no "forever" consent.
- **Revocable.** Workers can revoke consent at any time. Revocation takes effect immediately.
- **Auditable.** Every consent grant, revocation, and data access under consent is logged.

### 3.2 Consent Grant Structure

A consent grant specifies:

| Property       | Description                                                  |
|----------------|--------------------------------------------------------------|
| Scope          | Array of field identifiers: `['trust_card', 'work_history', 'verification_tier']` |
| Recipient      | The specific hirer (by hirer_profile ID) or "anyone with token" |
| Expiry         | Timestamp after which the grant is invalid.                  |
| Max Views      | Optional limit on number of times the data can be accessed.  |
| Share Token    | Optional opaque token for URL-based sharing (e.g., QR code).|

### 3.3 Consent Scopes

| Scope Identifier       | Fields Included                                    | Tier |
|------------------------|----------------------------------------------------|------|
| `trust_card`           | Verification tier, tenure, endorsement count, incident flag | Restricted |
| `trust_card_detail`    | Above + incident summary (count + severity)        | Restricted |
| `work_history`         | Work history entries (employer type, duration, category) | Sensitive |
| `verification_detail`  | Verification types completed, dates                | Sensitive |
| `endorsements`         | Endorsement text and endorser display names        | Sensitive |
| `contact_info`         | Phone number                                       | Highly Sensitive |
| `identity_documents`   | Aadhaar last four, verification provider            | Highly Sensitive |

Workers select scopes through a simple UI in the mobile app. Scopes are presented in plain language (e.g., "Share your trust card" rather than "Grant scope trust_card").

### 3.4 Consent Flow

```
1. Worker opens consent manager in mobile app.
2. Selects what to share (checkboxes for scope groups).
3. Selects how to share:
   a. Specific hirer (search by name/phone).
   b. QR code (generates a time-limited share token).
   c. Link (generates a URL with embedded token).
4. Sets expiry (default: 30 days, options: 1 day, 7 days, 30 days, 90 days).
5. Confirms with biometric authentication (for Sensitive and Highly Sensitive scopes).
6. Consent grant created in database.
7. If QR/link: token generated, displayed to worker.
8. Worker can view active grants, remaining time, and view count in the consent manager.
9. Worker can revoke any grant at any time.
```

### 3.5 Consent Enforcement

Consent is checked at two layers:

**Layer 1: tRPC Middleware**
```
Before returning any worker data to a hirer:
  1. Identify the requesting hirer.
  2. Query consent_grants for an active grant (not expired, not revoked,
     view count < max_views) between the worker and this hirer.
  3. Check that the requested fields fall within the grant's scope.
  4. If no valid grant: return 403 with message "Consent not granted."
  5. If valid: increment view_count, log access to audit_log, return data.
```

**Layer 2: Row-Level Security (RLS)**
```sql
CREATE POLICY hirer_trust_card_access ON trust_cards
  FOR SELECT
  USING (
    -- Worker's own card
    auth.uid() = (SELECT user_id FROM worker_profiles WHERE id = worker_id)
    OR
    -- Public profile
    (SELECT is_profile_public FROM worker_profiles WHERE id = worker_id) = true
    OR
    -- Active consent grant exists
    EXISTS (
      SELECT 1 FROM consent_grants
      WHERE consent_grants.worker_id = trust_cards.worker_id
        AND consent_grants.granted_to = (
          SELECT id FROM hirer_profiles WHERE user_id = auth.uid()
        )
        AND consent_grants.revoked_at IS NULL
        AND consent_grants.expires_at > now()
        AND 'trust_card' = ANY(consent_grants.scope)
    )
  );
```

RLS serves as a safety net. Even if application logic has a bug, the database itself will not return data without proper consent.

## 4. Encryption Strategy

### 4.1 Encryption at Rest

**Database level:** Supabase Postgres uses AES-256 encryption for the entire database volume. This protects against physical disk theft but not against application-level data breaches.

**Field level:** Sensitive and Highly Sensitive fields are encrypted at the application layer before writing to Postgres. This means:
- A database dump reveals only ciphertext for PII fields.
- A Supabase admin cannot read PII without application-level keys.
- A SQL injection attack yields encrypted data, not plaintext.

**Implementation:**
- Algorithm: AES-256-GCM (authenticated encryption).
- Key source: Supabase Vault (secrets management).
- Encryption performed in Edge Functions (server-side, keys never reach client).
- Each field encrypted with a per-table Data Encryption Key (DEK), which is itself encrypted with a Master Key (envelope encryption).

### 4.2 Encryption in Transit

- All client-server communication over TLS 1.3 (enforced at Cloudflare and Vercel edge).
- Certificate pinning in the mobile app for API endpoints.
- Internal Supabase communication (between Postgres, Auth, Storage, Edge Functions) uses TLS within the VPC.

### 4.3 Encryption of Stored Files

- Evidence files (photos, documents) encrypted with per-file AES-256 keys before storage in Supabase Storage.
- File encryption keys stored in a separate table (`file_encryption_keys`) accessible only via `service_role`.
- Profile photos stored unencrypted in a public-read bucket (they are consent-gated at the application layer and voluntarily uploaded by the worker).

### 4.4 Key Rotation

| Key Type            | Rotation Period | Process                              |
|---------------------|-----------------|--------------------------------------|
| Master Key          | Annually        | Manual rotation, re-encrypt all DEKs.|
| Table DEKs          | Quarterly       | Automated batch re-encryption job.   |
| File Encryption Keys| Never           | Per-file, generated at upload time.  |
| JWT Signing Key     | Annually        | Coordinated with Supabase Auth.      |

## 5. Access Control

### 5.1 Role-Based Access

| Role               | Access Level                                                |
|--------------------|-------------------------------------------------------------|
| anonymous          | Public profiles only (display name, photo, tier).           |
| worker             | Own profile, own trust card, own incidents, own consent grants, own audit log entries. |
| hirer              | Workers' data within active consent scope. Own profile, own reports, own endorsements. |
| admin (reviewer)   | Incident queue, review actions, endorsement moderation.     |
| admin (compliance) | Disclosure requests, audit logs, data export.               |
| admin (super)      | All of the above, plus user management, system configuration.|

### 5.2 RLS Policy Summary

| Table              | Worker Access          | Hirer Access           | Admin Access |
|--------------------|------------------------|------------------------|--------------|
| users              | Own row                | None                   | All          |
| worker_profiles    | Own row                | Consent-scoped fields  | All          |
| hirer_profiles     | Related hirers only    | Own row                | All          |
| trust_cards        | Own card               | Consent-gated          | All          |
| verifications      | Own (status only)      | None                   | All          |
| incidents          | Own (limited fields)   | Own reports            | All          |
| incident_evidence  | None                   | Own uploads            | All          |
| appeals            | Own                    | None                   | All          |
| consent_grants     | Own                    | Grants to self         | All (read)   |
| endorsements       | Own (received)         | Own (given)            | All          |
| audit_log          | Own (as subject)       | None                   | All (read)   |
| disclosure_requests| None (notified only)   | None                   | Compliance   |
| admin_reviews      | None                   | None                   | Reviewers    |

### 5.3 API-Level Access Control

tRPC procedures are tagged with required roles:

```typescript
// Example: only workers can grant consent
grantConsent: protectedProcedure
  .meta({ requiredRole: 'worker' })
  .input(grantConsentSchema)
  .mutation(async ({ ctx, input }) => {
    // ctx.user guaranteed to be a worker
    // ...
  });

// Example: only compliance officers can process disclosures
processDisclosure: protectedProcedure
  .meta({ requiredRole: 'admin', adminRole: 'compliance_officer' })
  .input(processDisclosureSchema)
  .mutation(async ({ ctx, input }) => {
    // ...
  });
```

## 6. Data Retention Policy

| Data Category             | Retention Period           | Justification                          |
|---------------------------|----------------------------|----------------------------------------|
| Active user profiles      | Duration of account        | Needed for service delivery.           |
| Deleted user profiles     | 30 days post-deletion      | Grace period for account recovery.     |
| Verification records      | 7 years                    | Legal compliance (IT Act, DPDP Act).   |
| Incident records          | 7 years                    | Legal compliance, potential litigation. |
| Incident evidence         | 5 years post-resolution    | Legal compliance.                      |
| Appeals                   | 7 years                    | Legal compliance.                      |
| Consent grants            | 2 years after expiry       | Audit trail.                           |
| Endorsements              | Duration of both accounts  | Deleted with either party's account.   |
| Audit logs                | 7 years                    | DPDP Act compliance, legal discovery.  |
| Disclosure requests       | 10 years                   | Legal compliance.                      |
| Session tokens            | 30 days (refresh token)    | Security best practice.               |

### 6.1 Retention Enforcement

A scheduled Edge Function (`enforce-retention`) runs weekly:

1. Identifies records past their retention period.
2. For PII fields: overwrites with placeholder text, then deletes the encrypted value.
3. For evidence files: deletes from Supabase Storage and removes the file encryption key.
4. Logs all deletions to audit_log.
5. Non-PII metadata (timestamps, status flags) may be retained in anonymized form for aggregate analytics.

## 7. Right to Erasure

### 7.1 Worker-Initiated Erasure

Under the DPDP Act 2023 (Section 12), data principals (workers) have the right to erasure. Implementation:

```
1. Worker requests account deletion via mobile app or web.
2. System presents a summary: "This will delete your profile, trust card,
   and all associated data. Active incidents in review will be retained
   in anonymized form. This action cannot be undone after 30 days."
3. Worker confirms with biometric authentication.
4. Account status set to 'deleted', deleted_at timestamp recorded.
5. Immediate actions:
   - All active consent grants revoked.
   - Trust card removed from public/consent-gated access.
   - Profile removed from search results.
6. 30-day grace period: worker can log in and cancel deletion.
7. After 30 days, permanent erasure job runs:
   - PII fields overwritten with null/placeholder.
   - Encrypted field values deleted (original plaintext irrecoverable).
   - Profile photo deleted from Storage.
   - Identity documents deleted from Storage.
   - User row marked as permanently deleted.
8. Retained in anonymized form:
   - Incident records (with worker_id replaced by anonymized token).
   - Audit log entries (with actor_id replaced by anonymized token).
   - Aggregate statistics (total users, incident counts).
```

### 7.2 Erasure Exceptions

Erasure does not apply to:

- Data required to be retained by law (e.g., records subject to an active court order or law enforcement request).
- Data necessary for the establishment, exercise, or defense of legal claims (e.g., an active incident dispute).
- Anonymized data that cannot be linked back to the individual.

If an erasure request conflicts with a legal hold, the worker is notified that specific records cannot be deleted and given the reason (e.g., "Records related to an active legal proceeding cannot be deleted at this time").

## 8. Privacy by Design: Feature-Level Application

### 8.1 Worker Registration

- **Minimization:** Only phone number required to create an account. Name, photo, and other details are optional at registration.
- **Encryption:** Phone number encrypted immediately upon receipt, before database write.
- **No tracking:** No device fingerprinting, no analytics cookies, no third-party trackers in the registration flow.

### 8.2 Trust Card Viewing

- **Consent gate:** Every trust card view checks for valid consent or public profile status.
- **Audit trail:** Every view logged with viewer identity, timestamp, and fields accessed.
- **No caching of PII:** Trust card data is cached (Redis) but only the aggregated signals, never PII fields.
- **Rate limiting:** A hirer can view at most 50 trust cards per day (prevents bulk scraping).

### 8.3 Incident Reporting

- **Reporter identity protection:** Workers do not see who reported the incident (prevents retaliation).
- **Worker notification:** Workers are notified that an incident was reported but see only type and severity, not the description.
- **Evidence isolation:** Evidence files are in an encrypted, non-public Storage bucket. Only the reporter and admins can access them.
- **Description encryption:** Incident descriptions are field-level encrypted.

### 8.4 Endorsements

- **Anonymity option:** Hirers can choose to endorse anonymously (their identity is not revealed to the worker or other hirers).
- **No negative endorsements:** The system does not support negative endorsements or ratings. Negative signals come only through the incident process, which has due process protections.

### 8.5 Search

- **No browsing:** Hirers cannot browse a list of workers. They can only search by phone number (requires the worker to have shared it) or scan a QR code (requires the worker to present it).
- **No reverse lookup:** Given a trust card, a hirer cannot discover the worker's phone number or address without explicit consent.

## 9. Compliance with Indian Data Protection Law

### 9.1 DPDP Act 2023 Alignment

| DPDP Requirement                    | Verify Me Implementation                          |
|-------------------------------------|----------------------------------------------------|
| Lawful purpose (Section 4)          | Processing limited to trust card service delivery. |
| Consent (Section 6)                 | Granular, informed, time-limited consent model.    |
| Data Principal rights (Section 11-14)| Erasure, correction, grievance redressal implemented.|
| Data minimization                   | Only necessary fields collected.                   |
| Storage limitation                  | Retention periods defined and enforced.            |
| Data breach notification (Section 8)| Incident response plan with 72-hour notification.  |
| Cross-border transfer (Section 16)  | All data stored in India (Mumbai region).          |
| Children's data (Section 9)         | Platform restricted to 18+, age verification at registration. |

### 9.2 IT Act 2000 and Rules

- Reasonable security practices per Section 43A and the IT (Reasonable Security Practices) Rules 2011.
- Sensitive Personal Data (Aadhaar, biometrics) handled per the SPDI Rules.
- Body corporate obligations for data protection.

### 9.3 Aadhaar Act 2016

- Aadhaar number stored only in encrypted form.
- Aadhaar data used solely for identity verification, not shared with hirers.
- Compliance with UIDAI guidelines for e-KYC integration.
- Aadhaar number never displayed in full; only last 4 digits shown to the worker in their own profile.

## 10. Privacy Incident Response

### 10.1 Data Breach Response Plan

1. **Detection:** Automated alerts for unusual data access patterns (e.g., bulk PII decryption, admin accessing many worker profiles in short time).
2. **Containment:** Immediate revocation of compromised credentials, API key rotation, affected account lockout.
3. **Assessment:** Determine scope -- which data subjects affected, what data exposed, how breach occurred.
4. **Notification:**
   - CERT-In within 6 hours (per Indian cybersecurity directive).
   - Affected data principals within 72 hours (DPDP Act Section 8).
   - Notification includes: what happened, what data was affected, what remedial steps are being taken.
5. **Remediation:** Root cause analysis, fix deployed, post-incident review, policy updates.
6. **Documentation:** Full incident report retained for 7 years.
