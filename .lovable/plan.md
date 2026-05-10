## Goal

Wipe the current Lovable TanStack Start template, drop in the full contents of `dynamon-universe-main.zip` (a React 18 + Vite 5 + TanStack Router + Firebase app), then apply your 41 UI / animation / sound / a11y / deploy upgrades on top.

## Important heads-up before we start

A few things are worth flagging so there are no surprises — none are blockers, but they affect what works inside the Lovable preview vs. on your live GitHub Pages site:

1. **Stack swap is large.** The current project is TanStack **Start** (SSR on Cloudflare Workers, routes under `src/routes/`). Your zip is plain **Vite SPA** with TanStack Router code-based routing in `src/App.tsx` + `react-router-dom` also listed. I will fully replace it — `src/routes/`, `src/router.tsx`, `src/server.ts`, `src/start.ts`, `wrangler.jsonc`, `src/styles.css`, the existing `vite.config.ts`, `tsconfig.json`, `package.json`, and `index.html` all get deleted/overwritten by the zip versions.
2. **Lovable preview vs GitHub Pages.** Lovable's sandbox runs the Vite dev server, so the preview will work. But the deploy target you described (GitHub Pages via `gh-pages` branch + Cloudflare DNS) is **outside Lovable** — I can write the workflow file and `CNAME`, but pushing to GitHub, adding the 8 Firebase secrets, enabling Pages, and configuring Cloudflare are manual steps you do yourself. I'll include the step-by-step guide.
3. **Service worker in preview.** PWA service workers cause stale-cache problems inside the Lovable iframe preview. I'll register the SW only when **not** on a `lovable.app` / `lovableproject.com` host and **not** inside an iframe, so it activates on `dynamongamer.space` but stays out of the way in preview. Functionally identical for end users.
4. **Firebase config.** The zip's `src/lib/firebase.ts` will read from `import.meta.env.VITE_FIREBASE_*`. For the preview to actually talk to Firebase you'll need to add those 8 vars as Lovable project secrets too (or it'll just no-op until deployed). I'll list them.
5. **`build:dev`.** Lovable's harness runs `bun run build` after edits. The zip's `package.json` already defines `build` and `build:dev`, so that's fine.

## Plan

### Phase 1 — Wipe & replace with zip contents

Delete every file in the current project except `.git`-managed metadata, then write all 60 files from the zip exactly as-is:

- All `src/**` files listed in your message (pages, components, hooks, lib, types, `App.tsx`, `main.tsx`, `index.css`, `vite-env.d.ts`)
- Root configs: `package.json`, `vite.config.ts`, `tailwind.config.cjs`, `postcss.config.cjs`, `tsconfig.json`, `index.html`
- `public/manifest.json`, `public/404.html`, `public/CNAME`, `public/favicon.ico`, `public/favicon.png`
- `.github/workflows/deploy.yml`

Then `bun install` to pull the new dependency tree (firebase, framer-motion, tanstack-router, react-router-dom, crypto-js, dompurify, canvas-confetti, recharts, zod, lucide-react, etc.).

### Phase 2 — Apply the 41 upgrades

I'll work through them grouped by area, rewriting each affected file in full (no partial edits, per your instruction):

**UI / Design (1–11)** — HeroHeader word-by-word subtitle reveal, ModCard back-face animated stat bars, EmptyState looping illustration, SearchBar ink-spread pill morph, Footer cyber grid + cyan top glow, ModHero shimmer skeleton, TrendingCarousel mouse + touch drag, ModHero click-to-zoom lightbox, DownloadPage copy-link with tick, "New" badge (≤7d), BackToTop scale+fade.

**Animations (12–17)** — ModGrid stagger entrance, mouse-reactive particle repulsion (120px), per-route PageTransition variants (Home fade+scale / Download slide-left / Unlock zoom-in), optional particle connection lines (off by default), ScrollProgress pause-when-idle, BackToTop smooth in/out.

**Sounds (18–23)** — Route-change whoosh, pill-switch tick, throttled keystroke tick (≥80ms), 4-tone download fanfare, banner-dismiss swoosh, ambient drone toggle next to sound icon. All via existing `src/lib/sound.ts` (extended) using Web Audio API.

**Notifications / Toasts (24–27)** — Cap stack at 3 (auto-dismiss oldest), swipe-to-dismiss on touch, position setting persisted to localStorage (top-center / bottom-center / bottom-right), notification bell with unread badge + slide-down panel of last 10 (sessionStorage).

**Achievements (28–30)** — New triggers (Critic, Student, Explorer Pro, Sharer, Conversationalist, Popular Taste), tap-to-dismiss AchievementToast, trophy-icon achievement-history modal with timestamps + locked silhouettes.

**Accessibility / Other (31–35)** — Enter/Space flip + Escape unflip on ModCard, PWA `public/sw.js` + iframe-safe registration in `main.tsx`, search-history pills (last 5, localStorage) on focus, LoadingScreen reads `siteMeta.siteName`, DownloadPage Share button (Web Share API + clipboard fallback) firing "Sharer!" achievement.

**Deployment files (36–40)** — `.github/workflows/deploy.yml` (Bun build, deploy to `gh-pages`, CNAME, all 8 `VITE_FIREBASE_*` secrets wired), `public/CNAME` = `dynamongamer.space`, `vite.config.ts` `base: '/'`, `public/404.html` SPA fallback, `public/manifest.json` (Dynamon Gamer / DG Mods / `#00F0FF`).

### Phase 3 — Verify

- Build passes (`bun run build`)
- Preview loads home page, hero animates, particles render
- Route navigation works (Home, Download, Unlock, Tutorial, Admin, DMCA, Keys, 404)
- Toast / achievement / sound systems wired
- Service worker stays disabled in Lovable preview

### Phase 4 — Deployment guide (item 41)

End-of-task message with copy-pasteable steps:

1. Create public repo `dynamongamer30-ui` on GitHub, push the project.
2. Repo **Settings → Secrets and variables → Actions** → add 8 secrets: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_DATABASE_URL`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`.
3. Push to `main` → workflow runs → **Settings → Pages** → Source = `gh-pages` branch, `/ (root)`.
4. Cloudflare DNS: `CNAME @ → dynamongamer30-ui.github.io`, proxy = **DNS only (grey cloud)**, SSL/TLS mode = **Full**.
5. Wait for cert, verify `https://dynamongamer.space`.
6. Common issues: 404 on refresh → confirm `public/404.html` deployed; CNAME missing → re-add `public/CNAME`; Firebase auth blocked → add `dynamongamer.space` to Firebase Console → Authentication → Settings → Authorized domains.

---

## Tech notes

- Routing: zip uses `@tanstack/react-router` with code-based router defined in `src/App.tsx`. `react-router-dom` is also a dep but unused by routes — kept to match zip exactly.
- SW registration guard pattern: skip if `window.self !== window.top` or hostname includes `lovable.app` / `lovableproject.com` / `localhost`.
- Sound layer extends existing `src/lib/sound.ts` Web Audio context; ambient drone is a separate gain node toggleable independently from SFX.
- Achievement state: localStorage `dg_achievements` = `{ id: { unlockedAt: ISO } }`.
- Toast position: localStorage `dg_toast_pos`, defaults `top-center`.

## Open question

Want me to also push the 8 `VITE_FIREBASE_*` placeholders into Lovable secrets so the **preview** can talk to Firebase, or are you fine with preview being inert until deployed to `dynamongamer.space`? (Either way the GitHub Actions secrets are still required for the live build.)
