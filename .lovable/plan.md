# Fix overlap, comments, /main flow, visual polish

## Issues found

1. **Floating buttons overlap content** — `NotificationBell` (`fixed top-4 left-4`) and `AchievementHistory` (`fixed top-4 left-16`) sit on top of the "Back to Home" link on `/download` and on top of the "Admin Panel" header in the admin dashboard. Same buttons also collide with the announcement banner on home.
2. **No "delete comment" for admin** — only Approve/Reject exist on already-approved comments. Approved comments cannot be removed later. Also no bulk action.
3. **Comment approval flow is fine on backend, but UI is unclear** — pending comments are mixed with approved ones in one list; no filter (Pending / Approved / All).
4. **`/main` (admin panel HTML) keeps buffering and asks for Database URL** — `appInit()` throws on first DB read (rules / init order), then falls back to `viewSetup` which shows the DB URL form. We just want password-only login.
5. **Visual issues** — clunky default cyan-on-black, the `Syne` hero font + typewriter looks generic, hero has too many overlapping aurora/star/ray layers fighting the logo and title (the screenshot shows a low-quality "fuzzy" look), category chips and stat row crowded on mobile (384 px viewport).

## Plan

### A. Stop overlapping (UI/CSS only)

- `NotificationBell` and `AchievementHistory`:
  - Move both off `fixed top-4 left-*`. Render them inline inside `HeroHeader` (top-right cluster, next to the existing sound toggle) on home, and **hide them entirely on `/download` and `/admin`** (pass a `placement` prop or read route via `useLocation`).
  - On home, group as a single rounded pill: `[🔔] [🏆] [🔊]` with consistent 36 px sizing, gap-2, sitting in the hero's safe area (top-4 right-4) so nothing overlaps "Back to Home" or the admin header.
- Add `pt-14` / `pt-16` safe padding to `DownloadPage` and `AdminPage` headers so even legacy floats can't cover content.

### B. Comment moderation upgrades

- `CommentsTab`:
  - Add filter tabs at top: **Pending • Approved • All** (default Pending), with counts.
  - On every comment card add a third action **Delete** (trash icon, red) — calls a new `useDeleteComment` mutation that removes `/Comments/{modId}/{commentId}` regardless of approval state. Approve/Reject stay for pending only.
  - Add a "select all + bulk delete / bulk approve" footer bar when items are selected.
  - Show small `APPROVED` / `PENDING` status pill on each card.
- `useModeration.ts`: add `useDeleteComment` (same shape as `useRejectComment` but semantically separate, plus optimistic invalidation).
- Confirm delete via existing `glassToast` confirm pattern (or simple `window.confirm` if no confirm toast exists).

### C. `/main` admin panel — password-only, no DB URL prompt

In `public/main.html`:
- Remove `viewSetup` entirely from the auth/init flow. Never show the "Enter Database URL" screen.
- The `databaseURL` is already hard-coded in `firebaseConfig` at line 1177 — use it directly, no prompt.
- Rewrite `appInit()` failure branch: instead of `show('viewSetup')`, retry once with backoff, then surface a clean toast `"Cannot reach database — check your connection"` and stay on the login screen.
- Remove the buffering "Establishing Uplink…" loader after auth — go straight from login → dashboard. Show a small inline spinner on the login button instead.
- Delete the now-dead `saveUrlAndConnect()` function and the `inputDbUrl` markup.
- Result: user opens `/main` → sees password field only → enters password → dashboard.

### D. Visual / "good looking" upgrades

- **Hero (`HeroHeader.tsx`)**: simplify the stack — keep ONE aurora layer + stars + particles canvas, drop the duplicate aurora-2/3 and god-rays that muddy the image. Replace `Syne` with a cleaner pair: **Space Grotesk** (display) + **Inter** (body), loaded via `index.html`. Drop the typewriter effect (it stutters on slow phones); use a subtle gradient-shimmer on the title instead.
- **Color system**: tighten tokens in `src/index.css` — primary `#22D3EE` (cyan), accent `#A78BFA` (violet), surface `#0B1220`, border `rgba(255,255,255,0.08)`. Apply via CSS vars so existing classes inherit the cleaner palette.
- **Cards / chips**: increase corner radius to 16 px, soften shadow, add a 1 px inner highlight; category chips become full-pill with active glow.
- **Mobile (≤400 px)**: stat row becomes 3-up with smaller numbers; search bar gets a sticky behavior under the hero.
- **Announcement banner**: lower contrast, thinner height, no pulsing border (currently distracting).
- **Footer**: tighten spacing, group socials in a single row, add subtle divider.

## Files to touch

- `src/components/ui/NotificationBell.tsx` — accept `inline` prop, drop `fixed`.
- `src/components/ui/AchievementHistory.tsx` — same.
- `src/components/home/HeroHeader.tsx` — render notif + achievement + sound buttons together; simplify background layers; new fonts.
- `src/pages/DownloadPage.tsx`, `src/pages/AdminPage.tsx` — do NOT mount the floating bell/trophy here.
- `src/hooks/useModeration.ts` — add `useDeleteComment`.
- `src/components/admin/CommentsTab.tsx` — filter tabs, delete button, status pill, bulk bar.
- `src/components/home/AnnouncementBanner.tsx` — calmer styling.
- `src/index.css` — token refresh, font import, simplified hero classes.
- `index.html` — preconnect + Space Grotesk/Inter font links.
- `public/main.html` — remove `viewSetup` + DB URL prompt, fix `appInit` fallback, password-only flow.

## Out of scope (ask if you want these too)

- Reworking the whole admin panel (`/main`) UI to match the React app's look.
- Avatar uploads / display names for commenters.
- Server-side rate limit on comments (currently client-only).
