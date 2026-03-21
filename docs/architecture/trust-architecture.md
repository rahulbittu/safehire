# Trust Scoring and Card Architecture

## 1. Design Philosophy

The trust card is the central artifact of Verify Me. It is designed to answer a hirer's question -- "Can I trust this worker?" -- while respecting the worker's dignity and privacy. The trust card is not a score. It is a structured set of verifiable signals that allow hirers to make informed decisions without accessing raw personal data.

Key principles:

- **Transparency over opacity.** Every signal on the trust card is computed by deterministic rules that the worker can understand. There is no ML-based scoring, no "black box" algorithm that cannot be explained.
- **Aggregation over exposure.** Hirers see summarized signals ("2 substantiated incidents, highest severity: medium") rather than raw incident descriptions.
- **Worker ownership.** The trust card belongs to the worker. The worker controls who sees it and when, through consent grants.
- **Auditability.** Every trust card computation is versioned and reproducible. Given the same input data, the same card is produced.

## 2. Trust Card Contents

A trust card presented to a hirer contains the following fields:

| Field                 | Example Value           | Source                                |
|-----------------------|-------------------------|---------------------------------------|
| Display Name          | "Lakshmi R."            | worker_profiles.display_name          |
| Profile Photo         | (thumbnail)             | worker_profiles.photo_url             |
| Verification Tier     | "Basic Verified"        | Computed from verifications table     |
| Identity Verified     | Yes / No                | verifications (aadhaar_ekyc status)   |
| Platform Tenure       | "2 years, 3 months"     | Computed from platform_join_date      |
| Work Categories       | "Domestic Worker, Cook"  | worker_profiles.work_categories       |
| Endorsement Count     | 7                       | Count from endorsements table         |
| Incident Flag         | "Clean" or "Flagged"    | Computed from incidents table         |
| Incident Summary      | "1 low-severity"        | Aggregated count + max severity       |
| Last Updated          | "15 Mar 2026"           | trust_cards.last_computed_at          |

**What the trust card does NOT contain:**

- Raw incident descriptions or details.
- Names of hirers who reported incidents.
- Names of hirers who endorsed the worker.
- Aadhaar number, phone number, or address.
- Exact dates of incidents.
- Background check report contents.
- Work history details (unless the worker grants consent for that specific field).

## 3. Trust Signal Components

### 3.1 Identity Verification Signal

| Signal Value        | Criteria                                                |
|---------------------|---------------------------------------------------------|
| Not Verified        | No verification attempted.                              |
| Verification Pending| Aadhaar e-KYC initiated but not completed.              |
| Identity Verified   | Aadhaar e-KYC completed successfully, name and photo match. |

This is a binary signal. It does not convey how the verification was done or what documents were provided, only whether identity has been confirmed.

### 3.2 Background Check Signal

| Signal Value     | Criteria                                                   |
|------------------|------------------------------------------------------------|
| Not Started      | Worker has not opted into background check.                |
| Pending          | Background check initiated with provider, awaiting result. |
| Clear            | No adverse findings.                                       |
| Flagged          | Adverse findings exist. No details disclosed on card.      |

Background checks are optional and require explicit worker consent. A "Not Started" status carries no negative implication and the platform UI does not frame it negatively.

### 3.3 Platform Tenure Signal

Computed as the difference between `current_date` and `worker_profiles.platform_join_date`.

| Tenure Display     | Criteria                    |
|--------------------|-----------------------------|
| "New to platform"  | Less than 3 months.         |
| "X months"         | 3 to 11 months.             |
| "1 year"           | 12 to 23 months.            |
| "X years"          | 24+ months, rounded down.   |

Tenure is a weak trust signal on its own but provides context for other signals. A worker with 3 years on the platform and zero incidents carries more weight than a worker with 3 months and zero incidents.

### 3.4 Endorsement Signal

| Signal Display       | Criteria                               |
|----------------------|----------------------------------------|
| No endorsements      | 0 active endorsements.                 |
| "X endorsements"     | Count of active, non-moderated endorsements. |

Endorsement text is not shown on the trust card. Only the count is displayed. This prevents gaming through fabricated endorsement text while still reflecting that real hirers have vouched for the worker.

### 3.5 Incident Signal

| Signal Display           | Criteria                                           |
|--------------------------|----------------------------------------------------|
| "Clean record"           | Zero substantiated incidents.                      |
| "Flagged: X low"         | X substantiated incidents, all low severity.       |
| "Flagged: X medium"      | At least one medium-severity substantiated incident.|
| "Flagged: X high"        | At least one high-severity substantiated incident.  |
| "Flagged: critical"      | At least one critical-severity substantiated incident.|

Rules:
- Only substantiated incidents are counted. Unsubstantiated and inconclusive incidents have zero impact on the trust card.
- Incidents under appeal are excluded from the count until the appeal is resolved.
- The display shows the total count and the highest severity level, not individual incident details.
- Incidents that have been successfully appealed (overturned) are removed from the count.

## 4. Trust Card Tiers

Tiers determine the overall verification level displayed on the card.

### Tier: Unverified

**Criteria:** Worker has registered on the platform but completed no verifications.

**Card appearance:** Minimal card with display name, photo (if uploaded), platform tenure, and work categories. A clear label: "Unverified Profile."

**What hirers see:** Enough to identify the worker but no trust signals beyond tenure.

### Tier: Basic Verified

**Criteria:** Worker has completed identity verification (Aadhaar e-KYC successful).

**Card appearance:** Full card with identity verification badge, tenure, endorsement count, and incident signal.

**What hirers see:** Confidence that the person is who they claim to be.

### Tier: Enhanced Verified

**Criteria:** All of the following:
- Identity verification completed.
- Background check status is "Clear."
- At least 6 months of platform tenure.
- At least 2 endorsements from verified hirers.

**Card appearance:** Full card with "Enhanced Verified" badge, all signals visible.

**What hirers see:** Strongest available trust signal. The worker has been identity-verified, background-checked, has meaningful platform history, and has been endorsed by multiple hirers.

### Tier Downgrade Rules

- If a background check expires (validity period: 1 year) and is not renewed, the worker drops from Enhanced to Basic.
- If a critical-severity incident is substantiated, Enhanced tier is suspended pending review, regardless of other signals.
- If identity verification is revoked (e.g., Aadhaar found to be fraudulent), the worker drops to Unverified and the account is flagged for admin review.

## 5. Trust Card Computation

### 5.1 Computation Trigger Events

The trust card is recomputed when any of the following occur:

1. A verification status changes (completed, expired, revoked).
2. An incident is resolved (substantiated, unsubstantiated, inconclusive).
3. An appeal is resolved (upheld, overturned, partially overturned).
4. An endorsement is created or moderated.
5. A scheduled daily refresh runs (catches tenure changes, verification expirations).

### 5.2 Computation Algorithm

The computation runs in the `compute-trust-card` Edge Function with `service_role` access.

```
FUNCTION compute_trust_card(worker_id):

  1. Fetch worker_profile (platform_join_date, work_categories)
  2. Fetch all verifications for worker
     - identity_verified = any aadhaar_ekyc with status 'verified' and not expired
     - background_check_status = latest police_clearance status
  3. Fetch all incidents for worker
     - substantiated_incidents = incidents WHERE status = 'substantiated'
                                 AND NOT EXISTS (appeal WHERE status = 'overturned')
     - open_incidents = incidents WHERE status IN ('pending_review', 'under_investigation')
     - total_count = count(substantiated_incidents)
     - highest_severity = max(severity) of substantiated_incidents
     - incident_flag = total_count > 0
  4. Fetch endorsement count
     - endorsement_count = count(endorsements WHERE is_active = true)
  5. Compute tenure
     - tenure_months = date_diff(months, platform_join_date, current_date)
  6. Compute verification tier
     - IF identity_verified AND background_check = 'clear'
          AND tenure_months >= 6 AND endorsement_count >= 2:
       -> 'enhanced_verified'
     - ELIF identity_verified:
       -> 'basic_verified'
     - ELSE:
       -> 'unverified'
  7. Check for tier suspension
     - IF highest_severity = 'critical' AND verification_tier = 'enhanced_verified':
       -> verification_tier = 'basic_verified' (suspended)
  8. UPSERT trust_cards row with computed values
  9. Log computation to audit_log

  RETURN trust_card
```

### 5.3 Computation Versioning

Every trust card row includes a `computation_version` integer. When the computation algorithm changes (e.g., adding a new signal, changing tier thresholds), the version is incremented. This allows:

- Auditing: "This card was computed under rules version 3."
- Gradual rollout: Recompute cards in batches after a rule change.
- Debugging: Reproduce historical card states by replaying with the correct version.

## 6. Decay and Refresh Rules

### 6.1 Verification Expiry

| Verification Type    | Validity Period | On Expiry                          |
|----------------------|-----------------|------------------------------------|
| Aadhaar e-KYC        | No expiry       | Valid indefinitely once verified.  |
| Police Clearance     | 12 months       | Status changes to 'expired', tier may downgrade. |
| Address Proof        | 24 months       | Status changes to 'expired'.       |
| Reference Check      | No expiry       | Valid indefinitely.                |

### 6.2 Incident Decay

Incidents do not "decay" or disappear from the record. However, their weight in the trust card display follows these rules:

- Incidents older than 24 months are displayed with reduced prominence: "1 low-severity incident (>2 years ago)."
- Incidents older than 60 months (5 years) are archived and excluded from the trust card count, though they remain in the database for legal compliance.
- The decay period resets if a new incident of the same type is substantiated.

### 6.3 Endorsement Freshness

- Endorsements do not expire, but the trust card displays "X endorsements (Y in last 12 months)" to indicate recency.
- If an endorsing hirer's account is suspended or banned, their endorsements are deactivated.

### 6.4 Daily Refresh

A scheduled Edge Function runs daily at 02:00 IST:

1. Identifies trust cards where `last_computed_at` is older than 24 hours.
2. Checks for expired verifications.
3. Recomputes affected cards.
4. Logs refresh to audit_log.

## 7. Privacy Constraints on Trust Display

### 7.1 What Hirers See

The trust card is designed so that no hirer can reconstruct the underlying raw data:

- **Incident details are never shown.** A hirer sees "Flagged: 1 medium-severity incident" but cannot learn what the incident was, who reported it, or when it occurred (beyond the decay window indicator).
- **Endorser identities are hidden.** A hirer sees "7 endorsements" but cannot learn which hirers endorsed the worker. This prevents social pressure and collusion.
- **Verification method is hidden.** A hirer sees "Identity Verified" but not whether the worker used Aadhaar, PAN, or another document.

### 7.2 What Workers See

Workers see their own trust card with additional detail:

- Their verification status and expiry dates.
- List of incidents (type, severity, status, appeal option).
- List of endorsements (endorser display name, date).
- Consent grants: who has access to their card and until when.
- Audit trail: who viewed their card and when.

### 7.3 What Admins See

Admins see full detail for operational purposes:

- All raw incident data, evidence, and descriptions.
- All verification records and provider responses.
- Endorsement text (for moderation).
- Trust card computation inputs and outputs.
- All access is logged to audit_log.

## 8. Appeal Impact on Trust Signals

When a worker appeals a substantiated incident:

1. The incident status changes to `appealed`.
2. The incident is temporarily excluded from the trust card computation while the appeal is pending.
3. The trust card is recomputed without the appealed incident.
4. If the appeal is:
   - **Upheld** (original decision stands): Incident is re-included in the trust card.
   - **Overturned**: Incident is permanently excluded from the trust card. The incident record remains in the database with status `appeal_resolved` but has no trust card impact.
   - **Partially overturned**: Severity may be adjusted (e.g., from "high" to "low"). The incident remains on the trust card with updated severity.

This approach ensures that workers are not penalized by unresolved disputes while preserving the integrity of substantiated findings.

## 9. Anti-Gaming Measures

### 9.1 Endorsement Gaming

- A hirer can endorse a worker at most once per work category.
- Endorsements from newly created hirer accounts (less than 30 days old) do not count toward the endorsement signal until the account matures.
- Bulk endorsement patterns (same hirer endorsing more than 5 workers in 24 hours) trigger admin review.
- Self-endorsement is technically impossible (different user types) but mutual endorsement rings are monitored.

### 9.2 Incident Abuse

- A hirer filing more than 3 incidents in 30 days triggers admin review of the hirer's account.
- Incidents from hirers whose accounts are later suspended or banned are reviewed and may be voided.
- Workers cannot see which hirer filed a report, preventing targeted retaliation.

### 9.3 Identity Fraud

- Aadhaar e-KYC includes liveness check (photo match) to prevent impersonation.
- Duplicate Aadhaar detection: if the same Aadhaar is linked to multiple accounts, all are flagged for review.
- Phone number changes require re-verification.

## 10. Future Considerations

- **Portable trust:** Allow workers to export their trust card as a verifiable credential (W3C Verifiable Credentials standard) for use outside the platform.
- **Sector-specific signals:** Different work categories may benefit from different trust signals (e.g., a driver might have a driving license verification signal that a cook would not).
- **Community-level trust:** Apartment communities may want to see aggregate trust data for workers employed across their community, without exposing individual hirer interactions.
- **Trust card versioning for workers:** Allow workers to see how their card has changed over time, reinforcing that good behavior improves their standing.
