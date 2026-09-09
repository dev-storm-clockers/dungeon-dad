# ARTIFACT — dungeon-dad

- **root:** /workspace/dungeon-dad
- **slug:** dungeon-dad
- **entrypoints:**
  - `index.html` / `play.html` / `end.html`
  - `js/{session,party,dungeon,combat,effects,ui}.js` / `css/site.css`
  - `data/starter.json` · `data/stub-pack.json` · `data/cards.json`
  - `assets/logo.png` · `assets/rooms/{entrance,treasure,trap,boss}.png`
- **how_to_run:** |
    `python3 -m http.server 4174 --directory /workspace/dungeon-dad` → http://127.0.0.1:4174/
    Barrel King: Skip to Barrel King (debug). Hand ◀/▶ toolbar scrolls clipped cards on narrow viewports.
- **live_url:** https://dev-storm-clockers.github.io/dungeon-dad/
- **owner_agent:** Build Head
- **ready_for_quality:** yes
- **pass:** 3
- **notes:** |
  **Pass 3 local smoke 2026-09-09 (Build):** PASS nicer motion + mobile hand. Card enter/FLIP; HIT burst + chip shake on end turn; turn/energy chrome pulse; ◀/▶ toolbar scrolls hand at ~480px (viewport-clamped overflow); Yield fail-forward → end. Prior join/roster/unlock/Productions intact. AC: AC-mvp + Pass 2 card + AC-change-pass3-nicer.md. Prefer STOP-GO. No Lilly from Build. NightDeck untouched.
  **TLS:** Harness may have earlier Pass 3 tree live; packet for records / next Phil publish yes only.
