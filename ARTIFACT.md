# ARTIFACT — dungeon-dad

- **root:** /workspace/dungeon-dad
- **slug:** dungeon-dad
- **entrypoints:**
  - `index.html` — create/join session, character, unlock
  - `play.html` — dungeon rooms + actions/effects
  - `end.html` — shareable party recap
  - `js/{session,party,dungeon,effects,ui}.js` / `css/site.css`
  - `data/starter.json` (5 rooms) · `data/stub-pack.json`
  - `assets/logo.png` · `assets/rooms/{entrance,treasure,trap,boss}.png`
- **how_to_run:** `python3 -m http.server 4174 --directory /workspace/dungeon-dad` → http://127.0.0.1:4174/
- **live_url:** (pending TLS — Lilly credits ~Sep 12; intent `https://dungeon-dad.secdevsolutions.help/`)
- **owner_agent:** Build Head
- **ready_for_quality:** yes
- **pass:** 1
- **notes:** |
  **Local-only gate (Product-accepted 2026-09-09):** Build smoke PASS on :4174 — HTTP 200 entrypoints/assets; 5-room starter + scene images; unlock `DUNGEON-DAD-HOST`; Productions footer on index/play/end. VERIFY against AC-mvp. Public TLS still landing intent when credits return. NightDeck untouched. Prefer stop by 2.
