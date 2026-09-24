# Design Tokens — "Learning App" UI

Extracted from the reference mockup (3 mobile screens: Home, My Courses, Progress).
Use these tokens as the single source of truth — no other design system should be mixed in.

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
| `--color-primary-purple-dark` | `#6669B8` | Hero banner gradient end / pressed state |
| `--color-primary-orange` | `#FDA366` | Hero/header gradient (My Courses), CTA highlight |
| `--color-primary-orange-dark` | `#F4935A` | Orange gradient end, "Lessons" stat card |

**Eyebrow labels on light surfaces**: `--color-primary-orange` fails WCAG AA contrast (1.86:1) on `--color-bg-surface`/white card backgrounds — reserve orange eyebrow/label text for dark or saturated-color surfaces (hero banners, gradients). On a light surface, use `--color-primary-purple-dark` (4.62:1, passes AA) instead. `--color-tag-maroon` (8.57:1) also passes if a warmer tone is wanted.

### Tints (card backgrounds)
| Token | Hex | Usage |
|---|---|---|
| `--color-tint-orange` | `#FCEAE0` | "Lessons" / warm stat card background |
| `--color-tint-purple` | `#E4E7FD` | "Hours" / cool stat card background |
| `--color-tint-cream` | `#F9EAE1` | Progress panel background |

### Neutrals
| Token | Hex | Usage |
|---|---|---|
| `--color-text-primary` | `#1E1F24` | Headlines, primary text |
| `--color-text-secondary` | `#8A8A8E` | Sub-labels, meta text ("Lessons", "Hours", month labels) |
| `--color-text-inverse` | `#FFFFFF` | Text on dark / colored surfaces |
| `--color-navbar-dark` | `#2A2D32` | Bottom navigation bar, dark course cards |
| `--color-border-subtle` | `#ECECEC` | Card hairlines, dividers |
| `--color-track-gray` | `#CECECE` | Inactive progress bar segment |

### Data / Chart
| Token | Hex | Usage |
|---|---|---|
| `--color-bar-dark` | `#D99D79` | Filled/active bar chart segment |
| `--color-bar-light` | `#F5E7DC` | Unfilled bar chart segment |
| `--color-bar-orange` | `#FFA267` | Progress bar — orange segment |
| `--color-bar-purple` | `#A5ADF8` | Progress bar — purple segment |
| `--color-tag-maroon` | `#7F2E19` | "Literature" subject icon chip |

### Status
| Token | Hex | Usage |
|---|---|---|
| `--color-notification-dot` | `#F46264` | Notification/alert badge |

---

## 2. Typography

Rounded, geometric sans-serif (e.g. **Poppins**, **Inter**, or **Sora** as substitutes).

| Token | Size | Weight | Line-height | Usage |
|---|---|---|---|---|
| `--font-family-base` | — | 400/500/600/700 | — | System default: Poppins / Inter |
| `--text-display` | 26–28px | 700 (Bold) | 1.2 | Page titles: "My courses", "Progress" |
| `--text-heading` | 20–22px | 700 (Bold) | 1.25 | Banner title: "A series of Olympiads", card titles |
| `--text-title` | 16px | 600 (SemiBold) | 1.3 | Section headers: "Progress performance", "Rating of students" |
| `--text-body` | 14px | 500 (Medium) | 1.4 | Card body copy, list items |
| `--text-label` | 12–13px | 500 (Medium) | 1.3 | Stat labels ("Lessons", "Hours"), pill labels |
| `--text-caption` | 11px | 400 (Regular) | 1.3 | Meta text, day/month labels, avatar counts |
| `--text-stat` | 22–24px | 700 (Bold) | 1.1 | Big numbers: "78", "43", "48 lessons" |

### Form field floor

Text-entry fields (`input[type=text/email/password/...]`, `select`, `textarea`) must render at **16px minimum**, even where the surrounding UI uses smaller body/caption sizes. iOS Safari force-zooms a focused input below 16px, which breaks the mobile layout on focus. This floor overrides `--text-body`/`--text-caption` specifically for form fields; it does not apply to buttons or static text.

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

Screen padding: `20px` horizontal. Card internal padding: `16–20px`. Gap between stacked cards: `12–16px`.

---

## 4. Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 12px | Small chips/pills, icon badges |
| `--radius-md` | 16px | Stat cards, list-item cards |
| `--radius-lg` | 24px | Hero banners, main content cards |
| `--radius-xl` | 32px | Phone frame / outer screen container |
| `--radius-full` | 999px | Avatars, circular buttons, nav pill, badges |

---

## 5. Elevation / Shadow

| Token | Value | Usage |
|---|---|---|
| `--shadow-card` | `0 8px 24px rgba(20,20,30,0.06)` | Floating cards on page background |
| `--shadow-nav` | `0 6px 20px rgba(20,20,30,0.15)` | Bottom navigation bar |
| `--shadow-button` | `0 4px 10px rgba(0,0,0,0.15)` | Circular icon buttons (e.g. arrow CTA) |

---

## 6. Components

### Stat Card (e.g. "Lessons — 78", "Hours — 43")
- Background: tint color (`--color-tint-orange` / `--color-tint-purple`)
- Radius: `--radius-md`
- Icon badge: small circular icon top-left, solid accent color
- Number: `--text-stat`, label below in `--text-label` / `--color-text-secondary`

### Hero Banner Card
- Background: diagonal gradient (`--color-primary-purple` → `--color-primary-purple-dark`, or orange equivalent)
- Radius: `--radius-lg`
- Title: `--text-heading`, `--color-text-inverse`
- Illustration anchored bottom-right, subtle decorative stars/pattern
- CTA: circular dark button (`--color-navbar-dark` bg) with white arrow icon, bottom-left

### Progress Bar (segmented, horizontal)
- Track radius: `--radius-full`, height ~10px
- Segments colored by category (`--color-bar-orange`, `--color-bar-purple`, `--color-track-gray`)
- Legend below: colored dot + month/label + count, `--text-caption`

### Bar Chart (weekly hours)
- Rounded-top vertical bars, radius `--radius-sm` on top corners
- Two-tone fill: `--color-bar-dark` (value) over `--color-bar-light` (track)
- Value label pill above tallest/active bar (dark rounded badge, white bold text)
- X-axis day labels: `--text-caption`, `--color-text-secondary`

### Subject Pill / Filter Tab
- Inactive: white/`--color-bg-surface-alt` background, radius `--radius-full`, icon + label
- Active: dark (`--color-navbar-dark`) background, white text
- Icon chip inside pill: small colored circle (e.g. `--color-tag-maroon` for Literature)

### Course Card (dark, in "My Courses" list)
- Background: `--color-navbar-dark`
- Radius: `--radius-lg`
- Eyebrow label: small caps, accent color (e.g. purple/orange), `--text-caption`
- Title: `--text-heading`, `--color-text-inverse`
- Avatar stack (overlapping circular avatars) + "+N" count, bottom-left
- Circular white CTA button with arrow, bottom-right

### Bottom Navigation Bar
- Background: `--color-navbar-dark`, full pill shape (`--radius-full`), floating with `--shadow-nav`
- 4–5 icon slots, inactive icons muted white/gray
- Active state: circular accent-colored (purple) highlight behind icon

### Avatar
- Circular, `--radius-full`
- Wrapped in soft tint background circle when used as profile icon (e.g. light purple)
- Small red notification dot (`--color-notification-dot`) top-right when applicable

### Top Bar / Header
- Left: avatar + greeting ("Hello, Jacob") in `--text-title`, progress subline in `--text-caption` with small bolt/progress icon
- Right: circular notification bell button, white bg, subtle shadow, red dot indicator

### Dropdown / Filter Button (e.g. "All subjects")
- Pill shape, white background, radius `--radius-full`
- Text + chevron icon, `--text-label`

---

## 7. Iconography & Illustration Style

- Icons: simple, rounded-line or filled duotone style, consistent stroke weight
- Illustrations: flat vector, playful (trophy, graduation cap, DNA helix, geometry shapes), pastel palette matching brand colors, decorative stars scattered as texture
- Avatars: flat illustrated character portraits (not photos)

---

## 8. Layout Notes

- Mobile-first, single-column card stack
- Phone frame: rounded rectangle (`--radius-xl`), white/light background, floating on the peach page background
- Consistent 20px screen margins, 12–16px vertical rhythm between cards
- Bottom nav is a floating pill, inset from screen edges, not full-width edge-to-edge

---

## 9. Usage Rule

⚠️ This is the **only** design system to reference for this app. Do not blend in other color palettes, type scales, or component styles — all new screens should derive strictly from the tokens above.
