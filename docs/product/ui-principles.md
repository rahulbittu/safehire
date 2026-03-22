# SafeHire — UI Principles

**Last Updated:** 2026-03-22

---

## Design Tokens

```
Navy:    #0D1B2A  (primary text, headings)
Amber:   #C49A1A  (primary action, brand accent)
Green:   #16A34A  (verified, success, clean record)
Blue:    #1D4ED8  (agency-backed badge)
Sub:     #636366  (secondary text)
Muted:   #8E8E93  (tertiary text, labels)
Border:  #E5E5EA  (card borders, dividers)
BG:      #F7F6F3  (page background, off-white)
Error:   #DC2626  (errors, incidents, destructive actions)
```

## Typography

- Font: DM Sans (400, 500, 600, 700, 800)
- Page titles: 22px, weight 800, navy, letter-spacing -0.02em
- Card titles: 15-17px, weight 700, navy
- Body text: 13-14px, weight 400-500, sub or muted
- Labels: 12-13px, weight 700, navy or muted
- Section headers: 12px, weight 800, muted, uppercase, letter-spacing 0.08em
- Badges: 10-11px, weight 700, uppercase

## Spacing

- Page max-width: 520px
- Page padding: 24px 20px
- Card padding: 16-18px
- Card gap: 12px
- Card border-radius: 10-12px
- Button padding: 10-14px vertical, 20-24px horizontal
- Button border-radius: 10px

## Component Patterns

### Cards
- White background, 1px border, 10-12px radius
- No shadows (flat, not material design)
- Content-dense but not cramped

### Badges
- Pill-shaped: 3-4px vertical, 8-10px horizontal, 4-6px radius
- Verified: green bg (#DCFCE7), green text
- Agency: blue bg (#DBEAFE), blue text
- Unverified: gray bg (#F3F4F6), gray text
- Pending: amber bg (#FDF6E8), amber text

### Buttons
- Primary: amber bg, white text, 10px radius, weight 700
- Secondary: white bg, navy text, border, 10px radius
- Destructive: red bg (#DC2626), white text
- Disabled: 40% opacity of normal color

### Empty States
- Centered text in card
- Title: 14px sub
- Subtitle: 13px muted with actionable hint
- Never leave a surface blank — always explain what goes here and what to do

## Anti-Patterns to Avoid

1. No gradient backgrounds or gradient avatars
2. No emoji as primary UI elements (acceptable in category grid only)
3. No shadows or elevation
4. No "LinkedIn-like" layouts (banner + avatar + stats bar)
5. No paragraph-length descriptions in cards
6. No UUID display anywhere in the UI
7. No raw database column names
8. No "request access" with just a textarea
9. No inconsistent card styles across pages
