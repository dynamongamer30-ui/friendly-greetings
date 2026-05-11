# Dynamon Gamer — Premium Visual Overhaul Plan

Scope: pixel, motion, sound, feel. Zero changes to Firebase, auth, routing, sessions, encryption, rate limiting, admin logic, or any data hook. Only presentation files (`src/components/**`, `src/index.css`, `src/lib/sound.ts`, `src/components/system/*`, `src/components/ui/*`).

---

## 1 — Visual & Design

### 1.1 Background depth pass *(Medium)*
- **Now:** Single `AuroraOrb` WebGL shader fills the viewport.
- **Propose:** Add three stacked, non-interactive layers behind it: (a) faint 1px noise/grain PNG at 4% opacity, (b) a slow-drifting starfield (CSS `background-image` of dots, 60s `translate` loop), (c) a subtle vignette mask (radial darkening at edges 0%→18%).
- **Why:** Kills the flat “gradient blob” feel — adds atmospheric depth like Linear/Vercel hero sections.

### 1.2 Glass refinement *(Easy)*
- **Now:** `.glass-panel` = blur 22px, flat 1px border, single fill.
- **Propose:** Add inner highlight (top edge `inset 0 1px 0 rgba(255,255,255,0.06)`), outer ambient shadow (`0 30px 60px -20px rgba(0,0,0,0.6)`), and a **gradient border** via `border-image` cyan→violet→transparent at 18% alpha. Add `.glass-panel--strong` and `.glass-panel--subtle` variants for hierarchy.
- **Why:** True frosted-glass depth; current panels read as flat tinted rectangles on mobile.

### 1.3 Color token system *(Medium)*
- **Now:** Hex colors hardcoded inline in dozens of components (`#22D3EE`, `#A78BFA`, `#8B92B8`, `#0A0A1A`).
- **Propose:** Promote all to CSS custom properties (`--c-aurora-cyan`, `--c-aurora-violet`, `--c-text-mute`, `--c-surface-1/2/3`) and reference everywhere. Add `--gradient-aurora-radial`, `--gradient-aurora-conic`, `--shadow-aurora-sm/md/lg` reusable tokens.
- **Why:** One file controls the entire palette → instant theme tweaks, perfect consistency.

### 1.4 Hero stat pills upgrade *(Easy)*
- **Now:** Three flat glass tiles with small icon + number.
- **Propose:** Add gradient top-edge accent line (cyan→violet 1px), animated count-up on first paint (already have `RollingNumber` — reuse), tiny pulsing dot next to “Updated” label, hover lift `translateY(-2px)` with cyan glow.
- **Why:** Pills currently feel static; small motion makes the hero feel alive.

### 1.5 Mod card polish *(Medium)*
- **Now:** Holographic tilt + radial shimmer + ripples + flip — already strong.
- **Propose:** (a) Gradient corner accent (top-right cyan→violet triangle 30×30 at 25% opacity), (b) image lazy-load with blur-up placeholder (LQIP shimmer → sharp), (c) bottom “download bar” fills with cyan gradient as `downloads` approach next milestone, (d) replace the orange `🔥` emoji with a custom flame SVG that flickers.
- **Why:** Cards become trophy-like, milestone progress becomes visible at a glance.

### 1.6 Search bar reinvented *(Medium)*
- **Now:** Flat dark input with placeholder.
- **Propose:** Floating glass capsule with aurora-gradient outline that **animates from cyan to violet on focus**, magnifier icon morphs to sparkle while typing, animated placeholder cycling through suggestions (“Try ‘Dynamons World 2’…”, “Try ‘Unlimited Coins’…”) with typewriter cadence, clear button rotates 90° on appear.
- **Why:** The search bar is the second-most-touched element; right now it’s the dullest.

### 1.7 Category pills *(Easy)*
- **Now:** Standard rounded buttons, color flip on active.
- **Propose:** Active pill gets animated aurora gradient *fill* with subtle conic rotation, inactive pills get hairline border only. Switch animation: layoutId (framer-motion) so the gradient pill slides between categories instead of swap-flashing.
- **Why:** Tab switching becomes a hero moment.

### 1.8 Footer *(Easy)*
- **Now:** Plain text + links.
- **Propose:** Add aurora wave divider at top (animated SVG path, 10s loop), social icons get magnetic hover (slight pull toward cursor), tiny gradient watermark of site name behind copyright.

### 1.9 Buttons system *(Easy)*
- **Now:** `.btn-primary` solid cyan + glow.
- **Propose:** Add `.btn-aurora` (animated gradient fill that flows left↔right), `.btn-glass` (frosted with inner glow on hover), and a *liquid press* effect: on `:active`, scale 0.97 + inner shadow ripple.
- **Why:** Buttons currently glow but don’t feel tactile.

### 1.10 Empty states / loading skeletons *(Easy)*
- **Now:** Generic shimmer rectangles; EmptyState exists but plain.
- **Propose:** Skeletons get aurora-tinted shimmer (currently white). EmptyState gets a small animated SVG illustration (floating gamepad with orbit ring) + helpful CTA copy.

### 1.11 Notification bell + Achievement history *(Easy)*
- **Now:** Glass icon buttons.
- **Propose:** Bell wiggles (rotate ±8° spring) when unread > 0; numeric badge gets spring scale-in. Trophy button pulses aurora-violet when new achievement unlocked.

### 1.12 Lightbox (image preview) *(Easy)*
- **Now:** Standard backdrop + image.
- **Propose:** Backdrop uses the AuroraOrb shader at 30% opacity, image gets a subtle `box-shadow` aurora bloom, swipe-to-dismiss with rubberband on mobile.

### 1.13 Comments section glow accents *(Easy)*
- **Now:** Plain text bubbles.
- **Propose:** Author avatar gets thin aurora ring (1.5px), reply threads get a vertical aurora-gradient connector line, “new comment” entry animates with spring slide-up + soft chime.

### 1.14 Toasts *(Easy)*
- **Now:** GlassToast exists.
- **Propose:** Add type-specific left-edge accent bar (success=cyan, error=red-pink, info=violet, achievement=animated aurora). Add subtle progress hairline at bottom that depletes over duration.

---

## 2 — Typography

### 2.1 Display / body pairing audit *(Easy)*
- **Now:** Space Grotesk + DM Sans loaded via `<link>`; mostly applied.
- **Propose:** Lock Space Grotesk 700 for display, 500 for UI labels, DM Sans 400/500 for body. Remove inline `fontFamily` declarations everywhere — let CSS variables (`--font-display`, `--font-body`, `--font-ui`) take over.

### 2.2 Variable font upgrade *(Medium)*
- **Now:** Static weights.
- **Propose:** Switch to **Space Grotesk Variable** + **DM Sans Variable**. Use `font-variation-settings: 'wght' var(--w)` with smooth weight transitions on hover (e.g. nav links morph from 500 → 700).
- **Why:** Fewer HTTP requests, buttery weight transitions impossible with static fonts.

### 2.3 Fluid type scale *(Easy)*
- **Now:** Mix of `text-[44px]`, `text-7xl`, fixed rems.
- **Propose:** Replace with a `clamp()` scale: `--text-display: clamp(2.5rem, 6vw, 4.5rem)`, `--text-h2: clamp(1.75rem, 4vw, 2.75rem)`, etc. Apply via utility classes.
- **Why:** Perfectly readable from 320px → 1920px without breakpoints.

### 2.4 Text rhythm *(Easy)*
- **Now:** Inconsistent leading and letter-spacing.
- **Propose:** Standardize: display `tracking-[-0.03em] leading-[1.02]`, headings `tracking-[-0.02em] leading-[1.12]`, body `leading-[1.6]`, UI labels `tracking-[0.08em] uppercase`.

### 2.5 Aurora-text refinement *(Easy)*
- **Now:** `.aurora-text` 8s shimmer (great).
- **Propose:** Add `.aurora-text--slow` (16s, for long titles) and `.aurora-text--static` (no animation, just gradient — for dense UIs). Add subtle 0.5px text-shadow in cyan for glow on dark backgrounds.

### 2.6 Numerals *(Easy)*
- **Now:** Default proportional figures.
- **Propose:** Apply `font-variant-numeric: tabular-nums` to all stat counters, download counts, ratings — numbers stop shifting as they update.

### 2.7 Selection style *(Easy)*
- **Propose:** `::selection` → background `rgba(34,211,238,0.35)`, text `#E8ECFF`. Branded text selection.

---

## 3 — Animation & Motion

### 3.1 Page transitions *(Medium)*
- **Now:** `PageTransition.tsx` exists; route changes feel abrupt on mobile.
- **Propose:** Use framer-motion `AnimatePresence` with mode="wait": exit = scale 0.98 + fade + 6px upward, enter = scale 1.02→1 + fade + downward 6px settle. Add a thin aurora progress bar at the very top during navigation (1.5s).

### 3.2 Scroll-driven reveals *(Easy)*
- **Now:** `.reveal` class with d1–d5 delays — manual.
- **Propose:** Replace with IntersectionObserver hook `useReveal` that auto-staggers children by index. Add variants: `reveal-up`, `reveal-fade`, `reveal-scale`, `reveal-slide-left`.

### 3.3 Hero entrance choreography *(Medium)*
- **Now:** Logo + title + subtitle + pills fade up with delays.
- **Propose:** Cinematic sequence — (1) aurora bloom expands from center 0→100% over 0.6s, (2) ring draws around logo via SVG `strokeDashoffset` 0.4s, (3) wordmark letters cascade in 40ms stagger, (4) subtitle fades, (5) pills slide up with spring (stiffness 220, damping 24). Total: 1.4s.

### 3.4 Microinteractions catalog *(Medium)*
Every interactive element gets a defined state:
- Buttons: hover lift `-2px` + glow scale, active `0.97` + inner ring
- Icons: hover spin/bounce based on semantic meaning (download = bounce-down, share = pop, refresh = 360°)
- Toggle (sound, ambient): the icon morphs (Volume2 → VolumeX) with crossfade + scale, not a hard swap
- Inputs: focus = aurora ring expand from center
- Checkboxes: check appears with SVG `pathLength` draw

### 3.5 Number count-ups *(Easy)*
- **Now:** `RollingNumber` ticks via setInterval — fine but linear.
- **Propose:** Use `requestAnimationFrame` with `easeOutExpo` so big numbers slow gracefully. Add comma flash (briefly bold) on each thousand crossed.

### 3.6 Magnetic cursor (desktop only) *(Medium)*
- **Now:** `CursorGlow` exists.
- **Propose:** Buttons within cursor radius gently pull toward it (max 6px translation). Disabled on touch via `pointer: coarse` media query.

### 3.7 Scroll progress *(Easy)*
- **Now:** `ScrollProgress.tsx` exists.
- **Propose:** Replace solid bar with a 2px aurora gradient that *flows* (background-position animates).

### 3.8 Back-to-top *(Easy)*
- **Now:** Standard FAB.
- **Propose:** Appears with spring scale-in + idle gentle bounce every 6s. Click triggers smooth scroll with custom easing curve and a brief upward whoosh.

### 3.9 Mod grid layout transitions *(Medium)*
- **Now:** Cards re-render on filter/sort with no animation.
- **Propose:** Wrap grid in framer-motion `<LayoutGroup>`, give each card `layout` prop — cards now slide to new positions on filter change instead of pop-in/pop-out.

### 3.10 Loading screen evolution *(Easy)*
- **Now:** Aurora wordmark reveal (good).
- **Propose:** Add a final “shutter” transition: instead of plain fade, the screen splits horizontally (top half slides up, bottom slides down) revealing the app behind — 600ms cinematic curtain.

### 3.11 Achievement toast choreography *(Easy)*
- **Now:** Slide in from top-right.
- **Propose:** Trophy icon spins 360° on entry, particles burst from icon (8 small dots), text types in letter by letter (60ms stagger), exit = scale down + fade.

---

## 4 — Sound Design

### 4.1 Sound palette refinement *(Medium)*
- **Now:** Web Audio tones — click 440Hz, hover 880Hz, success arpeggio, etc. Functional but harsh.
- **Propose:** Apply a global lowpass filter (3000Hz) + soft reverb (convolver with synthesized impulse) to all tones → warmer, more “app-like” feel. Add stereo panning for spatial richness (e.g. notifications come from right, errors center, achievements wide).

### 4.2 Ambient layer *(Easy)*
- **Now:** Two-osc drone behind a toggle.
- **Propose:** Add a slow LFO modulation on the filter cutoff (0.05Hz, ±200Hz) so the drone breathes. Add a third osc one octave up at 8% gain for shimmer. Already off by default — keep that.

### 4.3 Per-action sound mapping audit *(Easy)*
Define and apply consistently:
- `playClick`: short tap (existing 440Hz, soften)
- `playHover`: only on cards/big targets (already throttled)
- `playToggle`: new — square wave bleep, up for on / down for off
- `playOpen`: glass swell (sine 200→600Hz + noise wash) — for modals/lightbox
- `playClose`: reverse of open
- `playAchievement`: existing fanfare
- `playRipple`: short noise pluck — when ripple fires
- `playTypeKey`: rare, 1 in 4 keystrokes only

### 4.4 Sound-on hint *(Easy)*
- **Propose:** First-visit gentle one-time toast “🔊 Sounds on — toggle anytime” with a tiny preview chime, dismissed forever after first interaction.

### 4.5 Reduced-motion / mute respect *(Easy)*
- **Propose:** When `prefers-reduced-motion: reduce`, also mute all non-essential sounds automatically (keep success/error). Document in a single config.

---

## 5 — Effects & Polish

### 5.1 Particle systems *(Medium)*
- **Now:** No particles after the recent removal.
- **Propose:** Three contextual particle micro-bursts (Canvas2D, ≤30 particles, GC-friendly):
  - On download click: 12 cyan dust particles burst from button
  - On achievement unlock: 20 violet stars from trophy icon
  - On 1k download milestone: confetti aurora ribbon across card

### 5.2 Glow & bloom *(Easy)*
- **Propose:** Define `--glow-cyan-sm/md/lg` and `--glow-violet-sm/md/lg` tokens (multi-layer `box-shadow`s). Apply to focused inputs, hovered cards, active toggles uniformly.

### 5.3 Gradient borders *(Easy)*
- **Propose:** A `.gradient-border` utility using `::before` overlay with `mask-composite: exclude` so borders animate cyan→violet flow on hover (no jankier alternative needed).

### 5.4 Cursor variants *(Medium)*
- **Now:** Single CursorGlow.
- **Propose:** Variants: default = small dot + soft halo; over button = halo expands 2x; over text = becomes vertical bar; over draggable = grab indicator. State changes via cursor context.

### 5.5 Hover preview on mod cards *(Hard)*
- **Propose:** After 1.2s hover, card image fades to a 3-image carousel (if `screenshots` exist) with smooth crossfade — no click required.

### 5.6 Sticky header on scroll *(Medium)*
- **Now:** No sticky compact header.
- **Propose:** After scrolling 240px, condense site name + search into a thin glass bar that slides down from top (translate-Y -100% → 0). Hides on scroll-down, shows on scroll-up.

### 5.7 Scroll-snap on featured carousel *(Easy)*
- **Now:** TrendingCarousel exists; freely scrollable.
- **Propose:** CSS `scroll-snap-type: x mandatory` + `scroll-snap-align: start` on each card. Add fade masks on left/right edges so cards fade out instead of cutting off.

### 5.8 Confetti / celebration moments *(Easy)*
- **Propose:** First download, 5th download, 10th download → milestone toast + small confetti. Use lightweight canvas (<2KB).

### 5.9 Dark/light shimmer *(Easy)*
- **Propose:** A 1px highlight scanline drifts diagonally across glass panels every 12s — barely visible but adds liveliness (like premium mobile UIs).

### 5.10 Image quality *(Easy)*
- **Propose:** Add `loading="lazy"` (already partially), `decoding="async"`, and `srcset` hints for mod cover images. Add `aspect-ratio: 16/10` to avoid CLS.

### 5.11 Favicons + theme color *(Easy)*
- **Propose:** Aurora-gradient SVG favicon, `<meta name="theme-color" content="#0A0A1A">` for mobile chrome bar, app-icon set for PWA install.

---

## 6 — Mobile Fluidity

### 6.1 Touch targets *(Easy)*
- **Now:** Some icons 32×32 (below Apple HIG 44px).
- **Propose:** Audit and pad all interactive elements to minimum 44×44 hit area. Use invisible padding to keep visual size unchanged.

### 6.2 Safe-area insets *(Easy)*
- **Propose:** Use `env(safe-area-inset-*)` on the bottom sticky bar, header, BackToTop — proper iPhone notch/home-indicator avoidance.

### 6.3 Pull-to-refresh interception *(Easy)*
- **Now:** Default browser behavior on iOS may show ugly bounce.
- **Propose:** `overscroll-behavior-y: contain` on body, optional custom pull-to-refresh that re-fetches mods with an aurora spinner.

### 6.4 Tap feedback *(Easy)*
- **Propose:** Add `:active { transform: scale(0.97) }` + brief radial highlight on every tappable surface (consistent with Material/Apple touch ripple).

### 6.5 Smooth momentum scroll *(Easy)*
- **Propose:** `-webkit-overflow-scrolling: touch` on horizontal carousels; `scroll-behavior: smooth` on anchored scrolls; CSS `overscroll-behavior` tuned per region.

### 6.6 Bottom tab haptics (PWA) *(Easy)*
- **Propose:** On tap, fire `navigator.vibrate(8)` for crisp tactile feedback (Android). Wrapped in feature detect.

### 6.7 Mobile typography scale *(Easy)*
- **Propose:** Slightly tighter line-height on small viewports (`1.5` → `1.45` for body) to reduce vertical scroll.

### 6.8 Drawer / bottom-sheet pattern *(Medium)*
- **Now:** Modals center-screen on mobile.
- **Propose:** On `<= 640px`, modals become bottom sheets with drag-handle, swipe-down dismiss, rubber-band physics. Feels native.

### 6.9 Mobile cursor effects disabled *(Easy)*
- **Propose:** Wrap `CursorGlow`, magnetic hover, tilt effects in `@media (hover: hover) and (pointer: fine)` so phones aren’t doing wasted work.

---

## 7 — Performance & 60fps

### 7.1 GPU compositing audit *(Medium)*
- **Propose:** Add `will-change: transform, opacity` to animated elements only during animation (toggle on/off). Promote glass panels to their own layer (`transform: translateZ(0)`) to avoid backdrop-filter repaints.

### 7.2 Backdrop-filter cost *(Medium)*
- **Now:** Many `backdrop-filter: blur(22px)` panels; expensive on Safari iOS.
- **Propose:** Reduce to `blur(14px)` on mobile, fall back to a tinted gradient on `prefers-reduced-transparency`. Memoize panels that don’t need blur (e.g. footer).

### 7.3 Shader render budget *(Easy)*
- **Now:** `AuroraOrb` already throttled to 30fps + pauses on hidden tab.
- **Propose:** Drop to 24fps on touch devices, full 60fps on desktop with `prefers-reduced-motion: no-preference`. Skip render entirely when scrolled past hero (IntersectionObserver).

### 7.4 Animation cleanup *(Easy)*
- **Propose:** Audit every `setInterval`/`setTimeout` for cleanup. Replace `setInterval`-driven counters with `requestAnimationFrame` (fewer wakeups, syncs to vsync).

### 7.5 Code splitting visual chunks *(Medium)*
- **Propose:** Lazy-load Lightbox, AchievementHistory, AdminPage chunks. Defer particle scripts until first interaction.

### 7.6 Image decode *(Easy)*
- **Propose:** All `<img>` get `decoding="async"`, `fetchpriority="high"` for above-the-fold logo/hero, `fetchpriority="low"` for below-the-fold cards.

### 7.7 Animation frame contention *(Medium)*
- **Propose:** Single shared `rAF` ticker for cursor glow, scroll progress, and aurora orb mouse smoothing — instead of three independent loops. Cuts frame budget cost by ~60%.

### 7.8 Reduced-motion respect *(Easy)*
- **Propose:** A single CSS rule `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }` plus turn off shader, particles, and ambient sounds.

### 7.9 Font load strategy *(Easy)*
- **Now:** Two `<link>` font requests, blocking text paint.
- **Propose:** `font-display: swap` + preload only the two used weights (700 display, 400 body). Subset to Latin only.

### 7.10 CSS containment *(Easy)*
- **Propose:** Add `contain: layout paint style` to mod cards, comments, toasts — limits browser reflow scope, giant win on long lists.

---

## Files in scope (summary, no edits this round)

`src/index.css` · `src/components/system/{LoadingScreen,AuroraOrb,CursorGlow,PageTransition}.tsx` · `src/components/home/*` · `src/components/ui/*` · `src/components/download/*` · `src/components/comments/*` · `src/lib/sound.ts` · `index.html` (font preloads, theme-color)

## Strict no-touch list

Firebase (`src/lib/firebase.ts`), all `useDb`/`useModeration`/`useRatings` hooks, `cipher.ts`, `fingerprint.ts`, admin handlers, key/unlock logic, routing tree, session/auth flows.

## Suggested execution order

1. Foundation — design tokens (1.3), typography (2.x), sound polish (4.1)
2. Hero polish — 1.4, 3.3, 1.6
3. Mod cards — 1.5, 3.9, 5.1
4. Global feel — 3.x microinteractions, 5.2–5.4
5. Mobile pass — section 6
6. Performance pass — section 7

I’d ship 1 → 4 first (biggest visible jump), then 5–7 as a polish sweep.
