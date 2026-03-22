# Loop Status

## Purpose
Track completed loops, blockers, checks, and commits.

## Loop Template

### Loop #
### Objective:
### Files Changed:
### Checks Run:
### Commit:
### Result:
### Remaining Weakness:
### Next Recommended Loop:

---

## Rules
- update after every loop
- include exact commit hash/message
- include whether loop changed visible product behavior
- include blockers clearly

---

### Loop 1
### Objective: Rewrite homepage below-the-fold to sell a marketplace, not a trust/verification product
### Files Changed:
- `apps/web/src/app/page.tsx`
### Checks Run:
- `pnpm build` — 11/11 tasks successful, 0 errors
### Commit: (this commit)
### Result:
Visible product behavior changed. Homepage now sells a marketplace:

**Before:**
- "How it works" led with "Workers create a trust card" — verification internals
- "Why SafeHire" was defensive: "Not a blacklist", "Consent required" — trust product language
- Sample trust card was a static decorative element
- No agency presence on homepage
- CTA said "Free for workers. Always." — worker-focused, not marketplace-focused
- Footer: "Verified trust for India's domestic workforce" — trust product

**After:**
- "How it works" is now marketplace flow: Search → Compare → Request/Book/Hire
- Sample results section shows 3 realistic worker cards (agency-backed vs independent, available vs not, rated vs unrated) with a "See all cooks →" link
- New "Agencies on SafeHire" section with 2 sample agency cards and agency CTA
- "Why SafeHire" rewritten as marketplace value: ratings, verification, independent + agency, free for workers
- CTA has 3 paths: Find help / List yourself free / Register your agency
- Footer: "Local labor marketplace for India"

### Remaining Weakness:
- Sample results and agency cards are hardcoded — not from real data
- No actual agency browsing page for hirers (only agency's own dashboard exists)
- Search result cards still lack photo placeholders and CTA buttons
- Worker detail page still foregrounds consent/access mechanics over service quality

### Next Recommended Loop:
Search result card quality — add photo placeholder, clearer independent-vs-agency distinction, and a visible CTA on each card. This is the next biggest conversion gap after homepage.
