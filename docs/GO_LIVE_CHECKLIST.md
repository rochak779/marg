# Go-live checklist (Phase E)

Status: in progress. Last verified: 22 August 2026 against the live "Marg"
Supabase project (`aqvpdfdfsterpdumjglx`), by diffing `supabase/config.toml`
against remote with `supabase config push`.

This tracks docs/SUPABASE_IMPLEMENTATION_PLAN.md section 11 (Operations) and
section 12 Phase E. Do not treat an item as done without a way to verify it —
several below are marked verified because they were actually checked, not
assumed.

## Blocking

- [ ] **Upgrade to a paid Supabase plan.** Currently free tier. Free projects
      auto-pause on inactivity and have no guaranteed backups — this alone
      disqualifies the project from "production ready" regardless of any
      other item below. Nothing else in this checklist compensates for it.
- [ ] **Custom SMTP.** Currently using Supabase's built-in mailer
      (2 emails/hour rate limit, shared sender reputation). Deliberately
      deferred for now (see conversation). Needs a provider decision before
      real signup volume — go through proper provisioning, not a hand-wired
      SDK, when ready.
- [ ] **Production domain + redirect URLs.** `additional_redirect_urls` is
      still `http://localhost:3000/auth/callback` only. Add the real
      production `/auth/callback` URL before launch, and consider removing
      the localhost entry from the production Supabase project once a
      separate staging/production project split exists.

## Verified done

- [x] Email confirmation required before sign-in (`enable_confirmations =
      true`) — confirmed already true on the live project, now also
      explicit and version-controlled in `supabase/config.toml`.
- [x] MFA (TOTP) enroll/verify enabled at the project level — confirmed
      still `true`/`true` after being accidentally disabled and reverted
      during this session (see git history on `supabase/config.toml`).
- [x] Email OTP length 8, minimum 1 minute between confirmation/reset
      emails — confirmed matches what was already live.
- [x] Service-role key is server-only: gated behind the `server-only`
      package import in `lib/supabase/admin.ts`; confirmed via `next build`
      that it does not ship in any client bundle.
- [x] RLS enabled and tested informally (not a full automated suite yet —
      see "RLS test suite" below) on every learner-owned table.
- [x] Redirect-target validation on the OAuth/email callback route
      (`safeNextPath` in `app/auth/callback/route.ts`) — rejects
      non-relative and protocol-relative (`//`) targets.

## Needs a decision, then action

- [ ] Launch geography / data residency (plan section 13, item 1). Project
      is currently in `eu-west-1`; confirm this is the intended region
      before real user data accumulates — migrating region later means a
      new project and a real data migration, not a config change.
- [ ] Retention periods for dormant accounts, quiz attempts, reflections,
      logs (item 5).
- [ ] Whether retaking the assessment preserves or supersedes progress
      (item 6) — currently implemented as "supersedes" (previous path
      marked `superseded`, old unit/quiz/build/practice rows kept but
      orphaned from any active path). Confirm this is the intended product
      behavior, not just the technically-simplest one.
- [ ] Analytics / error-monitoring vendor (item 9) — `lib/learning/analytics.ts`
      is currently a typed no-op.
- [ ] Hosting provider and staging/production deployment workflow (item 10)
      — no Vercel (or other) project is linked yet; only local dev has been
      exercised against the live Supabase project.

## Still to do regardless of the above

- [ ] Automated RLS/authorization test suite (plan section 7 "Required
      security tests" — cross-user access, anonymous access, locked-unit
      writes, forged scores). Everything was checked manually/informally
      end-to-end during Phases A-D, not via a repeatable test suite.
- [ ] CAPTCHA on sign-up/sign-in (`[auth.captcha]` in config.toml is
      unconfigured — needs an hCaptcha or Turnstile account).
- [ ] Backup RPO/RTO defined and a restore drill performed (requires the
      paid-plan upgrade first).
- [ ] Security Advisor review in the Supabase dashboard.
- [ ] Two or more organization owners with MFA enabled (account
      administration, not code).
- [ ] Load testing.
