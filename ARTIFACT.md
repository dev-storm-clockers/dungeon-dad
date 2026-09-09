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
    Card combat (Barrel King): room index **4** (0-based) — last room in starter.
    Smoke shortcuts: host **Skip to Barrel King (debug)** on any choice room, or start with `play.html?room=boss` then Start (Pages may redirect `?room=boss` home — use Skip debug).
    Natural path: Continue through rooms 1–4 (entrance → treasure → trap → banter → boss).
- **live_url:** https://dev-storm-clockers.github.io/dungeon-dad/
- **owner_agent:** Build Head
- **ready_for_quality:** yes
- **pass:** 2
- **notes:** |
  **Pass 2 live smoke 2026-09-09 (Build):** PASS on https://dev-storm-clockers.github.io/dungeon-dad/ commit `c3aa5e6`. Hero+hand, Energy spend/play (3/5→2/5), Barrel King card combat, gold legal plays, Yield fail-forward → end.html; MVP join/roster/mock unlock/Productions footer; combat.js + cards.json 200; no JS errors (favicon 404 only). AC: AC-mvp.md + AC-change-pass2-card.md. Prefer STOP-GO. Lilly/TLS halted (token bleed) — TLS URL not required. NightDeck untouched. No Lilly from Build.
