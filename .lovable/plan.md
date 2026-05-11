
# Visual Bug Fix Plan (UI only — no Firebase / auth / routing changes)

## Bug 1 — Hero Avatar Square Artifact

**Root cause (`src/components/home/HeroHeader.tsx`):**
- The avatar wrapper (`absolute inset-2 rounded-full overflow-hidden`) has a 1px violet border. Combined with the `boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)'` and the radial mask on the `<img>`, the masked transparent corners reveal the dark linear-gradient background of the wrapper, while the surrounding outer `motion.div` (`w-28 h-28`, no radius) shows a faint square outline at certain DPRs.
- The `WebkitMaskImage` radial fade on the image creates the soft edge that bleeds out to a visible square box behind it.

**Fix:**
- Remove the radial mask on `<img>`; rely entirely on the parent's `border-radius: 50% + overflow: hidden` for a clean circle.
- Make the wrapper a strict perfect circle: `width: 100%`, `height: 100%`, `border-radius: 9999px`, `overflow: hidden`, `display: block`, no inner border, no inset shadow that draws a hard ring.
- The `<img>` becomes: `display: block`, `width: 100%`, `height: 100%`, `object-fit: cover`, `object-position: center`. Nothing else — no mask, no clipPath.
- Move the soft edge/glow effect to a separate non-clipping sibling overlay (a `rounded-full` div with inset radial shadow above the img) so the image itself remains a clean cover-fit circle.
- Outer `motion.div` stays `w-28 h-28` but receives `rounded-full` so any incidental shadow inherits the circular shape.
- Same treatment for the logo preview in `SettingsTab.tsx` (line 102-108) which currently uses `bg-black border` square wrapper around an avatar — switch to a pure `rounded-full overflow-hidden` div with the img filling 100%.

**Verify:** at 375px viewport, screenshot the hero — no square outline, no dark bleed corners.

---

## Bug 2 — Admin Tabs Look "Empty"

**Root cause:** The tab content IS rendering (Settings/Security/Tutorial all return JSX). The screenshots show that the inputs at the top of each tab are nearly invisible because:
- `.cmt-input` uses `background: rgba(0,0,0,0.45)` with `border: rgba(255,255,255,0.1)` — against the heavy purple aurora background, the inputs blend into the page and the labels (`text-[#94a3b8]` at `text-xs`) are faint.
- `<label>` text + thin input border + dark fill = invisible against backdrop.
- The "Save Settings" button at the bottom is the only visible thing because it's solid cyan.

**Fix (CSS only, in `src/index.css`):**
- Boost `.cmt-input`: `background: rgba(20,20,50,0.65)`, `border: 1px solid rgba(34,211,238,0.18)`, `border-radius: 12px`, `backdrop-filter: blur(14px)`, `color: #E8ECFF`, stronger `:focus` ring (cyan glow).
- Strengthen field labels via a new `.admin-label` (or upgrade `text-xs font-semibold text-[#94a3b8]` usage) to `color: #E8ECFF, opacity: 0.85`.
- Wrap each tab's body in a `glass-panel` card so content sits on a defined surface above the aurora bg.
- Add a shimmer skeleton component for loading states (replacing the lone `Loader2`) — already have `.shimmer` class, just compose 3-4 stacked rounded bars per tab while `isLoading`.
- Add explicit `EmptyState` for DMCATab (already done), Comments (done), and any tab that returns nothing.

No conditional-render bugs to fix — content renders, it's purely a contrast/visibility issue.

---

## Bug 3 — Admin Panel Unstyled

**Root cause:** Admin uses `.cmt-input` (faint), `<select>` styled via inconsistent classes, and the page lacks the aurora mesh background that the home page renders.

**Fix:**
1. **Inputs/selects**: see Bug 2 — same restyle covers all `<input>`, `<textarea>`, and `GlassSelect` triggers (already glassy, but bump border to cyan-tinted to match).
2. **Buttons**: keep `.btn-primary` / `.btn-ghost` (already on-brand). Audit admin for any raw `<button className="bg-...">` and convert.
3. **Tab bar icons**: in `AdminPage.tsx`, the tab buttons currently render `w-4 h-4` icons. Bump to `w-5 h-5` (24px target hit area), set active state to `background: rgba(34,211,238,0.15)`, `border: 1px solid rgba(34,211,238,0.4)`, and add a subtle cyan glow.
4. **Aurora background**: the admin page is rendered inside `App.tsx`'s shell which already mounts `AuroraOrb` globally. Confirm the admin page does NOT set its own opaque background. The `<aside>` uses `rgba(20,20,50,0.55)` glass — keep, but ensure `<main>` has `background: transparent` so the global aurora shows through.
5. **Cards**: wrap each form section in `.glass-panel` (`backdrop-blur-xl`, `bg-white/[0.04]`, `border-white/[0.08]`) — apply at the tab component level (Settings, Security, Tutorial, DMCA, Mods).

---

## Bug 4 — Header Icon Cluster (Bell / Trophy / Sound)

**Root cause:** In `HeroHeader.tsx` lines 36-54, each of the three buttons (`NotificationBell`, `AchievementHistory`, sound toggle) renders its own `w-10 h-10 rounded-xl` glass tile. The container is just a `flex gap-2` — no shared surface.

**Fix:**
- Wrap the three in a single pill: `display: flex, gap: 8px, padding: 6px, border-radius: 9999px, background: rgba(20,20,50,0.55), backdrop-filter: blur(16px), border: 1px solid rgba(167,139,250,0.18)`.
- Inside the pill, strip each child button of its own `background`, `border`, and `backdrop-filter` — they become `w-9 h-9 rounded-full` icon-only buttons with `hover:bg-white/5`.
- This requires editing `NotificationBell.tsx` and `AchievementHistory.tsx` to accept a `variant="bare"` prop (or simply detect grouped context via prop) so they render without their own glass tile when inside the pill. Default standalone behavior preserved.

---

## Files Touched (presentation only)

- `src/components/home/HeroHeader.tsx` — avatar restructure + icon pill wrapper
- `src/components/ui/NotificationBell.tsx` — add `bare` variant
- `src/components/ui/AchievementHistory.tsx` — add `bare` variant
- `src/components/admin/SettingsTab.tsx` — wrap form in glass-panel + fix logo preview circle
- `src/components/admin/SecurityTab.tsx` — wrap in glass-panel + skeleton loader
- `src/components/admin/TutorialTab.tsx` — wrap in glass-panel + skeleton loader
- `src/components/admin/DMCATab.tsx` — wrap in glass-panel + skeleton loader
- `src/components/admin/ModsTab.tsx` — wrap in glass-panel
- `src/pages/AdminPage.tsx` — bump tab icons to 24px, transparent main bg, sharper active tab style
- `src/index.css` — restyle `.cmt-input`, add `.admin-skeleton` shimmer block, tweak `.glass-select-trigger` border tint

**Out of scope (not touched):** Firebase calls, auth flow, session storage logic, routing, rate limit logic, encryption/cipher, admin permission checks.

**Verification:** browse `/`, `/admin` (login required — user must be logged in), screenshot at 384px mobile and confirm no square avatar artifact, all admin inputs visible with cyan-tinted borders, three header icons share one pill.
