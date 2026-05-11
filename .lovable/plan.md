# Premium Loading & Hero Logo Refresh

Two focused upgrades: a cinematic loading intro and a true-circular animated ring around the avatar (no more square look).

---

## 1. Loading screen — Aurora Wordmark Reveal

Replace the current gamepad spinner + dual rotating arcs entirely.

**File:** `src/components/system/LoadingScreen.tsx` (rewrite)

**What it looks like:**
- Pure `#05080A` backdrop with a single soft radial aurora glow centered behind the wordmark (cyan → violet, very low opacity, slow pulse).
- Wordmark **"Dynamon Gamer"** (or `siteMeta.siteName`) in **Space Grotesk 700**, 2.6rem on mobile / 3.4rem desktop, tight tracking.
- Letters animate in **one-by-one** with a 40ms stagger using a clip-path sweep (left → right) so the aurora gradient appears to "paint" each letter.
- Below: a 1px hairline (180px wide) that fills cyan→violet over 1.6s, then fades.
- After fill completes, the entire screen does a **subtle upward wipe + fade** (0.5s) to reveal the app — feels like a curtain lifting.
- Total duration: ~2.0s. Respects `prefers-reduced-motion` (instant fade).

**Why it's premium:** No icons, no spinners, no clutter. Pure typographic reveal — the same approach used by Linear, Vercel, and Apple keynote intros.

---

## 2. Hero avatar — Liquid Gradient Ring

The current "square" appearance comes from the conic-gradient mask not rendering as a perfect circle on mobile WebKit. Fix it with a true SVG-based ring.

**File:** `src/components/home/HeroHeader.tsx` (logo block only)

**What changes:**
- Remove the `conic-gradient + mask` ring (the buggy square one).
- Replace with an **SVG circle** (`<circle stroke="url(#auroraGradient)" />`) — guaranteed perfect circle on every device.
- The SVG `<linearGradient>` rotates via CSS `transform: rotate()` on a wrapping `<g>`, creating a smooth liquid flow around the ring (8s loop).
- Outer **bloom**: a second SVG circle with heavy gaussian blur filter, 40% opacity, pulsing gently (4s breathe).
- Inner avatar: unchanged circular image, but border becomes `1px solid rgba(167,139,250,0.25)` (thinner, more refined).
- Add a subtle 6s **float** animation (`translateY: 0 → -4px → 0`) so the whole logo gently drifts.

**Result:** Crisp circular halo, no square edges, more depth.

---

## Technical notes

- LoadingScreen rewrite uses CSS `@keyframes` + `clip-path: inset()` for the letter sweep — no extra libraries needed (framer-motion already installed but CSS is lighter for the splash).
- SVG ring uses `<defs><linearGradient id="auroraRing">` with two stops (`#22D3EE`, `#A78BFA`) and `gradientTransform` animated via CSS.
- Both changes are presentation-only — no logic, hooks, or routing touched.
- Files touched: 2 (`LoadingScreen.tsx`, `HeroHeader.tsx`).

---

## Out of scope

- Background AuroraOrb shader (kept as-is).
- Stat pills, search bar, mod cards (kept as-is).
- Any `/main` or admin changes.
