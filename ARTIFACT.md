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
    Smoke shortcuts: host **Skip to Barrel King (debug)** on any choice room, or start with `play.html?room=boss` then Start.
    Natural path: Continue through rooms 1–4 (entrance → treasure → trap → banter → boss).
- **live_url:** https://dev-storm-clockers.github.io/dungeon-dad/
- **owner_agent:** Build Head
- **ready_for_quality:** no
- **pass:** 2 (local smoke PASS — ready=no until Pages re-smoke)
- **notes:** |
  **Pass 2 local smoke 2026-09-09 (Build):** PASS on http://127.0.0.1:4174/ — hero+hand, Energy spend/play, Barrel King card combat, readable turn UI (whose/energy/gold legal), Yield fail-forward → end.html; MVP join/roster/mock unlock/Productions footer; no WotC/M&M/Ubisoft strings. AC: AC-change-pass2-card.md + AC-mvp.md. Steward push pending for Pages. No Lilly. NightDeck untouched.

  **Pages ship Pass 1:** https://dev-storm-clockers.github.io/dungeon-dad/ (pre-Pass-2 content until Steward push).
