# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated: use a full-stack TypeScript web framework so the frontend can later share types and application boundaries with authentication, APIs, AI services, and a relational database. The current milestone is frontend-only and uses no authentication, persistence, or AI integration.

## Users

Marg is for non-technical professionals who want to learn how to use AI in their work.

## Product Purpose

Marg teaches practical AI skills through a personalised learning path and workplace exercises. Success means a learner can enter through a clear onboarding flow, complete an assessment, and receive a learning experience suited to their needs.

## Positioning

Marg combines a personalised learning path with practical workplace exercises. Role-specific learning is a planned future extension.

## Operating Context

First-time users move from the landing page to onboarding, sign-up, and a three-question assessment before entering the app. Returning users sign in and either resume an incomplete assessment or enter the app. Signed-in users with an incomplete assessment enter the assessment directly.

## Capabilities and Constraints

- Current scope is a design prototype with linked screens and no authentication, storage, database, or AI behavior.
- Required screens are landing (1a), onboarding (3a), sign-up (3b), sign-in (3c), the three-question assessment (4a), and app shell (5a).
- The app shell includes Home, Courses, Progress, Labs, and Settings. Labs and Settings are not live yet.
- Home, Courses, and Progress will later receive content from a curated learning plan.
- Required flows:
  - First-time: 1a → 3a → 3b → 4a → 5a.
  - Returning, signed out, assessment complete: 3c → 5a.
  - Returning, signed out, assessment incomplete: 3c → 4a → 5a.
  - Returning, signed in, assessment incomplete: 4a → 5a.
- The supplied HTML screens are the implementation reference and should be reproduced closely.

## Brand Commitments

- Product name: Marg.
- Preserve the supplied screen designs and the existing learning-app design tokens.

## Evidence on Hand

- Screen reference and interactive design document: `design/mockups/onboarding/Marg Landing.dc.html`.
- Visual references and extracted design guidance are available in `design/screenshots/` and `design/mockups/onboarding/uploads/`.
- No production learning-plan content, testimonials, performance claims, or customer evidence has been supplied; future work must not fabricate them.

## Product Principles

- Personalise the path before presenting the curriculum.
- Teach through practical workplace application.
- Keep the experience approachable for non-technical learners.
- Preserve continuity when learners return or resume an incomplete assessment.
- Keep today’s prototype ready for future role-specific learning and backend integration.

## Production Planning

- Supabase architecture and migration plan: `docs/SUPABASE_IMPLEMENTATION_PLAN.md`.
- Production launch gates and operational checklist: `docs/GO_LIVE_READINESS.md`.
