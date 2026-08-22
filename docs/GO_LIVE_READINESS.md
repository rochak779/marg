# Marg Go-Live Readiness Plan

Status: pre-production gap assessment  
Last reviewed: 21 August 2026

## 1. Executive finding

Marg is currently a strong interactive prototype, not a deployable production service. The curriculum and core learning logic are substantially implemented, but launch is blocked by simulated authentication, browser-only persistence and the absence of production security, legal, operational and support systems.

The Supabase work is necessary but not sufficient. Every P0 item below is a launch gate.

## 2. Current readiness snapshot

| Area                             | Current state                                                     | Launch status                             |
| -------------------------------- | ----------------------------------------------------------------- | ----------------------------------------- |
| Learning content and progression | Typed curriculum, deterministic path, quizzes, Build and Practice | Close; needs production acceptance review |
| Authentication                   | UI simulation only                                                | Blocked                                   |
| Persistence                      | Browser `localStorage` only                                       | Blocked                                   |
| Authorization                    | No protected server routes or RLS                                 | Blocked                                   |
| Analytics                        | Typed no-op wrapper                                               | Blocked for funnel visibility             |
| Error monitoring                 | No vendor or operational alerting                                 | Blocked                                   |
| Legal/privacy                    | No public privacy, terms or account-rights flow                   | Blocked                                   |
| Email                            | Daily-nudge preference exists; no delivery system                 | Must remove promise or implement          |
| Deployment                       | Dev scripts exist; no documented CI/CD or environments            | Blocked                                   |
| Backups/recovery                 | None for local state                                              | Blocked after database adoption           |
| Automated quality                | Unit, E2E, type and lint tooling exist                            | Good foundation; CI missing               |
| Support/operations               | No support channel, runbook or incident ownership                 | Blocked                                   |

## 3. P0 launch gates

### Product decisions

- [ ] Confirm target market and launch geography.
- [ ] Confirm whether this is consumer learning, employer-sponsored learning or both.
- [ ] Define minimum supported browsers/devices.
- [ ] Decide whether payments, invitations, organizations or admin access are launch scope. They are not currently implemented.
- [ ] Decide whether daily nudges are launch scope. Until delivery and unsubscribe exist, do not collect or imply this preference.
- [ ] Approve the Supabase architecture and unresolved decisions in `SUPABASE_IMPLEMENTATION_PLAN.md`.

### Known requirement conflicts to resolve

- [ ] Decide the final quiz-feedback model. The implementation brief requires answers and explanations to remain hidden until all three answers are submitted, while the approved 6a UI currently reveals correctness and an explanation after each question. Update the brief and tests once product chooses one behavior.
- [ ] Decide whether users may open a module that is not assigned to their path by entering its URL. Current UI filters courses, but production authorization must define direct-route behavior.
- [ ] Decide whether retaking the assessment creates a new path, supersedes the current path or reorders the existing path. Preserve valid completion by stable unit ID.
- [ ] Reconcile the lesson-navigation requirement. The brief requests previous/next lesson navigation and scroll restoration; the current lesson UI primarily returns to the module and advances through quiz completion.
- [ ] Replace or remove prototype notifications. The current notification screen is not backed by actual events or delivery.
- [ ] Replace or remove settings that currently change only component memory: daily reminder and notifications reset on reload and do not control a real service.
- [ ] Replace the disabled Account & security and Help & feedback rows with working destinations before launch.
- [ ] Confirm whether a score below 2/3 should say “Review recommended” on the result screen while still unlocking progression, as stated in the implementation brief.

### Identity and accounts

- [ ] Replace simulated sign-up/sign-in with Supabase Auth.
- [ ] Add email verification and resend behavior.
- [ ] Add forgotten-password and password-reset flows.
- [ ] Make Google OAuth functional or remove its buttons.
- [ ] Configure separate Google OAuth clients for local, staging and production.
- [ ] Complete Google consent-screen branding/domain verification with privacy and terms URLs.
- [ ] Restrict Google scopes to OpenID, email and profile; do not retain provider tokens.
- [ ] Approve and test duplicate-email and identity-linking behavior.
- [ ] Implement server-side route protection and authenticated redirects.
- [ ] Implement real sign-out and session revocation behavior.
- [ ] Define duplicate-email, OAuth-account linking and changed-email behavior.
- [ ] Add account export and deletion.
- [ ] Provide clear recovery for expired links, invalid credentials and unavailable Auth services.

### Data and authorization

- [ ] Implement version-controlled Supabase schema migrations.
- [ ] Enable RLS and least-privilege grants on every exposed table.
- [ ] Add automated cross-user isolation tests.
- [ ] Move quiz scoring, path assignment and unlock validation to trusted server code.
- [ ] Make mutations idempotent to prevent duplicate quiz attempts or completion writes.
- [ ] Add concurrency and offline/retry handling.
- [ ] Implement validated one-time local-state import.
- [ ] Set and test curriculum/content-version migration behavior.

### Privacy, legal and safeguarding

- [ ] Publish a privacy notice describing identity, learning progress, reflections, analytics, email and subprocessors.
- [ ] Publish terms of service and an acceptable-use statement.
- [ ] Document lawful bases, purposes and retention periods for each personal-data category.
- [ ] Execute and retain the required Supabase data-processing agreement and review subprocessor/data-transfer terms.
- [ ] Choose a Supabase region consistent with the data-residency decision.
- [ ] Add a contact/process for access, correction, portability, objection and deletion requests.
- [ ] Decide the minimum user age and whether age assurance or parental consent is required.
- [ ] Keep the existing warning against confidential workplace data visible wherever learner text is collected.
- [ ] Define moderation/support handling if free-text reflections can contain sensitive or harmful material.
- [ ] Add cookie/consent controls only for non-essential cookies or trackers actually used; do not add a decorative banner.
- [ ] Obtain qualified legal review before launch. This checklist is engineering guidance, not legal advice.

### Security

- [ ] Create a threat model covering account takeover, cross-account access, forged progress, injection, abuse and secret leakage.
- [ ] Add CSP, frame restrictions, referrer policy, permissions policy and other appropriate security headers.
- [ ] Remove inline styles or account for them safely in the CSP strategy.
- [ ] Ensure secrets exist only in hosting/Supabase secret stores and that `.env*` is ignored.
- [ ] Enable CAPTCHA/rate limiting for sign-up, sign-in and recovery.
- [ ] Configure custom SMTP with SPF, DKIM and DMARC.
- [ ] Enable MFA for Supabase/GitHub/hosting administrators and keep at least two owners.
- [ ] Run Supabase Security Advisor and resolve all material findings.
- [ ] Run dependency, secret and static security scans in CI.
- [ ] Commission a focused security review before accepting real user data.

### Reliability and operations

- [ ] Create separate local, staging and production environments.
- [ ] Use a paid, non-pausing Supabase production plan.
- [ ] Define and approve RPO/RTO.
- [ ] Enable backups or PITR appropriate to those objectives.
- [ ] Complete a restore drill and document the procedure.
- [ ] Add application error monitoring with source maps and release identifiers.
- [ ] Add uptime checks for the web app, Auth callback and a database-backed health path.
- [ ] Define alerts for elevated errors, Auth failures, database saturation and email delivery failures.
- [ ] Create incident severity, escalation and rollback runbooks.
- [ ] Name an on-call launch owner and a backup owner.
- [ ] Establish user support contact, response targets and escalation paths.

### Deployment and release

- [ ] Put the repository in a clean, protected Git workflow with an authoritative main branch.
- [ ] Add CI for formatting, lint, typecheck, unit tests, E2E tests and production build.
- [ ] Add migration validation and database type-drift checks to CI.
- [ ] Create preview deployments that never point to production data.
- [ ] Rehearse staging and production database migrations.
- [ ] Define rollback behavior for application and forward-fix behavior for database migrations.
- [ ] Configure production domain, HTTPS, redirects and canonical URL.
- [ ] Validate Auth redirect allowlists for production and preview domains.
- [ ] Remove development indicators, prototype copy and inactive controls.
- [ ] Freeze launch changes, run smoke tests and record a release sign-off.

## 4. P1 requirements for a credible first release

### Product quality

- [ ] Review all five modules for content accuracy, tone and internal consistency.
- [ ] Confirm every course/module/lesson link and unlocked-state transition.
- [ ] Test assessment retake and path supersession with partial progress.
- [ ] Add useful empty, loading, offline, timeout and retry states.
- [ ] Verify notification and settings screens against real capabilities; remove mock claims.
- [ ] Decide what happens when curriculum changes while a learner is mid-path.
- [ ] Add product-facing version/release information if support needs it.

### Accessibility and responsive quality

- [ ] Complete keyboard-only testing for every flow.
- [ ] Test VoiceOver and at least one additional screen reader/browser combination.
- [ ] Verify headings, labels, status announcements and quiz feedback semantics.
- [ ] Test text zoom to 200%, reduced motion, high contrast and target sizes.
- [ ] Run automated accessibility checks in CI and manually review false negatives.
- [ ] Test supported mobile heights, safe areas and landscape orientation.

### Performance

- [ ] Replace the Google Fonts CSS import with `next/font` or self-hosted fonts.
- [ ] Establish budgets for JavaScript, images and Core Web Vitals.
- [ ] Run production Lighthouse checks on landing, assessment, home, module and quiz routes.
- [ ] Verify no authenticated content is cached across users.
- [ ] Keep hosting and database regions close to primary users.
- [ ] Add database indexes based on measured queries and inspect slow-query reports.

### Analytics and product learning

- [ ] Select an analytics provider and document consent requirements.
- [ ] Implement the existing typed event contract with an explicit property allowlist.
- [ ] Never send reflection text, pasted work content, quiz prose, email or auth tokens.
- [ ] Define the activation, completion, retention and drop-off metrics before instrumentation.
- [ ] Validate event delivery and deduplication in staging.
- [ ] Provide an opt-out where required.

### Email and communications

- [ ] Configure branded verification, recovery and security emails.
- [ ] Test delivery through consumer and common corporate email scanners.
- [ ] Disable click tracking on one-time Auth links.
- [ ] If nudges ship, implement schedule, timezone, pause/unsubscribe, bounce and complaint handling.
- [ ] Do not send marketing messages based on a transactional-service consent.

## 5. P2 shortly after launch

- [ ] Admin support tooling with audited, least-privilege access.
- [ ] Product analytics dashboards and weekly review cadence.
- [ ] Automated dormant-account retention jobs.
- [ ] Cost and usage budgets with alerts.
- [ ] Quarterly access review and restore drill.
- [ ] Dependency update and vulnerability remediation cadence.
- [ ] Support macros and known-issue status page.
- [ ] Structured learner feedback and content correction workflow.
- [ ] Disaster-recovery and incident tabletop exercise.

## 6. Required automated test matrix

| Layer             | Minimum coverage                                                              |
| ----------------- | ----------------------------------------------------------------------------- |
| Unit              | assessment rotations, progression, streaks, validation, score calculation     |
| Database          | constraints, triggers, idempotency and migrations from a clean database       |
| RLS               | anonymous denial, own-row access, cross-user denial, locked-unit denial       |
| Auth integration  | sign-up, verify, sign-in, reset, sign-out, expired session, OAuth callback    |
| Learning E2E      | new user to assessment; each unit type; resume on another browser; retry quiz |
| Account lifecycle | export, deletion and post-deletion access denial                              |
| Accessibility     | automated scan plus keyboard/screen-reader manual scripts                     |
| Resilience        | network loss, duplicate submission, stale client, database/Auth outage        |
| Deployment        | production build, smoke test and migration rehearsal                          |

## 7. Launch-day runbook

### Before opening access

- Verify production environment variables and secret scopes.
- Confirm migration status and generated type version.
- Confirm recent backup/restore point.
- Confirm Auth, SMTP, OAuth and redirect configuration.
- Run production smoke tests using a dedicated test account.
- Confirm dashboards, alerts, support contact and rollback owner.

### Controlled release

- Begin with internal accounts, then a small invited cohort.
- Monitor sign-up completion, email delivery, Auth failures, API errors and database load.
- Verify that progress resumes on a second device.
- Expand access only after the observation window has passed without a P0 incident.

### Rollback triggers

- Cross-account data exposure or authorization bypass.
- Sustained inability to authenticate or save progress.
- Data corruption or migrations producing inconsistent paths.
- Error rate or latency above the agreed launch threshold.
- Transactional email failure preventing account access.

## 8. Definition of ready

Marg is ready to launch only when:

- every P0 item is complete or explicitly accepted by the accountable owner;
- no critical/high security or data-integrity defects remain;
- staging has passed the complete user journey and migration rehearsal;
- account export/deletion and backup restore have been demonstrated;
- monitoring, support and rollback owners are available;
- legal/privacy text and data-processing decisions have been approved;
- a production smoke test passes immediately before release.

## 9. Repository evidence behind this assessment

- `app/providers.tsx` hydrates and saves all learner state through browser storage.
- `app/signin/page.tsx` and `app/signup/page.tsx` simulate identity locally.
- `lib/learning/analytics.ts` intentionally discards all events.
- No Supabase configuration, migrations, generated database types or environment example currently exists.
- No CI workflow, privacy page, terms page, password recovery or account deletion route currently exists.
- The repository already has Vitest, Playwright, TypeScript and ESLint foundations to build on.

## 10. References

- [Supabase production checklist](https://supabase.com/docs/guides/deployment/going-into-prod)
- [Supabase custom SMTP guidance](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase database backups](https://supabase.com/docs/guides/platform/backups)
- [Next.js production checklist](https://nextjs.org/docs/pages/guides/production-checklist)
- [ICO guide to data protection](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/)
