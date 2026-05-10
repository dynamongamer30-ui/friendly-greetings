# Premium Cosmic Aurora Overhaul

A full visual + structural rebuild — Linear/Vercel-tier polish. Every layer rebuilt with intent, no leftover legacy effects fighting each other.

## 1. Foundation — design tokens + fonts (`src/index.css`, `index.html`)

Replace the current 5-font stack and cyan/gold mishmash with one coherent system.

- **Fonts**: load only **Space Grotesk** (display) + **DM Sans** (body) via `<link>` in `index.html` with preconnect. Remove Syne, Outfit, Plus Jakarta, JetBrains imports.
- **Tokens** (oklch in `:root`):
  - `--bg-base: #0A0A1A` · `--bg-elev: #141432` · `--surface: rgba(20,20,50,0.55)`
  - `--primary: #22D3EE` (cyan) · `--accent: #A78BFA` (violet) · `--text: #E8ECFF` · `--muted: #8B92B8`
  - `--border: rgba(167,139,250,0.14)` · `--border-strong: rgba(34,211,238,0.32)`
  - `--gradient-aurora: linear-gradient(135deg,#22D3EE 0%,#A78BFA 100%)`
  - `--shadow-glow: 0 0 40px -8px rgba(34,211,238,0.35)`
- Replace every hardcoded `#00F0FF` / `#FFD700` / `#7B2FFF` site-wide with these tokens (cards, buttons, tags, scrollbar, video-wrap, etc.).
- Body: DM Sans, antialiased, `-0.005em` tracking.

## 2. Background system — interactive 3D shader orb (`src/components/system/AuroraOrb.tsx`)

Replaces `Particles.tsx`, `cyber-grid`, `bg-glow-top`, fantasy aurora/stars/mountains entirely.

- New component using **OGL** (~6 KB, lighter than three.js) — install `ogl`.
- Single full-viewport `<canvas position:fixed z:0>` rendering a **fragment-shader aurora orb**:
  - Domain-warped fbm noise → aurora ribbons in cyan→violet gradient
  - Center glowing orb that subtly follows cursor (lerp, low intensity)
  - Slow rotation, ~30 FPS cap, pauses when tab hidden
  - Reduced-motion: static gradient image fallback (no shader loop)
- Layered behind everything; hero/cards sit on top with glassmorphism.
- One `<div>` vignette overlay for depth: radial mask darkening edges.
- `prefers-reduced-motion`: skip canvas entirely, render CSS gradient.

## 3. Hero rebuild (`src/components/home/HeroHeader.tsx`)

Strip the current file down. Remove typewriter, mountains, multiple aurora layers, in-hero particle canvas, gold sound button.

New structure (z-index disciplined):
- No background of its own — sits on top of global `AuroraOrb`.
- Centered: **logo** in a clean ring (single 1px violet→cyan gradient border, soft outer glow, no triple rings).
- **Title** in Space Grotesk 700, 56–72px desktop / 40px mobile, animated gradient text (cyan→violet→cyan, 8s loop) — no typewriter.
- **Subtitle** in DM Sans 400, `var(--muted)`.
- Below subtitle: a **3-stat pill row** (Downloads · Mods · Updated) — moved out of `HomePage` into the hero for visual hierarchy.
- Hero overlay buttons relocated into a single **top-right glass cluster**: `[🔔 Bell] [🏆 Achievements] [🔊 Sound]` — same height, same radius, 8px gap, never overlap announcement banner because banner sits ABOVE hero.

## 4. Announcement banner redesign (`src/components/home/AnnouncementBanner.tsx`)

- Position: full-width bar **above hero**, not overlapping it (current bug: bell+trophy float over it).
- Style: thin (32px), `var(--surface)` blur, single 1px bottom border in `var(--border)`, no pulsing.
- Marquee kept but slower (40s), centered megaphone icon in `var(--accent)`.
- Dismiss × in muted color, hover reveals.
- Bell/Trophy live in hero cluster (item 3) — physical separation guarantees no overlap.

## 5. Cards / chips / search redesign

- **ModCard** (`src/components/home/ModCard.tsx`): 16px radius, `var(--surface)` glass, 1px gradient border on hover, image with subtle parallax tilt on hover (framer-motion), category chip in pill form, download count with violet icon. Featured cards get cyan glow.
- **SearchBar** (`src/components/home/SearchBar.tsx`): floating glass pill, sticky on scroll, focus-ring in cyan. Category chips become full pills with active state using `--gradient-aurora` background.
- **Stat row**: lifted into hero (item 3), 3-up always, glass-pill style.
- **Footer** (`src/components/home/Footer.tsx`): tighter spacing, single socials row, subtle top divider.

## 6. Page transitions & micro-interactions

- Add **framer-motion** page fade+slide on route change in `src/App.tsx`.
- Cursor glow (`CursorGlow.tsx`) re-tinted to violet, lower opacity.
- Scroll progress bar (`ScrollProgress.tsx`) uses aurora gradient.
- All buttons: spring-based hover lift (no harsh translateY), focus rings on `var(--primary)`.

## 7. Admin panel `/main` — fix live DB connection

Root cause on `dynamongamer.space`: Firebase RTDB call rejected. Two likely causes; fix both:

**A. Authorized domains** — guidance only (user must add):
- Firebase Console → Authentication → Settings → **Authorized domains** → add `dynamongamer.space`, `www.dynamongamer.space`, and the `*.lovable.app` preview.
- Firebase Console → Realtime Database → **Rules** → confirm rules allow auth users to read.

**B. In code** (`public/main.html`):
- Replace the 12s hard timeout failure path with: retry 3× with exponential backoff (1s/3s/6s) before giving up.
- On final failure show a clearer toast: "Database unreachable — check Firebase rules / authorized domains" with a manual **Retry** button (not auto-signout).
- Wrap the initial `.once('value')` health-check in a try/catch that distinguishes auth errors (`PERMISSION_DENIED`) from network errors and surfaces the real message.
- Add a `?diag=1` query param mode that prints the failing path + error code to a visible debug panel — so we can confirm what's failing on live.

## 8. Cleanup / removals

- Delete `Particles.tsx` (replaced by `AuroraOrb`).
- Delete `cyber-grid` and `bg-glow-top` CSS classes + their usage in `HomePage.tsx`.
- Remove unused font imports + 4 unused `--font-*` tokens.
- Strip `fantasy-aurora-1`, `fantasy-stars`, `logo-ring-2/3`, `logo-aura`, `typewriter-caret`, `yt-neon-pulse` (replace with calm violet pulse).

## Files touched

`index.html` · `src/index.css` · `src/App.tsx` · `src/pages/HomePage.tsx` · `src/components/system/AuroraOrb.tsx` (new) · `src/components/home/HeroHeader.tsx` · `src/components/home/AnnouncementBanner.tsx` · `src/components/home/ModCard.tsx` · `src/components/home/SearchBar.tsx` · `src/components/home/Footer.tsx` · `src/components/system/CursorGlow.tsx` · `src/components/ui/NotificationBell.tsx` · `src/components/ui/AchievementHistory.tsx` · `public/main.html` · delete `src/components/home/Particles.tsx`

## Out of scope

- Reskinning the whole `/main` admin panel HTML to match React (separate large effort).
- Migrating off Firebase RTDB.
- Server-side rendering changes.

## After implementing

You'll need to: (1) add the authorized domains in Firebase Console as noted in 7A, (2) click **Update** in the publish dialog to push frontend changes live to `dynamongamer.space`.