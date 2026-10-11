# FreeEPG Design System

> Clean, modern, and accessible design system for the FreeEPG web application.
> Built on Next.js 16, Tailwind CSS 4, and a warm editorial aesthetic.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Icons](#icons)
7. [Responsive Behavior](#responsive-behavior)
8. [Accessibility](#accessibility)
9. [Dark Mode](#dark-mode)
10. [Animation & Motion](#animation--motion)
11. [Page Patterns](#page-patterns)

---

## Design Philosophy

FreeEPG's design is **editorial, warm, and functional**. It draws inspiration from print journalism — clean typography, generous whitespace, and a restrained color palette — while remaining fully modern and responsive.

### Principles

| Principle | Guideline |
|-----------|-----------|
| **Typography first** | Serif headings paired with sans-serif body text create hierarchy and character |
| **Warm neutrality** | Cream/ivory backgrounds replace stark white; charcoal replaces pure black |
| **Sharp edges** | Border radius stays minimal (`0.25rem` / 4px) — no rounded cards, no pill buttons |
| **Subtle contrast** | Borders replace shadows; hover states use color shifts, not elevation changes |
| **Content focus** | UI recedes; data takes center stage |

---

## Color Palette

### Tokens

All colors are CSS custom properties in `globals.css`. They follow a semantic naming convention (`--foreground`, `--accent`, etc.) rather than literal names (`--text-color`, `--red`).

#### Light Mode

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#f3f0e8` | Page background |
| `--foreground` | `#1a1917` | Primary text |
| `--muted-foreground` | `#6f6a62` | Secondary text, labels |
| `--primary` | `#1a1917` | Primary buttons, active nav |
| `--primary-foreground` | `#f9f7f2` | Text on primary buttons |
| `--accent` | `#c41e26` | CTAs, links, active states |
| `--accent-foreground` | `#ffffff` | Text on accent elements |
| `--card` | `#faf8f3` | Card / surface backgrounds |
| `--card-foreground` | `#1a1917` | Text inside cards |
| `--border` | `#d8d2c6` | Borders, dividers |
| `--surface-muted` | `#ebe6db` | Subtle surface highlights, code blocks |
| `--ring` | `#c41e26` | Focus ring |
| `--success` | `#2d6a4f` | Success states |
| `--success-muted` | `#e8f3ed` | Success backgrounds |
| `--warning` | `#9a6700` | Warning states |
| `--warning-muted` | `#faf3e0` | Warning backgrounds |
| `--destructive` | `#b42318` | Error / destructive states |
| `--shadow-md` | `0 2px 0 rgb(26 25 23 / 0.06)` | Subtle card shadow |

#### Dark Mode

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#121110` | Page background |
| `--foreground` | `#ece8df` | Primary text |
| `--muted-foreground` | `#9a948a` | Secondary text |
| `--primary` | `#ece8df` | Primary buttons |
| `--primary-foreground` | `#121110` | Text on primary buttons |
| `--accent` | `#e85d63` | Links, active states |
| `--accent-foreground` | `#121110` | Text on accent |
| `--card` | `#1a1917` | Card backgrounds |
| `--card-foreground` | `#ece8df` | Text inside cards |
| `--border` | `#2f2c28` | Borders, dividers |
| `--surface-muted` | `#23211f` | Code blocks, subtle surfaces |
| `--ring` | `#e85d63` | Focus ring |
| `--success` | `#6fcf97` | Success |
| `--success-muted` | `rgb(111 207 151 / 0.12)` | Success backgrounds |
| `--warning` | `#f0c14b` | Warning |
| `--warning-muted` | `rgb(240 193 75 / 0.12)` | Warning backgrounds |
| `--destructive` | `#f87171` | Errors |

### Usage Rules

- **Always use semantic tokens** (`var(--foreground)`, not `#1a1917`) — enables dark mode and future theming.
- **Accent is the action color** — links, active nav indicators, and primary CTAs use `--accent`.
- **Muted is informational** — secondary labels, metadata, and disabled states use `--muted-foreground`.
- **Surface-muted is the highlight** — inline code, background tints, and subtle elevation.

---

## Typography

### Font Stack

| Role | Font | Weight | Variable |
|------|------|--------|----------|
| **Body** | IBM Plex Sans | 400, 500 | `--font-ibm-plex-sans` |
| **Headings** | IBM Plex Serif | 500, 600 | `--font-ibm-plex-serif` |
| **Code / Data** | IBM Plex Mono | 400, 500 | `--font-ibm-plex-mono` |

### Type Scale

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | 0.75rem (12px) | 1rem | Badges, captions |
| `text-sm` | 0.875rem (14px) | 1.25rem | Body, buttons, labels |
| `text-base` | 1rem (16px) | 1.5rem | Default body |
| `text-lg` | 1.125rem (18px) | 1.75rem | Lead paragraphs |
| `text-xl` | 1.25rem (20px) | 1.75rem | Section sub-headings |
| `text-2xl` | 1.5rem (24px) | 2rem | Page headings |
| `text-3xl` | 1.875rem (30px) | 2.25rem | Hero headings |
| `text-4xl` | 2.25rem (36px) | 2.5rem | Hero / feature headings |

### Typography Rules

- **Headings** (`h1`–`h3`): serif font, `font-weight: 600`, `letter-spacing: -0.015em`, `line-height: 1.15`
- **h4**: `letter-spacing: -0.01em`, `line-height: 1.25`
- **Body**: sans-serif, `font-size: 1rem`, `line-height: 1.55`
- **Code**: mono font, `text-sm`, inline code gets `bg-[var(--surface-muted)]` padding and border-radius
- **Selection**: accent color at 22% opacity

### Utility Classes

```css
.section-kicker    /* text-sm muted label above a heading */
.section-title     /* font-serif text-2xl/3xl font-semibold */
.link-arrow        /* text-sm foreground, hover accent */
.prose-docs        /* prose block: headings, paragraphs, code, pre */
```

---

## Spacing & Layout

### Spacing Scale

```
--spacing-1  = 0.25rem  (4px)
--spacing-2  = 0.5rem   (8px)
--spacing-3  = 0.75rem  (12px)
--spacing-4  = 1rem     (16px)
--spacing-5  = 1.25rem  (20px)
--spacing-6  = 1.5rem   (24px)
--spacing-8  = 2rem     (32px)
--spacing-10 = 2.5rem   (40px)
--spacing-12 = 3rem     (48px)
--spacing-16 = 4rem     (64px)
```

Use Tailwind's spacing utilities (`p-4`, `gap-8`, etc.) — they reference this scale.

### Page Shell

All page content sits inside `.page-shell`:

```css
.max-w-6xl mx-auto px-4 sm:px-6 lg:px-8
padding-left: max(1rem, env(safe-area-inset-left))
padding-right: max(1rem, env(safe-area-inset-right))
```

- **Max width**: `6xl` (1152px)
- **Padding**: 16px → 24px → 32px breakpoint scale
- **Safe area**: iOS notch / Android gesture padding

### Header

- **Height**: `--header-height: 3.5rem` (56px)
- **Behavior**: sticky top, z-50, bordered bottom
- **Structure**: logo (left), nav (center), actions (right)
- **Actions**: language switcher, theme toggle, Enigma2 CTA

### Surface Card

```css
background: var(--card)
border: 1px solid var(--border)
border-radius: var(--radius)  /* 0.25rem / 4px */
box-shadow: var(--shadow-sm)  /* none */
```

---

## Components

### Button

| Variant | Background | Text | Border |
|---------|-----------|------|--------|
| `primary` | `--primary` | `--primary-foreground` | `--primary` |
| `secondary` | `--surface-muted` | `--foreground` | transparent |
| `ghost` | transparent | `--muted-foreground` | transparent |
| `outline` | transparent | `--foreground` | `--border` |

| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| `sm` | 32px | px-3 | text-sm |
| `md` | 36px | px-4 | text-sm |
| `lg` | 40px | px-5 | text-sm |

**Rules:**
- `rounded-sm` (4px radius) — never rounded
- `transition-colors duration-150` — subtle color shift on hover
- `disabled: opacity-50` — never disabled with hidden cursor

### Badge

| Variant | Background | Text |
|---------|-----------|------|
| `default` | `--surface-muted` | `--foreground` |
| `success` | `--success-muted` | `--success` |
| `warning` | `--warning-muted` | `--warning` |
| `muted` | transparent | `--muted-foreground` + border |

**Style:**
- `text-[11px] font-medium uppercase tracking-wide`
- `rounded-sm` — sharp corners
- `inline-flex` — sits inline with text

### Card

- Surface card with 20px padding (`p-5`)
- Hover: border darkens to `--foreground / 20%`
- Semantic `<article>` element with `role="article"`

### StatCard

- Used on dashboard / home for metrics
- Compact card showing a single number + label
- Uses `section-kicker` for the label, large serif number for the value

---

## Icons

**Library:** [Lucide](https://lucide.dev/) (`lucide-react`)

### Guidelines

- Use icons sparingly — only for actions and navigation affordances
- Standard size: `h-5 w-5` (20px)
- Icon-only buttons: `min-h-[44px] min-w-[44px]` — touch target minimum
- Decorative icons: `aria-hidden`

### Icon Map

| Icon | Usage |
|------|-------|
| `Menu` / `X` | Mobile nav toggle |
| `Search` | Search input |
| `Play` | Channel playback |
| `Download` | File download |
| `Copy` | Clipboard actions |
| `ExternalLink` | External links |
| `Sun` | Light theme indicator |
| `Moon` | Dark theme indicator |
| `Monitor` | System theme indicator |

---

## Responsive Behavior

### Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| `xs` | 30rem (480px) | Custom — small phones |
| `sm` | 36rem (576px) | Small tablets |
| `md` | 48rem (768px) | Tablets |
| `lg` | 64rem (1024px) | Small desktops |
| `xl` | 80rem (1280px) | Full nav visible |
| `2xl` | 100rem (1600px) | Extra-wide labels |

### Nav Behavior

| Screen | Behavior |
|--------|----------|
| `< xl` | Hamburger menu with slide-down mobile nav |
| `>= xl` | Primary nav inline, secondary in "more" dropdown |
| `>= 2xl` | Full label text on buttons (e.g., "Enigma2 Setup") |

### Breakpoint Usage

```tsx
// Hidden below xl, visible above
className="hidden xl:flex"

// Small screens
className="px-4 sm:px-6 lg:px-8"

// Large text
className="text-2xl sm:text-3xl"
```

---

## Accessibility

### Standards

- **WCAG 2.1 AA** minimum
- Keyboard navigation throughout
- Focus visible ring: `2px solid var(--ring)`, offset 2px

### Requirements

| Requirement | Implementation |
|-------------|---------------|
| Semantic HTML | `<main>`, `<nav>`, `<article>`, `<header>`, `<footer>` |
| ARIA labels | `aria-current="page"` for nav, `aria-expanded` for toggles |
| Touch targets | Minimum 44×44px for all interactive elements |
| Color contrast | All text meets 4.5:1 minimum |
| Focus management | `:focus-visible` ring on all interactive elements |
| Reduced motion | `prefers-reduced-motion` disables all transitions |
| Skip to content | `#main-content` id on `<main>` |
| Selection | Accent color highlighting via `::selection` |

---

## Theme & Dark Mode

FreeEPG supports **Light**, **Dark**, and **System** themes via a header toggle.

### Three Modes

| Mode | Behavior |
|------|----------|
| **Light** | Forces light theme regardless of OS setting |
| **Dark** | Forces dark theme regardless of OS setting |
| **System** (default) | Follows `prefers-color-scheme: dark` / `light` |

### How It Works

1. **Header Toggle** (`ThemeToggle` component) cycles through: Light → Dark → System → Light
2. **localStorage** (`freeepg-theme`) persists the user's choice across sessions
3. **`.dark` class** on `<html>` activates dark CSS tokens
4. **`prefers-color-scheme`** still serves as the fallback for System mode
5. **`colorScheme`** is set on `html` for browser-native form styling

### Activation

```css
/* globals.css */
.dark {
  --background: #121110;
  /* ... all dark tokens */
}

/* Fallback: if no .dark class, still honor OS preference */
@media (prefers-color-scheme: dark) {
  :root:where(:not(.dark)) {
    /* dark tokens */
  }
}
```

### Theme Toggle Component

```tsx
import { ThemeToggle } from "@/components/ui/ThemeToggle";
// or
import { useTheme } from "@/lib/theme";
```

| Feature | Detail |
|---------|--------|
| Icon | Sun (light), Moon (dark), Monitor (system) |
| Cycle order | Light → Dark → System → Light |
| Persisted | `localStorage.getItem("freeepg-theme")` |
| Position | Header, next to language switcher |
| ARIA | `aria-label="Theme: Light mode"` etc. |
| Touch target | 44×44px minimum (icon-only) |

### Migration Checklist for New Components

When creating new components:
1. Reference tokens via `var(--name)`, not hex values
2. Test in both light and dark mode
3. Ensure accent color maintains contrast in both modes
4. Verify borders are visible on dark backgrounds
5. Test with all three theme modes (not just system)

---

## Animation & Motion

### General Rules

- **Duration**: 150ms for color transitions
- **Easing**: default ease-out (no custom curves)
- **Purpose**: only feedback — never decorative
- **Respect preference**: all animations disabled at `prefers-reduced-motion`

### Allowed Animations

| Transition | Where |
|-----------|-------|
| `transition-colors duration-150` | Buttons, badges, nav links |
| `transition-opacity` | Logo hover, card hover |
| `scroll-behavior: smooth` | Page anchors |

### Prohibited

- Auto-playing animations
- Parallax / scroll-linked effects
- Scale / transform animations
- Any animation that could trigger vestibular disorders

---

## Page Patterns

### Home Page

- Hero section with value proposition
- Stats row: total channels, active countries, EPG feeds
- Country grid: clickable cards with channel count, last update time
- Feature callouts: what FreeEPG offers

### Country / Channel Pages

- List/table layout with sort and filter
- Each row: channel logo, name, country flag, metadata
- Quick actions: copy URL, view EPG

### Player Page

- Video player embedded with HLS.js support
- Channel sidebar for browsing
- Chromecast button for cast to TV

### M3U Matcher

- Upload area (drag & drop or file picker)
- Results table with match confidence
- Override editor for manual corrections

### Documentation Pages

- Prose layout via `.prose-docs`
- Left-side nav (on wide screens)
- Code blocks with monospace font and muted background

---

## File Reference

| File | Purpose |
|------|---------|
| `Design.md` | Design system documentation |
| `apps/web/src/app/globals.css` | Design tokens, base styles, utilities |
| `apps/web/src/app/layout.tsx` | Root layout, font loading, body structure |
| `apps/web/src/app/page.tsx` | Home page route |
| `apps/web/src/lib/theme.ts` | Theme hook (light/dark/system), localStorage persistence |
| `apps/web/src/components/ui/ThemeToggle.tsx` | Theme toggle button with icon cycling |
| `apps/web/src/components/ui/` | Reusable UI primitives |
| `apps/web/src/components/layout/` | Global layout components |

---

*Last updated: 2026-10-09*
