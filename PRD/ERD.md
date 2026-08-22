# Marg — Engineering Requirement Document (ERD)

**Status:** Draft for approval
**Owner:** Engineering
**Companion documents:** `PRD/PRD.md` (product problem/solution), `PRD/Design.md` (design system), `docs/SUPABASE_IMPLEMENTATION_PLAN.md` (full schema, RLS, auth integration), `docs/GO_LIVE_READINESS.md` (full launch-gate checklist), `CODEX_END_TO_END_IMPLEMENTATION_BRIEF.md` (curriculum content and screen-level implementation spec)

This document sits one level above those four: it states *what the system must do and hold true* (requirements) and *in what order it gets built* (implementation plan). It does not repeat their detail — each requirement below links to the section that specifies it fully, so this stays the one place to check "are we building the right thing, in the right order," while the linked docs stay the one place to check "exactly how."

---

## 1. Purpose & Scope

Marg today is a working prototype: curriculum, assessment routing, daily lessons, Saturday Build, Sunday Practice, and Home/Courses/Progress are implemented against **client-side, `localStorage`-only state and simulated authentication**. This ERD covers what's required to take that prototype to a real, multi-device, secure production product — identity, persistence, authorization, and the operational surface around it — and the order in which to build it. It does not cover curriculum content (owned by `CODEX_END_TO_END_IMPLEMENTATION_BRIEF.md`) or visual design (owned by `Design.md`).

---

## 2. Functional Requirements

Derived from the PRD's MVP scope (`PRD.md` §9) and the current implementation:

| # | Requirement | Status | Detail |
| :-- | :-- | :-- | :-- |
| F1 | Three-question assessment produces an explainable path (entry level + guidance level + first applied module) | Built (client-side logic) | `lib/learning/assessment.ts`; schema in Supabase plan §5 `assessment_results` |
| F2 | Learner completes Monday–Friday lessons with a 3-question check per unit | Built | Supabase plan §5 `unit_progress`, `quiz_attempts` |
| F3 | Learner completes a guided Saturday Build using ChatGPT or Claude against a mock scenario | Built | Supabase plan §5 `build_progress` |
| F4 | Learner completes an independent Sunday Practice adaptation | Built | Supabase plan §5 `practice_progress` |
| F5 | Home, Courses, Progress reflect real completion state, never mock data | Built (client-side) | Must be re-derived server-side once persistence moves off `localStorage` |
| F6 | Learner can leave and resume from the same point, on any device | **Not built** — requires accounts | Supabase plan §1, §3 |
| F7 | Sign-up, sign-in, sign-out, password reset, Google OAuth | **Not built** — UI is simulated | Supabase plan §8 (Auth) |
| F8 | Protected `/app/**` routes reject unauthenticated access | **Not built** | Supabase plan §4 (Architecture), §7 (RLS) |
| F9 | In-app/push nudge on an incomplete day, opening directly into the pending lesson | Partially built (UI only, no delivery) | See §7 Resolved Decisions — nudges ship as app/push, not email/SMS, at launch |
| F10 | Account data export and account deletion | **Not built** | Supabase plan §3 (in scope), §7 (RLS delete rules) |
| F11 | One-time import of a learner's valid local (pre-account) progress into their new account | **Not built** | Supabase plan §9 (Migration) |

---

## 3. Non-Functional Requirements

- **Security & authorization** — every learner-owned table isolated by row-level security; no client-authoritative scoring or unlock state (server recomputes quiz scores and unlock eligibility from curriculum + prior completion, never trusts a client-submitted value). Full matrix: Supabase plan §7.
- **Privacy** — no pasted workplace data, files, or real company material is ever accepted or stored (product decision, PRD §6 Platform Architecture); Sunday Practice reflection text is learner content, excluded from analytics, and removed on account deletion (Supabase plan §5, `practice_progress`).
- **Data integrity** — server timestamps only (never trust device time); transactional writes for assessment+path creation and quiz submission+unit completion (Supabase plan §6).
- **Availability & recovery** — staged environments (dev/staging/production), backup/restore drills within an agreed RTO before launch (Supabase plan §11–12 Phase E; Go-Live §3 "Reliability and operations").
- **Accessibility** — WCAG AA contrast (already enforced at the token level — see `Design.md` §1 eyebrow-label rule), keyboard focus, semantic headings, minimum touch targets across all screens (Go-Live §4 "Accessibility and responsive quality").
- **Performance** — authenticated pages render dynamically (no shared ISR caching on user-specific data, since RLS is the authorization boundary, not the cache layer) (Supabase plan §4).
- **Observability** — real analytics events replace the current no-op wrapper; error monitoring in place before launch (Go-Live §4 "Analytics and product learning"; §3 "Security").

---

## 4. System Architecture

```text
Browser
  ├─ public pages and auth forms
  └─ authenticated app UI
          │ secure session cookie
          ▼
Next.js
  ├─ Server Components: authenticated reads
  ├─ Server Actions: validated mutations
  ├─ Route Handlers: OAuth callback, export and deletion
  └─ Supabase clients: browser + server/cookie client
          │ user JWT / server credentials where explicitly required
          ▼
Supabase
  ├─ Auth (email/password + Google OAuth, PKCE, cookie-based SSR sessions)
  └─ Postgres + Row Level Security
```

Full architecture rationale and the "why Supabase" decision: Supabase plan §1 and §4. This diagram is reproduced here (not just linked) because it's the one fact every subsequent engineering decision in this document depends on.

**Explicit non-goals**, carried from both the PRD and the Supabase plan, restated because they bound every requirement above: no in-product execution of the learner's AI workflow, no production RAG/vector search, no curriculum-in-database migration this milestone, no instructor dashboards, no team/cohort/billing features, no Realtime subscriptions (Supabase plan §3; PRD §4 Non-goals).

---

## 5. Data Model (Summary)

Nine tables, all `uuid`-keyed, `timestamptz`-timestamped, snake_case, every learner-owned table carrying `user_id references auth.users(id) on delete cascade`:

`profiles` · `assessment_results` · `learning_paths` · `learning_path_modules` · `unit_progress` · `quiz_attempts` · `build_progress` · `practice_progress` · (optional) `product_events`.

Design principles worth restating at this level because they shape the API contract, not just the schema:

- **Derive, never store, computed state.** `unit_progress` does not store `locked`/`available` — those are derived from assigned order and prior completion, so client and server can never drift out of sync (Supabase plan §5).
- **Attempts are append-only.** `quiz_attempts` keeps every attempt for auditability; a submitted attempt completes the unit regardless of score, matching current product behavior (Supabase plan §5).
- **Server is the only source of truth for scoring.** The server recalculates quiz score from the repository curriculum; a client-provided score is never authoritative (Supabase plan §5, §7 security tests).

Full column-level schema, indexing, and integrity rules: Supabase plan §5–§6.

---

## 6. Authorization Model (Summary)

RLS is enabled on every exposed table, default-deny, with explicit per-table policies. Baseline ownership check:

```sql
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id)
```

Ownership alone does not enforce invariants like "can't add a module outside your deterministic assigned path" — those are enforced in validated Server Actions or narrowly scoped database functions, never left to RLS alone. Six required security tests (cross-user isolation, anonymous access, out-of-path writes, locked-unit writes, forged scores, cascade-on-delete) are specified in Supabase plan §7 and must pass before Phase B is considered complete (§8 below).

---

## 7. Resolved & Open Product-Engineering Decisions

The Supabase plan (§13) and Go-Live checklist (§3) both flag a set of decisions that block implementation. Status as of this document:

### Resolved
- **Quiz feedback model:** per-question reveal (correctness + explanation shown immediately after each answer, not withheld until all three are submitted), and the current result-screen wording, are the approved behavior. The original implementation brief's "hide until all three submitted" instruction is stale and should be corrected wherever it's still referenced in tests or specs.
- **Nudge channel:** daily nudges ship as in-app/push notifications at launch. Email/SMS delivery is explicitly out of scope for launch — do not build or promise it in copy, settings, or onboarding consent language.
- **Authentication methods (launch baseline):** email/password plus Google OAuth; no Google API scopes beyond identity (Supabase plan §13, item 2).

### Still open — must be decided before Phase B/C begin
1. Launch geography and data residency (UK/EU/broader) — affects hosting region and legal copy.
2. Whether unverified (email-unconfirmed) users may enter the app before verifying.
3. Whether retaking the assessment creates a new path, supersedes the current one, or reorders it in place — while preserving completion by stable unit ID.
4. Whether a learner may open an unassigned module by direct URL — the UI filters course lists today, but production authorization must define server-side behavior, not just hide the link.
5. Retention periods for dormant accounts, quiz attempts, reflections, logs, and analytics.
6. Account export format and deletion grace period.
7. Expected launch traffic and recovery objectives (informs Phase E backup/restore RTO target).
8. Analytics/error-monitoring vendor selection and consent requirements.
9. Hosting provider and staging/production deployment workflow.
10. Target market: consumer learning, employer-sponsored, or both (affects whether org/seat concepts are needed later — explicitly not in this milestone).

Full detail on each: Supabase plan §13; Go-Live §3.

---

## 8. Implementation Plan

Five phases, each gated by acceptance criteria before the next begins. This mirrors and consolidates the Supabase plan's delivery phases (§12) and the Go-Live checklist's P0/P1/P2 tiers (§3–§5) into one build order; consult those documents for the exhaustive checklist behind each gate.

### Phase 0 — Local polish, then decisions (prerequisite, not Supabase build work)
Marg is deliberately still in local-prototype polish: known UI/UX/logic items (quiz feedback timing — now resolved, see §7 — result-screen wording, and the remaining product-polish items in Go-Live §3) get finished on local state before any Supabase work starts. This is a sequencing choice, not a technical dependency — do not begin Phase A until this polish pass is explicitly signed off. Once it is, resolve the open decisions in §7 above; several of them (retention periods, module URL access, hosting region) change schema or RLS design if decided late, so none of Phase A–E should start against an unresolved item on that list.

**Exit gate:** local UI/UX/logic polish is signed off, and every item in §7 "Still open" has an owner-approved answer, recorded back into this document.

### Phase A — Foundation
Stand up the Supabase project, migrations, and generated TypeScript types; write and pass schema/grants/RLS automated tests before any application code depends on them.
**Exit gate:** Supabase local stack and migrations reproducible from a clean checkout; generated types current in CI; RLS test suite passing (Supabase plan §12).

### Phase B — Authentication
Replace simulated sign-up/sign-in with real Supabase Auth (email/password + Google OAuth), protected `/app/**` routes, session refresh.
**Exit gate:** sign-up, verification, sign-in, OAuth, reset, sign-out all work in staging; protected routes reject unauthenticated access server-side; session refresh doesn't leak cached authenticated responses (Supabase plan §12).

### Phase C — Server Persistence
Move assessment, path, unit/quiz/build/practice progress from `localStorage` to Postgres via Server Actions/Route Handlers; server becomes authoritative for scoring and unlock state; Home/Courses/Progress read from real server state (closing F5 in §2 for the persisted case).
**Exit gate:** every learning unit persists across browsers and devices; all scoring/unlock decisions are server-authoritative; network failure, retry, and conflict states are visible and recoverable to the learner (Supabase plan §12).

### Phase D — Migration & Account Lifecycle
One-time import of valid local MVP progress into a new account (F11); account export and permanent deletion (F10).
**Exit gate:** valid local progress imports exactly once; export and deletion work end-to-end and match the retention decision from §7 item 5 (Supabase plan §12).

### Phase E — Production Readiness
Staging rehearsal against a production-like snapshot; backup/restore drill within the agreed RTO; load, security, accessibility, and end-to-end test passes; resolve every remaining Go-Live P0/P1 item not already covered above (real analytics, error monitoring, legal/privacy pages, support channel, deployment/CI runbook, notification and settings screens backed by real state instead of component memory).
**Exit gate:** Go-Live "Definition of ready" (Go-Live §8) is fully satisfied and signed off.

**Sequencing note:** Phases A–D are on the critical path in this exact order — persistence (C) cannot be built correctly without auth (B), and migration (D) cannot run without both. Content/curriculum work and design-system extension (`Design.md`) can proceed in parallel with any phase, since they don't depend on the persistence layer.

---

## 9. Testing & QA Requirements

- **Automated RLS/security tests** (§6 above) — required before Phase B exit, not deferred to Phase E.
- **Unit, end-to-end, and content-validation tests** — tooling already exists in the repo (Vitest, Playwright per `package.json`/`playwright.config.ts`); Go-Live's stated gap is CI wiring, not tooling absence (Go-Live §2, §6 "Required automated test matrix").
- **Manual QA on known requirement conflicts** — the items resolved in §7 (quiz feedback model, nudge channel) should get regression coverage added to the existing test suite so the resolution doesn't silently regress.

---

## 10. Launch Readiness

The authoritative, exhaustive launch checklist is `docs/GO_LIVE_READINESS.md` — this document does not duplicate its P0/P1/P2 item list. In summary: **P0** covers the product decisions in §7 plus everything in Phases A–D above; **P1** covers product quality, accessibility, performance, analytics, and communications polish; **P2** is post-launch. Do not treat this ERD's Phase E as complete until Go-Live's own "Definition of ready" (Go-Live §8) passes — that section is the actual sign-off gate, this document only sequences the work that leads to it.

---

## References

- `PRD/PRD.md` — problem statement, MVP scope, success metrics.
- `PRD/Design.md` — design system and screen patterns.
- `docs/SUPABASE_IMPLEMENTATION_PLAN.md` — full schema, RLS matrix, auth integration, delivery phases (§1–§14).
- `docs/GO_LIVE_READINESS.md` — full P0/P1/P2 launch checklist, test matrix, launch-day runbook (§1–§10).
- `CODEX_END_TO_END_IMPLEMENTATION_BRIEF.md` — curriculum content, screen-level flows, milestone breakdown (§1–§19, Appendix A).
