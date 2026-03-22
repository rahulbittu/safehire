# SafeHire — Loop Status

**Sprint:** Web Product Hardening
**Started:** 2026-03-22

---

## Loop 1 — Product/UI Audit + Doc Alignment
**Status:** COMPLETE

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
**Status:** COMPLETE
**Changes:**
- Search-first hero: "Find trusted help in your area" with functional category grid + locality input
- Category grid is the primary CTA, not actor paths
- Locality input feeds into search URL params
- "Search all" button alongside locality
- Actor paths (worker/agency) moved below search as secondary
- Sample trust card shows rating, availability, agency badge, and language
- Trust principles in 2x2 grid, tighter
- UAT banner links directly to login
- CTA has dual buttons: "Find help now" + "Create your trust card"

## Loop 3 — Login / Role Entry Redesign
**Status:** COMPLETE
**Changes:**
- Role-specific headlines: "Get verified, get hired" / "Find trusted local help" / "Manage your workforce"
- Role-specific subtitles explaining what happens after login
- OTP step shows clearer instruction
- Login already had 3-role selector and 4 demo accounts from prior work

## Loop 4 — Search / Results as the Core
**Status:** COMPLETE
**Changes:**
- Backend: searchWorkers enriched with trust card tier, endorsement count, incident flag, avg_rating, rating_count
- Search cards show: rating (★ with count), availability badge, language, category label (not slug), tier badge (Enhanced/Basic), experience, verification progress
- Locality URL parameter read on mount (category was already working)
- Category labels shown in results count header
- Denser, more informative cards with 3-row layout (name+badges, category+locality, stats)

## Loop 5 — Worker Detail / Trust Summary Redesign
**Status:** COMPLETE
**Changes:**
- Header: worker name, tier badge, availability badge, category label, locality, languages
- Stats grid: rating (★ with count), experience, verified steps, references
- Record + tenure footer row below stats
- Progress bar added above verification ladder
- Better spacing throughout (18-20px padding)
- Tier labels updated: "Enhanced" (not "Verified"), "Basic", "Unverified"

## Loop 6 — Access Request UX Fix
**Status:** COMPLETE
**Changes:**
- Replaced freeform textarea with structured intent radio buttons:
  - "I want to hire this worker"
  - "Check availability for a job"
  - "Get contact details"
  - "Comparing workers for a role"
- Radio button UI with amber highlight on selection
- Submit disabled until intent selected
- Cleaner copy: "The worker will review your request and decide what to share"

## Loop 7 — Agency Experience as First-Class
**Status:** COMPLETE
**Changes:**
- Agency tab added to bottom nav bar for hirer role users
- Agency dashboard already functional from prior work (categories, localities, worker roster)

## Loop 8 — Worker Dashboard + Verification Ladder
**Status:** COMPLETE
**Changes:**
- Trust card header: shows category label, locality, experience, languages, availability badge
- Next step nudge: amber card showing the next incomplete verification step with "Do it" CTA
- Better spacing: 12px→14px stat padding, 3px→5px label gaps
- Tier labels consistent with worker detail (Enhanced/Basic/Unverified)

## Loop 9 — Hirer Dashboard + Demo Flow Cleanup
**Status:** COMPLETE
**Changes:**
- Active access grants now show worker names (from join) instead of just field names
- Worker skills shown alongside expiry date
- Category grid unchanged (already functional)
- Search CTA unchanged (already prominent)

## Loop 10 — Final Web Polish + Shippability Pass
**Status:** COMPLETE
**Changes:**
- Responsive CSS verified: mobile breakpoints at 640px and 380px
- Stats grids collapse to 2-col on mobile, 1-col on small mobile
- Category grid: 5-col default, 3-col on small mobile
- Incidents page has fair-reporting explainer and proper empty state
- All pages build successfully (0 errors, 12 routes)
- Consistent padding: 18-20px on card internals
- Consistent badge styling across all surfaces
