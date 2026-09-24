# Marg — Design System & Screen Patterns

**Status:** Updated to cover the full built product (onboarding, auth, assessment, recommendation, app shell). Supersedes the token-only version now archived at `docs/archive/design.md` as the reference for new work; the archived file's tokens are carried forward unchanged below, extended with the flow and component patterns that now exist in the codebase.

---

## 1. Color Palette

### Base / Background
| Token | Hex | Usage |
|---|---|---|
| `--color-bg-page` | `#FCD197` | Outer page/canvas background (soft peach) |
| `--color-bg-surface` | `#F8F8F8` | Phone screen background, white card surface |
| `--color-bg-surface-alt` | `#FFFFFF` | Cards, sheets, modals |

### Brand / Accent
| Token | Hex | Usage |
|---|---|---|
| `--color-primary-purple` | `#7B82D4` | Hero banner gradient start, active nav icon, chart accents |
| `--color-primary-purple-dark` | `#6669B8` | Hero banner gradient end / pressed state; "AI" wordmark in onboarding/quiz illustrations |
| `--color-primary-orange` | `#FDA366` | Hero/header gradient, CTA highlight, secondary illustration dot |
| `--color-primary-orange-dark` | `#F4935A` | Orange gradient end, "Lessons" stat card |

**Eyebrow labels on light surfaces**: `--color-primary-orange` fails WCAG AA contrast (1.86:1) on `--color-bg-surface`/white card backgrounds — reserve orange eyebrow/label text for dark or saturated-color surfaces (hero banners, gradients, the peach onboarding header). On a light surface, use `--color-primary-purple-dark` (4.62:1, passes AA) — this is what the assessment screen's "QUESTION 1 OF 3" label and the signup screen's "STEP 3" label both do. `--color-tag-maroon` (8.57:1) also passes if a warmer tone is wanted (used for the signup step label, `#7F2E19`).

### Tints (card backgrounds)
| Token | Hex | Usage |
|---|---|---|
| `--color-tint-orange` | `#FCEAE0` | "Lessons" / warm stat card background |
| `--color-tint-purple` | `#E4E7FD` | "Hours"/"Minutes learned" stat card background |
| `--color-tint-cream` | `#F9EAE1` | Progress panel background |

### Neutrals
| Token | Hex | Usage |
|---|---|---|
| `--color-text-primary` | `#1E1F24` | Headlines, primary text |
| `--color-text-secondary` | `#8A8A8E` | Sub-labels, meta text, muted helper copy |
| `--color-text-inverse` | `#FFFFFF` | Text on dark / colored surfaces |
| `--color-navbar-dark` | `#2A2D32` | Bottom navigation bar, dark course cards, CTA buttons |
| `--color-border-subtle` | `#ECECEC` | Card hairlines, dividers |
| `--color-track-gray` | `#CECECE` | Inactive progress bar segment / inactive onboarding step dot |

### Data / Chart
| Token | Hex | Usage |
|---|---|---|
| `--color-bar-dark` | `#D99D79` | Filled/active bar chart segment |
| `--color-bar-light` | `#F5E7DC` | Unfilled bar chart segment |
| `--color-bar-orange` | `#FFA267` | Progress bar — orange segment |
| `--color-bar-purple` | `#A5ADF8` | Progress bar — purple segment |
| `--color-tag-maroon` | `#7F2E19` | Subject icon chip; signup "STEP 3" eyebrow label |

### Status
| Token | Hex | Usage |
|---|---|---|
| `--color-notification-dot` | `#F46264` | Notification/alert badge |

---

## 2. Typography

Rounded, geometric sans-serif (Poppins / Inter / Sora as substitutes).

| Token | Size | Weight | Line-height | Usage |
|---|---|---|---|---|
| `--font-family-base` | — | 400/500/600/700 | — | System default: Poppins / Inter |
| `--text-display` | 26–28px | 700 (Bold) | 1.2 | Page titles: "My courses", "Progress" |
| `--text-heading` | 20–22px | 700 (Bold) | 1.25 | Onboarding/assessment headline copy, hero banner title, card titles |
| `--text-title` | 16px | 600 (SemiBold) | 1.3 | Section headers: "Progress performance", dashboard greeting |
| `--text-body` | 14px | 500 (Medium) | 1.4 | Card body copy, list items, helper text under assessment questions |
| `--text-label` | 12–13px | 500 (Medium) | 1.3 | Stat labels, pill labels, "STEP 3 · CREATE ACCOUNT" / "QUESTION 1 OF 3" eyebrows |
| `--text-caption` | 11px | 400 (Regular) | 1.3 | Meta text, day/month labels, terms copy |
| `--text-stat` | 22–24px | 700 (Bold) | 1.1 | Big numbers: lessons done, minutes learned |

### Form field floor

Text-entry fields (`input[type=text/email/password/...]`, `select`, `textarea`) must render at **16px minimum**, even where the surrounding UI uses smaller body/caption sizes. iOS Safari force-zooms a focused input below 16px, which breaks the mobile layout on focus. This floor overrides `--text-body`/`--text-caption` specifically for form fields (signup, signin); it does not apply to buttons or static text.

---

## 3. Spacing Scale

| Token | Value |
|---|---|
| `--space-xs` | 4px |
| `--space-sm` | 8px |
| `--space-md` | 12px |
| `--space-lg` | 16px |
| `--space-xl` | 20px |
| `--space-2xl` | 24px |
| `--space-3xl` | 32px |

Screen padding: `20px` horizontal (24px on onboarding/quiz bottom-action zones). Card internal padding: `16–20px`. Gap between stacked cards: `12–16px`.

---

## 4. Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 12px | Small chips/pills, icon badges |
| `--radius-md` | 16px | Stat cards, list-item cards, form fields (`.field`) |
| `--radius-lg` | 24px | Hero banners, main content cards, auth "sheet" panel |
| `--radius-xl` | 32px | Phone frame / outer screen container (`.phone`) |
| `--radius-full` | 999px | Avatars, circular buttons, nav pill, badges, back/icon buttons |

---

## 5. Elevation / Shadow

| Token | Value | Usage |
|---|---|---|
| `--shadow-card` | `0 8px 24px rgba(20,20,30,0.06)` | Floating cards on page background |
| `--shadow-nav` | `0 6px 20px rgba(20,20,30,0.15)` | Bottom navigation bar |
| `--shadow-button` | `0 4px 10px rgba(0,0,0,0.15)` | Circular icon buttons (back arrow, hero CTA arrow) |

---

## 6. Layout Shell

### `.phone` / `Stage`
Every screen in the app renders inside the shared `<Stage>` component (`components/ui.tsx`): a `<main className="stage">` outer frame on the peach page background, containing a `<section className="phone">` — the rounded, elevated mobile surface (`--radius-xl`) that is the single source of truth for the app's frame across marketing, auth, assessment, and app-shell screens. Screen-specific content is passed as `children` with a screen-name class (`onboarding-screen`, `quiz`, `crown`, `app-screen`) for local styling only — the frame, radius, and shadow never change per screen.

### `AppShell`
Wraps every route under `/app/*`. Renders the current page inside `.app-screen.routed-app`, and conditionally renders `BottomNav` — hidden on the notifications screen and on any learning-flow route (`/app/modules/**`) so a lesson, Build, or Practice session gets the full screen without navigation chrome competing for attention.

---

## 7. Components

### Onboarding Header (`.onboard-head`)
- Dark gradient header (purple-to-purple-dark) with a floating decorative SVG illustration (concentric "AI" badge + connector lines + small accent dots), positioned top-right.
- Top row: back button, a 3-dot/pill step indicator (small dot – wide pill – small dot, using `--color-track-gray`-style dim dots and an active peach pill), and a "Skip" text link, all `--text-caption`.
- Eyebrow label in peach (`--color-primary-orange` family) since it sits on a dark/saturated surface.
- Headline in `--text-heading`, `--color-text-inverse`; supporting copy in muted white (`#ffffffbf`).

### Value List (onboarding)
- Stacked rows: a small circular/glyph icon on the left (numeral, checkmark, or arrow glyph), bold title + one-line description on the right. Three items max — matches the "10-minute steps / live playground / progress that adds up" pattern.

### Auth "Crown + Sheet" (`.crown` / `.sheet`)
- Used on Signup and Signin. Top "crown" zone: back button, a step/segment indicator, and step-labeled headline copy (`STEP 3 · CREATE ACCOUNT` in `--color-tag-maroon`).
- Below it, a white `.sheet` panel (`--radius-lg`) holding the form: a full-width ghost/outline "Continue with Google" button with `GoogleIcon`, a text divider ("or with email"), stacked `.field` inputs (16px floor, `--radius-md`), an inline consent checkbox with copy ("Send me one daily nudge, nothing else" — reinforces the nudge-channel decision), and a primary `.btn` pinned to the bottom via `margin-top: auto`, followed by fine-print terms/storage copy.

### Assessment / Quiz (`.quiz`)
- Top row: icon-button back, centered `Brand` wordmark (म + "marg"), balanced empty spacer on the right for symmetry.
- Segmented progress bar (`.segments`, `role="progressbar"`) — one pill per question, filled state for current/passed questions.
- A decorative SVG illustration zone (`.quiz-visual`) reusing the same "AI" badge + connector-line motif as onboarding, for visual continuity across the pre-app flow.
- Question block: eyebrow label ("QUESTION 1 OF 3", purple-dark), `--text-heading` question title, `--text-body` helper copy.
- Answer list: full-width option buttons with a lettered badge (A/B/C…) and label; `.selected` state on the chosen option; `aria-pressed` reflects selection for screen readers.
- Bottom actions: primary `.btn` (disabled until an option is chosen) with an `Arrow`, plus a muted one-line reassurance ("Takes about 30 seconds · shapes your whole path").

### Dashboard Header (`app`)
- Greeting (`Hello, {firstName}`) in `--text-title`, module-position subtitle ("Module 2 of 5") in `--text-caption`, current streak indicator, and overall progress percentage — the same top-bar shape as the original Home/My Courses reference mockups, now driven by real learner state instead of mock copy.

### Path Hero (`.app-hero.path-hero`)
- The Home screen's hero banner: same gradient-card + floating "AI" illustration + circular arrow-CTA pattern as the original reference banner, but its headline and subline are computed ("N units ahead of you" / "Day X: {module title}") rather than static marketing copy, and the arrow CTA deep-links straight into the learner's next unit.

### Stat Card (Home / Progress)
- Background: tint color (`--color-tint-orange` / `--color-tint-purple`)
- Radius: `--radius-md`
- Icon badge: small circular icon top-left
- Number: `--text-stat`, label below in `--text-label` / `--color-text-secondary`
- Values ("Lessons done", "Minutes learned") are computed from `progressSummary`/completion state — no placeholder numbers ship to production, per the product's no-mock-data rule.

### Linear / Module-Dot Progress (`.linear-progress`, `.module-dots`)
- A single filled progress bar (`--radius-full` track) showing overall path completion percentage.
- A row of small pill/dot links, one per assigned module — filled (`done`) once a module's 7 units are complete, highlighted (`current`) for the in-progress or active module, tapping any dot deep-links into that module.

### Progress Bar (segmented, horizontal — reference pattern, still valid)
- Track radius: `--radius-full`, height ~10px
- Segments colored by category (`--color-bar-orange`, `--color-bar-purple`, `--color-track-gray`)
- Legend below: colored dot + label + count, `--text-caption`

### Bar Chart (weekly hours — reference pattern, still valid)
- Rounded-top vertical bars, radius `--radius-sm` on top corners
- Two-tone fill: `--color-bar-dark` (value) over `--color-bar-light` (track)
- Value label pill above tallest/active bar; x-axis day labels in `--text-caption`

### Subject Pill / Filter Tab
- Inactive: white background, radius `--radius-full`, icon + label
- Active: dark (`--color-navbar-dark`) background, white text

### Course Card (dark, in "My Courses" list)
- Background: `--color-navbar-dark`, radius `--radius-lg`
- Eyebrow label in accent color, title in `--text-heading` / inverse text
- Avatar stack + "+N" count, bottom-left; circular white CTA arrow button, bottom-right

### Bottom Navigation Bar (`BottomNav`)
- Floating full-pill bar (`--radius-full`, `--shadow-nav`) on `--color-navbar-dark`, inset from screen edges.
- Icon slots for Home, Courses, Progress, and remaining destinations; muted white/gray inactive icons, circular purple highlight behind the active icon.
- Hidden on the notifications screen and inside any learning-flow route (Section 6), so it never competes with a lesson/Build/Practice session.

### Avatar
- Circular (`--radius-full`), soft tint wrapper when used as a profile icon; small red notification dot (`--color-notification-dot`) top-right when applicable.

### Notifications
- A dedicated full-screen route (`/app/notifications`, `BottomNav` hidden) surfaces streak-risk and pending-lesson nudges. Nudges are in-app/push at launch — no email/SMS copy or components exist in this surface by product decision.

---

## 8. Iconography & Illustration Style

- Icons: simple, rounded-line or filled duotone style, consistent stroke weight (back chevrons, quiz-answer letters, nav glyphs all share one stroke width).
- Illustrations: flat vector, decorative SVG built from the recurring "AI-badge" motif — a filled circle with the "AI" wordmark in `--color-primary-purple-dark`, connector lines, and one or two accent dots (peach + white/cream). This motif now spans onboarding, the assessment/quiz visual, and the Home path-hero — it is the product's one recurring illustration language, not a one-off mockup asset.
- Avatars: flat illustrated character portraits (not photos), consistent with the reference mockups.

---

## 9. Layout Notes

- Mobile-first, single-column card stack; phone frame floats on the peach page background at every screen, including auth and assessment (not just the post-login app shell).
- Consistent 20px screen margins, 12–16px vertical rhythm between cards.
- Bottom nav is a floating pill, inset from screen edges, present only inside the authenticated app shell and never inside a focused learning-flow session.
- Auth and assessment screens replace the bottom nav with a top step/segment indicator instead — signaling linear, one-directional progress rather than free navigation, which matches their role as a funnel rather than a destination.

---

## 10. Usage Rule

⚠️ This is the **only** design system to reference for this app. Do not blend in other color palettes, type scales, or component styles — every screen, including ones not yet built, should derive strictly from the tokens and patterns above. When a new screen needs a component not listed here, extend this document rather than improvising an unlisted pattern.
