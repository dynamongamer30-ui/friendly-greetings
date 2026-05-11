## Scope
All work happens in `public/main.html` (the Key Admin Panel served at `/main.html`). No changes to React app routes/components.

## 1. Mobile responsive fix (overflow)
The bulk action row (`.bulk-bar` at line 541) places `Select All`, `EXPIRED`, and the `EXTEND / ROTATE / REVOKE / DELETE` buttons in one inline row, causing horizontal scroll on narrow screens.

- Make `.bulk-bar` `flex-wrap: wrap` with `gap` and `min-width: 0` on the container.
- Make `.bulk-actions` wrap as well; on `<480px` the action buttons collapse into a 2‑col grid spanning full width below the Select All / EXPIRED row.
- Add `overflow-x: hidden` on the keys panel wrapper and audit `.controls`, `.mini-stats`, and `.btn-sm` widths to ensure no element exceeds `100vw`.
- Add `.input-std`, `.select-std`, modal `width: min(420px, 92vw)` so modals also fit small screens.

## 2. Dropdown theming
All `<select>` elements currently rely on default browser styling on mobile.

- Style `.select-std` with the dashboard's dark glass + ember accent: `background: rgba(10,10,26,0.85)`, `border: 1px solid rgba(245,158,11,0.25)`, neon focus ring matching `--orange/--gold`, custom chevron SVG via `background-image`, `appearance: none`.
- Style `<option>` with `background: #0a0a1a; color: #E2E8F0` (best browsers can do for native `<option>`).
- Apply the same treatment to `#keyDurationMode`, plus any other selects in the admin (filter selects, tab selects).

## 3. Default prefix → "VIP" + glowing badge
- Change `#keyPrefix` default `value="DG"` → `value="VIP"` (line 825).
- Update key‑rotation fallback prefix (line 1083) from `'DG'` → `'VIP'`.
- The renderer already tags keys whose name starts with `VIP` as VIP (line 1656/1664). Upgrade `.status-vip` CSS to a real glowing badge: gold→ember gradient background, pulsing `box-shadow` glow animation, crown icon with subtle bloom. Add a second `.vip-glow` ring class on the key row's left border for extra emphasis.

## 4. Key lifecycle rewrite

### Data shape (per key in `ValidKeys`)
```text
{
  status:    "active" | "revoked",
  createdAt: <epoch ms>,         // for 24h unused-TTL
  activated: false | <epoch ms>, // set on first device link
  duration:  "2h"|"7d"|"1m"|"life"|"custom",
  expiry:    0 | <epoch sec>     // 0 until activated; then computed
}
```
Migration is forward-only: old keys without `activated` are treated as already activated using their existing `expiry`.

### Generation modal (lines 820–858)
Replace the Duration dropdown options with:
- 2 Hours
- 7 Days
- 1 Month (30 days)
- Lifetime
- Custom Date/Time → swap the "Custom Hours" number input for a `<input type="datetime-local">`.

`generateKeys()` (line 1865) stops setting `expiry` to midnight. Instead it stores `createdAt = Date.now()`, `activated = false`, `expiry = 0`, and persists the chosen duration so the activation step can compute the real expiry. (Lifetime keys still get `expiry = 0` permanently.)

### Activation hook
Activation happens when a key first gets linked to a device (existing `ActivatedUsers` write path — search for where `val.device` is assigned and where the generator/client writes to `ActivatedUsers`). On that write:
- Set `activated = now`.
- Compute `expiry` from stored `duration`: 2h → +7200s, 7d → +604800s, 1m → +2592000s, custom → that timestamp, lifetime → 0.
- Persist via `syncDB()`.

If the activation write happens outside `main.html` (e.g. `generator.html` or another client), add the same logic there. I'll grep for the write site and patch all of them so behavior is consistent.

### Auto‑cleaner (`checkAndCleanExpiredKeys`, lines 1468–1517)
Rewrite the loop:
1. If `status === 'revoked'` and older than 24h → delete.
2. If `expiry > 0 && expiry < now` → delete (this catches all activated, time‑elapsed keys including VIP).
3. If `!activated && (now - createdAt) > 24h` → delete (the new 24h unused‑TTL rule, replaces the old 10‑minute rule).
4. Drop the blanket `key.startsWith("VIP") return;` skip — VIP keys must also expire when their activated timer elapses, otherwise the chosen duration means nothing.

The interval already runs every 60s (line 1393); no change needed there.

### Render & countdown
`renderKeys()` (around 1647–1677) needs minor updates:
- Pre‑activation rows show a "UNUSED · expires in <Xh Ym>" pill counting down to `createdAt + 24h` instead of the current expiry math.
- Post‑activation rows behave as today, driven by `expiry`.

## Out of scope
- React `KeysPage.tsx`, `AdminPage.tsx`, and other admin tabs.
- Backend rules changes — the cleaner runs client-side on the admin page (same pattern as today). Document this limitation: the 24h delete only fires while an admin has the page open or a tab visits. If the user wants true server-side enforcement, that needs Firebase Cloud Functions / scheduled job and should be a follow-up.

## Open assumption
Activation = the moment a device gets linked to a key in `ActivatedUsers`. If "activation" means something else in this system (e.g. shortlink redemption in `generator.html`), tell me and I'll wire the timer to that event instead.
