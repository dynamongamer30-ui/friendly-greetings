## Plan — Fire/Ember theme + 3 main.html fixes

### Fix 1 — Theme: cyan → fire/ember
Replace cyan (`#00f0ff`, `#22D3EE`) and violet accents with the fire/ember palette across visual layers only. Keep all animations, easing, haptics, sound triggers and timing untouched.

New tokens:
- `--accent-primary: #FF4500`
- `--accent-secondary: #F97316`
- `--accent-gold: #F59E0B`
- `--bg-base: #07030A`
- `--surface-card: rgba(20, 8, 4, 0.85)`
- `--border-glow: rgba(255, 69, 0, 0.15)`

Files to update:
- `src/index.css` — swap CSS variables, gradients, glow shadows, scrollbar, neon spinner ring (`top: #FF4500`, `right: #F59E0B`), scroll progress gradient.
- `tailwind.config.cjs` — rename/repoint cyan/violet color tokens to ember/amber.
- `src/components/system/AuroraOrb.tsx` — fragment shader colors `cyan`→`vec3(1.0, 0.27, 0.0)` (orange-red), `violet`→`vec3(0.96, 0.62, 0.04)` (amber), `deep`→`vec3(0.027, 0.012, 0.039)`. Update fallback gradient & cursor orb mix.
- `src/components/system/LoadingScreen.tsx` — bloom gradient, wordmark gradient, hairline progress all to `#FF4500 → #F59E0B`. Background `#07030A`.
- `src/components/system/CursorGlow.tsx` — glow color to ember.
- `public/main.html` — full visual restyle: variables, MatrixRain canvas color, aurora blobs, particles, all `#00f0ff` references, glass borders → ember; modals + dropdowns (see Fix 3).
- `public/generator.html` — same palette swap.
- `src/components/ui/ScrollProgress.tsx`, `NeonSpinner.tsx` (via CSS), confetti color arrays in any toast/achievement file using cyan/violet.

Logic, key flow, Firebase rules, sound.ts/haptics.ts behavior — untouched (only the visual styling tied to triggers changes via CSS).

### Fix 2 — `public/main.html` key expiry (visual-adjacent logic, scoped)
In `generateKeys()` near line 1864:
```js
expiry: durHours >= 87600 ? 0 : now + (durHours * 3600),
```
Remove the `_midnight` calculation (no longer used here).

In `checkAndCleanExpiredKeys()` near line 1485:
- Remove the blanket VIP skip.
- Add: if `key.prefix?.toUpperCase().startsWith('VIP')` AND `(!key.device || key.device === '')` AND `nowSec - key.created > 86400` → delete.
- Linked VIP keys keep current expiry behavior.

### Fix 3 — Modals + dropdowns themed
In `public/main.html`:
- Modal CSS (~301–380): backdrop `rgba(7,3,10,0.75) + backdrop-blur(16px)`, panel `background: var(--surface-card)`, `border: 1px solid var(--border-glow)`, `box-shadow: 0 20px 60px rgba(255,69,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)`, radius `16px`, spring entrance (`transform: scale(.96)→1`, `opacity 0→1`, 220ms cubic-bezier(.16,1,.3,1)).
- `.select-std` (~116): dark glass background, ember border, amber focus ring, custom chevron SVG, styled `<option>` with `background:#1a0a04; color:#F59E0B`.
- Apply to: `modalKey`, `modalEdit`, `modalEditDevice`, `modalExtend`, `modalAlert`, all selects.

### Fix 4 — Firebase login loop hardening (`public/main.html`)
Around `doLogin()` (line 1249) and `onAuthStateChanged` (line 1182):
1. Add `isLoginInProgress` flag (module-scope `let`).
2. `doLogin()`:
   - Set button `disabled=true`, swap label to "AUTHENTICATING…" with spinner.
   - `isLoginInProgress = true` before `signInWithEmailAndPassword`.
   - Map errors:
     - `auth/invalid-email` → "Invalid email format"
     - `auth/user-not-found` → "Account not found"
     - `auth/invalid-credential` / `auth/wrong-password` → "Incorrect credentials"
     - `auth/too-many-requests` → "Too many attempts. Try again later."
     - default → friendly fallback
   - In `finally`: re-enable button, restore label, `isLoginInProgress = false`.
3. `onAuthStateChanged(user => …)`:
   - Guard: only redirect when `user` is non-null AND login view is currently visible AND not already on dashboard. Skip auto-redirect on initial page load if `isLoginInProgress` is false and user is null.
4. Do NOT touch the `data-admin-email` attribute or admin UID.

### Out of scope (per request)
- No changes to game logic, key validation, Firebase security rules, or `data-admin-email`.
- Animation timing/easing, haptic patterns, and sound triggers preserved exactly.

### Verification
- Build passes.
- Visual spot-check: home, loading screen, aurora, cursor glow, scroll bar, main.html dashboard, modals, dropdowns — all ember/amber, no cyan remnants (`rg -n '#00f0ff|#22D3EE|34,211,238|167,139,250'`).
- Generate a 20h key → verify expiry == created + 72000s, not midnight.
- Generate VIP key, leave unlinked, simulate >24h → cleanup removes it.
- Login: wrong password shows mapped message, button re-enables, no redirect loop on refresh.