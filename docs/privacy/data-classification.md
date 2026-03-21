# Data Classification Matrix

## 1. Classification Tiers

| Tier              | Label             | Description                                                        |
|-------------------|-------------------|--------------------------------------------------------------------|
| T1                | Public            | Visible without authentication when profile is public.             |
| T2                | Restricted        | Visible to authenticated users with valid consent grant.           |
| T3                | Sensitive         | Requires explicit consent, encrypted at rest, access logged.       |
| T4                | Highly Sensitive  | Field-level encrypted, consent or lawful disclosure only, mandatory audit. |

## 2. Field Classification: Worker Profile Data

| Field                  | Tier | Who Can Access                              | Consent Required | Encryption         | Retention Period          | Erasure Behavior                        |
|------------------------|------|---------------------------------------------|-------------------|---------------------|---------------------------|-----------------------------------------|
| Display name           | T1   | Anyone (if public), hirers (if consented)   | No (if public)    | None                | Account lifetime          | Deleted on account deletion             |
| Full name              | T3   | Worker, admin                               | Yes               | AES-256-GCM field   | Account lifetime + 30d   | Overwritten, then deleted               |
| Phone number           | T4   | Worker, admin, lawful disclosure            | Yes (for hirer)   | AES-256-GCM field   | Account lifetime + 30d   | Overwritten, hash retained 7y for dedup |
| Phone hash (SHA-256)   | T3   | System (internal lookup only)               | N/A (derived)     | One-way hash        | Account lifetime + 7y    | Retained for deduplication              |
| Aadhaar number (full)  | T4   | Worker (masked), admin, lawful disclosure   | N/A (never shared)| AES-256-GCM field   | 7 years post-verification | Overwritten, then deleted               |
| Aadhaar last four      | T3   | Worker only                                 | N/A               | None (partial data) | Account lifetime          | Deleted on account deletion             |
| Date of birth          | T4   | Worker, admin                               | Yes               | AES-256-GCM field   | Account lifetime + 30d   | Overwritten, then deleted               |
| Profile photo          | T1   | Anyone (if public), hirers (if consented)   | No (if public)    | None (Storage)      | Account lifetime          | File deleted from Storage               |
| Address (full)         | T4   | Worker, admin, lawful disclosure            | Yes               | AES-256-GCM field   | Account lifetime + 30d   | Overwritten, then deleted               |
| City                   | T2   | Hirers with consent, admin                  | Yes               | None                | Account lifetime          | Nullified on deletion                   |
| State                  | T2   | Hirers with consent, admin                  | Yes               | None                | Account lifetime          | Nullified on deletion                   |
| Pincode                | T2   | Hirers with consent, admin                  | Yes               | None                | Account lifetime          | Nullified on deletion                   |
| Gender                 | T2   | Hirers with consent, admin                  | Yes               | None                | Account lifetime          | Nullified on deletion                   |
| Preferred language     | T1   | System internal                             | No                | None                | Account lifetime          | Deleted on account deletion             |
| Work categories        | T2   | Hirers with consent, admin                  | Yes               | None                | Account lifetime          | Nullified on deletion                   |
| Platform join date     | T1   | Anyone (if public), hirers (if consented)   | No (if public)    | None                | Account lifetime          | Retained anonymized for analytics       |

## 3. Field Classification: Trust Card Data

| Field                     | Tier | Who Can Access                              | Consent Required | Encryption         | Retention Period          | Erasure Behavior                        |
|---------------------------|------|---------------------------------------------|-------------------|---------------------|---------------------------|-----------------------------------------|
| Verification tier         | T2   | Hirers with consent, worker, admin          | Yes               | None (derived)      | Account lifetime          | Deleted with trust card                 |
| Identity verified flag    | T2   | Hirers with consent, worker, admin          | Yes               | None (derived)      | Account lifetime          | Deleted with trust card                 |
| Background check status   | T2   | Hirers with consent, worker, admin          | Yes               | None (derived)      | Account lifetime          | Deleted with trust card                 |
| Tenure months             | T1   | Anyone (if public), hirers (if consented)   | No (if public)    | None (derived)      | Account lifetime          | Deleted with trust card                 |
| Endorsement count         | T2   | Hirers with consent, worker, admin          | Yes               | None (derived)      | Account lifetime          | Deleted with trust card                 |
| Incident flag             | T2   | Hirers with consent, worker, admin          | Yes               | None (derived)      | Account lifetime          | Deleted with trust card                 |
| Incident summary          | T2   | Hirers with trust_card_detail consent       | Yes               | None (derived)      | Account lifetime          | Deleted with trust card                 |
| Highest severity          | T2   | Hirers with trust_card_detail consent       | Yes               | None (derived)      | Account lifetime          | Deleted with trust card                 |
| Last computed timestamp   | T1   | Anyone viewing the card                     | No                | None                | Account lifetime          | Deleted with trust card                 |
| Computation version       | T1   | System internal                             | No                | None                | Account lifetime          | Deleted with trust card                 |

## 4. Field Classification: Verification Data

| Field                     | Tier | Who Can Access                              | Consent Required | Encryption         | Retention Period          | Erasure Behavior                        |
|---------------------------|------|---------------------------------------------|-------------------|---------------------|---------------------------|-----------------------------------------|
| Verification type         | T3   | Worker (own), admin                         | N/A               | None                | 7 years                   | Retained anonymized                     |
| Verification status       | T3   | Worker (own), admin                         | N/A               | None                | 7 years                   | Retained anonymized                     |
| Provider name             | T3   | Admin only                                  | N/A               | None                | 7 years                   | Retained anonymized                     |
| Provider reference ID     | T4   | Admin only                                  | N/A               | AES-256-GCM field   | 7 years                   | Overwritten, then deleted               |
| Result data (JSON)        | T4   | Admin only                                  | N/A               | AES-256-GCM field   | 7 years                   | Overwritten, then deleted               |
| Verified at timestamp     | T3   | Worker (own), admin                         | N/A               | None                | 7 years                   | Retained anonymized                     |
| Expiry timestamp          | T3   | Worker (own), admin                         | N/A               | None                | 7 years                   | Retained anonymized                     |

## 5. Field Classification: Incident Data

| Field                     | Tier | Who Can Access                              | Consent Required | Encryption         | Retention Period          | Erasure Behavior                        |
|---------------------------|------|---------------------------------------------|-------------------|---------------------|---------------------------|-----------------------------------------|
| Incident type             | T3   | Worker (subject), reporter, admin           | N/A               | None                | 7 years                   | Retained anonymized                     |
| Severity                  | T3   | Worker (subject), reporter, admin           | N/A               | None                | 7 years                   | Retained anonymized                     |
| Description               | T4   | Reporter, admin only                        | N/A               | AES-256-GCM field   | 7 years                   | Overwritten, then deleted               |
| Incident date             | T3   | Worker (subject), reporter, admin           | N/A               | None                | 7 years                   | Retained anonymized                     |
| Status                    | T3   | Worker (subject), reporter, admin           | N/A               | None                | 7 years                   | Retained anonymized                     |
| Resolution notes          | T4   | Admin only                                  | N/A               | AES-256-GCM field   | 7 years                   | Overwritten, then deleted               |
| Reporter identity         | T4   | Admin only (never shown to worker)          | N/A               | None (FK reference) | 7 years                   | Anonymized on reporter account deletion |
| Evidence files            | T4   | Reporter, admin only                        | N/A               | AES-256 per-file    | 5 years post-resolution   | Files deleted, keys destroyed           |
| Evidence file hash        | T3   | Admin only                                  | N/A               | None                | 5 years post-resolution   | Deleted with evidence                   |

## 6. Field Classification: Consent and Audit Data

| Field                     | Tier | Who Can Access                              | Consent Required | Encryption         | Retention Period          | Erasure Behavior                        |
|---------------------------|------|---------------------------------------------|-------------------|---------------------|---------------------------|-----------------------------------------|
| Consent scope             | T2   | Worker (grantor), hirer (grantee), admin    | N/A               | None                | 2 years after expiry      | Deleted                                 |
| Consent expiry            | T2   | Worker (grantor), hirer (grantee), admin    | N/A               | None                | 2 years after expiry      | Deleted                                 |
| Share token               | T3   | Worker (grantor), anyone with token         | N/A               | None (opaque token) | Until expiry              | Invalidated on revocation               |
| View count                | T2   | Worker (grantor), admin                     | N/A               | None                | 2 years after expiry      | Deleted                                 |
| Audit log actor           | T3   | Admin, worker (if subject)                  | N/A               | None                | 7 years                   | Anonymized on actor account deletion    |
| Audit log action          | T2   | Admin, worker (if subject)                  | N/A               | None                | 7 years                   | Retained                                |
| Audit log IP address      | T3   | Admin only                                  | N/A               | None                | 7 years                   | Anonymized after 90 days                |
| Audit log user agent      | T3   | Admin only                                  | N/A               | None                | 7 years                   | Anonymized after 90 days                |

## 7. Field Classification: Endorsement Data

| Field                     | Tier | Who Can Access                              | Consent Required | Encryption         | Retention Period          | Erasure Behavior                        |
|---------------------------|------|---------------------------------------------|-------------------|---------------------|---------------------------|-----------------------------------------|
| Endorsement text          | T3   | Worker (subject), endorser, admin           | Yes (for hirer)   | None                | Account lifetime          | Deleted on either party's deletion      |
| Endorser identity         | T3   | Worker (subject), admin                     | N/A               | None (FK reference) | Account lifetime          | Anonymized on endorser deletion         |
| Work category endorsed    | T2   | Worker (subject), hirers with consent       | Yes               | None                | Account lifetime          | Deleted on either party's deletion      |
| Relationship duration     | T3   | Worker (subject), admin                     | N/A               | None                | Account lifetime          | Deleted on either party's deletion      |

## 8. Field Classification: Hirer Profile Data

| Field                     | Tier | Who Can Access                              | Consent Required | Encryption         | Retention Period          | Erasure Behavior                        |
|---------------------------|------|---------------------------------------------|-------------------|---------------------|---------------------------|-----------------------------------------|
| Display name              | T1   | Workers with interaction, admin             | No                | None                | Account lifetime          | Deleted on account deletion             |
| Full name                 | T3   | Hirer (own), admin                          | N/A               | AES-256-GCM field   | Account lifetime + 30d   | Overwritten, then deleted               |
| Phone number              | T4   | Hirer (own), admin                          | N/A               | AES-256-GCM field   | Account lifetime + 30d   | Overwritten, hash retained 7y           |
| Address                   | T4   | Hirer (own), admin                          | N/A               | AES-256-GCM field   | Account lifetime + 30d   | Overwritten, then deleted               |
| City                      | T2   | Workers with interaction, admin             | No                | None                | Account lifetime          | Nullified on deletion                   |
| Hirer type                | T2   | Admin                                       | N/A               | None                | Account lifetime          | Deleted on account deletion             |
| Community membership      | T2   | Community members, admin                    | N/A               | None (FK reference) | Account lifetime          | Nullified on deletion                   |
| Verified flag             | T1   | Workers with interaction, admin             | No                | None                | Account lifetime          | Deleted on account deletion             |

## 9. Field Classification: System and Device Data

| Field                     | Tier | Who Can Access                              | Consent Required | Encryption         | Retention Period          | Erasure Behavior                        |
|---------------------------|------|---------------------------------------------|-------------------|---------------------|---------------------------|-----------------------------------------|
| Device ID (mobile)        | T3   | System internal only                        | No (functional)   | None                | Account lifetime          | Deleted on account deletion             |
| Device model              | T2   | System internal only                        | No (functional)   | None                | 90 days                   | Auto-deleted                            |
| OS version                | T2   | System internal only                        | No (functional)   | None                | 90 days                   | Auto-deleted                            |
| App version               | T2   | System internal only                        | No (functional)   | None                | 90 days                   | Auto-deleted                            |
| IP address (login)        | T3   | Admin only                                  | No (functional)   | None                | 90 days                   | Anonymized after 90 days                |
| Login timestamps          | T3   | Worker/hirer (own), admin                   | No (functional)   | None                | 1 year                    | Deleted on account deletion             |
| Push notification token   | T3   | System internal only                        | No (functional)   | None                | Account lifetime          | Deleted on account deletion             |
| Location data             | N/A  | NOT COLLECTED                               | N/A               | N/A                 | N/A                       | N/A                                     |
| Browsing/usage analytics  | N/A  | NOT COLLECTED                               | N/A               | N/A                 | N/A                       | N/A                                     |

**Note on location data:** Verify Me does not collect GPS coordinates, location history, or any form of geolocation data. City and state are self-declared by the user. This is a deliberate privacy decision -- location tracking of domestic workers creates surveillance risks disproportionate to any trust-building benefit.

## 10. Disclosure Request Data

| Field                     | Tier | Who Can Access                              | Consent Required | Encryption         | Retention Period          | Erasure Behavior                        |
|---------------------------|------|---------------------------------------------|-------------------|---------------------|---------------------------|-----------------------------------------|
| Authority name            | T3   | Compliance officer, super admin             | N/A               | None                | 10 years                  | Retained for legal compliance           |
| Legal reference           | T3   | Compliance officer, super admin             | N/A               | None                | 10 years                  | Retained for legal compliance           |
| Legal basis               | T3   | Compliance officer, super admin             | N/A               | None                | 10 years                  | Retained for legal compliance           |
| Scope requested           | T3   | Compliance officer, super admin             | N/A               | None                | 10 years                  | Retained for legal compliance           |
| Scope approved            | T3   | Compliance officer, super admin             | N/A               | None                | 10 years                  | Retained for legal compliance           |
| Supporting document       | T4   | Compliance officer, super admin             | N/A               | AES-256 per-file    | 10 years                  | Retained for legal compliance           |
| Review notes              | T4   | Compliance officer, super admin             | N/A               | AES-256-GCM field   | 10 years                  | Retained for legal compliance           |
| Worker notification flag  | T3   | Compliance officer, super admin             | N/A               | None                | 10 years                  | Retained for legal compliance           |

## 11. Appeal Data

| Field                     | Tier | Who Can Access                              | Consent Required | Encryption         | Retention Period          | Erasure Behavior                        |
|---------------------------|------|---------------------------------------------|-------------------|---------------------|---------------------------|-----------------------------------------|
| Appeal text               | T4   | Worker (own), admin                         | N/A               | AES-256-GCM field   | 7 years                   | Overwritten, then deleted               |
| Supporting evidence       | T4   | Worker (own), admin                         | N/A               | AES-256 per-file    | 5 years post-resolution   | Files deleted, keys destroyed           |
| Appeal status             | T3   | Worker (own), admin                         | N/A               | None                | 7 years                   | Retained anonymized                     |
| Review notes              | T4   | Admin only                                  | N/A               | AES-256-GCM field   | 7 years                   | Overwritten, then deleted               |

## 12. Classification Governance

### Review Cadence

- Full classification review: annually or when new features add data fields.
- Triggered review: any change to data model, new third-party integration, regulatory change.

### Classification Change Process

1. Propose classification change via ADR.
2. Privacy review by compliance officer.
3. Engineering review for encryption and access control implications.
4. Update this document, RLS policies, and encryption configuration.
5. Audit existing data for compliance with new classification.

### Disputes

If a field's classification is disputed between engineering and compliance, the higher (more restrictive) classification applies until the dispute is resolved.
