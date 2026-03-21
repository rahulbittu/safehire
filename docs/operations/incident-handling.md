# Incident Handling Workflow

## 1. Incident Types

| Type               | Code             | Description                                                     | Default Severity |
|--------------------|------------------|-----------------------------------------------------------------|------------------|
| Theft              | `theft`          | Alleged stealing of money, valuables, or property.              | High             |
| Misconduct         | `misconduct`     | Unprofessional behavior, breach of trust, dishonesty.           | Medium           |
| Property Damage    | `property_damage`| Intentional or negligent damage to employer's property.         | Medium           |
| Harassment         | `harassment`     | Verbal abuse, intimidation, threatening behavior, sexual harassment. | High         |
| Safety Concern     | `safety_concern` | Behavior posing risk to persons or property (e.g., substance abuse on duty, leaving children unattended). | High |
| Other              | `other`          | Incidents not fitting the above categories.                     | Low              |

## 2. Severity Classification

| Severity  | Criteria                                                                              | SLA for First Review | Trust Card Impact |
|-----------|---------------------------------------------------------------------------------------|----------------------|-------------------|
| Low       | Minor issue, no financial loss or safety risk. E.g., repeated tardiness, minor negligence. | 72 hours           | Flagged after 3+ low incidents |
| Medium    | Moderate issue with some financial loss or disruption. E.g., small property damage, unprofessional conduct. | 48 hours | Flagged immediately |
| High      | Serious issue involving significant financial loss, safety risk, or criminal allegation. E.g., theft, harassment. | 24 hours | Flagged immediately, tier review |
| Critical  | Severe issue involving criminal conduct, threat to life, or involving minors.          | 4 hours              | Flagged immediately, enhanced tier suspended, escrow protocol activated |

Severity is initially set by the reporting hirer, but the reviewing admin may adjust it based on evidence.

## 3. Reporting Flow

### 3.1 Step-by-Step Process

```
HIRER REPORTS INCIDENT:

1. Hirer logs into web app or mobile browser.
2. Navigates to "Report an Incident."
3. Identifies the worker:
   a. By phone number (if known).
   b. By scanning the worker's QR code.
   c. By selecting from their community roster (for community members).
4. Fills the incident form:
   - Incident type (dropdown).
   - Severity (dropdown, with guidance text explaining each level).
   - Date of incident (date picker, must be within last 90 days).
   - Description (free text, min 50 characters, max 2000 characters).
   - Supporting evidence (optional, up to 5 files, max 10MB each).
     Accepted formats: JPEG, PNG, PDF, MP4 (under 60 seconds).
5. Reviews and confirms submission.
6. Receives confirmation: "Your report has been submitted and will be
   reviewed within [SLA based on severity]."

SYSTEM ACTIONS:

7. Incident record created with status "pending_review."
8. Evidence files uploaded to encrypted Storage bucket.
9. EXIF data stripped from images. Metadata sanitized.
10. Evidence file hashes computed and stored for integrity.
11. Worker notified via push notification:
    "An incident report has been submitted regarding your account.
     Our team will review it. You will be notified of the outcome."
    (No details of the incident are shared at this stage.)
12. Admin review queue updated. Notification sent to on-duty reviewer.
13. Audit log entry created.
```

### 3.2 Reporter Guidance

The reporting form includes guidance to:

- Be factual and specific. Describe what happened, when, and what evidence exists.
- Avoid discriminatory language. Reports containing casteist, communal, or discriminatory language will be flagged for moderation and may result in the report being rejected.
- Understand that false or malicious reports may result in hirer account suspension.
- Know that the worker will be notified that a report exists but will not see the description or the reporter's identity.

## 4. Evidence Requirements

### 4.1 Acceptable Evidence

| Evidence Type    | Examples                                           | Weight in Review      |
|------------------|----------------------------------------------------|-----------------------|
| Photographs      | Damaged property, missing items, relevant scenes.  | Moderate              |
| Documents        | Police FIR copy, repair bills, medical reports.    | High                  |
| Video            | Security camera footage, phone recordings.         | High                  |
| Written accounts | Signed statements from witnesses.                  | Moderate              |
| Digital records  | Chat messages, payment receipts.                   | Moderate              |

### 4.2 Evidence Integrity

- All evidence files are hashed (SHA-256) at upload time. The hash is stored in `incident_evidence.file_hash`.
- If a file is later found to have a different hash, it indicates tampering and the evidence is flagged.
- EXIF data (which may contain location information) is stripped from images before storage.
- Evidence files are stored in an encrypted Storage bucket with no public access.

### 4.3 Evidence Limitations

- Evidence is not required for a report to be submitted (some incidents leave no physical evidence).
- Lack of evidence affects the review outcome: reports without evidence are more likely to be resolved as "inconclusive."
- The platform does not independently verify the authenticity of uploaded evidence. Admins assess credibility as part of the review process.

## 5. Investigation Process

### 5.1 Admin Review Queue

Incidents enter the review queue ordered by:

1. Severity (critical first, then high, medium, low).
2. Time in queue (older first within same severity).
3. Appeal status (appealed incidents get priority over new incidents of the same severity).

### 5.2 Review Steps

```
ADMIN REVIEWS INCIDENT:

1. Admin picks incident from queue. Status changes to "under_investigation."
2. Admin reviews:
   a. Incident description.
   b. Evidence files (if any).
   c. Reporter's account history:
      - Account age.
      - Previous reports filed (pattern of excessive reporting?).
      - Community membership and standing.
   d. Worker's account history:
      - Previous incidents (pattern of similar incidents?).
      - Current trust card status.
      - Time on platform.
   e. Contextual factors:
      - Is the reported incident type consistent with the worker's role?
      - Is the evidence consistent with the description?
      - Are there red flags suggesting a false report?

3. Admin may take the following actions:
   a. Request additional information from the reporter.
      - Sends a message via the platform (reporter notified).
      - Incident status remains "under_investigation."
      - Reporter has 7 days to respond before the incident may be
        resolved as "inconclusive" due to insufficient information.
   b. Adjust severity (up or down) based on evidence.
   c. Flag the report for second review (if the incident is complex
      or the admin is uncertain).
   d. Resolve the incident.

4. Resolution decision documented with notes (encrypted).
5. Time spent on review recorded for SLA tracking.
```

### 5.3 Second Review

A second review is required when:

- The incident is critical severity.
- The admin is uncertain about the outcome.
- The worker has a previously clean record (first incident).
- The reporter has a history of reports that were found unsubstantiated.
- The incident involves allegations of criminal conduct.

The second reviewer is a different admin who independently reviews the evidence and either concurs or disagrees. If reviewers disagree, the incident is escalated to a senior reviewer or the compliance officer.

## 6. Resolution Outcomes

### 6.1 Substantiated

The evidence supports the incident report.

**Actions:**
- Incident status set to `substantiated`.
- Worker notified: "The incident report has been reviewed and substantiated. You have the right to appeal within 7 days."
- Trust card recomputed: incident count incremented, severity reflected.
- Appeal deadline set (7 days from resolution).
- If critical severity: enhanced verification tier suspended pending appeal window.
- Audit log entry created.

### 6.2 Unsubstantiated

The evidence does not support the incident report, or evidence contradicts the report.

**Actions:**
- Incident status set to `unsubstantiated`.
- Worker notified: "The incident report has been reviewed and found unsubstantiated. No impact on your trust card."
- Reporter notified: "Your report has been reviewed and found unsubstantiated."
- Trust card is NOT affected.
- If the admin finds evidence that the report was deliberately false, the reporter's account is flagged for review.
- Audit log entry created.

### 6.3 Inconclusive

There is insufficient evidence to determine whether the incident occurred as reported.

**Actions:**
- Incident status set to `inconclusive`.
- Worker notified: "The incident report has been reviewed. The review was inconclusive due to insufficient evidence. No impact on your trust card."
- Reporter notified: "Your report has been reviewed. The review was inconclusive due to insufficient evidence."
- Trust card is NOT affected.
- Incident record retained but does not contribute to trust signals.
- Audit log entry created.

## 7. Worker Notification and Appeal Rights

### 7.1 Notification Timeline

| Event                           | Worker Notification Content                                           | Timing       |
|---------------------------------|-----------------------------------------------------------------------|--------------|
| Incident filed                  | "A report has been submitted. Under review."                          | Immediate    |
| Investigation started           | No additional notification.                                           | N/A          |
| Additional info requested       | No notification to worker (hirer interaction only at this stage).     | N/A          |
| Resolution: substantiated       | Type, severity, outcome, appeal instructions.                        | Immediate    |
| Resolution: unsubstantiated     | "Report reviewed and found unsubstantiated."                         | Immediate    |
| Resolution: inconclusive        | "Report reviewed, inconclusive. No impact on your card."             | Immediate    |
| Appeal window closing           | "You have 2 days remaining to appeal."                               | 5 days after resolution |
| Appeal received                 | "Your appeal has been received and is under review."                 | Immediate    |
| Appeal resolved                 | Outcome (upheld, overturned, partially overturned).                  | Immediate    |

### 7.2 Appeal Process

```
WORKER SUBMITS APPEAL:

1. Worker receives notification of substantiated incident.
2. Within 7 days, worker opens the incident in the mobile app.
3. Worker sees: incident type, severity, outcome, and appeal option.
   (Worker does NOT see: description, evidence, or reporter identity.)
4. Worker writes appeal text (free text, min 50 characters).
5. Worker may upload supporting evidence (same constraints as reporting).
6. Worker submits appeal.

SYSTEM ACTIONS:

7. Incident status changes to "appealed."
8. Trust card recomputed: appealed incident temporarily excluded from signals.
9. Appeal enters the admin review queue with priority flag.
10. A different admin from the original reviewer is assigned.

ADMIN REVIEWS APPEAL:

11. Admin reviews:
    a. Original incident report and evidence.
    b. Appeal text and any new evidence.
    c. Both parties' account histories.
12. Admin resolves appeal:
    a. Upheld: Original decision stands. Incident re-included in trust card.
    b. Overturned: Original decision reversed. Incident excluded from trust card permanently.
    c. Partially overturned: Severity adjusted. Incident remains on trust card with new severity.
13. Worker notified of appeal outcome.
14. Trust card recomputed.
15. Audit log entry created.
```

### 7.3 Appeal Limitations

- A worker can appeal each incident only once.
- Appeals must be submitted within 7 days of resolution.
- Late appeals (beyond 7 days) may be accepted at admin discretion if the worker provides a valid reason for the delay (e.g., was not reachable, medical emergency).
- Frivolous appeals (e.g., "I disagree" without any substantive argument) may be summarily upheld.

## 8. Impact on Trust Card

### 8.1 Summary of Trust Card Effects

| Outcome           | Incident Count | Severity Reflected | Tier Impact                     |
|--------------------|----------------|--------------------|---------------------------------|
| Substantiated      | +1             | Yes                | Enhanced tier suspended if critical |
| Unsubstantiated    | No change      | No                 | None                            |
| Inconclusive       | No change      | No                 | None                            |
| Appealed (pending) | Excluded       | Excluded           | Tier suspension lifted pending appeal |
| Appeal upheld      | +1 (restored)  | Yes (restored)     | Tier suspension re-applied if critical |
| Appeal overturned  | No change      | No                 | None                            |
| Appeal partial     | +1             | Adjusted           | Depends on new severity         |

### 8.2 Incident Aging

- Substantiated incidents older than 24 months are displayed with reduced prominence on the trust card.
- Incidents older than 60 months (5 years) are excluded from the trust card count entirely but remain in the database.
- The aging clock resets if a new incident of the same type is substantiated.

## 9. Timeline SLAs

| Metric                              | Target      | Measurement                        |
|-------------------------------------|-------------|------------------------------------|
| Critical: first review              | 4 hours     | Time from creation to "under_investigation" |
| High: first review                  | 24 hours    |                                    |
| Medium: first review                | 48 hours    |                                    |
| Low: first review                   | 72 hours    |                                    |
| Resolution (all severities)         | 7 days      | Time from "under_investigation" to resolution |
| Appeal first review                 | 48 hours    |                                    |
| Appeal resolution                   | 7 days      |                                    |
| Worker notification                 | Immediate   | Automated, within 1 minute of status change |
| Reporter notification               | Immediate   | Automated, within 1 minute of status change |
| Additional info request response    | 7 days      | After which incident may close as inconclusive |

### 9.1 SLA Monitoring

- Dashboard in admin panel shows:
  - Incidents approaching SLA breach.
  - SLA compliance rate (target: 95% for critical, 90% for others).
  - Average resolution time by severity.
  - Average time per review.
- Alerts sent to admin team lead when an incident is within 2 hours of SLA breach (critical) or within 12 hours (others).

## 10. Escalation to Law Enforcement

### 10.1 Criteria for Escalation

The platform does not automatically escalate incidents to law enforcement. Escalation occurs only when:

1. **Reporter requests it:** The incident form includes an option: "I intend to file a police report." If selected, the platform provides the reporter with guidance on how to file an FIR and notes that Verify Me can comply with lawful data requests from police.

2. **Evidence of criminal conduct:** If the admin review reveals clear evidence of a serious criminal offense (e.g., theft of significant value, assault, harassment), the admin may recommend escalation to the compliance officer.

3. **Imminent safety threat:** If the incident suggests an ongoing threat to someone's safety, the compliance officer may proactively contact law enforcement under the imminent threat disclosure protocol.

### 10.2 Escalation Process

```
1. Admin flags incident for potential escalation.
2. Compliance officer reviews the incident.
3. If escalation is warranted:
   a. Compliance officer contacts the reporter to inform them
      of the recommendation to involve law enforcement.
   b. If the reporter agrees: compliance officer assists with
      documentation (provides platform records as needed).
   c. If the reporter declines: compliance officer documents the
      recommendation and the reporter's decision. No unilateral
      escalation unless imminent threat criteria are met.
4. Platform data is NOT proactively shared with law enforcement.
   Law enforcement must submit a formal request per the lawful
   disclosure framework.
5. All escalation discussions and decisions are logged.
```

### 10.3 Platform Limitations

Verify Me is not a law enforcement body. The platform:

- Does not conduct criminal investigations.
- Does not have the authority to determine criminal guilt.
- Does not impose criminal penalties.
- Does not share data with law enforcement without proper legal process.

The incident review process determines the trustworthiness impact of reported behavior, not criminal liability.

## 11. Handling Abuse of the Reporting System

### 11.1 Indicators of Abuse

- A hirer files more than 3 incidents in 30 days.
- A hirer's reports are consistently found unsubstantiated (3 or more in 6 months).
- A hirer files reports against workers they have no verifiable employment relationship with.
- Report language contains discriminatory, casteist, or retaliatory content.
- Reports appear coordinated (multiple hirers from the same community filing similar reports against one worker in a short timeframe without independent evidence).

### 11.2 Consequences for Abuse

| Offense                    | Action                                               |
|----------------------------|------------------------------------------------------|
| First unsubstantiated report| No action (genuine mistakes happen).                 |
| Pattern of unsubstantiated | Warning sent to hirer.                               |
| Confirmed false report      | Report voided, hirer account suspended (7 days).    |
| Repeated false reports      | Hirer account permanently banned.                   |
| Discriminatory content      | Report flagged, content removed, hirer warned.      |
| Coordinated harassment      | All involved accounts suspended pending investigation.|

### 11.3 Worker Protection

The system is designed to prevent the reporting mechanism from becoming a tool of harassment against workers:

- Reporter identity is never disclosed to the worker.
- Only substantiated incidents affect the trust card.
- Workers have a guaranteed appeal process.
- Patterns of abuse by reporters are monitored.
- Workers can report harassment via the platform (a separate flow for reporting hirer misconduct).
