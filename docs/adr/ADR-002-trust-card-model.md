# ADR-002: Trust Card Model

## Status

Accepted

## Date

2026-03-21

## Context

Verify Me exists to help hirers make informed decisions about workers while protecting worker privacy and dignity. The core product artifact is the "trust card" -- a summary of a worker's trustworthiness that a hirer can view when considering a hire.

The fundamental tension is this: hirers want as much information as possible to reduce their risk, but workers deserve privacy, and raw data exposure creates opportunities for discrimination, blacklisting, and abuse. Indian domestic and gig workers are already vulnerable to power imbalances; a trust platform must not amplify those imbalances by giving hirers unconstrained access to incident histories, personal details, or subjective assessments.

Several design questions must be resolved:

1. **What does a trust card contain?** Raw data (full incident reports, verification documents, employment history) or aggregated signals (verification tier, tenure summary, endorsement count)?
2. **How are trust signals computed?** Machine learning scoring (opaque, potentially biased) or deterministic rule-based computation (transparent, auditable)?
3. **How is the trust card stored and updated?** Pre-computed and cached, or generated on every request?
4. **What incident information is shown?** Full incident details, summaries, or only the existence and severity of incidents?

## Decision

### Trust Card as a Computed View

The trust card is a computed view over underlying data, not a stored copy of raw data. When a hirer views a trust card, the system computes the card from current data (verification records, employment history, endorsements, incident records) and returns the aggregated result. The hirer never receives raw underlying records through the trust card endpoint.

The trust card contains exactly these fields:

- **Verification tier.** One of: Unverified, Basic (phone verified), Standard (phone + ID verified), Enhanced (phone + ID + address verified). The tier reflects completed verification steps without exposing which specific documents were used.
- **Platform tenure.** Duration since the worker's account was created, displayed as a rounded period (e.g., "2+ years", "6+ months"). Not the exact registration date.
- **Endorsement count.** The number of positive endorsements from verified hirers. Displayed as a count, not individual endorsement text.
- **Endorsement recency.** Whether at least one endorsement was received in the last 90 days. A boolean signal, not a date.
- **Incident flag.** A boolean indicating whether the worker has any resolved or substantiated incidents on record. This is a yes/no signal.
- **Incident severity (if flagged).** If the incident flag is true, the maximum severity level among substantiated incidents: Low, Medium, High, or Critical. Only the highest severity is shown, not the count or nature of incidents.
- **Trust card generation timestamp.** When this card was computed, so the hirer knows how current the information is.

The trust card explicitly does NOT contain:

- Incident details, descriptions, categories, or dates.
- Endorsement text or endorser identities.
- Specific verification document types or numbers.
- Employment history or employer names.
- Worker's address, age, gender, caste, religion, or any demographic information.
- Any ML-derived "score" or numeric rating.

### Deterministic Rule-Based Computation

Trust signals are computed using deterministic rules, not machine learning models. The rules are:

**Verification tier** is determined by the set of completed verification steps:
- Unverified: account exists but phone not verified.
- Basic: phone OTP verified.
- Standard: phone verified AND at least one government ID verified via DigiLocker or manual review.
- Enhanced: phone verified AND government ID verified AND address verified (via utility bill, bank statement, or address proof document).

**Endorsement count** is a simple count of endorsements from hirers whose own accounts are verified (Basic tier or above). Endorsements from unverified hirers are excluded from the count.

**Incident flag** is set to true if there exists at least one incident record associated with the worker where the incident status is "Substantiated" or "Resolved-Against-Worker". Incidents that are "Unsubstantiated", "Resolved-In-Favor", "Withdrawn", or "Under-Review" do not set the flag.

**Incident severity** is the maximum severity among flagged incidents, using the ordering: Low < Medium < High < Critical.

These rules are codified in the trust card computation function, version-controlled, and documented. Any change to the rules requires a new ADR and a platform-wide notification to workers whose trust cards would be affected.

### Caching Strategy

Trust cards are cached for performance but invalidated on relevant events:

- **Cache key:** worker ID + current consent scope (different hirers may see different scopes in future iterations).
- **Cache TTL:** 15 minutes for active sessions, 1 hour for inactive.
- **Invalidation triggers:** New endorsement received, endorsement revoked, incident status changed, verification step completed, verification revoked.
- **Cache layer:** Supabase Edge Function computes the card; result cached in-memory (per-edge-node) and in a dedicated `trust_card_cache` table with a `computed_at` timestamp.
- **Stale-while-revalidate:** If a cached card is within TTL, serve it immediately. If TTL has expired, serve the stale card while asynchronously recomputing. The hirer sees the `computed_at` timestamp and can request a fresh computation.

### Trust Card Versioning

The trust card schema is versioned (currently v1). The version is included in the trust card response. This allows:

- Clients to handle schema evolution gracefully.
- Audit logs to record which version of the trust card was viewed.
- Future iterations to add fields without breaking existing clients.

## Alternatives Considered

### Raw Data Exposure (rejected)

Showing hirers full incident reports, endorsement text, and verification details was considered. This approach maximizes hirer information but:

- Violates the principle of minimum disclosure (see ADR-003).
- Enables discrimination based on incident details (e.g., a hirer might reject a worker for a minor, resolved dispute that is irrelevant to the current job).
- Creates liability for the platform if disclosed information is inaccurate or taken out of context.
- Makes workers reluctant to join the platform, undermining network effects.

### ML-Based Trust Scoring (rejected)

A machine learning model that produces a numeric "trust score" (e.g., 0-100 or 1-5 stars) was considered. This approach:

- Is opaque. Workers cannot understand why their score is what it is, and cannot take concrete steps to improve it.
- Is potentially biased. ML models trained on historical data may encode existing biases against certain demographics, regions, or types of work.
- Is not auditable. Regulators, workers, or legal advocates cannot inspect a neural network's weights to determine whether a specific score is justified.
- Creates a false sense of precision. A "trust score of 73" implies a granularity that the underlying data does not support.
- Raises legal concerns under DPDPA's provisions around automated decision-making and the right to explanation.

Deterministic rules are chosen because they are transparent (the rules are published), auditable (any trust card can be recomputed from source data and verified), explainable (a worker can see exactly which factors contribute to their card), and modifiable (rules can be updated through a documented change process with impact analysis).

### Numeric Rating System (rejected)

A simpler alternative to ML: a weighted formula that combines verification status, endorsement count, and incident history into a single number. Rejected because:

- Collapsing multiple dimensions into one number loses important nuance. A worker with Enhanced verification, many endorsements, and one minor incident is qualitatively different from a worker with Basic verification, no endorsements, and no incidents -- but both might receive a similar numeric score.
- Numeric scores invite comparison and ranking, which conflicts with the platform's goal of enabling individual hiring decisions rather than creating a leaderboard of workers.
- Weight selection is inherently subjective and contentious.

### Pre-Computed Materialized View (rejected as sole strategy)

Maintaining a materialized view in PostgreSQL that is always current was considered. Rejected as the sole strategy because:

- Materialized view refreshes are expensive for large datasets and would run on every relevant event.
- The cache-with-invalidation approach achieves near-real-time freshness with better performance characteristics.
- However, a materialized view may be introduced later for analytics and batch processing, separate from the real-time trust card serving path.

## Consequences

### Positive

- **Worker dignity preserved.** Hirers receive enough information to make informed decisions without seeing details that could enable discrimination or harassment.
- **Transparency.** Workers can understand exactly what their trust card shows and why. No "black box" scoring.
- **Auditability.** Every trust card computation can be verified by replaying the rules against source data. This is essential for dispute resolution and regulatory compliance.
- **Simplicity.** Deterministic rules are easier to implement, test, debug, and explain than ML models. This matters for a small team.
- **Defensibility.** If a worker disputes their trust card, the platform can point to specific, documented rules and the specific data that triggered each signal. This is a stronger legal position than "the model said so."

### Negative

- **Less information for hirers.** Hirers may feel the trust card is too abstract. They may want to know what kind of incident occurred, not just that one exists. This is a deliberate trade-off in favor of worker privacy. Hirers who need more detail can request it through the consent-based disclosure process (ADR-003).
- **Less "intelligent" than ML.** Deterministic rules cannot capture subtle patterns that ML might detect. For example, a cluster of minor incidents over a short period might be more concerning than a single Medium incident, but the current rules do not model temporal patterns. This can be addressed by refining rules over time.
- **Cache complexity.** The invalidation-on-event strategy requires careful tracking of which events affect which trust cards. A missed invalidation trigger could cause stale data to be served. Mitigation: integration tests that verify cache invalidation for every event type.
- **Rule change management.** Changing the trust card rules affects all workers on the platform. Each change requires impact analysis, worker notification, and potentially a grace period. This process overhead is the cost of transparency.
