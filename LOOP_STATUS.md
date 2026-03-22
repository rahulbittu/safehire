# SafeHire — Loop Status

**Sprint:** Web Product Hardening
**Started:** 2026-03-22

---

## Loop 1 — Product/UI Audit + Doc Alignment
**Status:** COMPLETE
**Commit:** (this commit)

### Audit Findings

**What still feels LinkedIn-like:**
- Worker detail page title says "Trust Card" but layout is still profile-dump-ish — flat data listing
- Worker dashboard shows references like endorsement cards
- No rating display anywhere despite ratings existing in DB
- Consent page uses field-level access language that feels like enterprise IAM, not hiring

**Weak or empty surfaces:**
- Agency dashboard exists but has no link from nav — unreachable
- No agency public profile page (for hirers to browse agencies)
- Worker cards in search don't show rating or availability
- No availability display on any surface
- Incidents pages are basically placeholder shells

**Clumsy access request UX:**
- Worker detail page: textarea asking "Why do you need access?" — awkward for informal hiring
- No structured intent options
- "Write a reference" section on same page as "request access" is confusing context mixing

**Agency issues:**
- Agency dashboard exists at /agency but no nav link to it
- Agency-backed workers show a small "Agency" badge but no link to the agency
- No agency public profile page
- Agency role uses "hirer" auth role (workaround)

**Spacing/typography issues:**
- CATEGORIES and VERIFICATION_STEPS constants duplicated across 4 files
- Inconsistent padding (some cards 16px, some 18px, some 20px)
- Worker detail stats grid cramped on mobile (4 columns)
- Some buttons use "11px 24px" padding, others "10px 20px" — inconsistent

**Docs gaps (now filled):**
- Created: docs/product/current-priority.md
- Created: docs/product/non-goals.md
- Created: docs/product/ui-principles.md
- Created: LOOP_STATUS.md
- Created: NEXT_LOOP.md

### Product Hierarchy (locked)

1. Search / Discovery (category-first, locality-first)
2. Worker Trust Cards (practical, not vanity)
3. Verification Progress (10-step ladder, visible)
4. Ratings (separate from verification)
5. Agency (first-class actor, not afterthought)
6. Consent (structured, not freeform)
7. Incidents (fair, reviewable, appealable)

---

## Loop 2 — Homepage Rebuild
**Status:** PENDING

## Loop 3 — Login / Role Entry Redesign
**Status:** PENDING

## Loop 4 — Search / Results as the Core
**Status:** PENDING

## Loop 5 — Worker Detail / Trust Summary Redesign
**Status:** PENDING

## Loop 6 — Access Request UX Fix
**Status:** PENDING

## Loop 7 — Agency Experience as First-Class
**Status:** PENDING

## Loop 8 — Worker Dashboard + Verification Ladder
**Status:** PENDING

## Loop 9 — Hirer Dashboard + Demo Flow Cleanup
**Status:** PENDING

## Loop 10 — Final Web Polish + Shippability Pass
**Status:** PENDING
