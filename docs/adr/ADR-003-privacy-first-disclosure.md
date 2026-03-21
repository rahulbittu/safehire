# ADR-003: Privacy-First Disclosure Model

## Status

Accepted

## Date

2026-03-21

## Context

Verify Me operates at the intersection of two legitimate but conflicting interests:

1. **Hirer safety.** Hirers invite workers into their homes, offices, and personal spaces. They have a legitimate interest in knowing whether a prospective worker has a history of serious incidents. Withholding all information makes the platform useless to hirers and undermines trust.

2. **Worker privacy and dignity.** Workers -- particularly domestic and gig workers in India -- are vulnerable to discrimination, blacklisting, and exploitation. Exposing detailed incident histories, personal data, or subjective assessments can cause disproportionate harm to workers, especially when incidents are minor, disputed, or resolved in the worker's favor.

Indian law provides the framework but not the full answer. The Digital Personal Data Protection Act (DPDPA) requires lawful basis for data processing, purpose limitation, and data minimization. The platform must go beyond bare legal compliance to embody privacy as a design principle, not a constraint.

The disclosure model must answer these questions:

- What does a hirer see by default, without any special permission?
- Under what conditions can a hirer see more detailed information?
- Who controls the flow of information -- the platform, the hirer, or the worker?
- How does the platform handle cases where public safety concerns override individual privacy (e.g., serious criminal incidents)?
- How are disclosure decisions logged and auditable?

## Decision

### Principle: Default Minimum Disclosure

The platform operates on a principle of minimum necessary disclosure. The default state is that hirers see the least amount of information needed to make a hiring decision. More detailed disclosure requires explicit action and, in most cases, worker consent.

### Disclosure Tiers

The platform defines three disclosure tiers, each with progressively more information and progressively higher authorization requirements:

**Tier 1: Trust Card (Default)**

Available to any verified hirer viewing a worker's profile (subject to the worker having an active, public profile). Contains only the aggregated signals defined in ADR-002: verification tier, tenure, endorsement count, incident flag with maximum severity. No raw data, no details, no identifiable information beyond the worker's display name.

No consent grant is required for Tier 1 disclosure. By creating a profile on the platform, a worker implicitly consents to trust card visibility. Workers can deactivate their profile to remove trust card visibility entirely.

**Tier 2: Detailed Disclosure (Worker Consent Required)**

Available only when a worker explicitly grants consent to a specific hirer. Contains additional information beyond the trust card:

- Incident summaries: category (e.g., "property damage", "no-show", "misconduct"), severity, date range (month/year, not exact date), and resolution status. NOT full incident narratives or complainant identities.
- Endorsement summaries: endorsement text (if the endorser consented to text visibility), endorser's verified status, and approximate date.
- Employment tenure summaries: duration and category of previous engagements (e.g., "domestic help, 1+ year"), without employer names or contact details.

Tier 2 disclosure is controlled entirely by the worker through consent grants.

**Tier 3: Lawful Disclosure (Platform-Initiated)**

Available only under specific, enumerated circumstances where the platform determines that withholding information would create an unacceptable safety risk or violate legal obligations. Contains:

- Full incident reports for Critical-severity substantiated incidents.
- Verification status details relevant to the safety concern.
- Any information required by a valid legal order (court order, law enforcement request under applicable law).

Tier 3 disclosure does not require worker consent. It is initiated by the platform's Trust and Safety team following a documented review process. The worker is notified that a Tier 3 disclosure has occurred (unless notification would compromise a law enforcement investigation, as determined by legal counsel).

### Consent Grant System

Worker consent for Tier 2 disclosure is managed through a formal consent grant system:

**Grant creation.** A worker creates a consent grant specifying:
- The hirer (identified by their verified platform account).
- The data scope: which Tier 2 data categories are shared (incident summaries, endorsement summaries, employment summaries). Workers can share selectively.
- The expiry: consent grants expire automatically. Default expiry is 30 days. Workers can set shorter periods (minimum 24 hours) or longer periods (maximum 180 days).
- The purpose: a free-text field where the worker can note why they are sharing (e.g., "job application for cook position"). This is informational and logged for audit purposes.

**Grant delivery.** Consent grants are delivered to hirers via:
- QR code displayed on the worker's mobile app, scanned by the hirer.
- Share link sent via WhatsApp, SMS, or other messaging platform.
- In-platform share if the hirer has an active platform account.

Each consent grant generates a unique, unguessable token. The token is required to access Tier 2 data. The token cannot be transferred -- it is bound to the specific hirer account that redeems it.

**Grant revocation.** Workers can revoke a consent grant at any time. Revocation is immediate: the hirer loses access to Tier 2 data within 60 seconds (cache invalidation). Revocation is logged with a timestamp. The hirer is not notified of revocation (to prevent coercion scenarios where a hirer pressures a worker to maintain consent).

**Grant audit trail.** Every consent grant creation, redemption, expiry, and revocation is logged in an immutable audit table. The audit trail records:
- Worker ID, hirer ID, grant token (hashed), data scope, purpose.
- Timestamps for creation, first access, each subsequent access, expiry, or revocation.
- The trust card version and disclosure tier data served for each access.

Workers can view their complete consent history in the mobile app. This transparency is essential for worker trust in the platform.

### Lawful Disclosure Criteria and Process

Tier 3 (lawful disclosure) is triggered only under these conditions:

1. **Critical safety incidents.** A worker has a substantiated Critical-severity incident (e.g., assault, theft of significant value, credible threat of violence) and a new hirer is about to engage them in a role with safety implications (e.g., domestic work, childcare, eldercare). The platform's Trust and Safety team may proactively flag the trust card with a "safety notice" indicator that prompts the hirer to contact the platform for more information, without automatically disclosing details.

2. **Legal obligation.** A valid court order, law enforcement request under Section 79 of the IT Act, or DPDPA-authorized regulatory request compels disclosure of specific data. The platform's legal counsel must validate the request before any data is released.

3. **Imminent harm.** The platform has credible information that a worker poses an imminent threat to a specific hirer's safety. This is an extraordinary measure requiring sign-off from two members of the Trust and Safety team and the Head of Product or a designated executive.

In all Tier 3 cases:
- The decision is documented with the legal basis, the approving individuals, and the data disclosed.
- The worker is notified (unless legally prohibited) within 72 hours of the disclosure.
- The disclosure is logged in the audit trail with a "lawful disclosure" flag.
- A review of the disclosure decision is conducted within 30 days to assess whether it was appropriate and whether the process should be refined.

### Data Retention After Disclosure

Data accessed by a hirer through any disclosure tier is not "given" to the hirer. The hirer views the data through the platform interface. The platform does not provide downloadable exports of worker data. Screen capture and manual copying cannot be prevented technically, but the terms of service prohibit hirers from storing, sharing, or using disclosed data beyond the stated purpose. Violation of these terms results in account suspension.

### Worker Control Dashboard

Workers have a dedicated section in the mobile app for managing their disclosure posture:

- **Active consent grants.** List of all current grants with hirer name, scope, expiry, and access count.
- **Revoke button.** One-tap revocation for any active grant.
- **Consent history.** Full history of past grants, including expired and revoked grants.
- **Lawful disclosure log.** Any Tier 3 disclosures, with the date and stated legal basis.
- **Profile visibility toggle.** Deactivate profile to remove trust card from platform search results.
- **Data download.** DPDPA-mandated right to access: workers can download a copy of all data the platform holds about them.

## Alternatives Considered

### Full Transparency Model (rejected)

Some platforms adopt a model where all information is visible to all parties. This was rejected because:

- It disproportionately harms workers. A single disputed incident, even one resolved in the worker's favor, could follow them indefinitely and prevent them from finding work.
- It does not comply with DPDPA data minimization requirements.
- It discourages workers from joining the platform, undermining the network effects that make the platform valuable to hirers.

### Platform-Controlled Disclosure (rejected)

A model where the platform decides what to show each hirer, without worker input, was considered. This was rejected because:

- It removes worker agency. Workers should control their own data, consistent with DPDPA principles and the platform's values.
- It creates a paternalistic dynamic where the platform acts as gatekeeper of workers' reputations.
- It increases the platform's liability: if the platform decides to disclose (or not disclose) something, the platform bears responsibility for that decision.
- Worker consent grants shift the disclosure decision to the party with the most relevant context (the worker knows the hirer, the job, and their own history).

### Permanent Consent (rejected)

A model where workers grant permanent, irrevocable consent to hirers was considered for simplicity. Rejected because:

- It violates DPDPA's requirement that consent be withdrawable.
- It creates power imbalances where hirers accumulate permanent access to worker data.
- Workers' circumstances change: a resolved incident becomes less relevant over time, and consent should reflect that.
- Expiring consent grants with renewal encourage ongoing, active consent rather than "set and forget" authorization.

### Automated Tier 3 Disclosure (rejected)

Automatically disclosing Critical-severity incidents to all hirers without human review was considered. Rejected because:

- It removes the human judgment necessary for weighing privacy against safety in individual cases.
- It could be gamed: a false Critical-severity report by a malicious hirer would trigger automatic disclosure before the incident is substantiated.
- Legal counsel review is essential for Tier 3 disclosures to manage the platform's regulatory exposure.
- The current model (safety notice flag + hirer inquiry + Trust and Safety review) provides a human-in-the-loop safeguard.

## Consequences

### Positive

- **Worker dignity and agency.** Workers control their data. They decide who sees what, for how long, and for what purpose. This is a differentiator in a market where workers are accustomed to having no control over their reputations.
- **DPDPA alignment.** The consent grant system directly implements DPDPA requirements for purpose limitation, consent management, and data subject rights.
- **Reduced platform liability.** By defaulting to minimum disclosure and requiring worker consent or documented legal basis for detailed disclosure, the platform reduces its exposure to claims of unauthorized data sharing.
- **Auditability.** The comprehensive audit trail provides evidence of compliance for regulators, legal proceedings, and internal reviews.
- **Trust building.** Workers who trust the platform with their data will contribute more data (endorsements, verification), creating a virtuous cycle that makes the platform more valuable to hirers.

### Negative

- **Less information for hirers by default.** Hirers may find the trust card insufficient for high-stakes hiring decisions (e.g., live-in domestic worker, childcare). Mitigation: hirers can request Tier 2 disclosure by asking the worker to share, and the platform provides guidance on what questions to ask during interviews.
- **Consent management complexity.** The consent grant system requires robust engineering: token generation, expiry management, real-time revocation, cache invalidation, and audit logging. This is significant implementation effort. Mitigation: consent management is a core product feature, not an afterthought, and is prioritized accordingly.
- **Potential for consent pressure.** Hirers may refuse to hire workers who decline to share Tier 2 data, effectively making "voluntary" consent compulsory. Mitigation: the platform monitors consent patterns and may intervene if systematic coercion is detected. The trust card (Tier 1) is designed to be sufficient for most hiring decisions.
- **Lawful disclosure tension.** Tier 3 disclosure without worker consent is inherently in tension with the platform's privacy-first values. The enumerated criteria and human review process mitigate abuse, but the possibility remains that a Tier 3 disclosure is later judged to have been unnecessary. Mitigation: 30-day retrospective review of all Tier 3 disclosures.
- **Worker education burden.** Workers must understand the consent system to use it effectively. Many target users have limited digital literacy. Mitigation: in-app consent flows are designed for simplicity (one-tap share, one-tap revoke), with visual indicators rather than text-heavy interfaces. Multilingual support in 8+ Indian languages.
