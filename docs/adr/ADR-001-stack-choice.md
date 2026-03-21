# ADR-001: Technology Stack Choice

## Status

Accepted

## Date

2026-03-21

## Context

Verify Me is a privacy-first worker trust platform for India. The platform must serve three audiences through different interfaces: workers (primarily mobile, low-end Android devices, intermittent connectivity), hirers (web and mobile), and platform administrators (web). The system handles sensitive personal data subject to India's Digital Personal Data Protection Act (DPDPA) and requires strong security, privacy controls, and auditability from the outset.

Key technical requirements driving the stack decision:

- **Cross-platform reach.** Workers overwhelmingly use Android, but iOS support is needed for hirers and future growth. A web presence is essential for hirers and administrators.
- **Type safety across the entire stack.** PII handling demands that data shape mismatches are caught at compile time, not in production. A trust platform cannot afford runtime surprises where a field containing an Aadhaar number leaks into a response because of a typo.
- **Fast iteration with a small team.** Early-stage product with a team of 3-5 engineers. The stack must minimize boilerplate, context switching, and deployment ceremony.
- **Privacy by architecture.** Row-level security, field-level encryption, and audit logging must be first-class concerns, not afterthoughts bolted onto a generic backend.
- **India-specific constraints.** Must perform well on low-bandwidth networks (2G/3G), support multilingual UI (8+ languages), and handle OTP-based authentication as the primary auth method.

## Decision

We adopt the following technology stack:

### Next.js (Web Framework)

Next.js serves the hirer-facing web application and the admin panel. It provides server-side rendering for fast initial page loads on low-bandwidth connections, React Server Components for reducing client-side JavaScript, built-in API routes (used minimally -- tRPC handles most API traffic), and image optimization critical for trust card rendering. The React ecosystem gives us access to mature accessibility and internationalization libraries (react-intl, react-aria). Vercel deployment provides edge caching at Indian PoPs.

### Expo (Mobile Framework)

Expo powers the worker-facing mobile application. The decision to use Expo over bare React Native or Flutter rests on several factors:

- **OTA updates via EAS Update.** Critical for a trust platform where privacy-related fixes must reach users immediately without waiting for app store review cycles. A consent flow bug cannot sit in Apple's review queue for 48 hours.
- **Managed workflow.** Reduces native build complexity. The team does not need dedicated iOS or Android specialists.
- **Shared TypeScript.** Business logic, validation schemas (Zod), and type definitions are shared between web and mobile via Turborepo packages.
- **Expo SDK modules.** Camera (for document scanning), secure storage (for consent tokens), biometric auth, and push notifications are available through well-maintained Expo modules.

### TypeScript (Language)

TypeScript is used across the entire codebase: web, mobile, API layer, database client, shared packages, and infrastructure-as-code. A single language across the stack means any engineer can debug any layer. More importantly, shared type definitions between the API layer and clients ensure that the shape of a trust card response, a consent grant request, or an incident report is verified at compile time across all consumers.

### tRPC (API Layer)

tRPC provides end-to-end type safety between the API layer (Next.js API routes) and all clients (web, mobile, admin) without code generation or schema files. This decision is central to the platform's safety posture:

- **No codegen step.** Changes to a procedure's input or output type are immediately reflected in all callers. There is no stale client problem.
- **Procedure-level middleware.** Audit logging, consent verification, and rate limiting are applied as tRPC middleware, composable per-procedure.
- **Subscriptions.** tRPC supports WebSocket subscriptions for real-time trust card updates and admin notification feeds.
- **Smaller API surface.** Compared to REST or GraphQL, tRPC procedures map directly to use cases (getTrustCard, grantConsent, reportIncident) rather than generic resource endpoints that must be guarded against over-fetching.

### Supabase (Backend Platform)

Supabase provides managed PostgreSQL with row-level security (RLS), authentication, object storage, edge functions, and real-time subscriptions. The decision favors Supabase over Firebase or a custom backend for these reasons:

- **Row-Level Security.** RLS policies are the primary enforcement layer for data access control. A hirer can only see trust cards they have been granted consent to view. An admin can only see incidents assigned to their review queue. These rules live in the database, not in application code, making them auditable and immune to application-layer bugs.
- **PostgreSQL.** Full relational model with JSONB for flexible fields, pg_crypto for field-level encryption, and mature tooling for migrations, backups, and point-in-time recovery.
- **Auth with OTP.** Supabase Auth supports phone OTP out of the box, which is the primary authentication method for Indian workers who may not have email addresses.
- **Edge Functions.** Deno-based edge functions handle sensitive operations (encryption/decryption, trust card computation, external API calls to DigiLocker) in an isolated runtime, separate from the main application.
- **Storage with RLS.** Document uploads (ID verification images, endorsement attachments) are stored in Supabase Storage with bucket-level and object-level RLS policies.

### Turborepo (Monorepo Build Tool)

Turborepo orchestrates builds across the monorepo. The repository contains multiple apps (web, admin, mobile) and shared packages (api, db, ui, config, types). Turborepo provides:

- **Remote caching.** Build artifacts are cached remotely, so CI pipelines and developer machines do not rebuild unchanged packages.
- **Task dependency graph.** `turbo typecheck` and `turbo lint` run in the correct order, respecting package dependencies.
- **Parallel execution.** Independent packages build simultaneously.

### pnpm (Package Manager)

pnpm is used for dependency management across the monorepo. It provides disk-efficient storage through content-addressable linking (critical for CI caching costs), strict dependency resolution that prevents phantom dependencies, native workspace support with `pnpm-workspace.yaml`, and faster install times compared to npm and yarn, which matters for CI pipeline duration.

## Alternatives Considered

### Flutter (rejected)

Flutter was evaluated for mobile development. It offers excellent cross-platform UI fidelity and strong performance. However:

- **Separate language.** Dart introduces a second language into the stack. Shared business logic (validation schemas, type definitions, consent models) would need to be duplicated or maintained via code generation.
- **No type sharing with the backend.** The end-to-end type safety that tRPC provides between the API and TypeScript clients is lost with Dart.
- **Smaller ecosystem for India-specific needs.** React Native and Expo have more mature libraries for Indian payment gateways, Aadhaar verification, and DigiLocker integration.
- **OTA update limitations.** Flutter's Shorebird offers OTA updates, but the ecosystem is less mature than EAS Update.

### Firebase (rejected)

Firebase was evaluated as the backend platform. It offers rapid prototyping, real-time database, and generous free tier. However:

- **Vendor lock-in.** Firebase's proprietary query language and data model make migration difficult. For a platform handling sensitive personal data under DPDPA, the ability to migrate to self-hosted infrastructure is a compliance requirement.
- **Weaker access control.** Firebase Security Rules are less expressive than PostgreSQL RLS policies. Complex access patterns (e.g., "a hirer can see a worker's trust card only if the worker has an active consent grant that has not expired and covers the requested data scope") are difficult to express and audit in Firebase rules.
- **No relational model.** Firestore's document model does not naturally represent the relationships between workers, hirers, consent grants, incidents, endorsements, and trust cards. Denormalization leads to consistency challenges.
- **Data residency.** Firebase's India region options are limited compared to Supabase's ability to deploy to any cloud provider region or self-host.

### REST / GraphQL (rejected for primary API)

REST and GraphQL were evaluated as alternatives to tRPC:

- **REST** requires separate API documentation (OpenAPI), manual client type generation, and versioning. For a small team iterating rapidly on the data model, the overhead is significant.
- **GraphQL** offers typed schemas and flexible querying, but introduces a code generation step (graphql-codegen), a schema definition language separate from TypeScript, and over-fetching concerns that are particularly sensitive when the data includes PII. A GraphQL query that accidentally requests a field containing encrypted incident details is a privacy risk that tRPC's procedure-based model avoids.
- tRPC is chosen because it eliminates the gap between server and client types entirely. The server procedure's return type IS the client's response type, verified by the TypeScript compiler.

### Prisma (rejected for now)

Prisma was evaluated as an ORM layer over PostgreSQL:

- **Redundant with Supabase client.** Supabase's auto-generated TypeScript client already provides typed queries based on the database schema. Adding Prisma introduces a second schema definition (prisma.schema) that must be kept in sync with Supabase migrations.
- **RLS bypass risk.** Prisma connects directly to PostgreSQL, bypassing Supabase's RLS enforcement unless carefully configured with per-request connection parameters. This is a significant security risk for a privacy-first platform.
- **Edge function incompatibility.** Prisma's connection model (persistent connections, connection pooling) is not well-suited to Supabase Edge Functions' short-lived Deno runtime.
- **Future option.** If query complexity grows beyond what the Supabase client handles well (complex joins, aggregations), Prisma can be introduced for specific internal services that do not need RLS (e.g., analytics pipelines).

## Consequences

### Positive

- **Single language across the entire stack.** Any engineer can work on any layer. Onboarding time for new engineers is reduced.
- **Compile-time safety for PII handling.** Type mismatches that could expose sensitive data are caught before code reaches production.
- **Privacy enforcement at the database layer.** RLS policies cannot be bypassed by application bugs, providing defense in depth.
- **Fast iteration.** Changes to a tRPC procedure are immediately reflected in all clients without code generation or manual synchronization.
- **OTA updates for privacy fixes.** Critical consent or disclosure bugs can be patched on worker devices within hours, not days.

### Negative

- **Supabase dependency.** While Supabase is open-source and self-hostable, the managed service is a single point of failure. Mitigation: infrastructure-as-code (Terraform) for Supabase configuration, and documented self-hosting procedure.
- **tRPC ecosystem maturity.** tRPC is younger than REST/GraphQL tooling. Some advanced patterns (API gateways, third-party integrations) require more custom work. Mitigation: REST endpoints can be added alongside tRPC for external integrations.
- **Expo managed workflow constraints.** Some native modules may not be available in the managed workflow, requiring ejection. Mitigation: Expo's continuous native modules support reduces this risk, and the team monitors Expo SDK releases.
- **Turborepo learning curve.** Engineers unfamiliar with monorepo tooling need time to understand task pipelines and caching. Mitigation: documented workspace conventions and a setup guide.
