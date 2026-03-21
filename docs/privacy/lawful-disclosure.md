# Lawful Disclosure Framework

## 1. Purpose and Scope

This document defines when and how Verify Me may disclose worker data without the worker's consent. Disclosure without consent is an extraordinary action, permitted only under specific legal circumstances. The default position is that worker data is never disclosed without consent.

This framework applies to all requests for worker data from:

- Law enforcement agencies (police, CBI, NIA).
- Courts and tribunals.
- Regulatory bodies (UIDAI, CERT-In, Data Protection Board of India).
- Other government authorities with statutory power to compel disclosure.

This framework does NOT apply to:

- Hirer requests for worker data (handled via consent model).
- Internal admin access for platform operations (handled via access control policies).
- Anonymized or aggregated data that cannot identify individual workers.

## 2. Legal Basis for Disclosure

### 2.1 Digital Personal Data Protection Act, 2023 (DPDP Act)

The DPDP Act is the primary governing framework for data disclosure.

**Section 7(1)(i) -- Legitimate Uses:** Processing without consent is permitted when necessary for compliance with any law or court order.

**Section 7(1)(g) -- Reasonable Purpose:** Processing without consent for "any fair and reasonable purpose" as prescribed by the Central Government. This is narrowly interpreted -- Verify Me does not use this as a blanket justification.

**Section 17(2) -- Exemptions:** The Central Government may exempt certain data processors or categories of processing from consent requirements in the interest of sovereignty, security, public order, or prevention of offenses.

### 2.2 Code of Criminal Procedure, 1973 (CrPC)

**Section 91 -- Summons to Produce Document:** A court or officer in charge of a police station may issue a written order requiring the production of any document or electronic record. This is the most common legal basis for disclosure requests.

**Section 93 -- Search Warrant:** When a summons under Section 91 would not be effective, a court may issue a search warrant for documents or electronic records.

**Section 102 -- Seizure of Property:** A police officer may seize any property which may be found in circumstances creating suspicion of an offense. Electronic records fall under this provision.

### 2.3 Information Technology Act, 2000

**Section 69 -- Power to Issue Directions for Interception, Monitoring, or Decryption:** The Central or State Government may direct any agency to intercept, monitor, or decrypt information transmitted through any computer resource. Requires written order from Secretary-level officer.

**Section 69B -- Power to Collect Traffic Data:** The Central Government may direct any agency to monitor and collect traffic data or information through any computer resource.

**Section 79 -- Intermediary Liability:** Verify Me's intermediary liability requires compliance with government directions for removing or disabling access to information, subject to due process safeguards.

### 2.4 Indian Penal Code (IPC) / Bharatiya Nyaya Sanhita (BNS)

Relevant sections that may underpin disclosure requests:

- **Section 379 IPC / Section 303 BNS (Theft):** Incident data may be requested when a theft FIR is registered against a worker.
- **Section 354 IPC / Section 74 BNS (Assault/Outraging modesty):** Incident and identity data may be requested.
- **Section 420 IPC / Section 316 BNS (Cheating):** Identity verification data may be requested.
- **Section 506 IPC / Section 351 BNS (Criminal intimidation):** Communication records may be requested.

### 2.5 Aadhaar Act, 2016

**Section 28 -- Security of Identity Information:** Aadhaar data collected for authentication may not be shared beyond the purposes specified in the Act. Even under a court order, Verify Me will not disclose Aadhaar numbers; instead, it will direct the authority to UIDAI for Aadhaar-related data.

## 3. Disclosure Categories

### 3.1 Category A: Mandatory Disclosure (Court Order)

A valid court order compels disclosure. Non-compliance may result in contempt of court.

**Requirements for compliance:**
- Order must be issued by a court of competent jurisdiction.
- Order must specifically name Verify Me or its legal entity as the recipient.
- Order must specify the data to be disclosed.
- Order must be served through proper legal channels (not informal requests).

**Process:**
1. Legal document received and logged.
2. Compliance officer verifies authenticity with the issuing court (if needed).
3. Scope narrowed to exactly what the court ordered -- no more.
4. Data extracted, encrypted, and transmitted to the designated authority.
5. Worker notified post-disclosure (unless the court order includes a non-disclosure / gag provision).
6. Full audit trail recorded.

### 3.2 Category B: Law Enforcement Request (CrPC Section 91)

A written order from a police station officer or court requiring production of specific records.

**Requirements for compliance:**
- Written order on official letterhead with reference to FIR number or case number.
- Signed by an officer of appropriate rank (Station House Officer or above).
- Specific identification of the data subject (by phone number, name, or Verify Me user ID).
- Specific identification of the data requested.

**Process:**
1. Request received and logged.
2. Compliance officer verifies:
   - Authenticity of the request (call back to the issuing authority using publicly listed numbers, not the number on the letter).
   - Rank and authority of the requesting officer.
   - Existence of the referenced FIR or case.
3. If valid: extract data scoped to the request. Do not volunteer additional data.
4. If questionable: escalate to legal counsel before compliance.
5. Data transmitted via secure channel (encrypted email or physical handover with receipt).
6. Worker notified within 72 hours of disclosure.
7. Full audit trail recorded.

### 3.3 Category C: Imminent Safety Threat

In rare cases, disclosure may be warranted without a formal legal order when there is an imminent threat to life or safety.

**Criteria (all must be met):**
- A specific, credible threat to the life or physical safety of an identifiable person.
- The threat is imminent (within hours, not days or weeks).
- The data requested is necessary to prevent the harm.
- There is insufficient time to obtain a court order.

**Process:**
1. Request received (may be verbal in an emergency, followed by written confirmation within 24 hours).
2. At least two senior personnel must approve: one from the compliance team and one from the executive team.
3. Disclosure limited to the minimum data necessary to address the threat (typically: name, phone number, last known city).
4. Written confirmation from the requesting authority obtained within 24 hours.
5. Worker notified within 24 hours of disclosure.
6. Full audit trail recorded, including the justification for emergency disclosure.
7. Post-incident review within 7 days to assess whether the disclosure was appropriate.

### 3.4 Category D: Regulatory Inquiry

Requests from regulatory bodies (Data Protection Board of India, CERT-In, UIDAI).

**Process:**
1. Verify the regulatory authority and statutory basis for the request.
2. Engage legal counsel.
3. Respond within the timeline prescribed by the relevant regulation.
4. Cooperate with audits and inspections as required by law.
5. Worker notification per the applicable regulation's requirements.

## 4. Verification of Legal Authority

Every disclosure request is verified before any data is released. Verification steps:

### 4.1 Document Verification

- Court order: verify case number with the court registry.
- Police request: verify FIR number with the respective police station.
- Regulatory request: verify the officer's identity through the regulator's official directory.
- All documents checked for:
  - Official letterhead and seal.
  - Correct legal entity name (Verify Me or its registered corporate entity).
  - Specific data subject identification.
  - Specific data scope.
  - Authorized signatory.

### 4.2 Call-Back Verification

- Contact the issuing authority using publicly listed contact information (not contact details provided in the request itself) to confirm that the request is genuine.
- This step is mandatory for all Category B (law enforcement) requests.
- For Category A (court orders), call-back is performed if any irregularity is suspected.

### 4.3 Legal Counsel Review

- All Category C (imminent threat) and Category D (regulatory) requests are reviewed by legal counsel before disclosure.
- Category B requests are reviewed by legal counsel if the scope is broad or the request is unusual.
- Category A requests are reviewed by legal counsel only if the scope appears overbroad or the court's jurisdiction is questioned.

## 5. Worker Notification

### 5.1 Default: Notify the Worker

Workers are notified of any disclosure of their data. Notification includes:

- That a disclosure was made.
- The category of disclosure (court order, law enforcement, imminent threat, regulatory).
- The general scope of data disclosed (e.g., "identity and incident records" -- not the specific data values).
- The authority to which data was disclosed (e.g., "Mumbai Police" -- not the specific officer's name).
- The legal basis for disclosure.
- Information about the worker's right to seek legal counsel.

### 5.2 Exception: Gag Orders

If a court order or statute prohibits notification of the data subject:

- The notification is suppressed for the duration of the gag order.
- A reminder is set to notify the worker when the gag order expires or is lifted.
- The non-notification is documented in the audit trail.

### 5.3 Notification Timing

| Category               | Notification Timing                  |
|------------------------|--------------------------------------|
| Court order            | Within 72 hours of disclosure        |
| Law enforcement        | Within 72 hours of disclosure        |
| Imminent threat        | Within 24 hours of disclosure        |
| Regulatory inquiry     | Per applicable regulation            |
| With gag order         | Upon expiry of gag order             |

## 6. Data Handling for Disclosure

### 6.1 Data Extraction

- Data extracted by a compliance officer or super admin only.
- Extraction performed using a dedicated admin interface that logs every field accessed.
- PII fields decrypted only at the moment of extraction, not in advance.
- Extracted data is formatted into a standardized disclosure report.

### 6.2 Disclosure Report Format

Each disclosure report contains:

1. **Header:** Verify Me legal entity details, disclosure reference number, date.
2. **Legal basis:** Reference to the court order, FIR, or statutory provision.
3. **Data subject:** Worker's name and Verify Me user ID (not Aadhaar or phone unless specifically ordered).
4. **Scope:** Enumeration of every data field disclosed.
5. **Data:** The actual data values, in a structured format.
6. **Integrity statement:** SHA-256 hash of the report for tamper detection.
7. **Limitations:** Statement that the data is accurate as of the extraction date and that Verify Me makes no warranty about the underlying truthfulness of user-submitted data.

### 6.3 Transmission Security

- Electronic transmission: encrypted email (PGP) or secure file transfer.
- Physical transmission: sealed envelope, handed to an identified officer with receipt.
- No data disclosed over phone or unencrypted email.
- No data posted to public or shared mailboxes.

### 6.4 No Retained Copies

- The disclosure report is not retained by Verify Me beyond the audit log entry.
- The audit log records that a disclosure was made, the scope, and the recipient -- but does not retain a copy of the disclosed data itself.
- This prevents Verify Me from accumulating a shadow database of disclosed records.

## 7. Escrow Model for Sensitive Incident Data

### 7.1 Concept

Certain incident data (particularly involving allegations of criminal conduct) is stored in an "escrow" model:

- The incident description and evidence are encrypted with a split-key scheme.
- Key 1 is held by the platform (compliance officer).
- Key 2 is held by an independent third party (legal counsel or escrow service).
- Both keys are required to decrypt the data.

### 7.2 When Escrow Applies

Escrow is used for incidents classified as:

- **Critical severity** (allegations of criminal conduct, serious assault, major theft).
- **Incidents involving minors.**
- **Incidents where the reporter has indicated intent to file a police report.**

### 7.3 Escrow Release

Escrow data is released only when:

1. A valid court order or CrPC Section 91 order specifically references the incident.
2. Both key holders (platform compliance officer and escrow holder) agree to release.
3. The worker is notified (subject to gag order exceptions).

### 7.4 Escrow Expiry

If no disclosure request is received within the retention period (7 years), the escrow keys are destroyed, making the encrypted data permanently irrecoverable.

## 8. Role of the Compliance Team

### 8.1 Structure

- **Compliance Officer (primary):** Handles day-to-day disclosure requests, coordinates with legal counsel.
- **Compliance Officer (backup):** Alternate for availability during leave or emergencies.
- **Legal Counsel:** External law firm retained for disclosure review, available on-call.
- **Super Admin (executive):** Required co-approver for Category C (imminent threat) disclosures.

### 8.2 Responsibilities

| Responsibility                          | Owner                    |
|-----------------------------------------|--------------------------|
| Receive and log disclosure requests     | Compliance Officer       |
| Verify legal authority                  | Compliance Officer       |
| Engage legal counsel when needed        | Compliance Officer       |
| Approve/reject disclosure               | Compliance Officer       |
| Extract and prepare disclosure report   | Compliance Officer       |
| Transmit disclosure                     | Compliance Officer       |
| Notify worker                           | Compliance Officer       |
| Co-approve emergency disclosures        | Super Admin (executive)  |
| Annual review of disclosure framework   | Legal Counsel            |
| Training compliance team                | Legal Counsel            |

### 8.3 Training

- All compliance team members receive annual training on:
  - Indian data protection law (DPDP Act, IT Act, CrPC).
  - Disclosure verification procedures.
  - Handling pressure from authorities (e.g., verbal demands without proper legal process).
  - Escalation procedures for unusual or threatening requests.

### 8.4 Pressure Resistance

Compliance officers are trained and empowered to:

- Refuse verbal or informal requests for data.
- Refuse requests that lack proper legal basis, even from senior police officers.
- Escalate to legal counsel when facing pressure.
- Document any improper pressure or threats from authorities.

This is critical in the Indian context where informal pressure from local authorities is a documented reality. The compliance team's role is to protect worker data while respecting legitimate legal process.

## 9. Documentation and Audit

### 9.1 Disclosure Register

A register of all disclosure requests is maintained, containing:

| Field                        | Description                                     |
|------------------------------|-------------------------------------------------|
| Disclosure reference number  | Unique identifier for the request.              |
| Date received                | When the request was received.                  |
| Authority                    | Name and type of requesting authority.          |
| Legal basis                  | Specific legal provision cited.                 |
| FIR/case reference           | Reference number from the authority.            |
| Data subject (worker ID)     | Verify Me user ID of the affected worker.       |
| Scope requested              | Fields requested by the authority.              |
| Scope disclosed              | Fields actually disclosed (may be narrower).    |
| Outcome                      | Approved, partially approved, rejected, escalated.|
| Compliance officer           | Who handled the request.                        |
| Legal counsel consulted      | Yes/No, and date.                               |
| Worker notified              | Yes/No, and date.                               |
| Date of disclosure           | When data was transmitted.                      |

### 9.2 Audit Trail

Every action in the disclosure process is logged to the `audit_log` table:

- Request received and logged.
- Verification steps performed.
- Legal counsel consultation.
- Approval or rejection decision.
- Data extraction (every field accessed).
- Report generation.
- Transmission.
- Worker notification.

### 9.3 Annual Transparency Report

Verify Me publishes an annual transparency report including:

- Total number of disclosure requests received.
- Breakdown by category (court order, law enforcement, imminent threat, regulatory).
- Number of requests complied with, partially complied with, and rejected.
- Geographic distribution of requests (by state).
- Number of workers affected.
- No individual case details are disclosed in the transparency report.

## 10. Rejecting Improper Requests

Verify Me will reject disclosure requests that:

- Lack a valid legal basis (e.g., a request "for investigation purposes" without an FIR or court order).
- Are overbroad (e.g., "all data on all workers in Mumbai" without specific identification).
- Cannot be verified as genuine.
- Come from authorities without jurisdiction (e.g., a state police request for data related to a matter in another state's jurisdiction, without proper legal transfer).
- Seek data that Verify Me does not possess (e.g., GPS location history, which is not collected).

Rejections are documented with the reason, and the requesting authority is informed of the deficiency in their request.
