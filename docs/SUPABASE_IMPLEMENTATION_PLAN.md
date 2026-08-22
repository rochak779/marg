# Supabase Implementation Plan

Status: proposed architecture for approval  
Owner: engineering  
Last reviewed: 21 August 2026

## 1. Decision

Use Supabase as Marg's production identity and persistence platform:

- Supabase Auth for email/password, password reset, email verification and Google OAuth.
- Supabase Postgres for learner profiles, assessment results, assigned paths and progress.
- Postgres Row Level Security (RLS) for user-level data isolation.
- Next.js Server Components, Server Actions and Route Handlers for authenticated reads and mutations.
- Version-controlled Supabase migrations and generated TypeScript database types.

This replaces the prototype authentication and versioned `localStorage` persistence. It does not add AI inference, file uploads, Realtime, vector search or a curriculum CMS.

## 2. Current state

The application currently has:

- simulated sign-up and sign-in forms with no identity verification;
- one `LearningState` object saved under `marg-learning-state-v1` in browser storage;
- deterministic assessment and path routing;
- stable unit IDs such as `module-2-wednesday`;
- repository-owned, runtime-validated curriculum JSON;
- a typed but no-op analytics wrapper.

The current state shape is a useful migration contract, but it must not become a single production JSON blob. Queryable progress and attempts should be normalized into tables.

## 3. Scope and non-goals

### In scope

- Account creation, verification, sign-in, sign-out and password recovery.
- Protected `/app/**` routes.
- Cross-device progress and resume.
- Assessment/path persistence.
- Unit completion, quiz attempts, Build progress and Practice reflections.
- One-time import of valid local MVP state.
- Account export and deletion support.
- Development, staging and production database environments.
- RLS tests, migrations, backups and operational runbooks.

### Out of scope for this milestone

- Moving curriculum prose into Postgres.
- Admin or instructor dashboards.
- Team workspaces, cohorts, billing or subscriptions.
- Storing pasted workplace material or files.
- Live AI execution, embeddings or a vector database.
- Realtime subscriptions.
- Audio narration of lesson text. Candidate post-launch enhancement; would require new object storage (not covered by this plan) and should be evaluated against real usage data after launch.
- Leaderboard. Candidate post-launch enhancement; would require cross-user readable progress/scoring (a new authorization model distinct from the owner-only RLS in section 7) and a product decision on what's ranked and whether it's opt-in. Revisit after launch.
- Challenge mode (head-to-head against another platform user or a computer opponent). Candidate post-launch enhancement; needs real-time state shared between two parties (a new capability beyond this plan's owner-only, non-Realtime model), matchmaking/invite design, and a fairness model for a computer opponent. Revisit after launch.

## 4. Architecture

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
  ├─ Auth
  └─ Postgres + RLS
```

Use cookie-based SSR authentication with PKCE. Authenticated pages must be dynamic and must not use shared ISR caching. Never expose the service-role key to the browser. The publishable key may be public only because RLS and grants provide the authorization boundary.

## 5. Proposed schema

Use `uuid` primary keys, `timestamptz` timestamps and snake_case SQL names. Every learner-owned table includes `user_id uuid not null references auth.users(id) on delete cascade`.

### `profiles`

One row per account.

| Column                | Type          | Notes                                            |
| --------------------- | ------------- | ------------------------------------------------ |
| `user_id`             | `uuid`        | PK and FK to `auth.users`                        |
| `first_name`          | `text`        | trimmed; length constrained                      |
| `daily_nudge_enabled` | `boolean`     | default false until notification delivery exists |
| `timezone`            | `text`        | optional IANA timezone                           |
| `created_at`          | `timestamptz` | server default                                   |
| `updated_at`          | `timestamptz` | maintained by trigger/application                |

Email remains owned by Supabase Auth and is not duplicated here.

### `assessment_results`

Keep attempts for auditability and allow one current result.

| Column            | Type            | Notes                                                |
| ----------------- | --------------- | ---------------------------------------------------- |
| `id`              | `uuid`          | PK                                                   |
| `user_id`         | `uuid`          | indexed                                              |
| `beyond_drafting` | `boolean`       | raw Q1                                               |
| `work_context`    | enum/text check | feedback, requests, communication, prototyping       |
| `built_workflow`  | `boolean`       | raw Q3                                               |
| `entry_level`     | enum/text check | basic or advanced                                    |
| `guidance_level`  | enum/text check | full or reduced                                      |
| `is_current`      | `boolean`       | one current result per user via partial unique index |
| `completed_at`    | `timestamptz`   | server time                                          |

### `learning_paths`

| Column                 | Type            | Notes                         |
| ---------------------- | --------------- | ----------------------------- |
| `id`                   | `uuid`          | PK                            |
| `user_id`              | `uuid`          | one active path per user      |
| `assessment_result_id` | `uuid`          | FK                            |
| `content_version`      | `integer`       | starts at 1                   |
| `status`               | enum/text check | active, completed, superseded |
| `started_at`           | `timestamptz`   | server time                   |
| `completed_at`         | `timestamptz`   | nullable                      |
| `updated_at`           | `timestamptz`   | concurrency/audit timestamp   |

### `learning_path_modules`

Stores personalized order without duplicating curriculum.

| Column      | Type       | Notes              |
| ----------- | ---------- | ------------------ |
| `path_id`   | `uuid`     | FK, part of PK     |
| `user_id`   | `uuid`     | allows simple RLS  |
| `module_id` | `smallint` | 1–5, part of PK    |
| `position`  | `smallint` | unique within path |

### `unit_progress`

One durable row per attempted or completed assigned unit.

| Column         | Type            | Notes                                            |
| -------------- | --------------- | ------------------------------------------------ |
| `user_id`      | `uuid`          | part of PK                                       |
| `path_id`      | `uuid`          | FK                                               |
| `unit_id`      | `text`          | stable curriculum ID, part of PK                 |
| `status`       | enum/text check | started or completed; lock state remains derived |
| `started_at`   | `timestamptz`   | nullable                                         |
| `completed_at` | `timestamptz`   | nullable                                         |
| `updated_at`   | `timestamptz`   | conflict resolution                              |

Do not store `locked` or `available`; derive them from assigned order and prior completion so state cannot drift.

### `quiz_attempts`

Append-only attempts. A submitted attempt completes the weekday unit regardless of score, matching current progression rules.

| Column           | Type          | Notes                       |
| ---------------- | ------------- | --------------------------- |
| `id`             | `uuid`        | PK                          |
| `user_id`        | `uuid`        | indexed                     |
| `path_id`        | `uuid`        | FK                          |
| `unit_id`        | `text`        | indexed                     |
| `attempt_number` | `integer`     | unique per user/path/unit   |
| `answers`        | `smallint[]`  | exactly three valid indexes |
| `score`          | `smallint`    | check 0–3                   |
| `submitted_at`   | `timestamptz` | server time                 |

The server calculates score from repository curriculum. Do not accept a client-provided score as authoritative.

### `build_progress`

| Column                          | Type            | Notes                        |
| ------------------------------- | --------------- | ---------------------------- |
| `user_id`, `path_id`, `unit_id` | mixed           | composite identity           |
| `tool`                          | enum/text check | chatgpt or claude            |
| `checked_steps`                 | `smallint[]`    | validated against curriculum |
| `checked_criteria`              | `smallint[]`    | validated against curriculum |
| `ran_workflow`                  | `boolean`       | completion requirement       |
| `completed_at`                  | `timestamptz`   | nullable                     |
| `updated_at`                    | `timestamptz`   | server time                  |

### `practice_progress`

| Column                          | Type          | Notes                        |
| ------------------------------- | ------------- | ---------------------------- |
| `user_id`, `path_id`, `unit_id` | mixed         | composite identity           |
| `checked_rules`                 | `smallint[]`  | validated indexes            |
| `reflections`                   | `jsonb`       | question index to short text |
| `revealed_hints`                | `smallint`    | non-negative                 |
| `completed_at`                  | `timestamptz` | nullable                     |
| `updated_at`                    | `timestamptz` | server time                  |

Reflection text is learner content. It must have a documented retention period, must not be sent to product analytics and must be removed on account deletion.

### Optional `product_events`

Prefer a dedicated analytics provider unless first-party event storage is a deliberate decision. If retained in Postgres, store only allowlisted event names and non-sensitive properties. Never store lesson prose, reflection text, pasted work data, passwords or auth tokens.

## 6. Integrity and indexes

- Unique current assessment per user.
- Unique active learning path per user.
- Unique `(path_id, position)` and `(path_id, module_id)`.
- Unique `(user_id, path_id, unit_id)` for unit/build/practice progress.
- Unique `(user_id, path_id, unit_id, attempt_number)` for quiz attempts.
- Index all `user_id`, active path, unit and recent-completion lookup columns.
- Foreign keys use `on delete cascade` for user-owned learning data.
- Use database checks for enums, score ranges, positive attempts and module ranges.
- Use transactions for assessment submission + path creation and quiz submission + unit completion.
- Use server timestamps rather than trusting device time.

## 7. RLS and authorization matrix

Enable RLS on every exposed table. Default to no access, then add explicit policies.

| Table                   | Select   | Insert            | Update                  | Delete                         |
| ----------------------- | -------- | ----------------- | ----------------------- | ------------------------------ |
| `profiles`              | own row  | own row           | own row                 | server-controlled account flow |
| `assessment_results`    | own rows | own user ID       | no direct client update | no direct client delete        |
| `learning_paths`        | own rows | server action     | server action           | no direct client delete        |
| `learning_path_modules` | own rows | server action     | none                    | none                           |
| `unit_progress`         | own rows | own assigned path | own assigned path       | none                           |
| `quiz_attempts`         | own rows | own assigned unit | none; append-only       | none                           |
| `build_progress`        | own rows | own assigned unit | own row                 | none                           |
| `practice_progress`     | own rows | own assigned unit | own row                 | none                           |

Baseline ownership expression:

```sql
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id)
```

Ownership alone is insufficient for path/module creation. Complex invariants should be enforced through validated Server Actions or narrowly scoped database functions. Service-role operations are restricted to trusted server code and administrative jobs.

Required security tests:

- User A cannot read or mutate User B's rows.
- Anonymous requests cannot access learner tables.
- A user cannot add a module outside the deterministic assigned path.
- A user cannot complete a locked unit by writing directly to the API.
- A user cannot submit an invalid answer index or forged score.
- Deleting an auth user removes all learner-owned data.

## 8. Application integration

### Auth

- Install the current Supabase JavaScript and SSR packages after implementation approval.
- Create browser and server client factories.
- Add the framework-required request proxy/session refresh mechanism.
- Implement email verification, OAuth callback, password reset and sign-out.
- Protect `/app/**`, recommendation and assessment-resume routes on the server.
- Redirect authenticated users away from sign-in/sign-up where appropriate.
- Do not trust `getSession()` alone for server authorization; validate authenticated claims/user using the current Supabase server guidance.

### Google OAuth

Google sign-in is a launch requirement because both sign-up and sign-in already expose Google controls. Implement those controls through Supabase Auth; do not maintain a separate Google identity store.

#### Provider configuration

1. Create separate Google Cloud projects/OAuth clients for local development, staging and production.
2. Configure the Google Auth Platform audience, branding and data-access screens.
3. Request only `openid`, email and profile scopes. Marg does not need Google Drive, Calendar or other Google API access.
4. Create a Web application OAuth client for each environment.
5. Add the exact application origin under Authorized JavaScript origins.
6. Add the Supabase project's Google callback URL under Authorized redirect URIs. Hosted projects use the callback shown in the Supabase Google provider settings; local Supabase uses `http://127.0.0.1:54321/auth/v1/callback`.
7. Store the Google Client ID and Client Secret in Supabase/provider secret configuration, never in repository files.
8. Enable the Google provider separately in local, staging and production Supabase projects.
9. Configure each Supabase Site URL and redirect allowlist. Production allows only the canonical HTTPS domain and exact callback routes; preview wildcards must never be added to production.
10. Submit Google consent-screen branding/domain verification early because review can take several business days.

Use a custom Supabase Auth domain such as `auth.<marg-domain>` if approved. This makes the Google consent screen visibly related to Marg instead of exposing a Supabase project hostname.

#### Application flow

```text
Google button
  → Supabase signInWithOAuth(provider: google, redirectTo: /auth/callback)
  → Google consent/authentication
  → Supabase provider callback
  → Marg /auth/callback exchanges the PKCE code
  → validate safe next destination
  → create profile if first login
  → import local progress if eligible
  → redirect to assessment, recommendation or /app based on server state
```

The callback must accept only relative or allowlisted post-auth destinations to prevent open redirects. Show recoverable UI for user cancellation, provider denial, mismatched state, expired code, unavailable provider and missing verified email.

#### Identity and account-linking rules

- Supabase `auth.users.id` is the only account identifier used by application tables.
- Treat email as a mutable contact attribute, not a database key.
- Decide and test what happens when a Google identity uses the same verified email as an existing email/password account.
- Prefer Supabase's supported identity-linking behavior; do not merge two user IDs by updating foreign keys in application code.
- Provide an authenticated account-settings flow for linking or unlinking Google only if password/recovery access remains safe.
- Prevent unlinking the final usable identity unless the user establishes another sign-in method first.
- Do not request, store or refresh Google provider access tokens because Marg does not call Google APIs.
- Store only the minimum Google-derived profile data needed by Marg, currently display name and verified email through Supabase Auth.

#### Google OAuth acceptance tests

- New Google user creates exactly one Marg account and profile.
- Returning Google user resumes the same path and progress.
- Existing email/password user with the same verified email follows the approved linking rule without duplicate progress.
- Cancelled consent returns to a useful sign-in state.
- Invalid, expired and replayed callbacks are rejected.
- `next`/redirect parameters cannot leave approved Marg origins.
- Staging credentials cannot authenticate into production and vice versa.
- A removed/disabled Google identity cannot access Marg after the Supabase session expires or is revoked.
- Google sign-in works with third-party cookies blocked because the application session uses the approved first-party cookie setup.
- Privacy and terms links are present on sign-in/sign-up and match Google consent-screen configuration.

### Persistence boundary

Introduce an interface before replacing the provider:

```ts
interface LearningRepository {
  loadSnapshot(): Promise<LearningState>;
  saveAssessment(input: AssessmentAnswers): Promise<LearningState>;
  submitQuiz(input: {
    unitId: string;
    answers: number[];
  }): Promise<LearningState>;
  saveBuild(input: BuildProgressInput): Promise<LearningState>;
  savePractice(input: PracticeProgressInput): Promise<LearningState>;
}
```

Keep progression calculations pure where possible. Database mutations return a fresh authoritative snapshot. Use optimistic UI only where rollback and retry behavior are implemented.

### Server boundaries

- Parse every mutation with Zod on the server.
- Derive the user ID from the authenticated session, never request input.
- Derive module assignment, correct quiz answers, score and unlock eligibility on the server.
- Return stable typed errors: unauthenticated, forbidden, conflict, invalid input and unavailable.
- Log request IDs and error codes, not private learning content.

## 9. Local-state migration

After a user completes production authentication:

1. Read `marg-learning-state-v1` locally.
2. Validate it using the existing Zod schema.
3. Ask the user before importing if the account already has server progress.
4. Send a single import request with `content_version: 1` and an idempotency key.
5. Recalculate the path and quiz scores on the server; validate every unit ID.
6. Merge by stable unit ID. Preserve all valid completed units and append valid attempts.
7. Prefer the server record on ambiguous conflicts; never silently erase server progress.
8. Mark the import idempotency key as consumed.
9. Remove local learning state only after the server confirms success.
10. Keep a recovery message and retry path if import fails.

Do not automatically merge progress between two different authenticated accounts on the same browser.

## 10. Environments and delivery

Maintain separate local, staging and production projects. Production data must never seed non-production environments.

Commit:

- `supabase/config.toml` without secrets;
- ordered SQL migrations;
- non-sensitive local seed data;
- generated database TypeScript types;
- RLS/integration tests.

Environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY= # server-only; add only when a justified operation needs it
NEXT_PUBLIC_SITE_URL=
```

Use hosting secret management. Never commit `.env` files or expose the service-role key through a `NEXT_PUBLIC_` variable. Database schema changes go through reviewed migrations and CI, not ad-hoc production dashboard edits.

## 11. Operations

Before production:

- Select a specific region based on the primary user base and data-residency decision.
- Use a paid production project so inactivity pausing is impossible and backups/support are available.
- Configure custom SMTP and branded auth templates; disable link tracking that breaks one-time links.
- Configure production redirect URLs and prevent arbitrary redirects.
- Enable email confirmation, CAPTCHA and appropriate Auth rate limits.
- Enable SSL enforcement, database network restrictions where compatible and MFA for every Supabase organization administrator.
- Enable Security Advisor review and resolve findings.
- Define recovery objectives. Starting recommendation: RPO 24 hours/RTO 4 hours with daily backups; upgrade to PITR if product risk requires a lower RPO.
- Perform and record a restore drill before launch, then at least quarterly.
- Monitor database size, connections, slow queries, Auth failures, SMTP delivery and API errors.
- Keep at least two organization owners and document emergency access.

## 12. Delivery phases and acceptance gates

### Phase A — foundation

- Supabase local stack and migrations are reproducible from a clean checkout.
- Generated database types are current in CI.
- Schema, grants and RLS policies pass automated tests.

### Phase B — authentication

- Sign-up, verification, sign-in, Google OAuth, reset and sign-out work in staging.
- Protected routes reject unauthenticated access server-side.
- Session refresh works without leaking cached authenticated responses.

### Phase C — server persistence

- Assessment, path and every learning unit persist across browsers.
- All scoring and unlock decisions are authoritative on the server.
- Network failure, retry and conflict states are visible and recoverable.

### Phase D — migration and account lifecycle

- Valid local progress imports exactly once.
- Users can request an export and permanently delete their account.
- Retention and deletion behavior is verified end-to-end.

### Phase E — production readiness

- Staging migration rehearsal succeeds from a production-like snapshot.
- Backup restore drill succeeds within the agreed RTO.
- Load, security, accessibility and end-to-end tests pass.
- Go-live checklist is signed off.

## 13. Decisions required before implementation

1. Launch geography and required data residency: UK, EU or broader.
2. Authentication methods: email/password, magic link, Google, or a subset.
   - Current proposed launch baseline: email/password plus Google OAuth; no Google API scopes beyond identity.
3. Whether unverified users may enter the app.
4. Whether daily nudges ship at launch; if yes, provider, scheduling, timezone and unsubscribe behavior.
5. Retention periods for dormant accounts, quiz attempts, reflections, logs and analytics.
6. Whether learners can retake assessments while preserving or superseding the current path.
7. Account export format and deletion grace period.
8. Expected launch traffic and recovery objectives.
9. Analytics/error-monitoring vendors and consent requirements.
10. Hosting provider and production/staging deployment workflow.

## 14. References

- [Supabase SSR authentication](https://supabase.com/docs/guides/auth/server-side)
- [Supabase Google login](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Supabase Auth redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Supabase identity linking](https://supabase.com/docs/guides/auth/auth-identity-linking)
- [Supabase client setup for Next.js](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs&queryGroups=framework)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase local development workflow](https://supabase.com/docs/guides/local-development/cli-workflows)
- [Supabase production checklist](https://supabase.com/docs/guides/deployment/going-into-prod)
- [Supabase backups](https://supabase.com/docs/guides/platform/backups)
- [Supabase regions](https://supabase.com/docs/guides/platform/regions)
