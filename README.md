# SafeHire

**A privacy-first, worker-owned digital trust identity for India's informal workforce.**

SafeHire gives domestic workers, drivers, cooks, cleaners, nannies, electricians, plumbers, and security guards a portable, verified trust profile they own and control. Hirers get the safety signals they need without resorting to blacklists, surveillance, or unregulated WhatsApp groups.

---

## Product Principles

1. **Privacy first.** Collect minimum necessary data. Encrypt everything. Default to not sharing.
2. **Worker ownership.** The trust identity belongs to the worker, not the platform.
3. **No blacklists.** Context and patterns over punishment. Every report is reviewed.
4. **Consent is continuous.** Not a one-time checkbox. Workers can revoke access at any time.
5. **Explainable trust.** Every trust signal is transparent and understandable.
6. **Due process.** Every negative action has an appeals path with human review.
7. **Dignity in design.** The product treats workers as professionals.
8. **Accessibility.** Designed for low-literacy, low-bandwidth, low-cost devices.
9. **Auditability.** Every data access, consent grant, and moderation decision is logged.
10. **Regulatory alignment.** Built to comply with DPDP Act 2023, Aadhaar Act, and applicable state laws.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo + pnpm |
| Web apps (hirer, admin) | Next.js, React, TypeScript |
| Mobile app (worker) | React Native / Expo, TypeScript |
| API layer | tRPC (end-to-end type safety) |
| Backend / database | Supabase (Postgres, Auth, Storage, Edge Functions, Row Level Security) |
| Language | TypeScript throughout |

---

## Repository Structure

```
safehire/
  apps/
    web/              Next.js web app (hirer-facing: search, view Trust Cards, report incidents)
    mobile/           React Native/Expo app (worker-facing: register, verify, Trust Card)
    admin/            Next.js admin panel (moderation, incident review, audit logs)
  packages/
    api/              tRPC router and procedures (shared API layer)
    auth/             Authentication utilities (OTP, session management)
    config/           Shared configuration (env, constants)
    db/               Supabase schema, migrations, RLS policies, seed data
    incidents/        Incident reporting and appeals logic
    privacy/          Consent management, data access controls, audit logging
    trust/            Trust Card generation and scoring logic
    types/            Shared TypeScript type definitions
    ui/               Shared UI component library
    utils/            Common utility functions
  supabase/           Supabase project configuration, Edge Functions, local dev setup
  docs/
    product/          Product vision, PRD, personas, MVP scope
    market/           Market analysis, competitive research
    architecture/     System architecture, data flow diagrams
    privacy/          Privacy impact assessment, DPDP compliance
    adr/              Architecture Decision Records
    operations/       Runbooks, incident response procedures
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **pnpm** >= 8.x (`npm install -g pnpm`)
- **Supabase CLI** (`brew install supabase/tap/supabase` on macOS)
- **Expo CLI** (`npx expo` -- no global install needed)
- **Android Studio** or a physical Android device (for mobile development)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/safehire.git
cd safehire

# Install dependencies
pnpm install
```

### Environment Setup

1. Create a Supabase project at https://supabase.com
2. Run the migration against your project:
   ```bash
   # Via Supabase CLI (if project is linked)
   npx supabase db push
   # Or paste supabase/migrations/00001_initial_schema.sql in the Supabase SQL editor
   ```
3. Copy env file and fill in values:
   ```bash
   cp .env.example apps/web/.env.local
   cp .env.example apps/admin/.env.local
   ```

Required environment variables:

```
APP_ENV=development                        # Controls security behavior (see below)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DEV_AUTH_SECRET=any-secret-string-for-dev   # Only used in development/test
```

**Not needed yet (not integrated):** DigiLocker, SMS provider, Aadhaar APIs.

### Environment Behavior (APP_ENV)

| APP_ENV | Dev Auth | Dev Crypto Keys | RLS Enforcement |
|---|---|---|---|
| `development` (default) | Allowed | Allowed | tRPC middleware only |
| `test` | Allowed | Allowed | tRPC middleware only |
| `staging` | **BLOCKED** | **REQUIRED** | Supabase Auth + RLS |
| `production` | **BLOCKED** | **REQUIRED** | Supabase Auth + RLS |

In staging/production:
- Dev auth endpoints (`register`, `verifyOtp`) return 403
- Dev HMAC tokens are silently rejected
- `FIELD_ENCRYPTION_KEY` and `HASH_PEPPER` must be set (app crashes on startup if missing)
- Supabase Auth with real SMS provider is required

### Start Local Development

```bash
# Install dependencies
npx pnpm@9 install

# Type check (19/19 packages pass)
npx pnpm@9 typecheck

# Lint (19/19 packages pass)
npx pnpm@9 lint

# Run tests (36 tests across trust, privacy, auth)
npx pnpm@9 --filter=@verifyme/trust exec vitest run
npx pnpm@9 --filter=@verifyme/privacy exec vitest run
npx pnpm@9 --filter=@verifyme/auth exec vitest run

# Run all apps in development mode
npx pnpm@9 dev
# Web app at http://localhost:3000
# Admin panel at http://localhost:3001
```

### Authentication (Dual Mode)

The auth system supports two modes, gated by `APP_ENV`:

**Supabase Auth (primary):** Used in all environments when a valid Supabase JWT is present. Requires a Supabase project with phone OTP configured (Twilio or similar SMS provider). JWTs verified via `supabase.auth.getUser()`. RLS policies apply per-user.

**Dev Auth (fallback, development/test only):** HMAC-signed dev tokens. Blocked entirely when `APP_ENV=staging` or `APP_ENV=production`.
- **OTP code is always `123456`** — no real SMS.
- Tokens expire after 7 days.
- Operations use `service_role` key, bypassing RLS (auth enforced at tRPC middleware layer).
- Labeled as "DEV AUTH" in code and UI.

The `extractSession` middleware tries Supabase JWT first (3-part JWT), then dev HMAC token (2-part, only in dev/test). The auth mode is in the `getSession` response (`authMode: "supabase" | "dev"`).

### Demo Flow (Dev Auth)

**Worker sign in + profile:**
1. Open http://localhost:3000/login
2. Select "Worker", enter a phone number (e.g. `+911111111111`), click "Send OTP"
3. Enter `123456`, click "Verify OTP" → redirects to `/dashboard`
4. Click "Create Profile", fill in name/skills/experience, submit
5. Dashboard now shows your profile and trust card

**Hirer search + limited view:**
6. Open a new browser/incognito, go to http://localhost:3000/login
7. Select "Hirer", use a different phone number (e.g. `+912222222222`), verify with `123456`
8. Click "Search" in nav, search for the worker by name or skill
9. Click a worker → trust card is visible, but profile data says "No Consent"

**Hirer request access:**
10. On the trust card page, type an optional message and click "Request Access"
11. Go to "Consent" in nav → see your pending request with "pending" status

**Worker approve/reject:**
12. Switch back to the worker browser
13. Dashboard shows "1 pending access request" banner → click it
14. On the consent page, see the hirer's request → click "Approve" or "Reject"

**Hirer expanded view after consent:**
15. Switch to the hirer browser, refresh the worker trust card page
16. If approved: "Consent Granted" with expanded profile data (name, skills, etc.)
17. If rejected: still shows "No Consent"

**Worker revoke:**
18. As the worker, go to /consent, find the active grant, click "Revoke"
19. As the hirer, refresh → limited view again

**Admin audit log:**
20. Create an admin user via the database or a script
21. Open http://localhost:3001 (admin panel), log in with the admin token
22. View the audit log — all consent grants, revocations, data access events are logged

---

## Contributing

Contributions are welcome. Before contributing, please note:

1. **Read the product principles** above. All contributions must align with these principles, particularly privacy-first design and worker dignity.
2. **Privacy review.** Any feature that touches personal data, consent, or disclosure must be reviewed for DPDP Act compliance before merge.
3. **Accessibility.** UI changes must maintain support for low-end Android devices (Android 8.0+, 2GB RAM, 720p screens) and meet minimum touch target sizes (48x48 dp).
4. **Localization.** All user-facing strings must be externalized for translation. Do not hardcode English or Hindi strings in components.
5. **Testing.** Include tests for new functionality. Incident reporting, consent management, and appeals flows require integration tests.

### Branching

- `main` -- production-ready code
- `develop` -- integration branch for in-progress work
- Feature branches: `feature/description`
- Bug fixes: `fix/description`

### Pull Requests

- Keep PRs focused. One feature or fix per PR.
- Include a description of what changed and why.
- Link to relevant product docs or issues.
- Ensure all CI checks pass before requesting review.

---

## Documentation

| Document | Description |
|---|---|
| [Product Vision](docs/product/vision.md) | Mission, vision, 3-year horizon |
| [PRD](docs/product/prd.md) | Product requirements, user stories, features |
| [Personas](docs/product/personas.md) | Detailed user personas for workers, hirers, agencies |
| [MVP Scope](docs/product/mvp-scope.md) | What is in and out of scope for MVP |
| [India Market Analysis](docs/market/india-analysis.md) | Market size, regulation, competition, GTM |

---

## License

License to be determined. This codebase is currently private.

---

## Contact

For questions about the project, open an issue in this repository.
